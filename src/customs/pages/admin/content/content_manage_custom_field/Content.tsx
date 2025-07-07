import React, { useEffect, useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Divider,
  Grid2 as Grid,
  IconButton,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';

import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import CloseIcon from '@mui/icons-material/Close';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getAllCustomField, getAllCustomFieldPagination } from 'src/customs/api/admin';
import {
  CreateCustomFieldRequest,
  Item,
  CreateCustomFieldResponse,
  multiOptField,
  FieldType,
  CreateCustomFieldRequestSchema,
} from 'src/customs/api/models/CustomField';
import FormCustomField from './FormCustomField';

type CustomFieldTableRow = {
  id: string;
  name: string;
  display_text: string;
  field_type: string;
  multiple_option_fields: multiOptField[];
};

const Content = () => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [tableData, setTableData] = useState<Item[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const { token } = useSession();
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [tableRowSite, setTableRowSite] = React.useState<CustomFieldTableRow[]>([]);
  const [edittingId, setEdittingId] = useState('');
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      console.log('Fetching data...');
      setLoading(true);
      try {
        const start = page * rowsPerPage;
        const response = await getAllCustomFieldPagination(token, start, rowsPerPage, sortColumn);
        console.log('Response from API:', response);
        setTableData(response.collection);
        setTotalRecords(response.RecordsTotal);
        setTotalFilteredRecords(response.RecordsFiltered);
        setIsDataReady(true);
        console.log('Table data:', tableData);
        const rows = response.collection.map((item: Item) => ({
          id: item.id,
          name: item.short_name,
          display_text: item.long_display_text,
          field_type: FieldType[item.field_type],
          multiple_option_fields: item.multiple_option_fields,
        }));

        setTableRowSite(rows);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, page, rowsPerPage, sortColumn, refreshTrigger]);
  const [formDataAddCustomField, setFormDataAddCustomField] = useState<CreateCustomFieldRequest>(
    () => {
      const saved = localStorage.getItem('unsavedCustomDataData');
      return saved ? JSON.parse(saved) : {};
    },
  );
  useEffect(() => {
    localStorage.setItem('unsavedCustomDataData', JSON.stringify(formDataAddCustomField));
  }, [formDataAddCustomField]);

  const cards = [
    {
      title: 'Total Custom Field',
      subTitle: `${totalFilteredRecords}`,
      subTitleSetting: 10,
      color: 'none',
    },
  ];
  //Create Access Control Dialog
  const [openCreateCustomField, setOpenCreateCustomField] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);

  const handleOpenDialog = () => {
    setOpenCreateCustomField(true);
  };
  const handleCloseDialog = () => setOpenCreateCustomField(false);

  const handleAdd = () => {
    const editing = localStorage.getItem('unsavedCustomDataData');
    if (editing) {
      // If editing exists, show confirmation dialog for add
      setPendingEditId(null); // null means it's an add, not edit
      setConfirmDialogOpen(true);
    } else {
      setFormDataAddCustomField(CreateCustomFieldRequestSchema.parse({}));
      handleOpenDialog();
    }
  };
  const handleEdit = (id: string) => {
    const editing = localStorage.getItem('unsavedCustomDataData');
    if (editing) {
      const parsed = JSON.parse(editing);
      if (parsed.id === id) {
        handleOpenDialog();
      } else {
        console.log('ID tidak cocok', id);
        setPendingEditId(id);
        setConfirmDialogOpen(true);
      }
    } else {
      setFormDataAddCustomField(
        CreateCustomFieldRequestSchema.parse(tableData.find((item) => item.id === id) || {}),
      );
      handleOpenDialog();
    }
    console.log('Form data:', edittingId);
  };

  const handleConfirmEdit = () => {
    setConfirmDialogOpen(false);
    if (pendingEditId) {
      console.log('Data: ', tableData);
      console.log(
        'Edit ID:',
        tableData.find((item) => item.id === pendingEditId),
      );
      // Edit existing site
      setFormDataAddCustomField(
        CreateCustomFieldRequestSchema.parse(
          tableData.find((item) => item.id === pendingEditId) || {},
        ),
      );
    } else {
      // Add new site
      setFormDataAddCustomField(CreateCustomFieldRequestSchema.parse({}));
    }
    handleOpenDialog();
    setPendingEditId(null);
  };

  const handleCancelEdit = () => {
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  return (
    <>
      <PageContainer title="Manage Custom Field Space" description="Custom Field page">
        <Box>
          <Grid container spacing={3}>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} />
            </Grid>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                isHavePagination={true}
                totalCount={totalFilteredRecords}
                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 20]}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                overflowX={'auto'}
                data={tableRowSite}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveSearch={true}
                isHaveFilter={true}
                isHaveExportPdf={true}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                isHaveAddData={true}
                isHaveHeader={false}
                onCheckedChange={(selected) => console.log('Checked table row:', selected)}
                onEdit={(row) => {
                  handleEdit(row.id)
                  setEdittingId(row.id);
                }}
                onDelete={(row) => console.log('Delete:', row)}
                onSearchKeywordChange={(keyword) => console.log('Search keyword:', keyword)}
                onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                onAddData={() => {
                  handleAdd();
                }}
              />{' '}
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
      <Dialog
        open={openCreateCustomField}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth={formDataAddCustomField.field_type >= 3 ? 'lg' : 'md'}
      >
        <DialogTitle sx={{ position: 'relative', padding: 5 }}>
          {edittingId ? 'Edit' : 'Add'} Custom Field
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
          <FormCustomField
            formData={formDataAddCustomField}
            setFormData={setFormDataAddCustomField}
            onSuccess={() => {
              handleCloseDialog();
              setRefreshTrigger(refreshTrigger + 1);
            }}
            editingId={edittingId}
          />
        </DialogContent>
      </Dialog>
      {/* Dialog Confirm edit */}
      <Dialog open={confirmDialogOpen} onClose={handleCancelEdit}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          You have unsaved changes for another Custom Field. Are you sure you want to discard them
          and edit this Custom Field?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancel</Button>
          <Button onClick={handleConfirmEdit} color="primary" variant="contained">
            Yes, Discard and Continue
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Content;
