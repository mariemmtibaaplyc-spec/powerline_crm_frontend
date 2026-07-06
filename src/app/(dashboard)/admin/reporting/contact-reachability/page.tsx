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
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";
import { useCampaigns } from "@/features/campaigns/hooks/use-campaigns";
import { useContactReachabilityReporting } from "@/features/reporting/hooks/use-contact-reachability-reporting";
import { formatReportingDateRange } from "@/features/reporting/lib/date-range";
import type { ReportingDashboardParams } from "@/types/reporting.types";

const CONTACTS_PAGE_SIZE = 10;

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

export default function Page() {
  const {
    contactReachabilityData,
    reachabilityByList,
    reachabilityByQualification,
    reachabilityTimeline,
    reachabilityContacts,
    isLoading,
    error,
    loadContactReachability,
    loadReachabilityContacts,
  } =
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
  const [contactsPage, setContactsPage] = useState(1);

  useEffect(() => {
    void loadContactReachability({ page: 1, limit: CONTACTS_PAGE_SIZE }).catch(() => undefined);
  }, [loadContactReachability]);

  useEffect(() => {
    if (!hasLoadedCampaigns) {
      void loadCampaigns().catch(() => undefined);
    }
  }, [hasLoadedCampaigns, loadCampaigns]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextPage = 1;
    setContactsPage(nextPage);

    try {
      await loadContactReachability({
        ...filters,
        page: nextPage,
        limit: CONTACTS_PAGE_SIZE,
      });
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

    const nextPage = 1;
    setFilters(nextFilters);
    setContactsPage(nextPage);

    try {
      await loadContactReachability({
        ...nextFilters,
        page: nextPage,
        limit: CONTACTS_PAGE_SIZE,
      });
    } catch {
      return;
    }
  }

  async function handleContactsPageChange(nextPage: number) {
    if (nextPage === contactsPage || nextPage < 1) {
      return;
    }

    setContactsPage(nextPage);

    try {
      await loadReachabilityContacts({
        ...filters,
        page: nextPage,
        limit: CONTACTS_PAGE_SIZE,
      });
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

  const contactsMeta = reachabilityContacts?.meta;
  const contactsTotal = contactsMeta?.total ?? 0;
  const contactsCurrentPage = contactsMeta?.page ?? contactsPage;
  const contactsPerPage = contactsMeta?.limit ?? CONTACTS_PAGE_SIZE;
  const contactsTotalPages = Math.max(contactsMeta?.total_pages ?? 1, 1);
  const contactsRangeStart =
    contactsTotal > 0 ? (contactsCurrentPage - 1) * contactsPerPage + 1 : 0;
  const contactsRangeEnd =
    contactsTotal > 0
      ? contactsRangeStart + (reachabilityContacts?.data.length ?? 0) - 1
      : 0;

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
        description="Recharge la synthese globale de joignabilite par plage de dates et campagne, avec detail par liste, qualification et contacts."
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
                Version V1 enrichie : synthese globale, ventilation par liste, qualification et echantillon de contacts reels.
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
                label="Contacts tentes"
                value={<CountText value={contactReachabilityData?.attempted_contacts} />}
                caption="Population avec au moins un appel sur la plage"
                icon={<PhoneCall className="h-5 w-5" />}
                tone="blue"
              />
              <KPICard
                label="Jamais appeles"
                value={<CountText value={contactReachabilityData?.never_called_contacts} />}
                caption="Contacts cibles sans aucune tentative"
                icon={<PhoneMissed className="h-5 w-5" />}
                tone="amber"
              />
              <KPICard
                label="Essais moyens"
                value={<CountText value={contactReachabilityData?.avg_attempts_per_contact ?? contactReachabilityData?.retry_count} />}
                caption="Moyenne d appels par contact tente"
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

          {!isEmpty ? (
            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="border border-[#dce6f0] bg-white shadow-none">
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6c7f93]">
                      Detail par liste
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-[#102033]">
                      Joignabilite par liste
                    </h2>
                  </div>

                  {reachabilityByList.length > 0 ? (
                    <TableWrapper className="border-[#dce6f0] bg-white shadow-none">
                      <div className="overflow-x-auto">
                        <Table className="min-w-[760px]">
                          <thead className="bg-[linear-gradient(180deg,#fbfdff_0%,#f5f9fd_100%)]">
                            <tr>
                              <TableHeadCell>Liste</TableHeadCell>
                              <TableHeadCell>Joignables</TableHeadCell>
                              <TableHeadCell>Non joignables</TableHeadCell>
                              <TableHeadCell>Jamais appeles</TableHeadCell>
                              <TableHeadCell>Essais moyens</TableHeadCell>
                              <TableHeadCell>Taux</TableHeadCell>
                            </tr>
                          </thead>
                          <tbody className="[&_tr:last-child_td]:border-b-0">
                            {reachabilityByList.slice(0, 8).map((item) => (
                              <tr key={`list-${item.list_id}-${item.list_name}`}>
                                <TableCell className="font-medium text-[#102033]">{item.list_name}</TableCell>
                                <TableCell>{item.reachable_contacts}</TableCell>
                                <TableCell>{item.unreachable_contacts}</TableCell>
                                <TableCell>{item.never_called_contacts}</TableCell>
                                <TableCell>{item.avg_attempts_per_contact}</TableCell>
                                <TableCell className="font-semibold text-[#15795d]">{item.reachability_rate}%</TableCell>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </TableWrapper>
                  ) : (
                    <ReportingEmptyState message="Aucune ventilation par liste disponible." />
                  )}
                </CardContent>
              </Card>

              <Card className="border border-[#dce6f0] bg-white shadow-none">
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6c7f93]">
                      Detail par qualification
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-[#102033]">
                      Joignabilite par issue
                    </h2>
                  </div>

                  {reachabilityByQualification.length > 0 ? (
                    <TableWrapper className="border-[#dce6f0] bg-white shadow-none">
                      <div className="overflow-x-auto">
                        <Table className="min-w-[720px]">
                          <thead className="bg-[linear-gradient(180deg,#fbfdff_0%,#f5f9fd_100%)]">
                            <tr>
                              <TableHeadCell>Qualification</TableHeadCell>
                              <TableHeadCell>Contacts</TableHeadCell>
                              <TableHeadCell>Joignables</TableHeadCell>
                              <TableHeadCell>Non joignables</TableHeadCell>
                              <TableHeadCell>Essais moyens</TableHeadCell>
                              <TableHeadCell>Taux</TableHeadCell>
                            </tr>
                          </thead>
                          <tbody className="[&_tr:last-child_td]:border-b-0">
                            {reachabilityByQualification.slice(0, 8).map((item) => (
                              <tr key={`qualification-${item.qualification_id ?? "none"}-${item.qualification_name}`}>
                                <TableCell className="font-medium text-[#102033]">{item.qualification_name}</TableCell>
                                <TableCell>{item.total_contacts}</TableCell>
                                <TableCell>{item.reachable_contacts}</TableCell>
                                <TableCell>{item.unreachable_contacts}</TableCell>
                                <TableCell>{item.avg_attempts_per_contact}</TableCell>
                                <TableCell className="font-semibold text-[#15795d]">{item.reachability_rate}%</TableCell>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </TableWrapper>
                  ) : (
                    <ReportingEmptyState message="Aucune ventilation par qualification disponible." />
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}

          {!isEmpty ? (
            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <Card className="border border-[#dce6f0] bg-white shadow-none">
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6c7f93]">
                      Evolution
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-[#102033]">
                      Timeline de joignabilite
                    </h2>
                  </div>

                  {reachabilityTimeline.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {reachabilityTimeline.slice(-8).map((item) => (
                        <div
                          key={`timeline-${item.date}`}
                          className="rounded-[1.2rem] border border-[#dce6f0] bg-[linear-gradient(180deg,#fbfdff_0%,#f6f9fd_100%)] px-4 py-4"
                        >
                          <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6c7f93]">
                            {formatDateLabel(item.date)}
                          </p>
                          <p className="mt-3 text-2xl font-semibold text-[#102033]">
                            {item.reachability_rate}%
                          </p>
                          <p className="mt-2 text-sm text-[#607287]">
                            {item.reachable_contacts} joignables / {item.attempted_contacts} tentes
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ReportingEmptyState message="Aucune evolution disponible sur la plage selectionnee." />
                  )}
                </CardContent>
              </Card>

              <Card className="border border-[#dce6f0] bg-white shadow-none">
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6c7f93]">
                      Echantillon contacts
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-[#102033]">
                      Derniers contacts analyses
                    </h2>
                  </div>

                  {reachabilityContacts?.data?.length ? (
                    <div className="space-y-4">
                      <TableWrapper className="border-[#dce6f0] bg-white shadow-none">
                        <div className="overflow-x-auto">
                          <Table className="min-w-[760px]">
                            <thead className="bg-[linear-gradient(180deg,#fbfdff_0%,#f5f9fd_100%)]">
                              <tr>
                                <TableHeadCell>Contact</TableHeadCell>
                                <TableHeadCell>Telephone</TableHeadCell>
                                <TableHeadCell>Essais</TableHeadCell>
                                <TableHeadCell>Dernier statut</TableHeadCell>
                                <TableHeadCell>Qualification</TableHeadCell>
                                <TableHeadCell>Campagne</TableHeadCell>
                              </tr>
                            </thead>
                            <tbody className="[&_tr:last-child_td]:border-b-0">
                              {reachabilityContacts.data.map((item) => (
                                <tr key={`contact-${item.contact_id}`}>
                                  <TableCell className="font-medium text-[#102033]">{item.contact_name}</TableCell>
                                  <TableCell>{item.phone ?? "—"}</TableCell>
                                  <TableCell>{item.attempts_count}</TableCell>
                                  <TableCell>{item.last_call_status ?? (item.never_called ? "JAMAIS_APPELE" : "—")}</TableCell>
                                  <TableCell>{item.last_qualification_name ?? "—"}</TableCell>
                                  <TableCell>{item.last_campaign_name ?? "—"}</TableCell>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      </TableWrapper>

                      <div className="flex flex-col gap-3 rounded-[1.2rem] border border-[#dce6f0] bg-[linear-gradient(180deg,#fbfdff_0%,#f7fafe_100%)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-[#526277]">
                          {contactsTotal > 0
                            ? `Affichage de ${contactsRangeStart} à ${contactsRangeEnd} sur ${contactsTotal} contacts`
                            : "Aucun contact à afficher"}
                        </p>
                        <div className="flex items-center justify-between gap-2 sm:justify-end">
                          <button
                            type="button"
                            className="inline-flex h-10 items-center justify-center rounded-full border border-[#dce6f0] px-4 text-sm font-medium text-[#102033] transition hover:border-[#b8c8d8] hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                            disabled={contactsCurrentPage <= 1}
                            onClick={() => void handleContactsPageChange(contactsCurrentPage - 1)}
                          >
                            Precedent
                          </button>
                          <div className="min-w-[108px] text-center text-sm font-medium text-[#102033]">
                            Page {contactsCurrentPage} / {contactsTotalPages}
                          </div>
                          <button
                            type="button"
                            className="inline-flex h-10 items-center justify-center rounded-full border border-[#dce6f0] px-4 text-sm font-medium text-[#102033] transition hover:border-[#b8c8d8] hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                            disabled={contactsCurrentPage >= contactsTotalPages}
                            onClick={() => void handleContactsPageChange(contactsCurrentPage + 1)}
                          >
                            Suivant
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <ReportingEmptyState message="Aucun contact detaille disponible pour cette plage." />
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      ) : null}
    </ReportingPageLayout>
  );
}
