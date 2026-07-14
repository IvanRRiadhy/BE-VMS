import { Box, CardContent, Typography, Grid2 as Grid } from '@mui/material';
import { Stack } from '@mui/system';
import { useTranslation } from 'react-i18next';
import BlankCard from 'src/components/shared/BlankCard';
import { IconTrendingUp, IconTrendingDown, IconMinus } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { getVisitorChart } from 'src/customs/api/admin';
import { useSelector } from 'react-redux';
import { useSession } from 'src/customs/contexts/SessionContext';
import Chart from 'react-apexcharts';

interface VisitorStatusItem {
  visitor_status: string;
  Count: number;
}

interface ApiDateGroup {
  date: string;
  status: VisitorStatusItem[];
}

const TopCard = ({ items = [], size }: any) => {
  const { t } = useTranslation();
  const { startDate, endDate } = useSelector((state: any) => state.dateRange);
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };
  const start = formatLocalDate(startDate);
  const end = formatLocalDate(endDate);
  const [statsToday, setStatsToday] = useState<Record<string, number>>({});
  const [statsYesterday, setStatsYesterday] = useState<Record<string, number>>({});
  const [normalizedData, setNormalizedData] = useState<
    { Date: string; StatusMap: Record<string, number> }[]
  >([]);

  const normalizeCollection = (collection: any[]) => {
    return collection.map((day) => {
      const grouped: Record<string, number> = {};

      (day.status || []).forEach((item: any) => {
        const key = item.visitor_status.trim();
        grouped[key] = (grouped[key] || 0) + Number(item.Count || 0);
      });

      return {
        Date: day.date ? day.date.split('T')[0] : '',
        StatusMap: grouped,
      };
    });
  };

  useEffect(() => {

    const fetchData = async () => {
      try {
        const res = await getVisitorChart( start, end);
        const collection: ApiDateGroup[] = res.collection ?? [];

        const currentStart = new Date(startDate);
        const currentEnd = new Date(endDate);

        const diffDays =
          Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        const previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - diffDays);

        const previousEnd = new Date(currentEnd);
        previousEnd.setDate(previousEnd.getDate() - diffDays);

        const currentTotals: Record<string, number> = {};
        const previousTotals: Record<string, number> = {};

        collection.forEach((day) => {
          const dayDate = new Date(day.date);

          (day.status || []).forEach((item) => {
            const key = item.visitor_status.trim();

            if (dayDate >= currentStart && dayDate <= currentEnd) {
              currentTotals[key] = (currentTotals[key] || 0) + item.Count;
            }

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
      } catch (err) {
        console.error('Failed to fetch visitor count:', err);
      }
    };

     fetchData();
  }, [ startDate, endDate]);

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

  const getLast7DaysSeries = (key: string) => {
    const today = new Date();
    const days: string[] = [];
    const values: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);

      const dateStr = d.toISOString().split('T')[0];
      days.push(dateStr);
      const found = rawCollection.find((x) => x.date.startsWith(dateStr));

      if (found) {
        const status = found.status.find((s) => s.visitor_status.trim() === key);
        values.push(status?.Count ?? 0);
      } else {
        values.push(0);
      }
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
      {items.map((card: any, index: any) => {
        const change = getPercentageChange(card.key.toString());
        const baseColor = getColorByKey(card.key.toString());
        return (
          <Grid key={index} size={size}>
            <CardContent
              sx={{
                // backgroundColor: '#fff',
                // background: `linear-gradient(180deg, ${baseColor}35)`,
                backgroundColor: `${baseColor}40`,
                border: `0.5px solid ${baseColor}40`,

                color: '#000',
                boxShadow: 2.5,
                height: 150,
                p: 3.5,
                // border: '1px solid #e0e0e0',
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '120px',
                  height: '120px',
                  // background: 'linear-gradient(135deg, transparent 40%, rgba(25,118,210,0.2) 100%)',
                  pointerEvents: 'none',
                },
              }}
            >
              <Box alignItems="center" justifyContent="space-between" width="100%">
                <Box>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent={'space-between'}
                    width="100%"
                    position="relative"
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        sx={{ textTransform: 'capitalize' }}
                      >
                        {t(card.title)}
                      </Typography>
                      <Typography variant="h3" fontWeight={700}>
                        {statsToday[card.key] ?? 0}
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

                    {/* Persentase pakai base color */}
                    <Box component="span" sx={{ color: change.color }}>
                      {change.text.split(' from')[0]}
                    </Box>

                    {/* "from last 7 days" selalu hitam */}
                    {change.trend != 'flat' && (
                      <Box component="span" sx={{ color: '#050505ff' }}>
                        from last 7 days
                      </Box>
                    )}
                  </Typography>
                  {/* <Box
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
                    <Chart
                      options={{
                        chart: {
                          type: 'area',
                          sparkline: { enabled: true },
                        },
                        stroke: {
                          curve: 'smooth',
                          width: 2,
                        },
                        fill: {
                          opacity: 0.3,
                        },
                        colors: [change.color],
                        tooltip: {
                          enabled: false,
                        },
                      }}
                      series={[
                        {
                          name: card.title,
                          data: getLast7DaysSeries(card.key.toString()),
                        },
                      ]}
                      type="area"
                      height={50}
                    />
                  </Box> */}
                </Box>
              </Box>
            </CardContent>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default TopCard;
