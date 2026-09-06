import * as React from "react";
import { ShieldAlert } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function SecurityCard() {
  const { refresh } = useAuth();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function revoke() {
    setError(null);
    setPending(true);
    try {
      await api.revokeSessions();
      // The current cookie is dead too, so re-checking drops straight back to
      // the passphrase gate rather than leaving a shell that 401s on every
      // query.
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="text-base font-semibold">Signed-in devices</h2>
          <p className="text-xs text-muted-foreground">
            Sessions last 7 days. Lost a device? End every one of them at once.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={pending}>
              <ShieldAlert className="size-4" />
              {pending ? "Signing out…" : "Sign out everywhere"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Sign out of every device?</AlertDialogTitle>
            <AlertDialogDescription>
              Every signed-in browser, including this one, will need the passphrase again.
              Nothing is deleted.
            </AlertDialogDescription>
            <div className="flex justify-end gap-2">
              <AlertDialogCancel asChild>
                <Button variant="outline">Cancel</Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button variant="destructive" onClick={revoke}>
                  Sign out everywhere
                </Button>
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <p className="text-xs text-muted-foreground">
          Repeated wrong passphrases lock the login for a spell that doubles each time, so
          the URL can't be guessed at by anyone who finds it.
        </p>
      </CardContent>
    </Card>
  );
}
