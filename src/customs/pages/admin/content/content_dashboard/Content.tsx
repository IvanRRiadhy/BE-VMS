import React, { useEffect, useState, useRef } from 'react';
import { Box, Button, Drawer, Grid2 as Grid, Typography } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Welcome from 'src/layouts/full/shared/welcome/Welcome';
import TopCards from './TopCards';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import TopVisitingPurposeChart from 'src/customs/components/charts/TopVisitingPurposeChart';
import TopVisitor from 'src/customs/components/charts/TopVisitor';
import VisitingTypeChart from 'src/customs/components/charts/VisitingTypeChart';
import VisitorFluctuationChart from 'src/customs/components/charts/VisitorFluctuationChart';
import VisitorHeatMap from '../../../../components/charts/VisitorHeatMap';
import AvarageDurationChart from 'src/customs/components/charts/AverageDurationChart';
import { IconCalendar, IconDownload } from '@tabler/icons-react';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getTodayPraregister } from 'src/customs/api/admin';
import { useTranslation } from 'react-i18next';
import Calendar from 'src/customs/components/calendar/Calendar';
import { addDays } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';

// Data journey visitor
const visitorJourney = [
  {
    id: 1,
    title: 'Arrived',
    description: 'Visitor entered building',
    time: '08:45',
    color: 'primary',
  },
  {
    id: 2,
    title: 'Check-in',
    description: 'Registered at front desk',
    time: '08:50',
    color: 'secondary',
  },
  { id: 3, title: 'Meeting', description: 'With HR Department', time: '09:15', color: 'success' },
  { id: 4, title: 'Check-out', description: 'Left the building', time: '11:30', color: 'error' },
];

const headMapData = [
  { id: 1, name: 'ABD GOFFAR', createdAt: '2025-06-12T08:30:00Z' },
  { id: 2, name: 'ILHAM MAULANA', createdAt: '2025-06-13T14:45:00Z' },
  { id: 3, name: 'ILHAM MAULANA', createdAt: '2025-06-13T14:30:00Z' },
  { id: 4, name: 'ABD GOFFAR', createdAt: '2025-06-14T08:10:00Z' },
  { id: 5, name: 'ABD GOFFAR', createdAt: '2025-06-14T08:50:00Z' },
];

const tableRowColumn = [
  {
    id: 1,
    Name: 'Andi Prasetyo',
    'Visit Time': '2025-06-13T09:00:00',
    Purpose: 'Meeting',
    'Purpose Person': 'Bapak Joko',
  },
  {
    id: 2,
    Name: 'Siti Aminah',
    'Visit Time': '2025-06-13T10:30:00',
    Purpose: 'Interview',
    'Purpose Person': 'Ibu Rina',
  },
  {
    id: 3,
    Name: 'Budi Santoso',
    'Visit Time': '2025-06-13T11:15:00',
    Purpose: 'Pengantaran Dokumen',
    'Purpose Person': 'Pak Dedi',
  },
  {
    id: 4,
    Name: 'Rina Marlina',
    'Visit Time': '2025-06-13T13:45:00',
    Purpose: 'Audit',
    'Purpose Person': 'Bu Intan',
  },
  {
    id: 5,
    Name: 'Fajar Nugroho',
    'Visit Time': '2025-06-13T15:00:00',
    Purpose: 'Maintenance',
    'purpose Person': 'Pak Wahyu',
  },
];

