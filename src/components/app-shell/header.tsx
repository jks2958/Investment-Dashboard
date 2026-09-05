import { Link } from "wouter";

import { AlertsMenu } from "@/components/app-shell/alerts-menu";
import { CommandPalette } from "@/components/app-shell/command-palette";
import { useProfile } from "@/hooks/use-profile";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Header({ title }: { title: string }) {
  const { data: profile } = useProfile();

  return (
    <header className="flex items-center justify-between gap-4 p-4 md:p-6">
      <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
      <div className="flex items-center gap-2 sm:gap-3">
        {/* The Messages button that used to sit here was inherited from the
            design reference and never did anything — this is a single-user
            app with nobody to message. */}
        <CommandPalette />
        <AlertsMenu />
        <Link
          href="/account"
          aria-label="Account"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
        >
          {initials(profile?.name ?? "Investor")}
        </Link>
      </div>
    </header>
  );
}
