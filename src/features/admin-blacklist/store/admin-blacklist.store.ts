"use client";

import { create } from "zustand";
import { blacklistApi } from "@/features/blacklist/api/blacklist.api";
import type { BlacklistFormValues, BlacklistRecord } from "@/types/blacklist.types";

interface AdminBlacklistStoreState {
  entries: BlacklistRecord[];
  selectedEntry: BlacklistRecord | null;
  blacklistError: string | null;
  selectedEntryError: string | null;
  isLoadingBlacklist: boolean;
  isLoadingSelectedEntry: boolean;
  isDeactivatingEntry: boolean;
  loadBlacklist: (params?: { phone?: string }) => Promise<void>;
  loadEntryById: (id: string, force?: boolean) => Promise<void>;
  createEntry: (values: BlacklistFormValues) => Promise<void>;
  updateEntry: (id: string, values: BlacklistFormValues) => Promise<void>;
  deactivateEntry: (id: string) => Promise<void>;
  getEntryById: (id: string) => BlacklistRecord | undefined;
}

export const useAdminBlacklistStore = create<AdminBlacklistStoreState>((set, get) => ({
  entries: [],
  selectedEntry: null,
  blacklistError: null,
  selectedEntryError: null,
  isLoadingBlacklist: false,
  isLoadingSelectedEntry: false,
  isDeactivatingEntry: false,
  loadBlacklist: async (params = {}) => {
    set({
      isLoadingBlacklist: true,
      blacklistError: null,
    });

    try {
      const entries = await blacklistApi.getBlacklist(params);

      set({
        entries,
        blacklistError: null,
        isLoadingBlacklist: false,
      });
    } catch {
      set({
        entries: [],
        blacklistError: "Impossible de charger la blacklist.",
        isLoadingBlacklist: false,
      });
    }
  },
  loadEntryById: async (id, force = false) => {
    const currentEntry = get().selectedEntry;

    if (!force && currentEntry?.id === id) {
      return;
    }

    set({
      isLoadingSelectedEntry: true,
      selectedEntryError: null,
    });

    try {
      const entry = await blacklistApi.getBlacklistEntryById(id);

      set((state) => ({
        selectedEntry: entry,
        selectedEntryError: null,
        isLoadingSelectedEntry: false,
        entries: state.entries.some((listedEntry) => listedEntry.id === entry.id)
          ? state.entries.map((listedEntry) => (listedEntry.id === entry.id ? entry : listedEntry))
          : state.entries,
      }));
    } catch {
      set({
        selectedEntry: null,
        selectedEntryError: "Impossible de charger cette entree blacklist.",
        isLoadingSelectedEntry: false,
      });
    }
  },
  createEntry: async (values) => {
    await blacklistApi.createBlacklistEntry(values);
    await get().loadBlacklist();
  },
  updateEntry: async (id, values) => {
    await blacklistApi.updateBlacklistEntry(id, values);
    await get().loadBlacklist();
    await get().loadEntryById(id, true);
  },
  deactivateEntry: async (id) => {
    set({ isDeactivatingEntry: true });

    try {
      await blacklistApi.deactivateBlacklistEntry(id);
      await get().loadBlacklist();
      await get().loadEntryById(id, true);
    } finally {
      set({ isDeactivatingEntry: false });
    }
  },
  getEntryById: (id) => {
    const { selectedEntry, entries } = get();
    return selectedEntry?.id === id ? selectedEntry : entries.find((entry) => entry.id === id);
  },
}));
