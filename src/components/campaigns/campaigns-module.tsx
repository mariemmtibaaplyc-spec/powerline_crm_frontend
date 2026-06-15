"use client";

import { Layers3, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CAMPAIGN_STATUS_OPTIONS, CAMPAIGN_TYPE_OPTIONS, getCampaignTypeLabel } from "@/features/campaigns/mocks/campaigns.mock";
import { useCampaigns } from "@/features/campaigns/hooks/use-campaigns";
import type { CampaignStatus, CampaignType } from "@/types/campaign.types";
import { AdminCampaignsTable } from "@/components/campaigns/admin-campaigns-table";
import { CampaignStatusBadge } from "@/components/campaigns/campaign-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function CampaignsModule() {
  const {
    campaigns,
    hasLoadedCampaigns,
    isLoadingCampaigns,
    campaignsError,
    togglingCampaignIds,
    toggleCampaignError,
    loadCampaigns,
    activateCampaign,
    deactivateCampaign,
  } = useCampaigns();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | CampaignType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | CampaignStatus>("all");

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

  const filteredCampaigns = useMemo(() => {
    const query = search.trim().toLowerCase();

    return campaigns.filter((campaign) => {
      const matchesSearch =
        query.length === 0 ||
        campaign.name.toLowerCase().includes(query) ||
        campaign.description?.toLowerCase().includes(query) ||
        campaign.id.toLowerCase().includes(query);

      const matchesType = typeFilter === "all" || campaign.type === typeFilter;
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [campaigns, search, statusFilter, typeFilter]);

  const activeCount = campaigns.filter((campaign) => campaign.status === "active").length;
  const totalLeads = campaigns.reduce((sum, campaign) => sum + campaign.leadsCount, 0);

  const handleActivate = async (id: string) => {
    if (!window.confirm("Confirmer l activation ?")) {
      return;
    }

    await activateCampaign(id);
  };

  const handleDeactivate = async (id: string) => {
    if (!window.confirm("Confirmer la desactivation ?")) {
      return;
    }

    await deactivateCampaign(id);
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Campagnes"
        description="Vue admin des campagnes synchronisees depuis le backend avec filtres locaux et compteurs de production."
        actions={
          <>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7f3] bg-white px-3 py-2 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)]">
              <Layers3 className="h-4 w-4 text-[#295086]" />
              {campaigns.length} campagnes
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d9eee9] bg-[#f3fbf8] px-3 py-2 text-sm font-medium text-[#0f6a66] shadow-[0_10px_22px_rgba(15,106,102,0.08)]">
              {activeCount} actives
            </span>
            <Link
              href="/admin/campaigns/new"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-medium text-[var(--primary-foreground)] shadow-[0_18px_40px_rgba(36,80,166,0.22)] transition hover:-translate-y-0.5 hover:opacity-95"
            >
              <Plus className="h-4 w-4" />
              Creer une campagne
            </Link>
          </>
        }
      />

      <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
        <CardContent className="space-y-5 pt-6">
          <div className="grid gap-3 xl:grid-cols-[1.2fr_220px_220px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8da3]" />
              <Input
                value={search}
                className="pl-11"
                placeholder="Rechercher par nom, description ou identifiant..."
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <Select
              value={typeFilter}
              className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
              onChange={(event) => setTypeFilter(event.target.value as "all" | CampaignType)}
            >
              <option value="all">Tous les types</option>
              {CAMPAIGN_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              value={statusFilter}
              className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
              onChange={(event) => setStatusFilter(event.target.value as "all" | CampaignStatus)}
            >
              <option value="all">Tous les statuts</option>
              {CAMPAIGN_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <SummaryCard
              label="Campagnes filtrees"
              value={String(filteredCampaigns.length)}
              detail="Vue active du portefeuille admin"
            />
            <SummaryCard
              label="Leads exploites"
              value={totalLeads.toLocaleString("fr-FR")}
              detail="Volume total retourne par le backend"
            />
            <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">Filtre courant</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#eef6ff] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#295086]">
                  {typeFilter === "all" ? "Tous types" : getCampaignTypeLabel(typeFilter)}
                </span>
                {statusFilter !== "all" ? <CampaignStatusBadge status={statusFilter} /> : null}
              </div>
            </div>
          </div>

          {toggleCampaignError ? (
            <div className="rounded-[1.25rem] border border-[#f0d8de] bg-[#fff8fa] px-4 py-3 text-sm text-[#8a5a67]">
              {toggleCampaignError}
            </div>
          ) : null}

          {campaignsError ? (
            <div className="rounded-[1.5rem] border border-dashed border-[#f0d8de] bg-[#fff8fa] px-6 py-12 text-center">
              <p className="text-base font-semibold text-[#102033]">Impossible de charger les campagnes.</p>
              <p className="mt-2 text-sm text-[#8a5a67]">{campaignsError}</p>
            </div>
          ) : isLoadingCampaigns && !hasLoadedCampaigns ? (
            <div className="rounded-[1.5rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-6 py-12 text-center">
              <p className="text-base font-semibold text-[#102033]">Chargement des campagnes en cours...</p>
              <p className="mt-2 text-sm text-[#607287]">La liste est recuperee depuis le backend.</p>
            </div>
          ) : filteredCampaigns.length > 0 ? (
            <AdminCampaignsTable
              campaigns={filteredCampaigns}
              togglingCampaignIds={togglingCampaignIds}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
            />
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-6 py-12 text-center">
              <p className="text-base font-semibold text-[#102033]">Aucune campagne ne correspond aux filtres actuels.</p>
              <p className="mt-2 text-sm text-[#607287]">
                Ajuste la recherche ou les filtres pour retrouver une campagne synchronisee.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#102033]">{value}</p>
      <p className="mt-1 text-sm text-[#607287]">{detail}</p>
    </div>
  );
}