const Content = () => {
  const dispatch = useDispatch();
  // const { startDate, endDate, isManual } = useSelector((state: RootState) => state.dateRange);
  const { startDate, endDate, isManual } = useSelector((state: any) => state.dateRange);

  const { token } = useSession();
  const { t } = useTranslation();

  const [dataPraregist, setDataPraregist] = useState<any[]>([]);
  const exportRef = useRef<HTMLDivElement>(null);
  const handleExportPdf = async () => {
    if (!exportRef.current) return;

    const canvas = await html2canvas(exportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait, A4
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth - 20; // margin kiri kanan
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10; // margin atas pertama

    // Halaman pertama
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Halaman berikutnya
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save('dashboard.pdf');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getTodayPraregister(
          token!,
          new Date().toISOString().split('T')[0], // start-date
          new Date().toISOString().split('T')[0], // end-date
        );
        setDataPraregist(response.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [token]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(), // hari ini
      endDate: addDays(new Date(), 7), // 7 hari ke depan
      key: 'selection',
    },
  ]);

  return (
    <PageContainer title="Dashboard" description="this is Dashboard page">
      <Box>
        <Grid container spacing={3} alignItems="center" justifyContent="space-between" mb={1}>
          <Grid
            size={{ xs: 12, lg: 12 }}
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            gap={2}
            sx={{ mt: 2 }}
          >
            <Button
              size="small"
              sx={{
                backgroundColor: 'white',
                color: 'black',
                border: '1px solid #d1d1d1',
                ':hover': { backgroundColor: '#d1d1d1', color: 'black' },
              }}
              startIcon={<IconCalendar size={18} />}
              onClick={handleClick}
            >
              {`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}
            </Button>

            <Button size="small" variant="contained" color="error" startIcon={<IconDownload />}>
              Export
            </Button>

            <Drawer open={open} anchor="right" onClose={handleClose}>
              <Calendar
                onChange={(selection: any) => {
                  setDateRange([
                    {
                      startDate: selection.startDate,
                      endDate: selection.endDate,
                      key: 'selection',
                    },
                  ]);
                }}
              />
            </Drawer>
          </Grid>
        </Grid>

        <div ref={exportRef}>
          <Grid container spacing={3}>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCards token={token} />
            </Grid>
            {/* column */}
            <Grid container mt={1} size={{ xs: 12, lg: 12 }}>
              <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                <VisitingTypeChart />
              </Grid>
              <Grid size={{ xs: 12, md: 6, xl: 4 }}>
                <TopVisitingPurposeChart title="Top Visiting Purpose" />
              </Grid>

              <Grid size={{ xs: 12, md: 6, xl: 5 }}>
                <TopVisitor />
              </Grid>

              <Grid size={{ xs: 12, md: 6, lg: 6 }}>
                <AvarageDurationChart />
              </Grid>

              <Grid size={{ xs: 12, md: 6, lg: 6 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('visitor_praregist')}
                </Typography>
                <DynamicTable
                  height={420}
                  isHavePagination
                  overflowX={'auto'}
                  data={dataPraregist}
                  isHaveChecked={false}
                  isHaveAction={false}
                  isHaveSearch={false}
                  isHaveFilter={false}
                  isHaveExportPdf={false}
                  isHaveExportXlf={false}
                  isHaveHeaderTitle={true}
                  titleHeader=""
                  // defaultRowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[5, 10, 20, 50, 100]}
                  // onPaginationChange={(page, rowsPerPage) => {
                  //   setPage(page);
                  //   setRowsPerPage(rowsPerPage);
                  // }}
                  isHaveFilterDuration={false}
                  isHaveAddData={false}
                  isHaveHeader={false}
                  isHaveFilterMore={false}
                  // headerContent={{
                  //   title: 'Dashboard',
                  //   subTitle: 'Monitoring all visitor data',
                  //   items: [{ name: 'department' }, { name: 'employee' }, { name: 'project' }],
                  // }}
                  // onHeaderItemClick={(item) => {
                  //   console.log('Item diklik:', item.name);
                  // }}
                  // onCheckedChange={(selected) => console.log('Checked:', selected)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 6 }}>
                <VisitorFluctuationChart />
              </Grid>

              <Grid size={{ xs: 12, xl: 6 }}>
                {/* <Heatmap dataCreated={headMapData} title=" Visitors In This Week" /> */}
                <VisitorHeatMap />
              </Grid>
            </Grid>
          </Grid>
        </div>
        <Welcome />
      </Box>
    </PageContainer>
  );
};

export default Content;
