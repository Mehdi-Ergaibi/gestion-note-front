import { useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";

export const AutoLogout = () => {
  const { logout, isTokenExpired, loading } = useAuth();

  useEffect(() => {
    if (!loading && isTokenExpired) {
      logout();
    }
  }, [isTokenExpired, loading, logout]);

  useEffect(() => {
    if (loading || isTokenExpired) return;

    const interval = setInterval(() => {
      if (isTokenExpired) {
        logout();
        clearInterval(interval);
      }
    }, 60000); // chaque minute

    return () => clearInterval(interval);
  }, [isTokenExpired, loading, logout]);

  return null;
};
