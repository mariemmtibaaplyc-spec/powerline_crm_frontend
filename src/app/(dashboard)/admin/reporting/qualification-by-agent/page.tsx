"use client";

import { Target, TrendingUp, UserRound, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CountText } from "@/components/reporting/count-text";
import { DateRangePill } from "@/components/reporting/date-range-pill";
import { KPIGrid } from "@/components/reporting/kpi-grid";
import { KPICard } from "@/components/reporting/kpi-card";
import { ReportingEmptyState } from "@/components/reporting/reporting-empty-state";
import { ReportingErrorState } from "@/components/reporting/reporting-error-state";
import { ReportingFilters } from "@/components/reporting/reporting-filters-panel";
import { ReportingLoadingState } from "@/components/reporting/reporting-loading-state";
import { ReportingPageLayout } from "@/components/reporting/reporting-page-layout";
import { ReportingTableCard } from "@/components/reporting/reporting-table-card";
import { Select } from "@/components/ui/select";
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";
import { useCampaignAgents } from "@/features/campaign-agents/hooks/use-campaign-agents";
import { useCampaignAgentsStore } from "@/features/campaign-agents/store/campaign-agents.store";
import { useCampaignQualifications } from "@/features/campaign-qualifications/hooks/use-campaign-qualifications";
import { useCampaignQualificationsStore } from "@/features/campaign-qualifications/store/campaign-qualifications.store";
import { useCampaigns } from "@/features/campaigns/hooks/use-campaigns";
import {
  extractReportingRowsSource,
  formatReportingDateRange,
} from "@/features/reporting/lib/date-range";
import {
  normalizeReportingKey,
  parseReportingNumericValue,
  pickReportingValueByAliases,
  toReportingRecordArray,
} from "@/features/reporting/lib/parsers";
import { useQualificationsByAgentReporting } from "@/features/reporting/hooks/use-qualifications-by-agent-reporting";
import { cn } from "@/lib/utils";
import type { CampaignAgentRecord } from "@/types/campaign-agent.types";
import type { CampaignQualificationRecord } from "@/types/campaign-qualification.types";
import type {
  ReportingDashboardParams,
  ReportingQualificationsByAgentData,
} from "@/types/reporting.types";

type QualificationTypeTone = "positive" | "negative" | "neutral";

interface QualificationColumn {
  id: string;
  name: string;
  type: string;
  key: string;
}

interface AgentMatrixRow {
  id: string;
  rowKey: string;
  name: string;
  role: string | null;
  email: string | null;
  isActive: boolean | null;
  totalQualified: number;
  cells: Record<string, number>;
}

function normalizeBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value > 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return null;
    }

    if (
      normalized === "1" ||
      normalized === "true" ||
      normalized.includes("active") ||
      normalized.includes("online") ||
      normalized.includes("connected")
    ) {
      return true;
    }

    if (
      normalized === "0" ||
      normalized === "false" ||
      normalized.includes("inactive") ||
      normalized.includes("offline") ||
      normalized.includes("disconnected")
    ) {
      return false;
    }
  }

  return null;
}

function getQualificationTypeTone(value: string): QualificationTypeTone {
  const normalized = value.trim().toUpperCase();

  if (normalized === "POSITIVE") {
    return "positive";
  }

  if (normalized === "NEGATIVE") {
    return "negative";
  }

  return "neutral";
}

function QualificationTypeBadge({ value }: { value: string }) {
  const tone = getQualificationTypeTone(value);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
        tone === "positive" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        tone === "negative" &&
          "border-rose-200 bg-rose-50 text-rose-700",
        tone === "neutral" &&
          "border-slate-200 bg-slate-50 text-slate-700",
      )}
    >
      {value}
    </span>
  );
}

