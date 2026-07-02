import {
  AlertCircle,
  BarChart3,
  Building2,
  Clock3,
  Flame,
  Handshake,
  Inbox,
  LifeBuoy,
  ListTodo,
  Snowflake,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import type React from "react";
import { DealRevenueScopeCard } from "@/components/crm/deal-revenue-scope-card";
import { TaskActions } from "@/components/crm/task-actions";
import { TaskStatusBadge } from "@/components/crm/task-status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  activityDirectionLabels,
  outreachKindLabels,
  outreachOutcomeLabels,
  painStatementLabels,
} from "@/lib/activities/constants";
import { listActivities, type ActivityWithContext } from "@/lib/db/activities";
import { listCompanies } from "@/lib/db/companies";
import { listDeals } from "@/lib/db/deals";
import { listOpenTasks } from "@/lib/db/tasks";
import {
  formatCurrencyAmount,
  summarizeDealValuePairsByCurrency,
} from "@/lib/deals/value";
import { isTaskOverdue } from "@/lib/tasks/constants";
import type {
  ActivityDirection,
  OutreachKind,
  OutreachOutcome,
  PainStatement,
} from "@/types/database";

const DASHBOARD_TILE_CLASS = "h-full min-h-[154px]";

export default function DashboardPage() {
  const dataPromise = Promise.all([
    listOpenTasks(),
    listDeals(),
    listCompanies(),
    listActivities(),
  ]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-950">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Offene Follow-ups und Pipeline-Überblick für das CRM-MVP.
        </p>
      </div>

      <DashboardContent dataPromise={dataPromise} />
    </section>
  );
}

