import { useState } from 'react';
import { Box, Grid2 as Grid } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { IconHistory } from '@tabler/icons-react';
import FilterMoreContent from './FilterMoreContent';
const Approval = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const cards = [
    {
      title: 'Total Approval',
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
      registered_site: 'Gedung HQ',
      status: 'deny',
      check_time: 'Mon, 14 Jul 2025 09:00 AM',
    },
    {
      id: 2,
      name: 'Budi',
      registered_site: 'Aula Lantai 3',
      status: 'checkin',
      check_time: 'Mon, 14 Jul 2025 09:00 AM',
    },
  ];

  const [filters, setFilters] = useState<any>({
    visit_start: '',
    visit_end: '',
    site_space: '',
  });

  const handleApplyFilter = () => {
    setPage(0);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <>
      <PageContainer title="Evacuate" description="Report Page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 3 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                overflowX={'auto'}
                data={tableDataVisitor}
                isHavePagination={false}
                selectedRows={selectedRows}
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
                filterMoreContent={
                  <FilterMoreContent
                    filters={filters}
                    setFilters={setFilters}
                    onApplyFilter={handleApplyFilter}
                  />
                }
              />
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
    </>
  );
};

export default Approval;
