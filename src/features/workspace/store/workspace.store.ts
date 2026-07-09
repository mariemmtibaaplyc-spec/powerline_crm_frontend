import { create } from "zustand";
import { useSessionStore } from "@/store/session.store";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  MOCK_AGENT_IDENTITY,
  PAUSE_OPTIONS,
} from "@/features/workspace/mocks/agent.mock";
import { formatInputDate } from "@/features/workspace/mocks/mock.utils";
import { createUnknownManualCallProspect } from "@/features/workspace/mocks/prospects.mock";
import type {
  ActivePause,
  AgentIdentity,
  AgentStatus,
  AppointmentEntry,
  AppointmentFormValues,
  CallSession,
  HistoryEntry,
  PauseType,
  ProspectSheet,
  QualificationRecord,
  QualificationCode,
  Reminder,
  ReminderFormValues,
} from "@/types/workspace.types";

// ── Type Backend ────────────────────────────────────────────────────────────
// AJOUT : déclaré ici, sera déplacé dans workspace.types.ts plus tard
interface BackendQualification {
  id: number;
  campaign_id: number;
  name: string;
  type: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  is_active: boolean;
}

/** Notification "rappel dû" — alimentée directement par le payload WS
 *  reminder.due (voir use-workspace-socket.ts), affichée en toast topbar. */
export interface DueReminderToast {
  id: string;
  reminderId: number;
  contactName: string | null;
  phone: string;
  notes: string | null;
}

function buildReminderDraftNote(values: ReminderFormValues) {
  const schedule = `${values.date} ${values.time}`;
  const note = values.note.trim();
  return note
    ? `[RAPPEL ${schedule}] ${note}`
    : `[RAPPEL ${schedule}]`;
}

/**
 * Marque DONE le rappel à l'origine de l'appel en cours (callSession.activeReminderId),
 * une fois que l'agent l'a "traité" — quelle que soit l'issue de la qualification
 * (RDV, refus, appel simple, etc.). Sans ça, un rappel resté PENDING/NOTIFIED ne
 * disparaissait de la liste de notifications QUE si l'agent le requalifiait à
 * nouveau en RAPPEL sur le même contact (seul cas géré côté backend, via
 * closeOpenRemindersForTarget dans RemindersService.createFromCall) — dans
 * tous les autres cas (RDV, qualification simple), il restait affiché indéfiniment,
 * y compris le lendemain.
 * Non-bloquant : un échec ne doit jamais empêcher la fin de qualification.
 */
async function markActiveReminderDoneIfAny(activeReminderId: string | null): Promise<void> {
  if (!activeReminderId) return;
  const reminderId = Number(activeReminderId);
  if (!Number.isFinite(reminderId)) return;

  try {
    const { workspaceApi } = await import("@/features/workspace/api/workspace.api");
    await workspaceApi.markReminderDone(reminderId);
    console.log(`[markActiveReminderDoneIfAny] reminder_id=${reminderId} marked DONE`);
    useWorkspaceStore.getState().fetchReminders().catch(() => {});
  } catch (err: any) {
    // Non-bloquant — si déjà DONE/CANCELLED côté backend (ex: superseded par
    // un nouveau rappel entre-temps), pas grave, on ne bloque jamais la qualification.
    console.warn(`[markActiveReminderDoneIfAny] failed reminder_id=${reminderId}:`, err?.message ?? err);
  }
}

/** Combine date+time du formulaire rappel en ISO local, pour Reminder.scheduled_at backend. */
function buildReminderScheduledAtIso(values: ReminderFormValues): string {
  return `${values.date}T${values.time}:00`;
}

// ── Interface store ─────────────────────────────────────────────────────────
interface AgentWorkspaceStoreState {
  // ── State existant ────────────────────────────────────────────────────────
  agentIdentity: AgentIdentity;
  agentStatus: AgentStatus;
  statusStartedAt: number;
  sessionStartedAt: number;
  activeProspect: ProspectSheet;
  callSession: CallSession;
  activePause: ActivePause | null;
  selectedPauseTypeCode: PauseType["code"];
  qualificationPanelOpen: boolean;
  reminderFormOpen: boolean;
  appointmentFormOpen: boolean;
  latestReminderFocusDate: string | null;
  selectedQualification: QualificationCode | null;
  lastQualification: QualificationRecord | null;
  pendingQualificationNextStatus: "paused" | "waiting" | null;
  appointments: AppointmentEntry[];
  reminders: Reminder[];
  historyEntries: HistoryEntry[];
  // Notifications "rappel dû" — alimentées par l'event WS reminder.due
  // (voir use-workspace-socket.ts), consommées par la topbar agent.
  dueReminderToasts: DueReminderToast[];

  // ── State AJOUT Backend ───────────────────────────────────────────────────
  appointmentError: string | null; // null = pas d'erreur, string = message à afficher dans la modale
  // Cache du dernier poll daily-stats — null avant le premier fetch.
  // null → sidebar affiche "—" (placeholder neutre, pas "0").
  // Contient toutes les statistiques journalières — utilisé par le footer ET la sidebar.
  dailyStatsCache: {
    communication_seconds: number;
    qualification_seconds: number;
    attente_seconds:       number;
    pause_seconds:         number;
    total_seconds:         number;
    appointments_today:    number;
    calls_today:           number;
    lastSyncAt:            number;  // timestamp ms du dernier fetch réussi
  } | null;
  userId: number | null;
  sipExtension: string | null;
  activeCampaignId: number | null;
  currentCallId: number | null;
  isEndingCall: boolean;
  endingCallId: number | null;
  isStatusMutationPending: boolean;
  pendingAgentStatusTarget: "AVAILABLE" | "PAUSED" | "OFFLINE" | null;
  backendQualifications: BackendQualification[];
  selectedQualificationId: number | null;
  selectedQualificationMeta: BackendQualification | null;
  selectBackendQualification: (
  qual: BackendQualification | null
) => void

