import { PieChart } from '@mui/x-charts/PieChart';
import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getRepeatsVisitor } from 'src/customs/api/admin';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

type VisitorTypeData = {
  label: string;
  value: number;
  color: string;
};

const VisitingTypeChart = () => {
  const { token } = useSession();
  const { startDate, endDate } = useSelector((state: any) => state.dateRange);
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<VisitorTypeData[]>([
    { label: t('repeat_visitor'), value: 0, color: '#2196f3' },
    { label: t('new_visitor'), value: 0, color: '#e5e7eb' },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        // const today = new Date();
        // const end_date = today.toISOString().split('T')[0];
        // const start = new Date(today);
        // start.setDate(today.getDate() - 7);
        // const start_date = start.toISOString().split('T')[0];

        const res = await getRepeatsVisitor(
          token,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
        );

        if (res?.collection) {
          setData([
            { label: t('repeat_visitor'), value: res.collection.repeat ?? 0, color: '#2196f3' },
            { label: t('new_visitor'), value: res.collection.new ?? 0, color: '#e5e7eb' },
          ]);
        }
      } catch (err) {
        console.error('Error fetching repeat visitors:', err);
      }
    };

    fetchData();
  }, [token, i18n.language, startDate, endDate]);

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const repeatPercentage = total > 0 ? ((data[0].value / total) * 100).toFixed(1) : '0';

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        {t('visiting_type')}
      </Typography>
      <Box
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: 'background.paper',
          boxShadow: 3,
          border: '1px solid #d6d3d3ff',
          height: 400,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <PieChart
            series={[
              {
                data: data.map((d, i) => ({
                  id: i,
                  value: d.value,
                  label: d.label,
                  color: d.color,
                })),
                innerRadius: 0, // pie penuh
                outerRadius: 120,
              },
            ]}
            height={320}
            margin={{ top: 20, bottom: 60, left: 20, right: 20 }}
            slotProps={{
              legend: { hidden: true },
            }}
          />

          {/* angka di tengah */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" fontWeight={700} color="white">
              {repeatPercentage} %
            </Typography>
          </Box>

          {/* legend custom */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: -2,
              gap: 1,
            }}
          >
            {data.map((item) => (
              <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    bgcolor: item.color,
                  }}
                />
                <Typography variant="body2">{item.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default VisitingTypeChart;
