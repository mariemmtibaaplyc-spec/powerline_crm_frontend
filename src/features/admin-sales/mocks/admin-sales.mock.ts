import type { SalesAppointmentStatus } from "@/types/appointment.types";

export const SALES_STATUS_OPTIONS: Array<{
  value: SalesAppointmentStatus;
  label: string;
}> = [
  { value: "SCHEDULED", label: "Planifie" },
  { value: "DONE", label: "Realise" },
  { value: "CANCELLED", label: "Annule" },
  { value: "MISSED", label: "Manque" },
];
