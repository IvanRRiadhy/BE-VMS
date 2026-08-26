import React, { useEffect, useRef, useState } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import { Grid2 as Grid, Portal, Backdrop, CircularProgress, Snackbar, Alert } from '@mui/material';
import { IconCircleMinus, IconLogin, IconLogout, IconX } from '@tabler/icons-react';
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
import GlobalBackdropLoading from '../../Operator/Components/GlobalBackdrop';

const Dashboard = () => {
  const [activeVisitData, setActiveVisitData] = useState<any[]>([]);
  const [openAccess, setOpenAccess] = useState(false);
  const [openInputInvitationCode, setOpenInputInvitationCode] = useState(false);
  const [invitationCode, setInvitationCode] = useState('');
  const { accessPass, loading: loadingAccessPass } = useAccessPass();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleOpenAccess = () => {
    setOpenAccess(true);
  };

  const handleCloseAccess = () => {
    setOpenAccess(false);
  };

  const CardItems = [
    { title: 'checkin', key: 'Checkin', icon: <IconLogin size={25} /> },
    { title: 'checkout', key: 'Checkout', icon: <IconLogout size={25} /> },
  ];

  // const handleDownloadPDF = async () => {
  //   if (!printRef.current) return;
  //   setIsGenerating(true);

  //   try {
  //     const clone = printRef.current.cloneNode(true) as HTMLElement;

  //     const logoEl = document.createElement('img');
  //     logoEl.src = '/src/assets/images/logos/BI_Logo.png';
  //     logoEl.style.width = '100px';
  //     logoEl.style.height = '100px';
  //     logoEl.style.display = 'block';
  //     logoEl.style.margin = '0 auto';
  //     clone.prepend(logoEl);

  //     clone.querySelectorAll('.no-print').forEach((el) => {
  //       (el as HTMLElement).style.display = 'none';
  //     });

  //     clone.style.position = 'fixed';
  //     clone.style.left = '-9999px';
  //     document.body.appendChild(clone);

  //     const canvas = await html2canvas(clone, { scale: 3, useCORS: true });
  //     const imgData = canvas.toDataURL('image/png');

  //     const pdf = new jsPDF('p', 'mm', 'a4');
  //     const pdfWidth = pdf.internal.pageSize.getWidth();
  //     const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  //     pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  //     pdf.save(`Access Pass ${accessPass?.group_name || 'Visitor'}.pdf`);

  //     clone.remove();
  //   } finally {
  //     setIsGenerating(false);
  //   }
  // };

  const handleDownloadPDF = async () => {
    if (!exportRef.current || isGenerating) return;

    let clone: HTMLElement | null = null;

    setIsGenerating(true);

    try {
      clone = exportRef.current.cloneNode(true) as HTMLElement;

      // Hilangkan tombol download dan elemen lain
      // yang memiliki class no-print
      clone.querySelectorAll('.no-print').forEach((el) => {
        (el as HTMLElement).style.display = 'none';
      });

      // Posisikan clone di luar layar
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = `${exportRef.current.offsetWidth}px`;
      clone.style.backgroundColor = '#fff';

      document.body.appendChild(clone);

      // Tunggu render selesai
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(clone, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#fff',
      });

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const margin = 10;
      const imgWidth = pdfWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      // Page pertama
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);

      heightLeft -= pdfHeight - margin * 2;

      // Jika lebih dari 1 halaman
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;

        pdf.addPage();

        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);

        heightLeft -= pdfHeight - margin * 2;
      }

      pdf.save(`Visitor Code-${accessPass?.visitor_number || 'Visitor'}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      if (clone) {
        clone.remove();
      }

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
      {/* <Grid container spacing={2} sx={{ mt: 0 }} alignItems={'stretch'} ref={exportRef}>
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
      </Grid> */}

      {/* <AccessPassDialog
        open={openAccess}
        onClose={handleCloseAccess}
        data={accessPass}
        isGenerating={isGenerating}
        isParkingLoading={isParkingLoading}
        onDownload={handleDownloadPDF}
        onOpenParking={handleOpenParkingBlocker}
        formatVisitorPeriodLocal={formatVisitorPeriodLocal}
        printRef={printRef}
      /> */}

      <Grid
        container
        spacing={2}
        sx={{ mt: 0 }}
        alignItems="stretch"
        ref={exportRef}
        justifyContent={'center'}
      >
        {/* =========================
          QUICK STATS
      ========================== */}
        <Grid size={{ xs: 12, xl: 8 }}>
          <TopCard items={CardItems} size={{ xs: 12, sm: 6 }} />
        </Grid>

        {/* =========================
          DIGITAL ACCESS PASS
      ========================== */}
        <Grid size={{ xs: 12, xl: 8 }}>
          {/* <GuestAccessPass
            accessPass={accessPass}
            onOpenAccess={handleOpenAccess}
            onInsertInvitationCode={() => setOpenInputInvitationCode(true)}
          /> */}
          <GuestAccessPass
            accessPass={accessPass}
            onOpenAccess={handleOpenAccess}
            onDownload={handleDownloadPDF}
            onInsertInvitationCode={() => setOpenInputInvitationCode(true)}
            onOpenParking={handleOpenParkingBlocker}
            isParkingLoading={isParkingLoading}
          />
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
      <GlobalBackdropLoading open={isGenerating} />
    </PageContainer>
  );
};

export default Dashboard;
