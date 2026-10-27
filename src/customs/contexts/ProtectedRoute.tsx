import { Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Box, CircularProgress } from '@mui/material';
import { useProfile } from 'src/hooks/Profile/useProfile';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { loading: authLoading, setAuthenticated, logout } = useAuth();

  const { data: profile, isLoading: profileLoading, isError: profileError } = useProfile(true);

  useEffect(() => {
    if (profile) {
      setAuthenticated(profile);
    }

    if (profileError) {
      logout();
    }
  }, [profile, profileError, setAuthenticated, logout]);

  const loading = authLoading || profileLoading;

  if (loading) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.7)',
          zIndex: 9999,
        }}
      >
        <CircularProgress color="primary" size={40} thickness={4} />
      </div>
    );
  }

  // Tidak punya session
  if (profileError || !profile) {
    return <Navigate to="/auth/login" replace />;
  }

  // Profile berhasil ditemukan
  const currentUser = profile;

  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedRole = currentUser.group_name?.toUpperCase();

    const allowedNormalized = allowedRoles.map((role) => role.toUpperCase());

    const isAllowed = normalizedRole ? allowedNormalized.includes(normalizedRole) : false;

    if (!isAllowed) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};

const getDashboardPath = (groupName?: string) => {
  switch (groupName) {
    case 'Admin':
      return '/admin/dashboard';

    case 'Manager':
      return '/manager/dashboard';

    case 'Employee':
      return '/employee/dashboard';

    case 'OperatorVMS':
      return '/operator/view';

    case 'OperatorAdmin':
      return '/operator-admin/dashboard';

    case 'SecurityMonitor':
      return '/security-monitor/dashboard';

    case 'Visitor':
      return '/guest/dashboard';

    default:
      return '/';
  }
};

export const PublicOnlyRoute = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Sudah login → jangan boleh masuk halaman login
  if (isAuthenticated) {
    return <Navigate to={getDashboardPath(user?.group_name)} replace />;
  }

  // Belum login → tampilkan halaman login
  return <Outlet />;
};
