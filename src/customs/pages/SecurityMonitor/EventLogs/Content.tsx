import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid2 as Grid, IconButton } from '@mui/material';
import { IconWorldCog, IconX } from '@tabler/icons-react';
import { useMemo, useState } from 'react';

import Container from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useIntegrationEvents } from 'src/hooks/Monitor/useIntegrationEvents';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';

const Content = () => {
  const { search, setPage, setSearch } = useTableQueryParams();

  const {
    data,
    totalRecords,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useIntegrationEvents({
    rowsPerPage: 25,
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
    [totalRecords],
  );

  const handleSearch = (keyword: string) => {
    setPage(0);
    setSearch(keyword);
  };

  const [openPayload, setOpenPayload] = useState(false);
  const [selectedPayload, setSelectedPayload] = useState<any>(null);

  const handleOpenPayload = (row: any) => {
    setSelectedPayload(row.payload);
    setOpenPayload(true);
  };

  return (
    <Container title="Integration" description="Integration page">
      <Box>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, lg: 12 }}>
            <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <DynamicTable
              loading={isLoading}
              data={data}
              overflowX="auto"
              isHavePagination={false}
              isHaveSearch={false}
              isInfiniteScroll
              hasNextPage={!!hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onFetchNextPage={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              searchKeyword={search}
              onSearch={handleSearch}
              // isHavePayload={true}
              // onHavePayload={handleOpenPayload}
            />
          </Grid>
        </Grid>
      </Box>

    </Container>
  );
};

export default Content;