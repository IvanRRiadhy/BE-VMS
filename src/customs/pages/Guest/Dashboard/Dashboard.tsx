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
} from '@mui/material';
import {
  IconChevronLeft,
  IconChevronRight,
  IconCircleMinus,
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
import GlobalBackdropLoading from '../../Operator/Components/GlobalBackdrop';
import VisitStatusCard from './components/VisitorStatusCard';

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


      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) throw new Error('Failed to get canvas context');

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const data = imageData.data;

      let minX = canvas.width;
      let minY = canvas.height;
      let maxX = 0;
      let maxY = 0;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const index = (y * canvas.width + x) * 4;

          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          const a = data[index + 3];

          // Anggap pixel yang bukan putih sebagai content
          if (a > 0 && (r < 245 || g < 245 || b < 245)) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      const padding = 20;

      minX = Math.max(0, minX - padding);
      minY = Math.max(0, minY - padding);
      maxX = Math.min(canvas.width, maxX + padding);
      maxY = Math.min(canvas.height, maxY + padding);

      const croppedCanvas = document.createElement('canvas');

      croppedCanvas.width = maxX - minX;
      croppedCanvas.height = maxY - minY;

      const croppedCtx = croppedCanvas.getContext('2d');

      if (!croppedCtx) throw new Error('Failed to create cropped canvas');

      croppedCtx.fillStyle = '#fff';
      croppedCtx.fillRect(0, 0, croppedCanvas.width, croppedCanvas.height);

      croppedCtx.drawImage(
        canvas,
        minX,
        minY,
        croppedCanvas.width,
        croppedCanvas.height,
        0,
        0,
        croppedCanvas.width,
        croppedCanvas.height,
      );

      const imgData = croppedCanvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a6');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const margin = 4;

      const maxWidth = pdfWidth - margin * 2;
      const maxHeight = pdfHeight - margin * 2;

      let imgWidth = maxWidth;
      let imgHeight = (croppedCanvas.height * imgWidth) / croppedCanvas.width;

      if (imgHeight > maxHeight) {
        imgHeight = maxHeight;
        imgWidth = (croppedCanvas.width * imgHeight) / croppedCanvas.height;
      }

      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

      showSwal('success', 'Successfully generated PDF');

      pdf.save(`Visitor Code-${currentAccessPass?.visitor_number || 'Visitor'}.pdf`);
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
    if (!currentAccessPass?.id) return;

    const result = await showSwal('confirm', 'Are you sure  to open the parking blocker?');

    if (!result?.isConfirmed) return;

    setIsParkingLoading(true);

    try {
      await openParkingBlocker({
        trx_visitor_id: currentAccessPass.id,
      });

      showSwal('success', 'Parking blocker opened successfully.');
    } catch (error: any) {
      showSwal('error', error?.response?.data?.msg || 'Failed to open parking blocker.');
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
      <GlobalBackdropLoading open={isGenerating} />
    </PageContainer>
  );
};

export default Dashboard;
