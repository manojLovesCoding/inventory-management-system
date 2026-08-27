import React, { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const initialDepartments = [
  {
    id: "DEPT-001",
    code: "BCA",
    name: "Computer Applications",
    hod: "Dr. Ramesh Kumar",
    email: "bca@gfgcraichur.edu.in",
    phone: "9876543210",
    location: "Block A - First Floor",
    students: 320,
    requests: 12,
    status: "Active",
  },
  {
    id: "DEPT-002",
    code: "BBA",
    name: "Business Administration",
    hod: "Dr. Anitha Rao",
    email: "bba@gfgcraichur.edu.in",
    phone: "9876543211",
    location: "Block B - First Floor",
    students: 280,
    requests: 8,
    status: "Active",
  },
  {
    id: "DEPT-003",
    code: "BCOM",
    name: "Commerce",
    hod: "Dr. Mahesh Patil",
    email: "bcom@gfgcraichur.edu.in",
    phone: "9876543212",
    location: "Block A - Ground Floor",
    students: 410,
    requests: 15,
    status: "Active",
  },
  {
    id: "DEPT-004",
    code: "BA",
    name: "Arts",
    hod: "Dr. Sunitha Devi",
    email: "arts@gfgcraichur.edu.in",
    phone: "9876543213",
    location: "Block C - First Floor",
    students: 360,
    requests: 6,
    status: "Active",
  },
  {
    id: "DEPT-005",
    code: "SCI",
    name: "Science",
    hod: "Dr. Prakash Rao",
    email: "science@gfgcraichur.edu.in",
    phone: "9876543214",
    location: "Science Block",
    students: 295,
    requests: 10,
    status: "Active",
  },
  {
    id: "DEPT-006",
    code: "LIB",
    name: "Library & Information Science",
    hod: "Prof. Kavitha Sharma",
    email: "library@gfgcraichur.edu.in",
    phone: "9876543215",
    location: "Library Building",
    students: 85,
    requests: 4,
    status: "Inactive",
  },
];

const emptyForm = {
  name: "",
  code: "",
  hod: "",
  email: "",
  phone: "",
  location: "",
  students: "",
  status: "Active",
};

const Departments = () => {
  const [departments, setDepartments] = useState(initialDepartments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return departments.filter((department) => {
      const matchesSearch =
        !query ||
        department.name.toLowerCase().includes(query) ||
        department.code.toLowerCase().includes(query) ||
        department.hod.toLowerCase().includes(query) ||
        department.location.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        department.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [departments, search, statusFilter]);

  const totalStudents = useMemo(() => {
    return departments.reduce(
      (sum, department) => sum + Number(department.students || 0),
      0
    );
  }, [departments]);

  const activeDepartments = departments.filter(
    (department) => department.status === "Active"
  ).length;

  const totalRequests = useMemo(() => {
    return departments.reduce(
      (sum, department) => sum + Number(department.requests || 0),
      0
    );
  }, [departments]);

  const openAddModal = () => {
    setEditingDepartment(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (department) => {
    setEditingDepartment(department);

    setForm({
      name: department.name,
      code: department.code,
      hod: department.hod,
      email: department.email,
      phone: department.phone,
      location: department.location,
      students: department.students,
      status: department.status,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDepartment(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Department name is required");
      return;
    }

    if (!form.code.trim()) {
      toast.error("Department code is required");
      return;
    }

    if (!form.hod.trim()) {
      toast.error("Head of Department is required");
      return;
    }

    if (!form.email.trim()) {
      toast.error("Department email is required");
      return;
    }

    if (!form.phone.trim()) {
      toast.error("Contact number is required");
      return;
    }

    if (!form.location.trim()) {
      toast.error("Department location is required");
      return;
    }

    const duplicateCode = departments.some(
      (department) =>
        department.code.toLowerCase() === form.code.trim().toLowerCase() &&
        department.id !== editingDepartment?.id
    );

    if (duplicateCode) {
      toast.error("Department code already exists");
      return;
    }

    if (editingDepartment) {
      setDepartments((prev) =>
        prev.map((department) =>
          department.id === editingDepartment.id
            ? {
                ...department,
                name: form.name.trim(),
                code: form.code.trim().toUpperCase(),
                hod: form.hod.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                location: form.location.trim(),
                students: Number(form.students) || 0,
                status: form.status,
              }
            : department
        )
      );

      toast.success("Department updated successfully");
    } else {
      const newDepartment = {
        id: `DEPT-${String(departments.length + 1).padStart(3, "0")}`,
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        hod: form.hod.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        location: form.location.trim(),
        students: Number(form.students) || 0,
        requests: 0,
        status: form.status,
      };

      setDepartments((prev) => [...prev, newDepartment]);

      toast.success("Department added successfully");
    }

    closeModal();
  };

  const handleDelete = (department) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${department.name}"?`
    );

    if (!confirmed) return;

    setDepartments((prev) =>
      prev.filter((item) => item.id !== department.id)
    );

    toast.success("Department deleted successfully");
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
  };

  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Departments
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Manage college departments and their basic information.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Department
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Total Departments
                </p>

                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {departments.length}
                </p>
              </div>

              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Active Departments
                </p>

                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {activeDepartments}
                </p>
              </div>

              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Total Students
                </p>

                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {totalStudents.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Pending Requests
                </p>

                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {totalRequests}
                </p>
              </div>

              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="p-4 flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search department, code, HOD or location..."
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full lg:w-44 px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {(search || statusFilter !== "All") && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </section>

        {/* DEPARTMENT LIST */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Department Directory
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                {filteredDepartments.length} department
                {filteredDepartments.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>

          {filteredDepartments.length === 0 ? (
            <div className="py-16 px-5 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-slate-400" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-700">
                No departments found
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Try changing your search or filter.
              </p>

              {(search || statusFilter !== "All") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Clear Filters
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
                        Department
                      </th>

                      <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Head of Department
                      </th>

                      <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Contact
                      </th>

                      <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Location
                      </th>

                      <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Students
                      </th>

                      <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Requests
                      </th>

                      <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredDepartments.map((department) => (
                      <tr
                        key={department.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                              <Building2 className="w-4 h-4 text-indigo-600" />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-800">
                                {department.name}
                              </p>

                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {department.id} · {department.code}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <p className="text-sm text-slate-700">
                            {department.hod}
                          </p>

                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Head of Department
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span>{department.email}</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{department.phone}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{department.location}</span>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span className="text-sm font-semibold text-slate-700">
                            {Number(department.students).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex min-w-7 justify-center px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-semibold">
                            {department.requests}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                              department.status === "Active"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                department.status === "Active"
                                  ? "bg-emerald-500"
                                  : "bg-slate-400"
                              }`}
                            />
                            {department.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEditModal(department)}
                              className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Edit Department"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(department)}
                              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Department"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE / TABLET CARDS */}
              <div className="xl:hidden p-4 space-y-4">
                {filteredDepartments.map((department) => (
                  <div
                    key={department.id}
                    className="border border-slate-200 rounded-xl p-4"
                  >
                    {/* CARD HEADER */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-indigo-600" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800">
                            {department.name}
                          </p>

                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {department.id} · {department.code}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          department.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            department.status === "Active"
                              ? "bg-emerald-500"
                              : "bg-slate-400"
                          }`}
                        />
                        {department.status}
                      </span>
                    </div>

                    {/* HOD */}
                    <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                        Head of Department
                      </p>

                      <p className="text-sm font-medium text-slate-700 mt-1">
                        {department.hod}
                      </p>
                    </div>

                    {/* DETAILS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      <div className="flex items-start gap-2">
                        <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />

                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-400">
                            Email
                          </p>

                          <p className="text-xs text-slate-600 break-all mt-0.5">
                            {department.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />

                        <div>
                          <p className="text-[10px] text-slate-400">
                            Phone
                          </p>

                          <p className="text-xs text-slate-600 mt-0.5">
                            {department.phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 sm:col-span-2">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />

                        <div>
                          <p className="text-[10px] text-slate-400">
                            Location
                          </p>

                          <p className="text-xs text-slate-600 mt-0.5">
                            {department.location}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                        <p className="text-[10px] text-blue-500">
                          Students
                        </p>

                        <p className="text-lg font-bold text-blue-700 mt-0.5">
                          {Number(department.students).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                        <p className="text-[10px] text-amber-500">
                          Item Requests
                        </p>

                        <p className="text-lg font-bold text-amber-700 mt-0.5">
                          {department.requests}
                        </p>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => openEditModal(department)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(department)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
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
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* HEADER */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingDepartment
                    ? "Edit Department"
                    : "Add Department"}
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  {editingDepartment
                    ? "Update department information."
                    : "Enter the details of the new department."}
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
            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto"
            >
              <div className="p-6 space-y-5">
                {/* DEPARTMENT NAME + CODE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Department Name
                      <span className="text-rose-500 ml-1">*</span>
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Computer Applications"
                      required
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Department Code
                      <span className="text-rose-500 ml-1">*</span>
                    </label>

                    <input
                      type="text"
                      name="code"
                      value={form.code}
                      onChange={handleChange}
                      placeholder="e.g. BCA"
                      required
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm uppercase outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>

                {/* HOD */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Head of Department
                    <span className="text-rose-500 ml-1">*</span>
                  </label>

                  <input
                    type="text"
                    name="hod"
                    value={form.hod}
                    onChange={handleChange}
                    placeholder="e.g. Dr. Ramesh Kumar"
                    required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>

                {/* EMAIL + PHONE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Department Email
                      <span className="text-rose-500 ml-1">*</span>
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="department@example.com"
                      required
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Contact Number
                      <span className="text-rose-500 ml-1">*</span>
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      maxLength={10}
                      required
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>

                {/* LOCATION */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Location
                    <span className="text-rose-500 ml-1">*</span>
                  </label>

                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Block A - First Floor"
                    required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>

                {/* STUDENTS + STATUS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Student Count
                    </label>

                    <input
                      type="number"
                      name="students"
                      value={form.students}
                      onChange={handleChange}
                      min="0"
                      placeholder="0"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Status
                    </label>

                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* INFO */}
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-indigo-900">
                        Department Information
                      </p>

                      <p className="text-[11px] text-indigo-600 mt-1 leading-relaxed">
                        Department details are used when assigning inventory
                        requests and managing college resources.
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
                  className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
                >
                  {editingDepartment ? (
                    <>
                      <Edit3 className="w-4 h-4" />
                      Update Department
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Department
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

export default Departments;