import React, { useMemo, useState } from "react";
import {
  ArrowUpFromLine,
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
} from "lucide-react";
import toast from "react-hot-toast";

const StockOut = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [stockOutRecords] = useState([
    {
      id: "SOUT-001",
      item: "A4 Copier Paper",
      category: "Stationery",
      quantity: 20,
      department: "Office Administration",
      issuedTo: "Rajesh Kumar",
      purpose: "Office documentation",
      issueDate: "2026-08-26",
      issuedBy: "Inventory Officer",
      status: "Issued",
      remarks: "Regular office requirement.",
    },
    {
      id: "SOUT-002",
      item: "Desktop Computer",
      category: "IT Equipment",
      quantity: 2,
      department: "Computer Science",
      issuedTo: "Dr. Priya Sharma",
      purpose: "Computer laboratory",
      issueDate: "2026-08-24",
      issuedBy: "Administrator",
      status: "Issued",
      remarks: "Issued to Computer Science Department.",
    },
    {
      id: "SOUT-003",
      item: "Office Chair",
      category: "Furniture",
      quantity: 5,
      department: "Commerce",
      issuedTo: "Suresh Babu",
      purpose: "Faculty seating",
      issueDate: "2026-08-21",
      issuedBy: "Inventory Officer",
      status: "Issued",
      remarks: "Issued against approved department request.",
    },
    {
      id: "SOUT-004",
      item: "LED Projector",
      category: "Electronics",
      quantity: 1,
      department: "English",
      issuedTo: "Dr. Anitha Rao",
      purpose: "Seminar presentation",
      issueDate: "2026-08-20",
      issuedBy: "Administrator",
      status: "Pending",
      remarks: "Awaiting final authorization.",
    },
    {
      id: "SOUT-005",
      item: "Whiteboard Marker",
      category: "Classroom Supplies",
      quantity: 30,
      department: "Mathematics",
      issuedTo: "Prof. Mahesh",
      purpose: "Classroom teaching",
      issueDate: "2026-08-17",
      issuedBy: "Inventory Officer",
      status: "Issued",
      remarks: "Monthly classroom requirement.",
    },
    {
      id: "SOUT-006",
      item: "Ball Pen - Blue",
      category: "Stationery",
      quantity: 50,
      department: "Administration",
      issuedTo: "Admin Office",
      purpose: "Official use",
      issueDate: "2026-08-14",
      issuedBy: "Inventory Officer",
      status: "Cancelled",
      remarks: "Request cancelled by department.",
    },
  ]);

  const filteredRecords = useMemo(() => {
    return stockOutRecords.filter((record) => {
      const query = search.toLowerCase();

      const matchesSearch =
        record.id.toLowerCase().includes(query) ||
        record.item.toLowerCase().includes(query) ||
        record.department.toLowerCase().includes(query) ||
        record.issuedTo.toLowerCase().includes(query) ||
        record.purpose.toLowerCase().includes(query) ||
        record.category.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [stockOutRecords, search, statusFilter]);

  const totalRecords = stockOutRecords.length;

  const issuedRecords = stockOutRecords.filter(
    (record) => record.status === "Issued",
  ).length;

  const pendingRecords = stockOutRecords.filter(
    (record) => record.status === "Pending",
  ).length;

  const totalQuantityIssued = stockOutRecords
    .filter((record) => record.status === "Issued")
    .reduce((sum, record) => sum + record.quantity, 0);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Issued":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";

      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const handleSaveStockOut = (event) => {
    event.preventDefault();

    toast.success("Stock Out record created successfully");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <ArrowUpFromLine className="w-5 h-5 text-orange-600" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Stock Out
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Track inventory issued to departments and staff.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Stock Out
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Records"
          value={totalRecords}
          icon={ClipboardList}
          iconClass="text-indigo-600"
          bgClass="bg-indigo-50"
        />

        <SummaryCard
          title="Issued"
          value={issuedRecords}
          icon={CheckCircle2}
          iconClass="text-emerald-600"
          bgClass="bg-emerald-50"
        />

        <SummaryCard
          title="Pending"
          value={pendingRecords}
          icon={FileText}
          iconClass="text-amber-600"
          bgClass="bg-amber-50"
        />

        <SummaryCard
          title="Quantity Issued"
          value={`${totalQuantityIssued} units`}
          icon={Package}
          iconClass="text-orange-600"
          bgClass="bg-orange-50"
          valueClass="text-xl"
        />
      </div>

      {/* CONTENT */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* TOOLBAR */}
        <div className="p-4 sm:p-5 border-b border-slate-200">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div className="relative w-full xl:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search stock out records..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full xl:w-auto px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="All">All Status</option>
              <option value="Issued">Issued</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Stock Out
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Item
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Department
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Issued To
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Quantity
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
              {filteredRecords.map((record) => (
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
                      {record.purpose}
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

                  {/* ISSUED TO */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <UserRound className="w-4 h-4 text-slate-400" />

                      <span className="text-sm text-slate-700">
                        {record.issuedTo}
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

                  {/* DATE */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CalendarDays className="w-4 h-4 text-slate-400" />

                      {record.issueDate}
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
                        onClick={() => setSelectedRecord(record)}
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

          {filteredRecords.length === 0 && <EmptyState />}
        </div>

        {/* MOBILE CARDS */}
        <div className="lg:hidden divide-y divide-slate-100">
          {filteredRecords.map((record) => (
            <div key={record.id} className="p-4">
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

              <div className="grid grid-cols-2 gap-4 mt-4">
                <Info
                  label="Department"
                  value={record.department}
                />

                <Info
                  label="Issued To"
                  value={record.issuedTo}
                />

                <Info
                  label="Quantity"
                  value={`${record.quantity} units`}
                />

                <Info
                  label="Issue Date"
                  value={record.issueDate}
                />

                <Info
                  label="Purpose"
                  value={record.purpose}
                />

                <Info
                  label="Category"
                  value={record.category}
                />
              </div>

              <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedRecord(record)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          ))}

          {filteredRecords.length === 0 && <EmptyState />}
        </div>
      </div>

      {/* DETAILS MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setSelectedRecord(null)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-600 font-medium">
                  {selectedRecord.id}
                </p>

                <h2 className="text-lg font-semibold text-slate-900 mt-1">
                  Stock Out Details
                </h2>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* ITEM */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                    <Package className="w-5 h-5 text-indigo-600" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {selectedRecord.item}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      {selectedRecord.category}
                    </p>
                  </div>
                </div>
              </div>

              {/* STATUS */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">
                    Status
                  </p>

                  <span
                    className={`inline-flex mt-1 px-2.5 py-1 rounded-full border text-xs font-medium ${getStatusStyle(
                      selectedRecord.status,
                    )}`}
                  >
                    {selectedRecord.status}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-400">
                    Issue Date
                  </p>

                  <p className="text-sm font-medium text-slate-800 mt-1">
                    {selectedRecord.issueDate}
                  </p>
                </div>
              </div>

              {/* DETAILS */}
              <div className="grid grid-cols-2 gap-4">
                <Detail
                  label="Department"
                  value={selectedRecord.department}
                />

                <Detail
                  label="Issued To"
                  value={selectedRecord.issuedTo}
                />

                <Detail
                  label="Quantity"
                  value={`${selectedRecord.quantity} units`}
                />

                <Detail
                  label="Purpose"
                  value={selectedRecord.purpose}
                />

                <Detail
                  label="Issued By"
                  value={selectedRecord.issuedBy}
                />

                <Detail
                  label="Category"
                  value={selectedRecord.category}
                />
              </div>

              {/* REMARKS */}
              <div>
                <p className="text-xs text-slate-400">
                  Remarks
                </p>

                <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                  {selectedRecord.remarks}
                </p>
              </div>
            </div>

            <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD STOCK OUT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            {/* HEADER */}
            <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Add Stock Out
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Record inventory issued to a department or staff member.
                </p>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSaveStockOut}>
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
                    label="Issued To"
                    placeholder="Staff / Faculty name"
                    required
                  />

                  <FormField
                    label="Issue Date"
                    type="date"
                    required
                  />

                  <FormField
                    label="Purpose"
                    placeholder="Reason for issuing"
                    required
                  />
                </div>

                {/* AUTHORIZATION */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Authorization / Request No.
                  </label>

                  <input
                    type="text"
                    placeholder="REQ-2026-012"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
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
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-700">
                  Stock availability should be verified before issuing
                  inventory to the department.
                </div>
              </div>

              {/* FOOTER */}
              <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
                >
                  <ArrowUpFromLine className="w-4 h-4" />
                  Save Stock Out
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* SUMMARY CARD */

const SummaryCard = ({
  title,
  value,
  icon: Icon,
  iconClass,
  bgClass,
  valueClass = "text-2xl",
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <h2
            className={`${valueClass} font-semibold text-slate-900 mt-2`}
          >
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

/* INFO */

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

/* DETAIL */

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

/* FORM FIELD */

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

/* EMPTY STATE */

const EmptyState = () => {
  return (
    <div className="py-16 text-center">
      <ArrowUpFromLine className="w-10 h-10 text-slate-300 mx-auto mb-3" />

      <p className="text-sm font-medium text-slate-600">
        No stock-out records found
      </p>

      <p className="text-xs text-slate-400 mt-1">
        Try changing your search or status filter.
      </p>
    </div>
  );
};

export default StockOut;