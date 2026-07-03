import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { AgentWorkspaceProvider } from "@/components/workspace/agent-workspace-provider";

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <AgentWorkspaceProvider>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(15,106,102,0.08),transparent_20%),radial-gradient(circle_at_top_right,rgba(43,78,142,0.08),transparent_22%),linear-gradient(180deg,#f6f9fc_0%,#edf3f8_100%)] px-2 py-2 sm:px-2.5 sm:py-2.5 lg:px-3 lg:py-3">
        <div className="flex min-h-[calc(100vh-0.5rem)] w-full gap-2.5 lg:gap-3 xl:gap-4">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col gap-3 lg:gap-4">
            <Topbar />
            <main className="min-w-0 flex-1 rounded-[1.55rem] border border-[#d9e4f0] bg-[#f7fbff] p-3.5 shadow-[0_20px_50px_rgba(20,32,53,0.08)] sm:p-4 lg:p-5 xl:p-6 2xl:p-7">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AgentWorkspaceProvider>
  );
}
