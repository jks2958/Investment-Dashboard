import { CashDialog } from "@/components/cash-dialog";
import { CashList } from "@/components/cash-list";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function CashAccountsWidget() {
  return (
    <Card className="h-full overflow-auto">
      <CardHeader>
        <h2 className="text-base font-semibold">Cash accounts</h2>
        <CashDialog />
      </CardHeader>
      <CardContent>
        <CashList />
      </CardContent>
    </Card>
  );
}
