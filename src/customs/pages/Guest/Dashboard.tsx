import React, { useEffect, useRef, useState } from 'react';
import GuestLayout from './GuestLayout';
import PageContainer from 'src/components/container/PageContainer';
import { Box } from '@mui/system';
import {
  Card,
  Typography,
  IconButton,
  DialogContent,
  DialogTitle,
  Grid2 as Grid,
  Button,
  Dialog,
  Drawer,
  Portal,
  Backdrop,
  CircularProgress,
  Snackbar,
  Alert,
  DialogActions,
} from '@mui/material';

import Divider from '@mui/material/Divider';
import { Download } from '@mui/icons-material';
import {
  IconBan,
  IconCalendar,
  IconCards,
  IconCircleOff,
  IconCircleX,
  IconDownload,
  IconForbid2,
  IconLogin,
  IconLogout,
  IconX,
} from '@tabler/icons-react';
import QRCode from 'react-qr-code';
// import VisitorStatusPieChart from 'src/customs/pages/Guest/Components/charts/VisitorStatusPieChart';
import VisitorStatusPieChart from 'src/customs/components/charts/VisitorStatusPieChart';
import TopCard from './Dashboard/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { getActiveInvitation, openParkingBlocker } from 'src/customs/api/visitor';
import { useSession } from 'src/customs/contexts/SessionContext';
import moment from 'moment-timezone';
import dayjs, { Dayjs } from 'dayjs';
import { subDays } from 'date-fns';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('id');

import Calendar from 'src/customs/components/calendar/Calendar';
import { getAccessPass } from 'src/customs/api/admin';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

