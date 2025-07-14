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

const Content = () => {
  const theme = useTheme();

  // Pagination state.
  const [accessControlData, setAccessControlData] = useState<Item[]>([]);
  const [tableData, setTableData] = useState<AccessControlTableRow[]>([]);
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
        const response = await getAllAccessControlPagination(token, page, rowsPerPage, sortColumn);
        setTotalRecords(response.RecordsTotal);
        setTotalFilteredRecords(response.RecordsFiltered);
        setAccessControlData(response.collection);
        setIsDataReady(true);
        const rows: AccessControlTableRow[] = response.collection.map((item) => ({
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
        setTableData(rows);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, page, rowsPerPage, sortColumn, refreshTrigger]);
  const [formDataAddAccessControl, setFormDataAddAccessControl] =
    useState<CreateAccessControlRequest>(() => {
      const saved = localStorage.getItem('unsavedAccessControlData');
      return saved ? JSON.parse(saved) : {};
    });
  useEffect(() => {
    localStorage.setItem('unsavedAccessControlData', JSON.stringify(formDataAddAccessControl));
  }, [formDataAddAccessControl]);

  const cards = [
    {
      title: 'Total Access Control',
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
  const handleEdit = (accessControl: AccessControlTableRow) => {
    const editing = localStorage.getItem('unsavedAccessControlData');
    console.log('editing', editing)
    console.log('id', accessControl)
    if (editing) {
      const parsed = JSON.parse(editing);
      const filtered = tableData.filter((item) => item.id === accessControl.id);
      console.log(filtered);
      if (parsed.id === accessControl.id) {

        handleOpenDialog();
      } else {
        console.log('ID tidak cocok', accessControl.id);
        setPendingEditId(accessControl.id);
        setConfirmDialogOpen(true);
      }
    } else {
      setFormDataAddAccessControl(
        CreateAccessControlRequestSchema.parse(tableData.find((item) => item.id === accessControl.id) || {}),
      );
      handleOpenDialog();
    }
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
      setFormDataAddAccessControl(
        CreateAccessControlRequestSchema.parse(
          tableData.find((item) => item.id === pendingEditId) || {},
        ),
      );
    } else {
      // Add new site
      setFormDataAddAccessControl(CreateAccessControlRequestSchema.parse({}));
    }
    handleOpenDialog();
    setPendingEditId(null);
  };

  const handleCancelEdit = () => {
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  const handleDelete = async (id: string) => {
    if (!token) return;

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteAccessControl(id, token);
          setRefreshTrigger((prev) => prev + 1);
          Swal.fire({
            title: 'Deleted!',
            text: 'Your Access Control has been deleted.',
            icon: 'success',
          });
        } catch (error) {
          console.error(error);
          Swal.fire({
            title: 'Error!',
            text: 'Something went wrong while deleting.',
            icon: 'error',
          });
        }
      }
    });
  };

  return (
    <>
      <PageContainer title="Manage Site Space" description="Site page">
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
                onCheckedChange={(selected) => console.log('Checked table row:', selected)}
                onEdit={(row) => handleEdit(row)}
                onDelete={(row) => handleDelete(row.id)}
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
      <Dialog open={openCreateAccessControl} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ position: 'relative', padding: 5 }}>
          {edittingId ? 'Edit' : 'Add'} Access Control
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
          <FormAccessControl
            formData={formDataAddAccessControl}
            setFormData={setFormDataAddAccessControl}
            onSuccess={() => {
              handleCloseDialog();
              setRefreshTrigger(refreshTrigger + 1);
            }}
          />
        </DialogContent>
      </Dialog>
      {/* Dialog Confirm edit */}
      <Dialog open={confirmDialogOpen} onClose={handleCancelEdit}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
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
