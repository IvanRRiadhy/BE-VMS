// components/analytics/AnalyticsDashboard.tsx

import React, { useRef, useState } from 'react';

import {
  Box,
  Button,
  MenuItem,
  Select,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Grid2 as Grid,
  Drawer,
  Skeleton,
  Menu,
} from '@mui/material';

import {
  CalendarMonth,
  DirectionsCar,
  WarningAmber,
  AccessTime,
  TrendingUp,
  Person,
  Groups,
  LocalParking,
} from '@mui/icons-material';
import Calendar from 'src/customs/components/calendar/Calendar';
import {
  AnalyticsPanel,
  StatCard,
  SiteBars,
  VehicleList,
  AlarmList,
  GrowthTable,
  GrowthHighlight,
} from './AnalyticsCard';

import {
  VisitorTypeDonut,
  DailyBarChart,
  ExtendTrendChart,
  MonthlyTrendChart,
} from './AnallyticsCharts';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useQuery } from '@tanstack/react-query';
import {
  exportDashboardInsightEmployee,
  getInsightSummaryEmployee,
} from 'src/customs/api/Admin/Dashboard/insight';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { setDateRange } from 'src/store/apps/Daterange/dateRangeSlice';
import { IconCalendar, IconChevronDown } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { IconDownload } from '@tabler/icons-react';
import { showSwal } from 'src/customs/components/alerts/alerts';
import GlobalBackdropLoading from 'src/customs/pages/admin/components/GlobalBackdrop';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
dayjs.extend(utc);
dayjs.extend(timezone);

