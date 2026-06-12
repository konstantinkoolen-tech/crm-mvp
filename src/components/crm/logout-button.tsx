import { LogOut } from "lucide-react";
import { logout } from "@/app/(auth)/login/actions";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form action={logout}>
      <button
        type="submit"
        className={
          compact
            ? "text-sm text-neutral-600 transition hover:text-neutral-950"
            : "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
        }
      >
        {compact ? null : <LogOut className="size-4" aria-hidden="true" />}
        Abmelden
      </button>
    </form>
  );
}
