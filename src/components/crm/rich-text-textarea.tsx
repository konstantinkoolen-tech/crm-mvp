"use client";

import {
  forwardRef,
  type ClipboardEvent,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

type RichTextTextareaProps = ComponentPropsWithoutRef<"textarea"> & {
  wrapperClassName?: string;
};

type FormatCommand = "bold" | "italic" | "ordered" | "quote" | "unordered";
type LinkDraft = {
  text: string;
  url: string;
};

const fallbackSelection = "Text";
const shortcutHoldDelayMs = 550;
const shortcutHelp = [
  ["⌘ B", "Fett"],
  ["⌘ I", "Kursiv"],
  ["⌘ K", "Link"],
  ["- Space", "Bullet points"],
  ["1. Space", "Nummerierte Liste"],
  ["⌘ ⇧ 9", "Zitat für Markierung"],
];
const unorderedListPattern = /^[-*]\s+(.+)$/;
const orderedListPattern = /^\d+[.)]\s+(.+)$/;
const quotePattern = /^>\s?(.*)$/;
const markdownLinkPattern = /^\[([^\]\n]+)\]\(([^)\s]+)\)$/;
const rawUrlPattern = /^(https?:\/\/[^\s<>()]+|www\.[^\s<>()]+)$/i;
const inlinePattern =
  /(\[[^\]\n]+\]\([^)]+\)|\*\*[^*]+\*\*|__[^_]+__|_[^_\n]+_|\*[^*\n]+\*|https?:\/\/[^\s<>()]+|www\.[^\s<>()]+)/gi;
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
    defaultValue,
    disabled,
    id,
    maxLength,
    name,
    onBlur,
    onChange,
    onFocus,
    onKeyDown,
    onKeyUp,
    placeholder,
    readOnly,
    required: _required,
    rows,
    value,
    wrapperClassName,
    ...textareaProps
  },
  forwardedRef,
) {
  const hiddenTextareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const linkTextInputRef = useRef<HTMLInputElement>(null);
  const savedLinkRangeRef = useRef<Range | null>(null);
  const selectedAnchorRef = useRef<HTMLAnchorElement | null>(null);
  const shortcutHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isControlled = value !== undefined;
  const controlledMarkdown = valueToString(value);
  const [markdown, setMarkdown] = useState(() =>
    isControlled ? controlledMarkdown : valueToString(defaultValue),
  );
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkDraft, setLinkDraft] = useState<LinkDraft>({ text: "", url: "" });
  const [showShortcutHint, setShowShortcutHint] = useState(false);

  useImperativeHandle(
    forwardedRef,
    () => hiddenTextareaRef.current as HTMLTextAreaElement,
  );

  useLayoutEffect(() => {
    syncEditorFromMarkdown(markdown);
  }, []);

  useEffect(() => {
    if (!isControlled || controlledMarkdown === markdown) {
      return;
    }

    setMarkdown(controlledMarkdown);
    syncEditorFromMarkdown(controlledMarkdown);
  }, [controlledMarkdown, isControlled, markdown]);

  useEffect(() => {
    return () => {
      if (shortcutHintTimerRef.current) {
        clearTimeout(shortcutHintTimerRef.current);
      }
    };
  }, []);

  function syncEditorFromMarkdown(nextMarkdown: string) {
    const editor = editorRef.current;

    if (!editor || document.activeElement === editor) {
      return;
    }

    editor.innerHTML = markdownToEditorHtml(nextMarkdown);
  }

  function syncMarkdownFromEditor() {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    const nextMarkdown = editorToMarkdown(editor);
    updateStoredMarkdown(nextMarkdown);
  }

  function updateStoredMarkdown(nextMarkdown: string) {
    setMarkdown(nextMarkdown);

    const textarea = hiddenTextareaRef.current;

    if (!textarea) {
      return;
    }

    setNativeTextareaValue(textarea, nextMarkdown);
    dispatchTextareaInput(textarea);
  }

  function applyFormat(command: FormatCommand) {
    const editor = editorRef.current;

    if (!editor || disabled || readOnly) {
      return;
    }

    editor.focus();

    if (command === "quote" && !hasSelectedText(editor)) {
      return;
    }

    if (command !== "quote") {
      ensureSelection(editor);
    }

    if (command === "bold") {
      document.execCommand("bold");
    } else if (command === "italic") {
      document.execCommand("italic");
    } else if (command === "unordered") {
      document.execCommand("insertUnorderedList");
    } else if (command === "ordered") {
      document.execCommand("insertOrderedList");
    } else {
      document.execCommand("formatBlock", false, "blockquote");
    }

    syncMarkdownFromEditor();
  }

  function openLinkDialog() {
    const editor = editorRef.current;
    const selection = window.getSelection();

    if (!editor || disabled || readOnly || !selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);

    if (!rangeBelongsToEditor(editor, range)) {
      return;
    }

    const selectedAnchor = getSelectedAnchor(editor);
    const selectedText = selection.toString().trim();

    selectedAnchorRef.current = selectedAnchor;
    savedLinkRangeRef.current = range.cloneRange();
    setLinkDraft({
      text: selectedAnchor?.textContent?.trim() || selectedText,
      url: selectedAnchor?.getAttribute("href") ?? "",
    });
    setIsLinkDialogOpen(true);

    requestAnimationFrame(() => {
      linkTextInputRef.current?.focus();
      linkTextInputRef.current?.select();
    });
  }

  function closeLinkDialog() {
    setIsLinkDialogOpen(false);
    setLinkDraft({ text: "", url: "" });
    selectedAnchorRef.current = null;
    savedLinkRangeRef.current = null;
  }

  function applyLink() {
    const editor = editorRef.current;
    const href = normalizeHref(linkDraft.url);
    const label = linkDraft.text.trim() || linkDraft.url.trim();

    if (!editor || !href || !label) {
      return;
    }

    editor.focus();

    if (selectedAnchorRef.current && editor.contains(selectedAnchorRef.current)) {
      selectedAnchorRef.current.textContent = label;
      setAnchorHref(selectedAnchorRef.current, href);
    } else {
      const range = savedRangeForEditor(editor, savedLinkRangeRef.current);

      if (range) {
        insertAnchorAtRange(range, label, href);
      } else {
        insertAnchorAtCurrentSelection(label, href);
      }
    }

    syncMarkdownFromEditor();
    closeLinkDialog();
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

  function handleInput() {
    syncMarkdownFromEditor();
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();

    if (disabled || readOnly) {
      return;
    }

    const text = event.clipboardData.getData("text/plain");

    if (isUrlLike(text.trim()) && text.trim() === text) {
      const href = normalizeHref(text);

      if (href) {
        insertAnchorAtCurrentSelection(text, href);
        syncMarkdownFromEditor();
        return;
      }
    }

    document.execCommand("insertText", false, text);
    syncMarkdownFromEditor();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    (onKeyDown as ((event: KeyboardEvent<HTMLDivElement>) => void) | undefined)?.(
      event,
    );

    if (event.defaultPrevented || disabled || readOnly) {
      return;
    }

    if (
      event.key === " " &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.shiftKey
    ) {
      const converted = convertListTriggerToList();

      if (converted) {
        event.preventDefault();
        return;
      }
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
      applyFormat("bold");
      return;
    }

    if (key === "i" && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      clearShortcutHint();
      applyFormat("italic");
      return;
    }

    if (key === "k" && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      clearShortcutHint();
      openLinkDialog();
      return;
    }

    if (event.shiftKey && !event.altKey && event.code === "Digit8") {
      event.preventDefault();
      clearShortcutHint();
      applyFormat("unordered");
      return;
    }

    if (event.shiftKey && !event.altKey && event.code === "Digit7") {
      event.preventDefault();
      clearShortcutHint();
      applyFormat("ordered");
      return;
    }

    if (event.shiftKey && !event.altKey && event.code === "Digit9") {
      event.preventDefault();
      clearShortcutHint();
      applyFormat("quote");
    }
  }

  function handleKeyUp(event: KeyboardEvent<HTMLDivElement>) {
    (onKeyUp as ((event: KeyboardEvent<HTMLDivElement>) => void) | undefined)?.(
      event,
    );

    if (event.key === "Meta" || event.key === "Control") {
      clearShortcutHint();
    }
  }

  function handleFocus(event: FocusEvent<HTMLDivElement>) {
    (onFocus as ((event: FocusEvent<HTMLDivElement>) => void) | undefined)?.(
      event,
    );
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    syncMarkdownFromEditor();
    (onBlur as ((event: FocusEvent<HTMLDivElement>) => void) | undefined)?.(
      event,
    );
    clearShortcutHint();
  }

  function handleEditorClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target instanceof Element ? event.target : null;
    const anchor = target?.closest("a");

    if (!anchor || !(event.metaKey || event.ctrlKey)) {
      return;
    }

    event.preventDefault();
    window.open(anchor.href, "_blank", "noopener,noreferrer");
  }

  function handleLinkDialogKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      applyLink();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeLinkDialog();
    }
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-neutral-950/20",
        wrapperClassName,
      )}
    >
      <textarea
        {...textareaProps}
        ref={hiddenTextareaRef}
        aria-hidden="true"
        className="pointer-events-none absolute size-px opacity-0"
        disabled={disabled}
        maxLength={maxLength}
        name={name}
        onChange={onChange}
        readOnly={!onChange}
        tabIndex={-1}
        value={markdown}
      />
      <div
        aria-disabled={disabled || undefined}
        aria-label={textareaProps["aria-label"] ?? placeholder ?? "Text"}
        aria-multiline="true"
        className={cn(
          "min-h-24 w-full overflow-auto rounded-md bg-white px-3 py-2 text-sm leading-6 text-neutral-950 outline-none transition empty:before:text-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 [&_a]:font-medium [&_a]:text-neutral-950 [&_a]:underline [&_a]:decoration-neutral-300 [&_a]:underline-offset-2 [&_a:hover]:decoration-neutral-950 [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-300 [&_blockquote]:pl-3 [&_blockquote]:text-neutral-600 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5",
          disabled || readOnly ? "cursor-not-allowed opacity-50" : "",
          className,
        )}
        contentEditable={!disabled && !readOnly}
        data-placeholder={placeholder}
        id={id}
        onBlur={handleBlur}
        onClick={handleEditorClick}
        onFocus={handleFocus}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onPaste={handlePaste}
        ref={editorRef}
        role="textbox"
        style={{
          minHeight: `${Math.max(Number(rows ?? 4), 3) * 1.5 + 1}rem`,
        }}
        suppressContentEditableWarning
      />
      {!markdown.trim() && placeholder ? (
        <span className="pointer-events-none absolute left-3 top-2 text-sm leading-6 text-neutral-400">
          {placeholder}
        </span>
      ) : null}
      {isLinkDialogOpen ? (
        <div className="absolute bottom-2 left-2 right-2 z-20 rounded-md border border-neutral-200 bg-white p-3 text-sm shadow-lg">
          <div className="grid gap-2 sm:grid-cols-[1fr_1.2fr_auto]">
            <label className="grid gap-1">
              <span className="text-xs font-medium text-neutral-500">
                Anzeigename
              </span>
              <input
                ref={linkTextInputRef}
                className="h-9 rounded-md border border-neutral-200 px-2 text-sm outline-none transition focus:border-neutral-300 focus:ring-2 focus:ring-neutral-950/10"
                value={linkDraft.text}
                onChange={(event) =>
                  setLinkDraft((current) => ({
                    ...current,
                    text: event.target.value,
                  }))
                }
                onKeyDown={handleLinkDialogKeyDown}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-medium text-neutral-500">Link</span>
              <input
                className="h-9 rounded-md border border-neutral-200 px-2 text-sm outline-none transition focus:border-neutral-300 focus:ring-2 focus:ring-neutral-950/10"
                placeholder="https://..."
                value={linkDraft.url}
                onChange={(event) =>
                  setLinkDraft((current) => ({
                    ...current,
                    url: event.target.value,
                  }))
                }
                onKeyDown={handleLinkDialogKeyDown}
              />
            </label>
            <div className="flex items-end gap-2">
              <button
                type="button"
                className="h-9 rounded-md border border-neutral-200 px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                onClick={closeLinkDialog}
              >
                Abbrechen
              </button>
              <button
                type="button"
                className="h-9 rounded-md bg-neutral-950 px-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                onClick={applyLink}
              >
                Anwenden
              </button>
            </div>
          </div>
        </div>
      ) : null}
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

