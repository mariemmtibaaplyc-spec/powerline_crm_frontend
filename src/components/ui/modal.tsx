"use client";

import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}

export function Modal({
  open,
  title,
  description,
  children,
  onClose,
}: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102033]/45 px-4 py-8">
      <div
        className="absolute inset-0"
        aria-hidden="true"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-xl rounded-[1.75rem] border border-[#dce6f0] bg-white p-6 shadow-[0_22px_60px_rgba(20,32,53,0.24)]">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-[#102033]">{title}</h2>
          {description ? (
            <p className="text-sm leading-6 text-[#607287]">{description}</p>
          ) : null}
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
