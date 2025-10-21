import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { Card, CardContent, Typography, Box, CardHeader } from '@mui/material';

const visitorStatusData = [
  { id: 0, value: 10, label: 'Checked In', color: '#4caf50' },
  { id: 1, value: 5, label: 'Checked Out', color: '#2196f3' },
  { id: 2, value: 2, label: 'Denied', color: '#f44336' },
];

export default function OperatorPieChart() {
  return (
    <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
      <CardHeader title="Visitor Status" />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
       
        <Box sx={{ width: 350 }}>
          <PieChart
            series={[
              {
                data: visitorStatusData,
                innerRadius: 50,
                outerRadius: 100,
              },
            ]}
            height={264}
            margin={{ top: 10, bottom: 20, left: 30, right: 30 }}
            // 🚫 matikan legend default
            slotProps={{ legend: { hidden: true } }}
          />
        </Box>

        {/* 🔥 Custom Legend */}
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
            <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  bgcolor: item.color,
                  border: '2px solid #fff', // biar lebih clean
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
