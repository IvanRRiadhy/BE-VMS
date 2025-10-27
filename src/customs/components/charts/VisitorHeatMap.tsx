import { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HC_heatmap from 'highcharts/modules/heatmap';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getHeatmaps } from 'src/customs/api/admin';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import { t } from 'i18next';

// ✅ aktifkan modul heatmap
HC_heatmap(Highcharts);

const VisitorHeatMap = () => {
  const { token } = useSession();
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [hours, setHours] = useState<string[]>([]);

  const generateHourLabels = () =>
    Array.from({ length: 24 }, (_, i) => {
      const start = String(i).padStart(2, '0') + ':01';
      const end = String(i + 1).padStart(2, '0') + ':00';
      return `${start} - ${end}`;
    });

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 6);

        const res = await getHeatmaps(
          token!,
          start.toISOString().split('T')[0],
          end.toISOString().split('T')[0],
        );

        const collection = res.collection ?? [];
        if (collection.length > 0) {
          // ✅ langsung ambil label jam dari API
          const hourLabels = collection[0].hours.map((h: any) => h.hour);
          setHours(hourLabels);

          const data = collection.flatMap((d: any) =>
            d.hours.map((h: any, idx: number) => ({
              x: idx,
              y: d.day_of_week,
              value: h.count,
              color: h.count === 0 ? '#e5e7eb' : undefined,
            })),
          );
          setHeatmapData(data);
        }
      } catch (err) {
        console.error('Failed to fetch heatmaps:', err);
      }
    };

    if (token) fetchHeatmap();
  }, [token]);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const options: Highcharts.Options = {
    chart: {
      type: 'heatmap',
      marginTop: 40,
      marginBottom: 80,
      plotBorderWidth: 1,
    },
    title: { text: '' },
    xAxis: {
      categories: hours,
      labels: {
        rotation: -45,
        style: { fontSize: '9px' },
      },
      tickInterval: 1, // ✅ tampilkan semua label, bukan loncat-loncat
    },
    yAxis: [
      {
        categories: days,
        title: { text: '' }, // null bikin TS error, pakai string kosong
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
      // style: { fontSize: '16px', width: 150 },
    },
  };

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        {t('heatmap_visitor')}
      </Typography>

      <Box
        sx={{
          borderRadius: 3, // 4px
          overflow: 'hidden', // penting biar sudut chart ikut ke-clip
          boxShadow: 3, // opsional, biar ada bayangan
          // border: '1px solid #d6d3d3ff',
        }}
      >
        <HighchartsReact highcharts={Highcharts} options={options} />
      </Box>
    </>
  );
};

export default VisitorHeatMap;
