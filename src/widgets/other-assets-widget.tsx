import { OtherAssetDialog } from "@/components/other-asset-dialog";
import { OtherAssetsList } from "@/components/other-assets-list";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function OtherAssetsWidget() {
  return (
    <Card className="h-full overflow-auto">
      <CardHeader>
        <h2 className="text-base font-semibold">Other assets</h2>
        <OtherAssetDialog />
      </CardHeader>
      <CardContent>
        <OtherAssetsList />
      </CardContent>
    </Card>
  );
}
