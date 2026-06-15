import { AgentCallControlPanel } from "@/components/workspace/agent-call-control-panel";
import { AgentQualificationPanel } from "@/components/workspace/agent-qualification-panel";
import { AppointmentForm } from "@/components/workspace/appointment-form";
import { ClientSheet } from "@/components/workspace/client-sheet";
import { QualificationForm } from "@/components/workspace/qualification-form";
import { AgentSessionFooter } from "@/components/workspace/agent-session-footer";

export function AgentWorkspace() {
  return (
    <section className="flex min-h-full flex-col gap-5 pb-36 lg:pb-40">
      <AgentCallControlPanel />

      <ClientSheet />

      <AgentQualificationPanel />

      <AppointmentForm />

      <QualificationForm />

      <AgentSessionFooter />
    </section>
  );
}
