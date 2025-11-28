// import { Navigate, Outlet } from 'react-router';
// import { useAuth } from './AuthProvider';

// export const ProtectedRoute = ({ requireType }: { requireType: 'admin' | 'guest' }) => {
//   const { isAuthenticated, authType, loading } = useAuth();

//   if (loading) return <div>Loading...</div>; // bisa ganti spinner

//   // belum login
//   if (!isAuthenticated) {
//     return <Navigate to="/" replace />;
//   }

//   // sudah login tapi salah type
//   if (authType !== requireType) {
//     return <Navigate to={authType === 'admin' ? '/admin/dashboard' : '/guest/dashboard'} replace />;
//   }

//   return <Outlet />;
// };

// src/customs/contexts/ProtectedRoute.tsx
// import { Navigate, Outlet } from 'react-router';
// import { useAuth } from './AuthProvider';
// import { useSession } from './SessionContext';

// interface ProtectedRouteProps {
//   requireType?: 'admin' | 'guest';
//   allowedGroups?: string[];
// }

// export const ProtectedRoute = ({ requireType, allowedGroups }: ProtectedRouteProps) => {
//   const { isAuthenticated, authType, loading } = useAuth();
//   const { groupId } = useSession();

//   if (loading) return <div>Loading...</div>;

//   // belum login
//   if (!isAuthenticated) return <Navigate to="/" replace />;

//   // kalau ada requireType, cek authType dulu
//   // if (requireType && authType !== requireType) {
//   //   return <Navigate to={authType === 'admin' ? '/admin/dashboard' : '/guest/dashboard'} replace />;
//   // }

//   // kalau ada allowedGroups, cek group_id
//   if (allowedGroups && allowedGroups.length > 0) {
//     const normalizedGroup = groupId?.toLowerCase() ?? '';
//     const allowedNormalized = allowedGroups.map((g) => g.toLowerCase());
//     if (!allowedNormalized.includes(normalizedGroup)) {
//       console.warn('🚫 Unauthorized group', { normalizedGroup, allowedNormalized });
//       return <Navigate to="/unauthorized" replace />;
//     }
//   }

//   return <Outlet />;
// };

import { Navigate, Outlet } from 'react-router';
import { useAuth } from './AuthProvider';
import { useSession } from './SessionContext';
import { CircularProgress } from '@mui/material';
import image from 'src/assets/images/logos/BI_Logo.png';
import { width } from '@mui/system';

interface ProtectedRouteProps {
  allowedGroups?: string[];
}

export const ProtectedRoute = ({ allowedGroups }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  const { groupId } = useSession();

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

  // 🔒 Belum login
  if (!isAuthenticated) return <Navigate to="/" replace />;
  

  // ✅ Cek grup jika diset
  if (allowedGroups && allowedGroups.length > 0) {
    const normalizedGroup = groupId?.toUpperCase();
    const allowedNormalized = allowedGroups.map((g) => g.toUpperCase());
    const isAllowed = normalizedGroup && allowedNormalized.includes(normalizedGroup);

    if (!isAllowed) {
      // console.warn('🚫 Unauthorized group', { normalizedGroup, allowedNormalized });
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};
