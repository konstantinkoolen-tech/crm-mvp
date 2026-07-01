"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { ModalShell } from "@/components/crm/modal-shell";
import { Button } from "@/components/ui/button";

type DeleteConfirmButtonProps = {
  action: (formData: FormData) => Promise<void>;
  description: string;
  fields: Array<{
    name: string;
    value: string;
  }>;
  label: string;
};

export function DeleteConfirmButton({
  action,
  description,
  fields,
  label,
}: DeleteConfirmButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 text-neutral-500 hover:bg-red-50 hover:text-red-700"
        aria-label={`${label} löschen`}
        title={`${label} löschen`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsOpen(true);
        }}
      >
        <Trash2 aria-hidden="true" />
      </Button>

      {isOpen ? (
        <ModalShell
          eyebrow={label}
          title={`${label} löschen?`}
          onClose={() => setIsOpen(false)}
        >
          <p className="text-sm leading-6 text-neutral-700">{description}</p>
          <form action={action} className="mt-6 flex justify-end gap-2">
            {fields.map((field) => (
              <input
                key={field.name}
                type="hidden"
                name={field.name}
                value={field.value}
              />
            ))}
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" variant="destructive">
              Jetzt Löschen
            </Button>
          </form>
        </ModalShell>
      ) : null}
    </>
  );
}
