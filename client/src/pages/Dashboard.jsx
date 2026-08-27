
import {
  AlertTriangle,
  Boxes,
  Package,
  PackageX,
} from "lucide-react";
import StatCard from "../components/dashboard/StatCard";
import StockOverview from "../components/dashboard/StockOverview";
import QuickActions from "../components/dashboard/QuickActions";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import LowStockItems from "../components/dashboard/LowStockItems";



const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Overview of inventory and stock activities
        </p>
      </div>

      {/* =====================================================
          STATISTICS
      ===================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Items"
          value="1,248"
          description="Items registered"
          icon={Package}
          iconClassName="bg-indigo-50 text-indigo-600"
        />

        <StatCard
          title="Total Stock"
          value="8,542"
          description="Units currently available"
          icon={Boxes}
          iconClassName="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Low Stock"
          value="18"
          description="Items need attention"
          icon={AlertTriangle}
          iconClassName="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Out of Stock"
          value="7"
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
          <StockOverview />
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
          <RecentTransactions />
        </div>

        <div className="min-w-0">
          <LowStockItems />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;