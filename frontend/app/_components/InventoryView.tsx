"use client";

import { useEffect, useState } from "react";
import { 
  getAllProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  Product 
} from "@/lib/api/products";
import { 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrashAlt, 
  FaTimes, 
  FaBoxes, 
  FaExclamationCircle 
} from "react-icons/fa";

export default function InventoryView({ role }: { role: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Selected product for edit/delete
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  
  // Forms fields
  const [formFields, setFormFields] = useState({
    name: "",
    sku: "",
    category: "",
    price: 0,
    quantity: 0,
    lowStockThreshold: 10
  });

  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = role === "admin";

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const filters = {
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        search: searchTerm ? searchTerm : undefined
      };
      const response = await getAllProducts(filters);
      if (response && response.data) {
        setProducts(response.data);
      }
    } catch (err) {
      console.error("Failed to load products", err);
      // Fallback mockup products matching Figma:
      setProducts([
        {
          _id: "1",
          name: "Air Max Velocity",
          sku: "SH-AMV-10",
          category: "Shoes",
          price: 12000,
          quantity: 12,
          lowStockThreshold: 5,
          createdBy: "admin",
          createdAt: "",
          updatedAt: ""
        },
        {
          _id: "2",
          name: "Classic Minimalist Watch",
          sku: "WT-CMW-25",
          category: "Accessories",
          price: 8500,
          quantity: 3,
          lowStockThreshold: 5,
          createdBy: "admin",
          createdAt: "",
          updatedAt: ""
        },
        {
          _id: "3",
          name: "Studio Pro Headphones",
          sku: "AU-SPH-48",
          category: "Audio",
          price: 15000,
          quantity: 45,
          lowStockThreshold: 10,
          createdBy: "admin",
          createdAt: "",
          updatedAt: ""
        },
        {
          _id: "4",
          name: "Retro Film Camera",
          sku: "CM-RFC-09",
          category: "Photography",
          price: 34000,
          quantity: 0,
          lowStockThreshold: 3,
          createdBy: "admin",
          createdAt: "",
          updatedAt: ""
        },
        {
          _id: "5",
          name: "Artisan Ceramic Mug",
          sku: "HD-ACM-22",
          category: "Homeware",
          price: 1800,
          quantity: 22,
          lowStockThreshold: 10,
          createdBy: "admin",
          createdAt: "",
          updatedAt: ""
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleOpenAdd = () => {
    setFormFields({
      name: "",
      sku: "",
      category: "",
      price: 0,
      quantity: 0,
      lowStockThreshold: 10
    });
    setFormError("");
    setShowAddModal(true);
  };

  const handleOpenEdit = (product: Product) => {
    setCurrentProduct(product);
    setFormFields({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      lowStockThreshold: product.lowStockThreshold || 10
    });
    setFormError("");
    setShowEditModal(true);
  };

  const handleOpenDelete = (product: Product) => {
    setCurrentProduct(product);
    setShowDeleteModal(true);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      if (!formFields.name || !formFields.sku || !formFields.category || formFields.price <= 0 || formFields.quantity < 0) {
        throw new Error("All fields are required and must be valid");
      }
      await createProduct(formFields);
      setShowAddModal(false);
      fetchProducts();
    } catch (err: any) {
      setFormError(err.message || "Failed to add product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      if (!currentProduct) return;
      if (!formFields.name || !formFields.sku || !formFields.category || formFields.price <= 0 || formFields.quantity < 0) {
        throw new Error("All fields are required and must be valid");
      }
      await updateProduct(currentProduct._id, formFields);
      setShowEditModal(false);
      fetchProducts();
    } catch (err: any) {
      setFormError(err.message || "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!currentProduct) return;
    setSubmitting(true);
    try {
      await deleteProduct(currentProduct._id);
      setShowDeleteModal(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    } finally {
      setSubmitting(false);
    }
  };

  // Status Pill Renderer
  const renderStatus = (qty: number, threshold: number) => {
    if (qty === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
          Out of Stock
        </span>
      );
    }
    if (qty <= threshold) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Low Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        In Stock
      </span>
    );
  };

  const categories = ["all", "Shoes", "Accessories", "Audio", "Photography", "Homeware", "Office Supplies", "Tech Gadgets", "Furniture"];

  const modalInputClass = "w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0f172a] text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm";
  const modalLabelClass = "block text-xs font-bold uppercase tracking-[1px] text-gray-400 mb-1.5";

  return (
    <div className="space-y-10 lg:space-y-12 animate-fadeIn w-full max-w-[1800px] mx-auto py-6 px-2">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[2px] text-blue-500 mb-1">Products</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Inventory List</h1>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-5 py-3.5 bg-blue-600 hover:bg-blue-500 transition-all font-semibold rounded-xl text-sm flex items-center gap-2 self-start sm:self-center shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 cursor-pointer"
        >
          <FaPlus className="text-xs" />
          <span>Add Product</span>
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-[#1e293b]/60 backdrop-blur-md border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-lg">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/5 focus:outline-none focus:border-blue-500 text-sm transition-colors text-white"
          />
          <FaSearch className="absolute left-3.5 top-3.5 text-gray-500" />
          <button type="submit" className="hidden">Search</button>
        </form>

        {/* Category selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-[1px]">Filter:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/5 focus:outline-none focus:border-blue-500 text-sm transition-colors text-white cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* INVENTORY TABLE */}
      <div className="bg-[#1e293b]/40 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden shadow-lg">
        
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 min-h-[300px]">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-500 mb-4">
              <FaBoxes className="text-2xl" />
            </div>
            <h4 className="font-semibold text-white text-lg">No Products Found</h4>
            <p className="text-sm text-gray-400 max-w-[280px] mt-1">
              Try adjusting your filters or search keywords, or add a new product.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/40 border-b border-white/5 text-gray-400 text-xs font-bold uppercase tracking-[1px]">
                  <th className="py-5 px-8">Product Details</th>
                  <th className="py-5 px-8">SKU</th>
                  <th className="py-5 px-8">Category</th>
                  <th className="py-5 px-8">Price</th>
                  <th className="py-5 px-8">Quantity</th>
                  <th className="py-5 px-8">Status</th>
                  <th className="py-5 px-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-white/2 transition-colors">
                    <td className="py-5 px-8 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/15 flex items-center justify-center text-blue-400 text-base font-bold">
                        {product.name[0].toUpperCase()}
                      </div>
                      <span className="font-semibold text-white">{product.name}</span>
                    </td>
                    <td className="py-5 px-8 font-mono text-xs text-gray-300">{product.sku}</td>
                    <td className="py-5 px-8 text-gray-400">{product.category}</td>
                    <td className="py-5 px-8 font-semibold text-white">Rs. {product.price.toLocaleString()}</td>
                    <td className="py-5 px-8 text-gray-300">{product.quantity} pcs</td>
                    <td className="py-5 px-8">{renderStatus(product.quantity, product.lowStockThreshold || 10)}</td>
                    <td className="py-5 px-8 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all rounded-lg"
                        title="Edit Product"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(product)}
                        disabled={!isAdmin}
                        className={`p-2 transition-all rounded-lg ${
                          isAdmin 
                            ? "text-gray-400 hover:text-red-400 hover:bg-red-500/10" 
                            : "text-gray-600 cursor-not-allowed opacity-40"
                        }`}
                        title={isAdmin ? "Delete Product" : "Delete (Admin Only)"}
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b]/95 border border-white/10 p-6 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden backdrop-blur-xl animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Add New Product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg">
                <FaTimes />
              </button>
            </div>
            
            {formError && <div className="p-3 bg-red-600/15 border border-red-500/25 rounded-xl text-xs text-red-400 mb-4">{formError}</div>}

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className={modalLabelClass}>Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Mouse"
                  value={formFields.name}
                  onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                  className={modalInputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={modalLabelClass}>SKU Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MS-WRL-09"
                    value={formFields.sku}
                    onChange={(e) => setFormFields({ ...formFields, sku: e.target.value })}
                    className={modalInputClass}
                  />
                </div>
                <div>
                  <label className={modalLabelClass}>Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tech Gadgets"
                    value={formFields.category}
                    onChange={(e) => setFormFields({ ...formFields, category: e.target.value })}
                    className={modalInputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={modalLabelClass}>Price (Rs.)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formFields.price || ""}
                    onChange={(e) => setFormFields({ ...formFields, price: Number(e.target.value) })}
                    className={modalInputClass}
                  />
                </div>
                <div>
                  <label className={modalLabelClass}>Quantity</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formFields.quantity === 0 ? "0" : formFields.quantity || ""}
                    onChange={(e) => setFormFields({ ...formFields, quantity: Number(e.target.value) })}
                    className={modalInputClass}
                  />
                </div>
                <div>
                  <label className={modalLabelClass}>Low Threshold</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formFields.lowStockThreshold || ""}
                    onChange={(e) => setFormFields({ ...formFields, lowStockThreshold: Number(e.target.value) })}
                    className={modalInputClass}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-white/5">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/10 disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add Product"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/5 font-medium rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b]/95 border border-white/10 p-6 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden backdrop-blur-xl animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Edit Product</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg">
                <FaTimes />
              </button>
            </div>
            
            {formError && <div className="p-3 bg-red-600/15 border border-red-500/25 rounded-xl text-xs text-red-400 mb-4">{formError}</div>}

            <form onSubmit={handleEditProduct} className="space-y-4">
              <div>
                <label className={modalLabelClass}>Product Name</label>
                <input
                  type="text"
                  required
                  value={formFields.name}
                  onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                  className={modalInputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={modalLabelClass}>SKU Code</label>
                  <input
                    type="text"
                    required
                    value={formFields.sku}
                    onChange={(e) => setFormFields({ ...formFields, sku: e.target.value })}
                    className={modalInputClass}
                  />
                </div>
                <div>
                  <label className={modalLabelClass}>Category</label>
                  <input
                    type="text"
                    required
                    value={formFields.category}
                    onChange={(e) => setFormFields({ ...formFields, category: e.target.value })}
                    className={modalInputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={modalLabelClass}>Price (Rs.)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formFields.price || ""}
                    onChange={(e) => setFormFields({ ...formFields, price: Number(e.target.value) })}
                    className={modalInputClass}
                  />
                </div>
                <div>
                  <label className={modalLabelClass}>Quantity</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formFields.quantity === 0 ? "0" : formFields.quantity || ""}
                    onChange={(e) => setFormFields({ ...formFields, quantity: Number(e.target.value) })}
                    className={modalInputClass}
                  />
                </div>
                <div>
                  <label className={modalLabelClass}>Low Threshold</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formFields.lowStockThreshold || ""}
                    onChange={(e) => setFormFields({ ...formFields, lowStockThreshold: Number(e.target.value) })}
                    className={modalInputClass}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-white/5">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/10 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/5 font-medium rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b]/95 border border-white/10 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl relative overflow-hidden backdrop-blur-xl animate-scaleIn">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center text-lg mx-auto mb-4 border border-red-500/20">
              <FaTrashAlt />
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">Delete Product</h3>
            <p className="text-sm text-gray-300 mb-6">
              Are you sure you want to delete <strong className="text-white font-semibold">{currentProduct?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteProduct}
                disabled={submitting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-red-600/10 disabled:opacity-50"
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 font-semibold rounded-xl text-sm transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
