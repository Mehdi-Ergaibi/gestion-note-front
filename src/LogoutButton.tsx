import { useAuth } from "./contexts/AuthContext";

export const LogoutButton = () => {
  const { logout } = useAuth();

  return (
    <button onClick={logout} className="text-red-500 hover:text-red-700">
      Logout
    </button>
  );
};