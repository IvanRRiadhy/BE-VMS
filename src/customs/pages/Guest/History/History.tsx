import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid2 as Grid,
  Skeleton,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  Autocomplete,
  Divider,
  IconButton,
} from '@mui/material';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);
import PageContainer from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { IconHistory, IconMail, IconX } from '@tabler/icons-react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomRadio from 'src/components/forms/theme-elements/CustomRadio';
import FilterMoreContent from './FilterMoreContent';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getHistory, getListSite } from 'src/customs/api/visitor';
import { getAllSite } from 'src/customs/api/admin';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
// import FilterMoreContent from './Invitation/FilterMoreContent';
const History = () => {
  const { token } = useSession();
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [edittingId, setEdittingId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const cards = [
    {
      title: 'Total History',
      subTitle: `${historyData.length}`,
      subTitleSetting: 10,
      icon: IconHistory,
      color: 'none',
    },
  ];

  const [filters, setFilters] = useState<any>({
    site_id: '',
  });

  const [siteOptions, setSiteOptions] = useState<any[]>([]);

  const handleApplyFilter = () => {
    setPage(0);
    setRefreshTrigger((prev) => prev + 1);
  };

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
    <>
      <PageContainer title="History" description="History Page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={loading}
                overflowX={'auto'}
                data={historyData}
                isHavePagination={false}
                selectedRows={selectedRows}
                isHaveChecked={false}
                isHaveAction={false}
                isHaveSearch={false}
                isHaveHeaderTitle={true}
                titleHeader='History'
                isHaveFilter={false}
                isHaveExportPdf={false}
                isHavePeriod={true}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                isHaveAddData={false}
                isHaveFilterMore={false}
                isHaveHeader={false}
                isHavePdf={false}
              />
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
    </>
  );
};

export default History;
