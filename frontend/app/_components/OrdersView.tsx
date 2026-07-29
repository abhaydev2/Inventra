"use client";

import { useState, useEffect } from "react";
import { useStore, Order } from "@/lib/context/StoreContext";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  FaShoppingCart, 
  FaCalendarAlt, 
  FaBoxes, 
  FaChevronDown, 
  FaChevronUp, 
  FaUser, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaTruck,
  FaArrowUp,
  FaTag,
  FaPhone,
  FaEnvelope,
  FaTicketAlt,
  FaShoppingBag
} from "react-icons/fa";
import { createAddress, initiateEsewaPayment, submitEsewaForm, syncCartToServer } from "@/lib/api/payments";

export default function OrdersView({ role }: { role: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    products, 
    orders, 
    updateOrderStatus,
    createOrder,
    applyCoupon,
    cart,
    clearCart
  } = useStore();

  const isAdmin = role === "admin";
  const baseRoute = isAdmin ? "/admin" : "/user";

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Checkout Fields
  const [deliveryPhone, setDeliveryPhone] = useState(user?.phone || "");
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "esewa">("cod");
  const [deliveryLine1, setDeliveryLine1] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryDistrict, setDeliveryDistrict] = useState("");
  const [checkoutError, setCheckoutError] = useState("");

  // Sync phone when user loads
  useEffect(() => {
    if (user?.phone) {
      setDeliveryPhone(user.phone);
    }
  }, [user]);

  // Filter orders for non-admin to only show their own
  const displayedOrders = isAdmin 
    ? orders 
    : orders.filter(o => o.customerEmail === user?.email);

  // Find fast moving products (salesCount >= 15 or stock count = 0 with positive sales)
  const fastMovingProducts = [...products]
    .sort((a, b) => b.salesCount - a.salesCount)
    .filter(p => p.salesCount > 0);

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    setCouponError("");
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const result = applyCoupon(couponCode, subtotal);
    if (result.error) {
      setCouponError(result.error);
      setDiscountAmount(0);
      setAppliedCoupon("");
    } else {
      setDiscountAmount(result.discount);
      setAppliedCoupon(couponCode.toUpperCase());
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdmin) {
      setCheckoutError("Admins cannot place purchase orders.");
      return;
    }
    if (cart.length === 0) return;
    setSubmittingOrder(true);
    setCheckoutError("");
    try {
      if (paymentMethod === "esewa") {
        router.push(`${baseRoute}/payment/esewa${appliedCoupon ? `?coupon=${encodeURIComponent(appliedCoupon)}` : ""}`);
        return;
      }
      const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const total = subtotal - discountAmount;

      const orderItems = cart.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      await createOrder({
        customerName: `${user?.firstName || "Guest"} ${user?.lastName || ""}`.trim(),
        customerEmail: user?.email || "guest@inventhive.com",
        customerPhone: deliveryPhone,
        items: orderItems,
        subtotal,
        discount: discountAmount,
        total,
        couponApplied: appliedCoupon || undefined,
        status: "confirmed"
      });

      setOrderSuccess("Purchase order placed successfully! Stock levels have been updated.");
      clearCart();
      setCouponCode("");
      setDiscountAmount(0);
      setAppliedCoupon("");
      setTimeout(() => {
        setOrderSuccess("");
      }, 3000);
    } catch (err: any) {
      setCheckoutError(err.message || "Failed to place order");
    } finally {
      setSubmittingOrder(false);
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "confirmed": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "shipped": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "cancelled": return "bg-red-500/10 text-red-400 border border-red-500/20";
      default: return "bg-gray-500/10 text-gray-400 border border-gray-500/20";
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "confirmed": return <FaCheckCircle className="text-[10px]" />;
      case "shipped": return <FaTruck className="text-[10px]" />;
      case "cancelled": return <FaTimesCircle className="text-[10px]" />;
      default: return <FaCheckCircle className="text-[10px]" />;
    }
  };

  const checkoutSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="space-y-10 lg:space-y-12 animate-fadeIn w-full max-w-[1800px] mx-auto py-6 px-2">
      
      {/* HEADER */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[2px] text-blue-500 mb-1">
          {isAdmin ? "Global Sales Registry" : "Purchase History & Checkout"}
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <FaShoppingCart className="text-emerald-500" /> {isAdmin ? "Global Purchase Orders" : "My Orders"}
        </h1>
      </div>

      {/* CHECKOUT PANEL (IF ITEMS ARE SELECTED IN CART) */}
      {cart.length > 0 && (
        <div className="bg-[#1e293b]/60 backdrop-blur-md border border-white/5 p-6 md:p-8 rounded-3xl shadow-2xl space-y-6 animate-scaleIn">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FaShoppingBag />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Checkout Order Details</h3>
              <p className="text-xs text-gray-400">Confirm selected items and enter shipping details below.</p>
            </div>
          </div>

          {orderSuccess && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center gap-2 text-sm animate-pulse">
              <FaCheckCircle className="text-base" />
              <span>{orderSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Selected items checkout summary (7 columns) */}
            <div className="lg:col-span-7 space-y-3">
              <span className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Items to purchase</span>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center p-3.5 bg-slate-900 border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-950/40 border border-white/5 flex items-center justify-center p-1.5 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="max-h-8 object-contain" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block truncate max-w-[200px] sm:max-w-[280px]">{item.name}</span>
                        <span className="text-[10px] text-gray-500 font-mono">SKU: {item.sku}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-300 block">{item.quantity} Unit{item.quantity > 1 ? "s" : ""}</span>
                      <span className="text-[10px] text-blue-400 font-semibold">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkout Form (5 columns) */}
            <div className="lg:col-span-5 bg-slate-900/50 border border-white/5 p-6 rounded-2xl space-y-4">
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                {/* Phone */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1.5">Delivery Phone Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={deliveryPhone}
                      onChange={(e) => setDeliveryPhone(e.target.value)}
                      placeholder="e.g. +977-98XXXXXXXX"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <FaPhone className="absolute left-3.5 top-3.5 text-gray-500 text-xs" />
                  </div>
                </div>

                {/* Coupon Code */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1.5">Apply Coupon Discount</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Enter Code (e.g. WELCOME50)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 uppercase focus:outline-none focus:border-blue-500 transition-colors"
                      />
                      <FaTag className="absolute left-3.5 top-3.5 text-gray-500 text-xs" />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer text-white"
                    >
                      <FaTicketAlt /> Apply
                    </button>
                  </div>
                  {couponError && <span className="block text-[10px] text-red-400 mt-1 font-semibold">{couponError}</span>}
                  {appliedCoupon && (
                    <span className="block text-[10px] text-emerald-400 mt-1 font-bold flex items-center gap-1.5">
                      <FaCheckCircle /> Coupon {appliedCoupon} Applied! (Rs. {discountAmount.toLocaleString()} Saved)
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1.5">Payment method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className={`cursor-pointer rounded-xl border p-3 text-xs font-bold transition-colors ${paymentMethod === "cod" ? "border-emerald-500 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-slate-950 text-gray-400"}`}>
                      <input className="sr-only" type="radio" name="paymentMethod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} /> Cash on Delivery
                    </label>
                    <label className={`cursor-pointer rounded-xl border p-3 text-xs font-bold transition-colors ${paymentMethod === "esewa" ? "border-green-500 bg-green-500/10 text-green-300" : "border-white/10 bg-slate-950 text-gray-400"}`}>
                      <input className="sr-only" type="radio" name="paymentMethod" checked={paymentMethod === "esewa"} onChange={() => setPaymentMethod("esewa")} /> eSewa
                    </label>
                  </div>
                  {paymentMethod === "esewa" && <p className="mt-2 text-[10px] text-green-300">Sandbox mode: you will be redirected securely to eSewa. Prices are confirmed by the server.</p>}
                </div>

                {paymentMethod === "esewa" && (
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider">Delivery address</label>
                    <input required value={deliveryLine1} onChange={(e) => setDeliveryLine1(e.target.value)} placeholder="House / street / locality" className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-green-500" />
                    <div className="grid grid-cols-2 gap-2"><input required value={deliveryCity} onChange={(e) => setDeliveryCity(e.target.value)} placeholder="City" className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-green-500" /><input required value={deliveryDistrict} onChange={(e) => setDeliveryDistrict(e.target.value)} placeholder="District" className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-green-500" /></div>
                  </div>
                )}

                {checkoutError && <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">{checkoutError}</p>}

                {/* Pricing breakdown */}
                <div className="pt-3 border-t border-white/5 space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal ({cart.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                    <span>Rs. {checkoutSubtotal.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Coupon Discount</span>
                      <span>- Rs. {discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-white pt-1.5 border-t border-white/2">
                    <span className="text-sm">Grand Total</span>
                    <span className="text-sm text-blue-400">Rs. {(checkoutSubtotal - discountAmount).toLocaleString()}</span>
                  </div>
                </div>

                {/* Buy Button */}
                <button
                  type="submit"
                  disabled={submittingOrder || isAdmin}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/10 cursor-pointer text-center text-white"
                >
                  {isAdmin ? "Admins cannot place orders" : (submittingOrder ? (paymentMethod === "esewa" ? "Redirecting to eSewa..." : "Placing Purchase Order...") : (paymentMethod === "esewa" ? "Pay with eSewa" : "Confirm & Place Purchase Order"))}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN EXCLUSIVES: STOCKS AND FAST SOLD ANALYTICS */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. Fast Sold Out Analytics */}
          <div className="lg:col-span-1 bg-[#1e293b]/40 backdrop-blur-sm border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2 pb-3 border-b border-white/5">
                <FaArrowUp className="text-emerald-500" /> Fast Sold-Out Analytics
              </h3>
              <div className="space-y-3.5 mt-4">
                {fastMovingProducts.slice(0, 3).map((prod) => (
                  <div key={prod._id} className="flex justify-between items-center p-3 bg-slate-900/35 border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                        {prod.name[0]}
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-white max-w-[140px] truncate">{prod.name}</span>
                        <span className="block text-[10px] text-gray-500 font-mono tracking-widest">{prod.sku}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-black text-emerald-400">{prod.salesCount} Sold</span>
                      <span className="block text-[9px] text-gray-400 font-semibold">{prod.quantity} Left in Stock</span>
                    </div>
                  </div>
                ))}
                {fastMovingProducts.length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-8">No items sold yet. Placed orders will show here.</p>
                )}
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-gray-500 font-semibold tracking-wider uppercase text-center">
              Target popular stock refills instantly
            </div>
          </div>

          {/* 2. Stock Levels Monitor */}
          <div className="lg:col-span-2 bg-[#1e293b]/40 backdrop-blur-sm border border-white/5 p-6 rounded-3xl shadow-xl">
            <h3 className="font-bold text-white text-base flex items-center gap-2 pb-3 border-b border-white/5">
              <FaBoxes className="text-blue-500" /> Real-time Products Stock Monitor
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 overflow-y-auto max-h-[175px] pr-2">
              {products.map((prod) => (
                <div key={prod._id} className="flex justify-between items-center p-3 bg-slate-900/25 border border-white/5 rounded-2xl">
                  <div>
                    <span className="block text-xs font-bold text-white max-w-[180px] truncate">{prod.name}</span>
                    <span className="block text-[10px] text-gray-500 font-mono">{prod.sku}</span>
                  </div>
                  <div className="text-right">
                    {prod.quantity === 0 ? (
                      <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded uppercase">Sold Out</span>
                    ) : prod.quantity <= prod.lowStockThreshold ? (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded uppercase">Low ({prod.quantity})</span>
                    ) : (
                      <span className="text-xs font-bold text-gray-300">{prod.quantity} in Stock</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ORDERS LIST */}
      <div className="bg-[#1e293b]/40 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-white/5 bg-slate-900/40">
          <h3 className="font-bold text-white text-base">{isAdmin ? "Purchase Orders Database" : "My Order History"}</h3>
          <p className="text-xs text-gray-400 mt-0.5">Click any row to expand items and apply coupon codes</p>
        </div>

        {displayedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-16 min-h-[300px]">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-500 mb-4">
              <FaShoppingCart className="text-2xl" />
            </div>
            <h4 className="font-semibold text-white text-lg">No Orders Found</h4>
            <p className="text-sm text-gray-400 mt-1 max-w-[280px]">
              {isAdmin ? "Customers have not placed any orders yet." : "You have not placed any orders yet. Head to products catalog to buy!"}
            </p>
            {!isAdmin && (
              <button
                onClick={() => router.push(`${baseRoute}/inventory`)}
                className="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 transition-colors font-semibold rounded-xl text-xs text-white"
              >
                Go to Catalog Store
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {displayedOrders.map((order) => {
              const isExpanded = expandedOrderId === order._id;
              return (
                <div key={order._id} className="transition-all hover:bg-white/2">
                  
                  {/* Master row */}
                  <div 
                    onClick={() => toggleExpand(order._id)}
                    className="py-5 px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center text-blue-400">
                        <FaShoppingCart />
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-white">{order._id}</span>
                        <span className="block text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                          <FaCalendarAlt />
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Customer Name (Admin view) */}
                    {isAdmin && (
                      <div>
                        <span className="block text-xs font-bold text-white flex items-center gap-1.5">
                          <FaUser className="text-gray-500" /> {order.customerName}
                        </span>
                        <span className="block text-[10px] text-gray-500 font-mono mt-0.5">{order.customerEmail}</span>
                      </div>
                    )}

                    {/* Qty & Cost */}
                    <div>
                      <span className="block text-xs font-bold text-gray-300">
                        {order.items.reduce((acc, curr) => acc + curr.quantity, 0)} Items
                      </span>
                      <span className="block text-xs font-bold text-white mt-0.5">
                        Rs. {order.total.toLocaleString()}
                      </span>
                    </div>

                    {/* Status & Toggle */}
                    <div className="flex items-center gap-4 self-start md:self-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span>{order.status}</span>
                      </span>
                      
                      {isExpanded ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
                    </div>
                  </div>

                  {/* Detail Panel */}
                  {isExpanded && (
                    <div className="px-8 pb-6 pt-2 bg-slate-900/30 border-t border-white/2 animate-fadeIn space-y-4">
                      
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Order Items Table (7 Columns) */}
                        <div className="lg:col-span-7 space-y-3">
                          <span className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Purchased Products</span>
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-slate-900 border border-white/5 rounded-2xl">
                              <div>
                                <span className="text-xs font-bold text-white block">{item.name}</span>
                                <span className="text-[10px] text-gray-500">Unit Price: Rs. {item.price.toLocaleString()}</span>
                              </div>
                              <span className="text-xs font-bold text-gray-300">{item.quantity} Units</span>
                            </div>
                          ))}
                        </div>

                        {/* Customer contact & update options (5 Columns) */}
                        <div className="lg:col-span-5 bg-slate-900/50 border border-white/5 p-4 rounded-2xl space-y-4">
                          <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">Order Dispatch Details</span>
                          
                          <div className="space-y-2">
                            {order.customerPhone && (
                              <div className="flex items-center gap-2 text-xs text-gray-300">
                                <FaPhone className="text-gray-500 text-xs" />
                                <span>Phone: <strong className="text-white">{order.customerPhone}</strong></span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                              <FaEnvelope className="text-gray-500 text-xs" />
                              <span>Email: <strong className="text-white">{order.customerEmail}</strong></span>
                            </div>
                            {order.couponApplied && (
                              <div className="flex items-center gap-2 text-xs text-emerald-400">
                                <FaTag className="text-emerald-500 text-xs" />
                                <span>Applied Coupon: <strong className="font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px]">{order.couponApplied}</strong></span>
                              </div>
                            )}
                          </div>

                          {/* Pricing breakdown */}
                          <div className="pt-2.5 border-t border-white/5 space-y-1 text-xs">
                            <div className="flex justify-between text-gray-400">
                              <span>Subtotal</span>
                              <span>Rs. {order.subtotal.toLocaleString()}</span>
                            </div>
                            {order.discount > 0 && (
                              <div className="flex justify-between text-emerald-400 font-semibold">
                                <span>Coupon discount</span>
                                <span>- Rs. {order.discount.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-bold text-white pt-1">
                              <span>Total amount</span>
                              <span>Rs. {order.total.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Action Selector: Admin modifies, User cancels */}
                          {isAdmin ? (
                            <div className="pt-2 border-t border-white/5">
                              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Change Order Status</label>
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order._id, e.target.value as Order["status"])}
                                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                              >
                                <option value="confirmed">Confirmed</option>
                                <option value="shipped">Shipped</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          ) : (
                            order.status === "confirmed" && (
                              <button
                                onClick={() => updateOrderStatus(order._id, "cancelled")}
                                className="w-full py-2.5 bg-red-600/10 hover:bg-red-600 border border-red-500/20 text-red-400 hover:text-white transition-colors font-bold rounded-xl text-xs cursor-pointer text-center text-white"
                              >
                                Cancel Purchase Order
                              </button>
                            )
                          )}

                        </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
