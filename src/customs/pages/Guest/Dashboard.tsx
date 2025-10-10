import React, { useEffect, useState } from 'react';
import GuestLayout from './GuestLayout';
import PageContainer from 'src/components/container/PageContainer';
import { Box } from '@mui/system';
import {
  Card,
  Divider,
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
  IconUserPlus,
  IconUsersGroup,
  IconX,
} from '@tabler/icons-react';
import { Item as AccessPassType } from 'src/customs/api/models/AccessPass';
import QRCode from 'react-qr-code';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import VisitorStatusPieChart from './Components/charts/VisitorStatusPieChart';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { t } from 'i18next';
import { getActiveInvitation } from 'src/customs/api/visitor';
import { useSession } from 'src/customs/contexts/SessionContext';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
const items = [
  { icon: <Home />, label: 'Access Pass' },
  { icon: <Event />, label: 'Invitation' },
  { icon: <CheckCircle />, label: 'Approval' },
  { icon: <Report />, label: 'Report' },
  { icon: <LocalParking />, label: 'Parking' },
  { icon: <People />, label: 'Visitor' },
  { icon: <Alarm />, label: 'Alarm' },
  { icon: <ExitToApp />, label: 'Evacuate' },
];

const visitors = [
  {
    id: 1,
    name: 'Tommy',
    date: 'Mon, 11 May 2023',
    time: '10:00 - 11:00',
    invitationCode: '729038',
    groupCode: '678921223',
    vehicle: 'B 1234 CC',
    slot: 'Slot A1',
    building: 'Gedung HQ',
    qr: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg',
  },
  {
    id: 2,
    name: 'Sarah',
    date: 'Tue, 12 May 2023',
    time: '14:00 - 15:00',
    invitationCode: '998877',
    groupCode: '445566778',
    vehicle: 'B 7890 ZZ',
    slot: 'Slot B2',
    building: 'Gedung A',
    qr: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg',
  },
  {
    id: 3,
    name: 'John',
    date: 'Wed, 13 May 2023',
    time: '16:00 - 17:00',
    invitationCode: '123456',
    groupCode: '789012345',
    vehicle: 'B 4567 XX',
    slot: 'Slot C3',
    building: 'Gedung B',
    qr: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg',
  },
];

import { addDays } from 'date-fns';
import Calendar from 'src/customs/components/calendar/Calendar';
import { getAccessPass } from 'src/customs/api/admin';

