import { useEffect, useState } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { Box, Typography } from '@mui/material';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getVisitorChart } from 'src/customs/api/admin';
import { t } from 'i18next';
type VisitorSeries = {
  id: string;
  label: string;
  color: string;
  data: number[];
};

const VisitorFluctuationChart = () => {
  const { token } = useSession();
  const [dates, setDates] = useState<number[]>([]);
  const [series, setSeries] = useState<VisitorSeries[]>([]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (!token) return;

  //     try {
  //       const today = new Date();
  //       const end_date = today.toISOString().split('T')[0];
  //       const start = new Date(today);
  //       start.setDate(today.getDate() - 7);
  //       const start_date = start.toISOString().split('T')[0];

  //       const res = await getVisitorChart(token, start_date, end_date);

  //       const rows = res?.collection ?? [];

  //       const mappedDates = rows.map((d: any) => new Date(d.date).getTime());
  //       setDates(mappedDates);

  //       setSeries([
  //         {
  //           id: 'checkedIn',
  //           label: 'Checked In',
  //           data: rows.map((d: any) => d.checkedIn),
  //           color: '#2196f3',
  //         },
  //         {
  //           id: 'checkedOut',
  //           label: 'Checked Out',
  //           data: rows.map((d: any) => d.checkedOut),
  //           color: '#fb923c',
  //         },
  //         {
  //           id: 'denied',
  //           label: 'Denied',
  //           data: rows.map((d: any) => d.denied),
  //           color: '#ef4444',
  //         },
  //         {
  //           id: 'blocked',
  //           label: 'Blocked',
  //           data: rows.map((d: any) => d.blocked),
  //           color: '#22c55e',
  //         },
  //       ]);
  //     } catch (err) {
  //       console.error('Error fetching visitor fluctuation:', err);
  //     }
  //   };

  //   fetchData();
  // }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        const today = new Date();
        const end_date = today.toISOString().split('T')[0];
        const start = new Date(today);
        start.setDate(today.getDate() - 7);
        const start_date = start.toISOString().split('T')[0];

        const res = await getVisitorChart(token, start_date, end_date);
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
          { id: 'checkedIn', label: 'Checked In', data: checkinSeries, color: '#2196f3' },
          { id: 'checkedOut', label: 'Checked Out', data: checkoutSeries, color: '#fb923c' },
          { id: 'denied', label: 'Denied', data: deniedSeries, color: '#ef4444' },
          { id: 'blocked', label: 'Blocked', data: blockedSeries, color: '#22c55e' },
        ]);
      } catch (err) {
        console.error('Error fetching visitor fluctuation:', err);
      }
    };

    fetchData();
  }, [token]);

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        {t('fluctuation_visitor')}
      </Typography>
      <Box
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: 'background.paper',
          boxShadow: 3,
          // border: '1px solid #d6d3d3ff',
          height: {
            xs: 420, // layar kecil → 420px
            lg: 400, // layar medium ke atas → 400px
          },
          width: '100%',
        }}
      >
        <LineChart
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
          series={series}
          margin={{ top: 20, bottom: 70, left: 50, right: 20 }}
          grid={{ horizontal: true, vertical: false }}
          slotProps={{
            legend: { hidden: true },
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
