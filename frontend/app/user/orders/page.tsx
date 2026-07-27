import DashboardLayout from "@/app/_components/DashboardLayout";
import OrdersView from "@/app/_components/OrdersView";

export default function UserOrdersPage() {
  return (
    <DashboardLayout>
      <OrdersView role="user" />
    </DashboardLayout>
  );
}
