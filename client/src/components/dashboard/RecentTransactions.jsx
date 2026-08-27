import {
  ArrowDownToLine,
  ArrowUpFromLine,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

const statusStyles = {
  "stock-in": {
    label: "Stock In",
    badge: "bg-emerald-50 text-emerald-700",
    icon: "bg-emerald-50 text-emerald-600",
    Icon: ArrowDownToLine,
  },

  "stock-out": {
    label: "Stock Out",
    badge: "bg-amber-50 text-amber-700",
    icon: "bg-amber-50 text-amber-600",
    Icon: ArrowUpFromLine,
  },

  return: {
    label: "Return",
    badge: "bg-blue-50 text-blue-700",
    icon: "bg-blue-50 text-blue-600",
    Icon: RotateCcw,
  },

  adjustment: {
    label: "Adjustment",
    badge: "bg-violet-50 text-violet-700",
    icon: "bg-violet-50 text-violet-600",
    Icon: SlidersHorizontal,
  },
};

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const RecentTransactions = ({ transactions = [] }) => {
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

      {/* Empty State */}
      {transactions.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <div className="w-10 h-10 mx-auto rounded-lg bg-slate-50 flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5 text-slate-400" />
          </div>

          <p className="mt-3 text-sm font-medium text-slate-600">
            No transactions yet
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Recent stock movements will appear here.
          </p>
        </div>
      ) : (
        <>
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
                  const styles =
                    statusStyles[transaction.type] || statusStyles.adjustment;

                  const Icon = styles.Icon;

                  return (
                    <tr
                      key={transaction._id}
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
                              {transaction.itemName}
                            </p>

                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {transaction.reference ||
                                transaction._id?.slice(-8).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium ${styles.badge}`}
                        >
                          {styles.label}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-semibold text-slate-700">
                          {Number(transaction.quantity || 0).toLocaleString()}
                        </span>

                        <span className="ml-1 text-xs text-slate-400">
                          units
                        </span>
                      </td>

                      {/* Department */}
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-slate-600">
                          {transaction.department || "Main Store"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-xs text-slate-500">
                          {formatDate(transaction.createdAt)}
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
              const styles =
                statusStyles[transaction.type] || statusStyles.adjustment;

              const Icon = styles.Icon;

              return (
                <div key={transaction._id} className="p-4">
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
                            {transaction.itemName}
                          </p>

                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {transaction.reference ||
                              transaction._id?.slice(-8).toUpperCase()}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 inline-flex px-2 py-1 rounded-md text-[10px] font-medium ${styles.badge}`}
                        >
                          {styles.label}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="text-xs text-slate-500">
                          Qty:{" "}
                          <span className="font-medium text-slate-700">
                            {Number(transaction.quantity || 0).toLocaleString()}
                          </span>
                        </span>

                        <span className="text-xs text-slate-500">
                          {transaction.department || "Main Store"}
                        </span>

                        <span className="text-xs text-slate-400">
                          {formatDate(transaction.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default RecentTransactions;
