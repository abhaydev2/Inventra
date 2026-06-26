import DashboardLayout from "@/app/_components/DashboardLayout";
import InventoryView from "@/app/_components/InventoryView";

export default function AdminInventoryPage() {
  return (
    <DashboardLayout>
      <InventoryView role="admin" />
    </DashboardLayout>
  );
}
