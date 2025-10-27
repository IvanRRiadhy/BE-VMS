import { useEffect, useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Typography, GlobalStyles } from '@mui/material';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getAvarageDuration } from 'src/customs/api/admin';
import { useTranslation } from 'react-i18next';

type PurposeData = {
  label: string;
  value: number;
  color: string;
};

const AvarageDurationChart = () => {
  const { token } = useSession();
  const { t } = useTranslation();
  const [data, setData] = useState<PurposeData[]>([]);
  const [avgMinutes, setAvgMinutes] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        const today = new Date();
        const end_date = today.toISOString().split('T')[0];
        const start = new Date(today);
        start.setDate(today.getDate() - 7);
        const start_date = start.toISOString().split('T')[0];

        const res = await getAvarageDuration(token, start_date, end_date);

        if (Array.isArray(res?.collection)) {
          // 🔹 Ubah array API menjadi object buckets { "0-30": 3, "30-60": 1, ">240": 3 }
          const buckets: Record<string, number> = {};
          res.collection.forEach((item: { time_average: string; count: number }) => {
            buckets[item.time_average] = item.count;
          });

          // 🔹 Kalau kamu mau tampilkan total average (jumlah semua count)
          const total = Object.values(buckets).reduce((acc, val) => acc + val, 0);
          setAvgMinutes(total);

          // 🔹 Map ke data chart
          const mapped: PurposeData[] = [
            { label: '0 - 30 minutes', value: buckets['0-30'] ?? 0, color: '#3b82f5' },
            { label: '30 - 60 minutes', value: buckets['30-60'] ?? 0, color: '#f97316' },
            { label: '60 - 90 minutes', value: buckets['60-90'] ?? 0, color: '#94a3b8' },
            { label: '90 - 120 minutes', value: buckets['90-120'] ?? 0, color: '#22c55e' },
            { label: '120 - 150 minutes', value: buckets['120-150'] ?? 0, color: '#94a3b8' },
            { label: '150 - 210 minutes', value: buckets['150-210'] ?? 0, color: '#94a3b8' },
            {
              label: '> 240 minutes',
              value: buckets['>240'] ?? buckets['>240'] ?? 0,
              color: '#ef4444',
            },
          ];

          setData(mapped);
        }
      } catch (err) {
        console.error('Error fetching average duration:', err);
      }
    };

    fetchData();
  }, [token]);

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        {t('avarage_duration')}
      </Typography>
      <Box
        sx={{
          py: 2,
          borderRadius: 3,
          bgcolor: 'background.paper',
          boxShadow: 3,
          height: 420,
          // border: '1px solid #d6d3d3ff',
        }}
      >
        <GlobalStyles
          styles={{
            '.MuiChartsAxis-line': { display: 'none' },
            '.MuiChartsAxis-tick': { stroke: 'none !important' },
          }}
        />

        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, pl: 3 }}>
          {avgMinutes}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0, fontWeight: 400, pl: 3 }}>
          Visiting Time Average (Minutes)
        </Typography>

        <BarChart
          layout="horizontal"
          height={300}
          yAxis={[
            {
              scaleType: 'band',
              data: data.map((d) => d.label),
            },
          ]}
          // xAxis={[
          //   {
          //     min: 0,
          //     valueFormatter: (value) => `${value}`, // tampilkan angka mentah
          //   },
          // ]}
          series={[
            {
              data: data.map((d) => d.value),
              color: '#3b82f5',
              // label: '',
            },
          ]}
          // colorMap={{
          //   type: 'ordinal',
          //   values: data.map((d) => d.label),
          //   colors: data.map((d) => d.color),
          // }}
          margin={{ top: 20, left: 140, right: 40, bottom: 20 }}
          grid={{ horizontal: true, vertical: false }}
        />
      </Box>
    </>
  );
};

export default AvarageDurationChart;
