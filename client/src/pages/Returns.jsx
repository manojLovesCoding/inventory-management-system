import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Eye,
  Package,
  Plus,
  Search,
  UserRound,
  X,
  AlertTriangle,
  Wrench,
  CircleCheck,
  Pencil,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

const Returns = () => {
  const [returns, setReturns] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [stockOuts, setStockOuts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [conditionFilter, setConditionFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [inventoryFilter, setInventoryFilter] = useState("All");

  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [editingReturn, setEditingReturn] = useState(null);

  const emptyForm = {
    returnNo: "",
    inventory: "",
    department: "",
    quantity: "",
    returnDate: "",
    returnedBy: "",
    condition: "",
    reason: "",
    stockOut: "",
    status: "Completed",
    receivedBy: "",
    remarks: "",
  };

  const [form, setForm] = useState(emptyForm);

  /* =====================================================
     FETCH RETURNS
  ===================================================== */

  const fetchReturns = async () => {
    try {
      setLoading(true);

      const response = await api.get("/returns");

      setReturns(response.data?.returns || []);
    } catch (error) {
      console.error("Fetch returns error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch return records",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     FETCH DEPARTMENTS
  ===================================================== */

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/departments");

      const data =
        response.data?.departments ||
        response.data?.data ||
        [];

      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch departments error:", error);
    }
  };

  /* =====================================================
     FETCH INVENTORY
  ===================================================== */

  const fetchInventory = async () => {
    try {
      const response = await api.get("/inventory");

      const data =
        response.data?.inventory ||
        response.data?.items ||
        response.data?.data ||
        [];

      setInventoryItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch inventory error:", error);
    }
  };

  /* =====================================================
     FETCH STOCK OUTS
  ===================================================== */

  const fetchStockOuts = async () => {
    try {
      const response = await api.get("/stock-out");

      const data =
        response.data?.stockOuts ||
        response.data?.stockOut ||
        response.data?.data ||
        [];

      setStockOuts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch stock outs error:", error);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    fetchReturns();
    fetchDepartments();
    fetchInventory();
    fetchStockOuts();
  }, []);

  /* =====================================================
     FORM HANDLER
  ===================================================== */

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =====================================================
     OPEN ADD MODAL
  ===================================================== */

  const openAddModal = () => {
    setEditingReturn(null);

    setForm({
      ...emptyForm,
      returnDate: new Date()
        .toISOString()
        .split("T")[0],
    });

    setShowAddModal(true);
  };

  /* =====================================================
     OPEN EDIT MODAL
  ===================================================== */

  const openEditModal = (record) => {
    setSelectedReturn(null);
    setEditingReturn(record);

    setForm({
      returnNo: record.returnNo || "",
      inventory: record.inventory?._id || record.inventory || "",
      department:
        record.department?._id ||
        record.department ||
        "",
      quantity: record.quantity || "",
      returnDate: record.returnDate
        ? new Date(record.returnDate)
            .toISOString()
            .split("T")[0]
        : "",
      returnedBy: record.returnedBy || "",
      condition: record.condition || "",
      reason: record.reason || "",
      stockOut:
        record.stockOut?._id ||
        record.stockOut ||
        "",
      status: record.status || "Completed",
      receivedBy: record.receivedBy || "",
      remarks: record.remarks || "",
    });

    setShowAddModal(true);
  };

  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  const closeFormModal = () => {
    if (saving) return;

    setShowAddModal(false);
    setEditingReturn(null);
    setForm(emptyForm);
  };

  /* =====================================================
     SAVE RETURN
  ===================================================== */

  const handleSaveReturn = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      const payload = {
        returnNo: form.returnNo.trim() || undefined,
        inventory: form.inventory,
        department: form.department,
        quantity: Number(form.quantity),
        returnDate: form.returnDate,
        returnedBy: form.returnedBy.trim(),
        condition: form.condition,
        reason: form.reason.trim(),
        stockOut: form.stockOut || null,
        status: form.status || "Completed",
        receivedBy: form.receivedBy.trim(),
        remarks: form.remarks.trim(),
      };

      let response;

      if (editingReturn) {
        response = await api.put(
          `/returns/${editingReturn._id}`,
          payload,
        );
      } else {
        response = await api.post(
          "/returns",
          payload,
        );
      }

      toast.success(
        response.data?.message ||
          (editingReturn
            ? "Return updated successfully"
            : "Return created successfully"),
      );

      closeFormModal();

      await fetchReturns();
      await fetchInventory();
    } catch (error) {
      console.error("Save return error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to save return",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     DELETE RETURN
  ===================================================== */

  const handleDeleteReturn = async (record) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${getReturnNo(
        record,
      )}?`,
    );

    if (!confirmed) return;

    try {
      await api.delete(`/returns/${record._id}`);

      toast.success(
        "Return deleted successfully",
      );

      setSelectedReturn(null);

      await fetchReturns();
      await fetchInventory();
    } catch (error) {
      console.error("Delete return error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to delete return",
      );
    }
  };

  /* =====================================================
     FILTER DATA
  ===================================================== */

  const filteredReturns = useMemo(() => {
    const query = search.toLowerCase().trim();

    return returns.filter((record) => {
      const returnNo = getReturnNo(record);
      const itemName = getInventoryName(record);
      const category = getInventoryCategory(record);
      const department = getDepartmentName(record);

      const matchesSearch =
        !query ||
        returnNo.toLowerCase().includes(query) ||
        itemName.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query) ||
        department.toLowerCase().includes(query) ||
        (record.returnedBy || "")
          .toLowerCase()
          .includes(query) ||
        (record.reason || "")
          .toLowerCase()
          .includes(query) ||
        (record.remarks || "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        record.status === statusFilter;

      const matchesCondition =
        conditionFilter === "All" ||
        record.condition === conditionFilter;

      const departmentId =
        record.department?._id ||
        record.department ||
        "";

      const matchesDepartment =
        departmentFilter === "All" ||
        departmentId === departmentFilter ||
        department === departmentFilter;

      const inventoryId =
        record.inventory?._id ||
        record.inventory ||
        "";

      const matchesInventory =
        inventoryFilter === "All" ||
        inventoryId === inventoryFilter ||
        itemName === inventoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCondition &&
        matchesDepartment &&
        matchesInventory
      );
    });
  }, [
    returns,
    search,
    statusFilter,
    conditionFilter,
    departmentFilter,
    inventoryFilter,
  ]);

  /* =====================================================
     SUMMARY
  ===================================================== */

  const totalReturns = returns.length;

  const completedReturns = returns.filter(
    (record) => record.status === "Completed",
  ).length;

  const inspectionReturns = returns.filter(
    (record) =>
      record.status === "Under Inspection",
  ).length;

  const damagedReturns = returns.filter(
    (record) =>
      record.condition === "Damaged" ||
      record.condition === "Repair",
  ).length;

  const totalReturnedQuantity = returns.reduce(
    (sum, record) =>
      sum + Number(record.quantity || 0),
    0,
  );

  /* =====================================================
     STATUS STYLE
  ===================================================== */

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

  /* =====================================================
     CONDITION STYLE
  ===================================================== */

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
          onClick={openAddModal}
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
          <div className="flex flex-col gap-4">
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
                  value={departmentFilter}
                  onChange={(event) =>
                    setDepartmentFilter(
                      event.target.value,
                    )
                  }
                  className="w-full sm:w-auto px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="All">
                    All Departments
                  </option>

                  {departments.map((department) => (
                    <option
                      key={department._id}
                      value={department._id}
                    >
                      {getDepartmentName({
                        department,
                      })}
                    </option>
                  ))}
                </select>

                <select
                  value={inventoryFilter}
                  onChange={(event) =>
                    setInventoryFilter(
                      event.target.value,
                    )
                  }
                  className="w-full sm:w-auto px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="All">
                    All Items
                  </option>

                  {inventoryItems.map((item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {getInventoryName({
                        inventory: item,
                      })}
                    </option>
                  ))}
                </select>

                <select
                  value={conditionFilter}
                  onChange={(event) =>
                    setConditionFilter(
                      event.target.value,
                    )
                  }
                  className="w-full sm:w-auto px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="All">
                    All Conditions
                  </option>
                  <option value="Good">Good</option>
                  <option value="Repair">Repair</option>
                  <option value="Damaged">
                    Damaged
                  </option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value,
                    )
                  }
                  className="w-full sm:w-auto px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="All">
                    All Status
                  </option>
                  <option value="Completed">
                    Completed
                  </option>
                  <option value="Under Inspection">
                    Under Inspection
                  </option>
                  <option value="Rejected">
                    Rejected
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            DESKTOP TABLE
        ================================================= */}

        <div className="hidden lg:block overflow-x-auto">
          {loading ? (
            <LoadingState />
          ) : (
            <>
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
                      key={record._id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* RETURN ID */}

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-indigo-600">
                          {getReturnNo(record)}
                        </p>

                        <p className="text-xs text-slate-400 mt-1 max-w-[220px] truncate">
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
                              {getInventoryName(record)}
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                              {getInventoryCategory(
                                record,
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* DEPARTMENT */}

                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700">
                          {getDepartmentName(record)}
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

                          {formatDate(
                            record.returnDate,
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
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() =>
                              setSelectedReturn(record)
                            }
                            className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() =>
                              openEditModal(record)
                            }
                            className="p-2 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition"
                            title="Edit return"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteReturn(record)
                            }
                            className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete return"
                          >
                            <Trash2 className="w-4 h-4" />
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
            </>
          )}
        </div>

        {/* =================================================
            MOBILE CARDS
        ================================================= */}

        <div className="lg:hidden divide-y divide-slate-100">
          {loading ? (
            <LoadingState />
          ) : (
            <>
              {filteredReturns.map((record) => (
                <div
                  key={record._id}
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
                          {getInventoryName(record)}
                        </p>

                        <p className="text-xs text-indigo-600 mt-1">
                          {getReturnNo(record)}
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
                      value={getDepartmentName(
                        record,
                      )}
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
                      value={formatDate(
                        record.returnDate,
                      )}
                    />

                    <Info
                      label="Condition"
                      value={record.condition}
                    />

                    <Info
                      label="Category"
                      value={getInventoryCategory(
                        record,
                      )}
                    />
                  </div>

                  {/* ACTION */}

                  <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() =>
                        setSelectedReturn(record)
                      }
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>

                    <button
                      onClick={() =>
                        openEditModal(record)
                      }
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-amber-600 hover:bg-amber-50 transition"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDeleteReturn(record)
                      }
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {filteredReturns.length === 0 && (
                <EmptyState />
              )}
            </>
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

          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            {/* HEADER */}

            <div className="sticky top-0 z-10 bg-white px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-600 font-medium">
                  {getReturnNo(selectedReturn)}
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
                      {getInventoryName(
                        selectedReturn,
                      )}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      {getInventoryCategory(
                        selectedReturn,
                      )}
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
                  value={getDepartmentName(
                    selectedReturn,
                  )}
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
                  value={formatDate(
                    selectedReturn.returnDate,
                  )}
                />

                <Detail
                  label="Received By"
                  value={selectedReturn.receivedBy}
                />

                <Detail
                  label="Category"
                  value={getInventoryCategory(
                    selectedReturn,
                  )}
                />

                <Detail
                  label="Stock Out"
                  value={
                    selectedReturn.stockOut
                      ?.stockOutNo ||
                    "Not linked"
                  }
                />

                <Detail
                  label="Item Code"
                  value={
                    selectedReturn.inventory
                      ?.itemCode || "—"
                  }
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
                  {selectedReturn.remarks ||
                    "No remarks"}
                </p>
              </div>
            </div>

            {/* FOOTER */}

            <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-between gap-2">
              <button
                onClick={() =>
                  handleDeleteReturn(
                    selectedReturn,
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-50 border border-rose-200 text-sm font-medium text-rose-600 hover:bg-rose-100 transition"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    openEditModal(
                      selectedReturn,
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-sm font-medium text-amber-700 hover:bg-amber-100 transition"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>

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
        </div>
      )}

      {/* =================================================
          ADD / EDIT RETURN MODAL
      ================================================= */}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={closeFormModal}
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            {/* HEADER */}

            <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingReturn
                    ? "Edit Return"
                    : "Add Return"}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  {editingReturn
                    ? "Update the selected inventory return record."
                    : "Record inventory returned by a department or staff member."}
                </p>
              </div>

              <button
                onClick={closeFormModal}
                disabled={saving}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSaveReturn}>
              <div className="p-5 space-y-5">
                {/* RETURN NUMBER */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Return Number
                  </label>

                  <input
                    type="text"
                    name="returnNo"
                    value={form.returnNo}
                    onChange={handleFormChange}
                    placeholder="Leave blank to generate automatically"
                    disabled={saving}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50"
                  />

                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Example: RET-2026-001
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* ITEM */}

                  <FormSelect
                    label="Item"
                    name="inventory"
                    value={form.inventory}
                    onChange={handleFormChange}
                    required
                    disabled={saving}
                  >
                    <option value="">
                      Select item
                    </option>

                    {inventoryItems.map((item) => (
                      <option
                        key={item._id}
                        value={item._id}
                      >
                        {getInventoryName({
                          inventory: item,
                        })}
                        {item.itemCode
                          ? ` (${item.itemCode})`
                          : ""}
                      </option>
                    ))}
                  </FormSelect>

                  {/* QUANTITY */}

                  <FormField
                    label="Quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    placeholder="0"
                    value={form.quantity}
                    onChange={handleFormChange}
                    required
                    disabled={saving}
                  />

                  {/* DEPARTMENT */}

                  <FormSelect
                    label="Department"
                    name="department"
                    value={form.department}
                    onChange={handleFormChange}
                    required
                    disabled={saving}
                  >
                    <option value="">
                      Select department
                    </option>

                    {departments.map((department) => (
                      <option
                        key={department._id}
                        value={department._id}
                      >
                        {getDepartmentName({
                          department,
                        })}
                      </option>
                    ))}
                  </FormSelect>

                  {/* RETURNED BY */}

                  <FormField
                    label="Returned By"
                    name="returnedBy"
                    placeholder="Staff / Faculty name"
                    value={form.returnedBy}
                    onChange={handleFormChange}
                    required
                    disabled={saving}
                  />

                  {/* RETURN DATE */}

                  <FormField
                    label="Return Date"
                    name="returnDate"
                    type="date"
                    value={form.returnDate}
                    onChange={handleFormChange}
                    required
                    disabled={saving}
                  />

                  {/* CONDITION */}

                  <FormSelect
                    label="Condition"
                    name="condition"
                    value={form.condition}
                    onChange={handleFormChange}
                    required
                    disabled={saving}
                  >
                    <option value="">
                      Select condition
                    </option>

                    <option value="Good">
                      Good
                    </option>

                    <option value="Repair">
                      Repair
                    </option>

                    <option value="Damaged">
                      Damaged
                    </option>
                  </FormSelect>

                  {/* STATUS */}

                  <FormSelect
                    label="Status"
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    required
                    disabled={saving}
                  >
                    <option value="Completed">
                      Completed
                    </option>

                    <option value="Under Inspection">
                      Under Inspection
                    </option>

                    <option value="Rejected">
                      Rejected
                    </option>
                  </FormSelect>

                  {/* RECEIVED BY */}

                  <FormField
                    label="Received By"
                    name="receivedBy"
                    placeholder="Inventory officer / administrator"
                    value={form.receivedBy}
                    onChange={handleFormChange}
                    required
                    disabled={saving}
                  />
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
                    name="reason"
                    value={form.reason}
                    onChange={handleFormChange}
                    required
                    disabled={saving}
                    placeholder="Reason for returning the item"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50"
                  />
                </div>

                {/* STOCK OUT REFERENCE */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Stock Out Reference
                  </label>

                  <select
                    name="stockOut"
                    value={form.stockOut}
                    onChange={handleFormChange}
                    disabled={saving}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50"
                  >
                    <option value="">
                      No stock-out reference
                    </option>

                    {stockOuts.map((stockOut) => (
                      <option
                        key={stockOut._id}
                        value={stockOut._id}
                      >
                        {stockOut.stockOutNo ||
                          stockOut._id}
                        {" - "}
                        {stockOut.quantity || 0} units
                      </option>
                    ))}
                  </select>

                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Optional reference to the original
                    stock-out transaction.
                  </p>
                </div>

                {/* REMARKS */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Remarks
                  </label>

                  <textarea
                    name="remarks"
                    value={form.remarks}
                    onChange={handleFormChange}
                    rows="3"
                    disabled={saving}
                    placeholder="Enter additional information..."
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50"
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
                  onClick={closeFormModal}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60"
                >
                  <ArrowDownLeft className="w-4 h-4" />

                  {saving
                    ? editingReturn
                      ? "Updating..."
                      : "Saving..."
                    : editingReturn
                      ? "Update Return"
                      : "Save Return"}
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
   HELPERS
===================================================== */

const getReturnNo = (record) => {
  return record?.returnNo || record?.id || "—";
};

const getInventoryName = (record) => {
  const inventory = record?.inventory;

  if (!inventory) return "Unknown Item";

  if (typeof inventory === "string") {
    return inventory;
  }

  return (
    inventory.name ||
    inventory.itemName ||
    inventory.itemCode ||
    "Unknown Item"
  );
};

const getInventoryCategory = (record) => {
  const inventory = record?.inventory;

  if (!inventory || typeof inventory === "string") {
    return "—";
  }

  if (
    inventory.category &&
    typeof inventory.category === "object"
  ) {
    return (
      inventory.category.name ||
      inventory.category.categoryName ||
      "—"
    );
  }

  return inventory.category || "—";
};

const getDepartmentName = (record) => {
  const department = record?.department;

  if (!department) return "Unknown Department";

  if (typeof department === "string") {
    return department;
  }

  return (
    department.name ||
    department.departmentName ||
    department.code ||
    "Unknown Department"
  );
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString();
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
        {value || "—"}
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
        {value || "—"}
      </p>
    </div>
  );
};

/* =====================================================
   FORM FIELD
===================================================== */

const FormField = ({
  label,
  name,
  type = "text",
  placeholder,
  required,
  value,
  onChange,
  disabled,
  min,
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
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        disabled={disabled}
        min={min}
        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50"
      />
    </div>
  );
};

/* =====================================================
   FORM SELECT
===================================================== */

const FormSelect = ({
  label,
  name,
  value,
  onChange,
  required,
  disabled,
  children,
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

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50"
      >
        {children}
      </select>
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
   LOADING STATE
===================================================== */

const LoadingState = () => {
  return (
    <div className="py-16 text-center">
      <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />

      <p className="text-sm font-medium text-slate-600">
        Loading return records...
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