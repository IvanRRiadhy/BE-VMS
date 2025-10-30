import {
  Avatar,
  Backdrop,
  Button,
  Card,
  CardContent,
  CircularProgress,
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
import moment from 'moment-timezone';
import {
  IconBan,
  IconBellRingingFilled,
  IconCards,
  IconCheck,
  IconCircleOff,
  IconLogin,
  IconLogin2,
  IconLogout,
  IconPlus,
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
import { getApproval } from 'src/customs/api/employee';
import dayjs from 'dayjs';
import { getActiveInvitation, getInvitation, getOngoingInvitation } from 'src/customs/api/visitor';
import FormDialogInvitation from './FormDialogInvitation';
import { useNavigate } from 'react-router';
import { getAccessPass } from 'src/customs/api/admin';
import { Download } from '@mui/icons-material';
// import OperatorPieChart from './Charts/OperatorPieChart';

const DashboardEmployee = () => {
  const cards = [
    { title: 'Check In', icon: IconLogin, subTitle: `0`, subTitleSetting: 10, color: 'none' },
    { title: 'Check Out', icon: IconLogout, subTitle: `0`, subTitleSetting: 10, color: 'none' },
    { title: 'Denied', icon: IconCircleOff, subTitle: `0`, subTitleSetting: 10, color: 'none' },
    { title: 'Block', icon: IconBan, subTitle: `0`, subTitleSetting: 10, color: 'none' },
  ];

  const { token } = useSession();

  const tableRowColumn = [
    {
      id: 1,
      Name: 'Andi Prasetyo',
      'Visit Time': '2025-06-13T09:00:00',
      Purpose: 'Meeting',
      'Purpose Person': 'Bapak Joko',
    },
    {
      id: 2,
      Name: 'Siti Aminah',
      'Visit Time': '2025-06-13T10:30:00',
      Purpose: 'Interview',
      'Purpose Person': 'Ibu Rina',
    },
    {
      id: 3,
      Name: 'Budi Santoso',
      'Visit Time': '2025-06-13T11:15:00',
      Purpose: 'Pengantaran Dokumen',
      'Purpose Person': 'Pak Dedi',
    },
    {
      id: 4,
      Name: 'Rina Marlina',
      'Visit Time': '2025-06-13T13:45:00',
      Purpose: 'Audit',
      'Purpose Person': 'Bu Intan',
    },
    {
      id: 5,
      Name: 'Fajar Nugroho',
      'Visit Time': '2025-06-13T15:00:00',
      Purpose: 'Maintenance',
      'Purpose Person': 'Pak Wahyu',
    },
  ];

  // ✅ state untuk buka tutup dialog QR
  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);
  const [openDetailQRCode, setOpenDetailQRCode] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  // QR Scanner state
  const [qrValue, setQrValue] = useState('');
  const [qrMode, setQrMode] = useState<'manual' | 'scan'>('manual');
  const [hasDecoded, setHasDecoded] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const scanContainerRef = useRef<HTMLDivElement | null>(null);
  const [openDialogInvitation, setOpenDialogInvitation] = useState(false);
  const [approvalData, setApprovalData] = useState<any[]>([]);
  const [invitationDetailVisitor, setInvitationDetailVisitor] = useState<any[]>([]);
  const [activeInvitation, setActiveInvitation] = useState<any[]>([]);
  const [invitationList, setInvitationList] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null);
  const [alertInvitationData, setAlertInvitationData] = useState<any | null>(null);
  const [openAlertInvitation, setOpenAlertInvitation] = useState(false);
  const [pendingInvitationCount, setPendingInvitationCount] = useState(0);
  const [openAccess, setOpenAccess] = useState(false);
  const [activeAccessPass, setActiveAccessPass] = useState<any>();
  const handleOpenAccess = () => {
    setOpenAccess(true);
  };

  const handleCloseAccess = () => {
    setOpenAccess(false);
  };

  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchDataActiveInvtiation = async () => {
      try {
        const response = await getActiveInvitation(token as string);
        console.log(response);

        let rows = response.collection.map((item: any) => ({
          id: item.id,
          // visitor_type:  item.visitor_type_name,
          name: item.visitor.name,
          // identity_id: item.visitor.identity_id,
          email: item.visitor.email,
          organization: item.visitor.organization,
          // gender: item.visitor.gender,
          // address: item.visitor.address,
          // phone: item.visitor.phone,
          // is_vip: item.visitor.is_vip,
          visitor_period_start: item.visitor_period_start,
          visitor_period_end: item.visitor_period_end,
          host: item.host_name ?? '-',
          // visitor_status: item.visitor_status,
        }));
        setActiveInvitation(rows || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchDataActiveInvtiation();
  }, [token]);

  // useEffect(() => {
  //   if (!token) return;

  //   const fetchData = async () => {
  //     try {
  //       setLoading(true);

  //       // 📅 Ambil range tanggal dinamis (30 hari ke belakang & ke depan)
  //       const startDate = dayjs().subtract(30, 'day').format('YYYY-MM-DD');
  //       const endDate = dayjs().add(30, 'day').format('YYYY-MM-DD');

  //       // 🚀 Ambil data approval tanpa pagination
  //       const response = await getApproval(
  //         token as string,
  //         startDate,
  //         endDate,
  //         false,
  //         null as any,
  //         null as any,
  //       );

  //       const res = await getInvitation(token as string, startDate, endDate, false);

  //       setInvitationList(res?.collection ?? []);

  //       // 🧩 Mapping data ke bentuk siap tampil
  //       const mappedData = response.collection.map((item: any) => {
  //         const trx = item.trx_visitor || {};

  //         const visitor_period_start =
  //           trx.visitor.visitor_period_start && trx.visitor.visitor_period_start !== 'Invalid date'
  //             ? trx.visitor.visitor_period_start
  //             : '-';

  //         const visitor_period_ends =
  //           trx.visitor.visitor_period_end && trx.visitor.visitor_period_end !== 'Invalid date'
  //             ? trx.visitor.visitor_period_end
  //             : '-';

  //         return {
  //           id: item.id,
  //           visitor_name: item.visitor?.name || '-',
  //           site_place_name: trx.site_place_name || '-',
  //           agenda: trx.agenda || '-',
  //           visitor_period_start,
  //           visitor_period_ends,
  //           action_by: item.action_by || '-',
  //           status: item.action || '-',
  //         };
  //       });

  //       setApprovalData(mappedData);
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [token]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // 📅 Ambil range tanggal dinamis (30 hari ke belakang & ke depan)
        const startDate = dayjs().subtract(30, 'day').format('YYYY-MM-DD');
        const endDate = dayjs().add(30, 'day').format('YYYY-MM-DD');

        // 🚀 Ambil data approval tanpa pagination
        const response = await getApproval(
          token as string,
          startDate,
          endDate,
          false,
          null as any,
          null as any,
        );
        console.log(response.collection);

        // // 🚀 Ambil semua invitation
        // const res = await getInvitation(token as string, startDate, endDate);

        // const invitationData = res?.collection ?? [];
        // console.log('Invitation data:', invitationData);

        // // 🧩 Simpan semua data ke state utama
        // setInvitationList(invitationData);

        // // 🔍 Filter invitation yang belum preregister (is_pregister_done = null)
        // const notDoneInvitations = invitationData.filter(
        //   (inv: any) => inv.is_praregister_done === null,
        // );

        // // ✅ Ambil invitation terakhir (index terbesar)
        // if (notDoneInvitations.length > 0) {
        //   const latestIndex = notDoneInvitations.length - 1;
        //   setAlertInvitationData(notDoneInvitations[latestIndex]);
        //   setOpenAlertInvitation(true);
        // }

        // 🧩 Mapping data approval untuk tabel
        const mappedData = response.collection.map((item: any) => {
          const trx = item.trx_visitor || {};

          // const visitor_period_start =
          //   trx.visitor.visitor_period_start && trx.visitor.visitor_period_start !== 'Invalid date'
          //     ? trx.visitor.visitor_period_start
          //     : '-';

          // const visitor_period_ends =
          //   trx.visitor.visitor_period_end && trx.visitor.visitor_period_end !== 'Invalid date'
          //     ? trx.visitor.visitor_period_end
          //     : '-';

          return {
            id: item.id,
            visitor_name: item.visitor?.name || '-',
            site_place_name: trx.site_place_name || '-',
            agenda: trx.agenda || '-',
            visitor_period_start: trx.visitor_period_start || '-',
            visitor_period_end: trx.visitor_period_end || '-',
            action_by: item.action_by || '-',
            status: item.action || '-',
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

  useEffect(() => {
    if (!token) return;

    const fetchInvitation = async () => {
      try {
        const startDate = dayjs().subtract(0, 'day').format('YYYY-MM-DD');
        const endDate = dayjs().format('YYYY-MM-DD');

        console.log('🚀 Fetching invitations...');
        const res = await getInvitation(token as string, startDate, endDate);
        const invitationData = res?.collection ?? [];

        console.log('✅ Invitation response:', invitationData);

        setInvitationList(invitationData);

        // const notDoneInvitations = invitationData.filter(
        //   (inv: any) => inv.is_praregister_done === null,
        // );

        // if (notDoneInvitations.length > 0) {
        //   const latest = notDoneInvitations[0];
        //   setAlertInvitationData(latest);
        //   setOpenAlertInvitation(true);
        // }
      } catch (error) {
        console.error('❌ Error fetching invitation:', error);
      }
    };

    fetchInvitation();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const res = await getOngoingInvitation(token as string);
        const data = res?.collection ?? [];

        // 🔍 Filter hanya yang belum pra-register
        const filtered = data.filter(
          (item: any) => item.is_praregister_done === false || item.is_praregister_done === null,
        );

        const mapped = filtered.map((item: any) => ({
          id: item.id,
          // visitor_type: visitorTypes[item.visitor_type] || item.visitor_type,
          name: item.visitor.name,
          email: item.visitor.email,
          organization: item.visitor.organization,
          visitor_period_start: item.visitor_period_start,
          visitor_period_end: item.visitor_period_end,
          host: item.host_name ?? '-',
          // visitor_status: item.visitor_status,
        }));

        setInvitationDetailVisitor(mapped);

        const notDoneInvitations = data.filter(
          (inv: any) => inv.is_praregister_done === null || inv.is_praregister_done === false,
        );

        if (notDoneInvitations.length > 0) {
          setPendingInvitationCount(notDoneInvitations.length);
          setOpenAlertInvitation(true);
        }

        // setInvitationDetailVisitor(filtered);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const resAccess = await getAccessPass(token as string);
        console.log('res', resAccess.collection.data);
        setActiveAccessPass(resAccess.collection);
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
  }, [token]);

  const handleView = (row: any) => {
    // misalnya row.id berisi ID invitation
    setSelectedInvitationId(row.id);
    setOpenDialogInvitation(true);
  };

  const moveApproval = () => {
    navigate('/employee/approval');
  };

  const moveInvitation = () => {
    navigate('/employee/invitation');
  };

  function formatVisitorPeriodLocal(startUtc: string, endUtc: string) {
    const startLocal = moment.utc(startUtc).tz(moment.tz.guess()).format('YYYY-MM-DD HH:mm');
    const endLocal = moment.utc(endUtc).tz(moment.tz.guess()).format('YYYY-MM-DD HH:mm');
    return `${startLocal} - ${endLocal}`;
  }

  return (
    <PageContainer title="Dashboard Employee">
      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Grid size={{ xs: 12, lg: 9 }}>
          <TopCard items={cards} size={{ xs: 12, lg: 6 }} />
        </Grid>
        {/* <Grid size={{ xs: 12, lg: 3 }} sx={{ display: 'flex' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: '100%',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={moveInvitation}
              sx={{
                borderRadius: 1,
                fontSize: '1rem',
              }}
            >
              <IconPlus size={20} />
              Send Invitation
            </Button>
            <Button
              variant="outlined"
              color="primary"
              sx={{
                backgroundColor: 'white',
                ':hover': { backgroundColor: 'rgba(232, 232, 232, 0.8)', color: 'primary.main' },
              }}
              onClick={moveApproval}
            >
              <IconCheck size={30} />
              Approval
            </Button>
          </Box>
        </Grid> */}

        <Grid
          size={{ xs: 12, md: 3 }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Card
            sx={{
              flex: 1, // ✅ biar isi Card stretch penuh
              display: 'flex',
              justifyContent: '',
              alignItems: 'center',
              flexDirection: 'column',
              cursor: 'pointer',
              gap: 1,
            }}
            onClick={handleOpenAccess}
          >
            {/* <Box
              sx={{
                p: 1, // padding biar QR-nya ada jarak dari pinggir background
                backgroundColor: '#ffffff', // 🔹 warna background QR
                borderRadius: 2, // rounded biar halus
                boxShadow: '0px 2px 8px rgba(0,0,0,0.15)', // optional shadow
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QRCode
                value={activeAccessPass?.visitor_number || ''}
                size={40}
                style={{
                  height: 'auto',
                  width: '100px',
                }}
              />
            </Box>
            <Typography variant="body1" fontWeight={'600'} color="primary">
              Tap to show detail
            </Typography> */}
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
                    size={40}
                    style={{
                      height: 'auto',
                      width: '100px',
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
                  // p: 1,
                  // backgroundColor: '#ffffff',
                  // borderRadius: 2,
                  // boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
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
        </Grid>

        {/* Tabel */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <DynamicTable
            height={420}
            isHavePagination={false}
            overflowX="auto"
            data={activeInvitation}
            isHaveChecked={false}
            isHavePeriod={true}
            isHaveAction={false}
            isHaveHeaderTitle
            titleHeader="Active Visit"
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <DynamicTable
            height={420}
            isHavePagination={false}
            overflowX="auto"
            data={approvalData}
            isHaveChecked={false}
            isHaveAction={false}
            isHaveHeaderTitle
            titleHeader="Approval"
            isHaveApproval={true}
            isHavePeriod={true}
          />
        </Grid>
        {/* <Grid size={{ xs: 12, lg: 3 }}>
          <PieCharts />
        </Grid> */}
        <Grid size={{ xs: 12, lg: 6 }} sx={{ height: '100%' }}>
          <DynamicTable
            data={invitationDetailVisitor}
            height={420}
            isHavePagination={false}
            overflowX="auto"
            isHaveChecked={false}
            isHaveView={true}
            isHaveAction={true}
            isHaveHeaderTitle
            isHavePeriod={true}
            onView={(row: any) => handleView(row)}
            titleHeader="Ongoing Invitation"
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }} sx={{ height: '100%' }}>
          <Heatmap />
        </Grid>
      </Grid>

      <Dialog
        open={openAlertInvitation}
        onClose={() => setOpenAlertInvitation(false)}
        fullWidth
        maxWidth="sm"
      >
        <IconButton
          aria-label="close"
          onClick={() => setOpenAlertInvitation(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <IconX />
        </IconButton>
        {/* 
        <DialogContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            textAlign="center"
            py={3}
          >
            <IconBellRingingFilled size={60} color="orange" />
            <Typography variant="h4" mt={2} fontWeight={600}>
              1 New Invitation
            </Typography>

            <Typography variant="h6" mt={1}>
              {alertInvitationData?.visitor?.name ?? 'Unknown Visitor'}{' '}
              <span>has invited you </span> <span>for {alertInvitationData?.agenda ?? '-'}</span>
            </Typography>

            <Typography variant="body1" mt={0.5}></Typography>

            <Typography variant="body2" color="text.secondary" mt={1}>
              Hosted by <b>{alertInvitationData?.host_name ?? '-'}</b>
            </Typography>

            <Typography variant="body2" color="text.secondary" mt={1}>
              {moment
                .utc(alertInvitationData?.visitor_period_start)
                .tz('Asia/Jakarta')
                .format('DD MMM YYYY, HH:mm')}{' '}
              -{' '}
              {moment
                .utc(alertInvitationData?.visitor_period_end)
                .tz('Asia/Jakarta')
                .format('HH:mm')}{' '}
              WIB
            </Typography>
          </Box>
        </DialogContent> */}
        <DialogContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            textAlign="center"
            py={3}
          >
            <IconBellRingingFilled size={60} color="orange" />
            <Typography variant="h5" mt={2} fontWeight={600}>
              {pendingInvitationCount > 1
                ? `${pendingInvitationCount} invitation must be completed`
                : '1 invitation must be completed'}
            </Typography>

            {/* <Typography variant="h6" mt={1} color="text.primary">
              Ada {pendingInvitationCount} undangan yang belum diisi pra-register.
            </Typography> */}

            <Typography variant="body1" color="text.secondary" mt={1}>
              You must complete the invitation before it expires
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openDialogInvitation}
        onClose={() => setOpenDialogInvitation(false)}
        fullWidth
        maxWidth="xl"
      >
        <DialogTitle>Praregister </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => setOpenDialogInvitation(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <IconX />
        </IconButton>
        <DialogContent dividers>
          {selectedInvitationId ? ( // ✅ pakai ID dari row yang di-klik
            <FormDialogInvitation
              id={selectedInvitationId}
              onClose={() => setOpenDialogInvitation(false)}
              onSubmitted={() => {
                setOpenDialogInvitation(false);
                setInvitationDetailVisitor([]); // optional: reload / clear
              }}
              onSubmitting={setSubmitting}
            />
          ) : (
            <Typography variant="body2" textAlign="center" color="text.secondary">
              No invitation selected.
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      {activeAccessPass && (
        <Dialog open={openAccess} onClose={handleCloseAccess} fullWidth maxWidth="sm">
          <DialogTitle textAlign={'center'} sx={{ p: 2 }}>
            Your Access Pass
          </DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleCloseAccess}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <IconX />
          </IconButton>
          <DialogContent sx={{ paddingTop: 2 }} dividers>
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box display="flex" gap={2}>
                <Avatar />
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    {activeAccessPass.group_name || '- '}
                  </Typography>
                  <Typography variant="body2" color="grey">
                    {formatVisitorPeriodLocal(
                      activeAccessPass.visitor_period_start as string,
                      activeAccessPass.visitor_period_end as string,
                    )}
                  </Typography>
                </Box>
              </Box>

              <IconButton
                color="primary"
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }}
              >
                <Download />
              </IconButton>
            </Box>
            <Box mt={3}>
              <Grid container spacing={2} justifyContent="center">
                <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                  <Typography variant="body1" color="textSecondary" fontWeight={500}>
                    Invitation Code
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {activeAccessPass.invitation_code}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                  <Typography variant="body1" color="textSecondary" fontWeight={500}>
                    Card
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {activeAccessPass.card_number || '-'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                  <Typography variant="body1" color="textSecondary" fontWeight={500}>
                    Host
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {activeAccessPass.host_name || '-'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                  <Typography variant="body1" color="textSecondary" fontWeight={500}>
                    Group Code
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {activeAccessPass.group_code || '-'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Box mt={2}>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }} textAlign={'center'}>
                {activeAccessPass.site_place_name}
              </Typography>
              <Box
                display="flex"
                justifyContent="center"
                mt={1}
                mb={1}
                flexDirection={'column'}
                alignItems={'center'}
              >
                <Box
                  sx={{
                    display: 'inline-block',
                    p: 3,
                    borderRadius: 2,
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
                    backgroundColor: 'white', // biar kontras
                  }}
                  my={2}
                >
                  <QRCode
                    value={activeAccessPass.visitor_number}
                    size={180}
                    style={{
                      height: 'auto',
                      width: '180px',
                      borderRadius: 8,
                    }}
                  />
                </Box>
                <Box display="flex" gap={3} mb={2}>
                  <Typography color="error">Tracked</Typography>
                  <Typography color="error">Low Battery</Typography>
                </Box>
                <Typography variant="body2" mb={1}>
                  Show this while visiting
                </Typography>
                <Typography variant="h6">ID : {activeAccessPass.visitor_code}</Typography>
                <Divider sx={{ width: '100%', my: 2, borderColor: 'grey' }} />
                <Box display={'flex'} mt={0} gap={1} flexDirection={'column'}>
                  <Grid size={{ xs: 12, sm: 6 }} textAlign="center" display={'flex'} gap={1}>
                    <Typography variant="body1" color="textSecondary" fontWeight={500}>
                      Parking Slot
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {activeAccessPass?.parking_slot || '-'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }} textAlign="center" display={'flex'} gap={1}>
                    <Typography variant="body1" color="textSecondary" fontWeight={500}>
                      Vehicle Plate
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {activeAccessPass.vehicle_plate_number || '-'}
                    </Typography>
                  </Grid>
                </Box>
                <Button size="small" variant="contained" sx={{ mt: 2 }}>
                  Parking Blocker
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </PageContainer>
  );
};

export default DashboardEmployee;
