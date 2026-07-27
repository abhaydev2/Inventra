import DashboardLayout from "@/app/_components/DashboardLayout";
import SettingsView from "@/app/_components/SettingsView";

export default function UserSettingsPage() {
  return (
    <DashboardLayout>
      <SettingsView role="user" />
    </DashboardLayout>
  );
}
