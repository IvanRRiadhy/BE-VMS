import { Grid2 as Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { IconScript } from '@tabler/icons-react';
import React from 'react';
import PageContainer from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';

const Visitor = () => {
  const cards = [
    {
      title: 'Total Visitor',
      subTitle: `0`,
      subTitleSetting: 10,
      icon: IconScript,
      color: 'none',
    },
  ];

  return (
    <PageContainer title="Visitor" description="Visitor page">
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
              rowsPerPageOptions={[5, 10, 20]}
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
              isHaveAddData={true}
              isHaveFilterMore={false}
              isHaveHeader={false}
              isHavePdf={true}
              // onFileClick={(row) => handleFileClick(row)}
              // onCheckedChange={(selected) => setSelectedRows(selected)}
              // onEdit={(row) => {
              //   handleEdit(row.id);
              //   setEdittingId(row.id);
              // }}
              // onDelete={(row) => handleDelete(row.id)}
              // onBatchDelete={handleBatchDelete}
              // onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
              // onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
              // onAddData={() => {
              //   handleAdd();
              // }}
              htmlFields={['document_text']}
              htmlClampLines={4}
              htmlMaxWidth={500}
            />
            {/* ) : (
              <Card sx={{ width: '100%' }}>
                <Skeleton />
                <Skeleton animation="wave" />
                <Skeleton animation={false} />
              </Card>
            )} */}
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Visitor;
