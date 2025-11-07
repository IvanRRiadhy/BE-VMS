import { useEffect, useState } from 'react';
import { Box, Card, Skeleton, Grid2 as Grid } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';

import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import { deleteBrand, getAllBrandPagination } from 'src/customs/api/admin';
import { CreateBrandRequest, Item } from 'src/customs/api/models/Admin/Brand';

import { IconBrandMedium } from '@tabler/icons-react';
import {
  showConfirmDelete,
  showErrorAlert,
  showSuccessAlert,
} from 'src/customs/components/alerts/alerts';
const Content = () => {
  const [tableData, setTableData] = useState<Item[]>([]);
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const { token } = useSession();
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [edittingId, setEdittingId] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [formDataAddBrand, setFormDataAddBrand] = useState<CreateBrandRequest>(() => {
    const saved = localStorage.getItem('unsavedBrandData');
    return saved ? JSON.parse(saved) : {};
  });
  const cards = [
    {
      title: 'Total Brand',
      subTitle: `${tableData.length}`,
      subTitleSetting: 10,
      icon: IconBrandMedium,
      color: 'none',
    },
  ];
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const start = page * rowsPerPage;
        const response = await getAllBrandPagination(
          token,
          start,
          rowsPerPage,
          sortColumn,
          searchKeyword,
        );
        setTableData(response.collection);
        setTotalRecords(response.collection.length);
        setIsDataReady(true);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, page, rowsPerPage, sortColumn, refreshTrigger, searchKeyword]);

  useEffect(() => {
    localStorage.setItem('unsavedBrandData', JSON.stringify(formDataAddBrand));
  }, [formDataAddBrand]);

  const handleBatchDelete = async (rows: Item[]) => {
    if (!token || rows.length === 0) return;

    const confirmed = await showConfirmDelete(
      `Are you sure to delete ${rows.length} items?`,
      "You won't be able to revert this!",
    );

    if (confirmed) {
      setLoading(true);
      try {
        await Promise.all(rows.map((row) => deleteBrand(row.id, token)));
        setRefreshTrigger((prev) => prev + 1);
        showSuccessAlert('Deleted!', `${rows.length} items have been deleted.`);
        setSelectedRows([]);
      } catch (error) {
        console.error(error);
        showErrorAlert('Error!', 'Failed to delete some items.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <PageContainer title="Brand" description="Brand page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              {/* {isDataReady ? ( */}
                <DynamicTable
                loading={loading}
                  overflowX={'auto'}
                  data={tableData}
                  selectedRows={selectedRows}
                  isHaveChecked={true}
                  isHaveSearch={true}
                  isHaveFilter={false}
                  isHaveExportPdf={false}
                  isHaveExportXlf={false}
                  isHaveFilterDuration={false}
                  isHaveFilterMore={false}
                  isHaveHeader={false}
                  onCheckedChange={(selected) => setSelectedRows(selected)}
                  onBatchDelete={handleBatchDelete}
                  onSearchKeywordChange={(searchKeyword) => setSearchKeyword(searchKeyword)}
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

export default Content;
