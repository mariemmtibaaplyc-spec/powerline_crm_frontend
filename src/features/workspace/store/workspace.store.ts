import { create } from "zustand";
import {
  MOCK_AGENT_IDENTITY,
  PAUSE_OPTIONS,
} from "@/features/workspace/mocks/agent.mock";
import { createMockHistory } from "@/features/workspace/mocks/history.mock";
import {
  formatInputDate,
  prospectFullName,
} from "@/features/workspace/mocks/mock.utils";
import {
  createUnknownManualCallProspect,
  DEFAULT_AGENT_PROSPECT,
  findMockProspectByPhone,
} from "@/features/workspace/mocks/prospects.mock";
import { findQualificationOption } from "@/features/workspace/mocks/qualifications.mock";
import { createMockReminders } from "@/features/workspace/mocks/reminders.mock";
import type {
  ActivePause,
  AgentIdentity,
  AgentStatus,
  AppointmentEntry,
  AppointmentFormValues,
  CallSession,
  HistoryEntry,
  HistoryStatus,
  PauseType,
  ProspectSheet,
  QualificationRecord,
  QualificationCode,
  Reminder,
  ReminderFormValues,
} from "@/types/workspace.types";

interface AgentWorkspaceStoreState {
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
  selectPauseType: (pauseCode: PauseType["code"]) => void;
  setAgentStatus: (status: AgentStatus) => void;
  resumeQueue: () => void;
  startPause: (pauseCode?: PauseType["code"]) => void;
  endPause: () => void;
  openQualification: () => void;
  closeQualification: (nextStatus?: "paused" | "waiting") => void;
  cancelReminderForm: () => void;
  submitReminderQualification: (values: ReminderFormValues) => void;
  cancelAppointmentForm: () => void;
  submitAppointmentQualification: (values: AppointmentFormValues) => void;
  selectQualification: (code: QualificationCode | null) => void;
  startManualCall: (number: string) => void;
  openReminderCall: (entry: Reminder | HistoryEntry) => void;
  setActiveProspect: (prospect: ProspectSheet) => void;
  markClientHungUp: () => void;
  markAgentHungUp: () => void;
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
    activeProspect: DEFAULT_AGENT_PROSPECT,
    callSession: {
      active: false,
      direction: null,
      currentNumber: null,
      activeReminderId: null,
      startedAt: null,
      hungUpBy: null,
      campaign: null,
      queue: null,
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
    historyEntries: createMockHistory(today),
  };
}

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

