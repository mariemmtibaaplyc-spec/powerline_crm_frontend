"use client";

// src/features/monitoring/sip/supervisor-sip-phone.provider.tsx
//
// Softphone WebRTC (SIP.js) pour les comptes ADMIN/SUPERVISOR — utilisé
// uniquement sur la page "Temps réel" pour l'écoute/chuchotement/intrusion
// (ChanSpy via Originate AMI backend, voir SupervisionService.joinCall()).
//
// Copie adaptée de src/features/workspace/sip/sip-phone.provider.tsx (fichier
// AGENT non modifié — voir contrainte "ne pas toucher au flux agent 101-160").
// Différence volontaire : AUCUNE référence à useWorkspaceStore — ce store
// porte l'état métier de la file d'appel agent (agentStatus RINGING/IN_CALL,
// openQualification()) qui n'a aucun sens pour une session de supervision.
// Le reste (UA SIP.js, credentials via GET /telephony/webrtc-credentials,
// mécanisme d'auto-answer par flag WS) est repris à l'identique.

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { UserAgent, Registerer, RegistererState, SessionState, Invitation } from "sip.js";
import { useSessionStore } from "@/store/session.store";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { workspaceApi } from "@/features/workspace/api/workspace.api";

// Backoff exponentiel plafonné : 2s, 4s, 8s, 16s, 30s(plafond) — puis arrêt.
// Un vrai bannissement fail2ban s'est produit en test à cause d'un retry fixe
// 2s indéfini qui martelait le serveur Asterisk. Après MAX_RETRY_ATTEMPTS
// échecs consécutifs, on arrête les tentatives automatiques et on affiche un
// état d'erreur clair — l'utilisateur doit relancer manuellement.
const MAX_RETRY_ATTEMPTS = 5;
const BASE_RETRY_DELAY_MS = 2000;
const MAX_RETRY_DELAY_MS = 30_000;

function computeRetryDelayMs(attemptIndex: number): number {
  return Math.min(BASE_RETRY_DELAY_MS * 2 ** attemptIndex, MAX_RETRY_DELAY_MS);
}

interface SupervisorSipPhoneContextProps {
  hangup: () => void;
  accept: () => void;
  /** Arme l'auto-answer pour le prochain INVITE entrant — appelé depuis
   *  use-supervisor-spy-socket.ts sur l'event WS "spy.session.starting". */
  triggerAutoAnswer: () => void;
  registered: boolean;
  hasIncomingCall: boolean;
  /** true après MAX_RETRY_ATTEMPTS échecs consécutifs — les tentatives
   *  automatiques sont arrêtées, seul retryManually() peut relancer. */
  connectionFailed: boolean;
  /** Relance manuellement l'initialisation SIP après un connectionFailed. */
  retryManually: () => void;
}

const SupervisorSipPhoneContext = createContext<SupervisorSipPhoneContextProps | null>(null);

function createRingTone(ctx: AudioContext): () => void {
  let stopped = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  function playRing() {
    if (stopped) return;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.frequency.value = 440;
    osc2.frequency.value = 480;
    gain.gain.value = 0.15;

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();

    const stopTime = ctx.currentTime + 1.0;
    osc1.stop(stopTime);
    osc2.stop(stopTime);

    timeoutId = setTimeout(() => {
      if (!stopped) playRing();
    }, 3000);
  }

  playRing();

  return () => {
    stopped = true;
    if (timeoutId) clearTimeout(timeoutId);
  };
}

