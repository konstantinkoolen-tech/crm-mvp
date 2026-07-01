import { LogOut } from "lucide-react";
import { logout } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form action={logout}>
      <Button
        type="submit"
        variant="ghost"
        size={compact ? "sm" : "default"}
        className={
          compact
            ? "h-auto p-0 text-sm text-neutral-600 hover:bg-transparent hover:text-neutral-950"
            : "w-full justify-start px-3 text-neutral-600 hover:text-neutral-950"
        }
      >
        {compact ? null : <LogOut className="size-4" aria-hidden="true" />}
        Abmelden
      </Button>
    </form>
  );
}
