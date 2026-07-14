import { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HC_heatmap from 'highcharts/modules/heatmap';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getHeatmaps } from 'src/customs/api/admin';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import { t } from 'i18next';
import { useSelector } from 'react-redux';

HC_heatmap(Highcharts);

const VisitorHeatMap = () => {
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [hours, setHours] = useState<string[]>([]);
  const { startDate, endDate } = useSelector((state: any) => state.dateRange);

  const start = startDate?.toISOString().split('T')[0];
  const end = endDate?.toISOString().split('T')[0];

  const shiftHourRange = (range: string, offset: number) => {
    const [start, end] = range.split('-');

    const shift = (time: string) => {
      const hour = parseInt(time.split(':')[0], 10);
      const shifted = (hour + offset + 24) % 24;
      return `${shifted.toString().padStart(2, '0')}:00`;
    };

    return `${shift(start)}-${shift(end)}`;
  };

  const convertUtcHoursToLocal = (hours: any[], offset: number) => {
    const localHours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00-${((i + 1) % 24).toString().padStart(2, '0')}:00`,
      count: 0,
    }));

    hours.forEach((h) => {
      const utcHour = parseInt(h.hour.split(':')[0], 10);

      const localHour = (utcHour + offset + 24) % 24;

      localHours[localHour].count = h.count;
    });

    return localHours;
  };

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const res = await getHeatmaps(start, end);

        const collection = res.collection ?? [];
        if (collection.length > 0) {
          // const hourLabels = collection[0].hours.map((h: any) => h.hour);
          const transformedCollection = collection.map((d: any) => ({
            ...d,
            hours: convertUtcHoursToLocal(d.hours, 7),
          }));

          const hourLabels = transformedCollection[0].hours.map((h: any) => h.hour);
          setHours(hourLabels);

          const data = transformedCollection.flatMap((d: any) =>
            d.hours.map((h: any, idx: number) => ({
              x: idx,
              y: d.day_of_week,
              value: h.count,
              color: h.count === 0 ? '#e5e7eb' : undefined,
            })),
          );
          setHeatmapData(data);
        }
      } catch (err) {}
    };

    fetchHeatmap();
  }, [start, end]);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const options: Highcharts.Options = {
    chart: {
      type: 'heatmap',
      marginTop: 20,
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
      // style: { fontSize: '16px', width: 150 },
    },
  };

  return (
    <>
      <Box
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: 3,
          // border: '1px solid #d6d3d3ff',
          height: 420,
          backgroundColor: '#fff',
        }}
      >
        <Typography variant="h5" sx={{ mb: 0, fontWeight: 600, pt: 2, pl: 2 }}>
          {t('heatmap_visitor')}
        </Typography>
        <HighchartsReact highcharts={Highcharts} options={options} />
      </Box>
    </>
  );
};

export default VisitorHeatMap;
