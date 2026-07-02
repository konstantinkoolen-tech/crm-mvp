import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type RichTextDisplayProps = {
  className?: string;
  emptyFallback?: ReactNode;
  value: string | null | undefined;
};

type TextBlock =
  | {
      lines: string[];
      type: "paragraph";
    }
  | {
      items: string[];
      type: "ordered-list";
    }
  | {
      items: string[];
      type: "unordered-list";
    }
  | {
      lines: string[];
      type: "quote";
    };

const unorderedListPattern = /^[-*]\s+(.+)$/;
const orderedListPattern = /^\d+[.)]\s+(.+)$/;
const quotePattern = /^>\s?(.*)$/;
const markdownLinkPattern = /^\[([^\]\n]+)\]\(([^)\s]+)\)$/;
const rawUrlPattern = /^(https?:\/\/[^\s<>()]+|www\.[^\s<>()]+)$/i;
const inlinePattern =
  /(\[[^\]\n]+\]\([^)]+\)|\*\*[^*]+\*\*|__[^_]+__|_[^_\n]+_|\*[^*\n]+\*|https?:\/\/[^\s<>()]+|www\.[^\s<>()]+)/gi;

export function RichTextDisplay({
  className,
  emptyFallback = null,
  value,
}: RichTextDisplayProps) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return emptyFallback;
  }

  const blocks = parseBlocks(trimmedValue);

  return (
    <div className={cn("space-y-2 leading-6", className)}>
      {blocks.map((block, blockIndex) => {
        if (block.type === "unordered-list") {
          return (
            <ul
              key={`ul-${blockIndex}`}
              className="list-disc space-y-1 pl-5"
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${blockIndex}-${itemIndex}`}>
                  {formatInline(item)}
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "ordered-list") {
          return (
            <ol
              key={`ol-${blockIndex}`}
              className="list-decimal space-y-1 pl-5"
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${blockIndex}-${itemIndex}`}>
                  {formatInline(item)}
                </li>
              ))}
            </ol>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={`quote-${blockIndex}`}
              className="border-l-2 border-neutral-300 pl-3 text-neutral-600"
            >
              {block.lines.map((line, lineIndex) => (
                <p key={`${blockIndex}-${lineIndex}`}>{formatInline(line)}</p>
              ))}
            </blockquote>
          );
        }

        return (
          <div key={`paragraph-${blockIndex}`} className="space-y-1">
            {block.lines.map((line, lineIndex) => (
              <p key={`${blockIndex}-${lineIndex}`}>{formatInline(line)}</p>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function parseBlocks(value: string) {
  const blocks: TextBlock[] = [];
  const lines = value.replace(/\r\n?/g, "\n").split("\n");

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const unorderedMatch = line.match(unorderedListPattern);
    const orderedMatch = line.match(orderedListPattern);
    const quoteMatch = line.match(quotePattern);

    if (line.trim().length === 0) {
      flushParagraphBreak(blocks);
      continue;
    }

    if (unorderedMatch) {
      pushListItem(blocks, "unordered-list", unorderedMatch[1]);
      continue;
    }

    if (orderedMatch) {
      pushListItem(blocks, "ordered-list", orderedMatch[1]);
      continue;
    }

    if (quoteMatch) {
      pushQuoteLine(blocks, quoteMatch[1]);
      continue;
    }

    pushParagraphLine(blocks, line);
  }

  return blocks;
}

function flushParagraphBreak(blocks: TextBlock[]) {
  const lastBlock = blocks.at(-1);

  if (lastBlock?.type === "paragraph" && lastBlock.lines.length === 0) {
    return;
  }
}

function pushListItem(
  blocks: TextBlock[],
  type: "ordered-list" | "unordered-list",
  item: string,
) {
  const lastBlock = blocks.at(-1);

  if (lastBlock?.type === type) {
    lastBlock.items.push(item);
    return;
  }

  blocks.push({ items: [item], type });
}

function pushQuoteLine(blocks: TextBlock[], line: string) {
  const lastBlock = blocks.at(-1);

  if (lastBlock?.type === "quote") {
    lastBlock.lines.push(line);
    return;
  }

  blocks.push({ lines: [line], type: "quote" });
}

function pushParagraphLine(blocks: TextBlock[], line: string) {
  const lastBlock = blocks.at(-1);

  if (lastBlock?.type === "paragraph" && lastBlock.lines.length > 0) {
    lastBlock.lines.push(line);
    return;
  }

  blocks.push({ lines: [line], type: "paragraph" });
}

function formatInline(value: string) {
  const nodes: ReactNode[] = [];
  const parts = value.split(inlinePattern).filter(Boolean);

  parts.forEach((part, index) => {
    const markdownLinkMatch = part.match(markdownLinkPattern);

    if (markdownLinkMatch) {
      const [, label, href] = markdownLinkMatch;
      const normalizedHref = normalizeHref(href);

      if (normalizedHref) {
        nodes.push(
          <LinkText href={normalizedHref} key={index}>
            {label}
          </LinkText>,
        );
        return;
      }
    }

    if (isUrlLike(part)) {
      const { text, trailing } = stripTrailingPunctuation(part);
      const normalizedHref = normalizeHref(text);

      if (normalizedHref) {
        nodes.push(
          <LinkText href={normalizedHref} key={index}>
            {text}
          </LinkText>,
        );
        if (trailing) {
          nodes.push(trailing);
        }
        return;
      }
    }

    if (
      (part.startsWith("**") && part.endsWith("**")) ||
      (part.startsWith("__") && part.endsWith("__"))
    ) {
      nodes.push(<strong key={index}>{part.slice(2, -2)}</strong>);
      return;
    }

    if (
      (part.startsWith("_") && part.endsWith("_")) ||
      (part.startsWith("*") && part.endsWith("*"))
    ) {
      nodes.push(<em key={index}>{part.slice(1, -1)}</em>);
      return;
    }

    nodes.push(part);
  });

  return nodes;
}

function LinkText({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  return (
    <a
      className="font-medium text-neutral-950 underline decoration-neutral-300 underline-offset-2 transition hover:decoration-neutral-950"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
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

function stripTrailingPunctuation(value: string) {
  const match = value.match(/^(.+?)([.,;:!?)]*)$/);

  return {
    text: match?.[1] ?? value,
    trailing: match?.[2] ?? "",
  };
}
