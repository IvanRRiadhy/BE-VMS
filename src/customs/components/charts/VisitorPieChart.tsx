import { PieChart } from '@mui/x-charts/PieChart';
import { Box, GlobalStyles, Typography } from '@mui/material';

const VisitorPieChart = () => {
  const totalLimit = 2000;
  const usage = 5; // contoh: hanya 3 terpakai
  const remaining = totalLimit - usage;

  const chartData = [
    { label: 'Usage', value: usage, color: '#2563eb' }, // biru
    { label: 'Remaining Quota', value: remaining, color: '#e5f0ff' }, // biru muda
  ];

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Visitor Limit per Month
      </Typography>

      <Box
        sx={{
          p: 2,
          borderRadius: 3,
          bgcolor: 'background.paper',
          boxShadow: 3,
          height: '400px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <GlobalStyles
          styles={{
            '.MuiChartsLegend-mark': {
              borderRadius: '50% !important', // bikin bulat
            },
          }}
        />

        <Box sx={{ position: 'relative' }}>
          <PieChart
            series={[
              {
                data: chartData.map((d, i) => ({
                  id: i,
                  value: d.value,
                  label: d.label,
                  color: d.color,
                })),
                innerRadius: 90,
                outerRadius: 120,
                highlightScope: { faded: 'none', highlighted: 'none' },
                faded: { additionalRadius: -5, color: '#f3f4f6' },
              },
            ]}
            height={300}
            margin={{ top: 20, bottom: 60, left: 20, right: 20 }}
            slotProps={{
              legend: {
                hidden: true,
                // direction: 'row',
                // position: { vertical: 'bottom', horizontal: 'middle' },
                // itemMarkWidth: 14, // lebar marker
                // itemMarkHeight: 14, // tinggi marker
              },
            }}
          />

          {/* angka di dalam atas */}
          <Box
            sx={{
              position: 'absolute',
              top: '75%',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" fontWeight={700} color="text.primary">
              {remaining}
            </Typography>
          </Box>

          {/* angka di dalam bawah */}
          <Box
            sx={{
              position: 'absolute',
              bottom: '88%',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" fontWeight={700} color="text.primary">
              {usage}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: -2,
              gap: 1,
            }}
          >
            {chartData.map((item) => (
              <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%', // bulat
                    bgcolor: item.color,
                  }}
                />
                <Typography variant="body2">{item.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default VisitorPieChart;