  // ── Actions existantes ────────────────────────────────────────────────────
  selectPauseType: (pauseCode: PauseType["code"]) => void;
  setAgentStatus: (status: AgentStatus) => void;
  resumeQueue: () => void;
  startPause: (pauseCode?: PauseType["code"]) => void;
  endPause: () => void;
  openQualification: () => void;
  closeQualification: (nextStatus?: "paused" | "waiting") => Promise<void>;
  cancelReminderForm: () => void;
  submitReminderQualification: (values: ReminderFormValues) => void;
  cancelAppointmentForm: () => void;
  submitAppointmentQualification: (values: AppointmentFormValues) => void;
  startManualCall: (number: string) => Promise<void>;
  openReminderCall: (entry: Reminder | HistoryEntry) => void;
  setActiveProspect: (prospect: ProspectSheet) => void;
  updateProspectField: (field: keyof ProspectSheet, value: string) => void;
  markClientHungUp: () => void;
  markAgentHungUp: () => void;

  fetchHistory: (date: string) => Promise<void>;
  fetchAppointments: (date?: string) => Promise<void>;
  fetchReminders: () => Promise<void>;
  pushDueReminderToast: (toast: DueReminderToast) => void;
  dismissDueReminderToast: (id: string) => void;
  fetchDailyStats: () => Promise<void>;
  dismissAppointmentError: () => void;

