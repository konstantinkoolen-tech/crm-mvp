"use client";

import { useState } from "react";
import {
  ChevronDown,
  Pencil,
  Plus,
  ArrowDown,
  ArrowUp,
  X,
} from "lucide-react";
import {
  createValueProp,
  deleteValueProp,
  moveValueProp,
  updateValueProp,
  updateValuePropStatus,
} from "@/app/(crm)/settings/actions";
import { AssociatedFormSubmitButton } from "@/components/crm/associated-form-submit-button";
import { DeleteConfirmButton } from "@/components/crm/delete-confirm-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ValueProp } from "@/lib/db/value-props";

type ValuePropManagerProps = {
  valueProps: ValueProp[];
  canManageValueProps: boolean;
};

type ModalState =
  | {
      mode: "create";
      valueProp?: never;
    }
  | {
      mode: "edit";
      valueProp: ValueProp;
    };

export function ValuePropManager({
  valueProps,
  canManageValueProps,
}: ValuePropManagerProps) {
  const [modal, setModal] = useState<ModalState | null>(null);

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => setModal({ mode: "create" })}
            disabled={!canManageValueProps}
          >
            <Plus aria-hidden="true" />
            Value Prop hinzufügen
          </Button>
        </div>

        {valueProps.length === 0 ? (
          <div className="rounded-md border border-dashed border-neutral-200 px-4 py-8 text-sm text-neutral-500">
            Noch keine Value Props vorhanden.
          </div>
        ) : (
          <div className="space-y-2">
            {valueProps.map((valueProp, index) => (
              <details
                key={valueProp.id}
                className="group rounded-md border border-neutral-200 bg-white"
              >
                <summary className="grid cursor-pointer list-none items-center gap-3 px-4 py-3 transition hover:bg-neutral-50 sm:grid-cols-[72px_1fr_150px_44px] [&::-webkit-details-marker]:hidden">
                  <div
                    className="flex items-center gap-1"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <MoveButton
                      valuePropId={valueProp.id}
                      direction="up"
                      disabled={!canManageValueProps || index === 0}
                    />
                    <MoveButton
                      valuePropId={valueProp.id}
                      direction="down"
                      disabled={!canManageValueProps || index === valueProps.length - 1}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <ChevronDown
                        className="size-4 shrink-0 text-neutral-400 transition group-open:rotate-180"
                        aria-hidden="true"
                      />
                      <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-700">
                        {valueProp.code}
                      </span>
                      <span className="truncate text-sm font-medium text-neutral-950">
                        {valueProp.label}
                      </span>
                    </div>
                  </div>

                  <form
                    action={updateValuePropStatus}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <input
                      type="hidden"
                      name="value_prop_id"
                      value={valueProp.id}
                    />
                    <select
                      name="status"
                      defaultValue={valueProp.status}
                      disabled={!canManageValueProps}
                      onChange={(event) => event.currentTarget.form?.requestSubmit()}
                      className="h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="active">Aktiv</option>
                      <option value="archived">Archiviert</option>
                    </select>
                  </form>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={!canManageValueProps}
                    aria-label={`${valueProp.label} bearbeiten`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setModal({ mode: "edit", valueProp });
                    }}
                  >
                    <Pencil aria-hidden="true" />
                  </Button>
                </summary>

                <div className="border-t border-neutral-200 px-4 py-4 sm:ml-[72px]">
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Erklärung
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                    {valueProp.description?.trim() ||
                      "Noch keine Erklärung hinterlegt."}
                  </p>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>

      {modal ? (
        <ValuePropModal
          modal={modal}
          onClose={() => setModal(null)}
          canManageValueProps={canManageValueProps}
        />
      ) : null}
    </>
  );
}

function MoveButton({
  valuePropId,
  direction,
  disabled,
}: {
  valuePropId: string;
  direction: "up" | "down";
  disabled: boolean;
}) {
  const Icon = direction === "up" ? ArrowUp : ArrowDown;

  return (
    <form action={moveValueProp}>
      <input type="hidden" name="value_prop_id" value={valuePropId} />
      <input type="hidden" name="direction" value={direction} />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="size-8"
        disabled={disabled}
        aria-label={
          direction === "up" ? "Value Prop nach oben" : "Value Prop nach unten"
        }
      >
        <Icon aria-hidden="true" />
      </Button>
    </form>
  );
}

function ValuePropModal({
  modal,
  onClose,
  canManageValueProps,
}: {
  modal: ModalState;
  onClose: () => void;
  canManageValueProps: boolean;
}) {
  const valueProp = modal.mode === "edit" ? modal.valueProp : null;
  const action = modal.mode === "edit" ? updateValueProp : createValueProp;
  const formId = `value-prop-${valueProp?.id ?? "new"}`;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/35 px-4 py-6 sm:py-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="value-prop-dialog-title"
      onClick={onClose}
    >
      <div
        className="mx-auto w-full max-w-lg rounded-lg border border-neutral-200 bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Value Prop
            </p>
            <h2
              id="value-prop-dialog-title"
              className="mt-1 text-lg font-semibold text-neutral-950"
            >
              {modal.mode === "edit"
                ? `${valueProp?.code}: ${valueProp?.label}`
                : "Value Prop hinzufügen"}
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

        <form action={action} className="mt-5 space-y-4" id={formId}>
          {valueProp ? (
            <input type="hidden" name="value_prop_id" value={valueProp.id} />
          ) : null}

          <div className="grid gap-4 sm:grid-cols-[96px_1fr_120px]">
            <div className="space-y-2">
              <Label htmlFor="value-prop-modal-code">Code</Label>
              <Input
                id="value-prop-modal-code"
                name="code"
                defaultValue={valueProp?.code ?? ""}
                placeholder="A"
                disabled={!canManageValueProps}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value-prop-modal-label">Name</Label>
              <Input
                id="value-prop-modal-label"
                name="label"
                defaultValue={valueProp?.label ?? ""}
                placeholder="Feedbackloop"
                disabled={!canManageValueProps}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value-prop-modal-status">Status</Label>
              <select
                id="value-prop-modal-status"
                name="status"
                defaultValue={valueProp?.status ?? "active"}
                disabled={!canManageValueProps}
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="active">Aktiv</option>
                <option value="archived">Archiviert</option>
              </select>
            </div>
          </div>

          <input
            type="hidden"
            name="sort_order"
            value={valueProp?.sort_order ?? 50}
          />

          <div className="space-y-2">
            <Label htmlFor="value-prop-modal-description">Erklärung</Label>
            <Textarea
              id="value-prop-modal-description"
              name="description"
              rows={6}
              defaultValue={valueProp?.description ?? ""}
              placeholder="Wann nutzen wir diese Value Prop, welche Pain-Punkte adressiert sie, welche Formulierung hilft?"
              disabled={!canManageValueProps}
            />
          </div>

        </form>

        <div className="mt-4 flex justify-between gap-2">
          {valueProp ? (
            <DeleteConfirmButton
              action={deleteValueProp}
              description="Willst du die Value Prop wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
              fields={[{ name: "value_prop_id", value: valueProp.id }]}
              label="Value Prop"
            />
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <AssociatedFormSubmitButton
              disabled={!canManageValueProps}
              formId={formId}
            >
              Speichern
            </AssociatedFormSubmitButton>
          </div>
        </div>
      </div>
    </div>
  );
}
