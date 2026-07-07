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
      console.log(`[TIMING] WS recv call.contact.popup t=${startedAt} callId=${data.call_id}`);

      // ── Garde anti-race ──────────────────────────────────────────────────────
      // Ignorer l'événement si :
      //   a) qualification ouverte (écrase l'état de qualification en cours)
      //   b) fin d'appel en cours (efface les verrous isEndingCall/endingCallId)
      //   c) un appel différent est déjà actif (event retardé d'un ancien appel)
      const snapshot = useWorkspaceStore.getState();
      const activeCallId = snapshot.callSession.backendCallId;
      const isStale =
        snapshot.qualificationPanelOpen ||
        snapshot.isEndingCall ||
        (activeCallId !== null && activeCallId !== data.call_id);
      if (isStale) {
        console.warn(
          `[call.contact.popup] ignored stale/unsafe event callId=${data.call_id} activeCallId=${activeCallId ?? 'none'} qualificationPanelOpen=${snapshot.qualificationPanelOpen} isEndingCall=${snapshot.isEndingCall}`,
        );
        return;
      }

      // Mettre à jour la fiche prospect
      store.setActiveProspect(mapContactToProspect(data.contact));

      // Mettre à jour la callSession avec les IDs Backend
      useWorkspaceStore.setState((state) => {
        const nextStatus = state.agentStatus === "in_call" ? "in_call" : "ringing";
        // Préserver "manual" si call.initiated a déjà positionné la direction pour ce même appel
        const isAlreadyManual =
          state.callSession.direction === "manual" &&
          state.callSession.backendCallId === data.call_id;
        const direction = isAlreadyManual ? "manual" : "predictive";
        console.log(`[TIMING] Zustand update call.contact.popup t=${Date.now()} callId=${data.call_id} agentStatus=${nextStatus} direction=${direction}`);
        return {
          agentStatus:      nextStatus,
          statusStartedAt:  state.agentStatus === nextStatus ? state.statusStartedAt : startedAt,
          activeCampaignId: data.campaign?.id ?? state.activeCampaignId,
          currentCallId:    data.call_id,
          isEndingCall:     false,
          endingCallId:     null,
          callSession: {
            active:           true,
            direction,
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
      const resolvedDirection = useWorkspaceStore.getState().callSession.direction;
      console.log(`[call.contact.popup] attached callId=${data.call_id} campaignId=${data.campaign?.id ?? 'none'} direction=${resolvedDirection}`);

      // ── Auto-answer SIP ──────────────────────────────────────────────────────
      onAutoAnswer?.();

      if (data.campaign?.id) {
        const { workspaceApi } = await import("@/features/workspace/api/workspace.api");
        const quals = await workspaceApi.getCampaignQualifications(data.campaign.id).catch(() => []);
        // Après l'await, vérifier que l'appel n'a pas changé (async gap)
        const current = useWorkspaceStore.getState();
        const stillSameCall =
          current.currentCallId === data.call_id ||
          current.callSession.backendCallId === data.call_id;
        if (!stillSameCall) {
          console.log(`[call.contact.popup] skip qualifications stale callId=${data.call_id}`);
          return;
        }
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
      // ── Garde anti-race ────────────────────────────────────────────────────
      const snap = useWorkspaceStore.getState();
      const activeId = snap.callSession.backendCallId;
      const isStale =
        snap.qualificationPanelOpen ||
        snap.isEndingCall ||
        (activeId !== null && activeId !== data.call_id);
      if (isStale) {
        console.warn(
          `[call.initiated] ignored stale/unsafe event callId=${data.call_id} activeCallId=${activeId ?? 'none'} qualificationPanelOpen=${snap.qualificationPanelOpen} isEndingCall=${snap.isEndingCall}`,
        );
        return;
      }

      useWorkspaceStore.setState((state) => ({
        agentStatus:     "ringing",
        statusStartedAt: Date.now(),
        currentCallId:   data.call_id,
        isEndingCall:    false,
        endingCallId:    null,
        callSession: {
          ...state.callSession,
          direction:    "manual",      // forcer la direction — empêche l'héritage d'une direction prédictive résiduelle
          backendCallId: data.call_id,
        },
      }));
      // Armer l'auto-answer SIP pour l'appel manuel
      onAutoAnswer?.();
    });

    // Client décroche → IN_CALL
    // Filet de sécurité : si call.contact.popup n'a pas encore attaché le callId
    // (race condition socket), on le rattache ici depuis call.answered.
    callsSocket.on("call.answered", (data: { call_id: number; agent_id?: number }) => {
      console.log(`[TIMING] WS recv call.answered t=${Date.now()} callId=${data.call_id}`);
      useWorkspaceStore.setState((state) => {
        const needsCallId = !state.callSession.backendCallId && data.call_id;
        if (needsCallId) {
          console.log(`[call.answered] attached callId=${data.call_id} from call.answered (fallback) direction=${state.callSession.direction ?? 'predictive'}`);
        }
        console.log(`[TIMING] Zustand update call.answered t=${Date.now()} callId=${data.call_id} agentStatus=in_call`);
        return {
          agentStatus:     "in_call",
          statusStartedAt: Date.now(),
          currentCallId:   needsCallId ? data.call_id : state.currentCallId,
          callSession: needsCallId ? {
            ...state.callSession,
            active:       true,
            // Préserver "manual" si call.initiated a déjà positionné la direction
            direction:    state.callSession.direction === "manual" ? "manual" : "predictive",
            backendCallId: data.call_id,
          } : state.callSession,
        };
      });
    });

    // Appel terminé (Asterisk ou PATCH /end)
    callsSocket.on("call.ended", (data: {
      call_id:   number;
      agent_id?: number;
      campaign_id?: number | null;
      action?:   string;
      duration?: number;
      qualification_id?: number | null;
      source?: string;
      status?: string;
    }) => {
      console.log(`[TIMING] WS recv call.ended t=${Date.now()} callId=${data.call_id} action=${data.action ?? 'none'} backendStatus=${data.status ?? 'none'}`);
      const currentState = useWorkspaceStore.getState();
      const currentCallId = currentState.callSession.backendCallId;
      const trackedCallId = currentState.currentCallId;
      const isCurrentCall =
        currentCallId === data.call_id || trackedCallId === data.call_id;
      const isManualCall    = currentState.callSession.direction === "manual";
      const isPredictiveCall = currentState.callSession.direction === "predictive";

      console.log(
        `[call.ended] userId=${userId} agentId=${data.agent_id ?? userId} callId=${data.call_id} currentCallId=${currentCallId ?? 'none'} trackedCallId=${trackedCallId ?? 'none'} campaignId=${data.campaign_id ?? 'none'} qualificationId=${data.qualification_id ?? 'none'} action=${data.action ?? 'none'} source=${data.source ?? 'none'} eventStatus=${data.status ?? 'none'} direction=${currentState.callSession.direction ?? 'none'} status=${currentState.agentStatus}`,
      );

      if (!isCurrentCall) {
        console.log(
          `[call.ended] ignore stale event callId=${data.call_id} currentCallId=${currentCallId ?? 'none'}`,
        );
        return;
      }

      if (typeof data.campaign_id === "number" && data.campaign_id > 0) {
        useWorkspaceStore.setState({ activeCampaignId: data.campaign_id });
      }

      if (data.action === "OPEN_QUALIFICATION" || isManualCall || isPredictiveCall) {
        // Manuel : toujours ouvrir la qualification.
        // Prédictif : ouvrir quand le backend signale OPEN_QUALIFICATION (AMI flow).
        store.openQualification();
        const logPrefix = isPredictiveCall ? "[PredictiveHangup]" : "[ManualHangup]";
        console.log(
          `${logPrefix} qualification opened source=ws callId=${data.call_id} campaignId=${data.campaign_id ?? currentState.activeCampaignId ?? 'none'}`,
        );
      } else {
        // Client a raccroché en premier → état hung_up, PAS de qualification
        useWorkspaceStore.setState((state) => ({
          agentStatus:     "hung_up",
          statusStartedAt: Date.now(),
          isEndingCall:    state.callSession.backendCallId ? true : state.isEndingCall,
          endingCallId:    state.callSession.backendCallId ?? state.endingCallId,
          callSession: {
            ...state.callSession,
            active:   false,
            hungUpBy: "client",
          },
        }));
      }
    });

    // Rappel dû (RemindersService, sweep périodique) — notifie l'agent avec
    // les coordonnées et le numéro à recomposer MANUELLEMENT. Aucune action
    // téléphonique automatique n'est déclenchée ici.
    callsSocket.on("reminder.due", (data: {
      reminder_id: number;
      call_id: number;
      phone_number: string;
      contact: { id: number; name: string | null; phone: string } | null;
      notes: string | null;
      scheduled_at: string;
    }) => {
      console.log("[reminder.due]", data);

      // Toast immédiat avec les coordonnées — construit directement depuis le
      // payload WS (pas besoin d'attendre le refetch pour un premier retour visuel).
      useWorkspaceStore.getState().pushDueReminderToast({
        id:          `reminder-due-${data.reminder_id}-${Date.now()}`,
        reminderId:  data.reminder_id,
        contactName: data.contact?.name ?? null,
        phone:       data.contact?.phone ?? data.phone_number,
        notes:       data.notes,
      });

      // Rafraîchit "mes rappels" pour refléter le nouveau statut NOTIFIED
      // (planned → priority côté UI) sans dupliquer la logique de mapping ici.
      useWorkspaceStore.getState().fetchReminders().catch(() => {});
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
      const tRecv = Date.now();
      if (data.agent_id !== userId) return;

      console.log(`[TIMING] WS recv agent.status.changed t=${tRecv} agentId=${data.agent_id} backendStatus=${data.status}`);

      // ── Guard race condition ───────────────────────────────────────────────
      // Durant les 5s après connexion, on ignore tout événement AVAILABLE
      // venant du Backend pour ne pas écraser le PAUSED imposé par initFromSession.
      // L'agent doit explicitement cliquer "Reprendre" pour devenir AVAILABLE.
      if (isInitializingRef.current && data.status === "AVAILABLE") {
        console.info("[useWorkspaceSocket] Ignoring premature AVAILABLE WS during initialization");
        return;
      }

      const frontStatus = mapBackendStatus(data.status);
      if (data.status === "AVAILABLE") {
        console.log(`[PREDICTIVE RESUME] WS agent.status.changed AVAILABLE received agentId=${data.agent_id} → frontStatus=${frontStatus} — applying to store`);
      }
      console.log(`[TIMING] Zustand update agent.status.changed t=${Date.now()} backendStatus=${data.status} frontStatus=${frontStatus}`);
      useWorkspaceStore.getState().setAgentStatusFromWS(frontStatus);
      if (data.status === "AVAILABLE") {
        console.log(`[PREDICTIVE RESUME] store agentStatus after WS=${useWorkspaceStore.getState().agentStatus}`);
      }
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

      // BUG CORRIGÉ — ce cleanup faisait .off() sur TOUS les events (dont
      // "reminder.due") inconditionnellement, même quand ce n'était qu'un
      // cycle de double-montage React StrictMode (dev). Comme callsSocket/
      // agentsSocket sont des singletons (socket-manager.ts) et que le garde
      // `connectedRef.current` empêche le 2e montage de ré-enregistrer les
      // listeners (voir le early-return tout en haut de l'effet), le résultat
      // net après le cycle StrictMode était : PLUS AUCUN listener attaché sur
      // le socket, alors que connectedRef restait `true` pour toujours. Les
      // events comme call.contact.popup semblaient "marcher quand même" car
      // les transitions d'état visibles viennent surtout de SIP.js en local
      // (SessionState Established/Terminated), pas du WS — ce qui masquait le
      // problème. `reminder.due` (event purement WS, sans équivalent SIP.js)
      // l'a révélé : jamais reçu tant que la page n'est pas rechargée (ce qui
      // remonte l'effet "pour de vrai" après un vrai unmount).
      //
      // Fix : ne détruire les listeners QUE lors d'un vrai démontage (deps
      // ayant réellement changé — changement de token/userId, ex: logout),
      // jamais lors d'un cleanup fantôme StrictMode à deps inchangées.
      const currentToken  = effectiveToken;
      const currentUserId = effectiveUserId;
      const isRealTeardown = currentToken !== token || currentUserId !== userId;

      if (isRealTeardown) {
        callsSocket.off("connect");
        callsSocket.off("call.contact.popup");
        callsSocket.off("call.initiated");
        callsSocket.off("call.answered");
        callsSocket.off("call.ended");
        callsSocket.off("reminder.due");

        agentsSocket.off("connect");
        agentsSocket.off("agent.status.changed");

        connectedRef.current = false;
        isInitializingRef.current = false;
      }
      // Note : on ne disconnect() pas les sockets ici car ils sont singletons
      // dans socket-manager.ts. destroyAllSockets() sera appelé au logout.
    };
  }, [effectiveToken, effectiveUserId]);
}
