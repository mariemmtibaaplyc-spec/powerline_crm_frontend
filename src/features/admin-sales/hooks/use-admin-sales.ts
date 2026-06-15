"use client";

import { useMemo } from "react";
import { MOCK_SALES_APPOINTMENTS } from "@/features/admin-sales/mocks/admin-sales.mock";
import { useWorkspaceStore } from "@/features/workspace/store/workspace.store";
import type { SalesAppointmentRecord } from "@/types/appointment.types";

export function useAdminSales() {
  const agentIdentity = useWorkspaceStore((state) => state.agentIdentity);
  const appointments = useWorkspaceStore((state) => state.appointments);

  const workspaceAppointments = useMemo<SalesAppointmentRecord[]>(() => {
    return appointments.map((appointment) => ({
      id: `workspace-${appointment.id}`,
      date: appointment.date,
      time: appointment.time,
      clientName: appointment.clientName,
      phone: appointment.phone,
      agentName: agentIdentity.fullName,
      campaign: appointment.campaign,
      team: appointment.queue,
      status: "scheduled",
      note: appointment.note,
      sourceList: "RDV workspace agent",
      sourceLabel: "Qualification agent",
    }));
  }, [agentIdentity.fullName, appointments]);

  const salesAppointments = useMemo(() => {
    return [...workspaceAppointments, ...MOCK_SALES_APPOINTMENTS].sort(
      (left, right) => {
        const leftKey = `${left.date}T${left.time}:00`;
        const rightKey = `${right.date}T${right.time}:00`;
        return rightKey.localeCompare(leftKey);
      },
    );
  }, [workspaceAppointments]);

  const byId = useMemo(() => {
    return new Map(salesAppointments.map((item) => [item.id, item]));
  }, [salesAppointments]);

  return {
    salesAppointments,
    getAppointmentById: (id: string) => byId.get(id) ?? null,
  };
}
