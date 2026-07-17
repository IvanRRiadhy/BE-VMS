import React, { useEffect, useRef, useState } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import {
  Grid2 as Grid,
  Portal,
  Backdrop,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';

import {
  IconCalendar,
  IconCards,
  IconCircleMinus,
  IconDownload,
  IconLogin,
  IconLogout,
  IconX,
} from '@tabler/icons-react';
import TopCard from './TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import {
  getActiveInvitation,
  getInvitationById,
  openParkingBlocker,
} from 'src/customs/api/visitor';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { setDateRange } from 'src/store/apps/Daterange/dateRangeSlice';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

dayjs.locale('id');
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import AccessPassDialog from '../components/Dialog/AccessPassDialog';
import { dispatch } from 'src/store/Store';
import { useSelector } from 'react-redux';
import Heatmap from './Heatmap';
import { showSwal } from 'src/customs/components/alerts/alerts';
import InputInvitationCodeDialog from './components/InputInvitationCodeDialog';
import { useAccessPass } from 'src/hooks/Dashboard/useAccessPass';
import VisitorActionBar from './components/VisitorActionBar';
import GuestAccessPass from './components/GuestAccessPass';

const Dashboard = () => {
  const [activeVisitData, setActiveVisitData] = useState<any[]>([]);
  const [openAccess, setOpenAccess] = useState(false);
  const [openInputInvitationCode, setOpenInputInvitationCode] = useState(false);
  const [invitationCode, setInvitationCode] = useState('');
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
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getActiveInvitation();
        const response = res.collection?.map((item: any) => ({
          id: item.id,
          name: item.visitor_name,
          email: item.visitor_email,
          organization: item.visitor_organization_name,
          agenda: item.agenda,
          visitor_period_start: item.visitor_period_start,
          visitor_period_end: formatDateTime(item.visitor_period_end, item.extend_visitor_period),
          host: item.host_name ?? '-',
          visitor_status: item.visitor_status,
        }));
        setActiveVisitData(response ?? []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  const { accessPass, loading: loadingAccessPass } = useAccessPass();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  function formatVisitorPeriodLocal(startUtc: string, endUtc: string) {
    const timezone = dayjs.tz.guess();

    const startLocal = dayjs.utc(startUtc).tz(timezone).format('dddd, DD MMMM YYYY HH:mm');

    const endLocal = dayjs.utc(endUtc).tz(timezone).format('dddd, DD MMMM YYYY HH:mm');

    return `${startLocal} - ${endLocal}`;
  }

  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);

    try {
      const clone = printRef.current.cloneNode(true) as HTMLElement;

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
      pdf.save(`Access Pass ${accessPass?.group_name || 'Visitor'}.pdf`);

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
    if (!accessPass?.id) return;
    setIsParkingLoading(true);
    try {
      await openParkingBlocker({ trx_visitor_id: accessPass.id });
      showSwal('success', 'Parking blocker opened successfully.');
    } catch (error: any) {
      showSwal('error', error?.response.data.msg || 'Failed to open parking blocker.');
    } finally {
      setTimeout(() => setIsParkingLoading(false), 600);
    }
  };
  const { startDate, endDate } = useSelector((state: any) => state.dateRange);
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const handleExportPdf = async () => {
    if (!exportRef.current || isExporting) return;

    try {
      setIsExporting(true);

      await new Promise((resolve) => setTimeout(resolve, 0));

      const canvas = await html2canvas(exportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/jpeg');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const formatDate = (date: Date) => date.toISOString().split('T')[0];
      const start = formatDate(startDate);
      const end = formatDate(endDate);

      pdf.save(`Dashboard Report-${start}_to_${end}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PageContainer title="Dashboard">
      <VisitorActionBar
        open={open}
        startDate={startDate}
        endDate={endDate}
        isExporting={isExporting}
        onOpenCalendar={handleClick as any}
        onCloseCalendar={handleClose}
        onExport={handleExportPdf}
        onDateChange={(selection) => {
          dispatch(
            setDateRange({
              startDate: selection.startDate,
              endDate: selection.endDate,
            }),
          );
        }}
      />
      <Grid container spacing={2} sx={{ mt: 0 }} alignItems={'stretch'} ref={exportRef}>
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
          <GuestAccessPass
            accessPass={accessPass}
            onOpenAccess={handleOpenAccess}
            onInsertInvitationCode={() => setOpenInputInvitationCode(true)}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <DynamicTable
            height={470}
            isHavePagination={false}
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
            // rowsPerPageOptions={[10, 50, 100]}
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
        <Grid size={{ xs: 12, lg: 6 }}>
          {/* <VisitorStatusPieChart /> */}
          <Heatmap />
        </Grid>
      </Grid>

      <AccessPassDialog
        open={openAccess}
        onClose={handleCloseAccess}
        data={accessPass}
        isGenerating={isGenerating}
        isParkingLoading={isParkingLoading}
        onDownload={handleDownloadPDF}
        onOpenParking={handleOpenParkingBlocker}
        formatVisitorPeriodLocal={formatVisitorPeriodLocal}
        printRef={printRef}
      />

      <InputInvitationCodeDialog
        open={openInputInvitationCode}
        invitationCode={invitationCode}
        onClose={() => setOpenInputInvitationCode(false)}
        onChangeInvitationCode={setInvitationCode}
        onSubmit={() => {
          console.log(invitationCode);
        }}
      />

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
