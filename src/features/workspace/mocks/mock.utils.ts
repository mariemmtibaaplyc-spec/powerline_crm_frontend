import type { ProspectSheet } from "@/types/workspace.types";

export function formatInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function shiftDate(baseDate: string, dayOffset: number) {
  const date = new Date(`${baseDate}T00:00:00`);
  date.setDate(date.getDate() + dayOffset);

  return formatInputDate(date);
}

export function prospectFullName(prospect: ProspectSheet) {
  return `${prospect.firstName} ${prospect.lastName}`;
}
