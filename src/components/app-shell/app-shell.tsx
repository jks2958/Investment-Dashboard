import * as React from "react";
import { Menu, X } from "lucide-react";

import { Header } from "@/components/app-shell/header";
import { Sidebar } from "@/components/app-shell/sidebar";
import { cn } from "@/lib/utils";

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileNavOpen(false);
  }, [title]);

  return (
    <div className="mx-auto flex min-h-svh max-w-[1600px] md:grid md:grid-cols-[300px_1fr]">
      <Sidebar className="hidden md:flex" />

      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          mobileNavOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/60 transition-opacity",
            mobileNavOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileNavOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-[85%] max-w-xs bg-background shadow-xl transition-transform",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileNavOpen(false)}
            className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
          >
            <X className="size-4" />
          </button>
          <Sidebar className="h-full" />
        </div>
      </div>

      <div className="flex min-w-0 flex-col">
        <div className="flex items-center gap-2 p-4 pb-0 md:hidden">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileNavOpen(true)}
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
          >
            <Menu className="size-5" />
          </button>
        </div>
        <Header title={title} />
        <main className="flex-1 px-4 pb-8 md:px-6">{children}</main>
      </div>
    </div>
  );
}
