import { Box, CardContent, Typography, Grid2 as Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { IconUserCheck, IconHourglass } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getSummaryCount } from 'src/customs/api/Admin/Dashboard';

interface TopCardProps {
  items?: any[];
  size?: any;
}

const TopCard = ({ items = [], size }: TopCardProps) => {
  const { t } = useTranslation();
  const { startDate, endDate } = useSelector((state: any) => state.dateRange);

  const [summary, setSummary] = useState({
    active: 0,
    pending: 0,
  });

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const start = formatLocalDate(new Date(startDate));
        const end = formatLocalDate(new Date(endDate));

        const res = await getSummaryCount(start, end);

        const collection = res?.collection ?? {};

        setSummary({
          active: Number(collection.active ?? 0),
          pending: Number(collection.pending ?? 0),
        });
      } catch (error) {
        console.error('Failed to fetch summary count:', error);

        setSummary({
          active: 0,
          pending: 0,
        });
      }
    };

    fetchSummary();
  }, [startDate, endDate]);

  const getColorByKey = (key: string) => {
    switch (key.toLowerCase()) {
      case 'active':
        return '#16A765';

      case 'pending':
        return '#055499';

      default:
        return '#055499';
    }
  };

  return (
    <Grid
      container
      spacing={2}
      sx={{
        width: '100%',
        height: '100%',
      }}
    >
      {items.map((card: any, index: number) => {
        const value = summary[card.key as keyof typeof summary] ?? 0;
        const baseColor = getColorByKey(card.key);

        return (
          <Grid key={index} size={{ xs: 12, sm: 6 }}>
            <CardContent
              sx={{
                backgroundColor: '#fff',
                border: '1px solid',
                borderColor: '#edf0f4',
                borderRadius: 2,
                // height: 90,
                height: '100%',
                px: 2,
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {/* Icon */}
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  minWidth: 60,
                  borderRadius: '50%',
                  backgroundColor: `${baseColor}12`,
                  color: baseColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5,
                }}
              >
                {card.icon}
              </Box>

              {/* Content */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {/* Number + Title */}
                <Box display="flex" alignItems="baseline" gap={1} flexDirection={'column'}>
                  <Typography
                    sx={{
                      fontSize: 24,
                      lineHeight: 1,
                      fontWeight: 700,
                      color: baseColor,
                    }}
                  >
                    {value}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#30343b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {t(card.title)}
                  </Typography>
                </Box>

                {/* Description */}
                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 10.5,
                    lineHeight: 1.2,
                    color: '#8a919d',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {card.description}
                </Typography>
              </Box>

              {/* Arrow */}
              <Box
                sx={{
                  ml: 1,
                  color: '#9aa1ab',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 30,
                    fontWeight: 300,
                    lineHeight: 1,
                  }}
                >
                  ›
                </Typography>
              </Box>
            </CardContent>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default TopCard;
