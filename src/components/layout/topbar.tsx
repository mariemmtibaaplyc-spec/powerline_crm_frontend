"use client";

import {
  Activity,
  Bell,
  Clock3,
  Headphones,
  LogOut,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { AgentWorkspaceTopbar } from "@/components/workspace/agent-workspace-topbar";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useSessionStore } from "@/store/session.store";

const workspaces = [
  {
    match: "/supervisor",
    label: "Supervisor workspace",
    note: "Monitoring, campagnes et qualite",
    icon: Activity,
    search: "Rechercher un agent, une campagne ou une fiche...",
  },
  {
    match: "/agent",
    label: "Agent workspace",
    note: "Production, appels et fiche contact",
    icon: Headphones,
    search: "Rechercher une fiche, un rappel ou un historique...",
  },
  {
    match: "/admin",
    label: "Admin workspace",
    note: "Configuration, import et pilotage global",
    icon: ShieldCheck,
    search: "Rechercher un module, un ticket ou un import...",
  },
  {
    match: "/crm",
    label: "CRM workspace",
    note: "Contacts, leads et listes",
    icon: UserRound,
    search: "Rechercher un contact, un lead ou une liste...",
  },
];

export function Topbar() {
  const pathname = usePathname();
  const session = useSessionStore((state) => state.session);
  const authSession = useAuthStore((state) => state.session);
  const logout = useLogout();

  const isAgent = pathname.startsWith("/agent");
  const isAdmin = pathname.startsWith("/admin");
  const isSupervisor = pathname.startsWith("/supervisor");
  const showLogout = isAdmin || isSupervisor;

  const workspace =
    workspaces.find((item) => pathname.startsWith(item.match)) ?? workspaces[0];
  const WorkspaceIcon = workspace.icon;

  const sessionUser = session?.user ?? authSession?.user ?? null;

  const displayName = sessionUser
    ? `${sessionUser.firstName ?? ""} ${sessionUser.lastName ?? ""}`.trim() ||
      sessionUser.email ||
      "Utilisateur"
    : "Utilisateur";

  if (isAgent) {
    return <AgentWorkspaceTopbar />;
  }

  return (
    <div className="sticky top-2 z-20 rounded-[1.75rem] border border-[#15263a]/8 bg-[#0d1b2a]/96 px-4 py-4 text-white shadow-[0_24px_60px_rgba(12,18,30,0.24)] backdrop-blur-xl sm:px-5">
      <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#9ee7e0]">
            <WorkspaceIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.24em] text-white/42">
              Powerline Workspace
            </p>
            <h2 className="mt-1 truncate text-xl font-semibold">
              {workspace.label}
            </h2>
          </div>
          <div className="hidden rounded-full border border-white/10 bg-white/6 px-3 py-2 text-sm text-white/58 xl:flex xl:items-center xl:gap-2">
            <Clock3 className="h-4 w-4" />
            {workspace.note}
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-end">
          <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/45 2xl:flex 2xl:min-w-[340px] 3xl:min-w-[420px]">
            <Search className="h-4 w-4" />
            {workspace.search}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 text-sm text-white/78 transition hover:bg-white/12"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Actions rapides
            </button>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white/78 transition hover:bg-white/12"
            >
              <Bell className="h-4 w-4" />
            </button>
            <div className="inline-flex h-11 items-center rounded-full bg-white px-4 text-sm font-medium text-[#0d1b2a]">
              {displayName}
            </div>
            {showLogout && (
              <button
                type="button"
                onClick={logout}
                title="Se deconnecter"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white/78 transition hover:border-red-400/30 hover:bg-red-500/12 hover:text-red-300"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
