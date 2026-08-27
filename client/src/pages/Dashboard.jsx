import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  Package,
  PackageX,
  RefreshCw,
} from "lucide-react";

import StatCard from "../components/dashboard/StatCard";
import StockOverview from "../components/dashboard/StockOverview";
import QuickActions from "../components/dashboard/QuickActions";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import LowStockItems from "../components/dashboard/LowStockItems";

import api from "../api/axios";
import Loading from "../components/Loading";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get("/dashboard");

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            "Failed to load dashboard"
        );
      }

      setDashboardData(response.data.data);
    } catch (error) {
      console.error(
        "Dashboard API error:",
        error
      );

      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load dashboard";

      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <Loading />;
  }

  const statistics = dashboardData?.statistics || {
    totalItems: 0,
    totalStock: 0,
    lowStock: 0,
    outOfStock: 0,
  };

  const stockOverview =
    dashboardData?.stockOverview || [];

  const recentTransactions =
    dashboardData?.recentTransactions || [];

  const lowStockItems =
    dashboardData?.lowStockItems || [];

  return (
    <div className="space-y-6">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Overview of inventory and stock activities
          </p>
        </div>

        {/* Refresh */}
        <button
          type="button"
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              refreshing ? "animate-spin" : ""
            }`}
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Items"
          value={statistics.totalItems.toLocaleString()}
          description="Items registered"
          icon={Package}
          iconClassName="bg-indigo-50 text-indigo-600"
        />

        <StatCard
          title="Total Stock"
          value={statistics.totalStock.toLocaleString()}
          description="Units currently available"
          icon={Boxes}
          iconClassName="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Low Stock"
          value={statistics.lowStock.toLocaleString()}
          description="Items need attention"
          icon={AlertTriangle}
          iconClassName="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Out of Stock"
          value={statistics.outOfStock.toLocaleString()}
          description="Items unavailable"
          icon={PackageX}
          iconClassName="bg-rose-50 text-rose-600"
        />
      </div>

      {/* =====================================================
          STOCK OVERVIEW + QUICK ACTIONS
      ===================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 min-w-0">
          <StockOverview
            stockData={stockOverview}
          />
        </div>

        <div className="min-w-0">
          <QuickActions />
        </div>
      </div>

      {/* =====================================================
          RECENT TRANSACTIONS + LOW STOCK
      ===================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 min-w-0">
          <RecentTransactions
            transactions={recentTransactions}
          />
        </div>

        <div className="min-w-0">
          <LowStockItems
            items={lowStockItems}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
