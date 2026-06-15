"use client";

import { create } from "zustand";
import { buildExportPayload, MOCK_EXPORTS } from "@/features/admin-exports/mocks/admin-exports.mock";
import type { ExportFormValues, ExportRecord } from "@/types/export.types";

interface AdminExportsStoreState {
  exports: ExportRecord[];
  createExport: (values: ExportFormValues) => ExportRecord;
  getExportById: (id: string) => ExportRecord | undefined;
}

export const useAdminExportsStore = create<AdminExportsStoreState>((set, get) => ({
  exports: MOCK_EXPORTS,
  createExport: (values) => {
    const record = buildExportPayload(values);
    set((state) => ({
      exports: [record, ...state.exports],
    }));
    return record;
  },
  getExportById: (id) => get().exports.find((item) => item.id === id),
}));
