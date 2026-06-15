"use client";

import { useAdminBlacklistStore } from "@/features/admin-blacklist/store/admin-blacklist.store";

export function useAdminBlacklist() {
  const entries = useAdminBlacklistStore((state) => state.entries);
  const selectedEntry = useAdminBlacklistStore((state) => state.selectedEntry);
  const blacklistError = useAdminBlacklistStore((state) => state.blacklistError);
  const selectedEntryError = useAdminBlacklistStore((state) => state.selectedEntryError);
  const isLoadingBlacklist = useAdminBlacklistStore((state) => state.isLoadingBlacklist);
  const isLoadingSelectedEntry = useAdminBlacklistStore((state) => state.isLoadingSelectedEntry);
  const isDeactivatingEntry = useAdminBlacklistStore((state) => state.isDeactivatingEntry);
  const loadBlacklist = useAdminBlacklistStore((state) => state.loadBlacklist);
  const loadEntryById = useAdminBlacklistStore((state) => state.loadEntryById);
  const createEntry = useAdminBlacklistStore((state) => state.createEntry);
  const updateEntry = useAdminBlacklistStore((state) => state.updateEntry);
  const deactivateEntry = useAdminBlacklistStore((state) => state.deactivateEntry);
  const getEntryById = useAdminBlacklistStore((state) => state.getEntryById);

  return {
    entries,
    selectedEntry,
    blacklistError,
    selectedEntryError,
    isLoadingBlacklist,
    isLoadingSelectedEntry,
    isDeactivatingEntry,
    loadBlacklist,
    loadEntryById,
    createEntry,
    updateEntry,
    deactivateEntry,
    getEntryById,
  };
}
