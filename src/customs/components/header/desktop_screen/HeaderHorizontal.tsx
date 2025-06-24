import { IconButton, Box, AppBar, Toolbar, Stack, Theme } from '@mui/material';

import { useSelector, useDispatch } from 'src/store/Store';
import { toggleMobileSidebar } from 'src/store/customizer/CustomizerSlice';
import { IconMenu2 } from '@tabler/icons-react';
import Notifications from 'src/layouts/full/vertical/header/Notification';
import Profile from 'src/layouts/full/vertical/header/Profile';
import { AppState } from 'src/store/Store';
import Logo from '../../logo/Logo';
import { styled, useMediaQuery, useTheme } from '@mui/material';

const HeaderHorizontal = () => {
  const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));

  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    background: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    boxShadow: 'none',
    padding: '5px',
    width: '100%',
    [theme.breakpoints.up('lg')]: {
      minHeight: customizer.TopbarHeight,
    },
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    width: '100%',
    color: `${theme.palette.text.secondary} !important`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }));

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // true jika <=600px

  return (
    <AppBarStyled position="static" color="default" elevation={8}>
      <ToolbarStyled>
        {/* Logo dan Sidebar Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isMobile && (
              <Box sx={{ width: lgDown ? '45px' : 'auto', overflow: 'hidden' }}>
                <Logo />
              </Box>
            )}
          </Box>
          {lgDown && (
            <IconButton
              color="inherit"
              aria-label="menu"
              onClick={() => dispatch(toggleMobileSidebar())}
            >
              <IconMenu2 />
            </IconButton>
          )}
        </Box>

        {/* Kanan: Mode, Notifikasi, Profile */}
        <Stack spacing={1} direction="row" alignItems="center">
          <Notifications />
          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

export default HeaderHorizontal;
