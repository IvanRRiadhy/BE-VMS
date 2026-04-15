import { useCallback, useEffect, useState } from 'react';
import { Box, Grid2 as Grid, IconButton } from '@mui/material';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';

import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import { deleteDocument, getAllDocumentPagination } from 'src/customs/api/admin';

import { IconBell, IconScript } from '@tabler/icons-react';

const Content = () => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const { token } = useSession();
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [edittingId, setEdittingId] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sortDir, setSortDir] = useState('desc');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const cards = [
    {
      title: 'Total Notification',
      subTitle: `${0}`,
      subTitleSetting: 10,
      icon: IconBell,
      color: 'none',
    },
  ];

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const start = page * rowsPerPage;
        const response = await getAllDocumentPagination(
          token,
          start,
          rowsPerPage,
          sortColumn,
          sortDir,
          searchKeyword,
        );
        setTableData([]);
        setTotalRecords(response.RecordsTotal);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, page, rowsPerPage, sortColumn, sortDir, refreshTrigger, searchKeyword]);

  const handleSearchKeywordChange = useCallback((keyword: string) => {
    setSearchInput(keyword);
  }, []);

  const handleSearch = useCallback(() => {
    setPage(0);
    setSearchKeyword(searchInput);
  }, [searchInput]);

  return (
    <Container title="Notification" description="Notification page">
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
              isHavePagination={true}
              selectedRows={selectedRows}
              defaultRowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10, 50, 100]}
              onPaginationChange={(page, rowsPerPage) => {
                setPage(page);
                setRowsPerPage(rowsPerPage);
              }}
              isHaveChecked={true}
              isHaveAction={false}
              isHaveSearch={true}
              isHaveFilter={false}
              isHaveExportPdf={false}
              isHaveExportXlf={false}
              isHaveFilterDuration={false}
              isHaveAddData={false}
              isHaveFilterMore={false}
              isHaveHeader={false}
              isHavePdf={true}
              onCheckedChange={(selected) => setSelectedRows(selected)}
              searchKeyword={searchInput}
              onSearch={handleSearch}
              onSearchKeywordChange={handleSearchKeywordChange}
              onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Content;
