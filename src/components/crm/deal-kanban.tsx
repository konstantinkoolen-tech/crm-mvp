"use client";

import type { DragEvent, ReactNode } from "react";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Building2,
  CalendarDays,
  ChevronRight,
  GripVertical,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { moveDealToStage } from "@/app/(crm)/deals/actions";
import { DealDeleteForm } from "@/components/crm/deal-delete-form";
import { DealEditModalButton } from "@/components/crm/deal-edit-modal-button";
import { DealStageBadge } from "@/components/crm/deal-stage-badge";
import { ListFilterBar } from "@/components/crm/list-filter-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Company } from "@/lib/db/companies";
import type { DealWithCompany } from "@/lib/db/deals";
import {
  dealStageLabels,
  dealStatusForStage,
  dealStatusLabels,
  dealStages,
} from "@/lib/deals/constants";
import { dealValueToArr, formatDealValuePair } from "@/lib/deals/value";
import { ownerDisplayName } from "@/lib/list-display";
import { cn } from "@/lib/utils";
import type { DealStage } from "@/types/database";

type DealKanbanProps = {
  companies: Company[];
  deals: DealWithCompany[];
  emptyAction?: ReactNode;
};

const activityTypeLabels: Record<string, string> = {
  note: "Notiz",
  linkedin_message: "LinkedIn Message",
  call: "Telefonat",
  email: "E-Mail",
  meeting: "Meeting",
  task_update: "Task-Update",
};

type DealSort = "updated_desc" | "value_desc" | "created_desc" | "title_asc";

