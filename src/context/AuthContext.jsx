import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  // ================= LOAD USER ON APP START =================

  useEffect(() => {
    const storedUser = localStorage.getItem("auth");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // ================= LOGIN =================

  const login = (userData) => {

    // Example userData:
    // { username: "admin", role: "admin" }

    setUser(userData);
    localStorage.setItem("auth", JSON.stringify(userData));
  };

  // ================= LOGOUT =================

  const logout = () => {

    setUser(null);
    localStorage.removeItem("auth");
  };

  // ================= HELPERS =================

  const isAuthenticated = !!user;

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ================= CUSTOM HOOK =================

export const useAuth = () => {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
