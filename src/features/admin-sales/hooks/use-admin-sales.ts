"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/axios";
import { campaignsApi } from "@/features/campaigns/api/campaigns.api";
import { usersApi } from "@/features/users/api/users.api";
import type { CampaignRecord } from "@/types/campaign.types";
import type { SalesAppointmentRecord, SalesAppointmentStatus } from "@/types/appointment.types";
import type { UserRecord } from "@/types/user.types";

type BackendAppointment = {
  id: number | string;
  scheduled_at?: string | null;
  status?: string | null;
  notes?: string | null;
  phone_number?: string | null;
  contact?: {
    id: number | string;
    first_name?: string | null;
    last_name?: string | null;
    phone?: string | null;
  } | null;
  lead?: {
    id: number | string;
    status?: string | null;
  } | null;
  agent?: {
    id: number | string;
    first_name?: string | null;
    last_name?: string | null;
  } | null;
  campaign?: {
    id: number | string;
    name?: string | null;
  } | null;
};

type BackendAppointmentsResponse = {
  data?: BackendAppointment[];
  meta?: {
    total?: number;
    page?: number;
    last_page?: number;
  };
};

type UseAdminSalesFilters = {
  periodMode: "day" | "month";
  selectedDate: string;
  selectedMonth: string;
  agentFilter: string;
  campaignFilter: string;
  statusFilter: "all" | SalesAppointmentStatus;
};

function collectDuplicateIds<T extends { id: string | number }>(items: T[]) {
  const counts = new Map<string, number>();

  for (const item of items) {
    const key = String(item.id);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([id, count]) => ({ id, count }));
}

