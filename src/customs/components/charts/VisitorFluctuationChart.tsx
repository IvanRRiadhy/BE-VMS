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
  const { token } = useSession();
  const [dates, setDates] = useState<number[]>([]);
  const [series, setSeries] = useState<VisitorSeries[]>([]);
  const { startDate, endDate } = useSelector((state: any) => state.dateRange);

  const start = startDate?.toISOString().split('T')[0];
  const end = endDate?.toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        // const today = new Date();
        // const end_date = today.toISOString().split('T')[0];
        // const start = new Date(today);
        // start.setDate(today.getDate() - 7);
        // const start_date = start.toISOString().split('T')[0];

        const res = await getVisitorChart(token, start, end);
        const rows = res?.collection ?? [];

        // 🔹 Ambil tanggal
        const mappedDates = rows.map((d: any) => new Date(d.Date).getTime());
        setDates(mappedDates);

        // 🔹 Helper untuk ambil jumlah berdasarkan status name
        const getCount = (statuses: any[], name: string) =>
          statuses.find((s) => s.visitor_status?.toLowerCase() === name.toLowerCase())?.Count ?? 0;

        // 🔹 Siapkan data series
        const checkinSeries = rows.map((r: any) => getCount(r.Status, 'Checkin'));
        const checkoutSeries = rows.map((r: any) => getCount(r.Status, 'Checkout'));
        const deniedSeries = rows.map((r: any) => getCount(r.Status, 'Denied'));
        const blockedSeries = rows.map((r: any) => getCount(r.Status, 'Block'));

        setSeries([
          {
            id: 'checkedIn',
            label: 'Checked In',
            data: checkinSeries,
            color: '#22c55e',
            area: true,
          },
          {
            id: 'checkedOut',
            label: 'Checked Out',
            data: checkoutSeries,
            color: '#F44336',
            area: true,
          },
          { id: 'denied', label: 'Denied', data: deniedSeries, color: '#8B0000', area: true },
          { id: 'blocked', label: 'Blocked', data: blockedSeries, color: '#000000', area: true },
        ]);
      } catch (err) {
        console.error('Error fetching visitor fluctuation:', err);
      }
    };

    fetchData();
  }, [token, start, end]);

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
        {/* <LineChart
          height={350}
          xAxis={[
            {
              scaleType: 'time',
              data: dates,
              valueFormatter: (timestamp) =>
                new Intl.DateTimeFormat('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                }).format(new Date(timestamp as number)),
            },
          ]}
          series={series.map((s) => ({
            ...s,
            curve: 'monotoneX',
          }))}
          margin={{ top: 20, bottom: 70, left: 50, right: 20 }}
          grid={{ horizontal: true, vertical: false }}
          slotProps={{
            legend: { hidden: true },
          }}
        /> */}

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
