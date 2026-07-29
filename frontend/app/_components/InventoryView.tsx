"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore, ShoeProduct } from "@/lib/context/StoreContext";
import { useAuth } from "@/lib/context/AuthContext";
import { 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrashAlt, 
  FaTimes, 
  FaBoxes, 
  FaExclamationCircle,
  FaPlusCircle,
  FaMinusCircle,
  FaShoppingCart,
  FaHeart,
  FaRegHeart
} from "react-icons/fa";
import { uploadProductImage } from "@/lib/api/products";

export default function InventoryView({ role }: { role: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    products, 
    refreshStore, 
    addProduct, 
    editProduct, 
    deleteProduct, 
    addToCart,
    wishlist,
    toggleWishlist
  } = useStore();

  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Selected product for edit/delete
  const [currentProduct, setCurrentProduct] = useState<ShoeProduct | null>(null);

  // Pop-up modal for product selection (cart adding)
  const [selectedPopupProduct, setSelectedPopupProduct] = useState<ShoeProduct | null>(null);
  const [popupQty, setPopupQty] = useState(1);
  
  // Forms fields
  const [formFields, setFormFields] = useState({
    name: "",
    sku: "",
    category: "",
    price: 0,
    quantity: 0,
    lowStockThreshold: 10,
    image: "",
    description: ""
  });

  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const productImageInputRef = useRef<HTMLInputElement>(null);
  const [pendingProductImage, setPendingProductImage] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState("");

  const isAdmin = role === "admin";
  const baseRoute = isAdmin ? "/admin" : "/user";
  const resolveProductImage = (image?: string) => {
    if (image?.startsWith("/uploads/")) return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8089/api/v1").replace("/api/v1", "") + image;
    return image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600";
  };

  useEffect(() => {
    const initFetch = async () => {
      try {
        setLoading(true);
        await refreshStore();
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };
    initFetch();
  }, []);

  // Sync details popup with URL query parameter ?id=... (for wishlist navigation)
  useEffect(() => {
    if (!loading && products.length > 0 && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const prodId = params.get("id");
      if (prodId) {
        const found = products.find(p => p._id === prodId);
        if (found) {
          setSelectedPopupProduct(found);
          setPopupQty(1);
          // Clean the query parameter from URL so it doesn't pop up again if they navigate away and come back
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    }
  }, [loading, products]);

  const handleOpenAdd = () => {
    setFormFields({
      name: "",
      sku: "",
      category: selectedCategory !== "all" ? selectedCategory : "Running Shoes",
      price: 0,
      quantity: 10,
      lowStockThreshold: 5,
      image: "",
      description: ""
    });
    setFormError("");
    setShowAddModal(true);
  };

  const handleOpenEdit = (product: ShoeProduct, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering card click
    setCurrentProduct(product);
    setFormFields({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      lowStockThreshold: product.lowStockThreshold || 10,
      image: product.image || "",
      description: product.description || ""
    });
    setPendingProductImage(null);
    setProductImagePreview("");
    setFormError("");
    setShowEditModal(true);
  };

  const handleProductImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setFormError("Please choose an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { setFormError("Image must be 5 MB or smaller."); return; }
    setFormError(""); setPendingProductImage(file); setProductImagePreview(URL.createObjectURL(file));
  };

  const handleOpenDelete = (product: ShoeProduct, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering card click
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
      const finalImage = formFields.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600";
      await addProduct({
        ...formFields,
        image: finalImage
      });
      setShowAddModal(false);
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
      await editProduct(currentProduct._id, formFields);
      if (pendingProductImage) await uploadProductImage(currentProduct._id, pendingProductImage);
      await refreshStore();
      setShowEditModal(false);
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
      const success = await deleteProduct(currentProduct._id);
      if (success) {
        setShowDeleteModal(false);
      } else {
        throw new Error("Deletion failed on server");
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    } finally {
      setSubmitting(false);
    }
  };

  // Card click to add popup handler
  const handleCardClick = (product: ShoeProduct) => {
    setSelectedPopupProduct(product);
    setPopupQty(product.quantity > 0 ? 1 : 0);
  };

  const handleConfirmAddPopup = () => {
    if (!selectedPopupProduct || popupQty <= 0) return;
    if (isAdmin) {
      setSelectedPopupProduct(null);
      return;
    }
    addToCart(selectedPopupProduct, popupQty);
    setSelectedPopupProduct(null);
    router.push(`${baseRoute}/products`);
  };

  // Status Pill Renderer
  const renderStatus = (qty: number, threshold: number) => {
    if (qty === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
          Sold Out
        </span>
      );
    }
    if (qty <= threshold) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Low Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        In Stock
      </span>
    );
  };

  const categories = ["all", "Shoes", "Electronics", "Stationery", "Utensils", "Sports"];

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const modalInputClass = "w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0f172a] text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm";
  const modalLabelClass = "block text-xs font-bold uppercase tracking-[1px] text-gray-400 mb-1.5";

  return (
    <div className="space-y-10 lg:space-y-12 animate-fadeIn w-full max-w-[1800px] mx-auto py-6 px-2">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[2px] text-blue-500 mb-1">Catalog Registry</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <FaBoxes className="text-gray-400" /> Shoes Stock Catalog
          </h1>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-5 py-3.5 bg-blue-600 hover:bg-blue-500 transition-all font-semibold rounded-xl text-sm flex items-center gap-2 self-start sm:self-center shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 cursor-pointer"
          >
            <FaPlus className="text-xs" />
            <span>Create Product</span>
          </button>
        )}
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-[#1e293b]/60 backdrop-blur-md border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-lg">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search catalog by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/5 focus:outline-none focus:border-blue-500 text-sm transition-colors text-white"
          />
          <FaSearch className="absolute left-3.5 top-3.5 text-gray-500" />
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-[1px]">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/5 focus:outline-none focus:border-blue-500 text-sm transition-colors text-white cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All" : cat}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* CATEGORIZED SHOE GRID */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 min-h-[300px] bg-[#1e293b]/20 border border-white/5 rounded-3xl">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-500 mb-4">
            <FaBoxes className="text-2xl" />
          </div>
          <h4 className="font-semibold text-white text-lg">No Products Found</h4>
          <p className="text-sm text-gray-400 max-w-[280px] mt-1">
            Try adjusting your search query or filters.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {categories.filter(cat => cat !== "all").map(cat => {
            const categoryProducts = filteredProducts.filter(p => p.category === cat);
            if (categoryProducts.length === 0) return null;
            return (
              <div key={cat} className="space-y-6">
                {/* Category Section Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
                    <span className="w-2 h-5 bg-blue-500 rounded-sm"></span>
                    {cat}
                  </h2>
                  <span className="text-xs text-gray-400 font-semibold bg-white/5 px-3 py-1 rounded-full border border-white/2">
                    {categoryProducts.length} style{categoryProducts.length > 1 ? "s" : ""}
                  </span>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categoryProducts.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => handleCardClick(product)}
                      className="bg-[#1e293b]/40 border border-white/5 hover:border-blue-500/30 hover:bg-[#1e293b]/70 transition-all duration-300 rounded-3xl p-5 flex flex-col justify-between group shadow-lg cursor-pointer hover:-translate-y-1.5 relative overflow-hidden"
                    >
                      {/* Top Action Tags */}
                      <div className="flex justify-between items-start">
                        {renderStatus(product.quantity, product.lowStockThreshold || 5)}
                        
                        <div className="flex items-center gap-1.5 z-10" onClick={e => e.stopPropagation()}>
                          {/* Wishlist toggle */}
                          <button
                            onClick={() => toggleWishlist(product._id)}
                            className="p-2 text-rose-500 hover:text-rose-400 bg-slate-900/60 hover:bg-slate-900 border border-white/5 rounded-xl transition-colors cursor-pointer"
                            title="Add to Wishlist"
                          >
                            {wishlist.includes(product._id) ? <FaHeart className="text-xs" /> : <FaRegHeart className="text-xs text-gray-400" />}
                          </button>

                          {/* Admin Action Buttons */}
                          {isAdmin && (
                            <>
                              <button
                                onClick={(e) => handleOpenEdit(product, e)}
                                className="p-2 text-gray-400 hover:text-blue-400 bg-slate-900/60 hover:bg-slate-900 border border-white/5 rounded-xl transition-all"
                                title="Edit Details"
                              >
                                <FaEdit className="text-xs" />
                              </button>
                              <button
                                onClick={(e) => handleOpenDelete(product, e)}
                                className="p-2 text-gray-400 hover:text-red-400 bg-slate-900/60 hover:bg-slate-900 border border-white/5 rounded-xl transition-all"
                                title="Delete Stock"
                              >
                                <FaTrashAlt className="text-xs" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Product Image */}
                      <div className="h-44 w-full flex items-center justify-center my-6 overflow-hidden rounded-2xl bg-slate-900/20 border border-white/2 relative">
                        <img
                          src={resolveProductImage(product.image)}
                          alt={product.name}
                          className="max-h-36 object-contain transition-transform duration-500 group-hover:scale-108"
                        />
                      </div>

                      {/* Shoe Details */}
                      <div className="space-y-2.5">
                        <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest block">{product.sku}</span>
                        <h3 className="font-bold text-white text-base leading-tight group-hover:text-blue-400 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                          <span className="text-sm font-extrabold text-white">Rs. {product.price.toLocaleString()}</span>
                          <span className="text-xs text-gray-400 font-medium">{product.quantity} pairs left</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* POPUP MODAL FOR ADDING TO PRODUCTS CART */}
      {selectedPopupProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b]/95 border border-white/10 p-6 rounded-3xl max-w-xl w-full shadow-2xl relative overflow-hidden backdrop-blur-xl animate-scaleIn">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 block mb-1">Select Product Style</span>
                <h3 className="text-xl font-bold text-white">Add Style to Purchase List</h3>
              </div>
              <button 
                onClick={() => setSelectedPopupProduct(null)} 
                className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            {/* Content Details */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Product Image on Left (5 Cols) */}
              <div className="md:col-span-5 bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex items-center justify-center min-h-[180px]">
                <img 
                  src={resolveProductImage(selectedPopupProduct.image)} 
                  alt={selectedPopupProduct.name}
                  className="max-h-[140px] object-contain"
                />
              </div>

              {/* Specs & Selection on Right (7 Cols) */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest block">SKU: {selectedPopupProduct.sku}</span>
                  <h4 className="text-lg font-bold text-white leading-tight">{selectedPopupProduct.name}</h4>
                  <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-blue-600/10 text-blue-400 border border-blue-500/15">
                    {selectedPopupProduct.category}
                  </span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  {selectedPopupProduct.description || "Premium design built for maximum comfort, support, and style. Features high-grade materials and durability."}
                </p>

                {/* Stock and Price */}
                <div className="flex items-center justify-between p-3.5 bg-slate-900/30 border border-white/5 rounded-2xl text-xs">
                  <div>
                    <span className="block text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Unit Price</span>
                    <span className="text-white font-extrabold text-sm">Rs. {selectedPopupProduct.price.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Available Stock</span>
                    <span className={`font-extrabold text-sm ${selectedPopupProduct.quantity === 0 ? "text-red-400" : "text-gray-200"}`}>
                      {selectedPopupProduct.quantity} pcs
                    </span>
                  </div>
                </div>

                {/* Quantity Input Selector */}
                {selectedPopupProduct.quantity > 0 ? (
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Specify Quantity</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setPopupQty(Math.max(1, popupQty - 1))}
                        className="p-2 bg-slate-900 border border-white/10 rounded-lg hover:text-white transition-colors cursor-pointer text-gray-400"
                      >
                        <FaMinusCircle />
                      </button>
                      <span className="font-extrabold text-white text-base w-8 text-center">{popupQty}</span>
                      <button
                        type="button"
                        onClick={() => setPopupQty(Math.min(selectedPopupProduct.quantity, popupQty + 1))}
                        className="p-2 bg-slate-900 border border-white/10 rounded-lg hover:text-white transition-colors cursor-pointer text-gray-400"
                      >
                        <FaPlusCircle />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2">
                    <FaExclamationCircle />
                    <span>Out of stock! This product cannot be ordered.</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleConfirmAddPopup}
                    disabled={selectedPopupProduct.quantity === 0 || isAdmin}
                    className="flex-grow py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold rounded-xl text-xs text-center cursor-pointer shadow-lg shadow-blue-600/10 flex items-center justify-center gap-1.5 text-white"
                  >
                    <FaShoppingCart className="text-xs" />
                    <span>{isAdmin ? "Admins cannot place orders" : "Add to Products Page"}</span>
                  </button>
                  <button
                    onClick={() => setSelectedPopupProduct(null)}
                    className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/5 font-medium rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CREATE NEW PRODUCT MODAL (ADMIN ONLY) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b]/95 border border-white/10 p-6 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden backdrop-blur-xl animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Add New Product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg">
                <FaTimes />
              </button>
            </div>
            
            {formError && (
              <div className="p-3 bg-red-600/15 border border-red-500/25 rounded-xl text-xs text-red-400 mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className={modalLabelClass}>Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nike Air Zoom Pegasus 40"
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
                    placeholder="e.g. SH-RUN-01"
                    value={formFields.sku}
                    onChange={(e) => setFormFields({ ...formFields, sku: e.target.value })}
                    className={modalInputClass}
                  />
                </div>
                <div>
                  <label className={modalLabelClass}>Category</label>
                  <select
                    value={formFields.category}
                    onChange={(e) => setFormFields({ ...formFields, category: e.target.value })}
                    className={modalInputClass + " cursor-pointer"}
                  >
                    <option value="Running Shoes">Running Shoes</option>
                    <option value="Basketball Shoes">Basketball Shoes</option>
                    <option value="Casual Sneakers">Casual Sneakers</option>
                    <option value="Formal Leather Shoes">Formal Leather Shoes</option>
                  </select>
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
                  <label className={modalLabelClass}>Stock Count</label>
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
                  <label className={modalLabelClass}>Low Alert</label>
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

              <div>
                <label className={modalLabelClass}>Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... (optional)"
                  value={formFields.image}
                  onChange={(e) => setFormFields({ ...formFields, image: e.target.value })}
                  className={modalInputClass}
                />
              </div>

              <div>
                <label className={modalLabelClass}>Description (Optional)</label>
                <textarea
                  placeholder="Brief summary of performance and materials..."
                  value={formFields.description}
                  onChange={(e) => setFormFields({ ...formFields, description: e.target.value })}
                  className={modalInputClass + " h-20 resize-none"}
                />
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-white/5">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/10 disabled:opacity-50 text-white"
                >
                  {submitting ? "Creating..." : "Create Product"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/5 font-medium rounded-xl text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL (ADMIN ONLY) */}
      {showEditModal && currentProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b]/95 border border-white/10 p-6 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden backdrop-blur-xl animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Edit Product Details</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg">
                <FaTimes />
              </button>
            </div>
            
            {formError && (
              <div className="p-3 bg-red-600/15 border border-red-500/25 rounded-xl text-xs text-red-400 mb-4">
                {formError}
              </div>
            )}

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
                  <select
                    value={formFields.category}
                    onChange={(e) => setFormFields({ ...formFields, category: e.target.value })}
                    className={modalInputClass + " cursor-pointer"}
                  >
                    <option value="Running Shoes">Running Shoes</option>
                    <option value="Basketball Shoes">Basketball Shoes</option>
                    <option value="Casual Sneakers">Casual Sneakers</option>
                    <option value="Formal Leather Shoes">Formal Leather Shoes</option>
                  </select>
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
                  <label className={modalLabelClass}>Stock Count</label>
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
                  <label className={modalLabelClass}>Low Alert</label>
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

              <div>
                <label className={modalLabelClass}>Product image</label>
                <input ref={productImageInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleProductImageSelection} className="hidden" />
                <div className="flex items-center gap-4 rounded-xl border border-dashed border-white/15 bg-slate-950/50 p-3">
                  <img src={productImagePreview || resolveProductImage(formFields.image)} alt="Selected product preview" className="h-16 w-16 rounded-lg object-contain" />
                  <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-white">{pendingProductImage?.name || "Current product image"}</p><p className="mt-1 text-[10px] text-gray-500">PNG, JPG, WEBP or GIF, maximum 5 MB</p></div>
                  <button type="button" onClick={() => productImageInputRef.current?.click()} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-500">Choose image</button>
                </div>
                <label className={modalLabelClass + " mt-3"}>Or use an image URL</label>
                <input type="url" value={formFields.image} onChange={(e) => { setPendingProductImage(null); setProductImagePreview(""); setFormFields({ ...formFields, image: e.target.value }); }} className={modalInputClass} placeholder="https://example.com/product.jpg" />
              </div>

              <div>
                <label className={modalLabelClass}>Description (Optional)</label>
                <textarea
                  value={formFields.description}
                  onChange={(e) => setFormFields({ ...formFields, description: e.target.value })}
                  className={modalInputClass + " h-20 resize-none"}
                />
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-white/5">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/10 disabled:opacity-50 text-white"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/5 font-medium rounded-xl text-sm transition-all cursor-pointer"
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
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-red-600/10 disabled:opacity-50 text-white"
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 font-semibold rounded-xl text-sm transition-all text-gray-300 hover:text-white"
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
