"use client";

import { useCallback, useState } from "react";
import { reportingApi } from "@/features/reporting/api/reporting.api";
import type {
  ReportingContactReachabilityByListItem,
  ReportingContactReachabilityByQualificationItem,
  ReportingContactReachabilityContactsData,
  ReportingContactReachabilityData,
  ReportingContactReachabilityTimelineItem,
  ReportingDashboardParams,
} from "@/types/reporting.types";

export function useContactReachabilityReporting() {
  const [contactReachabilityData, setContactReachabilityData] =
    useState<ReportingContactReachabilityData | null>(null);
  const [reachabilityByList, setReachabilityByList] =
    useState<ReportingContactReachabilityByListItem[]>([]);
  const [reachabilityByQualification, setReachabilityByQualification] =
    useState<ReportingContactReachabilityByQualificationItem[]>([]);
  const [reachabilityTimeline, setReachabilityTimeline] =
    useState<ReportingContactReachabilityTimelineItem[]>([]);
  const [reachabilityContacts, setReachabilityContacts] =
    useState<ReportingContactReachabilityContactsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReachabilityContacts = useCallback(
    async (params: ReportingDashboardParams = {}) => {
      const contacts = await reportingApi.getContactReachabilityContacts(params);
      setReachabilityContacts(contacts);
      return contacts;
    },
    [],
  );

  const loadContactReachability = useCallback(
    async (params: ReportingDashboardParams = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const [summary, byList, byQualification, timeline, contacts] = await Promise.all([
          reportingApi.getContactReachability(params),
          reportingApi.getContactReachabilityByList(params),
          reportingApi.getContactReachabilityByQualification(params),
          reportingApi.getContactReachabilityTimeline(params),
          loadReachabilityContacts(params),
        ]);
        setContactReachabilityData(summary);
        setReachabilityByList(byList);
        setReachabilityByQualification(byQualification);
        setReachabilityTimeline(timeline);
        setReachabilityContacts(contacts);
        return summary;
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger la joignabilite des contacts.";

        setError(message);
        throw loadError;
      } finally {
        setIsLoading(false);
      }
    },
    [loadReachabilityContacts],
  );

  return {
    contactReachabilityData,
    reachabilityByList,
    reachabilityByQualification,
    reachabilityTimeline,
    reachabilityContacts,
    isLoading,
    error,
    loadContactReachability,
    loadReachabilityContacts,
  };
}
