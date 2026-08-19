import { Grid2 as Grid, Card, Typography, Box, Stack } from '@mui/material';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { useEffect, useState } from 'react';
import { getVisitorChart } from 'src/customs/api/admin';
import { useSelector } from 'react-redux';

interface VisitorStatusItem {
  visitor_status: string;
  Count: number;
}

interface ApiDateGroup {
  date: string;
  status: VisitorStatusItem[];
}

export default function TopCardsUI({ onOpenQuick }: any) {
  const { startDate, endDate } = useSelector((state: any) => state.dateRange);

  const [stats, setStats] = useState<Record<string, number>>({});

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const start = formatLocalDate(startDate);
  const end = formatLocalDate(endDate);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getVisitorChart(start, end);

        const collection: ApiDateGroup[] = res.collection ?? [];

        const currentTotals: Record<string, number> = {};

        const rangeStart = new Date(`${start}T00:00:00`);
        const rangeEnd = new Date(`${end}T23:59:59.999`);

        collection.forEach((day) => {
          const dayDate = new Date(`${day.date.split('T')[0]}T00:00:00`);

          if (dayDate < rangeStart || dayDate > rangeEnd) {
            return;
          }

          (day.status || []).forEach((item) => {
            const key = item.visitor_status.trim().toLowerCase();

            currentTotals[key] = (currentTotals[key] || 0) + Number(item.Count || 0);
          });
        });

        setStats(currentTotals);
      } catch (err) {
        console.error('Failed to fetch visitor count:', err);
        setStats({});
      }
    };

    fetchData();
  }, [start, end]);

  const CardItems = [
    {
      title: 'Visitors Expected',
      value: stats['preregis'] ?? 0,
    },
    {
      title: 'Checked In Visitors',
      value: stats['checkin'] ?? 0,
    },
    {
      title: 'Check Out Visitors',
      value: stats['checkout'] ?? 0,
    },
    {
      title: 'Defaulted Visitors',
      value: stats['denied'] ?? 0,
    },
    {
      title: 'Pending Visits',
      value: (stats['waiting'] ?? 0) + (stats['queue'] ?? 0) + (stats['pracheckin'] ?? 0),
    },
  ];

  return (
    <Grid container spacing={2} alignItems="stretch">
      {CardItems.map((item, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 3, lg: 2.4 }} sx={{ display: 'flex' }}>
          <Card
            sx={{
              flex: 1,
              borderRadius: 3,
              p: 4,
              minHeight: 120,
              boxShadow: '0px 2px 10px rgba(0,0,0,0.08)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography
                  sx={{
                    fontSize: 42,
                    fontWeight: 500,
                    lineHeight: 1,
                    color: '#4A4A4A',
                  }}
                >
                  {item.value}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  backgroundColor: '#3F51F7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PersonSearchIcon
                  sx={{
                    color: '#fff',
                    fontSize: 25,
                  }}
                />
              </Box>
            </Stack>

            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: '#4A4A4A',
              }}
            >
              {item.title}
            </Typography>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
