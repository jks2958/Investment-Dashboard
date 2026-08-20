import { Link } from "wouter";
import { Bell, MessageSquare, Search } from "lucide-react";

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
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Messages"
          className="hidden size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent sm:flex"
        >
          <MessageSquare className="size-4.5" />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="hidden size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent sm:flex"
        >
          <Bell className="size-4.5" />
        </button>
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search Here"
            aria-label="Search"
            className="h-9 w-48 rounded-full border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-64"
          />
        </div>
        <Link
          href="/account"
          aria-label="Account"
          className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
        >
          {initials(profile?.name ?? "Investor")}
        </Link>
      </div>
    </header>
  );
}
