import React, { useState } from 'react';
import {
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
  CalendarMonth,
  KeyboardArrowRight,
  MoreVert,
  Download,
  Visibility,
  EditOutlined,
  PersonOutline,
  LocationOnOutlined,
  DirectionsCarOutlined,
  GroupsOutlined,
  MapOutlined,
  AccessTimeOutlined,
} from '@mui/icons-material';

import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';

import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';

const visitors = [
  {
    id: 1,
    name: 'John Doe',
    company: 'ABC Corp',
    time: 'Today, 10:00 - 12:00',
    status: 'Checked In',
    statusColor: 'success',
    avatar: 'https://i.pravatar.cc/100?img=12',
  },
  {
    id: 2,
    name: 'Sarah Lee',
    company: 'XYZ Ltd',
    time: 'Today, 13:00 - 15:00',
    status: 'Expected',
    statusColor: 'warning',
    avatar: 'https://i.pravatar.cc/100?img=47',
  },
  {
    id: 3,
    name: 'Michael Tan',
    company: 'Tech Solutions',
    time: 'Today, 14:00 - 16:00',
    status: 'Upcoming',
    statusColor: 'info',
    avatar: 'https://i.pravatar.cc/100?img=11',
  },
  {
    id: 4,
    name: 'Emily Clark',
    company: 'Global Inc',
    time: 'Today, 15:30 - 17:00',
    status: 'Not Arrived',
    statusColor: 'default',
    avatar: 'https://i.pravatar.cc/100?img=44',
  },
  {
    id: 5,
    name: 'Robert Wilson',
    company: 'Acme Co',
    time: 'Today, 16:00 - 17:00',
    status: 'Upcoming',
    statusColor: 'info',
    avatar: 'https://i.pravatar.cc/100?img=13',
  },
];

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

