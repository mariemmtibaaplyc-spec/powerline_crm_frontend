"use client";

import { create } from "zustand";
import { importsApi } from "@/features/imports/api/imports.api";
import { buildImportResult } from "@/features/imports/mocks/imports.mock";
import type { ImportRecord, ImportWizardValues } from "@/types/import.types";

interface ImportsStoreState {
  imports: ImportRecord[];
  importsError: string | null;
  importDetails: Record<string, ImportRecord>;
  importDetailErrors: Record<string, string | null | undefined>;
  loadingImportIds: Record<string, boolean | undefined>;
  hasLoadedImports: boolean;
  loadImports: (force?: boolean) => Promise<void>;
  loadImportById: (id: string, force?: boolean) => Promise<ImportRecord | undefined>;
  createImport: (values: ImportWizardValues) => ImportRecord;
  getImportById: (id: string) => ImportRecord | undefined;
}

export const useImportsStore = create<ImportsStoreState>((set, get) => ({
  imports: [],
  importsError: null,
  importDetails: {},
  importDetailErrors: {},
  loadingImportIds: {},
  hasLoadedImports: false,
  loadImports: async (force = false) => {
    if (get().hasLoadedImports && !force) {
      return;
    }

    try {
      const imports = await importsApi.getImports();

      set({
        imports,
        importsError: null,
        importDetails: Object.fromEntries(imports.map((item) => [item.id, item])),
        hasLoadedImports: true,
      });
    } catch {
      set({
        imports: [],
        importsError: "Impossible de charger la liste des imports.",
        importDetails: {},
        hasLoadedImports: true,
      });
    }
  },
  loadImportById: async (id, force = false) => {
    const cached = get().importDetails[id] ?? get().imports.find((item) => item.id === id);

    if (cached && !force) {
      return cached;
    }

    set((state) => ({
      importDetailErrors: {
        ...state.importDetailErrors,
        [id]: null,
      },
      loadingImportIds: {
        ...state.loadingImportIds,
        [id]: true,
      },
    }));

    try {
      const item = await importsApi.getImportById(id);

      set((state) => {
        const nextImports = state.imports.some((entry) => entry.id === item.id)
          ? state.imports.map((entry) => (entry.id === item.id ? item : entry))
          : [item, ...state.imports];

        return {
          imports: nextImports,
          importDetails: {
            ...state.importDetails,
            [id]: item,
          },
          importDetailErrors: {
            ...state.importDetailErrors,
            [id]: null,
          },
          loadingImportIds: {
            ...state.loadingImportIds,
            [id]: false,
          },
        };
      });

      return item;
    } catch {
      set((state) => ({
        importDetailErrors: {
          ...state.importDetailErrors,
          [id]: "Impossible de charger le detail de l import.",
        },
        loadingImportIds: {
          ...state.loadingImportIds,
          [id]: false,
        },
      }));

      return undefined;
    }
  },
  createImport: (values) => {
    const record = buildImportResult(values);
    return record;
  },
  getImportById: (id) => get().importDetails[id] ?? get().imports.find((item) => item.id === id),
}));
