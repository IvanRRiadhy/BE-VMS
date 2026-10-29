// import { useEffect } from 'react';
// import { useNavigate, useLocation, Outlet } from 'react-router-dom';
// import { useAuth } from 'src/customs/contexts/AuthProvider';
// import { useSession } from 'src/customs/contexts/SessionContext';
// import { setClearTokenCallback } from 'src/customs/api/interceptor';
// import { Backdrop, CircularProgress } from '@mui/material';
// import { useProfile } from 'src/hooks/Profile/useProfile';

// export default function AuthRedirector() {
//   const { clearToken } = useSession();
//   const { loading: authLoading, isAuthenticated } = useAuth();
//   const { data: profile, isLoading } = useProfile(isAuthenticated);
//   const roleAccess = profile?.group_name;
//   const location = useLocation();
//   const navigate = useNavigate();

//   useEffect(() => {
//     setClearTokenCallback(clearToken);
//   }, [clearToken]);

//   useEffect(() => {
//     if (authLoading) return;

//     // Tunggu profile selesai
//     if (isAuthenticated && (isLoading || !profile)) return;

//     if (isAuthenticated) {
//       let redirectPath = '/';

//       switch (roleAccess) {
//         case 'Admin':
//           redirectPath = '/admin/dashboard';
//           break;
//         case 'Manager':
//           redirectPath = '/manager/dashboard';
//           break;
//         case 'Employee':
//           redirectPath = '/employee/dashboard';
//           break;
//         case 'OperatorVMS':
//           redirectPath = '/operator/view';
//           break;
//         case 'OperatorAdmin':
//           redirectPath = '/operator-admin/dashboard';
//           break;
//         case 'Visitor':
//           redirectPath = '/guest/dashboard';
//           break;
//       }

//       if (
//         location.pathname === '/auth/login' ||
//         location.pathname === '/auth/register' ||
//         location.pathname === '/auth/forgot-password' ||
//         location.pathname === '/'
//       ) {
//         navigate(redirectPath, { replace: true });
//       }
//     } else {
//       if (location.pathname === '/' || location.pathname === '/auth/login') {
//         navigate('/auth/login', { replace: true });
//       }
//     }
//   }, [authLoading, isAuthenticated, isLoading, profile, roleAccess, location.pathname, navigate]);

//   if (authLoading) {
//     return (
//       <div
//         style={{
//           display: 'flex',
//           height: '100vh',
//           justifyContent: 'center',
//           alignItems: 'center',
//         }}
//       >
//         <CircularProgress />
//       </div>
//     );
//   }

//   return <Outlet />;
// }

// import { useEffect } from 'react';
// import { useNavigate, useLocation, Outlet } from 'react-router-dom';

// import { useAuth } from 'src/customs/contexts/AuthProvider';
// import { CircularProgress } from '@mui/material';

// export default function AuthRedirector() {
//   const { loading: authLoading, isAuthenticated, user } = useAuth();

//   const location = useLocation();
//   const navigate = useNavigate();

//   const roleAccess = user?.group_name;

//   useEffect(() => {
//     if (authLoading) {
//       return;
//     }

//     // Belum login
//     if (!isAuthenticated) {
//       if (location.pathname === '/' || location.pathname === '/auth/login') {
//         navigate('/auth/login', {
//           replace: true,
//         });
//       }

//       return;
//     }

//     // Sudah login
//     let redirectPath = '/';

//     switch (roleAccess) {
//       case 'Admin':
//         redirectPath = '/admin/dashboard';
//         break;

//       case 'Manager':
//         redirectPath = '/manager/dashboard';
//         break;

//       case 'Employee':
//         redirectPath = '/employee/dashboard';
//         break;

//       case 'OperatorVMS':
//         redirectPath = '/operator/view';
//         break;

//       case 'OperatorAdmin':
//         redirectPath = '/operator-admin/dashboard';
//         break;

//       case 'SecurityMonitor':
//         redirectPath = '/security-monitor/dashboard';
//         break;

//       case 'Visitor':
//         redirectPath = '/guest/dashboard';
//         break;

//       default:
//         redirectPath = '/';
//         break;
//     }

//     // Kalau user sudah login tetapi masih berada di halaman auth
//     if (
//       location.pathname === '/' ||
//       location.pathname === '/auth/login' ||
//       location.pathname === '/auth/register' ||
//       location.pathname === '/auth/forgot-password'
//     ) {
//       navigate(redirectPath, {
//         replace: true,
//       });
//     }
//   }, [authLoading, isAuthenticated, user, roleAccess, location.pathname, navigate]);

//   if (authLoading) {
//     return (
//       <div
//         style={{
//           display: 'flex',
//           height: '100vh',
//           justifyContent: 'center',
//           alignItems: 'center',
//         }}
//       >
//         <CircularProgress color="primary" size={40} thickness={4} />
//       </div>
//     );
//   }

//   return <Outlet />;
// }

import { useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';

import { useAuth } from 'src/customs/contexts/AuthProvider';
import { CircularProgress } from '@mui/material';

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
      return '/admin/dashboard';
    case 'SecurityMonitor':
      return '/security-monitor/dashboard';
    case 'Visitor':
      return '/guest/dashboard';
    default:
      return null;
  }
};

export default function AuthRedirector() {
  const { loading, isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    const publicPaths = ['/', '/auth/login', '/auth/register', '/auth/forgot-password'];

    const isPublicPath = publicPaths.includes(location.pathname);

    if (!isAuthenticated) {
      if (location.pathname === '/') {
        navigate('/auth/login', { replace: true });
      }
      return;
    }

    if (isAuthenticated && isPublicPath) {
      const dashboardPath = getDashboardPath(user?.group_name);

      if (dashboardPath) {
        navigate(dashboardPath, { replace: true });
      }
    }
  }, [loading, isAuthenticated, user?.group_name, location.pathname, navigate]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress color="primary" size={40} thickness={4} />
      </div>
    );
  }

  return <Outlet />;
}
