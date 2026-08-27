import React, { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileText,
  Package,
  Plus,
  Search,
  UserRound,
  X,
  AlertTriangle,
  Wrench,
  CircleCheck,
} from "lucide-react";
import toast from "react-hot-toast";

const Returns = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [conditionFilter, setConditionFilter] = useState("All");

  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [returns] = useState([
    {
      id: "RET-001",
      item: "Desktop Computer",
      category: "IT Equipment",
      department: "Computer Science",
      returnedBy: "Dr. Priya Sharma",
      quantity: 1,
      returnDate: "2026-08-25",
      condition: "Good",
      reason: "Lab equipment returned after semester use.",
      status: "Completed",
      receivedBy: "Inventory Officer",
      remarks: "Computer checked and found in working condition.",
    },
    {
      id: "RET-002",
      item: "Office Chair",
      category: "Furniture",
      department: "Commerce",
      returnedBy: "Suresh Babu",
      quantity: 2,
      returnDate: "2026-08-23",
      condition: "Good",
      reason: "Department requirement completed.",
      status: "Completed",
      receivedBy: "Inventory Officer",
      remarks: "Both chairs are in usable condition.",
    },
    {
      id: "RET-003",
      item: "LED Projector",
      category: "Electronics",
      department: "English",
      returnedBy: "Dr. Anitha Rao",
      quantity: 1,
      returnDate: "2026-08-20",
      condition: "Repair",
      reason: "Projector showing display issues.",
      status: "Under Inspection",
      receivedBy: "Administrator",
      remarks: "Sent for technical inspection.",
    },
    {
      id: "RET-004",
      item: "Keyboard",
      category: "IT Accessories",
      department: "Computer Science",
      returnedBy: "Ramesh Kumar",
      quantity: 3,
      returnDate: "2026-08-18",
      condition: "Damaged",
      reason: "Keys not functioning properly.",
      status: "Under Inspection",
      receivedBy: "Inventory Officer",
      remarks: "Damaged keyboards kept separately.",
    },
    {
      id: "RET-005",
      item: "Whiteboard",
      category: "Classroom Supplies",
      department: "Mathematics",
      returnedBy: "Prof. Mahesh",
      quantity: 1,
      returnDate: "2026-08-15",
      condition: "Good",
      reason: "Classroom renovation completed.",
      status: "Completed",
      receivedBy: "Inventory Officer",
      remarks: "Whiteboard returned to general inventory.",
    },
    {
      id: "RET-006",
      item: "UPS Battery",
      category: "Electrical",
      department: "Administration",
      returnedBy: "Admin Office",
      quantity: 2,
      returnDate: "2026-08-12",
      condition: "Damaged",
      reason: "Battery backup not functioning.",
      status: "Rejected",
      receivedBy: "Administrator",
      remarks: "Marked for disposal after inspection.",
    },
  ]);

  /* -------------------------------------------------
     FILTER DATA
  ------------------------------------------------- */

  const filteredReturns = useMemo(() => {
    return returns.filter((record) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        record.id.toLowerCase().includes(query) ||
        record.item.toLowerCase().includes(query) ||
        record.category.toLowerCase().includes(query) ||
        record.department.toLowerCase().includes(query) ||
        record.returnedBy.toLowerCase().includes(query) ||
        record.reason.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        record.status === statusFilter;

      const matchesCondition =
        conditionFilter === "All" ||
        record.condition === conditionFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCondition
      );
    });
  }, [returns, search, statusFilter, conditionFilter]);

  /* -------------------------------------------------
     SUMMARY
  ------------------------------------------------- */

  const totalReturns = returns.length;

  const completedReturns = returns.filter(
    (record) => record.status === "Completed",
  ).length;

  const inspectionReturns = returns.filter(
    (record) => record.status === "Under Inspection",
  ).length;

  const damagedReturns = returns.filter(
    (record) =>
      record.condition === "Damaged" ||
      record.condition === "Repair",
  ).length;

  const totalReturnedQuantity = returns.reduce(
    (sum, record) => sum + record.quantity,
    0,
  );

  /* -------------------------------------------------
     STATUS STYLE
  ------------------------------------------------- */

  const getStatusStyle = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "Under Inspection":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";

      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  /* -------------------------------------------------
     CONDITION STYLE
  ------------------------------------------------- */

  const getConditionStyle = (condition) => {
    switch (condition) {
      case "Good":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "Repair":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "Damaged":
        return "bg-rose-50 text-rose-700 border-rose-200";

      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  /* -------------------------------------------------
     SAVE RETURN
  ------------------------------------------------- */

  const handleSaveReturn = (event) => {
    event.preventDefault();

    toast.success("Return record created successfully");

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
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Returns
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Manage items returned by departments and staff.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Return
        </button>
      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <SummaryCard
          title="Total Returns"
          value={totalReturns}
          icon={ClipboardList}
          iconClass="text-indigo-600"
          bgClass="bg-indigo-50"
        />

        <SummaryCard
          title="Completed"
          value={completedReturns}
          icon={CheckCircle2}
          iconClass="text-emerald-600"
          bgClass="bg-emerald-50"
        />

        <SummaryCard
          title="Under Inspection"
          value={inspectionReturns}
          icon={AlertTriangle}
          iconClass="text-amber-600"
          bgClass="bg-amber-50"
        />

        <SummaryCard
          title="Damaged / Repair"
          value={damagedReturns}
          icon={Wrench}
          iconClass="text-rose-600"
          bgClass="bg-rose-50"
        />

        <SummaryCard
          title="Items Returned"
          value={totalReturnedQuantity}
          icon={Package}
          iconClass="text-blue-600"
          bgClass="bg-blue-50"
        />
      </div>

      {/* =================================================
          MAIN TABLE
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
                placeholder="Search return records..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* FILTERS */}

            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={conditionFilter}
                onChange={(event) =>
                  setConditionFilter(event.target.value)
                }
                className="w-full sm:w-auto px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="All">All Conditions</option>
                <option value="Good">Good</option>
                <option value="Repair">Repair</option>
                <option value="Damaged">Damaged</option>
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full sm:w-auto px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="All">All Status</option>
                <option value="Completed">Completed</option>
                <option value="Under Inspection">
                  Under Inspection
                </option>
                <option value="Rejected">Rejected</option>
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
                  Return
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Item
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Department
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Returned By
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Quantity
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Condition
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
              {filteredReturns.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {/* RETURN ID */}

                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-indigo-600">
                      {record.id}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      {record.reason}
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

                  {/* DEPARTMENT */}

                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-700">
                      {record.department}
                    </p>
                  </td>

                  {/* RETURNED BY */}

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <UserRound className="w-4 h-4 text-slate-400" />

                      <span className="text-sm text-slate-700">
                        {record.returnedBy}
                      </span>
                    </div>
                  </td>

                  {/* QUANTITY */}

                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold text-slate-800">
                      {record.quantity}
                    </span>

                    <span className="text-xs text-slate-400 ml-1">
                      units
                    </span>
                  </td>

                  {/* CONDITION */}

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-medium ${getConditionStyle(
                        record.condition,
                      )}`}
                    >
                      {record.condition}
                    </span>
                  </td>

                  {/* DATE */}

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CalendarDays className="w-4 h-4 text-slate-400" />

                      {record.returnDate}
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
                          setSelectedReturn(record)
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

          {filteredReturns.length === 0 && (
            <EmptyState />
          )}
        </div>

        {/* =================================================
            MOBILE CARDS
        ================================================= */}

        <div className="lg:hidden divide-y divide-slate-100">
          {filteredReturns.map((record) => (
            <div
              key={record.id}
              className="p-4"
            >
              {/* TOP */}

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

              {/* INFORMATION */}

              <div className="grid grid-cols-2 gap-4 mt-4">
                <Info
                  label="Department"
                  value={record.department}
                />

                <Info
                  label="Returned By"
                  value={record.returnedBy}
                />

                <Info
                  label="Quantity"
                  value={`${record.quantity} units`}
                />

                <Info
                  label="Return Date"
                  value={record.returnDate}
                />

                <Info
                  label="Condition"
                  value={record.condition}
                />

                <Info
                  label="Category"
                  value={record.category}
                />
              </div>

              {/* ACTION */}

              <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() =>
                    setSelectedReturn(record)
                  }
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          ))}

          {filteredReturns.length === 0 && (
            <EmptyState />
          )}
        </div>
      </div>

      {/* =================================================
          VIEW DETAILS MODAL
      ================================================= */}

      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() =>
              setSelectedReturn(null)
            }
          />

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* HEADER */}

            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-600 font-medium">
                  {selectedReturn.id}
                </p>

                <h2 className="text-lg font-semibold text-slate-900 mt-1">
                  Return Details
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedReturn(null)
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
                      {selectedReturn.item}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      {selectedReturn.category}
                    </p>
                  </div>
                </div>
              </div>

              {/* STATUS */}

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400">
                    Status
                  </p>

                  <span
                    className={`inline-flex mt-1 px-2.5 py-1 rounded-full border text-xs font-medium ${getStatusStyle(
                      selectedReturn.status,
                    )}`}
                  >
                    {selectedReturn.status}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-400">
                    Condition
                  </p>

                  <span
                    className={`inline-flex mt-1 px-2.5 py-1 rounded-full border text-xs font-medium ${getConditionStyle(
                      selectedReturn.condition,
                    )}`}
                  >
                    {selectedReturn.condition}
                  </span>
                </div>
              </div>

              {/* DETAILS */}

              <div className="grid grid-cols-2 gap-4">
                <Detail
                  label="Department"
                  value={selectedReturn.department}
                />

                <Detail
                  label="Returned By"
                  value={selectedReturn.returnedBy}
                />

                <Detail
                  label="Quantity"
                  value={`${selectedReturn.quantity} units`}
                />

                <Detail
                  label="Return Date"
                  value={selectedReturn.returnDate}
                />

                <Detail
                  label="Received By"
                  value={selectedReturn.receivedBy}
                />

                <Detail
                  label="Category"
                  value={selectedReturn.category}
                />
              </div>

              {/* REASON */}

              <div>
                <p className="text-xs text-slate-400">
                  Return Reason
                </p>

                <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                  {selectedReturn.reason}
                </p>
              </div>

              {/* REMARKS */}

              <div>
                <p className="text-xs text-slate-400">
                  Remarks
                </p>

                <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                  {selectedReturn.remarks}
                </p>
              </div>
            </div>

            {/* FOOTER */}

            <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() =>
                  setSelectedReturn(null)
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
          ADD RETURN MODAL
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
                  Add Return
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Record inventory returned by a department or staff member.
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

            <form onSubmit={handleSaveReturn}>
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Item"
                    placeholder="Select item"
                    required
                  />

                  <FormField
                    label="Quantity"
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
                    label="Returned By"
                    placeholder="Staff / Faculty name"
                    required
                  />

                  <FormField
                    label="Return Date"
                    type="date"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Condition
                      <span className="text-rose-500 ml-1">
                        *
                      </span>
                    </label>

                    <select
                      required
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="">
                        Select condition
                      </option>

                      <option value="Good">
                        Good
                      </option>

                      <option value="Repair">
                        Needs Repair
                      </option>

                      <option value="Damaged">
                        Damaged
                      </option>
                    </select>
                  </div>
                </div>

                {/* REASON */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Return Reason
                    <span className="text-rose-500 ml-1">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="Reason for returning the item"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                {/* STOCK OUT REFERENCE */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Stock Out Reference
                  </label>

                  <input
                    type="text"
                    placeholder="SOUT-2026-001"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />

                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Optional reference to the original stock-out transaction.
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

                {/* CONDITION INFO */}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ConditionInfo
                    icon={CircleCheck}
                    title="Good"
                    description="Ready to use"
                    className="bg-emerald-50 border-emerald-100 text-emerald-700"
                  />

                  <ConditionInfo
                    icon={Wrench}
                    title="Repair"
                    description="Needs maintenance"
                    className="bg-amber-50 border-amber-100 text-amber-700"
                  />

                  <ConditionInfo
                    icon={AlertTriangle}
                    title="Damaged"
                    description="Not usable"
                    className="bg-rose-50 border-rose-100 text-rose-700"
                  />
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
                  <ArrowDownLeft className="w-4 h-4" />
                  Save Return
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
          <Icon className={`w-5 h-5 ${iconClass}`} />
        </div>
      </div>
    </div>
  );
};

/* =====================================================
   MOBILE INFO
===================================================== */

const Info = ({ label, value }) => {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-slate-400">
        {label}
      </p>

      <p className="text-xs text-slate-700 mt-1 truncate">
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
   CONDITION INFO
===================================================== */

const ConditionInfo = ({
  icon: Icon,
  title,
  description,
  className,
}) => {
  return (
    <div
      className={`p-3 rounded-lg border ${className}`}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />

        <span className="text-xs font-semibold">
          {title}
        </span>
      </div>

      <p className="text-[11px] mt-1 opacity-80">
        {description}
      </p>
    </div>
  );
};

/* =====================================================
   EMPTY STATE
===================================================== */

const EmptyState = () => {
  return (
    <div className="py-16 text-center">
      <ArrowDownLeft className="w-10 h-10 text-slate-300 mx-auto mb-3" />

      <p className="text-sm font-medium text-slate-600">
        No return records found
      </p>

      <p className="text-xs text-slate-400 mt-1">
        Try changing your search or filters.
      </p>
    </div>
  );
};

export default Returns;