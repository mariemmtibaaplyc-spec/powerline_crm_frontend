import { REPORTING_STATUS_COLORS } from "./colors";

export function getReportingStatusTone(value: string) {
  const normalized = value.toLowerCase();

  if (
    normalized.includes("active") ||
    normalized.includes("online") ||
    normalized.includes("available") ||
    normalized.includes("connecte")
  ) {
    return REPORTING_STATUS_COLORS.active;
  }

  if (
    normalized.includes("pause") ||
    normalized.includes("break") ||
    normalized.includes("idle") ||
    normalized.includes("attente")
  ) {
    return REPORTING_STATUS_COLORS.pause;
  }

  if (
    normalized.includes("offline") ||
    normalized.includes("disconnected") ||
    normalized.includes("inactive")
  ) {
    return REPORTING_STATUS_COLORS.inactive;
  }

  return REPORTING_STATUS_COLORS.neutral;
}