async function DashboardContent({
  dataPromise,
}: {
  dataPromise: Promise<
    [
      Awaited<ReturnType<typeof listOpenTasks>>,
      Awaited<ReturnType<typeof listDeals>>,
      Awaited<ReturnType<typeof listCompanies>>,
      Awaited<ReturnType<typeof listActivities>>,
    ]
  >;
}) {
  const [openTasks, deals, companies, activities] = await dataPromise;
  const overdueTasks = openTasks.filter(isTaskOverdue);
  const pipelineDeals = deals.filter((deal) => deal.status === "open");
  const wonDeals = deals.filter((deal) => deal.status === "won");
  const pipelineDealValueTotals =
    summarizeDealValuePairsByCurrency(pipelineDeals);
  const wonDealValueTotals = summarizeDealValuePairsByCurrency(wonDeals);
  const outreachStats = getOutreachStats(activities);
  const inboundStats = getInboundStats(activities);

  return (
    <>
      <div className="grid auto-rows-fr items-stretch gap-4 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          href="/tasks"
          icon={
            <ListTodo className="size-5 text-neutral-500" aria-hidden="true" />
          }
          label="Offene Tasks"
          value={openTasks.length}
        />
        <MetricCard
          href="/dashboard"
          icon={
            <AlertCircle className="size-5 text-red-500" aria-hidden="true" />
          }
          label="Überfällig"
          value={overdueTasks.length}
          tone="danger"
        />
        <MetricCard
          href="/deals"
          icon={
            <Handshake className="size-5 text-neutral-500" aria-hidden="true" />
          }
          label="Pipeline Deals"
          value={pipelineDeals.length}
        />
        <DealRevenueScopeCard
          className={`${DASHBOARD_TILE_CLASS} md:col-span-2 xl:col-span-2`}
          pipeline={{
            arr: formatDealTotal(pipelineDealValueTotals, "arr"),
            dealCount: pipelineDeals.length,
            description: "offene Deals",
            mrr: formatDealTotal(pipelineDealValueTotals, "mrr"),
          }}
          active={{
            arr: formatDealTotal(wonDealValueTotals, "arr"),
            dealCount: wonDeals.length,
            description: "gewonnene Deals",
            mrr: formatDealTotal(wonDealValueTotals, "mrr"),
          }}
        />
        <MetricCard
          href="/companies"
          icon={
            <Building2 className="size-5 text-neutral-500" aria-hidden="true" />
          }
          label="Unternehmen"
          value={companies.length}
        />
      </div>

      <OutreachAnalytics stats={outreachStats} />
      <InboundAnalytics stats={inboundStats} />

      <Card>
        <CardHeader>
          <CardTitle>Überfällige Tasks</CardTitle>
          <CardDescription>
            Offene Follow-ups mit Fälligkeitsdatum vor heute.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {overdueTasks.length === 0 ? (
            <div className="rounded-md border border-dashed border-neutral-200 py-10 text-center">
              <p className="text-sm font-medium text-neutral-950">
                Keine überfälligen Tasks
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Alles im grünen Bereich.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Kontext</TableHead>
                  <TableHead>Fällig</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Link
                        href={`/tasks/${task.id}/edit`}
                        className="font-medium text-neutral-950 hover:underline"
                      >
                        {task.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {task.company ? (
                        <Link
                          href={`/companies/${task.company.id}`}
                          className="hover:underline"
                        >
                          {task.company.name}
                        </Link>
                      ) : task.deal ? (
                        <Link
                          href={`/deals/${task.deal.id}`}
                          className="hover:underline"
                        >
                          {task.deal.title}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {task.due_date ? formatDate(task.due_date) : "-"}
                    </TableCell>
                    <TableCell>
                      <TaskStatusBadge
                        dueDate={task.due_date}
                        status={task.status}
                      />
                    </TableCell>
                    <TableCell>
                      <TaskActions taskId={task.id} status={task.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}

type OutreachStats = {
  total: number;
  trackedTotal: number;
  interested: number;
  booked: number;
  painIdentified: number;
  interestRate: number;
  bookedRate: number;
  byKind: Array<{
    kind: OutreachKind;
    label: string;
    count: number;
  }>;
  byOutcome: Array<{
    outcome: OutreachOutcome;
    label: string;
    count: number;
  }>;
  byPain: Array<{
    pain: PainStatement;
    label: string;
    count: number;
  }>;
  byValueProp: Array<{
    id: string;
    label: string;
    count: number;
  }>;
};

function OutreachAnalytics({ stats }: { stats: OutreachStats }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Outreach Analytics</CardTitle>
            <CardDescription>
              Ausgehende Outreach-Wärme, Outcomes und Value Props.
            </CardDescription>
          </div>
          <Link
            href="/activities"
            className="inline-flex h-9 items-center justify-center rounded-md border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-950 transition hover:bg-neutral-100"
          >
            Aktivitäten öffnen
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-4">
          <MiniMetric
            icon={
              <BarChart3
                className="size-4 text-neutral-500"
                aria-hidden="true"
              />
            }
            label="Ausgehender Outreach"
            value={stats.total}
          />
          <MiniMetric
            icon={
              <TrendingUp
                className="size-4 text-emerald-600"
                aria-hidden="true"
              />
            }
            label="Interesse"
            value={`${stats.interestRate}%`}
            description={`${stats.interested} Aktivitäten`}
          />
          <MiniMetric
            icon={
              <Handshake
                className="size-4 text-neutral-500"
                aria-hidden="true"
              />
            }
            label="Follow-up gebucht"
            value={`${stats.bookedRate}%`}
            description={`${stats.booked} Aktivitäten`}
          />
          <MiniMetric
            icon={
              <Flame className="size-4 text-orange-500" aria-hidden="true" />
            }
            label="Pain erkannt"
            value={stats.painIdentified}
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <AnalyticsPanel title="Outreach-Art (nur ausgehend)">
            <div className="space-y-3">
              {stats.byKind.map((item) => (
                <BarRow
                  key={item.kind}
                  icon={kindIcon(item.kind)}
                  label={item.label}
                  count={item.count}
                  total={stats.total}
                />
              ))}
            </div>
          </AnalyticsPanel>

          <AnalyticsPanel title="Outcomes">
            {stats.byOutcome.length === 0 ? (
              <p className="text-sm text-neutral-500">
                Noch keine Outcomes erfasst.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.byOutcome.map((item) => (
                  <BarRow
                    key={item.outcome}
                    label={item.label}
                    count={item.count}
                    total={stats.trackedTotal}
                  />
                ))}
              </div>
            )}
          </AnalyticsPanel>

          <AnalyticsPanel title="Pain Aussage">
            <div className="space-y-3">
              {stats.byPain.map((item) => (
                <BarRow
                  key={item.pain}
                  label={item.label}
                  count={item.count}
                  total={stats.trackedTotal}
                />
              ))}
            </div>
          </AnalyticsPanel>

          <AnalyticsPanel title="Value Props">
            {stats.byValueProp.length === 0 ? (
              <p className="text-sm text-neutral-500">
                Noch keine Value Props in Aktivitäten.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.byValueProp.map((item) => (
                  <BarRow
                    key={item.id}
                    label={item.label}
                    count={item.count}
                    total={stats.trackedTotal}
                  />
                ))}
              </div>
            )}
          </AnalyticsPanel>
        </div>
      </CardContent>
    </Card>
  );
}

type InboundStats = {
  total: number;
  activityTotal: number;
  warmContacts: number;
  warmCompanies: number;
  booked: number;
  byDirection: Array<{
    direction: ActivityDirection;
    label: string;
    count: number;
  }>;
  byType: Array<{
    type: string;
    label: string;
    count: number;
  }>;
};

function InboundAnalytics({ stats }: { stats: InboundStats }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Inbound Analytics</CardTitle>
            <CardDescription>
              Eingehende Signale, warme Kontakte und Customer-Success-Themen.
            </CardDescription>
          </div>
          <Link
            href="/activities"
            className="inline-flex h-9 items-center justify-center rounded-md border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-950 transition hover:bg-neutral-100"
          >
            Aktivitäten öffnen
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-4">
          <MiniMetric
            icon={<Inbox className="size-4 text-sky-600" aria-hidden="true" />}
            label="Eingehende Aktivitäten"
            value={stats.total}
          />
          <MiniMetric
            icon={
              <Users className="size-4 text-emerald-600" aria-hidden="true" />
            }
            label="Warme Kontakte"
            value={stats.warmContacts}
            description="Kontakte mit eingehender Aktivität"
          />
          <MiniMetric
            icon={
              <Building2
                className="size-4 text-neutral-500"
                aria-hidden="true"
              />
            }
            label="Warme Unternehmen"
            value={stats.warmCompanies}
            description="Unternehmen mit eingehender Aktivität"
          />
          <MiniMetric
            icon={
              <Handshake
                className="size-4 text-neutral-500"
                aria-hidden="true"
              />
            }
            label="Inbound Follow-ups"
            value={stats.booked}
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <AnalyticsPanel title="Aktivitäten nach Richtung">
            <div className="space-y-3">
              {stats.byDirection.map((item) => (
                <BarRow
                  key={item.direction}
                  label={item.label}
                  count={item.count}
                  total={stats.activityTotal}
                />
              ))}
            </div>
          </AnalyticsPanel>

          <AnalyticsPanel title="Inbound-Kanäle">
            {stats.byType.length === 0 ? (
              <p className="text-sm text-neutral-500">
                Noch keine eingehenden Aktivitäten erfasst.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.byType.map((item) => (
                  <BarRow
                    key={item.type}
                    label={item.label}
                    count={item.count}
                    total={stats.total}
                  />
                ))}
              </div>
            )}
          </AnalyticsPanel>

          <AnalyticsPanel title="Customer Success Statistiken">
            <div className="grid gap-3 sm:grid-cols-2">
              <PlaceholderMetric
                icon={
                  <LifeBuoy
                    className="size-4 text-neutral-500"
                    aria-hidden="true"
                  />
                }
                label="Anfragen"
                value="Noch nicht erfasst"
              />
              <PlaceholderMetric
                icon={
                  <BarChart3
                    className="size-4 text-neutral-500"
                    aria-hidden="true"
                  />
                }
                label="Art der Anfrage"
                value="Support / Feedback / Expansion"
              />
              <PlaceholderMetric
                icon={
                  <Clock3
                    className="size-4 text-neutral-500"
                    aria-hidden="true"
                  />
                }
                label="Time to Resolution"
                value="Platzhalter"
              />
              <PlaceholderMetric
                icon={
                  <AlertCircle
                    className="size-4 text-neutral-500"
                    aria-hidden="true"
                  />
                }
                label="Offene Eskalationen"
                value="Platzhalter"
              />
            </div>
          </AnalyticsPanel>

          <AnalyticsPanel title="Inbound-Themen">
            <div className="space-y-3 text-sm text-neutral-600">
              <PlaceholderRow
                label="Customer Success"
                value="Anfragen und Lösungszeiten"
              />
              <PlaceholderRow
                label="Warme Leads"
                value="Antworten, Rückfragen, Interesse"
              />
              <PlaceholderRow
                label="Bestandskontakte"
                value="Feedback, Expansion, Support"
              />
            </div>
          </AnalyticsPanel>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniMetric({
  description,
  icon,
  label,
  value,
}: {
  description?: string;
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-neutral-500">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-semibold text-neutral-950">{value}</p>
      {description ? (
        <p className="mt-1 text-xs text-neutral-500">{description}</p>
      ) : null}
    </div>
  );
}

function PlaceholderMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-neutral-700">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-sm text-neutral-500">{value}</p>
    </div>
  );
}

function PlaceholderRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-2">
      <span className="font-medium text-neutral-800">{label}</span>
      <span className="text-right text-neutral-500">{value}</span>
    </div>
  );
}