const Content = () => {
  const [investigationTab, setInvestigationTab] = useState(0);
  const [detailTab, setDetailTab] = useState(0);
  const [selectedVisitor, setSelectedVisitor] = useState(visitors[0]);

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

          {/* ================= MAIN CARD ================= */}
          <Card
            elevation={0}
            sx={{
              border: '1px solid #e4e9f0',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            {/* ================= INVESTIGATION TABS ================= */}
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

              <Tab
                icon={<MapOutlined sx={{ fontSize: 17 }} />}
                iconPosition="start"
                label="Area Investigation"
              />
            </Tabs>

            {/* ================= FILTER ================= */}
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
                    lg: '1.2fr 1.3fr 1.2fr 1fr',
                  },
                  gap: 1.5,
                }}
              >
                <FilterField label="Keyword" placeholder="Name, company, ID, or vehicle number" />

                <FilterField
                  label="Date Range"
                  value="Sep 30, 2026  –  Sep 30, 2026"
                  icon={<CalendarMonth fontSize="small" />}
                />

                <FilterSelect
                  label="Location"
                  value="All Buildings"
                  options={['All Buildings', 'Main Building', 'Building A', 'Building B']}
                />

                <FilterSelect
                  label="Status"
                  value="All Status"
                  options={['All Status', 'Checked In', 'Expected', 'Upcoming', 'Not Arrived']}
                />

                <FilterSelect
                  label="Visitor Type"
                  value="All Types"
                  options={['All Types', 'Employee', 'Business Partner', 'Guest', 'Contractor']}
                />

                <FilterSelect
                  label="Purpose"
                  value="All Purposes"
                  options={['All Purposes', 'General Meeting', 'Interview', 'Delivery', 'Business']}
                />

                <FilterField
                  label="Host (Employee)"
                  placeholder="Search employee..."
                  icon={<Search fontSize="small" />}
                />

                <FilterField label="Vehicle Number" placeholder="Enter vehicle number" />
              </Box>

              <Stack direction="row" justifyContent="flex-end" spacing={1} mt={1.5}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
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
                >
                  Search
                </Button>
              </Stack>
            </Box>

            {/* ================= CONTENT ================= */}
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
              {/* ================= SEARCH RESULT ================= */}
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
                    <Box>
                      <Typography fontWeight={700} fontSize={14}>
                        Search Results
                      </Typography>

                      <Typography fontSize={11} color="text.secondary">
                        12 visitors found
                      </Typography>
                    </Box>

                    <FormControl size="small">
                      <Select
                        value="newest"
                        sx={{
                          height: 30,
                          fontSize: 11,
                          minWidth: 130,
                        }}
                      >
                        <MenuItem value="newest">Sort by Visit Time (Newest)</MenuItem>
                        <MenuItem value="oldest">Sort by Visit Time (Oldest)</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                </Box>

                <Divider />

                {visitors.map((visitor) => (
                  <VisitorItem
                    key={visitor.id}
                    visitor={visitor}
                    selected={selectedVisitor.id === visitor.id}
                    onClick={() => setSelectedVisitor(visitor)}
                  />
                ))}
              </Box>

              {/* ================= DETAIL ================= */}
              <Box sx={{ backgroundColor: '#fff', minWidth: 0 }}>
                {/* Visitor Header */}
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
                    <Box
                      component="img"
                      src={selectedVisitor.avatar}
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1px solid #e2e7ef',
                      }}
                    />

                    <Box>
                      <Typography fontSize={16} fontWeight={700} color="#182230">
                        {selectedVisitor.name}
                      </Typography>

                      <Typography fontSize={12} color="text.secondary">
                        {selectedVisitor.company}
                      </Typography>

                      <StatusChip
                        label={selectedVisitor.status}
                        color={selectedVisitor.statusColor}
                      />
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Download />}
                      sx={{
                        textTransform: 'none',
                        borderColor: '#d8e0eb',
                      }}
                    >
                      Export Report
                    </Button>

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      sx={{
                        textTransform: 'none',
                        borderColor: '#d8e0eb',
                      }}
                    >
                      View Invitation
                    </Button>

                    <IconButton size="small">
                      <MoreVert fontSize="small" />
                    </IconButton>
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
                    label="Movement"
                  />

                  <Tab
                    icon={<AccessTimeOutlined sx={{ fontSize: 16 }} />}
                    iconPosition="start"
                    label="Access Log"
                  />

                  <Tab
                    icon={<DirectionsCarOutlined sx={{ fontSize: 16 }} />}
                    iconPosition="start"
                    label="Vehicle"
                  />

                  <Tab
                    icon={<GroupsOutlined sx={{ fontSize: 16 }} />}
                    iconPosition="start"
                    label="Related People"
                  />
                </Tabs>

                {/* ================= OVERVIEW ================= */}
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
                          <InfoRow label="Full Name" value="John Doe" />
                          <InfoRow label="Company" value="ABC Corp" />
                          <InfoRow label="Visitor Type" value="Business Partner" />
                          <InfoRow label="Purpose" value="General Meeting" />
                          <InfoRow label="Host (Employee)" value="DPU (Employee)" />
                          <InfoRow label="Visit Schedule" value="Sep 30, 2026, 10:00 - 12:00" />
                          <InfoRow label="Current Location" value="Main Lobby" />
                          <InfoRow
                            label="Status"
                            value={<StatusChip label="Checked In" color="success" />}
                          />
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
                              <InfoRow label="Vehicle Number" value="B 1234 ABC" />
                              <InfoRow label="Vehicle Type" value="Car - Sedan" />
                              <InfoRow label="Parking Area" value="Basement A" />
                              <InfoRow label="Check In" value="09:55" />
                              <InfoRow label="Check Out" value="-" />
                            </Box>

                            <Box
                              component="img"
                              src="https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=400"
                              sx={{
                                width: '100%',
                                height: 85,
                                borderRadius: 1.5,
                                objectFit: 'cover',
                              }}
                            />
                          </Box>
                        </InformationCard>
                      </Box>

                      {/* RIGHT */}
                      <Box>
                        <Typography fontSize={13} fontWeight={700} mb={1}>
                          Capture Images
                        </Typography>

                        <Stack direction="row" spacing={1}>
                          {captureImages.map((item) => (
                            <Box key={item.time} sx={{ flex: 1 }}>
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
                                  src={item.image}
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

                              <Typography fontSize={11} fontWeight={700} mt={0.5}>
                                {item.time}
                              </Typography>

                              <Typography fontSize={10} color="text.secondary">
                                {item.location}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>

                        {/* Timeline */}
                        <Box mt={2.5}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={1}
                          >
                            <Typography fontSize={13} fontWeight={700}>
                              Visit Timeline
                            </Typography>

                            <Typography fontSize={11} color="primary" sx={{ cursor: 'pointer' }}>
                              View All
                            </Typography>
                          </Stack>

                          <TimelineItem
                            time="09:58"
                            title="Checked In"
                            location="Main Entrance (QR Code)"
                            active
                          />

                          <TimelineItem
                            time="10:02"
                            title="Access Granted"
                            location="Main Lobby"
                            active
                          />

                          <TimelineItem
                            time="10:05"
                            title="Access Granted"
                            location="Elevator - Floor 5"
                            active
                          />

                          <TimelineItem
                            time="12:00"
                            title="Scheduled Check Out"
                            location="Expected"
                            last
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                )}

                {detailTab === 1 && <PlaceholderTab title="Movement" />}
                {detailTab === 2 && <PlaceholderTab title="Access Log" />}
                {detailTab === 3 && <PlaceholderTab title="Vehicle" />}
                {detailTab === 4 && <PlaceholderTab title="Related People" />}
              </Box>
            </Box>
          </Card>
        </Box>
      </Container>
    </PageContainer>
  );
};

