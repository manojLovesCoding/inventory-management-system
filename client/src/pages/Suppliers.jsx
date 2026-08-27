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
  Truck,
  User,
  X,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const initialSuppliers = [
  {
    id: "SUP-001",
    name: "ABC Office Solutions",
    contactPerson: "Rajesh Kumar",
    phone: "9876543210",
    email: "sales@abcoffice.com",
    gstin: "29ABCDE1234F1Z5",
    address: "MG Road, Bengaluru, Karnataka",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    status: "Active",
    createdAt: "2026-01-10",
  },
  {
    id: "SUP-002",
    name: "Bharat Electronics Suppliers",
    contactPerson: "Suresh Rao",
    phone: "9845123456",
    email: "contact@bharatelectronics.in",
    gstin: "29BCDEF2345G1Z6",
    address: "Peenya Industrial Area, Bengaluru, Karnataka",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560058",
    status: "Active",
    createdAt: "2026-01-15",
  },
  {
    id: "SUP-003",
    name: "Digital Systems India",
    contactPerson: "Arun Sharma",
    phone: "9988776655",
    email: "info@digitalsystems.in",
    gstin: "29CDEFG3456H1Z7",
    address: "Commercial Street, Bengaluru, Karnataka",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    status: "Active",
    createdAt: "2026-02-02",
  },
  {
    id: "SUP-004",
    name: "Karnataka Stationery Mart",
    contactPerson: "Manjunath B",
    phone: "9900123456",
    email: "orders@kstnmart.com",
    gstin: "29DEFGH4567J1Z8",
    address: "Station Road, Raichur, Karnataka",
    city: "Raichur",
    state: "Karnataka",
    pincode: "584101",
    status: "Active",
    createdAt: "2026-02-18",
  },
  {
    id: "SUP-005",
    name: "National Furniture Works",
    contactPerson: "Vijay Kumar",
    phone: "9812345678",
    email: "sales@nationalfurniture.in",
    gstin: "29EFGHI5678K1Z9",
    address: "Industrial Estate, Hubballi, Karnataka",
    city: "Hubballi",
    state: "Karnataka",
    pincode: "580030",
    status: "Inactive",
    createdAt: "2026-03-05",
  },
];

