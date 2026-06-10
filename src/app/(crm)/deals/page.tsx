import { Plus } from "lucide-react";
import Link from "next/link";
import { DealKanban } from "@/components/crm/deal-kanban";
import { buttonVariants } from "@/components/ui/button";
import { listDeals } from "@/lib/db/deals";

export default function DealsPage() {
  const dealsPromise = listDeals();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950">Deals</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Einfache Kanban-Pipeline nach Stufen.
          </p>
        </div>
        <Link href="/deals/new" className={buttonVariants()}>
          <Plus aria-hidden="true" />
          Deal
        </Link>
      </div>

      <DealsPipeline dealsPromise={dealsPromise} />
    </section>
  );
}

async function DealsPipeline({
  dealsPromise,
}: {
  dealsPromise: ReturnType<typeof listDeals>;
}) {
  const deals = await dealsPromise;

  return <DealKanban deals={deals} />;
}