const Dashboard = () => {
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
  const { token } = useSession();
  const [loading, setLoading] = useState(false);

  const [activeVisitData, setActiveVisitData] = useState<any[]>([]);
  const [activeAccessPass, setActiveAccessPass] = useState<any>();
  const [openAccess, setOpenAccess] = useState(false);
  const [openInputInvitationCode, setOpenInputInvitationCode] = useState(false);
  const handleOpenAccess = () => {
    setOpenAccess(true);
  };

  const handleCloseAccess = () => {
    setOpenAccess(false);
  };

  const CardItems = [
    { title: 'checkin', key: 'Checkin', icon: <IconLogin size={25} /> },
    { title: 'checkout', key: 'Checkout', icon: <IconLogout size={25} /> },
    { title: 'denied', key: 'Denied', icon: <IconCircleX size={25} /> },
    { title: 'block', key: 'Block', icon: <IconForbid2 size={25} /> },
    // {
    //   title: 'blacklist',
    //   key: 'blacklist',
    //   icon: <IconUsersGroup size={22} />,
    // },
  ];

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const res = await getActiveInvitation(token as string);

        const response = res.collection?.map((item: any) => ({
          id: item.id,
          // visitor_type:  item.visitor_type_name,
          name: item.visitor.name,
          email: item.visitor.email,
          organization: item.visitor.organization,
          visitor_period_start: item.visitor_period_start,
          visitor_period_end: formatDateTime(item.visitor_period_end, item.extend_visitor_period),
          host: item.host ?? '-',
          visitor_status: item.visitor_status,
        }));
        setActiveVisitData(response ?? []);
        const resAccess = await getAccessPass(token as string);
        // console.log(resAccess);
        setActiveAccessPass(resAccess);
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
  }, [token]);

  const [dateRange, setDateRange] = useState([
    {
      startDate: subDays(new Date(), 7),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  function formatVisitorPeriodLocal(startUtc: string, endUtc: string) {
    const startLocal = moment
      .utc(startUtc)
      .tz(moment.tz.guess())
      .format('dddd, DD MMMM YYYY HH:mm');
    const endLocal = moment.utc(endUtc).tz(moment.tz.guess()).format('dddd,DD MMMM YYYY HH:mm');
    return `${startLocal} - ${endLocal}`;
  }

  const printRef = useRef<HTMLDivElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);

    try {
      // Clone elemen untuk PDF (tidak mempengaruhi UI asli)
      const clone = printRef.current.cloneNode(true) as HTMLElement;

      // Buat logo khusus untuk PDF
      const logoEl = document.createElement('img');
      logoEl.src = '/src/assets/images/logos/BI_Logo.png';
      logoEl.style.width = '100px';
      logoEl.style.height = '100px';
      logoEl.style.display = 'block';
      logoEl.style.margin = '0 auto';
      clone.prepend(logoEl);

      clone.querySelectorAll('.no-print').forEach((el) => {
        (el as HTMLElement).style.display = 'none';
      });

      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Access Pass ${activeAccessPass?.group_name || 'Visitor'}.pdf`);

      clone.remove();
    } finally {
      setIsGenerating(false);
    }
  };

  const [isParkingLoading, setIsParkingLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleOpenParkingBlocker = async () => {
    if (!activeAccessPass?.id || !token) return;
    setIsParkingLoading(true);
    try {
      const res = await openParkingBlocker(token, { trx_visitor_id: activeAccessPass.id });
      console.log('res', JSON.stringify(res, null, 2));
      setSnackbar({
        open: true,
        message: 'Parking blocker opened successfully.',
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: 'Failed to open parking blocker.',
        severity: 'error',
      });
    } finally {
      setTimeout(() => setIsParkingLoading(false), 600);
    }
  };

  return (
    <PageContainer title="Dashboard">
      <Grid container spacing={2} sx={{ mt: 0 }} alignItems={'stretch'}>
        <Grid
          size={{ xs: 12, lg: 12 }}
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          gap={2}
          sx={{ mt: 0.5 }}
        >
          <Button
            size="small"
            sx={{
              backgroundColor: 'white',
              color: 'black',
              border: '1px solid #d1d1d1',
              ':hover': { backgroundColor: '#d1d1d1', color: 'black' },
            }}
            startIcon={<IconCalendar size={18} />}
            onClick={handleClick}
          >
            {`${dateRange[0].startDate.toLocaleDateString()} - ${dateRange[0].endDate.toLocaleDateString()}`}
          </Button>

          <Button size="small" variant="contained" color="error" startIcon={<IconDownload />}>
            Export
          </Button>

          <Drawer open={open} anchor="right" onClose={handleClose}>
            <Calendar
              onChange={(selection: any) => {
                setDateRange([
                  {
                    startDate: selection.startDate,
                    endDate: selection.endDate,
                    key: 'selection',
                  },
                ]);
              }}
            />
          </Drawer>
        </Grid>
        <Grid size={{ xs: 12, xl: 9 }}>
          <TopCard items={CardItems} size={{ xs: 12, lg: 6 }} />
        </Grid>
        <Grid
          size={{ xs: 12, xl: 3 }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Card
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: '',
              alignItems: 'center',
              flexDirection: 'column',
              cursor: 'pointer',
              gap: 1,
            }}
            onClick={handleOpenAccess}
          >
            {activeAccessPass ? (
              <>
                <Typography variant="h5">Access Pass</Typography>
                <Box
                  sx={{
                    p: 1,
                    backgroundColor: '#ffffff',
                    borderRadius: 2,
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <QRCode
                    value={activeAccessPass.visitor_number || ''}
                    size={40}
                    style={{
                      height: 'auto',
                      width: '100px',
                    }}
                  />
                </Box>
                <Typography variant="body1" fontWeight={'600'} color="primary">
                  Tap to show detail
                </Typography>
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                <IconCards size={40} />
                <Typography
                  variant="body1"
                  color="textSecondary"
                  fontStyle="italic"
                  textAlign="center"
                  mt={1}
                >
                  No access pass found
                </Typography>
              </Box>
            )}
          </Card>
          <Button
            variant="contained"
            sx={{ mt: 1 }}
            onClick={() => setOpenInputInvitationCode(true)}
          >
            Insert Invitation Code
          </Button>
        </Grid>

        <Grid size={{ xs: 12, lg: 9 }}>
          <DynamicTable
            height={420}
            isHavePagination
            overflowX={'auto'}
            data={activeVisitData}
            isHaveChecked={false}
            isHaveAction={false}
            isHaveSearch={false}
            isHaveFilter={false}
            isHaveExportPdf={false}
            isHaveExportXlf={false}
            isHaveHeaderTitle={true}
            isHavePeriod={true}
            titleHeader="Active Visit"
            // defaultRowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 20, 50, 100]}
            // onPaginationChange={(page, rowsPerPage) => {
            //   setPage(page);
            //   setRowsPerPage(rowsPerPage);
            // }}
            isHaveFilterDuration={false}
            isHaveAddData={false}
            isHaveHeader={false}
            isHaveFilterMore={false}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <VisitorStatusPieChart />
        </Grid>
      </Grid>

      {activeAccessPass && (
        <Dialog open={openAccess} onClose={handleCloseAccess} fullWidth maxWidth="sm">
          <DialogTitle textAlign={'center'} sx={{ p: 2 }}>
            Your Access Pass
          </DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleCloseAccess}
            sx={{
              position: 'absolute',
              right: 10,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <IconX />
          </IconButton>
          <DialogContent
            sx={{
              paddingTop: 2,
              position: 'relative',
            }}
            dividers
            ref={printRef}
          >
            <img
              src="src/assets/images/backgrounds/back-test.jpg"
              alt="background"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: -1,
              }}
            />
            <Box
              display="flex"
              justifyContent="center"
              className="only-print"
              sx={{
                display: 'none',
                '@media print': {
                  display: 'flex',
                },
              }}
            >
              <img
                src="/src/assets/images/logos/bio-experience-1x1-logo.png"
                alt="logo"
                width={100}
                height={100}
                style={{
                  objectFit: 'contain',
                  maxHeight: '100px',
                }}
              />
            </Box>
            <Box mt={1} zIndex={1} position={'relative'}>
              <Grid container spacing={2} justifyContent="center">
                <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                  <Typography variant="body1" color="textSecondary" fontWeight={500}>
                    Invitation Code
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {activeAccessPass.invitation_code}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }} textAlign="center" position={'relative'}>
                  <Typography variant="body1" color="textSecondary" fontWeight={500}>
                    Group Name
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {activeAccessPass.group_name || '-'}
                  </Typography>
                </Grid>
                {!isGenerating && (
                  <IconButton
                    color="primary"
                    className="no-print"
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'white',
                      position: 'absolute',
                      right: 5,
                      top: -10,
                      '&:hover': { backgroundColor: 'primary.dark' },
                      '@media print': {
                        display: 'none !important', // pastikan override semua
                      },
                    }}
                    onClick={handleDownloadPDF}
                  >
                    <Download />
                  </IconButton>
                )}

                <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                  <Typography variant="body1" color="textSecondary" fontWeight={500}>
                    Host
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {activeAccessPass.host || '-'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                  <Typography variant="body1" color="textSecondary" fontWeight={500}>
                    Group Code
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {activeAccessPass.group_code || '-'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 12 }} textAlign="center">
                  <Typography variant="body1" color="textSecondary" fontWeight={500}>
                    Period Visit
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatVisitorPeriodLocal(
                      activeAccessPass.visitor_period_start as string,
                      activeAccessPass.visitor_period_end as string,
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Box mt={1}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }} textAlign={'center'}>
                {activeAccessPass.site_place_name}
              </Typography>
              <Box
                display="flex"
                justifyContent="center"
                mt={0}
                mb={1}
                flexDirection={'column'}
                alignItems={'center'}
              >
                <Box
                  sx={{
                    display: 'inline-block',
                    p: 3,
                    borderRadius: 2,
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
                    backgroundColor: 'white', // biar kontras
                  }}
                  my={2}
                >
                  <QRCode
                    value={activeAccessPass.visitor_number || activeAccessPass.invitation_code}
                    size={180}
                    style={{
                      height: 'auto',
                      width: '180px',
                      borderRadius: 8,
                    }}
                  />
                </Box>
                <Box display="flex" gap={3} mb={2}>
                  <Typography color="error">Tracked</Typography>
                  <Typography color="error">Low Battery</Typography>
                </Box>
                <Typography variant="body2" mb={1}>
                  Show this while visiting
                </Typography>
                <Typography variant="h6">ID : {activeAccessPass.visitor_code}</Typography>
                <Divider sx={{ width: '100%', my: 2, borderColor: 'grey' }} />
                <Typography
                  variant="h5"
                  color="textSecondary"
                  fontWeight={700}
                  mb={1}
                  textAlign={'start'}
                >
                  Parking
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                    <Typography variant="body1" color="textSecondary" fontWeight={500}>
                      Parking Area
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {activeAccessPass?.parking_area || '-'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                    <Typography variant="body1" color="textSecondary" fontWeight={500}>
                      Parking Slot
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {activeAccessPass?.parking_slot || '-'}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                    <Typography variant="body1" color="textSecondary" fontWeight={500}>
                      Vehicle Plate
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {activeAccessPass.vehicle_plate_number || '-'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                    <Typography variant="body1" color="textSecondary" fontWeight={500}>
                      Vehicle Type
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {activeAccessPass.vehicle_type || '-'}
                    </Typography>
                  </Grid>
                </Grid>
                {!isGenerating && (
                  <Button
                    size="small"
                    variant="contained"
                    className="no-print"
                    onClick={handleOpenParkingBlocker}
                    disabled={isParkingLoading || !activeAccessPass.is_driving}
                    sx={{
                      mt: 2,
                      width: '100%',
                      position: 'relative',
                      '@media print': {
                        display: 'none',
                      },
                    }}
                  >
                    {isParkingLoading ? (
                      <CircularProgress
                        size={22}
                        sx={{
                          color: 'white',
                        }}
                      />
                    ) : (
                      'Open Parking Blocker'
                    )}
                  </Button>
                )}
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      )}

      <Dialog
        open={openInputInvitationCode}
        onClose={() => setOpenInputInvitationCode(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Input Invitation Code
          <IconButton
            aria-label="close"
            onClick={() => setOpenInputInvitationCode(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <IconX />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <CustomFormLabel sx={{ mt: 0 }}>Invitation Code</CustomFormLabel>
          <CustomTextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Enter your invitation code"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInputInvitationCode(false)} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Portal>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{
            zIndex: 99999,
            position: 'fixed',
          }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Portal>
      <Portal>
        <Backdrop
          sx={{
            zIndex: 1,
            position: 'fixed',
            margin: '0 auto',
            color: 'primary',
          }}
          open={isGenerating}
        >
          <CircularProgress color="primary" />
        </Backdrop>
      </Portal>
    </PageContainer>
  );
};

export default Dashboard;
