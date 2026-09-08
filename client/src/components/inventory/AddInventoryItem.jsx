import { useEffect, useState } from "react";
import { X, PackagePlus } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios.js";

const AddInventoryItem = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    purchaseItemId: "",
    name: "",
    itemCode: "",
    category: "",
    department: "",
    unit: "Nos",
    minimumStock: "",
    quantity: "",
    description: "",
  });

  const [purchaseItems, setPurchaseItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loading, setLoading] = useState(false);

  // ==========================================
  // FETCH PURCHASE ITEMS, CATEGORIES & DEPARTMENTS
  // ==========================================

  useEffect(() => {
    if (!isOpen) return;

    const fetchOptions = async () => {
      setLoadingOptions(true);

      try {
        const [
          purchasesResponse,
          categoriesResponse,
          departmentsResponse,
        ] = await Promise.all([
          api.get("/purchases"),
          api.get("/categories"),
          api.get("/departments"),
        ]);

        // ------------------------------------------
        // PURCHASES
        // ------------------------------------------

        const purchaseData =
          purchasesResponse.data?.purchases ||
          purchasesResponse.data?.data ||
          purchasesResponse.data ||
          [];

        // ------------------------------------------
        // CATEGORIES
        // ------------------------------------------

        const categoryData =
          categoriesResponse.data?.categories ||
          categoriesResponse.data?.data ||
          categoriesResponse.data ||
          [];

        // ------------------------------------------
        // DEPARTMENTS
        // ------------------------------------------

        const departmentData =
          departmentsResponse.data?.departments ||
          departmentsResponse.data?.data ||
          departmentsResponse.data ||
          [];

        // ------------------------------------------
        // EXTRACT PURCHASE ITEMS
        // ------------------------------------------

        const extractedItems = [];

        if (Array.isArray(purchaseData)) {
          purchaseData.forEach((purchase) => {
            const items = Array.isArray(purchase.items)
              ? purchase.items
              : [];

            items.forEach((item) => {
              extractedItems.push({
                ...item,

                purchaseId:
                  purchase._id ||
                  purchase.id ||
                  purchase.purchaseId,

                purchaseNo: purchase.purchaseNo,

                purchaseDate: purchase.purchaseDate,

                purchaseStatus: purchase.status,

                supplier: purchase.supplier,
              });
            });
          });
        }

        // ------------------------------------------
        // REMOVE DUPLICATES
        //
        // Same item may exist in multiple purchases.
        // Keep each purchase item separately because
        // the inventory item should be linked to a
        // specific purchase.
        // ------------------------------------------

        const uniqueItems = extractedItems.filter(
          (item, index, self) => {
            const currentKey = [
              item.purchaseId,
              item.itemId ||
                item.itemCode ||
                item.code ||
                item._id ||
                item.id ||
                item.name,
            ].join("-");

            return (
              index ===
              self.findIndex((other) => {
                const otherKey = [
                  other.purchaseId,
                  other.itemId ||
                    other.itemCode ||
                    other.code ||
                    other._id ||
                    other.id ||
                    other.name,
                ].join("-");

                return otherKey === currentKey;
              })
            );
          },
        );

        setPurchaseItems(uniqueItems);

        setCategories(
          Array.isArray(categoryData)
            ? categoryData
            : [],
        );

        setDepartments(
          Array.isArray(departmentData)
            ? departmentData
            : [],
        );
      } catch (error) {
        console.error(
          "Failed to load inventory options:",
          error,
        );

        toast.error(
          error.response?.data?.message ||
            "Failed to load purchase items, categories and departments",
        );

        setPurchaseItems([]);
        setCategories([]);
        setDepartments([]);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [isOpen]);

  // ==========================================
  // HANDLE NORMAL FORM CHANGES
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // HANDLE PURCHASE ITEM SELECTION
  // ==========================================

  const handlePurchaseItemChange = (e) => {
    const selectedValue = e.target.value;

    if (!selectedValue) {
      setFormData((prev) => ({
        ...prev,
        purchaseItemId: "",
        name: "",
        itemCode: "",
        category: "",
        unit: "Nos",
        quantity: "",
      }));

      return;
    }

    const selectedItem = purchaseItems.find(
      (item) => {
        const value =
          item.itemId ||
          item.itemCode ||
          item.code ||
          item._id ||
          item.id ||
          item.name;

        const purchaseItemKey = `${item.purchaseId}-${value}`;

        return (
          String(purchaseItemKey) ===
          String(selectedValue)
        );
      },
    );

    if (!selectedItem) {
      return;
    }

    const itemId =
      selectedItem.itemId ||
      selectedItem.itemCode ||
      selectedItem.code ||
      selectedItem._id ||
      selectedItem.id ||
      "";

    const itemName =
      selectedItem.name ||
      selectedItem.itemName ||
      selectedItem.productName ||
      selectedItem.item?.name ||
      selectedItem.product?.name ||
      "";

    const itemCode =
      selectedItem.itemCode ||
      selectedItem.code ||
      selectedItem.item?.itemCode ||
      selectedItem.product?.itemCode ||
      selectedItem.itemId ||
      "";

    const unit =
      selectedItem.unit ||
      selectedItem.unitName ||
      selectedItem.item?.unit ||
      selectedItem.product?.unit ||
      "Nos";

    const category =
      selectedItem.category ||
      selectedItem.item?.category ||
      selectedItem.product?.category ||
      "";

    const purchasedQuantity = Number(
      selectedItem.quantity || 0,
    );

    setFormData((prev) => ({
      ...prev,
      purchaseItemId: `${selectedItem.purchaseId}-${itemId}`,
      name: itemName,
      itemCode,
      category:
        prev.category || category,
      unit,
      quantity:
        purchasedQuantity > 0
          ? String(purchasedQuantity)
          : "",
    }));
  };

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setFormData({
      purchaseItemId: "",
      name: "",
      itemCode: "",
      category: "",
      department: "",
      unit: "Nos",
      minimumStock: "",
      quantity: "",
      description: "",
    });
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ------------------------------------------
    // BASIC VALIDATION
    // ------------------------------------------

    if (!formData.purchaseItemId) {
      toast.error("Please select an item from purchase");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Please select a valid purchase item");
      return;
    }

    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    if (!formData.department) {
      toast.error("Please select a department");
      return;
    }

    if (
      formData.quantity === "" ||
      Number(formData.quantity) < 0
    ) {
      toast.error("Please enter a valid quantity");
      return;
    }

    // ------------------------------------------
    // FIND SELECTED PURCHASE ITEM
    // ------------------------------------------

    const selectedItem = purchaseItems.find(
      (item) => {
        const value =
          item.itemId ||
          item.itemCode ||
          item.code ||
          item._id ||
          item.id ||
          item.name;

        const purchaseItemKey = `${item.purchaseId}-${value}`;

        return (
          String(purchaseItemKey) ===
          String(formData.purchaseItemId)
        );
      },
    );

    if (!selectedItem) {
      toast.error("Selected purchase item was not found");
      return;
    }

    const quantity = Number(formData.quantity);
    const minimumStock =
      Number(formData.minimumStock) || 0;

    const purchasedQuantity = Number(
      selectedItem.quantity || 0,
    );

    // ------------------------------------------
    // QUANTITY VALIDATION
    // ------------------------------------------

    if (
      purchasedQuantity > 0 &&
      quantity > purchasedQuantity
    ) {
      toast.error(
        `Inventory quantity cannot exceed purchased quantity (${purchasedQuantity})`,
      );
      return;
    }

    setLoading(true);

    try {
      // ------------------------------------------
      // GET ACTUAL PURCHASE ID
      // ------------------------------------------

      const purchaseId =
        selectedItem.purchaseId;

      const itemId =
        selectedItem.itemId ||
        selectedItem.itemCode ||
        selectedItem.code ||
        selectedItem._id ||
        selectedItem.id ||
        formData.itemCode;

      // ------------------------------------------
      // API PAYLOAD
      // ------------------------------------------

      const payload = {
        purchaseId,

        itemId: String(itemId),

        name: formData.name.trim(),

        itemCode:
          formData.itemCode.trim() ||
          String(itemId),

        category: formData.category,

        department: formData.department,

        unit: formData.unit,

        quantity,

        minimumStock,

        description:
          formData.description.trim(),
      };

      // ------------------------------------------
      // CREATE INVENTORY ITEM
      // ------------------------------------------

      const response = await api.post(
        "/inventory",
        payload,
      );

      const createdItem =
        response.data?.inventory ||
        response.data?.item ||
        response.data?.data;

      if (!createdItem) {
        throw new Error(
          "Inventory item was created but no item was returned",
        );
      }

      // ------------------------------------------
      // UPDATE PARENT INVENTORY LIST
      // ------------------------------------------

      if (onAdd) {
        onAdd(createdItem);
      }

      toast.success(
        response.data?.message ||
          "Inventory item added successfully",
      );

      resetForm();
      onClose();
    } catch (error) {
      console.error(
        "Failed to add inventory item:",
        error,
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to add inventory item",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const handleClose = () => {
    if (loading) return;

    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={handleClose}
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
                Add a purchased item to the college inventory
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading Options */}
        {loadingOptions && (
          <div className="px-6 py-3 bg-indigo-50 border-b border-indigo-100">
            <p className="text-xs text-indigo-600">
              Loading purchased items, categories and departments...
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* ======================================
                ITEM INFORMATION
            ====================================== */}

            <section>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-800">
                  Item Information
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  Select an item from an existing purchase.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Item Name */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Item Name
                    <span className="text-rose-500 ml-1">
                      *
                    </span>
                  </label>

                  <select
                    name="purchaseItemId"
                    value={formData.purchaseItemId}
                    onChange={handlePurchaseItemChange}
                    required
                    disabled={
                      loading ||
                      loadingOptions
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:bg-slate-50"
                  >
                    <option value="">
                      {loadingOptions
                        ? "Loading purchased items..."
                        : "Select item from purchase"}
                    </option>

                    {purchaseItems.map(
                      (item, index) => {
                        const itemId =
                          item.itemId ||
                          item.itemCode ||
                          item.code ||
                          item._id ||
                          item.id ||
                          item.name ||
                          `item-${index}`;

                        const value = `${item.purchaseId}-${itemId}`;

                        const label =
                          item.name ||
                          item.itemName ||
                          item.productName ||
                          item.item?.name ||
                          item.product?.name ||
                          "Unnamed Item";

                        const code =
                          item.itemCode ||
                          item.code ||
                          item.itemId ||
                          item.item?.itemCode ||
                          item.product?.itemCode;

                        const quantity =
                          Number(
                            item.quantity || 0,
                          );

                        return (
                          <option
                            key={value}
                            value={value}
                          >
                            {label}
                            {code
                              ? ` (${code})`
                              : ""}
                            {item.purchaseNo
                              ? ` - ${item.purchaseNo}`
                              : ""}
                            {quantity
                              ? ` - Qty: ${quantity}`
                              : ""}
                          </option>
                        );
                      },
                    )}
                  </select>

                  {!loadingOptions &&
                    purchaseItems.length ===
                      0 && (
                      <p className="mt-1 text-[11px] text-rose-500">
                        No purchased items available.
                      </p>
                    )}

                  <p className="mt-1 text-[11px] text-slate-400">
                    Item name cannot be entered manually.
                  </p>
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
                    readOnly
                    disabled={loading}
                    placeholder="Automatically populated"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600 outline-none"
                  />

                  <p className="mt-1 text-[11px] text-slate-400">
                    Automatically populated from purchase.
                  </p>
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Unit
                    <span className="text-rose-500 ml-1">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    readOnly
                    disabled={loading}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600 outline-none"
                  />

                  <p className="mt-1 text-[11px] text-slate-400">
                    Automatically populated from purchase.
                  </p>
                </div>
              </div>
            </section>

            {/* ======================================
                CLASSIFICATION
            ====================================== */}

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
                    <span className="text-rose-500 ml-1">
                      *
                    </span>
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    disabled={
                      loading ||
                      loadingOptions
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:bg-slate-50"
                  >
                    <option value="">
                      {loadingOptions
                        ? "Loading categories..."
                        : "Select category"}
                    </option>

                    {categories.map(
                      (category) => {
                        const value =
                          category._id ||
                          category.id ||
                          category.code ||
                          category.name;

                        const label =
                          category.name ||
                          category.title ||
                          category.categoryName ||
                          category.code;

                        return (
                          <option
                            key={String(value)}
                            value={String(value)}
                          >
                            {label}
                          </option>
                        );
                      },
                    )}
                  </select>

                  {!loadingOptions &&
                    categories.length ===
                      0 && (
                      <p className="mt-1 text-[11px] text-rose-500">
                        No categories available.
                      </p>
                    )}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Department
                    <span className="text-rose-500 ml-1">
                      *
                    </span>
                  </label>

                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    disabled={
                      loading ||
                      loadingOptions
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:bg-slate-50"
                  >
                    <option value="">
                      {loadingOptions
                        ? "Loading departments..."
                        : "Select department"}
                    </option>

                    {departments.map(
                      (department) => {
                        const value =
                          department._id ||
                          department.id ||
                          department.code ||
                          department.name;

                        const label =
                          department.name ||
                          department.departmentName ||
                          department.title ||
                          department.code;

                        return (
                          <option
                            key={String(value)}
                            value={String(value)}
                          >
                            {label}
                          </option>
                        );
                      },
                    )}
                  </select>

                  {!loadingOptions &&
                    departments.length ===
                      0 && (
                      <p className="mt-1 text-[11px] text-rose-500">
                        No departments available.
                      </p>
                    )}
                </div>
              </div>
            </section>

            {/* ======================================
                STOCK INFORMATION
            ====================================== */}

            <section>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-800">
                  Stock Information
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  Define the quantity to add to inventory and minimum stock level.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Initial Quantity */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Initial Quantity
                    <span className="text-rose-500 ml-1">
                      *
                    </span>
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                    placeholder="0"
                    disabled={
                      loading ||
                      !formData.purchaseItemId
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:bg-slate-50"
                  />

                  {formData.purchaseItemId && (
                    <p className="mt-1 text-[11px] text-slate-400">
                      Maximum quantity is based on the selected purchase.
                    </p>
                  )}
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
                    step="0.01"
                    placeholder="e.g. 5"
                    disabled={loading}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:bg-slate-50"
                  />

                  <p className="mt-1 text-[11px] text-slate-400">
                    Used to identify low-stock items.
                  </p>
                </div>
              </div>
            </section>

            {/* ======================================
                DESCRIPTION
            ====================================== */}

            <section>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                disabled={loading}
                placeholder="Add any additional information about this item..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:bg-slate-50"
              />
            </section>
          </div>

          {/* ======================================
              FOOTER
          ====================================== */}

          <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-white border border-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                loadingOptions ||
                purchaseItems.length === 0
              }
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
