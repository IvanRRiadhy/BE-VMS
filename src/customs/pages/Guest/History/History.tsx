import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
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
  const cards = [
    {
      title: 'Total History',
      subTitle: `${historyData.length}`,
      subTitleSetting: 10,
      icon: IconHistory,
      color: 'none',
    },
  ];
  const [tableData, setTableData] = useState<[]>([]);
  const [agenda, setAgenda] = useState('');

  const tableDataHistory = [
    {
      id: 1,
      name: 'Kunjungan',
      phone: '081234567890',
      registered_site: 'Gedung A',
      day: 'Mon, 14 Jul 2025 09:00 AM',
    },
  ];

  const handleAdd = () => {
    setOpenDialog(true);
  };

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
        // hitung tanggal
        const start_date = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
        const end_date = dayjs().add(0, 'day').format('YYYY-MM-DD'); 

        // if (isDataReady) {
        const res = await getHistory(token as string, start_date, end_date, filters.site_id ?? '');
        setHistoryData(res?.collection ?? []);
        // }
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
  }, [token, refreshTrigger]);

  // useEffect(() => {
  //   if (!token) return;
  //   const fetchSites = async () => {
  //     const res = await getListSite(token as string); // misalnya endpoint: /site/list
  //     setSiteOptions(res?.collection ?? []);
  //   };

  //   fetchSites();
  // }, [token]);

  return (
    <>
      <PageContainer title="History" description="History Page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              {/* {isDataReady ? ( */}
              <DynamicTable
                overflowX={'auto'}
                data={historyData}
                isHavePagination={true}
                selectedRows={selectedRows}
                // defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 20]}
                // onPaginationChange={(page, rowsPerPage) => {
                //   setPage(page);
                //   setRowsPerPage(rowsPerPage);
                // }}
                isHaveChecked={true}
                isHaveAction={false}
                isHaveSearch={true}
                isHaveFilter={false}
                isHaveExportPdf={false}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                isHaveAddData={false}
                isHaveFilterMore={true}
                isHaveHeader={false}
                isHavePdf={true}
                filterMoreContent={
                  <FilterMoreContent
                    filters={filters}
                    setFilters={setFilters}
                    onApplyFilter={handleApplyFilter}
                    siteOptions={siteOptions}
                  />
                }
                // onCheckedChange={(selected) => setSelectedRows(selected)}
                // onEdit={(row) => {
                //   handleEdit(row.id);
                //   setEdittingId(row.id);
                // }}
                // onDelete={(row) => handleDelete(row.id)}
                // onBatchDelete={handleBatchDelete}
                // onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                // onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                // onAddData={() => {
                //   handleAdd();
                // }}
              />
              {/* ) : (
                <Card sx={{ width: '100%' }}>
                  <Skeleton />
                  <Skeleton animation="wave" />
                  <Skeleton animation={false} />
                </Card>
              )} */}
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
    </>
  );
};

export default History;
