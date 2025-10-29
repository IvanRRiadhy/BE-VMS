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

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        // const today = new Date();
        // const end_date = today.toISOString().split('T')[0];
        // const start = new Date(today);
        // start.setDate(today.getDate() - 7);
        // const start_date = start.toISOString().split('T')[0];

        const res = await getTopVisitors(
          token,
          startDate.toLocaleDateString('en-CA'),
          endDate.toLocaleDateString('en-CA'),
        );

        const sliced = res.collection.slice(0, 10);
        setLabels(sliced.map((item: any) => item.name));
        setValues(sliced.map((item: any) => item.count));
      } catch (error) {
        console.error('Error fetching top visitors:', error);
      }
    };

    fetchData();
  }, [token, startDate, endDate]);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      animations: { enabled: true },
    },
    plotOptions: {
      bar: {
        borderRadius: 8, // 🎯 rounded top
        borderRadiusApplication: 'end', // hanya bagian atas yang rounded
        columnWidth: '50%',
        distributed: false,
        // endingShape: 'rounded',
      },
    },
    dataLabels: {
      enabled: false,
    },
    // xaxis: {
    //   categories: labels,
    //   axisBorder: { show: true },
    //   axisTicks: { show: false },
    //   labels: {
    //     show: true,
    //     rotate: 0,
    //     style: { colors: '#6b7280', fontSize: '14px' },
    //   },
    // },
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
        formatter: (value: string) => {
          // 🧠 Potong label jadi 2 baris jika terlalu panjang
          if (value.length > 5) {
            const words = value.split(' ');
            if (words.length > 1) {
              // gabungkan kata jadi 2 baris
              const half = Math.ceil(words.length / 2);
              return words.slice(0, half).join(' ') + '\n' + words.slice(half).join(' ');
            } else {
              // potong berdasarkan panjang karakter
              return value.slice(0, 5) + '\n' + value.slice(12);
            }
          }
          return value;
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
    colors: ['#3b82f6'], // 💙 biru seperti permintaanmu
    tooltip: {
      theme: 'light',
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
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        {t('top_visitor')}
      </Typography>
      <Box
        sx={{
          // py: 2,
          borderRadius: 3,
          bgcolor: 'background.paper',
          boxShadow: 3,
          p: 2,
        }}
      >
        <Chart options={options} series={series} type="bar" height={350} />
      </Box>
    </>
  );
};

export default TopVisitor;
