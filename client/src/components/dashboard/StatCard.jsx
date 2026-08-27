import React from "react";

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  iconClassName = "bg-indigo-50 text-indigo-600",
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-4">
        {/* Content */}
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </h3>

          {description && (
            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>

        {/* Icon */}
        <div
          className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${iconClassName}`}
        >
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
    </div>
  );
};

export default StatCard;