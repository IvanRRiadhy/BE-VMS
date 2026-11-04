import {
  ContentCopy,
  KeyboardArrowDownOutlined,
  KeyboardArrowUpOutlined,
  Security,
} from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
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
  MenuItem,
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
  IconRefresh,
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
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';

import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import dayjs from 'dayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/id';
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
    // event_id: '550e8400-e29b-41d4-a716-446655440000',
    // service_source: 0,
    // action_type: 'VISITOR_CHECK_IN',
    // section: 0,
    title: 'Visitor Check-In',
    message: 'John Doe has successfully checked in at Main Lobby.',
    // icon: 0,
    // priority: 1,
    // is_alarm: false,
    // timestamp: '2026-11-04T09:30:00Z',
    actor_name: 'Security Officer',
    // trx_visitor_id: '650e8400-e29b-41d4-a716-446655440000',
    // visitor_id: '750e8400-e29b-41d4-a716-446655440000',
    // user_id: null,
    visitor_name: 'John Doe',
    visitor_type: 'Business Visitor',
    // host_id: '850e8400-e29b-41d4-a716-446655440000',
    host_name: 'Michael Smith',
    // employee_id: null,
    // site_id: '950e8400-e29b-41d4-a716-446655440000',
    site_name: 'Head Office',
    // location: 'Main Lobby',
    // card_number: 'CARD-00125',
    vehicle_plate: 'B 1234 ABC',
    vehicle_type: 'Car',
    check_in_time: formatDateTime('2026-11-04T09:30:00Z'),
    check_out_time: formatDateTime('2026-11-04T10:30:00Z'),
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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const minWidth = 240;
      const maxWidth = 600;

      setSidebarWidth(Math.min(maxWidth, Math.max(minWidth, e.clientX - 16)));
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  const initialFilter: any = {
    site: '',
    host: '',
    visitorName: '',
    startDate: null,
    endDate: null,
  };

  const [filters, setFilters] = useState<any>(initialFilter);

  const handleResetFilter = () => {
    setFilters(initialFilter);
  };

  return (
    <Container title="Transaction Visitor" description="this is transaction visitor page">
      <Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 12 }}>
            {/* <TopCard cardMarginBottom={1} items={cards} size={{ xs: 12, lg: 4 }} /> */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#fff',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h5" color="textPrimary">
                  Monitoring Data Visitor
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  mb: 2,
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  {/* Site */}
                  <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <CustomFormLabel sx={{ mt: 0 }}>Site</CustomFormLabel>
                    <CustomSelect
                      fullWidth
                      displayEmpty
                      value={filters.site}
                      onChange={(e: any) =>
                        setFilters((prev) => ({ ...prev, site: e.target.value }))
                      }
                    >
                      <MenuItem value="">All Sites</MenuItem>
                      <MenuItem value="site-1">Site 1</MenuItem>
                      <MenuItem value="site-2">Site 2</MenuItem>
                    </CustomSelect>
                  </Grid>

                  {/* Host */}
                  <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <CustomFormLabel sx={{ mt: 0 }}>Host</CustomFormLabel>
                    <CustomSelect
                      fullWidth
                      displayEmpty
                      value={filters.host}
                      onChange={(e: any) =>
                        setFilters((prev) => ({ ...prev, host: e.target.value }))
                      }
                    >
                      <MenuItem value="">All Hosts</MenuItem>
                      <MenuItem value="host-1">Host 1</MenuItem>
                      <MenuItem value="host-2">Host 2</MenuItem>
                    </CustomSelect>
                  </Grid>

                  {/* Visitor Name */}
                  <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <CustomFormLabel sx={{ mt: 0 }}>Visitor Name</CustomFormLabel>
                    <CustomSelect
                      fullWidth
                      displayEmpty
                      value={filters.visitorName}
                      onChange={(e: any) =>
                        setFilters((prev) => ({ ...prev, host: e.target.value }))
                      }
                    >
                      <MenuItem value="">All Visitor</MenuItem>
                      <MenuItem value="Danny">Danny</MenuItem>
                      <MenuItem value="Ilham">Ilham</MenuItem>
                    </CustomSelect>
                  </Grid>

                  {/* Start Date */}
                  <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                    <CustomFormLabel sx={{ mt: 0 }}>Start Date</CustomFormLabel>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
                      <DatePicker
                        format="DD/MM/YYYY"
                        value={startDate ? dayjs(startDate) : null}
                        onChange={(value) => {
                          const date = value?.isValid() ? value.format('YYYY-MM-DD') : '';
                          setStartDate(date);

                          if (
                            date &&
                            endDate &&
                            dayjs.utc(date).isAfter(dayjs.utc(endDate), 'day')
                          ) {
                            setEndDate(date);
                          }
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            placeholder: 'DD/MM/YYYY',
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>

                  {/* End Date */}
                  <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                    <CustomFormLabel sx={{ mt: 0 }}>End Date</CustomFormLabel>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
                      <DatePicker
                        format="DD/MM/YYYY"
                        value={endDate ? dayjs(endDate) : null}
                        minDate={startDate ? dayjs(startDate) : undefined}
                        onChange={(value) => {
                          setEndDate(value?.isValid() ? value.format('YYYY-MM-DD') : '');
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            placeholder: 'DD/MM/YYYY',
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>

                  {/* Reset */}
                  <Grid size={{ xs: 12, sm: 6, md: 1 }}>
                    <CustomFormLabel sx={{ mt: 0 }}>Action</CustomFormLabel>
                    <Button
                      fullWidth
                      size="small"
                      variant="contained"
                      color="primary"
                      startIcon={<IconRefresh />}
                      onClick={handleResetFilter}
                    >
                      Reset Filter
                    </Button>
                  </Grid>
                </Grid>
              </Box>
              <DynamicTable
                // loading={isLoading}
                overflowX="auto"
                data={dummyTransactions}
                isHavePagination={false}
                isHaveSearch={false}
                isHaveHeaderTitle
                titleHeader=""
                // defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[25, 50, 100]}
                // totalCount={totalRecords}
                // currentPage={page}
                // searchKeyword={search}
                // onSearch={handleSearch}
                // onPaginationChange={(newPage, newRowsPerPage) => {
                //   setPage(newPage);
                //   setRowsPerPage(newRowsPerPage);
                // }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Content;
