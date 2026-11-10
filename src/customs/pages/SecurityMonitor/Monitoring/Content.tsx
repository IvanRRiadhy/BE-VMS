import React, { useEffect, useState } from 'react';
import PageContainer from 'src/customs/components/container/PageContainer';
import Container from 'src/components/container/PageContainer';
import {
  Box,
  Grid2 as Grid,
  Portal,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Button,
  Typography,
  CircularProgress,
  Paper,
  MenuItem,
} from '@mui/material';
import { IconRefresh, IconSearch, IconUsers } from '@tabler/icons-react';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import { useTranslation } from 'react-i18next';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import 'dayjs/locale/id';
import { useMonitorActivities } from 'src/hooks/Monitoring/useMonitorActivities';
import { getConfig } from 'src/config';
import MonitoringFilter from './components/MonitoringFilter';

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
    timestamp: formatDateTime('2026-11-04T09:30:00Z'),
    // actor_name: 'Security Officer',
    // trx_visitor_id: '650e8400-e29b-41d4-a716-446655440000',
    // visitor_id: '750e8400-e29b-41d4-a716-446655440000',
    // user_id: null,
    // visitor_name: 'John Doe',
    // visitor_type: 'Business Visitor',
    // host_id: '850e8400-e29b-41d4-a716-446655440000',
    // host_name: 'Michael Smith',
    // employee_id: null,
    // site_id: '950e8400-e29b-41d4-a716-446655440000',
    // site_name: 'Head Office',
    // location: 'Main Lobby',
    // card_number: 'CARD-00125',
    // vehicle_plate: 'B 1234 ABC',
    // vehicle_type: 'Car',
    // check_in_time: formatDateTime('2026-11-04T09:30:00Z'),
    // check_out_time: formatDateTime('2026-11-04T10:30:00Z'),
  },
  {
    title: 'Visitor Check-Out',
    message: 'John Doe has successfully checked out at Main Lobby.',
    timestamp: formatDateTime('2026-11-04T10:30:00Z'),
  }

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
    access: '',
    startDate: null,
    endDate: null,
  };

  const [filters, setFilters] = useState<any>(initialFilter);

  const handleResetFilter = () => {
    setFilters(initialFilter);
  };

  const config = getConfig();
  const { activities, connected } = useMonitorActivities({
    host: '103.193.15.67',
    port: 15675,
    username: 'user',
    password: 'root',
  });

  console.log('activities', activities);


  // const { data: visitorEmployee = [], isLoading } = useInvitationVisitorEmployee({
  //   search: debouncedSearch,
  //   start: 0,
  //   length: 10,
  // });

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

              <MonitoringFilter
                filters={filters}
                setFilters={setFilters}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                handleResetFilter={handleResetFilter}
              />
              <DynamicTable
                // loading={isLoading}
                overflowX="auto"
                data={dummyTransactions}
                isHavePagination={false}
                isHaveSearch={false}
                isHaveHeaderTitle
                titleHeader=""
                // defaultRowsPerPage={rowsPerPage}
                // rowsPerPageOptions={[25, 50, 100]}
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