export function DealKanban({ companies, deals, emptyAction }: DealKanbanProps) {
  const [boardDeals, setBoardDeals] = useState(deals);
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dropStage, setDropStage] = useState<DealStage | null>(null);
  const [sort, setSort] = useState<DealSort>("updated_desc");
  const [owner, setOwner] = useState("all");
  const [status, setStatus] = useState("all");
  const [expandedDealIds, setExpandedDealIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setBoardDeals(deals);
  }, [deals]);

  const ownerOptions = useMemo(() => {
    const owners = new Map<string, string>();
    for (const deal of boardDeals) {
      if (deal.owner) {
        owners.set(deal.owner.id, ownerDisplayName(deal.owner));
      }
    }
    return Array.from(owners, ([value, label]) => ({ value, label })).sort(
      (a, b) => a.label.localeCompare(b.label),
    );
  }, [boardDeals]);

  const visibleDeals = useMemo(() => {
    return [...boardDeals]
      .filter((deal) => owner === "all" || deal.owner_id === owner)
      .filter((deal) => status === "all" || deal.status === status)
      .sort((a, b) => {
        if (sort === "value_desc") {
          return (
            dealValueToArr(b.value_amount, b.value_period) -
            dealValueToArr(a.value_amount, a.value_period)
          );
        }
        if (sort === "created_desc") {
          return dateValue(b.created_at) - dateValue(a.created_at);
        }
        if (sort === "title_asc") {
          return a.title.localeCompare(b.title);
        }
        return dateValue(b.updated_at) - dateValue(a.updated_at);
      });
  }, [boardDeals, owner, sort, status]);

  const dealsByStage = useMemo(() => {
    return dealStages.reduce(
      (groupedDeals, stage) => {
        groupedDeals[stage] = visibleDeals.filter(
          (deal) => deal.stage === stage,
        );
        return groupedDeals;
      },
      {} as Record<DealStage, DealWithCompany[]>,
    );
  }, [visibleDeals]);

  if (boardDeals.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
          <h2 className="text-lg font-semibold text-neutral-950">
            Noch keine Deals
          </h2>
          <p className="mt-2 max-w-sm text-sm text-neutral-600">
            Erstelle den ersten Deal und ordne ihn einer Pipeline-Stufe zu.
          </p>
          <div className="mt-5">{emptyAction}</div>
        </CardContent>
      </Card>
    );
  }

  function handleDragStart(dealId: string) {
    setDraggedDealId(dealId);
  }

  function toggleDealExpanded(dealId: string) {
    setExpandedDealIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(dealId)) {
        nextIds.delete(dealId);
      } else {
        nextIds.add(dealId);
      }

      return nextIds;
    });
  }

  function handleDragOver(event: DragEvent<HTMLElement>, stage: DealStage) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropStage(stage);
  }

  function handleDrop(event: DragEvent<HTMLElement>, stage: DealStage) {
    event.preventDefault();
    const dealId = draggedDealId ?? event.dataTransfer.getData("text/plain");
    const deal = boardDeals.find((item) => item.id === dealId);

    setDraggedDealId(null);
    setDropStage(null);

    if (!deal || deal.stage === stage) {
      return;
    }

    const previousDeals = boardDeals;
    setBoardDeals((currentDeals) =>
      currentDeals.map((currentDeal) =>
        currentDeal.id === deal.id
          ? { ...currentDeal, stage, status: dealStatusForStage(stage) }
          : currentDeal,
      ),
    );

    startTransition(async () => {
      const result = await moveDealToStage(deal.id, deal.company_id, stage);

      if (!result.ok) {
        setBoardDeals(previousDeals);
      }
    });
  }

  return (
    <div className="space-y-4">
      <ListFilterBar
        sortValue={sort}
        sortOptions={[
          { value: "updated_desc", label: "Zuletzt aktualisiert" },
          { value: "value_desc", label: "Wert absteigend" },
          { value: "created_desc", label: "Erstellt zuletzt" },
          { value: "title_asc", label: "Name A-Z" },
        ]}
        onSortChange={(value) => setSort(value as DealSort)}
        ownerValue={owner}
        ownerOptions={ownerOptions}
        onOwnerChange={setOwner}
        statusValue={status}
        statusOptions={Object.entries(dealStatusLabels).map(
          ([value, label]) => ({
            value,
            label,
          }),
        )}
        onStatusChange={setStatus}
      />

      <div className="-mx-1 overflow-x-auto pb-3">
        <div className="grid min-w-max grid-flow-col auto-cols-[minmax(19rem,21rem)] gap-4 px-1 2xl:auto-cols-[minmax(20rem,22rem)]">
          {dealStages.map((stage) => {
            const stageDeals = dealsByStage[stage];

            return (
              <section
                key={stage}
                className={cn(
                  "min-w-0 rounded-lg transition",
                  dropStage === stage
                    ? "bg-neutral-100/80 ring-2 ring-neutral-300"
                    : "",
                )}
                onDragOver={(event) => handleDragOver(event, stage)}
                onDragLeave={() => setDropStage(null)}
                onDrop={(event) => handleDrop(event, stage)}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-neutral-950">
                      {dealStageLabels[stage]}
                    </h2>
                    <p className="text-xs text-neutral-500">
                      {stageDeals.length} Deals
                    </p>
                  </div>
                  <DealStageBadge stage={stage} />
                </div>

                <div className="min-h-32 space-y-3 rounded-lg border border-dashed border-transparent p-1">
                  {stageDeals.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-neutral-200 bg-white p-4 text-sm text-neutral-500">
                      Deal hier ablegen
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <DealCard
                        key={deal.id}
                        companies={companies}
                        deal={deal}
                        isExpanded={expandedDealIds.has(deal.id)}
                        isDragging={draggedDealId === deal.id}
                        isPending={isPending}
                        onDragStart={handleDragStart}
                        onDragEnd={() => {
                          setDraggedDealId(null);
                          setDropStage(null);
                        }}
                        onToggleExpanded={() => toggleDealExpanded(deal.id)}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DealCard({
  companies,
  deal,
  isExpanded,
  isDragging,
  isPending,
  onDragStart,
  onDragEnd,
  onToggleExpanded,
}: {
  companies: Company[];
  deal: DealWithCompany;
  isExpanded: boolean;
  isDragging: boolean;
  isPending: boolean;
  onDragStart: (dealId: string) => void;
  onDragEnd: () => void;
  onToggleExpanded: () => void;
}) {
  const formattedValue = formatDealValuePair(
    deal.value_amount,
    deal.value_currency,
    deal.value_period,
  );
  const latestActivity = formatLatestActivity(deal);

  return (
    <Card
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", deal.id);
        event.dataTransfer.effectAllowed = "move";
        onDragStart(deal.id);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "cursor-grab rounded-lg transition active:cursor-grabbing",
        isDragging
          ? "scale-[0.98] opacity-50"
          : "hover:border-neutral-300 hover:shadow-md",
        isPending ? "select-none" : "",
      )}
    >
      <CardHeader className={cn("p-4", isExpanded ? "pb-2" : "pb-4")}>
        <div className="flex items-start gap-2">
          <GripVertical
            className="mt-0.5 size-4 shrink-0 text-neutral-400"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm leading-5">
              <Link href={`/deals/${deal.id}`} className="hover:underline">
                {deal.title}
              </Link>
            </CardTitle>
            {isExpanded ? (
              <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-neutral-500">
                <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
                {deal.company ? (
                  <Link
                    href={`/companies/${deal.company.id}`}
                    className="truncate hover:text-neutral-950 hover:underline"
                  >
                    {deal.company.name}
                  </Link>
                ) : (
                  <span>Kein Unternehmen</span>
                )}
              </p>
            ) : (
              <div className="mt-2 space-y-2">
                <p className="flex items-center gap-1.5 truncate text-xs text-neutral-600">
                  <UserRound
                    className="size-3.5 shrink-0 text-neutral-400"
                    aria-hidden="true"
                  />
                  <span className="truncate">{formatOwner(deal.owner)}</span>
                </p>
                <p className="text-xs font-medium text-neutral-950">
                  {formattedValue ? (
                    <>
                      MRR {formattedValue.mrr}
                      <span className="font-normal text-neutral-500">
                        {" "}
                        · ARR {formattedValue.arr}
                      </span>
                    </>
                  ) : (
                    <span className="text-neutral-500">Kein Deal-Wert</span>
                  )}
                </p>
                <p className="line-clamp-2 text-xs text-neutral-500">
                  Letzte Aktivität:{" "}
                  <span className="text-neutral-700">{latestActivity}</span>
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Deal einklappen" : "Deal ausklappen"}
            title={isExpanded ? "Deal einklappen" : "Deal ausklappen"}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onToggleExpanded();
            }}
          >
            <ChevronRight
              className={cn(
                "size-4 transition-transform",
                isExpanded ? "rotate-90" : "",
              )}
              aria-hidden="true"
            />
          </button>
        </div>
      </CardHeader>
      {isExpanded ? (
        <CardContent className="space-y-3 p-4 pt-0">
          <dl className="grid gap-3 text-sm">
            <DealDetail label="MRR / ARR">
              {formattedValue ? (
                <span className="space-y-0.5">
                  <span className="block">MRR {formattedValue.mrr}</span>
                  <span className="block text-xs text-neutral-500">
                    ARR {formattedValue.arr}
                  </span>
                </span>
              ) : (
                "-"
              )}
            </DealDetail>
            <DealDetail label="Zuständig">
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <UserRound
                  className="size-3.5 shrink-0 text-neutral-400"
                  aria-hidden="true"
                />
                <span className="truncate">{formatOwner(deal.owner)}</span>
              </span>
            </DealDetail>
            <DealDetail label="Erstellt">
              <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                {formatDate(deal.created_at)}
              </span>
            </DealDetail>
            <DealDetail label="Status">
              {dealStatusLabels[deal.status]}
            </DealDetail>
            <DealDetail label="Letzte Aktivität">
              <span
                className={
                  deal.last_activity ? "text-neutral-700" : "text-neutral-500"
                }
              >
                {latestActivity}
              </span>
            </DealDetail>
          </dl>

          <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
            <DealEditModalButton companies={companies} deal={deal} />
            <DealDeleteForm dealId={deal.id} companyId={deal.company_id} />
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}

function DealDetail({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1 rounded-md bg-neutral-50 px-3 py-2">
      <dt className="text-xs font-medium text-neutral-500">{label}</dt>
      <dd className="min-w-0 break-words text-neutral-950">{children}</dd>
    </div>
  );
}

function formatOwner(owner: DealWithCompany["owner"]) {
  return ownerDisplayName(owner);
}

function formatLatestActivity(deal: DealWithCompany) {
  if (!deal.last_activity) {
    return "Noch keine Aktivität";
  }

  const activityLabel =
    deal.last_activity.title.trim() ||
    activityTypeLabels[deal.last_activity.type] ||
    "Aktivität";

  return `${activityLabel} ${formatRelativeTime(deal.last_activity.occurred_at)}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function dateValue(value: string) {
  return new Date(value).getTime();
}

function formatRelativeTime(date: string) {
  const timestamp = new Date(date).getTime();
  const diffInSeconds = Math.round((timestamp - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("de-DE", { numeric: "auto" });
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];

  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(diffInSeconds) >= secondsInUnit) {
      return formatter.format(Math.round(diffInSeconds / secondsInUnit), unit);
    }
  }

  return "gerade eben";
}
