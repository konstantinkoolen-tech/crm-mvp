"use client";

import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { ChevronDown } from "lucide-react";
import { updateCompanyNotes } from "@/app/(crm)/companies/actions";
import { RichTextTextarea } from "@/components/crm/rich-text-textarea";
import { cn } from "@/lib/utils";

type InlineCompanyNotesProps = {
  companyId: string;
  initialNotes: string | null;
};

export function InlineCompanyNotes({
  companyId,
  initialNotes,
}: InlineCompanyNotesProps) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hasHiddenText, setHasHiddenText] = useState(false);
  const [isPending, startTransition] = useTransition();
  const savedNotes = useRef(initialNotes ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateHiddenTextState = useCallback(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      setHasHiddenText(false);
      return;
    }

    setHasHiddenText(textarea.scrollHeight > textarea.clientHeight + 2);
  }, []);

  const expandToFullNote = useCallback(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
    updateHiddenTextState();
  }, [updateHiddenTextState]);

  useLayoutEffect(() => {
    expandToFullNote();
  }, [expandToFullNote, notes]);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea || typeof ResizeObserver === "undefined") {
      updateHiddenTextState();
      return;
    }

    const observer = new ResizeObserver(updateHiddenTextState);
    observer.observe(textarea);
    updateHiddenTextState();

    return () => observer.disconnect();
  }, [updateHiddenTextState]);

  function saveNotes() {
    const nextNotes = (textareaRef.current?.value ?? notes).trim();

    if (nextNotes === savedNotes.current.trim()) {
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      const result = await updateCompanyNotes(companyId, nextNotes);

      if (!result.ok) {
        setFeedback(result.message ?? "Notizen konnten nicht gespeichert werden.");
        return;
      }

      savedNotes.current = nextNotes;
      setFeedback("Gespeichert");
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.currentTarget.blur();
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <RichTextTextarea
          ref={textareaRef}
          aria-label="Unternehmensnotizen"
          className={cn(
            "min-h-32 resize-y overflow-hidden bg-transparent shadow-none",
            hasHiddenText ? "pb-12" : "",
          )}
          wrapperClassName="border-transparent bg-transparent shadow-none focus-within:ring-0"
          onBlur={saveNotes}
          onChange={(event) => {
            setNotes(event.target.value);
            setFeedback(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Notiz hinzufügen ..."
          value={notes}
        />
        {hasHiddenText ? (
          <button
            type="button"
            className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-md bg-neutral-950 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/30"
            onClick={expandToFullNote}
            onPointerDown={(event) => event.preventDefault()}
          >
            Mehr
            <ChevronDown className="size-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <p
        className={`min-h-4 text-xs ${
          feedback && feedback !== "Gespeichert"
            ? "text-red-600"
            : "text-neutral-500"
        }`}
        role={feedback && feedback !== "Gespeichert" ? "alert" : "status"}
      >
        {isPending ? "Wird gespeichert ..." : feedback ?? "Klicken zum Bearbeiten"}
      </p>
    </div>
  );
}
