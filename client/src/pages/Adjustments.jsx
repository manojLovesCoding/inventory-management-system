
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Eye,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  X,
  Check,
  Ban,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Adjustments = () => {
  const { user, loading: authLoading } = useAuth();

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const [adjustments, setAdjustments] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    inventory: "",
    adjustmentType: "",
    physicalQuantity: "",
    department: "",
    adjustmentDate: new Date().toISOString().split("T")[0],
    reason: "",
    reference: "",
    remarks: "",
  });

  // -----------------------------------------------------
  // FETCH ADJUSTMENTS
  // -----------------------------------------------------

  const fetchAdjustments = useCallback(async () => {
    try {
      const response = await api.get("/adjustments");

      const data = response.data;

      setAdjustments(
        Array.isArray(data.adjustments)
          ? data.adjustments
          : [],
      );
    } catch (error) {
      console.error("Fetch adjustments error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load stock adjustments",
      );
    }
  }, []);

  // -----------------------------------------------------
  // FETCH INVENTORY
  // -----------------------------------------------------

  const fetchInventory = useCallback(async () => {
    try {
      const response = await api.get("/inventory");

      const data = response.data;

      const items =
        data.inventory ||
        data.items ||
        data.data ||
        [];

      setInventory(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Fetch inventory error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load inventory items",
      );
    }
  }, []);

  // -----------------------------------------------------
  // FETCH DEPARTMENTS
  // -----------------------------------------------------

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await api.get("/departments");

      const data = response.data;

      const items =
        data.departments ||
        data.data ||
        [];

      setDepartments(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Fetch departments error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load departments",
      );
    }
  }, []);

  // -----------------------------------------------------
  // INITIAL DATA
  // -----------------------------------------------------

  useEffect(() => {
    if (authLoading) return;

    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        fetchAdjustments(),
        fetchInventory(),
        fetchDepartments(),
      ]);

      setLoading(false);
    };

    loadData();
  }, [
    authLoading,
    isAdmin,
    fetchAdjustments,
    fetchInventory,
    fetchDepartments,
  ]);

  // -----------------------------------------------------
  // HELPERS
  // -----------------------------------------------------

  const getItemName = (record) => {
    if (record.inventory && typeof record.inventory === "object") {
      return (
        record.inventory.name ||
        record.inventory.itemName ||
        record.item ||
        "Unknown Item"
      );
    }

    return record.item || "Unknown Item";
  };

  const getDepartmentName = (record) => {
    if (
      record.department &&
      typeof record.department === "object"
    ) {
      return (
        record.department.name ||
        record.department.departmentName ||
        "Unknown Department"
      );
    }

    return record.department || "Unknown Department";
  };

  const getAdjustedBy = (record) => {
    if (
      record.adjustedBy &&
      typeof record.adjustedBy === "object"
    ) {
      return (
        record.adjustedBy.name ||
        record.adjustedBy.email ||
        "Admin"
      );
    }

    return record.adjustedBy || "Admin";
  };

  const getAdjustmentId = (record) => {
    return record.adjustmentNo || record._id;
  };

  const selectedInventory = inventory.find(
    (item) => item._id === formData.inventory,
  );

  const currentQuantity = selectedInventory
    ? Number(selectedInventory.available ?? 0)
    : "";

  const physicalQuantity = Number(formData.physicalQuantity);

  const quantityDifference =
    formData.physicalQuantity !== "" &&
    Number.isFinite(physicalQuantity) &&
    selectedInventory
      ? physicalQuantity - currentQuantity
      : null;

  // -----------------------------------------------------
  // FILTERING
  // -----------------------------------------------------

  const filteredAdjustments = useMemo(() => {
    return adjustments.filter((record) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        getAdjustmentId(record)
          ?.toLowerCase()
          .includes(query) ||
        getItemName(record)
          .toLowerCase()
          .includes(query) ||
        (record.category || "")
          .toLowerCase()
          .includes(query) ||
        (record.adjustmentType || "")
          .toLowerCase()
          .includes(query) ||
        getDepartmentName(record)
          .toLowerCase()
          .includes(query) ||
        (record.reason || "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        record.status === statusFilter;

      const matchesType =
        typeFilter === "All" ||
        record.adjustmentType === typeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  }, [
    adjustments,
    search,
    statusFilter,
    typeFilter,
  ]);

  // -----------------------------------------------------
  // SUMMARY
  // -----------------------------------------------------

  const totalAdjustments = adjustments.length;

  const approvedAdjustments = adjustments.filter(
    (record) => record.status === "Approved",
  ).length;

  const pendingAdjustments = adjustments.filter(
    (record) => record.status === "Pending",
  ).length;

  const quantityIncreased = adjustments
    .filter(
      (record) =>
        record.status === "Approved" &&
        record.difference > 0,
    )
    .reduce(
      (sum, record) => sum + record.difference,
      0,
    );

  const quantityDecreased = adjustments
    .filter(
      (record) =>
        record.status === "Approved" &&
        record.difference < 0,
    )
    .reduce(
      (sum, record) => sum + Math.abs(record.difference),
      0,
    );

  // -----------------------------------------------------
  // STATUS STYLE
  // -----------------------------------------------------

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";

      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  // -----------------------------------------------------
  // ADJUSTMENT TYPE STYLE
  // -----------------------------------------------------

  const getTypeStyle = (type) => {
    switch (type) {
      case "Found Stock":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "Damage":
        return "bg-rose-50 text-rose-700 border-rose-200";

      case "Loss":
        return "bg-orange-50 text-orange-700 border-orange-200";

      case "Stock Correction":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";

      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  // -----------------------------------------------------
  // FORM HANDLING
  // -----------------------------------------------------

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      inventory: "",
      adjustmentType: "",
      physicalQuantity: "",
      department: "",
      adjustmentDate: new Date().toISOString().split("T")[0],
      reason: "",
      reference: "",
      remarks: "",
    });
  };

  const openAddModal = () => {
    if (!isAdmin) {
      toast.error("Only admin can create stock adjustments");
      return;
    }

    resetForm();
    setShowAddModal(true);
  };

  // -----------------------------------------------------
  // CREATE ADJUSTMENT
  // -----------------------------------------------------

  const handleSaveAdjustment = async (event) => {
    event.preventDefault();

    if (!isAdmin) {
      toast.error("Only admin can create stock adjustments");
      return;
    }

    if (!selectedInventory) {
      toast.error("Please select an inventory item");
      return;
    }

    if (!formData.department) {
      toast.error("Please select a department");
      return;
    }

    const quantity = Number(formData.physicalQuantity);

    if (!Number.isFinite(quantity) || quantity < 0) {
      toast.error("Please enter a valid physical quantity");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        inventory: formData.inventory,
        adjustmentType: formData.adjustmentType,
        physicalQuantity: quantity,
        department: formData.department,
        adjustmentDate: formData.adjustmentDate,
        reason: formData.reason.trim(),
        reference: formData.reference.trim(),
        remarks: formData.remarks.trim(),
      };

      const response = await api.post(
        "/adjustments",
        payload,
      );

      toast.success(
        response.data.message ||
          "Stock adjustment submitted successfully",
      );

      setShowAddModal(false);
      resetForm();

      await fetchAdjustments();
      await fetchInventory();
    } catch (error) {
      console.error("Create adjustment error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to create stock adjustment",
      );
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------------------
  // APPROVE ADJUSTMENT
  // -----------------------------------------------------

  const handleApproveAdjustment = async (record) => {
    if (!isAdmin) {
      toast.error("Only admin can approve adjustments");
      return;
    }

    if (record.status !== "Pending") {
      toast.error("Only pending adjustments can be approved");
      return;
    }

    try {
      setActionLoading(true);

      const response = await api.patch(
        `/adjustments/${record._id}/approve`,
      );

      toast.success(
        response.data.message ||
          "Adjustment approved successfully",
      );

      setSelectedAdjustment(null);

      await Promise.all([
        fetchAdjustments(),
        fetchInventory(),
      ]);
    } catch (error) {
      console.error("Approve adjustment error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to approve adjustment",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // -----------------------------------------------------
  // REJECT ADJUSTMENT
  // -----------------------------------------------------

  const handleRejectAdjustment = async (record) => {
    if (!isAdmin) {
      toast.error("Only admin can reject adjustments");
      return;
    }

    if (record.status !== "Pending") {
      toast.error("Only pending adjustments can be rejected");
      return;
    }

    try {
      setActionLoading(true);

      const response = await api.patch(
        `/adjustments/${record._id}/reject`,
      );

      toast.success(
        response.data.message ||
          "Adjustment rejected successfully",
      );

      setSelectedAdjustment(null);

      await fetchAdjustments();
    } catch (error) {
      console.error("Reject adjustment error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to reject adjustment",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // -----------------------------------------------------
  // AUTH CHECK
  // -----------------------------------------------------

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
        <span className="ml-3 text-sm text-slate-500">
          Loading adjustments...
        </span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-white border border-rose-200 rounded-xl p-8 text-center">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />

        <h2 className="text-lg font-semibold text-slate-900">
          Access Denied
        </h2>

        <p className="text-sm text-slate-500 mt-2">
          Only administrators can access stock adjustments.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Stock Adjustments
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Correct inventory quantities and record stock discrepancies.
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Adjustment
        </button>
      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <SummaryCard
          title="Total Adjustments"
          value={totalAdjustments}
          icon={ClipboardList}
          iconClass="text-indigo-600"
          bgClass="bg-indigo-50"
        />

        <SummaryCard
          title="Approved"
          value={approvedAdjustments}
          icon={CheckCircle2}
          iconClass="text-emerald-600"
          bgClass="bg-emerald-50"
        />

        <SummaryCard
          title="Pending"
          value={pendingAdjustments}
          icon={AlertTriangle}
          iconClass="text-amber-600"
          bgClass="bg-amber-50"
        />

        <SummaryCard
          title="Stock Increased"
          value={`+${quantityIncreased}`}
          icon={ArrowDownToLine}
          iconClass="text-blue-600"
          bgClass="bg-blue-50"
        />

        <SummaryCard
          title="Stock Decreased"
          value={`-${quantityDecreased}`}
          icon={ArrowUpFromLine}
          iconClass="text-rose-600"
          bgClass="bg-rose-50"
        />
      </div>

      {/* TABLE */}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div className="relative w-full xl:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search adjustments..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value)
                }
                className="w-full sm:w-auto px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700"
              >
                <option value="All">All Types</option>
                <option value="Stock Correction">Stock Correction</option>
                <option value="Damage">Damage</option>
                <option value="Loss">Loss</option>
                <option value="Found Stock">Found Stock</option>
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full sm:w-auto px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700"
              >
                <option value="All">All Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* DESKTOP TABLE */}

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {[
                  "Adjustment",
                  "Item",
                  "Type",
                  "Stock Change",
                  "Department",
                  "Date",
                  "Status",
                  "Action",
                ].map((heading) => (
                  <th
                    key={heading}
                    className={`px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${
                      heading === "Action"
                        ? "text-right"
                        : "text-left"
                    }`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredAdjustments.map((record) => (
                <tr
                  key={record._id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-indigo-600">
                      {getAdjustmentId(record)}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      {getAdjustedBy(record)}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Package className="w-4 h-4 text-slate-500" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {getItemName(record)}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          {record.category || "-"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-medium ${getTypeStyle(record.adjustmentType)}`}
                    >
                      {record.adjustmentType}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`font-semibold text-sm ${
                        record.difference > 0
                          ? "text-emerald-600"
                          : record.difference < 0
                            ? "text-rose-600"
                            : "text-slate-600"
                      }`}
                    >
                      {record.difference > 0 ? "+" : ""}
                      {record.difference}
                    </span>

                    <span className="text-xs text-slate-400 ml-2">
                      units
                    </span>

                    <p className="text-[11px] text-slate-400 mt-1">
                      {record.previousQuantity} → {record.adjustedQuantity}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-700">
                      {getDepartmentName(record)}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CalendarDays className="w-4 h-4 text-slate-400" />

                      {record.adjustmentDate
                        ? new Date(record.adjustmentDate).toLocaleDateString()
                        : "-"}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-medium ${getStatusStyle(record.status)}`}
                    >
                      {record.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() =>
                          setSelectedAdjustment(record)
                        }
                        className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAdjustments.length === 0 && (
            <EmptyState />
          )}
        </div>

        {/* MOBILE CARDS */}

        <div className="lg:hidden divide-y divide-slate-100">
          {filteredAdjustments.map((record) => (
            <div key={record._id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-slate-500" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {getItemName(record)}
                    </p>

                    <p className="text-xs text-indigo-600 mt-1">
                      {getAdjustmentId(record)}
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 inline-flex px-2 py-1 rounded-full border text-[11px] font-medium ${getStatusStyle(record.status)}`}
                >
                  {record.status}
                </span>
              </div>

              <div className="mt-4">
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-medium ${getTypeStyle(record.adjustmentType)}`}
                >
                  {record.adjustmentType}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <Info
                  label="Previous Stock"
                  value={`${record.previousQuantity} units`}
                />

                <Info
                  label="New Stock"
                  value={`${record.adjustedQuantity} units`}
                />

                <Info
                  label="Stock Change"
                  value={`${record.difference > 0 ? "+" : ""}${record.difference} units`}
                  valueClass={
                    record.difference > 0
                      ? "text-emerald-600"
                      : record.difference < 0
                        ? "text-rose-600"
                        : "text-slate-700"
                  }
                />

                <Info
                  label="Department"
                  value={getDepartmentName(record)}
                />

                <Info
                  label="Adjustment Date"
                  value={
                    record.adjustmentDate
                      ? new Date(record.adjustmentDate).toLocaleDateString()
                      : "-"
                  }
                />

                <Info
                  label="Adjusted By"
                  value={getAdjustedBy(record)}
                />
              </div>

              <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() =>
                    setSelectedAdjustment(record)
                  }
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          ))}

          {filteredAdjustments.length === 0 && (
            <EmptyState />
          )}
        </div>
      </div>

      {/* DETAILS MODAL */}

      {selectedAdjustment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => {
              if (!actionLoading) {
                setSelectedAdjustment(null);
              }
            }}
          />

          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-600 font-medium">
                  {getAdjustmentId(selectedAdjustment)}
                </p>

                <h2 className="text-lg font-semibold text-slate-900 mt-1">
                  Adjustment Details
                </h2>
              </div>

              <button
                disabled={actionLoading}
                onClick={() => setSelectedAdjustment(null)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                    <Package className="w-5 h-5 text-indigo-600" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {getItemName(selectedAdjustment)}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      {selectedAdjustment.category || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-medium ${getTypeStyle(selectedAdjustment.adjustmentType)}`}
                >
                  {selectedAdjustment.adjustmentType}
                </span>

                <span
                  className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-medium ${getStatusStyle(selectedAdjustment.status)}`}
                >
                  {selectedAdjustment.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <StockValue
                  label="Previous"
                  value={selectedAdjustment.previousQuantity}
                />

                <StockValue
                  label="Change"
                  value={`${selectedAdjustment.difference > 0 ? "+" : ""}${selectedAdjustment.difference}`}
                  valueClass={
                    selectedAdjustment.difference > 0
                      ? "text-emerald-600"
                      : selectedAdjustment.difference < 0
                        ? "text-rose-600"
                        : "text-slate-900"
                  }
                />

                <StockValue
                  label="New Stock"
                  value={selectedAdjustment.adjustedQuantity}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Detail
                  label="Department"
                  value={getDepartmentName(selectedAdjustment)}
                />

                <Detail
                  label="Adjustment Date"
                  value={
                    selectedAdjustment.adjustmentDate
                      ? new Date(
                          selectedAdjustment.adjustmentDate,
                        ).toLocaleDateString()
                      : "-"
                  }
                />

                <Detail
                  label="Adjusted By"
                  value={getAdjustedBy(selectedAdjustment)}
                />

                <Detail
                  label="Category"
                  value={selectedAdjustment.category || "-"}
                />

                <Detail
                  label="Reference"
                  value={selectedAdjustment.reference || "-"}
                />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Reason
                </p>

                <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                  {selectedAdjustment.reason}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Remarks
                </p>

                <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                  {selectedAdjustment.remarks || "-"}
                </p>
              </div>
            </div>

            {/* APPROVE / REJECT */}

            {selectedAdjustment.status === "Pending" && (
              <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-end gap-2">
                <button
                  disabled={actionLoading}
                  onClick={() =>
                    handleRejectAdjustment(selectedAdjustment)
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-rose-200 bg-white text-rose-600 text-sm font-medium hover:bg-rose-50 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Ban className="w-4 h-4" />
                  )}
                  Reject
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() =>
                    handleApproveAdjustment(selectedAdjustment)
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Approve
                </button>
              </div>
            )}

            {selectedAdjustment.status !== "Pending" && (
              <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setSelectedAdjustment(null)}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD ADJUSTMENT MODAL */}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => {
              if (!saving) setShowAddModal(false);
            }}
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Add Stock Adjustment
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Record a correction or discrepancy in inventory.
                </p>
              </div>

              <button
                disabled={saving}
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment}>
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* INVENTORY ITEM */}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Item <span className="text-rose-500">*</span>
                    </label>

                    <select
                      name="inventory"
                      value={formData.inventory}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="">Select item</option>

                      {inventory.map((item) => (
                        <option
                          key={item._id}
                          value={item._id}
                        >
                          {item.name || item.itemName || item.itemCode}
                          {item.itemCode ? ` (${item.itemCode})` : ""}
                        </option>
                      ))}
                    </select>

                    {inventory.length === 0 && (
                      <p className="text-xs text-rose-500 mt-1">
                        No inventory items found.
                      </p>
                    )}
                  </div>

                  {/* ADJUSTMENT TYPE */}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Adjustment Type
                      <span className="text-rose-500 ml-1">*</span>
                    </label>

                    <select
                      name="adjustmentType"
                      value={formData.adjustmentType}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="">Select type</option>
                      <option value="Stock Correction">Stock Correction</option>
                      <option value="Damage">Damage</option>
                      <option value="Loss">Loss</option>
                      <option value="Found Stock">Found Stock</option>
                    </select>
                  </div>

                  {/* CURRENT QUANTITY */}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Current System Quantity
                    </label>

                    <input
                      type="number"
                      value={currentQuantity}
                      readOnly
                      placeholder="Select an item first"
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-600"
                    />
                  </div>

                  {/* PHYSICAL QUANTITY */}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Physical Quantity
                      <span className="text-rose-500 ml-1">*</span>
                    </label>

                    <input
                      type="number"
                      name="physicalQuantity"
                      value={formData.physicalQuantity}
                      onChange={handleFormChange}
                      min="0"
                      step="1"
                      required
                      placeholder="Enter physical quantity"
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {/* DEPARTMENT */}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Department
                      <span className="text-rose-500 ml-1">*</span>
                    </label>

                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="">Select department</option>

                      {departments.map((department) => (
                        <option
                          key={department._id}
                          value={department._id}
                        >
                          {department.name ||
                            department.departmentName ||
                            department.code}
                        </option>
                      ))}
                    </select>

                    {departments.length === 0 && (
                      <p className="text-xs text-rose-500 mt-1">
                        No departments found.
                      </p>
                    )}
                  </div>

                  {/* ADJUSTMENT DATE */}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Adjustment Date
                      <span className="text-rose-500 ml-1">*</span>
                    </label>

                    <input
                      type="date"
                      name="adjustmentDate"
                      value={formData.adjustmentDate}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* DIFFERENCE PREVIEW */}

                {quantityDifference !== null && (
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <p className="text-xs text-slate-500">
                      Calculated stock difference
                    </p>

                    <p
                      className={`text-lg font-semibold mt-1 ${
                        quantityDifference > 0
                          ? "text-emerald-600"
                          : quantityDifference < 0
                            ? "text-rose-600"
                            : "text-slate-700"
                      }`}
                    >
                      {quantityDifference > 0 ? "+" : ""}
                      {quantityDifference} units
                    </p>
                  </div>
                )}

                {/* REASON */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Reason
                    <span className="text-rose-500 ml-1">*</span>
                  </label>

                  <input
                    type="text"
                    name="reason"
                    value={formData.reason}
                    onChange={handleFormChange}
                    required
                    placeholder="Explain why the stock needs adjustment"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                {/* REFERENCE */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Reference / Document No.
                  </label>

                  <input
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={handleFormChange}
                    placeholder="DOC-2026-001"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />

                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Optional supporting document or verification reference.
                  </p>
                </div>

                {/* REMARKS */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Remarks
                  </label>

                  <textarea
                    rows="3"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleFormChange}
                    placeholder="Enter additional information..."
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                {/* WARNING */}

                <div className="flex gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />

                  <div>
                    <p className="text-xs font-medium text-amber-800">
                      Stock adjustment requires verification
                    </p>

                    <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                      The adjustment will remain pending until it is approved.
                      Inventory stock will only change after approval.
                    </p>
                  </div>
                </div>
              </div>

              {/* FOOTER */}

              <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <SlidersHorizontal className="w-4 h-4" />
                  )}

                  {saving ? "Submitting..." : "Submit Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// -----------------------------------------------------
// SUMMARY CARD
// -----------------------------------------------------

const SummaryCard = ({
  title,
  value,
  icon: Icon,
  iconClass,
  bgClass,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <h2 className="text-2xl font-semibold text-slate-900 mt-2">
            {value}
          </h2>
        </div>

        <div
          className={`w-10 h-10 rounded-lg ${bgClass} flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-5 h-5 ${iconClass}`} />
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------
// MOBILE INFO
// -----------------------------------------------------

const Info = ({
  label,
  value,
  valueClass = "text-slate-700",
}) => {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-slate-400">{label}</p>

      <p className={`text-xs mt-1 truncate ${valueClass}`}>
        {value}
      </p>
    </div>
  );
};

// -----------------------------------------------------
// DETAIL
// -----------------------------------------------------

const Detail = ({ label, value }) => {
  return (
    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
      <p className="text-[11px] text-slate-400">{label}</p>

      <p className="text-sm font-medium text-slate-800 mt-1">
        {value}
      </p>
    </div>
  );
};

// -----------------------------------------------------
// STOCK VALUE
// -----------------------------------------------------

const StockValue = ({
  label,
  value,
  valueClass = "text-slate-900",
}) => {
  return (
    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
      <p className="text-[11px] text-slate-400">{label}</p>

      <p className={`text-lg font-semibold mt-1 ${valueClass}`}>
        {value}
      </p>
    </div>
  );
};

// -----------------------------------------------------
// EMPTY STATE
// -----------------------------------------------------

const EmptyState = () => {
  return (
    <div className="py-16 text-center">
      <SlidersHorizontal className="w-10 h-10 text-slate-300 mx-auto mb-3" />

      <p className="text-sm font-medium text-slate-600">
        No adjustment records found
      </p>

      <p className="text-xs text-slate-400 mt-1">
        Try changing your search or filters.
      </p>
    </div>
  );
};

export default Adjustments;
