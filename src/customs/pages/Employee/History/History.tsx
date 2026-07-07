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
import FilterMoreContent from './FilterMoreContent';
dayjs.extend(utc);
dayjs.extend(timezone);

const History = () => {
  const { token } = useSession();
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const[rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<any>({
    start_date: '',
    end_date: '',
  });
  const cards = [
    {
      title: 'Total History',
      subTitle: `${historyData.length}`,
      subTitleSetting: 10,
      icon: IconHistory,
      color: 'none',
    },
  ];

  const fetchHistory = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);

      const start_date = startDate || dayjs().subtract(7, 'day').format('YYYY-MM-DD');

      const end_date = endDate || dayjs().format('YYYY-MM-DD');

      const res = await getHistory(token as string, start_date, end_date, '');

      const rows = res.collection.map((item: any) => ({
        id: item.id,
        name: item.visitor?.name || '-',
        agenda: item.agenda || '-',
        site: item.site_place_name || '-',
        vehicle_type: item.vehicle_type || '-',
        vehicle_plate_number: item.vehicle_plate_number || '-',
        host: item.host_name || item.host || '-',
        visitor_period_start: formatDateTime(item.visitor_period_start || '-'),
        visitor_period_end: formatDateTime(item.visitor_period_end, item.extend_visitor_period),
        visitor_status: item.visitor_status || '-',
      }));

      setHistoryData(rows);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    fetchHistory();
  }, [token]);

  const handleApplyFilter = () => {
    fetchHistory(filters.start_date, filters.end_date);
  };

  const handleResetFilter = () => {
    setFilters({
      start_date: '',
      end_date: '',
    });

    fetchHistory();
  };

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
              defaultRowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10, 50, 100]}
              // onPaginationChange={(page, rowsPerPage) => {
              //   setPage(page);
              //   setRowsPerPage(rowsPerPage);
              // }}
              isHaveHeaderTitle
              titleHeader="History"
              isHaveChecked={true}
              isNoActionTableHead
              isHaveFilterMore={true}
              filterMoreContent={
                <FilterMoreContent
                  filters={filters}
                  setFilters={setFilters}
                  onApplyFilter={handleApplyFilter}
                  onResetFilter={handleResetFilter}
                />
              }
            />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default History;
