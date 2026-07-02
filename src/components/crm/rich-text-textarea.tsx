"use client";

import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type KeyboardEvent,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type RichTextTextareaProps = ComponentPropsWithoutRef<"textarea"> & {
  wrapperClassName?: string;
};

const fallbackSelection = "Text";
const shortcutHoldDelayMs = 550;
const shortcutHelp = [
  ["⌘ B", "Fett"],
  ["⌘ I", "Kursiv"],
  ["⌘ ⇧ 8", "Bullet points"],
  ["⌘ ⇧ 7", "Nummerierte Liste"],
  ["⌘ ⇧ 9", "Zitat"],
];
const inputEventOptions = {
  bubbles: true,
  inputType: "insertText",
} as const;

export const RichTextTextarea = forwardRef<
  HTMLTextAreaElement,
  RichTextTextareaProps
>(function RichTextTextarea(
  {
    className,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    wrapperClassName,
    ...textareaProps
  },
  forwardedRef,
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const shortcutHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showShortcutHint, setShowShortcutHint] = useState(false);

  useImperativeHandle(forwardedRef, () => textareaRef.current as HTMLTextAreaElement);

  useEffect(() => {
    return () => {
      if (shortcutHintTimerRef.current) {
        clearTimeout(shortcutHintTimerRef.current);
      }
    };
  }, []);

  function applyInline(marker: "**" | "_") {
    updateTextarea((value, start, end) => {
      const selected = value.slice(start, end) || fallbackSelection;
      const nextSelectionStart = start + marker.length;
      const nextSelectionEnd = nextSelectionStart + selected.length;

      return {
        nextSelectionEnd,
        nextSelectionStart,
        value:
          value.slice(0, start) +
          marker +
          selected +
          marker +
          value.slice(end),
      };
    });
  }

  function applyBlock(type: "ordered" | "quote" | "unordered") {
    updateTextarea((value, start, end) => {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const lineEnd = end + value.slice(end).search(/\n|$/);
      const selectionEnd = lineEnd < end ? end : lineEnd;
      const selected = value.slice(lineStart, selectionEnd);
      const lines = (selected || fallbackSelection).split("\n");
      const formatted = lines
        .map((line, index) => formatBlockLine(line, type, index))
        .join("\n");

      return {
        nextSelectionEnd: lineStart + formatted.length,
        nextSelectionStart: lineStart,
        value: value.slice(0, lineStart) + formatted + value.slice(selectionEnd),
      };
    });
  }

  function updateTextarea(
    formatter: (
      value: string,
      start: number,
      end: number,
    ) => {
      nextSelectionEnd: number;
      nextSelectionStart: number;
      value: string;
    },
  ) {
    const textarea = textareaRef.current;

    if (!textarea || textarea.disabled || textarea.readOnly) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const result = formatter(textarea.value, start, end);

    setNativeTextareaValue(textarea, result.value);
    textarea.focus();
    textarea.setSelectionRange(result.nextSelectionStart, result.nextSelectionEnd);
    dispatchTextareaInput(textarea);

    requestAnimationFrame(() => {
      if (document.activeElement === textarea) {
        textarea.setSelectionRange(
          result.nextSelectionStart,
          result.nextSelectionEnd,
        );
      }
    });
  }

  function scheduleShortcutHint() {
    if (shortcutHintTimerRef.current || showShortcutHint) {
      return;
    }

    shortcutHintTimerRef.current = setTimeout(() => {
      shortcutHintTimerRef.current = null;
      setShowShortcutHint(true);
    }, shortcutHoldDelayMs);
  }

  function clearShortcutHint() {
    if (shortcutHintTimerRef.current) {
      clearTimeout(shortcutHintTimerRef.current);
      shortcutHintTimerRef.current = null;
    }

    setShowShortcutHint(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    onKeyDown?.(event);

    if (
      event.defaultPrevented ||
      textareaProps.disabled ||
      textareaProps.readOnly
    ) {
      return;
    }

    const usesPrimaryModifier =
      event.metaKey ||
      event.ctrlKey ||
      event.key === "Meta" ||
      event.key === "Control";

    if (!usesPrimaryModifier) {
      return;
    }

    scheduleShortcutHint();

    const key = event.key.toLowerCase();

    if (key === "b" && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      clearShortcutHint();
      applyInline("**");
      return;
    }

    if (key === "i" && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      clearShortcutHint();
      applyInline("_");
      return;
    }

    if (event.shiftKey && !event.altKey && event.code === "Digit8") {
      event.preventDefault();
      clearShortcutHint();
      applyBlock("unordered");
      return;
    }

    if (event.shiftKey && !event.altKey && event.code === "Digit7") {
      event.preventDefault();
      clearShortcutHint();
      applyBlock("ordered");
      return;
    }

    if (event.shiftKey && !event.altKey && event.code === "Digit9") {
      event.preventDefault();
      clearShortcutHint();
      applyBlock("quote");
    }
  }

  function handleKeyUp(event: KeyboardEvent<HTMLTextAreaElement>) {
    onKeyUp?.(event);

    if (event.key === "Meta" || event.key === "Control") {
      clearShortcutHint();
    }
  }

  function handleFocus(event: FocusEvent<HTMLTextAreaElement>) {
    onFocus?.(event);
  }

  function handleBlur(event: FocusEvent<HTMLTextAreaElement>) {
    onBlur?.(event);
    clearShortcutHint();
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-neutral-950/20",
        wrapperClassName,
      )}
    >
      <Textarea
        {...textareaProps}
        ref={textareaRef}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        className={cn(
          "rounded-md border-0 shadow-none focus-visible:ring-0",
          className,
        )}
      />
      {showShortcutHint ? (
        <div className="pointer-events-none absolute bottom-2 right-2 z-10 rounded-md border border-neutral-200 bg-white/95 px-2.5 py-2 text-[11px] text-neutral-600 shadow-lg">
          <p className="mb-1 font-semibold text-neutral-900">Shortcuts</p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
            {shortcutHelp.map(([shortcut, label]) => (
              <div className="contents" key={shortcut}>
                <dt className="font-mono text-neutral-950">{shortcut}</dt>
                <dd>{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </div>
  );
});

function formatBlockLine(
  line: string,
  type: "ordered" | "quote" | "unordered",
  index: number,
) {
  const content = stripBlockPrefix(line);

  if (type === "ordered") {
    return `${index + 1}. ${content}`;
  }

  if (type === "quote") {
    return `> ${content}`;
  }

  return `- ${content}`;
}

function stripBlockPrefix(line: string) {
  return line.replace(/^(\s*)([-*]\s+|\d+[.)]\s+|>\s?)/, "$1").trimStart();
}

function setNativeTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(textarea, "value")?.set;
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value",
  )?.set;

  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(textarea, value);
    return;
  }

  textarea.value = value;
}

function dispatchTextareaInput(textarea: HTMLTextAreaElement) {
  if (typeof InputEvent === "function") {
    textarea.dispatchEvent(new InputEvent("input", inputEventOptions));
    return;
  }

  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}
