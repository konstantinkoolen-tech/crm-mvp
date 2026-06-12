import { ActivityListSkeleton } from "@/components/crm/page-skeletons";

export default function Loading() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <div className="h-8 w-44 animate-pulse rounded-md bg-neutral-200/80" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded-md bg-neutral-200/80" />
      </div>
      <ActivityListSkeleton />
    </section>
  );
}
