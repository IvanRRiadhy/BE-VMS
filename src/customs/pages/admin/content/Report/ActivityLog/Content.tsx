import React, { useCallback, useState } from 'react';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import Container from 'src/components/container/PageContainer';
import { Box, Grid2 as Grid } from '@mui/material';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import { useActivityLogs } from 'src/hooks/Monitor/useActivityLogs';

const Content = () => {
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const { page, search, setPage, setSearch } = useTableQueryParams();

  const { data, totalRecords, isLoading, error } = useActivityLogs({
    page,
    rowsPerPage,
    search,
  });

  const handleSearch = useCallback(
    (keyword: string) => {
      setPage(0);
      setSearch(keyword);
    },
    [setPage, setSearch],
  );

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Activity Logs" description="View system activity logs">
        <Box>
          <Grid container spacing={2}>
            <DynamicTable
              loading={isLoading}
              overflowX="auto"
              data={data}
              isHavePagination
              isHaveSearch={false}
              isHaveHeaderTitle
              titleHeader="Activity Logs"
              defaultRowsPerPage={rowsPerPage}
              rowsPerPageOptions={[25, 50, 100]}
              totalCount={totalRecords}
              currentPage={page}
             
              searchKeyword={search}
              onSearch={handleSearch}
              onPaginationChange={(newPage, newRowsPerPage) => {
                setPage(newPage);
                setRowsPerPage(newRowsPerPage);
              }}
            />
          </Grid>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default Content;
