import React from 'react';
import Chart from 'react-apexcharts';
import { Card, CardContent, Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { ApexOptions } from 'apexcharts';

const VisitorStatistics = () => {
  const [filter, setFilter] = React.useState('week');

  const handleChange = (event: React.MouseEvent<HTMLElement>, newFilter: string) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const series = [
    {
      name: 'Visits',
      data: [60, 78, 25, 70, 50, 75, 92],
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
      categories: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          fontSize: '12px',
        },
      },
    },
    yaxis: {
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
    colors: ['#3B5BFF'],
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
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight={700}>
            Visitor Statistic
          </Typography>

          <ToggleButtonGroup value={filter} exclusive onChange={handleChange} size="small">
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
            <ToggleButton value="year">Year</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Chart options={options} series={series} type="bar" height={300} />
      </CardContent>
    </Card>
  );
};

export default VisitorStatistics;
