import DashboardLayout from "@/app/_components/DashboardLayout";
import OrdersView from "@/app/_components/OrdersView";

export default function AdminOrdersPage() {
  return (
    <DashboardLayout>
      <OrdersView role="admin" />
    </DashboardLayout>
  );
}
