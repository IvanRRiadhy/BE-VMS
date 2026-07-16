import { Navigate, Outlet } from 'react-router';
import { useAuth } from './AuthProvider';
import { useSession } from './SessionContext';
import { CircularProgress } from '@mui/material';
import { useProfile } from 'src/hooks/Profile/useProfile';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();

  const {
    data: profile,
    isLoading: profileLoading,
  } = useProfile();

  if (loading || profileLoading)
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
        <CircularProgress color="primary" size={60} />
      </div>
    );

  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedRole = profile?.group_name.toUpperCase();
    const allowedNormalized = allowedRoles.map((r) => r.toUpperCase());

    const isAllowed = normalizedRole ? allowedNormalized.includes(normalizedRole) : false;

    if (!isAllowed) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};
