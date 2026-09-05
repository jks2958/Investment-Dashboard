import { HoldingDialog } from "@/components/holding-dialog";
import { HoldingsList } from "@/components/holdings-list";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { AssetType } from "@/lib/api";

export function HoldingsByTypePage({ assetType, heading }: { assetType: AssetType; heading: string }) {
  return (
    <Card className="h-full overflow-auto">
      <CardHeader>
        <h2 className="text-base font-semibold">{heading}</h2>
        <HoldingDialog lockType={assetType} />
      </CardHeader>
      <CardContent>
        <HoldingsList filterType={assetType} />
      </CardContent>
    </Card>
  );
}
