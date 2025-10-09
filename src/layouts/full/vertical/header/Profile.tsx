// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, { useState } from 'react';
import { Box, Menu, Avatar, Typography, IconButton, Stack, Tooltip, Fab } from '@mui/material';
import { IconMail, IconPower } from '@tabler/icons-react';
import ProfileImg from 'src/assets/images/profile/user-1.jpg';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { useSession } from 'src/customs/contexts/SessionContext';
import { clear } from 'console';
const Profile = () => {
  const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleClick2 = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const { token, clearToken } = useSession();

  const handleLogout = useCallback(() => {
    // Bersihkan storage
    handleClose2();
    clearToken();
    // Redirect ke login page
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 200); //
  }, [navigate, clearToken]);

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="profile menu"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(Boolean(anchorEl2) && {
            color: 'primary.main',
          }),
        }}
        onClick={handleClick2}
      >
        <Avatar
          src={ProfileImg}
          alt="profile"
          sx={{
            width: 35,
            height: 35,
          }}
        />
      </IconButton>

      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            width: '360px',
            p: 1,
          },
        }}
      >
        <Stack direction="row" py={0.1} px={1} spacing={1.5} alignItems="center">
          <Avatar src={ProfileImg} alt="profile" sx={{ width: 50, height: 50 }} />

          <Box sx={{ flexGrow: 1 }}>
            <Typography
              sx={{ fontSize: '0.8rem' }}
              variant="subtitle2"
              color="textPrimary"
              fontWeight={500}
            >
              Mathew Anderson
            </Typography>
            <Typography sx={{ fontSize: '0.8rem' }} variant="subtitle2" color="textSecondary">
              Designer
            </Typography>
            <Typography
              sx={{ fontSize: '0.8rem' }}
              variant="subtitle2"
              color="textSecondary"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <IconMail width={15} height={15} />
              info@modernize.com
            </Typography>
          </Box>

          <Tooltip title="Log out">
            <Fab size="small" color="error" onClick={handleLogout}>
              <IconPower width={16} />
            </Fab>
          </Tooltip>
        </Stack>
      </Menu>
    </Box>
  );
};

export default Profile;
