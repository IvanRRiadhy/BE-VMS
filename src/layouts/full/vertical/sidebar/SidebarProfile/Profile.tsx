import { Box, Avatar, Typography, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { useSelector } from 'src/store/Store';
import img1 from 'src/assets/images/profile/user-1.jpg';
import { IconPower } from '@tabler/icons-react';
import { AppState } from 'src/store/Store';
import { useNavigate } from 'react-router-dom'; // gunakan useNavigate
import { useCallback } from 'react';

export const Profile = () => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  const hideMenu = lgUp ? customizer.isCollapse && !customizer.isSidebarHover : '';
  const navigate = useNavigate();

  // Fungsi logout
  const handleLogout = useCallback(() => {
    // Hapus data session/token dari localStorage
    // localStorage.removeItem('session'); // ganti sesuai key token/session kamu
    // localStorage.removeItem('user'); // jika ada data user disimpan
    // // Redirect ke halaman login
    // navigate('/');
    console.log('Logout');
  }, [navigate]);

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
