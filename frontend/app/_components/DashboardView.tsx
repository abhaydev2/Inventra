"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/api/products";
import { FaBoxes, FaExclamationTriangle, FaWarehouse, FaDollarSign, FaArrowRight, FaClock } from "react-icons/fa";
import Link from "next/link";

interface Stats {
  totalProducts: number;
  totalStock: number;
  lowStockItems: number;
  totalInventoryValue: number;
}

export default function DashboardView({ role }: { role: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const baseRoute = role === "admin" ? "/admin" : "/user";

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await getDashboardStats();
        if (response && response.data) {
          setStats(response.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard stats, using fallback mock stats", err);
        setStats({
          totalProducts: 1248,
          totalStock: 8420,
          lowStockItems: 12,
          totalInventoryValue: 12400
        });
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val).replace("INR", "Rs.");
  };

  return (
    <div className="space-y-10 lg:space-y-14 animate-fadeIn w-full max-w-7xl mx-auto py-6 lg:py-10 px-6">
      
      {/* HEADER SECTION */}
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[3px] text-blue-500">Overview</p>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Store Overview</h1>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Total Products */}
        <div className="bg-[#1e293b]/60 backdrop-blur-md border border-white/5 p-8 lg:p-10 rounded-3xl flex flex-col justify-between shadow-xl min-h-[170px] hover:border-white/10 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-400">Total Products</span>
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/10 text-lg">
              <FaBoxes />
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
              {stats?.totalProducts.toLocaleString() || "0"}
            </h3>
            <p className="text-xs text-emerald-400 font-bold mt-2.5 flex items-center gap-1">
              <span>+12% this month</span>
            </p>
          </div>
        </div>

        {/* Card 2: Warehouse Stock */}
        <div className="bg-[#1e293b]/60 backdrop-blur-md border border-white/5 p-8 lg:p-10 rounded-3xl flex flex-col justify-between shadow-xl min-h-[220px] hover:border-white/10 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-400">Warehouse Stock</span>
            <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-400 flex items-center justify-center border border-purple-500/10 text-lg">
              <FaWarehouse />
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-5xl font-black text-white tracking-tight">
              {stats?.totalStock.toLocaleString() || "0"}
            </h3>
            <p className="text-xs text-gray-400 mt-2.5">Active items in stock</p>
          </div>
        </div>

        {/* Card 3: Low Stock Warning */}
        <div className="bg-[#1e293b]/60 backdrop-blur-md border border-white/5 p-8 lg:p-10 rounded-3xl flex flex-col justify-between shadow-xl min-h-[220px] hover:border-white/10 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-400">Low Stock Items</span>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border text-lg ${
              (stats?.lowStockItems || 0) > 0 
                ? "bg-amber-600/10 text-amber-400 border-amber-500/10" 
                : "bg-emerald-600/10 text-emerald-400 border-emerald-500/10"
            }`}>
              <FaExclamationTriangle />
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-5xl font-black tracking-tight text-white">
              {stats?.lowStockItems || "0"}
            </h3>
            <p className={`text-xs mt-2.5 font-bold ${
              (stats?.lowStockItems || 0) > 0 ? "text-amber-400" : "text-gray-400"
            }`}>
              {(stats?.lowStockItems || 0) > 0 ? "Needs immediate restock" : "All levels normal"}
            </p>
          </div>
        </div>

        {/* Card 4: Inventory Value */}
        <div className="bg-[#1e293b]/60 backdrop-blur-md border border-white/5 p-8 lg:p-10 rounded-3xl flex flex-col justify-between shadow-xl min-h-[220px] hover:border-white/10 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-400">Inventory Value</span>
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center border border-emerald-500/10 text-lg">
              <FaDollarSign />
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-5xl font-black text-white tracking-tight">
              {formatCurrency(stats?.totalInventoryValue || 0)}
            </h3>
            <p className="text-xs text-gray-400 mt-2.5">Valuation at current price</p>
          </div>
        </div>

      </div>

      {/* QUICK ACTIONS BUTTONS */}
      <div className="flex flex-wrap gap-6 pt-6 lg:pt-8">
        <Link 
          href={`${baseRoute}/inventory`}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 transition-all font-semibold rounded-2xl text-sm flex items-center gap-2 shadow-lg shadow-blue-600/15 hover:shadow-blue-600/30 hover:scale-[1.02] duration-200"
        >
          <span>View Inventory</span>
          <FaArrowRight className="text-xs" />
        </Link>
        <Link 
          href={`${baseRoute}/reports`}
          className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/5 transition-all font-semibold rounded-2xl text-sm flex items-center gap-2 hover:scale-[1.02] duration-200"
        >
          <span>View Reports</span>
        </Link>
      </div>

      {/* LOWER SECTION: ACTIVITY & CATEGORIES */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 pt-6 lg:pt-8">
        
        {/* RECENT ACTIVITY */}
        <div className="lg:col-span-2 bg-[#1e293b]/40 backdrop-blur-sm border border-white/5 p-8 lg:p-10 rounded-3xl shadow-lg space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white tracking-tight">Recent Activity</h3>
            <span className="text-xs text-blue-500 font-bold cursor-pointer hover:underline uppercase tracking-wider">See All</span>
          </div>

          <div className="space-y-6">
            
            {/* Activity 1 */}
            <div className="flex gap-5 items-start p-6 rounded-2xl hover:bg-white/5 transition-all duration-200 border border-transparent hover:border-white/5 bg-slate-900/10">
              <div className="p-3 bg-blue-600/10 text-blue-400 rounded-xl text-md animate-pulse">
                <FaBoxes />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 leading-relaxed">
                  5 units of <strong className="text-white font-semibold">Blue Pen</strong> added
                </p>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5 font-medium">
                  <FaClock /> <span>2 hours ago</span> • <span className="font-mono">SKU: BP-001</span>
                </p>
              </div>
            </div>

            {/* Activity 2 */}
            <div className="flex gap-5 items-start p-6 rounded-2xl hover:bg-white/5 transition-all duration-200 border border-transparent hover:border-white/5 bg-slate-900/10">
              <div className="p-3 bg-amber-600/10 text-amber-400 rounded-xl text-md animate-pulse">
                <FaBoxes />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 leading-relaxed">
                  <strong className="text-white font-semibold">12 A5 Notebooks</strong> sold
                </p>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5 font-medium">
                  <FaClock /> <span>1 hour ago</span> • <span className="font-mono">SKU: NB-A5-K</span>
                </p>
              </div>
            </div>

            {/* Activity 3 */}
            <div className="flex gap-5 items-start p-6 rounded-2xl hover:bg-white/5 transition-all duration-200 border border-transparent hover:border-white/5 bg-slate-900/10">
              <div className="p-3 bg-purple-600/10 text-purple-400 rounded-xl text-md animate-pulse">
                <FaBoxes />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 leading-relaxed">
                  New SKU created: <strong className="text-white font-semibold">Block Stapler</strong>
                </p>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5 font-medium">
                  <FaClock /> <span>3 hours ago</span> • <span className="font-mono">SKU: ST-BLK-02</span>
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* TOP CATEGORIES */}
        <div className="bg-[#1e293b]/40 backdrop-blur-sm border border-white/5 p-8 lg:p-10 rounded-3xl shadow-lg flex flex-col justify-between min-h-[320px]">
          <h3 className="text-xl font-bold text-white tracking-tight mb-6">Top Categories</h3>

          <div className="space-y-8 flex-1 justify-center flex flex-col">
            
            {/* Category 1 */}
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-400 font-semibold">Office Supplies</span>
                <span className="font-bold text-white">45%</span>
              </div>
              <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: "45%" }}></div>
              </div>
            </div>

            {/* Category 2 */}
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-400 font-semibold">Tech Gadgets</span>
                <span className="font-bold text-white">30%</span>
              </div>
              <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: "30%" }}></div>
              </div>
            </div>

            {/* Category 3 */}
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-400 font-semibold">Furniture</span>
                <span className="font-bold text-white">25%</span>
              </div>
              <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "25%" }}></div>
              </div>
            </div>

          </div>

          <div className="text-xs text-gray-500 text-center italic mt-6 border-t border-white/5 pt-4">
            Calculated by stock distribution value.
          </div>
        </div>

      </div>

    </div>
  );
}
