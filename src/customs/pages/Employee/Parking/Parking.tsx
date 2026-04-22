import { Grid2 as Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { IconCar } from '@tabler/icons-react';
import React from 'react';
import PageContainer from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';

const Parking = () => {
  const cards = [
    {
      title: 'Total Parking',
      subTitle: `0`,
      subTitleSetting: 10,
      icon: IconCar,
      color: 'none',
    },
  ];

  return (
    <PageContainer title="Parking" description="Parking page">
      <Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 12 }}>
            <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
          </Grid>
          <Grid size={{ xs: 12, lg: 12 }}>
            {/* {isDataReady ? ( */}
            <DynamicTable
              overflowX={'auto'}
              data={[]}
              isHavePagination={true}
              // selectedRows={selectedRows}
              // defaultRowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10, 20, 100]}
              // onPaginationChange={(page, rowsPerPage) => {
              //   setPage(page);
              //   setRowsPerPage(rowsPerPage);
              // }}
              isHaveChecked={true}
              isHaveAction={true}
              isHaveSearch={true}
              isHaveFilter={true}
              isHaveExportPdf={false}
              isHaveExportXlf={false}
              isHaveFilterDuration={false}
              isHaveAddData={false}
              isHaveFilterMore={false}
              isHaveHeader={false}
              isHavePdf={false}
            />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Parking;
