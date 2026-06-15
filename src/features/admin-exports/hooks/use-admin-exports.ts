"use client";

import { useAdminExportsStore } from "@/features/admin-exports/store/admin-exports.store";

export function useAdminExports() {
  const exports = useAdminExportsStore((state) => state.exports);
  const createExport = useAdminExportsStore((state) => state.createExport);
  const getExportById = useAdminExportsStore((state) => state.getExportById);

  return {
    exports,
    createExport,
    getExportById,
  };
}
