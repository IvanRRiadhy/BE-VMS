import React, { useEffect, useRef, useState } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import {
  Grid2 as Grid,
  Portal,
  Backdrop,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  Typography,
  Card,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
} from '@mui/material';

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
import { dispatch } from 'src/store/Store';
import { useSelector } from 'react-redux';
import Heatmap from './Heatmap';
import { showSwal } from 'src/customs/components/alerts/alerts';
import InputInvitationCodeDialog from './components/InputInvitationCodeDialog';
import { useAccessPass } from 'src/hooks/Dashboard/useAccessPass';
import VisitorActionBar from './components/VisitorActionBar';
import GuestAccessPass from './components/GuestAccessPass';
import GlobalBackdropLoading from '../../Operator/Components/GlobalBackdrop';
import VisitStatusCard from './components/VisitorStatusCard';
import AccessPassPdf from './components/AccessPassPdf';
import { getConfig } from 'src/config';
import { useNavigate } from 'react-router';
import { IconBellRinging, IconCalendarEvent, IconClock, IconX } from '@tabler/icons-react';
import VisitTimeReminderDialog from './components/VisitTimeReminderDialog';

const Dashboard = () => {
  const [activeVisitData, setActiveVisitData] = useState<any[]>([]);
  const [openAccess, setOpenAccess] = useState(false);
  const [openInputInvitationCode, setOpenInputInvitationCode] = useState(false);
  const [invitationCode, setInvitationCode] = useState('');
  const { accessPass = [], loading: loadingAccessPass } = useAccessPass();
  const [activePassIndex, setActivePassIndex] = useState(0);
  const handlePreviousPass = () => {
    setActivePassIndex((prev) => (prev === 0 ? accessPass.length - 1 : prev - 1));
  };

  const handleNextPass = () => {
    setActivePassIndex((prev) => (prev === accessPass.length - 1 ? 0 : prev + 1));
  };
  const currentAccessPass = accessPass?.[activePassIndex];
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [openVisitReminder, setOpenVisitReminder] = useState(false);
  const config = getConfig();

  const logoUrl = config.LOGO_URL;

  const handleOpenAccess = () => {
    setOpenAccess(true);
  };

  useEffect(() => {
    if (activePassIndex >= accessPass.length) {
      setActivePassIndex(0);
    }
  }, [accessPass.length, activePassIndex]);

  const handleCloseAccess = () => {
    setOpenAccess(false);
  };

  const handleDownloadPDF = async () => {
    if (!accessPassPdfRef.current || isGenerating) return;

    setIsGenerating(true);

    try {
      // Tunggu supaya image / QR selesai render
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(accessPassPdfRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#fff',
      });

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a6',
      });

      // const pdfWidth = pdf.internal.pageSize.getWidth();
      // const pdfHeight = pdf.internal.pageSize.getHeight();

      // const margin = 5;

      // const maxWidth = pdfWidth - margin * 2;
      // const maxHeight = pdfHeight - margin * 2;

      // let imgWidth = maxWidth;
      // let imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Kalau terlalu tinggi, scale berdasarkan height
      // if (imgHeight > maxHeight) {
      //   imgHeight = maxHeight;
      //   imgWidth = (canvas.width * imgHeight) / canvas.height;
      // }

      // const x = (pdfWidth - imgWidth) / 2;
      // const y = (pdfHeight - imgHeight) / 2;

      // pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Full page — tanpa margin
      const imgWidth = pdfWidth;
      const imgHeight = pdfHeight;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      pdf.save(`Visitor Code-${currentAccessPass?.visitor_number || 'Visitor'}.pdf`);

      showSwal('success', 'Successfully generated PDF');
    } catch (error) {
      console.error('Failed to generate PDF:', error);

      showSwal('error', 'Failed to generate PDF');
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

  const navigate = useNavigate();

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

  const handleOpenParkingBlocker = async () => {
    if (!currentAccessPass?.id || isParkingLoading) return;

    const result = await showSwal('confirm', 'Are you sure to open the parking blocker?');

    if (!result?.isConfirmed) return;

    setIsParkingLoading(true);

    try {
      // 1. Tunggu sampai API selesai
      await openParkingBlocker({
        trx_visitor_id: currentAccessPass.id,
      });

      // 2. API sukses, tampilkan notifikasi
      showSwal('success', 'Successfully opened parking blocker.');

      // 3. Mulai cooldown 3 detik setelah API selesai
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error: any) {
      showSwal('error', error?.response?.data?.msg || 'Failed to open parking blocker.');
    } finally {
      // 4. Aktifkan kembali tombol
      setIsParkingLoading(false);
    }
  };

  const accessPassPdfRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const visitorId = currentAccessPass?.id;
    const periodEnd = currentAccessPass?.visitor_period_end;

    if (!visitorId || !periodEnd) {
      setOpenVisitReminder(false);
      return;
    }

    // Abaikan tanggal default
    if (periodEnd.startsWith('9999-01-01')) {
      setOpenVisitReminder(false);
      return;
    }

    // Data visitor_period_end disimpan dalam UTC
    const endTime = dayjs.utc(periodEnd).valueOf();

    if (!endTime || !dayjs.utc(periodEnd).isValid()) {
      return;
    }

    const now = Date.now();

    // Jangan tampilkan jika kunjungan sudah berakhir
    if (now >= endTime) {
      setOpenVisitReminder(false);
      return;
    }

    // Reminder 5 menit sebelum visitor_period_end
    const reminderTime = endTime - 5 * 60 * 1000;

    // Gunakan ID transaksi dan waktu akhir sebagai identitas reminder
    const reminderKey = `visitor-reminder-${visitorId}-${periodEnd}`;

    // Jika sudah pernah ditutup, jangan tampilkan lagi
    if (localStorage.getItem(reminderKey) === 'dismissed') {
      setOpenVisitReminder(false);
      return;
    }

    const delay = reminderTime - now;

    if (delay <= 0) {
      // Halaman dibuka ketika sudah masuk periode reminder
      setOpenVisitReminder(true);
      return;
    }

    const timer = window.setTimeout(() => {
      setOpenVisitReminder(true);
    }, delay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [currentAccessPass?.id, currentAccessPass?.visitor_period_end]);

  const handleCloseVisitReminder = () => {
    const visitorId = currentAccessPass?.id;
    const periodEnd = currentAccessPass?.visitor_period_end;

    if (visitorId && periodEnd) {
      const reminderKey = `visitor-reminder-${visitorId}-${periodEnd}`;

      localStorage.setItem(reminderKey, 'dismissed');
    }

    setOpenVisitReminder(false);
  };
  return (
    <PageContainer title="Dashboard">
      {/* <VisitorActionBar
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
      /> */}

      <Grid
        container
        spacing={1}
        sx={{ mt: 0 }}
        alignItems="center"
        ref={exportRef}
        justifyContent={'center'}
        flexDirection={'column'}
      >
        <Grid size={{ xs: 12, xl: 4 }}>
          <VisitStatusCard accessPass={currentAccessPass} />
        </Grid>
        <Grid size={{ xs: 12, xl: 4 }}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              // overflow: 'hidden',
            }}
          >
            <GuestAccessPass
              accessPass={currentAccessPass}
              loading={loadingAccessPass}
              onOpenAccess={handleOpenAccess}
              onDownload={handleDownloadPDF}
              onInsertInvitationCode={() => setOpenInputInvitationCode(true)}
              onOpenParking={handleOpenParkingBlocker}
              isParkingLoading={isParkingLoading}
              activePassIndex={activePassIndex}
              totalPass={accessPass.length}
              onPreviousPass={handlePreviousPass}
              onNextPass={handleNextPass}
              onSelectPass={setActivePassIndex}
            />
          </Box>
        </Grid>
      </Grid>

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
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{
              width: '100%',
              py: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Portal>
      <Box
        ref={accessPassPdfRef}
        sx={{
          position: 'fixed',
          left: '-99999px',
          top: 0,
        }}
      >
        <AccessPassPdf accessPass={currentAccessPass} logoSrc={logoUrl || ''} />
      </Box>
      <VisitTimeReminderDialog
        open={openVisitReminder}
        visitorPeriodEnd={currentAccessPass?.visitor_period_end}
        onClose={handleCloseVisitReminder}
      />
      <GlobalBackdropLoading open={isGenerating || isParkingLoading} />
    </PageContainer>
  );
};

export default Dashboard;
