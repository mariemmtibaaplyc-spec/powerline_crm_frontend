import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  PhoneCall,
  Users,
} from "lucide-react";
import { CampaignsTable } from "@/components/campaigns/campaigns-table";
import { PageHeader } from "@/components/layout/page-header";
import { AgentsLiveTable } from "@/components/monitoring/agents-live-table";
import { CallsChart } from "@/components/reporting/calls-chart";
import { ReportingFilters } from "@/components/reporting/reporting-filters";
import { StatsCard } from "@/components/reporting/stats-card";

const kpis = [
  {
    label: "Joignabilite",
    value: "84.6%",
    caption: "Nouvelle campagne et NAT ISA",
    delta: "+3.2 pts",
    tone: "blue" as const,
    icon: <PhoneCall className="h-5 w-5" />,
  },
  {
    label: "Taux d'abandon",
    value: "20.25%",
    caption: "Volume d'abandons sur l'heure",
    delta: "-1.4 pts",
    tone: "navy" as const,
    icon: <Activity className="h-5 w-5" />,
  },
  {
    label: "Fiches disponibles",
    value: "6,695",
    caption: "Fiches minimales detectees",
    delta: "NAT ISA",
    tone: "amber" as const,
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: "Attente max",
    value: "32 s",
    caption: "SLA plateau sur la file active",
    delta: "Stable",
    tone: "teal" as const,
    icon: <Clock3 className="h-5 w-5" />,
  },
];

const chartData = [
  { label: "NAT ISA", value: 6695, note: "Maximum" },
  { label: "Natis", value: 26687, note: "Normal" },
  { label: "Nouvelle", value: 29484, note: "Personnalise" },
  { label: "Partie 2", value: 21157, note: "Personnalise" },
  { label: "Partie 3", value: 22228, note: "Personnalise" },
];

const campaignRows = [
  {
    campaign: "NAT ISA",
    pace: "Maximum",
    available: 6695,
    wait: "0 s",
    team: "NAT ISA",
  },
  {
    campaign: "Natis",
    pace: "Normal",
    available: 26687,
    wait: "22 s",
    team: "Natis",
  },
  {
    campaign: "Nouvelle campagne",
    pace: "Personnalise",
    available: 29484,
    wait: "0 s",
    team: "Nouveau lot",
  },
  {
    campaign: "Partie 2",
    pace: "Personnalise",
    available: 21157,
    wait: "31 s",
    team: "Segment B",
  },
];

const liveAgents = [
  {
    name: "Meriem Abassi",
    campaign: "Fibre Pro",
    status: "En appel",
    occupancy: "92%",
    quality: "96%",
  },
  {
    name: "Sami Ben Ali",
    campaign: "NAT ISA",
    status: "Qualification",
    occupancy: "81%",
    quality: "93%",
  },
  {
    name: "Ines Trabelsi",
    campaign: "Natis",
    status: "Disponible",
    occupancy: "64%",
    quality: "98%",
  },
  {
    name: "Nour Haddad",
    campaign: "Partie 2",
    status: "Rappel",
    occupancy: "73%",
    quality: "91%",
  },
];

const teams = [
  { name: "Equipe Nord", calls: "214 appels", service: 96, color: "bg-[#1d5fc0]" },
  { name: "Equipe Centre", calls: "187 appels", service: 88, color: "bg-[#0f6a66]" },
  { name: "Equipe Sud", calls: "159 appels", service: 81, color: "bg-[#d37a3a]" },
];

const alerts = [
  {
    title: "File NAT ISA sous pression",
    note: "15 appels depassent 25 secondes d'attente.",
    tone: "warning",
  },
  {
    title: "Controle qualite valide",
    note: "Le taux de conformite remonte a 96% sur l'heure.",
    tone: "success",
  },
  {
    title: "Import de liste termine",
    note: "12 400 contacts ont ete injectes dans le lot B2B avril.",
    tone: "info",
  },
];

