"use client";

import { useEffect, useMemo, useState } from "react";
import { Headphones, Play, Pause, Search, Volume2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableCell,
  TableHeadCell,
  TableWrapper,
} from "@/components/ui/table";
import { useRecordings } from "@/features/recordings/hooks/use-recordings";
import { RecordingStatusBadge } from "@/components/recordings/recording-status-badge";
import type { RecordingRecord, RecordingStatus } from "@/types/recording.types";

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

function AudioMiniPlayer({
  item,
  isPlaying,
  progress,
  onToggle,
}: {
  item: RecordingRecord;
  isPlaying: boolean;
  progress: number;
  onToggle: () => void;
}) {
  return (
    <div className="min-w-[260px] rounded-[1.2rem] border border-[#dce6f0] bg-[linear-gradient(180deg,#fbfdff_0%,#f5f9fd_100%)] px-3 py-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#295086] text-white shadow-[0_14px_30px_rgba(41,80,134,0.22)] transition hover:-translate-y-0.5"
          aria-label={isPlaying ? `Pause ${item.clientName}` : `Lire ${item.clientName}`}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#607287]">
              <Volume2 className="h-3.5 w-3.5 text-[#5d7690]" />
              Vocal appel
            </span>
            <span className="text-xs font-semibold text-[#24415d]">
              {isPlaying
                ? formatDuration(Math.min(progress, item.durationSeconds))
                : formatDuration(item.durationSeconds)}
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-[#dce6f0]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#295086_0%,#5b8eda_100%)] transition-[width] duration-700"
              style={{
                width: `${Math.max(
                  8,
                  Math.min(
                    100,
                    isPlaying
                      ? (progress / item.durationSeconds) * 100
                      : 16,
                  ),
                )}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RecordingsModule() {
  const { recordings, statusOptions } = useRecordings();
  const [search, setSearch] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | RecordingStatus>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);
  const [activeProgress, setActiveProgress] = useState(0);

  const campaigns = useMemo(
    () => Array.from(new Set(recordings.map((item) => item.campaign))).sort(),
    [recordings],
  );

  const filteredRecordings = useMemo(() => {
    const query = search.trim().toLowerCase();
    return recordings.filter((item) => {
      const matchesSearch =
        query.length === 0 ||
        item.agentName.toLowerCase().includes(query) ||
        item.clientName.toLowerCase().includes(query) ||
        item.phone.toLowerCase().includes(query);
      const matchesCampaign =
        campaignFilter === "all" || item.campaign === campaignFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesDate = !dateFilter || item.date === dateFilter;

      return matchesSearch && matchesCampaign && matchesStatus && matchesDate;
    });
  }, [campaignFilter, dateFilter, recordings, search, statusFilter]);

  const totalDuration = useMemo(() => {
    return filteredRecordings.reduce((sum, item) => sum + item.durationSeconds, 0);
  }, [filteredRecordings]);

  useEffect(() => {
    if (!activeRecordingId) {
      return;
    }

    const activeItem = recordings.find((item) => item.id === activeRecordingId);
    if (!activeItem) {
      setActiveRecordingId(null);
      setActiveProgress(0);
      return;
    }

    const timer = window.setInterval(() => {
      setActiveProgress((current) => {
        if (current >= activeItem.durationSeconds) {
          setActiveRecordingId(null);
          return 0;
        }

        return current + 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeRecordingId, recordings]);

  function togglePlayback(item: RecordingRecord) {
    if (activeRecordingId === item.id) {
      setActiveRecordingId(null);
      setActiveProgress(0);
      return;
    }

    setActiveRecordingId(item.id);
    setActiveProgress(0);
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Enregistrements"
        description="Consultation simple des appels enregistres pour controle qualite, ecoute rapide et suivi operationnel du plateau."
      />

      <div className="grid gap-4 xl:grid-cols-4">
        {[
          {
            label: "Appels enregistres",
            value: filteredRecordings.length,
            note: "Volume filtre",
            tone: "bg-[linear-gradient(135deg,#eef5ff_0%,#ffffff_100%)] text-[#295086]",
            icon: Headphones,
          },
          {
            label: "Disponibles",
            value: filteredRecordings.filter((item) => item.status === "available").length,
            note: "Ecoute immediate",
            tone: "bg-[linear-gradient(135deg,#effbf5_0%,#ffffff_100%)] text-[#15795d]",
            icon: Volume2,
          },
          {
            label: "A revoir",
            value: filteredRecordings.filter((item) => item.status === "review").length,
            note: "Controle qualite",
            tone: "bg-[linear-gradient(135deg,#fff7e8_0%,#ffffff_100%)] text-[#a76b18]",
            icon: Pause,
          },
          {
            label: "Duree cumulee",
            value: formatDuration(totalDuration),
            note: "Temps audio",
            tone: "bg-[linear-gradient(135deg,#f5f1ff_0%,#ffffff_100%)] text-[#5c4cb0]",
            icon: Play,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`rounded-[1.5rem] border border-[#dce6f0] p-5 shadow-[0_18px_42px_rgba(20,32,53,0.08)] ${item.tone}`}
            >
              <div className="flex items-center justify-between">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/80">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-current/70">
                  AUDIO
                </span>
              </div>
              <div className="mt-5 space-y-1">
                <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-current/70">
                  {item.label}
                </p>
                <p className="text-3xl font-semibold text-[#102033]">{item.value}</p>
                <p className="text-sm text-[#607287]">{item.note}</p>
              </div>
            </div>
          );
        })}
      </div>

      <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
        <CardContent className="space-y-5 pt-6">
          <div className="grid gap-3 xl:grid-cols-[1.15fr_240px_220px_200px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8da3]" />
              <Input
                value={search}
                className="pl-11"
                placeholder="Rechercher agent, client ou numero..."
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <Select
              value={campaignFilter}
              className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
              onChange={(event) => setCampaignFilter(event.target.value)}
            >
              <option value="all">Toutes les campagnes</option>
              {campaigns.map((campaign) => (
                <option key={campaign} value={campaign}>
                  {campaign}
                </option>
              ))}
            </Select>

            <Select
              value={statusFilter}
              className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | RecordingStatus)
              }
            >
              <option value="all">Tous les statuts</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <Input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            />
          </div>

          <TableWrapper className="border-[#dce6f0] bg-white shadow-none">
            <div className="overflow-x-auto">
              <Table className="min-w-[1380px]">
                <thead className="bg-[linear-gradient(180deg,#fbfdff_0%,#f5f9fd_100%)]">
                  <tr>
                    <TableHeadCell>Date</TableHeadCell>
                    <TableHeadCell>Heure</TableHeadCell>
                    <TableHeadCell>Agent</TableHeadCell>
                    <TableHeadCell>Client / Numero</TableHeadCell>
                    <TableHeadCell>Campagne</TableHeadCell>
                    <TableHeadCell>Duree</TableHeadCell>
                    <TableHeadCell>Statut</TableHeadCell>
                    <TableHeadCell>Enregistrement</TableHeadCell>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child_td]:border-b-0">
                  {filteredRecordings.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-[linear-gradient(180deg,#fbfdff_0%,#f7fbff_100%)]"
                    >
                      <TableCell className="whitespace-nowrap">{item.date}</TableCell>
                      <TableCell className="whitespace-nowrap font-medium text-[#102033]">
                        {item.time}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-semibold text-[#102033]">{item.agentName}</p>
                          <p className="text-sm text-[#607287]">{item.note}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-semibold text-[#102033]">{item.clientName}</p>
                          <p className="text-sm text-[#607287]">{item.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{item.campaign}</TableCell>
                      <TableCell className="whitespace-nowrap font-semibold text-[#24415d]">
                        {formatDuration(item.durationSeconds)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <RecordingStatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>
                        <AudioMiniPlayer
                          item={item}
                          isPlaying={activeRecordingId === item.id}
                          progress={activeRecordingId === item.id ? activeProgress : 0}
                          onToggle={() => togglePlayback(item)}
                        />
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </TableWrapper>
        </CardContent>
      </Card>
    </section>
  );
}