function convertListTriggerToList() {
  const selection = window.getSelection();

  if (!selection || !selection.isCollapsed || selection.rangeCount === 0) {
    return false;
  }

  const range = selection.getRangeAt(0);
  const editor = getEditorFromRange(range);

  if (!editor) {
    return false;
  }

  const block = getCurrentBlock(editor, range.startContainer);
  const triggerRange = range.cloneRange();
  triggerRange.setStart(block, 0);

  const triggerText = triggerRange.toString().replace(/\u00a0/g, " ");
  const trimmedTrigger = triggerText.trim();
  const isUnordered = trimmedTrigger === "-" || trimmedTrigger === "*";
  const isOrdered = trimmedTrigger === "1.";

  if (
    (!isUnordered && !isOrdered) ||
    triggerText.trimStart() !== trimmedTrigger
  ) {
    return false;
  }

  triggerRange.deleteContents();
  document.execCommand(isOrdered ? "insertOrderedList" : "insertUnorderedList");

  editor.dispatchEvent(new InputEvent("input", inputEventOptions));

  return true;
}

function valueToString(value: RichTextTextareaProps["value"] | undefined) {
  if (Array.isArray(value)) {
    return value.join("\n");
  }

  return value === null || value === undefined ? "" : String(value);
}

function markdownToEditorHtml(value: string) {
  const lines = value.replace(/\r\n?/g, "\n").split("\n");
  const html: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const unorderedMatch = line.match(unorderedListPattern);
    const orderedMatch = line.match(orderedListPattern);
    const quoteMatch = line.match(quotePattern);

    if (!line.trim()) {
      html.push("<div><br></div>");
      continue;
    }

    if (unorderedMatch) {
      const items: string[] = [];
      while (index < lines.length) {
        const match = lines[index].match(unorderedListPattern);
        if (!match) {
          break;
        }
        items.push(`<li>${formatMarkdownInline(match[1])}</li>`);
        index += 1;
      }
      index -= 1;
      html.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    if (orderedMatch) {
      const items: string[] = [];
      while (index < lines.length) {
        const match = lines[index].match(orderedListPattern);
        if (!match) {
          break;
        }
        items.push(`<li>${formatMarkdownInline(match[1])}</li>`);
        index += 1;
      }
      index -= 1;
      html.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    if (quoteMatch) {
      const quoteLines: string[] = [];
      while (index < lines.length) {
        const match = lines[index].match(quotePattern);
        if (!match) {
          break;
        }
        quoteLines.push(`<div>${formatMarkdownInline(match[1])}</div>`);
        index += 1;
      }
      index -= 1;
      html.push(`<blockquote>${quoteLines.join("")}</blockquote>`);
      continue;
    }

    html.push(`<div>${formatMarkdownInline(line)}</div>`);
  }

  return html.join("");
}

function formatMarkdownInline(value: string) {
  return value
    .split(inlinePattern)
    .filter(Boolean)
    .map((part) => {
      const markdownLinkMatch = part.match(markdownLinkPattern);

      if (markdownLinkMatch) {
        const [, label, href] = markdownLinkMatch;
        const normalizedHref = normalizeHref(href);

        if (normalizedHref) {
          return `<a href="${escapeHtml(normalizedHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
        }
      }

      if (isUrlLike(part)) {
        const { text, trailing } = stripTrailingPunctuation(part);
        const normalizedHref = normalizeHref(text);

        if (normalizedHref) {
          return `<a href="${escapeHtml(normalizedHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>${escapeHtml(trailing)}`;
        }
      }

      if (
        (part.startsWith("**") && part.endsWith("**")) ||
        (part.startsWith("__") && part.endsWith("__"))
      ) {
        return `<strong>${escapeHtml(part.slice(2, -2))}</strong>`;
      }

      if (
        (part.startsWith("_") && part.endsWith("_")) ||
        (part.startsWith("*") && part.endsWith("*"))
      ) {
        return `<em>${escapeHtml(part.slice(1, -1))}</em>`;
      }

      return escapeHtml(part);
    })
    .join("");
}

function editorToMarkdown(editor: HTMLElement) {
  const lines = Array.from(editor.childNodes).flatMap((node) =>
    nodeToMarkdownLines(node),
  );

  return normalizeMarkdown(lines.join("\n"));
}

function nodeToMarkdownLines(node: ChildNode): string[] {
  if (node.nodeType === Node.TEXT_NODE) {
    return [node.textContent ?? ""];
  }

  if (!(node instanceof HTMLElement)) {
    return [];
  }

  if (node.tagName === "BR") {
    return [""];
  }

  if (node.tagName === "UL") {
    return Array.from(node.children).map((child) => `- ${inlineMarkdown(child)}`);
  }

  if (node.tagName === "OL") {
    return Array.from(node.children).map(
      (child, index) => `${index + 1}. ${inlineMarkdown(child)}`,
    );
  }

  if (node.tagName === "BLOCKQUOTE") {
    const lines = Array.from(node.childNodes).flatMap((child) =>
      nodeToMarkdownLines(child),
    );
    return lines.map((line) => `> ${line}`);
  }

  return [inlineMarkdown(node)];
}

function inlineMarkdown(node: ChildNode): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }

  if (!(node instanceof HTMLElement)) {
    return "";
  }

  if (node.tagName === "BR") {
    return "\n";
  }

  if (node.tagName === "A") {
    const label = node.textContent?.trim() ?? "";
    const href = node.getAttribute("href") ?? "";

    if (!label || !href) {
      return label;
    }

    return `[${escapeMarkdownLinkText(label)}](${href})`;
  }

  const content = Array.from(node.childNodes).map(inlineMarkdown).join("");

  if (node.tagName === "B" || node.tagName === "STRONG") {
    return content ? `**${content}**` : "";
  }

  if (node.tagName === "EM" || node.tagName === "I") {
    return content ? `_${content}_` : "";
  }

  return content;
}

