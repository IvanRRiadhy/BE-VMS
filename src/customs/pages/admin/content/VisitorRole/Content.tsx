import { useCallback, useEffect, useState } from 'react';
import { Backdrop, Box, CircularProgress, Grid2 as Grid, Portal } from '@mui/material';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';

import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import { IconBrandMedium } from '@tabler/icons-react';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import { getVisitorRoleByDt, updateVisitorRole } from 'src/customs/api/Admin/VisitorRole';
import FilterMoreContent from './components/FilterMoreContent';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
const Content = () => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const { token } = useSession();
  const [totalRecords, setTotalRecords] = useState(0);
  // const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // const [searchKeyword, setSearchKeyword] = useState('');
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const [searchInput, setSearchInput] = useState('');
  const [sortDir, setSortDir] = useState('desc');
  const cards = [
    {
      title: 'Total Visitor Role',
      subTitle: `${totalRecords}`,
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
        const response = await getVisitorRoleByDt(
          token,
          start,
          rowsPerPage,
          sortDir,
          search,
        );
        setTableData(response.collection);
        setTotalRecords(response.collection.length);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, page, rowsPerPage, refreshTrigger, search]);

  const handleSearchKeywordChange = useCallback((keyword: string) => {
    setSearchInput(keyword);
  }, []);

 const handleSearch = useCallback(
   (keyword: string) => {
     setPage(0);
     setSearch(keyword);
   },
   [setPage, setSearch],
 );

  const [loadingAction, setLoadingAction] = useState(false);

  const handleActiveToggle = async (row: any, checked: boolean) => {
    setLoadingAction(true);
    try {
      const payload = {
        name: row.name,
        role: row.role,
        active: checked,
      };

      await updateVisitorRole(token as string, row.id, payload);

      showSwal('success', 'Visitor Role successfully updated');
      setRefreshTrigger((prev) => prev + 1);
    } catch (error: any) {
      showSwal('error', error?.response?.data?.message || 'Failed to update status active');
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Visitor Role" description="Visitor Role page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
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
                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 50, 100]}
                currentPage={page}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                isHavePagination={true}
                isHaveFilterDuration={false}
                isHaveHeader={false}
                onCheckedChange={(selected) => setSelectedRows(selected)}
                searchKeyword={search}
                onSearch={handleSearch}
                // onSearchKeywordChange={handleSearchKeywordChange}
                isHaveActive={true}
                onActiveToggle={handleActiveToggle}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
      <Portal>
        <Backdrop open={loadingAction} style={{ zIndex: 99999 }}>
          <CircularProgress color="primary" />
        </Backdrop>
      </Portal>
    </PageContainer>
  );
};

export default Content;
