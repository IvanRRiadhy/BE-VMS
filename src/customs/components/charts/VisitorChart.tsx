import { LineChart } from '@mui/x-charts/LineChart';
import { Box, Typography } from '@mui/material';

const VisitorChart = () => {
  const xLabels = ['10am', '11am', '12pm', '01pm', '02pm', '03pm', '04pm', '05pm', '06pm', '07pm'];
  const yValues = [55, 30, 65, 50, 85, 45, 60, 35, 58, 75];

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: 'background.paper',
        boxShadow: 3,
        height: '400px',
      }}
    >
      {/* Definisikan gradient sekali di atas */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="gradientLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="gradientFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Visitors
      </Typography>

      <LineChart
        xAxis={[{ scaleType: 'point', data: xLabels }]}
        series={[
          {
            data: yValues,
            area: true,
            showMark: false,
            curve: 'monotoneX',
            color: '#3b82f6', // dummy, ditimpa gradient
          },
        ]}
        height={300}
        margin={{ top: 20, bottom: 40, left: 50, right: 20 }}
        sx={{
          '& .MuiLineElement-root': {
            stroke: 'url(#gradientLine)',
            strokeWidth: 3,
          },
          '& .MuiAreaElement-root': {
            fill: 'url(#gradientFill)',
          },
          // Axis style
          '& .MuiChartsAxis-root': {
            color: '#6b7280', // abu-abu elegan (Tailwind gray-500)
          },
          '& .MuiChartsAxis-tickLabel': {
            fontSize: 12,
            fontWeight: 500,
            fill: '#374151', // abu-abu tua, lebih readable
          },
          '& .MuiChartsAxis-line': {
            stroke: '#e5e7eb', // garis axis lebih soft
          },
          '& .MuiChartsAxis-tick': {
            stroke: '#9ca3af', // warna tick
          },
        }}
      />
    </Box>
  );
};

export default VisitorChart;
