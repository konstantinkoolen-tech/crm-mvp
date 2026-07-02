"use client";

import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactNode,
  useImperativeHandle,
  useRef,
} from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type RichTextTextareaProps = ComponentPropsWithoutRef<"textarea"> & {
  wrapperClassName?: string;
};

const fallbackSelection = "Text";

export const RichTextTextarea = forwardRef<
  HTMLTextAreaElement,
  RichTextTextareaProps
>(function RichTextTextarea(
  { className, wrapperClassName, ...textareaProps },
  forwardedRef,
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toolbarDisabled = Boolean(textareaProps.disabled || textareaProps.readOnly);

  useImperativeHandle(forwardedRef, () => textareaRef.current as HTMLTextAreaElement);

  function handleToolbarMouseDown(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
  }

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

    textarea.value = result.value;
    textarea.focus();
    textarea.setSelectionRange(result.nextSelectionStart, result.nextSelectionEnd);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-neutral-950/20",
        wrapperClassName,
      )}
    >
      <div className="flex items-center gap-1 border-b border-neutral-100 bg-neutral-50 px-2 py-1.5">
        <ToolbarButton
          label="Fett"
          disabled={toolbarDisabled}
          onMouseDown={handleToolbarMouseDown}
          onClick={() => applyInline("**")}
        >
          <Bold aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Kursiv"
          disabled={toolbarDisabled}
          onMouseDown={handleToolbarMouseDown}
          onClick={() => applyInline("_")}
        >
          <Italic aria-hidden="true" />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton
          label="Bullet points"
          disabled={toolbarDisabled}
          onMouseDown={handleToolbarMouseDown}
          onClick={() => applyBlock("unordered")}
        >
          <List aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Nummerierte Liste"
          disabled={toolbarDisabled}
          onMouseDown={handleToolbarMouseDown}
          onClick={() => applyBlock("ordered")}
        >
          <ListOrdered aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Zitat"
          disabled={toolbarDisabled}
          onMouseDown={handleToolbarMouseDown}
          onClick={() => applyBlock("quote")}
        >
          <Quote aria-hidden="true" />
        </ToolbarButton>
      </div>
      <Textarea
        {...textareaProps}
        ref={textareaRef}
        className={cn(
          "rounded-none border-0 shadow-none focus-visible:ring-0",
          className,
        )}
      />
    </div>
  );
});

function ToolbarButton({
  children,
  label,
  disabled,
  onClick,
  onMouseDown,
}: {
  children: ReactNode;
  disabled: boolean;
  label: string;
  onClick: () => void;
  onMouseDown: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      className="inline-flex size-8 items-center justify-center rounded text-neutral-600 transition hover:bg-white hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-neutral-600 [&_svg]:size-4"
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-1 h-5 w-px bg-neutral-200" aria-hidden="true" />;
}

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
