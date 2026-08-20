import * as React from "react";
import { Check, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDashboardSettings, useUpdateDashboardSettings } from "@/hooks/use-dashboard-settings";
import { api, type Accent } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";

const ACCENT_PRESETS: { value: Accent; label: string; swatch: string }[] = [
  { value: "orange", label: "Orange", swatch: "oklch(0.7 0.16 55)" },
  { value: "blue", label: "Blue", swatch: "oklch(0.7 0.16 250)" },
  { value: "emerald", label: "Emerald", swatch: "oklch(0.7 0.16 150)" },
  { value: "violet", label: "Violet", swatch: "oklch(0.7 0.16 300)" },
  { value: "rose", label: "Rose", swatch: "oklch(0.7 0.16 350)" },
];

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { data: dashboardSettings } = useDashboardSettings();
  const updateDashboardSettings = useUpdateDashboardSettings();
  const [currentPassphrase, setCurrentPassphrase] = React.useState("");
  const [newPassphrase, setNewPassphrase] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      await api.changePassphrase(currentPassphrase, newPassphrase);
      setCurrentPassphrase("");
      setNewPassphrase("");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold">Appearance</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("light")}
            >
              <Sun className="size-4" /> Light
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("dark")}
            >
              <Moon className="size-4" /> Dark
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            {ACCENT_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                aria-label={preset.label}
                title={preset.label}
                onClick={() => updateDashboardSettings.mutate({ accent: preset.value })}
                className={cn(
                  "flex size-8 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-background transition-shadow",
                  dashboardSettings?.accent === preset.value ? "ring-foreground" : "ring-transparent",
                )}
                style={{ backgroundColor: preset.swatch }}
              >
                {dashboardSettings?.accent === preset.value && (
                  <Check className="size-4 text-white" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold">Change passphrase</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="max-w-sm space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassphrase">Current passphrase</Label>
              <Input
                id="currentPassphrase"
                type="password"
                value={currentPassphrase}
                onChange={(e) => setCurrentPassphrase(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassphrase">New passphrase</Label>
              <Input
                id="newPassphrase"
                type="password"
                value={newPassphrase}
                onChange={(e) => setNewPassphrase(e.target.value)}
                minLength={4}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-positive">Passphrase updated.</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? "Updating…" : "Update passphrase"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
