import { Grid2 as Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { IconScript } from '@tabler/icons-react';
import React from 'react';
import PageContainer from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';

const Report = () => {
  const cards = [
    {
      title: 'Total Report',
      subTitle: `0`,
      subTitleSetting: 10,
      icon: IconScript,
      color: 'none',
    },
  ];

  return (
    <PageContainer title="Report" description="Report page">
      <Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 12 }}>
            <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
          </Grid>
          <Grid size={{ xs: 12, lg: 12 }}>
            <DynamicTable
              overflowX={'auto'}
              data={[]}
              isHavePagination={true}
              // selectedRows={selectedRows}
              // defaultRowsPerPage={rowsPerPage}
              rowsPerPageOptions={[5, 10, 20]}
              // onPaginationChange={(page, rowsPerPage) => {
              //   setPage(page);
              //   setRowsPerPage(rowsPerPage);
              // }}
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
            />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Report;
