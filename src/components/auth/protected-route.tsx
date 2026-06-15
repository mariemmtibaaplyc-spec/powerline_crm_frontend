"use client";

import type { ReactNode } from "react";
import { useSessionStore } from "@/store/session.store";

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  fallback = null,
}: ProtectedRouteProps) {
  const session = useSessionStore((state) => state.session);
  return session ? <>{children}</> : <>{fallback}</>;
}
