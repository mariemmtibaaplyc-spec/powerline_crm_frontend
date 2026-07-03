import axios from "axios";
import { apiClient } from "@/lib/axios";
import type { RecordingRecord, RecordingStatus } from "@/types/recording.types";

type BackendRecordingStatus = "PROCESSING" | "AVAILABLE" | "FAILED" | "EXPIRED";

type BackendRecording = {
  id: number | string;
  filename?: string | null;
  duration?: number | null;
  duration_formatted?: string | null;
  status?: BackendRecordingStatus | null;
  uploaded_at?: string | null;
  created_at?: string | null;
  stream_url?: string | null;
  download_url?: string | null;
  call?: {
    id: number;
    phone_number: string;
    status?: string | null;
    started_at?: string | null;
  } | null;
  agent?: {
    first_name?: string | null;
    last_name?: string | null;
    username?: string | null;
  } | null;
  campaign?: {
    id: number | string;
    name?: string | null;
  } | null;
  contact?: {
    first_name?: string | null;
    last_name?: string | null;
    phone?: string | null;
  } | null;
  list?: {
    id: number | string;
    name?: string | null;
  } | null;
  contact_display_name?: string | null;
  agent_display_name?: string | null;
};

type BackendRecordingsResponse = {
  data?: BackendRecording[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    pages?: number;
  };
};

function normalizeStatus(status: BackendRecordingStatus | null | undefined): RecordingStatus {
  if (status === "AVAILABLE") return "available";
  if (status === "FAILED") return "failed";
  if (status === "EXPIRED") return "expired";
  return "processing";
}

function formatDatePart(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimePart(value: Date) {
  return value.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDisplayName(parts: Array<string | null | undefined>, fallback: string) {
  const fullName = parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

  return fullName || fallback;
}

function buildNote(recording: BackendRecording) {
  const callStatus = recording.call?.status?.trim();
  const listName = recording.list?.name?.trim();
  const filename = recording.filename?.trim();

  if (callStatus && listName) {
    return `Statut appel: ${callStatus} • Liste: ${listName}`;
  }

  if (callStatus) {
    return `Statut appel: ${callStatus}`;
  }

  if (listName) {
    return `Liste: ${listName}`;
  }

  if (filename) {
    return `Fichier: ${filename}`;
  }

  return "Enregistrement disponible.";
}

function mapBackendRecording(recording: BackendRecording): RecordingRecord {
  const referenceDate =
    recording.call?.started_at ??
    recording.uploaded_at ??
    recording.created_at ??
    new Date().toISOString();
  const parsedDate = new Date(referenceDate);
  const agentName =
    recording.agent_display_name?.trim() ||
    formatDisplayName(
      [recording.agent?.first_name, recording.agent?.last_name],
      recording.agent?.username?.trim() || "Agent inconnu",
    );
  const phone =
    recording.contact?.phone?.trim() ||
    recording.call?.phone_number?.trim() ||
    "Numero indisponible";
  const clientName =
    recording.contact_display_name?.trim() ||
    formatDisplayName(
      [recording.contact?.first_name, recording.contact?.last_name],
      phone,
    );

  return {
    id: String(recording.id),
    date: formatDatePart(parsedDate),
    time: formatTimePart(parsedDate),
    agentName,
    clientName,
    phone,
    campaign: recording.campaign?.name?.trim() || "Sans campagne",
    status: normalizeStatus(recording.status),
    durationSeconds:
      typeof recording.duration === "number" && Number.isFinite(recording.duration)
        ? recording.duration
        : 0,
    note: buildNote(recording),
    streamUrl: recording.stream_url ?? null,
    downloadUrl: recording.download_url ?? null,
    filename: recording.filename?.trim() || undefined,
  };
}

export const RECORDING_STATUS_OPTIONS: Array<{
  value: RecordingStatus;
  label: string;
}> = [
  { value: "available", label: "Disponible" },
  { value: "processing", label: "En traitement" },
  { value: "failed", label: "En erreur" },
  { value: "expired", label: "Expire" },
];

export const recordingsApi = {
  async getRecordings(): Promise<RecordingRecord[]> {
    try {
      const { data } = await apiClient.get<BackendRecordingsResponse>("/recordings", {
        params: {
          page: 1,
          limit: 100,
          with_stream_urls: true,
        },
      });

      return Array.isArray(data?.data) ? data.data.map(mapBackendRecording) : [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;
        const apiMessage =
          typeof responseData === "string"
            ? responseData
            : typeof responseData?.message === "string"
              ? responseData.message
              : Array.isArray(responseData?.message) && typeof responseData.message[0] === "string"
                ? responseData.message[0]
                : null;

        if (apiMessage) {
          throw new Error(apiMessage);
        }
      }

      throw new Error("Impossible de charger les enregistrements.");
    }
  },
};
