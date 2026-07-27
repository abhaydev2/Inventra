import DashboardLayout from "@/app/_components/DashboardLayout";
import SettingsView from "@/app/_components/SettingsView";

export default function AdminSettingsPage() {
  return (
    <DashboardLayout>
      <SettingsView role="admin" />
    </DashboardLayout>
  );
}
