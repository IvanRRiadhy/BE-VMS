import { Button, Drawer, Grid2 as Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import {
  IconCalendar,
  IconCheck,
  IconCircleX,
  IconDownload,
  IconForbid2,
  IconLogin,
  IconLogout,
  IconReport,
} from '@tabler/icons-react';
import React, { useEffect, useRef, useState } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import TopCard from './TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import Heatmap from './Heatmap';
import PieCharts from './PieCharts';
import { useNavigate } from 'react-router';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import { setDateRange } from 'src/store/apps/Daterange/dateRangeSlice';
import Calendar from 'src/customs/components/calendar/Calendar';
import { useQuery } from '@tanstack/react-query';
import {
  approveTicket,
  getApprovalTicket,
  rejectTicket,
} from 'src/customs/api/Admin/ApprovalWorkflow';
import Swal from 'sweetalert2';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const DashboardEmployee = () => {
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
  const { token } = useSession();
  const [loading, setLoading] = useState(false);
  const [activeInvitation, setActiveInvitation] = useState<any[]>([]);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const start = page * rowsPerPage;
  const {
    data: approvalRes,
    refetch: refetchApproval,
    isFetching: loadingApproval,
  } = useQuery({
    queryKey: ['approval-ticket', page, rowsPerPage, searchKeyword, sortDir],
    queryFn: async () => {
      return await getApprovalTicket(token as string, start, rowsPerPage, sortDir, searchKeyword);
    },
    enabled: !!token,
  });

  const approvalData =
    approvalRes?.collection?.map(
      ({
        approval_ticket_id,
        visitor_type_name,
        agenda,
        host_name,
        approval_actor_status,
        approval_workflow_type,
        approval_status,
        // current_step,
        visitor_period_start,
        visitor_period_end,
      }: any) => ({
        id: approval_ticket_id,
        visitor_type_name,
        agenda,
        host_name,
        approval_actor_status,
        approval_workflow_type,
        approval_status,
        // current_step,
        visitor_period_start,
        visitor_period_end: formatDateTime(visitor_period_end),
      }),
    ) || [];

  const moveApproval = () => {
    navigate('/manager/approval');
  };

  const moveReport = () => {
    navigate('/manager/report');
  };

  const handleActionApproval = async (id: string, action: 'Approve' | 'Reject') => {
    if (!id || !token) return;

    try {
      const confirm = await Swal.fire({
        title: `Do you want to ${action === 'Approve' ? 'Approve' : 'Reject'} this approval?`,
        icon: 'question',
        // imageUrl: BI_LOGO,
        imageWidth: 100,
        imageHeight: 100,
        showCancelButton: true,
        confirmButtonText: action === 'Approve' ? 'Yes' : 'No',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        confirmButtonColor: action === 'Approve' ? '#4caf50' : '#f44336',
        customClass: {
          title: 'swal2-title-custom',
          htmlContainer: 'swal2-text-custom',
        },
      });

      if (!confirm.isConfirmed) return;

      setTimeout(() => setLoading(true), 800);

      // await createApproval(token, { action }, id);
      if (action === 'Approve') await approveTicket(token, id);
      if (action === 'Reject') await rejectTicket(token, id);
      setTimeout(() => {
        showSwal(
          'success',
          `Data Approval ${action === 'Approve' ? 'approved' : 'rejected'} successfully.`,
        );
      }, 850);

      setTimeout(() => setLoading(false), 200);

      // setRefreshTrigger((prev) => prev + 1);
      await refetchApproval();
    } catch (error: any) {
      setTimeout(() => setLoading(false), 800);
      showSwal('error', error.message ?? 'Failed to action approval.');
    }
  };

  const dispatch = useDispatch();

  const { startDate, endDate } = useSelector((state: any) => state.dateRange);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClose = () => setAnchorEl(null);
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
    <PageContainer title="Dashboard" description="This is Manager Dashboard">
      <Grid container spacing={3} alignItems="center" justifyContent="space-between" mb={1}>
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
            {`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}
          </Button>

          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<IconDownload />}
            onClick={handleExportPdf}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>

          <Drawer open={open} anchor="right" onClose={handleClose}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" mb={1}>
                Select Date Range
              </Typography>
              <Calendar
                value={{ startDate, endDate }}
                onChange={(selection: any) => {
                  dispatch(
                    setDateRange({
                      startDate: selection.startDate,
                      endDate: selection.endDate,
                    }),
                  );
                  handleClose();
                }}
              />
            </Box>
          </Drawer>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 0 }} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 9 }}>
          <TopCard items={CardItems} size={{ xs: 12, lg: 3 }} />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }} sx={{ display: 'flex' }}>
          <Box display={'flex'} flexDirection={'column'} width="100%" height="100%" gap={1}>
            <Button
              variant="contained"
              color="primary"
              onClick={moveApproval}
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <IconCheck size={30} />
              Approval
            </Button>
            <Button
              variant="outlined"
              color="primary"
              // onClick={handleOpenScanQR}
              onClick={moveReport}
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                backgroundColor: 'white',
                ':hover': {
                  backgroundColor: 'rgba(232, 232, 232, 0.8)',
                  color: 'primary.main',
                },
              }}
            >
              <IconReport size={30} />
              Report
            </Button>
          </Box>
        </Grid>

        {/* Tabel */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <DynamicTable
            height={490}
            isHavePagination={false}
            overflowX="auto"
            data={activeInvitation}
            isHaveChecked={false}
            isHaveAction={false}
            isHaveHeaderTitle
            titleHeader="Active Visit"
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <DynamicTable
            height={490}
            isHavePagination={false}
            overflowX="auto"
            data={approvalData}
            isHaveChecked={true}
            // defaultRowsPerPage={rowsPerPage}
            // rowsPerPageOptions={[10, 20, 100]}
            // onPaginationChange={(page, rowsPerPage) => {
            //   setPage(page);
            //   setRowsPerPage(rowsPerPage);
            // }}
            isHaveAction={true}
            isHaveHeaderTitle
            titleHeader="Approval"
            isHaveApproval={true}
            onAccept={(row: any) => handleActionApproval(row.id, 'Approve')}
            onDenied={(row: any) => handleActionApproval(row.id, 'Reject')}
            isHavePeriod={true}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <PieCharts />
        </Grid>
        {/* <Grid size={{ xs: 12, lg: 3 }} sx={{ height: '100%' }}>
          <PieChartsEmployee />
        </Grid> */}
        <Grid size={{ xs: 12, lg: 6 }} sx={{ height: '100%' }}>
          <Heatmap />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default DashboardEmployee;
