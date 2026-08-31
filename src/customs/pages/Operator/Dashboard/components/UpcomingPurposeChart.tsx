import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Card, CardContent, Typography } from '@mui/material';
interface UpcomingPurposeItem {
  id: string;
  name: string;
  count: number;
}

interface UpcomingPurposeChartProps {
  data: UpcomingPurposeItem[];
}

export default function UpcomingPurposeChart({ data }: UpcomingPurposeChartProps) {
  const labels = data.map((item) => item.name);
  const series = data.map((item) => item.count);

  const options: ApexOptions = {
    chart: {
      type: 'donut',
      toolbar: {
        show: false,
      },
    },
    labels,
    legend: {
      position: 'bottom',
      fontSize: '12px',
    },
    dataLabels: {
      enabled: true,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
        },
      },
    },
    tooltip: {
      y: {
        formatter: (value) => `${value} visitors`,
      },
    },
  };

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        boxShadow: '0px 2px 10px rgba(0,0,0,0.08)',
      }}
    >
      <CardContent sx={{ p: '5px !Important' }}>
        <Typography
          sx={{
            // fontSize: 16,
            fontWeight: 'bold',
            color: '#4A4A4A',

            mb: 3,
          }}
          variant="h6"
        >
          Upcoming Visit Purpose
        </Typography>

        {data.length > 0 ? (
          <Chart options={options} series={series} type="donut" height={300} />
        ) : (
          <Typography
            sx={{
              textAlign: 'center',
              color: '#999',
              py: 10,
            }}
          >
            No data available
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
