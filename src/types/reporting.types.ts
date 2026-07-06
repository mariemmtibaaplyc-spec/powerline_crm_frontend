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
  page?: number;
  limit?: number;
}

export interface ReportingContactReachabilityData {
  reachable_contacts: number;
  unreachable_contacts: number;
  total_contacts: number;
  attempted_contacts?: number;
  never_called_contacts?: number;
  retry_count: number;
  avg_attempts_per_contact?: number;
  reachability_rate: number;
}

export interface ReportingContactReachabilityByListItem {
  list_id: number;
  list_name: string;
  reachable_contacts: number;
  unreachable_contacts: number;
  attempted_contacts: number;
  never_called_contacts: number;
  total_contacts: number;
  total_calls: number;
  avg_attempts_per_contact: number;
  reachability_rate: number;
}

export interface ReportingContactReachabilityByQualificationItem {
  qualification_id: number | null;
  qualification_name: string;
  reachable_contacts: number;
  unreachable_contacts: number;
  total_contacts: number;
  total_calls: number;
  avg_attempts_per_contact: number;
  reachability_rate: number;
}

export interface ReportingContactReachabilityTimelineItem {
  date: string;
  attempted_contacts: number;
  reachable_contacts: number;
  unreachable_contacts: number;
  total_calls: number;
  avg_attempts_per_contact: number;
  reachability_rate: number;
}

export interface ReportingContactReachabilityContactItem {
  contact_id: number;
  contact_name: string;
  phone: string | null;
  attempts_count: number;
  is_reachable: boolean;
  never_called: boolean;
  last_call_at: string | null;
  last_call_status: string | null;
  last_qualification_id: number | null;
  last_qualification_name: string | null;
  last_campaign_id: number | null;
  last_campaign_name: string | null;
  lists: Array<{
    list_id: number;
    list_name: string;
  }>;
}

export interface ReportingContactReachabilityContactsData {
  data: ReportingContactReachabilityContactItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface ReportingProductionEvolutionParams
  extends Pick<ReportingDashboardParams, "from" | "to" | "campaign_id"> {
  interval?: "hour" | "day" | "week" | "month";
}

export interface ReportingProductionEvolutionPoint {
  date: string;
  total_calls: number;
  attempted_calls?: number;
  displayed_calls?: number;
  total_sales: number;
  total_appointments: number;
  conversion_rate: number;
}

export interface ReportingQualificationStatusItem {
  qualification_id: number | null;
  qualification_name: string;
  qualification_type: string | null;
  total: number;
  percentage: number;
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

export interface ReportingSessionHistoryRow {
  agent_id: number;
  agent_name: string;
  role: string;
  email: string | null;
  is_active: boolean;
  session_date: string;
  login_time: string | null;
  logout_time: string | null;
  total_connected_time: number;
  pauses_count: number;
  pause_duration: number;
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
