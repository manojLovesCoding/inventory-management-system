import React, { useEffect, useMemo, useState } from "react";
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
import api from "../api/axios.js";

const statusStyles = {
  Available: "bg-emerald-50 text-emerald-700",
  "Low Stock": "bg-amber-50 text-amber-700",
  "Out of Stock": "bg-rose-50 text-rose-700",
};

const units = [
  "Nos",
  "Boxes",
  "Packets",
  "Reams",
  "Sets",
  "Kg",
  "Litres",
  "Meters",
  "Pieces",
];

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);

  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  const [loading, setLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    department: "",
    quantity: "",
    available: "",
    unit: "",
    status: "",
    minimumStock: "",
    description: "",
  });

  /* --------------------------------------------------
     FETCH CATEGORIES
  -------------------------------------------------- */

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");

      const responseData = response.data;

      const categoryData =
        responseData?.categories || responseData?.data || responseData || [];

      const normalizedCategories = Array.isArray(categoryData)
        ? categoryData
        : [];

      setCategoryOptions(normalizedCategories);

      return normalizedCategories;
    } catch (error) {
      console.error("Failed to fetch categories:", error);

      toast.error(error.response?.data?.message || "Failed to load categories");

      setCategoryOptions([]);

      return [];
    }
  };

  /* --------------------------------------------------
     FETCH INVENTORY
  -------------------------------------------------- */

  const fetchInventory = async (availableCategories = categoryOptions) => {
    setLoading(true);

    try {
      const response = await api.get("/inventory");

      const responseData = response.data;

      const inventoryData =
        responseData?.data ||
        responseData?.inventory ||
        responseData?.items ||
        responseData ||
        [];

      if (!Array.isArray(inventoryData)) {
        setItems([]);
        return;
      }

      const normalizedItems = inventoryData.map((item, index) => {
        const quantity = Number(item.quantity) || 0;

        const available =
          item.available !== undefined && item.available !== null
            ? Number(item.available)
            : quantity;

        const minimumStock = Number(item.minimumStock) || 0;

        let calculatedStatus = item.status;

        if (!calculatedStatus) {
          if (available === 0) {
            calculatedStatus = "Out of Stock";
          } else if (minimumStock > 0 && available <= minimumStock) {
            calculatedStatus = "Low Stock";
          } else {
            calculatedStatus = "Available";
          }
        }

        // Resolve category ID into category name.
        const categoryId =
          typeof item.category === "object" && item.category !== null
            ? item.category._id || item.category.id || ""
            : item.category || "";

        const categoryName =
          typeof item.category === "object" && item.category !== null
            ? item.category.name || item.category.categoryName || ""
            : availableCategories.find(
                (categoryItem) =>
                  String(categoryItem._id) === String(categoryId),
              )?.name || "";

        return {
          ...item,

          id:
            item.id ||
            item._id ||
            item.itemCode ||
            `ITM-${String(index + 1).padStart(4, "0")}`,

          name:
            item.name || item.itemName || item.productName || "Unnamed Item",

          category: categoryName,
          categoryId,

          department:
            typeof item.department === "object" && item.department !== null
              ? item.department?.name || item.department?.departmentName || ""
              : item.department || "",

          quantity,
          available,
          unit: item.unit || "Nos",
          minimumStock,
          status: calculatedStatus,
          description: item.description || "",
        };
      });

      setItems(normalizedItems);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);

      toast.error(
        error.response?.data?.message || "Failed to load inventory items",
      );

      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------------------
     INITIAL DATA FETCH
  -------------------------------------------------- */

  useEffect(() => {
    const loadInventory = async () => {
      const fetchedCategories = await fetchCategories();

      await fetchInventory(fetchedCategories);
    };

    loadInventory();
  }, []);

  /* --------------------------------------------------
     FILTER OPTIONS
  -------------------------------------------------- */

  const categories = useMemo(() => {
    const values = items.map((item) => item.category).filter(Boolean);

    return [...new Set(values)].sort();
  }, [items]);

  const departments = useMemo(() => {
    const values = items.map((item) => item.department).filter(Boolean);

    return [...new Set(values)].sort();
  }, [items]);

  /* --------------------------------------------------
     FILTERED ITEMS
  -------------------------------------------------- */

  const filteredItems = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return items.filter((item) => {
      const matchesSearch =
        !searchValue ||
        String(item.name || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(item.id || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(item.itemCode || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(item.category || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(item.department || "")
          .toLowerCase()
          .includes(searchValue);

      const matchesCategory = category === "All" || item.category === category;

      const matchesStatus = status === "All" || item.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, search, category, status]);

  /* --------------------------------------------------
     ADD ITEM
  -------------------------------------------------- */

  const handleAddItem = async () => {
    setShowAddModal(false);

    await fetchInventory();

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
      category: item.categoryId || "",
      department: item.department || "",
      quantity: item.quantity ?? "",
      available: item.available ?? "",
      unit: item.unit || "Nos",
      status: item.status || "Available",
      minimumStock: item.minimumStock ?? "",
      description: item.description || "",
    });
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();

    if (!editItem) return;

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
    const minimumStock = Number(editForm.minimumStock) || 0;

    if (!Number.isFinite(quantity) || quantity < 0) {
      toast.error("Enter a valid total quantity");
      return;
    }

    if (!Number.isFinite(available) || available < 0) {
      toast.error("Enter a valid available quantity");
      return;
    }

    if (available > quantity) {
      toast.error("Available quantity cannot be greater than total quantity");
      return;
    }

    let calculatedStatus = "Available";

    if (available === 0) {
      calculatedStatus = "Out of Stock";
    } else if (minimumStock > 0 && available <= minimumStock) {
      calculatedStatus = "Low Stock";
    }

    const payload = {
      name: editForm.name.trim(),
      category: editForm.category,
      department: editForm.department,
      quantity,
      available,
      unit: editForm.unit,
      minimumStock,
      status: calculatedStatus,
      description: editForm.description.trim(),
    };

    setEditLoading(true);

    try {
      const itemId = editItem._id || editItem.id || editItem.itemCode;

      const response = await api.put(`/inventory/${itemId}`, payload);

      const responseData = response.data;

      const updatedItem =
        responseData?.data ||
        responseData?.inventory ||
        responseData?.item ||
        responseData;

      const selectedCategory = categoryOptions.find(
        (categoryItem) => String(categoryItem._id) === String(payload.category),
      );

      setItems((prev) =>
        prev.map((item) => {
          const currentId = item._id || item.id || item.itemCode;

          if (String(currentId) !== String(itemId)) {
            return item;
          }

          const updatedCategory =
            updatedItem?.category && typeof updatedItem.category === "object"
              ? updatedItem.category.name || updatedItem.category.categoryName
              : "";

          return {
            ...item,
            ...(updatedItem &&
            typeof updatedItem === "object" &&
            !Array.isArray(updatedItem)
              ? updatedItem
              : {}),
            ...payload,

            categoryId: payload.category,
            category: updatedCategory || selectedCategory?.name || "",

            id: updatedItem?.id || updatedItem?._id || item.id,
          };
        }),
      );

      setEditItem(null);

      toast.success("Inventory item updated successfully");
    } catch (error) {
      console.error("Failed to update inventory item:", error);

      toast.error(
        error.response?.data?.message || "Failed to update inventory item",
      );
    } finally {
      setEditLoading(false);
    }
  };

  /* --------------------------------------------------
     DELETE ITEM
  -------------------------------------------------- */

  const handleDelete = (item) => {
    setShowActionMenu(null);
    setDeleteItem(item);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    const itemId = deleteItem._id || deleteItem.id || deleteItem.itemCode;

    setDeleteLoading(true);

    try {
      await api.delete(`/inventory/${itemId}`);

      setItems((prev) =>
        prev.filter((item) => {
          const currentId = item._id || item.id || item.itemCode;

          return String(currentId) !== String(itemId);
        }),
      );

      toast.success(`${deleteItem.name} deleted successfully`);

      setDeleteItem(null);
    } catch (error) {
      console.error("Failed to delete inventory item:", error);

      toast.error(
        error.response?.data?.message || "Failed to delete inventory item",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  /* --------------------------------------------------
     ACTION MENU
  -------------------------------------------------- */

  const toggleActionMenu = (itemId) => {
    setShowActionMenu((prev) => (prev === itemId ? null : itemId));
  };

  /* --------------------------------------------------
     CLEAR FILTERS
  -------------------------------------------------- */

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setStatus("All");
  };

  return (
    <>
      <div className="space-y-6" onClick={() => setShowActionMenu(null)}>
        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>

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
                <option key={itemCategory} value={itemCategory}>
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
              <option value="Out of Stock">Out of Stock</option>
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
              {(search || category !== "All" || status !== "All") && (
                <button
                  type="button"
                  onClick={clearFilters}
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

          {/* LOADING */}

          {loading && (
            <div className="py-16 text-center">
              <div className="w-8 h-8 mx-auto rounded-full border-2 border-slate-200 border-t-indigo-600 animate-spin" />

              <p className="mt-4 text-sm text-slate-500">
                Loading inventory...
              </p>
            </div>
          )}

          {/* DESKTOP TABLE */}

          {!loading && (
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
                      key={item._id || item.id || item.itemCode}
                      className="border-b last:border-b-0 border-slate-100 hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {item.name}
                          </p>

                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {item.itemCode || item.id || item._id}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {item.category || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {item.department || "-"}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span className="text-sm font-medium text-slate-700">
                          {item.quantity}
                        </span>

                        <span className="ml-1 text-xs text-slate-400">
                          {item.unit}
                        </span>
                      </td>

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

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded-md text-[11px] font-medium ${
                            statusStyles[item.status] ||
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.status || "Available"}
                        </span>
                      </td>

                      <td className="px-5 py-4 relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleActionMenu(
                              item._id || item.id || item.itemCode,
                            );
                          }}
                          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {showActionMenu ===
                          (item._id || item.id || item.itemCode) && (
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
          )}

          {/* MOBILE / TABLET */}

          {!loading && (
            <div className="lg:hidden divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const itemKey = item._id || item.id || item.itemCode;

                return (
                  <div key={itemKey} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800">
                          {item.name}
                        </p>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {item.itemCode || item.id || item._id}
                        </p>
                      </div>

                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleActionMenu(itemKey);
                          }}
                          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {showActionMenu === itemKey && (
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
                        <p className="text-slate-400">Category</p>
                        <p className="mt-0.5 text-slate-600">
                          {item.category || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400">Department</p>
                        <p className="mt-0.5 text-slate-600">
                          {item.department || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400">Total Stock</p>
                        <p className="mt-0.5 font-medium text-slate-700">
                          {item.quantity} {item.unit}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400">Available</p>
                        <p className="mt-0.5 font-semibold text-slate-700">
                          {item.available} {item.unit}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-md text-[11px] font-medium ${
                          statusStyles[item.status] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.status || "Available"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* EMPTY STATE */}

          {!loading && filteredItems.length === 0 && (
            <div className="py-16 text-center">
              <Package className="w-8 h-8 mx-auto text-slate-300" />

              <p className="mt-3 text-sm font-medium text-slate-700">
                No inventory items found
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {items.length === 0
                  ? "No inventory items have been added yet."
                  : "Try changing your search or filters."}
              </p>

              {(search || category !== "All" || status !== "All") && (
                <button
                  type="button"
                  onClick={clearFilters}
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
                    {viewItem.itemCode || viewItem.id || viewItem._id}
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
                <p className="text-xs text-slate-400">Item Name</p>

                <p className="mt-1 text-base font-semibold text-slate-900">
                  {viewItem.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DetailBox
                  label="Item Code"
                  value={viewItem.itemCode || viewItem.id || viewItem._id}
                />

                <DetailBox label="Category" value={viewItem.category || "-"} />

                <DetailBox
                  label="Department"
                  value={viewItem.department || "-"}
                />

                <DetailBox label="Unit" value={viewItem.unit} />

                <DetailBox
                  label="Total Quantity"
                  value={`${viewItem.quantity} ${viewItem.unit}`}
                />

                <DetailBox
                  label="Available"
                  value={`${viewItem.available} ${viewItem.unit}`}
                />

                <DetailBox
                  label="Minimum Stock"
                  value={viewItem.minimumStock ?? 0}
                />
              </div>

              {viewItem.description && (
                <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                    Description
                  </p>

                  <p className="mt-1 text-sm text-slate-600 leading-6">
                    {viewItem.description}
                  </p>
                </div>
              )}

              <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Current Status</span>

                  <span
                    className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${
                      statusStyles[viewItem.status] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {viewItem.status || "Available"}
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
        <ModalOverlay
          onClose={() => {
            if (!editLoading) {
              setEditItem(null);
            }
          }}
        >
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
                disabled={editLoading}
                onClick={() => setEditItem(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-50"
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
                  onChange={(e) => handleEditChange("name", e.target.value)}
                  disabled={editLoading}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:bg-slate-50"
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
                      handleEditChange("category", e.target.value)
                    }
                    disabled={editLoading}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
                  >
                    <option value="">Select category</option>

                    {categoryOptions.map((itemCategory) => (
                      <option key={itemCategory._id} value={itemCategory._id}>
                        {itemCategory.name}
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
                      handleEditChange("department", e.target.value)
                    }
                    disabled={editLoading}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
                  >
                    <option value="">Select department</option>

                    {departments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* QUANTITY + AVAILABLE + UNIT */}

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
                      handleEditChange("quantity", e.target.value)
                    }
                    disabled={editLoading}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 disabled:bg-slate-50"
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
                      handleEditChange("available", e.target.value)
                    }
                    disabled={editLoading}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Unit
                  </label>

                  <select
                    value={editForm.unit}
                    onChange={(e) => handleEditChange("unit", e.target.value)}
                    disabled={editLoading}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 disabled:bg-slate-50"
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

              {/* MINIMUM STOCK */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Minimum Stock Level
                </label>

                <input
                  type="number"
                  min="0"
                  value={editForm.minimumStock}
                  onChange={(e) =>
                    handleEditChange("minimumStock", e.target.value)
                  }
                  disabled={editLoading}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 disabled:bg-slate-50"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Description
                </label>

                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) =>
                    handleEditChange("description", e.target.value)
                  }
                  disabled={editLoading}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none resize-none focus:border-indigo-500 disabled:bg-slate-50"
                />
              </div>

              {/* STATUS INFO */}

              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                <p className="text-xs text-indigo-700">
                  Status is automatically calculated from the available quantity
                  and minimum stock level.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                type="button"
                disabled={editLoading}
                onClick={() => setEditItem(null)}
                className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={editLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-50"
              >
                {editLoading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* DELETE CONFIRMATION */}

      {deleteItem && (
        <ModalOverlay
          onClose={() => {
            if (!deleteLoading) {
              setDeleteItem(null);
            }
          }}
        >
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
                  <span className="text-xs text-slate-400">Item Code</span>

                  <span className="text-xs font-medium text-slate-700">
                    {deleteItem.itemCode || deleteItem.id || deleteItem._id}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeleteItem(null)}
                className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleteLoading}
                onClick={confirmDelete}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium disabled:opacity-50"
              >
                {deleteLoading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Item
                  </>
                )}
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

const ActionMenu = ({ item, onView, onEdit, onDelete, mobile = false }) => {
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

      <p className="mt-1 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
};

export default Inventory;
