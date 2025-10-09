import { Navigate, Outlet } from 'react-router';
import { useAuth } from './AuthProvider';

export const ProtectedRoute = ({ requireType }: { requireType: 'admin' | 'guest' }) => {
  const { isAuthenticated, authType, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // bisa ganti spinner

  // belum login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // sudah login tapi salah type
  if (authType !== requireType) {
    return <Navigate to={authType === 'admin' ? '/admin/dashboard' : '/guest/dashboard'} replace />;
  }

  return <Outlet />;
};
