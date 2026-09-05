import { DashboardGrid } from "@/components/dashboard-grid";
import { SetupChecklist } from "@/components/setup-checklist";

export function DashboardPage() {
  return (
    <>
      <SetupChecklist />
      <DashboardGrid />
    </>
  );
}
