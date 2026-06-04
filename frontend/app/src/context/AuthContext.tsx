"use client";
import { User } from "@/lib/api/services/auth.servise";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  isUserInitialized: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isUserInitialized, setIsUserInitialized] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsUserInitialized(true);
  }, []);

  // lestening to dispatch event which http.ts would send (for logout)
  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
      setIsUserInitialized(true);
    };

    window.addEventListener("auth:logout", handleAuthLogout);

    return () => {
      window.removeEventListener("auth:logout", handleAuthLogout);
    };
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("auth_user", JSON.stringify(userData));
    setIsUserInitialized(true);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    setIsUserInitialized(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isUserInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
