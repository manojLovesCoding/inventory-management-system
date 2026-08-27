import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const StockOverview = ({ stockData = [] }) => {
  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const categories = useMemo(() => {
    return stockData.map((item) => item._id);
  }, [stockData]);

  const chartData = useMemo(() => {
    const formattedData = stockData.map((item) => ({
      category: item._id || "Others",
      quantity: item.totalStock || 0,
    }));

    if (selectedCategory === "all") {
      return formattedData;
    }

    return formattedData.filter(
      (item) => item.category === selectedCategory
    );
  }, [stockData, selectedCategory]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Stock Overview
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Available stock by category
          </p>
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) =>
            setSelectedCategory(e.target.value)
          }
          className="text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        >
          <option value="all">
            All Categories
          </option>

          {categories.map((category) => (
            <option
              key={category}
              value={category}
            >
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Chart */}
      <div className="p-5">
        <div className="h-[320px] w-full">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-500">
                  No stock data available
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Add inventory items to see the chart.
                </p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -10,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 11,
                  }}
                  interval={0}
                  tickFormatter={(value) =>
                    value.length > 12
                      ? `${value.substring(
                          0,
                          12
                        )}...`
                      : value
                  }
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 11,
                  }}
                  width={45}
                />

                <Tooltip
                  cursor={{ opacity: 0.08 }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow:
                      "0 4px 12px rgba(15, 23, 42, 0.08)",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [
                    `${Number(
                      value
                    ).toLocaleString()} units`,
                    "Stock",
                  ]}
                />

                <Bar
                  dataKey="quantity"
                  name="Stock"
                  fill="#6366f1"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockOverview;
