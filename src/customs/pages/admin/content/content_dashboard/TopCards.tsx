import { Box, CardContent, Typography, Grid2 as Grid } from '@mui/material';
import { Stack } from '@mui/system';
import { useTranslation } from 'react-i18next';
import BlankCard from 'src/components/shared/BlankCard';
import {
  IconUsers,
  IconX,
  IconActivity,
  IconBan,
  IconForbid2,
  IconLogout,
  IconLogin,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { getTodayVisitorCount } from 'src/customs/api/admin'; // ✅ pakai API kamu

interface ApiItem {
  visitor_status: string;
  Count: number;
}

const TopCards = ({ token }: { token: string | null }) => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const end = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0); // awal hari

        const res = await getTodayVisitorCount(
          token!,
          start.toISOString().split('T')[0],
          end.toISOString().split('T')[0],
        );

        const collection: ApiItem[] = res.collection ?? [];

        // mapping ke object biar gampang
        const map: Record<string, number> = {};
        collection.forEach((c) => {
          map[c.visitor_status] = c.Count;
        });
        setStats(map);
      } catch (err) {
        console.error('Failed to fetch visitor count:', err);
      }
    };

    if (token) fetchData();
  }, [token]);

  // hanya tampilkan yang kamu mau
  const CardItems = [
    { title: t('checkin'), subTitle: stats['Checkin'] ?? 0, icon: <IconLogin size={22} /> },
    { title: t('checkout'), subTitle: stats['Checkout'] ?? 0, icon: <IconLogout size={22} /> },
    { title: t('Block'), subTitle: stats['Block'] ?? 0, icon: <IconForbid2 size={22} /> },
    { title: t('Denied'), subTitle: stats['Denied'] ?? 0, icon: <IconX size={22} /> },
  ];

  const getColorByTitle = (title: string) => {
    switch (title) {
      case 'Check In':
        return '#13DEB9'; // hijau
      case 'Check Out':
        return '#F44336'; // merah
      case 'Denied':
        return '#8B0000'; // merah tua
      case 'Block':
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
                  <Typography variant="h5">{t(card.title)}</Typography>
                  <Typography variant="h6" color="textSecondary" fontWeight={600} mt={0.5}>
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
