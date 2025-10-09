import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { refreshToken } from '../api/users';
import { useSession } from './SessionContext';

type JwtPayload = { exp: number; [key: string]: any; email: string; username: string };

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  authType: 'admin' | 'guest' | null;
  user: JwtPayload | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.exp ? decoded.exp > Date.now() / 1000 : false;
  } catch {
    return false;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { token, authType, saveToken, clearToken } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<JwtPayload | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (isTokenValid(token)) {
        setIsAuthenticated(true);
      } else if (token) {
        try {
          const res = await refreshToken({ token });
          // default ke "admin", tapi bisa kamu adjust sesuai kebutuhan
          saveToken(res.collection.token, authType ?? 'admin');
          setIsAuthenticated(true);
        } catch {
          clearToken();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, authType, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