function buildQualificationMatrix(
  data: ReportingQualificationsByAgentData | null,
  activeQualifications: CampaignQualificationRecord[],
  useCampaignQualificationColumns: boolean,
  campaignAgents: CampaignAgentRecord[],
) {
  const rowsSource = extractReportingRowsSource(data);
  const records = toReportingRecordArray(rowsSource);
  const columnsMap = new Map<string, QualificationColumn>();
  const agentsMap = new Map<string, AgentMatrixRow>();
  let grandTotal = 0;

  activeQualifications.forEach((qualification, index) => {
    if (!qualification.id || !qualification.name) {
      return;
    }

    const qualificationType = qualification.type?.toUpperCase() ?? "NEUTRAL";
    const columnKey = `${qualification.id}-${normalizeReportingKey(qualificationType)}`;

    columnsMap.set(columnKey, {
      id: qualification.id,
      name: qualification.name,
      type: qualificationType,
      key: columnKey,
    });
  });

  const hasActiveQualificationColumns = columnsMap.size > 0;

  if (useCampaignQualificationColumns || campaignAgents.length > 0) {
    campaignAgents.forEach((agent, index) => {
      const displayName =
        [agent.firstName, agent.lastName].filter(Boolean).join(" ").trim() ||
        agent.username ||
        agent.email ||
        agent.id;

      agentsMap.set(agent.id, {
        id: agent.id,
        rowKey: `campaign-agent-${agent.id}-${index}`,
        name: displayName || "—",
        role: null,
        email: agent.email ?? null,
        isActive: true,
        totalQualified: 0,
        cells: {},
      });
    });
  }

  records.forEach((record, index) => {
    const agentId = String(
      pickReportingValueByAliases(record, ["agent_id", "user_id", "id"]) ?? "",
    );
    const agentName = String(
      pickReportingValueByAliases(record, [
        "agent_name",
        "name",
        "full_name",
        "username",
        "agent",
      ]) ?? "",
    );
    const roleValue = pickReportingValueByAliases(record, ["role", "agent_role", "profile"]);
    const emailValue = pickReportingValueByAliases(record, ["email", "agent_email"]);
    const isActiveValue = pickReportingValueByAliases(record, ["is_active", "active", "status"]);
    const qualificationId = String(
      pickReportingValueByAliases(record, ["qualification_id", "id"]) ?? "",
    );
    const qualificationName = String(
      pickReportingValueByAliases(record, [
        "qualification_name",
        "name",
        "qualification",
      ]) ?? "",
    );
    const qualificationType = String(
      pickReportingValueByAliases(record, [
        "qualification_type",
        "type",
      ]) ?? "NEUTRAL",
    ).trim() || "NEUTRAL";
    const total =
      parseReportingNumericValue(
        pickReportingValueByAliases(record, ["total", "count", "volume"]),
      ) ?? 0;

    const columnId =
      qualificationId ||
      normalizeReportingKey(qualificationName || `qualification-${index}`);
    const columnKey = `${columnId}-${normalizeReportingKey(qualificationType)}`;

    if (!columnsMap.has(columnKey)) {
      columnsMap.set(columnKey, {
        id: columnId,
        name: qualificationName || `Qualification ${index + 1}`,
        type: qualificationType.toUpperCase(),
        key: columnKey,
      });
    }

    const agentKey =
      agentId ||
      `${normalizeReportingKey(agentName || "agent")}-${normalizeReportingKey(String(emailValue ?? ""))}`;

    if (!agentsMap.has(agentKey)) {
      agentsMap.set(agentKey, {
        id: agentId || agentKey,
        rowKey: `${agentKey}-${index}`,
        name: agentName || agentId || "—",
        role: typeof roleValue === "string" && roleValue.trim() ? roleValue : null,
        email: typeof emailValue === "string" && emailValue.trim() ? emailValue : null,
        isActive: normalizeBoolean(isActiveValue),
        totalQualified: 0,
        cells: {},
      });
    }

    const agentRow = agentsMap.get(agentKey);

    if (!agentRow) {
      return;
    }

    agentRow.cells[columnKey] = (agentRow.cells[columnKey] ?? 0) + total;
    agentRow.totalQualified += total;
    grandTotal += total;
  });

  const columns = [...columnsMap.values()].sort((left, right) =>
    left.name.localeCompare(right.name, "fr-FR"),
  );
  const rows = [...agentsMap.values()].sort((left, right) =>
    left.name.localeCompare(right.name, "fr-FR"),
  );
  const columnTotals = columns.reduce<Record<string, number>>((accumulator, column) => {
    accumulator[column.key] = rows.reduce(
      (sum, row) => sum + (row.cells[column.key] ?? 0),
      0,
    );
    return accumulator;
  }, {});

  return {
    columns,
    rows,
    columnTotals,
    grandTotal,
  };
}