function AnalyticsPanel({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-neutral-950">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function BarRow({
  count,
  icon,
  label,
  total,
}: {
  count: number;
  icon?: React.ReactNode;
  label: string;
  total: number;
}) {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
        <span className="inline-flex min-w-0 items-center gap-2 font-medium text-neutral-800">
          {icon ? <span className="shrink-0">{icon}</span> : null}
          <span className="truncate">{label}</span>
        </span>
        <span className="shrink-0 text-neutral-500">
          {count} · {percent}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-neutral-950"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function getOutreachStats(activities: ActivityWithContext[]): OutreachStats {
  const communicationActivities = activities.filter((activity) =>
    ["linkedin_message", "call", "email", "meeting"].includes(activity.type),
  );
  const outreachActivities = communicationActivities.filter(
    (activity) => activity.direction === "outbound" && activity.outreach_kind,
  );
  const trackedActivities = communicationActivities.filter(
    (activity) => activity.direction === "inbound" || activity.outreach_kind,
  );
  const total = outreachActivities.length;
  const byKind = countBy(
    outreachActivities,
    (activity) => activity.outreach_kind,
  );
  const byOutcome = countBy(
    trackedActivities,
    (activity) => activity.outreach_outcome,
  );
  const byPain = countBy(
    trackedActivities,
    (activity) => activity.pain_statement,
  );
  const byValueProp = new Map<string, { label: string; count: number }>();

  for (const activity of trackedActivities) {
    if (!activity.value_prop) {
      continue;
    }

    const label = `${activity.value_prop.code}: ${activity.value_prop.label}`;
    const current = byValueProp.get(activity.value_prop.id);
    byValueProp.set(activity.value_prop.id, {
      label,
      count: (current?.count ?? 0) + 1,
    });
  }

  const interested = trackedActivities.filter(
    (activity) =>
      activity.outreach_outcome === "interested" ||
      activity.outreach_outcome === "follow_up_booked",
  ).length;
  const booked = trackedActivities.filter(
    (activity) => activity.outreach_outcome === "follow_up_booked",
  ).length;
  const painIdentified = trackedActivities.filter(
    (activity) => activity.pain_statement === "pain_identified",
  ).length;

  return {
    total,
    trackedTotal: trackedActivities.length,
    interested,
    booked,
    painIdentified,
    interestRate: percentage(interested, total),
    bookedRate: percentage(booked, total),
    byKind: (Object.keys(outreachKindLabels) as OutreachKind[]).map((kind) => ({
      kind,
      label: outreachKindLabels[kind],
      count: byKind.get(kind) ?? 0,
    })),
    byOutcome: (Object.keys(outreachOutcomeLabels) as OutreachOutcome[])
      .map((outcome) => ({
        outcome,
        label: outreachOutcomeLabels[outcome],
        count: byOutcome.get(outcome) ?? 0,
      }))
      .filter((item) => item.count > 0),
    byPain: (Object.keys(painStatementLabels) as PainStatement[]).map(
      (pain) => ({
        pain,
        label: painStatementLabels[pain],
        count: byPain.get(pain) ?? 0,
      }),
    ),
    byValueProp: Array.from(byValueProp, ([id, value]) => ({
      id,
      label: value.label,
      count: value.count,
    })).sort((a, b) => b.count - a.count),
  };
}

