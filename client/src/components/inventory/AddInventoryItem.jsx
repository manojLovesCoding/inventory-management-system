import React, { useState } from "react";
import { X, PackagePlus } from "lucide-react";
import toast from "react-hot-toast";

const AddInventoryItem = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: "",
    itemCode: "",
    category: "",
    department: "",
    unit: "Nos",
    minimumStock: "",
    quantity: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.category ||
      !formData.department ||
      !formData.quantity
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    // Temporary frontend-only operation
    await new Promise((resolve) =>
      setTimeout(resolve, 500)
    );

    const newItem = {
      id:
        formData.itemCode.trim() ||
        `ITM-${Date.now().toString().slice(-6)}`,
      name: formData.name.trim(),
      category: formData.category,
      department: formData.department,
      quantity: Number(formData.quantity),
      available: Number(formData.quantity),
      unit: formData.unit,
      minimumStock: Number(formData.minimumStock) || 0,
      status:
        Number(formData.quantity) <=
        Number(formData.minimumStock || 0)
          ? "Low Stock"
          : "Available",
      description: formData.description.trim(),
    };

    onAdd(newItem);

    toast.success("Inventory item added successfully");

    setFormData({
      name: "",
      itemCode: "",
      category: "",
      department: "",
      unit: "Nos",
      minimumStock: "",
      quantity: "",
      description: "",
    });

    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-white border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <PackagePlus className="w-5 h-5 text-indigo-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Add Inventory Item
              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                Add a new item to the college inventory
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Item Information */}
            <section>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-800">
                  Item Information
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  Basic information about the inventory item.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Item Name */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Item Name
                    <span className="text-rose-500 ml-1">*</span>
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. HP Desktop Computer"
                    required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>

                {/* Item Code */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Item Code
                  </label>

                  <input
                    type="text"
                    name="itemCode"
                    value={formData.itemCode}
                    onChange={handleChange}
                    placeholder="e.g. ITM-0009"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />

                  <p className="mt-1 text-[11px] text-slate-400">
                    Leave empty to generate automatically.
                  </p>
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Unit
                    <span className="text-rose-500 ml-1">*</span>
                  </label>

                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  >
                    <option value="Nos">Nos</option>
                    <option value="Boxes">Boxes</option>
                    <option value="Packets">Packets</option>
                    <option value="Reams">Reams</option>
                    <option value="Sets">Sets</option>
                    <option value="Kg">Kg</option>
                    <option value="Litres">Litres</option>
                    <option value="Meters">Meters</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Classification */}
            <section>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-800">
                  Classification
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  Assign the item to a category and department.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Category
                    <span className="text-rose-500 ml-1">*</span>
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  >
                    <option value="">
                      Select category
                    </option>
                    <option value="Electronics">
                      Electronics
                    </option>
                    <option value="Furniture">
                      Furniture
                    </option>
                    <option value="Stationery">
                      Stationery
                    </option>
                    <option value="Laboratory">
                      Laboratory
                    </option>
                    <option value="Sports">
                      Sports
                    </option>
                    <option value="Library">
                      Library
                    </option>
                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Department
                    <span className="text-rose-500 ml-1">*</span>
                  </label>

                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  >
                    <option value="">
                      Select department
                    </option>
                    <option value="Main Store">
                      Main Store
                    </option>
                    <option value="Administration">
                      Administration
                    </option>
                    <option value="Computer Science">
                      Computer Science
                    </option>
                    <option value="Commerce">
                      Commerce
                    </option>
                    <option value="Arts">
                      Arts
                    </option>
                    <option value="Library">
                      Library
                    </option>
                    <option value="Physical Education">
                      Physical Education
                    </option>
                  </select>
                </div>
              </div>
            </section>

            {/* Stock */}
            <section>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-800">
                  Stock Information
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  Define the initial stock and minimum stock level.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Initial Quantity */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Initial Quantity
                    <span className="text-rose-500 ml-1">*</span>
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="0"
                    required
                    placeholder="0"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>

                {/* Minimum Stock */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Minimum Stock Level
                  </label>

                  <input
                    type="number"
                    name="minimumStock"
                    value={formData.minimumStock}
                    onChange={handleChange}
                    min="0"
                    placeholder="e.g. 5"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />

                  <p className="mt-1 text-[11px] text-slate-400">
                    Used to identify low-stock items.
                  </p>
                </div>
              </div>
            </section>

            {/* Description */}
            <section>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Add any additional information about this item..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              />
            </section>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-white border border-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? (
                "Adding..."
              ) : (
                <>
                  <PackagePlus className="w-4 h-4" />
                  Add Item
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInventoryItem;