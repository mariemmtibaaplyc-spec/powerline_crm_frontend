"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { UserAgent, Registerer, SessionState, Invitation } from "sip.js";
import { useSessionStore } from "@/store/session.store";
import { useAuthStore } from "../../auth/store/auth.store"
import { workspaceApi } from "@/features/workspace/api/workspace.api";
import { useWorkspaceStore } from "@/features/workspace/store/workspace.store";

interface SipPhoneContextProps {
  hangup:            () => void;
  accept:            () => void;
  /** Arme l'auto-answer pour le prochain INVITE entrant.
   *  Appelé depuis use-workspace-socket.ts sur call.contact.popup (prédictif)
   *  ou call.initiated (manuel CRM-initiated). */
  triggerAutoAnswer: () => void;
  registered:        boolean;
  hasIncomingCall:   boolean;
}

const SipPhoneContext = createContext<SipPhoneContextProps | null>(null);

// ── Sonnerie synthétique via Web Audio API ─────────────────────────────────
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

export function SipPhoneProvider({ children }: { children: React.ReactNode }) {
  const session     = useSessionStore((s) => s.session);
  const authSession = useAuthStore((s) => s.session);

  const effectiveUserId =
    (session?.user?.numericId ?? 0) > 0 ? session?.user?.numericId :
    (authSession?.user?.numericId ?? 0) > 0 ? authSession?.user?.numericId :
    null;

  const uaRef           = useRef<UserAgent | null>(null);
  const registererRef   = useRef<Registerer | null>(null);
  const sessionRef      = useRef<Invitation | null>(null);
  const audioRef        = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef     = useRef<AudioContext | null>(null);
  const stopRingtoneRef = useRef<(() => void) | null>(null);
  const retryTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef   = useRef(0);

  // ── Auto-answer flag ────────────────────────────────────────────────────
  // Armé par triggerAutoAnswer() depuis use-workspace-socket.ts.
  // Consommé (remis à false) dès que le INVITE SIP arrive.
  // TTL 55s : si le INVITE n'arrive pas dans ce délai, désarmer pour
  // éviter d'auto-répondre à un appel ultérieur non lié.
  // Le header SIP X-AUTOANSWER=true reste prioritaire même après expiration du flag.
  const pendingAutoAnswer  = useRef(false);
  const autoAnswerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [registered,      setRegistered]      = useState(false);
  const [hasIncomingCall, setHasIncomingCall] = useState(false);

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
    if (!effectiveUserId) { cleanupSip(); return; }

    let isMounted = true;
    retryCountRef.current = 0;

    const tryInit = () => {
      workspaceApi.getWebRtcCredentials()
        .then((credentials) => {
          if (!isMounted) return;
          retryCountRef.current = 0;
          initSip(credentials, () => {
            // Appelé quand le WS se ferme de façon inattendue → retry avec backoff
            if (!isMounted) return;
            const delay = Math.min(2000 * 2 ** retryCountRef.current, 30_000);
            retryCountRef.current += 1;
            console.warn(`[SipPhoneProvider] WS fermé, retry #${retryCountRef.current} dans ${delay / 1000}s`);
            retryTimerRef.current = setTimeout(tryInit, delay);
          });
        })
        .catch((err) => {
          if (!isMounted) return;
          console.error("[SipPhoneProvider] Failed to fetch WebRTC credentials:", err);
          const delay = Math.min(2000 * 2 ** retryCountRef.current, 30_000);
          retryCountRef.current += 1;
          console.warn(`[SipPhoneProvider] Credentials KO, retry #${retryCountRef.current} dans ${delay / 1000}s`);
          retryTimerRef.current = setTimeout(tryInit, delay);
        });
    };

    tryInit();

    return () => {
      isMounted = false;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      cleanupSip();
    };
  }, [effectiveUserId]);

  // ── triggerAutoAnswer — appelé depuis use-workspace-socket.ts ──────────
  // Arme le flag pour le prochain INVITE entrant.
  // Si le INVITE est déjà présent (arrivé avant le WS), on l'accepte immédiatement.
  const triggerAutoAnswer = () => {
    console.log("[SipPhoneProvider] triggerAutoAnswer() armed");

    if (autoAnswerTimerRef.current) clearTimeout(autoAnswerTimerRef.current);

    pendingAutoAnswer.current = true;

    // TTL 55s — en manuel, l'INVITE arrive seulement après que le client décroche
    // (Dial OVH timeout = 45s), donc le flag doit vivre au moins 50s.
    // Après expiration, X-AUTOANSWER header dans l'INVITE reste prioritaire (fallback).
    autoAnswerTimerRef.current = setTimeout(() => {
      if (pendingAutoAnswer.current) {
        console.log("[SipPhoneProvider] Auto-answer flag expired (no INVITE in 55s) — X-AUTOANSWER header will handle it if INVITE arrives later");
        pendingAutoAnswer.current = false;
      }
    }, 55_000);

    // Cas race : INVITE arrivé avant le WS → accepter immédiatement
    if (sessionRef.current && sessionRef.current.state === SessionState.Initial) {
      console.log("[SipPhoneProvider] INVITE already pending → accepting immediately");
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
    }).catch((err) => console.error("[SipPhoneProvider] Failed to auto-accept:", err));
  };

  const accept = () => {
    if (!sessionRef.current) return;
    stopRingtone();
    setHasIncomingCall(false);
    sessionRef.current.accept({
      sessionDescriptionHandlerOptions: { constraints: { audio: true, video: false } },
    }).catch((err) => console.error("[SipPhoneProvider] Failed to accept invitation:", err));
  };

  const stopRingtone = () => {
    if (stopRingtoneRef.current) {
      stopRingtoneRef.current();
      stopRingtoneRef.current = null;
    }
  };

  const setupSessionListeners = (invitation: Invitation) => {
    invitation.stateChange.addListener((state) => {
      console.log(`[SipPhoneProvider] Call session state changed to: ${state}`);

      if (state === SessionState.Established) {
        stopRingtone();
        setHasIncomingCall(false);

        // ── Transition immédiate ringing → in_call ────────────────────────
        // Déclenchée localement dès que la session SIP est établie (client
        // décroche). C'est le signal le plus fiable — indépendant du backend WS.
        useWorkspaceStore.setState((s) => {
          if (s.agentStatus === "ringing" || s.agentStatus === "waiting") {
            console.log("[SipPhoneProvider] SIP Established → agentStatus = in_call");
            return {
              agentStatus:     "in_call" as const,
              statusStartedAt: Date.now(),
            };
          }
          return {};
        });

        const remoteStream = new MediaStream();
        const sdh = invitation.sessionDescriptionHandler as any;
        if (sdh?.peerConnection) {
          sdh.peerConnection.getReceivers().forEach((receiver: any) => {
            if (receiver.track?.kind === "audio") remoteStream.addTrack(receiver.track);
          });
          if (audioRef.current) {
            audioRef.current.srcObject = remoteStream;
            audioRef.current.play().catch((err) =>
              console.error("[SipPhoneProvider] Play failed:", err)
            );
          }
        }
      } else if (state === SessionState.Terminated) {
        stopRingtone();
        setHasIncomingCall(false);
        sessionRef.current = null;
      }
    });
  };

  const initSip = async (credentials: any, onDisconnect?: () => void) => {
    try {
      cleanupSip();
      console.log(`[SipPhoneProvider] Initializing SIP UA for ${credentials.username} on ${credentials.wsServer}`);

      const iceServers = [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun.cloudflare.com:3478" },
      ];

      const ua = new UserAgent({
        uri: UserAgent.makeURI(credentials.uri),
        transportOptions: {
          server:            credentials.wsServer,
          traceSip:          true,
          connectionTimeout: 10,
        },
        authorizationUsername: credentials.username,
        authorizationPassword: credentials.password,
        displayName: `Agent ${credentials.username}`,
        sessionDescriptionHandlerFactoryOptions: {
          constraints: { audio: true, video: false },
          peerConnectionConfiguration: {
            iceServers,
            iceTransportPolicy: "all",
            bundlePolicy:       "max-bundle",
            rtcpMuxPolicy:      "require",
          },
        },
      });

      ua.delegate = {
        onInvite(invitation) {
          sessionRef.current = invitation;

          // ── Logique auto-answer ──────────────────────────────────────────
          // APPROCHE PRÉCÉDENTE (abandonnée) : header SIP X-AUTOANSWER / PJSIP_HEADER
          //   → NON FONCTIONNEL sur FreePBX/chan_pjsip avec pre-dial handler b()
          //   → Header absent du INVITE reçu par SIP.js (confirmé en production)
          //
          // APPROCHE ACTUELLE : flag armé par WS call.contact.popup (prédictif)
          //   ou call.initiated (manuel), via triggerAutoAnswer()
          //   → aucune dépendance au header SIP

          const headerVal = (invitation.request as any).getHeader?.("X-AUTOANSWER");
          const sipHeaderAutoAnswer = String(headerVal ?? "").toLowerCase() === "true";
          const flagAutoAnswer = pendingAutoAnswer.current;
          const shouldAutoAnswer = sipHeaderAutoAnswer || flagAutoAnswer;

          console.log(
            `[SipPhoneProvider] Received incoming INVITE. X-AUTOANSWER=${headerVal ?? "absent"} | pendingAutoAnswer=${flagAutoAnswer} | shouldAutoAnswer=${shouldAutoAnswer}`
          );

          setupSessionListeners(invitation);

          if (shouldAutoAnswer) {
            pendingAutoAnswer.current = false;
            if (autoAnswerTimerRef.current) clearTimeout(autoAnswerTimerRef.current);
            if (sipHeaderAutoAnswer && !flagAutoAnswer) {
              console.log("[SipPhoneProvider] Auto-answer accepted from SIP header (flag had expired)");
            } else if (sipHeaderAutoAnswer) {
              console.log("[SipPhoneProvider] Auto-answering (SIP header + WS flag)");
            } else {
              console.log("[SipPhoneProvider] Auto-answering (triggered by WS event)");
            }
            _doAccept(invitation);
          } else {
            console.log("[SipPhoneProvider] No auto-answer signal → ringing, waiting for agent to answer");
            setHasIncomingCall(true);
            try {
              if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
                audioCtxRef.current = new AudioContext();
              }
              stopRingtoneRef.current = createRingTone(audioCtxRef.current);
            } catch (e) {
              console.warn("[SipPhoneProvider] Could not start ringtone:", e);
            }
          }
        },
      };

      // Retry automatique si le WebSocket se ferme de façon inattendue
      ua.transport.onDisconnect = (error?: Error) => {
        if (error) {
          console.warn("[SipPhoneProvider] Transport déconnecté avec erreur:", error.message);
          setRegistered(false);
          onDisconnect?.();
        }
      };

      const registerer = new Registerer(ua);
      uaRef.current         = ua;
      registererRef.current = registerer;

      await ua.start();
      await registerer.register();
      setRegistered(true);
      console.log("[SipPhoneProvider] SIP UA Registered successfully");
    } catch (err) {
      console.error("[SipPhoneProvider] Error in SIP initialization:", err);
      onDisconnect?.();
    }
  };

  const cleanupSip = () => {
    stopRingtone();
    setHasIncomingCall(false);
    if (autoAnswerTimerRef.current) clearTimeout(autoAnswerTimerRef.current);
    pendingAutoAnswer.current = false;
    if (sessionRef.current) {
      sessionRef.current.bye().catch(() => {});
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
    console.log("[SipPhoneProvider] Hangup triggered locally");
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
    <SipPhoneContext.Provider value={{ hangup, accept, triggerAutoAnswer, registered, hasIncomingCall }}>
      {children}
    </SipPhoneContext.Provider>
  );
}

export const useSipPhone = () => {
  const context = useContext(SipPhoneContext);
  if (!context) throw new Error("useSipPhone must be used within a SipPhoneProvider");
  return context;
};
