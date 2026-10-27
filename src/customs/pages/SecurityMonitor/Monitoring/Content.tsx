import {
  ContentCopy,
  KeyboardArrowDownOutlined,
  KeyboardArrowUpOutlined,
  Security,
} from '@mui/icons-material';
import React, { useState } from 'react';
import PageContainer from 'src/customs/components/container/PageContainer';
import Container from 'src/components/container/PageContainer';
import {
  SecurityMonitorNavListingData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import {
  Box,
  Grid2 as Grid,
  Portal,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Button,
  IconButton,
  InputAdornment,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  CircularProgress,
  Paper,
} from '@mui/material';
import VisitorFilterSidebar from '../../admin/content/Visitor/Transaction/components/VisitorFilterSidebar';
import { Stack } from '@mui/system';
import {
  IconCalendarEvent,
  IconCalendarTime,
  IconFileExport,
  IconFileTypePdf,
  IconFilterFilled,
  IconPlus,
  IconSearch,
  IconUsers,
} from '@tabler/icons-react';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import bg_nodata from 'src/assets/images/backgrounds/bg_nodata.svg';
import TopCard from 'src/customs/components/cards/TopCard';
import { useTranslation } from 'react-i18next';
import VisitorRow from '../../admin/content/Visitor/Transaction/VisitorRow';
import VisitorDetailPanel from '../../Employee/Invitation/components/VisitorDetailPanel';
type TransactionStatus =
  | 'Check In'
  | 'Check Out'
  | 'Available'
  | 'Approved'
  | 'Rejected'
  | 'Waiting';

interface Transaction {
  id: number;
  agenda: string;
  visitorName: string;
  hostName: string;
  start: string;
  end: string;
  status: any;
}

const dummyTransactions: any[] = [
  {
    initial_trx_code:
      '6ZUKKMXDPERG5GZDRYZ5Q3GD7MT49JPQTC8WEOWWJ64K58PIUYJLB1NCY8QW1GU8H58LLP92RVHV96X2EBU5BXBYQJAIYQ9IV7IHHNNA2XONZRJ6ICJCNVC2GHFTT5HZ',
    agenda: 'Agenda Sinergi',
    host: '6df5c006-1431-483e-81a7-71078cd861c2',
    host_name: 'DLAF',
    host_organization_name: 'DLAF',
    invitation_created_at: '2026-10-27T02:26:00.7272345',
    can_track_ble: true,
    can_track_cctv: true,
    can_parking: true,
    can_access: true,
    remarks: 'Invitation',
    site_id: '1d6c9704-f6ab-47bd-a6b0-3e1fb3d6faea',
    site_location: 'SPU',
    visitor_type_id: '854291d4-6a2e-412c-98a3-f8c30503db0e',
    visitor_type_name: 'General Visitor',
    visitor_period_start: '2026-10-27T01:00:00',
    visitor_period_end: '2026-10-27T12:00:00',
    tz: 'Asia/Jakarta',
    visitor_role: 'Visitor',
    transaction_status: 'Available',
    flow: 'Invitation',
    list_visitor: [],
    invited_by: '416befe2-b840-4f35-b310-a079bf1b6a3b',
    invited_by_name: 'Admins',
    id: 1,
    status: 'Checkin',
  },
  {
    id: 2,
    agenda: 'Project Discussion',
    visitorName: 'Siti Rahma',
    host_name: 'Dewi Lestari',
    visitor_period_start: '2026-10-27 08:00',
    visitor_period_end: '2026-10-27 09:00',
    status: 'Checkout',
  },
  {
    id: 3,
    agenda: 'Vendor Visit',
    visitorName: 'Rudi Hartono',
    host_name: 'Agus Wijaya',
    visitor_period_start: '2026-10-27 13:00',
    visitor_period_end: '2026-10-27 14:00',
    status: 'Available',
  },
  {
    id: 4,
    agenda: 'Business Partnership',
    visitorName: 'Maya Putri',
    host_name: 'Dian Saputra',
    visitor_period_start: '2026-10-27 10:00',
    visitor_period_end: '2026-10-27 11:00',
    status: 'Approved',
  },
  {
    id: 5,
    agenda: 'Product Presentation',
    visitorName: 'Fajar Nugraha',
    host_name: 'Rina Amelia',
    visitor_period_start: '2026-10-27 14:00',
    visitor_period_end: '2026-10-27 15:00',
    status: 'Rejected',
  },
  {
    id: 6,
    agenda: 'Technical Interview',
    visitorName: 'Nadia Putri',
    host_name: 'Dimas Prakoso',
    visitor_period_start: '2026-10-27 11:00',
    visitor_period_end: '2026-10-27 12:00',
    status: 'Waiting',
  },
  {
    id: 7,
    agenda: 'System Maintenance',
    visitorName: 'Eko Saputra',
    host_name: 'Andi Wijaya',
    visitor_period_start: '2026-10-27 15:00',
    visitor_period_end: '2026-10-27 16:00',
    status: 'Checkin',
  },
  {
    id: 8,
    agenda: 'Annual Review',
    visitorName: 'Lina Marlina',
    host_name: 'Bambang Setiawan',
    visitor_period_start: '2026-10-27 09:30',
    visitor_period_end: '2026-10-27 10:30',
    status: 'Approved',
  },
  {
    id: 9,
    agenda: 'Training Session',
    visitorName: 'Doni Kurniawan',
    host_name: 'Putri Anggraini',
    visitor_period_start: '2026-10-27 13:30',
    visitor_period_end: '2026-10-27 14:30',
    status: 'Waiting',
  },
  {
    id: 10,
    agenda: 'Office Tour',
    visitorName: 'Tina Permata',
    host_name: 'Hendra Gunawan',
    start: '2026-10-27 16:00',
    end: '2026-10-27 17:00',
    status: 'Available',
  },
];

const dummyListVisitor: any[] = [
  {
    id: 101,
    visitor_name: 'Budi Santoso',
    visitor_email: 'budi@example.com',
    visitor_phone: '081234567890',
    invitation_code: 'INV-001',
    visitor_organization_name: 'PT Example Indonesia',
    host_name: 'DLAF',
    site_place_name: 'SPU',
    visitor_status: 'Available',
  },
  {
    id: 102,
    visitor_name: 'Siti Rahma',
    visitor_email: 'siti@example.com',
    visitor_phone: '081234567891',
    invitation_code: 'INV-002',
    visitor_organization_name: 'PT Maju Bersama',
    host_name: 'DLAF',
    site_place_name: 'SPU',
    visitor_status: 'Checkin',
  },
];

const statusBgMap: Record<string, string> = {
  Checkin: '#21c45d', // hijau
  Checkout: '#F44336', // merah
  Rejected: '#f44336',
  Block: '#000000', // hitam
  Deny: '#8B0000', // merah tua
  Approve: '#21c45d', // hijau
  Pracheckin: '#21c45d', // hijau
};
const statusLabelMap: Record<string, string> = {
  Checkin: 'Check In',
  Checkout: 'Check Out',
  Block: 'Blocked',
  Deny: 'Denied',
  Approve: 'Approved',
  Cancelled: 'Canceled',
  Pracheckin: 'Precheckin',
};

const Content = () => {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('lg'));
  const secdrawerWidth = 350;
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [openGroup, setOpenGroup] = useState(true);
  const [selectedVisitor, setSelectedVisitor] = useState<any | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const { t } = useTranslation();
  const groupVisitors = dummyListVisitor ?? [];
  const [groupDetailLoading, setGroupDetailLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [searchVisitor, setSearchVisitor] = useState('');
  const cards = [
    {
      title: 'Total Visitor',
      icon: IconUsers,
      subTitle: `${0}`,
      subTitleSetting: 10,
      color: 'none',
    },
  ];
  return (
    <Container title="Transaction Visitor" description="this is transaction visitor page">
      <Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 12 }}>
            <TopCard cardMarginBottom={1} items={cards} size={{ xs: 12, lg: 4 }} />
          </Grid>
        </Grid>
        <Box
          sx={{
            display: 'flex',
            flexDirection: mdUp ? 'row' : 'column',
            backgroundColor: '#fff',
            // bgcolor: 'background.paper',
            height: '100%',
            width: '100%',
            // overflow: 'hidden',
            marginTop: '5px',
          }}
        >
          <Box
            sx={{
              width: mdUp ? secdrawerWidth : '100%',
              borderRight: '1px solid #eee',
              p: 2,
              pt: 2,
              overflow: 'auto',
              height: { xs: '100%', md: '90vh' },
            }}
          >
            <Typography variant="h5" mb={2}>
              Event
            </Typography>

            <CustomTextField
              fullWidth
              size="small"
              placeholder="Search Event"
              // value={searchAgenda}
              // onChange={(e) => setSearchAgenda(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch fontSize="small" color="#9e9e9e" size={18} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end">
                      <IconFilterFilled size={18} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box>
              <Box>
                {dummyTransactions.map((transaction) => {
                  const statusColor = statusBgMap[transaction.status] ?? '#9E9E9E';
                  const statusLabel = statusLabelMap[transaction.status] ?? transaction.status;
                  const isSelected = selectedGroup?.id === transaction.id;

                  return (
                    <Box
                      key={transaction.id}
                      onClick={() => setSelectedGroup(transaction)}
                      sx={{
                        backgroundColor: isSelected ? '#e3f2fd' : '#fff',
                        border: '1px solid',
                        borderColor: isSelected ? '#90caf9' : '#e0e0e0',
                        // borderLeft: `4px solid ${statusColor}`,
                        borderRadius: 2,
                        p: 1.5,
                        cursor: 'pointer',
                        mb: 1,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: '#f5f9ff',
                          borderColor: '#90caf9',
                        },
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography fontWeight="bold" variant="h6">
                          {transaction.agenda}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {transaction.host_name}
                        </Typography>
                      </Box>

                      {/* <Typography variant="body2" color="text.secondary" mt={0.5}>
                        Visitor: {transaction.visitorName}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Host: {transaction.hostName}
                      </Typography> */}

                      <Stack spacing={0.75} sx={{ mt: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconCalendarEvent size={18} color="#1976d2" stroke={1.8} />
                          <Typography variant="body2" color="text.secondary">
                            Start: {formatDateTime(transaction.visitor_period_start)}
                          </Typography>
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconCalendarTime size={18} color="#1976d2" stroke={1.8} />
                          <Typography variant="body2" color="text.secondary">
                            End: {formatDateTime(transaction.visitor_period_end)}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Box display="flex" justifyContent="flex-end" mt={1}>
                        <Typography
                          sx={{
                            px: 1.2,
                            py: 0.4,
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor: statusColor,
                            color: '#fff',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {statusLabel}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>

          <Box
            flexGrow={1}
            p={2}
            sx={{
              height: { xs: 'auto', xl: '78vh' },
              overflow: 'auto',
            }}
          >
            {selectedGroup ? (
              <TableContainer
                component={Paper}
                sx={{
                  border: '1px solid #d6d6d6ff',
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 50 }}>
                        <IconButton size="small" onClick={() => setOpenGroup(!openGroup)}>
                          {openGroup ? <KeyboardArrowUpOutlined /> : <KeyboardArrowDownOutlined />}
                        </IconButton>
                      </TableCell>
                      {/* <TableCell>
                        <Typography>Today</Typography>
                      </TableCell> */}

                      <TableCell colSpan={9}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <CustomTextField
                            fullWidth
                            size="medium"
                            placeholder="Search visitor..."
                            sx={{ width: '300px' }}
                            value={searchVisitor}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setSearchVisitor(e.target.value)
                            }
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <IconSearch size={18} color="#9e9e9e" />
                                </InputAdornment>
                              ),
                            }}
                          />

                          <Box display="flex" gap={0.5}>
                            <Tooltip title="Export PDF" arrow>
                              <Button
                                variant="contained"
                                size="medium"
                                color="error"
                                startIcon={<IconFileTypePdf size={16} />}
                                sx={{ height: 36 }}
                              >
                                <Typography variant="caption" fontSize={'0.7rem'}>
                                  Export PDF
                                </Typography>
                              </Button>
                            </Tooltip>

                            <Tooltip title="Export Excel" arrow>
                              <Button
                                variant="contained"
                                size="medium"
                                color="success"
                                startIcon={<IconFileExport size={16} />}
                                sx={{ height: 36 }}
                              >
                                <Typography variant="caption" fontSize={'0.7rem'}>
                                  Export Excel
                                </Typography>
                              </Button>
                            </Tooltip>
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>{/* <Checkbox /> */}</TableCell>
                      <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                        Visitor Name
                      </TableCell>
                      <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                        Email
                      </TableCell>
                      <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                        Phone
                      </TableCell>
                      <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                        Invitation Code
                      </TableCell>
                      <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                        Organization
                      </TableCell>
                      <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                        Host
                      </TableCell>
                      <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                        Site
                      </TableCell>
                      <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                        Status
                      </TableCell>
                      <TableCell component="th" scope="row" sx={{ fontSize: '14px' }}>
                        {t('action')}
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  {openGroup && (
                    <TableBody>
                      {groupDetailLoading ? (
                        <TableRow>
                          <TableCell colSpan={10} align="center">
                            <CircularProgress size={24} />
                          </TableCell>
                        </TableRow>
                      ) : groupVisitors.length > 0 ? (
                        groupVisitors.map((visitor: any, index: number) => (
                          <VisitorRow
                            key={visitor.id}
                            visitor={visitor}
                            index={index}
                            selectedVisitor={selectedVisitor}
                            setSelectedVisitor={setSelectedVisitor}
                          />
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            <Typography color="text.secondary">No visitor data</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  )}
                </Table>
              </TableContainer>
            ) : (
              <Box
                height="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
                gap={1}
              >
                <img src={bg_nodata} width={150} />

                <Typography color="text.secondary" mt={2} variant="h5">
                  {t('selectGroupFromTheList')}
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ mt: 2 }}>
            {selectedVisitor && (
              <VisitorDetailPanel selectedVisitor={selectedVisitor} tab={tab} setTab={setTab} />
            )}
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Content;
