import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Typography, GlobalStyles } from '@mui/material';
import { useState, useEffect } from 'react';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getTopVisitors } from 'src/customs/api/admin';
import { useTranslation } from 'react-i18next';

type PurposeData = {
  label: string;
  value: number;
  color: string;
};

const COLORS = [
  '#f97316', // orange
  '#22c55e', // green
  '#3b82f6', // blue
  '#a855f7', // purple
  '#ef4444', // red
  '#14b8a6', // teal
  '#eab308', // yellow
];

const TopVisitor = () => {
  const { token } = useSession();
  const { t } = useTranslation();
  const [data, setData] = useState<PurposeData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const today = new Date();
        const end_date = today.toISOString().split('T')[0];
        const start = new Date(today);
        start.setDate(today.getDate() - 7);
        const start_date = start.toISOString().split('T')[0];

        const res = await getTopVisitors(token, start_date, end_date);

        const mapped: PurposeData[] = res.collection.map(
          (item: { name: string; count: number }, idx: number) => ({
            label: item.name,
            value: item.count,
            color: COLORS[idx % COLORS.length],
          }),
        );

        setData(mapped);
      } catch (error) {
        console.error('Error fetching top visitors:', error);
      }
    };

    fetchData();
  }, [token]);

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        {t('top_visitor')}
      </Typography>
      <Box
        sx={{
          py: 2,
          borderRadius: 3,
          border: '1px solid #d6d3d3ff',
          bgcolor: 'background.paper',
          boxShadow: 3,
          height: {
            xs: 420, // layar kecil → 420px
            lg: 400, // layar medium ke atas → 400px
          },
        }}
      >
        <GlobalStyles
          styles={{
            '.MuiChartsAxis-line': { display: 'none' },
            '.MuiChartsAxis-tick': { stroke: 'none !important' },
          }}
        />

        {data.length > 0 && (
          <BarChart
            layout="horizontal"
            height={350}
            yAxis={[
              {
                scaleType: 'band',
                data: data.map((d) => d.label),
              },
            ]}
            // hack: 1 series per bar supaya bisa custom warna
            series={[
              {
                data: data.map((d) => d.value),
                color: '#3b82f6',
              },
            ]}
            margin={{ top: 20, left: 140, right: 40, bottom: 20 }}
            grid={{ horizontal: true, vertical: false }}
          />
        )}
      </Box>
    </>
  );
};

export default TopVisitor;
