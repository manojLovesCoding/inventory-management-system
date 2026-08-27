import React from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const lowStockItems = [
  {
    id: "ITM-00421",
    name: "HP LaserJet Toner",
    category: "Stationery",
    available: 3,
    minimum: 10,
    unit: "Nos",
  },
  {
    id: "ITM-00318",
    name: "A4 Paper - 75 GSM",
    category: "Stationery",
    available: 5,
    minimum: 20,
    unit: "Reams",
  },
  {
    id: "ITM-00276",
    name: "Wireless Keyboard",
    category: "Electronics",
    available: 4,
    minimum: 10,
    unit: "Nos",
  },
  {
    id: "ITM-00194",
    name: "Whiteboard Marker",
    category: "Stationery",
    available: 8,
    minimum: 25,
    unit: "Boxes",
  },
  {
    id: "ITM-00502",
    name: "Network Cable - CAT6",
    category: "Electronics",
    available: 6,
    minimum: 15,
    unit: "Nos",
  },
];

const getStockPercentage = (available, minimum) => {
  if (!minimum) return 0;

  return Math.min((available / minimum) * 100, 100);
};

const LowStockItems = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Low Stock Items
            </h2>

            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-semibold">
              {lowStockItems.length}
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Items below their minimum stock level
          </p>
        </div>

        <Link
          to="/reports/low-stock"
          className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
        >
          View All
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Items */}
      <div className="divide-y divide-slate-100">
        {lowStockItems.map((item) => {
          const percentage = getStockPercentage(
            item.available,
            item.minimum
          );

          return (
            <div
              key={item.id}
              className="px-5 py-4 hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Warning Icon */}
                <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {item.name}
                      </p>

                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {item.id} · {item.category}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-rose-600">
                        {item.available}
                      </p>

                      <p className="text-[10px] text-slate-400">
                        {item.unit}
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-400">
                        Stock level
                      </span>

                      <span className="text-[10px] text-slate-400">
                        Min: {item.minimum} {item.unit}
                      </span>
                    </div>

                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-rose-500 transition-all"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
        <Link
          to="/stock/in"
          className="text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors"
        >
          Add stock to low inventory →
        </Link>
      </div>
    </div>
  );
};

export default LowStockItems;