// components/analytics/AnalyticsCharts.tsx

import React from 'react';
import Chart from 'react-apexcharts';
import { Box } from '@mui/material';

const baseOptions = {
  chart: {
    toolbar: { show: false },
    fontFamily: 'inherit',
    animations: { enabled: true },
  },
  dataLabels: {
    enabled: false,
  },
  grid: {
    borderColor: '#e7ebf1',
    strokeDashArray: 3,
  },
  legend: {
    show: false,
  },
  tooltip: {
    theme: 'light' as const,
  },
};

// DONUT CHART

export const VisitorTypeDonut = ({ data }: { data: any[] }) => {
  const totalVisits = data.reduce((total, item) => total + (Number(item.value) || 0), 0);
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'minmax(0, 1fr)',
          sm: 'minmax(130px, 1fr) minmax(150px, 1.2fr)',
        },
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Box sx={{ position: 'relative', minWidth: 0 }}>
        <Chart
          type="donut"
          height={200}
          series={data.map((item) => item.value)}
          options={{
            ...baseOptions,
            chart: {
              ...baseOptions.chart,
              type: 'donut',
            },
            labels: data.map((item) => item.name),
            colors: data.map((item) => item.color),
            stroke: {
              width: 2,
              colors: ['#fff'],
            },
            plotOptions: {
              pie: {
                donut: {
                  size: '68%',
                },
              },
            },
            dataLabels: {
              enabled: false,
            },
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <b style={{ fontSize: 18 }}> {totalVisits.toLocaleString('id-ID')}</b>
          <span style={{ fontSize: 12, color: '#667085' }}>Kunjungan</span>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gap: 0.9 }}>
        {data.map((item) => (
          <Box
            key={item.name}
            sx={{
              display: 'grid',
              gridTemplateColumns: '10px 1fr auto',
              gap: 0.8,
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: 0.5,
                bgcolor: item.color,
              }}
            />

            <Box component="span" sx={{ fontSize: 13 }}>
              {item.name}
            </Box>

            <Box
              component="span"
              sx={{
                fontSize: 12,
                fontWeight: 650,
                whiteSpace: 'nowrap',
              }}
            >
              {item.value.toLocaleString('id-ID')}
              {item.percentage && ` (${item.percentage}%)`}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// DAILY BAR CHART

export const DailyBarChart = ({ data }: { data: any[] }) => (
  <Chart
    type="bar"
    height={190}
    series={[
      {
        name: 'Kunjungan',
        data: data.map((item) => item.value),
      },
    ]}
    options={{
      ...baseOptions,
      chart: {
        ...baseOptions.chart,
        type: 'bar',
      },
      colors: ['#2583ed'],
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: '62%',
          dataLabels: {
            position: 'top',
          },
        },
      },
      xaxis: {
        categories: data.map((item) => item.day),
        labels: {
          style: { fontSize: '10px' },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { fontSize: '10px' },
          formatter: (value: number) => value.toLocaleString('id-ID'),
        },
      },
      dataLabels: {
        enabled: true,
        // position: 'top',
        offsetY: -20,
        style: {
          fontSize: '12px',
          fontWeight: 600,
          colors: ['#344054'],
        },
        formatter: (value: number) => value.toLocaleString('id-ID'),
      },
      grid: {
        ...baseOptions.grid,
        padding: { top: 5 },
      },
    }}
  />
);

// EXTEND AREA CHART

interface ExtendTrendChartProps {
  labels: string[];
  series: number[];
}

export const ExtendTrendChart = ({ labels, series }: ExtendTrendChartProps) => (
  <Chart
    type="area"
    height={145}
    series={[
      {
        name: 'Extend',
        data: series,
      },
    ]}
    options={{
      ...baseOptions,
      chart: {
        ...baseOptions.chart,
        type: 'area',
      },
      colors: ['#a45be5'],
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      fill: {
        type: 'gradient',
        gradient: {
          opacityFrom: 0.28,
          opacityTo: 0.03,
        },
      },
      markers: {
        size: 3,
        strokeWidth: 0,
      },
      xaxis: {
        type: 'category',
        categories: labels,
        tickPlacement: 'on',
        labels: {
          show: true,
          rotate: 0,
          hideOverlappingLabels: false,
          style: { fontSize: '9px' },
        },
      },
      yaxis: {
        min: 0,
        forceNiceScale: true,
        labels: {
          style: { fontSize: '9px' },
        },
      },
    }}
  />
);

// MONTHLY LINE CHART

type MonthlyTrendChartProps = {
  data: {
    months: string[];
    series: {
      name: string;
      data: number[];
    }[];
  };
};
const monthlyColors: Record<string, string> = {
  'Total Kunjungan': '#2583ed',
  Kendaraan: '#42ad55',
  'Butuh Parkir': '#f2bd22',
  'Kena Alarm': '#df3c45',
  Extend: '#a45be5',
};

export const MonthlyTrendChart = ({ data }: MonthlyTrendChartProps) => (
  <Chart
    type="line"
    height={220}
    series={data.series}
    options={{
      ...baseOptions,
      chart: {
        ...baseOptions.chart,
        type: 'line',
      },
      colors: data.series.map((item) => monthlyColors[item.name] ?? '#64748b'),
      stroke: {
        curve: 'straight',
        width: [2.5, 2, 2, 2, 2],
      },
      markers: {
        size: 3,
        hover: {
          size: 5,
        },
      },
      xaxis: {
        categories: data.months,
        labels: {
          style: { fontSize: '10px' },
        },
      },
      yaxis: {
        min: 0,
        labels: {
          style: { fontSize: '10px' },
          formatter: (value: number) => value.toLocaleString('id-ID'),
        },
      },
      legend: {
        show: false,
      },
    }}
  />
);
