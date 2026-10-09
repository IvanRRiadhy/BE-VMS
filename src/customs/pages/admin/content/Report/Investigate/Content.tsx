import React, { useEffect, useRef, useState } from 'react';
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';

import {
  Search,
  Refresh,
  KeyboardArrowRight,
  Download,
  Visibility,
  PersonOutline,
  DirectionsCarOutlined,
  GroupsOutlined,
  MapOutlined,
  AccessTimeOutlined,
  DirectionsCar,
} from '@mui/icons-material';

import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';

import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import dayjs, { Dayjs } from 'dayjs';
import {
  getInvestigateExport,
  getInvestigateVisitor,
  getInvestigateVisitorId,
} from 'src/customs/api/Admin/Report';
import utc from 'dayjs/plugin/utc';
import weekday from 'dayjs/plugin/weekday';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import 'dayjs/locale/id';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import GlobalBackdropLoading from '../../../components/GlobalBackdrop';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { useEmployees } from 'src/hooks/Employee/useEmployees';
import { useDebounce } from 'src/hooks/useDebounce';
import { useTranslation } from 'react-i18next';
dayjs.extend(utc);
dayjs.extend(weekday);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.locale('id');

const captureImages = [
  {
    time: '09:58',
    location: 'Entrance Gate',
    image: 'https://i.pravatar.cc/300?img=12',
  },
  {
    time: '10:02',
    location: 'Main Lobby',
    image: 'https://i.pravatar.cc/300?img=12',
  },
  {
    time: '10:05',
    location: 'Elevator',
    image: 'https://i.pravatar.cc/300?img=12',
  },
];

const statusBgMap: Record<string, string> = {
  Checkin: '#21c45d',
  Checkout: '#F44336',
  Block: '#000000',
  Deny: '#8B0000',
  Approve: '#21c45d',
  Pracheckin: '#21c45d',
  Preregis: '#a5a5a5ff',
  Waiting: '#4abfd4',
  Available: 'gray',
  Canceled: 'gray',
  'Checked Out': '#F44336',
  'Checked In': '#21c45d',
};

const statusLabelMap: Record<string, string> = {
  Checkin: 'Check In',
  Checkout: 'Check Out',
  'Checked Out': 'Check Out',
  'Checked In': 'Check In',
  Block: 'Block',
  Deny: 'Deny',
  Approve: 'Approve',
  Pracheckin: 'Precheckin',
  Preregis: 'Preregis',
  Waiting: 'Waiting',
  Available: 'Available',
  Canceled: 'Canceled',
};

