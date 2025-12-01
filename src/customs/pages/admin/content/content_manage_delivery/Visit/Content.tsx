import { Box, Grid2 as Grid } from '@mui/material';
import { IconUsers } from '@tabler/icons-react';
import React, { useState } from 'react';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';

import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';

const Content = () => {
  const [visitDelivery, setVisitDelivery] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const cards = [
    {
      title: 'Total Visit Delivery',
      icon: IconUsers,
      subTitle: `0`,
      subTitleSetting: 10,
      color: 'none',
    },
  ];
  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Visit Delivery" description="this is visit delivery page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={loading}
                overflowX={'auto'}
                data={visitDelivery}
                // selectedRows={selectedRows}
                // totalCount={totalFilteredRecords}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveSearch={true}
                isHaveImage={true}
                isHaveFilter={false}
                isHaveExportPdf={false}
                isHavePagination={true}
                // defaultRowsPerPage={rowsPerPage}
                // rowsPerPageOptions={[5, 10, 20, 50, 100]}
                // onPaginationChange={(page, rowsPerPage) => {
                //   setPage(page);
                //   setRowsPerPage(rowsPerPage);
                // }}
                // isHaveExportXlf={false}
                // isHaveFilterDuration={false}
                isHaveAddData={false}
                // isHaveFilterMore={true}
                // filterMoreContent={
                //   <FilterMoreContent
                //     filters={filters}
                //     setFilters={setFilters}
                //     onApplyFilter={handleApplyFilter}
                //     organizationData={organizationData}
                //     departmentData={departmentData}
                //     districtData={districtData}
                //   />
                // }
                // isHaveHeader={false}
                // onCheckedChange={(selected) => {
                //   const fullSelectedItems = tableData.filter((item) =>
                //     selected.some((row: EmployeesTableRow) => row.id === item.id),
                //   );
                //   setSelectedRows(fullSelectedItems);
                // }}
                // onEdit={(row) => {
                //   handleEdit(row.id);
                //   setEdittingId(row.id);
                // }}
                // onBatchEdit={handleBatchEdit}
                // onDelete={(row) => handleDelete(row.id)}
                // onBatchDelete={handleBatchDelete}
                // onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                // onAddData={() => {
                //   handleAdd();
                // }}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default Content;
