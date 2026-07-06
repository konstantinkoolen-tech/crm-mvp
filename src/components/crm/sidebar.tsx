import {
  Building2,
  CalendarDays,
  ClipboardList,
  Handshake,
  LayoutDashboard,
  NotebookText,
  Users,
} from "lucide-react";
import Link from "next/link";
import { SettingsMenu } from "@/components/crm/settings-menu";
import { cn } from "@/lib/utils";

const navigation = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/companies",
    label: "Unternehmen",
    icon: Building2,
  },
  {
    href: "/contacts",
    label: "Kontakte",
    icon: Users,
  },
  {
    href: "/deals",
    label: "Deals",
    icon: Handshake,
  },
  {
    href: "/activities",
    label: "Aktivitäten",
    icon: NotebookText,
  },
  {
    href: "/tasks",
    label: "Tasks",
    icon: ClipboardList,
  },
  {
    href: "/events",
    label: "Events",
    icon: CalendarDays,
  },
];

type SidebarProps = {
  canManageValueProps?: boolean;
  hasOverdueTasks?: boolean;
  userEmail?: string | null;
};

export function Sidebar({
  canManageValueProps = false,
  hasOverdueTasks = false,
  userEmail,
}: SidebarProps) {
  return (
    <aside className="hidden h-dvh w-64 shrink-0 border-r border-neutral-200 bg-white lg:flex lg:flex-col">
      <div className="border-b border-neutral-200 px-5 py-4">
        <Link href="/dashboard" className="block">
          <span className="text-sm font-semibold tracking-normal text-neutral-950">
            tagtig CRM
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Hauptnavigation">
        {navigation.map((item) => {
          const Icon = item.icon;
          const showTaskAlert = item.href === "/tasks" && hasOverdueTasks;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-700 transition",
                "hover:bg-neutral-100 hover:text-neutral-950",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span>{item.label}</span>
              {showTaskAlert ? (
                <span
                  className="ml-auto size-2.5 rounded-full bg-red-600"
                  aria-label="Es gibt fällige oder überfällige Tasks"
                  role="status"
                />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-neutral-200 p-3">
        <div className="mb-2 truncate px-3 text-xs font-medium text-neutral-500">
          {userEmail ?? "Angemeldet"}
        </div>
        <SettingsMenu
          canManageValueProps={canManageValueProps}
          userEmail={userEmail}
        />
      </div>
    </aside>
  );
}
