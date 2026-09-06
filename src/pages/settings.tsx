import * as React from "react";
import { Check, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDashboardSettings, useUpdateDashboardSettings } from "@/hooks/use-dashboard-settings";
import { api, type Accent, type AllocationTargets } from "@/lib/api";
import { CARD_SKINS, CARD_SKIN_VALUES } from "@/lib/card-skins";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";
import { ExportCard } from "@/components/export-card";

const ACCENT_PRESETS: { value: Accent; label: string; swatch: string }[] = [
  { value: "forest", label: "Forest", swatch: "oklch(0.52 0.13 152)" },
  { value: "orange", label: "Orange", swatch: "oklch(0.7 0.16 55)" },
  { value: "blue", label: "Blue", swatch: "oklch(0.7 0.16 250)" },
  { value: "emerald", label: "Emerald", swatch: "oklch(0.7 0.16 150)" },
  { value: "violet", label: "Violet", swatch: "oklch(0.7 0.16 300)" },
  { value: "rose", label: "Rose", swatch: "oklch(0.7 0.16 350)" },
];

const TARGET_KEYS: { key: keyof AllocationTargets; label: string }[] = [
  { key: "stock", label: "Stocks" },
  { key: "fund", label: "Funds" },
  { key: "crypto", label: "Crypto" },
  { key: "cash", label: "Cash" },
  { key: "other", label: "Other Assets" },
];

const EMPTY_TARGETS: Record<keyof AllocationTargets, string> = {
  stock: "0",
  fund: "0",
  crypto: "0",
  cash: "0",
  other: "0",
};

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { data: dashboardSettings } = useDashboardSettings();
  const updateDashboardSettings = useUpdateDashboardSettings();
  const [currentPassphrase, setCurrentPassphrase] = React.useState("");
  const [newPassphrase, setNewPassphrase] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [targetDraft, setTargetDraft] =
    React.useState<Record<keyof AllocationTargets, string> | null>(null);

  const savedTargets = dashboardSettings?.targets;
  React.useEffect(() => {
    if (!savedTargets) return;
    setTargetDraft({
      stock: String(savedTargets.stock),
      fund: String(savedTargets.fund),
      crypto: String(savedTargets.crypto),
      cash: String(savedTargets.cash),
      other: String(savedTargets.other),
    });
  }, [savedTargets]);

  const currency = dashboardSettings?.currency ?? "USD";
  const savedRate = dashboardSettings?.usdPkrRate;
  const [rateDraft, setRateDraft] = React.useState("");

  React.useEffect(() => {
    if (savedRate !== undefined) setRateDraft(String(Number(savedRate)));
  }, [savedRate]);

  const rateChanged =
    rateDraft !== "" && Number(rateDraft) > 0 && Number(rateDraft) !== Number(savedRate);

  const targets = targetDraft ?? EMPTY_TARGETS;
  const targetTotal = TARGET_KEYS.reduce((sum, t) => sum + (Number(targets[t.key]) || 0), 0);
  // 100% is a complete mix; 0% clears the targets and hides the drift widget's
  // comparison. Anything in between would silently misreport drift.
  const targetsValid = targetTotal === 100 || targetTotal === 0;

  function saveTargets() {
    updateDashboardSettings.mutate({
      targets: {
        stock: Number(targets.stock) || 0,
        fund: Number(targets.fund) || 0,
        crypto: Number(targets.crypto) || 0,
        cash: Number(targets.cash) || 0,
        other: Number(targets.other) || 0,
      },
    });
  }

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
          <h2 className="text-base font-semibold">Total Assets card style</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {CARD_SKIN_VALUES.map((skin) => {
              const def = CARD_SKINS[skin];
              const selected = dashboardSettings?.cardSkin === skin;
              return (
                <button
                  key={skin}
                  type="button"
                  onClick={() => updateDashboardSettings.mutate({ cardSkin: skin })}
                  className={cn(
                    "relative flex aspect-[1.586/1] w-24 items-end overflow-hidden rounded-lg p-2 ring-2 ring-offset-2 ring-offset-background transition-shadow",
                    selected ? "ring-foreground" : "ring-transparent",
                  )}
                  style={{ background: def.gradient }}
                >
                  <span className={cn("text-xs font-medium", def.textClass)}>{def.label}</span>
                  {selected && (
                    <span
                      className={cn(
                        "absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full",
                        def.badgeClass,
                      )}
                    >
                      <Check className={cn("size-3", def.textClass)} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold">Currency</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Amounts are always stored in USD — this converts them for display. The Total Assets
            card shows both regardless.
          </p>

          <div className="flex items-center gap-2">
            {(["USD", "PKR"] as const).map((value) => (
              <Button
                key={value}
                size="sm"
                variant={currency === value ? "default" : "outline"}
                onClick={() => updateDashboardSettings.mutate({ currency: value })}
              >
                {value}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <div className="w-40 space-y-1.5">
              <Label htmlFor="usdPkrRate">1 USD in PKR</Label>
              <Input
                id="usdPkrRate"
                type="number"
                step="any"
                min="0"
                value={rateDraft}
                onChange={(e) => setRateDraft(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              disabled={!rateChanged || updateDashboardSettings.isPending}
              onClick={() =>
                updateDashboardSettings.mutate({ usdPkrRate: Number(rateDraft) || 0 })
              }
            >
              Save rate
            </Button>
            <Button
              variant="outline"
              disabled={updateDashboardSettings.isPending}
              onClick={() => updateDashboardSettings.mutate({ refreshRate: true })}
            >
              {updateDashboardSettings.isPending ? "Fetching…" : "Fetch latest"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            "Fetch latest" pulls today's rate. If the lookup fails the saved rate is kept, so you
            can always just type one.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold">Target allocation</h2>
          <span
            className={cn(
              "text-sm font-medium tabular-nums",
              targetsValid ? "text-muted-foreground" : "text-destructive",
            )}
          >
            {targetTotal}%
          </span>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            The mix you're aiming for. The Allocation Drift widget compares your actual portfolio
            against it. Set every field to 0 to turn it off.
          </p>

          <div className="flex flex-wrap gap-3">
            {TARGET_KEYS.map(({ key, label }) => (
              <div key={key} className="w-28 space-y-1.5">
                <Label htmlFor={`target-${key}`}>{label}</Label>
                <div className="relative">
                  <Input
                    id={`target-${key}`}
                    type="number"
                    min={0}
                    max={100}
                    inputMode="numeric"
                    value={targets[key]}
                    onChange={(e) =>
                      setTargetDraft({ ...targets, [key]: e.target.value })
                    }
                    className="pr-7"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
            ))}
          </div>

          {!targetsValid && (
            <p className="text-sm text-destructive">Targets must add up to 100% (or 0% to clear).</p>
          )}

          <div className="flex items-center gap-2">
            <Button onClick={saveTargets} disabled={!targetsValid || updateDashboardSettings.isPending}>
              {updateDashboardSettings.isPending ? "Saving…" : "Save targets"}
            </Button>
            <Button variant="outline" onClick={() => setTargetDraft(EMPTY_TARGETS)}>
              Clear
            </Button>
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

      <ExportCard />
    </div>
  );
}
