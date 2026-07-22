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
  IconCircleMinus,
  IconDownload,
  IconHourglass,
  IconLogin,
  IconLogout,
  IconUsersGroup,
  IconX,
} from '@tabler/icons-react';
import Calendar from 'src/customs/components/calendar/Calendar';
import { useDispatch, useSelector } from 'react-redux';
import { setDateRange } from 'src/store/apps/Daterange/dateRangeSlice';
import { getTodayPraregister } from 'src/customs/api/admin';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import { showSwal } from 'src/customs/components/alerts/alerts';
import dayjs from 'dayjs';

const Content = () => {
  const dispatch = useDispatch();
  const { startDate, endDate } = useSelector((state: any) => state.dateRange);
  const [dataPraregist, setDataPraregist] = useState<any[]>([]);
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    if (!exportRef.current || isExporting) return;

    try {
      setIsExporting(true);
      await new Promise((resolve) => setTimeout(resolve, 0));

      const canvas = await html2canvas(exportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/jpeg');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const formatDate = (date: Date) => date.toISOString().split('T')[0];
      const start = formatDate(startDate);
      const end = formatDate(endDate);

      pdf.save(`Dashboard Report-${start}_to_${end}.pdf`);
    } catch (err) {
      showSwal('error', 'Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getTodayPraregister(
  
          dayjs(startDate).format('YYYY-MM-DD'),
          dayjs(endDate).format('YYYY-MM-DD'),
        );
        const rows = response.collection
          .sort(
            (a: any, b: any) =>
              new Date(b.invitation_created_at).getTime() -
              new Date(a.invitation_created_at).getTime(),
          )
          .slice(0, 5)
          .map((item: any) => ({
            id: item.id,
            name: item.visitor_name,
            host: item.host_name,
            visit_start: formatDateTime(item.visitor_period_start),
            visit_end: formatDateTime(item.visitor_period_end, item.extend_visitor_period),
          }));
        setDataPraregist(rows || []);
      } catch (error) {}
    };

    fetchData();
  }, []);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  const CardItems = [
    { title: 'checkin', key: 'Checkin', icon: <IconLogin size={25} /> },
    { title: 'checkout', key: 'Checkout', icon: <IconLogout size={25} /> },
    { title: 'denied', key: 'Denied', icon: <IconX size={25} /> },
    { title: 'block', key: 'Block', icon: <IconCircleMinus size={25} /> },
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
                disabled={isExporting}
              >
                {isExporting ? 'Exporting...' : 'Export'}
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
              <Grid size={{ xs: 12, lg: 12 }}>
                <TopCards items={CardItems} size={{ xs: 12, sm: 6, md: 4, xl: 2 }} />
              </Grid>
              <Grid container mt={1} size={{ xs: 12, lg: 12 }}>
                <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                  <VisitingTypeChart />
                </Grid>
                <Grid size={{ xs: 12, md: 6, xl: 4 }}>
                  <TopVisitingPurposeChart />
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
                    isHavePagination={false}
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
