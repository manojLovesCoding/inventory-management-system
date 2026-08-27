import React from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  RotateCcw,
} from "lucide-react";

const transactions = [
  {
    id: "TRX-00124",
    item: "HP Desktop Computer",
    type: "Stock In",
    quantity: 10,
    department: "Computer Science",
    date: "27 Aug 2026",
    icon: ArrowDownToLine,
    status: "in",
  },
  {
    id: "TRX-00123",
    item: "Office Chair",
    type: "Stock Out",
    quantity: 12,
    department: "Administration",
    date: "26 Aug 2026",
    icon: ArrowUpFromLine,
    status: "out",
  },
  {
    id: "TRX-00122",
    item: "A4 Paper - 75 GSM",
    type: "Stock In",
    quantity: 50,
    department: "Main Store",
    date: "26 Aug 2026",
    icon: ArrowDownToLine,
    status: "in",
  },
  {
    id: "TRX-00121",
    item: "Projector",
    type: "Stock Out",
    quantity: 2,
    department: "Commerce",
    date: "25 Aug 2026",
    icon: ArrowUpFromLine,
    status: "out",
  },
  {
    id: "TRX-00120",
    item: "Keyboard & Mouse",
    type: "Return",
    quantity: 5,
    department: "Computer Science",
    date: "25 Aug 2026",
    icon: RotateCcw,
    status: "return",
  },
];

const statusStyles = {
  in: {
    badge: "bg-emerald-50 text-emerald-700",
    icon: "bg-emerald-50 text-emerald-600",
  },
  out: {
    badge: "bg-amber-50 text-amber-700",
    icon: "bg-amber-50 text-amber-600",
  },
  return: {
    badge: "bg-blue-50 text-blue-700",
    icon: "bg-blue-50 text-blue-600",
  },
};

const RecentTransactions = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Recent Transactions
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Latest inventory movements
          </p>
        </div>

        <button
          type="button"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
        >
          View All
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Item
              </th>

              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Type
              </th>

              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Quantity
              </th>

              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Department
              </th>

              <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Date
              </th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((transaction) => {
              const Icon = transaction.icon;
              const styles = statusStyles[transaction.status];

              return (
                <tr
                  key={transaction.id}
                  className="border-b last:border-b-0 border-slate-100 hover:bg-slate-50/70 transition-colors"
                >
                  {/* Item */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${styles.icon}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate max-w-[180px]">
                          {transaction.item}
                        </p>

                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {transaction.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium ${styles.badge}`}
                    >
                      {transaction.type}
                    </span>
                  </td>

                  {/* Quantity */}
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-semibold text-slate-700">
                      {transaction.quantity}
                    </span>
                    <span className="ml-1 text-xs text-slate-400">
                      units
                    </span>
                  </td>

                  {/* Department */}
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-slate-600">
                      {transaction.department}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-xs text-slate-500">
                      {transaction.date}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-slate-100">
        {transactions.map((transaction) => {
          const Icon = transaction.icon;
          const styles = statusStyles[transaction.status];

          return (
            <div key={transaction.id} className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${styles.icon}`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {transaction.item}
                      </p>

                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {transaction.id}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 inline-flex px-2 py-1 rounded-md text-[10px] font-medium ${styles.badge}`}
                    >
                      {transaction.type}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="text-xs text-slate-500">
                      Qty:{" "}
                      <span className="font-medium text-slate-700">
                        {transaction.quantity}
                      </span>
                    </span>

                    <span className="text-xs text-slate-500">
                      {transaction.department}
                    </span>

                    <span className="text-xs text-slate-400">
                      {transaction.date}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentTransactions;