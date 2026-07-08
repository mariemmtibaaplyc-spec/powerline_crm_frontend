"use client";

import { cn } from "@/lib/utils";

// Remplace <input type="time"> — certains navigateurs affichent le picker
// natif en AM/PM selon la locale OS, en ignorant l'attribut `lang` sur
// l'input. Deux <select> HTML garantissent un affichage 24h partout.
interface TimeInput24Props {
  value: string; // "HH:mm"
  onChange: (value: string) => void;
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

export function TimeInput24({ value, onChange, className }: TimeInput24Props) {
  const [hour, minute] = value.split(":");

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-[1.15rem] border border-[#d7e3ef] bg-white px-2",
        className,
      )}
    >
      <select
        value={hour ?? "00"}
        onChange={(event) => onChange(`${event.target.value}:${minute ?? "00"}`)}
        className="h-full flex-1 border-0 bg-transparent px-1 text-sm outline-none"
        aria-label="Heure"
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="text-sm text-[#607287]">:</span>
      <select
        value={minute ?? "00"}
        onChange={(event) => onChange(`${hour ?? "00"}:${event.target.value}`)}
        className="h-full flex-1 border-0 bg-transparent px-1 text-sm outline-none"
        aria-label="Minute"
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
