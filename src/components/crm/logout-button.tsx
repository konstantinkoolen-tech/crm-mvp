import { LogOut } from "lucide-react";
import { logout } from "@/app/(auth)/login/actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
      >
        <LogOut className="size-4" aria-hidden="true" />
        Abmelden
      </button>
    </form>
  );
}
