import React, { useMemo, useState } from "react";
import {
  MoreHorizontal,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Eye,
  Pencil,
  Trash2,
  X,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";
import AddInventoryItem from "../components/inventory/AddInventoryItem";

const inventoryData = [
  {
    id: "ITM-0001",
    name: "HP Desktop Computer",
    category: "Electronics",
    department: "Computer Science",
    quantity: 25,
    available: 21,
    unit: "Nos",
    status: "Available",
  },
  {
    id: "ITM-0002",
    name: "Office Chair",
    category: "Furniture",
    department: "Administration",
    quantity: 50,
    available: 43,
    unit: "Nos",
    status: "Available",
  },
  {
    id: "ITM-0003",
    name: "HP LaserJet Toner",
    category: "Stationery",
    department: "Main Store",
    quantity: 10,
    available: 3,
    unit: "Nos",
    status: "Low Stock",
  },
  {
    id: "ITM-0004",
    name: "Projector",
    category: "Electronics",
    department: "Commerce",
    quantity: 8,
    available: 2,
    unit: "Nos",
    status: "Low Stock",
  },
  {
    id: "ITM-0005",
    name: "A4 Paper - 75 GSM",
    category: "Stationery",
    department: "Main Store",
    quantity: 100,
    available: 0,
    unit: "Reams",
    status: "Out of Stock",
  },
  {
    id: "ITM-0006",
    name: "Library Table",
    category: "Furniture",
    department: "Library",
    quantity: 30,
    available: 27,
    unit: "Nos",
    status: "Available",
  },
  {
    id: "ITM-0007",
    name: "Network Cable - CAT6",
    category: "Electronics",
    department: "Computer Science",
    quantity: 25,
    available: 6,
    unit: "Nos",
    status: "Low Stock",
  },
  {
    id: "ITM-0008",
    name: "Whiteboard Marker",
    category: "Stationery",
    department: "Main Store",
    quantity: 100,
    available: 72,
    unit: "Boxes",
    status: "Available",
  },
];

const statusStyles = {
  Available: "bg-emerald-50 text-emerald-700",
  "Low Stock": "bg-amber-50 text-amber-700",
  "Out of Stock": "bg-rose-50 text-rose-700",
};

const categories = [
  "Electronics",
  "Furniture",
  "Stationery",
  "Laboratory",
];

const departments = [
  "Computer Science",
  "Administration",
  "Main Store",
  "Commerce",
  "Library",
];

const units = ["Nos", "Boxes", "Reams", "Sets", "Pieces"];

const Inventory = () => {
  const [items, setItems] = useState(inventoryData);

  const [showAddModal, setShowAddModal] = useState(false);

  const [showActionMenu, setShowActionMenu] = useState(null);

  const [viewItem, setViewItem] = useState(null);

  const [editItem, setEditItem] = useState(null);

  const [deleteItem, setDeleteItem] = useState(null);

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("All");

  const [status, setStatus] = useState("All");

  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    department: "",
    quantity: "",
    available: "",
    unit: "",
    status: "",
  });

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        item.name.toLowerCase().includes(searchValue) ||
        item.id.toLowerCase().includes(searchValue) ||
        item.category.toLowerCase().includes(searchValue) ||
        item.department.toLowerCase().includes(searchValue);

      const matchesCategory =
        category === "All" || item.category === category;

      const matchesStatus =
        status === "All" || item.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, search, category, status]);

  /* --------------------------------------------------
     ADD ITEM
  -------------------------------------------------- */

  const handleAddItem = (newItem) => {
    const itemWithId = {
      ...newItem,
      id:
        newItem.id ||
        `ITM-${String(items.length + 1).padStart(4, "0")}`,
    };

    setItems((prev) => [itemWithId, ...prev]);

    setShowAddModal(false);

    toast.success("Inventory item added successfully");
  };

  /* --------------------------------------------------
     VIEW ITEM
  -------------------------------------------------- */

  const handleView = (item) => {
    setShowActionMenu(null);
    setViewItem(item);
  };

  /* --------------------------------------------------
     EDIT ITEM
  -------------------------------------------------- */

  const handleEdit = (item) => {
    setShowActionMenu(null);

    setEditItem(item);

    setEditForm({
      name: item.name || "",
      category: item.category || "",
      department: item.department || "",
      quantity: item.quantity ?? "",
      available: item.available ?? "",
      unit: item.unit || "",
      status: item.status || "Available",
    });
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateItem = (e) => {
    e.preventDefault();

    if (!editForm.name.trim()) {
      toast.error("Item name is required");
      return;
    }

    if (!editForm.category) {
      toast.error("Please select a category");
      return;
    }

    if (!editForm.department) {
      toast.error("Please select a department");
      return;
    }

    if (!editForm.unit) {
      toast.error("Please select a unit");
      return;
    }

    const quantity = Number(editForm.quantity);
    const available = Number(editForm.available);

    if (!Number.isFinite(quantity) || quantity < 0) {
      toast.error("Enter a valid total quantity");
      return;
    }

    if (!Number.isFinite(available) || available < 0) {
      toast.error("Enter a valid available quantity");
      return;
    }

    if (available > quantity) {
      toast.error(
        "Available quantity cannot be greater than total quantity"
      );
      return;
    }

    let calculatedStatus = editForm.status;

    if (available === 0) {
      calculatedStatus = "Out of Stock";
    } else if (available <= Math.max(1, quantity * 0.2)) {
      calculatedStatus = "Low Stock";
    } else {
      calculatedStatus = "Available";
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === editItem.id
          ? {
              ...item,
              name: editForm.name.trim(),
              category: editForm.category,
              department: editForm.department,
              quantity,
              available,
              unit: editForm.unit,
              status: calculatedStatus,
            }
          : item
      )
    );

    setEditItem(null);

    toast.success("Inventory item updated successfully");
  };

  /* --------------------------------------------------
     DELETE ITEM
  -------------------------------------------------- */

  const handleDelete = (item) => {
    setShowActionMenu(null);
    setDeleteItem(item);
  };

  const confirmDelete = () => {
    if (!deleteItem) return;

    setItems((prev) =>
      prev.filter((item) => item.id !== deleteItem.id)
    );

    toast.success(`${deleteItem.name} deleted successfully`);

    setDeleteItem(null);
  };

  /* --------------------------------------------------
     ACTION MENU
  -------------------------------------------------- */

  const toggleActionMenu = (itemId) => {
    setShowActionMenu((prev) =>
      prev === itemId ? null : itemId
    );
  };

  return (
    <>
      <div
        className="space-y-6"
        onClick={() => setShowActionMenu(null)}
      >
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Inventory
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage and monitor college inventory items
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowAddModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        {/* FILTERS */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {/* SEARCH */}
            <div className="relative md:col-span-2 xl:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search item name, code, category..."
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* CATEGORY */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="All">All Categories</option>

              {categories.map((itemCategory) => (
                <option
                  key={itemCategory}
                  value={itemCategory}
                >
                  {itemCategory}
                </option>
              ))}
            </select>

            {/* STATUS */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="All">All Status</option>
              <option value="Available">Available</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">
                Out of Stock
              </option>
            </select>
          </div>
        </div>

        {/* INVENTORY */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-visible">
          {/* TABLE HEADER */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-500" />

              <h2 className="text-sm font-semibold text-slate-900">
                Inventory Items
              </h2>

              <span className="text-xs text-slate-400">
                ({filteredItems.length})
              </span>
            </div>

            <div className="flex items-center gap-3">
              {(search ||
                category !== "All" ||
                status !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                    setStatus("All");
                  }}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Clear filters
                </button>
              )}

              <div className="inline-flex items-center gap-2 text-xs text-slate-400">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </div>
            </div>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Item
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Category
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Department
                  </th>

                  <th className="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Total
                  </th>

                  <th className="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Available
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 w-12"></th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b last:border-b-0 border-slate-100 hover:bg-slate-50/60 transition-colors"
                  >
                    {/* ITEM */}
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {item.name}
                        </p>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {item.id}
                        </p>
                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.category}
                    </td>

                    {/* DEPARTMENT */}
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.department}
                    </td>

                    {/* TOTAL */}
                    <td className="px-5 py-4 text-center">
                      <span className="text-sm font-medium text-slate-700">
                        {item.quantity}
                      </span>

                      <span className="ml-1 text-xs text-slate-400">
                        {item.unit}
                      </span>
                    </td>

                    {/* AVAILABLE */}
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`text-sm font-semibold ${
                          item.available === 0
                            ? "text-rose-600"
                            : item.status === "Low Stock"
                              ? "text-amber-600"
                              : "text-slate-700"
                        }`}
                      >
                        {item.available}
                      </span>

                      <span className="ml-1 text-xs text-slate-400">
                        {item.unit}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded-md text-[11px] font-medium ${statusStyles[item.status]}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-4 relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleActionMenu(item.id);
                        }}
                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {showActionMenu === item.id && (
                        <ActionMenu
                          item={item}
                          onView={handleView}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE / TABLET */}
          <div className="lg:hidden divide-y divide-slate-100">
            {filteredItems.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">
                      {item.name}
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {item.id}
                    </p>
                  </div>

                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleActionMenu(item.id);
                      }}
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {showActionMenu === item.id && (
                      <ActionMenu
                        item={item}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        mobile
                      />
                    )}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-400">
                      Category
                    </p>

                    <p className="mt-0.5 text-slate-600">
                      {item.category}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">
                      Department
                    </p>

                    <p className="mt-0.5 text-slate-600">
                      {item.department}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">
                      Total Stock
                    </p>

                    <p className="mt-0.5 font-medium text-slate-700">
                      {item.quantity} {item.unit}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">
                      Available
                    </p>

                    <p className="mt-0.5 font-semibold text-slate-700">
                      {item.available} {item.unit}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <span
                    className={`inline-flex px-2 py-1 rounded-md text-[11px] font-medium ${statusStyles[item.status]}`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* EMPTY STATE */}
          {filteredItems.length === 0 && (
            <div className="py-16 text-center">
              <Package className="w-8 h-8 mx-auto text-slate-300" />

              <p className="mt-3 text-sm font-medium text-slate-700">
                No inventory items found
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Try changing your search or filters.
              </p>

              {(search ||
                category !== "All" ||
                status !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                    setStatus("All");
                  }}
                  className="mt-4 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ADD ITEM MODAL */}
      <AddInventoryItem
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddItem}
      />

      {/* VIEW ITEM MODAL */}
      {viewItem && (
        <ModalOverlay onClose={() => setViewItem(null)}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Package className="w-5 h-5 text-indigo-600" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Item Details
                  </h2>

                  <p className="text-xs text-slate-400 mt-0.5">
                    {viewItem.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewItem(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <p className="text-xs text-slate-400">
                  Item Name
                </p>

                <p className="mt-1 text-base font-semibold text-slate-900">
                  {viewItem.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DetailBox
                  label="Item Code"
                  value={viewItem.id}
                />

                <DetailBox
                  label="Category"
                  value={viewItem.category}
                />

                <DetailBox
                  label="Department"
                  value={viewItem.department}
                />

                <DetailBox
                  label="Unit"
                  value={viewItem.unit}
                />

                <DetailBox
                  label="Total Quantity"
                  value={`${viewItem.quantity} ${viewItem.unit}`}
                />

                <DetailBox
                  label="Available"
                  value={`${viewItem.available} ${viewItem.unit}`}
                />
              </div>

              <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Current Status
                  </span>

                  <span
                    className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${statusStyles[viewItem.status]}`}
                  >
                    {viewItem.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setViewItem(null)}
                className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* EDIT ITEM MODAL */}
      {editItem && (
        <ModalOverlay onClose={() => setEditItem(null)}>
          <form
            onSubmit={handleUpdateItem}
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Edit Inventory Item
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Update item information and stock details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditItem(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* ITEM NAME */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Item Name
                </label>

                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    handleEditChange(
                      "name",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              {/* CATEGORY + DEPARTMENT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Category
                  </label>

                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      handleEditChange(
                        "category",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
                  >
                    <option value="">
                      Select category
                    </option>

                    {categories.map((itemCategory) => (
                      <option
                        key={itemCategory}
                        value={itemCategory}
                      >
                        {itemCategory}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Department
                  </label>

                  <select
                    value={editForm.department}
                    onChange={(e) =>
                      handleEditChange(
                        "department",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
                  >
                    <option value="">
                      Select department
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
              </div>

              {/* QUANTITY + AVAILABLE */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Total Quantity
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={editForm.quantity}
                    onChange={(e) =>
                      handleEditChange(
                        "quantity",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Available
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={editForm.available}
                    onChange={(e) =>
                      handleEditChange(
                        "available",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Unit
                  </label>

                  <select
                    value={editForm.unit}
                    onChange={(e) =>
                      handleEditChange(
                        "unit",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
                  >
                    <option value="">Select unit</option>

                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* STATUS INFO */}
              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                <p className="text-xs text-indigo-700">
                  Status is automatically calculated from the
                  available quantity.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditItem(null)}
                className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteItem && (
        <ModalOverlay onClose={() => setDeleteItem(null)}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                Delete Inventory Item?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Are you sure you want to delete{" "}
                <span className="font-medium text-slate-700">
                  {deleteItem.name}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Item Code
                  </span>

                  <span className="text-xs font-medium text-slate-700">
                    {deleteItem.id}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteItem(null)}
                className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Delete Item
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </>
  );
};

/* --------------------------------------------------
   ACTION MENU
-------------------------------------------------- */

const ActionMenu = ({
  item,
  onView,
  onEdit,
  onDelete,
  mobile = false,
}) => {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`absolute right-0 ${
        mobile ? "top-9" : "top-10"
      } z-50 w-40 bg-white border border-slate-200 rounded-xl shadow-xl py-1`}
    >
      <button
        type="button"
        onClick={() => onView(item)}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      >
        <Eye className="w-4 h-4 text-slate-400" />
        View
      </button>

      <button
        type="button"
        onClick={() => onEdit(item)}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      >
        <Pencil className="w-4 h-4 text-slate-400" />
        Edit
      </button>

      <div className="my-1 border-t border-slate-100" />

      <button
        type="button"
        onClick={() => onDelete(item)}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-xs font-medium text-rose-600 hover:bg-rose-50"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  );
};

/* --------------------------------------------------
   MODAL OVERLAY
-------------------------------------------------- */

const ModalOverlay = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full flex justify-center max-h-[95vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

/* --------------------------------------------------
   DETAIL BOX
-------------------------------------------------- */

const DetailBox = ({ label, value }) => {
  return (
    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
      <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
};

export default Inventory;