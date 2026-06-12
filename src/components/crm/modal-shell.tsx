"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ModalShellProps = {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  onClose: () => void;
};

export function ModalShell({
  title,
  eyebrow,
  children,
  onClose,
}: ModalShellProps) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/35 px-4 py-6 sm:py-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className="mx-auto w-full max-w-2xl rounded-lg border border-neutral-200 bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            {eyebrow ? (
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                {eyebrow}
              </p>
            ) : null}
            <h2 id="modal-title" className="mt-1 text-lg font-semibold text-neutral-950">
              {title}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Dialog schliessen"
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
