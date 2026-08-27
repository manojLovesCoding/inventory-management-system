import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
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
} from "lucide-react";
import toast from "react-hot-toast";

const initialUsers = [
  {
    id: "USR-001",
    name: "Admin User",
    email: "admin@gfgcraichur.ac.in",
    phone: "9876543210",
    role: "Administrator",
    department: "Administration",
    status: "Active",
    joinedDate: "2025-06-10",
  },
  {
    id: "USR-002",
    name: "Dr. Ramesh Kumar",
    email: "ramesh.kumar@gfgcraichur.ac.in",
    phone: "9845123456",
    role: "Principal",
    department: "Administration",
    status: "Active",
    joinedDate: "2024-07-15",
  },
  {
    id: "USR-003",
    name: "Suresh Babu",
    email: "suresh.babu@gfgcraichur.ac.in",
    phone: "9900123456",
    role: "Inventory Manager",
    department: "Stores",
    status: "Active",
    joinedDate: "2025-01-12",
  },
  {
    id: "USR-004",
    name: "Priya Sharma",
    email: "priya.sharma@gfgcraichur.ac.in",
    phone: "9988776655",
    role: "Department Head",
    department: "Computer Science",
    status: "Active",
    joinedDate: "2024-08-20",
  },
  {
    id: "USR-005",
    name: "Mahesh Gowda",
    email: "mahesh.gowda@gfgcraichur.ac.in",
    phone: "9911223344",
    role: "Staff",
    department: "Commerce",
    status: "Inactive",
    joinedDate: "2024-09-05",
  },
  {
    id: "USR-006",
    name: "Anita Reddy",
    email: "anita.reddy@gfgcraichur.ac.in",
    phone: "9876543211",
    role: "Department Head",
    department: "Science",
    status: "Active",
    joinedDate: "2025-02-18",
  },
];

const roles = [
  "Administrator",
  "Principal",
  "Inventory Manager",
  "Department Head",
  "Staff",
];

const departments = [
  "Administration",
  "Stores",
  "Computer Science",
  "Commerce",
  "Science",
  "Arts",
];

const statusOptions = ["Active", "Inactive"];

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  role: "Staff",
  department: "Administration",
  status: "Active",
};

