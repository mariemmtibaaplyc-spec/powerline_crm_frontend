export function formatReportingDurationFromSeconds(totalSeconds: number) {
  const rounded = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;

  if (hours > 0) {
    return `${hours} h ${String(minutes).padStart(2, "0")} min`;
  }

  return `${minutes} min ${String(seconds).padStart(2, "0")} s`;
}

export function formatReportingCompactDurationFromSeconds(totalSeconds: number) {
  const rounded = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;

  if (hours > 0) {
    return `${hours}h${String(minutes).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatReportingPercentage(rawValue: number) {
  const percentage = Math.abs(rawValue) <= 1 ? rawValue * 100 : rawValue;

  return `${percentage.toLocaleString("fr-FR", {
    minimumFractionDigits: percentage % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 2,
  })}%`;
}

export function formatReportingCount(value: number) {
  return value.toLocaleString("fr-FR");
}
