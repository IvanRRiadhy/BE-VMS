import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
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
  CalendarMonth,
  Download,
  EventAvailable,
  ErrorOutline,
  Group,
  Schedule,
  Search,
} from '@mui/icons-material';

import { LineChart, PieChart } from '@mui/x-charts';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';

import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { IconClearAll, IconFilter, IconFilterOff } from '@tabler/icons-react';

const Content = () => {
  const [citizenship, setCitizenship] = useState('All Citizenships');

  const [status, setStatus] = useState('All Status');

  const [visitorName, setVisitorName] = useState('');

  const handleCitizenshipChange = (event: SelectChangeEvent) => {
    setCitizenship(event.target.value);
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value);
  };

  const handleReset = () => {
    setCitizenship('All Citizenships');
    setStatus('All Status');
    setVisitorName('');
  };

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Invitation" description="Analyze and export visitor invitation activities.">
        <Box
          sx={{
            width: '100%',
            // maxWidth: 1200,
            mx: 'auto',
          }}
        >
          {/* =====================================================
              HEADER
          ===================================================== */}
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
              mb: 3,
              mt: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#101828',
                  lineHeight: 1.2,
                }}
              >
                Invitation Report
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: '#475467',
                }}
              >
                Analyze and export visitor invitation activities based on selected filters.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
              {/* Date */}
              <Button
                variant="outlined"
                startIcon={<CalendarMonth />}
                sx={{
                  height: 36,
                  px: 1.5,
                  textTransform: 'none',
                  fontSize: 12,
                  color: '#344054',
                  borderColor: '#d0d5dd',
                  backgroundColor: '#fff',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                01 Aug 2026 - 31 Aug 2026
              </Button>

              {/* Schedule */}
              <Button
                variant="outlined"
                startIcon={<Schedule />}
                sx={{
                  height: 36,
                  px: 1.5,
                  textTransform: 'none',
                  fontSize: 12,
                  color: '#344054',
                  borderColor: '#d0d5dd',
                  backgroundColor: '#fff',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                Schedule Report
              </Button>

              {/* Export */}
              <Button
                variant="contained"
                color="error"
                startIcon={<Download />}
                sx={{
                  height: 36,
                  px: 1.5,
                  textTransform: 'none',
                  fontSize: 12,
                  borderRadius: '6px',
                  boxShadow: 'none',
                }}
              >
                Export Report
              </Button>
            </Stack>
          </Box>

          {/* =====================================================
              1. FILTER
          ===================================================== */}
          <Box sx={{ mb: 2 }}>
            <SectionTitle number="1" title="Filter" />

            <Card
              elevation={0}
              sx={{
                mt: 1,
                p: 1.5,
                border: '1px solid #dfe3e8',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(16,24,40,0.06)',
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: '1fr 1fr',
                    md: '1fr 1fr 1fr',
                  },
                  gap: 1.5,
                }}
              >
                {/* Date Range */}
                <FilterItem label="Date Range">
                  <TextField
                    fullWidth
                    size="small"
                    value="01 Aug 2026 - 31 Aug 2026"
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={inputStyle}
                  />
                </FilterItem>

                {/* Citizenship */}
                {/* <FilterItem label="Citizenship">
                  <FormControl fullWidth size="small">
                    <Select value={citizenship} onChange={handleCitizenshipChange} sx={selectStyle}>
                      <MenuItem value="All Citizenships">All Citizenships</MenuItem>
                      <MenuItem value="Indonesia">Indonesia</MenuItem>
                      <MenuItem value="Malaysia">Malaysia</MenuItem>
                      <MenuItem value="Singapore">Singapore</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </FilterItem> */}

                {/* Status */}
                <FilterItem label="Status">
                  <FormControl fullWidth size="small">
                    <Select value={status} onChange={handleStatusChange} sx={selectStyle}>
                      <MenuItem value="All Status">All Status</MenuItem>
                      <MenuItem value="Invited">Invited</MenuItem>
                      <MenuItem value="Checked-In">Checked-In</MenuItem>
                      <MenuItem value="Expired">Expired</MenuItem>
                    </Select>
                  </FormControl>
                </FilterItem>

                {/* Visitor Name */}
                <FilterItem label="Visitor Name">
                  <TextField
                    fullWidth
                    size="small"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="Search visitor name"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search
                            sx={{
                              fontSize: 18,
                              color: '#667085',
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={inputStyle}
                  />
                </FilterItem>
              </Box>

              {/* Optional reset */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  mt: 1,
                }}
              >
                <Button
                  // size="small"
                  variant="contained"
                  onClick={handleReset}
                  startIcon={<IconFilter size={18} />}
                  sx={{
                    textTransform: 'none',
                    // color: '#475467',
                    fontSize: 12,
                  }}
                >
                  Reset Filter
                </Button>
              </Box>
            </Card>
          </Box>

          {/* =====================================================
              2. ANALYSIS
          ===================================================== */}
          <Box sx={{ mb: 2 }}>
            <SectionTitle number="2" title="Analysis" />

            {/* Summary cards */}
            <Box
              sx={{
                mt: 1,
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                  md: 'repeat(4, 1fr)',
                },
                gap: 1.5,
              }}
            >
              <SummaryCard
                icon={<EventAvailable />}
                title="Total Invitation"
                value="185"
                iconType="green"
              />

              <SummaryCard icon={<Group />} title="Active Visitor" value="45" iconType="blue" />

              <SummaryCard
                icon={<Schedule />}
                title="Pending Visitor"
                value="28"
                iconType="yellow"
              />

              <SummaryCard
                icon={<ErrorOutline />}
                title="Total Overdue"
                value="12"
                iconType="red"
              />
            </Box>

            {/* =================================================
                CHARTS
            ================================================= */}
            <Box
              sx={{
                mt: 1.5,
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: '1fr 1fr',
                },
                gap: 1.5,
              }}
            >
              {/* Pie */}
              <Card
                elevation={0}
                sx={{
                  border: '1px solid #dfe3e8',
                  borderRadius: '8px',
                  minHeight: 280,
                }}
              >
                <Typography
                  sx={{
                    p: 1.5,
                    pb: 0,
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#101828',
                  }}
                >
                  Invitations by Status
                </Typography>

                <Box
                  sx={{
                    height: 240,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Chart
                    type="donut"
                    height={230}
                    width={430}
                    series={[90, 45, 50]}
                    options={{
                      chart: {
                        type: 'donut',
                        toolbar: {
                          show: false,
                        },
                      },

                      labels: ['Invited', 'Check In', 'Check Out'],

                      colors: ['#3BB273', '#347DBD', '#E24A4A'],

                      stroke: {
                        width: 2,
                        colors: ['#fff'],
                      },

                      plotOptions: {
                        pie: {
                          expandOnClick: false,

                          donut: {
                            size: '58%',

                            labels: {
                              show: true,

                              name: {
                                show: false,
                              },

                              value: {
                                show: false,
                              },

                              total: {
                                show: true,
                                showAlways: true,
                                label: 'Total',
                                fontSize: '18px',
                                fontWeight: 600,
                                color: '#101828',

                                formatter: () => '185',
                              },
                            },
                          },
                        },
                      },

                      dataLabels: {
                        enabled: true,

                        formatter: (value: number, opts: any) => {
                          return opts.w.config.series[opts.seriesIndex];
                        },

                        style: {
                          fontSize: '13px',
                          fontWeight: 600,
                        },

                        dropShadow: {
                          enabled: false,
                        },
                      },

                      legend: {
                        show: true,
                        position: 'right',
                        horizontalAlign: 'center',

                        fontSize: '13px',

                        markers: {
                          size: 7,
                          shape: 'square',
                        },

                        itemMargin: {
                          vertical: 5,
                        },

                        formatter: (seriesName: string, opts: any) => {
                          const value = opts.w.config.series[opts.seriesIndex];

                          return `${seriesName}`;
                        },
                      },

                      tooltip: {
                        y: {
                          formatter: (value: number) => `${value} invitations`,
                        },
                      },

                      responsive: [
                        {
                          breakpoint: 700,
                          options: {
                            chart: {
                              width: 350,
                            },

                            legend: {
                              position: 'bottom',
                            },
                          },
                        },
                      ],
                    }}
                  />
                </Box>
              </Card>

              {/* Line */}
              <Card
                elevation={0}
                sx={{
                  border: '1px solid #dfe3e8',
                  borderRadius: '8px',
                  minHeight: 280,
                }}
              >
                <Typography
                  sx={{
                    p: 1.5,
                    pb: 0,
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#101828',
                  }}
                >
                  Invitation Trends
                </Typography>

                <Box
                  sx={{
                    height: 240,
                    width: '100%',
                    px: 1,
                  }}
                >
                  <Chart
                    type="area"
                    height={230}
                    series={[
                      {
                        name: 'Invitations',
                        data: [8, 27, 14, 34, 20, 43, 23, 41],
                      },
                    ]}
                    options={{
                      chart: {
                        type: 'area',
                        toolbar: {
                          show: false,
                        },
                        zoom: {
                          enabled: false,
                        },
                        sparkline: {
                          enabled: false,
                        },
                      },

                      stroke: {
                        curve: 'straight',
                        width: 2,
                      },

                      fill: {
                        type: 'gradient',
                        gradient: {
                          opacityFrom: 0.25,
                          opacityTo: 0.02,
                          stops: [0, 100],
                        },
                      },

                      markers: {
                        size: 4,
                        strokeWidth: 2,
                        hover: {
                          size: 6,
                        },
                      },

                      dataLabels: {
                        enabled: false,
                      },

                      xaxis: {
                        categories: [
                          '20 Aug',
                          '21 Aug',
                          '22 Aug',
                          '23 Aug',
                          '24 Aug',
                          '25 Aug',
                          '26 Aug',
                          '27 Aug',
                        ],
                        labels: {
                          style: {
                            fontSize: '11px',
                          },
                        },
                        axisBorder: {
                          show: true,
                        },
                        axisTicks: {
                          show: false,
                        },
                      },

                      yaxis: {
                        min: 0,
                        max: 50,
                        tickAmount: 5,
                        labels: {
                          style: {
                            fontSize: '11px',
                          },
                        },
                      },

                      grid: {
                        strokeDashArray: 0,
                        xaxis: {
                          lines: {
                            show: false,
                          },
                        },
                      },

                      tooltip: {
                        x: {
                          show: true,
                        },
                        y: {
                          formatter: (value: number) => `${value} invitations`,
                        },
                      },

                      legend: {
                        show: false,
                      },

                      colors: ['#347DBD'],
                    }}
                  />
                </Box>
              </Card>
            </Box>
          </Box>

          {/* =====================================================
              3. INVITATION LIST
              DynamicTable tetap digunakan
          ===================================================== */}
          <Box sx={{ mt: 2 }}>
            <SectionTitle number="3" title="Invitation List" />

            <Card
              elevation={0}
              sx={{
                mt: 1,
                p: 1.5,
                border: '1px solid #dfe3e8',
                borderRadius: '8px',
              }}
            >
              <DynamicTable data={[]} />
            </Card>
          </Box>
        </Box>
      </Container>
    </PageContainer>
  );
};

/* =============================================================
   SECTION TITLE
============================================================= */

interface SectionTitleProps {
  number: string;
  title: string;
}

const SectionTitle = ({ number, title }: SectionTitleProps) => {
  return (
    <Stack direction="row" alignItems="center" spacing={0.7}>
      <Box
        sx={{
          width: 25,
          height: 25,
          borderRadius: '50%',
          backgroundColor: 'primary.main',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {number}
      </Box>

      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 600,
          color: '#101828',
        }}
      >
        {title}
      </Typography>
    </Stack>
  );
};

/* =============================================================
   FILTER ITEM
============================================================= */

interface FilterItemProps {
  label: string;
  children: React.ReactNode;
}

const FilterItem = ({ label, children }: FilterItemProps) => {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 600,
          color: '#344054',
          mb: 0.5,
        }}
      >
        {label}
      </Typography>

      {children}
    </Box>
  );
};