const emptyForm = {
  name: "",
  contactPerson: "",
  phone: "",
  email: "",
  gstin: "",
  address: "",
  city: "",
  state: "Karnataka",
  pincode: "",
  status: "Active",
};

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState(initialSuppliers);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [showDetails, setShowDetails] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const filteredSuppliers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return suppliers.filter((supplier) => {
      const matchesSearch =
        !query ||
        supplier.name.toLowerCase().includes(query) ||
        supplier.id.toLowerCase().includes(query) ||
        supplier.contactPerson.toLowerCase().includes(query) ||
        supplier.phone.includes(query) ||
        supplier.gstin.toLowerCase().includes(query) ||
        supplier.city.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        supplier.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [suppliers, search, statusFilter]);

  const totalSuppliers = suppliers.length;

  const activeSuppliers = suppliers.filter(
    (supplier) => supplier.status === "Active"
  ).length;

  const inactiveSuppliers = suppliers.filter(
    (supplier) => supplier.status === "Inactive"
  ).length;

  const openAddModal = () => {
    setEditingSupplier(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);

    setForm({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email,
      gstin: supplier.gstin,
      address: supplier.address,
      city: supplier.city,
      state: supplier.state,
      pincode: supplier.pincode,
      status: supplier.status,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateSupplierId = () => {
    const nextNumber =
      suppliers.reduce((max, supplier) => {
        const number = Number(
          supplier.id.replace("SUP-", "")
        );

        return Math.max(max, number || 0);
      }, 0) + 1;

    return `SUP-${String(nextNumber).padStart(3, "0")}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Supplier name is required");
      return;
    }

    if (!form.contactPerson.trim()) {
      toast.error("Contact person is required");
      return;
    }

    if (!form.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.phone.trim())) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      toast.error("Enter a valid email address");
      return;
    }

    if (!form.gstin.trim()) {
      toast.error("GSTIN is required");
      return;
    }

    if (form.gstin.trim().length !== 15) {
      toast.error("GSTIN must contain 15 characters");
      return;
    }

    if (!form.address.trim()) {
      toast.error("Address is required");
      return;
    }

    if (!form.city.trim()) {
      toast.error("City is required");
      return;
    }

    if (!form.pincode.trim()) {
      toast.error("PIN code is required");
      return;
    }

    if (!/^[0-9]{6}$/.test(form.pincode.trim())) {
      toast.error("Enter a valid 6-digit PIN code");
      return;
    }

    if (editingSupplier) {
      setSuppliers((prev) =>
        prev.map((supplier) =>
          supplier.id === editingSupplier.id
            ? {
                ...supplier,
                ...form,
                name: form.name.trim(),
                contactPerson: form.contactPerson.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                gstin: form.gstin.trim().toUpperCase(),
                address: form.address.trim(),
                city: form.city.trim(),
                state: form.state.trim(),
                pincode: form.pincode.trim(),
              }
            : supplier
        )
      );

      toast.success("Supplier updated successfully");
    } else {
      const newSupplier = {
        id: generateSupplierId(),
        ...form,
        name: form.name.trim(),
        contactPerson: form.contactPerson.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        gstin: form.gstin.trim().toUpperCase(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        createdAt: new Date()
          .toISOString()
          .split("T")[0],
      };

      setSuppliers((prev) => [
        ...prev,
        newSupplier,
      ]);

      toast.success("Supplier added successfully");
    }

    closeModal();
  };

  const handleDelete = (supplier) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${supplier.name}"?`
    );

    if (!confirmed) return;

    setSuppliers((prev) =>
      prev.filter(
        (item) => item.id !== supplier.id
      )
    );

    if (
      selectedSupplier?.id === supplier.id
    ) {
      setSelectedSupplier(null);
      setShowDetails(false);
    }

    toast.success("Supplier deleted successfully");
  };

  const toggleStatus = (supplier) => {
    const newStatus =
      supplier.status === "Active"
        ? "Inactive"
        : "Active";

    setSuppliers((prev) =>
      prev.map((item) =>
        item.id === supplier.id
          ? {
              ...item,
              status: newStatus,
            }
          : item
      )
    );

    toast.success(
      `Supplier marked as ${newStatus.toLowerCase()}`
    );
  };

  const openDetails = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setSelectedSupplier(null);
    setShowDetails(false);
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Truck className="w-5 h-5 text-indigo-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Suppliers
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Manage suppliers and vendor information.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Supplier
          </button>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* TOTAL */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Total Suppliers
                </p>

                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {totalSuppliers}
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* ACTIVE */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Active Suppliers
                </p>

                <p className="text-2xl font-bold text-emerald-600 mt-2">
                  {activeSuppliers}
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* INACTIVE */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Inactive Suppliers
                </p>

                <p className="text-2xl font-bold text-slate-600 mt-2">
                  {inactiveSuppliers}
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-slate-500" />
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CARD */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* FILTER HEADER */}
          <div className="p-5 border-b border-slate-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Supplier Directory
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  View and manage registered suppliers.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* SEARCH */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search suppliers..."
                    className="w-full sm:w-72 pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>

                {/* STATUS */}
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
                >
                  <option value="All">
                    All Status
                  </option>

                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* EMPTY */}
          {filteredSuppliers.length === 0 ? (
            <div className="py-16 px-5 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center">
                <Truck className="w-6 h-6 text-slate-400" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-700">
                No suppliers found
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Try changing your search or filter.
              </p>

              {(search ||
                statusFilter !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All");
                  }}
                  className="mt-4 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Clear filters
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
                        Supplier
                      </th>

                      <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Contact
                      </th>

                      <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        GSTIN
                      </th>

                      <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Location
                      </th>

                      <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredSuppliers.map(
                      (supplier) => (
                        <tr
                          key={supplier.id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          {/* SUPPLIER */}
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() =>
                                openDetails(
                                  supplier
                                )
                              }
                              className="flex items-center gap-3 text-left"
                            >
                              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-indigo-600">
                                  {getInitials(
                                    supplier.name
                                  )}
                                </span>
                              </div>

                              <div>
                                <p className="text-sm font-medium text-slate-800 hover:text-indigo-600">
                                  {supplier.name}
                                </p>

                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  {supplier.id}
                                </p>
                              </div>
                            </button>
                          </td>

                          {/* CONTACT */}
                          <td className="px-3 py-4">
                            <p className="text-xs font-medium text-slate-700">
                              {
                                supplier.contactPerson
                              }
                            </p>

                            <p className="text-[11px] text-slate-400 mt-1">
                              {supplier.phone}
                            </p>
                          </td>

                          {/* GSTIN */}
                          <td className="px-3 py-4">
                            <span className="text-xs font-medium text-slate-600">
                              {supplier.gstin}
                            </span>
                          </td>

                          {/* LOCATION */}
                          <td className="px-3 py-4">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />

                              <span className="text-xs text-slate-600">
                                {supplier.city},{" "}
                                {supplier.state}
                              </span>
                            </div>
                          </td>

                          {/* STATUS */}
                          <td className="px-3 py-4 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                toggleStatus(
                                  supplier
                                )
                              }
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                                supplier.status ===
                                "Active"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  supplier.status ===
                                  "Active"
                                    ? "bg-emerald-500"
                                    : "bg-slate-400"
                                }`}
                              />

                              {
                                supplier.status
                              }
                            </button>
                          </td>

                          {/* ACTIONS */}
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  openDetails(
                                    supplier
                                  )
                                }
                                className="px-2.5 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                              >
                                View
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(
                                    supplier
                                  )
                                }
                                className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    supplier
                                  )
                                }
                                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE / TABLET */}
              <div className="xl:hidden p-4 space-y-3">
                {filteredSuppliers.map(
                  (supplier) => (
                    <div
                      key={supplier.id}
                      className="border border-slate-200 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            openDetails(
                              supplier
                            )
                          }
                          className="flex items-center gap-3 text-left min-w-0"
                        >
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-indigo-600">
                              {getInitials(
                                supplier.name
                              )}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {supplier.name}
                            </p>

                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {supplier.id}
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(
                              supplier
                            )
                          }
                          className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400 shrink-0" />

                          <div className="min-w-0">
                            <p className="text-[10px] text-slate-400">
                              Contact Person
                            </p>

                            <p className="text-xs font-medium text-slate-700 truncate">
                              {
                                supplier.contactPerson
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400 shrink-0" />

                          <div>
                            <p className="text-[10px] text-slate-400">
                              Phone
                            </p>

                            <p className="text-xs font-medium text-slate-700">
                              {supplier.phone}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400 shrink-0" />

                          <div className="min-w-0">
                            <p className="text-[10px] text-slate-400">
                              Email
                            </p>

                            <p className="text-xs font-medium text-slate-700 truncate">
                              {supplier.email ||
                                "Not provided"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />

                          <div>
                            <p className="text-[10px] text-slate-400">
                              Location
                            </p>

                            <p className="text-xs font-medium text-slate-700">
                              {supplier.city},{" "}
                              {supplier.state}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() =>
                            toggleStatus(
                              supplier
                            )
                          }
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                            supplier.status ===
                            "Active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              supplier.status ===
                              "Active"
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />

                          {supplier.status}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              openDetails(
                                supplier
                              )
                            }
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                supplier
                              )
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* MODAL HEADER */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingSupplier
                    ? "Edit Supplier"
                    : "Add Supplier"}
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  {editingSupplier
                    ? "Update supplier information."
                    : "Add a new supplier to your inventory system."}
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
              <div className="p-6 space-y-6">
                {/* BASIC INFORMATION */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
                    Supplier Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* NAME */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Supplier Name
                        <span className="text-rose-500 ml-1">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="ABC Office Solutions"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                      />
                    </div>

                    {/* CONTACT */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Contact Person
                        <span className="text-rose-500 ml-1">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        name="contactPerson"
                        value={
                          form.contactPerson
                        }
                        onChange={handleChange}
                        placeholder="Contact person name"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* PHONE */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Phone
                        <span className="text-rose-500 ml-1">
                          *
                        </span>
                      </label>

                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        maxLength={10}
                        placeholder="9876543210"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* EMAIL */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Email
                      </label>

                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="supplier@example.com"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* GSTIN */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        GSTIN
                        <span className="text-rose-500 ml-1">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        name="gstin"
                        value={form.gstin}
                        onChange={handleChange}
                        maxLength={15}
                        placeholder="29ABCDE1234F1Z5"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm uppercase outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* ADDRESS */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
                    Address
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ADDRESS */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Address
                        <span className="text-rose-500 ml-1">
                          *
                        </span>
                      </label>

                      <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Street, area, building..."
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none resize-none focus:border-indigo-500"
                      />
                    </div>

                    {/* CITY */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        City
                        <span className="text-rose-500 ml-1">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Raichur"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* STATE */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        State
                        <span className="text-rose-500 ml-1">
                          *
                        </span>
                      </label>

                      <select
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
                      >
                        <option value="Karnataka">
                          Karnataka
                        </option>

                        <option value="Telangana">
                          Telangana
                        </option>

                        <option value="Andhra Pradesh">
                          Andhra Pradesh
                        </option>

                        <option value="Tamil Nadu">
                          Tamil Nadu
                        </option>

                        <option value="Maharashtra">
                          Maharashtra
                        </option>

                        <option value="Kerala">
                          Kerala
                        </option>
                      </select>
                    </div>

                    {/* PIN */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        PIN Code
                        <span className="text-rose-500 ml-1">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        name="pincode"
                        value={form.pincode}
                        onChange={handleChange}
                        maxLength={6}
                        placeholder="584101"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* STATUS */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Status
                      </label>

                      <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
                      >
                        <option value="Active">
                          Active
                        </option>

                        <option value="Inactive">
                          Inactive
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
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
                  {editingSupplier ? (
                    <>
                      <Edit3 className="w-4 h-4" />
                      Update Supplier
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Supplier
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {showDetails && selectedSupplier && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeDetails}
          />

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* HEADER */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <span className="text-sm font-bold text-indigo-600">
                    {getInitials(
                      selectedSupplier.name
                    )}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {selectedSupplier.name}
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    {selectedSupplier.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeDetails}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* DETAILS */}
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Supplier Status
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                    selectedSupplier.status ===
                    "Active"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      selectedSupplier.status ===
                      "Active"
                        ? "bg-emerald-500"
                        : "bg-slate-400"
                    }`}
                  />

                  {selectedSupplier.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-slate-400" />

                    <span className="text-[10px] text-slate-400">
                      Contact Person
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-700">
                    {
                      selectedSupplier.contactPerson
                    }
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-2 mb-1">
                    <Phone className="w-4 h-4 text-slate-400" />

                    <span className="text-[10px] text-slate-400">
                      Phone
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-700">
                    {selectedSupplier.phone}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4 text-slate-400" />

                    <span className="text-[10px] text-slate-400">
                      Email
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-700 break-all">
                    {selectedSupplier.email ||
                      "Not provided"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-slate-400" />

                    <span className="text-[10px] text-slate-400">
                      GSTIN
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-700">
                    {selectedSupplier.gstin}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-indigo-500" />

                  <span className="text-xs font-semibold text-slate-700">
                    Address
                  </span>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {selectedSupplier.address}
                  <br />
                  {selectedSupplier.city},{" "}
                  {selectedSupplier.state}{" "}
                  {selectedSupplier.pincode}
                </p>
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  closeDetails();
                  openEditModal(
                    selectedSupplier
                  );
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>

              <button
                type="button"
                onClick={closeDetails}
                className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Suppliers;