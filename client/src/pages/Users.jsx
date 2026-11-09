import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Mail,
  MoreVertical,
  Plus,
  Search,
  Shield,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  UserX,
  X,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../api/axios.js";

// TEMPORARY FRONTEND PASSWORD
const TEMP_ADMIN_PASSWORD = "admin@gfgc.com";

const roles = [
  { value: "admin", label: "Administrator" },
  { value: "store", label: "Store Manager" },
  { value: "department", label: "Department User" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "department",
  status: "active",
  department: "",
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // TEMPORARY PASSWORD VERIFICATION STATES
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({ ...emptyForm });
  const [openMenu, setOpenMenu] = useState(null);

  /*
   * GET ALL USERS
   */

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/users");
      const fetchedUsers = response.data?.users || response.data?.data || [];

      setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error(error.response?.data?.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  /*
   * GET ALL DEPARTMENTS
   */

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/departments");

      const fetchedDepartments =
        response.data?.departments || response.data?.data || [];

      setDepartments(
        Array.isArray(fetchedDepartments) ? fetchedDepartments : [],
      );
    } catch (error) {
      console.error("Failed to fetch departments:", error);

      toast.error(
        error.response?.data?.message || "Failed to load departments",
      );

      setDepartments([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  /*
   * FILTER USERS
   */

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim();

    return users.filter((user) => {
      if (user.role === "admin") return false;

      const departmentName = user.department?.name || user.departmentName || "";

      const matchesSearch =
        !query ||
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        departmentName?.toLowerCase().includes(query);

      const matchesRole = roleFilter === "All" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  /*
   * SUMMARY
   */

  const visibleUsers = users.filter((user) => user.role !== "admin");

  const totalUsers = visibleUsers.length;

  const activeUsers = visibleUsers.filter(
    (user) => user.status === "active",
  ).length;

  const inactiveUsers = visibleUsers.filter(
    (user) => user.status === "inactive",
  ).length;

  const adminUsers = users.filter((user) => user.role === "admin").length;

  /*
   * HELPERS
   */

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  const getRoleLabel = (role) => {
    const foundRole = roles.find((item) => item.value === role);
    return foundRole?.label || role;
  };

  const getStatusLabel = (status) => {
    const foundStatus = statusOptions.find((item) => item.value === status);

    return foundStatus?.label || status;
  };

  const getRoleStyle = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "store":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      case "department":
        return "bg-amber-50 text-amber-700 border-amber-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getDepartmentName = (user) => {
    if (!user?.department) return "Not assigned";

    if (typeof user.department === "object") {
      return user.department.name || user.department.code || "Not assigned";
    }

    const department = departments.find((item) => item._id === user.department);

    return department?.name || department?.code || "Not assigned";
  };

  /*
   * ADD / EDIT MODAL
   */

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ ...emptyForm });
    setShowModal(true);
    setOpenMenu(null);
  };

  const openEditModal = (user) => {
    setEditingUser(user);

    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "department",
      status: user.status || "active",
      department: user.department?._id || user.department || "",
    });

    setShowModal(true);
    setOpenMenu(null);
  };

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingUser(null);
    setFormData({ ...emptyForm });
  };

  /*
   * TEMPORARY ADMIN PASSWORD VERIFICATION
   * FRONTEND ONLY
   */

  // Open password verification for a specific action.
  const requestPasswordVerification = (type, user) => {
    setPendingAction({ type, user });
    setAdminPassword("");
    setPasswordError("");
    setShowPassword(false);
    setShowPasswordModal(true);
    setOpenMenu(null);
  };

  // Edit requires password verification.
  const requestEditUser = (user) => {
    requestPasswordVerification("edit", user);
  };

  // Deactivation requires verification.
  // Activation does not require verification.
  const requestToggleUserStatus = (user) => {
    if (user.status === "active") {
      requestPasswordVerification("deactivate", user);
    } else {
      toggleUserStatus(user._id);
      setOpenMenu(null);
    }
  };

  // Deletion requires password verification.
  const requestDeleteUser = (user) => {
    requestPasswordVerification("delete", user);
  };

  const handleVerifyPassword = (e) => {
    e.preventDefault();

    if (!adminPassword.trim()) {
      setPasswordError("Please enter your password");
      return;
    }

    if (adminPassword !== TEMP_ADMIN_PASSWORD) {
      setPasswordError("Incorrect password. Please try again.");
      return;
    }

    const action = pendingAction;

    // Close and reset verification modal.
    setShowPasswordModal(false);
    setAdminPassword("");
    setPasswordError("");
    setShowPassword(false);
    setPendingAction(null);

    if (!action?.user) return;

    toast.success("Password verified successfully");

    // Continue with the requested action.
    switch (action.type) {
      case "edit":
        openEditModal(action.user);
        break;

      case "deactivate":
        toggleUserStatus(action.user._id);
        break;

      case "delete":
        deleteUser(action.user._id);
        break;

      default:
        break;
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPendingAction(null);
    setAdminPassword("");
    setPasswordError("");
    setShowPassword(false);
  };

  const getPasswordModalText = () => {
    switch (pendingAction?.type) {
      case "edit":
        return {
          title: "Verify Administrator",
          description: "Enter your password to continue editing this user.",
          message:
            "Administrator verification is required before editing user information.",
        };

      case "deactivate":
        return {
          title: "Verify Administrator",
          description: "Enter your password to deactivate this user.",
          message:
            "Administrator verification is required before deactivating a user account.",
        };

      case "delete":
        return {
          title: "Verify Administrator",
          description: "Enter your password to continue deleting this user.",
          message:
            "Administrator verification is required before deleting a user account.",
        };

      default:
        return {
          title: "Verify Administrator",
          description: "Enter your administrator password to continue.",
          message: "Administrator verification is required to continue.",
        };
    }
  };

  /*
   * FORM CHANGE
   */

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      if (field === "role" && value !== "department") {
        updated.department = "";
      }

      return updated;
    });
  };

  /*
   * CREATE / UPDATE USER
   */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter user name");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter email address");
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error("Please enter password");
      return;
    }

    if (!editingUser && formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (editingUser && formData.password && formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!["admin", "store", "department"].includes(formData.role)) {
      toast.error("Please select a valid role");
      return;
    }

    if (formData.role === "department" && !formData.department) {
      toast.error("Please assign a department to this user");
      return;
    }

    try {
      setSubmitting(true);

      if (!editingUser) {
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: formData.role,
          status: formData.status,
          department:
            formData.role === "department" ? formData.department : null,
        };

        const response = await api.post("/users", payload);

        const createdUser = response.data?.user || response.data?.data;

        if (createdUser) {
          setUsers((prev) => [createdUser, ...prev]);
        } else {
          await fetchUsers();
        }

        toast.success(response.data?.message || "User added successfully");
      } else {
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          role: formData.role,
          status: formData.status,
          department:
            formData.role === "department" ? formData.department : null,
        };

        if (formData.password) {
          payload.password = formData.password;
        }

        const response = await api.put(`/users/${editingUser._id}`, payload);

        const updatedUser = response.data?.user || response.data?.data;

        if (updatedUser) {
          setUsers((prev) =>
            prev.map((user) =>
              user._id === editingUser._id ? updatedUser : user,
            ),
          );
        } else {
          await fetchUsers();
        }

        toast.success(response.data?.message || "User updated successfully");
      }

      closeModal();
    } catch (error) {
      console.error("Failed to save user:", error);
      toast.error(error.response?.data?.message || "Failed to save user");
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * TOGGLE USER STATUS
   * PATCH /api/users/:id/status
   */

  const toggleUserStatus = async (userId) => {
    const target = users.find((user) => user._id === userId);

    if (!target) return;

    const newStatus = target.status === "active" ? "inactive" : "active";

    try {
      setActionLoading(userId);

      const response = await api.patch(`/users/${userId}/status`, {
        status: newStatus,
      });

      const updatedUser = response.data?.user || response.data?.data;

      if (updatedUser) {
        setUsers((prev) =>
          prev.map((user) => (user._id === userId ? updatedUser : user)),
        );
      } else {
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userId ? { ...user, status: newStatus } : user,
          ),
        );
      }

      toast.success(
        response.data?.message ||
          (newStatus === "active" ? "User activated" : "User deactivated"),
      );

      setOpenMenu(null);
    } catch (error) {
      console.error("Failed to update user status:", error);

      toast.error(
        error.response?.data?.message || "Failed to update user status",
      );
    } finally {
      setActionLoading(null);
    }
  };

  /*
   * DELETE USER
   * DELETE /api/users/:id
   */

  const deleteUser = async (userId) => {
    const target = users.find((user) => user._id === userId);

    if (!target) return;

    if (target.role === "admin") {
      toast.error("Administrator users cannot be deleted");
      setOpenMenu(null);
      return;
    }

    // Ask for confirmation only after password verification.
    const confirmed = window.confirm(
      `Are you sure you want to delete ${target.name}?`,
    );

    if (!confirmed) return;

    try {
      setActionLoading(userId);

      const response = await api.delete(`/users/${userId}`);

      setUsers((prev) => prev.filter((user) => user._id !== userId));

      toast.success(response.data?.message || "User deleted successfully");
      setOpenMenu(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  /*
   * CLEAR FILTERS
   */

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("All");
    setStatusFilter("All");
  };

  /*
   * RENDER
   */

  const passwordModalText = getPasswordModalText();

  return (
    <>
      <div
        className="space-y-6"
        onClick={() => {
          if (openMenu) setOpenMenu(null);
        }}
      >
        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-indigo-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">Users</h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage system users, roles, departments and access status.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openAddModal();
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {totalUsers}
                </p>
              </div>

              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                <UsersIcon />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {activeUsers}
                </p>
              </div>

              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Inactive Users
                </p>
                <p className="text-2xl font-bold text-rose-600 mt-1">
                  {inactiveUsers}
                </p>
              </div>

              <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
                <UserX className="w-5 h-5 text-rose-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Administrators
                </p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {adminUsers}
                </p>
              </div>

              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* FILTERS */}

        <section className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Search by name, email or department..."
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="lg:w-52 px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
              >
                <option value="All">All Roles</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="lg:w-40 px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
              >
                <option value="All">All Status</option>
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

              {(search || roleFilter !== "All" || statusFilter !== "All") && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFilters();
                  }}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="px-4 pb-4">
            <p className="text-xs text-slate-400">
              Showing{" "}
              <span className="font-semibold text-slate-600">
                {filteredUsers.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-600">
                {visibleUsers.length}
              </span>{" "}
              users
            </p>
          </div>
        </section>

        {/* USERS */}

        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 px-5 text-center">
              <div className="w-8 h-8 mx-auto border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="mt-4 text-sm text-slate-500">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 px-5 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center">
                <User className="w-6 h-6 text-slate-400" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-700">
                No users found
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                {visibleUsers.length === 0
                  ? "No users have been added yet. Click Add User to create one."
                  : "Try changing your search or filter options."}
              </p>

              {visibleUsers.length === 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openAddModal();
                  }}
                  className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Add First User
                </button>
              )}
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}

              <div className="hidden xl:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100">
                      <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        User
                      </th>
                      <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Email
                      </th>
                      <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Role
                      </th>
                      <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Department
                      </th>
                      <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                      <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Created
                      </th>
                      <th className="w-12" />
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                              <span className="text-xs font-semibold text-indigo-600">
                                {getInitials(user.name)}
                              </span>
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-800">
                                {user.name}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {user._id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-4">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs text-slate-600">
                              {user.email}
                            </span>
                          </div>
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-medium ${getRoleStyle(user.role)}`}
                          >
                            {getRoleLabel(user.role)}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          {user.role === "department" ? (
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-xs text-slate-600">
                                {getDepartmentName(user)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>

                        <td className="px-3 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${
                              user.status === "active"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                user.status === "active"
                                  ? "bg-emerald-500"
                                  : "bg-rose-500"
                              }`}
                            />
                            {getStatusLabel(user.status)}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          <span className="text-xs text-slate-500">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )
                              : "-"}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          <div className="relative">
                            <button
                              type="button"
                              disabled={actionLoading === user._id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenu(
                                  openMenu === user._id ? null : user._id,
                                );
                              }}
                              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {openMenu === user._id && (
                              <ActionMenu
                                user={user}
                                onEdit={requestEditUser}
                                onToggle={requestToggleUserStatus}
                                onDelete={requestDeleteUser}
                                loading={actionLoading === user._id}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE / TABLET */}

              <div className="xl:hidden p-4 space-y-3">
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-indigo-600">
                            {getInitials(user.name)}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {user.name}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 break-all">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="relative">
                        <button
                          type="button"
                          disabled={actionLoading === user._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenu(
                              openMenu === user._id ? null : user._id,
                            );
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openMenu === user._id && (
                          <ActionMenu
                            user={user}
                            onEdit={requestEditUser}
                            onToggle={requestToggleUserStatus}
                            onDelete={requestDeleteUser}
                            loading={actionLoading === user._id}
                          />
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">
                          Role
                        </p>
                        <div className="mt-1">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full border text-[10px] font-medium ${getRoleStyle(user.role)}`}
                          >
                            {getRoleLabel(user.role)}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">
                          Department
                        </p>
                        <div className="mt-1 flex items-center gap-1.5">
                          {user.role === "department" ? (
                            <>
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-xs text-slate-600">
                                {getDepartmentName(user)}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">
                          Status
                        </p>
                        <div className="mt-1">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${
                              user.status === "active"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                user.status === "active"
                                  ? "bg-emerald-500"
                                  : "bg-rose-500"
                              }`}
                            />
                            {getStatusLabel(user.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <span className="text-[10px] text-slate-400">
                        Created{" "}
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "-"}
                      </span>

                      <span className="text-[10px] text-slate-400 break-all">
                        {user._id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {/* TEMPORARY ADMIN PASSWORD VERIFICATION MODAL */}

      {showPasswordModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closePasswordModal}
          />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-indigo-600" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {passwordModalText.title}
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    {passwordModalText.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closePasswordModal}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifyPassword}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Administrator Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={adminPassword}
                      onChange={(e) => {
                        setAdminPassword(e.target.value);
                        setPasswordError("");
                      }}
                      placeholder="Enter administrator password"
                      autoComplete="current-password"
                      autoFocus
                      className={`w-full px-3 py-2.5 pr-16 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 ${
                        passwordError
                          ? "border-rose-400 focus:border-rose-500"
                          : "border-slate-200 focus:border-indigo-500"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {passwordError && (
                    <p className="text-xs text-rose-500 mt-2">
                      {passwordError}
                    </p>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <p className="text-xs text-amber-700 leading-relaxed">
                    {passwordModalText.message}
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Verify & Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingUser ? "Edit User" : "Add User"}
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  {editingUser
                    ? "Update user information, department and access settings."
                    : "Create a new system user and assign their department."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-5">
                {/* NAME */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Full Name
                    <span className="text-rose-500 ml-1">*</span>
                  </label>

                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Enter full name"
                    disabled={submitting}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:bg-slate-50"
                  />
                </div>

                {/* EMAIL */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email Address
                    <span className="text-rose-500 ml-1">*</span>
                  </label>

                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="user@example.com"
                    disabled={submitting}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:bg-slate-50"
                  />
                </div>

                {/* PASSWORD */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {editingUser ? "New Password" : "Password"}
                    {!editingUser && (
                      <span className="text-rose-500 ml-1">*</span>
                    )}
                  </label>

                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder={
                      editingUser
                        ? "Leave blank to keep current password"
                        : "Minimum 6 characters"
                    }
                    minLength={6}
                    autoComplete="new-password"
                    disabled={submitting}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:bg-slate-50"
                  />

                  {editingUser && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      Leave blank if you do not want to change the password.
                    </p>
                  )}
                </div>

                {/* ROLE */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Role
                  </label>

                  <select
                    value={formData.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                    disabled={submitting}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 disabled:bg-slate-50"
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DEPARTMENT */}

                {formData.role === "department" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Department
                      <span className="text-rose-500 ml-1">*</span>
                    </label>

                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                      <select
                        value={formData.department}
                        onChange={(e) =>
                          handleChange("department", e.target.value)
                        }
                        disabled={submitting || departments.length === 0}
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 disabled:bg-slate-50"
                      >
                        <option value="">
                          {departments.length === 0
                            ? "No departments available"
                            : "Select department"}
                        </option>

                        {departments.map((department) => (
                          <option key={department._id} value={department._id}>
                            {department.name}
                            {department.code ? ` (${department.code})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {departments.length === 0 && (
                      <p className="text-[10px] text-rose-500 mt-1">
                        Create a department before assigning this user.
                      </p>
                    )}
                  </div>
                )}

                {/* STATUS */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Account Status
                  </label>

                  <select
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    disabled={submitting}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 disabled:bg-slate-50"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ACCESS INFO */}

                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                  <div className="flex items-start gap-3">
                    <Shield className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />

                    <div>
                      <p className="text-xs font-semibold text-indigo-900">
                        Access Information
                      </p>

                      <p className="text-[11px] text-indigo-600 mt-1 leading-relaxed">
                        Administrator users have full system access. Store users
                        manage inventory and store operations. Department users
                        are assigned to a specific department and have access to
                        department-related functionality.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : editingUser ? (
                    <>
                      <Edit3 className="w-4 h-4" />
                      Update User
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Add User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

/*
 * ACTION MENU
 */

const ActionMenu = ({ user, onEdit, onToggle, onDelete, loading }) => {
  return (
    <div
      className="absolute right-0 top-9 z-50 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* EDIT */}

      <button
        type="button"
        onClick={() => onEdit(user)}
        disabled={loading}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50"
      >
        <Edit3 className="w-4 h-4 text-slate-400" />
        Edit User
      </button>

      {/* TOGGLE STATUS */}

      <button
        type="button"
        onClick={() => onToggle(user)}
        disabled={loading}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50"
      >
        {user.status === "active" ? (
          <>
            <UserX className="w-4 h-4 text-rose-400" />
            Deactivate
          </>
        ) : (
          <>
            <UserCheck className="w-4 h-4 text-emerald-500" />
            Activate
          </>
        )}
      </button>

      <div className="border-t border-slate-100 my-1" />

      {/* DELETE */}

      <button
        type="button"
        onClick={() => onDelete(user)}
        disabled={loading}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-rose-600 hover:bg-rose-50 disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
        Delete User
      </button>
    </div>
  );
};

/*
 * USERS ICON
 */

const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-indigo-600"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default Users;
