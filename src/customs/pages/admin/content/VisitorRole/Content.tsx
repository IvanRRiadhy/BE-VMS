import { useCallback, useEffect, useMemo, useState } from 'react';
import { Backdrop, Box, CircularProgress, Grid2 as Grid, Portal } from '@mui/material';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { IconBrandMedium } from '@tabler/icons-react';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';

import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import { useTranslation } from 'react-i18next';
import { useVisitorRolePagination } from 'src/hooks/VisitorRole/useVisitorRolePagination';
import { useVisitorRoleMutation } from 'src/hooks/VisitorRole/useVisitorRoleMutation';
const Content = () => {
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const sortDir = 'desc';
  const { t } = useTranslation();

  const { data: visitorRole, isLoading } = useVisitorRolePagination({
    page,
    rowsPerPage,
    sortDir,
    search,
  });

  const { updateMutation } = useVisitorRoleMutation();

  const tableData = visitorRole?.collection ?? [];
  const totalRecords = visitorRole?.RecordsTotal ?? 0;

  const cards = useMemo(
    () => [
      {
        title: t('totalVisitorRole'),
        subTitle: String(totalRecords),
        subTitleSetting: 10,
        icon: IconBrandMedium,
        color: 'none',
      },
    ],
    [t, totalRecords],
  );


  const handleSearch = useCallback(
    (keyword: string) => {
      setPage(0);
      setSearch(keyword);
    },
    [setPage, setSearch],
  );

  const handleActiveToggle = async (row: any, checked: boolean) => {

    try {

      await updateMutation.mutateAsync({
        id: row.id,
        data: {
          name: row.name,
          role: row.role,
          active: checked,
        },
      });

      showSwal('success', 'Visitor Role successfully updated');
    } catch (error: any) {
      showSwal('error', error?.response?.data?.message || 'Failed to update status active');
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
                loading={isLoading}
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
                isHaveActive={true}
                onActiveToggle={handleActiveToggle}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
      <Portal>
        <Backdrop open={updateMutation.isPending} style={{ zIndex: 99999 }}>
          <CircularProgress color="primary" />
        </Backdrop>
      </Portal>
    </PageContainer>
  );
};

export default Content;
