import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  FileText,
  Package,
  Plus,
  Save,
  ShoppingCart,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

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

const suppliers = [
  {
    id: "SUP-001",
    name: "ABC Office Solutions",
    gstin: "29ABCDE1234F1Z5",
  },
  {
    id: "SUP-002",
    name: "Bharat Electronics Suppliers",
    gstin: "29BCDEF2345G1Z6",
  },
  {
    id: "SUP-003",
    name: "Digital Systems India",
    gstin: "29CDEFG3456H1Z7",
  },
  {
    id: "SUP-004",
    name: "Karnataka Stationery Mart",
    gstin: "29DEFGH4567J1Z8",
  },
  {
    id: "SUP-005",
    name: "National Furniture Works",
    gstin: "29EFGHI5678K1Z9",
  },
];

const purchaseStatuses = [
  "Draft",
  "Ordered",
  "Received",
  "Partially Received",
  "Cancelled",
];

const Purchases = () => {
  const [purchaseNo, setPurchaseNo] = useState(
    `PO-${new Date().getFullYear()}-001`
  );

  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [supplierId, setSupplierId] = useState("");

  const [invoiceNo, setInvoiceNo] = useState("");

  const [invoiceDate, setInvoiceDate] = useState("");

  const [status, setStatus] = useState("Draft");

  const [orderedBy, setOrderedBy] = useState("");

  const [notes, setNotes] = useState("");

  const [items, setItems] = useState([]);

  const [showItemModal, setShowItemModal] =
    useState(false);

  const [selectedItem, setSelectedItem] =
    useState("");

  const [quantity, setQuantity] = useState("");

  const [unitPrice, setUnitPrice] = useState("");

  const [taxRate, setTaxRate] = useState("18");

  const [discount, setDiscount] = useState("0");

  const selectedSupplier = suppliers.find(
    (supplier) => supplier.id === supplierId
  );

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity) *
          Number(item.unitPrice),
      0
    );
  }, [items]);

  const totalDiscount = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.discount),
      0
    );
  }, [items]);

  const taxableAmount = Math.max(
    0,
    subtotal - totalDiscount
  );

  const totalTax = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.taxAmount),
      0
    );
  }, [items]);

  const grandTotal =
    taxableAmount + totalTax;

  const totalQuantity = useMemo(() => {
    return items.reduce(
      (sum, item) =>
        sum + Number(item.quantity),
      0
    );
  }, [items]);

  const openItemModal = () => {
    setSelectedItem("");
    setQuantity("");
    setUnitPrice("");
    setTaxRate("18");
    setDiscount("0");
    setShowItemModal(true);
  };

  const closeItemModal = () => {
    setSelectedItem("");
    setQuantity("");
    setUnitPrice("");
    setTaxRate("18");
    setDiscount("0");
    setShowItemModal(false);
  };

  const addItem = (e) => {
    e.preventDefault();

    if (!selectedItem) {
      toast.error("Please select an item");
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (!unitPrice || Number(unitPrice) < 0) {
      toast.error("Please enter a valid unit price");
      return;
    }

    const inventoryItem = inventoryItems.find(
      (item) => item.id === selectedItem
    );

    if (!inventoryItem) return;

    const numericQuantity = Number(quantity);
    const numericUnitPrice = Number(unitPrice);
    const numericTaxRate = Number(taxRate) || 0;
    const numericDiscount = Number(discount) || 0;

    const lineSubtotal =
      numericQuantity * numericUnitPrice;

    if (numericDiscount > lineSubtotal) {
      toast.error(
        "Discount cannot be greater than item value"
      );
      return;
    }

    const taxableValue =
      lineSubtotal - numericDiscount;

    const taxAmount =
      taxableValue * (numericTaxRate / 100);

    const lineTotal =
      taxableValue + taxAmount;

    const existingItem = items.find(
      (item) => item.itemId === selectedItem
    );

    if (existingItem) {
      toast.error(
        "This item is already added. Remove it first if you want to change its details."
      );
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        itemId: inventoryItem.id,
        name: inventoryItem.name,
        category: inventoryItem.category,
        unit: inventoryItem.unit,
        quantity: numericQuantity,
        unitPrice: numericUnitPrice,
        taxRate: numericTaxRate,
        discount: numericDiscount,
        taxAmount,
        lineTotal,
      },
    ]);

    toast.success("Purchase item added");
    closeItemModal();
  };

  const removeItem = (itemId) => {
    setItems((prev) =>
      prev.filter((item) => item.itemId !== itemId)
    );

    toast.success("Item removed");
  };

  const updateItem = (
    itemId,
    field,
    value
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.itemId !== itemId) {
          return item;
        }

        const updated = {
          ...item,
          [field]: Number(value) || 0,
        };

        const lineSubtotal =
          Number(updated.quantity) *
          Number(updated.unitPrice);

        const itemDiscount = Math.min(
          Number(updated.discount) || 0,
          lineSubtotal
        );

        const taxableValue =
          lineSubtotal - itemDiscount;

        const taxAmount =
          taxableValue *
          ((Number(updated.taxRate) || 0) / 100);

        return {
          ...updated,
          discount: itemDiscount,
          taxAmount,
          lineTotal: taxableValue + taxAmount,
        };
      })
    );
  };

  const resetForm = () => {
    setPurchaseNo(
      `PO-${new Date().getFullYear()}-${String(
        Math.floor(Math.random() * 999) + 1
      ).padStart(3, "0")}`
    );

    setPurchaseDate(
      new Date().toISOString().split("T")[0]
    );

    setSupplierId("");
    setInvoiceNo("");
    setInvoiceDate("");
    setStatus("Draft");
    setOrderedBy("");
    setNotes("");
    setItems([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!purchaseNo.trim()) {
      toast.error(
        "Purchase reference number is required"
      );
      return;
    }

    if (!purchaseDate) {
      toast.error("Please select purchase date");
      return;
    }

    if (!supplierId) {
      toast.error("Please select a supplier");
      return;
    }

    if (!orderedBy.trim()) {
      toast.error("Please enter ordered by");
      return;
    }

    if (items.length === 0) {
      toast.error(
        "Please add at least one purchase item"
      );
      return;
    }

    const purchaseData = {
      purchaseNo,
      purchaseDate,
      supplier: selectedSupplier,
      invoiceNo,
      invoiceDate,
      status,
      orderedBy,
      notes,
      items,
      subtotal,
      discount: totalDiscount,
      tax: totalTax,
      grandTotal,
      totalQuantity,
    };

    console.log("Purchase:", purchaseData);

    toast.success(
      "Purchase order saved successfully"
    );

    resetForm();
  };

  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-indigo-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Purchases
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Create and manage inventory purchase
                orders.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-100">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />

            <span className="text-xs font-medium text-indigo-700">
              Procurement
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* PURCHASE INFORMATION */}
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">
                Purchase Information
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Enter the basic purchase and supplier
                details.
              </p>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* PURCHASE NO */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Purchase / PO No.
                  <span className="text-rose-500 ml-1">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  value={purchaseNo}
                  onChange={(e) =>
                    setPurchaseNo(e.target.value)
                  }
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              {/* DATE */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Purchase Date
                  <span className="text-rose-500 ml-1">
                    *
                  </span>
                </label>

                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) =>
                      setPurchaseDate(
                        e.target.value
                      )
                    }
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* SUPPLIER */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Supplier
                  <span className="text-rose-500 ml-1">
                    *
                  </span>
                </label>

                <select
                  value={supplierId}
                  onChange={(e) =>
                    setSupplierId(e.target.value)
                  }
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                >
                  <option value="">
                    Select supplier
                  </option>

                  {suppliers.map(
                    (supplier) => (
                      <option
                        key={supplier.id}
                        value={supplier.id}
                      >
                        {supplier.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* STATUS */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Purchase Status
                </label>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                >
                  {purchaseStatuses.map(
                    (statusItem) => (
                      <option
                        key={statusItem}
                        value={statusItem}
                      >
                        {statusItem}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* INVOICE */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Invoice No.
                </label>

                <input
                  type="text"
                  value={invoiceNo}
                  onChange={(e) =>
                    setInvoiceNo(e.target.value)
                  }
                  placeholder="Supplier invoice number"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                />
              </div>

              {/* INVOICE DATE */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Invoice Date
                </label>

                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) =>
                    setInvoiceDate(e.target.value)
                  }
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                />
              </div>

              {/* ORDERED BY */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Ordered By
                  <span className="text-rose-500 ml-1">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  value={orderedBy}
                  onChange={(e) =>
                    setOrderedBy(e.target.value)
                  }
                  placeholder="Staff / purchase officer"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* SUPPLIER DETAILS */}
            {selectedSupplier && (
              <div className="mx-5 mb-5 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                    <Truck className="w-4 h-4 text-indigo-600" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-indigo-900">
                      {selectedSupplier.name}
                    </p>

                    <p className="text-[11px] text-indigo-600 mt-0.5">
                      {selectedSupplier.id} · GSTIN:{" "}
                      {selectedSupplier.gstin}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ITEMS */}
          <section className="mt-6 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Purchase Items
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Add the items being purchased from
                  the supplier.
                </p>
              </div>

              <button
                type="button"
                onClick={openItemModal}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            {items.length === 0 ? (
              <div className="py-16 px-5 text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-slate-400" />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-700">
                  No purchase items
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Add products to this purchase order.
                </p>

                <button
                  type="button"
                  onClick={openItemModal}
                  className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Plus className="w-4 h-4" />
                  Add First Item
                </button>
              </div>
            ) : (
              <>
                {/* DESKTOP TABLE */}
                <div className="hidden xl:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-100">
                        <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Item
                        </th>

                        <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Qty
                        </th>

                        <th className="text-right px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Unit Price
                        </th>

                        <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Tax %
                        </th>

                        <th className="text-right px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Discount
                        </th>

                        <th className="text-right px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Tax
                        </th>

                        <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Total
                        </th>

                        <th />
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {items.map(
                        (item) => (
                          <tr
                            key={
                              item.itemId
                            }
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                  <Package className="w-4 h-4 text-indigo-600" />
                                </div>

                                <div>
                                  <p className="text-sm font-medium text-slate-800">
                                    {
                                      item.name
                                    }
                                  </p>

                                  <p className="text-[10px] text-slate-400">
                                    {
                                      item.itemId
                                    }{" "}
                                    ·{" "}
                                    {
                                      item.category
                                    }
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-3 py-4">
                              <input
                                type="number"
                                min="1"
                                value={
                                  item.quantity
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateItem(
                                    item.itemId,
                                    "quantity",
                                    e
                                      .target
                                      .value
                                  )
                                }
                                className="w-16 px-2 py-2 border border-slate-200 rounded-lg text-xs text-center outline-none focus:border-indigo-500"
                              />
                            </td>

                            <td className="px-3 py-4">
                              <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                  ₹
                                </span>

                                <input
                                  type="number"
                                  min="0"
                                  value={
                                    item.unitPrice
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updateItem(
                                      item.itemId,
                                      "unitPrice",
                                      e
                                        .target
                                        .value
                                    )
                                  }
                                  className="w-28 pl-6 pr-2 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500"
                                />
                              </div>
                            </td>

                            <td className="px-3 py-4">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={
                                  item.taxRate
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateItem(
                                    item.itemId,
                                    "taxRate",
                                    e
                                      .target
                                      .value
                                  )
                                }
                                className="w-16 px-2 py-2 border border-slate-200 rounded-lg text-xs text-center outline-none focus:border-indigo-500"
                              />
                            </td>

                            <td className="px-3 py-4">
                              <input
                                type="number"
                                min="0"
                                value={
                                  item.discount
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateItem(
                                    item.itemId,
                                    "discount",
                                    e
                                      .target
                                      .value
                                  )
                                }
                                className="w-24 px-2 py-2 border border-slate-200 rounded-lg text-xs text-right outline-none focus:border-indigo-500"
                              />
                            </td>

                            <td className="px-3 py-4 text-right">
                              <span className="text-xs text-slate-600">
                                ₹
                                {item.taxAmount.toLocaleString(
                                  "en-IN",
                                  {
                                    maximumFractionDigits: 2,
                                  }
                                )}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <span className="text-sm font-semibold text-slate-800">
                                ₹
                                {item.lineTotal.toLocaleString(
                                  "en-IN",
                                  {
                                    maximumFractionDigits: 2,
                                  }
                                )}
                              </span>
                            </td>

                            <td className="px-3 py-4">
                              <button
                                type="button"
                                onClick={() =>
                                  removeItem(
                                    item.itemId
                                  )
                                }
                                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE / TABLET */}
                <div className="xl:hidden p-4 space-y-4">
                  {items.map(
                    (item) => (
                      <div
                        key={
                          item.itemId
                        }
                        className="border border-slate-200 rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                              <Package className="w-4 h-4 text-indigo-600" />
                            </div>

                            <div>
                              <p className="text-sm font-medium text-slate-800">
                                {
                                  item.name
                                }
                              </p>

                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {
                                  item.itemId
                                }{" "}
                                ·{" "}
                                {
                                  item.category
                                }
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                item.itemId
                              )
                            }
                            className="p-1.5 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">
                              Quantity
                            </label>

                            <input
                              type="number"
                              min="1"
                              value={
                                item.quantity
                              }
                              onChange={(
                                e
                              ) =>
                                updateItem(
                                  item.itemId,
                                  "quantity",
                                  e
                                    .target
                                    .value
                                )
                              }
                              className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">
                              Unit Price
                            </label>

                            <input
                              type="number"
                              min="0"
                              value={
                                item.unitPrice
                              }
                              onChange={(
                                e
                              ) =>
                                updateItem(
                                  item.itemId,
                                  "unitPrice",
                                  e
                                    .target
                                    .value
                                )
                              }
                              className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">
                              Tax %
                            </label>

                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={
                                item.taxRate
                              }
                              onChange={(
                                e
                              ) =>
                                updateItem(
                                  item.itemId,
                                  "taxRate",
                                  e
                                    .target
                                    .value
                                )
                              }
                              className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">
                              Discount
                            </label>

                            <input
                              type="number"
                              min="0"
                              value={
                                item.discount
                              }
                              onChange={(
                                e
                              ) =>
                                updateItem(
                                  item.itemId,
                                  "discount",
                                  e
                                    .target
                                    .value
                                )
                              }
                              className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                          <span className="text-xs text-slate-400">
                            Item Total
                          </span>

                          <span className="text-sm font-bold text-indigo-600">
                            ₹
                            {item.lineTotal.toLocaleString(
                              "en-IN",
                              {
                                maximumFractionDigits: 2,
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* TOTALS */}
                <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-5">
                  <div className="ml-auto w-full sm:max-w-sm space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        Items Quantity
                      </span>

                      <span className="font-medium text-slate-700">
                        {totalQuantity}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        Subtotal
                      </span>

                      <span className="font-medium text-slate-700">
                        ₹
                        {subtotal.toLocaleString(
                          "en-IN",
                          {
                            maximumFractionDigits: 2,
                          }
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        Discount
                      </span>

                      <span className="font-medium text-rose-600">
                        - ₹
                        {totalDiscount.toLocaleString(
                          "en-IN",
                          {
                            maximumFractionDigits: 2,
                          }
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        GST / Tax
                      </span>

                      <span className="font-medium text-slate-700">
                        ₹
                        {totalTax.toLocaleString(
                          "en-IN",
                          {
                            maximumFractionDigits: 2,
                          }
                        )}
                      </span>
                    </div>

                    <div className="pt-3 mt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800">
                        Grand Total
                      </span>

                      <span className="text-xl font-bold text-indigo-600">
                        ₹
                        {grandTotal.toLocaleString(
                          "en-IN",
                          {
                            maximumFractionDigits: 2,
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* NOTES */}
          <section className="mt-6 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-slate-500" />

                <label className="text-sm font-medium text-slate-700">
                  Purchase Notes
                </label>
              </div>

              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
                rows={4}
                placeholder="Add purchase remarks, tender details, delivery information, etc."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>
          </section>

          {/* ACTIONS */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition-colors"
            >
              Clear
            </button>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Purchase
            </button>
          </div>
        </form>
      </div>

      {/* ADD ITEM MODAL */}
      {showItemModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeItemModal}
          />

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* MODAL HEADER */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Add Purchase Item
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Enter quantity, price and applicable
                  tax.
                </p>
              </div>

              <button
                type="button"
                onClick={closeItemModal}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={addItem}>
              <div className="p-6 space-y-5">
                {/* ITEM */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Inventory Item
                    <span className="text-rose-500 ml-1">
                      *
                    </span>
                  </label>

                  <select
                    value={selectedItem}
                    onChange={(e) =>
                      setSelectedItem(
                        e.target.value
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

                {/* QUANTITY + PRICE */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Quantity
                      <span className="text-rose-500 ml-1">
                        *
                      </span>
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          e.target.value
                        )
                      }
                      placeholder="10"
                      required
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Unit Price
                      <span className="text-rose-500 ml-1">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                        ₹
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={unitPrice}
                        onChange={(e) =>
                          setUnitPrice(
                            e.target.value
                          )
                        }
                        placeholder="500"
                        required
                        className="w-full pl-7 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* TAX + DISCOUNT */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      GST / Tax %
                    </label>

                    <select
                      value={taxRate}
                      onChange={(e) =>
                        setTaxRate(
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
                    >
                      <option value="0">
                        0%
                      </option>
                      <option value="5">
                        5%
                      </option>
                      <option value="12">
                        12%
                      </option>
                      <option value="18">
                        18%
                      </option>
                      <option value="28">
                        28%
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Discount
                    </label>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                        ₹
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={discount}
                        onChange={(e) =>
                          setDiscount(
                            e.target.value
                          )
                        }
                        placeholder="0"
                        className="w-full pl-7 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* PREVIEW */}
                {quantity &&
                  unitPrice && (
                    <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-indigo-600">
                          Estimated Item Total
                        </span>

                        <span className="text-lg font-bold text-indigo-700">
                          ₹
                          {(
                            Math.max(
                              0,
                              Number(
                                quantity
                              ) *
                                Number(
                                  unitPrice
                                ) -
                                Number(
                                  discount
                                )
                            ) *
                              (1 +
                                Number(
                                  taxRate
                                ) /
                                  100)
                          ).toLocaleString(
                            "en-IN",
                            {
                              maximumFractionDigits: 2,
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  )}
              </div>

              {/* MODAL FOOTER */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={closeItemModal}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Purchases;