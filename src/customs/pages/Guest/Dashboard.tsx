import React, { useEffect, useState } from 'react';
import GuestLayout from './GuestLayout';
import PageContainer from 'src/components/container/PageContainer';
import { Box } from '@mui/system';
import {
  Card,
  Typography,
  CardHeader,
  CardContent,
  CardMedia,
  Avatar,
  Collapse,
  IconButton,
  CardActions,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2 as Grid,
  Button,
  Dialog,
  Autocomplete,
  Popover,
  Drawer,
} from '@mui/material';

import Divider from '@mui/material/Divider';
import {
  Home,
  Event,
  CheckCircle,
  Report,
  LocalParking,
  People,
  Alarm,
  ExitToApp,
  Download,
  DateRange,
} from '@mui/icons-material';
import AlarmIcon from '@mui/icons-material/Alarm';
import {
  IconBan,
  IconBellRingingFilled,
  IconCalendar,
  IconCheck,
  IconCircleOff,
  IconClipboard,
  IconDownload,
  IconLogin,
  IconLogout,
  IconQrcode,
  IconUserPlus,
  IconUsersGroup,
  IconX,
} from '@tabler/icons-react';
import { Item as AccessPassType } from 'src/customs/api/models/Admin/AccessPass';
import QRCode from 'react-qr-code';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import VisitorStatusPieChart from './Components/charts/VisitorStatusPieChart';
import TopCard from './TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { t } from 'i18next';
import { getActiveInvitation } from 'src/customs/api/visitor';
import { useSession } from 'src/customs/contexts/SessionContext';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import moment from 'moment-timezone';
import dayjs, { Dayjs } from 'dayjs';
import { subDays } from 'date-fns';

import { addDays } from 'date-fns';
import Calendar from 'src/customs/components/calendar/Calendar';
import { getAccessPass } from 'src/customs/api/admin';

const Dashboard = () => {
  // const [open, setOpen] = useState(false);
  const [openInvitation, setOpenInvitation] = useState(false);

  // const handleClickOpen = () => {
  //   setOpen(true);
  // };

  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
  const { token } = useSession();

  const [activeVisitData, setActiveVisitData] = useState<any[]>([]);
  const [activeAccessPass, setActiveAccessPass] = useState<any>();
  const [openAccess, setOpenAccess] = useState(false);
  const handleOpenAccess = () => {
    setOpenAccess(true);
  };

  const handleCloseAccess = () => {
    setOpenAccess(false);
  };

  const cards = [
    {
      title: 'Check In',
      icon: IconLogin,
      subTitle: `0`,
      subTitleSetting: 10,
      color: 'none',
    },
    {
      title: 'Check Out',
      icon: IconLogout,
      subTitle: `0`,
      subTitleSetting: 10,
      color: 'none',
    },

    {
      title: 'Denied',
      icon: IconCircleOff,
      subTitle: `0`,
      subTitleSetting: 10,
      color: 'none',
    },
    {
      title: 'Block',
      icon: IconBan,
      subTitle: `0`,
      subTitleSetting: 10,
      color: 'none',
    },
  ];

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const res = await getActiveInvitation(token as string);

        const response = res.collection?.map((item: any) => ({
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
        setActiveVisitData(response ?? []);
        const resAccess = await getAccessPass(token as string);
        console.log(resAccess);
        setActiveAccessPass(resAccess);
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
  }, [token]);

  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(7, 'day'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());

  const [dateRange, setDateRange] = useState([
    {
      startDate: subDays(new Date(), 7), // ✅ 7 hari ke belakang dari hari ini
      endDate: new Date(), // ✅ hari ini
      key: 'selection',
    },
  ]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  function formatVisitorPeriodLocal(startUtc: string, endUtc: string) {
    const startLocal = moment.utc(startUtc).tz(moment.tz.guess()).format('YYYY-MM-DD HH:mm');
    const endLocal = moment.utc(endUtc).tz(moment.tz.guess()).format('YYYY-MM-DD HH:mm');
    return `${startLocal} - ${endLocal}`;
  }

  return (
    <PageContainer title="Dashboard">
      <Grid container spacing={2} sx={{ mt: 0 }} alignItems={'stretch'}>
        <Grid
          size={{ xs: 12, lg: 12 }}
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          gap={2}
          sx={{ mt: 2 }}
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
            {`${dateRange[0].startDate.toLocaleDateString()} - ${dateRange[0].endDate.toLocaleDateString()}`}
          </Button>

          <Button size="small" variant="contained" color="error" startIcon={<IconDownload />}>
            Export
          </Button>

          <Drawer open={open} anchor="right" onClose={handleClose}>
            <Calendar
              onChange={(selection: any) => {
                setDateRange([
                  {
                    startDate: selection.startDate,
                    endDate: selection.endDate,
                    key: 'selection',
                  },
                ]);
              }}
            />
          </Drawer>
        </Grid>
        <Grid size={{ xs: 12, lg: 9 }}>
          <TopCard items={cards} size={{ xs: 12, lg: 6 }} />
        </Grid>
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
            <Typography variant="h5">Access Pass</Typography>
            <Box
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
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <DynamicTable
            height={420}
            isHavePagination
            overflowX={'auto'}
            data={activeVisitData}
            isHaveChecked={false}
            isHaveAction={false}
            isHaveSearch={false}
            isHaveFilter={false}
            isHaveExportPdf={false}
            isHaveExportXlf={false}
            isHaveHeaderTitle={true}
            isHavePeriod={true}
            titleHeader="Active Visit"
            // defaultRowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 20, 50, 100]}
            // onPaginationChange={(page, rowsPerPage) => {
            //   setPage(page);
            //   setRowsPerPage(rowsPerPage);
            // }}
            isHaveFilterDuration={false}
            isHaveAddData={false}
            isHaveHeader={false}
            isHaveFilterMore={false}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <VisitorStatusPieChart />
        </Grid>
      </Grid>

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
              <Typography variant="h5" sx={{ fontWeight: 'bold' }} textAlign={'center'}>
                {activeAccessPass.site_place_name}
              </Typography>
              <Box
                display="flex"
                justifyContent="center"
                mt={0}
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
                    value={activeAccessPass.visitor_number || activeAccessPass.invitation_code}
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
                <Box display={'flex'} mt={0} gap={3} flexDirection={'row'}>
                  <Grid size={{ xs: 12, sm: 3 }} textAlign="center">
                    <Typography variant="body1" color="textSecondary" fontWeight={500}>
                      Parking Slot
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {activeAccessPass?.parking_slot || '-'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                    <Typography variant="body1" color="textSecondary" fontWeight={500}>
                      Parking Area
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {activeAccessPass?.parking_area || '-'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                    <Typography variant="body1" color="textSecondary" fontWeight={500}>
                      Vehicle Plate
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {activeAccessPass.vehicle_plate_number || '-'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                    <Typography variant="body1" color="textSecondary" fontWeight={500}>
                      Vehicle Type
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {activeAccessPass.vehicle_type || '-'}
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

export default Dashboard;
