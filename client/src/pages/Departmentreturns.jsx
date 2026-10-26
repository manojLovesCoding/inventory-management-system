import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownLeft,
  CalendarDays,
  CheckCircle2,
  CircleCheck,
  ClipboardList,
  Clock3,
  Package,
  Plus,
  Search,
  Trash2,
  User,
  Wrench,
  X,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const statusOptions = ["All", "Under Inspection", "Completed", "Rejected"];

const statusStyles = {
  "Under Inspection": "bg-amber-50 text-amber-700 border-amber-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

const statusLabels = {
  "Under Inspection": "Awaiting admin",
  Completed: "Accepted",
  Rejected: "Rejected",
};

const conditionStyles = {
  Good: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Repair: "bg-amber-50 text-amber-700 border-amber-200",
  Damaged: "bg-rose-50 text-rose-700 border-rose-200",
};

const today = () => new Date().toISOString().split("T")[0];

const formatDate = (date) => {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getItemName = (record) =>
  record?.inventory?.name || record?.inventory?.itemCode || "Unknown Item";

const emptyForm = () => ({
  stockOut: "",
  quantity: "",
  returnDate: today(),
  returnedBy: "",
  condition: "Good",
  reason: "",
  remarks: "",
});

const DepartmentReturns = () => {
  const { user } = useAuth();

  const [returns, setReturns] = useState([]);
  const [returnableItems, setReturnableItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm());

  // --------------------------------------------------
  // FETCH
  // --------------------------------------------------

  const fetchReturns = async () => {
    try {
      setLoading(true);

      const response = await api.get("/department-returns");

      setReturns(response.data?.returns || []);
    } catch (error) {
      console.error("Failed to fetch returns:", error);

      toast.error(
        error.response?.data?.message || "Failed to load return records",
      );

      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReturnableItems = async () => {
    try {
      setItemsLoading(true);

      const response = await api.get("/department-returns/issued-items");

      setReturnableItems(response.data?.items || []);
    } catch (error) {
      console.error("Failed to fetch issued items:", error);

      toast.error(
        error.response?.data?.message || "Failed to load issued items",
      );

      setReturnableItems([]);
    } finally {
      setItemsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  // --------------------------------------------------
  // DERIVED
  // --------------------------------------------------

  const selectedIssue = useMemo(
    () =>
      returnableItems.find(
        (item) => String(item.stockOutId) === String(form.stockOut),
      ),
    [returnableItems, form.stockOut],
  );

  const filteredReturns = useMemo(() => {
    const query = search.trim().toLowerCase();

    return returns.filter((record) => {
      const matchesSearch =
        !query ||
        String(record.returnNo || "")
          .toLowerCase()
          .includes(query) ||
        getItemName(record).toLowerCase().includes(query) ||
        String(record.reason || "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [returns, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: returns.length,
      pending: returns.filter((r) => r.status === "Under Inspection").length,
      accepted: returns.filter((r) => r.status === "Completed").length,
      rejected: returns.filter((r) => r.status === "Rejected").length,
    }),
    [returns],
  );

  // --------------------------------------------------
  // MODAL
  // --------------------------------------------------

  const openModal = () => {
    setForm({ ...emptyForm(), returnedBy: user?.name || "" });
    setShowModal(true);
    fetchReturnableItems();
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setForm(emptyForm());
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    if (!selectedIssue) {
      toast.error("Please select an item to return");
      return;
    }

    const quantity = Number(form.quantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (quantity > selectedIssue.returnableQuantity) {
      toast.error(
        `You can return at most ${selectedIssue.returnableQuantity} ${
          selectedIssue.inventory?.unit || "unit(s)"
        }`,
      );
      return;
    }

    if (!form.returnedBy.trim()) {
      toast.error("Please enter who is returning the item");
      return;
    }

    if (!form.reason.trim()) {
      toast.error("Please enter the reason for return");
      return;
    }

    try {
      setSaving(true);

      const response = await api.post("/department-returns", {
        stockOut: form.stockOut,
        quantity,
        returnDate: form.returnDate,
        returnedBy: form.returnedBy.trim(),
        condition: form.condition,
        reason: form.reason.trim(),
        remarks: form.remarks.trim(),
      });

      toast.success(response.data?.message || "Return submitted");

      setShowModal(false);
      setForm(emptyForm());

      await fetchReturns();
    } catch (error) {
      console.error("Failed to submit return:", error);

      toast.error(error.response?.data?.message || "Failed to submit return");
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // CANCEL
  // --------------------------------------------------

  const handleCancel = async (record) => {
    const confirmed = window.confirm(
      `Cancel return ${record.returnNo}? This cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setCancellingId(record._id);

      await api.delete(`/department-returns/${record._id}`);

      toast.success("Return cancelled");

      await fetchReturns();
    } catch (error) {
      console.error("Failed to cancel return:", error);

      toast.error(error.response?.data?.message || "Failed to cancel return");
    } finally {
      setCancellingId(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Return an Item
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Send items issued to your department back to the store.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Return an Item
          </button>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Total returns"
            value={stats.total}
            icon={ClipboardList}
            iconBg="bg-slate-100"
            iconColor="text-slate-600"
            valueColor="text-slate-900"
          />

          <StatCard
            label="Awaiting admin"
            value={stats.pending}
            icon={Clock3}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            valueColor="text-amber-600"
          />

          <StatCard
            label="Accepted"
            value={stats.accepted}
            icon={CheckCircle2}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            valueColor="text-emerald-600"
          />

          <StatCard
            label="Rejected"
            value={stats.rejected}
            icon={XCircle}
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
            valueColor="text-rose-600"
          />
        </div>

        {/* LIST */}

        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by return number, item or reason..."
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-52 px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  Status: {status === "All" ? "All" : statusLabels[status]}
                </option>
              ))}
            </select>

            {(search || statusFilter !== "All") && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 sm:px-2"
              >
                Clear filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 mx-auto border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />

              <p className="mt-3 text-sm font-medium text-slate-600">
                Loading your returns...
              </p>
            </div>
          ) : filteredReturns.length === 0 ? (
            <div className="py-16 px-5 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center">
                <ArrowDownLeft className="w-6 h-6 text-slate-400" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-700">
                {returns.length === 0
                  ? "You haven't returned any items yet"
                  : "No returns match your filters"}
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                {returns.length === 0
                  ? "Select Return an Item to send something back to the store."
                  : "Try a different search or status."}
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP */}

              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100">
                      {[
                        "Return",
                        "Item",
                        "Qty",
                        "Condition",
                        "Date",
                        "Status",
                        "",
                      ].map((heading, index) => (
                        <th
                          key={heading || index}
                          className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredReturns.map((record) => (
                      <tr
                        key={record._id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-indigo-600">
                            {record.returnNo}
                          </p>

                          <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px] truncate">
                            {record.reason}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                              <Package className="w-4 h-4 text-indigo-600" />
                            </div>

                            <div>
                              <p className="text-sm font-medium text-slate-800">
                                {getItemName(record)}
                              </p>

                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {record.stockOut?.stockOutNo
                                  ? `From ${record.stockOut.stockOutNo}`
                                  : record.inventory?.itemCode || ""}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm font-semibold text-slate-700">
                            {record.quantity}
                          </span>

                          <span className="text-[10px] text-slate-400 ml-1">
                            {record.inventory?.unit || "Nos"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <Badge
                            className={
                              conditionStyles[record.condition] ||
                              conditionStyles.Good
                            }
                          >
                            {record.condition}
                          </Badge>
                        </td>

                        <td className="px-5 py-4 text-xs text-slate-600">
                          {formatDate(record.returnDate)}
                        </td>

                        <td className="px-5 py-4">
                          <Badge
                            className={
                              statusStyles[record.status] ||
                              statusStyles["Under Inspection"]
                            }
                          >
                            {statusLabels[record.status] || record.status}
                          </Badge>
                        </td>

                        <td className="px-5 py-4 text-right">
                          {record.status === "Under Inspection" && (
                            <button
                              type="button"
                              onClick={() => handleCancel(record)}
                              disabled={cancellingId === record._id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE / TABLET */}

              <div className="lg:hidden p-4 space-y-3">
                {filteredReturns.map((record) => (
                  <div
                    key={record._id}
                    className="border border-slate-200 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-indigo-600" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {getItemName(record)}
                          </p>

                          <p className="text-[11px] text-indigo-600 mt-0.5">
                            {record.returnNo}
                          </p>
                        </div>
                      </div>

                      <Badge
                        className={
                          statusStyles[record.status] ||
                          statusStyles["Under Inspection"]
                        }
                      >
                        {statusLabels[record.status] || record.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div>
                        <p className="text-[10px] text-slate-400">Quantity</p>

                        <p className="text-xs font-medium text-slate-700 mt-1">
                          {record.quantity} {record.inventory?.unit || "Nos"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400">Condition</p>

                        <div className="mt-1">
                          <Badge
                            className={
                              conditionStyles[record.condition] ||
                              conditionStyles.Good
                            }
                          >
                            {record.condition}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400">Date</p>

                        <p className="text-xs font-medium text-slate-700 mt-1">
                          {formatDate(record.returnDate)}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mt-3">
                      {record.reason}
                    </p>

                    {record.status === "Under Inspection" && (
                      <div className="flex justify-end mt-3 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleCancel(record)}
                          disabled={cancellingId === record._id}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Cancel return
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {/* RETURN MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Return an Item
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Stock is updated after an admin accepts the return.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto">
              <div className="p-6 space-y-5">
                {/* ISSUED ITEM */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Issued item
                    <span className="text-rose-500 ml-1">*</span>
                  </label>

                  <select
                    value={form.stockOut}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        stockOut: e.target.value,
                        quantity: "",
                      }))
                    }
                    required
                    disabled={itemsLoading || saving}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">
                      {itemsLoading
                        ? "Loading issued items..."
                        : returnableItems.length === 0
                          ? "No items available to return"
                          : "Select an item"}
                    </option>

                    {returnableItems.map((item) => (
                      <option key={item.stockOutId} value={item.stockOutId}>
                        {item.inventory?.name} ({item.stockOutNo}) — can return{" "}
                        {item.returnableQuantity} {item.inventory?.unit || "Nos"}
                      </option>
                    ))}
                  </select>

                  {selectedIssue && (
                    <p className="mt-1.5 text-[11px] text-slate-400">
                      Issued {formatDate(selectedIssue.issuedDate)} to{" "}
                      {selectedIssue.issuedTo}. Issued{" "}
                      {selectedIssue.issuedQuantity}, already returned{" "}
                      {selectedIssue.returnedQuantity}.
                    </p>
                  )}
                </div>

                {/* QUANTITY + DATE */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Quantity
                      <span className="text-rose-500 ml-1">*</span>
                    </label>

                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        max={selectedIssue?.returnableQuantity}
                        value={form.quantity}
                        onChange={(e) => handleChange("quantity", e.target.value)}
                        placeholder="Enter quantity"
                        required
                        disabled={!selectedIssue || saving}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 disabled:bg-slate-50"
                      />

                      {selectedIssue && (
                        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                          {selectedIssue.inventory?.unit || "Nos"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Return date
                      <span className="text-rose-500 ml-1">*</span>
                    </label>

                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                      <input
                        type="date"
                        value={form.returnDate}
                        max={today()}
                        onChange={(e) =>
                          handleChange("returnDate", e.target.value)
                        }
                        required
                        disabled={saving}
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 disabled:bg-slate-50"
                      />
                    </div>
                  </div>
                </div>

                {/* RETURNED BY */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Returned by
                    <span className="text-rose-500 ml-1">*</span>
                  </label>

                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                    <input
                      type="text"
                      value={form.returnedBy}
                      onChange={(e) => handleChange("returnedBy", e.target.value)}
                      placeholder="Faculty / staff name"
                      required
                      disabled={saving}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 disabled:bg-slate-50"
                    />
                  </div>
                </div>

                {/* CONDITION */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Condition
                    <span className="text-rose-500 ml-1">*</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <ConditionOption
                      value="Good"
                      title="Good"
                      description="Ready to use"
                      icon={CircleCheck}
                      activeClass="bg-emerald-50 border-emerald-300 text-emerald-700"
                      selected={form.condition}
                      disabled={saving}
                      onSelect={(v) => handleChange("condition", v)}
                    />

                    <ConditionOption
                      value="Repair"
                      title="Needs repair"
                      description="Needs maintenance"
                      icon={Wrench}
                      activeClass="bg-amber-50 border-amber-300 text-amber-700"
                      selected={form.condition}
                      disabled={saving}
                      onSelect={(v) => handleChange("condition", v)}
                    />

                    <ConditionOption
                      value="Damaged"
                      title="Damaged"
                      description="Not usable"
                      icon={AlertTriangle}
                      activeClass="bg-rose-50 border-rose-300 text-rose-700"
                      selected={form.condition}
                      disabled={saving}
                      onSelect={(v) => handleChange("condition", v)}
                    />
                  </div>
                </div>

                {/* REASON */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Reason for return
                    <span className="text-rose-500 ml-1">*</span>
                  </label>

                  <input
                    type="text"
                    value={form.reason}
                    onChange={(e) => handleChange("reason", e.target.value)}
                    placeholder="Why is this item being returned?"
                    required
                    disabled={saving}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 disabled:bg-slate-50"
                  />
                </div>

                {/* REMARKS */}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Remarks
                  </label>

                  <textarea
                    value={form.remarks}
                    onChange={(e) => handleChange("remarks", e.target.value)}
                    rows={3}
                    placeholder="Anything the store should know..."
                    disabled={saving}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none resize-none focus:border-indigo-500 disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || itemsLoading || returnableItems.length === 0}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <ArrowDownLeft className="w-4 h-4" />
                      Submit return
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// --------------------------------------------------
// SMALL COMPONENTS
// --------------------------------------------------

const StatCard = ({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  valueColor,
}) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-500">{label}</p>

        <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
      </div>

      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}
      >
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
    </div>
  </div>
);

const Badge = ({ className = "", children }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-semibold whitespace-nowrap ${className}`}
  >
    {children}
  </span>
);

const ConditionOption = ({
  value,
  title,
  description,
  icon: Icon,
  activeClass,
  selected,
  disabled,
  onSelect,
}) => {
  const active = selected === value;

  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      disabled={disabled}
      aria-pressed={active}
      className={`text-left p-3 rounded-lg border transition-colors disabled:opacity-50 ${
        active
          ? activeClass
          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />

        <span className="text-xs font-semibold">{title}</span>
      </div>

      <p className="text-[11px] mt-1 opacity-80">{description}</p>
    </button>
  );
};

export default DepartmentReturns;