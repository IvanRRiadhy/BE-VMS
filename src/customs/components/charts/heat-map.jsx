import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

// ✅ aktifkan modul heatmap (WAJIB sebelum dipakai)
import HC_heatmap from 'highcharts/modules/heatmap';
HC_heatmap(Highcharts);

const VisitorHeatMap = ({ apiData }) => {
  // bikin axis dari API
  const hours = apiData[0]?.hours.map((h) => h.hour) ?? [];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // mapping data jadi [x, y, value]
  const heatmapData = apiData.flatMap((d) =>
    d.hours.map((h, idx) => [idx, d.day_of_week, h.count]),
  );

  const options = {
    chart: {
      type: 'heatmap',
      marginTop: 40,
      marginBottom: 80,
      plotBorderWidth: 1,
    },
    title: { text: 'Visitor Heatmap (per day & hour)' },
    xAxis: {
      categories: hours,
      labels: { rotation: -45 },
    },
    yAxis: {
      categories: days,
      title: null,
      reversed: true,
    },
    colorAxis: {
      min: 0,
      minColor: '#FFFFFF',
      maxColor: Highcharts.getOptions().colors[0],
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
        name: 'Visitor count',
        borderWidth: 1,
        data: heatmapData,
        dataLabels: {
          enabled: true,
          color: '#000',
        },
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default VisitorHeatMap;
