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
import PageContainer from 'src/customs/components/container/PageContainer';
import Container from 'src/components/container/PageContainer';

import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import CloseIcon from '@mui/icons-material/Close';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import {
  getAllAccessControl,
  getAllAccessControlPagination,
  deleteAccessControl,
} from 'src/customs/api/admin';
import {
  GetAllAccessControlResponse,
  GetAccessControlPaginationResponse,
  // Item,
  CreateAccessControlRequest,
  CreateAccessControlRequestSchema,
} from 'src/customs/api/models/Admin/AccessControl';
import FormAccessControl from './FormAccessControl';
import Swal from 'sweetalert2';

interface Item {
  brand_id: string;
  integration_id: string;
  brand_name: string;
  type: number;
  name: string;
  description: string;
  channel: string;
  door_id: string;
  raw: string;
  integration_name: string;
  id: string;
}

import { IconAccessible } from '@tabler/icons-react';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import { useSession } from 'src/customs/contexts/SessionContext';

const Content = () => {
  const [tableData, setTableData] = useState<Item[]>([]);
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const { token } = useSession();
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [edittingId, setEdittingId] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const [openCreateAccessControl, setOpenCreateAccessControl] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);

  const cards = [
    {
      title: 'Total Access Control',
      icon: IconAccessible,
      subTitle: `${totalFilteredRecords}`,
      subTitleSetting: 10,
      color: 'none',
    },
  ];

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const start = page * rowsPerPage;
        const response = await getAllAccessControlPagination(
          token,
          start,
          //  page,
          rowsPerPage,
          sortColumn,
          searchKeyword,
        );

        setTotalRecords(response.RecordsTotal);
        setTotalFilteredRecords(response.RecordsFiltered);

        const rows: any[] = response.collection.map((item: any) => ({
          // brand_id: item.brand_id,
          brand_name: item.brand_name,
          type: item.type,
          name: item.name,
          description: item.description,
          channel: item.channel,
          door_id: item.door_id,
          raw: item.raw,
          integration_name: item.integration_name,
          // integration_id: item.integration_id,
          id: item.id,
        }));
        if (response) {
          setTableData(rows);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, page, rowsPerPage, sortColumn, refreshTrigger, searchKeyword]);

  const defaultFormData: CreateAccessControlRequest = {
    brand_id: '',
    brand_name: '',
    integration_id: '',
    integration_name: '',
    type: -1,
    name: '',
    description: '',
    channel: '',
    door_id: '',
    raw: '{}',
  };

  const mapItemToFormData = (item?: Partial<Item>): CreateAccessControlRequest => ({
    brand_id: item?.brand_id ?? '',
    brand_name: item?.brand_name ?? '',
    integration_id: item?.integration_id ?? '',
    integration_name: item?.integration_name ?? '',
    type: item?.type ?? -1,
    name: item?.name ?? '',
    description: item?.description ?? '',
    channel: item?.channel ?? '',
    door_id: item?.door_id ?? '',
    raw: item?.raw ?? '{}',
  });

  const [formDataAddAccessControl, setFormDataAddAccessControl] =
    useState<CreateAccessControlRequest>(() => {
      const saved = localStorage.getItem('unsavedAccessControl');
      if (!saved) return defaultFormData;
      try {
        const parsed = JSON.parse(saved);
        return JSON.stringify(parsed) === JSON.stringify(defaultFormData)
          ? defaultFormData
          : parsed;
      } catch {
        return defaultFormData;
      }
    });

  const isFormChanged =
    JSON.stringify(formDataAddAccessControl) !== JSON.stringify(defaultFormData);

  useEffect(() => {
    if (isFormChanged) {
      localStorage.setItem('unsavedAccessControl', JSON.stringify(formDataAddAccessControl));
    } else {
      localStorage.removeItem('unsavedAccessControl');
    }
  }, [formDataAddAccessControl, isFormChanged]);

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

  const handleOpenDialog = () => {
    setOpenCreateAccessControl(true);
  };
  const handleCloseDialog = () => setOpenCreateAccessControl(false);

  const handleAdd = () => {
    const editing = localStorage.getItem('unsavedAccessControl');
    if (editing) {
      setPendingEditId(null);
      setConfirmDialogOpen(true);
    } else {
      setEdittingId('');
      setFormDataAddAccessControl(defaultFormData);
      handleOpenDialog();
    }
  };
  const handleEdit = (id: string) => {
    const editing = localStorage.getItem('unsavedAccessControl');

    if (editing) {
      setPendingEditId(id);
      setConfirmDialogOpen(true);
      return;
    }

    const data = tableData.find((item) => item.id === id);
    setFormDataAddAccessControl(mapItemToFormData(data));
    setEdittingId(id);
    handleOpenDialog();
  };

  const handleConfirmEdit = () => {
    setConfirmDialogOpen(false);
    localStorage.removeItem('unsavedAccessControl');
    setLoading(true);

    if (pendingEditId) {
      const data = tableData.find((item) => item.id === pendingEditId);
      setFormDataAddAccessControl(CreateAccessControlRequestSchema.parse(data) || defaultFormData);
      setEdittingId(pendingEditId);
      setLoading(false);
      handleOpenDialog();
    } else {
      setFormDataAddAccessControl(defaultFormData);
      setEdittingId('');
      setLoading(false);
      setOpenCreateAccessControl(false);
    }

    setPendingEditId(null);
  };

  const handleCancelEdit = () => {
    setConfirmDialogOpen(false);
    setPendingEditId(null);
    setEdittingId('');
  };

  const handleDelete = async (id: string) => {
    if (!token) return;

    const confirmed = await showConfirmDelete(
      'Are you sure you want to delete this Access Control?',
    );

    if (confirmed) {
      try {
        await deleteAccessControl(id, token);
        setRefreshTrigger((prev) => prev + 1);
        showSwal('success', 'Successfully deleted Access Control!');
      } catch (error) {
        console.error(error);
        showSwal('error', 'Failed to delete Access Control.');
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    }
  };

  const handleBatchDelete = async (rows: Item[]) => {
    if (!token || rows.length === 0) return;

    const confirmed = await showConfirmDelete(`Are you sure to delete ${rows.length} items?`);

    if (confirmed) {
      setLoading(true);
      try {
        await Promise.all(rows.map((row) => deleteAccessControl(row.id, token)));
        setRefreshTrigger((prev) => prev + 1);
        showSwal('success', `${rows.length} items have been deleted.`);
        setSelectedRows([]);
      } catch (error) {
        console.error(error);
        showSwal('error', 'Failed to delete some items.');
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

  const handleSuccess = () => {
    localStorage.removeItem('unsavedAccessControl');
    handleCloseDialog();
    setRefreshTrigger((prev) => prev + 1);

    showSwal(
      'success',
      edittingId ? 'Access Control successfully updated!' : 'Access Control successfully created!',
    );
  };

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Access Control" description="Access Control page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={loading}
                isHavePagination={true}
                isAccessControlType={true}
                selectedRows={selectedRows}
                totalCount={totalFilteredRecords}
                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 25, 50, 100, 250]}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                overflowX={'auto'}
                data={tableData}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveSearch={true}
                isHaveFilter={false}
                isHaveExportPdf={false}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                isHaveAddData={true}
                isHaveHeader={false}
                onCheckedChange={(selected) => {
                  const selectedItem = selected.map((item) => ({
                    ...item,
                    brand_id: item.brand_name,
                    integration_id: item.integration_name,
                  }));
                  setSelectedRows(selectedItem);
                }}
                onEdit={(row) => {
                  handleEdit(row.id);
                  setEdittingId(row.id);
                }}
                isDataVerified={true}
                onDelete={(row) => handleDelete(row.id)}
                onBatchDelete={handleBatchDelete}
                onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                // onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                onAddData={() => {
                  handleAdd();
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
      <Dialog open={openCreateAccessControl} onClose={handleDialogClose} fullWidth maxWidth="md">
        <DialogTitle sx={{ position: 'relative', padding: 2 }}>
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
              top: 6,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <FormAccessControl
            formData={formDataAddAccessControl}
            setFormData={setFormDataAddAccessControl}
            onSuccess={handleSuccess}
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
    </PageContainer>
  );
};

export default Content;
