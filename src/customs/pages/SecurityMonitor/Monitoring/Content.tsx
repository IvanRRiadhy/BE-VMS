import React, { useEffect, useMemo, useState } from 'react';
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
import dayjs from 'dayjs';

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
    access: '',
    startDate: null,
    endDate: null,
  };

  const [filters, setFilters] = useState<any>(initialFilter);
  const handleResetFilter = () => {
    setFilters({ ...initialFilter });
    setStartDate('');
    setEndDate('');
  };
  const config = getConfig();
  const { activities, connected } = useMonitorActivities({
    host: config.WS_MONITOR,
    port: config.WS_MONITOR_PORT,
    username: config.WS_USERNAME,
    password: config.WS_PASSWORD,
  });
  const filteredMonitorActivities = useMemo(() => {
    return activities
      .filter((item: any) => {
        const matchVisitor =
          !filters.visitorName ||
          item.visitor_name?.toLowerCase() === filters.visitorName.toLowerCase();

        const matchHost =
          !filters.host ||
          item.host_name?.toLowerCase() === filters.host.toLowerCase();

        const matchSite =
          !filters.site ||
          item.site_name?.toLowerCase() === filters.site.toLowerCase();

        const itemDate = dayjs(item.timestamp);

        const matchStartDate =
          !startDate || !itemDate.isBefore(dayjs(startDate).startOf('day'));

        const matchEndDate =
          !endDate || !itemDate.isAfter(dayjs(endDate).endOf('day'));

        return (
          matchVisitor &&
          matchHost &&
          matchSite &&
          matchStartDate &&
          matchEndDate
        );
      })
      .map((item: any) => ({
        id: item.id,
        title: item.title,
        message: item.message,
        actor_name: item.actor_name,
        visitor_name: item.visitor_name,
        visitor_type: item.visitor_type,
        site_name: item.site_name,
        host_name: item.host_name,
        timestamp: formatDateTime(item.timestamp),
      }));
  }, [activities, filters, startDate, endDate]);
  // console.log('activities', activities);

  // const { data: visitorEmployee = [], isLoading } = useInvitationVisitorEmployee({
  //   search: debouncedSearch,
  //   start: 0,
  //   length: 10,
  // });

  // const dummyData = [
  //   {
  //     "event_id": "c18dd9f3-de7e-4a17-8aa9-c8430d8a2634",
  //     "service_source": "Visitor",
  //     "action_type": "checkout",
  //     "section": "Visit",
  //     "title": "Visitor Check-out",
  //     "message": "You have successfully checked out.",
  //     "icon": "VisitorCheckout",
  //     "priority": "Medium",
  //     "is_alarm": false,
  //     "timestamp": "2026-11-18T08:22:52.3609412Z",
  //     "actor_name": "Operator 1",
  //     "trx_visitor_id": "bf6908d7-9c57-4738-b0ff-9cf8f1ac2f92",
  //     "visitor_id": "6c3de97f-7661-4cb7-ab51-564d4a5d8cf3",
  //     "user_id": "416befe2-b840-4f35-b310-a079bf1b6a3b",
  //     "visitor_name": "Dion",
  //     "visitor_type": "General Visitor",
  //     "host_id": "bc0820d4-0123-44e0-b47b-5226fb96e6dc",
  //     "host_name": "DLAF",
  //     "employee_id": null,
  //     "site_id": "e3facb54-eae1-48d5-9457-3ef7d3f7ba3b",
  //     "site_name": "Gedung SINERGI",
  //     "location": "Gedung SINERGI",
  //     "card_number": null,
  //     "payload_details": {
  //       "action": "Checkout",
  //       "reason": null,
  //       "extended_minutes": null,
  //       "previous_period_end": null,
  //       "new_period_end": null,
  //       "card_type": null,
  //       "card_status": null,
  //       "approval_ticket_id": null,
  //       "approval_ticket_name": null,
  //       "approval_status": null,
  //       "current_step": null
  //     }
  //   },
  //   {
  //     "event_id": "90297feb-2198-48c3-b2fe-6364bfde4209",
  //     "service_source": "Visitor",
  //     "action_type": "checkout",
  //     "section": "Visit",
  //     "title": "Visitor Check-out",
  //     "message": "You have successfully checked out.",
  //     "icon": "VisitorCheckout",
  //     "priority": "Medium",
  //     "is_alarm": false,
  //     "timestamp": "2026-11-18T08:21:28.1168934Z",
  //     "actor_name": "Operator 1",
  //     "trx_visitor_id": "d4c4d3b6-fe90-4c83-abbc-83935da5fb25",
  //     "visitor_id": "a37adcf4-bae5-4766-aa77-387e35833afc",
  //     "user_id": "416befe2-b840-4f35-b310-a079bf1b6a3b",
  //     "visitor_name": "Geha",
  //     "visitor_type": "General Visitor",
  //     "host_id": "bc0820d4-0123-44e0-b47b-5226fb96e6dc",
  //     "host_name": "DLAF",
  //     "employee_id": null,
  //     "site_id": "e3facb54-eae1-48d5-9457-3ef7d3f7ba3b",
  //     "site_name": "Gedung SINERGI",
  //     "location": "Gedung SINERGI",
  //     "card_number": null,
  //     "payload_details": {
  //       "action": "Checkout",
  //       "reason": null,
  //       "extended_minutes": null,
  //       "previous_period_end": null,
  //       "new_period_end": null,
  //       "card_type": null,
  //       "card_status": null,
  //       "approval_ticket_id": null,
  //       "approval_ticket_name": null,
  //       "approval_status": null,
  //       "current_step": null
  //     }
  //   }
  // ]
  // const filteredMonitorActivities = useMemo(() => {
  //   return dummyData
  //     .filter((item: any) => {
  //       const matchVisitor =
  //         !filters.visitorName ||
  //         item.visitor_name?.toLowerCase() === filters.visitorName.toLowerCase();

  //       const matchHost =
  //         !filters.host ||
  //         item.host_name?.toLowerCase() === filters.host.toLowerCase();

  //       const matchSite =
  //         !filters.site ||
  //         item.site_name?.toLowerCase() === filters.site.toLowerCase();

  //       const itemDate = dayjs(item.timestamp);

  //       const matchStartDate =
  //         !startDate || !itemDate.isBefore(dayjs(startDate).startOf('day'));

  //       const matchEndDate =
  //         !endDate || !itemDate.isAfter(dayjs(endDate).endOf('day'));

  //       return (
  //         matchVisitor &&
  //         matchHost &&
  //         matchSite &&
  //         matchStartDate &&
  //         matchEndDate
  //       );
  //     })
  //     .map((item: any) => ({
  //       title: item.title,
  //       message: item.message,
  //       actor_name: item.actor_name,
  //       visitor_name: item.visitor_name,
  //       visitor_type: item.visitor_type,
  //       site_name: item.site_name,
  //       host_name: item.host_name,
  //       timestamp: formatDateTime(item.timestamp),
  //     }));
  // }, [dummyData, filters, startDate, endDate]);

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
                // data={monitorActivities ?? []}
                data={filteredMonitorActivities ?? []}
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
