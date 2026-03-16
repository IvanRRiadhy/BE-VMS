import { Navigate, Outlet } from 'react-router';
import { useAuth } from './AuthProvider';
import { useSession } from './SessionContext';
import { CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  const { groupId } = useSession();
  const { roleAccess } = useSession();

  if (loading)
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

  // ✅ Cek grup jika diset
  // if (allowedGroups && allowedGroups.length > 0) {
  //   const normalizedGroup = groupId?.toUpperCase();
  //   const allowedNormalized = allowedGroups.map((g) => g.toUpperCase());
  //   const isAllowed = normalizedGroup && allowedNormalized.includes(normalizedGroup);

  //   if (!isAllowed) {
  //     return <Navigate to="/unauthorized" replace />;
  //   }
  // }

  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedRole = roleAccess;
    //  const allowedNormalized = allowedRoles.map((r) => r.toUpperCase());

    if (!normalizedRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};
