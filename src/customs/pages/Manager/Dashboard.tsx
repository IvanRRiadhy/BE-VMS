import {
  Avatar,
  Button,
  Grid2 as Grid,
} from '@mui/material';
import { Box } from '@mui/system';
import {
  IconBan,
  IconCheck,
  IconCircleX,
  IconForbid2,
  IconLogin,
  IconLogin2,
  IconLogout,
  IconReport,
} from '@tabler/icons-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import PageContainer from 'src/components/container/PageContainer';
import TopCard from './Dashboard/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import Heatmap from './Heatmap';
import PieCharts from './PieCharts';
import { getAllApprovalDT, getApproval } from 'src/customs/api/employee';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import PieChartsEmployee from './PieChartsEmployee';
import { getActiveInvitation } from 'src/customs/api/visitor';
import moment from 'moment';

const DashboardEmployee = () => {
  // const cards = [
  //   { title: 'Check In', icon: IconLogin, subTitle: `0`, subTitleSetting: 10, color: 'none' },
  //   { title: 'Check Out', icon: IconLogout, subTitle: `0`, subTitleSetting: 10, color: 'none' },
  //   { title: 'Denied', icon: IconCircleOff, subTitle: `0`, subTitleSetting: 10, color: 'none' },
  //   { title: 'Block', icon: IconBan, subTitle: `0`, subTitleSetting: 10, color: 'none' },
  // ];

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
  const [approvalData, setApprovalData] = useState<any[]>([]);
  const [activeInvitation, setActiveInvitation] = useState<any[]>([]);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const formatDate = (date?: string) => {
    if (!date) return '-'; // fallback kalau kosong
    return moment.utc(date).local().format('DD-MM-YYYY, HH:mm');
  };

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const startDate = dayjs().subtract(30, 'day').format('YYYY-MM-DD');
        const endDate = dayjs().add(30, 'day').format('YYYY-MM-DD');
        const start = page * rowsPerPage;
        // 🚀 Ambil data approval tanpa pagination
        // const response = await getApproval(
        //   token as string,
        //   startDate,
        //   endDate,
        //   false,
        //   null as any,
        //   null as any,
        // );
        // console.log(response.collection);
        const response = await getAllApprovalDT(
          token as string,
          start,
          rowsPerPage,
          // sortColumn,
          sortDir,
          searchKeyword,
          startDate,
          endDate,
          // filters.is_action ?? undefined,
          // filters.site_approval ?? undefined,
          // filters.approval_type || undefined,
        );

        // 🧩 Mapping data approval untuk tabel
        const mappedData = response.collection.map((item: any) => {
          const trx = item.trx_visitor || {};

          return {
            id: item.id,
            visitor_name: item.visitor?.name || '-',
            // site_place_name: trx.site_place_name || '-',
            agenda: trx.agenda || '-',
            visitor_period_start: trx.visitor_period_start || '-',
            // visitor_period_end: formatDateTime(item.visitor_period_end, item.extend_visitor_period),
            visitor_period_end: formatDate(trx.visitor_period_end),
            action_by: item.action_by || '-',
            status: item.action,
          };
        });

        setApprovalData(mappedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // useEffect(() => {
  //   const fetchDataActiveInvtiation = async () => {
  //     try {
  //       const response = await getActiveInvitation(token as string);
  //       // console.log(response);

  //       let rows = response.collection.map((item: any) => ({
  //         id: item.id,
  //         // visitor_type:  item.visitor_type_name,
  //         name: item.visitor.name,
  //         email: item.visitor.email,
  //         organization: item.visitor.organization,
  //         visitor_period_start: item.visitor_period_start,
  //         visitor_period_end: formatDateTime(item.visitor_period_end, item.extend_visitor_period),
  //         host: item.host_name ?? '-',
  //         // visitor_status: item.visitor_status,
  //       }));
  //       setActiveInvitation(rows || []);
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     }
  //   };

  //   fetchDataActiveInvtiation();
  // }, [token]);

  const moveApproval = () => {
    navigate('/manager/approval');
  };

  const moveReport = () => {
    navigate('/manager/report');
  };

  return (
    <PageContainer title="Dashboard Manager" description="This is Manager Dashboard">
      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Grid size={{ xs: 12, lg: 9 }}>
          <TopCard items={CardItems} size={{ xs: 12, lg: 3 }} />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <Box display={'flex'} flexDirection={'column'} width={'100%'} gap={1}>
            <Button variant="contained" color="primary" onClick={moveApproval}>
              <IconCheck size={30} />
              Approval
            </Button>
            <Button
              variant="outlined"
              color="primary"
              // onClick={handleOpenScanQR}
              onClick={moveReport}
              sx={{
                backgroundColor: 'white',
                ':hover': { backgroundColor: 'rgba(232, 232, 232, 0.8)', color: 'primary.main' },
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
            height={470}
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
            height={470}
            isHavePagination={true}
            overflowX="auto"
            data={approvalData}
            isHaveChecked={false}
            defaultRowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10, 20, 100]}
            onPaginationChange={(page, rowsPerPage) => {
              setPage(page);
              setRowsPerPage(rowsPerPage);
            }}
            isHaveAction={true}
            isHaveHeaderTitle
            titleHeader="Approval"
            isHaveApproval={true}
            isHavePeriod={true}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <PieCharts />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }} sx={{ height: '100%' }}>
          <PieChartsEmployee />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }} sx={{ height: '100%' }}>
          <Heatmap />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default DashboardEmployee;
