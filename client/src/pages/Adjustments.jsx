import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileText,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  UserRound,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const Adjustments = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const [selectedAdjustment, setSelectedAdjustment] =
    useState(null);

  const [showAddModal, setShowAddModal] = useState(false);

  const [adjustments] = useState([
    {
      id: "ADJ-001",
      item: "A4 Copier Paper",
      category: "Stationery",
      adjustmentType: "Stock Correction",
      previousQuantity: 120,
      adjustedQuantity: 115,
      difference: -5,
      reason: "Physical stock count correction.",
      department: "Administration",
      adjustmentDate: "2026-08-26",
      adjustedBy: "Inventory Officer",
      status: "Approved",
      remarks:
        "Physical verification found five fewer units than system stock.",
    },
    {
      id: "ADJ-002",
      item: "Desktop Computer",
      category: "IT Equipment",
      adjustmentType: "Damage",
      previousQuantity: 24,
      adjustedQuantity: 23,
      difference: -1,
      reason: "Computer damaged beyond immediate use.",
      department: "Computer Science",
      adjustmentDate: "2026-08-24",
      adjustedBy: "Administrator",
      status: "Approved",
      remarks:
        "Device moved to damaged equipment records.",
    },
    {
      id: "ADJ-003",
      item: "Office Chair",
      category: "Furniture",
      adjustmentType: "Found Stock",
      previousQuantity: 38,
      adjustedQuantity: 40,
      difference: 2,
      reason: "Two chairs found during store room verification.",
      department: "General Store",
      adjustmentDate: "2026-08-22",
      adjustedBy: "Inventory Officer",
      status: "Approved",
      remarks:
        "Items were physically present but missing from system records.",
    },
    {
      id: "ADJ-004",
      item: "Keyboard",
      category: "IT Accessories",
      adjustmentType: "Loss",
      previousQuantity: 56,
      adjustedQuantity: 53,
      difference: -3,
      reason: "Three keyboards reported missing.",
      department: "Computer Science",
      adjustmentDate: "2026-08-19",
      adjustedBy: "Inventory Officer",
      status: "Pending",
      remarks:
        "Awaiting administrative approval.",
    },
    {
      id: "ADJ-005",
      item: "LED Tube Light",
      category: "Electrical",
      adjustmentType: "Damage",
      previousQuantity: 80,
      adjustedQuantity: 76,
      difference: -4,
      reason: "Damaged during maintenance work.",
      department: "Maintenance",
      adjustmentDate: "2026-08-17",
      adjustedBy: "Store Keeper",
      status: "Approved",
      remarks:
        "Damaged units separated for disposal.",
    },
    {
      id: "ADJ-006",
      item: "Whiteboard Marker",
      category: "Classroom Supplies",
      adjustmentType: "Stock Correction",
      previousQuantity: 150,
      adjustedQuantity: 155,
      difference: 5,
      reason: "Additional stock found during monthly verification.",
      department: "General Store",
      adjustmentDate: "2026-08-15",
      adjustedBy: "Inventory Officer",
      status: "Rejected",
      remarks:
        "Supporting verification document required.",
    },
  ]);

  /* =====================================================
     FILTERING
  ===================================================== */

  const filteredAdjustments = useMemo(() => {
    return adjustments.filter((record) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        record.id.toLowerCase().includes(query) ||
        record.item.toLowerCase().includes(query) ||
        record.category.toLowerCase().includes(query) ||
        record.adjustmentType
          .toLowerCase()
          .includes(query) ||
        record.department
          .toLowerCase()
          .includes(query) ||
        record.reason.toLowerCase().includes(query);

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

  /* =====================================================
     SUMMARY
  ===================================================== */

  const totalAdjustments = adjustments.length;

  const approvedAdjustments = adjustments.filter(
    (record) => record.status === "Approved",
  ).length;

  const pendingAdjustments = adjustments.filter(
    (record) => record.status === "Pending",
  ).length;

  const quantityIncreased = adjustments
    .filter((record) => record.difference > 0)
    .reduce(
      (sum, record) => sum + record.difference,
      0,
    );

  const quantityDecreased = adjustments
    .filter((record) => record.difference < 0)
    .reduce(
      (sum, record) => sum + Math.abs(record.difference),
      0,
    );

  /* =====================================================
     STATUS STYLE
  ===================================================== */

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

  /* =====================================================
     ADJUSTMENT TYPE STYLE
  ===================================================== */

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

  /* =====================================================
     SAVE
  ===================================================== */

  const handleSaveAdjustment = (event) => {
    event.preventDefault();

    toast.success(
      "Stock adjustment submitted successfully",
    );

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
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
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Adjustment
        </button>
      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

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

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* TOOLBAR */}

        <div className="p-4 sm:p-5 border-b border-slate-200">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            {/* SEARCH */}

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

            {/* FILTERS */}

            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value)
                }
                className="w-full sm:w-auto px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="All">
                  All Types
                </option>

                <option value="Stock Correction">
                  Stock Correction
                </option>

                <option value="Damage">
                  Damage
                </option>

                <option value="Loss">
                  Loss
                </option>

                <option value="Found Stock">
                  Found Stock
                </option>
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full sm:w-auto px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="All">
                  All Status
                </option>

                <option value="Approved">
                  Approved
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="Rejected">
                  Rejected
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* =================================================
            DESKTOP TABLE
        ================================================= */}

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Adjustment
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Item
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Type
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Stock Change
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Department
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Date
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredAdjustments.map(
                (record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* ID */}

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-indigo-600">
                        {record.id}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {record.adjustedBy}
                      </p>
                    </td>

                    {/* ITEM */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Package className="w-4 h-4 text-slate-500" />
                        </div>

                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {record.item}
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            {record.category}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* TYPE */}

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-medium ${getTypeStyle(
                          record.adjustmentType,
                        )}`}
                      >
                        {record.adjustmentType}
                      </span>
                    </td>

                    {/* STOCK CHANGE */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold text-sm ${
                            record.difference > 0
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                        >
                          {record.difference > 0
                            ? `+${record.difference}`
                            : record.difference}
                        </span>

                        <span className="text-xs text-slate-400">
                          units
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-1">
                        {record.previousQuantity} →{" "}
                        {record.adjustedQuantity}
                      </p>
                    </td>

                    {/* DEPARTMENT */}

                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-700">
                        {record.department}
                      </p>
                    </td>

                    {/* DATE */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDays className="w-4 h-4 text-slate-400" />

                        {record.adjustmentDate}
                      </div>
                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-medium ${getStatusStyle(
                          record.status,
                        )}`}
                      >
                        {record.status}
                      </span>
                    </td>

                    {/* ACTION */}

                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() =>
                            setSelectedAdjustment(
                              record,
                            )
                          }
                          className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>

          {filteredAdjustments.length === 0 && (
            <EmptyState />
          )}
        </div>

        {/* =================================================
            MOBILE
        ================================================= */}

        <div className="lg:hidden divide-y divide-slate-100">
          {filteredAdjustments.map(
            (record) => (
              <div
                key={record.id}
                className="p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-slate-500" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {record.item}
                      </p>

                      <p className="text-xs text-indigo-600 mt-1">
                        {record.id}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 inline-flex px-2 py-1 rounded-full border text-[11px] font-medium ${getStatusStyle(
                      record.status,
                    )}`}
                  >
                    {record.status}
                  </span>
                </div>

                <div className="mt-4">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-medium ${getTypeStyle(
                      record.adjustmentType,
                    )}`}
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
                    value={
                      record.difference > 0
                        ? `+${record.difference} units`
                        : `${record.difference} units`
                    }
                    valueClass={
                      record.difference > 0
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }
                  />

                  <Info
                    label="Department"
                    value={record.department}
                  />

                  <Info
                    label="Adjustment Date"
                    value={record.adjustmentDate}
                  />

                  <Info
                    label="Adjusted By"
                    value={record.adjustedBy}
                  />
                </div>

                <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() =>
                      setSelectedAdjustment(
                        record,
                      )
                    }
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            ),
          )}

          {filteredAdjustments.length === 0 && (
            <EmptyState />
          )}
        </div>
      </div>

      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {selectedAdjustment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() =>
              setSelectedAdjustment(null)
            }
          />

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* HEADER */}

            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-600 font-medium">
                  {selectedAdjustment.id}
                </p>

                <h2 className="text-lg font-semibold text-slate-900 mt-1">
                  Adjustment Details
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedAdjustment(null)
                }
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CONTENT */}

            <div className="p-5 space-y-5">
              {/* ITEM */}

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                    <Package className="w-5 h-5 text-indigo-600" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {selectedAdjustment.item}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      {selectedAdjustment.category}
                    </p>
                  </div>
                </div>
              </div>

              {/* TYPE + STATUS */}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-medium ${getTypeStyle(
                    selectedAdjustment.adjustmentType,
                  )}`}
                >
                  {selectedAdjustment.adjustmentType}
                </span>

                <span
                  className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-medium ${getStatusStyle(
                    selectedAdjustment.status,
                  )}`}
                >
                  {selectedAdjustment.status}
                </span>
              </div>

              {/* STOCK COMPARISON */}

              <div className="grid grid-cols-3 gap-3">
                <StockValue
                  label="Previous"
                  value={
                    selectedAdjustment.previousQuantity
                  }
                />

                <StockValue
                  label="Change"
                  value={
                    selectedAdjustment.difference > 0
                      ? `+${selectedAdjustment.difference}`
                      : selectedAdjustment.difference
                  }
                  valueClass={
                    selectedAdjustment.difference > 0
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }
                />

                <StockValue
                  label="New Stock"
                  value={
                    selectedAdjustment.adjustedQuantity
                  }
                />
              </div>

              {/* DETAILS */}

              <div className="grid grid-cols-2 gap-4">
                <Detail
                  label="Department"
                  value={
                    selectedAdjustment.department
                  }
                />

                <Detail
                  label="Adjustment Date"
                  value={
                    selectedAdjustment.adjustmentDate
                  }
                />

                <Detail
                  label="Adjusted By"
                  value={
                    selectedAdjustment.adjustedBy
                  }
                />

                <Detail
                  label="Category"
                  value={
                    selectedAdjustment.category
                  }
                />
              </div>

              {/* REASON */}

              <div>
                <p className="text-xs text-slate-400">
                  Reason
                </p>

                <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                  {selectedAdjustment.reason}
                </p>
              </div>

              {/* REMARKS */}

              <div>
                <p className="text-xs text-slate-400">
                  Remarks
                </p>

                <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                  {selectedAdjustment.remarks}
                </p>
              </div>
            </div>

            {/* FOOTER */}

            <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() =>
                  setSelectedAdjustment(null)
                }
                className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          ADD ADJUSTMENT MODAL
      ================================================= */}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() =>
              setShowAddModal(false)
            }
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            {/* HEADER */}

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
                onClick={() =>
                  setShowAddModal(false)
                }
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSaveAdjustment}>
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Item"
                    placeholder="Select item"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Adjustment Type
                      <span className="text-rose-500 ml-1">
                        *
                      </span>
                    </label>

                    <select
                      required
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="">
                        Select type
                      </option>

                      <option value="Stock Correction">
                        Stock Correction
                      </option>

                      <option value="Damage">
                        Damage
                      </option>

                      <option value="Loss">
                        Loss
                      </option>

                      <option value="Found Stock">
                        Found Stock
                      </option>
                    </select>
                  </div>

                  <FormField
                    label="Current System Quantity"
                    type="number"
                    placeholder="0"
                    required
                  />

                  <FormField
                    label="Physical Quantity"
                    type="number"
                    placeholder="0"
                    required
                  />

                  <FormField
                    label="Department"
                    placeholder="Select department"
                    required
                  />

                  <FormField
                    label="Adjustment Date"
                    type="date"
                    required
                  />
                </div>

                {/* REASON */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Reason
                    <span className="text-rose-500 ml-1">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="Explain why the stock needs adjustment"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                {/* DOCUMENT REFERENCE */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Reference / Document No.
                  </label>

                  <input
                    type="text"
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
                      Adjustments should be supported by physical verification or an authorized department record.
                    </p>
                  </div>
                </div>
              </div>

              {/* FOOTER */}

              <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setShowAddModal(false)
                  }
                  className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Submit Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* =====================================================
   SUMMARY CARD
===================================================== */

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
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <h2 className="text-2xl font-semibold text-slate-900 mt-2">
            {value}
          </h2>
        </div>

        <div
          className={`w-10 h-10 rounded-lg ${bgClass} flex items-center justify-center shrink-0`}
        >
          <Icon
            className={`w-5 h-5 ${iconClass}`}
          />
        </div>
      </div>
    </div>
  );
};

/* =====================================================
   MOBILE INFO
===================================================== */

const Info = ({
  label,
  value,
  valueClass = "text-slate-700",
}) => {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-slate-400">
        {label}
      </p>

      <p
        className={`text-xs mt-1 truncate ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
};

/* =====================================================
   DETAIL
===================================================== */

const Detail = ({ label, value }) => {
  return (
    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
      <p className="text-[11px] text-slate-400">
        {label}
      </p>

      <p className="text-sm font-medium text-slate-800 mt-1">
        {value}
      </p>
    </div>
  );
};

/* =====================================================
   STOCK VALUE
===================================================== */

const StockValue = ({
  label,
  value,
  valueClass = "text-slate-900",
}) => {
  return (
    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
      <p className="text-[11px] text-slate-400">
        {label}
      </p>

      <p
        className={`text-lg font-semibold mt-1 ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
};

/* =====================================================
   FORM FIELD
===================================================== */

const FormField = ({
  label,
  type = "text",
  placeholder,
  required,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}

        {required && (
          <span className="text-rose-500 ml-1">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
      />
    </div>
  );
};

/* =====================================================
   EMPTY STATE
===================================================== */

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