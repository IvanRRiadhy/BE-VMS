// import { BarChart } from '@mui/x-charts/BarChart';
// import { Box, Typography, GlobalStyles } from '@mui/material';
// import { useState, useEffect } from 'react';
// import { useSession } from 'src/customs/contexts/SessionContext';
// import { getTopVisitingPurpose } from 'src/customs/api/admin';
// import { useTranslation } from 'react-i18next';

// type PurposeData = {
//   label: string;
//   value: number;
//   color: string;
// };

// const COLORS = ['#3b82f6', '#f97316', '#22c55e', '#eab308', '#ef4444', '#8b5cf6'];

// const TopVisitingPurposeChart = ({ title }: { title: string }) => {
//   const { token } = useSession();
//   const { t } = useTranslation();
//   const [dataVisitorPurpose, setDataVisitorPurpose] = useState<PurposeData[]>([]);

//   useEffect(() => {
//     if (!token) return;

//     const fetchDataVisitingPurpose = async () => {
//       try {
//         const today = new Date();
//         const end_date = today.toISOString().split('T')[0];
//         const start = new Date(today);
//         start.setDate(today.getDate() - 7);
//         const start_date = start.toISOString().split('T')[0];

//         const res = await getTopVisitingPurpose(token, start_date, end_date);

//         const mapped: PurposeData[] = res.collection.map(
//           (item: { id: string; name: string; count: number }, idx: number) => ({
//             label: item.name,
//             value: item.count,
//             color: COLORS[idx % COLORS.length],
//           }),
//         );

//         setDataVisitorPurpose(mapped);
//       } catch (error) {
//         console.error('Error fetching visiting purpose:', error);
//       }
//     };

//     fetchDataVisitingPurpose();
//   }, [token]);

//   return (
//     <>
//       <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
//         {title || t('top_visitor_purpose')}
//       </Typography>

//       <Box
//         sx={{
//           py: 2,
//           borderRadius: 3,
//           bgcolor: 'background.paper',
//           boxShadow: 3,
//           // border: '1px solid #d6d3d3ff',
//           height: 400,
//           width: '100%',
//         }}
//       >
//         {/* Hilangkan garis axis */}
//         <GlobalStyles
//           styles={{
//             '.MuiChartsAxis-line': { display: 'none' },
//             '.MuiChartsAxis-tick': { stroke: 'none !important' },
//           }}
//         />

//         {/* 🎨 CSS injection untuk ubah warna tiap bar */}
//         <GlobalStyles
//           styles={{
//             ...Object.fromEntries(
//               dataVisitorPurpose.map((d, i) => [
//                 `.MuiBarElement-root[data-index="${i}"] rect`,
//                 { fill: d.color },
//               ]),
//             ),
//           }}
//         />

//         <BarChart
//           layout="horizontal"
//           height={350}
//           yAxis={[
//             {
//               scaleType: 'band',
//               data: dataVisitorPurpose.map((d) => d.label),
//             },
//           ]}
//           series={[
//             {
//               data: dataVisitorPurpose.map((d) => d.value),
//               color: '#3b82f6',
//             },
//           ]}
//           margin={{ top: 20, left: 140, right: 40, bottom: 20 }}
//           grid={{ horizontal: true, vertical: false }}
//         />
//       </Box>
//     </>
//   );
// };

// export default TopVisitingPurposeChart;

import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Box, Typography } from '@mui/material';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getTopVisitingPurpose } from 'src/customs/api/admin';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

const COLORS = [
  '#055499',
  '#f97316',
  '#22c55e',
  '#eab308',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#84cc16',
];

const TopVisitingPurposeChart = ({ title }: { title: string }) => {
  const { token } = useSession();
  const { t } = useTranslation();
  const { startDate, endDate } = useSelector((state: any) => state.dateRange);
  const [chartData, setChartData] = useState<{
    labels: string[];
    values: number[];
    colors: string[];
  }>({
    labels: [],
    values: [],
    colors: [],
  });

  const start = startDate?.toISOString().split('T')[0];
  const end = endDate?.toISOString().split('T')[0];

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        // const today = new Date();
        // const end_date = today.toISOString().split('T')[0];
        // const start = new Date(today);
        // start.setDate(today.getDate() - 7);
        // const start_date = start.toISOString().split('T')[0];

        const res = await getTopVisitingPurpose(
          token,
          // startDate.toLocaleDateString('en-CA'),
          // endDate.toLocaleDateString('en-CA'),
          start,
          end,
        );

        const labels = res.collection.map((item: any) => item.name);
        const values = res.collection.map((item: any) => item.count);
        const colors = labels.map((_: any, idx: number) => COLORS[idx % COLORS.length]);

        setChartData({ labels, values, colors });
      } catch (error) {
        console.error('Error fetching visiting purpose:', error);
      }
    };

    fetchData();
  }, [token, start, end]);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      animations: { enabled: true },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        borderRadius: 6,
        barHeight: '50%',
      },
    },
    colors: chartData.colors,
    dataLabels: {
      enabled: false,
      style: { colors: ['#fff'], fontWeight: 600 },
      formatter: (val: number) => `${val}`,
    },
    xaxis: {
      categories: chartData.labels,
      labels: { style: { colors: '#6b7280', fontWeight: 400 } },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#374151',
          fontSize: '12px',
          fontWeight: 600,
          fontFamily: "Plus Jakarta Sans', sans-serif",
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} Visitors`,
      },
    },
    legend: {
      show: false,
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
    },
  };

  const series = [
    {
      name: t('visitor') || 'Visitors',
      data: chartData.values,
    },
  ];

  return (
    <>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        {title || t('top_visitor_purpose')}
      </Typography>
      <Box
        sx={{
          p: 0,
          borderRadius: 3,
          // border: '1px solid #d6d3d3ff',
          bgcolor: 'background.paper',
          boxShadow: 3,
          height: {
            xs: 420, // layar kecil → 420px
            lg: 400, // layar medium ke atas → 400px
          },
        }}
      >
        <ReactApexChart options={options} series={series} type="bar" height={370} />
      </Box>
    </>
  );
};

export default TopVisitingPurposeChart;
