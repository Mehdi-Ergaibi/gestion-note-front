import { useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";
import { Outlet, useNavigate } from "react-router-dom";

export const ProtectedRoute = () => {
  const { user, isTokenExpired, loading } = useAuth();
  const navigate = useNavigate();
  


  useEffect(() => {
    if (loading) return;
  
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("jwtToken");
      
      if (!storedToken || isTokenExpired) {
        navigate("/login");
      } else if (user && !isTokenExpired) {
        navigate("/");
      }
    };
  
    checkAuth();
  }, [user, navigate, isTokenExpired, loading]);
  

  if (loading) {
    return <p>Loading...</p>; 
  }

  return <Outlet />;
};
