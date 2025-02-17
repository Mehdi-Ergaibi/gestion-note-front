import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "./Admin/AdminDashboard";
import { AutoLogout } from "./AutoLogOut";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginForm } from "./LoginForm";
import { useEffect } from "react";
import { setAuthInstance } from "./api";

const AuthInitializer = () => {
  const auth = useAuth();

  useEffect(() => {
    const storedToken = localStorage.getItem("jwtToken");

    if (storedToken && !auth.token) {
      setAuthInstance(auth);
    }
  }, [auth.token]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <AuthInitializer />
      <AutoLogout />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
