import DashboardLayout from "@/app/_components/DashboardLayout";
import DashboardView from "@/app/_components/DashboardView";

export default function UserPage() {
  return (
    <DashboardLayout>
      <DashboardView role="user" />
    </DashboardLayout>
  );
}
