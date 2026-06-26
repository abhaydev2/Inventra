"use client";

import { FaArrowUp, FaChartBar, FaExclamationTriangle, FaBoxes, FaDollarSign } from "react-icons/fa";

export default function ReportsView() {
  const topMoving = [
    { name: "Cloud Runner 2.0", sku: "SH-CR-80210", sold: 1240, growth: "+15% this month" },
    { name: "Everest Watch v4", sku: "WT-EW-32442", sold: 982, growth: "+8% this month" },
    { name: "BassPro Wireless", sku: "AU-BPW-1025", sold: 854, growth: "+5% this month" }
  ];

  const months = [
    { label: "Jan", height: "45%" },
    { label: "Feb", height: "60%" },
    { label: "Mar", height: "55%" },
    { label: "Apr", height: "75%" },
    { label: "May", height: "85%" },
    { label: "Jun", height: "70%" }
  ];

  return (
    <div className="space-y-10 lg:space-y-12 animate-fadeIn w-full max-w-[1800px] mx-auto py-6 px-2">
      
      {/* HEADER */}
      <div className="border-b border-white/5 pb-4">
        <p className="text-xs font-bold uppercase tracking-[2px] text-blue-500 mb-1">Analytics</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Reports &amp; Analytics</h1>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        
        {/* LEFT COLUMN: METRICS & CHART */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* VALUE CARD */}
          <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/10 p-8 lg:p-10 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
            <div className="flex items-center gap-3 text-blue-400 text-sm font-semibold mb-3">
              <FaDollarSign /> <span>Total Inventory Value</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tight">Rs. 12,400</h2>
            <p className="text-xs text-gray-400 mt-2.5">vs Last Month: <strong className="text-emerald-400">+5% increase</strong></p>
          </div>

          {/* STOCK LEVELS OVER TIME (CUSTOM BAR CHART) */}
          <div className="bg-[#1e293b]/40 border border-white/5 p-8 lg:p-10 rounded-3xl shadow-md">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-bold text-lg text-white">Stock Levels Over Time</h3>
                <p className="text-xs text-gray-400">Monthly aggregate stock levels in warehouse</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span> In Stock</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-purple-500 rounded-sm"></span> Ordered</span>
              </div>
            </div>

            {/* Bars container */}
            <div className="h-80 flex items-end justify-between px-4 pb-2 border-b border-white/5 relative">
              {months.map((m) => (
                <div key={m.label} className="flex flex-col items-center gap-3 w-1/12 group">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-[#0f172a] border border-white/10 px-2 py-1 rounded text-[10px] text-gray-300 font-mono shadow-xl pointer-events-none">
                    {m.height}
                  </div>
                  {/* Bars stack */}
                  <div className="w-full bg-white/5 rounded-t-lg h-60 flex items-end justify-center relative overflow-hidden">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-500 rounded-t-md transition-all duration-500" 
                      style={{ height: m.height }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-400 font-semibold">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: MOVING ITEMS & LOW STOCK ALERT */}
        <div className="space-y-10">
          
          {/* TOP MOVING ITEMS */}
          <div className="bg-[#1e293b]/40 border border-white/5 p-8 lg:p-10 rounded-3xl shadow-md space-y-6">
            <h3 className="text-lg font-bold text-white">Top Moving Items</h3>

            <div className="space-y-4">
              {topMoving.map((item) => (
                <div key={item.sku} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/2 border border-transparent hover:border-white/5 transition-all bg-slate-900/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/10 flex items-center justify-center text-blue-400 text-sm font-semibold">
                      {item.name[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{item.name}</h4>
                      <p className="text-[10px] text-gray-500 font-mono">{item.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white block">{item.sold} Sold</span>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 justify-end">
                      <FaArrowUp className="text-[8px]" /> {item.growth.replace(" this month", "")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LOW STOCK CARD */}
          <div className="bg-red-500/5 border border-red-500/10 p-8 lg:p-10 rounded-3xl shadow-md space-y-4">
            <div className="flex items-center gap-3 text-red-400 font-bold text-sm">
              <FaExclamationTriangle className="text-lg animate-bounce" />
              <span>Low Stock Alert</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              There are currently <strong className="text-white">12 items</strong> below the required stock levels.
            </p>
            <button className="w-full py-3.5 bg-red-600 hover:bg-red-500 transition-all font-semibold rounded-xl text-xs tracking-wider uppercase shadow-lg shadow-red-600/15 cursor-pointer">
              Restock Now
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
