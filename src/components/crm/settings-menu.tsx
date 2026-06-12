"use client";

import {
  LogOut,
  Plug,
  Settings,
  SlidersHorizontal,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { LogoutButton } from "@/components/crm/logout-button";

type SettingsMenuProps = {
  userEmail?: string | null;
};

const settingsLinks = [
  {
    href: "/settings/users",
    label: "User Verwaltung",
    description: "Team, Rollen und Rechte",
    icon: Users,
  },
  {
    href: "/settings/operations",
    label: "Operatives",
    description: "Pipelines, Sequenzen, Automationen",
    icon: SlidersHorizontal,
  },
  {
    href: "/settings/integrations",
    label: "Integrationen",
    description: "Externe Tools verbinden",
    icon: Plug,
  },
];

export function SettingsMenu({ userEmail }: SettingsMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {open ? (
        <div className="absolute bottom-full left-0 z-20 mb-2 w-72 rounded-lg border border-neutral-200 bg-white p-2 shadow-lg">
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-500">
            <UserCog className="size-4" aria-hidden="true" />
            <span className="truncate">{userEmail ?? "Angemeldet"}</span>
          </div>
          <div className="my-1 border-t border-neutral-200" />
          {settingsLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950"
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block font-medium">{item.label}</span>
                  <span className="block truncate text-xs text-neutral-500">
                    {item.description}
                  </span>
                </span>
              </Link>
            );
          })}
          <div className="my-1 border-t border-neutral-200" />
          <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-600">
            <LogOut className="size-4" aria-hidden="true" />
            <LogoutButton compact />
          </div>
        </div>
      ) : null}
      <button
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <Settings className="size-4" aria-hidden="true" />
        Einstellungen
      </button>
    </div>
  );
}
