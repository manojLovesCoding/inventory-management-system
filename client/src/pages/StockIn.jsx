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

// =========================
// HELPERS
// =========================

const getToday = () => new Date().toISOString().split("T")[0];

const getEmptyForm = () => ({
  purchase: "",
  referenceNo: "",
  receivedDate: getToday(),
  supplier: "",
  supplierName: "",
  itemId: "",
  item: "",
  category: "",
  unit: "units",
  quantity: "",
  unitPrice: "",
  receivedBy: "",
  notes: "",
});

const getSupplierName = (supplier) => {
  if (!supplier) return "-";

  if (typeof supplier === "object") {
    return supplier.name || supplier.supplierId || "-";
  }

  return supplier;
};

// Resolve category objects and ObjectIds into category names.
const getCategoryName = (category, categoryOptions = []) => {
  if (!category) return "-";

  // Category is already populated.
  if (typeof category === "object") {
    if (category.name || category.categoryName) {
      return category.name || category.categoryName;
    }

    category = category._id || category.categoryId || "";
  }

  const matchedCategory = categoryOptions.find(
    (item) =>
      String(item._id) === String(category) ||
      String(item.categoryId) === String(category),
  );

  if (matchedCategory) {
    return matchedCategory.name || matchedCategory.categoryName || "-";
  }

  // Keep an existing text category instead of replacing it.
  // Avoid showing an unresolved MongoDB ObjectId.
  if (/^[a-f\d]{24}$/i.test(String(category))) {
    return "-";
  }

  return String(category);
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
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

const StockIn = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedStock, setSelectedStock] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [stockInRecords, setStockInRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState(getEmptyForm());

  const [purchases, setPurchases] = useState([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);

  const [categoryOptions, setCategoryOptions] = useState([]);

  const [isSaving, setIsSaving] = useState(false);

  // =========================
  // FETCH CATEGORIES
  // =========================

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");

      const data =
        response.data?.categories || response.data?.data || response.data || [];

      const categories = Array.isArray(data) ? data : [];

      setCategoryOptions(categories);

      return categories;
    } catch (error) {
      console.error("Fetch categories error:", error);

      toast.error(error.response?.data?.message || "Failed to load categories");

      setCategoryOptions([]);

      return [];
    }
  };

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
        error.response?.data?.message || "Failed to load stock-in records",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH PURCHASE ORDERS
  // =========================

  const fetchPurchases = async () => {
    try {
      setPurchasesLoading(true);

      const response = await api.get("/purchases");

      const data = response.data?.purchases || [];

      setPurchases(data.filter((purchase) => purchase.status !== "Cancelled"));
    } catch (error) {
      console.error("Fetch purchases error:", error);

      toast.error(
        error.response?.data?.message || "Failed to load purchase orders",
      );
    } finally {
      setPurchasesLoading(false);
    }
  };

  // Fetch categories first so category IDs can be resolved
  // when purchase orders and Stock In records are loaded.
  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();

      await Promise.all([fetchStockIns(), fetchPurchases()]);
    };

    loadData();
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
  // PO AUTO-FILL LOGIC
  // =========================

  // Quantity already received per purchase + item
  // from existing Stock In records.
  const receivedQtyMap = useMemo(() => {
    const map = {};

    stockInRecords.forEach((record) => {
      if (record.status !== "Received") return;

      const purchaseId =
        typeof record.purchase === "object"
          ? record.purchase?._id
          : record.purchase;

      if (!purchaseId) return;

      const key = `${purchaseId}::${record.item?.itemId}`;

      map[key] = (map[key] || 0) + Number(record.item?.quantity || 0);
    });

    return map;
  }, [stockInRecords]);

  const getRemainingQty = (purchase, purchaseItem) => {
    if (!purchase || !purchaseItem) return 0;

    const received =
      receivedQtyMap[`${purchase._id}::${purchaseItem.itemId}`] || 0;

    return Math.max(0, Number(purchaseItem.quantity) - received);
  };

  const selectedPurchase = purchases.find(
    (purchase) => purchase._id === formData.purchase,
  );

  const selectedPurchaseItem = selectedPurchase?.items?.find(
    (purchaseItem) => purchaseItem.itemId === formData.itemId,
  );

  const remainingQty = getRemainingQty(selectedPurchase, selectedPurchaseItem);

  const hasPendingItems = selectedPurchase?.items?.some(
    (purchaseItem) => getRemainingQty(selectedPurchase, purchaseItem) > 0,
  );

  const getItemFields = (purchase, purchaseItem) => {
    if (!purchaseItem) {
      return {
        itemId: "",
        item: "",
        category: "",
        unit: "units",
        quantity: "",
        unitPrice: "",
      };
    }

    return {
      itemId: purchaseItem.itemId,
      item: purchaseItem.name,

      // Resolve category ID into its readable name.
      category: getCategoryName(purchaseItem.category, categoryOptions),

      unit: purchaseItem.unit || "units",
      quantity: String(getRemainingQty(purchase, purchaseItem)),
      unitPrice: String(purchaseItem.unitPrice),
    };
  };

  // When a PO is selected -> fetch supplier + first pending item.
  const handlePurchaseSelect = (event) => {
    const purchase = purchases.find((p) => p._id === event.target.value);

    if (!purchase) {
      setFormData((prev) => ({
        ...getEmptyForm(),
        receivedBy: prev.receivedBy,
        notes: prev.notes,
      }));

      return;
    }

    const firstPendingItem = (purchase.items || []).find(
      (purchaseItem) => getRemainingQty(purchase, purchaseItem) > 0,
    );

    setFormData((prev) => ({
      ...prev,
      purchase: purchase._id,
      referenceNo: purchase.purchaseNo,
      supplier: purchase.supplier?._id || purchase.supplier || "",
      supplierName: getSupplierName(purchase.supplier),
      ...getItemFields(purchase, firstPendingItem),
    }));
  };

  // When a different item of the same PO is chosen.
  const handlePurchaseItemSelect = (event) => {
    const purchaseItem = selectedPurchase?.items?.find(
      (item) => item.itemId === event.target.value,
    );

    setFormData((prev) => ({
      ...prev,
      ...getItemFields(selectedPurchase, purchaseItem),
    }));
  };

  // =========================
  // MODAL OPEN / CLOSE / RESET
  // =========================

  const resetForm = () => {
    setFormData(getEmptyForm());
  };

  const openAddModal = () => {
    resetForm();
    fetchPurchases();
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  // =========================
  // CREATE STOCK IN
  // =========================

  const handleSaveStock = async (event) => {
    event.preventDefault();

    if (!selectedPurchase) {
      toast.error("Please select a Reference / PO number");
      return;
    }

    if (!selectedPurchaseItem) {
      toast.error("Please select a purchase item");
      return;
    }

    if (remainingQty <= 0) {
      toast.error("This item has already been fully received");
      return;
    }

    if (Number(formData.quantity) <= 0) {
      toast.error("Quantity must be greater than zero");
      return;
    }

    if (Number(formData.quantity) > remainingQty) {
      toast.error(
        `Quantity cannot exceed the pending quantity (${remainingQty})`,
      );

      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        referenceNo: formData.referenceNo,
        purchase: formData.purchase,
        supplier: formData.supplier,
        receivedDate: formData.receivedDate,
        receivedBy: formData.receivedBy.trim(),
        status: "Received",

        item: {
          itemId: formData.itemId,
          item: formData.item,

          // Save the resolved category name.
          category: formData.category,

          unit: formData.unit || "units",
          quantity: Number(formData.quantity),
          unitPrice: Number(formData.unitPrice),
        },

        notes: formData.notes.trim(),
      };

      const response = await api.post("/stock-in", payload);

      if (response.data?.success) {
        toast.success(
          response.data.message || "Stock In record created successfully",
        );

        closeAddModal();

        await fetchStockIns();
      } else {
        toast.error(
          response.data?.message || "Failed to create Stock In record",
        );
      }
    } catch (error) {
      console.error("Create stock in error:", error);

      toast.error(
        error.response?.data?.message || "Failed to create Stock In record",
      );
    } finally {
      setIsSaving(false);
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

      const category = getCategoryName(record.item?.category, categoryOptions);

      const matchesSearch =
        record.stockInNo?.toLowerCase().includes(query) ||
        record.referenceNo?.toLowerCase().includes(query) ||
        itemName.toLowerCase().includes(query) ||
        itemId.toLowerCase().includes(query) ||
        supplierName.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [stockInRecords, search, statusFilter, categoryOptions]);

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
    .reduce((sum, record) => sum + Number(record.item?.totalValue || 0), 0);

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
          onClick={openAddModal}
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
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search stock in records..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
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
                              {getCategoryName(
                                record.item?.category,
                                categoryOptions,
                              )}
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
                          {formatCurrency(record.item?.totalValue)}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          {formatCurrency(record.item?.unitPrice)} / unit
                        </p>
                      </td>

                      {/* DATE */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays className="w-4 h-4 text-slate-400" />

                          {formatDate(record.receivedDate)}
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
                            onClick={() => setSelectedStock(record)}
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
                <div key={record._id} className="p-4">
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
                    <Info label="Reference" value={record.referenceNo} />

                    <Info
                      label="Quantity"
                      value={`${record.item?.quantity || 0} ${
                        record.item?.unit || "units"
                      }`}
                    />

                    <Info
                      label="Supplier"
                      value={getSupplierName(record.supplier)}
                    />

                    <Info
                      label="Value"
                      value={formatCurrency(record.item?.totalValue)}
                    />

                    <Info
                      label="Received Date"
                      value={formatDate(record.receivedDate)}
                    />

                    <Info
                      label="Category"
                      value={getCategoryName(
                        record.item?.category,
                        categoryOptions,
                      )}
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
                      {getCategoryName(
                        selectedStock.item?.category,
                        categoryOptions,
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* STATUS */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Status</p>

                  <span
                    className={`inline-flex mt-1 px-2.5 py-1 rounded-full border text-xs font-medium ${getStatusStyle(
                      selectedStock.status,
                    )}`}
                  >
                    {selectedStock.status}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-400">Reference</p>

                  <p className="text-sm font-medium text-slate-800 mt-1">
                    {selectedStock.referenceNo}
                  </p>
                </div>
              </div>

              {/* DETAILS */}
              <div className="grid grid-cols-2 gap-4">
                <Detail
                  label="Supplier"
                  value={getSupplierName(selectedStock.supplier)}
                />

                <Detail
                  label="Quantity"
                  value={`${selectedStock.item?.quantity || 0} ${
                    selectedStock.item?.unit || "units"
                  }`}
                />

                <Detail
                  label="Unit Price"
                  value={formatCurrency(selectedStock.item?.unitPrice)}
                />

                <Detail
                  label="Total Value"
                  value={formatCurrency(selectedStock.item?.totalValue)}
                />

                <Detail
                  label="Received Date"
                  value={formatDate(selectedStock.receivedDate)}
                />

                <Detail label="Received By" value={selectedStock.receivedBy} />
              </div>

              {/* ITEM ID */}
              <Detail label="Item ID" value={selectedStock.item?.itemId} />

              {/* NOTES */}
              <div>
                <p className="text-xs text-slate-400">Notes</p>

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
            onClick={closeAddModal}
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            {/* HEADER */}
            <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Add Stock In
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Select a PO number and the details will be filled in
                  automatically.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddModal}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSaveStock}>
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* REFERENCE / PO NUMBER */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Reference / PO Number
                      <span className="text-rose-500 ml-1">*</span>
                    </label>

                    <select
                      value={formData.purchase}
                      onChange={handlePurchaseSelect}
                      disabled={purchasesLoading}
                      required
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      <option value="">
                        {purchasesLoading
                          ? "Loading purchase orders..."
                          : purchases.length === 0
                            ? "No purchase orders found"
                            : "Select PO number"}
                      </option>

                      {purchases.map((purchase) => (
                        <option key={purchase._id} value={purchase._id}>
                          {purchase.purchaseNo} —{" "}
                          {getSupplierName(purchase.supplier)} (
                          {purchase.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <FormField
                    label="Received Date"
                    name="receivedDate"
                    type="date"
                    value={formData.receivedDate}
                    onChange={handleFormChange}
                    required
                  />

                  <FormField
                    label="Supplier"
                    name="supplierName"
                    value={formData.supplierName}
                    placeholder="Auto-filled from PO"
                    readOnly
                  />

                  {/* PO ITEM */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      PO Item
                      <span className="text-rose-500 ml-1">*</span>
                    </label>

                    <select
                      value={formData.itemId}
                      onChange={handlePurchaseItemSelect}
                      disabled={!selectedPurchase}
                      required
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      <option value="">
                        {selectedPurchase ? "Select item" : "Select a PO first"}
                      </option>

                      {(selectedPurchase?.items || []).map((purchaseItem) => {
                        const pending = getRemainingQty(
                          selectedPurchase,
                          purchaseItem,
                        );

                        return (
                          <option
                            key={purchaseItem.itemId}
                            value={purchaseItem.itemId}
                            disabled={pending <= 0}
                          >
                            {purchaseItem.name} —{" "}
                            {pending > 0
                              ? `${pending} of ${purchaseItem.quantity} pending`
                              : "fully received"}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <FormField
                    label="Item ID"
                    name="itemId"
                    value={formData.itemId}
                    placeholder="Auto-filled"
                    readOnly
                  />

                  <FormField
                    label="Item"
                    name="item"
                    value={formData.item}
                    placeholder="Auto-filled"
                    readOnly
                  />

                  <FormField
                    label="Category"
                    name="category"
                    value={formData.category}
                    placeholder="Auto-filled"
                    readOnly
                  />

                  <FormField
                    label="Unit"
                    name="unit"
                    value={formData.unit}
                    placeholder="Auto-filled"
                    readOnly
                  />

                  <FormField
                    label={
                      remainingQty > 0
                        ? `Quantity Received (max ${remainingQty})`
                        : "Quantity Received"
                    }
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleFormChange}
                    placeholder="0"
                    min="0.01"
                    max={remainingQty || undefined}
                    step="0.01"
                    required
                  />

                  <FormField
                    label="Unit Price"
                    name="unitPrice"
                    type="number"
                    value={formData.unitPrice}
                    placeholder="Auto-filled"
                    readOnly
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

                {selectedPurchase && !hasPendingItems && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
                    All items in this purchase order have already been received.
                  </div>
                )}

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
                  Once received, the quantity will be added to the item's
                  available stock.
                </div>
              </div>

              {/* FOOTER */}
              <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    isSaving || !selectedPurchaseItem || remainingQty <= 0
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save Stock In"}
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

          <h2 className={`${valueClass} font-semibold text-slate-900 mt-2`}>
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

      <p className="text-xs text-slate-700 mt-1 truncate">{value || "-"}</p>
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

      <p className="text-sm font-medium text-slate-800 mt-1">{value || "-"}</p>
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
  max,
  step,
  readOnly = false,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}

        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        min={min}
        max={max}
        step={step}
        className={`w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
          readOnly ? "bg-slate-50 text-slate-600 cursor-not-allowed" : ""
        }`}
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
