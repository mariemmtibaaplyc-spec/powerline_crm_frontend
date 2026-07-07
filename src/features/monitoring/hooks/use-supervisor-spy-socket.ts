"use client";

// src/features/monitoring/hooks/use-supervisor-spy-socket.ts
//
// Connecte le superviseur/admin au namespace /calls (même socket.io singleton
// que le workspace agent — src/lib/socket-manager.ts) pour recevoir l'event
// "spy.session.starting" émis par SupervisionService.joinCall()/changeMode()
// juste avant l'Originate AMI, et armer l'auto-answer du softphone superviseur
// (SupervisorSipPhoneProvider) avant que l'INVITE SIP n'arrive.
//
// Monté UNIQUEMENT sur la page Temps réel (voir admin-realtime-module.tsx) —
// connexion à l'ouverture, déconnexion propre à la fermeture/changement de page.

import { useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import { getCallsSocket } from "@/lib/socket-manager";
import { useSessionStore } from "@/store/session.store";
import { useAuthStore } from "@/features/auth/store/auth.store";

export function useSupervisorSpySocket(onSpySessionStarting: () => void) {
  const session = useSessionStore((s) => s.session);
  const authSession = useAuthStore((s) => s.session);

  const effectiveToken = session?.accessToken ?? authSession?.accessToken ?? null;
  const effectiveUserId =
    (session?.user?.numericId ?? 0) > 0 ? session?.user?.numericId :
    (authSession?.user?.numericId ?? 0) > 0 ? authSession?.user?.numericId :
    null;

  const socketRef = useRef<Socket | null>(null);
  const onSpySessionStartingRef = useRef(onSpySessionStarting);
  onSpySessionStartingRef.current = onSpySessionStarting;

  useEffect(() => {
    const token = effectiveToken;
    const userId = effectiveUserId;

    if (!token || !userId) return;

    const socket = getCallsSocket(token);
    socketRef.current = socket;

    const handleConnect = () => {
      console.log(`[supervision-ws] connected — joining agent:${userId} room`);
      socket.emit("join.agent", { agent_id: userId });
    };

    const handleSpySessionStarting = (data: { call_id: number; mode: string }) => {
      console.log("[supervision-ws] spy.session.starting", data);
      onSpySessionStartingRef.current();
    };

    socket.on("connect", handleConnect);
    socket.on("spy.session.starting", handleSpySessionStarting);
    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("spy.session.starting", handleSpySessionStarting);
      // Contrairement au workspace agent (connexion persistante tout au long
      // de la session), le softphone superviseur ne doit vivre que sur la
      // page Temps réel — déconnexion propre au démontage.
      socket.disconnect();
      socketRef.current = null;
    };
  }, [effectiveToken, effectiveUserId]);
}
