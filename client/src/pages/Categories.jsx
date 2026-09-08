import React, { useEffect, useMemo, useState } from "react";
import {
  FolderOpen,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Tags,
  Trash2,
  Pencil,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // =====================================================
  // GET CATEGORIES + INVENTORY ITEMS
  // =====================================================

  const fetchCategoriesAndInventory = async () => {
    try {
      setLoading(true);

      const [categoriesResponse, inventoryResponse] = await Promise.all([
        api.get("/categories"),
        api.get("/inventory"),
      ]);

      // -------------------------------------------------
      // CATEGORIES
      // -------------------------------------------------

      const categoryResponseData = categoriesResponse.data;

      let categoryData = [];

      if (Array.isArray(categoryResponseData)) {
        categoryData = categoryResponseData;
      } else if (Array.isArray(categoryResponseData?.categories)) {
        categoryData = categoryResponseData.categories;
      } else if (Array.isArray(categoryResponseData?.data)) {
        categoryData = categoryResponseData.data;
      }

      // -------------------------------------------------
      // INVENTORY
      // -------------------------------------------------

      const inventoryResponseData = inventoryResponse.data;

      let inventoryData = [];

      if (Array.isArray(inventoryResponseData)) {
        inventoryData = inventoryResponseData;
      } else if (Array.isArray(inventoryResponseData?.inventory)) {
        inventoryData = inventoryResponseData.inventory;
      } else if (Array.isArray(inventoryResponseData?.items)) {
        inventoryData = inventoryResponseData.items;
      } else if (Array.isArray(inventoryResponseData?.data)) {
        inventoryData = inventoryResponseData.data;
      }

      setCategories(categoryData);
      setInventoryItems(inventoryData);
    } catch (error) {
      console.error(
        "Fetch categories and inventory error:",
        error,
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load categories and inventory",
      );

      setCategories([]);
      setInventoryItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesAndInventory();
  }, []);

  // =====================================================
  // CATEGORY HELPERS
  // =====================================================

  const getCategoryId = (category) => {
    return (
      category?._id ||
      category?.id ||
      category?.categoryId ||
      ""
    );
  };

  const getCategoryName = (category) => {
    return (
      category?.name ||
      category?.categoryName ||
      category?.title ||
      ""
    );
  };

  const getInventoryCategoryValue = (item) => {
    const category = item?.category;

    if (category && typeof category === "object") {
      return {
        id:
          category._id ||
          category.id ||
          category.categoryId ||
          "",
        name:
          category.name ||
          category.categoryName ||
          category.title ||
          "",
      };
    }

    return {
      id:
        item?.categoryId ||
        item?.category_id ||
        "",
      name:
        typeof category === "string"
          ? category
          : item?.categoryName || "",
    };
  };

  // =====================================================
  // INVENTORY STATISTICS
  // =====================================================

  const getCategoryInventoryStats = (category) => {
    const categoryId = String(getCategoryId(category) || "")
      .trim()
      .toLowerCase();

    const categoryName = String(getCategoryName(category) || "")
      .trim()
      .toLowerCase();

    const matchingItems = inventoryItems.filter((item) => {
      const inventoryCategory = getInventoryCategoryValue(item);

      const inventoryCategoryId = String(
        inventoryCategory.id || "",
      )
        .trim()
        .toLowerCase();

      const inventoryCategoryName = String(
        inventoryCategory.name || "",
      )
        .trim()
        .toLowerCase();

      // Match by category MongoDB ID
      if (
        categoryId &&
        inventoryCategoryId &&
        categoryId === inventoryCategoryId
      ) {
        return true;
      }

      // Match by category name
      if (
        categoryName &&
        inventoryCategoryName &&
        categoryName === inventoryCategoryName
      ) {
        return true;
      }

      // Some APIs may return category directly as an ID/string
      if (
        categoryId &&
        inventoryCategoryName &&
        categoryId === inventoryCategoryName
      ) {
        return true;
      }

      return false;
    });

    const itemCount = matchingItems.length;

    const lowStock = matchingItems.filter((item) => {
      const quantity = Number(
        item.quantity ??
          item.totalQuantity ??
          item.stock ??
          0,
      );

      const available = Number(
        item.available ??
          item.availableQuantity ??
          item.currentStock ??
          quantity,
      );

      const minimumStock = Number(
        item.minimumStock ??
          item.minStock ??
          item.minimumStockLevel ??
          0,
      );

      // Prefer backend status when available
      if (item.status === "Out of Stock") {
        return true;
      }

      if (item.status === "Low Stock") {
        return true;
      }

      // Otherwise calculate low stock locally
      if (minimumStock > 0) {
        return available <= minimumStock;
      }

      // Fallback: consider <= 20% available as low stock
      if (quantity > 0) {
        return available <= Math.max(1, quantity * 0.2);
      }

      return available === 0;
    }).length;

    return {
      itemCount,
      lowStock,
    };
  };

  // =====================================================
  // CATEGORY DATA WITH INVENTORY STATS
  // =====================================================

  const categoriesWithStats = useMemo(() => {
    return categories.map((category) => {
      const stats = getCategoryInventoryStats(category);

      return {
        ...category,
        itemCount: stats.itemCount,
        lowStock: stats.lowStock,
      };
    });
  }, [categories, inventoryItems]);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredCategories = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return categoriesWithStats;
    }

    return categoriesWithStats.filter((category) => {
      return (
        category.name?.toLowerCase().includes(searchValue) ||
        category.categoryId?.toLowerCase().includes(searchValue) ||
        category.description?.toLowerCase().includes(searchValue)
      );
    });
  }, [categoriesWithStats, search]);

  // =====================================================
  // MODAL
  // =====================================================

  const openAddModal = () => {
    setEditingCategory(null);

    setFormData({
      name: "",
      description: "",
    });

    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);

    setFormData({
      name: category.name || "",
      description: category.description || "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingCategory(null);

    setFormData({
      name: "",
      description: "",
    });
  };

  // =====================================================
  // CREATE / UPDATE CATEGORY
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = formData.name.trim();
    const description = formData.description.trim();

    if (!name) {
      toast.error("Category name is required");
      return;
    }

    try {
      setSubmitting(true);

      if (editingCategory) {
        // UPDATE
        const response = await api.put(
          `/categories/${editingCategory._id}`,
          {
            name,
            description,
          },
        );

        if (response.data.success) {
          const updatedCategory = response.data.category;

          setCategories((prev) =>
            prev.map((category) =>
              category._id === updatedCategory._id
                ? updatedCategory
                : category,
            ),
          );

          toast.success(
            response.data.message ||
              "Category updated successfully",
          );

          closeModal();
        }
      } else {
        // CREATE
        const response = await api.post("/categories", {
          name,
          description,
        });

        if (response.data.success) {
          const newCategory = response.data.category;

          setCategories((prev) => [
            newCategory,
            ...prev,
          ]);

          toast.success(
            response.data.message ||
              "Category added successfully",
          );

          closeModal();
        }
      }
    } catch (error) {
      console.error("Save category error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to save category",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // DELETE CATEGORY
  // =====================================================

  const handleDelete = async (category) => {
    const stats = getCategoryInventoryStats(category);

    if (stats.itemCount > 0) {
      toast.error(
        "Cannot delete a category containing inventory items",
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete "${category.name}" category?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(category._id);

      const response = await api.delete(
        `/categories/${category._id}`,
      );

      if (response.data.success) {
        setCategories((prev) =>
          prev.filter(
            (item) => item._id !== category._id,
          ),
        );

        toast.success(
          response.data.message || "Category deleted",
        );
      }
    } catch (error) {
      console.error("Delete category error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to delete category",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalItems = categoriesWithStats.reduce(
    (sum, category) =>
      sum + (Number(category.itemCount) || 0),
    0,
  );

  const categoriesWithLowStock = categoriesWithStats.filter(
    (category) => Number(category.lowStock) > 0,
  ).length;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Categories
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Organize and manage inventory categories
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        {/* SEARCH */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search categories..."
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* TOTAL CATEGORIES */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Tags className="w-5 h-5 text-indigo-600" />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Total Categories
                </p>

                <p className="text-xl font-semibold text-slate-900">
                  {categories.length}
                </p>
              </div>
            </div>
          </div>

          {/* TOTAL ITEMS */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Package className="w-5 h-5 text-emerald-600" />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Total Items
                </p>

                <p className="text-xl font-semibold text-slate-900">
                  {totalItems}
                </p>
              </div>
            </div>
          </div>

          {/* LOW STOCK */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-amber-600" />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Categories with Low Stock
                </p>

                <p className="text-xl font-semibold text-slate-900">
                  {categoriesWithLowStock}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl py-16 text-center">
            <div className="w-8 h-8 mx-auto border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />

            <p className="mt-4 text-sm text-slate-500">
              Loading categories and inventory...
            </p>
          </div>
        ) : filteredCategories.length > 0 ? (
          /* CATEGORY GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCategories.map((category) => {
              const itemCount =
                Number(category.itemCount) || 0;

              const lowStock =
                Number(category.lowStock) || 0;

              return (
                <div
                  key={category._id}
                  className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
                >
                  <div className="p-5">
                    {/* TOP */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                          <Tags className="w-5 h-5 text-indigo-600" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-slate-800 truncate">
                            {category.name}
                          </h3>

                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {category.categoryId ||
                              category._id}
                          </p>
                        </div>
                      </div>

                      {/* MENU */}
                      <div className="relative group">
                        <button
                          type="button"
                          disabled={
                            deletingId ===
                            category._id
                          }
                          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        <div className="hidden group-hover:block absolute right-0 top-8 z-20 w-32 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(category)
                            }
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(category)
                            }
                            disabled={
                              deletingId ===
                              category._id
                            }
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />

                            {deletingId ===
                            category._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* DESCRIPTION */}
                    <p className="mt-4 text-xs leading-5 text-slate-500 min-h-[40px]">
                      {category.description ||
                        "No description provided."}
                    </p>

                    {/* STATS */}
                    <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] text-slate-400">
                          Inventory Items
                        </p>

                        <p className="mt-1 text-lg font-semibold text-slate-800">
                          {itemCount}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] text-slate-400">
                          Low Stock
                        </p>

                        <p
                          className={`mt-1 text-lg font-semibold ${
                            lowStock > 0
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {lowStock}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="bg-white border border-slate-200 rounded-xl py-16 text-center">
            <Tags className="w-9 h-9 mx-auto text-slate-300" />

            <p className="mt-3 text-sm font-medium text-slate-700">
              No categories found
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {search
                ? "Try changing your search."
                : "Add a new category to get started."}
            </p>
          </div>
        )}
      </div>

      {/* =====================================================
          ADD / EDIT CATEGORY MODAL
      ====================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl">
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  {editingCategory
                    ? "Update category information."
                    : "Create a new inventory category."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                <span className="text-lg leading-none">
                  ×
                </span>
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Category Name
                    <span className="text-rose-500 ml-1">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g. Electronics"
                    required
                    disabled={submitting}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Description
                  </label>

                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe what items belong to this category..."
                    disabled={submitting}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? editingCategory
                      ? "Saving..."
                      : "Adding..."
                    : editingCategory
                      ? "Save Changes"
                      : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Categories;
