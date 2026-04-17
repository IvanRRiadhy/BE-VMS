import React, { useEffect, useRef, useState } from 'react';
import GuestLayout from '../GuestLayout';
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
  IconCircleMinus,
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
import TopCard from './TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import {
  getActiveInvitation,
  getInvitationById,
  openParkingBlocker,
} from 'src/customs/api/visitor';
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
import AccessPassDialog from '../Components/Dialog/AccessPassDialog';

const Dashboard = () => {
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
    { title: 'denied', key: 'Denied', icon: <IconX size={25} /> },
    { title: 'block', key: 'Block', icon: <IconCircleMinus size={25} /> },
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
          organization: item.visitor_organization_name,
          visitor_period_start: item.visitor_period_start,
          visitor_period_end: formatDateTime(item.visitor_period_end, item.extend_visitor_period),
          host: item.host_name ?? '-',
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

  const [visitorDetail, setVisitorDetail] = useState<any>(null);
  const [visitorLoading, setVisitorLoading] = useState(false);
  const [visitorError, setVisitorError] = useState<string | null>(null);
  const [openVisitorDialog, setOpenVisitorDialog] = useState(false);
  const handleView = async (id: string) => {
    if (!token) return;

    setOpenVisitorDialog(true);
    setVisitorLoading(true);
    setVisitorError(null);
    setVisitorDetail(null);

    try {
      const res = await getInvitationById(id, token);
      setVisitorDetail(res?.collection ?? res ?? null);
    } catch (err: any) {
      setVisitorError(err?.message || 'Failed to fetch visitor detail.');
    } finally {
      setVisitorLoading(false);
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
              justifyContent: 'center',
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
                    size={50}
                    style={{
                      height: 'auto',
                      width: '150px',
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
            // isHaveAction={false}
            isHaveSearch={false}
            isHaveFilter={false}
            isHaveExportPdf={false}
            isHaveExportXlf={false}
            isHaveHeaderTitle={true}
            isHavePeriod={true}
            titleHeader="Active Visit"
            // isHaveAction={true}
            // isActionEmployee={true}
            // onView={(row) => {
            //   handleView(row.id);
            // }}
            // isActionVisitor={true}
            // defaultRowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10, 50, 100]}
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

      <AccessPassDialog
        open={openAccess}
        onClose={handleCloseAccess}
        data={activeAccessPass}
        isGenerating={isGenerating}
        isParkingLoading={isParkingLoading}
        onDownload={handleDownloadPDF}
        onOpenParking={handleOpenParkingBlocker}
        formatVisitorPeriodLocal={formatVisitorPeriodLocal}
        printRef={printRef}
      />

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
