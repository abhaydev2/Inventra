import DashboardLayout from "@/app/_components/DashboardLayout";
import WishlistView from "@/app/_components/WishlistView";

export default function AdminWishlistPage() {
  return (
    <DashboardLayout>
      <WishlistView role="admin" />
    </DashboardLayout>
  );
}
