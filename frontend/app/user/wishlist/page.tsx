import DashboardLayout from "@/app/_components/DashboardLayout";
import WishlistView from "@/app/_components/WishlistView";

export default function UserWishlistPage() {
  return (
    <DashboardLayout>
      <WishlistView role="user" />
    </DashboardLayout>
  );
}
