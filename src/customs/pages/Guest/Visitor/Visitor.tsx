import React, { useState } from 'react';
import { Box, Grid2 as Grid } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { IconHistory, IconMail, IconX } from '@tabler/icons-react';
// import FilterMoreContent from './FilterMoreContent';
// import FilterMoreContent from './Invitation/FilterMoreContent';
const Visitor = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [edittingId, setEdittingId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const cards = [
    {
      title: 'Today Visit',
      subTitle: '0',
      subTitleSetting: 10,
      icon: IconHistory,
      color: 'none',
    },
    {
      title: 'Check In',
      subTitle: '0',
      subTitleSetting: 10,
      icon: IconHistory,
      color: 'none',
    },
    {
      title: 'Deny',
      subTitle: '0',
      subTitleSetting: 10,
      icon: IconHistory,
      color: 'none',
    },
    {
      title: 'Block',
      subTitle: '0',
      subTitleSetting: 10,
      icon: IconHistory,
      color: 'none',
    },
  ];

  const tableDataVisitor = [
    {
      id: 1,
      name: 'Tommy',
      visitor_no: '92384',
      registered_site: 'Gedung HQ',
      day: 'Mon, 14 Jul 2025 09:00 AM',
    },
  ];

  const handleAdd = () => {
    setOpenDialog(true);
  };

  const [filters, setFilters] = useState<any>({
    visit_start: '',
    visit_end: '',
    site_space: '',
  });

  const handleApplyFilter = () => {
    setPage(0);
    setRefreshTrigger((prev) => prev + 1);
  };

  const agendaOptions = [
    'Meeting Tim A',
    'Presentasi Proyek',
    'Training Karyawan',
    'Rapat Bulanan',
  ];

  return (
    <>
      <PageContainer title="Visitors" description="Visitors">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 3 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                overflowX={'auto'}
                data={tableDataVisitor}
                isHavePagination={true}
                selectedRows={selectedRows}
                // defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 50, 100]}
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
                isHaveFilterMore={true}
                isHaveHeader={false}
                isHavePdf={true}
                // filterMoreContent={
                //   <FilterMoreContent
                //     filters={filters}
                //     setFilters={setFilters}
                //     onApplyFilter={handleApplyFilter}
                //   />
                // }
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
              />
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
    </>
  );
};

export default Visitor;
