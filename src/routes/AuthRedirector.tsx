import { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from 'src/customs/contexts/AuthProvider';
import { useSession } from 'src/customs/contexts/SessionContext';
import { setClearTokenCallback } from 'src/customs/api/interceptor';
import { Backdrop, CircularProgress } from '@mui/material';
import { useProfile } from 'src/hooks/Profile/useProfile';

export default function AuthRedirector() {
  const { clearToken } = useSession();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const roleAccess = profile?.group_name;
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setClearTokenCallback(clearToken);
  }, [clearToken]);

  // useEffect(() => {
  //   if (authLoading) return;

  //   if (isAuthenticated ) {
  //     // const upperGroup = groupId.toUpperCase();
  //     let redirectPath = '/';

  //     if (roleAccess === 'Admin') redirectPath = '/admin/dashboard';
  //     else if (roleAccess === 'Manager') redirectPath = '/manager/dashboard';
  //     else if (roleAccess === 'Employee') redirectPath = '/employee/dashboard';
  //     else if (roleAccess === 'OperatorVMS') redirectPath = '/operator/view';
  //     else if (roleAccess === 'OperatorAdmin') redirectPath = '/operator-admin/dashboard';
  //     else if (roleAccess === 'Visitor') redirectPath = '/guest/dashboard';

  //     if (
  //       location.pathname === '/auth/login' ||
  //       location.pathname === '/auth/register' ||
  //       location.pathname === '/auth/forgot-password'
  //     ) {
  //       navigate(redirectPath, { replace: true });
  //     } else if (location.pathname === '/') {
  //       navigate(redirectPath, { replace: true });
  //     }
  //   } else if (!authLoading && !isAuthenticated) {
  //     if (location.pathname === '/auth/login' || location.pathname === '/') {
  //       navigate('/auth/login', { replace: true });
  //     }
  //   }
  // }, [authLoading, isAuthenticated, location.pathname, navigate, roleAccess]);

  useEffect(() => {
    if (authLoading) return;

    // Tunggu profile selesai
    if (isAuthenticated && (isLoading || !profile)) return;

    if (isAuthenticated) {
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
      }

      if (
        location.pathname === '/auth/login' ||
        location.pathname === '/auth/register' ||
        location.pathname === '/auth/forgot-password' ||
        location.pathname === '/'
      ) {
        navigate(redirectPath, { replace: true });
      }
    } else {
      if (
        location.pathname === '/' ||
        location.pathname === '/auth/login'
      ) {
        navigate('/auth/login', { replace: true });
      }
    }
  }, [
    authLoading,
    isAuthenticated,
    isLoading,
    profile,
    roleAccess,
    location.pathname,
    navigate,
  ]);


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
        <CircularProgress  />
      </div>
    );
  }

  return <Outlet />;
}
