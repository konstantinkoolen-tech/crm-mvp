import { cn } from "@/lib/utils";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-neutral-200/80",
        className,
      )}
    />
  );
}

function SkeletonCard({
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <div className={cn("rounded-lg border border-neutral-200 bg-white p-6 shadow-sm", className)}>
      {children}
    </div>
  );
}

function PageHeaderSkeleton({ action = false }: { action?: boolean }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-3">
        <SkeletonBlock className="h-8 w-44" />
        <SkeletonBlock className="h-4 w-72 max-w-full" />
      </div>
      {action ? <SkeletonBlock className="h-10 w-28 rounded-lg" /> : null}
    </div>
  );
}

function TableRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-4 border-b border-neutral-200 pb-3">
        <SkeletonBlock className="h-4 w-20" />
        <SkeletonBlock className="h-4 w-20" />
        <SkeletonBlock className="h-4 w-20" />
        <SkeletonBlock className="ml-auto h-4 w-20" />
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          className="grid grid-cols-4 items-center gap-4 rounded-lg border border-neutral-200 p-4"
          key={index}
        >
          <div className="space-y-2">
            <SkeletonBlock className="h-5 w-36" />
            <SkeletonBlock className="h-3 w-20" />
          </div>
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-4 w-40" />
          <div className="flex justify-end gap-2">
            <SkeletonBlock className="h-9 w-9 rounded-lg" />
            <SkeletonBlock className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <section className="space-y-6">
      <PageHeaderSkeleton />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard className="space-y-4" key={index}>
            <div className="flex items-start justify-between">
              <SkeletonBlock className="h-4 w-28" />
              <SkeletonBlock className="h-5 w-5 rounded" />
            </div>
            <SkeletonBlock className="h-8 w-12" />
          </SkeletonCard>
        ))}
      </div>
      <SkeletonCard className="space-y-6">
        <div className="space-y-3">
          <SkeletonBlock className="h-6 w-48" />
          <SkeletonBlock className="h-4 w-80 max-w-full" />
        </div>
        <div className="rounded-lg border border-dashed border-neutral-200 p-10">
          <div className="mx-auto space-y-3">
            <SkeletonBlock className="mx-auto h-5 w-44" />
            <SkeletonBlock className="mx-auto h-4 w-56" />
          </div>
        </div>
      </SkeletonCard>
    </section>
  );
}

export function TablePageSkeleton() {
  return (
    <section className="space-y-6">
      <PageHeaderSkeleton action />
      <SkeletonCard>
        <TableRowsSkeleton />
      </SkeletonCard>
    </section>
  );
}

export function KanbanPageSkeleton() {
  return (
    <section className="space-y-6">
      <PageHeaderSkeleton action />
      <div className="grid gap-4 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonCard className="min-h-80 space-y-4 p-4" key={index}>
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-5 w-24" />
              <SkeletonBlock className="h-5 w-8 rounded-full" />
            </div>
            {Array.from({ length: index < 2 ? 2 : 1 }).map((__, rowIndex) => (
              <div className="space-y-3 rounded-lg border border-neutral-200 p-4" key={rowIndex}>
                <SkeletonBlock className="h-5 w-36" />
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-4 w-20" />
              </div>
            ))}
          </SkeletonCard>
        ))}
      </div>
    </section>
  );
}

export function DetailPageSkeleton() {
  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <SkeletonBlock className="h-5 w-24" />
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-8 w-48" />
            <SkeletonBlock className="h-6 w-14 rounded-full" />
          </div>
          <SkeletonBlock className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <SkeletonBlock className="h-10 w-28 rounded-lg" />
          <SkeletonBlock className="h-10 w-28 rounded-lg" />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <SkeletonCard className="space-y-8">
          <div className="space-y-3">
            <SkeletonBlock className="h-6 w-32" />
            <SkeletonBlock className="h-4 w-44" />
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="space-y-2" key={index}>
                <SkeletonBlock className="h-4 w-20" />
                <SkeletonBlock className="h-5 w-36" />
              </div>
            ))}
          </div>
        </SkeletonCard>
        <SkeletonCard className="space-y-5">
          <SkeletonBlock className="h-6 w-28" />
          <SkeletonBlock className="h-4 w-36" />
          <SkeletonBlock className="h-5 w-44" />
        </SkeletonCard>
      </div>
      <SkeletonCard className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-6 w-32" />
            <SkeletonBlock className="h-4 w-72 max-w-full" />
          </div>
          <SkeletonBlock className="h-10 w-28 rounded-lg" />
        </div>
        <TableRowsSkeleton rows={3} />
      </SkeletonCard>
      <SkeletonCard className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-6 w-24" />
            <SkeletonBlock className="h-4 w-64 max-w-full" />
          </div>
          <SkeletonBlock className="h-10 w-24 rounded-lg" />
        </div>
        <div className="rounded-lg border border-dashed border-neutral-200 p-10">
          <SkeletonBlock className="mx-auto h-5 w-40" />
        </div>
      </SkeletonCard>
      <ActivityListSkeleton />
    </section>
  );
}

export function FormPageSkeleton() {
  return (
    <section className="space-y-6">
      <PageHeaderSkeleton />
      <SkeletonCard className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="space-y-2" key={index}>
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-28 w-full rounded-lg" />
        </div>
        <div className="flex justify-end gap-2">
          <SkeletonBlock className="h-10 w-24 rounded-lg" />
          <SkeletonBlock className="h-10 w-28 rounded-lg" />
        </div>
      </SkeletonCard>
    </section>
  );
}

export function ActivityListSkeleton() {
  return (
    <SkeletonCard className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-6 w-48" />
          <SkeletonBlock className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <SkeletonBlock className="h-9 w-24 rounded-lg" />
          <SkeletonBlock className="h-9 w-24 rounded-lg" />
        </div>
      </div>
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="rounded-lg border border-neutral-200 p-4" key={index}>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <SkeletonBlock className="h-5 w-56 max-w-full" />
              <SkeletonBlock className="h-4 w-40" />
            </div>
            <SkeletonBlock className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </SkeletonCard>
  );
}

export function ValuePropsSkeleton() {
  return (
    <section className="space-y-6">
      <PageHeaderSkeleton action />
      <SkeletonCard className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="rounded-lg border border-neutral-200 p-4" key={index}>
            <div className="grid grid-cols-[32px_1fr_140px_40px] items-center gap-4">
              <SkeletonBlock className="h-8 w-8 rounded-lg" />
              <div className="space-y-2">
                <SkeletonBlock className="h-5 w-48" />
                <SkeletonBlock className="h-4 w-72 max-w-full" />
              </div>
              <SkeletonBlock className="h-9 w-32 rounded-lg" />
              <SkeletonBlock className="h-9 w-9 rounded-lg" />
            </div>
          </div>
        ))}
      </SkeletonCard>
    </section>
  );
}
