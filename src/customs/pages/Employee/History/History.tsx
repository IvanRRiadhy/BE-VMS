import { Grid2 as Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { IconHistory, IconScript } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { getHistory } from 'src/customs/api/visitor';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
dayjs.extend(utc);
dayjs.extend(timezone);

const History = () => {
  const cards = [
    {
      title: 'Total History',
      subTitle: `0`,
      subTitleSetting: 10,
      icon: IconHistory,
      color: 'none',
    },
  ];

  const { token } = useSession();
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({
    site_id: '',
  });

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const start_date = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
        const end_date = dayjs().add(0, 'day').format('YYYY-MM-DD');

        const res = await getHistory(token as string, start_date, end_date, filters.site_id ?? '');
        const rows = res.collection.map((item: any) => {
          return {
            id: item.id,
            name: item.visitor?.name || '-',
            agenda: item.agenda || '-',
            site: item.site_place_name || '-',
            visitor_status: item.visitor_status || '-',
            // invitation_code: item.invitation_code || '-',
            vehicle_type: item.vehicle_type || '-',
            vehicle_plate_number: item.vehicle_plate_number || '-',
            host: item.host_name || item.host || '-',
            visitor_period_start: item.visitor_period_start || '-',
            visitor_period_end: formatDateTime(item.visitor_period_end, item.extend_visitor_period),
          };
        });
        setHistoryData(rows ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchData();
  }, [token]);

  return (
    <PageContainer title="History" description="History page">
      <Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 12 }}>
            <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
          </Grid>
          <Grid size={{ xs: 12, lg: 12 }}>
            <DynamicTable
              overflowX={'auto'}
              data={historyData}
              isHavePagination={true}
              // selectedRows={selectedRows}
              // defaultRowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10, 20, 100]}
              // onPaginationChange={(page, rowsPerPage) => {
              //   setPage(page);
              //   setRowsPerPage(rowsPerPage);
              // }}
              isHaveChecked={true}
              isHaveAction={true}
              isHaveSearch={true}
              isHaveFilter={false}
              isHaveExportPdf={false}
              isHaveExportXlf={false}
              isHaveFilterDuration={false}
              isHaveAddData={false}
              isHaveFilterMore={false}
              isHaveHeader={false}
              isHavePdf={true}
            />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default History;