const Content = () => {
  const [investigationTab, setInvestigationTab] = useState(0);
  const [detailTab, setDetailTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    keyword: '',
    startDate: '',
    endDate: '',
    location: '',
    status: '',
    visitorType: '',
    purpose: '',
    hostId: '',
    searchValue: '',
    vehicleNumber: '',
    sourceType: '',
    eventType: '',
  });
  const { t } = useTranslation();
  const debouncedSearchValue = useDebounce(filter.searchValue, 500);

  const getInvestigatePayload = () => ({
    start_date: startDate
      ? dayjs.utc(startDate).startOf('day').format('YYYY-MM-DDTHH:mm:ss')
      : undefined,

    end_date: endDate ? dayjs.utc(endDate).endOf('day').format('YYYY-MM-DDTHH:mm:ss') : undefined,

    keyword: filter.keyword || undefined,
    visitor_type: filter.visitorType || undefined,
    purpose: filter.purpose || undefined,
    host_id: filter.hostId || undefined,
    'search[value]': debouncedSearchValue || undefined,
    draw: 0,
    start: 0,
    length: 100,
    sort_dir: 'desc',
    source_type: filter.sourceType === '' ? undefined : filter.sourceType,

    event_type: filter.eventType === '' ? undefined : filter.eventType,
  });

  // const handleSearch = async () => {
  //   const payload = {
  //     start_date: dayjs.utc(startDate).startOf('day').format('YYYY-MM-DDTHH:mm:ss[Z]'),

  //     end_date: dayjs.utc(endDate).endOf('day').format('YYYY-MM-DDTHH:mm:ss[Z]'),

  //     keyword: filter.keyword || undefined,

  //     purpose: filter.purpose || undefined,

  //     host_id: filter.hostId || undefined,
  //     'search[value]': debouncedSearchValue || undefined,
  //     draw: 0,
  //     start: 0,
  //     length: 100,
  //     sort_dir: 'desc',
  //   };

  //   try {
  //     const response = await getInvestigateVisitor(payload);
  //     const collection = response?.collection ?? [];

  //     setVisitors(collection);
  //   } catch (error) {
  //     console.error('Failed to get investigate visitor:', error);
  //   }
  // };

  const handleFilterChange = (field: string, value: any) => {
    setFilter((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    setFilter({
      keyword: '',
      startDate: '',
      endDate: '',
      location: '',
      status: '',
      visitorType: '',
      purpose: '',
      hostId: '',
      searchValue: '',
      vehicleNumber: '',
      sourceType: '',
      eventType: '',
    });

    setStartDate(dayjs.utc().format('YYYY-MM-DD'));
    setEndDate(dayjs.utc().format('YYYY-MM-DD'));

    setVisitors([]);
    setSelectedVisitor(null);
  };

  // const [startDate, setStartDate] = useState(dayjs.utc().format('YYYY-MM-DD'));

  // const [endDate, setEndDate] = useState(dayjs.utc().format('YYYY-MM-DD'));

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [visitors, setVisitors] = useState<any[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<any | null>(null);

  const handleSelectVisitor = async (visitor: any) => {
    const payload = {
      start_date: dayjs.utc(startDate).startOf('day').format('YYYY-MM-DDTHH:mm:ss[Z]'),

      end_date: dayjs.utc(endDate).endOf('day').format('YYYY-MM-DDTHH:mm:ss[Z]'),

      keyword: filter.keyword || undefined,

      purpose: filter.purpose || undefined,

      host_id: filter.hostId || undefined,
      'search[value]': debouncedSearchValue || undefined,
      draw: 0,
      start: 0,
      length: 100,
      sort_dir: 'desc',
      source_type: filter.sourceType === '' ? undefined : filter.sourceType,

      event_type: filter.eventType === '' ? undefined : filter.eventType,
    };

    const response = await getInvestigateVisitorId(visitor.id, payload);

    setSelectedVisitor(response.collection);
  };

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    handleSearch();
  }, [debouncedSearchValue]);

  const handleExport = async () => {
    try {
      setLoading(true);

      const payload = getInvestigatePayload();

      const response = await getInvestigateExport(payload);

      const url = window.URL.createObjectURL(response.data);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'investigate-report.xlsx';

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      showSwal('success', 'Successfully exported report');
    } catch (error: any) {
      showSwal('error', error?.response?.data?.msg || 'Failed to export report');
    } finally {
      setLoading(false);
    }
  };

  const { employee = [] } = useEmployees();
  const visitorStatus = selectedVisitor?.visitor_info?.status ?? '';

  const statusColor = statusBgMap[visitorStatus] ?? 'gray';

  const statusLabel = (statusLabelMap[visitorStatus] ?? visitorStatus) || '-';

  const [visitorPage, setVisitorPage] = useState(0);
  const [hasMoreVisitors, setHasMoreVisitors] = useState(true);
  const [loadingMoreVisitors, setLoadingMoreVisitors] = useState(false);

  const VISITOR_PAGE_SIZE = 10;

  const loadVisitors = async (page = 0, append = false) => {
    try {
      if (append) {
        setLoadingMoreVisitors(true);
      } else {
        setLoading(true);
      }

      const payload = {
        start_date: dayjs.utc(startDate).startOf('day').format('YYYY-MM-DDTHH:mm:ss[Z]'),

        end_date: dayjs.utc(endDate).endOf('day').format('YYYY-MM-DDTHH:mm:ss[Z]'),

        keyword: filter.keyword || undefined,
        purpose: filter.purpose || undefined,
        host_id: filter.hostId || undefined,
        'search[value]': debouncedSearchValue || undefined,

        draw: 0,
        start: page * VISITOR_PAGE_SIZE,
        length: VISITOR_PAGE_SIZE,
        sort_dir: 'desc',
        source_type: filter.sourceType === '' ? undefined : filter.sourceType,

        event_type: filter.eventType === '' ? undefined : filter.eventType,
      };

      const response = await getInvestigateVisitor(payload);

      const collection = response?.collection ?? [];

      setVisitors((prev) => (append ? [...prev, ...collection] : collection));

      setVisitorPage(page);

      // Kalau data yang dikembalikan kurang dari 10,
      // berarti sudah tidak ada data berikutnya.
      setHasMoreVisitors(collection.length === VISITOR_PAGE_SIZE);
    } catch (error) {
      console.error('Failed to get investigate visitor:', error);
    } finally {
      setLoading(false);
      setLoadingMoreVisitors(false);
    }
  };

  const handleSearch = async () => {
    setVisitorPage(0);
    setHasMoreVisitors(true);
    setSelectedVisitor(null);

    await loadVisitors(0, false);
  };

  const handleLoadMoreVisitors = async () => {
    if (loadingMoreVisitors || !hasMoreVisitors) return;

    const nextPage = visitorPage + 1;

    await loadVisitors(nextPage, true);
  };

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container
        title="Investigate"
        description="Search and investigate visitor records, movements, and activities"
      >
        <Box
          sx={{
            p: { xs: 1, md: 2 },
            backgroundColor: '#f6f8fb',
            minHeight: 'calc(100vh - 100px)',
          }}
        >
          {/* ================= HEADER ================= */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#eef5ff',
                  color: '#1976d2',
                }}
              >
                <Search />
              </Box>

              <Box>
                <Typography fontSize={22} fontWeight={700} color="#172033">
                  Investigate
                </Typography>

                <Typography fontSize={13} color="text.secondary">
                  Search and investigate visitor records, movements, and activities across your
                  building.
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="outlined"
              startIcon={<Visibility />}
              sx={{
                textTransform: 'none',
                borderColor: '#d9e1ec',
                backgroundColor: '#fff',
              }}
            >
              Guide
            </Button>
          </Stack>

          <Card
            elevation={0}
            sx={{
              border: '1px solid #e4e9f0',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Tabs
              value={investigationTab}
              onChange={(_, value) => setInvestigationTab(value)}
              sx={{
                minHeight: 48,
                borderBottom: '1px solid #edf0f4',
                px: 1,
                '& .MuiTab-root': {
                  minHeight: 48,
                  textTransform: 'none',
                  fontSize: 13,
                  fontWeight: 500,
                },
              }}
            >
              <Tab
                icon={<PersonOutline sx={{ fontSize: 17 }} />}
                iconPosition="start"
                label="Visitor Investigation"
              />
              {/* 
              <Tab
                icon={<MapOutlined sx={{ fontSize: 17 }} />}
                iconPosition="start"
                label="Area Investigation"
              /> */}
            </Tabs>

            <Box
              sx={{
                p: 2,
                backgroundColor: '#fff',
                borderBottom: '1px solid #e7ebf0',
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    lg: '1.1fr 1.4fr 1.2fr 1fr',
                  },
                  gap: 1.5,
                }}
              >
                <FilterField
                  label="Keyword"
                  placeholder="Search Name"
                  value={filter.keyword}
                  onChange={(value) => handleFilterChange('keyword', value)}
                />

                <FilterField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(value) => {
                    setStartDate(value);

                    if (value && endDate && dayjs.utc(value).isAfter(dayjs.utc(endDate), 'day')) {
                      setEndDate(value);
                    }
                  }}
                />

                <FilterField
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(value) => {
                    if (
                      value &&
                      startDate &&
                      dayjs.utc(value).isBefore(dayjs.utc(startDate), 'day')
                    ) {
                      return;
                    }

                    setEndDate(value);
                  }}
                />
                <FilterSelect
                  label="Status"
                  value="All Status"
                  options={['All Status', 'Checked In', 'Expected', 'Upcoming', 'Not Arrived']}
                />

                <FilterSelect
                  label="Source Type"
                  value={filter.sourceType}
                  options={['All Types', 'AccessControl', 'CameraCCTV', 'Event']}
                  onChange={(value) =>
                    setFilter((prev) => ({
                      ...prev,
                      sourceType: value,
                    }))
                  }
                />

                <FilterSelect
                  label="Event Type"
                  value={filter.eventType}
                  options={[
                    'All Event Types',
                    'TapReader',
                    'CameraCapture',
                    'Alarm',
                    'AlarmAck',
                    'EvacuateTrigger',
                    'Status',
                  ]}
                  onChange={(value) =>
                    setFilter((prev) => ({
                      ...prev,
                      eventType: value,
                    }))
                  }
                />
                <FilterSelect
                  label="Purpose"
                  value="All Purposes"
                  options={['All Purposes', 'Visitor']}
                />
                <Box>
                  <Typography sx={{ mb: 0.5, fontSize: 13, fontWeight: 500 }}>Employee</Typography>
                  <Autocomplete
                    fullWidth
                    size="small"
                    options={employee}
                    getOptionLabel={(option) => option.full_name || option.name || ''}
                    value={employee.find((item: any) => item.id === filter.hostId) ?? null}
                    onChange={(_, value) => {
                      setFilter((prev) => ({
                        ...prev,
                        hostId: value?.id ?? '',
                      }));
                    }}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label=""
                        placeholder="Search employee..."
                        size="small"
                        sx={{
                          '& .MuiInputBase-input': {
                            fontSize: 12,
                          },
                          '& .MuiInputBase-input::placeholder': {
                            fontSize: 12,
                            opacity: 1,
                          },
                        }}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <Search fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Box>
              </Box>

              <Stack direction="row" justifyContent="flex-end" spacing={1} mt={1.5}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={handleReset}
                  sx={{
                    textTransform: 'none',
                    borderColor: '#d8e0eb',
                    color: '#536174',
                  }}
                >
                  Reset
                </Button>

                <Button
                  variant="contained"
                  startIcon={<Search />}
                  sx={{
                    textTransform: 'none',
                    boxShadow: 'none',
                  }}
                  onClick={handleSearch}
                >
                  {t('search')}
                </Button>
              </Stack>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  lg: '330px minmax(0, 1fr)',
                },
                minHeight: 620,
              }}
            >
              <Box
                sx={{
                  borderRight: {
                    xs: 'none',
                    lg: '1px solid #e7ebf0',
                  },
                  borderBottom: {
                    xs: '1px solid #e7ebf0',
                    lg: 'none',
                  },
                  backgroundColor: '#fff',
                }}
              >
                <Box sx={{ p: 1.75 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ width: '100%' }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 1,
                            alignItems: 'center',
                          }}
                        >
                          <Typography fontWeight={700} fontSize={14}>
                            Search Results
                          </Typography>

                          <Typography fontSize={11} color="text.secondary">
                            {visitors.length} visitors
                          </Typography>
                        </Box>
                        <TextField
                          size="small"
                          placeholder="Search visitor..."
                          value={filter.searchValue}
                          onChange={(e) =>
                            setFilter((prev) => ({
                              ...prev,
                              searchValue: e.target.value,
                            }))
                          }
                          fullWidth
                          sx={{
                            width: '100%',
                            '& .MuiOutlinedInput-root': {
                              height: 34,
                              fontSize: 12,
                              backgroundColor: '#fff',
                            },
                            '& .MuiInputBase-input': {
                              fontSize: 12,
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Search fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>
                    </Stack>
                  </Stack>
                </Box>

                <Divider />
                {/* {visitors.map((visitor) => (
                  <Box
                    key={visitor.id}
                    onClick={() => handleSelectVisitor(visitor)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <VisitorItem
                      visitor={visitor}
                      selected={selectedVisitor?.visitor_info?.id === visitor.id}
                    />
                  </Box>
                ))} */}
                <Divider />

                <Box
                  onScroll={(event) => {
                    const target = event.currentTarget;

                    const isNearBottom =
                      target.scrollTop + target.clientHeight >= target.scrollHeight - 100;

                    if (isNearBottom) {
                      handleLoadMoreVisitors();
                    }
                  }}
                  sx={{
                    height: 500,
                    overflowY: 'auto',
                  }}
                >
                  {visitors.map((visitor) => (
                    <Box
                      key={visitor.id}
                      onClick={() => handleSelectVisitor(visitor)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <VisitorItem
                        visitor={visitor}
                        selected={selectedVisitor?.visitor_info?.id === visitor.id}
                      />
                    </Box>
                  ))}

                  {loadingMoreVisitors && (
                    <Box
                      sx={{
                        py: 1.5,
                        textAlign: 'center',
                      }}
                    >
                      <Typography fontSize={11} color="text.secondary">
                        Loading more visitors...
                      </Typography>
                    </Box>
                  )}

                  {!hasMoreVisitors && visitors.length > 0 && (
                    <Box
                      sx={{
                        py: 1.5,
                        textAlign: 'center',
                      }}
                    >
                      <Typography fontSize={11} color="text.secondary">
                        No more visitors
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              <Box sx={{ backgroundColor: '#fff', minWidth: 0 }}>
                <Box
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                      src={
                        selectedVisitor?.visitor_info?.avatar_url
                          ? `${axiosInstance2.defaults.baseURL}/cdn${selectedVisitor.visitor_info.avatar_url}`
                          : undefined
                      }
                      sx={{
                        width: 48,
                        height: 48,
                        border: '1px solid #e2e7ef',
                      }}
                    >
                      {selectedVisitor?.visitor_info?.full_name?.charAt(0)?.toUpperCase()}
                    </Avatar>

                    <Box>
                      <Typography fontSize={16} fontWeight={700} color="#182230">
                        {selectedVisitor?.visitor_info?.full_name ?? '-'}
                      </Typography>

                      <Typography fontSize={12} color="text.secondary">
                        {selectedVisitor?.visitor_info?.company ?? '-'}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    {selectedVisitor && (
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<Download />}
                        onClick={handleExport}
                      >
                        Export Report
                      </Button>
                    )}

                    {/* <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      sx={{
                        textTransform: 'none',
                        borderColor: '#d8e0eb',
                      }}
                    >
                      View Invitation
                    </Button> */}
                    {/* 
                    <IconButton size="small">
                      <MoreVert fontSize="small" />
                    </IconButton> */}
                  </Stack>
                </Box>

                {/* Detail Tabs */}
                <Tabs
                  value={detailTab}
                  onChange={(_, value) => setDetailTab(value)}
                  variant="scrollable"
                  scrollButtons={false}
                  sx={{
                    px: 1,
                    borderTop: '1px solid #edf0f4',
                    borderBottom: '1px solid #edf0f4',
                    minHeight: 43,
                    '& .MuiTab-root': {
                      minHeight: 43,
                      textTransform: 'none',
                      fontSize: 12,
                      minWidth: 'auto',
                      px: 1.5,
                    },
                  }}
                >
                  <Tab
                    icon={<PersonOutline sx={{ fontSize: 16 }} />}
                    iconPosition="start"
                    label="Overview"
                  />

                  <Tab
                    icon={<MapOutlined sx={{ fontSize: 16 }} />}
                    iconPosition="start"
                    label={`Movement (${selectedVisitor?.movement_count ?? 0})`}
                  />

                  <Tab
                    icon={<AccessTimeOutlined sx={{ fontSize: 16 }} />}
                    iconPosition="start"
                    label={`Access Log (${selectedVisitor?.access_log_count ?? 0})`}
                  />

                  <Tab
                    icon={<DirectionsCarOutlined sx={{ fontSize: 16 }} />}
                    iconPosition="start"
                    label="Vehicle"
                  />

                  <Tab
                    icon={<GroupsOutlined sx={{ fontSize: 16 }} />}
                    iconPosition="start"
                    label={`Related People (${selectedVisitor?.related_people_count ?? 0})`}
                  />
                </Tabs>

                {detailTab === 0 && (
                  <Box sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          xl: '1fr 1.2fr',
                        },
                        gap: 2,
                      }}
                    >
                      {/* LEFT */}
                      <Box>
                        <InformationCard title="Visitor Information" action>
                          <InfoRow
                            label="Full Name"
                            value={selectedVisitor?.visitor_info?.full_name ?? '-'}
                          />

                          <InfoRow
                            label="Company"
                            value={selectedVisitor?.visitor_info?.company ?? '-'}
                          />

                          <InfoRow
                            label="Visitor Type"
                            value={selectedVisitor?.visitor_info?.visitor_type ?? '-'}
                          />

                          <InfoRow
                            label="Purpose"
                            value={selectedVisitor?.visitor_info?.purpose ?? '-'}
                          />

                          <InfoRow
                            label="Host (Employee)"
                            value={selectedVisitor?.visitor_info?.host_employee ?? '-'}
                          />

                          <InfoRow
                            label="Visit Schedule"
                            value={selectedVisitor?.visitor_info?.visit_schedule ?? '-'}
                          />

                          <InfoRow
                            label="Current Location"
                            value={selectedVisitor?.visitor_info?.current_location ?? '-'}
                          />

                          {/* <InfoRow
                            label="Status"
                            value={<StatusChip label={statusLabel} color={statusColor} />}
                          /> */}
                        </InformationCard>

                        <InformationCard title="Vehicle Information" action>
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 120px',
                              gap: 2,
                            }}
                          >
                            <Box>
                              <InfoRow
                                label="Vehicle Number"
                                value={selectedVisitor?.vehicle_info?.vehicle_number ?? '-'}
                              />

                              <InfoRow
                                label="Vehicle Type"
                                value={selectedVisitor?.vehicle_info?.vehicle_type ?? '-'}
                              />

                              <InfoRow
                                label="Parking Area"
                                value={selectedVisitor?.vehicle_info?.parking_area ?? '-'}
                              />

                              <InfoRow
                                label="Check In"
                                value={selectedVisitor?.vehicle_info?.check_in ?? '-'}
                              />

                              <InfoRow
                                label="Check Out"
                                value={selectedVisitor?.vehicle_info?.check_out ?? '-'}
                              />
                            </Box>

                            <Box
                              sx={{
                                width: '100%',
                                height: 85,
                                borderRadius: 1.5,
                                backgroundColor: '#f1f4f8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <DirectionsCar
                                sx={{
                                  fontSize: 36,
                                  color: '#98a2b3',
                                }}
                              />
                            </Box>
                          </Box>
                        </InformationCard>
                      </Box>

                      {/* RIGHT */}
                      <Box>
                        <Typography fontSize={16} fontWeight={700} mb={1}>
                          Capture Images
                        </Typography>

                        <Stack direction="row" spacing={1}>
                          {selectedVisitor?.capture_images?.map((item: any) => (
                            <Box
                              key={item.id}
                              sx={{
                                width: selectedVisitor?.capture_images?.length === 1 ? '150px' : 0,
                                flex: selectedVisitor?.capture_images?.length === 1 ? 'none' : 1,
                              }}
                            >
                              <Box
                                sx={{
                                  position: 'relative',
                                  height: 110,
                                  borderRadius: 1.5,
                                  overflow: 'hidden',
                                  backgroundColor: '#eef1f5',
                                }}
                              >
                                <Box
                                  component="img"
                                  src={`${axiosInstance2.defaults.baseURL}/cdn${item.image_url}`}
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                  }}
                                />

                                <IconButton
                                  size="small"
                                  sx={{
                                    position: 'absolute',
                                    right: 5,
                                    bottom: 5,
                                    width: 25,
                                    height: 25,
                                    backgroundColor: '#fff',
                                  }}
                                >
                                  <Search sx={{ fontSize: 15 }} />
                                </IconButton>
                              </Box>

                              <Typography fontSize={12} fontWeight={700} mt={0.5}>
                                {item.time}
                              </Typography>

                              <Typography fontSize={11} color="text.secondary">
                                {item.location || '-'}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>

                        <Divider sx={{ my: 2 }} />
                        {/* Timeline */}
                        <Box mt={2.5}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={2}
                          >
                            <Typography fontSize={16} fontWeight={700}>
                              Visit Timeline
                            </Typography>

                            <Typography fontSize={14} color="primary" sx={{ cursor: 'pointer' }}>
                              View All
                            </Typography>
                          </Stack>

                          {selectedVisitor?.visit_timeline?.map((item: any, index: number) => (
                            <TimelineItem
                              key={item.id}
                              time={item.time}
                              title={item.title}
                              location={item.location || item.subtitle || '-'}
                              active={item.status === 'Completed'}
                              last={index === selectedVisitor.visit_timeline.length - 1}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                )}

                {detailTab === 1 && <PlaceholderTab title="Movement" />}
                {detailTab === 2 && <PlaceholderTab title="Access Log" />}
                {detailTab === 3 && (
                  <Stack spacing={1.25} p={1.5}>
                    {selectedVisitor?.vehicle_records?.map((vehicle: any) => (
                      <Box
                        key={vehicle.id}
                        sx={{
                          p: 1.5,
                          border: '1px solid #e2e7ef',
                          borderRadius: 2,
                          backgroundColor: '#fff',
                        }}
                      >
                        <Stack direction="row" spacing={1.25} alignItems="center">
                          {/* Vehicle Icon */}
                          <Box
                            sx={{
                              width: 42,
                              height: 42,
                              borderRadius: 2,
                              backgroundColor: '#eaf3ff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#1976d2',
                              flexShrink: 0,
                            }}
                          >
                            <DirectionsCar fontSize="small" />
                          </Box>

                          {/* Vehicle Info */}
                          <Box flex={1} minWidth={0}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              gap={1}
                            >
                              <Typography fontSize={13} fontWeight={700} noWrap>
                                {vehicle.plate_number || '-'}
                              </Typography>

                              <StatusChip
                                label={vehicle.parking_status || '-'}
                                color={statusBgMap[vehicle.parking_status] ?? 'gray'}
                              />
                            </Stack>

                            <Typography fontSize={11} color="text.secondary" mt={0.25}>
                              {vehicle.vehicle_type || '-'}
                            </Typography>

                            <Typography fontSize={10} color="text.secondary" mt={0.5} noWrap>
                              {vehicle.gate_in_name || '-'}
                            </Typography>
                          </Box>
                        </Stack>

                        {/* Vehicle Details */}
                        <Box
                          sx={{
                            mt: 1.25,
                            pt: 1.25,
                            borderTop: '1px solid #edf0f4',
                          }}
                        >
                          <Stack spacing={0.75}>
                            <InfoRow label="Parking Area" value={vehicle.parking_area || '-'} />

                            <InfoRow label="Parking Slot" value={vehicle.parking_slot || '-'} />

                            <InfoRow label="Entry Time" value={vehicle.entry_time || '-'} />

                            <InfoRow label="Duration" value={vehicle.duration || '-'} />

                            <InfoRow label="Access" value={vehicle.gate_access_info || '-'} />
                          </Stack>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                )}
                {detailTab === 4 && (
                  <Stack spacing={1.25} p={1.5}>
                    {selectedVisitor?.related_people?.map((person: any) => (
                      <Box
                        key={person.id}
                        sx={{
                          p: 1.5,
                          border: '1px solid #e2e7ef',
                          borderRadius: 2,
                          backgroundColor: '#fff',
                        }}
                      >
                        <Stack direction="row" spacing={1.25} alignItems="center">
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              backgroundColor: '#eaf3ff',
                              color: '#1976d2',
                              fontSize: 14,
                              fontWeight: 700,
                            }}
                          >
                            {person.full_name?.charAt(0)?.toUpperCase()}
                          </Avatar>

                          <Box flex={1} minWidth={0}>
                            <Typography fontSize={13} fontWeight={700} noWrap>
                              {person.full_name}
                            </Typography>

                            <Typography fontSize={11} color="text.secondary" noWrap>
                              {person.company || '-'}
                            </Typography>

                            <Stack
                              direction="row"
                              spacing={0.75}
                              alignItems="center"
                              mt={0.5}
                              flexWrap="wrap"
                            >
                              <Typography fontSize={10} color="text.secondary">
                                {person.role}
                              </Typography>

                              <Typography fontSize={10} color="text.secondary">
                                •
                              </Typography>

                              <Typography fontSize={10} color="text.secondary">
                                {person.visitor_type}
                              </Typography>
                            </Stack>
                          </Box>

                          <StatusChip
                            label={person.status}
                            color={statusBgMap[person.status] ?? 'gray'}
                          />
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </Box>
          </Card>
        </Box>
      </Container>
      <GlobalBackdropLoading open={loading} />
    </PageContainer>
  );
};

const FilterField = ({
  label,
  placeholder,
  value,
  icon,
  onChange,
  onClick,
  type = 'text',
}: {
  label: string;
  placeholder?: string;
  value?: string;
  icon?: React.ReactNode;
  onChange?: (value: string) => void;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  type?: 'text' | 'date';
}) => (
  <Box>
    <Typography fontSize={11} fontWeight={600} color="#3b4656" mb={0.5}>
      {label}
    </Typography>

    <TextField
      fullWidth
      size="small"
      type={type}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      onClick={onClick}
      InputProps={{
        readOnly: !!onClick,
        endAdornment:
          type !== 'date' && icon ? (
            <InputAdornment position="end">{icon}</InputAdornment>
          ) : undefined,
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          height: 36,
          fontSize: 12,
          backgroundColor: '#fff',
        },

        '& .MuiInputBase-input': {
          fontSize: 12,
        },
      }}
    />
  </Box>
);

const FilterSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange?: (value: string) => void;
}) => (
  <Box>
    <Typography fontSize={11} fontWeight={600} color="#3b4656" mb={0.5}>
      {label}
    </Typography>

    <FormControl fullWidth size="small">
      <Select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        sx={{
          height: 36,
          fontSize: 12,
          backgroundColor: '#fff',
        }}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Box>
);

const VisitorItem = ({ visitor, selected }: { visitor: any; selected: boolean }) => {
  const status = visitor.visitor_status;

  const statusLabel = statusLabelMap[status] ?? status ?? '-';
  const statusColor = statusBgMap[status] ?? 'gray';

  return (
    <Box
      sx={{
        px: 1.75,
        py: 1.25,
        cursor: 'pointer',
        borderLeft: selected ? '3px solid #1976d2' : '3px solid transparent',
        backgroundColor: selected ? '#eaf3ff' : '#fff',
        boxShadow: selected ? 'inset 0 0 0 1px rgba(25, 118, 210, 0.08)' : 'none',
        transition: 'all 0.15s ease',
        '&:hover': {
          backgroundColor: selected ? '#eaf3ff' : '#f7faff',
        },
      }}
    >
      <Stack direction="row" spacing={1.2} alignItems="center">
        <Avatar
          src={
            visitor.selfie_image
              ? `${axiosInstance2.defaults.baseURL}/cdn${visitor.selfie_image}`
              : undefined
          }
          sx={{
            width: 45,
            height: 45,
            flexShrink: 0,
          }}
        >
          {!visitor.selfie_image && visitor.visitor_name?.charAt(0)?.toUpperCase()}
        </Avatar>
        <Box flex={1} minWidth={0}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography
              fontSize={14}
              fontWeight={selected ? 700 : 600}
              color={selected ? '#1565c0' : '#182230'}
              noWrap
            >
              {visitor.visitor_name}
            </Typography>

            <Typography fontSize={10} color="text.secondary" noWrap>
              {visitor.time}
            </Typography>
          </Stack>

          <Typography fontSize={12} color="text.secondary" noWrap>
            {visitor.visitor_organization_name}
          </Typography>

          <StatusChip label={statusLabel} color={statusColor} />
        </Box>

        <KeyboardArrowRight
          sx={{
            fontSize: 18,
            color: '#8792a2',
          }}
        />
      </Stack>
    </Box>
  );
};

const StatusChip = ({ label, color }: { label: string; color: string }) => {
  return (
    <Chip
      size="small"
      label={
        <Stack direction="row" spacing={0.6} alignItems="center">
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: color,
            }}
          />

          <span>{label}</span>
        </Stack>
      }
      sx={{
        mt: 0.5,
        height: 22,
        borderRadius: 1,
        backgroundColor: `${color}18`,
        color: color,
        fontSize: 11,
        fontWeight: 600,
        '& .MuiChip-label': {
          px: 0.8,
        },
      }}
    />
  );
};

const InformationCard = ({
  title,
  action,
  children,
}: {
  title: string;
  action?: boolean;
  children: React.ReactNode;
}) => (
  <Box
    sx={{
      border: '1px solid #e5e9ef',
      borderRadius: 1.5,
      mb: 2,
      overflow: 'hidden',
    }}
  >
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      px={1.5}
      py={1}
      sx={{
        backgroundColor: '#fafbfd',
        borderBottom: '1px solid #e8ecf1',
      }}
    >
      <Typography fontSize={16} fontWeight={700}>
        {title}
      </Typography>

      {/* {action && (
        <Button
          size="small"
          startIcon={<EditOutlined sx={{ fontSize: 14 }} />}
          sx={{
            textTransform: 'none',
            fontSize: 10,
            minWidth: 0,
          }}
        >
          Edit
        </Button>
      )} */}
    </Stack>

    <Box px={1.5} py={1.2}>
      {children}
    </Box>
  </Box>
);

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Stack
    direction="row"
    spacing={2}
    sx={{
      py: 0.45,
    }}
  >
    <Typography
      fontSize={12}
      color="text.secondary"
      sx={{
        width: 105,
        flexShrink: 0,
      }}
    >
      {label}
    </Typography>

    <Typography fontSize={12} fontWeight={500} color="#303b4b">
      {value}
    </Typography>
  </Stack>
);

const TimelineItem = ({
  time,
  title,
  location,
  active,
  last,
}: {
  time: string;
  title: string;
  location: string;
  active?: boolean;
  last?: boolean;
}) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: '50px 24px 1fr',
      minHeight: last ? 48 : 60,
    }}
  >
    <Typography fontSize={13} color="text.secondary" pt={0.2} fontWeight={600}>
      {time}
    </Typography>{' '}
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      {!last && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            bottom: -2,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '1px',
            backgroundColor: '#d7dee8',
          }}
        />
      )}

      {/* Dot */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          width: 9,
          height: 9,
          mt: 0.35,
          borderRadius: '50%',
          backgroundColor: active ? '#1976d2' : '#c8d0dc',
          border: '2px solid #fff',
          boxSizing: 'content-box',
        }}
      />
    </Box>
    {/* Content */}
    <Box>
      <Typography fontSize={13} fontWeight={600} lineHeight={1.3}>
        {title}
      </Typography>

      <Typography fontSize={12} color="text.secondary" lineHeight={1.8}>
        {location}
      </Typography>
    </Box>
  </Box>
);
const PlaceholderTab = ({ title }: { title: string }) => (
  <Box
    sx={{
      p: 5,
      minHeight: 400,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Box textAlign="center">
      <AccessTimeOutlined
        sx={{
          fontSize: 40,
          color: '#b5bfcc',
          mb: 1,
        }}
      />

      <Typography fontWeight={600} color="#445064">
        {title}
      </Typography>

      <Typography fontSize={12} color="text.secondary" mt={0.5}>
        Investigation data will be displayed here.
      </Typography>
    </Box>
  </Box>
);

export default Content;
