import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Card,
  Skeleton,
  Divider,
  Grid2 as Grid,
  IconButton,
  useTheme,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';

import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import CloseIcon from '@mui/icons-material/Close';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  getAllAccessControl,
  getAllAccessControlPagination,
  deleteAccessControl,
} from 'src/customs/api/admin';
import {
  GetAllAccessControlResponse,
  GetAccessControlPaginationResponse,
  Item,
  CreateAccessControlRequest,
  CreateAccessControlRequestSchema,
} from 'src/customs/api/models/AccessControl';
import FormAccessControl from './FormAccessControl';
import Swal from 'sweetalert2';

type AccessControlTableRow = {
  brand_name: string;
  type: number;
  name: string;
  description: string;
  channel: string;
  door_id: string;
  raw: string;
  integration_name: string;
  id: string;
};
import { IconAccessible } from '@tabler/icons-react';
import {
  showConfirmDelete,
  showErrorAlert,
  showSuccessAlert,
} from 'src/customs/components/alerts/alerts';
import { de } from 'date-fns/locale';

const Content = () => {
  const theme = useTheme();

  // Pagination state.
  const [accessControlData, setAccessControlData] = useState<Item[]>([]);
  const [tableData, setTableData] = useState<Item[]>([]);
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const { token } = useSession();
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [edittingId, setEdittingId] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  function formatEnumLabel(label: string) {
    // Insert a space before all caps and capitalize the first letter
    return label
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getAllAccessControlPagination(
          token,
          page,
          rowsPerPage,
          sortColumn,
          searchKeyword,
        );
        if (response) {
          setTableData(response.collection);
          setIsDataReady(true);
        }
        setTotalRecords(response.RecordsTotal);
        setTotalFilteredRecords(response.RecordsFiltered);

        const rows = response.collection.map((item: Item) => ({
          brand_name: item.brand_name,
          type: item.type,
          name: item.name,
          description: item.description,
          channel: item.channel,
          door_id: item.door_id,
          raw: item.raw,
          integration_name: item.integration_name,
          id: item.id,
        }));
        // setTableData(rows);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, page, rowsPerPage, sortColumn, refreshTrigger, searchKeyword]);
  const [formDataAddAccessControl, setFormDataAddAccessControl] =
    useState<CreateAccessControlRequest>(() => {
      const saved = localStorage.getItem('unsavedAccessControlData');
      return saved ? JSON.parse(saved) : {};
    });

  const defaultFormData = CreateAccessControlRequestSchema.parse({});
  const isFormChanged =
    JSON.stringify(formDataAddAccessControl) !== JSON.stringify(defaultFormData);

  useEffect(() => {
    const defaultForm = CreateAccessControlRequestSchema.parse({});
    const isChanged = JSON.stringify(formDataAddAccessControl) !== JSON.stringify(defaultForm);

    if (isChanged) {
      localStorage.setItem('unsavedCustomDataData', JSON.stringify(formDataAddAccessControl));
    }
  }, [formDataAddAccessControl]);

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
      title: 'Total Access Control',
      icon: IconAccessible,
      subTitle: `${totalFilteredRecords}`,
      subTitleSetting: 10,
      color: 'none',
    },
  ];

  //Create Access Control Dialog
  const [openCreateAccessControl, setOpenCreateAccessControl] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);

  const handleOpenDialog = () => {
    setOpenCreateAccessControl(true);
  };
  const handleCloseDialog = () => setOpenCreateAccessControl(false);

  const handleAdd = () => {
    const editing = localStorage.getItem('unsavedAccessControlData');
    if (editing) {
      // If editing exists, show confirmation dialog for add
      setPendingEditId(null); // null means it's an add, not edit
      setConfirmDialogOpen(true);
    } else {
      setFormDataAddAccessControl(CreateAccessControlRequestSchema.parse({}));
      handleOpenDialog();
    }
  };
  const handleEdit = (id: string) => {
    const editing = localStorage.getItem('unsavedAccessControlData');

    if (editing) {
      const parsed = JSON.parse(editing);
      const filtered = tableData.filter((item) => item.id === id);

      if (parsed.id === id) {
        handleOpenDialog();
      } else {
        console.log('ID tidak cocok', id);
        setPendingEditId(id);
        setConfirmDialogOpen(true);
      }
    } else {
      setFormDataAddAccessControl(
        CreateAccessControlRequestSchema.parse(tableData.find((item) => item.id === id) || {}),
      );
      handleOpenDialog();
    }
  };

  const handleConfirmEdit = () => {
    setConfirmDialogOpen(false);
    localStorage.removeItem('unsavedAccessControlData');
    setLoading(true);

    if (pendingEditId) {
      const data = tableData.find((item) => item.id === pendingEditId);
      setFormDataAddAccessControl(CreateAccessControlRequestSchema.parse(data) || {});
      setEdittingId(pendingEditId);

      setTimeout(() => {
        setLoading(false);
        handleOpenDialog(); // ✅ buka dialog untuk edit
      }, 300);
    } else {
      // ❌ JANGAN buka dialog lagi di sini!
      setFormDataAddAccessControl(CreateAccessControlRequestSchema.parse({}));
      setEdittingId('');
      setLoading(false);
      setOpenCreateAccessControl(false); // pastikan tertutup
    }

    setPendingEditId(null);
  };

  const handleCancelEdit = () => {
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  const handleDelete = async (id: string) => {
    if (!token) return;

    const confirmed = await showConfirmDelete(
      'Are you sure you want to delete this Access Control?',
      "You won't be able to revert this!",
    );

    if (confirmed) {
      try {
        await deleteAccessControl(id, token);
        setRefreshTrigger((prev) => prev + 1);
        showSuccessAlert('Deleted!', 'Access Control has been deleted.');
      } catch (error) {
        console.error(error);
        showErrorAlert('Failed to delete Access Control', 'Please try again later.');
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    }
  };

  const handleBatchDelete = async (rows: Item[]) => {
    if (!token || rows.length === 0) return;

    const confirmed = await showConfirmDelete(
      `Are you sure to delete ${rows.length} items?`,
      "You won't be able to revert this!",
    );

    if (confirmed) {
      setLoading(true);
      try {
        await Promise.all(rows.map((row) => deleteAccessControl(row.id, token)));
        setRefreshTrigger((prev) => prev + 1);
        showSuccessAlert('Deleted!', `${rows.length} items have been deleted.`);
        setSelectedRows([]); // reset selected rows
      } catch (error) {
        console.error(error);
        showErrorAlert('Error!', 'Failed to delete some items.');
      } finally {
        setLoading(false);
      }
    }
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

  return (
    <>
      <PageContainer title="Manage Access Control Space" description="Site page">
        <Box>
          <Grid container spacing={3}>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} />
            </Grid>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              {isDataReady ? (
                <DynamicTable
                  isHavePagination={true}
                  selectedRows={selectedRows}
                  totalCount={totalFilteredRecords}
                  defaultRowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[5, 10, 20]}
                  onPaginationChange={(page, rowsPerPage) => {
                    setPage(page);
                    setRowsPerPage(rowsPerPage);
                  }}
                  overflowX={'auto'}
                  data={tableData}
                  isHaveChecked={true}
                  isHaveAction={true}
                  isHaveSearch={true}
                  isHaveFilter={true}
                  isHaveExportPdf={true}
                  isHaveExportXlf={false}
                  isHaveFilterDuration={false}
                  isHaveAddData={true}
                  isHaveHeader={false}
                  onCheckedChange={(selected) => {
                    const selectedItem = selected.map((item) => ({
                      ...item,
                      brand_id: item.brand_name, // assuming brand_name is the equivalent of brand_id
                      integration_id: item.integration_name, // assuming integration_name is the equivalent of integration_id
                    }));
                    setSelectedRows(selectedItem);
                  }}
                  onEdit={(row) => {
                    handleEdit(row.id);
                    setEdittingId(row.id);
                  }}
                  onDelete={(row) => handleDelete(row.id)}
                  onBatchDelete={handleBatchDelete}
                  onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                  onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                  onAddData={() => {
                    handleAdd();
                  }}
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
      </PageContainer>
      <Dialog open={openCreateAccessControl} onClose={handleDialogClose} fullWidth maxWidth="md">
        <DialogTitle sx={{ position: 'relative', padding: 5 }}>
          {edittingId ? 'Edit' : 'Add'} Access Control
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
          <FormAccessControl
            formData={formDataAddAccessControl}
            setFormData={setFormDataAddAccessControl}
            onSuccess={() => {
              localStorage.removeItem('unsavedAccessControlData');
              handleCloseDialog();
              setRefreshTrigger(refreshTrigger + 1);
              if (edittingId) {
                Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  text: 'Access Control successfully updated!',
                });
              } else {
                Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  text: 'Access Control successfully created!',
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
          You have unsaved changes for another Access Control. Are you sure you want to discard them
          and edit this Access Control?
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
