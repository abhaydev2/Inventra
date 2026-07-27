import DashboardLayout from "@/app/_components/DashboardLayout";
import ProductsView from "@/app/_components/ProductsView";

export default function AdminProductsPage() {
  return (
    <DashboardLayout>
      <ProductsView role="admin" />
    </DashboardLayout>
  );
}
