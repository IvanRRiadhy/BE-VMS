import { useEffect, useState } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { Box, Typography } from '@mui/material';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getVisitorChart } from 'src/customs/api/admin';
import { t } from 'i18next';
import { useSelector } from 'react-redux';
import Chart from 'react-apexcharts';

type VisitorSeries = {
  id: string;
  label: string;
  color: string;
  data: number[];
  area: any;
};

const VisitorFluctuationChart = () => {
  const [dates, setDates] = useState<number[]>([]);
  const [series, setSeries] = useState<VisitorSeries[]>([]);
  const { startDate, endDate } = useSelector((state: any) => state.dateRange);

  const start = startDate?.toISOString().split('T')[0];
  const end = endDate?.toISOString().split('T')[0];

  useEffect(() => {


    const fetchData = async () => {
      try {
        const res = await getVisitorChart( start, end);
        const rows = res?.collection ?? [];

        setDates(rows.map((item: any) => new Date(item.date).getTime()));

        const getCount = (statuses: any[] = [], name: string) =>
          statuses.find((s) => s.visitor_status?.toLowerCase() === name.toLowerCase())?.Count ?? 0;

        setSeries([
          {
            id: 'checkedIn',
            label: 'Checked In',
            color: '#22c55e',
            area: true,
            data: rows.map((r: any) => getCount(r.status, 'Checkin')),
          },
          {
            id: 'checkedOut',
            label: 'Checked Out',
            color: '#F44336',
            area: true,
            data: rows.map((r: any) => getCount(r.status, 'Checkout')),
          },
          {
            id: 'denied',
            label: 'Denied',
            color: '#8B0000',
            area: true,
            data: rows.map((r: any) => getCount(r.status, 'Denied')),
          },
          {
            id: 'blocked',
            label: 'Blocked',
            color: '#000000',
            area: true,
            data: rows.map((r: any) => getCount(r.status, 'Block')),
          },
        ]);
      } catch (err) {
        console.error('Error fetching visitor fluctuation:', err);
      }
    };

    fetchData();
  }, [ start, end]);

  return (
    <>
      <Box
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: 'background.paper',
          boxShadow: 3,
          // border: '1px solid #d6d3d3ff',
          height: {
            xs: 420, // layar kecil → 420px
            lg: 420, // layar medium ke atas → 400px
          },
          width: '100%',
        }}
      >
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
          {t('fluctuation_visitor')}
        </Typography>

        <Chart
          type="area"
          height={340}
          series={series.map((s) => ({
            name: s.label,
            data: s.data,
          }))}
          options={{
            chart: {
              type: 'area',
              toolbar: { show: false },
              zoom: { enabled: false },
            },
            colors: series.map((s) => s.color),
            stroke: {
              curve: 'smooth',
              width: 3,
            },
            fill: {
              type: 'gradient',
              gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.05,
                stops: [0, 90, 100],
              },
            },
            dataLabels: {
              enabled: false,
            },
            xaxis: {
              categories: dates.map((d) =>
                new Intl.DateTimeFormat('en-GB', {
                  day: '2-digit',
                  month: 'short',
                }).format(new Date(d)),
              ),
              // axisBorder: {
              //   show: false,
              // },
              // axisTicks: {
              //   show: false,
              // },
            },
            yaxis: {
              labels: {
                formatter: (val: number) => Math.round(val).toString(),
              },
            },
            grid: {
              borderColor: '#e5e7eb',
              strokeDashArray: 4,
            },
            legend: {
              show: false,
            },
            tooltip: {
              y: {
                formatter: (val: number) => `${val}`,
              },
            },
          }}
        />

        {/* ✅ manual legend bawah */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: -2,
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          {series.map((item) => (
            <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  bgcolor: item.color,
                }}
              />
              <Typography variant="body2">{item.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
};

export default VisitorFluctuationChart;
