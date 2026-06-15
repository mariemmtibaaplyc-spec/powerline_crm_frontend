import { useWorkspaceStore } from "@/features/workspace/store/workspace.store";

export function useWorkspace() {
  return useWorkspaceStore();
}
