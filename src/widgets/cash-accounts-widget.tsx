import { AddCashDialog } from "@/components/add-cash-dialog";
import { CashList } from "@/components/cash-list";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function CashAccountsWidget() {
  return (
    <Card className="h-full overflow-auto">
      <CardHeader>
        <h2 className="text-base font-semibold">Cash accounts</h2>
        <AddCashDialog />
      </CardHeader>
      <CardContent>
        <CashList />
      </CardContent>
    </Card>
  );
}
