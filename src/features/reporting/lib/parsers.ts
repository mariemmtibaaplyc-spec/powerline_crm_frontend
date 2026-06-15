import type {
  ReportingPrimitive,
  ReportingValue,
} from "@/types/reporting.types";

export type ReportingRecord = Record<string, ReportingValue | undefined>;

export function isReportingPrimitive(
  value: ReportingValue | undefined,
): value is ReportingPrimitive {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

export function isReportingRecord(
  value: ReportingValue | undefined,
): value is ReportingRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function normalizeReportingKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getReportingKeySegments(value: string) {
  return value
    .split(/[._\s-]+/)
    .map((segment) => normalizeReportingKey(segment))
    .filter(Boolean);
}

export function scoreReportingMetricAliasMatch(metricKey: string, alias: string) {
  const normalizedKey = normalizeReportingKey(metricKey);
  const normalizedAlias = normalizeReportingKey(alias);
  const segments = getReportingKeySegments(metricKey);

  if (!normalizedAlias) {
    return -1;
  }

  if (normalizedKey === normalizedAlias) {
    return 500;
  }

  if ((segments[segments.length - 1] ?? "") === normalizedAlias) {
    return 450;
  }

  if (segments.includes(normalizedAlias)) {
    return 400;
  }

  if (normalizedKey.endsWith(normalizedAlias)) {
    return 300;
  }

  if (normalizedKey.includes(normalizedAlias)) {
    return 200;
  }

  return -1;
}

export function collectReportingPrimitiveMetrics(
  value: ReportingValue | undefined,
  path: string[] = [],
  depth = 0,
): Array<{ key: string; value: ReportingPrimitive }> {
  if (value === undefined) {
    return [];
  }

  if (isReportingPrimitive(value)) {
    return [{ key: path.join("."), value }];
  }

  if (Array.isArray(value) || depth > 3) {
    return [];
  }

  return Object.entries(value).flatMap(([key, entryValue]) =>
    collectReportingPrimitiveMetrics(entryValue, [...path, key], depth + 1),
  );
}

export function parseReportingNumericValue(value: ReportingPrimitive | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const sanitized = value.trim().replace(",", ".");
  if (!sanitized) {
    return null;
  }

  const numeric = Number(sanitized.replace(/[^\d.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
}

export function pickReportingValueByAliases(
  source: ReportingValue | undefined,
  aliases: string[],
): ReportingPrimitive | undefined {
  const metrics = collectReportingPrimitiveMetrics(source);
  let bestValue: ReportingPrimitive | undefined;
  let bestScore = -1;

  for (const [aliasIndex, alias] of aliases.entries()) {
    for (const metric of metrics) {
      const score = scoreReportingMetricAliasMatch(metric.key, alias);

      if (score < 0) {
        continue;
      }

      const weightedScore = score - aliasIndex;
      if (weightedScore > bestScore) {
        bestScore = weightedScore;
        bestValue = metric.value;
      }
    }
  }

  return bestValue;
}

export function toReportingRecordArray(value: ReportingValue | undefined): ReportingRecord[] {
  if (Array.isArray(value)) {
    return value.filter(isReportingRecord);
  }

  if (!isReportingRecord(value)) {
    return [];
  }

  const aliases = ["items", "rows", "data", "agents", "results", "list"];
  for (const alias of aliases) {
    const nested = value[alias];
    if (Array.isArray(nested)) {
      return nested.filter(isReportingRecord);
    }
  }

  return [];
}

export function averageReportingNumbers(values: Array<number | null>) {
  const validValues = values.filter((value): value is number => value !== null);
  if (validValues.length === 0) {
    return null;
  }

  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
}
