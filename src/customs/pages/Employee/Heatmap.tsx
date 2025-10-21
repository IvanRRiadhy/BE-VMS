import { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HC_heatmap from 'highcharts/modules/heatmap';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import { t } from 'i18next';

// ✅ aktifkan modul heatmap
HC_heatmap(Highcharts);

const Heatmap = () => {
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [hours, setHours] = useState<string[]>([]);

  const generateHourLabels = () =>
    Array.from({ length: 24 }, (_, i) => {
      const start = String(i).padStart(2, '0') + ':01';
      const end = String(i + 1).padStart(2, '0') + ':00';
      return `${start} - ${end}`;
    });

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // ✅ Dummy data (x = jam, y = hari, value = jumlah pengunjung)
  useEffect(() => {
    setHours(generateHourLabels());

    const dummy: any[] = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const value = Math.floor(Math.random() * 30); // acak 0–30 pengunjung
        dummy.push([hour, day, value]);
      }
    }

    setHeatmapData(dummy);
  }, []);

  const options: Highcharts.Options = {
    chart: {
      type: 'heatmap',
      marginTop: 40,
      marginBottom: 80,
      plotBorderWidth: 1,
    },

    title: { text: 'Heatmap', align: 'center' },

    xAxis: {
      categories: hours,
      labels: {
        rotation: -45,
        style: { fontSize: '9px' },
      },
      tickInterval: 1,
    },
    yAxis: [
      {
        categories: days,
        title: { text: '' },
        reversed: true,
      },
    ],
    colorAxis: {
      min: 0,
      minColor: '#FFFFFF',
      maxColor: Highcharts.getOptions().colors?.[0],
    },
    legend: {
      align: 'right',
      layout: 'vertical',
      verticalAlign: 'top',
      y: 25,
      symbolHeight: 280,
    },
    series: [
      {
        type: 'heatmap',
        name: 'Visitor Count',
        borderWidth: 1,
        data: heatmapData,
        nullColor: '#EFEFEF',
        dataLabels: {
          enabled: true,
          color: '#000',
          style: {
            fontSize: '9px',
            textOutline: 'none',
          },
        },
      },
    ],
    tooltip: {
      formatter: function () {
        const hour = this.series.xAxis.categories[this.point.x];
        const day = this.series.yAxis.categories[this.point.y as number];
        return `There are <b>${this.point.value}</b> visitors<br/>at <b>${hour}</b><br/>on <b>${day}</b>`;
      },
    },
  };

  return (
    <>
      <Box
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: 3,
          border: '1px solid #d6d3d3ff',
          height: '100%',
        }}
      >
        <HighchartsReact highcharts={Highcharts} options={options} />
      </Box>
    </>
  );
};

export default Heatmap;
