import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { Card, CardContent, Typography, Box, CardHeader } from '@mui/material';

const visitorStatusData = [
  { id: 0, value: 25, label: 'Visitor', color: '#4caf50' },
  { id: 1, value: 25, label: 'Employee', color: '#2196f3' },
  { id: 2, value: 25, label: 'Staff', color: '#f44336' },
];

export default function PieChartsEmployee({ title }: any) {
  const totalVisits = visitorStatusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
      <CardHeader title={title} />

      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Wrapper Chart */}
        <Box
          sx={{
            width: 350,
            height: 250,
            position: 'relative',
          }}
        >
          <PieChart
            series={[
              {
                data: visitorStatusData,
                innerRadius: 70,
                outerRadius: 100,
              },
            ]}
            height={250}
            margin={{ top: 10, bottom: 20, left: 30, right: 30 }}
            slotProps={{ legend: { hidden: true } }}
          />

          {/* Text Tengah */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <Typography variant="h4" fontWeight={700} lineHeight={1}>
              {totalVisits}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Visits
            </Typography>
          </Box>
        </Box>

        {/* Custom Legend */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            mt: 0,
            gap: 2,
          }}
        >
          {visitorStatusData.map((item) => (
            <Box
              key={item.label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  bgcolor: item.color,
                  border: '2px solid #fff',
                  boxShadow: 1,
                }}
              />

              <Typography variant="body2">{item.label}</Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
