// import { createContext, useContext, useEffect, useState } from 'react';
// import { jwtDecode } from 'jwt-decode';
// import { refreshToken } from '../api/users';
// import { useSession } from './SessionContext';

// type JwtPayload = { exp: number;[key: string]: any; email: string; username: string };

// interface AuthContextType {
//   isAuthenticated: boolean;
//   loading: boolean;
//   user: JwtPayload | null;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const isTokenValid = (token: string | null): boolean => {
//   if (!token) return false;
//   try {
//     const decoded = jwtDecode<JwtPayload>(token);
//     return decoded.exp ? decoded.exp > Date.now() / 1000 : false;
//   } catch {
//     return false;
//   }
// };

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const { token, saveToken, clearToken } = useSession();
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState<JwtPayload | null>(null);

//   useEffect(() => {
//     const checkAuth = async () => {
//       if (isTokenValid(token)) {
//         const decoded = jwtDecode<JwtPayload>(token!);
//         setUser(decoded);
//         setIsAuthenticated(true);
//       } else if (token) {
//         try {
//           const res = await refreshToken({ token });
//           saveToken(res.collection.token);
//           const newDecoded = jwtDecode<JwtPayload>(res.collection.token);
//           setUser(newDecoded);
//           setIsAuthenticated(true);
//         } catch {
//           clearToken();
//           setIsAuthenticated(false);
//         }
//       } else {
//         setIsAuthenticated(false);
//       }
//       setLoading(false);
//     };
//     checkAuth();
//   }, [token]);

//   return (
//     <AuthContext.Provider value={{ isAuthenticated, loading, user }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error('useAuth must be used within AuthProvider');
//   return ctx;
// };

// import { createContext, useContext, useEffect, useState } from 'react';
// import { getProfile } from '../api/users';
// import { useProfile } from 'src/hooks/Profile/useProfile';

// interface AuthUser {
//   user_id: string;
//   organization_name: string;
//   department_name: string;
//   district_name: string;
//   group_name: string;
//   email: string;
//   username: string;
//   fullname: string;
//   gender: string;
//   address: string;
//   phone: string;
//   is_vip: boolean;
//   is_email_verified: boolean;
// }

// interface AuthContextType {
//   isAuthenticated: boolean;
//   loading: boolean;
//   user: AuthUser | null;
//   setAuthenticated: (user: AuthUser) => void;
//   logout: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [user, setUser] = useState<AuthUser | null>(null);

//   const setAuthenticated = (user: AuthUser) => {
//     setUser(user);
//     setIsAuthenticated(true);
//   };

//   const { data: profile, isLoading: profileLoading, isError: profileError } = useProfile(true);

//   const logout = () => {
//     setUser(null);
//     setIsAuthenticated(false);
//   };

//   useEffect(() => {
//     if (profileLoading) {
//       setLoading(true);
//       return;
//     }

//     if (profile) {
//       setAuthenticated(profile);
//     } else if (profileError) {
//       logout();
//     }

//     setLoading(false);
//   }, [profile, profileLoading, profileError]);

//   return (
//     <AuthContext.Provider
//       value={{
//         isAuthenticated,
//         loading,
//         user,
//         setAuthenticated,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);

//   if (!ctx) {
//     throw new Error('useAuth must be used within AuthProvider');
//   }

//   return ctx;
// };

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getProfile } from '../api/users';



interface AuthUser {
  user_id: string;
  organization_name: string;
  department_name: string;
  district_name: string;
  group_name: string;
  email: string;
  username: string;
  fullname: string;
  gender: string;
  address: string;
  phone: string;
  is_vip: boolean;
  is_email_verified: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: AuthUser | null;
  setAuthenticated: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  /**
   * Restore authentication from HttpOnly cookie
   */
  const initializeAuth = useCallback(async () => {
    try {
      const profile = await getProfile();

      if (profile?.collection) {
        setUser(profile.collection);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const setAuthenticated = useCallback((user: AuthUser) => {
    setUser(user);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        user,
        setAuthenticated,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
};
