import { Box, CardContent, Typography, Grid2 as Grid } from '@mui/material';
import { Stack } from '@mui/system';
import { useTranslation } from 'react-i18next';
import BlankCard from 'src/components/shared/BlankCard';
import {
  IconX,
  IconForbid2,
  IconLogout,
  IconLogin,
  IconUsersGroup,
  IconUser,
  IconUserPlus,
  IconCircleX,
  IconHourglass,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { getVisitorChart } from 'src/customs/api/admin';
import { useSelector } from 'react-redux';
import { useSession } from 'src/customs/contexts/SessionContext';
import Chart from 'react-apexcharts';

interface VisitorStatusItem {
  visitor_status: string;
  Count: number;
}

interface ApiDateGroup {
  Date: string;
  Status: VisitorStatusItem[];
}

const TopCards = ({ items = [], size }: any) => {
  const { t } = useTranslation();
  const { token } = useSession();
  const { startDate, endDate } = useSelector((state: any) => state.dateRange);

  const [stats, setStats] = useState<Record<string, number>>({});

  const start = startDate?.toISOString().split('T')[0];
  const end = endDate?.toISOString().split('T')[0];

  const [statsToday, setStatsToday] = useState<Record<string, number>>({});
  const [statsYesterday, setStatsYesterday] = useState<Record<string, number>>({});
  const [isChartReady, setIsChartReady] = useState(false);

  const [normalizedData, setNormalizedData] = useState<
    { Date: string; StatusMap: Record<string, number> }[]
  >([]);

  const normalizeCollection = (collection: ApiDateGroup[]) => {
    return collection.map((day) => {
      const grouped: Record<string, number> = {};

      day.Status.forEach((item) => {
        const key = item.visitor_status.trim();
        grouped[key] = (grouped[key] || 0) + Number(item.Count || 0);
      });

      return {
        Date: day.Date,
        StatusMap: grouped,
      };
    });
  };

  useEffect(() => {
    if (!token) return;

    // const fetchData = async () => {
    //   try {
    //     const res = await getVisitorChart(
    //       token,
    //       // startDate.toISOString().split('T')[0],
    //       // endDate.toISOString().split('T')[0],
    //       start,
    //       end,
    //     );

    //     const collection: ApiDateGroup[] = res.collection ?? [];

    //     // 🔧 Gabungkan total count per visitor_status dari semua tanggal
    //     const totals: Record<string, number> = {};

    //     collection.forEach((day) => {
    //       day.Status.forEach((item) => {
    //         const key = item.visitor_status.trim();
    //         totals[key] = (totals[key] || 0) + item.Count;
    //       });
    //     });

    //     setStats(totals);
    //   } catch (err) {
    //     console.error('Failed to fetch visitor count:', err);
    //   }
    // };

    const fetchData = async () => {
      try {
        const res = await getVisitorChart(token as any, start, end);
        const collection: ApiDateGroup[] = res.collection ?? [];

        const today = new Date();

        const currentStart = new Date();
        currentStart.setDate(today.getDate() - 6);

        const previousStart = new Date();
        previousStart.setDate(today.getDate() - 13);

        const previousEnd = new Date();
        previousEnd.setDate(today.getDate() - 7);

        const currentTotals: Record<string, number> = {};
        const previousTotals: Record<string, number> = {};

        collection.forEach((day) => {
          const dayDate = new Date(day.Date);

          day.Status.forEach((item) => {
            const key = item.visitor_status.trim();

            // 7 hari terakhir
            if (dayDate >= currentStart && dayDate <= today) {
              currentTotals[key] = (currentTotals[key] || 0) + item.Count;
            }

            // 7 hari sebelumnya
            if (dayDate >= previousStart && dayDate <= previousEnd) {
              previousTotals[key] = (previousTotals[key] || 0) + item.Count;
            }
          });
        });

        // setRawCollection(collection);
        const normalized = normalizeCollection(collection);
        setNormalizedData(normalized);

        setStatsToday(currentTotals);
        setStatsYesterday(previousTotals);
        setIsChartReady(true);
      } catch (err) {
        console.error('Failed to fetch visitor count:', err);
      }
    };

    if (token) fetchData();
  }, [token, startDate, endDate]);

  const getPercentageChange = (key: string) => {
    const current = statsToday[key] ?? 0;
    const previous = statsYesterday[key] ?? 0;

    if (previous === 0 && current === 0) {
      return {
        text: 'No change',
        color: '#5a5a5aff',
        trend: 'flat',
      };
    }

    if (previous === 0) {
      return {
        text: '+100% from last 7 days',
        color: '#21c45d',
        trend: 'up',
      };
    }

    const diff = ((current - previous) / previous) * 100;

    if (diff === 0) {
      return {
        text: 'No change',
        color: '#9e9e9e',
        trend: 'flat',
      };
    }

    return {
      text: `${diff > 0 ? '+' : ''}${diff.toFixed(0)}% from last 7 days`,
      color: diff > 0 ? '#21c45d' : '#F44336',
      trend: diff > 0 ? 'up' : 'down',
    };
  };

  const getColorByTitle = (title: string) => {
    switch (title.toLowerCase()) {
      case 'checkin':
        return '#21c45d'; // hijau
      case 'checkout':
        return '#F44336'; // merah
      case 'denied':
        return '#8B0000'; // merah tua
      case 'block':
        return '#424242'; // hitam
      case 'waiting':
        return '#4abfd4ff';
      case 'blacklist':
        return '#000000';
      default:
        return '#5c87ff'; // biru default
    }
  };

  const [rawCollection, setRawCollection] = useState<ApiDateGroup[]>([]);

  // const getLast7DaysSeries = (key: string): number[] => {
  //   if (!key || !rawCollection || !Array.isArray(rawCollection)) {
  //     return [0, 0, 0, 0, 0, 0, 0];
  //   }

  //   const today = new Date();
  //   const values: number[] = [];

  //   for (let i = 6; i >= 0; i--) {
  //     const d = new Date();
  //     d.setDate(today.getDate() - i);

  //     const dateStr = d.toISOString().split('T')[0];

  //     const found = rawCollection.find((x) => x?.Date && x.Date.startsWith(dateStr));

  //     if (found && Array.isArray(found.Status)) {
  //       const status = found.Status.find((s) => s?.visitor_status?.trim() === key);
  //       values.push(status?.Count ?? 0);
  //     } else {
  //       values.push(0);
  //     }
  //   }

  //   return values;
  // };

  const getLast7DaysSeries = (key: string): number[] => {
    if (!normalizedData.length) return [0, 0, 0, 0, 0, 0, 0];

    const today = new Date();
    const values: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const found = normalizedData.find((x) => x.Date === dateStr);

      values.push(found?.StatusMap?.[key] ?? 0);
    }

    return values;
  };

  const getColorByKey = (key: string) => {
    switch (key.toLowerCase()) {
      case 'checkin':
        return '#21c45d';
      case 'checkout':
        return '#F44336';
      case 'denied':
        return '#8B0000';
      case 'block':
        return '#424242';
      case 'waiting':
        return '#4abfd4';
      case 'blacklist':
        return '#000000';
      default:
        return '#5c87ff';
    }
  };

  return (
    <Grid container spacing={2}>
      {Array.isArray(items) &&
        items.map((card, index) => {
          if (!card?.key) return null;

          const key = String(card.key);
          const change = getPercentageChange(key);
          const baseColor = getColorByKey(key);
          return (
            <Grid key={key ?? index} size={size}>
              <CardContent
                sx={{
                  backgroundColor: `${baseColor}40`,
                  border: `0.5px solid ${baseColor}40`,
                  color: '#000',
                  boxShadow: 2.5,
                  height: 150,
                  p: 3.5,
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box width="100%">
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        sx={{ textTransform: 'capitalize' }}
                      >
                        {t(card.title)}
                      </Typography>

                      <Typography variant="h3" fontWeight={700}>
                        {statsToday?.[key] ?? 0}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        backgroundColor: getColorByTitle(card.title),
                        color: '#fff',
                        borderRadius: '30%',
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {card.icon}
                    </Box>
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      mt: 1,
                      fontWeight: 600,
                    }}
                  >
                    {change.trend === 'up' && <IconTrendingUp size={14} color={change.color} />}
                    {change.trend === 'down' && <IconTrendingDown size={14} color={change.color} />}
                    {change.trend === 'flat' && <IconMinus size={14} color="#5a5a5a" />}

                    <Box component="span" sx={{ color: change.color }}>
                      {change.text.split(' from')[0]}
                    </Box>

                    {change.trend !== 'flat' && (
                      <Box component="span" sx={{ color: '#050505ff' }}>
                        from last 7 days
                      </Box>
                    )}
                  </Typography>

                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -20,
                      left: 0,
                      right: 0,
                      height: 80,
                      opacity: 0.5,
                      pointerEvents: 'none',
                    }}
                  >
                    {isChartReady && normalizedData.length > 0 && (
                      <MiniChart normalizedData={normalizedData} card={card} change={change} />
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Grid>
          );
        })}
    </Grid>
  );
};

const MiniChart = ({ normalizedData, card, change, isChartReady }: any) => {
  const key = String(card.key);

  const series = useMemo(() => {
    if (!normalizedData.length) {
      return [{ name: card.title, data: [0, 0, 0, 0, 0, 0, 0] }];
    }

    const today = new Date();
    const values: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const found = normalizedData.find((x: any) => x.Date === dateStr);
      values.push(found?.StatusMap?.[key] ?? 0);
    }

    return [
      {
        name: card.title,
        data: values.map((v) => Number(v) || 0),
      },
    ];
  }, [normalizedData, key, card.title]);

  if (!isChartReady || series[0].data.length !== 7) return null;

  return (
    <Chart
      options={{
        chart: { type: 'area', sparkline: { enabled: true } },
        stroke: { curve: 'smooth', width: 2 },
        fill: { opacity: 0.3 },
        colors: [change.color],
        tooltip: { enabled: false },
      }}
      series={series}
      type="area"
      height={50}
    />
  );
};

export default TopCards;
