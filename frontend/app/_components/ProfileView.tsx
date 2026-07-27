"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { useStore } from "@/lib/context/StoreContext";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "@/app/(auth)/_component/authentication_action";
import { 
  FaCamera, 
  FaTrashAlt, 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaIdBadge, 
  FaEye, 
  FaEyeSlash,
  FaEdit,
  FaPhone,
  FaPaperPlane,
  FaVolumeUp,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVolumeMute,
  FaHistory,
  FaComments
} from "react-icons/fa";

export default function ProfileView() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const { callLogs, addCallLog, messages, sendMessage } = useStore();
  
  // Section toggle state: 'view' | 'edit' | 'password' | 'dialer' | 'chat'
  const [activeSection, setActiveSection] = useState<"view" | "edit" | "password" | "dialer" | "chat">("view");

  const [profileFields, setProfileFields] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    username: user?.username || "",
    phone: user?.phone || ""
  });

  // Sync state if user loads later
  useEffect(() => {
    if (user) {
      setProfileFields({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        username: user.username || "",
        phone: user.phone || ""
      });
    }
  }, [user]);

  const [passwordFields, setPasswordFields] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Dialer States
  const [dialNumber, setDialNumber] = useState("");
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  // Chat States
  const [chatInput, setChatInput] = useState("");
  const [typingResponse, setTypingResponse] = useState(false);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI status states
  const [showPhotoDropdown, setShowPhotoDropdown] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImageError(false);
  }, [user]);

  // Call duration counter
  useEffect(() => {
    let interval: any;
    if (isCalling) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isCalling]);

  const getInitials = () => {
    if (!user) return "A";
    const name = user.firstName || user.username || "U";
    return name[0].toUpperCase();
  };

  const profileImageUrl = user?.profileImage
    ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8089/api/v1").replace("/api/v1", "") + user.profileImage
    : null;

  // Handle image upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowPhotoDropdown(false);
    setProfileMessage({ type: "info", text: "Uploading profile image..." });

    try {
      const formData = new FormData();
      formData.append("profileImage", file);
      formData.append("firstName", profileFields.firstName);
      formData.append("lastName", profileFields.lastName);
      formData.append("email", profileFields.email);
      formData.append("username", profileFields.username);
      formData.append("phone", profileFields.phone);

      const result = await updateProfileAction(formData);
      if (result.ok && result.data) {
        setUser(result.data);
        setProfileMessage({ type: "success", text: "Profile image updated successfully!" });
      } else {
        setProfileMessage({ type: "error", text: result.error || "Failed to upload image" });
      }
    } catch (err: any) {
      setProfileMessage({ type: "error", text: err.message || "Upload failed" });
    }
  };

  // Handle removing profile image
  const handleRemovePhoto = async () => {
    setShowPhotoDropdown(false);
    setProfileMessage({ type: "info", text: "Removing profile image..." });

    try {
      const payload = {
        firstName: profileFields.firstName,
        lastName: profileFields.lastName,
        email: profileFields.email,
        username: profileFields.username,
        profileImage: null,
        phone: profileFields.phone
      };

      const result = await updateProfileAction(payload);
      if (result.ok && result.data) {
        setUser(result.data);
        setProfileMessage({ type: "success", text: "Profile image removed successfully!" });
      } else {
        setProfileMessage({ type: "error", text: result.error || "Failed to remove image" });
      }
    } catch (err: any) {
      setProfileMessage({ type: "error", text: err.message || "Failed to remove image" });
    }
  };

  // Submit profile details update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage({ type: "", text: "" });
    setUpdatingProfile(true);

    try {
      // Save details to backend (now includes phone number to save to MongoDB)
      const result = await updateProfileAction({
        firstName: profileFields.firstName,
        lastName: profileFields.lastName,
        email: profileFields.email,
        username: profileFields.username,
        phone: profileFields.phone
      });

      if (result.ok && result.data) {
        setUser(result.data);

        setProfileMessage({ type: "success", text: "Profile details updated successfully!" });
      } else {
        setProfileMessage({ type: "error", text: result.error || "Failed to update profile" });
      }
    } catch (err: any) {
      setProfileMessage({ type: "error", text: err.message || "Update failed" });
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Submit password change
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ type: "", text: "" });

    if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (passwordFields.newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Password must be at least 6 characters long" });
      return;
    }

    setUpdatingPassword(true);

    try {
      const payload = {
        firstName: profileFields.firstName,
        lastName: profileFields.lastName,
        email: profileFields.email,
        username: profileFields.username,
        currentPassword: passwordFields.currentPassword,
        password: passwordFields.newPassword
      };

      const result = await updateProfileAction(payload);
      if (result.ok) {
        setPasswordMessage({ type: "success", text: "Password changed successfully!" });
        setPasswordFields({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setPasswordMessage({ type: "error", text: result.error || "Failed to update password" });
      }
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err.message || "Update failed" });
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Dialer Methods
  const handleDialClick = (val: string) => {
    setDialNumber(prev => prev + val);
  };

  const handleStartCall = () => {
    if (!dialNumber.trim()) return;
    setIsCalling(true);
  };

  const handleEndCall = () => {
    setIsCalling(false);
    // Format duration e.g. "01:24"
    const mins = Math.floor(callDuration / 60).toString().padStart(2, "0");
    const secs = (callDuration % 60).toString().padStart(2, "0");
    
    // Add call log
    addCallLog({
      fromName: `${user?.firstName || "You"} ${user?.lastName || ""}`.trim(),
      toName: dialNumber === "8089" ? "InventHive Support Hotline" : dialNumber,
      type: "audio",
      duration: `${mins}:${secs}`
    });
    setDialNumber("");
  };

  // Chat Methods
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    sendMessage("admin@inventhive.com", chatInput);
    const userMsg = chatInput;
    setChatInput("");
    setTypingResponse(true);

    // Auto simulated response from admin/support agent
    setTimeout(() => {
      setTypingResponse(false);
      
      let replyContent = "Hi! Thank you for contacting InventHive support team. We have received your query and one of our operators will call you shortly.";
      
      if (userMsg.toLowerCase().includes("discount") || userMsg.toLowerCase().includes("coupon")) {
        replyContent = "Hey there! Try applying the coupon code WELCOME50 at your product checkout screen for a whopping 50% discount off all products!";
      } else if (userMsg.toLowerCase().includes("order") || userMsg.toLowerCase().includes("delivery")) {
        replyContent = "Sure! Please visit the 'Orders List' page to see your current dispatch status. We ship all orders within 24 hours of placement.";
      } else if (userMsg.toLowerCase().includes("electronics") || userMsg.toLowerCase().includes("stock") || userMsg.toLowerCase().includes("headphone")) {
        replyContent = "We have just restocked our Electronics collection! Check out our new Wireless Bluetooth Headphones in the store.";
      }

      // Send simulated reply
      const newMsg = {
        _id: `msg-reply-${Math.random().toString(36).substr(2, 9)}`,
        sender: "admin@inventhive.com",
        receiver: user?.email || "user@inventhive.com",
        content: replyContent,
        timestamp: new Date().toISOString()
      };
      
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("store_messages");
        const currentMsgs = stored ? JSON.parse(stored) : [];
        const updated = [...currentMsgs, newMsg];
        localStorage.setItem("store_messages", JSON.stringify(updated));
        // Force refresh messaging lists
        window.dispatchEvent(new Event("storage"));
      }
    }, 1500);
  };

  // Listen to cross-tab storage changes to update live messages
  useEffect(() => {
    const handleStorageChange = () => {
      // Force trigger state sync via StoreContext
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const inputGroupClass = "relative w-full";
  const iconClass = "absolute left-4 top-4 text-gray-500 text-sm";
  const inputClass = "w-full pl-11 pr-11 py-3.5 rounded-xl border border-white/5 bg-[#0f172a]/60 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm";
  const labelClass = "block text-xs font-bold uppercase tracking-[1.5px] text-gray-400 mb-2";
  const eyeBtnClass = "absolute right-4 top-4 text-gray-500 hover:text-white cursor-pointer transition-colors";

  // Filter messages for current chat session
  const filteredMessages = messages.filter(m => 
    (m.sender === user?.email && m.receiver === "admin@inventhive.com") ||
    (m.sender === "admin@inventhive.com" && m.receiver === user?.email)
  );

  return (
    <div className="space-y-8 animate-fadeIn w-full max-w-4xl mx-auto py-6 lg:py-10 px-2">
      
      {/* HEADER WITH TABS */}
      <div className="border-b border-white/5 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[2px] text-blue-500 mb-1">Account settings</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            {activeSection === "view" && "User Profile"}
            {activeSection === "edit" && "Edit Profile"}
            {activeSection === "password" && "Change Password"}
            {activeSection === "dialer" && "Interactive Dialer"}
            {activeSection === "chat" && "Support Chat Center"}
          </h1>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSection("view")}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              activeSection === "view" 
                ? "bg-blue-600 border-blue-500 text-white" 
                : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveSection("dialer")}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === "dialer" 
                ? "bg-blue-600 border-blue-500 text-white" 
                : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
            }`}
          >
            <FaPhone className="text-[10px]" /> Call Hotline
          </button>
          <button
            onClick={() => setActiveSection("chat")}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === "chat" 
                ? "bg-blue-600 border-blue-500 text-white" 
                : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
            }`}
          >
            <FaComments className="text-[10px]" /> Support Chat
          </button>
        </div>
      </div>

      {/* DIALER DIALOG */}
      {isCalling && (
        <div className="fixed inset-0 bg-[#0f172a]/95 z-50 flex flex-col items-center justify-center animate-fadeIn text-center">
          <div className="space-y-6 max-w-sm w-full p-6">
            <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-2 animate-pulse">
              <FaPhone />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {dialNumber === "8089" ? "InventHive Support Hotline" : dialNumber}
              </h2>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                Connected • {Math.floor(callDuration / 60).toString().padStart(2, "0")}:{(callDuration % 60).toString().padStart(2, "0")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-8 max-w-[240px] mx-auto">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  isMuted 
                    ? "bg-amber-600/20 border-amber-500 text-amber-400" 
                    : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
                }`}
              >
                {isMuted ? <FaVolumeMute className="text-lg" /> : <FaMicrophoneSlash className="text-lg" />}
              </button>
              <button
                onClick={() => setIsSpeaker(!isSpeaker)}
                className={`p-4 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  isSpeaker 
                    ? "bg-blue-600/20 border-blue-500 text-blue-400" 
                    : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
                }`}
              >
                <FaVolumeUp className="text-lg" />
              </button>
            </div>

            <button
              onClick={handleEndCall}
              className="px-8 py-3.5 bg-red-600 hover:bg-red-500 font-bold rounded-xl text-sm transition-all shadow-lg shadow-red-600/20 cursor-pointer flex items-center gap-2 mx-auto justify-center"
            >
              <FaPhone className="rotate-135" /> End Call
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="bg-[#1e293b]/40 backdrop-blur-md border border-white/5 p-8 lg:p-10 rounded-3xl flex flex-col items-center shadow-2xl space-y-8">
        
        {/* VIEW ACCOUNT PROFILE */}
        {activeSection === "view" && (
          <div className="w-full space-y-8 animate-fadeIn">
            
            {/* Avatar Header */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                {profileImageUrl && !imageError ? (
                  <img
                    src={profileImageUrl}
                    alt="Avatar"
                    onError={() => setImageError(true)}
                    className="w-28 h-28 rounded-full object-cover border border-white/10 shadow-xl"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-blue-600 flex items-center justify-center text-4xl font-black border border-blue-500 shadow-xl">
                    {getInitials()}
                  </div>
                )}
                
                {/* Camera Action Button directly below the circle */}
                <button
                  type="button"
                  onClick={() => setShowPhotoDropdown(!showPhotoDropdown)}
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border border-white/10 text-gray-300 hover:text-white flex items-center justify-center shadow-lg transition-all cursor-pointer hover:scale-105"
                  title="Edit Profile Picture"
                >
                  <FaCamera className="text-xs" />
                </button>

                {/* Dropdown Menu for Avatar Actions */}
                {showPhotoDropdown && (
                  <div className="absolute top-[104px] left-1/2 -translate-x-1/2 w-36 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl z-30 py-1 overflow-hidden animate-fadeIn">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPhotoDropdown(false);
                        fileInputRef.current?.click();
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-gray-200 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <FaCamera className="text-[10px]" />
                      <span>Update Photo</span>
                    </button>
                    {profileImageUrl && !imageError && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowPhotoDropdown(false);
                          handleRemovePhoto();
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors cursor-pointer border-t border-white/5"
                      >
                        <FaTrashAlt className="text-[10px]" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Hidden file input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageFileChange} 
                accept="image/*" 
                className="hidden" 
              />

              <h2 className="text-xl font-bold text-white tracking-tight mt-6">
                {profileFields.firstName ? `${profileFields.firstName} ${profileFields.lastName}` : user?.username}
              </h2>
              <p className="text-xs text-gray-400 capitalize font-semibold mt-1 tracking-wider">{user?.role} Account</p>
            </div>

            {/* Read-Only Details */}
            {profileMessage.text && (
              <div className={`p-4 rounded-xl text-xs ${profileMessage.type === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                {profileMessage.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
              <div className="p-4 rounded-2xl bg-slate-900/35 border border-white/5">
                <span className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">First Name</span>
                <span className="text-sm font-semibold text-gray-200">{profileFields.firstName || "Not provided"}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/35 border border-white/5">
                <span className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Last Name</span>
                <span className="text-sm font-semibold text-gray-200">{profileFields.lastName || "Not provided"}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/35 border border-white/5">
                <span className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Email Address</span>
                <span className="text-sm font-semibold text-gray-200">{profileFields.email}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/35 border border-white/5">
                <span className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Phone Number</span>
                <span className="text-sm font-semibold text-gray-200 font-mono">{profileFields.phone || "Not set (Edit to add phone)"}</span>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/5 w-full">
              <button
                onClick={() => setActiveSection("edit")}
                className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <FaEdit /> Edit profile
              </button>
              <button
                onClick={() => setActiveSection("password")}
                className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 border border-white/5 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FaLock /> Change password
              </button>
            </div>
            <button onClick={() => router.push(user?.role === "admin" ? "/admin/ai-inventory" : "/user/ai-inventory")} className="w-full py-3.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-sm font-semibold text-purple-200 hover:bg-purple-500/20 transition-all">AI Inventory Analysis</button>
          </div>
        )}

        {/* EDIT PROFILE DETAILS */}
        {activeSection === "edit" && (
          <form onSubmit={handleUpdateProfile} className="w-full space-y-6 animate-fadeIn">
            {profileMessage.text && (
              <div className={`p-4 rounded-xl text-xs ${profileMessage.type === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                {profileMessage.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>First Name</label>
                <div className={inputGroupClass}>
                  <FaUser className={iconClass} />
                  <input
                    type="text"
                    value={profileFields.firstName}
                    onChange={(e) => setProfileFields({ ...profileFields, firstName: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <div className={inputGroupClass}>
                  <FaUser className={iconClass} />
                  <input
                    type="text"
                    value={profileFields.lastName}
                    onChange={(e) => setProfileFields({ ...profileFields, lastName: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Email Address</label>
              <div className={inputGroupClass}>
                <FaEnvelope className={iconClass} />
                <input
                  type="email"
                  value={profileFields.email}
                  onChange={(e) => setProfileFields({ ...profileFields, email: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Phone Number</label>
              <div className={inputGroupClass}>
                <FaPhone className={iconClass} />
                <input
                  type="text"
                  placeholder="e.g. +977-98XXXXXXXX"
                  value={profileFields.phone}
                  onChange={(e) => setProfileFields({ ...profileFields, phone: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/5">
              <button
                type="submit"
                disabled={updatingProfile}
                className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {updatingProfile ? "Saving..." : "Save Details"}
              </button>
              <button
                type="button"
                onClick={() => setActiveSection("view")}
                className="px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/5 font-semibold rounded-xl text-sm transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* CHANGE PASSWORD */}
        {activeSection === "password" && (
          <form onSubmit={handleUpdatePassword} className="w-full space-y-6 animate-fadeIn">
            {passwordMessage.text && (
              <div className={`p-4 rounded-xl text-xs ${passwordMessage.type === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                {passwordMessage.text}
              </div>
            )}

            <div>
              <label className={labelClass}>Current Password</label>
              <div className={inputGroupClass}>
                <FaLock className={iconClass} />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordFields.currentPassword}
                  onChange={(e) => setPasswordFields({ ...passwordFields, currentPassword: e.target.value })}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className={eyeBtnClass}
                >
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label className={labelClass}>New Password</label>
              <div className={inputGroupClass}>
                <FaLock className={iconClass} />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordFields.newPassword}
                  onChange={(e) => setPasswordFields({ ...passwordFields, newPassword: e.target.value })}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className={eyeBtnClass}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label className={labelClass}>Confirm New Password</label>
              <div className={inputGroupClass}>
                <FaLock className={iconClass} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordFields.confirmPassword}
                  onChange={(e) => setPasswordFields({ ...passwordFields, confirmPassword: e.target.value })}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={eyeBtnClass}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/5">
              <button
                type="submit"
                disabled={updatingPassword}
                className="flex-1 py-3.5 bg-red-600 hover:bg-red-500 font-semibold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {updatingPassword ? "Changing..." : "Change Password"}
              </button>
              <button
                type="button"
                onClick={() => setActiveSection("view")}
                className="px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/5 font-semibold rounded-xl text-sm transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* DIALER SCREEN */}
        {activeSection === "dialer" && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
            
            {/* Dialer Interface */}
            <div className="p-6 bg-[#0f172a]/40 border border-white/5 rounded-3xl space-y-6 flex flex-col justify-between max-w-sm mx-auto">
              
              {/* Dial number input display */}
              <div className="bg-slate-900 px-4 py-5 rounded-2xl border border-white/5 text-center text-xl font-bold font-mono tracking-widest text-white h-16 flex items-center justify-center overflow-x-auto">
                {dialNumber || "Enter number"}
              </div>

              {/* Grid buttons 1-9 */}
              <div className="grid grid-cols-3 gap-3">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((btn) => (
                  <button
                    key={btn}
                    onClick={() => handleDialClick(btn)}
                    className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 border border-white/2 text-white font-bold text-lg flex items-center justify-center transition-colors mx-auto cursor-pointer"
                  >
                    {btn}
                  </button>
                ))}
              </div>

              {/* Call and backspace buttons */}
              <div className="flex items-center justify-between gap-4 max-w-[240px] mx-auto w-full">
                <button
                  onClick={() => setDialNumber(prev => prev.slice(0, -1))}
                  className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Backspace"
                >
                  <FaTrashAlt className="text-xs" />
                </button>
                
                <button
                  onClick={handleStartCall}
                  className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center text-xl transition-colors cursor-pointer shadow-lg shadow-emerald-600/10"
                >
                  <FaPhone />
                </button>

                <button
                  onClick={() => setDialNumber("8089")}
                  className="w-12 h-12 rounded-2xl bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-blue-500/10 text-xs font-bold"
                  title="Quick Hotkey to Hotline support"
                >
                  Hotline
                </button>
              </div>

            </div>

            {/* Recent Call Logs */}
            <div className="bg-[#0f172a]/20 border border-white/5 p-6 rounded-3xl flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2 pb-3 border-b border-white/5">
                  <FaHistory className="text-gray-400" /> Recent Call Logs
                </h3>
                <div className="space-y-3 mt-4 overflow-y-auto max-h-[300px]">
                  {callLogs.map((log) => (
                    <div key={log._id} className="flex justify-between items-center p-3 bg-slate-900 border border-white/5 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <span className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
                          <FaPhone className="text-xs" />
                        </span>
                        <div>
                          <span className="block text-xs font-bold text-white">{log.toName}</span>
                          <span className="block text-[9px] text-gray-500">Connected ({log.duration})</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                  {callLogs.length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-10">No recent call history.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* CHAT SUPPORT SYSTEM */}
        {activeSection === "chat" && (
          <div className="w-full flex flex-col h-[500px] border border-white/5 rounded-3xl bg-[#0f172a]/30 overflow-hidden justify-between animate-fadeIn">
            
            {/* Chat Head */}
            <div className="bg-[#1e293b]/60 border-b border-white/5 px-6 py-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                IH
              </div>
              <div>
                <span className="block text-sm font-bold text-white">InventHive Help Center</span>
                <span className="block text-[10px] text-emerald-400 flex items-center gap-1.5 font-semibold">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Online Support Agent
                </span>
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {filteredMessages.map((msg) => {
                const isMe = msg.sender === user?.email;
                return (
                  <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isMe 
                        ? "bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-600/10" 
                        : "bg-slate-900 border border-white/5 text-gray-200 rounded-bl-none"
                    }`}>
                      <p>{msg.content}</p>
                      <span className="block text-[9px] text-gray-400 text-right mt-1.5">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {typingResponse && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-white/5 p-3 rounded-2xl rounded-bl-none text-xs text-gray-400 italic flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                    <span>Support Agent is typing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Send Form */}
            <form onSubmit={handleSendChat} className="bg-slate-950 p-4 border-t border-white/5 flex gap-3">
              <input
                type="text"
                placeholder="Type messages support (e.g. Ask for discount codes)..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-4 py-3 bg-[#0f172a]/60 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="p-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-lg shadow-blue-600/10"
              >
                <FaPaperPlane className="text-xs" />
              </button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
}
