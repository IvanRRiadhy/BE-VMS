import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Grid2 as Grid } from '@mui/material';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { IconForbid, IconScript } from '@tabler/icons-react';
import FilterBlacklist from './FilterBlacklist';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import { useTranslation } from 'react-i18next';
import { useBlacklistPagination } from 'src/hooks/Visitor/useBlacklistPagination';
import { useListVisitor } from 'src/hooks/Visitor/useListVisitor';

const Content = () => {
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDir, setSortDir] = useState('desc');
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const { t } = useTranslation();

  const defaultFilters = {
    start_date: '',
    end_date: '',
    visitor: '',
    status_blacklist: '',
  };

  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  const { data, isLoading } = useBlacklistPagination({
    page,
    rowsPerPage,
    sortDir,
    search,
    filters: appliedFilters,
  });

  const tableData =
    data?.collection.map((item: any) => ({
      id: item.id,
      name: item.visitor.name || '-',
      phone: item.visitor.phone || '-',
      reason: item.reason || '-',
      is_active: item.is_active,
      approved_by: item.approved_by_name || '-',
    })) ?? [];

  const totalRecords = data?.RecordsTotal ?? 0;
  const totalFilteredRecords = data?.RecordsFiltered ?? 0;
  const totalActive = data?.collection.filter((x: any) => x.is_active).length ?? 0;
  const totalNonActive = data?.collection.filter((x: any) => !x.is_active).length ?? 0;

  const cards = useMemo(
    () => [
      {
        title: t('total_blacklist'),
        subTitle: `${totalFilteredRecords}`,
        subTitleSetting: 10,
        icon: IconForbid,
        color: 'none',
      },
      {
        title: t('activeBlacklist'),
        subTitle: `${totalActive}`,
        subTitleSetting: 10,
        icon: IconForbid,
        color: 'none',
      },
      {
        title: t('nonActiveBlacklist'),
        subTitle: `${totalNonActive}`,
        subTitleSetting: 10,
        icon: IconForbid,
        color: 'none',
      },
    ],
    [t, totalFilteredRecords, totalActive, totalNonActive]
  );

  const { data: visitors = [], isLoading: isLoadingVisitor } = useListVisitor();

  const handleApplyFilter = () => {
    setPage(0);
    setAppliedFilters(filters);
  };

  const handleResetFilter = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(0);
  };

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
      <Container title="Blacklist" description="Blacklist page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={isLoading}
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
                currentPage={page}
                isHaveChecked={true}
                isHaveAction={false}
                isHaveSearch={true}
                isHaveFilter={false}
                isHaveFilterDuration={false}
                isHaveAddData={false}
                isNoActionTableHead={true}
                isHaveFilterMore={true}
                isHaveHeader={false}
                onCheckedChange={(selected) => setSelectedRows(selected)}
                searchKeyword={search}
                onSearch={handleSearch}
                filterMoreContent={
                  <FilterBlacklist
                    filters={filters}
                    setFilters={setFilters}
                    onApplyFilter={handleApplyFilter}
                    onResetFilter={handleResetFilter}
                    visitors={visitors}
                  />
                }
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default Content;
