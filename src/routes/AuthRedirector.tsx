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

import { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

import { useAuth } from 'src/customs/contexts/AuthProvider';
import { CircularProgress } from '@mui/material';

export default function AuthRedirector() {
  const { loading: authLoading, isAuthenticated, user } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const roleAccess = user?.group_name;

  useEffect(() => {
    if (authLoading) {
      return;
    }

    // Belum login
    if (!isAuthenticated) {
      if (location.pathname === '/' || location.pathname === '/auth/login') {
        navigate('/auth/login', {
          replace: true,
        });
      }

      return;
    }

    // Sudah login
    let redirectPath = '/';

    switch (roleAccess) {
      case 'Admin':
        redirectPath = '/admin/dashboard';
        break;

      case 'Manager':
        redirectPath = '/manager/dashboard';
        break;

      case 'Employee':
        redirectPath = '/employee/dashboard';
        break;

      case 'OperatorVMS':
        redirectPath = '/operator/view';
        break;

      case 'OperatorAdmin':
        redirectPath = '/operator-admin/dashboard';
        break;

      case 'Visitor':
        redirectPath = '/guest/dashboard';
        break;

      default:
        redirectPath = '/';
        break;
    }

    // Kalau user sudah login tetapi masih berada di halaman auth
    if (
      location.pathname === '/' ||
      location.pathname === '/auth/login' ||
      location.pathname === '/auth/register' ||
      location.pathname === '/auth/forgot-password'
    ) {
      navigate(redirectPath, {
        replace: true,
      });
    }
  }, [authLoading, isAuthenticated, user, roleAccess, location.pathname, navigate]);

  if (authLoading) {
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
