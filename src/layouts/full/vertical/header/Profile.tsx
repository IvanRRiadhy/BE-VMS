// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, { useEffect, useState } from 'react';
import {
  Box,
  Menu,
  Avatar,
  Typography,
  IconButton,
  Stack,
  Tooltip,
  Fab,
  Button,
} from '@mui/material';
import { IconMail, IconPower } from '@tabler/icons-react';
// import ProfileImg from 'src/assets/images/profile/user-1.jpg';
import { Link, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getProfile } from 'src/customs/api/users';
import { useDispatch } from 'react-redux';
import { clearUser } from 'src/store/apps/user/userSlice';
import { persistor } from 'src/store/Store';
import { GroupRoleId } from 'src/constant/GroupRoleId';

const Profile = () => {
  const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const [data, setData] = useState<any>({});

  const handleClick2 = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const dispatch = useDispatch();

  const { token, clearToken, groupId } = useSession();

  const handleLogout = useCallback(() => {
    handleClose2();
    clearToken();

    dispatch(clearUser());
    persistor.purge();
    localStorage.removeItem('persist:root');
    localStorage.clear();
    sessionStorage.clear();

    // 💾 Simpan pesan ke sessionStorage
    sessionStorage.setItem('logoutMsg', 'You have been logged out successfully.');

    // 🚪 Redirect ke halaman login
    navigate('/', { replace: true });
  }, [navigate, clearToken]);

  useEffect(() => {
    if (!token) return;

    const allowed =
      groupId === GroupRoleId.Visitor.toLowerCase() ||
      groupId === GroupRoleId.Employee.toLowerCase();

    if (!allowed) return;

    const fetchData = async () => {
      const res = await getProfile(token);
      setData(res?.collection || {});
    };

    fetchData();
  }, [token]);

  const profileUrl = getProfilePathByRole(data.group_name);

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
          src={''}
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
          <Avatar src={``} alt="profile" sx={{ width: 50, height: 50 }} />

          <Box sx={{ flexGrow: 1 }}>
            <Typography
              sx={{ fontSize: '0.8rem' }}
              variant="subtitle2"
              color="textPrimary"
              fontWeight={600}
            >
              {data.fullname || 'John Does'}
            </Typography>
            {/* <Typography sx={{ fontSize: '0.8rem' }} variant="subtitle2" color="textSecondary">
              Designer
            </Typography> */}
            <Typography
              sx={{ fontSize: '0.8rem' }}
              variant="subtitle2"
              color="textSecondary"
              display="flex"
              alignItems="center"
              gap={1}
            >
              {/* <IconMail width={15} height={15} /> */}
              {data.email || 'morV0@example.com'}
            </Typography>
            <Link to={profileUrl} onClick={handleClose2}>
              <Typography variant="body2" mt={0.5} color="primary">
                Edit Profile
              </Typography>
            </Link>
          </Box>

          <Tooltip title="Log out">
            <Fab size="small" color="error" onClick={handleLogout}>
              <IconPower width={18} />
            </Fab>
          </Tooltip>
        </Stack>
      </Menu>
    </Box>
  );
};

export default Profile;

export const getProfilePathByRole = (groupName?: string): string => {
  if (!groupName) return '/profile';

  const lower = groupName.toLowerCase();

  // if (lower.includes('admin')) return '/admin/profile';
  // if (lower.includes('manager')) return '/manager/profile';
  if (lower.includes('employee')) return '/employee/profile';
  // if (lower.includes('operator')) return '/operator/profile';
  if (lower.includes('visitor') || lower.includes('guest')) return '/guest/profile';

  return '/profile';
};
