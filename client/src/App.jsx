
import { Toaster } from "react-hot-toast";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import LoginLanding from "./pages/LoginLanding";
import LoginForm from "./components/LoginForm";

import Layout from "./pages/Layout";

import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Categories from "./pages/Categories";

import StockIn from "./pages/StockIn";
import StockOut from "./pages/StockOut";
import Returns from "./pages/Returns";
import Adjustments from "./pages/Adjustments";

import Purchases from "./pages/Purchases";
import Suppliers from "./pages/Suppliers";

import Departments from "./pages/Departments";
import Requests from "./pages/Requests";

import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Settings from "./pages/Settings";

import { useAuth } from "./context/AuthContext";
import Loading from "./components/Loading";

// ==========================================
// PROTECTED ROUTES
// All authenticated users can access these
// ==========================================
const ProtectedRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
};

// ==========================================
// ADMIN ONLY ROUTES
// Only admin can access these pages
// ==========================================
const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.toLowerCase();

  if (userRole !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// ==========================================
// PUBLIC ROUTES
// Logged-in users cannot access login pages
// ==========================================
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ==========================================
// MAIN APP
// ==========================================
const App = () => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />

      <Routes>
        {/* ==================================
            PUBLIC ROUTES
        ================================== */}

        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginLanding />
            </PublicRoute>
          }
        />

        <Route
          path="/login/admin"
          element={
            <PublicRoute>
              <LoginForm
                role="admin"
                title="Admin Portal"
                subtitle="Manage the college inventory system"
              />
            </PublicRoute>
          }
        />

        <Route
          path="/login/store"
          element={
            <PublicRoute>
              <LoginForm
                role="store"
                title="Store Portal"
                subtitle="Manage stock and inventory operations"
              />
            </PublicRoute>
          }
        />

        <Route
          path="/login/department"
          element={
            <PublicRoute>
              <LoginForm
                role="department"
                title="Department Portal"
                subtitle="Manage department inventory requests"
              />
            </PublicRoute>
          }
        />

        {/* ==================================
            PROTECTED APPLICATION
            All authenticated users
        ================================== */}

        <Route element={<ProtectedRoutes />}>
          {/* Main */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* College */}
          <Route path="/requests" element={<Requests />} />

          {/* Inventory */}
          <Route path="/inventory" element={<Inventory />} />

          {/* Stock Operations */}
          <Route path="/stock/in" element={<StockIn />} />
          <Route path="/stock/out" element={<StockOut />} />
          <Route path="/stock/returns" element={<Returns />} />
          <Route path="/stock/adjustments" element={<Adjustments />} />

          {/* Procurement */}
          <Route path="/purchases" element={<Purchases />} />

          {/* ==================================
              ADMIN ONLY PAGES
          ================================== */}

          <Route element={<AdminRoute />}>
            <Route path="/categories" element={<Categories />} />

            <Route path="/suppliers" element={<Suppliers />} />

            <Route path="/departments" element={<Departments />} />

            <Route path="/reports" element={<Reports />} />

            <Route path="/users" element={<Users />} />

            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* ==================================
            DEFAULT ROUTES
        ================================== */}

        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </>
  );
};

export default App;
