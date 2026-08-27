import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes } from "react-router-dom";

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
        {/* =========================
            PUBLIC ROUTES
        ========================== */}

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
                role="ADMIN"
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
                role="STORE"
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
                role="DEPARTMENT"
                title="Department Portal"
                subtitle="Manage department inventory requests"
              />
            </PublicRoute>
          }
        />

        {/* =========================
            PROTECTED APPLICATION
        ========================== */}

        <Route element={<ProtectedRoutes />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Inventory */}
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/categories" element={<Categories />} />

          {/* Stock */}
          <Route path="/stock/in" element={<StockIn />} />
          <Route path="/stock/out" element={<StockOut />} />
          <Route path="/stock/returns" element={<Returns />} />
          <Route
            path="/stock/adjustments"
            element={<Adjustments />}
          />

          {/* Procurement */}
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/suppliers" element={<Suppliers />} />

          {/* College */}
          <Route
            path="/departments"
            element={<Departments />}
          />

          <Route path="/requests" element={<Requests />} />

          {/* Analytics */}
          <Route path="/reports" element={<Reports />} />

          {/* Administration */}
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* =========================
            DEFAULT ROUTES
        ========================== */}

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