const Users = () => {
  const [users, setUsers] = useState(initialUsers);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [openMenu, setOpenMenu] = useState(null);

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query) ||
        user.department.toLowerCase().includes(query);

      const matchesRole =
        roleFilter === "All" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.status === "Active"
  ).length;

  const inactiveUsers = users.filter(
    (user) => user.status === "Inactive"
  ).length;

  const adminUsers = users.filter(
    (user) => user.role === "Administrator"
  ).length;

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .split(" ")
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  const getRoleStyle = (role) => {
    switch (role) {
      case "Administrator":
        return "bg-purple-50 text-purple-700 border-purple-100";

      case "Principal":
        return "bg-blue-50 text-blue-700 border-blue-100";

      case "Inventory Manager":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";

      case "Department Head":
        return "bg-amber-50 text-amber-700 border-amber-100";

      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData(emptyForm);
    setShowModal(true);
    setOpenMenu(null);
  };

  const openEditModal = (user) => {
    setEditingUser(user);

    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      department: user.department,
      status: user.status,
    });

    setShowModal(true);
    setOpenMenu(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData(emptyForm);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter user name");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter email address");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("Please enter phone number");
      return;
    }

    if (editingUser) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                ...formData,
              }
            : user
        )
      );

      toast.success("User updated successfully");
    } else {
      const newUser = {
        id: `USR-${String(users.length + 1).padStart(3, "0")}`,
        ...formData,
        joinedDate: new Date().toISOString().split("T")[0],
      };

      setUsers((prev) => [newUser, ...prev]);

      toast.success("User added successfully");
    }

    closeModal();
  };

  const toggleUserStatus = (userId) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? {
              ...user,
              status:
                user.status === "Active" ? "Inactive" : "Active",
            }
          : user
      )
    );

    const target = users.find((user) => user.id === userId);

    if (target) {
      toast.success(
        target.status === "Active"
          ? "User deactivated"
          : "User activated"
      );
    }

    setOpenMenu(null);
  };

  const deleteUser = (userId) => {
    const target = users.find((user) => user.id === userId);

    if (!target) return;

    if (target.role === "Administrator") {
      toast.error("Administrator users cannot be deleted");
      setOpenMenu(null);
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${target.name}?`
    );

    if (!confirmed) return;

    setUsers((prev) => prev.filter((user) => user.id !== userId));

    toast.success("User deleted successfully");
    setOpenMenu(null);
  };

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("All");
    setStatusFilter("All");
  };

  return (
    <>
      <div
        className="space-y-6"
        onClick={() => openMenu && setOpenMenu(null)}
      >
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-indigo-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Users
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Manage system users, roles and access status.
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
              {/* SEARCH */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Search by name, email, ID or department..."
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              {/* ROLE */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="lg:w-52 px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
              >
                <option value="All">All Roles</option>

                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              {/* STATUS */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="lg:w-40 px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
              >
                <option value="All">All Status</option>

                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              {(search ||
                roleFilter !== "All" ||
                statusFilter !== "All") && (
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

          {/* RESULT COUNT */}
          <div className="px-4 pb-4">
            <p className="text-xs text-slate-400">
              Showing{" "}
              <span className="font-semibold text-slate-600">
                {filteredUsers.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-600">
                {users.length}
              </span>{" "}
              users
            </p>
          </div>
        </section>

        {/* DESKTOP TABLE */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="py-16 px-5 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center">
                <User className="w-6 h-6 text-slate-400" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-700">
                No users found
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Try changing your search or filter options.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden xl:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100">
                      <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        User
                      </th>

                      <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Contact
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
                        Joined
                      </th>

                      <th className="w-12" />
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        {/* USER */}
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
                                {user.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* CONTACT */}
                        <td className="px-3 py-4">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />

                              <span className="text-xs text-slate-600">
                                {user.email}
                              </span>
                            </div>

                            <p className="text-[10px] text-slate-400 mt-1 pl-5">
                              +91 {user.phone}
                            </p>
                          </div>
                        </td>

                        {/* ROLE */}
                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-medium ${getRoleStyle(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </td>

                        {/* DEPARTMENT */}
                        <td className="px-3 py-4">
                          <span className="text-xs text-slate-600">
                            {user.department}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="px-3 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${
                              user.status === "Active"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                user.status === "Active"
                                  ? "bg-emerald-500"
                                  : "bg-rose-500"
                              }`}
                            />

                            {user.status}
                          </span>
                        </td>

                        {/* DATE */}
                        <td className="px-3 py-4">
                          <span className="text-xs text-slate-500">
                            {new Date(
                              user.joinedDate
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-3 py-4">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenu(
                                  openMenu === user.id
                                    ? null
                                    : user.id
                                );
                              }}
                              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {openMenu === user.id && (
                              <ActionMenu
                                user={user}
                                onEdit={openEditModal}
                                onToggle={toggleUserStatus}
                                onDelete={deleteUser}
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
                    key={user.id}
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

                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {user.id}
                          </p>
                        </div>
                      </div>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenu(
                              openMenu === user.id
                                ? null
                                : user.id
                            );
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openMenu === user.id && (
                          <ActionMenu
                            user={user}
                            onEdit={openEditModal}
                            onToggle={toggleUserStatus}
                            onDelete={deleteUser}
                          />
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">
                          Email
                        </p>

                        <p className="text-xs text-slate-600 mt-1 break-all">
                          {user.email}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">
                          Phone
                        </p>

                        <p className="text-xs text-slate-600 mt-1">
                          +91 {user.phone}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">
                          Role
                        </p>

                        <div className="mt-1">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full border text-[10px] font-medium ${getRoleStyle(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">
                          Department
                        </p>

                        <p className="text-xs text-slate-600 mt-1">
                          {user.department}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${
                          user.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status === "Active"
                              ? "bg-emerald-500"
                              : "bg-rose-500"
                          }`}
                        />

                        {user.status}
                      </span>

                      <span className="text-[10px] text-slate-400">
                        Joined{" "}
                        {new Date(
                          user.joinedDate
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* OVERLAY */}
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* MODAL */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* HEADER */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingUser ? "Edit User" : "Add User"}
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  {editingUser
                    ? "Update user information and access settings."
                    : "Create a new system user."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORM */}
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
                    onChange={(e) =>
                      handleChange("name", e.target.value)
                    }
                    placeholder="Enter full name"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
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
                    onChange={(e) =>
                      handleChange("email", e.target.value)
                    }
                    placeholder="user@example.com"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>

                {/* PHONE */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Phone Number
                    <span className="text-rose-500 ml-1">*</span>
                  </label>

                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 border-slate-200 rounded-l-lg bg-slate-50 text-sm text-slate-500">
                      +91
                    </span>

                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleChange(
                          "phone",
                          e.target.value.replace(/\D/g, "").slice(0, 10)
                        )
                      }
                      placeholder="9876543210"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-r-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>

                {/* ROLE + DEPARTMENT */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Role
                    </label>

                    <select
                      value={formData.role}
                      onChange={(e) =>
                        handleChange("role", e.target.value)
                      }
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Department
                    </label>

                    <select
                      value={formData.department}
                      onChange={(e) =>
                        handleChange(
                          "department",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
                    >
                      {departments.map((department) => (
                        <option
                          key={department}
                          value={department}
                        >
                          {department}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* STATUS */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Account Status
                  </label>

                  <select
                    value={formData.status}
                    onChange={(e) =>
                      handleChange("status", e.target.value)
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* INFO */}
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                  <div className="flex items-start gap-3">
                    <Shield className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />

                    <div>
                      <p className="text-xs font-semibold text-indigo-900">
                        Access Information
                      </p>

                      <p className="text-[11px] text-indigo-600 mt-1 leading-relaxed">
                        User permissions can be managed according
                        to the selected role. Administrator users
                        have access to all system modules.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
                >
                  {editingUser ? (
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

/* --------------------------------------------------
   ACTION MENU
-------------------------------------------------- */

const ActionMenu = ({
  user,
  onEdit,
  onToggle,
  onDelete,
}) => {
  return (
    <div
      className="absolute right-0 top-9 z-50 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => onEdit(user)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-600 hover:bg-slate-50"
      >
        <Edit3 className="w-4 h-4 text-slate-400" />
        Edit User
      </button>

      <button
        type="button"
        onClick={() => onToggle(user.id)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-600 hover:bg-slate-50"
      >
        {user.status === "Active" ? (
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

      <button
        type="button"
        onClick={() => onDelete(user.id)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-rose-600 hover:bg-rose-50"
      >
        <Trash2 className="w-4 h-4" />
        Delete User
      </button>
    </div>
  );
};

/* --------------------------------------------------
   SMALL ICON COMPONENT
-------------------------------------------------- */

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