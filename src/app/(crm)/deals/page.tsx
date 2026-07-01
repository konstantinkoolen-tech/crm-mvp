import { DealCreateModalButton } from "@/components/crm/deal-create-modal-button";
import { DealKanban } from "@/components/crm/deal-kanban";
import { listCompanies } from "@/lib/db/companies";
import { listDeals } from "@/lib/db/deals";

export default function DealsPage() {
  const dealsPromise = listDeals();
  const companiesPromise = listCompanies();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950">Deals</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Einfache Kanban-Pipeline nach Stufen.
          </p>
        </div>
        <DealsCreateButton companiesPromise={companiesPromise} />
      </div>

      <DealsPipeline dealsPromise={dealsPromise} companiesPromise={companiesPromise} />
    </section>
  );
}

async function DealsCreateButton({
  companiesPromise,
}: {
  companiesPromise: ReturnType<typeof listCompanies>;
}) {
  const companies = await companiesPromise;
  return <DealCreateModalButton companies={companies} />;
}

async function DealsPipeline({
  dealsPromise,
  companiesPromise,
}: {
  dealsPromise: ReturnType<typeof listDeals>;
  companiesPromise: ReturnType<typeof listCompanies>;
}) {
  const [deals, companies] = await Promise.all([dealsPromise, companiesPromise]);

  return (
    <DealKanban
      companies={companies}
      deals={deals}
      emptyAction={<DealCreateModalButton companies={companies} label="Deal erstellen" />}
    />
  );
}
