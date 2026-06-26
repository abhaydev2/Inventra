import DashboardLayout from "@/app/_components/DashboardLayout";
import InventoryView from "@/app/_components/InventoryView";

export default function UserInventoryPage() {
  return (
    <DashboardLayout>
      <InventoryView role="user" />
    </DashboardLayout>
  );
}
