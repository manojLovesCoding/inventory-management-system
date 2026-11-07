
import { Toaster } from "react-hot-toast";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";

import LoginLanding from "./pages/LoginLanding";
import LoginForm from "./components/LoginForm";

import Layout from "./pages/Layout";

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

import Users from "./pages/Users";


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
    return <Navigate to="/requests" replace />;
  }

  return <Outlet />;
};

// ==========================================
// DEPARTMENT RESTRICTED ROUTES
// Department users cannot access these pages
// Admin and store users can access them
// ==========================================
const DepartmentRestrictedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.toLowerCase();

  if (userRole === "department") {
    return <Navigate to="/requests" replace />;
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
    return <Navigate to="/requests" replace />;
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
        {/* PUBLIC ROUTES */}

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

        {/* PROTECTED APPLICATION */}

        <Route element={<ProtectedRoutes />}>
          {/* COLLEGE */}
          <Route path="/requests" element={<Requests />} />

          {/* DEPARTMENT RESTRICTED PAGES */}
          <Route element={<DepartmentRestrictedRoute />}>
            <Route path="/inventory" element={<Inventory />} />

            <Route path="/stock/in" element={<StockIn />} />

            <Route path="/stock/out" element={<StockOut />} />

            <Route
              path="/stock/adjustments"
              element={<Adjustments />}
            />

            <Route path="/purchases" element={<Purchases />} />
          </Route>

          {/* RETURNS - AVAILABLE TO ALL AUTHENTICATED USERS */}
          <Route path="/stock/returns" element={<Returns />} />

          {/* ADMIN ONLY PAGES */}
          <Route element={<AdminRoute />}>
            <Route path="/categories" element={<Categories />} />

            <Route path="/suppliers" element={<Suppliers />} />

            <Route path="/departments" element={<Departments />} />

            <Route path="/users" element={<Users />} />

           
          </Route>
        </Route>

        {/* DEFAULT ROUTES */}

        <Route
          path="/"
          element={<Navigate to="/requests" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/requests" replace />}
        />
      </Routes>
    </>
  );
};

export default App;
