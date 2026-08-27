import React, { useMemo, useState } from "react";
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

const initialCategories = [
  {
    id: "CAT-001",
    name: "Electronics",
    description: "Computers, projectors, networking and electronic equipment.",
    itemCount: 34,
    lowStock: 4,
  },
  {
    id: "CAT-002",
    name: "Furniture",
    description: "Tables, chairs, cupboards and other furniture.",
    itemCount: 58,
    lowStock: 2,
  },
  {
    id: "CAT-003",
    name: "Stationery",
    description: "Paper, pens, markers, files and office supplies.",
    itemCount: 76,
    lowStock: 8,
  },
  {
    id: "CAT-004",
    name: "Laboratory",
    description: "Laboratory equipment, instruments and materials.",
    itemCount: 27,
    lowStock: 3,
  },
  {
    id: "CAT-005",
    name: "Sports",
    description: "Sports equipment and physical education materials.",
    itemCount: 19,
    lowStock: 1,
  },
  {
    id: "CAT-006",
    name: "Library",
    description: "Library furniture, supplies and related equipment.",
    itemCount: 31,
    lowStock: 0,
  },
];

const Categories = () => {
  const [categories, setCategories] =
    useState(initialCategories);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [categories, search]);

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
      name: category.name,
      description: category.description,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);

    setFormData({
      name: "",
      description: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const name = formData.name.trim();

    if (!name) {
      toast.error("Category name is required");
      return;
    }

    const duplicate = categories.some(
      (category) =>
        category.name.toLowerCase() ===
          name.toLowerCase() &&
        category.id !== editingCategory?.id
    );

    if (duplicate) {
      toast.error("This category already exists");
      return;
    }

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((category) =>
          category.id === editingCategory.id
            ? {
                ...category,
                name,
                description:
                  formData.description.trim(),
              }
            : category
        )
      );

      toast.success("Category updated successfully");
    } else {
      const newCategory = {
        id: `CAT-${String(
          categories.length + 1
        ).padStart(3, "0")}`,
        name,
        description:
          formData.description.trim(),
        itemCount: 0,
        lowStock: 0,
      };

      setCategories((prev) => [
        ...prev,
        newCategory,
      ]);

      toast.success("Category added successfully");
    }

    closeModal();
  };

  const handleDelete = (category) => {
    if (category.itemCount > 0) {
      toast.error(
        "Cannot delete a category containing inventory items"
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete "${category.name}" category?`
    );

    if (!confirmed) return;

    setCategories((prev) =>
      prev.filter(
        (item) => item.id !== category.id
      )
    );

    toast.success("Category deleted");
  };

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
                  {categories.reduce(
                    (sum, category) =>
                      sum + category.itemCount,
                    0
                  )}
                </p>
              </div>
            </div>
          </div>

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
                  {
                    categories.filter(
                      (category) =>
                        category.lowStock > 0
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CATEGORY GRID */}
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCategories.map(
              (category) => (
                <div
                  key={category.id}
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
                            {category.id}
                          </p>
                        </div>
                      </div>

                      {/* MENU */}
                      <div className="relative group">
                        <button
                          type="button"
                          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        <div className="hidden group-hover:block absolute right-0 top-8 z-20 w-32 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                category
                              )
                            }
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                category
                              )
                            }
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
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
                          {category.itemCount}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] text-slate-400">
                          Low Stock
                        </p>

                        <p
                          className={`mt-1 text-lg font-semibold ${
                            category.lowStock > 0
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {category.lowStock}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="bg-white border border-slate-200 rounded-xl py-16 text-center">
            <Tags className="w-9 h-9 mx-auto text-slate-300" />

            <p className="mt-3 text-sm font-medium text-slate-700">
              No categories found
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Try changing your search or add a new
              category.
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
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
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
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
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
                        description:
                          e.target.value,
                      }))
                    }
                    placeholder="Describe what items belong to this category..."
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-white transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
                >
                  {editingCategory
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