function formatHistoryTime(date: Date) {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapQualificationToHistoryStatus(code: QualificationCode): HistoryStatus {
  switch (code) {
    case "callback":
      return "follow_up";
    case "appointment":
      return "appointment";
    case "wrong_number":
    case "disconnected_number":
    case "no_answer":
    case "busy":
      return "unreachable";
    case "do_not_call":
    case "not_interested":
    case "no_budget":
    case "sale_refused":
      return "refused";
    case "voicemail":
      return "voicemail";
    default:
      return "completed";
  }
}

function createQualificationSummary(
  code: QualificationCode,
  label: string,
  nextStatus: "paused" | "waiting",
  reminderDetails?: ReminderFormValues,
  appointmentDetails?: AppointmentFormValues,
) {
  const closeout =
    nextStatus === "paused"
      ? "L'agent passe ensuite en pause."
      : "L'agent retourne ensuite en attente.";

  switch (code) {
    case "callback":
      return `Rappel programme le ${reminderDetails?.date ?? "--"} a ${reminderDetails?.time ?? "--"}${reminderDetails?.note ? ` pour ${reminderDetails.note.toLowerCase()}` : ""}. ${closeout}`;
    case "appointment":
      return `RDV programme le ${appointmentDetails?.date ?? "--"} a ${appointmentDetails?.time ?? "--"}${appointmentDetails?.note ? ` pour ${appointmentDetails.note.toLowerCase()}` : ""}. ${closeout}`;
    case "do_not_call":
      return `Demande ${label.toLowerCase()} enregistree sur la fiche active. ${closeout}`;
    case "call_transferred":
      return `Issue ${label.toLowerCase()} enregistree apres cloture de l'appel. ${closeout}`;
    case "voicemail":
      return `Issue ${label.toLowerCase()} enregistree sans nouvel echange. ${closeout}`;
    default:
      return `Qualification ${label.toLowerCase()} enregistree dans l'historique. ${closeout}`;
  }
}

function createQualificationHistoryEntry(
  state: AgentWorkspaceStoreState,
  record: QualificationRecord,
  recordedAt: Date,
  reminderDetails?: ReminderFormValues,
  appointmentDetails?: AppointmentFormValues,
): HistoryEntry {
  return {
    id: `history-${record.recordedAt}`,
    date: formatInputDate(recordedAt),
    time: formatHistoryTime(recordedAt),
    clientName: prospectFullName(state.activeProspect),
    phone: state.callSession.currentNumber ?? state.activeProspect.phone,
    campaign: state.callSession.campaign ?? state.agentIdentity.campaign,
    queue: state.callSession.queue ?? state.agentIdentity.group,
    result: record.label,
    summary: createQualificationSummary(
      record.code,
      record.label,
      record.nextStatus,
      reminderDetails,
      appointmentDetails,
    ),
    status: mapQualificationToHistoryStatus(record.code),
    prospect: state.activeProspect,
    qualificationCode: record.code,
    qualificationLabel: record.label,
  };
}

function createQualificationReminder(
  state: AgentWorkspaceStoreState,
  record: QualificationRecord,
  reminderId: string,
  values: ReminderFormValues,
): Reminder {
  return {
    id: reminderId,
    date: values.date,
    time: values.time,
    clientName: prospectFullName(state.activeProspect),
    phone: state.callSession.currentNumber ?? state.activeProspect.phone,
    campaign: state.callSession.campaign ?? state.agentIdentity.campaign,
    queue: state.callSession.queue ?? state.agentIdentity.group,
    note: values.note,
    status: "planned",
    prospect: state.activeProspect,
  };
}

function createQualificationAppointment(
  state: AgentWorkspaceStoreState,
  record: QualificationRecord,
  appointmentId: string,
  values: AppointmentFormValues,
): AppointmentEntry {
  return {
    id: appointmentId,
    date: values.date,
    time: values.time,
    clientName: prospectFullName(state.activeProspect),
    phone: state.callSession.currentNumber ?? state.activeProspect.phone,
    campaign: state.callSession.campaign ?? state.agentIdentity.campaign,
    queue: state.callSession.queue ?? state.agentIdentity.group,
    note: values.note,
    prospect: state.activeProspect,
  };
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

export const useWorkspaceStore = create<AgentWorkspaceStoreState>((set) => ({
  ...createInitialState(),

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

  resumeQueue: () =>
    set((state) => ({
      ...state,
      ...applyStatusTransition(state, "waiting"),
      activePause: null,
    })),

  startPause: (pauseCode) =>
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
    }),

  endPause: () =>
    set((state) => ({
      ...state,
      ...applyStatusTransition(state, "paused"),
      activePause: null,
    })),

  openQualification: () =>
    set((state) => ({
      ...state,
      ...applyStatusTransition(state, "qualification"),
      qualificationPanelOpen: true,
      reminderFormOpen: false,
      appointmentFormOpen: false,
      selectedQualification: null,
      pendingQualificationNextStatus: null,
    })),

  closeQualification: (nextStatus = "waiting") =>
    set((state) => {
      const selectedOption = findQualificationOption(state.selectedQualification);

      if (!selectedOption) {
        return state;
      }

      const recordedAt = new Date();
      const record: QualificationRecord = {
        code: selectedOption.code,
        label: selectedOption.label,
        recordedAt: recordedAt.getTime(),
        nextStatus,
      };

      if (record.code === "callback") {
        return {
          ...state,
          reminderFormOpen: true,
          appointmentFormOpen: false,
          pendingQualificationNextStatus: nextStatus,
          lastQualification: record,
        };
      }

      if (record.code === "appointment") {
        return {
          ...state,
          reminderFormOpen: false,
          appointmentFormOpen: true,
          pendingQualificationNextStatus: nextStatus,
          lastQualification: record,
        };
      }

      const historyEntry = createQualificationHistoryEntry(state, record, recordedAt);

      return {
        ...state,
        ...applyStatusTransition(state, nextStatus),
        qualificationPanelOpen: false,
        reminderFormOpen: false,
        appointmentFormOpen: false,
        selectedQualification: null,
        lastQualification: record,
        pendingQualificationNextStatus: null,
        appointments: state.appointments,
        reminders: state.reminders,
        historyEntries: [historyEntry, ...state.historyEntries],
        activePause:
          nextStatus === "paused"
            ? {
                type: resolvePauseType(state.selectedPauseTypeCode),
                startedAt: Date.now(),
              }
            : null,
        callSession: {
          active: false,
          direction: null,
          currentNumber: null,
          activeReminderId: null,
          startedAt: null,
          hungUpBy: null,
          campaign: null,
          queue: null,
        },
      };
    }),

  cancelReminderForm: () =>
    set((state) => ({
      ...state,
      reminderFormOpen: false,
      pendingQualificationNextStatus: null,
    })),

  submitReminderQualification: (values) =>
    set((state) => {
      const selectedOption = findQualificationOption(state.selectedQualification);
      const nextStatus = state.pendingQualificationNextStatus ?? "waiting";

      if (!selectedOption || selectedOption.code !== "callback") {
        return state;
      }

      const trimmedNote = values.note.trim();
      if (!values.date || !values.time || !trimmedNote) {
        return state;
      }

      const recordedAt = new Date();
      const record: QualificationRecord = {
        code: selectedOption.code,
        label: selectedOption.label,
        recordedAt: recordedAt.getTime(),
        nextStatus,
      };
      const normalizedValues: ReminderFormValues = {
        date: values.date,
        time: values.time,
        note: trimmedNote,
      };
      const reminder = createQualificationReminder(
        state,
        record,
        `callback-generated-${record.recordedAt}`,
        normalizedValues,
      );
      const historyEntry = createQualificationHistoryEntry(
        state,
        record,
        recordedAt,
        normalizedValues,
      );

      return {
        ...state,
        ...applyStatusTransition(state, nextStatus),
        qualificationPanelOpen: false,
        reminderFormOpen: false,
        appointmentFormOpen: false,
        latestReminderFocusDate: normalizedValues.date,
        selectedQualification: null,
        lastQualification: record,
        pendingQualificationNextStatus: null,
        appointments: state.appointments,
        reminders: [reminder, ...state.reminders],
        historyEntries: [historyEntry, ...state.historyEntries],
        activePause:
          nextStatus === "paused"
            ? {
                type: resolvePauseType(state.selectedPauseTypeCode),
                startedAt: Date.now(),
              }
            : null,
        callSession: {
          active: false,
          direction: null,
          currentNumber: null,
          activeReminderId: null,
          startedAt: null,
          hungUpBy: null,
          campaign: null,
          queue: null,
        },
      };
    }),

  cancelAppointmentForm: () =>
    set((state) => ({
      ...state,
      appointmentFormOpen: false,
      pendingQualificationNextStatus: null,
    })),

  submitAppointmentQualification: (values) =>
    set((state) => {
      const selectedOption = findQualificationOption(state.selectedQualification);
      const nextStatus = "waiting";

      if (!selectedOption || selectedOption.code !== "appointment") {
        return state;
      }

      const trimmedNote = values.note.trim();
      if (!values.date || !values.time || !trimmedNote) {
        return state;
      }

      const recordedAt = new Date();
      const record: QualificationRecord = {
        code: selectedOption.code,
        label: selectedOption.label,
        recordedAt: recordedAt.getTime(),
        nextStatus,
      };
      const normalizedValues: AppointmentFormValues = {
        date: values.date,
        time: values.time,
        note: trimmedNote,
      };
      const appointment = createQualificationAppointment(
        state,
        record,
        `appointment-generated-${record.recordedAt}`,
        normalizedValues,
      );
      const historyEntry = createQualificationHistoryEntry(
        state,
        record,
        recordedAt,
        undefined,
        normalizedValues,
      );

      return {
        ...state,
        ...applyStatusTransition(state, nextStatus),
        qualificationPanelOpen: false,
        reminderFormOpen: false,
        appointmentFormOpen: false,
        latestAppointmentFocusDate: normalizedValues.date,
        selectedQualification: null,
        lastQualification: record,
        pendingQualificationNextStatus: null,
        appointments: [appointment, ...state.appointments],
        reminders: state.reminders,
        historyEntries: [historyEntry, ...state.historyEntries],
        activePause: null,
        callSession: {
          active: false,
          direction: null,
          currentNumber: null,
          activeReminderId: null,
          startedAt: null,
          hungUpBy: null,
          campaign: null,
          queue: null,
        },
      };
    }),

  selectQualification: (code) =>
    set((state) => {
      const selectedOption = findQualificationOption(code);
      const selectedCode = selectedOption?.code ?? null;

      if (selectedCode === "callback") {
        return {
          ...state,
          selectedQualification: selectedCode,
          reminderFormOpen: true,
          appointmentFormOpen: false,
          pendingQualificationNextStatus:
            state.pendingQualificationNextStatus ?? "waiting",
        };
      }

      if (selectedCode === "appointment") {
        return {
          ...state,
          selectedQualification: selectedCode,
          reminderFormOpen: false,
          appointmentFormOpen: true,
          pendingQualificationNextStatus: "waiting",
        };
      }

      return {
        ...state,
        selectedQualification: selectedCode,
        reminderFormOpen: false,
        appointmentFormOpen: false,
        pendingQualificationNextStatus: null,
      };
    }),

  startManualCall: (number) =>
    set((state) => {
      const matchedProspect = findMockProspectByPhone(number);
      const startedAt = Date.now();

      return {
        ...state,
        activeProspect:
          matchedProspect ?? createUnknownManualCallProspect(number),
        agentStatus: "ringing",
        statusStartedAt: startedAt,
        qualificationPanelOpen: false,
        activePause: null,
        callSession: {
          active: true,
          direction: "manual",
          currentNumber: number,
          activeReminderId: null,
          startedAt,
          hungUpBy: null,
          campaign: state.agentIdentity.campaign,
          queue: state.agentIdentity.group,
        },
      };
    }),

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
        callSession: {
          active: true,
          direction: "reminder",
          currentNumber: entry.phone,
          activeReminderId: entry.id,
          startedAt,
          hungUpBy: null,
          campaign: entry.campaign,
          queue: entry.queue,
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
      callSession: {
        ...state.callSession,
        active: false,
        hungUpBy: "agent",
      },
    })),
}));