function dedupeById<T extends { id: string | number }>(
  items: T[],
  source: "appointments" | "users" | "campaigns",
) {
  const duplicates = collectDuplicateIds(items);

  if (duplicates.length > 0) {
    console.warn(`[admin-sales] duplicate ${source} ids detected`, duplicates);
  }

  const seen = new Set<string>();

  return items.filter((item) => {
    const key = String(item.id);
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function formatDatePart(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimePart(value: Date) {
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatPersonName(
  value:
    | {
        first_name?: string | null;
        last_name?: string | null;
      }
    | null
    | undefined,
) {
  const fullName = `${value?.first_name ?? ""} ${value?.last_name ?? ""}`.trim();
  return fullName || null;
}

function buildDayBounds(value: string) {
  return {
    start: `${value}T00:00:00`,
    end: `${value}T23:59:59.999`,
  };
}

function buildMonthBounds(value: string) {
  const [yearValue, monthValue] = value.split("-");
  const year = Number(yearValue);
  const monthIndex = Number(monthValue) - 1;

  if (!Number.isFinite(year) || !Number.isFinite(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return null;
  }

  const start = new Date(year, monthIndex, 1, 0, 0, 0, 0);
  const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

  return {
    start: `${formatDatePart(start)}T00:00:00`,
    end: `${formatDatePart(end)}T23:59:59.999`,
  };
}

function normalizeStatus(value: string | null | undefined): SalesAppointmentStatus {
  if (value === "DONE" || value === "CANCELLED" || value === "MISSED") {
    return value;
  }

  return "SCHEDULED";
}

function buildAppointmentMap(
  appointment: BackendAppointment,
  usersById: Map<string, UserRecord>,
): SalesAppointmentRecord {
  const scheduledAt = appointment.scheduled_at ?? new Date().toISOString();
  const scheduledDate = new Date(scheduledAt);
  const contactName = formatPersonName(appointment.contact);
  const agentName = formatPersonName(appointment.agent) ?? "Agent inconnu";
  const agentId = appointment.agent?.id !== undefined ? String(appointment.agent.id) : "unknown";
  const team = usersById.get(agentId)?.team ?? "Non assignee";
  const phone =
    appointment.contact?.phone?.trim() ||
    appointment.phone_number?.trim() ||
    "Non renseigne";
  const clientName =
    contactName ||
    phone ||
    `Prospect #${appointment.id}`;

  return {
    id: String(appointment.id),
    scheduledAt,
    date: formatDatePart(scheduledDate),
    time: formatTimePart(scheduledDate),
    clientName,
    phone,
    agentId,
    agentName,
    campaignId:
      appointment.campaign?.id === null || appointment.campaign?.id === undefined
        ? null
        : String(appointment.campaign.id),
    campaign: appointment.campaign?.name?.trim() || "Sans campagne",
    team,
    status: normalizeStatus(appointment.status),
    note: appointment.notes?.trim() || "Aucune note renseignee.",
    contactLabel: appointment.contact
      ? `Contact CRM #${appointment.contact.id}`
      : "Prospect sans fiche CRM",
    leadLabel: appointment.lead?.status?.trim()
      ? `Lead ${appointment.lead.status.trim()}`
      : "Aucun lead associe",
  };
}

async function fetchAppointmentsPage(
  filters: UseAdminSalesFilters,
  page: number,
): Promise<BackendAppointmentsResponse> {
  const params: Record<string, string | number> = {
    page,
    limit: 100,
  };

  if (filters.periodMode === "day" && filters.selectedDate) {
    const bounds = buildDayBounds(filters.selectedDate);
    params.start_date = bounds.start;
    params.end_date = bounds.end;
  }

  if (filters.periodMode === "month" && filters.selectedMonth) {
    const bounds = buildMonthBounds(filters.selectedMonth);
    if (bounds) {
      params.start_date = bounds.start;
      params.end_date = bounds.end;
    }
  }

  if (filters.agentFilter !== "all") {
    params.agent_id = filters.agentFilter;
  }

  if (filters.campaignFilter !== "all") {
    params.campaign_id = filters.campaignFilter;
  }

  if (filters.statusFilter !== "all") {
    params.status = filters.statusFilter;
  }

  const { data } = await apiClient.get<BackendAppointmentsResponse>("/appointments", {
    params,
  });

  return data;
}

async function fetchAllAppointments(filters: UseAdminSalesFilters) {
  const firstPage = await fetchAppointmentsPage(filters, 1);
  const rows = [...(firstPage.data ?? [])];
  const lastPage = Math.max(1, firstPage.meta?.last_page ?? 1);

  for (let page = 2; page <= lastPage; page += 1) {
    const nextPage = await fetchAppointmentsPage(filters, page);
    rows.push(...(nextPage.data ?? []));
  }

  return dedupeById(rows, "appointments");
}

export function useAdminSales(
  filters: UseAdminSalesFilters,
  workspace: "admin" | "supervisor" = "admin",
) {
  const [appointments, setAppointments] = useState<SalesAppointmentRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      try {
        const [nextUsers, nextCampaigns] = await Promise.all(
          workspace === "supervisor"
            ? [Promise.resolve([] as UserRecord[]), campaignsApi.getCampaigns()]
            : [usersApi.getUsers(), campaignsApi.getCampaigns()],
        );

        if (!active) {
          return;
        }

        setUsers(dedupeById(nextUsers, "users"));
        setCampaigns(dedupeById(nextCampaigns, "campaigns"));
      } catch (loadError) {
        if (!active) {
          return;
        }

        const message =
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger les filtres rendez-vous.";
        setError(message);
      }
    }

    void loadOptions();

    return () => {
      active = false;
    };
  }, [workspace]);

  const usersById = useMemo(
    () => new Map(users.map((user) => [user.id, user])),
    [users],
  );

  useEffect(() => {
    let active = true;

    async function loadAppointments() {
      setLoading(true);
      setError(null);

      try {
        const rows = await fetchAllAppointments(filters);

        if (!active) {
          return;
        }

        const mappedRows = rows
          .map((appointment) => buildAppointmentMap(appointment, usersById))
          .sort((left, right) => right.scheduledAt.localeCompare(left.scheduledAt));

        setAppointments(mappedRows);
      } catch (loadError) {
        if (!active) {
          return;
        }

        const message =
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger les rendez-vous pour le moment.";
        setError(message);
        setAppointments([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadAppointments();

    return () => {
      active = false;
    };
  }, [filters, usersById]);

  return {
    salesAppointments: appointments,
    agents:
      workspace === "supervisor"
        ? Array.from(
            appointments.reduce((map, item) => {
              if (!map.has(item.agentId)) {
                map.set(item.agentId, {
                  id: item.agentId,
                  label: item.agentName,
                  team: item.team,
                });
              }
              return map;
            }, new Map<string, { id: string; label: string; team: string }>()),
          )
            .map(([, value]) => value)
            .sort((left, right) => left.label.localeCompare(right.label))
        : users
            .map((user) => ({
              id: user.id,
              label: `${user.firstName} ${user.lastName}`.trim() || user.username,
              team: user.team,
            }))
            .sort((left, right) => left.label.localeCompare(right.label)),
    campaigns: campaigns
      .map((campaign) => ({
        id: campaign.id,
        label: campaign.name,
      }))
      .sort((left, right) => left.label.localeCompare(right.label)),
    loading,
    error,
  };
}

export function useAdminSaleDetail(
  saleId: string,
  workspace: "admin" | "supervisor" = "admin",
) {
  const [appointment, setAppointment] = useState<SalesAppointmentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAppointment() {
      setLoading(true);
      setError(null);

      try {
        const [{ data }, users] = await Promise.all([
          apiClient.get<BackendAppointment>(`/appointments/${saleId}`),
          workspace === "supervisor" ? Promise.resolve([] as UserRecord[]) : usersApi.getUsers(),
        ]);

        if (!active) {
          return;
        }

        const usersById = new Map(users.map((user) => [user.id, user]));
        setAppointment(buildAppointmentMap(data, usersById));
      } catch (loadError) {
        if (!active) {
          return;
        }

        const message =
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger ce rendez-vous.";
        setError(message);
        setAppointment(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadAppointment();

    return () => {
      active = false;
    };
  }, [saleId, workspace]);

  return {
    appointment,
    loading,
    error,
  };
}