const Dashboard = () => {
  // const [open, setOpen] = useState(false);
  const [openInvitation, setOpenInvitation] = useState(false);

  // const handleClickOpen = () => {
  //   setOpen(true);
  // };

  const handleClickOpenInvitation = () => {
    setOpenInvitation(true);
  };
  const handleCloseInvitation = () => {
    setOpenInvitation(false);
  };

  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);

  // const handleOpen = (visitor: any) => {
  //   setSelectedVisitor(visitor);
  //   setOpen(true);
  // };
  const [openAccess, setOpenAccess] = useState(false);
  const handleOpenAccess = () => {
    setOpenAccess(true);
  };

  // const handleClose = () => {
  //   setOpen(false);
  //   setSelectedVisitor(null);
  // };

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
      title: 'Cancelled',
      icon: IconBan,
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
  ];

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
      'purpose Person': 'Pak Wahyu',
    },
  ];

  const { token } = useSession();

  const [activeVisitData, setActiveVisitData] = useState<any[]>([]);
    const [activeAccessPass, setActiveAccessPass] = useState<AccessPassType>();

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const res = await getActiveInvitation(token as string);
        setActiveVisitData(res?.collection ?? []);
        const res2 = await getAccessPass(token as string);
        setActiveAccessPass(res2);
        console.log('res2: ', res2);
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
      startDate: new Date(), // hari ini
      endDate: addDays(new Date(), 7), // 7 hari ke depan
      key: 'selection',
    },
  ]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

    const formatVisitorPeriodWithTZ = (
      startUtc: string | null | undefined,
      endUtc: string | null | undefined,
      tz: string | null | undefined,
      locale: string = 'en-US',
    ): string => {
      if (!startUtc || !endUtc) return '-';

      try {
        const start = new Date(startUtc);
        const end = new Date(endUtc);

        const dateFormatter = new Intl.DateTimeFormat(locale, {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          timeZone: tz ?? 'UTC',
        });

        const timeFormatter = new Intl.DateTimeFormat(locale, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: tz ?? 'UTC',
        });

        const datePart = dateFormatter.format(start); // e.g. "Thu, 09 Oct 2025"
        const startTime = timeFormatter.format(start); // e.g. "17:00"
        const endTime = timeFormatter.format(end); // e.g. "18:00"

        return `${datePart} | ${startTime} - ${endTime}`;
      } catch {
        return '-';
      }
    };

  return (
    <PageContainer title="Dashboard">
      <Grid container spacing={2} sx={{ mt: 0 }}>
        {/* <Grid
          size={{ xs: 12, lg: 12 }}
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          gap={2}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              slotProps={{ textField: { size: 'small', sx: { width: 140 } } }}
            />
            <DatePicker
              label="End date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              slotProps={{ textField: { size: 'small', sx: { width: 140 } } }}
            />
          </LocalizationProvider>

          <Button size="small" variant="contained" color="error" startIcon={<IconDownload />}>
            Export
          </Button>
        </Grid> */}
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
        <Grid size={{ xs: 12, lg: 12 }}>
          <TopCard items={cards} size={{ xs: 12, lg: 3 }} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }} sx={{ padding: 0 }}>
          <Typography variant="h6" sx={{ mb: 0 }}>
            Access Pass
          </Typography>
          <Card
            sx={{ borderRadius: 2, boxShadow: 3, mt: 1, cursor: 'pointer', padding: 0 }}
            onClick={handleOpenAccess}
          >
            <CardContent sx={{ display: 'flex', justifyContent: 'center', padding: 1 }}>
              <Box
                display="flex"
                justifyContent="center"
                mt={1}
                mb={1}
                flexDirection="column"
                alignItems="center"
              >
                <Box
                  sx={{
                    display: 'inline-block',
                    borderRadius: 2,
                    padding: 3,
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
                    backgroundColor: 'white', // biar kontras
                  }}
                >
                  <QRCode
                    value={activeAccessPass?.visitor_number || ''}
                    size={180}
                    style={{
                      height: 'auto',
                      width: '180px',
                      borderRadius: 8,
                    }}
                  />
                </Box>

                <Typography variant="body2" mb={1} mt={2}>
                  Show this while visiting
                </Typography>
                <Typography variant="h6" color="primary">
                  {activeAccessPass?.visitor_code}
                </Typography>
              </Box>
            </CardContent>

            <CardActions
              sx={{
                width: '100%', // biar penuh
                display: 'flex',
                justifyContent: 'center',
                bgcolor: 'grey.50',
                borderTop: '1px solid #eee',
              }}
            >
              {/* <Box
                sx={{
                  bgcolor: 'grey.50',
                  borderTop: '1px solid #eee',
                  py: 1,
                  px: 2,
                  textAlign: 'center',
                }}
              > */}
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Tap to view your Access Pass
              </Typography>
              {/* </Box> */}
            </CardActions>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" sx={{ mb: 0 }}>
            Access Number
          </Typography>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: 3,
              mt: 1,
              cursor: 'pointer',
              padding: 0,
              height: '100%', // biar ikut tinggi Grid
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
            onClick={handleOpenAccess}
          >
            <CardContent
              sx={{
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%', // biar konten stretch
                padding: 2,
              }}
            >
              <Typography variant="body1" fontWeight={500}>
                Number Of Visitor
              </Typography>
              <Typography variant="h4" mt={3}>
                {activeAccessPass?.visitor_number}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="h6" sx={{ mb: 0 }}>
            Status Visitor
          </Typography>
          <VisitorStatusPieChart />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          {/* <Typography variant="h6" sx={{ mb: 1 }}>
            Active Visit
          </Typography> */}
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
            // headerContent={{
            //   title: 'Dashboard',
            //   subTitle: 'Monitoring all visitor data',
            //   items: [{ name: 'department' }, { name: 'employee' }, { name: 'project' }],
            // }}
            // onHeaderItemClick={(item) => {
            //   console.log('Item diklik:', item.name);
            // }}
            // onCheckedChange={(selected) => console.log('Checked:', selected)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          {/* <Typography variant="h6" sx={{ mb: 1 }}>
            Extended Request
          </Typography> */}
          <DynamicTable
            height={420}
            isHavePagination
            overflowX={'auto'}
            data={tableRowColumn}
            isHaveChecked={false}
            isHaveAction={false}
            isHaveSearch={false}
            isHaveFilter={false}
            isHaveExportPdf={false}
            isHaveExportXlf={false}
            isHaveHeaderTitle={true}
            titleHeader="Extended Request"
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
            // headerContent={{
            //   title: 'Dashboard',
            //   subTitle: 'Monitoring all visitor data',
            //   items: [{ name: 'department' }, { name: 'employee' }, { name: 'project' }],
            // }}
            // onHeaderItemClick={(item) => {
            //   console.log('Item diklik:', item.name);
            // }}
            // onCheckedChange={(selected) => console.log('Checked:', selected)}
          />
        </Grid>
      </Grid>

      {/* <Typography variant="h6">
            Active Visit
          </Typography> */}

      {/* <Grid container spacing={3}>
        {visitors.map((visitor) => (
          <Grid size={{ xs: 12, sm: 4 }} key={visitor.id}>
            <Card
              sx={{
                borderRadius: '10px',
                marginTop: '10px',
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
              }}
              onClick={() => handleOpen(visitor)}
            >
              <CardHeader
                sx={{ paddingLeft: '0', paddingRight: '0', paddingTop: '5px' }}
                title="Aula Lantai 3"
                subheader={
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      Occassion
                    </Typography>
                    <Box display="flex" gap={1} alignItems="center" justifyContent="space-between">
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {visitor.time}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {visitor.date}
                      </Typography>
                    </Box>
                  </Box>
                }
              />
              <CardMedia
                component="img"
                height="194"
                image="https://material-ui.com/static/images/cards/paella.jpg"
                alt="Room Image"
              />
              <CardContent sx={{ paddingX: 0.5, paddingTop: 1.5, paddingBottom: '0 !important' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" gap={1}>
                    <Button variant="contained" color="error" size="small">
                      Deny
                    </Button>
                    <Button variant="contained" color="primary" size="small">
                      Approve
                    </Button>
                  </Box>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{ backgroundColor: 'grey.200', padding: 1, borderRadius: 2 }}
                  >
                    {visitor.name}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

      
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
          {selectedVisitor && (
            <>
              <DialogTitle textAlign="center" sx={{ padding: '25px 0' }}>
                Access Pass
              </DialogTitle>
              <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 15,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <IconX />
              </IconButton>
              <DialogContent sx={{ paddingTop: 0 }}>
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
                        {selectedVisitor.name}
                      </Typography>
                      <Typography variant="body2" color="grey">
                        {selectedVisitor.date} | {selectedVisitor.time}
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
                        {selectedVisitor.invitationCode}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                      <Typography variant="body1" color="textSecondary" fontWeight={500}>
                        Group Code
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {selectedVisitor.groupCode}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                      <Typography variant="body1" color="textSecondary" fontWeight={500}>
                        Vehicle Plate No.
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {selectedVisitor.vehicle}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                      <Typography variant="body1" color="textSecondary" fontWeight={500}>
                        Parking Slot
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {selectedVisitor.slot}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Box mt={2}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }} textAlign="center">
                    {selectedVisitor.building}
                  </Typography>
                  <Box
                    display="flex"
                    justifyContent="center"
                    mt={1}
                    mb={1}
                    flexDirection="column"
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        display: 'inline-block',
                        p: 1,
                        borderRadius: 2,
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
                        backgroundColor: 'white', 
                      }}
                    >
                      <img
                        src={selectedVisitor.qr}
                        alt="QRCode"
                        width="200"
                        height="200"
                        style={{ borderRadius: '8px' }}
                      />
                    </Box>
                    <Box display="flex" gap={3} mb={2} mt={2}>
                      <Typography color="error">Tracked</Typography>
                      <Typography color="error">Low Battery</Typography>
                    </Box>
                    <Typography variant="body2" mb={1}>
                      Show this while visiting
                    </Typography>
                    <Typography variant="h6">ID : 73A2AFJ1S1KS1</Typography>
                  </Box>
                  <Divider />

                  <Typography variant="body1" color="textSecondary" fontWeight={600} mt={2}>
                    Another Visitor
                  </Typography>
                  <Box mt={1} display={'flex'} gap={1} alignItems={'center'}>
                    <Box display="flex" alignItems="center" gap={1} flexDirection={'column'}>
                      <Avatar />
                      <Typography variant="body1" fontWeight={500}>
                        {selectedVisitor.name}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'center' }}>
                <Button onClick={handleClose} variant="contained" color="error">
                  Deny
                </Button>
                <Button onClick={handleClose} variant="contained" color="primary">
                  Approve
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Grid> */}

      {/* Dialog */}

      {activeAccessPass && (
        <Dialog open={openAccess} onClose={handleCloseAccess} fullWidth maxWidth="sm">
          <DialogTitle textAlign={'center'} sx={{ padding: '30px 0' }}>
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
          <DialogContent sx={{ paddingTop: 0 }}>
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
                    {activeAccessPass.fullname || '- '}
                  </Typography>
                  <Typography variant="body2" color="grey">
                    {formatVisitorPeriodWithTZ(
                      activeAccessPass.visitor_period_start,
                      activeAccessPass.visitor_period_end,
                      activeAccessPass.tz,
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
                    Vehicle Plate
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {activeAccessPass.vehicle_plate_number || '-'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }} textAlign="center">
                  <Typography variant="body1" color="textSecondary" fontWeight={500}>
                    Parking Slot
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {activeAccessPass.parking_slot || '-'}
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
              </Box>
            </Box>
          </DialogContent>
          {/* <DialogActions>
          <Button onClick={handleClose} color="error" size="small" variant="contained">
            Close
          </Button>
        </DialogActions> */}
        </Dialog>
      )}
    </PageContainer>
  );
};

export default Dashboard;
