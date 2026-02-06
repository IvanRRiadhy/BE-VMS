import {
  Avatar,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2 as Grid,
  IconButton,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import {
  IconBan,
  IconBrandGmail,
  IconBuildingSkyscraper,
  IconCalendarTime,
  IconCalendarUp,
  IconCamera,
  IconCar,
  IconCheck,
  IconCheckupList,
  IconCircleOff,
  IconForbid2,
  IconGenderMale,
  IconHome,
  IconIdBadge2,
  IconLicense,
  IconLogin,
  IconLogin2,
  IconLogout,
  IconMapPin,
  IconNumbers,
  IconQrcode,
  IconReport,
  IconTicket,
  IconUser,
  IconUsersGroup,
  IconX,
} from '@tabler/icons-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import PageContainer from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import CloseIcon from '@mui/icons-material/Close';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import { IconPhone } from '@tabler/icons-react';
import { IconCalendarEvent } from '@tabler/icons-react';
import { IconUserCheck } from '@tabler/icons-react';
import VisitorStatusPieChart from '../Guest/Components/charts/VisitorStatusPieChart';
import VisitorHeatMap from 'src/customs/components/charts/VisitorHeatMap';
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
  const cards = [
    { title: 'Check In', icon: IconLogin, subTitle: `0`, subTitleSetting: 10, color: 'none' },
    { title: 'Check Out', icon: IconLogout, subTitle: `0`, subTitleSetting: 10, color: 'none' },
    { title: 'Denied', icon: IconCircleOff, subTitle: `0`, subTitleSetting: 10, color: 'none' },
    { title: 'Block', icon: IconBan, subTitle: `0`, subTitleSetting: 10, color: 'none' },
  ];

  const { token } = useSession();

  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);
  const [openDetailQRCode, setOpenDetailQRCode] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [qrMode, setQrMode] = useState<'manual' | 'scan'>('manual');
  const [hasDecoded, setHasDecoded] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [approvalData, setApprovalData] = useState<any[]>([]);
  const scanContainerRef = useRef<HTMLDivElement | null>(null);
  const [activeInvitation, setActiveInvitation] = useState<any[]>([]);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleOpenScanQR = () => setOpenDialogIndex(1);
  const handleCloseScanQR = () => {
    try {
      const video = scanContainerRef.current?.querySelector('video') as HTMLVideoElement | null;
      const stream = video?.srcObject as MediaStream | null;
      const track = stream?.getVideoTracks()?.[0];
      const caps = track?.getCapabilities?.() as any;
      if (track && caps?.torch && torchOn) {
        track.applyConstraints({ advanced: [{ facingMode: 'user' }] });
      }
    } catch {}

    setTorchOn(false);
    setFacingMode('environment');
    setQrMode('manual');
    setHasDecoded(false);
    setQrValue('');
    setOpenDialogIndex(null);
  };

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
          <TopCard items={cards} size={{ xs: 12, lg: 3 }} />
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
