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
import { getApproval } from 'src/customs/api/employee';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
// import OperatorPieChart from './Charts/OperatorPieChart';

const DashboardEmployee = () => {
  const cards = [
    { title: 'Check In', icon: IconLogin, subTitle: `0`, subTitleSetting: 10, color: 'none' },
    { title: 'Check Out', icon: IconLogout, subTitle: `0`, subTitleSetting: 10, color: 'none' },
    { title: 'Denied', icon: IconCircleOff, subTitle: `0`, subTitleSetting: 10, color: 'none' },
    { title: 'Block', icon: IconBan, subTitle: `0`, subTitleSetting: 10, color: 'none' },
  ];

  const { token } = useSession();

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

  const [approvalData, setApprovalData] = useState<any[]>([]);

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
        // console.log(response.collection);

        // 🧩 Mapping data approval untuk tabel
        const mappedData = response.collection.map((item: any) => {
          const trx = item.trx_visitor || {};

          return {
            id: item.id,
            visitor_name: item.visitor?.name || '-',
            site_place_name: trx.site_place_name || '-',
            agenda: trx.agenda || '-',
            visitor_period_start: trx.visitor_period_start || '-',
            visitor_period_end: trx.visitor_period_end
              ? formatDateTime(trx.visitor_period_end, trx.extend_visitor_period)
              : trx.visitor_period_end || '-',
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

  const moveApproval = () => {
    navigate('/manager/approval');
  };

  const moveReport = () => {
    navigate('/manager/report');
  };

  return (
    <PageContainer title="Dashboard Operator">
      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Grid size={{ xs: 12, lg: 9 }}>
          <TopCard items={cards} size={{ xs: 12, lg: 3 }} />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <Box display={'flex'} flexDirection={'column'} width={'100%'} gap={1}>
            {/* <Button variant="contained" color="primary" onClick={moveInvitation}>
              
              
              Send Invitation
            </Button> */}
            <Button
              variant="contained"
              color="primary"
              // onClick={handleOpenScanQR}
              onClick={moveApproval}
              // sx={{
              //   backgroundColor: 'white',
              //   ':hover': { backgroundColor: 'rgba(232, 232, 232, 0.8)', color: 'primary.main' },
              // }}
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
                backgroundColor: 'white',
                ':hover': { backgroundColor: 'rgba(232, 232, 232, 0.8)', color: 'primary.main' },
              }}
            >
              <IconReport size={30} />
              Report
            </Button>
          </Box>
        </Grid>

        {/* ✅ QR Code Card: klik untuk buka scanner */}
        {/* <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="h6" sx={{ mb: 0 }}>
            Scan QR
          </Typography>
          <Card
            sx={{ borderRadius: 2, boxShadow: 3, mt: 1, cursor: 'pointer' }}
            onClick={handleOpenScanQR}
          >
            <CardContent sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Box
                  sx={{
                    borderRadius: 2,
                    padding: 3,
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
                    backgroundColor: 'white',
                  }}
                >
                  <QRCode
                    value={'Scan QR'}
                    size={180}
                    style={{ height: 'auto', width: '180px', borderRadius: 8 }}
                  />
                </Box>
                <Typography mt={1} fontWeight={500}>
                  Klik untuk membuka Scanner
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid> */}
        {/* <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="h6" sx={{ mb: 0 }}>
            Graph
          </Typography>
          <Card
            sx={{ borderRadius: 2, boxShadow: 3, mt: 1, cursor: 'pointer' }}
            onClick={handleOpenScanQR}
          >
            <CardContent sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Box
                  sx={{
                    borderRadius: 2,
                    padding: 3,
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
                    backgroundColor: 'white',
                  }}
                >
                  <QRCode
                    value={'Scan QR'}
                    size={180}
                    style={{ height: 'auto', width: '180px', borderRadius: 8 }}
                  />
                </Box>
                <Typography mt={1} fontWeight={500}>
                  Klik untuk membuka Scanner
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="h6" sx={{ mb: 0 }}>
            Circle Chat
          </Typography>
          <Card
            sx={{ borderRadius: 2, boxShadow: 3, mt: 1, cursor: 'pointer' }}
            onClick={handleOpenScanQR}
          >
            <CardContent sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Box
                  sx={{
                    borderRadius: 2,
                    padding: 3,
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
                    backgroundColor: 'white',
                  }}
                >
                  <QRCode
                    value={'Scan QR'}
                    size={180}
                    style={{ height: 'auto', width: '180px', borderRadius: 8 }}
                  />
                </Box>
                <Typography mt={1} fontWeight={500}>
                  Klik untuk membuka Scanner
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid> */}

        {/* Tabel */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <DynamicTable
            height={420}
            isHavePagination
            overflowX="auto"
            data={[]}
            isHaveChecked={false}
            isHaveAction={false}
            isHaveHeaderTitle
            titleHeader="Active Visit"
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <DynamicTable
            height={420}
            isHavePagination
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
        <Grid size={{ xs: 12, lg: 3 }}>
          <PieCharts />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }} sx={{ height: '100%' }}>
          <PieCharts />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }} sx={{ height: '100%' }}>
          <Heatmap />
        </Grid>
      </Grid>

      {/* ✅ QR Dialog */}
      <Dialog fullWidth maxWidth="xs" open={openDialogIndex === 1} onClose={handleCloseScanQR}>
        <DialogTitle display="flex">
          Scan QR Visitor
          <IconButton
            aria-label="close"
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={handleCloseScanQR}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />

        <DialogContent>
          {/* Toggle mode */}
          <Box display="flex" gap={1} mb={2}>
            <Button
              variant={qrMode === 'manual' ? 'contained' : 'outlined'}
              onClick={() => setQrMode('manual')}
              size="small"
            >
              Manual
            </Button>
            <Button
              variant={qrMode === 'scan' ? 'contained' : 'outlined'}
              onClick={() => {
                setHasDecoded(false);
                setQrMode('scan');
              }}
              size="small"
              startIcon={<IconCamera />}
            >
              Scan Camera
            </Button>
          </Box>

          {/* MODE: MANUAL */}
          {qrMode === 'manual' && (
            <>
              <TextField
                fullWidth
                label="Masukkan Kode QR"
                variant="outlined"
                size="small"
                value={qrValue}
                onChange={(e) => setQrValue(e.target.value)}
              />
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setOpenDetailQRCode(true);
                    setOpenDialogIndex(null);
                  }}
                  disabled={!qrValue}
                >
                  Submit
                </Button>
              </Box>
            </>
          )}

          {/* MODE: SCAN */}
          {qrMode === 'scan' && (
            <>
              <Box
                ref={scanContainerRef}
                sx={{
                  position: 'relative',
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'black',
                  aspectRatio: '3 / 4', // proporsional untuk mobile
                }}
              >
                <Scanner
                  constraints={{ facingMode }}
                  onScan={(result: any) => {
                    if (!result) return;
                    if (hasDecoded) return; // cegah spam callback
                    setHasDecoded(true);
                    setQrValue(typeof result === 'string' ? result : String(result));
                  }}
                  onError={(error: any) => {
                    console.log('QR error:', error?.message || error);
                  }}
                  styles={{
                    container: { width: '100%', height: '100%' },
                    video: {
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      border: 'none !important',
                    },
                  }}
                />

                <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  {/* Kotak scan di tengah (lubang) */}
                  <Box
                    sx={{
                      // ukuran kotak scan (responsif)
                      '--scanSize': { xs: '70vw', sm: '290px' },

                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: 'var(--scanSize)',
                      height: 'var(--scanSize)',
                      transform: 'translate(-50%, -50%)',

                      // ini yang bikin area luar gelap, tengah tetap terang
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                      borderRadius: 2, // 0 jika mau siku
                      outline: '2px solid rgba(255,255,255,0.18)',
                    }}
                  >
                    {/* 4 corner, ditempel di dalam kotak agar selalu pas */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        '& .corner': {
                          position: 'absolute',
                          width: 24,
                          height: 24,
                          border: '3px solid #00e5ff',
                        },
                        '& .tl': { top: 0, left: 0, borderRight: 'none', borderBottom: 'none' },
                        '& .tr': { top: 0, right: 0, borderLeft: 'none', borderBottom: 'none' },
                        '& .bl': { bottom: 0, left: 0, borderRight: 'none', borderTop: 'none' },
                        '& .br': { bottom: 0, right: 0, borderLeft: 'none', borderTop: 'none' },
                      }}
                    >
                      <Box className="corner tl" />
                      <Box className="corner tr" />
                      <Box className="corner bl" />
                      <Box className="corner br" />
                    </Box>

                    {/* Laser animasi (bergerak di dalam kotak) */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 10,
                        right: 10,
                        height: 2,
                        top: 0,
                        background: 'linear-gradient(90deg, transparent, #00e5ff, transparent)',
                        animation: 'scanLine 2s linear infinite',
                        '@keyframes scanLine': {
                          '0%': { transform: 'translateY(0)' },
                          '100%': { transform: 'translateY(calc(var(--scanSize) - 2px))' },
                        },
                      }}
                    />
                  </Box>
                </Box>
                {/* Kontrol: Flip & Torch */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 8,
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  <Button
                    onClick={() =>
                      setFacingMode((f) => (f === 'environment' ? 'user' : 'environment'))
                    }
                    variant="contained"
                    size="small"
                    sx={{ bgcolor: 'rgba(0,0,0,0.6)' }}
                    startIcon={<FlipCameraAndroidIcon fontSize="small" />}
                  >
                    Flip
                  </Button>

                  <Button
                    onClick={async () => {
                      try {
                        const video = scanContainerRef.current?.querySelector(
                          'video',
                        ) as HTMLVideoElement | null;
                        const stream = video?.srcObject as MediaStream | null;
                        const track = stream?.getVideoTracks()?.[0];
                        const caps = track?.getCapabilities?.() as any;
                        if (track && caps?.torch) {
                          await track.applyConstraints({ advanced: [{ torch: !torchOn }] as any });
                          setTorchOn((t) => !t);
                        } else {
                          console.log('Torch not supported on this device.');
                        }
                      } catch (e) {
                        console.log('Torch toggle error:', e);
                      }
                    }}
                    variant="contained"
                    size="small"
                    sx={{ bgcolor: 'rgba(0,0,0,0.6)' }}
                    startIcon={
                      torchOn ? <FlashOnIcon fontSize="small" /> : <FlashOffIcon fontSize="small" />
                    }
                  >
                    Torch
                  </Button>
                </Box>
              </Box>

              {/* Preview hasil + aksi */}
              <Box mt={2}>
                <Typography variant="caption" color="text.secondary">
                  Hasil: {qrValue || '-'}
                </Typography>
              </Box>

              <Box mt={2} display="flex" gap={1} justifyContent="space-between">
                <Button
                  variant="outlined"
                  onClick={() => {
                    setHasDecoded(false);
                    setQrValue('');
                  }}
                >
                  Reset
                </Button>
                <Box>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setOpenDetailQRCode(true);
                      setOpenDialogIndex(null);
                    }}
                    disabled={!qrValue}
                    type="submit"
                  >
                    Submit
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={openDetailQRCode}
        onClose={() => setOpenDetailQRCode(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Detail QR Code</DialogTitle>
        <IconButton
          onClick={() => setOpenDetailQRCode(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <IconX />
        </IconButton>
        <DialogContent dividers>
          <Box>
            {/* Foto Visitor */}
            <Box display="flex" alignItems="center" gap={2} mb={2} justifyContent="center">
              <Avatar
                src={
                  //   resolveImg(
                  //     visitorDetail.faceimage || visitorDetail.photo || visitorDetail.avatar,
                  //   ) || undefined
                  ''
                }
                alt={'visitor'}
                sx={{ width: 100, height: 100 }}
              />
            </Box>

            {/* Tabs */}
            <Tabs
              value={tabValue}
              onChange={(e, newVal) => setTabValue(newVal)}
              variant="fullWidth"
            >
              <Tab label="Info" />
              <Tab label="Visit Information" />
              <Tab label="Purpose Visit" />
            </Tabs>

            {/* Tab Panels */}
            {tabValue === 0 && (
              <Box sx={{ mt: 2 }}>
                {/* Grid Info Visitor */}
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" gap={1} alignItems="flex-start">
                      <IconIdBadge2 />
                      <Box>
                        <CustomFormLabel sx={{ mt: 0 }}>Name</CustomFormLabel>
                        <Typography>{'-'}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" gap={1} alignItems="flex-start">
                      <IconBrandGmail />
                      <Box>
                        <CustomFormLabel sx={{ mt: 0 }}>Email</CustomFormLabel>
                        <Typography>{'-'}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" gap={1} alignItems="flex-start">
                      <IconPhone />
                      <Box>
                        <CustomFormLabel sx={{ mt: 0 }}>Phone</CustomFormLabel>
                        <Typography>{'-'}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Address */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" gap={1} alignItems="flex-start">
                      <IconHome />
                      <Box>
                        <CustomFormLabel sx={{ mt: 0 }}>Address</CustomFormLabel>
                        <Typography>{'-'}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Gender */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" gap={1} alignItems="flex-start">
                      <IconGenderMale />
                      <Box>
                        <CustomFormLabel sx={{ mt: 0 }}>Gender</CustomFormLabel>
                        <Typography>{'-'}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Organization */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" gap={1} alignItems="flex-start">
                      <IconBuildingSkyscraper />
                      <Box>
                        <CustomFormLabel sx={{ mt: 0 }}>Organization</CustomFormLabel>
                        <Typography>{'-'}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}

            {tabValue === 1 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  {/* Visitor Code */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" gap={1} alignItems="flex-start">
                      <IconQrcode />
                      <Box>
                        <CustomFormLabel sx={{ mt: 0 }}>Visitor Code</CustomFormLabel>
                        <Typography
                          sx={{
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                            whiteSpace: 'normal',
                          }}
                        >
                          {'-'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Group Code */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" gap={1} alignItems="flex-start">
                      <IconUsersGroup />
                      <Box>
                        <CustomFormLabel sx={{ mt: 0 }}>Group Code</CustomFormLabel>
                        <Typography>{'-'}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Group Name */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" gap={1} alignItems="flex-start">
                      <IconUser />
                      <Box>
                        <CustomFormLabel sx={{ mt: 0 }}>Group Name</CustomFormLabel>
                        <Typography>{'-'}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Period Start */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" gap={1} alignItems="flex-start">
                      <IconCalendarTime />
                      <Box>
                        <CustomFormLabel sx={{ mt: 0 }}>Period Start</CustomFormLabel>
                        <Typography>{'-'}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Period End */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" gap={1} alignItems="flex-start">
                      <IconCalendarEvent />
                      <Box>
                        <CustomFormLabel sx={{ mt: 0 }}>Period End</CustomFormLabel>
                        <Typography>{'-'}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Visitor Number */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" gap={1} alignItems="flex-start">
                      <IconNumbers />
                      <Box>
                        <CustomFormLabel sx={{ mt: 0 }}>Visitor Number</CustomFormLabel>
                        <Typography>{'-'}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Invitation Code */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" gap={1} alignItems="flex-start">
                      <IconTicket />
                      <Box>
                        <CustomFormLabel sx={{ mt: 0 }}>Invitation Code</CustomFormLabel>
                        <Typography>{'-'}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Visitor Status */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" gap={1} alignItems="flex-start">
                      <IconCheckupList />
                      <Box>
                        <CustomFormLabel sx={{ mt: 0 }}>Visitor Status</CustomFormLabel>
                        <Typography>{'-'}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Vehicle Type */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" gap={1} alignItems="flex-start">
                      <IconCar />
                      <Box>
                        <CustomFormLabel sx={{ mt: 0 }}>Vehicle Type</CustomFormLabel>
                        <Typography>{'-'}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Vehicle Plate No. */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" gap={1} alignItems="flex-start">
                      <IconLicense />
                      <Box>
                        <CustomFormLabel sx={{ mt: 0 }}>Vehicle Plate No.</CustomFormLabel>
                        <Typography>{'-'}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}

            {tabValue === 2 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  {/* Agenda */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" gap={1} alignItems="flex-start">
                      <IconCalendarEvent />
                      <Box>
                        <CustomFormLabel sx={{ mt: 0 }}>Agenda</CustomFormLabel>
                        <Typography>{'-'}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* PIC Host */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" gap={1} alignItems="flex-start">
                      <IconUserCheck />
                      <Box>
                        <CustomFormLabel sx={{ mt: 0 }}>PIC Host</CustomFormLabel>
                        <Typography>{'-'}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Period Start */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" gap={1} alignItems="flex-start">
                      <IconCalendarTime />
                      <Box>
                        <CustomFormLabel sx={{ mt: 0 }}>Period Start</CustomFormLabel>
                        <Typography>{'-'}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Period End */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" gap={1} alignItems="flex-start">
                      <IconCalendarUp />
                      <Box>
                        <CustomFormLabel sx={{ mt: 0 }}>Period End</CustomFormLabel>
                        <Typography>{'-'}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Registered Site */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" gap={1} alignItems="flex-start">
                      <IconMapPin />
                      <Box>
                        <CustomFormLabel sx={{ mt: 0 }}>Registered Site</CustomFormLabel>
                        <Typography>{'-'}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button variant="contained" color="success" onClick={() => ''} startIcon={<IconLogin2 />}>
            Check In
          </Button>
          <Button variant="contained" color="error" onClick={() => ''} startIcon={<IconLogout />}>
            Check Out
          </Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#f44336', '&:hover': { backgroundColor: '#d32f2f' } }}
            onClick={() => ''}
            startIcon={<IconX />}
          >
            Deny
          </Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#000' }}
            onClick={() => ''}
            startIcon={<IconForbid2 />}
          >
            Block
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default DashboardEmployee;
