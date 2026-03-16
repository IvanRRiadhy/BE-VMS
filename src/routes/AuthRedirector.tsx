import { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from 'src/customs/contexts/AuthProvider';
import { GroupRoleId } from 'src/constant/GroupRoleId';
import { useSession } from 'src/customs/contexts/SessionContext';
import { setClearTokenCallback } from 'src/customs/api/interceptor';
import { Backdrop, CircularProgress } from '@mui/material';

export default function AuthRedirector() {
  const { clearToken, roleAccess } = useSession();
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
      let redirectPath = '/';

      // if (upperGroup === GroupRoleId.Admin) redirectPath = '/admin/dashboard';
      // else if (upperGroup === GroupRoleId.Manager) redirectPath = '/manager/dashboard';
      // else if (upperGroup === GroupRoleId.Employee) redirectPath = '/employee/dashboard';
      // else if (upperGroup === GroupRoleId.OperatorVMS) redirectPath = '/operator/view';
      // else if (upperGroup === GroupRoleId.OperatorAdmin) redirectPath = '/operator-admin/dashboard';
      // else if (upperGroup === GroupRoleId.Visitor) redirectPath = '/guest/dashboard';
      if (roleAccess === 'Admin') redirectPath = '/admin/dashboard';
      else if (roleAccess === 'Manager') redirectPath = '/manager/dashboard';
      else if (roleAccess === 'Employee') redirectPath = '/employee/dashboard';
      else if (roleAccess === 'OperatorVMS') redirectPath = '/operator/view';
      else if (roleAccess === 'OperatorAdmin') redirectPath = '/operator-admin/dashboard';
      else if (roleAccess === 'Visitor') redirectPath = '/guest/dashboard';

      if (
        location.pathname === '/auth/login' ||
        location.pathname === '/auth/register' ||
        location.pathname === '/auth/forgot-password'
      ) {
        navigate(redirectPath, { replace: true });
      } else if (location.pathname === '/') {
        navigate(redirectPath, { replace: true });
      }
      // } else if (!authLoading && !isAuthenticated) {
      //   if (!location.pathname.startsWith('/auth')) {
      //     navigate('/auth/login', { replace: true });
      //   }
      // }
    } else if (!authLoading && !isAuthenticated) {
      if (location.pathname === '/auth/login' || location.pathname === '/') {
        navigate('/auth/login', { replace: true });
      }
    }
  }, [authLoading, isAuthenticated, groupId, location.pathname, navigate, roleAccess]);

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