export default function Page() {
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Supervisor workspace"
        title="Tableau de bord"
        description="Vue temps reel de la production, de la charge des campagnes et de la performance des equipes de supervision."
        actions={
          <>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f0b57d]/22 bg-[#fff6ed] px-3 py-2 text-sm font-medium text-[#8a5425] shadow-[0_8px_18px_rgba(227,165,109,0.1)]">
              <span className="h-2 w-2 rounded-full bg-[#e3a56d]" />
              Live 18 agents
            </span>
            <span className="rounded-full border border-[#d6e1ec] bg-white px-3 py-2 text-sm font-medium text-[#24415d]">
              Plateau EMY ecologie
            </span>
            <span className="rounded-full bg-[#eaf4ff] px-3 py-2 text-sm font-medium text-[#27518f]">
              Sync 12:04
            </span>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <StatsCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            caption={kpi.caption}
            delta={kpi.delta}
            tone={kpi.tone}
            icon={kpi.icon}
          />
        ))}
      </div>

      <ReportingFilters
        filters={[
          { label: "Plateau", value: "EMY ecologie" },
          { label: "Campagne", value: "NAT ISA" },
          { label: "Periode", value: "Aujourd'hui" },
        ]}
        actions={[
          { label: "Selectionner" },
          { label: "Filtrer", primary: true },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[1.14fr_0.86fr] 2xl:grid-cols-[1.18fr_0.92fr]">
        <CallsChart
          title="Contacts disponibles par campagne"
          subtitle="Projection statique de la disponibilite actuelle pour la supervision."
          data={chartData}
        />
        <CampaignsTable
          title="Recapitulatif des campagnes"
          subtitle="Disponibilite, vitesse de traitement et attente maximale sur le plateau."
          rows={campaignRows}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-[0.95fr_1.1fr_0.85fr]">
        <div className="relative overflow-hidden rounded-[1.8rem] border border-[#dce6f0] bg-white p-5 shadow-[0_14px_34px_rgba(20,32,53,0.06)] sm:p-6">
          <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 bg-[radial-gradient(circle,rgba(227,165,109,0.16),transparent_72%)] blur-2xl" />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#102033]">
                Equipes et occupation
              </h3>
              <p className="mt-1 text-sm text-[#65788c]">
                Lecture rapide du service level et de la charge par equipe.
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5fb] text-[#27518f]">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {teams.map((team) => (
              <div key={team.name} className="space-y-2.5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#102033]">
                      {team.name}
                    </p>
                    <p className="mt-1 text-sm text-[#65788c]">{team.calls}</p>
                  </div>
                  <span className="rounded-full bg-[#fff3e7] px-3 py-1 text-xs font-medium text-[#8a5425]">
                    SLA {team.service}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-[#edf3f8]">
                  <div
                    className={`${team.color} h-full rounded-full`}
                    style={{ width: `${team.service}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.3rem] border border-[#edf2f7] bg-[linear-gradient(180deg,#f8fbff_0%,#f5f9fd_100%)] p-4">
              <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[#6b7e92]">
                Appels traites
              </p>
              <p className="mt-3 text-2xl font-semibold text-[#102033]">560</p>
              <p className="mt-2 text-sm text-[#8a5425]">
                +12% sur la derniere heure
              </p>
            </div>
            <div className="rounded-[1.3rem] border border-[#edf2f7] bg-[linear-gradient(180deg,#f8fbff_0%,#f5f9fd_100%)] p-4">
              <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[#6b7e92]">
                RDV confirmes
              </p>
              <p className="mt-3 text-2xl font-semibold text-[#102033]">42</p>
              <p className="mt-2 text-sm text-[#0f6a66]">
                8 confirmations sur la file chaude
              </p>
            </div>
          </div>
        </div>

        <AgentsLiveTable
          title="Agents en supervision"
          subtitle="Statut live, campagne rattachee et qualite de traitement."
          rows={liveAgents}
        />

        <div className="relative overflow-hidden rounded-[1.8rem] border border-[#dce6f0] bg-white p-5 shadow-[0_14px_34px_rgba(20,32,53,0.06)] sm:p-6">
          <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 bg-[radial-gradient(circle,rgba(227,165,109,0.16),transparent_72%)] blur-2xl" />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#102033]">
                Flux supervision
              </h3>
              <p className="mt-1 text-sm text-[#65788c]">
                Evenements et alertes a surveiller sur le plateau.
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff4ea] text-[#c56e34]">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.title}
                className={`rounded-[1.35rem] border p-4 ${
                  alert.tone === "warning"
                    ? "border-[#f3d7bf] bg-[#fff8f1]"
                    : alert.tone === "success"
                      ? "border-[#cfeee4] bg-[#f3fcf8]"
                      : "border-[#d9e8fb] bg-[#f6faff]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 h-2.5 w-2.5 rounded-full ${
                      alert.tone === "warning"
                        ? "bg-[#d37a3a]"
                        : alert.tone === "success"
                          ? "bg-[#0f8b6d]"
                          : "bg-[#2d6fcb]"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#102033]">
                      {alert.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[#65788c]">
                      {alert.note}
                    </p>
                    <div className="mt-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          alert.tone === "warning"
                            ? "bg-[#ffe9d4] text-[#9d5f2a]"
                            : alert.tone === "success"
                              ? "bg-[#dcfbf1] text-[#0f6a66]"
                              : "bg-[#eaf4ff] text-[#295086]"
                        }`}
                      >
                        {alert.tone === "warning"
                          ? "Action requise"
                          : alert.tone === "success"
                            ? "Controle valide"
                            : "Mise a jour"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[1.35rem] border border-[#f0b57d]/18 bg-[linear-gradient(180deg,#16304a_0%,#203a56_100%)] p-4 text-white shadow-[0_18px_34px_rgba(20,32,53,0.18)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f0b57d]/16 text-[#ffe3c6]">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Focus du jour</p>
                <p className="mt-1 text-sm text-white/62">
                  Priorite au traitement NAT ISA et au suivi des rappels.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
