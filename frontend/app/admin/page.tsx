import DashboardLayout from "@/app/_components/DashboardLayout";
import DashboardView from "@/app/_components/DashboardView";

export default function AdminPage() {
  return (
    <DashboardLayout>
      <DashboardView role="admin" />
    </DashboardLayout>
  );
}