function normalizeMarkdown(value: string) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();
}

function ensureSelection(editor: HTMLElement) {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount > 0) {
    return;
  }

  const range = document.createRange();

  if (!editor.textContent?.trim()) {
    editor.textContent = fallbackSelection;
    range.selectNodeContents(editor);
  } else {
    range.selectNodeContents(editor);
    range.collapse(false);
  }

  selection.removeAllRanges();
  selection.addRange(range);
}

function rangeBelongsToEditor(editor: HTMLElement, range: Range) {
  return (
    editor.contains(range.startContainer) && editor.contains(range.endContainer)
  );
}

function getSelectedAnchor(editor: HTMLElement) {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);

  if (!rangeBelongsToEditor(editor, range)) {
    return null;
  }

  const element =
    selection.anchorNode instanceof HTMLElement
      ? selection.anchorNode
      : selection.anchorNode?.parentElement;
  const anchor = element?.closest("a");

  return anchor instanceof HTMLAnchorElement && editor.contains(anchor)
    ? anchor
    : null;
}

function insertAnchorAtCurrentSelection(label: string, href: string) {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return;
  }

  insertAnchorAtRange(selection.getRangeAt(0), label, href);
}

function insertAnchorAtRange(range: Range, label: string, href: string) {
  const anchor = document.createElement("a");
  anchor.textContent = label;
  setAnchorHref(anchor, href);

  range.deleteContents();
  range.insertNode(anchor);

  const spacer = document.createTextNode(" ");
  anchor.after(spacer);

  const selection = window.getSelection();
  const nextRange = document.createRange();
  nextRange.setStartAfter(spacer);
  nextRange.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(nextRange);
}

