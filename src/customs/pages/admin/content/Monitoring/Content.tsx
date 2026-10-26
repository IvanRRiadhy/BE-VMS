import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import {
  AccessTime,
  CalendarMonth,
  CheckCircleOutline,
  DeleteOutline,
  History,
  Login,
  Logout,
  People,
  Search,
  Settings,
  TableRestaurant,
} from '@mui/icons-material';

import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';

import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useNavigate } from 'react-router';

type ActivityCategory = 'Booking' | 'Desk' | 'System' | 'Integrating';

type ActivityStatus = 'Success' | 'Pending' | 'Failed';

type VisitorStatus = 'Waiting' | 'Checkin' | 'Checkout' | 'Denied' | 'Block' | 'Preregis';

interface VisitorActivityItem {
  id: number;
  eventTime: string;
  visitorName: string;
  visitorType: string;
  hostName: string;
  site: string;
  status: VisitorStatus;
}

const visitorData: VisitorActivityItem[] = [
  {
    id: 1,
    eventTime: '10:45 AM',
    visitorName: 'John Doe',
    visitorType: 'Guest',
    hostName: 'Jane Smith',
    site: 'Lobby',
    status: 'Checkin',
  },
  {
    id: 2,
    eventTime: '10:42 AM',
    visitorName: 'Michael Tan',
    visitorType: 'Contractor',
    hostName: 'System Admin',
    site: 'Floor 2',
    status: 'Waiting',
  },
  {
    id: 3,
    eventTime: '10:40 AM',
    visitorName: 'Sarah Lee',
    visitorType: 'VIP',
    hostName: 'Robert Wilson',
    site: 'Meeting Room A',
    status: 'Checkout',
  },
  {
    id: 4,
    eventTime: '10:38 AM',
    visitorName: 'David Chen',
    visitorType: 'Guest',
    hostName: 'John Smith',
    site: 'Lobby',
    status: 'Checkin',
  },
  {
    id: 5,
    eventTime: '10:35 AM',
    visitorName: 'Emily Wong',
    visitorType: 'Contractor',
    hostName: 'Admin',
    site: 'Floor 3',
    status: 'Denied',
  },
];
const stats = [
  {
    label: 'Total Visitors',
    value: '5',
    icon: <People />,
    type: 'blue',
  },
  {
    label: 'Check In',
    value: '2',
    icon: <Login />,
    type: 'green',
  },
  {
    label: 'Check Out',
    value: '1',
    icon: <Logout />,
    type: 'red',
  },
  {
    label: 'Waiting',
    value: '1',
    icon: <AccessTime />,
    type: 'orange',
  },

  {
    label: 'Active Visitors',
    value: '5',
    icon: <CheckCircleOutline />,
    type: 'teal',
  },
];

const iconBackground: Record<string, string> = {
  blue: '#3285dc',
  green: '#2eb66d',
  orange: '#ed9b16',
  purple: '#8144d4',
  teal: '#169b9b',
  red: '#e74c3c',
};

const statusStyles: Record<
  ActivityStatus,
  {
    background: string;
    color: string;
    border: string;
  }
> = {
  Success: {
    background: '#dff6e8',
    color: '#176b3a',
    border: '#75c996',
  },
  Pending: {
    background: '#fff1cc',
    color: '#806020',
    border: '#e0bd62',
  },
  Failed: {
    background: '#fde2e2',
    color: '#a52828',
    border: '#e39a9a',
  },
};

