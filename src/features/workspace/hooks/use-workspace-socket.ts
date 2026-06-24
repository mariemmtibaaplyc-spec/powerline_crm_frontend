"use client";

import { useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import { getCallsSocket, getAgentsSocket } from "@/lib/socket-manager";
import { useWorkspaceStore } from "@/features/workspace/store/workspace.store";
import { useSessionStore } from "@/store/session.store";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { AgentStatus } from "@/types/workspace.types";
import type { ContactSearchResult } from "@/features/workspace/api/workspace.api";

// ── Mapping statuts Backend → Frontend ──────────────────────────────────────
function mapBackendStatus(backendStatus: string): AgentStatus {
  const map: Record<string, AgentStatus> = {
    AVAILABLE:  "waiting",
    RINGING:    "ringing",
    IN_CALL:    "in_call",
    WRAP_UP:    "qualification",
    PAUSED:     "paused",
    OFFLINE:    "paused",
  };
  return map[backendStatus] ?? "paused";
}

// ── Mapping contact Backend → ProspectSheet Frontend ────────────────────────
function mapContactToProspect(contact: ContactSearchResult) {
  return {
    id:             String(contact.id),
    firstName:      contact.first_name  ?? "",
    lastName:       contact.last_name   ?? "",
    phone:          contact.phone       ?? "",
    phoneSecondary: contact.phone2      ?? "",
    email:          contact.email       ?? "",
    address:        contact.address     ?? "",
    postalCode:     contact.postal_code ?? "",
    city:           contact.city        ?? "",
    comments:
      typeof contact.custom_fields?.commentaires === "string"
        ? contact.custom_fields.commentaires
        : "",
  };
}

// ── Hook principal ───────────────────────────────────────────────────────────
/** onAutoAnswer : callback optionnel armé par SipPhoneProvider.
 *  Appelé sur call.contact.popup (prédictif) et call.initiated (manuel).
 *  Quand non fourni le hook fonctionne normalement sans auto-answer SIP. */
export function useWorkspaceSocket(onAutoAnswer?: () => void) {
  const session     = useSessionStore((s) => s.session);
  const authSession = useAuthStore((s) => s.session);
  const store       = useWorkspaceStore();

  // Fallback authStore → sessionStore pour survivre aux refreshs de page
  const effectiveToken  = session?.accessToken  ?? authSession?.accessToken  ?? null;
  const effectiveUserId =
    (session?.user?.numericId  ?? 0) > 0 ? session?.user?.numericId :
    (authSession?.user?.numericId ?? 0) > 0 ? authSession?.user?.numericId :
    null;

  // Refs pour éviter les doublons en StrictMode React
  const callsSocketRef    = useRef<Socket | null>(null);
  const agentsSocketRef   = useRef<Socket | null>(null);
  const connectedRef      = useRef(false);
  // Guard anti-race-condition : ignorer WS AVAILABLE pendant l'init PAUSED
  const isInitializingRef = useRef(false);

  useEffect(() => {
    const token  = effectiveToken;
    const userId = effectiveUserId;

    if (!token || !userId || connectedRef.current) return;

    connectedRef.current = true;

    // ── 1. Namespace /calls ──────────────────────────────────────────────────
    const callsSocket = getCallsSocket(token);
    callsSocketRef.current = callsSocket;

    callsSocket.on("connect", () => {
      callsSocket.emit("join.agent", { agent_id: userId });
    });

    // Appel entrant dialer → remplir fiche + RINGING
    callsSocket.on("call.contact.popup", async (data: {
      call_id:   number;
      contact:   ContactSearchResult;
      lead?:     { id: number; status: string };
      campaign?: { id: number; name: string };
    }) => {
      const startedAt = Date.now();

      // Mettre à jour la fiche prospect
      store.setActiveProspect(mapContactToProspect(data.contact));

      // Mettre à jour la callSession avec les IDs Backend
      useWorkspaceStore.setState((state) => {
        const nextStatus = state.agentStatus === "in_call" ? "in_call" : "ringing";
        return {
          agentStatus:      nextStatus,
          statusStartedAt:  state.agentStatus === nextStatus ? state.statusStartedAt : startedAt,
          activeCampaignId: data.campaign?.id ?? state.activeCampaignId,
          callSession: {
            active:           true,
            direction:        state.callSession.direction ?? null,
            currentNumber:    data.contact.phone,
            activeReminderId: state.callSession.activeReminderId,
            startedAt:        state.callSession.startedAt ?? startedAt,
            hungUpBy:         null,
            campaign:         data.campaign?.name ?? state.callSession.campaign,
            queue:            state.callSession.queue,
            backendCallId:    data.call_id,
            backendContactId: data.contact.id,
            backendLeadId:    data.lead?.id ?? null,
          },
        };
      });

      // ── Auto-answer SIP : armer le flag AVANT que le INVITE arrive ─────────
      // Pour un appel PRÉDICTIF, AmdHuman déclenche BridgeProcessor qui appelle
      // l'agent (INVITE SIP). call.contact.popup est émis au même moment.
      // onAutoAnswer?.() arme le flag → le INVITE sera auto-accepté.
      // Pour un appel MANUEL CRM-initiated (call.initiated), voir ci-dessous.
      onAutoAnswer?.();

      if (data.campaign?.id) {
        const { workspaceApi } = await import("@/features/workspace/api/workspace.api");
        const quals = await workspaceApi.getCampaignQualifications(data.campaign.id).catch(() => []);
        useWorkspaceStore.setState({
          backendQualifications: quals,
          activeCampaignId: data.campaign.id,
        });
      }
    });

    // Confirmation appel lancé (appel manuel CRM-initiated via POST /manual-call)
    // L'Originate AMI a déjà été envoyé → l'agent va recevoir un INVITE SIP.
    // On arme triggerAutoAnswer() pour que le INVITE soit auto-accepté.
    callsSocket.on("call.initiated", (data: {
      call_id:      number;
      phone_number: string;
    }) => {
      useWorkspaceStore.setState((state) => ({
        agentStatus:     "ringing",
        statusStartedAt: Date.now(),
        callSession: {
          ...state.callSession,
          backendCallId: data.call_id,
        },
      }));
      // Armer l'auto-answer SIP pour l'appel manuel
      onAutoAnswer?.();
    });

    // Client décroche → IN_CALL
    callsSocket.on("call.answered", (_data: { call_id: number }) => {
      useWorkspaceStore.setState({
        agentStatus:     "in_call",
        statusStartedAt: Date.now(),
      });
    });

    // Appel terminé (Asterisk ou PATCH /end)
    callsSocket.on("call.ended", (data: {
      call_id:   number;
      campaign_id?: number | null;
      action?:   string;
      duration?: number;
    }) => {
      if (typeof data.campaign_id === "number" && data.campaign_id > 0) {
        useWorkspaceStore.setState({ activeCampaignId: data.campaign_id });
      }

      if (data.action === "OPEN_QUALIFICATION") {
        // Agent a raccroché proprement → ouvrir panneau qualification
        store.openQualification();
      } else {
        // Client a raccroché en premier → état hung_up, PAS de qualification
        useWorkspaceStore.setState((state) => ({
          agentStatus:     "hung_up",
          statusStartedAt: Date.now(),
          callSession: {
            ...state.callSession,
            active:   false,
            hungUpBy: "client",
          },
        }));
      }
    });

    callsSocket.connect();

    // ── 2. Namespace /agents ─────────────────────────────────────────────────
    const agentsSocket = getAgentsSocket(token);
    agentsSocketRef.current = agentsSocket;

    agentsSocket.on("connect", () => {
      agentsSocket.emit("join.agent", { agent_id: userId });
    });

    // Changement de statut agent (depuis Asterisk ou Backend)
    agentsSocket.on("agent.status.changed", (data: {
      agent_id: number;
      status:   string;
    }) => {
      if (data.agent_id !== userId) return;

      // ── Guard race condition ───────────────────────────────────────────────
      // Durant les 5s après connexion, on ignore tout événement AVAILABLE
      // venant du Backend pour ne pas écraser le PAUSED imposé par initFromSession.
      // L'agent doit explicitement cliquer "Reprendre" pour devenir AVAILABLE.
      if (isInitializingRef.current && data.status === "AVAILABLE") {
        console.info("[useWorkspaceSocket] Ignoring premature AVAILABLE WS during initialization");
        return;
      }

      useWorkspaceStore.setState({
        agentStatus:     mapBackendStatus(data.status),
        statusStartedAt: Date.now(),
      });
    });

    agentsSocket.connect();

    // ── 3. Guard init : actif 5s après connexion ─────────────────────────────
    // Donne le temps à initFromSession de poster setPaused vers le Backend
    // avant d'accepter un éventuel WS AVAILABLE parasite.
    isInitializingRef.current = true;
    const initGuardTimer = setTimeout(() => {
      isInitializingRef.current = false;
    }, 5000);

    // ── 4. Cleanup ───────────────────────────────────────────────────────────
    return () => {
      clearTimeout(initGuardTimer);

      callsSocket.off("connect");
      callsSocket.off("call.contact.popup");
      callsSocket.off("call.initiated");
      callsSocket.off("call.answered");
      callsSocket.off("call.ended");

      agentsSocket.off("connect");
      agentsSocket.off("agent.status.changed");

      connectedRef.current = false;
      isInitializingRef.current = false;
      // Note : on ne disconnect() pas les sockets ici car ils sont singletons
      // dans socket-manager.ts. destroyAllSockets() sera appelé au logout.
    };
  }, [effectiveToken, effectiveUserId]);
}