function getInboundStats(activities: ActivityWithContext[]): InboundStats {
  const communicationActivities = activities.filter((activity) =>
    ["linkedin_message", "call", "email", "meeting"].includes(activity.type),
  );
  const inboundActivities = communicationActivities.filter(
    (activity) => activity.direction === "inbound",
  );
  const byDirection = countBy(
    communicationActivities,
    (activity) => activity.direction,
  );
  const byType = countBy(inboundActivities, (activity) => activity.type);
  const warmContacts = new Set(
    inboundActivities
      .map((activity) => activity.contact_id)
      .filter((contactId): contactId is string => Boolean(contactId)),
  );
  const warmCompanies = new Set(
    inboundActivities
      .map((activity) => activity.company_id)
      .filter((companyId): companyId is string => Boolean(companyId)),
  );
  const booked = inboundActivities.filter(
    (activity) => activity.outreach_outcome === "follow_up_booked",
  ).length;

  return {
    total: inboundActivities.length,
    activityTotal: communicationActivities.length,
    warmContacts: warmContacts.size,
    warmCompanies: warmCompanies.size,
    booked,
    byDirection: (
      Object.keys(activityDirectionLabels) as ActivityDirection[]
    ).map((direction) => ({
      direction,
      label: activityDirectionLabels[direction],
      count: byDirection.get(direction) ?? 0,
    })),
    byType: ["linkedin_message", "call", "email", "meeting"]
      .map((type) => ({
        type,
        label:
          type === "linkedin_message"
            ? "LinkedIn Message"
            : type === "call"
              ? "Call"
              : type === "email"
                ? "E-Mail"
                : "Meeting",
        count: byType.get(type) ?? 0,
      }))
      .filter((item) => item.count > 0),
  };
}