const Content = () => {
  const [category, setCategory] = useState('All Categories');
  const [action, setAction] = useState('All Actions');
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // const filteredData = useMemo(() => {
  //   return visitorData.filter((item) => {
  //     const matchCategory = category === 'All Categories' || item.category === category;

  //     const matchAction = action === 'All Actions' || item.action === action;

  //     const searchValue = search.toLowerCase();

  //     return matchCategory && matchAction && matchSearch;
  //   });
  // }, [category, action, search]);

  // const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setCategory(event.target.value);
    setPage(0);
  };

  const handleActionChange = (event: SelectChangeEvent) => {
    setAction(event.target.value);
    setPage(0);
  };

  const handleReset = () => {
    setCategory('All Categories');
    setAction('All Actions');
    setSearch('');
    setPage(0);
  };

  const navigate = useNavigate();
  const [status, setStatus] = useState('All Status');
  const [visitorType, setVisitorType] = useState('All Visitor Types');
  const filteredData = useMemo(() => {
    const searchValue = search.toLowerCase();

    return visitorData.filter((item) => {
      const matchStatus = status === 'All Status' || item.status === status;

      const matchVisitorType =
        visitorType === 'All Visitor Types' || item.visitorType === visitorType;

      const matchSearch =
        !searchValue ||
        item.visitorName.toLowerCase().includes(searchValue) ||
        item.visitorType.toLowerCase().includes(searchValue) ||
        item.hostName.toLowerCase().includes(searchValue) ||
        item.site.toLowerCase().includes(searchValue);

      return matchStatus && matchVisitorType && matchSearch;
    });
  }, [status, visitorType, search]);

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Monitoring" description="Real-time system events and visitor tracking.">
        <Box
          sx={{
            width: '100%',
            backgroundColor: '#f5f7fa',
            minHeight: '100%',
            p: 1,
          }}
        >
          {/* ================= HEADER ================= */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: {
                xs: 'flex-start',
                md: 'center',
              },
              flexDirection: {
                xs: 'column',
                md: 'row',
              },
              gap: 2,
              mb: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: {
                    xs: 25,
                    md: 30,
                  },
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: '#101828',
                }}
              >
                Activity Monitor
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 15,
                  color: '#344054',
                }}
              >
                Real-time system events and visitor tracking.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<History />}
                onClick={() => navigate('/admin/report/invitation')}
                sx={{
                  textTransform: 'none',
                  backgroundColor: '#347bd3',
                  borderRadius: '8px',
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: '#286bbf',
                    boxShadow: 'none',
                  },
                }}
              >
                History Log
              </Button>

              <Button
                variant="contained"
                startIcon={<DeleteOutline />}
                sx={{
                  textTransform: 'none',
                  backgroundColor: '#d94343',
                  borderRadius: '8px',
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: '#c83232',
                    boxShadow: 'none',
                  },
                }}
              >
                Clear Logs
              </Button>
            </Stack>
          </Box>

          {/* ================= LIVE STATUS ================= */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 2,
            }}
          >
            <Chip
              label="⌁ LIVE"
              size="small"
              sx={{
                height: 27,
                borderRadius: '5px',
                backgroundColor: '#d8f7e4',
                color: '#176b3a',
                fontWeight: 600,
                fontSize: 12,
              }}
            />

            <Typography
              sx={{
                fontSize: 15,
                color: '#101828',
              }}
            >
              Connected to Live Stream service.
            </Typography>
          </Box>

          <Divider sx={{ mb: 2.5 }} />

          {/* ================= FILTER ================= */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: '264px 1fr 100px',
              },
              gap: 1.5,
              mb: 2,
            }}
          >
            <FormControl size="small">
              <Select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(0);
                }}
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  height: 40,
                }}
              >
                <MenuItem value="All Status">Status: All Status</MenuItem>
                <MenuItem value="Checkin">Check In</MenuItem>
                <MenuItem value="Waiting">Waiting</MenuItem>
                <MenuItem value="Checkout">Check Out</MenuItem>
                <MenuItem value="Denied">Denied</MenuItem>
                <MenuItem value="Block">Blocked</MenuItem>
                <MenuItem value="Preregis">Pre-Registered</MenuItem>
              </Select>
            </FormControl>

            {/* <FormControl size="small">
              <Select
                value={action}
                onChange={handleActionChange}
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  height: 40,
                }}
              >
                <MenuItem value="All Actions">Action: All Actions</MenuItem>
                <MenuItem value="Desk Booking">Desk Booking</MenuItem>
                <MenuItem value="System Update">System Update</MenuItem>
                <MenuItem value="System Reaveating">System Reaveating</MenuItem>
              </Select>
            </FormControl> */}

            <TextField
              size="small"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search events..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search
                      sx={{
                        color: '#667085',
                        fontSize: 22,
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 40,
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                },
              }}
            />

            <Button
              variant="outlined"
              onClick={handleReset}
              sx={{
                height: 40,
                minWidth: 68,
                textTransform: 'none',
                borderColor: '#d0d5dd',
                color: '#101828',
                backgroundColor: '#fff',
                borderRadius: '8px',
              }}
            >
              Reset
            </Button>
          </Box>

          {/* ================= STAT CARDS ================= */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(5, 1fr)',
              },
              gap: 2,
              mb: 2.5,
            }}
          >
            {stats.map((stat) => (
              <Card
                key={stat.label}
                elevation={0}
                sx={{
                  border: '1px solid #eaecf0',
                  borderRadius: '10px',
                  backgroundColor: '#fff',
                  boxShadow: '0px 2px 5px rgba(16, 24, 40, 0.06)',
                }}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 2,
                    '&:last-child': {
                      pb: 2,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 54,
                      height: 54,
                      minWidth: 54,
                      borderRadius: '10px',
                      backgroundColor: iconBackground[stat.type],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    {React.cloneElement(stat.icon, {
                      sx: {
                        fontSize: 29,
                      },
                    })}
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#344054',
                        letterSpacing: 0.2,
                      }}
                    >
                      {stat.label}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.2,
                        fontSize: 27,
                        lineHeight: 1.1,
                        fontWeight: 700,
                        color: '#101828',
                      }}
                    >
                      {stat.value}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* ================= ACTIVITY TABLE ================= */}

          <DynamicTable
            data={visitorData}
            // isHavePagination
            // defaultRowsPerPage={10}
            isHaveHeaderTitle
            titleHeader="Activity List"
          />
        </Box>
      </Container>
    </PageContainer>
  );
};

export default Content;
