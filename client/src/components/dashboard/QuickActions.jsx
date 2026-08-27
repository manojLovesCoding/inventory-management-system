import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  PackagePlus,
  ShoppingCart,
} from "lucide-react";

const actions = [
  {
    title: "Add Item",
    description: "Register a new inventory item",
    href: "/inventory/add",
    icon: PackagePlus,
    iconClassName: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "Stock In",
    description: "Add received stock",
    href: "/stock/in",
    icon: ArrowDownToLine,
    iconClassName: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Stock Out",
    description: "Issue items to a department",
    href: "/stock/out",
    icon: ArrowUpFromLine,
    iconClassName: "bg-amber-50 text-amber-600",
  },
  {
    title: "New Purchase",
    description: "Record a purchase",
    href: "/purchases/add",
    icon: ShoppingCart,
    iconClassName: "bg-violet-50 text-violet-600",
  },
];

const QuickActions = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">
          Quick Actions
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Frequently used inventory operations
        </p>
      </div>

      {/* Actions */}
      <div className="p-4 space-y-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              to={action.href}
              className="group flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all duration-200"
            >
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${action.iconClassName}`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 group-hover:text-slate-900">
                  {action.title}
                </p>

                <p className="mt-0.5 text-xs text-slate-500 truncate">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;