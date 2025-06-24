// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { refreshToken } from '../api/users';
import { useSession } from './SessionContext';
import { useLocation } from 'react-router';

type JwtPayload = {
  exp: number;
  [key: string]: any;
};

const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    if (!decoded.exp) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    const isValid = decoded.exp > now;

    console.log('Token expire time (UTC):', new Date(decoded.exp * 1000).toUTCString());
    console.log('Current time (UTC):', new Date(now * 1000).toUTCString());

    return isValid;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return false;
  }
};

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { token, saveToken, clearToken } = useSession();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      if (isTokenValid(token)) {
        setIsAuthenticated(true);
      } else if (token) {
        try {
          const refreshResponse = await refreshToken({ token });
          saveToken(refreshResponse.collection.token);
          setIsAuthenticated(true);
        } catch (error) {
          clearToken();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };
    checkAuth();
  }, [token, location.pathname]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
