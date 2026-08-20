import * as React from "react";

import { AddCashDialog } from "@/components/add-cash-dialog";
import { CashList } from "@/components/cash-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";

export function AccountPage() {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [name, setName] = React.useState("");
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    if (profile) setName(profile.name);
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await updateProfile.mutateAsync(name);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold">Profile</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex max-w-sm items-end gap-2">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="name">Display name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <Button type="submit" disabled={updateProfile.isPending}>
              {saved ? "Saved" : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold">Cash accounts</h2>
          <AddCashDialog />
        </CardHeader>
        <CardContent>
          <CashList />
        </CardContent>
      </Card>
    </div>
  );
}
