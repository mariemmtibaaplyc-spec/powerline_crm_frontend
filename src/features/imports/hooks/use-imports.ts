"use client";

import { useEffect } from "react";
import { useImportsStore } from "@/features/imports/store/imports.store";

export function useImports() {
  const imports = useImportsStore((state) => state.imports);
  const importsError = useImportsStore((state) => state.importsError);
  const importDetailErrors = useImportsStore((state) => state.importDetailErrors);
  const loadingImportIds = useImportsStore((state) => state.loadingImportIds);
  const hasLoadedImports = useImportsStore((state) => state.hasLoadedImports);
  const loadImports = useImportsStore((state) => state.loadImports);
  const loadImportById = useImportsStore((state) => state.loadImportById);
  const createImport = useImportsStore((state) => state.createImport);
  const getImportById = useImportsStore((state) => state.getImportById);

  useEffect(() => {
    if (!hasLoadedImports) {
      void loadImports();
    }
  }, [hasLoadedImports, loadImports]);

  return {
    imports,
    importsError,
    importDetailErrors,
    loadingImportIds,
    hasLoadedImports,
    loadImports,
    createImport,
    getImportById,
    loadImportById,
  };
}
