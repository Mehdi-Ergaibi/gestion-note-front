import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { jwtDecode } from "jwt-decode";

interface User {
  email?: string;
}

interface JwtPayload {
  exp: number;
  sub?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (newToken: string) => void;
  logout: () => void;
  isTokenExpired: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isTokenExpired, setIsTokenExpired] = useState(true);
  const [loading, setLoading] = useState(true);

  const checkTokenExpiration = (tokenToCheck: string | null): boolean => {
    if (!tokenToCheck) return true;
    try {
      const decoded = jwtDecode<JwtPayload>(tokenToCheck);
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  };
  const login = (newToken: string) => {
    if (checkTokenExpiration(newToken)) {
      throw new Error("Received expired token");
    }

    localStorage.setItem("jwtToken", newToken);
    const decoded = jwtDecode<JwtPayload>(newToken);
    setToken(newToken);
    setUser({ email: decoded.sub || "" });
    setIsTokenExpired(false);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("jwtToken");
    setToken(null);
    setUser(null);
    setIsTokenExpired(true);
    setLoading(false);
  };
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem("jwtToken");
      
      if (storedToken && !checkTokenExpiration(storedToken)) {
        try {
          const decoded = jwtDecode<JwtPayload>(storedToken);
          setToken(storedToken);
          setUser({ email: decoded.sub || "" });
          setIsTokenExpired(false);
        } catch (error) {
          console.error("Token decoding failed:", error);
          logout();
        }
      }
      setLoading(false);
    };
  
    initializeAuth()
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isTokenExpired,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
