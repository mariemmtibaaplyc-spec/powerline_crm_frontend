import axios from "axios";
import { apiClient } from "@/lib/axios";
import type {
  ReportingAgentPerformanceData,
  ReportingAgentPerformanceResponse,
  ReportingAgentsProductivityData,
  ReportingAgentsProductivityParams,
  ReportingAgentsProductivityResponse,
  ReportingAppointmentsPerAgentData,
  ReportingAppointmentsPerAgentResponse,
  ReportingContactReachabilityData,
  ReportingProductionEvolutionParams,
  ReportingProductionEvolutionPoint,
  ReportingCallsOverviewData,
  ReportingCallsOverviewResponse,
  ReportingCallsPerAgentData,
  ReportingCallsPerAgentHourlyData,
  ReportingCallsPerAgentHourlyResponse,
  ReportingCallsPerAgentResponse,
  ReportingDashboardData,
  ReportingDashboardParams,
  ReportingPauseReportsData,
  ReportingPauseReportsResponse,
  ReportingQualificationStatusItem,
  ReportingQualificationsByAgentData,
  ReportingQualificationsByAgentResponse,
  ReportingSalesPerAgentData,
  ReportingSalesPerAgentResponse,
  ReportingSessionsHistoryData,
  ReportingSessionsHistoryResponse,
  ReportingValue,
} from "@/types/reporting.types";

type BackendReportingDashboardResponse =
  | ReportingDashboardData
  | {
      data?: ReportingDashboardData;
    };

type BackendReportingContactReachabilityResponse =
  | ReportingContactReachabilityData
  | {
      data?: ReportingContactReachabilityData;
    };

type BackendReportingProductionEvolutionResponse =
  | ReportingProductionEvolutionPoint[]
  | {
      data?: ReportingProductionEvolutionPoint[];
    };

type BackendReportingQualificationsStatusResponse =
  | ReportingQualificationStatusItem[]
  | {
      data?: ReportingQualificationStatusItem[];
    };

type BackendReportingAgentsProductivityResponse =
  | ReportingAgentsProductivityResponse
  | {
      data?: ReportingAgentsProductivityResponse;
    };

type BackendReportingCallsOverviewResponse =
  | ReportingCallsOverviewResponse
  | {
      data?: ReportingCallsOverviewResponse;
    };

type BackendReportingCallsPerAgentResponse =
  | ReportingCallsPerAgentResponse
  | {
      data?: ReportingCallsPerAgentResponse;
    };

type BackendReportingCallsPerAgentHourlyResponse =
  | ReportingCallsPerAgentHourlyResponse
  | {
      data?: ReportingCallsPerAgentHourlyResponse;
    };

type BackendReportingAgentPerformanceResponse =
  | ReportingAgentPerformanceResponse
  | {
      data?: ReportingAgentPerformanceResponse;
    };

type BackendReportingSalesPerAgentResponse =
  | ReportingSalesPerAgentResponse
  | {
      data?: ReportingSalesPerAgentResponse;
    };

type BackendReportingAppointmentsPerAgentResponse =
  | ReportingAppointmentsPerAgentResponse
  | {
      data?: ReportingAppointmentsPerAgentResponse;
    };

type BackendReportingPauseReportsResponse =
  | ReportingPauseReportsResponse
  | {
      data?: ReportingPauseReportsResponse;
    };

type BackendReportingSessionsHistoryResponse =
  | ReportingSessionsHistoryResponse
  | {
      data?: ReportingSessionsHistoryResponse;
    };

type BackendReportingQualificationsByAgentResponse =
  | ReportingQualificationsByAgentResponse
  | {
      data?: ReportingQualificationsByAgentResponse;
    };

function sanitizeDashboardParams(params: ReportingDashboardParams) {
  return Object.fromEntries(
    Object.entries(params).filter((entry): entry is [string, string] => {
      const value = entry[1];
      return typeof value === "string" && value.trim().length > 0;
    }),
  );
}

function extractDashboardData(
  response: BackendReportingDashboardResponse,
): ReportingDashboardData {
  if (
    "data" in response &&
    response.data &&
    typeof response.data === "object" &&
    !Array.isArray(response.data)
  ) {
    return response.data;
  }

  return response as ReportingDashboardData;
}

function extractContactReachabilityData(
  response: BackendReportingContactReachabilityResponse,
): ReportingContactReachabilityData {
  if (
    "data" in response &&
    response.data &&
    typeof response.data === "object" &&
    !Array.isArray(response.data)
  ) {
    return response.data;
  }

  return response as ReportingContactReachabilityData;
}