const AnalyticsDashboard = () => {
  const [site, setSite] = useState('all');

  const today = dayjs().tz('Asia/Jakarta');
  const { t } = useTranslation();
  // const [startDate, setStartDate] = useState(today.subtract(6, 'day').format('YYYY-MM-DD'));

  // const [endDate, setEndDate] = useState(today.format('YYYY-MM-DD'));
  const dispatch = useDispatch();
  const { startDate, endDate } = useSelector((state: any) => state.dateRange);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const userTimezone = dayjs.tz.guess();
  const startDateUtc = dayjs.tz(startDate, userTimezone).startOf('day').utc().toISOString();

  const endDateUtc = dayjs.tz(endDate, userTimezone).endOf('day').utc().toISOString();

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ['insight-summary-employee', startDate, endDate, userTimezone],
    enabled: Boolean(startDate && endDate),
    queryFn: () => getInsightSummaryEmployee(startDateUtc, endDateUtc, true),
  });

  const analytics = data?.collection;

  const kpis = analytics?.kpis;
  const vehicle = analytics?.vehicle_analysis;
  const alarm = analytics?.alarm_and_risk;
  const extend = analytics?.extend_analysis;
  const monthly = analytics?.monthly_growth_trend;

  const formatNumber = (value?: number) => (value ?? 0).toLocaleString('id-ID');

  const formatPercentage = (value?: number) => `${(value ?? 0).toFixed(1).replace('.', ',')}%`;

  const formatGrowth = (value?: number) => {
    const growth = value ?? 0;
    return `${growth > 0 ? '+' : ''}${growth.toFixed(1).replace('.', ',')}%`;
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClose = () => setAnchorEl(null);

  // KPI CARDS
  const summaryStats = [
    {
      title: t('insight.totalVisits'),
      value: formatNumber(kpis?.total_visits),
      change: formatGrowth(kpis?.total_visits_growth_percentage),
      icon: <Person />,
      color: '#2878e5',
    },
    {
      title: t('insight.uniqueVisitors'),
      value: formatNumber(kpis?.unique_visitors),
      change: formatGrowth(kpis?.unique_visitors_growth_percentage),
      icon: <TrendingUp />,
      color: '#2878e5',
    },
    {
      title: t('insight.vehicles'),
      value: formatNumber(kpis?.visits_with_vehicle),
      change: formatGrowth(kpis?.visits_with_vehicle_growth_percentage),
      icon: <DirectionsCar />,
      color: '#2878e5',
    },
    {
      title: t('insight.needParking'),
      value: formatNumber(kpis?.need_parking),
      change: formatGrowth(kpis?.need_parking_growth_percentage),
      icon: <DirectionsCar />,
      color: '#2878e5',
    },
    {
      title: t('insight.needExtend'),
      value: formatNumber(kpis?.need_extend),
      change: formatGrowth(kpis?.need_extend_growth_percentage),
      icon: <AccessTime />,
      color: '#2878e5',
    },
    {
      title: t('insight.triggeredAlarm'),
      value: formatNumber(kpis?.triggered_alarm),
      change: formatGrowth(kpis?.triggered_alarm_growth_percentage),
      icon: <WarningAmber />,
      color: 'red',
    },
  ];

  // SITE
  const siteData = (analytics?.visits_by_site ?? [])
    .filter((item: any) => site === 'all' || item.site_name === site)
    .map((item: any) => ({
      name: item.site_name,
      value: item.count,
      percentage: item.percentage,
    }));

  // VISITOR TYPE
  const visitorTypeData = (analytics?.visits_by_visitor_type ?? []).map(
    (item: any, index: number) => ({
      name: item.visitor_type_name,
      value: item.count,
      percentage: item.percentage,
      color: ['#2583ed', '#42ad55', '#f2bd22', '#a45be5', '#df3c45'][index % 5],
    }),
  );

  // DAILY
  const dailyData = (analytics?.visits_by_day_of_week ?? []).map((item: any) => ({
    day: item.day_name,
    value: item.count,
  }));

  // VEHICLE
  const vehicleData = (vehicle?.vehicle_types ?? []).map((item: any) => ({
    name: item.vehicle_type_name || item.vehicle_type,
    value: item.count,
    percent: `${item.percentage}%`,
    icon: item.vehicle_type?.toLowerCase(),
  }));

  // ALARM

  const alarmData = (alarm?.top_alarm_types ?? []).map((item: any) => ({
    name: item.alarm_type_name || item.alarm_type,
    value: item.count,
    percentage: item.percentage,
  }));

  // EXTEND TREND
  const extendTrendData = {
    labels: extend?.daily_trend?.labels ?? [],
    series: extend?.daily_trend?.series ?? [],
  };

  // MONTHLY TREND

  // const monthlyTrend = {
  //   months: monthly?.months ?? [],
  //   series: (monthly?.series ?? []).map((item: any) => ({
  //     name: item.name,
  //     data: item.data ?? [],
  //   })),
  // };

  // GROWTH SUMMARY
  const growthSummary = analytics?.growth_summary ?? [];
  const growthIconMap: Record<string, React.ReactNode> = {
    'Total Kunjungan': <Groups />,
    Kendaraan: <DirectionsCar />,
    'Butuh Parkir': <LocalParking />,
    Extend: <AccessTime />,
    'Kena Alarm': <WarningAmber />,
  };
  const growthRows = growthSummary.map((item: any) => ({
    label: item.metric,
    oct: formatNumber(item.previous_period_count),
    nov: formatNumber(item.current_period_count),
    change: item.formatted_change,
    negative: item.growth_percentage < 0,
    icon: growthIconMap[item.metric],
  }));

  const growthHighlight = analytics?.total_growth_highlight ?? 0;

  const open = Boolean(anchorEl);
  const monthlyTrend = {
    months: monthly?.months ?? [],
    series: monthly?.series ?? [],
  };

  const monthlyColors: Record<string, string> = {
    'Total Kunjungan': '#2583ed',
    Kendaraan: '#42ad55',
    'Butuh Parkir': '#f2bd22',
    'Kena Alarm': '#df3c45',
    Extend: '#a45be5',
  };

  const monthlyLegend = monthlyTrend.series.map((item: any) => ({
    label: item.name,
    color: monthlyColors[item.name] ?? '#64748b',
    value: item.data[item.data.length - 1] ?? 0,
  }));

  const [loadingExport, setLoadingExport] = useState(false);
  const handleExport = async () => {
    try {
      setLoadingExport(true);

      const format = 'csv';

      const payload = {
        today: false,
        start_date: startDate,
        end_date: endDate,
        is_export: true,
        export_format: format,
        data: data?.collection,
      };

      const blob = await exportDashboardInsightEmployee(payload);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      const date = dayjs().format('YYYY-MM-DD');

      link.download = `analytics-${date}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      showSwal(
        'error',
        err?.response?.data?.msg || err?.response?.data?.message || 'Failed to export dashboard',
      );
    } finally {
      setLoadingExport(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setLoadingExport(true);

      const element = insightRef.current;

      if (!element) {
        throw new Error('Insight dashboard element not found');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const image = canvas.toDataURL('image/png', 1);

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imageWidth = pageWidth;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;

      let heightLeft = imageHeight;
      let position = 0;

      pdf.addImage(image, 'PNG', 0, position, imageWidth, imageHeight);

      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imageHeight;
        pdf.addPage();
        pdf.addImage(image, 'PNG', 0, position, imageWidth, imageHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`analytics-${dayjs().format('YYYY-MM-DD')}.pdf`);
    } catch (err: any) {
      showSwal('error', err?.message || 'Failed to export dashboard PDF');
    } finally {
      setLoadingExport(false);
      handleCloseExport();
    }
  };

  const insightRef = useRef<HTMLDivElement>(null);

  const [exportAnchor, setExportAnchor] = useState<null | HTMLElement>(null);

  const handleOpenExport = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportAnchor(event.currentTarget);
  };

  const handleCloseExport = () => {
    setExportAnchor(null);
  };

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: '#f7f9fc',
        p: { xs: 1, md: 1.5 },
        borderRadius: 2,
      }}
    >
      {/* HEADER */}

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'center' }}
        spacing={1.5}
        sx={{ mb: 1.8 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800} color="#111827">
            {t('insight.visitorAnalysis')}
          </Typography>

          <Typography fontSize={12.5} color="#667085">
            {t('insight.visitorAnalysisDescription')}
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
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
            {`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}
          </Button>
          <Drawer open={open} anchor="right" onClose={handleClose}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" mb={1}>
                {t('selectDateRange')}
              </Typography>
              <Calendar
                value={{ startDate, endDate }}
                onChange={(selection: any) => {
                  dispatch(
                    setDateRange({
                      startDate: selection.startDate,
                      endDate: selection.endDate,
                    }),
                  );
                  handleClose();
                }}
              />
            </Box>
          </Drawer>

          {/* <Select
            size="small"
            value={site}
            onChange={(e) => setSite(e.target.value)}
            sx={{
              minWidth: 145,
              bgcolor: '#fff',
              fontSize: 11.5,
              fontWeight: 600,
            }}
          >
            <MenuItem value="all">Semua Site</MenuItem>

            {siteData.map((item) => (
              <MenuItem key={item.name} value={item.name}>
                {item.name}
              </MenuItem>
            ))}
          </Select> */}

          <Button
            variant="contained"
            size="small"
            color="error"
            startIcon={<IconDownload size={18} />}
            endIcon={<IconChevronDown size={16} />}
            onClick={handleOpenExport}
            disabled={loadingExport}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
            }}
          >
            Export
          </Button>

          <Menu
            anchorEl={exportAnchor}
            open={Boolean(exportAnchor)}
            onClose={handleCloseExport}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleExport} disabled={loadingExport}>
              Export CSV
            </MenuItem>

            <MenuItem onClick={handleExportPDF} disabled={loadingExport}>
              Export PDF
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>
      <Box ref={insightRef} sx={{ mt: 0 }}>
        {/* KPI CARDS */}
        <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <Grid key={index} size={{ xs: 6, sm: 4, lg: 2 }}>
                  <Skeleton variant="rounded" height={120} animation="wave" />
                </Grid>
              ))
            : summaryStats.map((item) => (
                <Grid key={item.title} size={{ xs: 6, sm: 4, lg: 2 }}>
                  <StatCard item={item as any} />
                </Grid>
              ))}
        </Grid>

        {/* ANALISA KUNJUNGAN */}
        <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <AnalyticsPanel title={t('insight.visitsPerSite')}>
              {isLoading ? (
                <Skeleton variant="rounded" height={280} animation="wave" />
              ) : (
                <SiteBars data={siteData} />
              )}
            </AnalyticsPanel>
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <AnalyticsPanel title={t('insight.visitsPerVisitorType')}>
              {isLoading ? (
                <Skeleton variant="rounded" height={280} animation="wave" />
              ) : (
                <VisitorTypeDonut data={visitorTypeData} />
              )}
            </AnalyticsPanel>
          </Grid>

          <Grid size={{ xs: 12, md: 12, xl: 4 }}>
            <AnalyticsPanel title={t('insight.visitsPerDay')}>
              {isLoading ? (
                <Skeleton variant="rounded" height={280} animation="wave" />
              ) : (
                <DailyBarChart data={dailyData} />
              )}
            </AnalyticsPanel>
          </Grid>
        </Grid>

        {/* KENDARAAN, ALARM, EXTEND */}
        <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
          {/* VEHICLE */}
          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <AnalyticsPanel title={t('insight.vehicleAnalysis')} icon={<DirectionsCar />}>
              {isLoading ? (
                <Grid container spacing={1.5}>
                  <Grid size={5}>
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="60%" height={35} />
                    <Skeleton variant="text" width="70%" />
                    <Box mt={1.5}>
                      <Skeleton variant="text" width="75%" />
                      <Skeleton variant="text" width="60%" height={35} />
                      <Skeleton variant="text" width="90%" />
                    </Box>
                  </Grid>
                  <Grid size={7} sx={{ borderLeft: '1px solid #e1e6ef', pl: 1.5 }}>
                    <Skeleton variant="text" width="80%" />
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} variant="rounded" height={24} sx={{ my: 1 }} />
                    ))}
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={1.5}>
                  {/* Pindahkan konten VEHICLE kamu yang sekarang ke sini */}
                  <Grid size={5}>
                    <Typography fontSize={11.5}>Total Kendaraan</Typography>
                    <Typography fontSize={23} fontWeight={800}>
                      {formatNumber(vehicle?.total_vehicle)}
                    </Typography>
                    <Typography
                      color={(vehicle?.vehicle_growth_percentage ?? 0) >= 0 ? '#168344' : '#df3c45'}
                      fontSize={11}
                      fontWeight={700}
                    >
                      {formatGrowth(vehicle?.vehicle_growth_percentage)}
                    </Typography>

                    <Box mt={1.5}>
                      <Typography fontSize={11.5}>Butuh Parkir</Typography>
                      <Typography fontSize={22} fontWeight={800}>
                        {formatNumber(vehicle?.need_parking_count)}
                      </Typography>
                      <Typography fontSize={10.5} color="text.secondary">
                        ({formatPercentage(vehicle?.need_parking_percentage_of_vehicle)} dari
                        kendaraan)
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={7} sx={{ borderLeft: '1px solid #e1e6ef', pl: 1.5 }}>
                    <Typography fontSize={11.5} fontWeight={700} mb={1}>
                      Tipe Kendaraan ({formatNumber(vehicle?.total_vehicle)})
                    </Typography>
                    <VehicleList data={vehicleData} />
                  </Grid>
                </Grid>
              )}
            </AnalyticsPanel>
          </Grid>

          {/* ALARM */}
          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <AnalyticsPanel
              title={t('insight.alarmAndRisk')}
              icon={<WarningAmber sx={{ color: '#df3c45' }} />}
            >
              {isLoading ? (
                <Grid container spacing={1.5}>
                  <Grid size={5}>
                    <Skeleton variant="text" width="85%" />
                    <Skeleton variant="text" width="65%" height={35} />
                    <Skeleton variant="text" width="90%" />
                    <Skeleton variant="rounded" height={105} sx={{ mt: 1.5 }} />
                  </Grid>
                  <Grid size={7} sx={{ borderLeft: '1px solid #e1e6ef', pl: 1.5 }}>
                    <Skeleton variant="text" width="80%" />
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} variant="rounded" height={24} sx={{ my: 1 }} />
                    ))}
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={1.5}>
                  <Grid size={5}>
                    <Typography fontSize={11.5}>Total Kena Alarm</Typography>
                    <Typography fontSize={23} fontWeight={800}>
                      {formatNumber(alarm?.total_triggered_alarm)}
                    </Typography>
                    <Typography fontSize={10.5} color="text.secondary">
                      ({formatPercentage(alarm?.alarm_percentage_of_visits)} dari kunjungan)
                    </Typography>

                    <Box sx={{ mt: 1.5, p: 1, bgcolor: '#fff0f0', borderRadius: 1.5 }}>
                      <Typography fontSize={11}>Total Risk Score</Typography>
                      <Typography fontSize={23} fontWeight={850} color="#d7353e">
                        {formatNumber(alarm?.total_risk_score)}
                      </Typography>
                      <Typography fontSize={10} color="text.secondary">
                        {alarm?.risk_category || '-'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={7} sx={{ borderLeft: '1px solid #e1e6ef', pl: 1.5 }}>
                    <Typography fontSize={11.5} fontWeight={700} mb={0.5}>
                      Jenis Alarm (Top 5)
                    </Typography>
                    <AlarmList data={alarmData} />
                  </Grid>
                </Grid>
              )}
            </AnalyticsPanel>
          </Grid>

          {/* EXTEND */}
          <Grid size={{ xs: 12, md: 12, xl: 4 }}>
            <AnalyticsPanel title={t('insight.visitExtension')} icon={<AccessTime />}>
              {isLoading ? (
                <Grid container spacing={1}>
                  <Grid size={4}>
                    <Skeleton variant="text" width="85%" />
                    <Skeleton variant="text" width="65%" height={35} />
                    <Skeleton variant="text" width="90%" />
                    <Box mt={2}>
                      <Skeleton variant="text" width="75%" />
                      <Skeleton variant="text" width="90%" />
                    </Box>
                  </Grid>
                  <Grid size={8} sx={{ borderLeft: '1px solid #e1e6ef', pl: 1 }}>
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="rounded" height={160} sx={{ mt: 1 }} />
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={1}>
                  <Grid size={4}>
                    <Typography fontSize={11.5}>Total Extend</Typography>
                    <Typography fontSize={23} fontWeight={800}>
                      {formatNumber(extend?.total_extend)}
                    </Typography>
                    <Typography fontSize={10.5} color="text.secondary">
                      ({formatPercentage(extend?.extend_percentage_of_visits)} dari kunjungan)
                    </Typography>

                    <Box mt={2}>
                      <Typography
                        fontSize={11}
                        color={
                          (extend?.extend_growth_percentage ?? 0) > 0
                            ? 'success.main'
                            : (extend?.extend_growth_percentage ?? 0) < 0
                              ? 'error.main'
                              : 'text.secondary'
                        }
                        fontWeight={700}
                      >
                        {formatGrowth(extend?.extend_growth_percentage)}
                      </Typography>
                      <Typography fontSize={10.5} color="text.secondary">
                        vs. periode sebelumnya
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={8} sx={{ borderLeft: '1px solid #e1e6ef', pl: 1 }}>
                    <Typography fontSize={11.5} fontWeight={700}>
                      Tren Extend (Harian)
                    </Typography>
                    <ExtendTrendChart
                      labels={extendTrendData.labels}
                      series={extendTrendData.series}
                    />
                  </Grid>
                </Grid>
              )}
            </AnalyticsPanel>
          </Grid>
        </Grid>

        {/* MONTHLY GROWTH */}
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, xl: 7 }}>
            <AnalyticsPanel title={t('insight.monthlyVisitorGrowth')} icon={<TrendingUp />}>
              {isLoading ? (
                <Grid container spacing={1}>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Skeleton variant="rounded" height={260} animation="wave" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={1.5}>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Stack key={index} direction="row" alignItems="center" spacing={1}>
                          <Skeleton variant="circular" width={9} height={9} />
                          <Skeleton variant="text" sx={{ flex: 1 }} />
                          <Skeleton variant="text" width={35} />
                        </Stack>
                      ))}
                    </Stack>
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={1} alignItems="center">
                  <Grid size={{ xs: 12, md: 8 }}>
                    <MonthlyTrendChart data={monthlyTrend} />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={1}>
                      {monthlyLegend.map((item: any) => (
                        <Stack key={item.label} direction="row" alignItems="center" spacing={0.7}>
                          <Box
                            sx={{
                              width: 9,
                              height: 9,
                              borderRadius: '50%',
                              bgcolor: item.color,
                              flexShrink: 0,
                            }}
                          />

                          <Typography fontSize={10.5} flex={1}>
                            {item.label}
                          </Typography>

                          <Typography fontSize={10.5} fontWeight={700}>
                            {formatNumber(item.value)}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Grid>
                </Grid>
              )}
            </AnalyticsPanel>
          </Grid>

          <Grid size={{ xs: 12, xl: 5 }}>
            <AnalyticsPanel title={t('insight.visitorGrowthSummary')} icon={<TrendingUp />}>
              {isLoading ? (
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <Stack spacing={1}>
                      <Skeleton variant="rounded" height={35} />
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton key={index} variant="rounded" height={32} />
                      ))}
                    </Stack>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Skeleton variant="rounded" height={180} />
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <GrowthTable rows={growthRows} />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <GrowthHighlight value={growthHighlight ?? 0} />
                  </Grid>
                </Grid>
              )}
            </AnalyticsPanel>
          </Grid>
        </Grid>
      </Box>
      <GlobalBackdropLoading open={loadingExport} />
    </Box>
  );
};

export default AnalyticsDashboard;
