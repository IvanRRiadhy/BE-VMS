// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, { useEffect, useRef, useState } from 'react';
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
  Select,
  MenuItem,
  Divider,
  Badge,
} from '@mui/material';
import { IconArrowNarrowDown, IconCaretDown, IconCaretDownFilled, IconChevronDown, IconMail, IconPower } from '@tabler/icons-react';
// import ProfileImg from 'src/assets/images/profile/user-1.jpg';
import { Link, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { useSession } from 'src/customs/contexts/SessionContext';
import { useDispatch } from 'react-redux';
import { clearUser } from 'src/store/apps/user/userSlice';
import { useQueryClient } from '@tanstack/react-query';
import { useProfile } from 'src/hooks/Profile/useProfile';

const Profile = () => {
  const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  // const [data, setData] = useState<any>({});

  const handleClick2 = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { token, clearToken } = useSession();

  const handleLogout = useCallback(async () => {
    handleClose2();
    clearToken();

    dispatch(clearUser());

    localStorage.clear();
    sessionStorage.clear();
    queryClient.removeQueries({
      queryKey: ['profile'],
    });
    sessionStorage.setItem('logoutMsg', 'You have been logged out successfully.');
    navigate('/', { replace: true });
  }, [navigate, clearToken]);

  const fetchedRef = useRef(false);

  const { data: profile } = useProfile();

  const profileUrl = getProfilePathByRole(profile?.group_name);

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="profile menu"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        onClick={handleClick2}
        sx={{
          ...(Boolean(anchorEl2) && {
            color: 'primary.main',
          }),
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          paddingRight: '0 !important',
        }}
      >
        <Badge
          overlap="circular"
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          variant="dot"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#44b700',
              color: '#44b700',
              width: 12,
              height: 12,
              borderRadius: '50%',
              border: '2px solid white',
            },
          }}
        >
          <Avatar
            src=""
            alt="profile"
            sx={{
              width: 35,
              height: 35,
            }}
          />
        </Badge>

        <IconChevronDown
        size={14}
          // sx={{
          //   fontSize: 18,
          //   transition: 'transform .2s ease',
          //   transform: Boolean(anchorEl2) ? 'rotate(180deg)' : 'rotate(0deg)',
          // }}
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
              {profile?.fullname || 'John Does'}
            </Typography>

            <Typography
              sx={{ fontSize: '0.8rem' }}
              variant="subtitle2"
              color="textSecondary"
              display="flex"
              alignItems="center"
              gap={1}
            >
              {profile?.email || 'morV0@example.com'}
            </Typography>

            <Link to={profileUrl} onClick={handleClose2}>
              <Typography variant="body2" mt={0.5} color="primary">
                See Profile
              </Typography>
            </Link>
          </Box>

          <Tooltip title="Log out">
            <Fab size="small" color="error" onClick={handleLogout}>
              <IconPower width={18} />
            </Fab>
          </Tooltip>
        </Stack>

        {/* {roleManager && (
          <Box my={1} mx={1}>
            <Divider sx={{ my: 1 }} />
            <Typography mb={1} sx={{ fontWeight: 'semibold' }}>
              Switch Account
            </Typography>
            <Select
              size="small"
              fullWidth
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <MenuItem value={GroupRoleId.Manager}>Manager</MenuItem>

              <MenuItem value={GroupRoleId.Employee}>Employee</MenuItem>
            </Select>
          </Box>
        )} */}
      </Menu>
    </Box>
  );
};

export default Profile;

export const getProfilePathByRole = (groupName?: string): string => {
  if (!groupName) return '/profile';

  const lower = groupName;

  if (lower.includes('Admin')) return '/admin/profile';
  if (lower.includes('Manager')) return '/manager/profile';
  if (lower.includes('Employee')) return '/employee/profile';
  if (lower.includes('OperatorVMS')) return '/operator/profile';
  if (lower.includes('Visitor') || lower.includes('guest')) return '/guest/profile';

  return '/profile';
};
