// import { useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from 'src/customs/contexts/AuthProvider';
// import { GroupRoleId } from 'src/constant/GroupRoleId';
// import { Backdrop, CircularProgress } from '@mui/material';
// import { useSession } from 'src/customs/contexts/SessionContext';
// import { setClearTokenCallback } from 'src/customs/api/interceptor';

// export default function AuthRedirector() {
//   const { clearToken } = useSession();
//   const { loading: authLoading, isAuthenticated, groupId } = useAuth();
//   const location = useLocation();

//   useEffect(() => {
//     setClearTokenCallback(clearToken);
//   }, [clearToken]);

//   const isAuthReady = !authLoading && isAuthenticated && !!groupId;

//     useEffect(() => {
//       if (isAuthReady) {
//         const redirectPath =
//           groupId?.toUpperCase() === GroupRoleId.Admin
//             ? '/admin/dashboard'
//             : groupId?.toUpperCase() === GroupRoleId.Manager
//             ? '/manager/dashboard'
//             : groupId?.toUpperCase() === GroupRoleId.Employee
//             ? '/employee/dashboard'
//             : groupId?.toUpperCase() === GroupRoleId.OperatorVMS
//             ? '/operator/dashboard'
//             : '/guest/dashboard';

//         if (location.pathname === '/' || location.pathname === '/*') {
//           window.location.replace(redirectPath);
//         }
//       }
//     }, [isAuthReady, groupId, location.pathname]);

//   return null;
// }

import { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from 'src/customs/contexts/AuthProvider';
import { GroupRoleId } from 'src/constant/GroupRoleId';
import { useSession } from 'src/customs/contexts/SessionContext';
import { setClearTokenCallback } from 'src/customs/api/interceptor';
import { Backdrop, CircularProgress } from '@mui/material';

export default function AuthRedirector() {
  const { clearToken } = useSession();
  const { loading: authLoading, isAuthenticated, groupId } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // set callback untuk interceptor global
  useEffect(() => {
    setClearTokenCallback(clearToken);
  }, [clearToken]);

  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated && groupId) {
      const upperGroup = groupId.toUpperCase();
      let redirectPath = '/guest/dashboard';

      if (upperGroup === GroupRoleId.Admin) redirectPath = '/admin/dashboard';
      else if (upperGroup === GroupRoleId.Manager) redirectPath = '/manager/dashboard';
      else if (upperGroup === GroupRoleId.Employee) redirectPath = '/employee/dashboard';
      else if (upperGroup === GroupRoleId.OperatorVMS) redirectPath = '/operator/view';
      // hanya redirect dari root
      if (
        location.pathname === '/auth/login' ||
        location.pathname === '/auth/register' ||
        location.pathname === '/auth/forgot-password'
      ) {
        navigate(redirectPath, { replace: true });
      } else if (location.pathname === '/') {
        navigate(redirectPath, { replace: true });
      }
    } else if (!authLoading && !isAuthenticated) {
      if (location.pathname === '/auth/login' || location.pathname === '/') {
        navigate('/auth/login', { replace: true });
      }
    }
  }, [authLoading, isAuthenticated, groupId, location.pathname, navigate]);

  // if (authLoading) {
  //   return (
  //     <Backdrop open sx={{ color: '#1976d2', zIndex: 9999, bgcolor: 'rgba(255,255,255,0.8)' }}>
  //       <CircularProgress color="primary" thickness={4} />
  //     </Backdrop>
  //   );
  // }

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
        <CircularProgress />
      </div>
    );
  }

  return <Outlet />;
}
