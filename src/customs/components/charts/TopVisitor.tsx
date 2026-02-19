import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { Box, Typography } from '@mui/material';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getTopVisitors } from 'src/customs/api/admin';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

const TopVisitor = () => {
  const { token } = useSession();
  const { t } = useTranslation();
  const [labels, setLabels] = useState<string[]>([]);
  const [values, setValues] = useState<number[]>([]);
  const { startDate, endDate } = useSelector((state: any) => state.dateRange);
  const theme = useSelector((state: any) => state.customizer.themeMode);

  const start = startDate?.toISOString().split('T')[0];
  const end = endDate?.toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const res = await getTopVisitors(token, start, end);

        const sliced = res.collection.slice(0, 5);
        setLabels(sliced.map((item: any) => item.name));
        setValues(sliced.map((item: any) => item.count));
      } catch (error) {
        console.error('Error fetching top visitors:', error);
      }
    };

    fetchData();
  }, [token, start, end]);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      animations: { enabled: true },
      fontFamily: 'Plus Jakarta Sans, sans-serif',
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        borderRadiusApplication: 'end',
        columnWidth: '50%',
        distributed: false,
        dataLabels: {
          position: 'top', // penting
        },
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -22, // supaya naik ke atas bar
      style: {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '13px',
        fontWeight: 600,
        colors: ['#374151'],
      },
      formatter: (val: number) => `(${val})`,
    },
    xaxis: {
      categories: labels,
      axisBorder: { show: true },
      axisTicks: { show: false },
      labels: {
        show: true,
        rotate: 0,
        style: {
          colors: '#000',
          fontSize: '12px',
        },
        formatter: (value: any) => {
          if (value === null || value === undefined) return '';

          const str = String(value);

          const maxLength = 16;

          if (str.length <= maxLength) return str;

          const firstLine = str.substring(0, 7);
          const secondLine = str.substring(7, 16);

          return `${firstLine}\n${secondLine}...`;
        },
      },
    },
    yaxis: {
      labels: {
        style: { colors: '#6b7280', fontSize: '14px' },
      },
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4,
    },
    colors: [theme === 'dark' ? '#055499' : '#055499'],
    tooltip: {
      theme: theme === 'dark' ? 'dark' : 'light',
      x: {
        formatter: function (_: any, opts: any) {
          return labels[opts.dataPointIndex];
        },
      },
    },
  };

  const series = [
    {
      name: t('Visitors'),
      data: values,
    },
  ];

  return (
    <>
      <Box
        sx={{
          // py: 2,
          borderRadius: 3,
          bgcolor: 'background.paper',
          boxShadow: 3,
          p: 2,
          height: 420,
        }}
      >
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
          {t('top_visitor')}
        </Typography>
        <Chart options={options} series={series} type="bar" height={350} />
      </Box>
    </>
  );
};

export default TopVisitor;
