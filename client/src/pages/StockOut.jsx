import React, { useEffect, useMemo, useState } from "react";
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
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const StockOut = () => {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const [stockOutRecords, setStockOutRecords] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    stockOutNo: "",
    inventory: "",
    quantity: "",
    department: "",
    issuedTo: "",
    issuedDate: "",
    request: "",
    notes: "",
  });

  // =====================================================
  // RESPONSE ARRAY HELPER
  // =====================================================

  const extractArray = (responseData, keys = []) => {
    if (Array.isArray(responseData)) {
      return responseData;
    }

    for (const key of keys) {
      if (Array.isArray(responseData?.[key])) {
        return responseData[key];
      }
    }

    if (Array.isArray(responseData?.data)) {
      return responseData.data;
    }

    return [];
  };

  // =====================================================
  // FETCH STOCK OUT
  // =====================================================

  const fetchStockOuts = async () => {
    const response = await api.get("/stock-out");

    return extractArray(response.data, ["stockOuts", "stockOut", "records"]);
  };

  // =====================================================
  // FETCH INVENTORY
  // =====================================================

  const fetchInventory = async () => {
    const response = await api.get("/inventory");

    return extractArray(response.data, [
      "inventory",
      "items",
      "inventoryItems",
    ]);
  };

  // =====================================================
  // FETCH CATEGORIES
  // =====================================================

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");

      const categories = extractArray(response.data, [
        "categories",
        "category",
        "items",
      ]);

      setCategoryOptions(categories);

      return categories;
    } catch (error) {
      console.error("Fetch categories error:", error);
      setCategoryOptions([]);
      return [];
    }
  };

  // =====================================================
  // FETCH DEPARTMENTS
  // =====================================================

  const fetchDepartments = async () => {
    try {
      let response;

      try {
        response = await api.get("/departments");
      } catch {
        response = await api.get("/department");
      }

      return extractArray(response.data, [
        "departments",
        "department",
        "items",
      ]);
    } catch (error) {
      console.error("Fetch departments error:", error);
      return [];
    }
  };

  // =====================================================
  // FETCH REQUESTS
  // =====================================================

  const fetchRequests = async () => {
    try {
      const response = await api.get("/requests");

      return extractArray(response.data, ["itemRequests", "requests", "items"]);
    } catch (error) {
      console.error("Fetch item requests error:", error);
      return [];
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [stockOutData, inventoryData, departmentData, requestData] =
        await Promise.all([
          fetchStockOuts(),
          fetchInventory(),
          fetchDepartments(),
          fetchRequests(),
          fetchCategories(),
        ]);

      setStockOutRecords(stockOutData);
      setInventoryItems(inventoryData);
      setDepartments(departmentData);
      setRequests(requestData);
    } catch (error) {
      console.error("Fetch stock out data error:", error);

      toast.error(
        error.response?.data?.message || "Failed to load stock out records",
      );

      setStockOutRecords([]);
      setInventoryItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // =====================================================
  // GENERIC VALUE HELPERS
  // =====================================================

  const getId = (value) => {
    if (!value) return "";

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "object") {
      return value._id || value.id || value.value || value.code || "";
    }

    return String(value);
  };

  const getDisplayValue = (value, fallback = "—") => {
    if (value === null || value === undefined) {
      return fallback;
    }

    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }

    if (typeof value === "object") {
      return (
        value.name ||
        value.departmentName ||
        value.itemName ||
        value.item ||
        value.categoryName ||
        value.requestNo ||
        value.stockOutNo ||
        value.code ||
        value._id ||
        fallback
      );
    }

    return fallback;
  };

  // =====================================================
  // CATEGORY HELPERS
  // =====================================================

  const getCategoryName = (category) => {
    if (!category) {
      return "—";
    }

    // Category is already populated as an object.
    if (typeof category === "object") {
      const categoryName =
        category.name ||
        category.categoryName ||
        category.category ||
        category.code;

      if (categoryName) {
        return String(categoryName);
      }

      // If the object contains only an ID, resolve it below.
      category = category._id || category.id || category.categoryId;
    }

    if (!category) {
      return "—";
    }

    const categoryId = String(category);

    // Resolve category ObjectId or categoryId using fetched categories.
    const matchedCategory = categoryOptions.find(
      (option) =>
        String(option._id) === categoryId ||
        String(option.id) === categoryId ||
        String(option.categoryId) === categoryId,
    );

    if (matchedCategory) {
      return (
        matchedCategory.name ||
        matchedCategory.categoryName ||
        matchedCategory.code ||
        categoryId
      );
    }

    // Preserve plain-text category names if no ID match is found.
    return categoryId;
  };

  // =====================================================
  // STOCK OUT HELPERS
  // =====================================================

  const getRecordId = (record) => {
    return record?._id || record?.id || "";
  };

  const getStockOutNo = (record) => {
    return record?.stockOutNo || record?.id || record?._id || "—";
  };

  const getItemName = (record) => {
    const inventory = record?.inventory;

    if (inventory && typeof inventory === "object") {
      return (
        inventory.name ||
        inventory.itemName ||
        inventory.item ||
        inventory.itemCode ||
        "—"
      );
    }

    return record?.itemName || record?.item || "—";
  };

  const getItemCategory = (record) => {
    const inventory = record?.inventory;

    if (inventory && typeof inventory === "object") {
      return getCategoryName(inventory.category);
    }

    return getCategoryName(record?.category);
  };

  const getQuantity = (record) => {
    return Number(record?.quantity ?? 0);
  };

  const getUnit = (record) => {
    const inventory = record?.inventory;

    if (inventory && typeof inventory === "object") {
      return inventory.unit || inventory.uom || "units";
    }

    return record?.unit || "units";
  };

  const getDepartment = (record) => {
    return getDisplayValue(record?.department, record?.departmentName || "—");
  };

  const getDepartmentCode = (record) => {
    const department = record?.department;

    if (department && typeof department === "object") {
      return department.code || department.departmentCode || "";
    }

    return "";
  };

  const getIssuedTo = (record) => {
    return record?.issuedTo || record?.issued_to || "—";
  };

  const getIssueDate = (record) => {
    const date =
      record?.issuedDate ||
      record?.issueDate ||
      record?.date ||
      record?.createdAt;

    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-GB");
  };

  const getRequestNo = (record) => {
    const request = record?.request;

    if (request && typeof request === "object") {
      return (
        request.requestNo ||
        request.requestNumber ||
        request.code ||
        request._id ||
        "—"
      );
    }

    return request || "—";
  };

  const getNotes = (record) => {
    return record?.notes || record?.remarks || "No remarks provided.";
  };

  const getStatus = (record) => {
    if (record?.status) {
      return record.status;
    }

    return "Issued";
  };

  // =====================================================
  // INVENTORY HELPERS
  // =====================================================

  const getInventoryId = (item) => {
    return item?._id || item?.id || item?.itemId || "";
  };

  const getInventoryName = (item) => {
    return (
      item?.name ||
      item?.item ||
      item?.itemName ||
      item?.itemCode ||
      "Unnamed Item"
    );
  };

  const getInventoryCategory = (item) => {
    return getCategoryName(item?.category || item?.categoryName);
  };

  const getInventoryUnit = (item) => {
    return item?.unit || item?.uom || "units";
  };

  const getInventoryAvailable = (item) => {
    return Number(
      item?.available ?? item?.availableQuantity ?? item?.currentStock ?? 0,
    );
  };

  // =====================================================
  // DEPARTMENT HELPERS
  // =====================================================

  const getDepartmentId = (department) => {
    return department?._id || department?.id || "";
  };

  const getDepartmentName = (department) => {
    return (
      department?.name ||
      department?.departmentName ||
      department?.code ||
      "Unnamed Department"
    );
  };

  // =====================================================
  // REQUEST HELPERS
  // =====================================================

  const getRequestId = (request) => {
    return request?._id || request?.id || "";
  };

  const getRequestName = (request) => {
    return (
      request?.requestNo ||
      request?.requestNumber ||
      request?.code ||
      request?.name ||
      "Unnamed Request"
    );
  };

  // =====================================================
  // FILTER
  // =====================================================

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return stockOutRecords.filter((record) => {
      const searchableText = [
        getStockOutNo(record),
        getItemName(record),
        getItemCategory(record),
        getDepartment(record),
        getDepartmentCode(record),
        getIssuedTo(record),
        getRequestNo(record),
        getNotes(record),
      ]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");

      const matchesSearch = !query || searchableText.includes(query);

      const matchesStatus =
        statusFilter === "All" || getStatus(record) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [stockOutRecords, search, statusFilter, categoryOptions]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalRecords = stockOutRecords.length;

  const issuedRecords = stockOutRecords.filter(
    (record) => getStatus(record) === "Issued",
  ).length;

  const pendingRecords = stockOutRecords.filter(
    (record) => getStatus(record) === "Pending",
  ).length;

  const totalQuantityIssued = stockOutRecords
    .filter((record) => getStatus(record) === "Issued")
    .reduce((sum, record) => sum + getQuantity(record), 0);

  // =====================================================
  // STATUS STYLE
  // =====================================================

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

  // =====================================================
  // OPEN ADD MODAL
  // =====================================================

  const openAddModal = () => {
    if (!isAdmin || authLoading) {
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    setFormData({
      stockOutNo: "",
      inventory: "",
      quantity: "",
      department: "",
      issuedTo: "",
      issuedDate: today,
      request: "",
      notes: "",
    });

    setShowAddModal(true);
  };

  const closeAddModal = () => {
    if (submitting) {
      return;
    }

    setShowAddModal(false);
  };

  // =====================================================
  // ITEM CHANGE
  // =====================================================

  const handleItemChange = (event) => {
    const selectedId = event.target.value;

    setFormData((prev) => ({
      ...prev,
      inventory: selectedId,
    }));
  };

  // =====================================================
  // DEPARTMENT CHANGE
  // =====================================================

  const handleDepartmentChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      department: event.target.value,
    }));
  };

  // =====================================================
  // REQUEST CHANGE
  // =====================================================

  const handleRequestChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      request: event.target.value,
    }));
  };

  // =====================================================
  // SAVE STOCK OUT
  // =====================================================

  const handleSaveStockOut = async (event) => {
    event.preventDefault();

    if (!isAdmin) {
      toast.error("Only admin can create Stock Out records");
      return;
    }

    if (!formData.inventory) {
      toast.error("Please select an inventory item");
      return;
    }

    if (!formData.quantity) {
      toast.error("Quantity is required");
      return;
    }

    const quantity = Number(formData.quantity);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error("Quantity must be greater than zero");
      return;
    }

    if (!formData.department) {
      toast.error("Department is required");
      return;
    }

    if (!formData.issuedTo.trim()) {
      toast.error("Issued To is required");
      return;
    }

    if (!formData.issuedDate) {
      toast.error("Issue date is required");
      return;
    }

    const selectedInventoryItem = inventoryItems.find(
      (item) => String(getInventoryId(item)) === String(formData.inventory),
    );

    if (!selectedInventoryItem) {
      toast.error("Selected inventory item was not found");
      return;
    }

    const available = getInventoryAvailable(selectedInventoryItem);

    if (quantity > available) {
      toast.error(
        `Only ${available} ${getInventoryUnit(
          selectedInventoryItem,
        )} available in stock`,
      );
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        stockOutNo: formData.stockOutNo.trim() || undefined,
        department: formData.department,
        inventory: formData.inventory,
        quantity,
        issuedDate: formData.issuedDate,
        issuedTo: formData.issuedTo.trim(),
        request: formData.request || null,
        notes: formData.notes.trim() || "",
      };

      console.log("Creating Stock Out:", payload);

      const response = await api.post("/stock-out", payload);

      if (response.data?.success) {
        toast.success(
          response.data.message || "Stock Out created successfully",
        );

        setShowAddModal(false);

        try {
          const [stockOutData, inventoryData] = await Promise.all([
            fetchStockOuts(),
            fetchInventory(),
          ]);

          setStockOutRecords(stockOutData);
          setInventoryItems(inventoryData);
        } catch (refreshError) {
          console.error("Refresh after stock out error:", refreshError);

          if (response.data?.stockOut) {
            setStockOutRecords((prev) => [response.data.stockOut, ...prev]);
          }
        }

        setFormData({
          stockOutNo: "",
          inventory: "",
          quantity: "",
          department: "",
          issuedTo: "",
          issuedDate: "",
          request: "",
          notes: "",
        });
      }
    } catch (error) {
      console.error("Create stock out error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create Stock Out record",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

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

        {/* Only Admin Can Add Stock Out */}
        {!authLoading && isAdmin && (
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Stock Out
          </button>
        )}
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

        {/* LOADING */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 mx-auto border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />

            <p className="mt-4 text-sm text-slate-500">
              Loading stock out records...
            </p>
          </div>
        ) : (
          <>
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
                      key={getRecordId(record)}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-indigo-600">
                          {getStockOutNo(record)}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          {getRequestNo(record) !== "—"
                            ? `Request: ${getRequestNo(record)}`
                            : "Direct issue"}
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
                              {getItemCategory(record)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700">
                          {getDepartment(record)}
                        </p>

                        {getDepartmentCode(record) && (
                          <p className="text-xs text-slate-400 mt-1">
                            {getDepartmentCode(record)}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <UserRound className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-700">
                            {getIssuedTo(record)}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-slate-800">
                          {getQuantity(record)}
                        </span>

                        <span className="text-xs text-slate-400 ml-1">
                          {getUnit(record)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays className="w-4 h-4 text-slate-400" />
                          {getIssueDate(record)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-medium ${getStatusStyle(
                            getStatus(record),
                          )}`}
                        >
                          {getStatus(record)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
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

            {/* MOBILE */}
            <div className="lg:hidden divide-y divide-slate-100">
              {filteredRecords.map((record) => (
                <div key={getRecordId(record)} className="p-4">
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
                          {getStockOutNo(record)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 inline-flex px-2 py-1 rounded-full border text-[11px] font-medium ${getStatusStyle(
                        getStatus(record),
                      )}`}
                    >
                      {getStatus(record)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Info label="Department" value={getDepartment(record)} />
                    <Info label="Issued To" value={getIssuedTo(record)} />
                    <Info
                      label="Quantity"
                      value={`${getQuantity(record)} ${getUnit(record)}`}
                    />
                    <Info label="Issue Date" value={getIssueDate(record)} />
                    <Info label="Request No." value={getRequestNo(record)} />
                    <Info label="Category" value={getItemCategory(record)} />
                  </div>

                  <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
                    <button
                      type="button"
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
          </>
        )}
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
                  {getStockOutNo(selectedRecord)}
                </p>

                <h2 className="text-lg font-semibold text-slate-900 mt-1">
                  Stock Out Details
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
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
                      {getItemName(selectedRecord)}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      {getItemCategory(selectedRecord)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Status</p>

                  <span
                    className={`inline-flex mt-1 px-2.5 py-1 rounded-full border text-xs font-medium ${getStatusStyle(
                      getStatus(selectedRecord),
                    )}`}
                  >
                    {getStatus(selectedRecord)}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-400">Issue Date</p>

                  <p className="text-sm font-medium text-slate-800 mt-1">
                    {getIssueDate(selectedRecord)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Detail
                  label="Department"
                  value={getDepartment(selectedRecord)}
                />
                <Detail label="Issued To" value={getIssuedTo(selectedRecord)} />
                <Detail
                  label="Quantity"
                  value={`${getQuantity(selectedRecord)} ${getUnit(
                    selectedRecord,
                  )}`}
                />
                <Detail
                  label="Request No."
                  value={getRequestNo(selectedRecord)}
                />
                <Detail
                  label="Inventory ID"
                  value={getId(selectedRecord.inventory)}
                />
                <Detail
                  label="Stock Out No."
                  value={getStockOutNo(selectedRecord)}
                />
              </div>

              <div>
                <p className="text-xs text-slate-400">Notes</p>
                <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                  {getNotes(selectedRecord)}
                </p>
              </div>
            </div>

            <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD STOCK OUT MODAL — ADMIN ONLY */}
      {isAdmin && showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={closeAddModal}
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
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
                type="button"
                onClick={closeAddModal}
                disabled={submitting}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStockOut}>
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Stock Out No."
                    value={formData.stockOutNo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        stockOutNo: e.target.value,
                      }))
                    }
                    placeholder="Auto generated"
                    disabled={submitting}
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Item
                      <span className="text-rose-500 ml-1">*</span>
                    </label>

                    <select
                      value={formData.inventory}
                      onChange={handleItemChange}
                      required
                      disabled={submitting || inventoryItems.length === 0}
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50"
                    >
                      <option value="">
                        {inventoryItems.length === 0
                          ? "No inventory items available"
                          : "Select item"}
                      </option>

                      {inventoryItems.map((item) => {
                        const inventoryId = getInventoryId(item);
                        const available = getInventoryAvailable(item);

                        return (
                          <option key={inventoryId} value={inventoryId}>
                            {getInventoryName(item)} — {available} available
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <FormField
                    label="Quantity"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        quantity: e.target.value,
                      }))
                    }
                    placeholder="0"
                    required
                    disabled={submitting}
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Department
                      <span className="text-rose-500 ml-1">*</span>
                    </label>

                    <select
                      value={formData.department}
                      onChange={handleDepartmentChange}
                      required
                      disabled={submitting || departments.length === 0}
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50"
                    >
                      <option value="">
                        {departments.length === 0
                          ? "No departments available"
                          : "Select department"}
                      </option>

                      {departments.map((department) => {
                        const id = getDepartmentId(department);

                        return (
                          <option key={id} value={id}>
                            {getDepartmentName(department)}
                            {department?.code ? ` (${department.code})` : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <FormField
                    label="Issued To"
                    value={formData.issuedTo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        issuedTo: e.target.value,
                      }))
                    }
                    placeholder="Staff / Faculty name"
                    required
                    disabled={submitting}
                  />

                  <FormField
                    label="Issue Date"
                    type="date"
                    value={formData.issuedDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        issuedDate: e.target.value,
                      }))
                    }
                    required
                    disabled={submitting}
                  />

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Request No.
                      <span className="text-xs text-slate-400 ml-2 font-normal">
                        Optional
                      </span>
                    </label>

                    <select
                      value={formData.request}
                      onChange={handleRequestChange}
                      disabled={submitting || requests.length === 0}
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50"
                    >
                      <option value="">
                        {requests.length === 0
                          ? "No item requests available"
                          : "No request / direct issue"}
                      </option>

                      {requests.map((request) => {
                        const id = getRequestId(request);

                        return (
                          <option key={id} value={id}>
                            {getRequestName(request)}
                            {request?.status ? ` — ${request.status}` : ""}
                          </option>
                        );
                      })}
                    </select>

                    {requests.length === 0 && (
                      <p className="text-xs text-slate-400 mt-1.5">
                        Request selection is optional. You can create a direct
                        Stock Out.
                      </p>
                    )}
                  </div>
                </div>

                {formData.inventory && (
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                    {(() => {
                      const selected = inventoryItems.find(
                        (inventoryItem) =>
                          String(getInventoryId(inventoryItem)) ===
                          String(formData.inventory),
                      );

                      if (!selected) {
                        return null;
                      }

                      return (
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs text-indigo-500">
                              Selected Item
                            </p>

                            <p className="text-sm font-semibold text-indigo-900 mt-1">
                              {getInventoryName(selected)}
                            </p>

                            <p className="text-xs text-indigo-600 mt-1">
                              {getInventoryCategory(selected) || "No category"}{" "}
                              • {getInventoryUnit(selected)}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-indigo-500">Available</p>

                            <p className="text-lg font-semibold text-indigo-900 mt-1">
                              {getInventoryAvailable(selected)}{" "}
                              {getInventoryUnit(selected)}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Notes
                  </label>

                  <textarea
                    rows="3"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Enter additional information..."
                    disabled={submitting}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50"
                  />
                </div>

                <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-700">
                  Available stock is checked before submitting. The backend also
                  validates the available stock before reducing inventory.
                </div>
              </div>

              <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <ArrowUpFromLine className="w-4 h-4" />
                  {submitting ? "Saving..." : "Save Stock Out"}
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

/* INFO */
const Info = ({ label, value }) => {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p
        className="text-xs text-slate-700 mt-1 truncate"
        title={String(value ?? "—")}
      >
        {getSafeText(value)}
      </p>
    </div>
  );
};

/* DETAIL */
const Detail = ({ label, value }) => {
  return (
    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-800 mt-1 break-words">
        {getSafeText(value)}
      </p>
    </div>
  );
};

/* SAFE TEXT */
const getSafeText = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "object") {
    return (
      value.name ||
      value.departmentName ||
      value.itemName ||
      value.item ||
      value.requestNo ||
      value.stockOutNo ||
      value.code ||
      value._id ||
      "—"
    );
  }

  return "—";
};

/* FORM FIELD */
const FormField = ({
  label,
  type = "text",
  placeholder,
  required,
  value,
  onChange,
  disabled,
  min,
  step,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        step={step}
        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
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