/* =============================================================
   SUMMARY CARD
============================================================= */

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  iconType: 'green' | 'blue' | 'yellow' | 'red';
}

const SummaryCard = ({ icon, title, value, iconType }: SummaryCardProps) => {
  const colors = {
    green: {
      background: '#e6f7ed',
      color: '#25834f',
    },
    blue: {
      background: '#e7f0fb',
      color: '#2866a7',
    },
    yellow: {
      background: '#fff4dc',
      color: '#b37a16',
    },
    red: {
      background: '#fdeaea',
      color: '#c33b3b',
    },
  };

  const color = colors[iconType];

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid #dfe3e8',
        borderRadius: '8px',
        minHeight: 68,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1.3,
        }}
      >
        <Box
          sx={{
            width: 54,
            height: 54,
            borderRadius: '7px',
            backgroundColor: color.background,
            color: color.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {React.cloneElement(icon as React.ReactElement, {
            sx: {
              fontSize: 22,
            },
          })}
        </Box>

        <Box>
          <Typography
            sx={{
              fontSize: 14,
              color: '#475467',
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              mt: 0.2,
              fontSize: 22,
              fontWeight: 700,
              color: '#101828',
              lineHeight: 1.1,
            }}
          >
            {value}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

/* =============================================================
   COMMON STYLES
============================================================= */

const inputStyle = {
  '& .MuiOutlinedInput-root': {
    height: 30,
    borderRadius: '6px',
    backgroundColor: '#fff',
    fontSize: 12,
  },
};

const selectStyle = {
  height: 30,
  borderRadius: '6px',
  backgroundColor: '#fff',
  fontSize: 12,
};

export default Content;
