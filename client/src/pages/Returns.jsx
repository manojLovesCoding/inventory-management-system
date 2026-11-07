import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Eye,
  Package,
  Plus,
  Search,
  UserRound,
  X,
  Pencil,
  Trash2,
  RefreshCw,
  Clock,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios.js";

// Supports both direct arrays and common API response formats.
const getList = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.returns)) return data.returns;
  if (Array.isArray(data?.departments)) return data.departments;
  if (Array.isArray(data?.inventory)) return data.inventory;
  if (Array.isArray(data?.stockOuts)) return data.stockOuts;
  if (Array.isArray(data?.stockOut)) return data.stockOut;

  return [];
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "object") return value._id || value.id || "";
  return value;
};

const getName = (value, fallback = "—") => {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return (
    value.name ||
    value.itemName ||
    value.inventoryName ||
    value.departmentName ||
    value.fullName ||
    value.username ||
    value._id ||
    fallback
  );
};

const getReturnNo = (item) =>
  item?.returnNo || item?.returnNumber || item?._id?.slice(-6) || "—";

const getInventoryName = (item) =>
  getName(item?.inventory || item?.item || item?.inventoryId, "Unknown item");

const getDepartmentName = (item) =>
  getName(item?.department || item?.departmentId, "Unknown department");

const getStockOutNo = (item) =>
  item?.stockOut?.stockOutNo ||
  item?.stockOut?.referenceNo ||
  item?.stockOut?.issueNo ||
  item?.stockOut?.requestNo ||
  item?.stockOut?._id?.slice(-6) ||
  "—";

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const STATUSES = [
  "Pending",
  "Approved",
  "Under Inspection",
  "Completed",
  "Rejected",
];

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-blue-50 text-blue-700 border-blue-200",
  "Under Inspection": "bg-purple-50 text-purple-700 border-purple-200",
  Completed: "bg-green-50 text-green-700 border-green-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
};

const getStatusActions = (status) => {
  switch (status) {
    case "Pending":
      return ["Approved", "Rejected"];
    case "Approved":
      return ["Under Inspection"];
    case "Under Inspection":
      return ["Completed", "Rejected"];
    default:
      return [];
  }
};

const readLocalStorage = (...keys) => {
  for (const key of keys) {
    try {
      const value = localStorage.getItem(key);
      if (value) return JSON.parse(value);
    } catch {
      // Ignore invalid local storage values.
    }
  }

  return {};
};

