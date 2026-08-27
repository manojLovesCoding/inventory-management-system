import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "inventory_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore logged-in user once when the application starts
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY);

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        if (parsedUser && parsedUser.id && parsedUser.role) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to restore user session:", error);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password, role) => {
    // Frontend-only demo authentication
    await new Promise((resolve) => setTimeout(resolve, 500));

    const roleDetails = {
      ADMIN: {
        name: "Inventory Administrator",
        label: "Administrator",
      },
      STORE: {
        name: "Store Manager",
        label: "Store Manager",
      },
      DEPARTMENT: {
        name: "Department User",
        label: "Department User",
      },
    };

    const selectedRole = roleDetails[role] || roleDetails.ADMIN;

    const userData = {
      id: `demo-${role.toLowerCase()}-001`,
      name: selectedRole.name,
      email,
      role,
      roleLabel: selectedRole.label,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));

    setUser(userData);

    return userData;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: Boolean(user),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}