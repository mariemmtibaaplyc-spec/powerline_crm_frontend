"use client";

import { create } from "zustand";
import {
  buildExportTemplatePayload,
  MOCK_EXPORT_TEMPLATES,
} from "@/features/admin-export-templates/mocks/admin-export-templates.mock";
import type {
  ExportTemplateFormValues,
  ExportTemplateRecord,
} from "@/types/export-template.types";

interface AdminExportTemplatesStoreState {
  templates: ExportTemplateRecord[];
  createTemplate: (values: ExportTemplateFormValues) => string;
  updateTemplate: (id: string, values: ExportTemplateFormValues) => void;
  toggleTemplateStatus: (id: string) => void;
  getTemplateById: (id: string) => ExportTemplateRecord | undefined;
}

export const useAdminExportTemplatesStore = create<AdminExportTemplatesStoreState>((set, get) => ({
  templates: MOCK_EXPORT_TEMPLATES,
  createTemplate: (values) => {
    const nextTemplate = buildExportTemplatePayload(values);
    set((state) => ({
      templates: [nextTemplate, ...state.templates],
    }));
    return nextTemplate.id;
  },
  updateTemplate: (id, values) => {
    set((state) => ({
      templates: state.templates.map((template) =>
        template.id === id
          ? {
              ...template,
              name: values.name.trim(),
              source: values.source,
              format: values.format,
              fields: values.fields
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
              status: values.status,
            }
          : template,
      ),
    }));
  },
  toggleTemplateStatus: (id) => {
    set((state) => ({
      templates: state.templates.map((template) =>
        template.id === id
          ? {
              ...template,
              status: template.status === "active" ? "inactive" : "active",
            }
          : template,
      ),
    }));
  },
  getTemplateById: (id) => get().templates.find((template) => template.id === id),
}));
