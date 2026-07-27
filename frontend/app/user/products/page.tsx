import DashboardLayout from "@/app/_components/DashboardLayout";
import ProductsView from "@/app/_components/ProductsView";

export default function UserProductsPage() {
  return (
    <DashboardLayout>
      <ProductsView role="user" />
    </DashboardLayout>
  );
}
