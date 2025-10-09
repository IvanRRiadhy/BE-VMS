import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Typography, GlobalStyles } from '@mui/material';
import { useState, useEffect } from 'react';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getTopVisitingPurpose } from 'src/customs/api/admin'; // pastikan path sesuai
import { useTranslation } from 'react-i18next';

type PurposeData = {
  label: string;
  value: number;
  color: string;
};

// helper default warna
const COLORS = ['#3b82f6', '#f97316', '#22c55e', '#eab308', '#ef4444', '#8b5cf6'];

const TopVisitingPurposeChart = ({ title }: { title: string }) => {
  const { token } = useSession();
  const { t } = useTranslation();

  const [dataVisitorPurpose, setDataVisitorPurpose] = useState<PurposeData[]>([]);

  useEffect(() => {
    if (!token) return;

    const fetchDataVisitingPurpose = async () => {
      try {
        const today = new Date();
        const end_date = today.toISOString().split('T')[0]; // yyyy-mm-dd
        const start = new Date(today);
        start.setDate(today.getDate() - 7); // 7 hari ke belakang
        const start_date = start.toISOString().split('T')[0];

        const res = await getTopVisitingPurpose(token, start_date, end_date);

        // Map response API ke format chart
        const mapped: PurposeData[] = res.collection.map(
          (item: { id: string; name: string; count: number }, idx: number) => ({
            label: item.name,
            value: item.count,
            color: COLORS[idx % COLORS.length],
          }),
        );

        setDataVisitorPurpose(mapped);
      } catch (error) {
        console.error('Error fetching visiting purpose:', error);
      }
    };

    fetchDataVisitingPurpose();
  }, [token]);

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        {t('top_visitor_purpose')}
      </Typography>
      <Box
        sx={{
          py: 2,
          borderRadius: 3,
          bgcolor: 'background.paper',
          boxShadow: 3,
          border: '1px solid #d6d3d3ff',
          height: 400,
          width: '100%',
        }}
      >
        <GlobalStyles
          styles={{
            '.MuiChartsAxis-line': { display: 'none' },
            '.MuiChartsAxis-tick': { stroke: 'none !important' },
          }}
        />

        <BarChart
          layout="horizontal"
          height={350}
          yAxis={[
            {
              scaleType: 'band',
              data: dataVisitorPurpose.map((d) => d.label),
            },
          ]}
          series={[
            {
              data: dataVisitorPurpose.map((d) => d.value),
              color: '#3b82f6',
            },
          ]}
          margin={{ top: 20, left: 140, right: 40, bottom: 20 }}
          grid={{ horizontal: true, vertical: false }}
        />
      </Box>
    </>
  );
};

export default TopVisitingPurposeChart;
