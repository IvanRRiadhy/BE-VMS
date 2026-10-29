import { Box, Grid2 as Grid, Icon } from '@mui/material';
import { IconWorldCog } from '@tabler/icons-react';
import React, { useCallback, useMemo, useState } from 'react';
import Container from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useIntegrationEvents } from 'src/hooks/Monitor/useIntegrationEvents';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';

const Content = () => {
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const { page, search, setPage, setSearch } = useTableQueryParams();

  const { data, totalRecords, isLoading, error } = useIntegrationEvents({
    page,
    rowsPerPage,
    search,
  });

  const cards = useMemo(
    () => [
      {
        title: 'Event Logs',
        subTitle: `${totalRecords}`,
        icon: IconWorldCog,
        color: 'none',
      },
    ],
    [],
  );

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
      <Container title="Integration" description="Integration page">
        <Box>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            <Grid container size={{ xs: 12, lg: 12 }}>
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
          </Grid>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default Content;
