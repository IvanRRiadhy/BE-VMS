import React, { useEffect, useState, useRef } from 'react';
import { Box, Button, Drawer, Grid2 as Grid, Typography } from '@mui/material';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Welcome from 'src/layouts/full/shared/welcome/Welcome';
import TopCards from './TopCards';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import TopVisitingPurposeChart from 'src/customs/components/charts/TopVisitingPurposeChart';
import TopVisitor from 'src/customs/components/charts/TopVisitor';
import VisitingTypeChart from 'src/customs/components/charts/VisitingTypeChart';
import VisitorFluctuationChart from 'src/customs/components/charts/VisitorFluctuationChart';
import VisitorHeatMap from 'src/customs/components/charts/VisitorHeatMap';
import AvarageDurationChart from 'src/customs/components/charts/AverageDurationChart';
import {
  IconCalendar,
  IconCircleX,
  IconDownload,
  IconForbid2,
  IconHourglass,
  IconLogin,
  IconLogout,
  IconUsersGroup,
} from '@tabler/icons-react';
import Calendar from 'src/customs/components/calendar/Calendar';
import { useDispatch, useSelector } from 'react-redux';
import { setDateRange } from 'src/store/apps/Daterange/dateRangeSlice';
import { getTodayPraregister } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';

const Content = () => {
  const dispatch = useDispatch();
  // const { startDate, endDate, isManual } = useSelector((state: RootState) => state.dateRange);
  const { startDate, endDate } = useSelector((state: any) => state.dateRange);
  const { token } = useSession();

  const [dataPraregist, setDataPraregist] = useState<any[]>([]);
  const exportRef = useRef<HTMLDivElement>(null);
  const handleExportPdf = async () => {
    if (!exportRef.current) return;

    const canvas = await html2canvas(exportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth - 20; 
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10; 

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

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await getTodayPraregister(
  //         token as any,
  //         new Date().toISOString().split('T')[0],
  //         new Date().toISOString().split('T')[0],
  //       );
  //       setDataPraregist(response.data || []);
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     }
  //   };

  //   fetchData();
  // }, [token]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  // const [dateRange, setDateRange] = useState([
  //   {
  //     startDate: new Date(), // hari ini
  //     endDate: addDays(new Date(), 7), // 7 hari ke depan
  //     key: 'selection',
  //   },
  // ]);

  const CardItems = [
    { title: 'checkin', key: 'Checkin', icon: <IconLogin size={25} /> },
    { title: 'checkout', key: 'Checkout', icon: <IconLogout size={25} /> },
    { title: 'denied', key: 'Denied', icon: <IconCircleX size={25} /> },
    { title: 'block', key: 'Block', icon: <IconForbid2 size={25} /> },
    { title: 'waiting', key: 'waiting', icon: <IconHourglass size={25} /> },
    {
      title: 'blacklist',
      key: 'blacklist',
      icon: <IconUsersGroup size={22} />,
    },
  ];

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Dashboard" description="this is Dashboard page">
        <Box>
          <Grid container spacing={3} alignItems="center" justifyContent="space-between" mb={1}>
            <Grid
              size={{ xs: 12, lg: 12 }}
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              gap={2}
              sx={{ mt: 0.5 }}
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

              <Button
                size="small"
                variant="contained"
                color="error"
                startIcon={<IconDownload />}
                onClick={handleExportPdf}
              >
                Export
              </Button>

              <Drawer open={open} anchor="right" onClose={handleClose}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" mb={1}>
                    Select Date Range
                  </Typography>
                  <Calendar
                    value={{ startDate, endDate }}
                    onChange={(selection: any) => {
                      dispatch(
                        setDateRange({
                          startDate: selection.startDate,
                          endDate: selection.endDate,
                        }),
                      );
                      handleClose();
                    }}
                  />
                </Box>
              </Drawer>
            </Grid>
          </Grid>

          <div ref={exportRef}>
            <Grid container spacing={2}>
              {/* column */}
              <Grid size={{ xs: 12, lg: 12 }}>
                <TopCards items={CardItems} size={{ xs: 12, sm: 6, md: 4, xl: 2 }} />
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
                    titleHeader="Pre-Registration Visitor List"
                    // defaultRowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[10, 20, 50, 100]}
                    // onPaginationChange={(page, rowsPerPage) => {
                    //   setPage(page);
                    //   setRowsPerPage(rowsPerPage);
                    // }}
                    isHaveFilterDuration={false}
                    isHaveAddData={false}
                    isHaveHeader={false}
                    isHaveFilterMore={false}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 6 }}>
                  <VisitorFluctuationChart />
                </Grid>

                <Grid size={{ xs: 12, xl: 6 }}>
                  <VisitorHeatMap />
                </Grid>
              </Grid>
            </Grid>
          </div>
          <Welcome />
        </Box>
      </Container>
    </PageContainer>
  );
};

export default Content;
