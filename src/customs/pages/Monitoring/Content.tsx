import { AppBar, IconButton, Toolbar, Theme, Stack, Button, Typography } from '@mui/material';
import { Box, styled, useMediaQuery, useTheme } from '@mui/system';
import { IconCircle, IconCircleFilled, IconMenu2 } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import Logo from 'src/assets/images/logos/BI_Logo.png';
import {
  MonitoringOperatorNavListingData,
  MonitoringOperatorSidebarNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import { AppState, useDispatch } from 'src/store/Store';
import { toggleMobileSidebar } from 'src/store/customizer/CustomizerSlice';
import MonitoringMain from '../Operator/Monitoring/MonitoringMain';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import ViewMonitoring from './ViewMonitoring';
const Content = () => {
  const MainWrapper = styled('div')(() => ({
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
  }));

  const PageWrapper = styled('div')(() => ({
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    zIndex: 1,
    width: '100%',
    background: '#ebedefff !important',
  }));
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    background: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    boxShadow: 'none',
    padding: '5px',
    width: '100%',
    zIndex: 1200,
    borderBottom: '1px solid rgba(0,0,0,0.05)',
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

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const xl = useMediaQuery((theme: Theme) => theme.breakpoints.down('xl'));
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [openDialogFilter, setOpenDialogFilter] = useState(false);
  const [filters, setFilters] = useState({
    visitorName: '',
    activity: '',
    alarm: '',
    operatorLog: '',
  });

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };
  return (
    <MainWrapper
      className={customizer.activeMode === 'dark' ? 'darkbg mainwrapper' : 'mainwrapper'}
    >
      <PageWrapper
        className="page-wrapper"
        sx={{
          ...(customizer.isCollapse && {
            [theme.breakpoints.up('lg')]: { ml: `${customizer.MiniSidebarWidth}px` },
          }),
        }}
      >
        <Container title="Monitoring" description="Monitoring page">
          <AppBarStyled
            position="sticky"
            color="default"
            elevation={8}
            sx={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}
          >
            <ToolbarStyled>
              {/* Logo dan Sidebar Toggle */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {!isMobile && (
                    <Box sx={{ width: xl ? '0px' : 'none', overflow: 'hidden' }}>
                      <img src={Logo} width={45} height={45} />
                    </Box>
                  )}
                </Box>
                {xl && (
                  <IconButton
                    color="inherit"
                    aria-label="menu"
                    onClick={() => dispatch(toggleMobileSidebar())}
                  >
                    <IconMenu2 />
                  </IconButton>
                )}
              </Box>

              {customizer.isHorizontal && (
                // <CustomNavigation
                //   itemDataCustomNavListing={itemDataCustomNavListing}
                //   itemDataCustomSidebarItems={itemDataCustomSidebarItems}
                // />
                <></>
              )}

              {/* Kanan: Mode, Notifikasi, Profile */}
              <Stack spacing={2} direction="row" alignItems="center">
                {/* <Notifications />
                <Language />
                <Profile /> */}
                <Typography variant="h6" color="textSecondary">
                  Hi, Operator
                </Typography>
                <Button color="error" variant="contained">
                  Logout
                </Button>
              </Stack>
            </ToolbarStyled>
          </AppBarStyled>
        
          <ViewMonitoring
            loading={loading}
            onOpenFilter={() => setOpenDialogFilter(true)}
            onRefresh={handleRefresh}
          />
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '50px',
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 15px',
              borderTop: '1px solid rgba(0,0,0,0.1)',
              zIndex: 1300,
            }}
          >
            <IconCircleFilled size={12} style={{ color: '#4CAF50' }} />
            <Typography variant="body1" color="textSecondary">
              Online
            </Typography>
          </div>
        </Container>
      </PageWrapper>
    </MainWrapper>
  );
};

export default Content;