const Returns = ({ permissions: permissionsProp, user: userProp }) => {
  /*
   * If your parent component already passes permissions and user,
   * those props are used. Otherwise, this component checks localStorage.
   */
  const storedUser = readLocalStorage("user", "userInfo", "authUser");
  const storedPermissions = readLocalStorage("permissions", "userPermissions");

  const user = userProp || storedUser || {};
  const permissions = permissionsProp || storedPermissions || {};

  const departmentId =
    getId(permissions?.departmentId) ||
    getId(user?.department) ||
    getId(user?.departmentId) ||
    "";

  const isAdmin = Boolean(
    permissions?.canApprove ||
      permissions?.canChooseDepartment ||
      permissions?.canDelete ||
      user?.role === "admin"
  );

  const [returns, setReturns] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stockOuts, setStockOuts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingReturn, setEditingReturn] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    stockOut: "",
    inventory: "",
    department: "",
    quantity: "",
    returnedBy: "",
    returnDate: new Date().toISOString().slice(0, 10),
    condition: "Good",
    reason: "",
    remarks: "",
    receivedBy: "",
    status: "Pending",
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const requests = await Promise.all([
        api.get("/returns"),
        api.get("/departments"),
        api.get("/inventory"),
        api.get("/stock-out"),
      ]);

      setReturns(getList(requests[0]));
      setDepartments(getList(requests[1]));
      setInventory(getList(requests[2]));
      setStockOuts(getList(requests[3]));
    } catch (error) {
      console.error("Error fetching returns data:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load returns data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredReturns = useMemo(() => {
    return returns.filter((item) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        getReturnNo(item).toLowerCase().includes(search) ||
        getInventoryName(item).toLowerCase().includes(search) ||
        getDepartmentName(item).toLowerCase().includes(search) ||
        (item?.returnedBy || "").toLowerCase().includes(search) ||
        getStockOutNo(item).toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [returns, searchTerm, statusFilter]);

  const summary = useMemo(() => {
    return {
      total: returns.length,
      pending: returns.filter((item) => item.status === "Pending").length,
      approved: returns.filter((item) => item.status === "Approved").length,
      inspection: returns.filter(
        (item) => item.status === "Under Inspection"
      ).length,
      completed: returns.filter((item) => item.status === "Completed").length,
      rejected: returns.filter((item) => item.status === "Rejected").length,
    };
  }, [returns]);

  const resetForm = () => {
    setFormData({
      stockOut: "",
      inventory: "",
      department: isAdmin ? "" : departmentId,
      quantity: "",
      returnedBy: user?.name || user?.fullName || "",
      returnDate: new Date().toISOString().slice(0, 10),
      condition: "Good",
      reason: "",
      remarks: "",
      receivedBy: "",
      status: "Pending",
    });
    setEditingReturn(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (item) => {
    if (!isAdmin) return;

    setEditingReturn(item);

    setFormData({
      stockOut: getId(item.stockOut),
      inventory: getId(item.inventory || item.item),
      department: getId(item.department),
      quantity: item.quantity ?? "",
      returnedBy: item.returnedBy || "",
      returnDate: item.returnDate
        ? new Date(item.returnDate).toISOString().slice(0, 10)
        : "",
      condition: item.condition || "Good",
      reason: item.reason || "",
      remarks: item.remarks || "",
      receivedBy: item.receivedBy || "",
      status: item.status || "Pending",
    });

    setShowForm(true);
  };

  const handleStockOutChange = (stockOutId) => {
    const selected = stockOuts.find(
      (item) => getId(item) === stockOutId
    );

    if (!selected) {
      setFormData((previous) => ({
        ...previous,
        stockOut: stockOutId,
      }));
      return;
    }

    const selectedInventory =
      selected.inventory || selected.item || selected.inventoryId;

    const selectedDepartment =
      selected.department || selected.departmentId;

    setFormData((previous) => ({
      ...previous,
      stockOut: stockOutId,
      inventory: getId(selectedInventory),
      department: isAdmin
        ? getId(selectedDepartment)
        : departmentId || getId(selectedDepartment),
    }));
  };

  const getAvailableQuantity = (stockOutId, currentReturnId = null) => {
    const selectedStockOut = stockOuts.find(
      (item) => getId(item) === stockOutId
    );

    if (!selectedStockOut) return Infinity;

    const issuedQuantity = Number(
      selectedStockOut.quantity ||
        selectedStockOut.issuedQuantity ||
        selectedStockOut.totalQuantity ||
        0
    );

    const reservedQuantity = returns
      .filter((item) => {
        const sameStockOut =
          getId(item.stockOut) === stockOutId ||
          getId(item.stockOut?._id) === stockOutId;

        const isCurrentReturn =
          currentReturnId && getId(item) === currentReturnId;

        const reservesQuantity = [
          "Pending",
          "Approved",
          "Under Inspection",
          "Completed",
        ].includes(item.status);

        return sameStockOut && !isCurrentReturn && reservesQuantity;
      })
      .reduce((total, item) => total + Number(item.quantity || 0), 0);

    return Math.max(issuedQuantity - reservedQuantity, 0);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.stockOut) {
      toast.error("Please select a stock-out record");
      return;
    }

    if (!formData.quantity || Number(formData.quantity) <= 0) {
      toast.error("Please enter a valid return quantity");
      return;
    }

    if (!formData.returnedBy.trim()) {
      toast.error("Please enter the name of the person returning the item");
      return;
    }

    if (!formData.returnDate) {
      toast.error("Please select the return date");
      return;
    }

    const availableQuantity = getAvailableQuantity(
      formData.stockOut,
      editingReturn ? getId(editingReturn) : null
    );

    if (Number(formData.quantity) > availableQuantity) {
      toast.error(
        `Return quantity cannot exceed the remaining returnable quantity (${availableQuantity})`
      );
      return;
    }

    if (isAdmin && !formData.department) {
      toast.error("Please select a department");
      return;
    }

    const payload = {
      stockOut: formData.stockOut,
      inventory: formData.inventory,
      department: isAdmin ? formData.department : departmentId,
      quantity: Number(formData.quantity),
      returnedBy: formData.returnedBy.trim(),
      returnDate: formData.returnDate,
      condition: formData.condition,
      reason: formData.reason.trim(),
      remarks: formData.remarks.trim(),
    };

    /*
     * Department submissions must not set status or receivedBy.
     * The backend should create them with status: "Pending".
     */
    if (isAdmin && editingReturn) {
      payload.status = formData.status;
      payload.receivedBy = formData.receivedBy.trim();
    }

    try {
      setSaving(true);

      if (editingReturn) {
        if (!isAdmin) {
          toast.error("You are not allowed to edit return requests");
          return;
        }

        await api.put(`/returns/${getId(editingReturn)}`, payload);
        toast.success("Return updated successfully");
      } else {
        await api.post("/returns", payload);
        toast.success("Return request submitted successfully");
      }

      setShowForm(false);
      resetForm();
      await fetchData();
    } catch (error) {
      console.error("Error saving return:", error);
      toast.error(
        error?.response?.data?.message || "Failed to save return request"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (item, newStatus) => {
    if (!isAdmin) {
      toast.error("Only admin can update return status");
      return;
    }

    const allowedStatuses = getStatusActions(item.status);

    if (!allowedStatuses.includes(newStatus)) {
      toast.error("This status change is not allowed");
      return;
    }

    let receivedBy = "";

    if (newStatus === "Completed") {
      receivedBy = window.prompt(
        "Enter the name of the person who received the returned items:"
      );

      if (!receivedBy?.trim()) {
        toast.error("Received By is required to complete a return");
        return;
      }
    }

    try {
      const payload = { status: newStatus };

      if (newStatus === "Completed") {
        payload.receivedBy = receivedBy.trim();
      }

      await api.patch(
        `/returns/${getId(item)}/status`,
        payload
      );

      toast.success(`Return marked as ${newStatus}`);
      setSelectedReturn(null);
      await fetchData();
    } catch (error) {
      console.error("Error updating return status:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update return status"
      );
    }
  };

  const handleDelete = async (item) => {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete return ${getReturnNo(item)}?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/returns/${getId(item)}`);
      toast.success("Return deleted successfully");
      setSelectedReturn(null);
      await fetchData();
    } catch (error) {
      console.error("Error deleting return:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete return"
      );
    }
  };

  const getConditionStyle = (condition) => {
    if (condition === "Good") {
      return "bg-green-50 text-green-700";
    }

    if (condition === "Repair") {
      return "bg-amber-50 text-amber-700";
    }

    return "bg-red-50 text-red-700";
  };

  const availableStockOuts = stockOuts.filter((item) => {
    const itemDepartment = getId(item.department || item.departmentId);

    if (!isAdmin && departmentId && itemDepartment !== departmentId) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Returns</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isAdmin
              ? "Manage return requests, approvals, inspections and completed returns."
              : "Submit returned inventory items and track your return requests."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={fetchData}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={17} />
            {isAdmin ? "Add Return" : "Submit Return"}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          title="Total Returns"
          value={summary.total}
          icon={<ClipboardList size={20} />}
          color="blue"
        />
        <SummaryCard
          title="Pending"
          value={summary.pending}
          icon={<Clock size={20} />}
          color="amber"
        />
        <SummaryCard
          title="Approved"
          value={summary.approved}
          icon={<ShieldCheck size={20} />}
          color="blue"
        />
        <SummaryCard
          title="Under Inspection"
          value={summary.inspection}
          icon={<AlertTriangle size={20} />}
          color="purple"
        />
        <SummaryCard
          title="Completed"
          value={summary.completed}
          icon={<CheckCircle2 size={20} />}
          color="green"
        />
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search return number, item, department..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Returns table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-gray-800">Return Records</h2>
            <p className="mt-1 text-xs text-gray-500">
              {filteredReturns.length} record(s) found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-52 items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw className="animate-spin" size={18} />
              Loading returns...
            </div>
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center px-4 text-center">
            <Package size={34} className="mb-3 text-gray-300" />
            <p className="font-medium text-gray-700">No return records found</p>
            <p className="mt-1 text-sm text-gray-500">
              Submit a return request or change your search filters.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Return No.</th>
                    <th className="px-5 py-3 font-semibold">Item</th>
                    <th className="px-5 py-3 font-semibold">Department</th>
                    <th className="px-5 py-3 font-semibold">Quantity</th>
                    <th className="px-5 py-3 font-semibold">Return Date</th>
                    <th className="px-5 py-3 font-semibold">Condition</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredReturns.map((item) => (
                    <tr
                      key={getId(item)}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-800">
                        {getReturnNo(item)}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {getInventoryName(item)}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {getDepartmentName(item)}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {item.quantity}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                        {formatDate(item.returnDate)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${getConditionStyle(
                            item.condition
                          )}`}
                        >
                          {item.condition || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <ActionButton
                            title="View details"
                            onClick={() => setSelectedReturn(item)}
                          >
                            <Eye size={16} />
                          </ActionButton>

                          {isAdmin && (
                            <>
                              <ActionButton
                                title="Edit return"
                                onClick={() => openEditForm(item)}
                              >
                                <Pencil size={16} />
                              </ActionButton>

                              <ActionButton
                                title="Delete return"
                                danger
                                onClick={() => handleDelete(item)}
                              >
                                <Trash2 size={16} />
                              </ActionButton>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 p-4 lg:hidden">
              {filteredReturns.map((item) => (
                <div
                  key={getId(item)}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {getReturnNo(item)}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {getInventoryName(item)}
                      </p>
                    </div>

                    <StatusBadge status={item.status} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <MobileInfo label="Department" value={getDepartmentName(item)} />
                    <MobileInfo label="Quantity" value={item.quantity} />
                    <MobileInfo
                      label="Return Date"
                      value={formatDate(item.returnDate)}
                    />
                    <MobileInfo
                      label="Condition"
                      value={item.condition || "—"}
                    />
                  </div>

                  <div className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-3">
                    <ActionButton
                      title="View details"
                      onClick={() => setSelectedReturn(item)}
                    >
                      <Eye size={16} />
                    </ActionButton>

                    {isAdmin && (
                      <>
                        <ActionButton
                          title="Edit return"
                          onClick={() => openEditForm(item)}
                        >
                          <Pencil size={16} />
                        </ActionButton>

                        <ActionButton
                          title="Delete return"
                          danger
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 size={16} />
                        </ActionButton>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Return Modal */}
      {showForm && (
        <Modal
          title={editingReturn ? "Edit Return" : "Submit Return Request"}
          onClose={() => {
            setShowForm(false);
            resetForm();
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Stock-Out Reference" required>
                <select
                  value={formData.stockOut}
                  onChange={(event) =>
                    handleStockOutChange(event.target.value)
                  }
                  required
                  className="form-input"
                >
                  <option value="">Select stock-out record</option>
                  {availableStockOuts.map((stockOut) => (
                    <option key={getId(stockOut)} value={getId(stockOut)}>
                      {getStockOutNo({ stockOut })} —{" "}
                      {getName(
                        stockOut.inventory || stockOut.item,
                        "Inventory item"
                      )}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Return Date" required>
                <input
                  type="date"
                  value={formData.returnDate}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      returnDate: event.target.value,
                    })
                  }
                  required
                  className="form-input"
                />
              </FormField>

              <FormField label="Department" required>
                <select
                  value={formData.department}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      department: event.target.value,
                    })
                  }
                  disabled={!isAdmin}
                  required
                  className="form-input disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="">Select department</option>
                  {departments.map((department) => (
                    <option
                      key={getId(department)}
                      value={getId(department)}
                    >
                      {getName(department)}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Inventory Item">
                <select
                  value={formData.inventory}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      inventory: event.target.value,
                    })
                  }
                  className="form-input"
                >
                  <option value="">Select item</option>
                  {inventory.map((item) => (
                    <option key={getId(item)} value={getId(item)}>
                      {getName(item)}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Quantity" required>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      quantity: event.target.value,
                    })
                  }
                  required
                  className="form-input"
                  placeholder="Enter quantity"
                />
                {formData.stockOut && (
                  <p className="mt-1 text-xs text-gray-500">
                    Remaining returnable quantity:{" "}
                    <strong>
                      {getAvailableQuantity(
                        formData.stockOut,
                        editingReturn ? getId(editingReturn) : null
                      )}
                    </strong>
                  </p>
                )}
              </FormField>

              <FormField label="Returned By" required>
                <input
                  type="text"
                  value={formData.returnedBy}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      returnedBy: event.target.value,
                    })
                  }
                  required
                  className="form-input"
                  placeholder="Enter person's name"
                />
              </FormField>

              <FormField label="Item Condition" required>
                <select
                  value={formData.condition}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      condition: event.target.value,
                    })
                  }
                  required
                  className="form-input"
                >
                  <option value="Good">Good</option>
                  <option value="Repair">Repair</option>
                  <option value="Damaged">Damaged</option>
                </select>
              </FormField>

              <FormField label="Reason for Return" required>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      reason: event.target.value,
                    })
                  }
                  required
                  className="form-input"
                  placeholder="Enter reason"
                />
              </FormField>

              <div className="sm:col-span-2">
                <FormField label="Remarks">
                  <textarea
                    rows="3"
                    value={formData.remarks}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        remarks: event.target.value,
                      })
                    }
                    className="form-input"
                    placeholder="Additional notes..."
                  />
                </FormField>
              </div>

              {/* Admin-only fields */}
              {isAdmin && editingReturn && (
                <>
                  <FormField label="Status">
                    <select
                      value={formData.status}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          status: event.target.value,
                        })
                      }
                      className="form-input"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Prefer the workflow buttons in the details panel to
                      perform status transitions.
                    </p>
                  </FormField>

                  <FormField label="Received By">
                    <input
                      type="text"
                      value={formData.receivedBy}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          receivedBy: event.target.value,
                        })
                      }
                      className="form-input"
                      placeholder="Enter receiver's name"
                    />
                  </FormField>
                </>
              )}
            </div>

            {!isAdmin && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={17} className="mt-0.5 shrink-0" />
                  <p>
                    Your request will be submitted as <strong>Pending</strong>.
                    The admin will review and process it. Inventory stock will
                    not change when you submit the request.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingReturn
                  ? "Update Return"
                  : "Submit Request"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Details Modal */}
      {selectedReturn && (
        <Modal
          title={`Return Details - ${getReturnNo(selectedReturn)}`}
          onClose={() => setSelectedReturn(null)}
        >
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Current status</p>
                <div className="mt-1">
                  <StatusBadge status={selectedReturn.status} />
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Return date: {formatDate(selectedReturn.returnDate)}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Detail label="Return Number" value={getReturnNo(selectedReturn)} />
              <Detail
                label="Stock-Out Reference"
                value={getStockOutNo(selectedReturn)}
              />
              <Detail
                label="Inventory Item"
                value={getInventoryName(selectedReturn)}
              />
              <Detail
                label="Department"
                value={getDepartmentName(selectedReturn)}
              />
              <Detail label="Quantity" value={selectedReturn.quantity} />
              <Detail
                label="Condition"
                value={selectedReturn.condition}
              />
              <Detail
                label="Returned By"
                value={selectedReturn.returnedBy}
              />
              <Detail
                label="Received By"
                value={selectedReturn.receivedBy || "Not received yet"}
              />
              <Detail
                label="Reason"
                value={selectedReturn.reason || "—"}
              />
              <Detail
                label="Remarks"
                value={selectedReturn.remarks || "—"}
              />
            </div>

            {/* Admin workflow actions */}
            {isAdmin &&
              getStatusActions(selectedReturn.status).length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="mb-3 text-sm font-semibold text-gray-800">
                    Admin Actions
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {getStatusActions(selectedReturn.status).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() =>
                          handleStatusChange(selectedReturn, status)
                        }
                        className={`rounded-lg px-4 py-2 text-sm font-medium ${
                          status === "Rejected"
                            ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                            : status === "Completed"
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {status === "Approved"
                          ? "Approve Request"
                          : status === "Under Inspection"
                          ? "Start Inspection"
                          : status === "Completed"
                          ? "Mark Completed"
                          : "Reject Request"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {isAdmin &&
              ["Completed", "Rejected"].includes(selectedReturn.status) && (
                <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                  This return request has reached its final status. No further
                  workflow actions are available.
                </p>
              )}

            <div className="flex justify-end border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedReturn(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const SummaryCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={`rounded-lg p-2 ${colors[color] || colors.blue}`}>
          {icon}
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${
      STATUS_STYLES[status] || "border-gray-200 bg-gray-50 text-gray-600"
    }`}
  >
    {status || "Unknown"}
  </span>
);

const ActionButton = ({ children, title, onClick, danger = false }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`rounded-lg border p-2 transition ${
      danger
        ? "border-red-100 text-red-600 hover:bg-red-50"
        : "border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`}
  >
    {children}
  </button>
);

const MobileInfo = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400">{label}</p>
    <p className="mt-0.5 break-words text-sm font-medium text-gray-700">
      {value ?? "—"}
    </p>
  </div>
);

const FormField = ({ label, required = false, children }) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const Detail = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
      {label}
    </p>
    <p className="mt-1 break-words text-sm font-medium text-gray-800">
      {value || "—"}
    </p>
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}
  >
    <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-5">{children}</div>
    </div>
  </div>
);

export default Returns;