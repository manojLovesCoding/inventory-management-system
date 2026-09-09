import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

const StockIn = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedStock, setSelectedStock] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [stockInRecords, setStockInRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    referenceNo: "",
    receivedDate: "",
    supplier: "",
    itemId: "",
    item: "",
    category: "",
    unit: "units",
    quantity: "",
    unitPrice: "",
    receivedBy: "",
    notes: "",
  });

  // =========================
  // FETCH STOCK IN RECORDS
  // =========================

  const fetchStockIns = async () => {
    try {
      setLoading(true);

      const response = await api.get("/stock-in");

      if (response.data?.success) {
        setStockInRecords(response.data.stockIns || []);
      } else {
        toast.error(
          response.data?.message || "Failed to fetch stock-in records",
        );
      }
    } catch (error) {
      console.error("Fetch stock in error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load stock-in records",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockIns();
  }, []);

  // =========================
  // FORM CHANGE
  // =========================

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setFormData({
      referenceNo: "",
      receivedDate: "",
      supplier: "",
      itemId: "",
      item: "",
      category: "",
      unit: "units",
      quantity: "",
      unitPrice: "",
      receivedBy: "",
      notes: "",
    });
  };

  // =========================
  // CREATE STOCK IN
  // =========================

  const handleSaveStock = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        referenceNo: formData.referenceNo.trim(),
        receivedDate: formData.receivedDate,
        supplier: formData.supplier.trim(),
        receivedBy: formData.receivedBy.trim(),

        item: {
          itemId: formData.itemId.trim(),
          item: formData.item.trim(),
          category: formData.category.trim(),
          unit: formData.unit.trim() || "units",
          quantity: Number(formData.quantity),
          unitPrice: Number(formData.unitPrice),
        },

        notes: formData.notes.trim(),
      };

      const response = await api.post(
        "/stock-in",
        payload,
      );

      if (response.data?.success) {
        toast.success(
          response.data.message ||
            "Stock In record created successfully",
        );

        setShowAddModal(false);
        resetForm();

        await fetchStockIns();
      } else {
        toast.error(
          response.data?.message ||
            "Failed to create Stock In record",
        );
      }
    } catch (error) {
      console.error("Create stock in error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to create Stock In record",
      );
    }
  };

  // =========================
  // FILTER
  // =========================

  const filteredRecords = useMemo(() => {
    return stockInRecords.filter((record) => {
      const query = search.toLowerCase().trim();

      const supplierName =
        typeof record.supplier === "object"
          ? record.supplier?.name || ""
          : record.supplier || "";

      const itemName = record.item?.item || "";
      const itemId = record.item?.itemId || "";
      const category = record.item?.category || "";

      const matchesSearch =
        record.stockInNo
          ?.toLowerCase()
          .includes(query) ||
        record.referenceNo
          ?.toLowerCase()
          .includes(query) ||
        itemName.toLowerCase().includes(query) ||
        itemId.toLowerCase().includes(query) ||
        supplierName.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [stockInRecords, search, statusFilter]);

  // =========================
  // SUMMARY
  // =========================

  const totalRecords = stockInRecords.length;

  const receivedRecords = stockInRecords.filter(
    (record) => record.status === "Received",
  ).length;

  const pendingRecords = stockInRecords.filter(
    (record) => record.status === "Pending",
  ).length;

  const totalValue = stockInRecords
    .filter((record) => record.status === "Received")
    .reduce(
      (sum, record) =>
        sum + Number(record.item?.totalValue || 0),
      0,
    );

  // =========================
  // FORMAT CURRENCY
  // =========================

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  };

  // =========================
  // STATUS STYLE
  // =========================

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

  // =========================
  // SUPPLIER NAME
  // =========================

  const getSupplierName = (supplier) => {
    if (!supplier) return "-";

    if (typeof supplier === "object") {
      return supplier.name || supplier.supplierId || "-";
    }

    return supplier;
  };

  // =========================
  // DATE FORMAT
  // =========================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
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

        {/* LOADING */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />

            <p className="text-sm text-slate-500 mt-3">
              Loading stock-in records...
            </p>
          </div>
        ) : (
          <>
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
                      key={record._id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* STOCK ID */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-indigo-600">
                          {record.stockInNo}
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
                              {record.item?.item}
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                              {record.item?.category}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* SUPPLIER */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-slate-400" />

                          <span className="text-sm text-slate-700">
                            {getSupplierName(record.supplier)}
                          </span>
                        </div>
                      </td>

                      {/* QUANTITY */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-slate-800">
                          {record.item?.quantity}
                        </span>

                        <span className="text-xs text-slate-400 ml-1">
                          {record.item?.unit || "units"}
                        </span>
                      </td>

                      {/* VALUE */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-800">
                          {formatCurrency(
                            record.item?.totalValue,
                          )}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          {formatCurrency(
                            record.item?.unitPrice,
                          )}{" "}
                          / unit
                        </p>
                      </td>

                      {/* DATE */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays className="w-4 h-4 text-slate-400" />

                          {formatDate(
                            record.receivedDate,
                          )}
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

              {filteredRecords.length === 0 && (
                <EmptyState />
              )}
            </div>

            {/* MOBILE */}
            <div className="lg:hidden divide-y divide-slate-100">
              {filteredRecords.map((record) => (
                <div
                  key={record._id}
                  className="p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-slate-500" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {record.item?.item}
                        </p>

                        <p className="text-xs text-indigo-600 mt-1">
                          {record.stockInNo}
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
                      value={`${record.item?.quantity || 0} ${
                        record.item?.unit || "units"
                      }`}
                    />

                    <Info
                      label="Supplier"
                      value={getSupplierName(
                        record.supplier,
                      )}
                    />

                    <Info
                      label="Value"
                      value={formatCurrency(
                        record.item?.totalValue,
                      )}
                    />

                    <Info
                      label="Received Date"
                      value={formatDate(
                        record.receivedDate,
                      )}
                    />

                    <Info
                      label="Category"
                      value={record.item?.category}
                    />
                  </div>

                  <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() =>
                        setSelectedStock(record)
                      }
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}

              {filteredRecords.length === 0 && (
                <EmptyState />
              )}
            </div>
          </>
        )}
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
                  {selectedStock.stockInNo}
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
                      {selectedStock.item?.item}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      {selectedStock.item?.category}
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
                  value={getSupplierName(
                    selectedStock.supplier,
                  )}
                />

                <Detail
                  label="Quantity"
                  value={`${selectedStock.item?.quantity || 0} ${
                    selectedStock.item?.unit || "units"
                  }`}
                />

                <Detail
                  label="Unit Price"
                  value={formatCurrency(
                    selectedStock.item?.unitPrice,
                  )}
                />

                <Detail
                  label="Total Value"
                  value={formatCurrency(
                    selectedStock.item?.totalValue,
                  )}
                />

                <Detail
                  label="Received Date"
                  value={formatDate(
                    selectedStock.receivedDate,
                  )}
                />

                <Detail
                  label="Received By"
                  value={selectedStock.receivedBy}
                />
              </div>

              {/* ITEM ID */}
              <Detail
                label="Item ID"
                value={selectedStock.item?.itemId}
              />

              {/* NOTES */}
              <div>
                <p className="text-xs text-slate-400">
                  Notes
                </p>

                <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                  {selectedStock.notes || "No notes added."}
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
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
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
                    name="referenceNo"
                    value={formData.referenceNo}
                    onChange={handleFormChange}
                    placeholder="PO-2026-045"
                    required
                  />

                  <FormField
                    label="Received Date"
                    name="receivedDate"
                    type="date"
                    value={formData.receivedDate}
                    onChange={handleFormChange}
                    required
                  />

                  <FormField
                    label="Supplier ID"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleFormChange}
                    placeholder="Enter supplier ObjectId"
                    required
                  />

                  <FormField
                    label="Item ID"
                    name="itemId"
                    value={formData.itemId}
                    onChange={handleFormChange}
                    placeholder="ITEM-001"
                    required
                  />

                  <FormField
                    label="Item"
                    name="item"
                    value={formData.item}
                    onChange={handleFormChange}
                    placeholder="A4 Copier Paper"
                    required
                  />

                  <FormField
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    placeholder="Stationery"
                    required
                  />

                  <FormField
                    label="Quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleFormChange}
                    placeholder="0"
                    min="0.01"
                    step="0.01"
                    required
                  />

                  <FormField
                    label="Unit Price"
                    name="unitPrice"
                    type="number"
                    value={formData.unitPrice}
                    onChange={handleFormChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />

                  <FormField
                    label="Unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleFormChange}
                    placeholder="units"
                  />

                  <FormField
                    label="Received By"
                    name="receivedBy"
                    value={formData.receivedBy}
                    onChange={handleFormChange}
                    placeholder="Inventory Officer"
                    required
                  />
                </div>

                {/* NOTES */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleFormChange}
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
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
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
      <p className="text-[11px] text-slate-400">
        {label}
      </p>

      <p className="text-xs text-slate-700 mt-1 truncate">
        {value || "-"}
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
      <p className="text-[11px] text-slate-400">
        {label}
      </p>

      <p className="text-sm font-medium text-slate-800 mt-1">
        {value || "-"}
      </p>
    </div>
  );
};

/* -------------------------------- */
/* FORM FIELD */
/* -------------------------------- */

const FormField = ({
  label,
  name,
  type = "text",
  placeholder,
  required,
  value,
  onChange,
  min,
  step,
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
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
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
