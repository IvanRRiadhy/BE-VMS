import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Divider,
  CircularProgress,
  Card,
  Skeleton,
  Grid2 as Grid,
  IconButton,
} from '@mui/material';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';

import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import CloseIcon from '@mui/icons-material/Close';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  getAllCustomField,
  getAllCustomFieldPagination,
  deleteCustomField,
} from 'src/customs/api/admin';
import {
  CreateCustomFieldRequest,
  Item,
  CreateCustomFieldResponse,
  multiOptField,
  FieldType,
  CreateCustomFieldRequestSchema,
} from 'src/customs/api/models/Admin/CustomField';
import FormCustomField from './FormCustomField';
import Swal from 'sweetalert2';
import { IconSettings } from '@tabler/icons-react';
import {
  showConfirmDelete,
  showErrorAlert,
  showSuccessAlert,
} from 'src/customs/components/alerts/alerts';

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
  const [selectedRows, setSelectedRows] = useState<CustomFieldTableRow[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const { token } = useSession();
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [tableRowSite, setTableRowSite] = React.useState<CustomFieldTableRow[]>([]);
  const [edittingId, setEdittingId] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [initialFormSnapshot, setInitialFormSnapshot] = useState<string | null>(null);
  const [shouldTrackChanges, setShouldTrackChanges] = useState(false);
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const start = page * rowsPerPage;
        const responseGet = await getAllCustomField(token);
        const response = await getAllCustomFieldPagination(
          token,
          start,
          rowsPerPage,
          sortColumn,
          searchKeyword,
        );
        const total = responseGet.collection?.length ?? 0;
        console.log('Total records:', total);
        setTableData(responseGet.collection);
        setTotalRecords(total);

        console.log('Table data:', tableData);
        const rows = responseGet.collection.map((item: Item) => ({
          id: item.id,
          name: item.short_name,
          display_text: item.long_display_text,
          field_type: FieldType[item.field_type],
          multiple_option_fields: item.multiple_option_fields,
        }));

        if (rows) {
          setTableRowSite(rows);
          setIsDataReady(true);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, refreshTrigger, searchKeyword]);
  const [formDataAddCustomField, setFormDataAddCustomField] = useState<CreateCustomFieldRequest>(
    () => {
      const saved = localStorage.getItem('unsavedCustomDataData');
      return saved ? JSON.parse(saved) : {};
    },
  );
  const defaultFormData = CreateCustomFieldRequestSchema.parse({});
  const isFormChanged = JSON.stringify(formDataAddCustomField) !== JSON.stringify(defaultFormData);

  // useEffect(() => {
  //   localStorage.setItem('unsavedCustomDataData', JSON.stringify(formDataAddCustomField));
  // }, [formDataAddCustomField]);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  useEffect(() => {
    if (!shouldTrackChanges || !initialFormSnapshot) return;

    const current = JSON.stringify(formDataAddCustomField);

    if (current !== initialFormSnapshot) {
      localStorage.setItem('unsavedCustomDataData', current);
    } else {
      localStorage.removeItem('unsavedCustomDataData');
    }
  }, [formDataAddCustomField, shouldTrackChanges, initialFormSnapshot]);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.relatedTarget as Node)) {
        if (isFormChanged) {
          setConfirmDialogOpen(true);
        }
      }
    };

    const dialogEl = dialogRef.current;
    if (dialogEl) {
      dialogEl.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (dialogEl) {
        dialogEl.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [isFormChanged]);

  const cards = [
    {
      title: 'Total Custom Field',
      subTitle: `${totalRecords}`,
      icon: IconSettings,
      subTitleSetting: 10,
      color: 'none',
    },
  ];
  //Create Access Control Dialog
  const [openCreateCustomField, setOpenCreateCustomField] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const handleOpenDialog = () => {
    setOpenCreateCustomField(true);
  };
  const handleCloseDialog = () => {
    setOpenCreateCustomField(false);
    setInitialFormSnapshot(null);
    setShouldTrackChanges(false);
  };

  const handleAdd = () => {
    const editing = localStorage.getItem('unsavedCustomDataData');
    const data = editing ? JSON.parse(editing) : CreateCustomFieldRequestSchema.parse({});

    setFormDataAddCustomField(data);
    setInitialFormSnapshot(JSON.stringify(data));
    setEdittingId('');
    handleOpenDialog();

    // Delay sedikit agar `useEffect` tidak langsung anggap ada perubahan
    setTimeout(() => setShouldTrackChanges(true), 100);
  };

  const handleEdit = (id: string) => {
    const editing = localStorage.getItem('unsavedCustomDataData');
    if (editing) {
      const parsed = JSON.parse(editing);
      if (parsed.id === id) {
        setEdittingId(id);
        setFormDataAddCustomField(parsed);
        setInitialFormSnapshot(JSON.stringify(parsed));
        handleOpenDialog();
        setTimeout(() => setShouldTrackChanges(true), 100);
      } else {
        setPendingEditId(id);
        setConfirmDialogOpen(true);
      }
    } else {
      const data = tableData.find((item) => item.id === id) || {};
      const parsed = CreateCustomFieldRequestSchema.parse(data);
      setFormDataAddCustomField(parsed);
      setInitialFormSnapshot(JSON.stringify(parsed));
      setEdittingId(id);
      handleOpenDialog();
      setTimeout(() => setShouldTrackChanges(true), 100);
    }
  };
  const handleConfirmEdit = () => {
    setConfirmDialogOpen(false); // Tutup dialog konfirmasi
    localStorage.removeItem('unsavedCustomDataData'); // Hapus data yang belum disimpan

    if (pendingEditId) {
      const data = tableData.find((item) => item.id === pendingEditId);
      setFormDataAddCustomField(CreateCustomFieldRequestSchema.parse(data || {}));
      setEdittingId(pendingEditId);
    } else {
      setFormDataAddCustomField(CreateCustomFieldRequestSchema.parse({}));
      setEdittingId('');
    }

    setPendingEditId(null);
    setIsFormInitialized(true); // ⬅️ Mulai tracking form baru
    handleCloseDialog(); // ⬅️ Buka dialog edit yang baru
  };

  const handleCancelEdit = () => {
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  const handleDialogClose = (_event: object, reason: string) => {
    if (reason === 'backdropClick') {
      if (isFormChanged) {
        setConfirmDialogOpen(true);
      } else {
        handleCloseDialog();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;

    const confirm = await showConfirmDelete(
      'Are you sure you want to delete this? ',
      "You won't be able to revert this!",
    );

    if (confirm) {
      setLoading(true);
      try {
        await deleteCustomField(id, token);
        setRefreshTrigger((prev) => prev + 1);
        showSuccessAlert('Deleted!', 'Custom Field has been deleted.');
      } catch (error) {
        console.error(error);
        showErrorAlert('Failed!', 'Failed to delete custom field.');
        setTimeout(() => setLoading(false), 500);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    }
  };

  const handleBatchDelete = async (rows: CustomFieldTableRow[]) => {
    if (!token || rows.length === 0) return;

    const confirmed = await showConfirmDelete(
      `Are you sure to delete ${rows.length} items?`,
      "You won't be able to revert this!",
    );

    if (confirmed) {
      setLoading(true);
      try {
        await Promise.all(rows.map((row) => deleteCustomField(row.id, token)));
        setRefreshTrigger((prev) => prev + 1);
        showSuccessAlert('Deleted!', `${rows.length} items have been deleted.`);
      } catch (error) {
        console.error(error);
        showErrorAlert('Error!', 'Failed to delete some items.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Custom Field" description="Custom Field page">
        <Box>
          <Grid container spacing={3}>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              {isDataReady ? (
                <DynamicTable
                  overflowX={'auto'}
                  isHavePagination={false}
                  data={tableRowSite}
                  selectedRows={selectedRows}
                  totalCount={totalFilteredRecords}
                  // defaultRowsPerPage={rowsPerPage}
                  // rowsPerPageOptions={[5, 10, 20, 50, 100]}
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
                  isHaveAddData={true}
                  isHaveHeader={false}
                  onCheckedChange={(selected) => {
                    setSelectedRows(selected);
                  }}
                  onEdit={(row) => {
                    handleEdit(row.id);
                    setEdittingId(row.id);
                  }}
                  onDelete={(row) => handleDelete(row.id)}
                  onBatchDelete={handleBatchDelete}
                  onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                  onAddData={() => {
                    handleAdd();
                  }}
                  isHaveObjectData={true}
                />
              ) : (
                <Card sx={{ width: '100%' }}>
                  <Skeleton />
                  <Skeleton animation="wave" />
                  <Skeleton animation={false} />
                </Card>
              )}
            </Grid>
          </Grid>
        </Box>
      </Container>
      <Dialog
        open={openCreateCustomField}
        onClose={handleDialogClose} // sebelumnya: handleCloseDialog
        fullWidth
        maxWidth={formDataAddCustomField.field_type >= 3 ? 'lg' : 'md'}
      >
        <DialogTitle sx={{ position: 'relative', padding: 5 }}>
          {edittingId ? 'Edit' : 'Add'} Custom Field
          <IconButton
            aria-label="close"
            onClick={() => {
              if (isFormChanged) {
                setConfirmDialogOpen(true);
              } else {
                handleCloseDialog();
              }
            }}
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
              localStorage.removeItem('unsavedCustomDataData');
              handleCloseDialog();
              setRefreshTrigger(refreshTrigger + 1);
              if (edittingId) {
                Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  text: 'Custom Field successfully updated!',
                });
              } else {
                Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  text: 'Custom Field successfully created!',
                });
              }
            }}
            editingId={edittingId}
          />
        </DialogContent>
      </Dialog>
      {/* Dialog Confirm edit */}
      <Dialog open={confirmDialogOpen} onClose={handleCancelEdit}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent ref={dialogRef}>
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
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            bgcolor: '#fff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      )}
    </PageContainer>
  );
};

export default Content;
