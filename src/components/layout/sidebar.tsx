"use client";

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  BellRing,
  BookUser,
  CalendarCheck2,
  ChevronDown,
  DollarSign,
  FileUser,
  History,
  Headphones,
  LayoutDashboard,
  List,
  Megaphone,
  Settings,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useWorkspaceStore } from "@/features/workspace/store/workspace.store";
import { cn } from "@/lib/utils";

interface NavChildItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  disabled?: boolean;
  children?: NavChildItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface WorkspaceMeta {
  title: string;
  user: string;
  role: string;
  status: string;
  note: string;
  icon: LucideIcon;
  statusTone: string;
}

const adminSections: NavSection[] = [
  {
    title: "Vue",
    items: [
      { label: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
      { label: "Temps reel", href: "/admin/realtime", icon: Activity },
    ],
  },
  {
    title: "Production",
    items: [
      {
        label: "Campagnes",
        icon: Megaphone,
        children: [
          { label: "Liste des campagnes", href: "/admin/campaigns" },
          { label: "Qualifications", href: "/admin/campaigns/qualifications" },
          { label: "Leads", href: "/admin/campaigns/leads" },
        ],
      },
      { label: "Listes", href: "/admin/lists", icon: List },
      { label: "Ventes", href: "/admin/sales", icon: DollarSign },
      {
        label: "Data",
        icon: Users,
        children: [
          { label: "Imports", href: "/admin/imports" },
          { label: "Listes rouges", href: "/admin/blacklist" },
          { label: "Contacts", href: "/admin/contacts" },
        ],
      },
      { label: "Enregistrements", href: "/admin/recordings", icon: Headphones },
      {
        label: "Rapports",
        icon: BarChart3,
        children: [
          { label: "Vue globale", href: "/admin/reporting" },
          { label: "Productivite des agents", href: "/admin/reporting/agent-productivity" },
          { label: "Evolution de la prod", href: "/admin/reporting/production-evolution" },
          { label: "Statistiques DMC/DMT", href: "/admin/reporting/dmc-dmt" },
          { label: "Etat des qualifications", href: "/admin/reporting/qualification-status" },
          { label: "Qualification par agent", href: "/admin/reporting/qualification-by-agent" },
          { label: "Resultat des agents", href: "/admin/reporting/agent-results" },
          { label: "Historique des sessions", href: "/admin/reporting/session-history" },
          { label: "Joignabilite des contacts", href: "/admin/reporting/contact-reachability" },
          { label: "Rapport des pauses", href: "/admin/reporting/breaks-report" },
        ],
      },
    ],
  },
  {
    title: "Parametres",
    items: [
      { label: "Utilisateurs", href: "/admin/users", icon: ShieldCheck },
      { label: "Mon compte", href: "/admin/account", icon: BookUser },
      { label: "Parametres", href: "/admin/settings", icon: Settings },
      { label: "Tickets", href: "/admin/tickets", icon: Ticket },
    ],
  },
];

const supervisorSections: NavSection[] = [
  {
    title: "Vue",
    items: [
      { label: "Tableau de bord", href: "/supervisor", icon: LayoutDashboard },
      { label: "Temps reel", href: "/supervisor/monitoring", icon: Activity },
    ],
  },
  {
    title: "Production",
    items: [
      { label: "Campagnes", href: "/supervisor/campaigns", icon: Megaphone },
      { label: "Ventes", href: "/supervisor/sales", icon: DollarSign },
      {
        label: "Enregistrements",
        href: "/supervisor/recordings",
        icon: Headphones,
      },
      { label: "Rapports", href: "/supervisor/reporting", icon: BarChart3 },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Utilisateurs", icon: ShieldCheck, disabled: true },
      { label: "Parametres", icon: Settings, disabled: true },
    ],
  },
];

const agentSections: NavSection[] = [
  {
    title: "Production",
    items: [
      { label: "Fiche", href: "/agent", icon: FileUser },
      { label: "Rappels", href: "/agent/appointments", icon: BellRing },
      { label: "RDV", href: "/agent/rdv", icon: CalendarCheck2 },
      { label: "Historique", href: "/agent/calls", icon: History },
    ],
  },
];

const genericSections: NavSection[] = [
  {
    title: "Pilotage",
    items: [
      { label: "Admin", href: "/admin", icon: ShieldCheck },
      { label: "Supervision", href: "/supervisor", icon: Activity },
      { label: "Agent", href: "/agent", icon: Headphones },
    ],
  },
  {
    title: "CRM",
    items: [
      { label: "Contacts", href: "/crm/contacts", icon: Users },
      { label: "Leads", href: "/crm/leads", icon: Megaphone },
      { label: "Listes", href: "/crm/lists", icon: List },
    ],
  },
];

function isActive(pathname: string, href?: string) {
  if (!href) return false;
  if (href === "/supervisor" || href === "/admin" || href === "/agent") {
    return pathname === href;
  }
  return pathname.startsWith(href);
}

function hasActiveChild(pathname: string, children?: NavChildItem[]) {
  if (!children) return false;
  return children.some((child) => isActive(pathname, child.href));
}

function getWorkspaceMeta(pathname: string): WorkspaceMeta {
  if (pathname.startsWith("/admin")) {
    return {
      title: "Admin Control",
      user: "root admin",
      role: "Pilotage global",
      status: "12 modules actifs",
      note: "Configuration, imports et administration globale CRM.",
      icon: ShieldCheck,
      statusTone: "bg-[#f0b57d]/12 text-[#ffd8b5]",
    };
  }

  if (pathname.startsWith("/supervisor")) {
    return {
      title: "Supervisor Desk",
      user: "sup sup",
      role: "Superviseurs",
      status: "Session active",
      note: "Base stable pour la supervision temps reel.",
      icon: LayoutDashboard,
      statusTone: "bg-emerald-400/12 text-emerald-200",
    };
  }

  if (pathname.startsWith("/agent")) {
    return {
      title: "Agent Desk",
      user: "agent 014",
      role: "Production appels",
      status: "En pause",
      note: "Espace de traitement prospect et suivi des rappels.",
      icon: Headphones,
      statusTone: "bg-[#f0b57d]/12 text-[#ffd8b5]",
    };
  }

  return {
    title: "Powerline Hub",
    user: "workspace",
    role: "Navigation transverse",
    status: "Preview",
    note: "Bascule entre les workspaces CRM disponibles.",
    icon: LayoutDashboard,
    statusTone: "bg-[#2d6fcb]/18 text-[#b9d6ff]",
  };
}

export function Sidebar() {
  const pathname = usePathname();
  const appointments = useWorkspaceStore((state) => state.appointments);
  const historyEntries = useWorkspaceStore((state) => state.historyEntries);
  const isAdmin = pathname.startsWith("/admin");
  const isSupervisor = pathname.startsWith("/supervisor");
  const isAgent = pathname.startsWith("/agent");
  const sections = isAdmin
    ? adminSections
    : isSupervisor
      ? supervisorSections
      : isAgent
      ? agentSections
      : genericSections;
  const workspace = getWorkspaceMeta(pathname);
  const WorkspaceIcon = workspace.icon;
  const [openChildren, setOpenChildren] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenChildren((current) => {
      const next = { ...current };
      let changed = false;

      for (const section of sections) {
        for (const item of section.items) {
          if (!item.children) continue;
          const childActive = hasActiveChild(pathname, item.children);

          if (childActive && !next[item.label]) {
            next[item.label] = true;
            changed = true;
          }
        }
      }

      return changed ? next : current;
    });
  }, [pathname, sections]);

  return (
    <aside className="hidden shrink-0 lg:flex lg:w-[286px] xl:w-[304px] 2xl:w-[320px]">
      <div className="sticky top-2 flex h-[calc(100vh-1rem)] w-full flex-col rounded-[1.85rem] border border-[#122033] bg-[#0d1b2a] p-4 text-white shadow-[0_28px_80px_rgba(10,18,30,0.28)] xl:p-5">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.1rem] bg-[var(--accent)]/18 text-[#8fe6e0] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <WorkspaceIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.24em] text-white/42">
                Powerline CRM
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-col items-center rounded-[1.2rem] border border-white/10 bg-black/15 px-4 py-3.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <p className="text-sm font-semibold">{workspace.user}</p>
            <div
              className={cn(
                "mt-3 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.16em]",
                workspace.statusTone,
              )}
            >
              <span className="h-2 w-2 rounded-full bg-current opacity-90" />
              {workspace.status}
            </div>
          </div>
        </div>

        <nav className="mt-5 flex-1 space-y-6 overflow-y-auto pr-1">
          {sections.map((section) => (
            <div key={section.title} className="space-y-3">
              <p className="px-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-white/35">
                {section.title}
              </p>
              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(pathname, item.href);
                  const childActive = hasActiveChild(pathname, item.children);

                  if (item.children) {
                    const expanded = openChildren[item.label] ?? childActive;

                    return (
                      <div key={item.label} className="space-y-1.5">
                        <button
                          type="button"
                          className={cn(
                            "flex w-full items-center gap-3 rounded-[1.15rem] border px-3.5 py-3 text-left text-sm transition",
                            childActive
                              ? "border-white/12 bg-[linear-gradient(135deg,rgba(15,106,102,0.2)_0%,rgba(43,78,142,0.24)_100%)] text-white shadow-[0_14px_36px_rgba(15,106,102,0.12)]"
                              : "border-transparent text-white/72 hover:border-white/8 hover:bg-white/6 hover:text-white",
                          )}
                          onClick={() =>
                            setOpenChildren((current) => ({
                              ...current,
                              [item.label]: !(current[item.label] ?? childActive),
                            }))
                          }
                        >
                          <div
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-2xl",
                              childActive
                                ? "bg-white/12 text-[#9ee7e0]"
                                : "bg-white/8 text-white/75",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="flex-1">{item.label}</span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-white/45 transition-transform",
                              expanded && "rotate-180 text-white/72",
                            )}
                          />
                        </button>

                        <div
                          className={cn(
                            "grid transition-[grid-template-rows,opacity] duration-200",
                            expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                          )}
                        >
                          <div className="overflow-hidden">
                            <div className="mt-1 rounded-[1.1rem] border border-white/8 bg-black/12 p-2 pl-[1.15rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                              <div className="space-y-1.5 border-l border-white/10 pl-[1.2rem]">
                                {item.children.map((child) => {
                                  const childIsActive = isActive(pathname, child.href);

                                  return (
                                    <Link
                                      key={child.href}
                                      href={child.href}
                                      className={cn(
                                        "flex items-center gap-3 rounded-[1rem] border px-3 py-2.5 text-sm transition",
                                        childIsActive
                                          ? "border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(84,140,221,0.12)_100%)] text-white shadow-[0_12px_28px_rgba(10,18,30,0.18)]"
                                          : "border-transparent text-white/62 hover:border-white/8 hover:bg-white/6 hover:text-white/88",
                                      )}
                                    >
                                      <span
                                        className={cn(
                                          "h-2.5 w-2.5 rounded-full",
                                          childIsActive
                                            ? "bg-[#9ee7e0] shadow-[0_0_0_4px_rgba(158,231,224,0.12)]"
                                            : "bg-white/26",
                                        )}
                                      />
                                      <span className="flex-1">{child.label}</span>
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const itemClassName = cn(
                    "flex w-full items-center gap-3 rounded-[1.15rem] border px-3.5 py-3 text-left text-sm transition",
                    active
                      ? "border-white/12 bg-[linear-gradient(135deg,rgba(15,106,102,0.22)_0%,rgba(43,78,142,0.24)_100%)] text-white shadow-[0_14px_36px_rgba(15,106,102,0.14)]"
                      : "border-transparent text-white/72 hover:border-white/8 hover:bg-white/6 hover:text-white",
                    item.disabled &&
                      "cursor-not-allowed opacity-45 hover:border-transparent hover:bg-transparent",
                  );

                  const inner = (
                    <>
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-2xl",
                          active
                            ? "bg-white/12 text-[#9ee7e0]"
                            : "bg-white/8 text-white/75",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="flex-1">{item.label}</span>
                      {active ? (
                        <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9ee7e0]">
                          Actif
                        </span>
                      ) : null}
                    </>
                  );

                  if (item.href && !item.disabled) {
                    return (
                      <Link key={item.label} href={item.href} className={itemClassName}>
                        {inner}
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={item.label}
                      type="button"
                      className={itemClassName}
                      disabled
                    >
                      {inner}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {isAgent ? (
          <div className="mt-6 border-t border-white/8 pt-4">
            <p className="text-center font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-white/28">
              Production
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <div className="rounded-[0.95rem] border border-white/7 bg-black/10 px-3 py-3.5 text-center">
                <p className="text-[1.6rem] font-semibold leading-none text-white">
                  {appointments.length}
                </p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/42">
                  RDV
                </p>
              </div>
              <div className="rounded-[0.95rem] border border-white/7 bg-black/10 px-3 py-3.5 text-center">
                <p className="text-[1.6rem] font-semibold leading-none text-white">
                  {historyEntries.length}
                </p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/42">
                  Appels
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/6 p-4">
            <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-white/38">
              Monitoring systeme
            </p>
            <div className="mt-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">
                  {pathname.startsWith("/admin")
                    ? "Administration CRM"
                    : pathname.startsWith("/supervisor")
                      ? "Telephonie et CRM"
                      : "Navigation workspace"}
                </p>
                <p className="mt-1 text-sm text-white/48">{workspace.note}</p>
              </div>
              <div className="rounded-full bg-emerald-400/12 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-emerald-200">
                OK
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
