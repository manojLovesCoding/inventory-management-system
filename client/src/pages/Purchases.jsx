import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  FileText,
  Package,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShoppingCart,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios.js";

const purchaseStatuses = [
  "Draft",
  "Ordered",
  "Received",
  "Partially Received",
  "Cancelled",
];

const getToday = () => new Date().toISOString().split("T")[0];

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getSupplierName = (purchase) => {
  if (!purchase?.supplier) return "-";

  if (typeof purchase.supplier === "string") {
    return purchase.supplier;
  }

  return (
    purchase.supplier.name ||
    purchase.supplier.supplierName ||
    purchase.supplier.supplierId ||
    purchase.supplier._id ||
    "-"
  );
};

const getDepartmentName = (purchase) => {
  if (!purchase?.department) return "-";

  if (typeof purchase.department === "string") {
    return purchase.department;
  }

  return (
    purchase.department.name ||
    purchase.department.departmentName ||
    purchase.department._id ||
    "-"
  );
};

// Inventory category can be a plain string or a populated object
const getInventoryCategory = (inventoryItem) => {
  if (!inventoryItem?.category) return "";

  if (typeof inventoryItem.category === "object") {
    return inventoryItem.category.name || "";
  }

  return inventoryItem.category;
};

const getStatusClasses = (status) => {
  switch (status) {
    case "Received":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "Ordered":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "Partially Received":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "Cancelled":
      return "bg-rose-50 text-rose-700 border-rose-100";
    case "Draft":
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
};

const Purchases = () => {
  // =====================================================
  // PURCHASE LIST
  // =====================================================

  const [purchases, setPurchases] = useState([]);
  const [purchaseLoading, setPurchaseLoading] = useState(true);
  const [purchaseRefreshing, setPurchaseRefreshing] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedPurchaseId, setExpandedPurchaseId] = useState(null);

  // =====================================================
  // PURCHASE FORM
  // =====================================================

  const [purchaseNo, setPurchaseNo] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(getToday());

  // Department state
  const [departments, setDepartments] = useState([]);
  const [departmentLoading, setDepartmentLoading] = useState(true);
  const [departmentId, setDepartmentId] = useState("");

  // Supplier state
  const [suppliers, setSuppliers] = useState([]);
  const [supplierLoading, setSupplierLoading] = useState(true);
  const [supplierId, setSupplierId] = useState("");

  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [status, setStatus] = useState("Draft");
  const [orderedBy, setOrderedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([]);

  // =====================================================
  // INVENTORY (for Item ID dropdown)
  // =====================================================

  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);

  // =====================================================
  // ITEM MODAL
  // =====================================================

  const [showItemModal, setShowItemModal] = useState(false);

  const [itemId, setItemId] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [itemUnit, setItemUnit] = useState("");

  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [taxRate, setTaxRate] = useState("18");
  const [discount, setDiscount] = useState("0");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // =====================================================
  // LOAD PURCHASE ORDERS
  // =====================================================

  const fetchPurchases = async (showLoader = true) => {
    try {
      if (showLoader) {
        setPurchaseLoading(true);
      } else {
        setPurchaseRefreshing(true);
      }

      setPurchaseError("");

      const response = await api.get("/purchases");

      const purchaseData =
        response?.data?.purchases || response?.data?.data || [];

      setPurchases(Array.isArray(purchaseData) ? purchaseData : []);
    } catch (error) {
      console.error("Fetch purchases error:", error);

      const message = getErrorMessage(error, "Failed to load purchase orders");

      setPurchaseError(message);
      toast.error(message);
    } finally {
      setPurchaseLoading(false);
      setPurchaseRefreshing(false);
    }
  };

  // =====================================================
  // LOAD INVENTORY ITEMS
  // =====================================================

  const fetchInventory = async () => {
    try {
      setInventoryLoading(true);

      const response = await api.get("/inventory");

      const inventoryData =
        response?.data?.inventory ||
        response?.data?.items ||
        response?.data?.data ||
        [];

      setInventoryItems(Array.isArray(inventoryData) ? inventoryData : []);
    } catch (error) {
      console.error("Fetch inventory error:", error);

      toast.error(getErrorMessage(error, "Failed to load inventory items"));
    } finally {
      setInventoryLoading(false);
    }
  };

  // =====================================================
  // LOAD DEPARTMENTS
  // =====================================================

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setDepartmentLoading(true);

        const response = await api.get("/departments");

        const departmentData =
          response?.data?.departments || response?.data?.data || [];

        setDepartments(Array.isArray(departmentData) ? departmentData : []);
      } catch (error) {
        console.error("Fetch departments error:", error);

        toast.error(getErrorMessage(error, "Failed to load departments"));
      } finally {
        setDepartmentLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // =====================================================
  // LOAD SUPPLIERS
  // =====================================================

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setSupplierLoading(true);

        const response = await api.get("/suppliers");

        const supplierData =
          response?.data?.suppliers || response?.data?.data || [];

        setSuppliers(Array.isArray(supplierData) ? supplierData : []);
      } catch (error) {
        console.error("Fetch suppliers error:", error);

        toast.error(getErrorMessage(error, "Failed to load suppliers"));
      } finally {
        setSupplierLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  // =====================================================
  // LOAD PURCHASES + INVENTORY ON PAGE LOAD
  // =====================================================

  useEffect(() => {
    fetchPurchases();
    fetchInventory();
  }, []);

  // =====================================================
  // SELECTED DEPARTMENT AND SUPPLIER
  // =====================================================

  const selectedDepartment = departments.find(
    (department) => department._id === departmentId,
  );

  const selectedSupplier = suppliers.find(
    (supplier) => supplier._id === supplierId,
  );

  // =====================================================
  // PURCHASE TOTALS
  // =====================================================

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
        0,
      ),
    [items],
  );

  const totalDiscount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.discount || 0), 0),
    [items],
  );

  const totalTax = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.taxAmount || 0), 0),
    [items],
  );

  const taxableAmount = Math.max(0, subtotal - totalDiscount);
  const grandTotal = taxableAmount + totalTax;

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity), 0),
    [items],
  );

  // =====================================================
  // FILTER PURCHASE ORDERS
  // =====================================================

  const filteredPurchases = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return purchases.filter((purchase) => {
      const purchaseNumber = String(purchase?.purchaseNo || "").toLowerCase();

      const supplierName = getSupplierName(purchase).toLowerCase();

      const invoiceNumber = String(purchase?.invoiceNo || "").toLowerCase();

      const orderedByValue = String(purchase?.orderedBy || "").toLowerCase();

      const statusValue = purchase?.status || "Draft";

      const matchesSearch =
        !query ||
        purchaseNumber.includes(query) ||
        supplierName.includes(query) ||
        invoiceNumber.includes(query) ||
        orderedByValue.includes(query);

      const matchesStatus =
        statusFilter === "All" || statusValue === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [purchases, searchTerm, statusFilter]);

  // =====================================================
  // ITEM MODAL
  // =====================================================

  const openItemModal = () => {
    setItemId("");
    setItemName("");
    setItemCategory("");
    setItemUnit("");

    setQuantity("");
    setUnitPrice("");
    setTaxRate("18");
    setDiscount("0");

    // Refresh so newly created inventory items appear in the dropdown
    fetchInventory();

    setShowItemModal(true);
  };

  const closeItemModal = () => {
    setItemId("");
    setItemName("");
    setItemCategory("");
    setItemUnit("");

    setQuantity("");
    setUnitPrice("");
    setTaxRate("18");
    setDiscount("0");

    setShowItemModal(false);
  };

  // =====================================================
  // SELECT INVENTORY ITEM -> AUTO-FILL NAME, CATEGORY, UNIT
  // =====================================================

  const handleInventoryItemSelect = (e) => {
    const selectedCode = e.target.value;

    const inventoryItem = inventoryItems.find(
      (inventory) => inventory.itemCode === selectedCode,
    );

    if (!inventoryItem) {
      setItemId("");
      setItemName("");
      setItemCategory("");
      setItemUnit("");
      return;
    }

    setItemId(inventoryItem.itemCode);
    setItemName(inventoryItem.name || "");
    setItemCategory(getInventoryCategory(inventoryItem));
    setItemUnit(inventoryItem.unit || "");
  };

  // =====================================================
  // ADD ITEM
  // =====================================================

  const addItem = (e) => {
    e.preventDefault();

    if (!itemId.trim()) {
      toast.error("Please select an item ID");
      return;
    }

    if (!itemName.trim()) {
      toast.error("Please enter item name");
      return;
    }

    if (!itemCategory.trim()) {
      toast.error("Please enter item category");
      return;
    }

    if (!itemUnit.trim()) {
      toast.error("Please enter item unit");
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (unitPrice === "" || Number(unitPrice) < 0) {
      toast.error("Please enter a valid unit price");
      return;
    }

    const numericQuantity = Number(quantity);
    const numericUnitPrice = Number(unitPrice);
    const numericTaxRate = Number(taxRate) || 0;
    const numericDiscount = Number(discount) || 0;

    if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (!Number.isFinite(numericUnitPrice) || numericUnitPrice < 0) {
      toast.error("Please enter a valid unit price");
      return;
    }

    if (
      !Number.isFinite(numericTaxRate) ||
      numericTaxRate < 0 ||
      numericTaxRate > 100
    ) {
      toast.error("Tax rate must be between 0 and 100");
      return;
    }

    if (!Number.isFinite(numericDiscount) || numericDiscount < 0) {
      toast.error("Discount cannot be negative");
      return;
    }

    const normalizedItemId = itemId.trim();

    const existingItem = items.find(
      (item) => item.itemId.toLowerCase() === normalizedItemId.toLowerCase(),
    );

    if (existingItem) {
      toast.error(
        "This item ID is already added. Remove it first if you want to change its details.",
      );
      return;
    }

    const lineSubtotal = numericQuantity * numericUnitPrice;

    if (numericDiscount > lineSubtotal) {
      toast.error("Discount cannot be greater than item value");
      return;
    }

    const taxableValue = lineSubtotal - numericDiscount;
    const taxAmount = taxableValue * (numericTaxRate / 100);
    const lineTotal = taxableValue + taxAmount;

    setItems((prev) => [
      ...prev,
      {
        itemId: normalizedItemId,
        name: itemName.trim(),
        category: itemCategory.trim(),
        unit: itemUnit.trim(),
        quantity: numericQuantity,
        unitPrice: numericUnitPrice,
        taxRate: numericTaxRate,
        discount: numericDiscount,
        taxAmount: Number(taxAmount.toFixed(2)),
        lineTotal: Number(lineTotal.toFixed(2)),
      },
    ]);

    toast.success("Purchase item added");
    closeItemModal();
  };

  // =====================================================
  // REMOVE ITEM
  // =====================================================

  const removeItem = (itemId) => {
    setItems((prev) => prev.filter((item) => item.itemId !== itemId));

    toast.success("Item removed");
  };

  // =====================================================
  // UPDATE ITEM
  // =====================================================

  const updateItem = (itemId, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.itemId !== itemId) return item;

        let numericValue = Number(value);

        if (!Number.isFinite(numericValue)) {
          numericValue = 0;
        }

        const updated = {
          ...item,
          [field]: numericValue,
        };

        const lineSubtotal =
          Number(updated.quantity) * Number(updated.unitPrice);

        const itemDiscount = Math.min(
          Math.max(0, Number(updated.discount) || 0),
          lineSubtotal,
        );

        const safeTaxRate = Math.min(
          100,
          Math.max(0, Number(updated.taxRate) || 0),
        );

        const taxableValue = lineSubtotal - itemDiscount;
        const taxAmount = taxableValue * (safeTaxRate / 100);

        return {
          ...updated,
          discount: itemDiscount,
          taxRate: safeTaxRate,
          taxAmount: Number(taxAmount.toFixed(2)),
          lineTotal: Number((taxableValue + taxAmount).toFixed(2)),
        };
      }),
    );
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setPurchaseNo("");
    setPurchaseDate(getToday());
    setDepartmentId("");
    setSupplierId("");
    setInvoiceNo("");
    setInvoiceDate("");
    setStatus("Draft");
    setOrderedBy("");
    setNotes("");
    setItems([]);
  };

  // =====================================================
  // SUBMIT PURCHASE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!departmentId) {
      toast.error("Please select a department");
      return;
    }

    if (!selectedDepartment) {
      toast.error("Selected department was not found");
      return;
    }

    if (!purchaseDate) {
      toast.error("Please select purchase date");
      return;
    }

    if (!supplierId) {
      toast.error("Please select a supplier");
      return;
    }

    if (!selectedSupplier) {
      toast.error("Selected supplier was not found");
      return;
    }

    if (!orderedBy.trim()) {
      toast.error("Please enter ordered by");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one purchase item");
      return;
    }

    try {
      setIsSubmitting(true);

      const purchaseData = {
        ...(purchaseNo.trim() ? { purchaseNo: purchaseNo.trim() } : {}),

        purchaseDate,

        // Send the selected department's MongoDB ObjectId
        department: selectedDepartment._id,

        supplier: selectedSupplier._id,

        invoiceNo: invoiceNo.trim(),
        invoiceDate: invoiceDate || null,
        status,
        orderedBy: orderedBy.trim(),
        notes: notes.trim(),

        items: items.map((item) => ({
          itemId: item.itemId,
          name: item.name,
          category: item.category,
          unit: item.unit,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          taxRate: Number(item.taxRate),
          discount: Number(item.discount),
        })),
      };

      console.log("Sending purchase:", purchaseData);

      const response = await api.post("/purchases", purchaseData);

      const createdPurchase = response?.data?.purchase;

      toast.success(
        response?.data?.message || "Purchase order created successfully",
      );

      console.log("Created purchase:", createdPurchase);

      await fetchPurchases(false);

      resetForm();

      if (createdPurchase?.purchaseNo) {
        setPurchaseNo(createdPurchase.purchaseNo);
      }
    } catch (error) {
      console.error("Create purchase error:", error);

      const message = getErrorMessage(error, "Failed to create purchase order");

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =====================================================
  // TOGGLE PURCHASE DETAILS
  // =====================================================

  const togglePurchaseDetails = (purchaseId) => {
    setExpandedPurchaseId((current) =>
      current === purchaseId ? null : purchaseId,
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-indigo-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">Purchases</h1>

              <p className="text-sm text-slate-500 mt-1">
                Create and manage inventory purchase orders.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-100">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />

            <span className="text-xs font-medium text-indigo-700">
              Procurement
            </span>
          </div>
        </div>

        {/* PURCHASE ORDERS LIST */}

        <section className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Purchase Orders
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Purchase orders fetched from the backend.
                </p>
              </div>

              <button
                type="button"
                onClick={() => fetchPurchases(false)}
                disabled={purchaseRefreshing}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    purchaseRefreshing ? "animate-spin" : ""
                  }`}
                />

                {purchaseRefreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {/* SEARCH / FILTER */}

            <div className="mt-4 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search PO number, supplier, invoice or ordered by..."
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-52 px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
              >
                <option value="All">All Statuses</option>

                {purchaseStatuses.map((statusItem) => (
                  <option key={statusItem} value={statusItem}>
                    {statusItem}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PURCHASE LIST */}

          {purchaseLoading ? (
            <div className="py-16 text-center">
              <RefreshCw className="w-6 h-6 mx-auto text-indigo-500 animate-spin" />

              <p className="mt-3 text-sm text-slate-500">
                Loading purchase orders...
              </p>
            </div>
          ) : purchaseError ? (
            <div className="py-14 px-5 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-rose-50 flex items-center justify-center">
                <X className="w-6 h-6 text-rose-500" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-700">
                Unable to load purchase orders
              </h3>

              <p className="mt-1 text-xs text-slate-400">{purchaseError}</p>

              <button
                type="button"
                onClick={() => fetchPurchases()}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          ) : filteredPurchases.length === 0 ? (
            <div className="py-14 px-5 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-slate-400" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-700">
                {purchases.length === 0
                  ? "No purchase orders found"
                  : "No matching purchase orders"}
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                {purchases.length === 0
                  ? "Create your first purchase order below."
                  : "Try changing your search or status filter."}
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP */}

              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100">
                      <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Purchase Order
                      </th>

                      <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Supplier
                      </th>

                      <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </th>

                      <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Invoice
                      </th>

                      <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Total
                      </th>

                      <th />
                    </tr>
                  </thead>

                  {/* Only ONE tbody. All mapped rows are inside it. */}
                  <tbody className="divide-y divide-slate-100">
                    {filteredPurchases.map((purchase) => {
                      const purchaseId =
                        purchase?._id || purchase?.id || purchase?.purchaseNo;

                      const isExpanded = expandedPurchaseId === purchaseId;

                      const purchaseTotal =
                        purchase?.grandTotal ??
                        purchase?.totalAmount ??
                        purchase?.total ??
                        purchase?.amount ??
                        0;

                      return (
                        <React.Fragment key={purchaseId}>
                          <tr className="hover:bg-slate-50/60">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                                  <FileText className="w-4 h-4 text-indigo-600" />
                                </div>

                                <div>
                                  <p className="text-sm font-semibold text-slate-800">
                                    {purchase?.purchaseNo || "N/A"}
                                  </p>

                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    {purchase?.orderedBy
                                      ? `Ordered by ${purchase.orderedBy}`
                                      : "Purchase order"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-3 py-4">
                              <p className="text-sm text-slate-700">
                                {getSupplierName(purchase)}
                              </p>
                            </td>

                            <td className="px-3 py-4">
                              <p className="text-sm text-slate-600">
                                {formatDate(purchase?.purchaseDate)}
                              </p>
                            </td>

                            <td className="px-3 py-4">
                              <p className="text-sm text-slate-600">
                                {purchase?.invoiceNo || "-"}
                              </p>
                            </td>

                            <td className="px-3 py-4 text-center">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-medium ${getStatusClasses(
                                  purchase?.status,
                                )}`}
                              >
                                {purchase?.status || "Draft"}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <p className="text-sm font-semibold text-slate-800">
                                {formatCurrency(purchaseTotal)}
                              </p>
                            </td>

                            <td className="px-3 py-4">
                              <button
                                type="button"
                                onClick={() =>
                                  togglePurchaseDetails(purchaseId)
                                }
                                className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                              >
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform ${
                                    isExpanded ? "rotate-180" : ""
                                  }`}
                                />
                              </button>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr>
                              <td
                                colSpan="7"
                                className="px-5 py-4 bg-slate-50/70"
                              >
                                <PurchaseDetails purchase={purchase} />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE / TABLET */}

              <div className="lg:hidden p-4 space-y-3">
                {filteredPurchases.map((purchase) => {
                  const purchaseId =
                    purchase?._id || purchase?.id || purchase?.purchaseNo;

                  const isExpanded = expandedPurchaseId === purchaseId;

                  const purchaseTotal =
                    purchase?.grandTotal ??
                    purchase?.totalAmount ??
                    purchase?.total ??
                    purchase?.amount ??
                    0;

                  return (
                    <div
                      key={purchaseId}
                      className="border border-slate-200 rounded-xl overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => togglePurchaseDetails(purchaseId)}
                        className="w-full text-left p-4 hover:bg-slate-50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                              <FileText className="w-4 h-4 text-indigo-600" />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {purchase?.purchaseNo || "N/A"}
                              </p>

                              <p className="text-xs text-slate-500 mt-0.5">
                                {getSupplierName(purchase)}
                              </p>
                            </div>
                          </div>

                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 mt-1 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <div>
                            <p className="text-[10px] text-slate-400">
                              Purchase Date
                            </p>

                            <p className="text-xs font-medium text-slate-700 mt-0.5">
                              {formatDate(purchase?.purchaseDate)}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] text-slate-400">Status</p>

                            <span
                              className={`inline-flex mt-0.5 px-2 py-0.5 rounded-full border text-[10px] font-medium ${getStatusClasses(
                                purchase?.status,
                              )}`}
                            >
                              {purchase?.status || "Draft"}
                            </span>
                          </div>

                          <div>
                            <p className="text-[10px] text-slate-400">
                              Invoice
                            </p>

                            <p className="text-xs font-medium text-slate-700 mt-0.5">
                              {purchase?.invoiceNo || "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] text-slate-400">Total</p>

                            <p className="text-sm font-bold text-indigo-600 mt-0.5">
                              {formatCurrency(purchaseTotal)}
                            </p>
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-slate-100 p-4 bg-slate-50/70">
                          <PurchaseDetails purchase={purchase} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {!purchaseLoading && !purchaseError && purchases.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40">
              <p className="text-[11px] text-slate-400">
                Showing{" "}
                <span className="font-medium text-slate-600">
                  {filteredPurchases.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-600">
                  {purchases.length}
                </span>{" "}
                purchase orders
              </p>
            </div>
          )}
        </section>

        {/* CREATE PURCHASE FORM */}

        <form onSubmit={handleSubmit}>
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">
                Create Purchase Order
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Enter the basic purchase and supplier details.
              </p>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* PURCHASE NO */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Purchase / PO No.
                </label>

                <input
                  type="text"
                  value={purchaseNo}
                  onChange={(e) => setPurchaseNo(e.target.value)}
                  placeholder="Auto generated"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />

                <p className="text-[10px] text-slate-400 mt-1">
                  Leave blank to generate automatically.
                </p>
              </div>

              {/* DATE */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Purchase Date
                  <span className="text-rose-500 ml-1">*</span>
                </label>

                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* DEPARTMENT */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Department
                  <span className="text-rose-500 ml-1">*</span>
                </label>

                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  disabled={departmentLoading}
                  required
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">
                    {departmentLoading
                      ? "Loading departments..."
                      : departments.length === 0
                        ? "No departments found"
                        : "Select department"}
                  </option>

                  {departments.map((department) => (
                    <option key={department._id} value={department._id}>
                      {department.name ||
                        department.departmentName ||
                        department._id}
                    </option>
                  ))}
                </select>
              </div>

              {/* SUPPLIER */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Supplier
                  <span className="text-rose-500 ml-1">*</span>
                </label>

                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  disabled={supplierLoading}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">
                    {supplierLoading
                      ? "Loading suppliers..."
                      : suppliers.length === 0
                        ? "No suppliers found"
                        : "Select supplier"}
                  </option>

                  {suppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* STATUS */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Purchase Status
                </label>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                >
                  {purchaseStatuses.map((statusItem) => (
                    <option key={statusItem} value={statusItem}>
                      {statusItem}
                    </option>
                  ))}
                </select>
              </div>

              {/* INVOICE */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Invoice No.
                </label>

                <input
                  type="text"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  placeholder="Supplier invoice number"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                />
              </div>

              {/* INVOICE DATE */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Invoice Date
                </label>

                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                />
              </div>

              {/* ORDERED BY */}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Ordered By
                  <span className="text-rose-500 ml-1">*</span>
                </label>

                <input
                  type="text"
                  value={orderedBy}
                  onChange={(e) => setOrderedBy(e.target.value)}
                  placeholder="Staff / purchase officer"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* SELECTED DEPARTMENT DETAILS */}

            {selectedDepartment && (
              <div className="mx-5 mb-5 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <p className="text-sm font-semibold text-indigo-900">
                  {selectedDepartment.name || selectedDepartment.departmentName}
                </p>

                <p className="text-[11px] text-indigo-600 mt-0.5">
                  Department selected for this purchase order.
                </p>
              </div>
            )}

            {/* SUPPLIER DETAILS */}

            {selectedSupplier && (
              <div className="mx-5 mb-5 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                    <Truck className="w-4 h-4 text-indigo-600" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-indigo-900">
                      {selectedSupplier.name}
                    </p>

                    <p className="text-[11px] text-indigo-600 mt-0.5">
                      {selectedSupplier.supplierId || selectedSupplier._id} ·
                      GSTIN: {selectedSupplier.gstin || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* PURCHASE ITEMS */}

          <section className="mt-6 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Purchase Items
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Select inventory items and enter quantity and price.
                </p>
              </div>

              <button
                type="button"
                onClick={openItemModal}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            {items.length === 0 ? (
              <div className="py-16 px-5 text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-slate-400" />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-700">
                  No purchase items
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Add products to this purchase order.
                </p>

                <button
                  type="button"
                  onClick={openItemModal}
                  className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Plus className="w-4 h-4" />
                  Add First Item
                </button>
              </div>
            ) : (
              <>
                {/* DESKTOP TABLE */}

                <div className="hidden xl:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-100">
                        <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Item
                        </th>

                        <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Qty
                        </th>

                        <th className="text-right px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Unit Price
                        </th>

                        <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Tax %
                        </th>

                        <th className="text-right px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Discount
                        </th>

                        <th className="text-right px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Tax
                        </th>

                        <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Total
                        </th>

                        <th />
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {items.map((item) => (
                        <tr key={item.itemId}>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                <Package className="w-4 h-4 text-indigo-600" />
                              </div>

                              <div>
                                <p className="text-sm font-medium text-slate-800">
                                  {item.name}
                                </p>

                                <p className="text-[10px] text-slate-400">
                                  {item.itemId} · {item.category} · {item.unit}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-4">
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  item.itemId,
                                  "quantity",
                                  e.target.value,
                                )
                              }
                              className="w-16 px-2 py-2 border border-slate-200 rounded-lg text-xs text-center outline-none focus:border-indigo-500"
                            />
                          </td>

                          <td className="px-3 py-4">
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                ₹
                              </span>

                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  updateItem(
                                    item.itemId,
                                    "unitPrice",
                                    e.target.value,
                                  )
                                }
                                className="w-28 pl-6 pr-2 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500"
                              />
                            </div>
                          </td>

                          <td className="px-3 py-4">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={item.taxRate}
                              onChange={(e) =>
                                updateItem(
                                  item.itemId,
                                  "taxRate",
                                  e.target.value,
                                )
                              }
                              className="w-16 px-2 py-2 border border-slate-200 rounded-lg text-xs text-center outline-none focus:border-indigo-500"
                            />
                          </td>

                          <td className="px-3 py-4">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.discount}
                              onChange={(e) =>
                                updateItem(
                                  item.itemId,
                                  "discount",
                                  e.target.value,
                                )
                              }
                              className="w-24 px-2 py-2 border border-slate-200 rounded-lg text-xs text-right outline-none focus:border-indigo-500"
                            />
                          </td>

                          <td className="px-3 py-4 text-right">
                            <span className="text-xs text-slate-600">
                              {formatCurrency(item.taxAmount)}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <span className="text-sm font-semibold text-slate-800">
                              {formatCurrency(item.lineTotal)}
                            </span>
                          </td>

                          <td className="px-3 py-4">
                            <button
                              type="button"
                              onClick={() => removeItem(item.itemId)}
                              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE / TABLET */}

                <div className="xl:hidden p-4 space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.itemId}
                      className="border border-slate-200 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <Package className="w-4 h-4 text-indigo-600" />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {item.name}
                            </p>

                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {item.itemId} · {item.category} · {item.unit}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.itemId)}
                          className="p-1.5 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">
                            Quantity
                          </label>

                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(
                                item.itemId,
                                "quantity",
                                e.target.value,
                              )
                            }
                            className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">
                            Unit Price
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateItem(
                                item.itemId,
                                "unitPrice",
                                e.target.value,
                              )
                            }
                            className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">
                            Tax %
                          </label>

                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.taxRate}
                            onChange={(e) =>
                              updateItem(item.itemId, "taxRate", e.target.value)
                            }
                            className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">
                            Discount
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.discount}
                            onChange={(e) =>
                              updateItem(
                                item.itemId,
                                "discount",
                                e.target.value,
                              )
                            }
                            className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                        <span className="text-xs text-slate-400">
                          Item Total
                        </span>

                        <span className="text-sm font-bold text-indigo-600">
                          {formatCurrency(item.lineTotal)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* TOTALS */}

                <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-5">
                  <div className="ml-auto w-full sm:max-w-sm space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Items Quantity</span>

                      <span className="font-medium text-slate-700">
                        {totalQuantity}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Subtotal</span>

                      <span className="font-medium text-slate-700">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Discount</span>

                      <span className="font-medium text-rose-600">
                        - {formatCurrency(totalDiscount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">GST / Tax</span>

                      <span className="font-medium text-slate-700">
                        {formatCurrency(totalTax)}
                      </span>
                    </div>

                    <div className="pt-3 mt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800">
                        Grand Total
                      </span>

                      <span className="text-xl font-bold text-indigo-600">
                        {formatCurrency(grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* NOTES */}

          <section className="mt-6 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-slate-500" />

                <label className="text-sm font-medium text-slate-700">
                  Purchase Notes
                </label>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Add purchase remarks, tender details, delivery information, etc."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>
          </section>

          {/* ACTIONS */}

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                supplierLoading ||
                departmentLoading ||
                departments.length === 0
              }
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />

              {isSubmitting ? "Saving..." : "Save Purchase"}
            </button>
          </div>
        </form>
      </div>

      {/* ADD ITEM MODAL */}

      {showItemModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeItemModal}
          />

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* MODAL HEADER */}

            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Add Purchase Item
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Select an item ID and its details are filled in automatically.
                </p>
              </div>

              <button
                type="button"
                onClick={closeItemModal}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={addItem}>
              <div className="p-6 space-y-5">
                {/* ITEM ID (inventory dropdown) */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Item ID
                    <span className="text-rose-500 ml-1">*</span>
                  </label>

                  <select
                    value={itemId}
                    onChange={handleInventoryItemSelect}
                    disabled={inventoryLoading}
                    required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">
                      {inventoryLoading
                        ? "Loading inventory items..."
                        : inventoryItems.length === 0
                          ? "No inventory items found"
                          : "Select item ID"}
                    </option>

                    {inventoryItems.map((inventoryItem) => {
                      const alreadyAdded = items.some(
                        (item) =>
                          item.itemId.toLowerCase() ===
                          String(inventoryItem.itemCode).toLowerCase(),
                      );

                      return (
                        <option
                          key={inventoryItem._id || inventoryItem.itemCode}
                          value={inventoryItem.itemCode}
                          disabled={alreadyAdded}
                        >
                          {inventoryItem.itemCode} — {inventoryItem.name}
                          {alreadyAdded ? " (already added)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* ITEM NAME */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Item Name
                    <span className="text-rose-500 ml-1">*</span>
                  </label>

                  <input
                    type="text"
                    value={itemName}
                    readOnly
                    placeholder="Auto-filled from item ID"
                    required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none bg-slate-50 text-slate-600 cursor-not-allowed"
                  />
                </div>

                {/* CATEGORY + UNIT */}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Category
                      <span className="text-rose-500 ml-1">*</span>
                    </label>

                    <input
                      type="text"
                      value={itemCategory}
                      readOnly
                      placeholder="Auto-filled"
                      required
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none bg-slate-50 text-slate-600 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Unit
                      <span className="text-rose-500 ml-1">*</span>
                    </label>

                    <input
                      type="text"
                      value={itemUnit}
                      readOnly
                      placeholder="Auto-filled"
                      required
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none bg-slate-50 text-slate-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* QUANTITY + PRICE */}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Quantity
                      <span className="text-rose-500 ml-1">*</span>
                    </label>

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="10"
                      required
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Unit Price
                      <span className="text-rose-500 ml-1">*</span>
                    </label>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                        ₹
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(e.target.value)}
                        placeholder="500"
                        required
                        className="w-full pl-7 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* TAX + DISCOUNT */}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      GST / Tax %
                    </label>

                    <select
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Discount
                    </label>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                        ₹
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        placeholder="0"
                        className="w-full pl-7 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* PREVIEW */}

                {quantity && unitPrice && (
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-indigo-600">
                        Estimated Item Total
                      </span>

                      <span className="text-lg font-bold text-indigo-700">
                        {formatCurrency(
                          Math.max(
                            0,
                            Number(quantity) * Number(unitPrice) -
                              Number(discount),
                          ) *
                            (1 + Number(taxRate) / 100),
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* MODAL FOOTER */}

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={closeItemModal}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// =====================================================
// PURCHASE DETAILS COMPONENT
// =====================================================

const PurchaseDetails = ({ purchase }) => {
  const items = Array.isArray(purchase?.items) ? purchase.items : [];

  const subtotal =
    purchase?.subtotal ??
    purchase?.subTotal ??
    items.reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
      0,
    );

  const discount =
    purchase?.totalDiscount ??
    purchase?.discount ??
    items.reduce((sum, item) => sum + Number(item.discount || 0), 0);

  const tax =
    purchase?.totalTax ??
    purchase?.tax ??
    items.reduce((sum, item) => sum + Number(item.taxAmount || 0), 0);

  const total =
    purchase?.grandTotal ??
    purchase?.totalAmount ??
    purchase?.total ??
    Math.max(0, Number(subtotal) - Number(discount)) + Number(tax);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-white border border-slate-200">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">
            Purchase Date
          </p>

          <p className="text-xs font-semibold text-slate-700 mt-1">
            {formatDate(purchase?.purchaseDate)}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-white border border-slate-200">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">
            Invoice Date
          </p>

          <p className="text-xs font-semibold text-slate-700 mt-1">
            {formatDate(purchase?.invoiceDate)}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-white border border-slate-200">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">
            Ordered By
          </p>

          <p className="text-xs font-semibold text-slate-700 mt-1">
            {purchase?.orderedBy || "-"}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-white border border-slate-200">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">
            Supplier
          </p>

          <p className="text-xs font-semibold text-slate-700 mt-1">
            {getSupplierName(purchase)}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-white border border-slate-200">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">
            Department
          </p>

          <p className="text-xs font-semibold text-slate-700 mt-1">
            {getDepartmentName(purchase)}
          </p>
        </div>
      </div>

      {items.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-700">
              Purchase Items
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Item
                  </th>

                  <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Qty
                  </th>

                  <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Unit Price
                  </th>

                  <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Tax
                  </th>

                  <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => {
                  const lineSubtotal =
                    Number(item.quantity || 0) * Number(item.unitPrice || 0);

                  const itemTax =
                    item.taxAmount ??
                    Math.max(0, lineSubtotal - Number(item.discount || 0)) *
                      (Number(item.taxRate || 0) / 100);

                  const itemTotal =
                    item.lineTotal ??
                    Math.max(0, lineSubtotal - Number(item.discount || 0)) +
                      Number(itemTax || 0);

                  return (
                    <tr key={item._id || item.itemId || index}>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-slate-700">
                          {item.name || item.itemName || item.itemId || "-"}
                        </p>

                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {item.itemId || "-"}
                          {item.category ? ` · ${item.category}` : ""}
                          {item.unit ? ` · ${item.unit}` : ""}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-right text-xs text-slate-600">
                        {Number(item.quantity || 0)}
                      </td>

                      <td className="px-4 py-3 text-right text-xs text-slate-600">
                        {formatCurrency(item.unitPrice)}
                      </td>

                      <td className="px-4 py-3 text-right text-xs text-slate-600">
                        {formatCurrency(itemTax)}
                      </td>

                      <td className="px-4 py-3 text-right text-xs font-semibold text-slate-700">
                        {formatCurrency(itemTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <div className="w-full sm:w-72 p-4 rounded-lg bg-white border border-slate-200 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Subtotal</span>

            <span className="font-medium text-slate-700">
              {formatCurrency(subtotal)}
            </span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Discount</span>

            <span className="font-medium text-rose-600">
              - {formatCurrency(discount)}
            </span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-slate-500">GST / Tax</span>

            <span className="font-medium text-slate-700">
              {formatCurrency(tax)}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between">
            <span className="text-sm font-semibold text-slate-800">
              Grand Total
            </span>

            <span className="text-sm font-bold text-indigo-600">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      {purchase?.notes && (
        <div className="p-3 rounded-lg bg-white border border-slate-200">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">
            Notes
          </p>

          <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">
            {purchase.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default Purchases;