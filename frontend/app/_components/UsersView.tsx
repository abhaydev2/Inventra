"use client";

import { useEffect, useState } from "react";
import { 
  getAdminUsers, 
  createAdminUser, 
  updateAdminUser, 
  deleteAdminUser, 
  User 
} from "@/lib/api/users";
import { useAuth } from "@/lib/context/AuthContext";
import { 
  FaSearch, 
  FaPlus, 
  FaTrashAlt, 
  FaTimes, 
  FaUsers, 
  FaChevronLeft, 
  FaChevronRight,
  FaShieldAlt,
  FaUser,
  FaEye,
  FaEdit,
  FaCalendarAlt,
  FaEnvelope,
  FaIdBadge,
  FaClock
} from "react-icons/fa";

export default function UsersView() {
  const { user: currentUser } = useAuth();
  
  // States for list and query
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Modals Toggle
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsModalMode, setDetailsModalMode] = useState<"view" | "edit">("view");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Selected item
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form Fields
  const [formFields, setFormFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    role: "user" as "admin" | "user"
  });
  
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load administrative users
  const loadUsers = async (pageNumber = page, searchVal = searchTerm) => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminUsers(pageNumber, limit, searchVal);
      if (response && response.data) {
        setUsers(response.data);
        setTotalUsers(response.meta.total);
        setTotalPages(response.meta.totalPages);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load users list");
    } finally {
      setLoading(false);
    }
  };

  // Reset page to 1 when search term changes to prevent blank page results
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  // Live search with 300ms debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadUsers(page, searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [page, searchTerm]);

  const handleOpenAdd = () => {
    setFormFields({
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      role: "user"
    });
    setFormError("");
    setShowAddModal(true);
  };

  const handleOpenDetails = (user: User, mode: "view" | "edit" = "view") => {
    setSelectedUser(user);
    setFormFields({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      password: "", // Blank by default
      role: user.role
    });
    setFormError("");
    setDetailsModalMode(mode);
    setShowDetailsModal(true);
  };

  const handleOpenDelete = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Client validation helper
  const validateForm = (isEdit: boolean) => {
    if (!formFields.firstName.trim()) return "First name is required";
    if (!formFields.lastName.trim()) return "Last name is required";
    if (!formFields.email.trim()) return "Email address is required";
    if (!/\S+@\S+\.\S+/.test(formFields.email)) return "Invalid email address format";
    if (!formFields.username.trim()) return "Username is required";
    if (formFields.username.trim().length < 3) return "Username must be at least 3 characters";
    
    if (!isEdit) {
      if (!formFields.password) return "Password is required";
      if (formFields.password.length < 6) return "Password must be at least 6 characters";
    } else {
      if (formFields.password && formFields.password.length < 6) {
        return "Password must be at least 6 characters";
      }
    }
    return "";
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const validationError = validateForm(false);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const response = await createAdminUser(formFields);
      if (response && response.success) {
        setShowAddModal(false);
        setSearchTerm(""); // Reset search to see the new user
        loadUsers(1, ""); // Reload page 1
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormError("");
    
    const validationError = validateForm(true);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        firstName: formFields.firstName,
        lastName: formFields.lastName,
        email: formFields.email,
        username: formFields.username,
        role: formFields.role
      };
      if (formFields.password) {
        payload.password = formFields.password;
      }
      
      const response = await updateAdminUser(selectedUser._id, payload);
      if (response && response.success) {
        // Find the updated user details from the database response
        const updatedUser = response.data;
        setSelectedUser(updatedUser); // Update modal selected user state
        setDetailsModalMode("view");  // Return to view details mode
        loadUsers(page, searchTerm);  // Reload parent users list
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to update user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const response = await deleteAdminUser(selectedUser._id);
      if (response && response.success) {
        setShowDeleteModal(false);
        const newPage = (users.length === 1 && page > 1) ? page - 1 : page;
        setPage(newPage);
        loadUsers(newPage, searchTerm);
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
      setShowDeleteModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to format date strings nicely
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const modalInputClass = "w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0f172a] text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm";
  const modalLabelClass = "block text-xs font-bold uppercase tracking-[1px] text-gray-400 mb-1.5";

  return (
    <div className="space-y-10 lg:space-y-12 animate-fadeIn w-full max-w-[1800px] mx-auto py-6 px-2">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[2px] text-blue-500 mb-1">Administrative panel</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">User Management</h1>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-5 py-3.5 bg-blue-600 hover:bg-blue-500 transition-all font-semibold rounded-xl text-sm flex items-center gap-2 self-start sm:self-center shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 cursor-pointer"
        >
          <FaPlus className="text-xs" />
          <span>Create User</span>
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-[#1e293b]/60 backdrop-blur-md border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-lg">
        
        {/* Search Input (performs live search) */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Type name, email, or username to search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/5 focus:outline-none focus:border-blue-500 text-sm transition-colors text-white"
          />
          <FaSearch className="absolute left-3.5 top-3.5 text-gray-500" />
        </div>

        <div className="text-xs font-semibold text-gray-400 uppercase tracking-[1.5px] hidden md:block">
          Total Registered: <span className="text-blue-400 font-bold">{totalUsers} Users</span>
        </div>
      </div>

      {/* ERROR MESSAGE PANEL */}
      {error && (
        <div className="p-4 bg-red-600/10 border border-red-500/20 rounded-2xl text-sm text-red-400">
          {error}
        </div>
      )}

      {/* USERS TABLE */}
      <div className="bg-[#1e293b]/40 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="flex items-center justify-center min-h-[350px]">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-16 min-h-[350px]">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-500 mb-4">
              <FaUsers className="text-2xl" />
            </div>
            <h4 className="font-semibold text-white text-lg">No Users Found</h4>
            <p className="text-sm text-gray-400 max-w-[300px] mt-1">
              Try adjusting your search query, or create a new user profile using the button above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/40 border-b border-white/5 text-gray-400 text-xs font-bold uppercase tracking-[1px]">
                  <th className="py-5 px-8">Full Name</th>
                  <th className="py-5 px-8">Username</th>
                  <th className="py-5 px-8">Email Address</th>
                  <th className="py-5 px-8">Role Privilege</th>
                  <th className="py-5 px-8">Joined Date</th>
                  <th className="py-5 px-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {users.map((item) => (
                  <tr key={item._id} className="hover:bg-white/2 transition-colors">
                    {/* User name + initials */}
                    <td className="py-5 px-8 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/15 flex items-center justify-center text-blue-400 text-base font-bold">
                        {item.firstName[0].toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-white">{item.firstName} {item.lastName}</span>
                        {item._id === currentUser?._id && (
                          <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-blue-500/10 text-blue-400 rounded-sm uppercase">You</span>
                        )}
                      </div>
                    </td>
                    
                    {/* Username */}
                    <td className="py-5 px-8 font-mono text-xs text-gray-300">{item.username}</td>
                    
                    {/* Email */}
                    <td className="py-5 px-8 text-gray-300">{item.email}</td>
                    
                    {/* Role */}
                    <td className="py-5 px-8">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${
                        item.role === "admin" 
                          ? "bg-purple-600/15 text-purple-400 border border-purple-500/20" 
                          : "bg-blue-600/15 text-blue-400 border border-blue-500/20"
                      }`}>
                        {item.role === "admin" ? <FaShieldAlt className="text-[10px]" /> : <FaUser className="text-[10px]" />}
                        <span className="capitalize">{item.role}</span>
                      </span>
                    </td>
                    
                    {/* Joined Date */}
                    <td className="py-5 px-8 text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </td>
                    
                    {/* Actions (View Details / Delete) */}
                    <td className="py-5 px-8 text-right space-x-1">
                      <button
                        onClick={() => handleOpenDetails(item, "view")}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all rounded-lg"
                        title="View & Edit Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(item)}
                        disabled={item._id === currentUser?._id}
                        className={`p-2 transition-all rounded-lg ${
                          item._id === currentUser?._id 
                            ? "text-gray-600 cursor-not-allowed opacity-30" 
                            : "text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                        }`}
                        title={item._id === currentUser?._id ? "You cannot delete yourself" : "Delete User"}
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

      {/* PAGINATION CONTROLS */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-[0.5px]">
            Showing <span className="text-white">{(page - 1) * limit + 1}</span> - <span className="text-white">{Math.min(page * limit, totalUsers)}</span> of <span className="text-white">{totalUsers}</span> users
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white/5 cursor-pointer"
              title="Previous Page"
            >
              <FaChevronLeft className="text-xs" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 font-semibold text-xs rounded-xl border transition-all cursor-pointer ${
                  p === page 
                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/10" 
                    : "bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white/5 cursor-pointer"
              title="Next Page"
            >
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        </div>
      )}

      {/* CREATE NEW USER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b]/95 border border-white/10 p-6 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden backdrop-blur-xl animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Create New User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg">
                <FaTimes />
              </button>
            </div>
            
            {formError && (
              <div className="p-3 bg-red-600/15 border border-red-500/25 rounded-xl text-xs text-red-400 mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={modalLabelClass}>First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John"
                    value={formFields.firstName}
                    onChange={(e) => setFormFields({ ...formFields, firstName: e.target.value })}
                    className={modalInputClass}
                  />
                </div>
                <div>
                  <label className={modalLabelClass}>Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Doe"
                    value={formFields.lastName}
                    onChange={(e) => setFormFields({ ...formFields, lastName: e.target.value })}
                    className={modalInputClass}
                  />
                </div>
              </div>
              
              <div>
                <label className={modalLabelClass}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john.doe@example.com"
                  value={formFields.email}
                  onChange={(e) => setFormFields({ ...formFields, email: e.target.value })}
                  className={modalInputClass}
                />
              </div>

              <div>
                <label className={modalLabelClass}>Username</label>
                <input
                  type="text"
                  required
                  placeholder="johndoe"
                  value={formFields.username}
                  onChange={(e) => setFormFields({ ...formFields, username: e.target.value })}
                  className={modalInputClass}
                />
              </div>

              <div>
                <label className={modalLabelClass}>Temporary Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={formFields.password}
                  onChange={(e) => setFormFields({ ...formFields, password: e.target.value })}
                  className={modalInputClass}
                />
              </div>

              <div>
                <label className={modalLabelClass}>Access Role</label>
                <select
                  value={formFields.role}
                  onChange={(e) => setFormFields({ ...formFields, role: e.target.value as "admin" | "user" })}
                  className={modalInputClass + " cursor-pointer"}
                >
                  <option value="user">Standard User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-white/5">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/10 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create User"}
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

      {/* UNIFIED DETAILS / EDIT USER PROFILE MODAL */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b]/95 border border-[#ffffff0a] p-7 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden backdrop-blur-xl animate-scaleIn">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white tracking-tight">
                {detailsModalMode === "view" ? "User Profile Details" : "Edit User Profile"}
              </h3>
              <button 
                onClick={() => setShowDetailsModal(false)} 
                className="text-gray-400 hover:text-white p-1.5 hover:bg-white/5 rounded-xl transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="p-3.5 bg-red-600/15 border border-red-500/25 rounded-2xl text-xs text-red-400 mb-5">
                {formError}
              </div>
            )}

            {/* VIEW MODE */}
            {detailsModalMode === "view" && (
              <div className="space-y-6">
                
                {/* Big Avatar Header */}
                <div className="flex flex-col items-center justify-center py-4 bg-slate-900/40 rounded-2xl border border-white/5">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-3xl font-black mb-3">
                    {selectedUser.firstName[0].toUpperCase()}
                  </div>
                  <h4 className="text-lg font-bold text-white tracking-tight">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 capitalize font-semibold tracking-wider flex items-center gap-1.5">
                    {selectedUser.role === "admin" ? <FaShieldAlt className="text-purple-400" /> : <FaUser className="text-blue-400" />}
                    {selectedUser.role} Privilege
                  </p>
                </div>

                {/* Details Fields Stack */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-900/25 border border-white/5">
                    <FaEnvelope className="text-gray-400 text-sm" />
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider">Email Address</span>
                      <span className="text-sm font-semibold text-gray-200">{selectedUser.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-900/25 border border-white/5">
                    <FaIdBadge className="text-gray-400 text-sm" />
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider">Username</span>
                      <span className="text-sm font-semibold text-gray-200 font-mono">{selectedUser.username}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-900/25 border border-white/5">
                    <FaCalendarAlt className="text-gray-400 text-sm" />
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider">Joined Date</span>
                      <span className="text-sm font-semibold text-gray-200">{formatDate(selectedUser.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-900/25 border border-white/5">
                    <FaClock className="text-gray-400 text-sm" />
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider">Last Modified</span>
                      <span className="text-sm font-semibold text-gray-200">{formatDate(selectedUser.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-white/5">
                  <button
                    onClick={() => setDetailsModalMode("edit")}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/10 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FaEdit className="text-xs" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 font-semibold rounded-xl text-sm transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* EDIT MODE inside same Details modal */}
            {detailsModalMode === "edit" && (
              <form onSubmit={handleEditUser} className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={modalLabelClass}>First Name</label>
                    <input
                      type="text"
                      required
                      value={formFields.firstName}
                      onChange={(e) => setFormFields({ ...formFields, firstName: e.target.value })}
                      className={modalInputClass}
                    />
                  </div>
                  <div>
                    <label className={modalLabelClass}>Last Name</label>
                    <input
                      type="text"
                      required
                      value={formFields.lastName}
                      onChange={(e) => setFormFields({ ...formFields, lastName: e.target.value })}
                      className={modalInputClass}
                    />
                  </div>
                </div>
                
                <div>
                  <label className={modalLabelClass}>Email Address</label>
                  <input
                    type="email"
                    required
                    value={formFields.email}
                    onChange={(e) => setFormFields({ ...formFields, email: e.target.value })}
                    className={modalInputClass}
                  />
                </div>

                <div>
                  <label className={modalLabelClass}>Username</label>
                  <input
                    type="text"
                    required
                    value={formFields.username}
                    onChange={(e) => setFormFields({ ...formFields, username: e.target.value })}
                    className={modalInputClass}
                  />
                </div>

                <div>
                  <label className={modalLabelClass}>Update Password (Optional)</label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current"
                    value={formFields.password}
                    onChange={(e) => setFormFields({ ...formFields, password: e.target.value })}
                    className={modalInputClass}
                  />
                </div>

                <div>
                  <label className={modalLabelClass}>Access Role</label>
                  <select
                    value={formFields.role}
                    onChange={(e) => setFormFields({ ...formFields, role: e.target.value as "admin" | "user" })}
                    disabled={selectedUser._id === currentUser?._id}
                    className={modalInputClass + " cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"}
                    title={selectedUser._id === currentUser?._id ? "You cannot demote yourself" : ""}
                  >
                    <option value="user">Standard User</option>
                    <option value="admin">Administrator</option>
                  </select>
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
                    onClick={() => setDetailsModalMode("view")}
                    className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/5 font-medium rounded-xl text-sm transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

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
            <h3 className="text-lg font-bold mb-2 text-white">Delete User Profile</h3>
            <p className="text-sm text-gray-300 mb-6">
              Are you sure you want to delete <strong className="text-white font-semibold">{selectedUser?.firstName} {selectedUser?.lastName}</strong>? This action will permanently remove their access.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteUser}
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