function extractProductionEvolutionData(
  response: BackendReportingProductionEvolutionResponse,
): ReportingProductionEvolutionPoint[] {
  if (Array.isArray(response)) {
    return response;
  }

  if ("data" in response && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
}

function extractQualificationsStatusData(
  response: BackendReportingQualificationsStatusResponse,
): ReportingQualificationStatusItem[] {
  if (Array.isArray(response)) {
    return response;
  }

  if ("data" in response && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
}

function extractAgentsProductivityData(
  response: BackendReportingAgentsProductivityResponse,
): ReportingAgentsProductivityData {
  if (Array.isArray(response)) {
    return { rows: response as ReportingValue[] };
  }

  if (
    "data" in response &&
    response.data !== undefined
  ) {
    if (Array.isArray(response.data)) {
      return { rows: response.data as ReportingValue[] };
    }

    if (response.data && typeof response.data === "object") {
      return response.data as ReportingAgentsProductivityData;
    }
  }

  return response as ReportingAgentsProductivityData;
}

function extractCallsOverviewData(
  response: BackendReportingCallsOverviewResponse,
): ReportingCallsOverviewData {
  if (Array.isArray(response)) {
    return { data: response as ReportingValue[] };
  }

  if ("data" in response && response.data !== undefined) {
    if (Array.isArray(response.data)) {
      return { data: response.data as ReportingValue[] };
    }

    if (response.data && typeof response.data === "object") {
      return response.data as ReportingCallsOverviewData;
    }
  }

  return response as ReportingCallsOverviewData;
}

function extractCallsPerAgentData(
  response: BackendReportingCallsPerAgentResponse,
): ReportingCallsPerAgentData {
  if (Array.isArray(response)) {
    return { rows: response as ReportingValue[] };
  }

  if ("data" in response && response.data !== undefined) {
    if (Array.isArray(response.data)) {
      return { rows: response.data as ReportingValue[] };
    }

    if (response.data && typeof response.data === "object") {
      return response.data as ReportingCallsPerAgentData;
    }
  }

  return response as ReportingCallsPerAgentData;
}

function extractCallsPerAgentHourlyData(
  response: BackendReportingCallsPerAgentHourlyResponse,
): ReportingCallsPerAgentHourlyData {
  if (Array.isArray(response)) {
    return { rows: response as ReportingValue[] };
  }

  if ("data" in response && response.data !== undefined) {
    if (Array.isArray(response.data)) {
      return { rows: response.data as ReportingValue[] };
    }

    if (response.data && typeof response.data === "object") {
      return response.data as ReportingCallsPerAgentHourlyData;
    }
  }

  return response as ReportingCallsPerAgentHourlyData;
}

function extractAgentPerformanceData(
  response: BackendReportingAgentPerformanceResponse,
): ReportingAgentPerformanceData {
  if (Array.isArray(response)) {
    return { rows: response as ReportingValue[] };
  }

  if ("data" in response && response.data !== undefined) {
    if (Array.isArray(response.data)) {
      return { rows: response.data as ReportingValue[] };
    }

    if (response.data && typeof response.data === "object") {
      return response.data as ReportingAgentPerformanceData;
    }
  }

  return response as ReportingAgentPerformanceData;
}

function extractSalesPerAgentData(
  response: BackendReportingSalesPerAgentResponse,
): ReportingSalesPerAgentData {
  if (Array.isArray(response)) {
    return { rows: response as ReportingValue[] };
  }

  if ("data" in response && response.data !== undefined) {
    if (Array.isArray(response.data)) {
      return { rows: response.data as ReportingValue[] };
    }

    if (response.data && typeof response.data === "object") {
      return response.data as ReportingSalesPerAgentData;
    }
  }

  return response as ReportingSalesPerAgentData;
}

function extractAppointmentsPerAgentData(
  response: BackendReportingAppointmentsPerAgentResponse,
): ReportingAppointmentsPerAgentData {
  if (Array.isArray(response)) {
    return { rows: response as ReportingValue[] };
  }

  if ("data" in response && response.data !== undefined) {
    if (Array.isArray(response.data)) {
      return { rows: response.data as ReportingValue[] };
    }

    if (response.data && typeof response.data === "object") {
      return response.data as ReportingAppointmentsPerAgentData;
    }
  }

  return response as ReportingAppointmentsPerAgentData;
}

function extractPauseReportsData(
  response: BackendReportingPauseReportsResponse,
): ReportingPauseReportsData {
  if (Array.isArray(response)) {
    return { rows: response as ReportingValue[] };
  }

  if ("data" in response && response.data !== undefined) {
    if (Array.isArray(response.data)) {
      return { rows: response.data as ReportingValue[] };
    }

    if (response.data && typeof response.data === "object") {
      return response.data as ReportingPauseReportsData;
    }
  }

  return response as ReportingPauseReportsData;
}

function extractSessionsHistoryData(
  response: BackendReportingSessionsHistoryResponse,
): ReportingSessionsHistoryData {
  if (Array.isArray(response)) {
    return { rows: response as ReportingValue[] };
  }

  if ("data" in response && response.data !== undefined) {
    if (Array.isArray(response.data)) {
      return { rows: response.data as ReportingValue[] };
    }

    if (response.data && typeof response.data === "object") {
      return response.data as ReportingSessionsHistoryData;
    }
  }

  return response as ReportingSessionsHistoryData;
}

function extractQualificationsByAgentData(
  response: BackendReportingQualificationsByAgentResponse,
): ReportingQualificationsByAgentData {
  if (Array.isArray(response)) {
    return { rows: response as ReportingValue[] };
  }

  if ("data" in response && response.data !== undefined) {
    if (Array.isArray(response.data)) {
      return { rows: response.data as ReportingValue[] };
    }

    if (response.data && typeof response.data === "object") {
      return response.data as ReportingQualificationsByAgentData;
    }
  }

  return response as ReportingQualificationsByAgentData;
}

function toReportingError(error: unknown, fallbackMessage: string) {
  if (!axios.isAxiosError(error)) {
    return new Error(fallbackMessage);
  }

  const responseData = error.response?.data;
  const apiMessage =
    typeof responseData === "object" &&
    responseData !== null &&
    "message" in responseData
      ? responseData.message
      : null;

  return new Error(
    typeof apiMessage === "string" && apiMessage.trim()
      ? apiMessage
      : Array.isArray(apiMessage) && typeof apiMessage[0] === "string"
        ? apiMessage[0]
        : fallbackMessage,
  );
}

export const reportingApi = {
  async getReportingDashboard(
    params: ReportingDashboardParams = {},
  ): Promise<ReportingDashboardData> {
    try {
      const { data } = await apiClient.get<BackendReportingDashboardResponse>(
        "/reporting/dashboard",
        {
          params: sanitizeDashboardParams(params),
        },
      );

      return extractDashboardData(data);
    } catch (error) {
      throw toReportingError(
        error,
        "Impossible de charger le dashboard reporting pour le moment.",
      );
    }
  },

  async getContactReachability(
    params: ReportingDashboardParams = {},
  ): Promise<ReportingContactReachabilityData> {
    try {
      const { data } = await apiClient.get<BackendReportingContactReachabilityResponse>(
        "/reporting/contact-reachability",
        {
          params: sanitizeDashboardParams(params),
        },
      );

      return extractContactReachabilityData(data);
    } catch (error) {
      throw toReportingError(
        error,
        "Impossible de charger la joignabilite des contacts pour le moment.",
      );
    }
  },

  async getProductionEvolution(
    params: ReportingProductionEvolutionParams = {},
  ): Promise<ReportingProductionEvolutionPoint[]> {
    try {
      const { data } = await apiClient.get<BackendReportingProductionEvolutionResponse>(
        "/reporting/production-evolution",
        {
          params: sanitizeDashboardParams(params),
        },
      );

      return extractProductionEvolutionData(data);
    } catch (error) {
      throw toReportingError(
        error,
        "Impossible de charger l'evolution de la production pour le moment.",
      );
    }
  },

  async getQualificationsStatus(
    params: ReportingDashboardParams = {},
  ): Promise<ReportingQualificationStatusItem[]> {
    try {
      const { data } = await apiClient.get<BackendReportingQualificationsStatusResponse>(
        "/reporting/qualifications-status",
        {
          params: sanitizeDashboardParams(params),
        },
      );

      return extractQualificationsStatusData(data);
    } catch (error) {
      throw toReportingError(
        error,
        "Impossible de charger l'etat des qualifications pour le moment.",
      );
    }
  },

  async getAgentsProductivity(
    params: ReportingAgentsProductivityParams = {},
  ): Promise<ReportingAgentsProductivityData> {
    try {
      const response = await apiClient.get<BackendReportingAgentsProductivityResponse>(
        "/reporting/agents-performance",
        {
          params: sanitizeDashboardParams(params),
        },
      );

      console.debug("agents-performance response", response.data);

      return extractAgentsProductivityData(response.data);
    } catch (error) {
      throw toReportingError(
        error,
        "Impossible de charger la productivite des agents pour le moment.",
      );
    }
  },

  async getCallsOverview(
    params: ReportingDashboardParams = {},
  ): Promise<ReportingCallsOverviewData> {
    try {
      const response = await apiClient.get<BackendReportingCallsOverviewResponse>(
        "/reporting/calls/overview",
        {
          params: sanitizeDashboardParams(params),
        },
      );

      return extractCallsOverviewData(response.data);
    } catch (error) {
      throw toReportingError(
        error,
        "Impossible de charger la vue d'ensemble des appels pour le moment.",
      );
    }
  },

  async getCallsPerAgent(
    params: ReportingDashboardParams = {},
  ): Promise<ReportingCallsPerAgentData> {
    try {
      const response = await apiClient.get<BackendReportingCallsPerAgentResponse>(
        "/reporting/calls/per-agent",
        {
          params: sanitizeDashboardParams(params),
        },
      );

      return extractCallsPerAgentData(response.data);
    } catch (error) {
      throw toReportingError(
        error,
        "Impossible de charger les appels par agent pour le moment.",
      );
    }
  },

  async getCallsPerAgentHourly(
    params: ReportingDashboardParams = {},
  ): Promise<ReportingCallsPerAgentHourlyData> {
    try {
      const response = await apiClient.get<BackendReportingCallsPerAgentHourlyResponse>(
        "/reporting/calls/per-agent-hourly",
        {
          params: sanitizeDashboardParams(params),
        },
      );

      return extractCallsPerAgentHourlyData(response.data);
    } catch (error) {
      throw toReportingError(
        error,
        "Impossible de charger les appels horaires par agent pour le moment.",
      );
    }
  },

  async getAgentsPerformance(
    params: ReportingDashboardParams = {},
  ): Promise<ReportingAgentPerformanceData> {
    try {
      const response = await apiClient.get<BackendReportingAgentPerformanceResponse>(
        "/reporting/agents/performance",
        {
          params: sanitizeDashboardParams(params),
        },
      );

      return extractAgentPerformanceData(response.data);
    } catch (error) {
      throw toReportingError(
        error,
        "Impossible de charger la performance des agents pour le moment.",
      );
    }
  },

  async getSalesPerAgent(
    params: ReportingDashboardParams = {},
  ): Promise<ReportingSalesPerAgentData> {
    try {
      const response = await apiClient.get<BackendReportingSalesPerAgentResponse>(
        "/reporting/sales/per-agent",
        {
          params: sanitizeDashboardParams(params),
        },
      );

      return extractSalesPerAgentData(response.data);
    } catch (error) {
      throw toReportingError(
        error,
        "Impossible de charger les ventes par agent pour le moment.",
      );
    }
  },

  async getAppointmentsPerAgent(
    params: ReportingDashboardParams = {},
  ): Promise<ReportingAppointmentsPerAgentData> {
    try {
      const response = await apiClient.get<BackendReportingAppointmentsPerAgentResponse>(
        "/reporting/appointments/per-agent",
        {
          params: sanitizeDashboardParams(params),
        },
      );

      return extractAppointmentsPerAgentData(response.data);
    } catch (error) {
      throw toReportingError(
        error,
        "Impossible de charger les rendez-vous par agent pour le moment.",
      );
    }
  },

  async getPauseReports(
    params: ReportingDashboardParams = {},
  ): Promise<ReportingPauseReportsData> {
    try {
      const response = await apiClient.get<BackendReportingPauseReportsResponse>(
        "/reporting/pause-reports",
        {
          params: sanitizeDashboardParams(params),
        },
      );

      return extractPauseReportsData(response.data);
    } catch (error) {
      throw toReportingError(
        error,
        "Impossible de charger le rapport des pauses pour le moment.",
      );
    }
  },

  async getSessionsHistory(
    params: ReportingDashboardParams = {},
  ): Promise<ReportingSessionsHistoryData> {
    try {
      const response = await apiClient.get<BackendReportingSessionsHistoryResponse>(
        "/reporting/sessions-history",
        {
          params: sanitizeDashboardParams(params),
        },
      );

      return extractSessionsHistoryData(response.data);
    } catch (error) {
      throw toReportingError(
        error,
        "Impossible de charger l'historique des sessions pour le moment.",
      );
    }
  },

  async getQualificationsByAgent(
    params: ReportingDashboardParams = {},
  ): Promise<ReportingQualificationsByAgentData> {
    try {
      const response = await apiClient.get<BackendReportingQualificationsByAgentResponse>(
        "/reporting/qualifications-by-agent",
        {
          params: sanitizeDashboardParams(params),
        },
      );

      return extractQualificationsByAgentData(response.data);
    } catch (error) {
      throw toReportingError(
        error,
        "Impossible de charger les qualifications par agent pour le moment.",
      );
    }
  },
};
