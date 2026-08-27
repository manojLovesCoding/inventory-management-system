import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Eye,
  FilePlus2,
  Package,
  Plus,
  Search,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const StockIn = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedStock, setSelectedStock] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [stockInRecords] = useState([
    {
      id: "SIN-001",
      referenceNo: "PO-2026-041",
      supplier: "Karnataka Office Supplies",
      item: "A4 Copier Paper",
      category: "Stationery",
      quantity: 100,
      unitPrice: 285,
      totalValue: 28500,
      receivedDate: "2026-08-25",
      receivedBy: "Inventory Officer",
      status: "Received",
      notes: "Monthly stationery supply.",
    },
    {
      id: "SIN-002",
      referenceNo: "PO-2026-038",
      supplier: "Tech Solutions India",
      item: "Desktop Computer",
      category: "IT Equipment",
      quantity: 5,
      unitPrice: 48500,
      totalValue: 242500,
      receivedDate: "2026-08-22",
      receivedBy: "Administrator",
      status: "Received",
      notes: "New computers for Computer Science Department.",
    },
    {
      id: "SIN-003",
      referenceNo: "PO-2026-035",
      supplier: "Campus Furniture Works",
      item: "Office Chair",
      category: "Furniture",
      quantity: 20,
      unitPrice: 4200,
      totalValue: 84000,
      receivedDate: "2026-08-19",
      receivedBy: "Inventory Officer",
      status: "Received",
      notes: "Furniture received for newly renovated office rooms.",
    },
    {
      id: "SIN-004",
      referenceNo: "PO-2026-032",
      supplier: "Digital Education Systems",
      item: "LED Projector",
      category: "Electronics",
      quantity: 3,
      unitPrice: 38500,
      totalValue: 115500,
      receivedDate: "2026-08-16",
      receivedBy: "Administrator",
      status: "Pending",
      notes: "Awaiting final inspection and verification.",
    },
    {
      id: "SIN-005",
      referenceNo: "PO-2026-028",
      supplier: "Classroom Supplies Co.",
      item: "Whiteboard Marker",
      category: "Classroom Supplies",
      quantity: 200,
      unitPrice: 28,
      totalValue: 5600,
      receivedDate: "2026-08-12",
      receivedBy: "Inventory Officer",
      status: "Received",
      notes: "Classroom consumables.",
    },
    {
      id: "SIN-006",
      referenceNo: "PO-2026-025",
      supplier: "Karnataka Office Supplies",
      item: "Ball Pen - Blue",
      category: "Stationery",
      quantity: 500,
      unitPrice: 8,
      totalValue: 4000,
      receivedDate: "2026-08-08",
      receivedBy: "Inventory Officer",
      status: "Cancelled",
      notes: "Purchase cancelled due to supplier delivery issue.",
    },
  ]);

  const filteredRecords = useMemo(() => {
    return stockInRecords.filter((record) => {
      const query = search.toLowerCase();

      const matchesSearch =
        record.id.toLowerCase().includes(query) ||
        record.referenceNo.toLowerCase().includes(query) ||
        record.item.toLowerCase().includes(query) ||
        record.supplier.toLowerCase().includes(query) ||
        record.category.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [stockInRecords, search, statusFilter]);

  const totalRecords = stockInRecords.length;

  const receivedRecords = stockInRecords.filter(
    (record) => record.status === "Received",
  ).length;

  const pendingRecords = stockInRecords.filter(
    (record) => record.status === "Pending",
  ).length;

  const totalValue = stockInRecords
    .filter((record) => record.status === "Received")
    .reduce((sum, record) => sum + record.totalValue, 0);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Received":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";

      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const handleSaveStock = (event) => {
    event.preventDefault();

    toast.success("Stock In record created successfully");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <FilePlus2 className="w-5 h-5 text-indigo-600" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Stock In
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Record items received into the college inventory.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Stock In
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Records"
          value={totalRecords}
          icon={FilePlus2}
          iconClass="text-indigo-600"
          bgClass="bg-indigo-50"
        />

        <SummaryCard
          title="Received"
          value={receivedRecords}
          icon={CheckCircle2}
          iconClass="text-emerald-600"
          bgClass="bg-emerald-50"
        />

        <SummaryCard
          title="Pending"
          value={pendingRecords}
          icon={Truck}
          iconClass="text-amber-600"
          bgClass="bg-amber-50"
        />

        <SummaryCard
          title="Received Value"
          value={formatCurrency(totalValue)}
          icon={Package}
          iconClass="text-violet-600"
          bgClass="bg-violet-50"
          valueClass="text-xl"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* TOOLBAR */}
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
                placeholder="Search stock in records..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="w-full xl:w-auto px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="All">All Status</option>
              <option value="Received">Received</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Stock In
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Item
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Supplier
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Quantity
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Value
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
                  {/* STOCK ID */}
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-indigo-600">
                      {record.id}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      {record.referenceNo}
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

                  {/* SUPPLIER */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-slate-400" />

                      <span className="text-sm text-slate-700">
                        {record.supplier}
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

                  {/* VALUE */}
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-slate-800">
                      {formatCurrency(record.totalValue)}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      {formatCurrency(record.unitPrice)} / unit
                    </p>
                  </td>

                  {/* DATE */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CalendarDays className="w-4 h-4 text-slate-400" />
                      {record.receivedDate}
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
                          setSelectedStock(record)
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

          {filteredRecords.length === 0 && <EmptyState />}
        </div>

        {/* MOBILE */}
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
                  label="Reference"
                  value={record.referenceNo}
                />

                <Info
                  label="Quantity"
                  value={`${record.quantity} units`}
                />

                <Info
                  label="Supplier"
                  value={record.supplier}
                />

                <Info
                  label="Value"
                  value={formatCurrency(record.totalValue)}
                />

                <Info
                  label="Received Date"
                  value={record.receivedDate}
                />

                <Info
                  label="Category"
                  value={record.category}
                />
              </div>

              <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedStock(record)}
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
      {selectedStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setSelectedStock(null)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-600 font-medium">
                  {selectedStock.id}
                </p>

                <h2 className="text-lg font-semibold text-slate-900 mt-1">
                  Stock In Details
                </h2>
              </div>

              <button
                onClick={() => setSelectedStock(null)}
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
                      {selectedStock.item}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      {selectedStock.category}
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
                      selectedStock.status,
                    )}`}
                  >
                    {selectedStock.status}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-400">
                    Reference
                  </p>

                  <p className="text-sm font-medium text-slate-800 mt-1">
                    {selectedStock.referenceNo}
                  </p>
                </div>
              </div>

              {/* DETAILS */}
              <div className="grid grid-cols-2 gap-4">
                <Detail
                  label="Supplier"
                  value={selectedStock.supplier}
                />

                <Detail
                  label="Quantity"
                  value={`${selectedStock.quantity} units`}
                />

                <Detail
                  label="Unit Price"
                  value={formatCurrency(
                    selectedStock.unitPrice,
                  )}
                />

                <Detail
                  label="Total Value"
                  value={formatCurrency(
                    selectedStock.totalValue,
                  )}
                />

                <Detail
                  label="Received Date"
                  value={selectedStock.receivedDate}
                />

                <Detail
                  label="Received By"
                  value={selectedStock.receivedBy}
                />
              </div>

              {/* NOTES */}
              <div>
                <p className="text-xs text-slate-400">
                  Notes
                </p>

                <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                  {selectedStock.notes}
                </p>
              </div>
            </div>

            <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedStock(null)}
                className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD STOCK MODAL */}
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
                  Add Stock In
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Record newly received inventory.
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
            <form onSubmit={handleSaveStock}>
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Reference / PO Number"
                    placeholder="PO-2026-045"
                    required
                  />

                  <FormField
                    label="Received Date"
                    type="date"
                    required
                  />

                  <FormField
                    label="Supplier"
                    placeholder="Select supplier"
                    required
                  />

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
                    label="Unit Price"
                    type="number"
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* NOTES */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Notes
                  </label>

                  <textarea
                    rows="3"
                    placeholder="Enter any additional information..."
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                {/* INFO */}
                <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-xs text-indigo-700">
                  Once received, the quantity will be added to the
                  item's available stock.
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
                  <CheckCircle2 className="w-4 h-4" />
                  Save Stock In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------------------- */
/* SUMMARY CARD */
/* -------------------------------- */

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

/* -------------------------------- */
/* INFO */
/* -------------------------------- */

const Info = ({ label, value }) => {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-slate-400">{label}</p>

      <p className="text-xs text-slate-700 mt-1 truncate">
        {value}
      </p>
    </div>
  );
};

/* -------------------------------- */
/* DETAIL */
/* -------------------------------- */

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

/* -------------------------------- */
/* FORM FIELD */
/* -------------------------------- */

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
          <span className="text-rose-500 ml-1">*</span>
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

/* -------------------------------- */
/* EMPTY STATE */
/* -------------------------------- */

const EmptyState = () => {
  return (
    <div className="py-16 text-center">
      <FilePlus2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />

      <p className="text-sm font-medium text-slate-600">
        No stock-in records found
      </p>

      <p className="text-xs text-slate-400 mt-1">
        Try changing your search or status filter.
      </p>
    </div>
  );
};

export default StockIn;