"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  FaColumns, 
  FaBoxes, 
  FaChartBar, 
  FaUser, 
  FaBell, 
  FaSignOutAlt, 
  FaTimes, 
  FaCamera,
  FaCheckCircle,
  FaUsers
} from "react-icons/fa";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-400">Loading system...</p>
        </div>
      </div>
    );
  }

  // Determine user workspace route namespace
  const role = user?.role || "user";
  const baseRoute = role === "admin" ? "/admin" : "/user";

  const menuItems = [
    { name: "Dashboard", path: baseRoute, icon: <FaColumns /> },
    { name: "Inventory", path: `${baseRoute}/inventory`, icon: <FaBoxes /> },
    { name: "Reports", path: `${baseRoute}/reports`, icon: <FaChartBar /> },
    ...(role === "admin" ? [{ name: "Users", path: "/admin/users", icon: <FaUsers /> }] : []),
    { name: "Profile", path: `${baseRoute}/profile`, icon: <FaUser /> }
  ];

  // Helper to check active state
  const isActive = (path: string) => {
    if (path === baseRoute) {
      return pathname === baseRoute;
    }
    return pathname.startsWith(path);
  };

  // Get user initials for default avatar
  const getInitials = () => {
    if (!user) return "A";
    const first = user.firstName ? user.firstName[0] : "";
    const last = user.lastName ? user.lastName[0] : "";
    return (first + last).toUpperCase() || user.username?.[0].toUpperCase() || "U";
  };

  const profileImageUrl = user?.profileImage
    ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8089/api/v1").replace("/api/v1", "") + user.profileImage
    : null;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex font-sans antialiased overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0f172a]/90 backdrop-blur-xl border-r border-white/5 flex flex-col z-20">
        {/* LOGO */}
        <div className="h-16 flex items-center px-6 border-b border-white/5 gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            IH
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            InventHive
          </span>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-lg shadow-blue-500/15"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={`text-lg transition-transform duration-200 group-hover:scale-110 ${active ? "text-white" : "text-gray-400 group-hover:text-white"}`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* USER SECTION BOTTOM */}
        <div className="p-4 border-t border-white/5 bg-slate-900/40">
          <div className="flex items-center gap-3">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border border-white/10"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold border border-white/10 shadow-inner">
                {getInitials()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white">
                {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.username}
              </p>
              <p className="text-xs text-gray-400 capitalize truncate">{role}</p>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
              title="Logout"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* HEADER */}
        <header className="h-16 bg-[#0f172a]/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-3">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border border-white/10"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-semibold">
                {getInitials()}
              </div>
            )}
            <span className="text-sm text-gray-300 font-medium">
              Welcome back, <strong className="text-white font-semibold">{user?.firstName || user?.username || "Operator"}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* NOTIFICATION BUTTON */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2.5 rounded-full transition-all relative ${
                showNotifications 
                  ? "bg-blue-600/20 text-blue-400" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <FaBell className="text-lg" />
              {/* Notification badge */}
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border border-[#0f172a]"></span>
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTENT AREA */}
        <main className="flex-1 overflow-y-auto px-8 py-6 lg:px-12 lg:py-8 relative">
          {children}
        </main>

        {/* NOTIFICATIONS PANEL (SIDE DRAWER) */}
        {showNotifications && (
          <>
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 transition-opacity" 
              onClick={() => setShowNotifications(false)}
            />
            <div className="fixed right-0 top-0 bottom-0 w-80 bg-[#0f172a] border-l border-white/5 shadow-2xl z-40 p-6 flex flex-col transition-all duration-300 transform translate-x-0">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <FaBell className="text-blue-500" /> Notifications
                </h3>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg"
                >
                  <FaTimes />
                </button>
              </div>

              {/* EMPTY NOTIFICATION AREA */}
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-500 mb-4 animate-pulse">
                  <FaBell className="text-2xl" />
                </div>
                <h4 className="text-sm font-medium text-white mb-1">All Caught Up!</h4>
                <p className="text-xs text-gray-400 max-w-[200px]">
                  You have no unread notifications right now.
                </p>
              </div>
            </div>
          </>
        )}

        {/* LOGOUT CONFIRMATION MODAL */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#1e293b]/90 border border-white/10 p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl relative overflow-hidden backdrop-blur-xl">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-6 border border-red-500/20">
                <FaSignOutAlt />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Log Out</h3>
              <p className="text-sm text-gray-300 mb-8 leading-relaxed">
                Are you sure you want to log out? All your unsaved changes and settings will be lost.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={async () => {
                    setShowLogoutModal(false);
                    await logout();
                  }}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 transition-all font-semibold rounded-xl text-sm tracking-wide shadow-lg shadow-red-600/15"
                >
                  Log Out
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 transition-all font-medium rounded-xl text-sm border border-white/5"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
