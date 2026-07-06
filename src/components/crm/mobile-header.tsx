import Link from "next/link";
import { LogoutButton } from "@/components/crm/logout-button";

type MobileHeaderProps = {
  canManageValueProps?: boolean;
  userEmail?: string | null;
};

export function MobileHeader({
  canManageValueProps = false,
  userEmail,
}: MobileHeaderProps) {
  return (
    <header className="border-b border-neutral-200 bg-white px-4 py-3 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <Link href="/dashboard" className="min-w-0">
          <span className="block text-sm font-semibold text-neutral-950">
            tagtig CRM
          </span>
          <span className="block truncate text-xs text-neutral-500">
            {userEmail ?? "Internes CRM"}
          </span>
        </Link>
        <div className="w-32">
          <LogoutButton />
        </div>
      </div>
      <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 text-sm" aria-label="Mobile Navigation">
        <Link className="rounded-md bg-neutral-100 px-3 py-2 text-neutral-900" href="/dashboard">
          Dashboard
        </Link>
        <Link className="rounded-md px-3 py-2 text-neutral-700" href="/companies">
          Unternehmen
        </Link>
        <Link className="rounded-md px-3 py-2 text-neutral-700" href="/contacts">
          Kontakte
        </Link>
        <Link className="rounded-md px-3 py-2 text-neutral-700" href="/deals">
          Deals
        </Link>
        <Link className="rounded-md px-3 py-2 text-neutral-700" href="/activities">
          Aktivitäten
        </Link>
        <Link className="rounded-md px-3 py-2 text-neutral-700" href="/tasks">
          Tasks
        </Link>
        <Link className="rounded-md px-3 py-2 text-neutral-700" href="/events">
          Events
        </Link>
        <Link className="rounded-md px-3 py-2 text-neutral-700" href="/settings/users">
          Einstellungen
        </Link>
        {canManageValueProps ? (
          <Link className="rounded-md px-3 py-2 text-neutral-700" href="/settings/value-props">
            Value Props
          </Link>
        ) : null}
      </nav>
    </header>
  );
}
