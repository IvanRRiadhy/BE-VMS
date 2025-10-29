import { Box, CardContent, Typography, Grid2 as Grid } from '@mui/material';
import { Stack } from '@mui/system';
import { useTranslation } from 'react-i18next';
import BlankCard from 'src/components/shared/BlankCard';
import { IconX, IconForbid2, IconLogout, IconLogin } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { getVisitorChart } from 'src/customs/api/admin';
import { useSelector } from 'react-redux';
import { useSession } from 'src/customs/contexts/SessionContext';

interface VisitorStatusItem {
  visitor_status: string;
  Count: number;
}

interface ApiDateGroup {
  Date: string;
  Status: VisitorStatusItem[];
}

const TopCards = () => {
  const { t } = useTranslation();
  const { token } = useSession();
  const { startDate, endDate } = useSelector((state: any) => state.dateRange);

  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const res = await getVisitorChart(
          token,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
        );

        const collection: ApiDateGroup[] = res.collection ?? [];

        // 🔧 Gabungkan total count per visitor_status dari semua tanggal
        const totals: Record<string, number> = {};

        collection.forEach((day) => {
          day.Status.forEach((item) => {
            const key = item.visitor_status.trim();
            totals[key] = (totals[key] || 0) + item.Count;
          });
        });

        setStats(totals);
      } catch (err) {
        console.error('Failed to fetch visitor count:', err);
      }
    };

     if(token) fetchData();
  }, [token, startDate, endDate]);

  // ✅ Data yang akan ditampilkan di kartu
  const CardItems = [
    { title: 'checkin', subTitle: stats['Checkin'] ?? 0, icon: <IconLogin size={22} /> },
    { title: 'checkout', subTitle: stats['Checkout'] ?? 0, icon: <IconLogout size={22} /> },
    { title: 'denied', subTitle: stats['Denied'] ?? 0, icon: <IconX size={22} /> },
    { title: 'block', subTitle: stats['Block'] ?? 0, icon: <IconForbid2 size={22} /> },
  ];

  const getColorByTitle = (title: string) => {
    switch (title.toLowerCase()) {
      case 'checkin':
        return '#13DEB9'; // hijau
      case 'checkout':
        return '#F44336'; // merah
      case 'denied':
        return '#8B0000'; // merah tua
      case 'block':
        return '#000000'; // hitam
      default:
        return '#5c87ff'; // biru default
    }
  };

  return (
    <Grid container spacing={3}>
      {CardItems.map((card, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
          <BlankCard>
            <CardContent
              sx={{
                backgroundColor: '#fff',
                color: '#000',
                boxShadow: 5,
                p: 3.5,
                border: '1px solid #e0e0e0',
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '120px',
                  height: '120px',
                  background: 'linear-gradient(135deg, transparent 40%, rgba(25,118,210,0.2) 100%)',
                  pointerEvents: 'none',
                },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    backgroundColor: getColorByTitle(card.title),
                    color: '#fff',
                    borderRadius: '50%',
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {card.icon}
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {t(card.title)}
                  </Typography>
                  <Typography variant="h5" color="textSecondary" fontWeight={700} mt={0.5}>
                    {card.subTitle}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </BlankCard>
        </Grid>
      ))}
    </Grid>
  );
};

export default TopCards;
