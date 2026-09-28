// import { Navigate, Outlet } from 'react-router';
// import { useAuth } from './AuthProvider';
// import { useSession } from './SessionContext';
// import { CircularProgress } from '@mui/material';
// import { useProfile } from 'src/hooks/Profile/useProfile';

// interface ProtectedRouteProps {
//   allowedRoles?: string[];
// }

// export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
//   const { isAuthenticated, loading } = useAuth();
//   const {
//     data: profile,
//     isLoading: profileLoading,
//   } = useProfile();

//   if (loading || profileLoading)
//     return (
//       <div
//         style={{
//           position: 'fixed',
//           inset: 0,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           backgroundColor: 'rgba(255,255,255,0.7)',
//           zIndex: 9999,
//         }}
//       >
//         <CircularProgress color="primary"/>
//       </div>
//     );

//   if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

//   if (allowedRoles && allowedRoles.length > 0) {
//     const normalizedRole = profile?.group_name.toUpperCase();
//     const allowedNormalized = allowedRoles.map((r) => r.toUpperCase());

//     const isAllowed = normalizedRole ? allowedNormalized.includes(normalizedRole) : false;

//     if (!isAllowed) {
//       return <Navigate to="/unauthorized" replace />;
//     }
//   }

//   return <Outlet />;
// };

// import { Navigate, Outlet } from 'react-router-dom';
// import { useAuth } from './AuthProvider';
// import { CircularProgress } from '@mui/material';

// interface ProtectedRouteProps {
//   allowedRoles?: string[];
// }

// export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
//   const { isAuthenticated, loading, user } = useAuth();

//   if (loading) {
//     return (
//       <div
//         style={{
//           position: 'fixed',
//           inset: 0,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           backgroundColor: 'rgba(255,255,255,0.7)',
//           zIndex: 9999,
//         }}
//       >
//         <CircularProgress color="primary" />
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/auth/login" replace />;
//   }

//   if (allowedRoles && allowedRoles.length > 0) {
//     const normalizedRole = user?.group_name?.toUpperCase();

//     const allowedNormalized = allowedRoles.map((role) => role.toUpperCase());

//     const isAllowed = normalizedRole ? allowedNormalized.includes(normalizedRole) : false;

//     if (!isAllowed) {
//       return <Navigate to="/unauthorized" replace />;
//     }
//   }

//   return <Outlet />;
// };

import { Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Box, CircularProgress } from '@mui/material';
import { useProfile } from 'src/hooks/Profile/useProfile';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, loading: authLoading, user, setAuthenticated, logout } = useAuth();

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
        <CircularProgress color="primary" />
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

    case 'Visitor':
      return '/guest/dashboard';

    default:
      return '/';
  }
};
export const PublicOnlyRoute = () => {
  const { setAuthenticated, logout } = useAuth();

  const { data: profile, isLoading: profileLoading, isError: profileError } = useProfile(true);

  useEffect(() => {
    if (profile) {
      setAuthenticated(profile);
    }

    if (profileError) {
      logout();
    }
  }, [profile, profileError, setAuthenticated, logout]);

  if (profileLoading) {
    return (
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.7)',
          zIndex: 9999,
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // Ada session → jangan izinkan masuk login
  if (profile) {
    return <Navigate to={getDashboardPath(profile.group_name)} replace />;
  }

  // Tidak ada session → boleh masuk login
  return <Outlet />;
};
