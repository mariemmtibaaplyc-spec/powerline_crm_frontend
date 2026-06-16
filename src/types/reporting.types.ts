export type ReportingPrimitive = string | number | boolean | null;

export type ReportingValue =
  | ReportingPrimitive
  | ReportingValue[]
  | {
      [key: string]: ReportingValue | undefined;
    };

export interface ReportingDashboardParams {
  from?: string;
  to?: string;
  agent_id?: string;
  campaign_id?: string;
}

export interface ReportingContactReachabilityData {
  reachable_contacts: number;
  unreachable_contacts: number;
  total_contacts: number;
  retry_count: number;
  reachability_rate: number;
}

export interface ReportingDashboardData {
  period?: ReportingValue;
  calls?: ReportingValue;
  top_agents?: ReportingValue;
  top_campaigns?: ReportingValue;
  conversion?: ReportingValue;
  funnel?: ReportingValue;
  agents?: ReportingValue;
  appointments?: ReportingValue;
  leads?: ReportingValue;
  sales?: ReportingValue;
}
export interface ReportingAgentsProductivityParams
  extends ReportingDashboardParams {}

export interface ReportingAgentsProductivityData {
  summary?: ReportingValue;
  stats?: ReportingValue;
  metrics?: ReportingValue;
  kpis?: ReportingValue;
  period?: ReportingValue;
  agents?: ReportingValue;
  rows?: ReportingValue;
  items?: ReportingValue;
  data?: ReportingValue;
  results?: ReportingValue;
  list?: ReportingValue;
  [key: string]: ReportingValue | undefined;
}

export type ReportingAgentsProductivityResponse =
  | ReportingAgentsProductivityData
  | ReportingValue[];

export interface ReportingCallsOverviewData {
  summary?: ReportingValue;
  stats?: ReportingValue;
  metrics?: ReportingValue;
  kpis?: ReportingValue;
  period?: ReportingValue;
  data?: ReportingValue;
  results?: ReportingValue;
  [key: string]: ReportingValue | undefined;
}

export type ReportingCallsOverviewResponse =
  | ReportingCallsOverviewData
  | ReportingValue[];

export interface ReportingCallsPerAgentData {
  agents?: ReportingValue;
  rows?: ReportingValue;
  items?: ReportingValue;
  data?: ReportingValue;
  results?: ReportingValue;
  list?: ReportingValue;
  period?: ReportingValue;
  summary?: ReportingValue;
  stats?: ReportingValue;
  [key: string]: ReportingValue | undefined;
}

export type ReportingCallsPerAgentResponse =
  | ReportingCallsPerAgentData
  | ReportingValue[];

export interface ReportingCallsPerAgentHourlyHour {
  hour_key?: ReportingValue;
  hour_label?: ReportingValue;
  total_calls?: ReportingValue;
  completed_calls?: ReportingValue;
  answered_calls?: ReportingValue;
  avg_dmc_seconds?: ReportingValue;
  avg_dmt_seconds?: ReportingValue;
  total_duration_seconds?: ReportingValue;
  completion_rate_pct?: ReportingValue;
  by_status?: ReportingValue;
  [key: string]: ReportingValue | undefined;
}

export interface ReportingCallsPerAgentHourlyRow {
  agent_id?: ReportingValue;
  agent_name?: ReportingValue;
  totals?: ReportingValue;
  hours?: ReportingValue;
  [key: string]: ReportingValue | undefined;
}

export interface ReportingCallsPerAgentHourlyData {
  agents?: ReportingValue;
  rows?: ReportingValue;
  items?: ReportingValue;
  data?: ReportingValue;
  results?: ReportingValue;
  list?: ReportingValue;
  period?: ReportingValue;
  summary?: ReportingValue;
  stats?: ReportingValue;
  [key: string]: ReportingValue | undefined;
}

export type ReportingCallsPerAgentHourlyResponse =
  | ReportingCallsPerAgentHourlyData
  | ReportingValue[];

export interface ReportingAgentPerformanceData {
  summary?: ReportingValue;
  stats?: ReportingValue;
  metrics?: ReportingValue;
  kpis?: ReportingValue;
  agents?: ReportingValue;
  rows?: ReportingValue;
  items?: ReportingValue;
  data?: ReportingValue;
  results?: ReportingValue;
  list?: ReportingValue;
  period?: ReportingValue;
  [key: string]: ReportingValue | undefined;
}

export type ReportingAgentPerformanceResponse =
  | ReportingAgentPerformanceData
  | ReportingValue[];

export interface ReportingSalesPerAgentData {
  summary?: ReportingValue;
  stats?: ReportingValue;
  metrics?: ReportingValue;
  kpis?: ReportingValue;
  agents?: ReportingValue;
  rows?: ReportingValue;
  items?: ReportingValue;
  data?: ReportingValue;
  results?: ReportingValue;
  list?: ReportingValue;
  period?: ReportingValue;
  [key: string]: ReportingValue | undefined;
}

export type ReportingSalesPerAgentResponse =
  | ReportingSalesPerAgentData
  | ReportingValue[];

export interface ReportingAppointmentsPerAgentData {
  summary?: ReportingValue;
  stats?: ReportingValue;
  metrics?: ReportingValue;
  kpis?: ReportingValue;
  agents?: ReportingValue;
  rows?: ReportingValue;
  items?: ReportingValue;
  data?: ReportingValue;
  results?: ReportingValue;
  list?: ReportingValue;
  period?: ReportingValue;
  [key: string]: ReportingValue | undefined;
}

export type ReportingAppointmentsPerAgentResponse =
  | ReportingAppointmentsPerAgentData
  | ReportingValue[];

export interface ReportingPauseReportsData {
  summary?: ReportingValue;
  stats?: ReportingValue;
  metrics?: ReportingValue;
  kpis?: ReportingValue;
  agents?: ReportingValue;
  rows?: ReportingValue;
  items?: ReportingValue;
  data?: ReportingValue;
  results?: ReportingValue;
  list?: ReportingValue;
  period?: ReportingValue;
  [key: string]: ReportingValue | undefined;
}

export type ReportingPauseReportsResponse =
  | ReportingPauseReportsData
  | ReportingValue[];

export interface ReportingSessionsHistoryData {
  summary?: ReportingValue;
  stats?: ReportingValue;
  metrics?: ReportingValue;
  kpis?: ReportingValue;
  agents?: ReportingValue;
  rows?: ReportingValue;
  items?: ReportingValue;
  data?: ReportingValue;
  results?: ReportingValue;
  list?: ReportingValue;
  period?: ReportingValue;
  [key: string]: ReportingValue | undefined;
}

export type ReportingSessionsHistoryResponse =
  | ReportingSessionsHistoryData
  | ReportingValue[];

export interface ReportingQualificationsByAgentData {
  summary?: ReportingValue;
  stats?: ReportingValue;
  metrics?: ReportingValue;
  kpis?: ReportingValue;
  agents?: ReportingValue;
  rows?: ReportingValue;
  items?: ReportingValue;
  data?: ReportingValue;
  results?: ReportingValue;
  list?: ReportingValue;
  period?: ReportingValue;
  [key: string]: ReportingValue | undefined;
}

export type ReportingQualificationsByAgentResponse =
  | ReportingQualificationsByAgentData
  | ReportingValue[];
