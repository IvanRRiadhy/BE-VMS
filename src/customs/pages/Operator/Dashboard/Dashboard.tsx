import { Box, Grid2 as Grid } from '@mui/material';

import { IconCircleMinus, IconLogin, IconLogout, IconX } from '@tabler/icons-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import Container from 'src/components/container/PageContainer';
import { IconUsersGroup } from '@tabler/icons-react';
import PieChartsEmployee from '../../Manager/Dashboard/PieChartsEmployee';
import VisitorStatistics from './components/VisitorStatics';
import JustCheckInCard from './components/JustCheckInCard';
import ExpectedVisitorsCard from './components/ExpectedVisitorCard';
import PendingVisitsCard from './components/PendingVisitCard';
import LastVisitsCard from './components/LastVisitData';
import TopCardsUI from './components/TopCardsUi';
import { QuickAccessDialog } from '../../admin/content/Visitor/Trx/components/QuickAccessDialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllVisitorPagination } from 'src/customs/api/admin';
import dayjs from 'dayjs';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import { createQuickAccess } from 'src/customs/api/Admin/Visitor';
import { showSwal } from 'src/customs/components/alerts/alerts';
import GlobalBackdropLoading from '../Components/GlobalBackdrop';
import DashboardEmployeeActionBar from '../../Employee/Components/DashboardEmployeeActionBar';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { setDateRange } from 'src/store/apps/Daterange/dateRangeSlice';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useActivities } from 'src/hooks/Dashboard/useActivity';
import TopVisitingPurposeChart from 'src/customs/components/charts/TopVisitingPurposeChart';
import { useUpcomingPurpose } from 'src/hooks/Operator/upComingPurpose';
import UpcomingPurposeChart from './components/UpcomingPurposeChart';
import VisitorFluctuationChart from 'src/customs/components/charts/VisitorFluctuationChart';
import { useProfile } from 'src/hooks/Profile/useProfile';