function countBy<T>(
  items: T[],
  getKey: (item: T) => string | null | undefined,
) {
  const counts = new Map<string, number>();

  for (const item of items) {
    const key = getKey(item);

    if (!key) {
      continue;
    }

    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return counts;
}

function percentage(value: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function kindIcon(kind: OutreachKind) {
  if (kind === "snowflake") {
    return <Snowflake className="size-4 text-sky-600" aria-hidden="true" />;
  }

  if (kind === "fire_plus") {
    return <Flame className="size-4 text-red-600" aria-hidden="true" />;
  }

  return <Flame className="size-4 text-orange-500" aria-hidden="true" />;
}

function MetricCard({
  href,
  icon,
  label,
  tone,
  value,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  tone?: "danger";
  value: number | string;
}) {
  return (
    <Link href={href} className="block h-full">
      <Card
        className={
          tone === "danger"
            ? `${DASHBOARD_TILE_CLASS} border-red-200 bg-red-50`
            : DASHBOARD_TILE_CLASS
        }
      >
        <CardContent className="flex h-full flex-col justify-between p-4">
          <div className="flex items-center justify-between gap-3">
            <p
              className={
                tone === "danger"
                  ? "text-sm text-red-700"
                  : "text-sm text-neutral-500"
              }
            >
              {label}
            </p>
            {icon}
          </div>
          <p className="mt-2 text-2xl font-semibold text-neutral-950">
            {value}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function formatDealTotal(
  totals: ReturnType<typeof summarizeDealValuePairsByCurrency>,
  key: "arr" | "mrr",
) {
  if (totals.length === 0) {
    return formatCurrencyAmount(0, "EUR");
  }

  return totals
    .map((total) => formatCurrencyAmount(total[key], total.currency))
    .join(" + ");
}