  // ── Actions AJOUT Backend ─────────────────────────────────────────────────
  initFromSession: (params: {
    userId: number;
    sipExtension: string | null;
    firstName: string;
    lastName: string;
    role?: string | null;
    activeCampaignId?: number | null;
    activeCampaignName?: string | null;
  }) => Promise<void>;
  setAgentStatusFromWS: (status: AgentStatus) => void;
  
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function hasValidAuthToken(): boolean {
  if (typeof window === "undefined") return false;
  const sessionToken = useSessionStore.getState().session?.accessToken ?? null;
  const authToken = useAuthStore.getState().session?.accessToken ?? null;
  const storageToken = window.localStorage.getItem("accessToken");
  return Boolean(sessionToken ?? authToken ?? storageToken);
}

function resolvePauseType(code?: PauseType["code"]) {
  return PAUSE_OPTIONS.find((item) => item.code === code) ?? PAUSE_OPTIONS[0];
}

function createInitialState() {
  const now = Date.now();
  const today = formatInputDate(new Date());

  return {
    agentIdentity: MOCK_AGENT_IDENTITY,
    agentStatus: "paused" as AgentStatus,
    statusStartedAt: now,
    sessionStartedAt: now,
    activeProspect: createUnknownManualCallProspect(""),
    // ── AJOUT Backend ───────────────────────────────────────────────────────
    dailyStatsCache: null as {
      communication_seconds: number; qualification_seconds: number;
      attente_seconds: number; pause_seconds: number; total_seconds: number;
      appointments_today: number; calls_today: number; lastSyncAt: number;
    } | null,
    userId: null as number | null,
    sipExtension: null as string | null,
    activeCampaignId: null as number | null,
    currentCallId: null as number | null,
    isEndingCall: false,
    endingCallId: null as number | null,
    isStatusMutationPending: false,
    pendingAgentStatusTarget: null as "AVAILABLE" | "PAUSED" | "OFFLINE" | null,
    appointmentError: null as string | null,
    backendQualifications: [] as BackendQualification[],
    selectedQualificationId: null as number | null,
    selectedQualificationMeta: null as BackendQualification | null,
    // ───────────────────────────────────────────────────────────────────────
    callSession: {
      active: false,
      direction: null,
      currentNumber: null,
      activeReminderId: null,
      startedAt: null,
      hungUpBy: null,
      campaign: null,
      queue: null,
      backendCallId: null,
      backendContactId: null,
      backendLeadId: null,
    } satisfies CallSession,
    activePause: null as ActivePause | null,
    selectedPauseTypeCode: PAUSE_OPTIONS[0].code,
    qualificationPanelOpen: false,
    reminderFormOpen: false,
    appointmentFormOpen: false,
    latestReminderFocusDate: null as string | null,
    selectedQualification: null as QualificationCode | null,
    lastQualification: null as QualificationRecord | null,
    pendingQualificationNextStatus: null as "paused" | "waiting" | null,
    appointments: [] as AppointmentEntry[],
    reminders: [] as Reminder[],
    dueReminderToasts: [] as DueReminderToast[],
    historyEntries: [] as HistoryEntry[],
  };
}

// ── Fonctions utilitaires (inchangées) ──────────────────────────────────────

function nextCallSessionForStatus(
  currentSession: CallSession,
  nextStatus: AgentStatus,
  fallbackNumber: string,
  nextStartedAt: number,
) {
  if (nextStatus === "ringing" || nextStatus === "in_call") {
    return {
      ...currentSession,
      active: true,
      currentNumber: currentSession.currentNumber ?? fallbackNumber,
      startedAt: currentSession.startedAt ?? nextStartedAt,
      hungUpBy: null,
    } satisfies CallSession;
  }

  if (nextStatus === "hung_up" || nextStatus === "qualification") {
    return {
      ...currentSession,
      active: false,
    } satisfies CallSession;
  }

  return {
    ...currentSession,
    active: false,
    startedAt: currentSession.startedAt,
  } satisfies CallSession;
}

function applyStatusTransition(
  state: AgentWorkspaceStoreState,
  nextStatus: AgentStatus,
) {
  const nextStartedAt = Date.now();
  const nextCallSession = nextCallSessionForStatus(
    state.callSession,
    nextStatus,
    state.activeProspect.phone,
    nextStartedAt,
  );

  return {
    agentStatus: nextStatus,
    statusStartedAt: nextStartedAt,
    qualificationPanelOpen: nextStatus === "qualification",
    selectedQualification:
      nextStatus === "qualification" ? state.selectedQualification : null,
    activePause: nextStatus === "paused" ? state.activePause : null,
    callSession: nextCallSession,
  };
}

function createIdleCallSession(): CallSession {
  return {
    active: false,
    direction: null,
    currentNumber: null,
    activeReminderId: null,
    startedAt: null,
    hungUpBy: null,
    campaign: null,
    queue: null,
    backendCallId: null,
    backendContactId: null,
    backendLeadId: null,
  };
}

// ── Autosave fiche prospect ──────────────────────────────────────────────────
// Debounce simple : une seule sauvegarde en attente à la fois, réarmée à chaque
// frappe. Ne s'active que si le contact est réellement résolu côté backend
// (callSession.backendContactId) — sinon rien à persister (numéro inconnu).
let prospectAutosaveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleProspectAutosave(contactId: number) {
  if (prospectAutosaveTimer) clearTimeout(prospectAutosaveTimer);
  prospectAutosaveTimer = setTimeout(() => {
    prospectAutosaveTimer = null;
    void persistProspect(contactId);
  }, 900);
}

async function persistProspect(contactId: number) {
  const state = useWorkspaceStore.getState();
  // Le contact actif a pu changer entre-temps (raccroché / nouvel appel) →
  // ne pas écraser la fiche d'un autre prospect avec des données obsolètes.
  if (state.callSession.backendContactId !== contactId) return;

  const p = state.activeProspect;
  const { workspaceApi } = await import("@/features/workspace/api/workspace.api");
  try {
    await workspaceApi.updateContact(contactId, {
      first_name: p.firstName,
      last_name: p.lastName,
      phone2: p.phoneSecondary || undefined,
      email: p.email || undefined,
      address: p.address || undefined,
      postal_code: p.postalCode || undefined,
      city: p.city || undefined,
      custom_fields: { commentaires: p.comments },
    });
  } catch (err) {
    console.error(`[persistProspect] échec autosave contactId=${contactId}:`, err);
  }
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useWorkspaceStore = create<AgentWorkspaceStoreState>((set) => ({
  ...createInitialState(),

  // ── Actions existantes (inchangées) ────────────────────────────────────────

  selectPauseType: (pauseCode) =>
    set((state) => ({
      ...state,
      selectedPauseTypeCode: pauseCode,
    })),

  setAgentStatus: (status) =>
    set((state) => ({
      ...state,
      ...applyStatusTransition(state, status),
    })),

  resumeQueue: () => {
  // Appel API fire-and-forget — le WS agent.status.changed confirmera le statut
  const { userId, qualificationPanelOpen, isEndingCall } = useWorkspaceStore.getState();
  if (qualificationPanelOpen || isEndingCall) {
    console.log("[resumeQueue] ignored because qualification transition is active");
    return;
  }
  if (userId) {
    import("@/features/workspace/api/workspace.api").then(({ workspaceApi }) => {
      workspaceApi.setAvailable(userId).catch((err) =>
        console.error("[resumeQueue] setAvailable failed:", err),
      );
    });
  }
  // Mise à jour UI immédiate (optimistic) sans attendre la réponse
  set((state) => ({
    ...state,
    ...applyStatusTransition(state, "waiting"),
    activePause: null,
  }));
},

startPause: (pauseCode) => {
  // Appel API fire-and-forget
  const { userId, qualificationPanelOpen, isEndingCall } = useWorkspaceStore.getState();
  if (qualificationPanelOpen || isEndingCall) {
    console.log("[startPause] ignored because qualification transition is active");
    return;
  }
  if (userId) {
    import("@/features/workspace/api/workspace.api").then(({ workspaceApi }) => {
      workspaceApi.setPaused(userId).catch((err) =>
        console.error("[startPause] setPaused failed:", err),
      );
    });
  }
  set((state) => {
    const pauseType = resolvePauseType(pauseCode ?? state.selectedPauseTypeCode);
    const startedAt = Date.now();

    return {
      ...state,
      agentStatus: "paused",
      statusStartedAt: startedAt,
      selectedPauseTypeCode: pauseType.code,
      activePause: {
        type: pauseType,
        startedAt,
      },
      qualificationPanelOpen: false,
      callSession: {
        ...state.callSession,
        active: false,
      },
    };
  });
},
  endPause: () => {
    // Appel API fire-and-forget — passer AVAILABLE quand on termine la pause
    const { userId, qualificationPanelOpen, isEndingCall } = useWorkspaceStore.getState();
    if (qualificationPanelOpen || isEndingCall) {
      console.log("[endPause] ignored because qualification transition is active");
      return;
    }
    if (userId) {
      import("@/features/workspace/api/workspace.api").then(({ workspaceApi }) => {
        workspaceApi.setAvailable(userId).catch((err) =>
          console.error("[endPause] setAvailable failed:", err),
        );
      });
    }
    // Mise à jour UI optimiste → "waiting" (disponible pour appels)
    set((state) => ({
      ...state,
      ...applyStatusTransition(state, "waiting"),
      activePause: null,
    }));
  },

  openQualification: () =>
    set((state) => {
      if (state.qualificationPanelOpen) {
        console.log(
          `[openQualification] skip duplicate callId=${state.callSession.backendCallId ?? 'none'} campaignId=${state.activeCampaignId ?? 'none'} status=${state.agentStatus}`,
        );
        return state;
      }

      console.log(
        `[openQualification] open callId=${state.callSession.backendCallId ?? 'none'} campaignId=${state.activeCampaignId ?? 'none'} status=${state.agentStatus}`,
      );

      return {
        ...state,
        ...applyStatusTransition(state, "qualification"),
        qualificationPanelOpen: true,
        reminderFormOpen: false,
        appointmentFormOpen: false,
        selectedQualification: null,
        selectedQualificationId: null,
        selectedQualificationMeta: null,
        pendingQualificationNextStatus: null,
        isEndingCall: state.callSession.backendCallId ? true : state.isEndingCall,
        endingCallId: state.callSession.backendCallId ?? state.endingCallId,
      };
    }),
   selectBackendQualification: (qual: BackendQualification | null) =>
  set((state) => ({
    ...state,
    selectedQualificationId:   qual?.id ?? null,
    selectedQualificationMeta: qual ?? null,
    // Conserver la compatibilité avec l'ancien selectedQualification
    selectedQualification: null,
  })), 

  closeQualification: async (nextStatus = "waiting") => {
  const {
    callSession,
    selectedQualificationId,
    selectedQualificationMeta,
    userId,
    activeCampaignId,
  } = useWorkspaceStore.getState();

  const callId = callSession.backendCallId;

  console.log(`[PREDICTIVE RESUME] closeQualification entered nextStatus=${nextStatus} userId=${userId ?? 'null'} callId=${callId ?? 'null'} activeCampaignId=${activeCampaignId ?? 'null'} selectedQualificationId=${selectedQualificationId ?? 'null'} agentStatus=${useWorkspaceStore.getState().agentStatus}`);

  if (!callId) {
    // Pas de call Backend (test/mock) → comportement local uniquement
    // On appelle quand même setAvailable/setPaused pour mettre à jour le statut
    // agent en DB (l'API /me n'a pas besoin de callId).
    console.log(`[ResumePredictive] qualification closed (no callId) nextStatus=${nextStatus}`);
    import("@/features/workspace/api/workspace.api").then(({ workspaceApi }) => {
      if (nextStatus === "paused") {
        workspaceApi.setPaused(userId ?? 0).catch(console.error);
      } else {
        console.log(`[ResumePredictive] setAvailable via /me`);
        workspaceApi.setAvailable(userId ?? 0).catch((err: any) =>
          console.error("[ResumePredictive] setAvailable failed:", err?.message)
        );
      }
    }).catch(console.error);
    set((state) => ({
      ...state,
      ...applyStatusTransition(state, nextStatus),
      qualificationPanelOpen: false,
      selectedQualification: null,
      selectedQualificationId: null,
      selectedQualificationMeta: null,
      pendingQualificationNextStatus: null,
      isEndingCall: false,
      endingCallId: null,
      currentCallId: null,
    }));
    return;
  }

  const { workspaceApi } = await import("@/features/workspace/api/workspace.api");

  // Détecter si la qualif nécessite un formulaire supplémentaire
  const name = selectedQualificationMeta?.name?.toLowerCase() ?? "";
  const isCallback    = name.includes("rappel");
  const isAppointment = name.includes("rdv") || name.includes("rendez");

  if (isCallback) {
    // Ouvrir le formulaire Rappel — l'appel API sera fait dans submitReminderQualification
    set((state) => ({
      ...state,
      reminderFormOpen: true,
      appointmentFormOpen: false,
      pendingQualificationNextStatus: nextStatus,
    }));
    return;
  }

  if (isAppointment) {
    // Ouvrir le formulaire RDV — l'appel API sera fait dans submitAppointmentQualification
    set((state) => ({
      ...state,
      appointmentFormOpen: true,
      reminderFormOpen: false,
      pendingQualificationNextStatus: nextStatus,
    }));
    return;
  }

  // Qualification simple → PATCH /calls/:id/end directement
  try {
    console.log(
      `[closeQualification] userId=${userId ?? 'none'} callId=${callId} campaignId=${activeCampaignId ?? 'none'} qualificationId=${selectedQualificationId ?? 'none'} nextStatus=${nextStatus}`,
    );
    await workspaceApi.endCall(callId, {
      qualification_id: selectedQualificationId ?? undefined,
      require_qualification: true,
    });
  } catch (err) {
    console.error("[closeQualification] endCall failed:", err);
    return;
  }

  // Qualification "simple" (ni RAPPEL ni RDV) — le rappel qui a déclenché cet
  // appel (s'il y en a un) a été traité, on le clôture pour qu'il disparaisse
  // de la liste de notifications.
  markActiveReminderDoneIfAny(callSession.activeReminderId).catch(() => {});

  // Signaler le statut au backend après qualification.
  // On utilise /me — pas besoin de userId valide côté URL.
  // Le guard "if (userId)" est supprimé car il bloquait l'appel quand
  // userId=0 ou null dans le store.
  if (nextStatus === "paused") {
    console.log(`[PredictiveWrapUp] pause -> PAUSED userId=${userId ?? 'me'} callId=${callId}`);
    try {
      await workspaceApi.setPaused(userId ?? 0);
    } catch (err) {
      console.error("[PredictiveWrapUp] setPaused failed:", err);
      return;
    }
  } else {
    console.log(`[ResumePredictive] qualification closed callId=${callId} userId=${userId ?? 'me'}`);
    workspaceApi.setAvailable(userId ?? 0).then(() => {
      console.log(`[ResumePredictive] setAvailable success userId=${userId ?? 'me'}`);
    }).catch((err: any) =>
      console.error("[ResumePredictive] setAvailable failed:", err?.message)
    );
  }

  // Refetch historique pour afficher le nouvel appel qualifié
  useWorkspaceStore.getState().fetchHistory(formatInputDate(new Date())).catch(() => {});

  console.log(
    `[ManualHangup] state cleanup after qualification callId=${callId} campaignId=${activeCampaignId ?? 'none'} nextStatus=${nextStatus}`,
  );
  set((state) => ({
    ...state,
    ...applyStatusTransition(state, nextStatus),
    qualificationPanelOpen: false,
    selectedQualification: null,
    selectedQualificationId: null,
    selectedQualificationMeta: null,
    pendingQualificationNextStatus: null,
    isEndingCall: false,
    endingCallId: null,
    currentCallId: null,
    activePause: nextStatus === "paused"
      ? { type: resolvePauseType(state.selectedPauseTypeCode), startedAt: Date.now() }
      : null,
    callSession: createIdleCallSession(),
  }));
},

  cancelReminderForm: () =>
    set((state) => ({
      ...state,
      reminderFormOpen: false,
      pendingQualificationNextStatus: null,
    })),

  submitReminderQualification: async (values) => {
  const {
    callSession,
    selectedQualificationId,
    pendingQualificationNextStatus,
    userId,
  } = useWorkspaceStore.getState();

  const nextStatus = pendingQualificationNextStatus ?? "waiting";
  const callId = callSession.backendCallId;

  if (callId) {
    const { workspaceApi } = await import("@/features/workspace/api/workspace.api");
    let appointmentFailed = false;
    try {
      // reminder: {scheduled_at, notes} — auparavant seul un texte libre était
      // envoyé dans `notes` ; le backend (EndCallUseCase) ne persistait donc
      // jamais de Reminder structuré. Le backend est la source de vérité :
      // il rejette ce champ si la qualification n'est pas de type RAPPEL
      // (voir _createFollowUpIfNeeded), donc aucun risque de double-emploi.
      await workspaceApi.endCall(callId, {
        qualification_id: selectedQualificationId ?? undefined,
        require_qualification: true,
        notes: buildReminderDraftNote(values),
        reminder: {
          scheduled_at: buildReminderScheduledAtIso(values),
          notes: values.note.trim() || undefined,
        },
      });
    } catch (err) {
      console.error("[submitReminderQualification] endCall failed:", err);
      appointmentFailed = true;
      set({ appointmentError: "Le rappel n'a pas pu être enregistré. Vérifiez les informations de l'appel." });
    }

    if (appointmentFailed) return;

    if (nextStatus === "paused") {
      try {
        await workspaceApi.setPaused(userId ?? 0);
      } catch (err) {
        console.error("[submitReminderQualification] setPaused failed:", err);
        return;
      }
    } else {
      console.log(`[ResumePredictive] setAvailable via /me userId=${userId ?? 'me'}`);
      workspaceApi.setAvailable(userId ?? 0).then(() => {
        console.log(`[ResumePredictive] setAvailable success userId=${userId ?? 'me'}`);
      }).catch((err: any) => console.error("[ResumePredictive] setAvailable failed:", err?.message));
    }

    // Refetch historique + rappels (le nouveau Reminder doit apparaître dans "mes rappels")
    useWorkspaceStore.getState().fetchHistory(formatInputDate(new Date())).catch(() => {});
    useWorkspaceStore.getState().fetchReminders().catch(() => {});
  }

  set((state) => ({
    ...state,
    ...applyStatusTransition(state, nextStatus),
    qualificationPanelOpen: false,
    reminderFormOpen: false,
    appointmentFormOpen: false,
    appointmentError: null,
    selectedQualification: null,
    selectedQualificationId: null,
    selectedQualificationMeta: null,
    pendingQualificationNextStatus: null,
    isEndingCall: false,
    endingCallId: null,
    currentCallId: null,
    activePause: nextStatus === "paused"
      ? { type: resolvePauseType(state.selectedPauseTypeCode), startedAt: Date.now() }
      : null,
    callSession: createIdleCallSession(),
  }));
},

  cancelAppointmentForm: () =>
    set((state) => ({
      ...state,
      appointmentFormOpen: false,
      pendingQualificationNextStatus: null,
    })),

  submitAppointmentQualification: async (values) => {
  const {
    callSession,
    selectedQualificationId,
    pendingQualificationNextStatus,
    userId,
  } = useWorkspaceStore.getState();

  const nextStatus = pendingQualificationNextStatus ?? "waiting";
  const callId = callSession.backendCallId;

  if (callId) {
    const { workspaceApi } = await import("@/features/workspace/api/workspace.api");
    let appointmentFailed = false;
    try {
      const response = await workspaceApi.endCall(callId, {
        qualification_id: selectedQualificationId ?? undefined,
        require_qualification: true,
        appointment: {
          scheduled_at: `${values.date}T${values.time}:00`,
          notes: values.note,
        },
      });

      if (response.appointment_error) {
        // Backend a logué la cause réelle — on affiche un message générique
        appointmentFailed = true;
        set({ appointmentError: "Le RDV n'a pas pu être créé. Vérifiez que l'appel est associé à un contact, ou continuez sans RDV." });
      } else if (response.appointment) {
        // RDV créé avec succès — refetch la liste depuis le backend (données exactes)
        useWorkspaceStore.getState().fetchAppointments(values.date).catch(() => {});

        // Compteur "RDV du jour" (sidebar footer) — mise à jour optimiste
        // immédiate si le RDV est pris pour aujourd'hui, sans attendre le
        // prochain polling de fetchDailyStats() (5 min).
        if (values.date === formatInputDate(new Date())) {
          set((state) => ({
            dailyStatsCache: state.dailyStatsCache
              ? {
                  ...state.dailyStatsCache,
                  appointments_today: state.dailyStatsCache.appointments_today + 1,
                }
              : state.dailyStatsCache,
          }));
        }
        // Recale ensuite sur la valeur exacte du backend (couvre le cas où
        // dailyStatsCache n'était pas encore chargé, ou une divergence).
        useWorkspaceStore.getState().fetchDailyStats().catch(() => {});
      }
    } catch (err) {
      console.error("[submitAppointmentQualification] endCall failed:", err);
      appointmentFailed = true;
      set({ appointmentError: "Le RDV n'a pas pu être créé. Vérifiez les informations de l'appel." });
    }

    // Si le RDV a échoué, garder la modale ouverte pour que l'agent voie l'erreur
    if (appointmentFailed) return;

    // Rappel traité via une qualification RDV — le clôturer aussi (voir
    // markActiveReminderDoneIfAny pour le contexte complet du bug corrigé).
    markActiveReminderDoneIfAny(callSession.activeReminderId).catch(() => {});

    if (nextStatus === "paused") {
      try {
        await workspaceApi.setPaused(userId ?? 0);
      } catch (err) {
        console.error("[submitAppointmentQualification] setPaused failed:", err);
        return;
      }
    } else {
      console.log(`[ResumePredictive] setAvailable via /me userId=${userId ?? 'me'}`);
      workspaceApi.setAvailable(userId ?? 0).then(() => {
        console.log(`[ResumePredictive] setAvailable success userId=${userId ?? 'me'}`);
      }).catch((err: any) => console.error("[ResumePredictive] setAvailable failed:", err?.message));
    }

    // Refetch historique
    useWorkspaceStore.getState().fetchHistory(formatInputDate(new Date())).catch(() => {});
  }

  set((state) => ({
    ...state,
    ...applyStatusTransition(state, nextStatus),
    qualificationPanelOpen: false,
    reminderFormOpen: false,
    appointmentFormOpen: false,
    appointmentError: null,
    selectedQualification: null,
    selectedQualificationId: null,
    selectedQualificationMeta: null,
    pendingQualificationNextStatus: null,
    isEndingCall: false,
    endingCallId: null,
    currentCallId: null,
    activePause: nextStatus === "paused"
      ? { type: resolvePauseType(state.selectedPauseTypeCode), startedAt: Date.now() }
      : null,
    callSession: createIdleCallSession(),
  }));
},
  startManualCall: async (number: string) => {
  const { userId, activeCampaignId, sipExtension } = useWorkspaceStore.getState();
  if (!userId) {
  console.error("[startManualCall] userId not set — initFromSession not called?");
  return;
}
  console.log(
    `[startManualCall] userId=${userId} activeCampaignId=${activeCampaignId ?? 'none'} sipExtension=${sipExtension ?? 'none'} number=${number}`,
  );
  const startedAt = Date.now();

  // Mise à jour UI immédiate (optimistic)
  set((state) => ({
    ...state,
    agentStatus: "ringing",
    statusStartedAt: startedAt,
    qualificationPanelOpen: false,
    reminderFormOpen: false,
    appointmentFormOpen: false,
    selectedQualification: null,
    selectedQualificationId: null,
    selectedQualificationMeta: null,
    pendingQualificationNextStatus: null,
    activePause: null,
    isEndingCall: false,
    endingCallId: null,
    currentCallId: null,
    activeProspect: createUnknownManualCallProspect(number),
    callSession: {
      active: true,
      direction: "manual",
      currentNumber: number,
      activeReminderId: null,
      startedAt,
      hungUpBy: null,
      campaign: state.agentIdentity.campaign,
      queue: state.agentIdentity.group,
      backendCallId: null,
      backendContactId: null,
      backendLeadId: null,
    },
  }));

  // Appels API en parallèle
  const { workspaceApi } = await import("@/features/workspace/api/workspace.api");

  const callResult = await workspaceApi.startManualCall({
    agent_id: userId!,
    phone_number: number,
    campaign_id: activeCampaignId ?? undefined,
    agent_extension: sipExtension ?? undefined,
  }).catch((error) => {
    console.error("[startManualCall] POST /calls failed:", error);
    return null;
  });

  if (!callResult) return;

  // Stocker le call_id Backend, et le contact déjà résolu par createManualCall
  // (celui-ci garantit un Lead assigné à l'agent — ne pas refaire de recherche
  // séparée côté frontend, ça désynchroniserait le contact affiché du contact
  // réellement rattaché à l'appel/lead en base).
  const c = callResult.contact;
  useWorkspaceStore.setState((state) => ({
    activeCampaignId:
      typeof callResult.campaign_id === "number" && callResult.campaign_id > 0
        ? callResult.campaign_id
        : state.activeCampaignId,
    currentCallId: callResult.id,
    activeProspect: c
      ? {
          id: String(c.id),
          firstName: c.first_name ?? "",
          lastName: c.last_name ?? "",
          phone: c.phone ?? number,
          phoneSecondary: c.phone2 ?? "",
          email: c.email ?? "",
          address: c.address ?? "",
          postalCode: c.postal_code ?? "",
          city: c.city ?? "",
          comments: typeof c.custom_fields?.commentaires === "string"
            ? c.custom_fields.commentaires
            : "",
        }
      : state.activeProspect,
    callSession: {
      ...state.callSession,
      backendCallId: callResult.id,
      backendContactId: c?.id ?? state.callSession.backendContactId,
    },
  }));
  console.log(
    `[startManualCall] success userId=${userId} callId=${callResult.id} campaignId=${callResult.campaign_id ?? activeCampaignId ?? 'none'}`,
  );
},

  // Rejoue EXACTEMENT la même logique que startManualCall() (même endpoint
  // POST /calls, même résolution contact côté backend par phone_number) —
  // avant ce fix, cette action ne faisait que poser un état local optimiste
  // (agentStatus=ringing, activeProspect=entry.prospect) sans jamais appeler
  // le backend : callSession.backendCallId/backendContactId restaient donc
  // null indéfiniment, et un WS agent.status.changed ultérieur (le statut
  // agent réel côté backend n'avait jamais bougé) repassait agentStatus à
  // "paused"/"waiting", déclenchant l'affichage "Aucune fiche n'est chargée".
  // On préserve `direction: "reminder"` et `activeReminderId` tout du long
  // pour ne pas casser le flux de qualification RAPPEL existant.
  openReminderCall: async (entry) => {
    const startedAt = Date.now();
    const reminderId = "id" in entry ? entry.id : null;
    const campaignIdHint = "campaignId" in entry ? entry.campaignId ?? undefined : undefined;
    const leadIdHint = "leadId" in entry ? entry.leadId ?? undefined : undefined;

    set((state) => ({
      ...state,
      activeProspect: entry.prospect,
      agentStatus: "ringing",
      statusStartedAt: startedAt,
      qualificationPanelOpen: false,
      activePause: null,
      isEndingCall: false,
      endingCallId: null,
      currentCallId: null,
      callSession: {
        active: true,
        direction: "reminder",
        currentNumber: entry.phone,
        activeReminderId: reminderId,
        startedAt,
        hungUpBy: null,
        campaign: entry.campaign,
        queue: entry.queue,
        backendCallId: null,
        backendContactId: null,
        backendLeadId: null,
      },
    }));

    const { userId, activeCampaignId, sipExtension } = useWorkspaceStore.getState();
    if (!userId) {
      console.error("[openReminderCall] userId not set — initFromSession not called?");
      return;
    }

    const { workspaceApi } = await import("@/features/workspace/api/workspace.api");

    const callResult = await workspaceApi.startManualCall({
      agent_id:        userId,
      phone_number:    entry.phone,
      campaign_id:     campaignIdHint ?? activeCampaignId ?? undefined,
      lead_id:         leadIdHint,
      agent_extension: sipExtension ?? undefined,
    }).catch((error) => {
      console.error("[openReminderCall] POST /calls failed:", error);
      return null;
    });

    if (!callResult) return;

    const c = callResult.contact;
    useWorkspaceStore.setState((state) => {
      // Un raccroché/qualification très rapide peut avoir déjà quitté ce
      // rappel (direction changée) — ne pas réappliquer un vieux résultat.
      if (state.callSession.activeReminderId !== reminderId) return {};

      return {
        activeCampaignId:
          typeof callResult.campaign_id === "number" && callResult.campaign_id > 0
            ? callResult.campaign_id
            : state.activeCampaignId,
        currentCallId: callResult.id,
        activeProspect: c
          ? {
              id: String(c.id),
              firstName: c.first_name ?? "",
              lastName: c.last_name ?? "",
              phone: c.phone ?? entry.phone,
              phoneSecondary: c.phone2 ?? "",
              email: c.email ?? "",
              address: c.address ?? "",
              postalCode: c.postal_code ?? "",
              city: c.city ?? "",
              comments: typeof c.custom_fields?.commentaires === "string"
                ? c.custom_fields.commentaires
                : "",
            }
          : state.activeProspect,
        callSession: {
          ...state.callSession,
          backendCallId: callResult.id,
          backendContactId: c?.id ?? state.callSession.backendContactId,
        },
      };
    });
    console.log(
      `[openReminderCall] success userId=${userId} callId=${callResult.id} reminderId=${reminderId ?? 'none'} campaignId=${callResult.campaign_id ?? activeCampaignId ?? 'none'}`,
    );
  },

  setActiveProspect: (prospect) =>
    set((state) => ({
      ...state,
      activeProspect: prospect,
    })),

  updateProspectField: (field, value) => {
    set((state) => ({
      ...state,
      activeProspect: { ...state.activeProspect, [field]: value },
    }));
    // Le telephone n'est jamais réécrit en autosave (clé de recherche du contact,
    // un changement ici passerait par un flux dédié, pas la saisie fiche).
    if (field === "phone" || field === "id") return;
    const contactId = useWorkspaceStore.getState().callSession.backendContactId;
    if (!contactId) return;
    scheduleProspectAutosave(contactId);
  },

  markClientHungUp: () =>
    set((state) => ({
      ...state,
      ...applyStatusTransition(state, "hung_up"),
      isEndingCall: state.callSession.backendCallId ? true : state.isEndingCall,
      endingCallId: state.callSession.backendCallId ?? state.endingCallId,
      callSession: {
        ...state.callSession,
        active: false,
        hungUpBy: "client",
      },
    })),

  markAgentHungUp: () =>
    set((state) => ({
      ...state,
      ...applyStatusTransition(state, "hung_up"),
      isEndingCall: state.callSession.backendCallId ? true : state.isEndingCall,
      endingCallId: state.callSession.backendCallId ?? state.endingCallId,
      callSession: {
        ...state.callSession,
        active: false,
        hungUpBy: "agent",
      },
    })),

  // ── Actions AJOUT Backend ──────────────────────────────────────────────────

  initFromSession: async (params) => {
    const currentState = useWorkspaceStore.getState();
    if (currentState.qualificationPanelOpen || currentState.isEndingCall) {
      console.log(
        `[initFromSession] skip setPaused during qualification callId=${currentState.callSession.backendCallId ?? 'none'} campaignId=${currentState.activeCampaignId ?? 'none'}`,
      );
      set((state) => ({
        ...state,
        userId: params.userId,
        sipExtension: params.sipExtension,
        activeCampaignId: state.activeCampaignId ?? params.activeCampaignId ?? null,
        agentIdentity: {
          ...state.agentIdentity,
          fullName: `${params.firstName} ${params.lastName}`.trim(),
          firstName: params.firstName,
          lastName: params.lastName,
          campaign: params.activeCampaignName ?? state.agentIdentity.campaign,
          ...(params.role ? { role: params.role } : {}),
        },
      }));
      return;
    }

    console.log(
      `[initFromSession] userId=${params.userId} activeCampaignId=${params.activeCampaignId ?? 'none'} sipExtension=${params.sipExtension ?? 'none'}`,
    );
    console.log(`[WorkspaceAgentId] userId=${params.userId} agentId=${params.userId} statusEndpointId=me (JWT-resolved)`);

    // 1. Mettre à jour l'identité et forcer le statut local en PAUSED immédiatement
    set((state) => ({
      ...state,
      userId:       params.userId,
      sipExtension: params.sipExtension,
      activeCampaignId: state.activeCampaignId ?? params.activeCampaignId ?? null,
      agentStatus:  "paused" as AgentStatus,
      statusStartedAt: Date.now(),
      agentIdentity: {
        ...state.agentIdentity,
        fullName:  `${params.firstName} ${params.lastName}`.trim(),
        firstName: params.firstName,
        lastName:  params.lastName,
        campaign: params.activeCampaignName ?? state.agentIdentity.campaign,
        ...(params.role ? { role: params.role } : {}),
      },
    }));

    // 2. Informer le Backend que l'agent est en PAUSE dès la connexion
    //    Cela garantit que le dialer ne lui envoie aucun appel tant qu'il
    //    n'a pas cliqué "Reprendre".
    try {
      const { workspaceApi } = await import("@/features/workspace/api/workspace.api");
      await workspaceApi.setPaused(params.userId);
    } catch (err) {
      console.error("[initFromSession] setPaused failed:", err);
      // Non bloquant : le statut UI reste PAUSED localement
    }
  },

  fetchHistory: async (date) => {
    const { userId } = useWorkspaceStore.getState();
    // Même garde que fetchAppointments — sans token valide (ex: juste après
    // logout, où userId reste en mémoire dans ce store), ne pas appeler l'API.
    if (!userId || !hasValidAuthToken()) return;
    try {
      const { workspaceApi } = await import("@/features/workspace/api/workspace.api");
      const entries = await workspaceApi.getAgentHistory(userId, date);
      set({ historyEntries: entries });
    } catch (err: any) {
      // 401 après logout (race entre le clear des tokens et un fetch déjà en
      // vol) est attendu et non-bloquant — pas la peine de bruiter la console.
      // Toute autre erreur (agent bien connecté) reste loggée normalement.
      if (err?.response?.status === 401 && !hasValidAuthToken()) {
        return;
      }
      console.error("[fetchHistory] failed:", err);
    }
  },

  fetchAppointments: async (date?) => {
    const { userId } = useWorkspaceStore.getState();
    if (!userId || !hasValidAuthToken()) return;
    try {
      const { workspaceApi } = await import("@/features/workspace/api/workspace.api");
      const entries = await workspaceApi.getAgentAppointments(userId, date);
      set({ appointments: entries });
    } catch (err: any) {
      // Logout survenu pendant la requête en vol → 401 attendu, pas une erreur à logger
      if (err?.response?.status === 401) return;
      console.error("[fetchAppointments] failed:", err);
    }
  },

  fetchReminders: async () => {
    const { userId } = useWorkspaceStore.getState();
    if (!userId || !hasValidAuthToken()) {
      console.log(`[fetchReminders] skipped — userId=${userId ?? 'null'} hasValidAuthToken=${hasValidAuthToken()}`);
      return;
    }
    try {
      const { workspaceApi } = await import("@/features/workspace/api/workspace.api");
      const entries = await workspaceApi.getReminders(userId);
      console.log(
        `[fetchReminders] userId=${userId} got ${entries.length} reminder(s) — statuses=${entries.map((e) => e.status).join(',') || 'none'}`,
      );
      set({ reminders: entries });
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      console.error("[fetchReminders] failed:", err);
    }
  },

  pushDueReminderToast: (toast) =>
    set((state) => ({
      dueReminderToasts: [...state.dueReminderToasts, toast],
    })),

  dismissDueReminderToast: (id) =>
    set((state) => ({
      dueReminderToasts: state.dueReminderToasts.filter((t) => t.id !== id),
    })),

  dismissAppointmentError: () => set({ appointmentError: null }),

  fetchDailyStats: async () => {
    const { userId } = useWorkspaceStore.getState();
    if (!userId) return;
    try {
      const { workspaceApi } = await import("@/features/workspace/api/workspace.api");
      const stats = await workspaceApi.getDailyStats(userId);
      set({
        dailyStatsCache: {
          communication_seconds: stats.communication_seconds,
          qualification_seconds: stats.qualification_seconds,
          attente_seconds:       stats.attente_seconds,
          pause_seconds:         stats.pause_seconds,
          total_seconds:         stats.total_seconds,
          appointments_today:    stats.appointments_today,
          calls_today:           stats.calls_today,
          lastSyncAt:            Date.now(),
        },
      });
    } catch (err) {
      console.error("[fetchDailyStats] failed:", err);
    }
  },

  setAgentStatusFromWS: (status) =>
  set((state) => {
    // Ignorer AVAILABLE/waiting si l'agent a explicitement choisi la pause
    if (status === "waiting" && state.agentStatus === "paused") return state;
    if (
      state.qualificationPanelOpen &&
      (status === "waiting" || status === "paused")
    ) {
      console.log(
        `[setAgentStatusFromWS] ignored status=${status} because qualificationPanelOpen=true callId=${state.callSession.backendCallId ?? 'none'}`,
      );
      return state;
    }
    return {
      ...state,
      agentStatus: status,
      statusStartedAt: Date.now(),
    };
  }),

}));
