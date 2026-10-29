import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from 'src/store/Store';
import { clearUser, setUser as setReduxUser } from 'src/store/apps/user/userSlice';
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
  setAuthenticated: (user: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const persistedUser = useSelector((state: AppState) => state.userReducer?.data);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(persistedUser));
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(() => persistedUser || null);

  /**
   * Restore/verifikasi authentication dari backend
   */
  const initializeAuth = useCallback(async () => {
    try {
      const profile: any = await getProfile();

      if (profile?.collection) {
        setUser(profile.collection);
        setIsAuthenticated(true);
        dispatch(setReduxUser(profile.collection));
      } else {
        setUser(null);
        setIsAuthenticated(false);
        dispatch(clearUser());
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      dispatch(clearUser());
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    const currentPath = window.location.pathname;

    // Jika di Redux sudah ada user yang tersimpan (persisted)
    if (persistedUser) {
      setUser(persistedUser);
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }

    // Jika di halaman login dan memang tidak ada data user di Redux, jangan panggil getProfile
    if (currentPath === '/auth/login') {
      setLoading(false);
      return;
    }

    // Jika di halaman protected tapi Redux kosong, coba restore via cookie
    initializeAuth();
  }, [persistedUser, initializeAuth]);

  const setAuthenticated = useCallback(
    (userData: AuthUser) => {
      setUser(userData);
      setIsAuthenticated(true);
      dispatch(setReduxUser(userData));
    },
    [dispatch],
  );

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    dispatch(clearUser());
  }, [dispatch]);

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
