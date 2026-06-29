import { create } from "zustand";
import {
  MOCK_AGENT_IDENTITY,
  PAUSE_OPTIONS,
} from "@/features/workspace/mocks/agent.mock";
import { formatInputDate } from "@/features/workspace/mocks/mock.utils";
import { createUnknownManualCallProspect } from "@/features/workspace/mocks/prospects.mock";
import { createMockReminders } from "@/features/workspace/mocks/reminders.mock";
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
  latestAppointmentFocusDate: string | null;
  selectedQualification: QualificationCode | null;
  lastQualification: QualificationRecord | null;
  pendingQualificationNextStatus: "paused" | "waiting" | null;
  appointments: AppointmentEntry[];
  reminders: Reminder[];
  historyEntries: HistoryEntry[];

  // ── State AJOUT Backend ───────────────────────────────────────────────────
  appointmentError: string | null; // null = pas d'erreur, string = message à afficher dans la modale
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
  markClientHungUp: () => void;
  markAgentHungUp: () => void;

  fetchHistory: (date: string) => Promise<void>;
  fetchAppointments: (date?: string) => Promise<void>;
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
    latestAppointmentFocusDate: null as string | null,
    selectedQualification: null as QualificationCode | null,
    lastQualification: null as QualificationRecord | null,
    pendingQualificationNextStatus: null as "paused" | "waiting" | null,
    appointments: [] as AppointmentEntry[],
    reminders: createMockReminders(today),
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

  if (!callId) {
    // Pas de call Backend (test/mock) → comportement local uniquement
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
    });
  } catch (err) {
    console.error("[closeQualification] endCall failed:", err);
  }

  // Signaler le statut au backend (FIX: setAvailable pour "waiting" — évite blocage WRAP_UP)
  if (userId) {
    if (nextStatus === "paused") {
      workspaceApi.setPaused(userId).catch(console.error);
    } else {
      workspaceApi.setAvailable(userId).catch(console.error);
    }
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
      const response = await workspaceApi.endCall(callId, {
        qualification_id: selectedQualificationId ?? undefined,
        appointment: {
          scheduled_at: `${values.date}T${values.time}:00`,
          notes: values.note,
        },
      });

      if (response.appointment_error) {
        appointmentFailed = true;
        set({ appointmentError: "Le rappel n'a pas pu être créé. Vérifiez que l'appel est associé à un contact, ou continuez sans rappel." });
      } else if (response.appointment) {
        useWorkspaceStore.getState().fetchAppointments(values.date).catch(() => {});
      }
    } catch (err) {
      console.error("[submitReminderQualification] endCall failed:", err);
      appointmentFailed = true;
      set({ appointmentError: "Le rappel n'a pas pu être créé. Vérifiez les informations de l'appel." });
    }

    if (appointmentFailed) return;

    if (userId) {
      if (nextStatus === "paused") {
        workspaceApi.setPaused(userId).catch(console.error);
      } else {
        workspaceApi.setAvailable(userId).catch(console.error);
      }
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
      }
    } catch (err) {
      console.error("[submitAppointmentQualification] endCall failed:", err);
      appointmentFailed = true;
      set({ appointmentError: "Le RDV n'a pas pu être créé. Vérifiez les informations de l'appel." });
    }

    // Si le RDV a échoué, garder la modale ouverte pour que l'agent voie l'erreur
    if (appointmentFailed) return;

    if (userId) {
      if (nextStatus === "paused") {
        workspaceApi.setPaused(userId).catch(console.error);
      } else {
        workspaceApi.setAvailable(userId).catch(console.error);
      }
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

  const [callResult, contacts] = await Promise.allSettled([
    workspaceApi.startManualCall({
      agent_id: userId!,
      phone_number: number,
      campaign_id: activeCampaignId ?? undefined,
      agent_extension: sipExtension ?? undefined,
    }),
    workspaceApi.searchContactByPhone(number, activeCampaignId ?? undefined),
  ]);

  // Stocker le call_id Backend
  if (callResult.status === "fulfilled") {
    useWorkspaceStore.setState((state) => ({
      activeCampaignId:
        typeof callResult.value.campaign_id === "number" && callResult.value.campaign_id > 0
          ? callResult.value.campaign_id
          : state.activeCampaignId,
      currentCallId: callResult.value.id,
      callSession: {
        ...state.callSession,
        backendCallId: callResult.value.id,
      },
    }));
    console.log(
      `[startManualCall] success userId=${userId} callId=${callResult.value.id} campaignId=${callResult.value.campaign_id ?? activeCampaignId ?? 'none'}`,
    );
  } else {
    console.error("[startManualCall] POST /calls failed:", callResult.reason);
  }

  // Remplir la fiche si contact trouvé
  if (contacts.status === "fulfilled" && contacts.value.length > 0) {
    const c = contacts.value[0];
    useWorkspaceStore.setState({
      activeProspect: {
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
      },
    });
  }
},

  openReminderCall: (entry) =>
    set((state) => {
      const startedAt = Date.now();

      return {
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
          activeReminderId: entry.id,
          startedAt,
          hungUpBy: null,
          campaign: entry.campaign,
          queue: entry.queue,
          backendCallId: null,
          backendContactId: null,
          backendLeadId: null,
        },
      };
    }),

  setActiveProspect: (prospect) =>
    set((state) => ({
      ...state,
      activeProspect: prospect,
    })),

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
    if (!userId) return;
    try {
      const { workspaceApi } = await import("@/features/workspace/api/workspace.api");
      const entries = await workspaceApi.getAgentHistory(userId, date);
      set({ historyEntries: entries });
    } catch (err) {
      console.error("[fetchHistory] failed:", err);
    }
  },

  fetchAppointments: async (date?) => {
    const { userId } = useWorkspaceStore.getState();
    if (!userId) return;
    try {
      const { workspaceApi } = await import("@/features/workspace/api/workspace.api");
      const entries = await workspaceApi.getAgentAppointments(userId, date);
      set({ appointments: entries });
    } catch (err) {
      console.error("[fetchAppointments] failed:", err);
    }
  },

  dismissAppointmentError: () => set({ appointmentError: null }),

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
