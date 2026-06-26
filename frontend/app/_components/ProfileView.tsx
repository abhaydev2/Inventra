"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { useRef, useState, useEffect } from "react";
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
  FaEdit
} from "react-icons/fa";

export default function ProfileView() {
  const { user, setUser } = useAuth();
  
  // Section toggle state: 'view' | 'edit' | 'password'
  const [activeSection, setActiveSection] = useState<"view" | "edit" | "password">("view");

  const [profileFields, setProfileFields] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    username: user?.username || ""
  });

  // Sync state if user loads later
  useEffect(() => {
    if (user) {
      setProfileFields({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        username: user.username || ""
      });
    }
  }, [user]);

  const [passwordFields, setPasswordFields] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = () => {
    if (!user) return "A";
    const first = user.firstName ? user.firstName[0] : "";
    const last = user.lastName ? user.lastName[0] : "";
    return (first + last).toUpperCase() || user.username?.[0].toUpperCase() || "U";
  };

  const profileImageUrl = user?.profileImage
    ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8089/api/v1").replace("/api/v1", "") + user.profileImage
    : null;

  // Handle image upload automatically upon selection
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
        profileImage: null
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
      const result = await updateProfileAction(profileFields);
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

  const inputGroupClass = "relative w-full";
  const iconClass = "absolute left-4 top-4 text-gray-500 text-sm";
  const inputClass = "w-full pl-11 pr-11 py-3.5 rounded-xl border border-white/5 bg-[#0f172a]/60 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm";
  const labelClass = "block text-xs font-bold uppercase tracking-[1.5px] text-gray-400 mb-2";
  const eyeBtnClass = "absolute right-4 top-4 text-gray-500 hover:text-white cursor-pointer transition-colors";

  return (
    <div className="space-y-8 animate-fadeIn w-full max-w-4xl mx-auto py-6 lg:py-10 px-2">
      
      {/* HEADER */}
      <div className="border-b border-white/5 pb-4 flex justify-between items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[2px] text-blue-500 mb-1">Account settings</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            {activeSection === "view" && "User Profile"}
            {activeSection === "edit" && "Edit Profile"}
            {activeSection === "password" && "Change Password"}
          </h1>
        </div>
        {activeSection !== "view" && (
          <button
            onClick={() => {
              setActiveSection("view");
              setProfileMessage({ type: "", text: "" });
              setPasswordMessage({ type: "", text: "" });
            }}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 font-semibold rounded-xl text-xs transition-all cursor-pointer"
          >
            Back to Profile
          </button>
        )}
      </div>

      {/* MAIN CONTAINER */}
      <div className="bg-[#1e293b]/40 backdrop-blur-md border border-white/5 p-8 lg:p-10 rounded-3xl flex flex-col items-center shadow-2xl space-y-8">
        
        {/* Profile Image & Camera Button (Camera ONLY in edit mode) */}
        <div className="relative group">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt="Avatar"
              className="w-32 h-32 rounded-full object-cover border-2 border-blue-500 shadow-xl shadow-blue-500/10"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center text-5xl font-bold border-2 border-blue-500 shadow-xl">
              {getInitials()}
            </div>
          )}
          
          {/* CAMERA BUTTON ONLY VISIBLE IN EDIT MODE */}
          {activeSection === "edit" && (
            <button
              onClick={() => setShowPhotoDropdown(!showPhotoDropdown)}
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 transition-all flex items-center justify-center text-sm text-white border-2 border-[#1c2536] shadow-md cursor-pointer"
              title="Edit Photo"
            >
              <FaCamera />
            </button>
          )}

          {/* Photo Actions Dropdown */}
          {showPhotoDropdown && activeSection === "edit" && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowPhotoDropdown(false)} />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-12 w-44 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl z-20 py-1 overflow-hidden animate-scaleIn">
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowPhotoDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs hover:bg-white/5 flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  <FaCamera className="text-blue-400" /> Choose from Gallery
                </button>
                {profileImageUrl && (
                  <button
                    onClick={handleRemovePhoto}
                    className="w-full text-left px-4 py-2.5 text-xs hover:bg-white/5 flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <FaTrashAlt /> Remove Photo
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageFileChange}
          className="hidden"
        />

        {/* User Name and Role */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {profileFields.firstName ? `${profileFields.firstName} ${profileFields.lastName}` : user?.username}
          </h2>
          <p className="text-xs text-gray-400 capitalize font-semibold mt-1 tracking-wider">{user?.role}</p>
        </div>

        <div className="w-full border-t border-white/5 pt-6">
          
          {/* SECTION 1: VIEW DETAILS (READ-ONLY VIEW MODE) */}
          {activeSection === "view" && (
            <div className="space-y-8 animate-fadeIn">
              
              {profileMessage.text && (
                <div className={`p-4 rounded-xl text-xs border ${
                  profileMessage.type === "success" 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}>
                  {profileMessage.text}
                </div>
              )}

              {/* Details List Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-[#0f172a]/30 border border-white/5 p-5 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/10 text-lg">
                    <FaUser />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">First Name</p>
                    <p className="text-sm font-semibold text-white mt-1">{profileFields.firstName || "—"}</p>
                  </div>
                </div>
                <div className="bg-[#0f172a]/30 border border-white/5 p-5 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/10 text-lg">
                    <FaUser />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Last Name</p>
                    <p className="text-sm font-semibold text-white mt-1">{profileFields.lastName || "—"}</p>
                  </div>
                </div>
                <div className="bg-[#0f172a]/30 border border-white/5 p-5 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/10 text-lg">
                    <FaEnvelope />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Email Address</p>
                    <p className="text-sm font-semibold text-white mt-1">{profileFields.email || "—"}</p>
                  </div>
                </div>
                <div className="bg-[#0f172a]/30 border border-white/5 p-5 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/10 text-lg">
                    <FaIdBadge />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Username</p>
                    <p className="text-sm font-semibold text-white mt-1">{profileFields.username || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons Toggles */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/5">
                <button
                  onClick={() => {
                    setActiveSection("edit");
                    setProfileMessage({ type: "", text: "" });
                  }}
                  className="flex-1 py-4 px-6 bg-blue-600 hover:bg-blue-500 transition-all font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/15 cursor-pointer"
                >
                  <FaEdit />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => {
                    setActiveSection("password");
                    setPasswordMessage({ type: "", text: "" });
                  }}
                  className="flex-1 py-4 px-6 bg-orange-600 hover:bg-orange-500 transition-all font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-600/15 cursor-pointer"
                >
                  <FaLock />
                  <span>Change Password</span>
                </button>
              </div>

            </div>
          )}

          {/* SECTION 2: EDIT PROFILE FORM */}
          {activeSection === "edit" && (
            <div className="space-y-6 animate-fadeIn">
              
              {profileMessage.text && (
                <div className={`p-4 rounded-xl text-xs border ${
                  profileMessage.type === "success" 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : profileMessage.type === "info"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}>
                  {profileMessage.text}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>First Name</label>
                    <div className={inputGroupClass}>
                      <input
                        type="text"
                        required
                        value={profileFields.firstName}
                        onChange={(e) => setProfileFields({ ...profileFields, firstName: e.target.value })}
                        className={inputClass}
                      />
                      <FaUser className={iconClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Last Name</label>
                    <div className={inputGroupClass}>
                      <input
                        type="text"
                        required
                        value={profileFields.lastName}
                        onChange={(e) => setProfileFields({ ...profileFields, lastName: e.target.value })}
                        className={inputClass}
                      />
                      <FaUser className={iconClass} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Email Address</label>
                  <div className={inputGroupClass}>
                    <input
                      type="email"
                      required
                      value={profileFields.email}
                      onChange={(e) => setProfileFields({ ...profileFields, email: e.target.value })}
                      className={inputClass}
                    />
                    <FaEnvelope className={iconClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Username</label>
                  <div className={inputGroupClass}>
                    <input
                      type="text"
                      required
                      value={profileFields.username}
                      onChange={(e) => setProfileFields({ ...profileFields, username: e.target.value })}
                      className={inputClass}
                    />
                    <FaIdBadge className={iconClass} />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/15 cursor-pointer"
                  >
                    {updatingProfile ? "Saving Details..." : "Save Profile Details"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection("view");
                      setProfileMessage({ type: "", text: "" });
                    }}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/5 font-semibold rounded-xl text-sm transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SECTION 3: CHANGE PASSWORD FORM */}
          {activeSection === "password" && (
            <div className="space-y-6 animate-fadeIn">

              {passwordMessage.text && (
                <div className={`p-4 rounded-xl text-xs border ${
                  passwordMessage.type === "success" 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}>
                  {passwordMessage.text}
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div>
                  <label className={labelClass}>Current Password</label>
                  <div className={inputGroupClass}>
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      required
                      placeholder="Enter current password"
                      value={passwordFields.currentPassword}
                      onChange={(e) => setPasswordFields({ ...passwordFields, currentPassword: e.target.value })}
                      className={inputClass}
                    />
                    <FaLock className={iconClass} />
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
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      placeholder="Enter new password (min 6 characters)"
                      value={passwordFields.newPassword}
                      onChange={(e) => setPasswordFields({ ...passwordFields, newPassword: e.target.value })}
                      className={inputClass}
                    />
                    <FaLock className={iconClass} />
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
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Confirm new password"
                      value={passwordFields.confirmPassword}
                      onChange={(e) => setPasswordFields({ ...passwordFields, confirmPassword: e.target.value })}
                      className={inputClass}
                    />
                    <FaLock className={iconClass} />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={eyeBtnClass}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="flex-1 py-4 bg-orange-600 hover:bg-orange-500 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-orange-600/15 cursor-pointer"
                  >
                    {updatingPassword ? "Updating Password..." : "Change Password Now"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection("view");
                      setPasswordMessage({ type: "", text: "" });
                    }}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/5 font-semibold rounded-xl text-sm transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