function savedRangeForEditor(editor: HTMLElement, range: Range | null) {
  if (!range || !rangeBelongsToEditor(editor, range)) {
    return null;
  }

  return range;
}

function getEditorFromRange(range: Range) {
  const element =
    range.startContainer instanceof HTMLElement
      ? range.startContainer
      : range.startContainer.parentElement;

  const editor = element?.closest('[role="textbox"][contenteditable="true"]');

  return editor instanceof HTMLDivElement ? editor : null;
}

function getCurrentBlock(editor: HTMLElement, node: Node) {
  let element = node instanceof HTMLElement ? node : node.parentElement;

  while (element && element !== editor) {
    if (
      element.tagName === "DIV" ||
      element.tagName === "P" ||
      element.tagName === "LI" ||
      element.tagName === "BLOCKQUOTE"
    ) {
      return element;
    }

    element = element.parentElement;
  }

  return editor;
}

function hasSelectedText(editor: HTMLElement) {
  const selection = window.getSelection();

  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    return false;
  }

  const anchorNode = selection.anchorNode;
  const focusNode = selection.focusNode;

  return Boolean(
    anchorNode &&
      focusNode &&
      editor.contains(anchorNode) &&
      editor.contains(focusNode) &&
      selection.toString().trim(),
  );
}

function normalizeHref(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  if (/^(https?:\/\/|mailto:)/i.test(trimmedValue)) {
    return trimmedValue;
  }

  if (/^www\./i.test(trimmedValue)) {
    return `https://${trimmedValue}`;
  }

  return `https://${trimmedValue}`;
}

function isUrlLike(value: string) {
  return rawUrlPattern.test(value.trim());
}

function setAnchorHref(anchor: HTMLAnchorElement, href: string) {
  anchor.href = href;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
}

function stripTrailingPunctuation(value: string) {
  const match = value.match(/^(.+?)([.,;:!?)]*)$/);

  return {
    text: match?.[1] ?? value,
    trailing: match?.[2] ?? "",
  };
}

function escapeMarkdownLinkText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\]/g, "\\]");
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
