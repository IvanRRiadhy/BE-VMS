import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import { Card, CardContent, Box, Typography } from '@mui/material';
import { ApexOptions } from 'apexcharts';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getTopVisitors } from 'src/customs/api/admin';
import dayjs from 'dayjs';

const VisitorStatistics = () => {
  const { t } = useTranslation();

  const [labels, setLabels] = useState<string[]>([]);
  const [values, setValues] = useState<number[]>([]);

  const { startDate, endDate } = useSelector((state: any) => state.dateRange);

  // const start = startDate?.toISOString().split('T')[0];
  // const end = endDate?.toISOString().split('T')[0];

  const start = startDate ? dayjs(startDate).format('YYYY-MM-DD') : undefined;
  const end = endDate ? dayjs(endDate).format('YYYY-MM-DD') : undefined;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getTopVisitors(start ?? '', end ?? '');

        const sliced = (res?.collection ?? []).slice(0, 10);

        setLabels(sliced.map((item: any) => item.name));
        setValues(sliced.map((item: any) => item.count));
      } catch (error) {
        setLabels([]);
        setValues([]);
      }
    };

    fetchData();
  }, [start, end]);

  const series = [
    {
      name: 'Visits',
      data: values,
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: {
        show: false,
      },
    },

    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '45%',
      },
    },

    dataLabels: {
      enabled: false,
    },

    stroke: {
      show: false,
    },

    xaxis: {
      categories: labels,

      axisBorder: {
        show: false,
      },

      axisTicks: {
        show: false,
      },

      labels: {
        style: {
          fontSize: '12px',
          fontWeight: '400',
          fontFamily: "Plus Jakarta Sans', sans-serif",
        },
      },
    },

    yaxis: {
      min: 0,

      labels: {
        style: {
          fontSize: '12px',
        },
      },
    },

    grid: {
      borderColor: '#f1f1f1',
      strokeDashArray: 4,
    },

    tooltip: {
      y: {
        formatter: (val) => `${val} Visits`,
      },
    },

    colors: ['#05367a'],

    states: {
      hover: {
        filter: {
          type: 'none',
        },
      },
    },
  };

  return (
    <Card
      sx={{
        borderRadius: '20px',
        boxShadow: 3,
        height: '410px',
      }}
    >
      <CardContent sx={{ p: 1, pb: '0px !important' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={700}>
            Top Visitor Statistic
          </Typography>
        </Box>

        <Chart options={options} series={series} type="bar" height={380} />
      </CardContent>
    </Card>
  );
};

export default VisitorStatistics;
