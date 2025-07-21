import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2 as Grid,
  IconButton,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';

import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import CloseIcon from '@mui/icons-material/Close';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getAllBrand, getAllBrandPagination } from 'src/customs/api/admin';
import { CreateBrandRequest, Item, CreateBrandResponse } from 'src/customs/api/models/Brand';

const Content = () => {
  // Pagination state.
  const [tableData, setTableData] = useState<Item[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const { token } = useSession();
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [edittingId, setEdittingId] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [formDataAddBrand, setFormDataAddBrand] = useState<CreateBrandRequest>(() => {
    const saved = localStorage.getItem('unsavedBrandData');
    return saved ? JSON.parse(saved) : { name: '', type_brand: 0, integration_list_id: '' };
  });
  const cards = [
    {
      title: 'Total Brand',
      subTitle: `${tableData.length}`,
      subTitleSetting: 10,
      color: 'none',
    },
  ];
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getAllBrandPagination(
          token,
          page,
          rowsPerPage,
          sortColumn,
          searchKeyword,
        );
        setTableData(response.collection);
        setTotalRecords(response.collection.length);
        setIsDataReady(true);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, page, rowsPerPage, sortColumn, refreshTrigger, searchKeyword]);

  useEffect(() => {
    localStorage.setItem('unsavedBrandData', JSON.stringify(formDataAddBrand));
  }, [formDataAddBrand]);

  return (
    <>
      <PageContainer title="Manage Brand" description="Brand page">
        <Box>
          <Grid container spacing={3}>
            {/* column */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <TopCard items={cards} />
            </Grid>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                overflowX={'auto'}
                data={tableData}
                // isHaveChecked={true}
                // isHaveAction={true}
                isHaveSearch={true}
                isHaveFilter={true}
                isHaveExportPdf={true}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                // isHaveAddData={true}
                isHaveFilterMore={false}
                isHaveHeader={false}
                // onCheckedChange={(selected) => console.log('Checked table row:', selected)}
                // onEdit={(row) => {
                //   console.log('Edit:', row);
                //   //   handleEdit(row.id);
                //   //   setEdittingId(row.id);
                // }}
                // onDelete={(row) => console.log('Delete:', row)}
                onSearchKeywordChange={(searchKeyword) => setSearchKeyword(searchKeyword)}
                onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                // onAddData={() => {
                //   handleAdd();
                // }}
              />
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
      {/* <Dialog open={openFormAddDocument} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ position: 'relative', padding: 5 }}>
          Add Document
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <br />
          <FormAddDocument
            formData={formDataAddDocument}
            setFormData={setFormDataAddDocument}
            edittingId={edittingId}
            onSuccess={() => {
              handleCloseDialog();
              setRefreshTrigger(refreshTrigger + 1);
            }}
          />
        </DialogContent>
      </Dialog> */}
      {/* Dialog Confirm edit */}
      {/* <Dialog open={confirmDialogOpen} onClose={handleCancelEdit}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          You have unsaved changes for another Document. Are you sure you want to discard them and
          edit this Document?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancel</Button>
          <Button onClick={handleConfirmEdit} color="primary" variant="contained">
            Yes, Discard and Continue
          </Button>
        </DialogActions>
      </Dialog> */}
    </>
  );
};

export default Content;
