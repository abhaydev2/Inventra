"use client";

import { useStore, CartItem } from "@/lib/context/StoreContext";
import { useRouter } from "next/navigation";
import { 
  FaShoppingCart, 
  FaTrashAlt, 
  FaMinus, 
  FaPlus, 
  FaArrowRight, 
  FaBoxes,
  FaChevronLeft
} from "react-icons/fa";

export default function ProductsView({ role }: { role: string }) {
  const router = useRouter();
  const { cart, products, updateCartQuantity, removeFromCart, clearCart } = useStore();

  const isAdmin = role === "admin";
  const baseRoute = isAdmin ? "/admin" : "/user";

  const getProductStock = (productId: string) => {
    const prod = products.find(p => p._id === productId);
    return prod ? prod.quantity : 0;
  };

  const handleQtyChange = (item: CartItem, delta: number) => {
    if (isAdmin) return;
    const maxStock = getProductStock(item.productId);
    const newQty = item.quantity + delta;
    if (newQty >= 1 && newQty <= maxStock) {
      updateCartQuantity(item.productId, newQty);
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="space-y-10 lg:space-y-12 animate-fadeIn w-full max-w-[1800px] mx-auto py-6 px-2">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[2px] text-blue-500 mb-1">Selected Styles</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <FaShoppingCart className="text-blue-500" /> Products Selection List
          </h1>
        </div>
        {cart.length > 0 && !isAdmin && (
          <button
            onClick={clearCart}
            className="px-4 py-2 bg-red-600/10 hover:bg-red-600 border border-red-500/25 text-red-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Clear All Selections
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        /* EMPTY STATE */
        <div className="flex flex-col items-center justify-center text-center p-16 bg-[#1e293b]/20 border border-white/5 rounded-3xl min-h-[400px]">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-500 mb-6">
            <FaShoppingCart className="text-3xl" />
          </div>
          <h3 className="font-bold text-white text-xl">Your selection list is empty</h3>
          <p className="text-sm text-gray-400 mt-2 max-w-md leading-relaxed">
            {isAdmin
              ? "Admins can manage inventory, but they cannot create purchase selections or place orders."
              : "You haven't selected any products to order yet. Explore our catalog in the Inventory page and add products to your purchase list."}
          </p>
          <button
            onClick={() => router.push(`${baseRoute}/inventory`)}
            className="mt-8 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/10 flex items-center gap-2 cursor-pointer"
          >
            <FaBoxes className="text-xs" />
            <span>Go to Product Catalog</span>
          </button>
        </div>
      ) : (
        /* CART CONTENT */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart items list (8 Columns) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-[#1e293b]/40 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden shadow-lg">
              <div className="divide-y divide-white/5">
                {cart.map((item) => {
                  const maxStock = getProductStock(item.productId);
                  return (
                    <div key={item.productId} className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-white/2 transition-colors">
                      {/* Product image and basic details */}
                      <div className="flex flex-col sm:flex-row items-center gap-5 flex-1 min-w-0">
                        <div className="w-20 h-20 bg-slate-900/40 border border-white/5 rounded-xl flex items-center justify-center p-2 flex-shrink-0">
                          <img 
                            src={item.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"} 
                            alt={item.name} 
                            className="max-h-16 object-contain"
                          />
                        </div>
                        <div className="text-center sm:text-left min-w-0">
                          <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest block mb-0.5">SKU: {item.sku}</span>
                          <h4 className="text-base font-bold text-white truncate max-w-[280px]">{item.name}</h4>
                          <span className="text-xs text-blue-400 font-semibold block mt-0.5">Rs. {item.price.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Quantity Selector and Price calculations */}
                      <div className="flex items-center gap-8 flex-shrink-0">
                        {/* Qty Adjustment */}
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-2.5">
                            <button
                              onClick={() => handleQtyChange(item, -1)}
                              disabled={item.quantity <= 1 || isAdmin}
                              className="p-1.5 bg-slate-900 border border-white/10 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                              <FaMinus className="text-[10px]" />
                            </button>
                            <span className="font-extrabold text-white text-sm w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQtyChange(item, 1)}
                              disabled={item.quantity >= maxStock || isAdmin}
                              className="p-1.5 bg-slate-900 border border-white/10 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                              <FaPlus className="text-[10px]" />
                            </button>
                          </div>
                          <span className="text-[9px] text-gray-500 font-semibold">Max Stock: {maxStock} pcs</span>
                        </div>

                        {/* Item Total Price */}
                        <div className="text-right min-w-[90px]">
                          <span className="block text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Subtotal</span>
                          <span className="text-white font-extrabold text-sm">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          disabled={isAdmin}
                          className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Remove item"
                        >
                          <FaTrashAlt className="text-sm" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Back button */}
            <button
              onClick={() => router.push(`${baseRoute}/inventory`)}
              className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <FaChevronLeft className="text-[10px]" /> 
              <span>Back to Product Catalog</span>
            </button>
          </div>

          {/* Checkout/Summary Panel (4 Columns) */}
          <div className="lg:col-span-4 bg-[#1e293b]/60 backdrop-blur-md border border-white/5 p-6 rounded-3xl space-y-6 shadow-xl">
            <h3 className="font-extrabold text-white text-base pb-3 border-b border-white/5">
              Selection Summary
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Total Items Selected</span>
                <span className="text-white font-bold">{totalItems} pairs</span>
              </div>
              <div className="flex justify-between text-gray-400 pb-4 border-b border-white/5">
                <span>Cart Subtotal</span>
                <span className="text-white font-bold">Rs. {subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-white pt-2">
                <span>Total Cost</span>
                <span className="text-blue-400">Rs. {subtotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/15 rounded-2xl text-xs text-blue-400 flex items-start gap-2 leading-relaxed">
              <FaBoxes className="text-sm flex-shrink-0 mt-0.5" />
              <span>Checkout details, coupons, and phone information will be filled on the final order page.</span>
            </div>

            <button
              onClick={() => router.push(`${baseRoute}/orders`)}
              disabled={isAdmin}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold rounded-xl text-sm shadow-lg shadow-blue-600/15 flex items-center justify-center gap-2 cursor-pointer text-white"
            >
              <span>{isAdmin ? "Admins cannot place orders" : "Proceed to Order Page"}</span>
              <FaArrowRight className="text-xs" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
