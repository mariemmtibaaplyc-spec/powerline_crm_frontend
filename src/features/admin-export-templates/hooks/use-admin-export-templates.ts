"use client";

import { useAdminExportTemplatesStore } from "@/features/admin-export-templates/store/admin-export-templates.store";

export function useAdminExportTemplates() {
  const templates = useAdminExportTemplatesStore((state) => state.templates);
  const createTemplate = useAdminExportTemplatesStore((state) => state.createTemplate);
  const updateTemplate = useAdminExportTemplatesStore((state) => state.updateTemplate);
  const toggleTemplateStatus = useAdminExportTemplatesStore((state) => state.toggleTemplateStatus);
  const getTemplateById = useAdminExportTemplatesStore((state) => state.getTemplateById);

  return {
    templates,
    createTemplate,
    updateTemplate,
    toggleTemplateStatus,
    getTemplateById,
  };
}
