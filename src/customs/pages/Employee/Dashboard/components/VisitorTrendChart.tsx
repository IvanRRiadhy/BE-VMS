import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { getVisitorChart } from 'src/customs/api/admin';
import { useSelector } from 'react-redux';

interface VisitorStatusChartProps {
  start: string;
  end: string;
}

const VisitorTrendChart = () => {
  const [dates, setDates] = useState<number[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { startDate, endDate } = useSelector((state: any) => state.dateRange);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await getVisitorChart(startDate, endDate);
        const rows = res?.collection ?? [];

        const getCount = (statuses: any[] = [], name: string) =>
          statuses.find((s) => s.visitor_status?.toLowerCase() === name.toLowerCase())?.Count ?? 0;

        setDates(rows.map((item: any) => new Date(item.date).getTime()));

        setSeries([
          {
            name: 'Check In',
            data: rows.map((row: any) => getCount(row.status, 'Checkin')),
          },
          {
            name: 'Check Out',
            data: rows.map((row: any) => getCount(row.status, 'Checkout')),
          },
          {
            name: 'Preregis',
            data: rows.map((row: any) => getCount(row.status, 'Preregis')),
          },
          {
            name: 'Block',
            data: rows.map((row: any) => getCount(row.status, 'Block')),
          },
        ]);
      } catch (err) {
        console.error('Error fetching visitor chart:', err);

        setDates([]);
        setSeries([]);
      } finally {
        setLoading(false);
      }
    };

    if (startDate && endDate) {
      fetchData();
    }
  }, [startDate, endDate]);

  const chartSeries = series.map((item) => ({
    name: item.name,
    data: item.data.map((value: number, index: number) => ({
      x: dates[index],
      y: value,
    })),
  }));

  const options: ApexOptions = {
    chart: {
      type: 'line',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },

    colors: ['#22c55e', '#F44336', 'gray', '#000000'],

    stroke: {
      curve: 'smooth',
      width: 3,
    },

    markers: {
      size: 4,
      hover: {
        size: 6,
      },
    },

    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false,
        format: 'dd MMM',
      },
    },

    yaxis: {
      min: 0,
      forceNiceScale: true,
      labels: {
        formatter: (value) => Math.round(value).toString(),
      },
    },

    legend: {
      position: 'top',
      horizontalAlign: 'right',
    },

    grid: {
      strokeDashArray: 4,
    },

    tooltip: {
      shared: true,
      x: {
        format: 'dd MMM yyyy',
      },
    },

    dataLabels: {
      enabled: false,
    },
  };

  return (
    <Card
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent
        sx={{
          flex: 1,
          pt: 1.5,
          px: 2.5,
          '&:last-child': {
            pb: 2,
          },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Typography variant="h6" fontWeight={600}>
            Visitor Trend
            {/* <span style={{ color: 'gray' }}>(Last 7 days)</span> */}
          </Typography>

          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            flexWrap="wrap"
            justifyContent="flex-end"
          >
            {series.map((item, index) => (
              <Stack key={item.name} direction="row" alignItems="center" spacing={0.75}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: options.colors?.[index],
                  }}
                />

                <Typography variant="body2" color="text.secondary">
                  {item.name}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>

        {loading ? (
          <Stack alignItems="center" justifyContent="center" height={330}>
            {/* <Typography color="text.secondary">Loading...</Typography> */}
            <CircularProgress size={24} color="primary" />
          </Stack>
        ) : (
          <Chart
            options={{
              ...options,
              legend: {
                show: false,
              },
            }}
            series={chartSeries}
            type="line"
            height={400}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default VisitorTrendChart;
