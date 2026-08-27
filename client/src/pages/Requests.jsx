import React, { useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Eye,
  Filter,
  Package,
  Plus,
  Search,
  User,
  X,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const departments = [
  "Computer Science",
  "Commerce",
  "Kannada",
  "English",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Administration",
];

const inventoryItems = [
  {
    id: "ITM-0001",
    name: "HP Desktop Computer",
    category: "Electronics",
    unit: "Nos",
  },
  {
    id: "ITM-0002",
    name: "Dell Monitor 24 inch",
    category: "Electronics",
    unit: "Nos",
  },
  {
    id: "ITM-0003",
    name: "Office Chair",
    category: "Furniture",
    unit: "Nos",
  },
  {
    id: "ITM-0004",
    name: "Computer Table",
    category: "Furniture",
    unit: "Nos",
  },
  {
    id: "ITM-0005",
    name: "A4 Paper",
    category: "Stationery",
    unit: "Reams",
  },
  {
    id: "ITM-0006",
    name: "Whiteboard Marker",
    category: "Stationery",
    unit: "Boxes",
  },
  {
    id: "ITM-0007",
    name: "Projector",
    category: "Electronics",
    unit: "Nos",
  },
  {
    id: "ITM-0008",
    name: "Laboratory Microscope",
    category: "Laboratory",
    unit: "Nos",
  },
];

const initialRequests = [
  {
    id: "REQ-2026-001",
    itemId: "ITM-0001",
    itemName: "HP Desktop Computer",
    category: "Electronics",
    department: "Computer Science",
    requestedBy: "Dr. Ravi Kumar",
    quantity: 5,
    unit: "Nos",
    priority: "High",
    status: "Pending",
    requestDate: "2026-08-25",
    requiredDate: "2026-09-05",
    purpose: "New computer lab setup",
    remarks: "Required for newly added laboratory systems.",
  },
  {
    id: "REQ-2026-002",
    itemId: "ITM-0005",
    itemName: "A4 Paper",
    category: "Stationery",
    department: "Administration",
    requestedBy: "Anitha Rao",
    quantity: 20,
    unit: "Reams",
    priority: "Medium",
    status: "Approved",
    requestDate: "2026-08-23",
    requiredDate: "2026-08-30",
    purpose: "Office documentation",
    remarks: "Monthly stationery requirement.",
  },
  {
    id: "REQ-2026-003",
    itemId: "ITM-0003",
    itemName: "Office Chair",
    category: "Furniture",
    department: "Commerce",
    requestedBy: "Prof. Suresh",
    quantity: 8,
    unit: "Nos",
    priority: "Low",
    status: "Pending",
    requestDate: "2026-08-22",
    requiredDate: "2026-09-10",
    purpose: "Replacement of damaged chairs",
    remarks: "",
  },
  {
    id: "REQ-2026-004",
    itemId: "ITM-0007",
    itemName: "Projector",
    category: "Electronics",
    department: "English",
    requestedBy: "Prof. Priya",
    quantity: 2,
    unit: "Nos",
    priority: "High",
    status: "Issued",
    requestDate: "2026-08-20",
    requiredDate: "2026-08-27",
    purpose: "Classroom presentations",
    remarks: "Required for smart classroom.",
  },
  {
    id: "REQ-2026-005",
    itemId: "ITM-0006",
    itemName: "Whiteboard Marker",
    category: "Stationery",
    department: "Mathematics",
    requestedBy: "Dr. Manjunath",
    quantity: 10,
    unit: "Boxes",
    priority: "Medium",
    status: "Rejected",
    requestDate: "2026-08-18",
    requiredDate: "2026-08-28",
    purpose: "Teaching requirement",
    remarks: "Request rejected due to sufficient existing stock.",
  },
  {
    id: "REQ-2026-006",
    itemId: "ITM-0008",
    itemName: "Laboratory Microscope",
    category: "Laboratory",
    department: "Chemistry",
    requestedBy: "Dr. Lakshmi",
    quantity: 3,
    unit: "Nos",
    priority: "High",
    status: "Pending",
    requestDate: "2026-08-17",
    requiredDate: "2026-09-15",
    purpose: "Laboratory expansion",
    remarks: "Additional equipment required for practical sessions.",
  },
];

const statusOptions = [
  "All",
  "Pending",
  "Approved",
  "Rejected",
  "Issued",
];

const priorityOptions = ["All", "High", "Medium", "Low"];

const statusStyles = {
  Pending:
    "bg-amber-50 text-amber-700 border-amber-200",
  Approved:
    "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected:
    "bg-rose-50 text-rose-700 border-rose-200",
  Issued:
    "bg-indigo-50 text-indigo-700 border-indigo-200",
};

const priorityStyles = {
  High: "bg-rose-50 text-rose-700 border-rose-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-100 text-slate-600 border-slate-200",
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const Requests = () => {
  const [requests, setRequests] =
    useState(initialRequests);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");
  const [priorityFilter, setPriorityFilter] =
    useState("All");
  const [departmentFilter, setDepartmentFilter] =
    useState("All");

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [selectedRequest, setSelectedRequest] =
    useState(null);

  const [newRequest, setNewRequest] = useState({
    itemId: "",
    department: "",
    requestedBy: "",
    quantity: "",
    priority: "Medium",
    requiredDate: "",
    purpose: "",
    remarks: "",
  });

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesSearch =
        !query ||
        request.id.toLowerCase().includes(query) ||
        request.itemName.toLowerCase().includes(query) ||
        request.department.toLowerCase().includes(query) ||
        request.requestedBy.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        request.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        request.priority === priorityFilter;

      const matchesDepartment =
        departmentFilter === "All" ||
        request.department === departmentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesDepartment
      );
    });
  }, [
    requests,
    search,
    statusFilter,
    priorityFilter,
    departmentFilter,
  ]);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter(
        (request) => request.status === "Pending"
      ).length,
      approved: requests.filter(
        (request) => request.status === "Approved"
      ).length,
      issued: requests.filter(
        (request) => request.status === "Issued"
      ).length,
      rejected: requests.filter(
        (request) => request.status === "Rejected"
      ).length,
    };
  }, [requests]);

  const selectedItem = inventoryItems.find(
    (item) => item.id === newRequest.itemId
  );

  const closeCreateModal = () => {
    setShowCreateModal(false);

    setNewRequest({
      itemId: "",
      department: "",
      requestedBy: "",
      quantity: "",
      priority: "Medium",
      requiredDate: "",
      purpose: "",
      remarks: "",
    });
  };

  const handleCreateRequest = (e) => {
    e.preventDefault();

    if (!newRequest.itemId) {
      toast.error("Please select an inventory item");
      return;
    }

    if (!newRequest.department) {
      toast.error("Please select a department");
      return;
    }

    if (!newRequest.requestedBy.trim()) {
      toast.error("Please enter requester name");
      return;
    }

    if (
      !newRequest.quantity ||
      Number(newRequest.quantity) <= 0
    ) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (!newRequest.requiredDate) {
      toast.error("Please select required date");
      return;
    }

    if (!newRequest.purpose.trim()) {
      toast.error("Please enter the purpose");
      return;
    }

    if (!selectedItem) {
      toast.error("Invalid inventory item");
      return;
    }

    const nextNumber =
      requests.length + 1;

    const request = {
      id: `REQ-2026-${String(nextNumber).padStart(
        3,
        "0"
      )}`,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      category: selectedItem.category,
      department: newRequest.department,
      requestedBy: newRequest.requestedBy.trim(),
      quantity: Number(newRequest.quantity),
      unit: selectedItem.unit,
      priority: newRequest.priority,
      status: "Pending",
      requestDate:
        new Date().toISOString().split("T")[0],
      requiredDate: newRequest.requiredDate,
      purpose: newRequest.purpose.trim(),
      remarks: newRequest.remarks.trim(),
    };

    setRequests((prev) => [request, ...prev]);

    toast.success("Item request created successfully");

    closeCreateModal();
  };

  const updateStatus = (requestId, status) => {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status,
            }
          : request
      )
    );

    setSelectedRequest((prev) =>
      prev
        ? {
            ...prev,
            status,
          }
        : prev
    );

    toast.success(
      `Request ${status.toLowerCase()} successfully`
    );
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setDepartmentFilter("All");
  };

  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-indigo-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Item Requests
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Review and manage inventory requests
                from college departments.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Request
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">
                  Total Requests
                </p>

                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {stats.total}
                </p>
              </div>

              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">
                  Pending
                </p>

                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {stats.pending}
                </p>
              </div>

              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock3 className="w-4 h-4 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">
                  Approved
                </p>

                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {stats.approved}
                </p>
              </div>

              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">
                  Issued
                </p>

                <p className="text-2xl font-bold text-indigo-600 mt-1">
                  {stats.issued}
                </p>
              </div>

              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Package className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">
                  Rejected
                </p>

                <p className="text-2xl font-bold text-rose-600 mt-1">
                  {stats.rejected}
                </p>
              </div>

              <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center">
                <XCircle className="w-4 h-4 text-rose-600" />
              </div>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />

              <h2 className="text-sm font-semibold text-slate-800">
                Filter Requests
              </h2>
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {/* SEARCH */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search requests..."
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>

            {/* STATUS */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  Status: {status}
                </option>
              ))}
            </select>

            {/* PRIORITY */}
            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value)
              }
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
            >
              {priorityOptions.map((priority) => (
                <option
                  key={priority}
                  value={priority}
                >
                  Priority: {priority}
                </option>
              ))}
            </select>

            {/* DEPARTMENT */}
            <select
              value={departmentFilter}
              onChange={(e) =>
                setDepartmentFilter(e.target.value)
              }
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
            >
              <option value="All">
                Department: All
              </option>

              {departments.map((department) => (
                <option
                  key={department}
                  value={department}
                >
                  {department}
                </option>
              ))}
            </select>
          </div>

          {(search ||
            statusFilter !== "All" ||
            priorityFilter !== "All" ||
            departmentFilter !== "All") && (
            <div className="px-4 pb-4">
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                Clear all filters
              </button>
            </div>
          )}
        </section>

        {/* REQUESTS */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Requests
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Showing {filteredRequests.length} of{" "}
                {requests.length} requests
              </p>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="py-16 px-5 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-slate-400" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-700">
                No requests found
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP */}
              <div className="hidden xl:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100">
                      <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Request
                      </th>

                      <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Item
                      </th>

                      <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Department
                      </th>

                      <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Qty
                      </th>

                      <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Priority
                      </th>

                      <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Required
                      </th>

                      <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.map(
                      (request) => (
                        <tr
                          key={request.id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {request.id}
                              </p>

                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {formatDate(
                                  request.requestDate
                                )}
                              </p>
                            </div>
                          </td>

                          <td className="px-3 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                <Package className="w-4 h-4 text-indigo-600" />
                              </div>

                              <div>
                                <p className="text-sm font-medium text-slate-800">
                                  {request.itemName}
                                </p>

                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  {request.itemId} ·{" "}
                                  {request.category}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-4">
                            <p className="text-sm text-slate-700">
                              {request.department}
                            </p>

                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {request.requestedBy}
                            </p>
                          </td>

                          <td className="px-3 py-4 text-center">
                            <span className="text-sm font-semibold text-slate-700">
                              {request.quantity}
                            </span>

                            <span className="text-[10px] text-slate-400 ml-1">
                              {request.unit}
                            </span>
                          </td>

                          <td className="px-3 py-4 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full border text-[10px] font-semibold ${
                                priorityStyles[
                                  request.priority
                                ]
                              }`}
                            >
                              {request.priority}
                            </span>
                          </td>

                          <td className="px-3 py-4 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-semibold ${
                                statusStyles[
                                  request.status
                                ]
                              }`}
                            >
                              {request.status}
                            </span>
                          </td>

                          <td className="px-3 py-4">
                            <span className="text-xs text-slate-600">
                              {formatDate(
                                request.requiredDate
                              )}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedRequest(
                                  request
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE / TABLET */}
              <div className="xl:hidden p-4 space-y-3">
                {filteredRequests.map(
                  (request) => (
                    <div
                      key={request.id}
                      className="border border-slate-200 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-indigo-600" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {request.itemName}
                            </p>

                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {request.id} ·{" "}
                              {request.category}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedRequest(
                              request
                            )
                          }
                          className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 shrink-0"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                        <div>
                          <p className="text-[10px] text-slate-400">
                            Department
                          </p>

                          <p className="text-xs font-medium text-slate-700 mt-1">
                            {request.department}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] text-slate-400">
                            Quantity
                          </p>

                          <p className="text-xs font-medium text-slate-700 mt-1">
                            {request.quantity}{" "}
                            {request.unit}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] text-slate-400">
                            Priority
                          </p>

                          <span
                            className={`inline-flex mt-1 px-2 py-1 rounded-full border text-[10px] font-semibold ${
                              priorityStyles[
                                request.priority
                              ]
                            }`}
                          >
                            {request.priority}
                          </span>
                        </div>

                        <div>
                          <p className="text-[10px] text-slate-400">
                            Status
                          </p>

                          <span
                            className={`inline-flex mt-1 px-2 py-1 rounded-full border text-[10px] font-semibold ${
                              statusStyles[
                                request.status
                              ]
                            }`}
                          >
                            {request.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                        <div>
                          <p className="text-[10px] text-slate-400">
                            Requested by
                          </p>

                          <p className="text-xs font-medium text-slate-700 mt-0.5">
                            {request.requestedBy}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] text-slate-400">
                            Required
                          </p>

                          <p className="text-xs font-medium text-slate-700 mt-0.5">
                            {formatDate(
                              request.requiredDate
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {/* CREATE REQUEST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeCreateModal}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* HEADER */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  New Item Request
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Submit a request for inventory items.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateRequest}
              className="overflow-y-auto"
            >
              <div className="p-6 space-y-5">
                {/* ITEM + DEPARTMENT */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Inventory Item
                      <span className="text-rose-500 ml-1">
                        *
                      </span>
                    </label>

                    <select
                      value={newRequest.itemId}
                      onChange={(e) =>
                        setNewRequest(
                          (prev) => ({
                            ...prev,
                            itemId:
                              e.target.value,
                          })
                        )
                      }
                      required
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    >
                      <option value="">
                        Select item
                      </option>

                      {inventoryItems.map(
                        (item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.name} —{" "}
                            {item.category}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Department
                      <span className="text-rose-500 ml-1">
                        *
                      </span>
                    </label>

                    <select
                      value={
                        newRequest.department
                      }
                      onChange={(e) =>
                        setNewRequest(
                          (prev) => ({
                            ...prev,
                            department:
                              e.target.value,
                          })
                        )
                      }
                      required
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
                    >
                      <option value="">
                        Select department
                      </option>

                      {departments.map(
                        (department) => (
                          <option
                            key={department}
                            value={department}
                          >
                            {department}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                {/* REQUESTER + QUANTITY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Requested By
                      <span className="text-rose-500 ml-1">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                      <input
                        type="text"
                        value={
                          newRequest.requestedBy
                        }
                        onChange={(e) =>
                          setNewRequest(
                            (prev) => ({
                              ...prev,
                              requestedBy:
                                e.target
                                  .value,
                            })
                          )
                        }
                        placeholder="Faculty / staff name"
                        required
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Quantity
                      <span className="text-rose-500 ml-1">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={
                          newRequest.quantity
                        }
                        onChange={(e) =>
                          setNewRequest(
                            (prev) => ({
                              ...prev,
                              quantity:
                                e.target
                                  .value,
                            })
                          )
                        }
                        placeholder="Enter quantity"
                        required
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                      />

                      {selectedItem && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                          {selectedItem.unit}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* PRIORITY + DATE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Priority
                    </label>

                    <select
                      value={
                        newRequest.priority
                      }
                      onChange={(e) =>
                        setNewRequest(
                          (prev) => ({
                            ...prev,
                            priority:
                              e.target
                                .value,
                          })
                        )
                      }
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
                    >
                      <option value="Low">
                        Low
                      </option>

                      <option value="Medium">
                        Medium
                      </option>

                      <option value="High">
                        High
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Required Date
                      <span className="text-rose-500 ml-1">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                      <input
                        type="date"
                        value={
                          newRequest.requiredDate
                        }
                        onChange={(e) =>
                          setNewRequest(
                            (prev) => ({
                              ...prev,
                              requiredDate:
                                e.target
                                  .value,
                            })
                          )
                        }
                        required
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* PURPOSE */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Purpose
                    <span className="text-rose-500 ml-1">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    value={newRequest.purpose}
                    onChange={(e) =>
                      setNewRequest((prev) => ({
                        ...prev,
                        purpose:
                          e.target.value,
                      }))
                    }
                    placeholder="Why is this item required?"
                    required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                {/* REMARKS */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Remarks
                  </label>

                  <textarea
                    value={newRequest.remarks}
                    onChange={(e) =>
                      setNewRequest((prev) => ({
                        ...prev,
                        remarks:
                          e.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Additional information..."
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none resize-none focus:border-indigo-500"
                  />
                </div>

                {/* ITEM PREVIEW */}
                {selectedItem && (
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                        <Package className="w-4 h-4 text-indigo-600" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-indigo-900">
                          {selectedItem.name}
                        </p>

                        <p className="text-[11px] text-indigo-600 mt-0.5">
                          {selectedItem.id} ·{" "}
                          {selectedItem.category}{" "}
                          · Unit:{" "}
                          {selectedItem.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Create Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REQUEST DETAILS MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() =>
              setSelectedRequest(null)
            }
          />

          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* HEADER */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Item Request
                </p>

                <h2 className="text-lg font-semibold text-slate-900 mt-1">
                  {selectedRequest.id}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedRequest(null)
                }
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto">
              <div className="p-6 space-y-5">
                {/* ITEM */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Package className="w-5 h-5 text-indigo-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {selectedRequest.itemName}
                    </p>

                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedRequest.itemId} ·{" "}
                      {selectedRequest.category}
                    </p>
                  </div>

                  <span className="text-sm font-bold text-slate-700">
                    {selectedRequest.quantity}{" "}
                    {selectedRequest.unit}
                  </span>
                </div>

                {/* STATUS + PRIORITY */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-slate-200 rounded-xl p-4">
                    <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
                      Status
                    </p>

                    <span
                      className={`inline-flex mt-2 px-2.5 py-1 rounded-full border text-[10px] font-semibold ${
                        statusStyles[
                          selectedRequest.status
                        ]
                      }`}
                    >
                      {selectedRequest.status}
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4">
                    <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
                      Priority
                    </p>

                    <span
                      className={`inline-flex mt-2 px-2.5 py-1 rounded-full border text-[10px] font-semibold ${
                        priorityStyles[
                          selectedRequest.priority
                        ]
                      }`}
                    >
                      {selectedRequest.priority}
                    </span>
                  </div>
                </div>

                {/* DETAILS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                      Department
                    </p>

                    <p className="text-sm font-medium text-slate-700 mt-1">
                      {selectedRequest.department}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                      Requested By
                    </p>

                    <p className="text-sm font-medium text-slate-700 mt-1">
                      {selectedRequest.requestedBy}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                      Request Date
                    </p>

                    <p className="text-sm font-medium text-slate-700 mt-1">
                      {formatDate(
                        selectedRequest.requestDate
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                      Required Date
                    </p>

                    <p className="text-sm font-medium text-slate-700 mt-1">
                      {formatDate(
                        selectedRequest.requiredDate
                      )}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                      Purpose
                    </p>

                    <p className="text-sm text-slate-700 mt-1">
                      {selectedRequest.purpose ||
                        "-"}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                      Remarks
                    </p>

                    <p className="text-sm text-slate-700 mt-1">
                      {selectedRequest.remarks ||
                        "No remarks provided."}
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              {selectedRequest.status ===
                "Pending" && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-3">
                    Review this request and select an
                    action.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(
                          selectedRequest.id,
                          "Approved"
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(
                          selectedRequest.id,
                          "Rejected"
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedRequest(null)
                      }
                      className="px-3 py-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-white"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {selectedRequest.status ===
                "Approved" && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() =>
                      updateStatus(
                        selectedRequest.id,
                        "Issued"
                      )
                    }
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
                  >
                    <Package className="w-4 h-4" />
                    Mark as Issued
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Requests;