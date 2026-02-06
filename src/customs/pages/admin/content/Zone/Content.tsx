import { Box, Dialog, DialogContent, DialogTitle, Grid2 as Grid, IconButton } from '@mui/material';
import { IconMapPin, IconX } from '@tabler/icons-react';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useEffect, useState } from 'react';
import { useSession } from 'src/customs/contexts/SessionContext';
import FormZone from './FormZone';

const Content = () => {
  const cards = [
    {
      title: 'Total Zone',
      subTitle: `0`,
      subTitleSetting: 10,
      icon: IconMapPin,
      color: 'none',
    },
  ];

  const [tableData, setTableData] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const { token } = useSession();
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [edittingId, setEdittingId] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [editingId, setEditingId] = useState('');
  const [openFormAddZone, setOpenFormAddZone] = useState(false);

  const handleAddZone = () => {
    setOpenFormAddZone(true);
  };

  const [formDataAddEmployee, setFormDataAddEmployee] = useState<any>(() => {
    const saved = localStorage.getItem('unsavedZoneData');

    // try {
    //   const parsed = saved ? JSON.parse(saved) : {};
    //   return CreateEmployeeRequestSchema.parse(parsed);
    // } catch (e) {
    //   console.error('Invalid saved data, fallback to default schema.');
    //   return CreateEmployeeRequestSchema.parse({});
    // }
  });

  const handleDelete = (id: string) => {
    // Logic to handle deleting a zone
  };

  const handleBatchDelete = (ids: string[]) => {
    // Logic to handle batch deleting zones
  };

  const handleEdit = (id: string) => {
    // Logic to handle editing a zone
  };

  const handleCloseDialog = () => {
    setOpenFormAddZone(false);
    setEdittingId('');
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    // setInitialFormData((_) => formDataAddEmployee);
    setOpenFormAddZone(false);

    localStorage.removeItem('unsavedZoneData');
  };

  useEffect(() => {}, []);

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Zone" description="Zone page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={loading}
                overflowX={'auto'}
                data={tableData}
                selectedRows={selectedRows}
                isHaveChecked={true}
                isHaveSearch={true}
                isHavePagination={true}
                isHaveHeader={false}
                isHaveAction={false}
                isHaveAddData={true}
                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 20, 50, 100]}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                onAddData={() => {
                  handleAddZone();
                }}
                onDelete={(row) => handleDelete(row.id)}
                onEdit={(row) => {
                  handleEdit(row.id);
                  setEdittingId(row.id);
                }}
                onCheckedChange={(selected) => setSelectedRows(selected)}
                onBatchDelete={handleBatchDelete}
                onSearchKeywordChange={(searchKeyword) => setSearchKeyword(searchKeyword)}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
      <Dialog open={openFormAddZone} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 2,
          }}
        >
          {edittingId ? 'Edit Zone' : 'Add Zone'}
          <IconButton
            aria-label="close"
            onClick={() => {
              //   if (isFormChanged) {
              //     setConfirmDialogOpen(true);
              //   } else {
              //     handleCloseDialog();
              //   }
              handleCloseDialog();
            }}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <IconX />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <FormZone
            formData={formDataAddEmployee}
            setFormData={setFormDataAddEmployee}
            edittingId={edittingId}
            onSuccess={handleSuccess}
            // isBatchEdit={isBatchEdit}
            // selectedRows={selectedRows}
            // enabledFields={enabledFields}
            // setEnabledFields={setEnabledFields}
          />
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default Content;
