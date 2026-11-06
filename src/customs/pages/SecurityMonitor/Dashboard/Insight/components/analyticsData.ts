// components/analytics/analyticsData.ts

export const summaryStats = [
  {
    title: 'Total Kunjungan',
    value: '12.480',
    change: '+8,6%',
    note: 'vs. 01 – 31 Okt 2026',
    icon: 'person',
    color: '#2878e5',
  },
  {
    title: 'Total Pengunjung (Unik)',
    value: '9.732',
    change: '+7,9%',
    icon: 'groups',
    color: '#2878e5',
  },
  {
    title: 'Kunjungan dengan Kendaraan',
    value: '7.286',
    change: '+10,2%',
    note: '(58,4% dari kunjungan)',
    icon: 'car',
    color: '#2878e5',
  },
  {
    title: 'Butuh Parkir',
    value: '5.014',
    change: '+12,7%',
    note: '(40,2% dari kunjungan)',
    icon: 'parking',
    color: '#2878e5',
  },
  {
    title: 'Butuh Extend',
    value: '384',
    change: '+5,5%',
    note: '(3,1% dari kunjungan)',
    icon: 'clock',
    color: '#405cc7',
  },
  {
    title: 'Kena Alarm',
    value: '126',
    change: '+16,7%',
    note: '(1,0% dari kunjungan)',
    icon: 'alert',
    color: '#df3c45',
  },
];

export const siteData = [
  { name: 'Head Office', value: 4982, percent: '39,9%' },
  { name: 'Site A', value: 2364, percent: '18,9%' },
  { name: 'Site B', value: 1987, percent: '15,9%' },
  { name: 'Site C', value: 1256, percent: '10,1%' },
  { name: 'Site D', value: 1013, percent: '8,1%' },
  { name: 'Site Lainnya', value: 878, percent: '7,0%' },
];

export const visitorTypeData = [
  { name: 'Tamu (Visitor)', value: 6240, color: '#2583ed' },
  { name: 'Vendor', value: 2496, color: '#42b65b' },
  { name: 'Kontraktor', value: 1248, color: '#f4c431' },
  { name: 'Pekerja Sementara', value: 936, color: '#a45be5' },
  { name: 'Lainnya', value: 1560, color: '#cbd2df' },
];

export const dailyData = [
  { day: 'Sen', value: 2140 },
  { day: 'Sel', value: 2280 },
  { day: 'Rab', value: 2356 },
  { day: 'Kam', value: 2202 },
  { day: 'Jum', value: 2168 },
  { day: 'Sab', value: 792 },
  { day: 'Min', value: 542 },
];

export const vehicleData = [
  { name: 'Mobil', value: '4.372', percent: '60,0%', icon: 'car' },
  { name: 'Motor', value: '2.496', percent: '34,2%', icon: 'motorcycle' },
  { name: 'Truk', value: '288', percent: '4,0%', icon: 'truck' },
  { name: 'Bus', value: '116', percent: '1,6%', icon: 'bus' },
  { name: 'Lainnya', value: '14', percent: '0,2%', icon: 'vehicle' },
];

export const alarmData = [
  { name: 'Daftar Hitam (Blacklist)', value: 48, percent: '38,1%' },
  { name: 'Akses Tidak Valid', value: 24, percent: '19,0%' },
  { name: 'Area Terlarang', value: 18, percent: '14,3%' },
  { name: 'Masa Berlaku Habis', value: 16, percent: '12,7%' },
  { name: 'Lainnya', value: 20, percent: '15,9%' },
];

export const monthlyTrend = [
  { month: 'Jun 2026', visits: 6900, vehicles: 4100, parking: 2800, alarm: 90, extend: 250 },
  { month: 'Jul 2026', visits: 8200, vehicles: 5000, parking: 3400, alarm: 98, extend: 290 },
  { month: 'Agt 2026', visits: 9500, vehicles: 5800, parking: 3900, alarm: 105, extend: 320 },
  { month: 'Sep 2026', visits: 10400, vehicles: 6600, parking: 4400, alarm: 112, extend: 340 },
  { month: 'Okt 2026', visits: 11482, vehicles: 6607, parking: 4449, alarm: 108, extend: 364 },
  { month: 'Nov 2026', visits: 12480, vehicles: 7286, parking: 5014, alarm: 126, extend: 384 },
];

export const growthRows = [
  { label: 'Total Kunjungan', oct: '11.482', nov: '12.480', change: '+8,6%', icon: 'person' },
  { label: 'Kendaraan', oct: '6.607', nov: '7.286', change: '+10,2%', icon: 'car' },
  { label: 'Butuh Parkir', oct: '4.449', nov: '5.014', change: '+12,7%', icon: 'parking' },
  { label: 'Extend', oct: '364', nov: '384', change: '+5,5%', icon: 'clock' },
  { label: 'Kena Alarm', oct: '108', nov: '126', change: '+16,7%', icon: 'alert', negative: true },
];