export function SupervisorSipPhoneProvider({ children }: { children: React.ReactNode }) {
  const session = useSessionStore((s) => s.session);
  const authSession = useAuthStore((s) => s.session);

  const effectiveUserId =
    (session?.user?.numericId ?? 0) > 0 ? session?.user?.numericId :
    (authSession?.user?.numericId ?? 0) > 0 ? authSession?.user?.numericId :
    null;

  const uaRef = useRef<UserAgent | null>(null);
  const registererRef = useRef<Registerer | null>(null);
  const sessionRef = useRef<Invitation | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const stopRingtoneRef = useRef<(() => void) | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);

  // Armé par triggerAutoAnswer() depuis use-supervisor-spy-socket.ts.
  // TTL 55s — cohérent avec le softphone agent.
  const pendingAutoAnswer = useRef(false);
  const autoAnswerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [registered, setRegistered] = useState(false);
  const [hasIncomingCall, setHasIncomingCall] = useState(false);
  const [connectionFailed, setConnectionFailed] = useState(false);

  // Réf vers tryInit() courant — permet à retryManually() (défini hors de
  // l'effet, exposé au contexte) de relancer exactement la même logique.
  const tryInitRef = useRef<() => void>(() => {});
  const isMountedRef = useRef(true);

  /** Appelé sur CHAQUE échec (credentials KO ou déconnexion SIP après un
   *  register réussi). Logge le numéro de tentative, planifie un retry avec
   *  backoff tant que MAX_RETRY_ATTEMPTS n'est pas atteint, sinon arrête et
   *  passe en état d'erreur visible. */
  const handleConnectionFailure = (reason: string) => {
    if (!isMountedRef.current) return;

    const attemptNumber = retryCountRef.current + 1;

    if (attemptNumber >= MAX_RETRY_ATTEMPTS) {
      console.error(
        `[SupervisorSipPhoneProvider] Échec #${attemptNumber}/${MAX_RETRY_ATTEMPTS} (${reason}) — ` +
        `abandon des tentatives automatiques. Cliquez sur "Réessayer" pour relancer manuellement.`,
      );
      retryCountRef.current = attemptNumber;
      setConnectionFailed(true);
      return;
    }

    const delay = computeRetryDelayMs(retryCountRef.current);
    retryCountRef.current = attemptNumber;
    console.warn(
      `[SupervisorSipPhoneProvider] Échec #${attemptNumber}/${MAX_RETRY_ATTEMPTS} (${reason}) — ` +
      `retry dans ${delay / 1000}s`,
    );
    retryTimerRef.current = setTimeout(() => tryInitRef.current(), delay);
  };

  useEffect(() => {
    const audio = document.createElement("audio");
    audio.autoplay = true;
    audioRef.current = audio;
    document.body.appendChild(audio);
    return () => {
      if (document.body.contains(audio)) document.body.removeChild(audio);
    };
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    if (!effectiveUserId) { cleanupSip(); return; }

    retryCountRef.current = 0;
    setConnectionFailed(false);

    const tryInit = () => {
      if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); retryTimerRef.current = null; }

      workspaceApi.getWebRtcCredentials()
        .then((credentials) => {
          if (!isMountedRef.current) return;
          // Connexion réussie (credentials obtenues, initSip() gère la suite) —
          // réinitialiser le compteur d'échecs dès que le flux redémarre proprement.
          retryCountRef.current = 0;
          setConnectionFailed(false);
          initSip(credentials, () => handleConnectionFailure("WS/SIP déconnecté"));
        })
        .catch((err) => {
          if (!isMountedRef.current) return;
          console.error("[SupervisorSipPhoneProvider] Failed to fetch WebRTC credentials:", err);
          handleConnectionFailure("credentials KO");
        });
    };

    tryInitRef.current = tryInit;
    tryInit();

    return () => {
      isMountedRef.current = false;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      cleanupSip();
    };
  }, [effectiveUserId]);

  /** Bouton "Réessayer" manuel — relance depuis zéro après un connectionFailed. */
  const retryManually = () => {
    console.log("[SupervisorSipPhoneProvider] Relance manuelle demandée par l'utilisateur");
    if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); retryTimerRef.current = null; }
    retryCountRef.current = 0;
    setConnectionFailed(false);
    tryInitRef.current();
  };

  const triggerAutoAnswer = () => {
    console.log("[SupervisorSipPhoneProvider] triggerAutoAnswer() armed");

    if (autoAnswerTimerRef.current) clearTimeout(autoAnswerTimerRef.current);

    pendingAutoAnswer.current = true;

    autoAnswerTimerRef.current = setTimeout(() => {
      if (pendingAutoAnswer.current) {
        console.log("[SupervisorSipPhoneProvider] Auto-answer flag expired (no INVITE in 55s)");
        pendingAutoAnswer.current = false;
      }
    }, 55_000);

    if (sessionRef.current && sessionRef.current.state === SessionState.Initial) {
      console.log("[SupervisorSipPhoneProvider] INVITE already pending → accepting immediately");
      pendingAutoAnswer.current = false;
      if (autoAnswerTimerRef.current) clearTimeout(autoAnswerTimerRef.current);
      _doAccept(sessionRef.current);
    }
  };

  const _doAccept = (invitation: Invitation) => {
    stopRingtone();
    setHasIncomingCall(false);
    invitation.accept({
      sessionDescriptionHandlerOptions: { constraints: { audio: true, video: false } },
    }).catch((err) => console.error("[SupervisorSipPhoneProvider] Failed to auto-accept:", err));
  };

  const accept = () => {
    if (!sessionRef.current) return;
    stopRingtone();
    setHasIncomingCall(false);
    sessionRef.current.accept({
      sessionDescriptionHandlerOptions: { constraints: { audio: true, video: false } },
    }).catch((err) => console.error("[SupervisorSipPhoneProvider] Failed to accept invitation:", err));
  };

  const stopRingtone = () => {
    if (stopRingtoneRef.current) {
      stopRingtoneRef.current();
      stopRingtoneRef.current = null;
    }
  };

  const setupSessionListeners = (invitation: Invitation) => {
    invitation.stateChange.addListener((state) => {
      console.log(`[SupervisorSipPhoneProvider][SIP] SessionState → ${state} t=${Date.now()}`);

      if (state === SessionState.Established) {
        stopRingtone();
        setHasIncomingCall(false);

        const remoteStream = new MediaStream();
        const sdh = invitation.sessionDescriptionHandler as any;
        if (sdh?.peerConnection) {
          sdh.peerConnection.getReceivers().forEach((receiver: any) => {
            if (receiver.track?.kind === "audio") remoteStream.addTrack(receiver.track);
          });
          if (audioRef.current) {
            audioRef.current.srcObject = remoteStream;
            audioRef.current.play().catch((err) =>
              console.error("[SupervisorSipPhoneProvider] Play failed:", err)
            );
          }
        }
      } else if (state === SessionState.Terminated) {
        stopRingtone();
        setHasIncomingCall(false);
        sessionRef.current = null;
        // Pas de fallback qualification ici — une session de spy n'a pas de
        // qualification à ouvrir, contrairement à un appel agent.
      }
    });
  };

  const initSip = async (credentials: any, onDisconnect?: () => void) => {
    try {
      cleanupSip();
      console.log(`[SupervisorSipPhoneProvider] Initializing SIP UA for ${credentials.username} on ${credentials.wsServer}`);

      const iceServers: RTCIceServer[] = [
        { urls: "stun:pbx.powerlinecrm.com:3478" },
        {
          urls: "turn:pbx.powerlinecrm.com:3478",
          username: process.env.NEXT_PUBLIC_TURN_USER,
          credential: process.env.NEXT_PUBLIC_TURN_PASSWORD,
        },
      ];

      const ua = new UserAgent({
        uri: UserAgent.makeURI(credentials.uri),
        transportOptions: {
          server: credentials.wsServer,
          traceSip: true,
          connectionTimeout: 10,
        },
        authorizationUsername: credentials.username,
        authorizationPassword: credentials.password,
        displayName: `Superviseur ${credentials.username}`,
        sessionDescriptionHandlerFactoryOptions: {
          constraints: { audio: true, video: false },
          peerConnectionConfiguration: {
            iceServers,
            iceTransportPolicy: "all",
            bundlePolicy: "balanced",
            rtcpMuxPolicy: "require",
          },
        },
      });

      ua.delegate = {
        onInvite(invitation) {
          sessionRef.current = invitation;

          const flagAutoAnswer = pendingAutoAnswer.current;

          console.log(
            `[SupervisorSipPhoneProvider][SIP] INVITE RECEIVED — from=${invitation.request.from?.uri?.toString() ?? "unknown"} pendingAutoAnswer=${flagAutoAnswer} t=${Date.now()}`,
          );

          setupSessionListeners(invitation);

          if (flagAutoAnswer) {
            pendingAutoAnswer.current = false;
            if (autoAnswerTimerRef.current) clearTimeout(autoAnswerTimerRef.current);
            console.log("[SupervisorSipPhoneProvider] Auto-answering spy session (triggered by WS event)");
            _doAccept(invitation);
          } else {
            // Pas de flag armé — ne devrait pas arriver en usage normal (le
            // backend émet toujours spy.session.starting avant l'Originate),
            // mais on garde un fallback sonnerie + acceptation manuelle par
            // robustesse (ex: event WS perdu).
            console.log("[SupervisorSipPhoneProvider] No auto-answer signal → ringing, waiting for manual accept");
            setHasIncomingCall(true);
            try {
              if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
                audioCtxRef.current = new AudioContext();
              }
              stopRingtoneRef.current = createRingTone(audioCtxRef.current);
            } catch (e) {
              console.warn("[SupervisorSipPhoneProvider] Could not start ringtone:", e);
            }
          }
        },
      };

      ua.transport.onDisconnect = (error?: Error) => {
        if (uaRef.current !== ua) return;
        console.warn(`[SupervisorSipPhoneProvider][SIP] Transport onDisconnect — hasError=${!!error} msg=${error?.message ?? "none"}`);
        setRegistered(false);
        onDisconnect?.();
      };

      const registerer = new Registerer(ua);

      registerer.stateChange.addListener((state: RegistererState) => {
        if (uaRef.current !== ua) return;

        console.log(`[SupervisorSipPhoneProvider][SIP] RegistererState → ${state} t=${Date.now()}`);

        if (state === RegistererState.Registered) {
          setRegistered(true);
        } else if (state === RegistererState.Unregistered || state === RegistererState.Terminated) {
          console.warn(`[SupervisorSipPhoneProvider] registerer ${state} de façon inattendue — rebuilding UA`);
          setRegistered(false);
          onDisconnect?.();
        }
      });

      uaRef.current = ua;
      registererRef.current = registerer;

      await ua.start();
      await registerer.register();
      setRegistered(true);
      console.log("[SupervisorSipPhoneProvider] SIP UA Registered successfully");
    } catch (err) {
      console.error("[SupervisorSipPhoneProvider] Error in SIP initialization:", err);
      onDisconnect?.();
    }
  };

  const cleanupSip = () => {
    stopRingtone();
    setHasIncomingCall(false);
    if (autoAnswerTimerRef.current) clearTimeout(autoAnswerTimerRef.current);
    pendingAutoAnswer.current = false;
    if (sessionRef.current) {
      const activeSession = sessionRef.current;
      if (activeSession.state === SessionState.Established) {
        activeSession.bye().catch(() => {});
      } else if (activeSession.state === SessionState.Initial) {
        activeSession.reject().catch(() => {});
      }
      sessionRef.current = null;
    }
    if (registererRef.current) {
      registererRef.current.unregister().catch(() => {});
      registererRef.current = null;
    }
    if (uaRef.current) {
      uaRef.current.stop().catch(() => {});
      uaRef.current = null;
    }
    setRegistered(false);
  };

  const hangup = () => {
    console.log("[SupervisorSipPhoneProvider] Hangup triggered locally");
    stopRingtone();
    setHasIncomingCall(false);
    if (sessionRef.current) {
      if (sessionRef.current.state === SessionState.Initial) {
        sessionRef.current.reject().catch(() => {});
      } else {
        sessionRef.current.bye().catch(() => {});
      }
      sessionRef.current = null;
    }
  };

  return (
    <SupervisorSipPhoneContext.Provider
      value={{ hangup, accept, triggerAutoAnswer, registered, hasIncomingCall, connectionFailed, retryManually }}
    >
      {children}
    </SupervisorSipPhoneContext.Provider>
  );
}

const SUPERVISOR_SIP_NOOP: SupervisorSipPhoneContextProps = {
  hangup: () => {},
  accept: () => {},
  triggerAutoAnswer: () => {},
  registered: false,
  hasIncomingCall: false,
  connectionFailed: false,
  retryManually: () => {},
};

export const useSupervisorSipPhone = () => {
  const context = useContext(SupervisorSipPhoneContext);
  return context ?? SUPERVISOR_SIP_NOOP;
};