/* ========================================================= */
/* COMPONENTS                                                 */
/* ========================================================= */

const FilterField = ({
  label,
  placeholder,
  value,
  icon,
}: {
  label: string;
  placeholder?: string;
  value?: string;
  icon?: React.ReactNode;
}) => (
  <Box>
    <Typography fontSize={11} fontWeight={600} color="#3b4656" mb={0.5}>
      {label}
    </Typography>

    <TextField
      fullWidth
      size="small"
      value={value}
      placeholder={placeholder}
      InputProps={{
        endAdornment: icon ? <InputAdornment position="end">{icon}</InputAdornment> : undefined,
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          height: 36,
          fontSize: 12,
          backgroundColor: '#fff',
        },
      }}
    />
  </Box>
);

const FilterSelect = ({
  label,
  value,
  options,
}: {
  label: string;
  value: string;
  options: string[];
}) => (
  <Box>
    <Typography fontSize={11} fontWeight={600} color="#3b4656" mb={0.5}>
      {label}
    </Typography>

    <FormControl fullWidth size="small">
      <Select
        value={value}
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

const VisitorItem = ({
  visitor,
  selected,
  onClick,
}: {
  visitor: any;
  selected: boolean;
  onClick: () => void;
}) => (
  <Box
    onClick={onClick}
    sx={{
      px: 1.75,
      py: 1.25,
      cursor: 'pointer',
      borderLeft: selected ? '3px solid #1976d2' : '3px solid transparent',
      backgroundColor: selected ? '#f4f8ff' : '#fff',
      '&:hover': {
        backgroundColor: '#f7faff',
      },
    }}
  >
    <Stack direction="row" spacing={1.2} alignItems="center">
      <Box
        component="img"
        src={visitor.avatar}
        sx={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          objectFit: 'cover',
        }}
      />

      <Box flex={1} minWidth={0}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography fontSize={12} fontWeight={700} noWrap>
            {visitor.name}
          </Typography>

          <Typography fontSize={10} color="text.secondary" noWrap>
            {visitor.time}
          </Typography>
        </Stack>

        <Typography fontSize={10} color="text.secondary" noWrap>
          {visitor.company}
        </Typography>

        <StatusChip label={visitor.status} color={visitor.statusColor} />
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

const StatusChip = ({ label, color }: { label: string; color: string }) => {
  const colors: any = {
    success: {
      bg: '#e9f8f0',
      text: '#168653',
      dot: '#16a36a',
    },
    warning: {
      bg: '#fff5df',
      text: '#c87900',
      dot: '#f59e0b',
    },
    info: {
      bg: '#eaf3ff',
      text: '#1670d2',
      dot: '#1976d2',
    },
    default: {
      bg: '#eef1f5',
      text: '#586577',
      dot: '#667085',
    },
  };

  const config = colors[color] || colors.default;

  return (
    <Chip
      size="small"
      label={
        <Stack direction="row" spacing={0.6} alignItems="center">
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: config.dot,
            }}
          />

          <span>{label}</span>
        </Stack>
      }
      sx={{
        mt: 0.5,
        height: 20,
        borderRadius: 1,
        backgroundColor: config.bg,
        color: config.text,
        fontSize: 9,
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
      <Typography fontSize={12} fontWeight={700}>
        {title}
      </Typography>

      {action && (
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
      )}
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
      fontSize={10.5}
      color="text.secondary"
      sx={{
        width: 105,
        flexShrink: 0,
      }}
    >
      {label}
    </Typography>

    <Typography fontSize={10.5} fontWeight={500} color="#303b4b">
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
    {/* Time */}
    <Typography fontSize={10} color="text.secondary" pt={0.2}>
      {time}
    </Typography>

    {/* Timeline */}
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
      <Typography fontSize={10.5} fontWeight={600} lineHeight={1.3}>
        {title}
      </Typography>

      <Typography fontSize={9.5} color="text.secondary" lineHeight={1.4}>
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