export default function Page() {
  const {
    qualificationsByAgentData,
    isLoading,
    error,
    loadQualificationsByAgent,
  } = useQualificationsByAgentReporting();
  const {
    campaigns,
    hasLoadedCampaigns,
    isLoadingCampaigns,
    campaignsError,
    loadCampaigns,
  } = useCampaigns();
  const [filters, setFilters] = useState<ReportingDashboardParams>({
    from: "",
    to: "",
    campaign_id: "",
  });
  const selectedCampaignId = filters.campaign_id?.trim() || undefined;
  const {
    qualifications,
    isLoadingQualifications,
    qualificationsError,
    loadCampaignQualifications,
  } = useCampaignQualifications(selectedCampaignId);
  const {
    campaignAgents,
    isLoadingCampaignAgents,
    campaignAgentsError,
    loadCampaignAgents,
  } = useCampaignAgents(selectedCampaignId);
  const agentsByCampaign = useCampaignAgentsStore((state) => state.agentsByCampaign);
  const loadingCampaignAgentIds = useCampaignAgentsStore(
    (state) => state.loadingCampaignAgentIds,
  );
  const campaignAgentErrorsByCampaign = useCampaignAgentsStore(
    (state) => state.campaignAgentErrorsByCampaign,
  );
  const qualificationsByCampaign = useCampaignQualificationsStore(
    (state) => state.qualificationsByCampaign,
  );
  const loadingCampaignQualificationIds = useCampaignQualificationsStore(
    (state) => state.loadingCampaignQualificationIds,
  );
  const qualificationErrorsByCampaign = useCampaignQualificationsStore(
    (state) => state.qualificationErrorsByCampaign,
  );

  useEffect(() => {
    void loadQualificationsByAgent().catch(() => undefined);
  }, [loadQualificationsByAgent]);

  useEffect(() => {
    if (!hasLoadedCampaigns) {
      void loadCampaigns().catch(() => undefined);
    }
  }, [hasLoadedCampaigns, loadCampaigns]);

  useEffect(() => {
    if (!selectedCampaignId) {
      return;
    }

    void loadCampaignQualifications(selectedCampaignId, true);
  }, [loadCampaignQualifications, selectedCampaignId]);

  useEffect(() => {
    if (!selectedCampaignId) {
      return;
    }

    void loadCampaignAgents(selectedCampaignId, true);
  }, [loadCampaignAgents, selectedCampaignId]);

  useEffect(() => {
    if (selectedCampaignId || campaigns.length === 0) {
      return;
    }

    const activeCampaigns = campaigns.filter((campaign) => campaign.status === "active");

    activeCampaigns.forEach((campaign) => {
      void useCampaignAgentsStore
        .getState()
        .loadCampaignAgents(campaign.id, true);
      void useCampaignQualificationsStore
        .getState()
        .loadCampaignQualifications(campaign.id, true);
    });
  }, [campaigns, selectedCampaignId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await loadQualificationsByAgent(filters);
    } catch {
      return;
    }
  }

  async function handleReset() {
    const nextFilters = { from: "", to: "", campaign_id: "" };
    setFilters(nextFilters);

    try {
      await loadQualificationsByAgent();
    } catch {
      return;
    }
  }

  const activeQualifications = useMemo(() => {
    const qualificationMap = new Map<string, CampaignQualificationRecord>();

    const sourceQualifications = selectedCampaignId
      ? qualifications
      : campaigns
          .filter((campaign) => campaign.status === "active")
          .flatMap((campaign) => qualificationsByCampaign[campaign.id] ?? []);

    sourceQualifications
      .filter((qualification) => qualification.isActive !== false)
      .forEach((qualification) => {
        if (!qualification.id || !qualification.name) {
          return;
        }

        if (!qualificationMap.has(qualification.id)) {
          qualificationMap.set(qualification.id, qualification);
        }
      });

    return [...qualificationMap.values()];
  }, [campaigns, qualifications, qualificationsByCampaign, selectedCampaignId]);
  const activeCampaignAgents = useMemo(() => {
    if (selectedCampaignId) {
      return campaignAgents;
    }

    const agentMap = new Map<string, CampaignAgentRecord>();

    campaigns
      .filter((campaign) => campaign.status === "active")
      .flatMap((campaign) => agentsByCampaign[campaign.id] ?? [])
      .forEach((agent) => {
        if (!agent.id || agentMap.has(agent.id)) {
          return;
        }

        agentMap.set(agent.id, agent);
      });

    return [...agentMap.values()];
  }, [agentsByCampaign, campaignAgents, campaigns, selectedCampaignId]);
  const useCampaignQualificationColumns = Boolean(selectedCampaignId);

  const matrix = useMemo(
    () =>
      buildQualificationMatrix(
        qualificationsByAgentData,
        activeQualifications,
        useCampaignQualificationColumns,
        activeCampaignAgents,
      ),
    [
      activeQualifications,
      activeCampaignAgents,
      qualificationsByAgentData,
      useCampaignQualificationColumns,
    ],
  );

  const averagePerAgent =
    matrix.rows.length > 0 ? matrix.grandTotal / matrix.rows.length : 0;
  const campaignColumnMode = Boolean(selectedCampaignId && activeQualifications.length > 0);
  const allCampaignsQualificationMode = !selectedCampaignId && activeQualifications.length > 0;
  const activeCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.status === "active"),
    [campaigns],
  );
  const isLoadingAllCampaignQualifications = useMemo(
    () =>
      !selectedCampaignId &&
      activeCampaigns.some((campaign) => loadingCampaignQualificationIds[campaign.id]),
    [activeCampaigns, loadingCampaignQualificationIds, selectedCampaignId],
  );
  const isLoadingAllCampaignAgents = useMemo(
    () =>
      !selectedCampaignId &&
      activeCampaigns.some((campaign) => loadingCampaignAgentIds[campaign.id]),
    [activeCampaigns, loadingCampaignAgentIds, selectedCampaignId],
  );
  const allCampaignQualificationsError = useMemo(() => {
    if (selectedCampaignId) {
      return null;
    }

    for (const campaign of activeCampaigns) {
      const message = qualificationErrorsByCampaign[campaign.id];
      if (message) {
        return message;
      }
    }

    return null;
  }, [activeCampaigns, qualificationErrorsByCampaign, selectedCampaignId]);
  const allCampaignAgentsError = useMemo(() => {
    if (selectedCampaignId) {
      return null;
    }

    for (const campaign of activeCampaigns) {
      const message = campaignAgentErrorsByCampaign[campaign.id];
      if (message) {
        return message;
      }
    }

    return null;
  }, [activeCampaigns, campaignAgentErrorsByCampaign, selectedCampaignId]);
  const hasAnyActiveQualification = activeQualifications.length > 0;
  const showMatrix = hasAnyActiveQualification && matrix.columns.length > 0;

  return (
    <ReportingPageLayout
      eyebrow="Admin workspace"
      title="Qualification par agent"
      description="Matrice dynamique des qualifications par agent, pivotée côté frontend depuis le backend reporting réel."
      actions={
        <DateRangePill
          value={formatReportingDateRange(qualificationsByAgentData?.period, filters)}
        />
      }
    >
      <ReportingFilters
        description={
          selectedCampaignId
            ? "Recharge de la matrice qualifications par agent sur la plage de dates souhaitée. Les colonnes viennent des qualifications actives de la campagne sélectionnée."
            : "Recharge de la matrice qualifications par agent sur la plage de dates souhaitée. Les colonnes viennent de toutes les qualifications actives des campagnes actives, fusionnées avec les qualifications observées dans le reporting."
        }
        from={filters.from ?? ""}
        to={filters.to ?? ""}
        extraFields={
          <label className="space-y-2">
            <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6b7e92]">
              Campagne
            </span>
            <Select
              value={filters.campaign_id ?? ""}
              className="h-10 rounded-xl border-[#dce6f0] bg-white px-3 text-sm text-[#102033]"
              disabled={isLoadingCampaigns}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  campaign_id: event.target.value,
                }))
              }
            >
              <option value="">Toutes les campagnes</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </Select>
          </label>
        }
        isLoading={
          isLoading ||
          isLoadingCampaigns ||
          isLoadingQualifications ||
          isLoadingCampaignAgents ||
          isLoadingAllCampaignQualifications ||
          isLoadingAllCampaignAgents
        }
        onFromChange={(value) =>
          setFilters((current) => ({
            ...current,
            from: value,
          }))
        }
        onToChange={(value) =>
          setFilters((current) => ({
            ...current,
            to: value,
          }))
        }
        onSubmit={handleSubmit}
        onReset={handleReset}
      />

      {error ? <ReportingErrorState message={error} /> : null}
      {campaignsError ? <ReportingErrorState message={campaignsError} /> : null}
      {qualificationsError && selectedCampaignId ? (
        <ReportingErrorState message={qualificationsError} />
      ) : null}
      {campaignAgentsError && selectedCampaignId ? (
        <ReportingErrorState message={campaignAgentsError} />
      ) : null}
      {allCampaignAgentsError && !selectedCampaignId ? (
        <ReportingErrorState message={allCampaignAgentsError} />
      ) : null}
      {allCampaignQualificationsError && !selectedCampaignId ? (
        <ReportingErrorState message={allCampaignQualificationsError} />
      ) : null}

      {isLoading && !qualificationsByAgentData ? (
        <ReportingLoadingState message="Chargement des qualifications par agent..." />
      ) : null}

      {qualificationsByAgentData ? (
        !hasAnyActiveQualification &&
        (selectedCampaignId || (!selectedCampaignId && !isLoadingAllCampaignQualifications)) ? (
          <ReportingEmptyState message="Aucune qualification active disponible sur le périmètre sélectionné." />
        ) : showMatrix ? (
          <>
            <KPIGrid>
              <KPICard
                label="Nombre agents"
                value={<CountText value={matrix.rows.length} />}
                caption="Agents remontés dans le reporting."
                icon={<Users className="h-5 w-5" />}
                tone="navy"
              />
              <KPICard
                label="Qualifications distinctes"
                value={<CountText value={matrix.columns.length} />}
                caption="Colonnes dynamiques construites depuis le backend."
                icon={<Target className="h-5 w-5" />}
                tone="blue"
              />
              <KPICard
                label="Total qualifié"
                value={<CountText value={matrix.grandTotal} />}
                caption="Somme globale de toutes les qualifications."
                icon={<TrendingUp className="h-5 w-5" />}
                tone="teal"
              />
              <KPICard
                label="Moyenne / agent"
                value={<CountText value={averagePerAgent} />}
                caption="Moyenne des qualifications par agent."
                icon={<UserRound className="h-5 w-5" />}
                tone="amber"
              />
            </KPIGrid>

            <ReportingTableCard
              title="Matrice des qualifications"
              description={
                campaignColumnMode
                  ? "Vue dense de supervision: colonnes issues de toutes les qualifications actives de la campagne, valeurs pivotées depuis le reporting."
                  : allCampaignsQualificationMode
                    ? "Vue dense de supervision: colonnes issues de toutes les qualifications actives des campagnes actives, avec tous les agents affectés à ces campagnes même sans qualification."
                  : "Vue dense de supervision: une ligne par agent, une colonne par qualification observée dans le reporting."
              }
              className="overflow-hidden"
              contentClassName="px-0 pb-0"
            >
              <TableWrapper className="rounded-none border-x-0 border-b-0 border-t border-[#e8eef5] bg-[linear-gradient(180deg,#fcfdff_0%,#f8fbfe_100%)] shadow-none">
                <div className="overflow-x-auto scroll-smooth">
                  <Table className="min-w-[1280px] text-[12px]">
                    <thead>
                      <tr className="bg-[#f6fafe]">
                        <TableHeadCell className="sticky left-0 z-20 min-w-[240px] bg-[#f6fafe] px-4 py-2 text-[#5f7489]">
                          Agent
                        </TableHeadCell>
                        <TableHeadCell className="min-w-[132px] px-3 py-2 text-center text-[#5f7489]">
                          Total qualifié
                        </TableHeadCell>
                        {matrix.columns.map((column) => (
                          <TableHeadCell
                            key={column.key}
                            className="min-w-[132px] px-2 py-2 text-center text-[#526780]"
                          >
                            <div className="flex min-h-[52px] flex-col items-center justify-center gap-1">
                              <span className="line-clamp-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-[#23384e]">
                                {column.name}
                              </span>
                              <QualificationTypeBadge value={column.type} />
                            </div>
                          </TableHeadCell>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {matrix.rows.map((row, index) => (
                        <tr
                          key={row.rowKey}
                          className="transition-colors duration-150 hover:bg-[#f8fbfe]"
                        >
                          <TableCell className="sticky left-0 z-10 border-b border-[#edf2f7] bg-white px-4 py-2 align-top">
                            <div className="space-y-0.5">
                              <p className="text-[13px] font-semibold text-[#102033]">
                                {row.name}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-[#7d91a5]">
                                <span>{row.role ?? "Sans role"}</span>
                                {row.isActive !== null ? (
                                  <span
                                    className={cn(
                                      "rounded-full px-2 py-0.5",
                                      row.isActive
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-slate-100 text-slate-700",
                                    )}
                                  >
                                    {row.isActive ? "Actif" : "Inactif"}
                                  </span>
                                ) : null}
                              </div>
                              {row.email ? (
                                <p className="text-[11px] text-[#6f8398]">{row.email}</p>
                              ) : null}
                            </div>
                          </TableCell>

                          <TableCell className="border-b border-[#edf2f7] px-3 py-2 text-center align-middle">
                            <div className="font-semibold text-[#102033]">
                              <CountText value={row.totalQualified} />
                            </div>
                          </TableCell>

                          {matrix.columns.map((column) => {
                            const value = row.cells[column.key] ?? 0;

                            return (
                              <TableCell
                                key={`${row.id}-${column.key}-${index}`}
                                className="border-b border-[#edf2f7] px-2 py-2 text-center align-middle"
                              >
                                {value > 0 ? (
                                  <div className="font-medium text-[#102033]">
                                    <CountText value={value} />
                                  </div>
                                ) : (
                                  <span className="text-xs text-[#9aabbb]">0</span>
                                )}
                              </TableCell>
                            );
                          })}
                        </tr>
                      ))}

                      <tr className="bg-[#f7fbff]">
                        <TableCell className="sticky left-0 z-10 border-b border-[#dfe8f2] bg-[#f7fbff] px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#29425f]">
                          Total
                        </TableCell>
                        <TableCell className="border-b border-[#dfe8f2] px-3 py-3 text-center font-semibold text-[#102033]">
                          <CountText value={matrix.grandTotal} />
                        </TableCell>
                        {matrix.columns.map((column) => (
                          <TableCell
                            key={`total-${column.key}`}
                            className="border-b border-[#dfe8f2] px-2 py-3 text-center font-semibold text-[#102033]"
                          >
                            <CountText value={matrix.columnTotals[column.key] ?? 0} />
                          </TableCell>
                        ))}
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </TableWrapper>
            </ReportingTableCard>
          </>
        ) : (
          <ReportingEmptyState message="Aucune qualification par agent disponible sur cette période." />
        )
      ) : null}
    </ReportingPageLayout>
  );
}
