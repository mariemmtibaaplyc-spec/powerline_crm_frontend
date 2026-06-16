"use client";

import { PhoneCall, PhoneMissed, RotateCcw, Target, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CountText } from "@/components/reporting/count-text";
import { DateRangePill } from "@/components/reporting/date-range-pill";
import { KPIGrid } from "@/components/reporting/kpi-grid";
import { KPICard } from "@/components/reporting/kpi-card";
import { PercentText } from "@/components/reporting/percent-text";
import { ReportingEmptyState } from "@/components/reporting/reporting-empty-state";
import { ReportingErrorState } from "@/components/reporting/reporting-error-state";
import { ReportingFilters } from "@/components/reporting/reporting-filters-panel";
import { ReportingLoadingState } from "@/components/reporting/reporting-loading-state";
import { ReportingPageLayout } from "@/components/reporting/reporting-page-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useCampaigns } from "@/features/campaigns/hooks/use-campaigns";
import { useContactReachabilityReporting } from "@/features/reporting/hooks/use-contact-reachability-reporting";
import { formatReportingDateRange } from "@/features/reporting/lib/date-range";
import type { ReportingDashboardParams } from "@/types/reporting.types";

export default function Page() {
  const { contactReachabilityData, isLoading, error, loadContactReachability } =
    useContactReachabilityReporting();
  const {
    campaigns,
    campaignsError,
    hasLoadedCampaigns,
    isLoadingCampaigns,
    loadCampaigns,
  } = useCampaigns();
  const [filters, setFilters] = useState<ReportingDashboardParams>({
    from: "",
    to: "",
    campaign_id: "",
  });

  useEffect(() => {
    void loadContactReachability().catch(() => undefined);
  }, [loadContactReachability]);

  useEffect(() => {
    if (!hasLoadedCampaigns) {
      void loadCampaigns().catch(() => undefined);
    }
  }, [hasLoadedCampaigns, loadCampaigns]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await loadContactReachability(filters);
    } catch {
      return;
    }
  }

  async function handleReset() {
    const nextFilters: ReportingDashboardParams = {
      from: "",
      to: "",
      campaign_id: "",
    };

    setFilters(nextFilters);

    try {
      await loadContactReachability(nextFilters);
    } catch {
      return;
    }
  }

  const selectedCampaignName = useMemo(() => {
    const selectedCampaignId = filters.campaign_id?.trim();
    if (!selectedCampaignId) {
      return null;
    }

    return campaigns.find((campaign) => campaign.id === selectedCampaignId)?.name ?? null;
  }, [campaigns, filters.campaign_id]);

  const isEmpty =
    !isLoading &&
    !error &&
    (contactReachabilityData?.total_contacts ?? 0) === 0;

  return (
    <ReportingPageLayout
      eyebrow="Admin workspace"
      title="Joignabilite des contacts"
      description="Vue agrégée de la joignabilite des contacts sur la période filtrée, basée sur le backend reporting réel."
      actions={
        <DateRangePill
          value={formatReportingDateRange(undefined, filters)}
        />
      }
    >
      <ReportingFilters
        description="Recharge la synthese globale de joignabilite par plage de dates et campagne. Le détail par liste ou qualification n'est pas encore exposé par le backend."
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
        isLoading={isLoading || isLoadingCampaigns}
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

      {isLoading ? (
        <ReportingLoadingState message="Chargement de la joignabilite des contacts..." />
      ) : null}

      {!isLoading && !error && !campaignsError ? (
        <div className="space-y-6">
          <Card className="border border-[#dce6f0] bg-white/95 shadow-none">
            <CardContent className="flex flex-col gap-2 py-4 text-sm text-[#526277] md:flex-row md:items-center md:justify-between">
              <p>
                Version V1 : vue agrégée globale. Le détail par liste ou qualification
                sera ajouté après extension backend.
              </p>
              <p className="font-medium text-[#102033]">
                {selectedCampaignName ? `Campagne: ${selectedCampaignName}` : "Toutes les campagnes"}
              </p>
            </CardContent>
          </Card>

          {isEmpty ? (
            <ReportingEmptyState message="Aucune donnée de joignabilite disponible sur cette plage de dates." />
          ) : (
            <KPIGrid>
              <KPICard
                label="Contacts joignables"
                value={<CountText value={contactReachabilityData?.reachable_contacts} />}
                caption="Contacts avec au moins un appel joignable"
                icon={<PhoneCall className="h-5 w-5" />}
                tone="teal"
              />
              <KPICard
                label="Contacts non joignables"
                value={<CountText value={contactReachabilityData?.unreachable_contacts} />}
                caption="Contacts restes sans issue joignable"
                icon={<PhoneMissed className="h-5 w-5" />}
                tone="amber"
              />
              <KPICard
                label="Total contacts"
                value={<CountText value={contactReachabilityData?.total_contacts} />}
                caption="Population agregée analysee"
                icon={<Users className="h-5 w-5" />}
                tone="navy"
              />
              <KPICard
                label="Essais moyens"
                value={<CountText value={contactReachabilityData?.retry_count} />}
                caption="Valeur renvoyee par le backend V1"
                icon={<RotateCcw className="h-5 w-5" />}
                tone="blue"
              />
              <KPICard
                label="Taux de joignabilite"
                value={<PercentText value={contactReachabilityData?.reachability_rate} />}
                caption="Part des contacts finalement joignables"
                icon={<Target className="h-5 w-5" />}
                tone="teal"
              />
            </KPIGrid>
          )}
        </div>
      ) : null}
    </ReportingPageLayout>
  );
}
