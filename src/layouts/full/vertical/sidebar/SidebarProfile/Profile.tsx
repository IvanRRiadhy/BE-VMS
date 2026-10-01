import { Box, Avatar, Typography, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { useSelector } from 'src/store/Store';
import img1 from 'src/assets/images/profile/user-1.jpg';
import { IconPower } from '@tabler/icons-react';
import { AppState } from 'src/store/Store';
import { useNavigate } from 'react-router-dom'; // gunakan useNavigate
import { useCallback } from 'react';
import { useAuth } from 'src/customs/contexts/AuthProvider';
import { revokeToken } from 'src/customs/api/users';

export const Profile = () => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  const hideMenu = lgUp ? customizer.isCollapse && !customizer.isSidebarHover : '';
  const navigate = useNavigate();

  const { logout } = useAuth();
  // Fungsi logout
  const handleLogout = useCallback(async () => {
    try {
      // Backend hapus HttpOnly cookies
      await revokeToken();
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      // Clear state authentication React
      logout();

      // Clear data lokal kalau memang ada
      localStorage.clear();
      sessionStorage.clear();

      sessionStorage.setItem('logoutMsg', 'You have been logged out successfully.');

      navigate('/auth/login', { replace: true });
    }
  }, [navigate, logout]);
  return (
    <Box
      display={'flex'}
      alignItems="center"
      gap={2}
      sx={{ m: 3, p: 2, bgcolor: `secondary.light` }}
    >
      {!hideMenu ? (
        <>
          <Avatar alt="Remy Sharp" src={img1} />
          <Box>
            <Typography variant="h6">Mathew</Typography>
            <Typography variant="caption">Super Admin</Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Tooltip title="Logout" placement="top">
              <IconButton
                color="primary"
                onClick={handleLogout} // Gunakan handler logout
                aria-label="logout"
                size="small"
              >
                <IconPower size="20" />
              </IconButton>
            </Tooltip>
          </Box>
        </>
      ) : null}
    </Box>
  );
};
