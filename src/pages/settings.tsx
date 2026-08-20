import * as React from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useTheme } from "@/lib/theme";

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
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
