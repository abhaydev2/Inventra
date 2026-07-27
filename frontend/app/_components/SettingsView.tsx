"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useStore } from "@/lib/context/StoreContext";
import { 
  FaCog, 
  FaBell, 
  FaShieldAlt, 
  FaTicketAlt, 
  FaBuilding, 
  FaSave, 
  FaPlus, 
  FaCheckCircle 
} from "react-icons/fa";

export default function SettingsView({ role }: { role: string }) {
  const { user } = useAuth();
  const { coupons } = useStore();
  const isAdmin = role === "admin";
  const [successMsg, setSuccessMsg] = useState("");

  const [settings, setSettings] = useState({
    theme: "dark",
    emailNotifications: true,
    stockAlerts: true,
    alertThreshold: 5,
    companyName: "InventHive Storage Center",
    companyEmail: "supplies@inventhive.com",
    companyPhone: "+977-9801234567",
    companyAddress: "Kathmandu, Nepal",
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem("system_theme") || "dark";
    setSettings(prev => ({ ...prev, theme: savedTheme }));
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setSettings(prev => ({ ...prev, theme: newTheme }));
    localStorage.setItem("system_theme", newTheme);
    if (newTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  const [pwFields, setPwFields] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [pwError, setPwError] = useState("");

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("Settings updated successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (!pwFields.currentPassword || !pwFields.newPassword) {
      setPwError("All password fields are required");
      return;
    }
    if (pwFields.newPassword.length < 6) {
      setPwError("New password must be at least 6 characters");
      return;
    }
    if (pwFields.newPassword !== pwFields.confirmPassword) {
      setPwError("Confirm password does not match");
      return;
    }
    
    setSuccessMsg("Password changed successfully!");
    setPwFields({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="space-y-10 lg:space-y-12 animate-fadeIn w-full max-w-[1400px] mx-auto py-6 px-2">
      {/* HEADER */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[2px] text-blue-500 mb-1">System Preferences</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <FaCog className="text-gray-400" /> Settings
        </h1>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center gap-2 text-sm">
          <FaCheckCircle />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: GENERAL SETTINGS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* GENERAL PREFERENCES FORM */}
          <div className="bg-[#1e293b]/40 backdrop-blur-sm border border-white/5 p-8 rounded-3xl shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 pb-3 border-b border-white/5">
              <FaBuilding className="text-blue-500" /> Organization & Preferences
            </h2>
            <form onSubmit={handleSaveGeneral} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0f172a] text-white focus:outline-none focus:border-blue-500 text-sm"
                    disabled={!isAdmin}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-2">System Theme</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => handleThemeChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0f172a] text-white focus:outline-none focus:border-blue-500 text-sm cursor-pointer"
                  >
                    <option value="dark">Vibrant Dark Mode</option>
                    <option value="light">Classic Light Mode</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Support Email</label>
                  <input
                    type="email"
                    value={settings.companyEmail}
                    onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0f172a] text-white focus:outline-none focus:border-blue-500 text-sm"
                    disabled={!isAdmin}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Contact Phone</label>
                  <input
                    type="text"
                    value={settings.companyPhone}
                    onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0f172a] text-white focus:outline-none focus:border-blue-500 text-sm"
                    disabled={!isAdmin}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Low Stock Threshold Alert</label>
                  <input
                    type="number"
                    value={settings.alertThreshold}
                    onChange={(e) => setSettings({ ...settings, alertThreshold: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0f172a] text-white focus:outline-none focus:border-blue-500 text-sm"
                    disabled={!isAdmin}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Physical Address</label>
                <input
                  type="text"
                  value={settings.companyAddress}
                  onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0f172a] text-white focus:outline-none focus:border-blue-500 text-sm"
                  disabled={!isAdmin}
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition-all flex items-center gap-2 shadow-lg shadow-blue-600/10 cursor-pointer"
                >
                  <FaSave />
                  <span>Save General Settings</span>
                </button>
              </div>
            </form>
          </div>

          {/* CHANGE PASSWORD */}
          <div className="bg-[#1e293b]/40 backdrop-blur-sm border border-white/5 p-8 rounded-3xl shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 pb-3 border-b border-white/5">
              <FaShieldAlt className="text-red-500" /> Account Security
            </h2>
            {pwError && (
              <div className="p-3 bg-red-600/15 border border-red-500/25 text-red-400 rounded-xl text-xs mb-4">
                {pwError}
              </div>
            )}
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={pwFields.currentPassword}
                    onChange={(e) => setPwFields({ ...pwFields, currentPassword: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0f172a] text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-2">New Password</label>
                  <input
                    type="password"
                    value={pwFields.newPassword}
                    onChange={(e) => setPwFields({ ...pwFields, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0f172a] text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={pwFields.confirmPassword}
                    onChange={(e) => setPwFields({ ...pwFields, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0f172a] text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 font-semibold rounded-xl text-sm transition-all flex items-center gap-2 shadow-lg shadow-red-600/10 cursor-pointer"
                >
                  <FaShieldAlt />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: NOTIFICATIONS & SYSTEM ACTIVE COUPONS */}
        <div className="space-y-8">
          
          {/* SYSTEM ALERTS CONFIG */}
          <div className="bg-[#1e293b]/40 backdrop-blur-sm border border-white/5 p-8 rounded-3xl shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 pb-3 border-b border-white/5">
              <FaBell className="text-amber-500" /> Notifications Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-900/40 rounded-2xl border border-white/5">
                <div>
                  <span className="block text-sm font-semibold text-white">Email Alerts</span>
                  <span className="text-xs text-gray-400">Receive reports and logins email logs</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="w-5 h-5 rounded border-white/10 bg-slate-900 cursor-pointer text-blue-500 focus:ring-0"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900/40 rounded-2xl border border-white/5">
                <div>
                  <span className="block text-sm font-semibold text-white">Stock Level Warnings</span>
                  <span className="text-xs text-gray-400">Receive warning notifications when items go low</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.stockAlerts}
                  onChange={(e) => setSettings({ ...settings, stockAlerts: e.target.checked })}
                  className="w-5 h-5 rounded border-white/10 bg-slate-900 cursor-pointer text-blue-500 focus:ring-0"
                />
              </div>
            </div>
          </div>

          {/* ACTIVE DISCOUNTS LIST */}
          <div className="bg-[#1e293b]/40 backdrop-blur-sm border border-white/5 p-8 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FaTicketAlt className="text-emerald-500" /> Active Coupons
              </h2>
            </div>
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <div key={coupon.code} className="flex justify-between items-center p-3.5 bg-emerald-600/10 border border-emerald-500/15 rounded-2xl">
                  <div>
                    <span className="font-mono font-bold text-white text-sm bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/20">{coupon.code}</span>
                    <span className="block text-xs text-gray-400 mt-1.5">Apply at checkout page</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">
                    {coupon.discountType === "percentage" ? `${coupon.value}% Off` : `Rs. ${coupon.value} Off`}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
