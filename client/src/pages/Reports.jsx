import React, { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Download,
  FileBarChart,
  FileText,
  Package,
  Printer,
  RefreshCcw,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine,
  RotateCcw,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";

const reportTypes = [
  {
    value: "overview",
    label: "Inventory Overview",
  },
  {
    value: "stock",
    label: "Stock Movement",
  },
  {
    value: "purchases",
    label: "Purchase Report",
  },
  {
    value: "consumption",
    label: "Department Consumption",
  },
];

const summaryData = {
  totalItems: 248,
  totalStock: 18472,
  stockIn: 3250,
  stockOut: 1876,
  purchases: 42,
  purchaseValue: 684500,
  suppliers: 18,
  lowStock: 14,
};

const stockMovementData = [
  {
    date: "01 Aug 2026",
    reference: "SIN-2026-001",
    type: "Stock In",
    item: "A4 Paper",
    quantity: 100,
    department: "Administration",
    status: "Completed",
  },
  {
    date: "03 Aug 2026",
    reference: "SOUT-2026-014",
    type: "Stock Out",
    item: "Office Chair",
    quantity: 12,
    department: "Computer Science",
    status: "Completed",
  },
  {
    date: "05 Aug 2026",
    reference: "SIN-2026-002",
    type: "Stock In",
    item: "Dell Monitor 24 inch",
    quantity: 25,
    department: "Computer Science",
    status: "Completed",
  },
  {
    date: "08 Aug 2026",
    reference: "SOUT-2026-021",
    type: "Stock Out",
    item: "Whiteboard Marker",
    quantity: 30,
    department: "Mathematics",
    status: "Completed",
  },
  {
    date: "11 Aug 2026",
    reference: "RET-2026-004",
    type: "Return",
    item: "HP Desktop Computer",
    quantity: 2,
    department: "Commerce",
    status: "Completed",
  },
  {
    date: "14 Aug 2026",
    reference: "SIN-2026-007",
    type: "Stock In",
    item: "Projector",
    quantity: 5,
    department: "Administration",
    status: "Completed",
  },
  {
    date: "18 Aug 2026",
    reference: "SOUT-2026-037",
    type: "Stock Out",
    item: "A4 Paper",
    quantity: 45,
    department: "English",
    status: "Completed",
  },
  {
    date: "22 Aug 2026",
    reference: "SOUT-2026-041",
    type: "Stock Out",
    item: "Computer Table",
    quantity: 8,
    department: "Commerce",
    status: "Completed",
  },
];

const purchaseData = [
  {
    date: "02 Aug 2026",
    poNo: "PO-2026-001",
    supplier: "ABC Office Solutions",
    items: 5,
    quantity: 120,
    amount: 48500,
    status: "Received",
  },
  {
    date: "06 Aug 2026",
    poNo: "PO-2026-002",
    supplier: "Bharat Electronics Suppliers",
    items: 3,
    quantity: 35,
    amount: 142000,
    status: "Received",
  },
  {
    date: "10 Aug 2026",
    poNo: "PO-2026-003",
    supplier: "Digital Systems India",
    items: 4,
    quantity: 48,
    amount: 218500,
    status: "Partially Received",
  },
  {
    date: "16 Aug 2026",
    poNo: "PO-2026-004",
    supplier: "Karnataka Stationery Mart",
    items: 8,
    quantity: 320,
    amount: 36500,
    status: "Received",
  },
  {
    date: "20 Aug 2026",
    poNo: "PO-2026-005",
    supplier: "National Furniture Works",
    items: 4,
    quantity: 42,
    amount: 164000,
    status: "Ordered",
  },
  {
    date: "25 Aug 2026",
    poNo: "PO-2026-006",
    supplier: "ABC Office Solutions",
    items: 6,
    quantity: 150,
    amount: 75500,
    status: "Received",
  },
];

const departmentData = [
  {
    department: "Computer Science",
    issued: 485,
    returned: 24,
    netConsumption: 461,
  },
  {
    department: "Commerce",
    issued: 365,
    returned: 18,
    netConsumption: 347,
  },
  {
    department: "Administration",
    issued: 298,
    returned: 12,
    netConsumption: 286,
  },
  {
    department: "Mathematics",
    issued: 245,
    returned: 8,
    netConsumption: 237,
  },
  {
    department: "English",
    issued: 198,
    returned: 7,
    netConsumption: 191,
  },
  {
    department: "Kannada",
    issued: 162,
    returned: 5,
    netConsumption: 157,
  },
  {
    department: "Physics",
    issued: 138,
    returned: 6,
    netConsumption: 132,
  },
];

const lowStockData = [
  {
    id: "ITM-0012",
    name: "Whiteboard Marker",
    category: "Stationery",
    currentStock: 8,
    minimumStock: 25,
    unit: "Boxes",
  },
  {
    id: "ITM-0034",
    name: "A4 Paper",
    category: "Stationery",
    currentStock: 12,
    minimumStock: 30,
    unit: "Reams",
  },
  {
    id: "ITM-0041",
    name: "USB Keyboard",
    category: "Electronics",
    currentStock: 5,
    minimumStock: 15,
    unit: "Nos",
  },
  {
    id: "ITM-0068",
    name: "Printer Cartridge",
    category: "Electronics",
    currentStock: 3,
    minimumStock: 10,
    unit: "Nos",
  },
  {
    id: "ITM-0081",
    name: "Lab Gloves",
    category: "Laboratory",
    currentStock: 18,
    minimumStock: 50,
    unit: "Boxes",
  },
];

const formatCurrency = (value) => {
  return `₹${Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const getStockTypeIcon = (type) => {
  if (type === "Stock In") return ArrowDownToLine;
  if (type === "Stock Out") return ArrowUpFromLine;
  return RotateCcw;
};

const getStockTypeClass = (type) => {
  if (type === "Stock In") {
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }

  if (type === "Stock Out") {
    return "bg-rose-50 text-rose-700 border-rose-100";
  }

  return "bg-amber-50 text-amber-700 border-amber-100";
};

const getPurchaseStatusClass = (status) => {
  if (status === "Received") {
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }

  if (status === "Partially Received") {
    return "bg-amber-50 text-amber-700 border-amber-100";
  }

  if (status === "Ordered") {
    return "bg-indigo-50 text-indigo-700 border-indigo-100";
  }

  return "bg-slate-50 text-slate-600 border-slate-200";
};

const Reports = () => {
  const [reportType, setReportType] = useState("overview");

  const [fromDate, setFromDate] = useState("2026-08-01");

  const [toDate, setToDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredPurchases = useMemo(() => {
    return purchaseData;
  }, [fromDate, toDate]);

  const filteredStockMovements = useMemo(() => {
    return stockMovementData;
  }, [fromDate, toDate]);

  const totalPurchaseValue = useMemo(() => {
    return filteredPurchases.reduce(
      (sum, item) => sum + item.amount,
      0
    );
  }, [filteredPurchases]);

  const totalPurchasedQuantity = useMemo(() => {
    return filteredPurchases.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
  }, [filteredPurchases]);

  const totalIssued = useMemo(() => {
    return departmentData.reduce(
      (sum, item) => sum + item.issued,
      0
    );
  }, []);

  const totalReturned = useMemo(() => {
    return departmentData.reduce(
      (sum, item) => sum + item.returned,
      0
    );
  }, []);

  const refreshReport = () => {
    setIsRefreshing(true);

    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Report refreshed successfully");
    }, 700);
  };

  const handleExport = () => {
    toast.success("Report export will be connected to the backend later");
  };

  const handlePrint = () => {
    window.print();
  };

  const resetFilters = () => {
    setReportType("overview");
    setFromDate("2026-08-01");
    setToDate(new Date().toISOString().split("T")[0]);

    toast.success("Filters reset");
  };

  return (
    <div className="space-y-6 print:bg-white">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <FileBarChart className="w-5 h-5 text-indigo-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Reports
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Analyze inventory, stock movement, purchases and department
              consumption.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={refreshReport}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60 transition-colors"
          >
            <RefreshCcw
              className={`w-4 h-4 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm print:hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-slate-500" />

            <h2 className="text-sm font-semibold text-slate-800">
              Report Filters
            </h2>
          </div>

          <p className="text-xs text-slate-400 mt-1">
            Select the report and date range you want to analyze.
          </p>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* REPORT TYPE */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Report Type
            </label>

            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
            >
              {reportTypes.map((report) => (
                <option key={report.value} value={report.value}>
                  {report.label}
                </option>
              ))}
            </select>
          </div>

          {/* FROM */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              From Date
            </label>

            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>
          </div>

          {/* TO */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              To Date
            </label>

            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 flex justify-end">
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>
      </section>

      {/* REPORT TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {reportTypes.find((item) => item.value === reportType)?.label}
          </h2>

          <p className="text-xs text-slate-400 mt-1">
            Report period: {fromDate} to {toDate}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-100">
          <BarChart3 className="w-4 h-4 text-indigo-600" />

          <span className="text-xs font-medium text-indigo-700">
            Inventory Analytics
          </span>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      {reportType === "overview" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* TOTAL ITEMS */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Package className="w-5 h-5 text-indigo-600" />
                </div>

                <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  8.4%
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-4">
                Total Items
              </p>

              <p className="text-2xl font-bold text-slate-900 mt-1">
                {summaryData.totalItems.toLocaleString("en-IN")}
              </p>

              <p className="text-[11px] text-slate-400 mt-1">
                Active inventory items
              </p>
            </div>

            {/* TOTAL STOCK */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <BoxesIcon />
                </div>

                <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  12.6%
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-4">
                Current Stock
              </p>

              <p className="text-2xl font-bold text-slate-900 mt-1">
                {summaryData.totalStock.toLocaleString("en-IN")}
              </p>

              <p className="text-[11px] text-slate-400 mt-1">
                Total available quantity
              </p>
            </div>

            {/* PURCHASE VALUE */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-amber-600" />
                </div>

                <span className="text-[11px] font-medium text-rose-600 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  5.2%
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-4">
                Purchase Value
              </p>

              <p className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(summaryData.purchaseValue)}
              </p>

              <p className="text-[11px] text-slate-400 mt-1">
                Total procurement value
              </p>
            </div>

            {/* LOW STOCK */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-rose-600" />
                </div>

                <span className="text-[11px] font-medium text-rose-600">
                  Attention
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-4">
                Low Stock Items
              </p>

              <p className="text-2xl font-bold text-slate-900 mt-1">
                {summaryData.lowStock}
              </p>

              <p className="text-[11px] text-slate-400 mt-1">
                Items below minimum level
              </p>
            </div>
          </div>

          {/* MOVEMENT OVERVIEW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800">
                  Stock Movement Overview
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  Summary of stock entering and leaving the inventory.
                </p>
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MovementCard
                  icon={ArrowDownToLine}
                  title="Stock In"
                  value={summaryData.stockIn}
                  description="Units received"
                  type="in"
                />

                <MovementCard
                  icon={ArrowUpFromLine}
                  title="Stock Out"
                  value={summaryData.stockOut}
                  description="Units issued"
                  type="out"
                />

                <MovementCard
                  icon={RotateCcw}
                  title="Returns"
                  value={78}
                  description="Units returned"
                  type="return"
                />
              </div>
            </div>

            {/* QUICK STATS */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800">
                  Procurement Summary
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  Current purchasing activity.
                </p>
              </div>

              <div className="p-5 space-y-4">
                <QuickStat
                  icon={ShoppingCart}
                  label="Purchase Orders"
                  value={summaryData.purchases}
                />

                <QuickStat
                  icon={Truck}
                  label="Active Suppliers"
                  value={summaryData.suppliers}
                />

                <QuickStat
                  icon={Package}
                  label="Purchased Quantity"
                  value={totalPurchasedQuantity.toLocaleString(
                    "en-IN"
                  )}
                />

                <QuickStat
                  icon={TrendingUp}
                  label="Purchase Value"
                  value={formatCurrency(totalPurchaseValue)}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* STOCK REPORT */}
      {(reportType === "overview" || reportType === "stock") && (
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Stock Movement
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Recent inventory movement transactions.
              </p>
            </div>

            <span className="text-xs text-slate-400">
              {filteredStockMovements.length} transactions
            </span>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>

                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Reference
                  </th>

                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Movement
                  </th>

                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Item
                  </th>

                  <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Quantity
                  </th>

                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Department
                  </th>

                  <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredStockMovements.map((item) => {
                  const Icon = getStockTypeIcon(item.type);

                  return (
                    <tr
                      key={item.reference}
                      className="hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-4 text-xs text-slate-500">
                        {item.date}
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-xs font-medium text-slate-700">
                          {item.reference}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-medium ${getStockTypeClass(
                            item.type
                          )}`}
                        >
                          <Icon className="w-3 h-3" />
                          {item.type}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {item.item}
                          </p>

                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Inventory item
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className="text-sm font-semibold text-slate-700">
                          {item.quantity}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-500">
                        {item.department}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex px-2 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-[10px] font-medium text-emerald-700">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE */}
          <div className="lg:hidden p-4 space-y-3">
            {filteredStockMovements.map((item) => {
              const Icon = getStockTypeIcon(item.type);

              return (
                <div
                  key={item.reference}
                  className="border border-slate-200 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Package className="w-4 h-4 text-indigo-600" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {item.item}
                        </p>

                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {item.reference}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-medium ${getStockTypeClass(
                        item.type
                      )}`}
                    >
                      <Icon className="w-3 h-3" />
                      {item.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100">
                    <MiniDetail
                      label="Date"
                      value={item.date}
                    />

                    <MiniDetail
                      label="Quantity"
                      value={item.quantity}
                    />

                    <MiniDetail
                      label="Department"
                      value={item.department}
                    />

                    <MiniDetail
                      label="Status"
                      value={item.status}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* PURCHASE REPORT */}
      {reportType === "purchases" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummarySmallCard
              icon={ShoppingCart}
              title="Purchase Orders"
              value={filteredPurchases.length}
              description="Orders in selected period"
            />

            <SummarySmallCard
              icon={Package}
              title="Purchased Quantity"
              value={totalPurchasedQuantity.toLocaleString(
                "en-IN"
              )}
              description="Total units purchased"
            />

            <SummarySmallCard
              icon={TrendingUp}
              title="Purchase Value"
              value={formatCurrency(totalPurchaseValue)}
              description="Total procurement amount"
            />
          </div>

          <section className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">
                Purchase Report
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Purchase orders and supplier-wise procurement details.
              </p>
            </div>

            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>

                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      PO Number
                    </th>

                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Supplier
                    </th>

                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Items
                    </th>

                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Quantity
                    </th>

                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>

                    <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredPurchases.map((purchase) => (
                    <tr
                      key={purchase.poNo}
                      className="hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-4 text-xs text-slate-500">
                        {purchase.date}
                      </td>

                      <td className="px-4 py-4 text-xs font-medium text-slate-700">
                        {purchase.poNo}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <Truck className="w-4 h-4 text-indigo-600" />
                          </div>

                          <span className="text-sm text-slate-700">
                            {purchase.supplier}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-center text-sm text-slate-600">
                        {purchase.items}
                      </td>

                      <td className="px-4 py-4 text-center text-sm font-medium text-slate-700">
                        {purchase.quantity}
                      </td>

                      <td className="px-4 py-4 text-right text-sm font-semibold text-slate-800">
                        {formatCurrency(purchase.amount)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span
                          className={`inline-flex px-2 py-1 rounded-md border text-[10px] font-medium ${getPurchaseStatusClass(
                            purchase.status
                          )}`}
                        >
                          {purchase.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}
            <div className="lg:hidden p-4 space-y-3">
              {filteredPurchases.map((purchase) => (
                <div
                  key={purchase.poNo}
                  className="border border-slate-200 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {purchase.poNo}
                      </p>

                      <p className="text-[10px] text-slate-400 mt-1">
                        {purchase.date}
                      </p>
                    </div>

                    <span
                      className={`px-2 py-1 rounded-md border text-[10px] font-medium ${getPurchaseStatusClass(
                        purchase.status
                      )}`}
                    >
                      {purchase.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <Truck className="w-4 h-4 text-indigo-600" />
                    </div>

                    <span className="text-sm text-slate-700">
                      {purchase.supplier}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-100">
                    <MiniDetail
                      label="Items"
                      value={purchase.items}
                    />

                    <MiniDetail
                      label="Quantity"
                      value={purchase.quantity}
                    />

                    <MiniDetail
                      label="Amount"
                      value={formatCurrency(purchase.amount)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* CONSUMPTION REPORT */}
      {reportType === "consumption" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummarySmallCard
              icon={ArrowUpFromLine}
              title="Total Issued"
              value={totalIssued.toLocaleString("en-IN")}
              description="Units issued to departments"
            />

            <SummarySmallCard
              icon={RotateCcw}
              title="Total Returned"
              value={totalReturned.toLocaleString("en-IN")}
              description="Units returned by departments"
            />

            <SummarySmallCard
              icon={Package}
              title="Net Consumption"
              value={(totalIssued - totalReturned).toLocaleString(
                "en-IN"
              )}
              description="Issued minus returned"
            />
          </div>

          <section className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">
                Department Consumption
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Inventory issued and consumed by each department.
              </p>
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Department
                    </th>

                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Issued
                    </th>

                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Returned
                    </th>

                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Net Consumption
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Usage
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {departmentData.map((department) => {
                    const percentage =
                      totalIssued > 0
                        ? (department.netConsumption /
                            totalIssued) *
                          100
                        : 0;

                    return (
                      <tr
                        key={department.department}
                        className="hover:bg-slate-50/60"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-indigo-600" />
                            </div>

                            <span className="text-sm font-medium text-slate-700">
                              {department.department}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-center text-sm text-slate-600">
                          {department.issued}
                        </td>

                        <td className="px-4 py-4 text-center text-sm text-slate-600">
                          {department.returned}
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span className="text-sm font-semibold text-slate-800">
                            {department.netConsumption}
                          </span>
                        </td>

                        <td className="px-5 py-4 min-w-[200px]">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    percentage * 5,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>

                            <span className="text-[10px] text-slate-400 w-10 text-right">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}
            <div className="md:hidden p-4 space-y-3">
              {departmentData.map((department) => {
                const percentage =
                  totalIssued > 0
                    ? (department.netConsumption / totalIssued) * 100
                    : 0;

                return (
                  <div
                    key={department.department}
                    className="border border-slate-200 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {department.department}
                        </p>

                        <p className="text-[10px] text-slate-400">
                          Net consumption:{" "}
                          {department.netConsumption}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-100">
                      <MiniDetail
                        label="Issued"
                        value={department.issued}
                      />

                      <MiniDetail
                        label="Returned"
                        value={department.returned}
                      />

                      <MiniDetail
                        label="Net"
                        value={department.netConsumption}
                      />
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[10px] text-slate-400">
                          Consumption share
                        </span>

                        <span className="text-[10px] font-medium text-slate-600">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>

                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              percentage * 5,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {/* LOW STOCK */}
      {reportType === "overview" && (
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Low Stock Items
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Items that require replenishment.
              </p>
            </div>

            <span className="text-xs font-medium text-rose-600">
              {summaryData.lowStock} items
            </span>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Item
                  </th>

                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Category
                  </th>

                  <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Current
                  </th>

                  <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Minimum
                  </th>

                  <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Stock Level
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {lowStockData.map((item) => {
                  const percentage = Math.min(
                    (item.currentStock / item.minimumStock) * 100,
                    100
                  );

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                            <Package className="w-4 h-4 text-rose-500" />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {item.name}
                            </p>

                            <p className="text-[10px] text-slate-400">
                              {item.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-500">
                        {item.category}
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className="text-sm font-semibold text-rose-600">
                          {item.currentStock}
                        </span>

                        <span className="text-[10px] text-slate-400 ml-1">
                          {item.unit}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center text-sm text-slate-600">
                        {item.minimumStock}
                      </td>

                      <td className="px-5 py-4 min-w-[220px]">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-rose-400 rounded-full"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>

                          <span className="text-[10px] text-rose-600 font-medium w-9 text-right">
                            {Math.round(percentage)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE */}
          <div className="md:hidden p-4 space-y-3">
            {lowStockData.map((item) => {
              const percentage = Math.min(
                (item.currentStock / item.minimumStock) * 100,
                100
              );

              return (
                <div
                  key={item.id}
                  className="border border-slate-200 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center">
                      <Package className="w-4 h-4 text-rose-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">
                        {item.name}
                      </p>

                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {item.id} · {item.category}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-100">
                    <MiniDetail
                      label="Current"
                      value={`${item.currentStock} ${item.unit}`}
                    />

                    <MiniDetail
                      label="Minimum"
                      value={item.minimumStock}
                    />

                    <MiniDetail
                      label="Shortage"
                      value={`${Math.max(
                        item.minimumStock - item.currentStock,
                        0
                      )}`}
                    />
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-slate-400">
                        Stock level
                      </span>

                      <span className="text-[10px] font-medium text-rose-600">
                        {Math.round(percentage)}%
                      </span>
                    </div>

                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-400 rounded-full"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* REPORT FOOTER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <FileText className="w-3.5 h-3.5" />
          <span>
            Report generated for Government First Grade College,
            Raichur.
          </span>
        </div>

        <span className="text-[10px] text-slate-400">
          Inventory Management System
        </span>
      </div>
    </div>
  );
};

/* =========================
   SMALL COMPONENTS
========================= */

const BoxesIcon = () => {
  return (
    <div className="w-5 h-5 text-emerald-600 flex items-center justify-center">
      <Package className="w-5 h-5" />
    </div>
  );
};

const MovementCard = ({
  icon: Icon,
  title,
  value,
  description,
  type,
}) => {
  const classes = {
    in: {
      wrapper: "bg-emerald-50 border-emerald-100",
      icon: "bg-white text-emerald-600",
      value: "text-emerald-700",
    },
    out: {
      wrapper: "bg-rose-50 border-rose-100",
      icon: "bg-white text-rose-600",
      value: "text-rose-700",
    },
    return: {
      wrapper: "bg-amber-50 border-amber-100",
      icon: "bg-white text-amber-600",
      value: "text-amber-700",
    },
  };

  const style = classes[type];

  return (
    <div
      className={`rounded-xl border p-4 ${style.wrapper}`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center ${style.icon}`}
      >
        <Icon className="w-4 h-4" />
      </div>

      <p className="text-xs text-slate-500 mt-4">
        {title}
      </p>

      <p className={`text-xl font-bold mt-1 ${style.value}`}>
        {value.toLocaleString("en-IN")}
      </p>

      <p className="text-[10px] text-slate-400 mt-1">
        {description}
      </p>
    </div>
  );
};

const QuickStat = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
          <Icon className="w-4 h-4 text-slate-500" />
        </div>

        <span className="text-xs text-slate-500">
          {label}
        </span>
      </div>

      <span className="text-sm font-semibold text-slate-800">
        {value}
      </span>
    </div>
  );
};

const SummarySmallCard = ({
  icon: Icon,
  title,
  value,
  description,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
        <Icon className="w-5 h-5 text-indigo-600" />
      </div>

      <p className="text-xs text-slate-400 mt-4">
        {title}
      </p>

      <p className="text-2xl font-bold text-slate-900 mt-1">
        {value}
      </p>

      <p className="text-[11px] text-slate-400 mt-1">
        {description}
      </p>
    </div>
  );
};

const MiniDetail = ({
  label,
  value,
}) => {
  return (
    <div className="min-w-0">
      <p className="text-[10px] text-slate-400 mb-1">
        {label}
      </p>

      <p className="text-xs font-medium text-slate-700 truncate">
        {value}
      </p>
    </div>
  );
};

export default Reports;