const DashboardOperator = () => {
  const CardItems = [
    { title: 'checkin', key: 'Checkin', icon: <IconLogin size={25} /> },
    { title: 'checkout', key: 'Checkout', icon: <IconLogout size={25} /> },
    { title: 'denied', key: 'Denied', icon: <IconX size={25} /> },
    { title: 'block', key: 'Block', icon: <IconCircleMinus size={25} /> },
    // { title: 'waiting', key: 'waiting', icon: <IconHourglass size={25} /> },
    {
      title: 'blacklist',
      key: 'blacklist',
      icon: <IconUsersGroup size={22} />,
    },
  ];
  const dispatch = useDispatch();
  const { data: profile } = useProfile();

  const { startDate, endDate } = useSelector((state: any) => state.dateRange);
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [openQuickAccess, setOpenQuickAccess] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [quickPage, setQuickPage] = useState(0);
  const [quickRowsPerPage, setQuickRowsPerPage] = useState(10);

  // const { data: quickAccessResult } = useQuery({
  //   queryKey: ['quick-access', quickPage, quickRowsPerPage, quickSearch],
  //   queryFn: async () => {
  //     const res = await getAllVisitorPagination(
  //       quickPage * quickRowsPerPage,
  //       quickRowsPerPage,
  //       quickSearch || undefined,
  //       undefined,
  //       undefined,
  //       'QuickAccess',
  //     );

  //     return res;
  //   },
  // });

  // const processedQuickAccessData = useMemo(() => {
  //   if (!quickAccessResult?.collection) return [];

  //   return quickAccessResult.collection
  //     .map((item: any) => {
  //       const isExpired =
  //         item.visitor_period_end && dayjs(item.visitor_period_end).isBefore(dayjs(), 'day');

  //       return {
  //         id: item.id,
  //         visitor_type: item.visitor_type_name || '-',
  //         name_courier: item.visitor_name || '-',
  //         // identity_id: item.visitor_identity_id || '-',
  //         email: item.visitor_email || '-',
  //         organization: item.visitor_organization_name || '-',
  //         receiver_name: item.receiver_name || '-',
  //         invitation_code: item.invitation_code || '-',
  //         phone: item.visitor_phone || '-',
  //         visitor_period_start: item.visitor_period_start || '-',
  //         visitor_period_end: formatDateTime(item.visitor_period_end, item.extend_visitor_period),
  //         invitation_created_at: item.invitation_created_at,
  //         host: item.host ?? '-',
  //         visitor_status: isExpired ? 'Expired' : item.visitor_status || '-',
  //       };
  //     })
  //     .sort((a: any, b: any) => {
  //       const dateA = a.invitation_created_at ?? a.visitor_period_start;
  //       const dateB = b.invitation_created_at ?? b.visitor_period_start;

  //       return dayjs(dateB).valueOf() - dayjs(dateA).valueOf();
  //     })
  //     .map(({ invitation_created_at, ...rest }: any) => rest);
  // }, [quickAccessResult]);

  // const queryClient = useQueryClient();

  // const handleCreateQuickAccess = async (payload: any) => {
  //   try {
  //     // setIsGenerating(true);
  //     setLoadingAccess(true);
  //     await createQuickAccess(payload);

  //     showSwal('success', 'Quick access created successfully');

  //     // setOpenQuickAccess(false);
  //     await queryClient.invalidateQueries({ queryKey: ['quick-access'] });
  //   } catch (error: any) {
  //     showSwal('error', error?.response?.data?.message || 'Failed to create quick access');

  //     throw error;
  //   } finally {
  //     // setIsGenerating(false);
  //     setLoadingAccess(false);
  //   }
  // };

  // const handleQuickSearch = useCallback((keyword: string) => {
  //   setQuickPage(0);
  //   setQuickSearch(keyword);
  // }, []);

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

      // const formatDate = (date: Date) => date.toISOString().split('T')[0];
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
      };
      const start = formatDate(startDate);
      const end = formatDate(endDate);

      pdf.save(`Dashboard Report-${start}_to_${end}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const {
    data,
    isLoading: isLoadingActivities,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useActivities({
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
  });

  const activites = data?.activities ?? [];

  const upcomingPurposeQuery = useUpcomingPurpose();
  const upcomingPurpose = upcomingPurposeQuery.data ?? [];
  return (
    <Container title="Dashboard">
      <Grid container spacing={1} sx={{ mt: 0 }}>
        {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}> */}
        <Box sx={{ width: '100%' }}>
          <DashboardEmployeeActionBar
            startDate={startDate}
            endDate={endDate}
            profile={profile}
            onDateChange={(startDate, endDate) => {
              dispatch(
                setDateRange({
                  startDate,
                  endDate,
                }),
              );
            }}
            onExport={handleExportPdf}
            isExporting={isExporting}
          />
        </Box>
        {/* </Box> */}
        <Grid size={{ xs: 12, lg: 12 }}>
          {/* <TopCards items={CardItems} size={{ xs: 12, sm: 6, md: 4, xl: 2.4 }} /> */}
          <TopCardsUI onOpenQuick={setOpenQuickAccess} />
        </Grid>
        <Grid size={{ xs: 12, lg: 12 }} sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <ExpectedVisitorsCard />
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              {/* <JustCheckInCard /> */}
              <UpcomingPurposeChart data={upcomingPurpose} />
            </Grid>

            {/* <Grid size={{ xs: 12, lg: 4 }}>
              <PendingVisitsCard />
            </Grid> */}

            <Grid size={{ xs: 12, lg: 6 }}>
              <VisitorStatistics />
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              {/* <TopVisitingPurposeChart /> */}
              <VisitorFluctuationChart />
            </Grid>

            <Grid size={{ xs: 12, lg: 12 }}>
              <LastVisitsCard
                activites={activites}
                loading={isLoadingActivities}
                loadingMore={isFetchingNextPage}
                hasNextPage={hasNextPage}
                onLoadMore={fetchNextPage}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* <QuickAccessDialog
        open={openQuickAccess}
        onClose={() => setOpenQuickAccess(false)}
        visitorTableData={processedQuickAccessData}
        onSubmit={handleCreateQuickAccess}
        page={quickPage}
        setPage={setQuickPage}
        setRowsPerPage={setQuickRowsPerPage}
        searchKeyword={quickSearch}
        onSearch={handleQuickSearch}
        totalCount={quickAccessResult?.RecordsFiltered ?? 0}
      /> */}
      <GlobalBackdropLoading open={loadingAccess} />
    </Container>
  );
};

export default DashboardOperator;
