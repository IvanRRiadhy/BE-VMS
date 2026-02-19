import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2 as Grid,
  IconButton,
  Tab,
  Snackbar,
  Alert,
  Tabs,
  TextField,
  Typography,
  Portal,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import { Box } from '@mui/system';

import {
  IconArrowAutofitRight,
  IconBan,
  IconCircleOff,
  IconForbid2,
  IconGenderMale,
  IconHome,
  IconLicense,
  IconLogin,
  IconLogin2,
  IconLogout,
} from '@tabler/icons-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import moment from 'moment-timezone';
import LprImage from 'src/assets/images/products/pic_lpr.png';
import FRImage from 'src/assets/images/products/pic_fr.png';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Container from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import { useNavigate } from 'react-router-dom';
import {
  IconCalendar,
  IconCircleX,
  IconDownload,
  IconHourglass,
  IconUsersGroup,
} from '@tabler/icons-react';
import TopCards from './Dashboard/TopCard';

const DashboardOperator = () => {
  // const cards = [
  //   { title: 'Check In', icon: IconLogin, subTitle: `0`, subTitleSetting: 10, color: 'none' },
  //   { title: 'Check Out', icon: IconLogout, subTitle: `0`, subTitleSetting: 10, color: 'none' },
  //   { title: 'Block', icon: IconCircleOff, subTitle: `0`, subTitleSetting: 10, color: 'none' },
  //   { title: 'Denied', icon: IconBan, subTitle: `0`, subTitleSetting: 10, color: 'none' },
  // ];

  const CardItems = [
    { title: 'checkin', key: 'Checkin', icon: <IconLogin size={25} /> },
    { title: 'checkout', key: 'Checkout', icon: <IconLogout size={25} /> },
    { title: 'denied', key: 'Denied', icon: <IconCircleX size={25} /> },
    { title: 'block', key: 'Block', icon: <IconForbid2 size={25} /> },
    // { title: 'waiting', key: 'waiting', icon: <IconHourglass size={25} /> },
    {
      title: 'blacklist',
      key: 'blacklist',
      icon: <IconUsersGroup size={22} />,
    },
  ];

  const navigate = useNavigate();

  const [permissionAccess, setPermissionAccess] = useState<any[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error' | 'info'>('info');
  const [openCheckin, setOpenCheckin] = useState(false);
  const [openRelated, setOpenRelated] = useState(false);
  const { token } = useSession();
  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);
  const [openDetailQRCode, setOpenDetailQRCode] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [loadingAccess, setLoadingAccess] = useState(false);

  return (
    <Container title="Dashboard">
      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Grid size={{ xs: 12, lg: 12 }}>
          {/* <TopCard items={cards} size={{ xs: 12, lg: 3 }} /> */}
          <TopCards items={CardItems} size={{ xs: 12, sm: 6, md: 4, xl: 2.4 }} />
        </Grid>
        <Grid size={{ xs: 12, lg: 12 }}>
          <Grid container spacing={2}>
            {/* Kolom kiri (dua tabel vertikal) */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Box display="flex" flexDirection="column" gap={2}>
                <DynamicTable
                  height={420}
                  isHavePagination
                  overflowX="auto"
                  data={[]}
                  isHaveChecked={false}
                  isHaveAction={false}
                  isHaveHeaderTitle
                  titleHeader="Visitor Arrival"
                />

                <DynamicTable
                  height={420}
                  isHavePagination
                  overflowX="auto"
                  data={[]}
                  isHaveChecked={false}
                  isHaveAction={false}
                  isHaveHeaderTitle
                  titleHeader="Extended Request"
                />
              </Box>
            </Grid>

            {/* Kolom kanan (panel panjang ke bawah) */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Box
                sx={{
                  height: '100%',
                  // minHeight: 860,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  boxShadow: 2,
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  gap: 2,
                }}
              >
                <Grid
                  container
                  spacing={0}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  {/* Kolom LPR */}
                  <Grid
                    size={{ xs: 12, lg: 6 }}
                    sx={{
                      borderRight: { lg: '1px solid #e0e0e0' },
                      borderBottom: { xs: '1px solid #e0e0e0', lg: 'none' },
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold" textAlign="center">
                      LPR
                    </Typography>

                    {/* Frame Gambar */}
                    <Box
                      sx={{
                        width: '100%',
                        maxWidth: 420,
                        height: 300,
                        // border: '3px solid #1976d2',
                        borderRadius: 2,
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: 2,
                        backgroundColor: '#fff',
                      }}
                    >
                      <Box
                        component="img"
                        src={LprImage}
                        alt="LPR Preview"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 1,
                          opacity: 0.95,
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* Kolom Faceimage */}
                  <Grid
                    size={{ xs: 12, lg: 6 }}
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        textAlign: 'center', // biar teks tetap di tengah
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold">
                        Face Image
                      </Typography>

                      <IconArrowAutofitRight
                        onClick={() => navigate('/operator/view')}
                        style={{
                          position: 'absolute',
                          right: 0, // ujung kanan
                          top: '50%', // sejajar secara vertikal
                          transform: 'translateY(-50%)',
                          cursor: 'pointer',
                          width: '30px',
                          height: '30px',
                          backgroundColor: '#5D87FF',
                          padding: '2px',
                          color: 'white',
                          borderRadius: '50%',
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        width: '100%',
                        maxWidth: 420,
                        height: 300,
                        // border: '3px solid #1976d2', // biru elegan seperti frame kamera
                        borderRadius: 2,
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: 2,
                        backgroundColor: '#fff', // latar belakang hitam seperti CCTV feed
                      }}
                    >
                      <Box
                        component="img"
                        src={FRImage}
                        alt="LPR Preview"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 1,
                          opacity: 0.95,
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
                <DynamicTable
                  height={420}
                  isHavePagination
                  overflowX="auto"
                  data={[]}
                  isHaveChecked={false}
                  isHaveAction={false}
                  isHaveHeaderTitle
                  titleHeader="Data Arrival"
                />
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Portal>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{
            zIndex: 99999,
            position: 'fixed',
            top: 20,
            left: 0,
            right: 0,
            margin: '0 auto',
            maxWidth: 500,
          }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarType}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbarMsg}
          </Alert>
        </Snackbar>
      </Portal>
      <Portal>
        <Backdrop
          sx={{
            zIndex: 99999,
            position: 'fixed',
            margin: '0 auto',
            color: 'primary',
          }}
          open={loadingAccess}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Portal>
    </Container>
  );
};

export default DashboardOperator;
