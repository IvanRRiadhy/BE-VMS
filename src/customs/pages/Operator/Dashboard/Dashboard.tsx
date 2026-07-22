import { Grid2 as Grid } from '@mui/material';

import { IconCircleMinus, IconLogin, IconLogout, IconX } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
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
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [openQuickAccess, setOpenQuickAccess] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [quickPage, setQuickPage] = useState(0);
  const [quickRowsPerPage, setQuickRowsPerPage] = useState(10);

  const { data: quickAccessResult } = useQuery({
    queryKey: ['quick-access', quickPage, quickRowsPerPage, quickSearch],
    queryFn: async () => {
      const res = await getAllVisitorPagination(
        quickPage * quickRowsPerPage,
        quickRowsPerPage,
        quickSearch || undefined,
        undefined,
        undefined,
        'QuickAccess',
      );

      return res;
    },
  });

  const processedQuickAccessData = useMemo(() => {
    if (!quickAccessResult?.collection) return [];

    return quickAccessResult.collection
      .map((item: any) => {
        const isExpired =
          item.visitor_period_end && dayjs(item.visitor_period_end).isBefore(dayjs(), 'day');

        return {
          id: item.id,
          visitor_type: item.visitor_type_name || '-',
          name_courier: item.visitor_name || '-',
          // identity_id: item.visitor_identity_id || '-',
          email: item.visitor_email || '-',
          organization: item.visitor_organization_name || '-',
          receiver_name: item.receiver_name || '-',
          invitation_code: item.invitation_code || '-',
          phone: item.visitor_phone || '-',
          visitor_period_start: item.visitor_period_start || '-',
          visitor_period_end: formatDateTime(item.visitor_period_end, item.extend_visitor_period),
          invitation_created_at: item.invitation_created_at,
          host: item.host ?? '-',
          visitor_status: isExpired ? 'Expired' : item.visitor_status || '-',
        };
      })
      .sort((a: any, b: any) => {
        const dateA = a.invitation_created_at ?? a.visitor_period_start;
        const dateB = b.invitation_created_at ?? b.visitor_period_start;

        return dayjs(dateB).valueOf() - dayjs(dateA).valueOf();
      })
      .map(({ invitation_created_at, ...rest }: any) => rest);
  }, [quickAccessResult]);

  const queryClient = useQueryClient();

  const handleCreateQuickAccess = async (payload: any) => {
    try {
      // setIsGenerating(true);
      setLoadingAccess(true);
      await createQuickAccess(payload);

      showSwal('success', 'Quick access created successfully');

      // setOpenQuickAccess(false);
      await queryClient.invalidateQueries({ queryKey: ['quick-access'] });
    } catch (error: any) {
      showSwal('error', error?.response?.data?.message || 'Failed to create quick access');

      throw error;
    } finally {
      // setIsGenerating(false);
      setLoadingAccess(false);
    }
  };

  const handleQuickSearch = useCallback((keyword: string) => {
    setQuickPage(0);
    setQuickSearch(keyword);
  }, []);

  return (
    <Container title="Dashboard">
      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Grid size={{ xs: 12, lg: 12 }}>
          {/* <TopCards items={CardItems} size={{ xs: 12, sm: 6, md: 4, xl: 2.4 }} /> */}
          <TopCardsUI onOpenQuick={setOpenQuickAccess} />
        </Grid>
        <Grid size={{ xs: 12, lg: 12 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 4 }}>
              <JustCheckInCard />
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <ExpectedVisitorsCard />
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <PendingVisitsCard />
            </Grid>

            <Grid size={{ xs: 12, lg: 8 }}>
              <VisitorStatistics />
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <PieChartsEmployee title="Visitor" />
            </Grid>

            <Grid size={{ xs: 12, lg: 12 }}>
              <LastVisitsCard />
            </Grid>

            {/* Kolom kanan (panel panjang ke bawah) */}
            {/* <Grid size={{ xs: 12, lg: 4 }}>
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
            </Grid> */}
          </Grid>
        </Grid>
      </Grid>

      <QuickAccessDialog
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
      />
      <GlobalBackdropLoading open={loadingAccess} />
    </Container>
  );
};

export default DashboardOperator;
