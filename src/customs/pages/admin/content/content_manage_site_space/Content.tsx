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
import { useRef } from 'react';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import FormSite from './FormSite';
import CloseIcon from '@mui/icons-material/Close';
import {
  CreateSiteRequest,
  CreateSiteRequestSchema,
  Item,
  generateKeyCode,
} from 'src/customs/api/models/Sites';
import { uniqueId } from 'lodash';
import { useSession } from 'src/customs/contexts/SessionContext';
import { deleteSiteSpace, getAllSitePagination } from 'src/customs/api/admin';
import Swal from 'sweetalert2';

type SiteTableRow = {
  id: string;
  name: string;
  description: string;
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
  const [tableRowSite, setTableRowSite] = React.useState<SiteTableRow[]>([]);
  const [edittingId, setEdittingId] = useState('');
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const [formDataAddSite, setFormDataAddSite] = React.useState<Item>(() => {
    const saved = localStorage.getItem('unsavedSiteForm');
    return saved ? JSON.parse(saved) : CreateSiteRequestSchema.parse({});
  });

  const defaultFormData = CreateSiteRequestSchema.parse({});

  // Cek apakah form berubah
  const isFormChanged = JSON.stringify(formDataAddSite) !== JSON.stringify(defaultFormData);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      console.log('Fetching data...');
      setLoading(true);
      try {
        const start = page * rowsPerPage;
        const response = await getAllSitePagination(
          token,
          start,
          rowsPerPage,
          sortColumn,
          searchKeyword,
        );
        console.log('Response from API:', response);
        setTableData(response.collection);
        setTotalRecords(response.RecordsTotal);
        setTotalFilteredRecords(response.RecordsFiltered);
        setIsDataReady(true);
        console.log('Table data:', tableData);
        const rows = response.collection.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          // status: item.settings.status === true ? 'Active' : 'Inactive',
        }));

        setTableRowSite(rows);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, page, rowsPerPage, sortColumn, refreshTrigger, searchKeyword]);

  useEffect(() => {
    localStorage.setItem('unsavedSiteForm', JSON.stringify(formDataAddSite));
  }, [formDataAddSite]);

  const cards = [
    {
      title: 'Total Site',
      subTitle: `${totalFilteredRecords}`,
      subTitleSetting: 10,
      color: 'none',
    },
  ];

  // Create Site space state management
  const [openFormCreateSiteSpace, setOpenFormCreateSiteSpace] = React.useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [pendingEditId, setPendingEditId] = React.useState<string | null>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        openFormCreateSiteSpace &&
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        if (isFormChanged) {
          setConfirmDialogOpen(true); // buka dialog konfirmasi
        } else {
          handleCloseModalCreateSiteSpace(); // tutup langsung kalau tidak ada perubahan
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openFormCreateSiteSpace, isFormChanged]);

  const handleOpenDialog = () => {
    setOpenFormCreateSiteSpace(true);
  };
  const handleCloseModalCreateSiteSpace = () => {
    // localStorage.removeItem('unsavedSiteForm');
    setOpenFormCreateSiteSpace(false);
    setEdittingId(''); // Reset
  };

  const handleAdd = () => {
    const editing = localStorage.getItem('unsavedSiteForm');
    console.log(editing);
    if (editing) {
      const parsed = JSON.parse(editing);
      if (parsed.id !== '') {
        // If editing exists, show confirmation dialog for add
        setPendingEditId(null); // null means it's an add, not edit
        setConfirmDialogOpen(true);
      } else {
        handleOpenDialog();
      }
    } else {
      setFormDataAddSite({ ...CreateSiteRequestSchema.parse({}), id: '' });
      handleOpenDialog();
    }
  };

  const handleEdit = (id: string) => {
    const editing = localStorage.getItem('unsavedSiteForm');
    console.log(editing);
    if (editing) {
      const parsed = JSON.parse(editing);
      if (parsed.id === id) {
        handleOpenDialog();
      } else {
        console.log('ID tidak cocok');
        setPendingEditId(id);
        setConfirmDialogOpen(true);
      }
    } else {
      setFormDataAddSite({
        ...CreateSiteRequestSchema.parse(tableData.find((item) => item.id === id) || {}),
        id: id,
      });
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
      setFormDataAddSite(
        tableData.find((item) => item.id === pendingEditId) || {
          ...CreateSiteRequestSchema.parse({}),
          id: '',
        },
      );
    } else {
      // Add new site
      setFormDataAddSite({ ...CreateSiteRequestSchema.parse({}), id: '' });
    }
    // handleOpenDialog();
    handleCloseModalCreateSiteSpace();
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
          await deleteSiteSpace(id, token);

          setRefreshTrigger((prev) => prev + 1);
          Swal.fire({
            title: 'Deleted!',
            text: 'Your file has been deleted.',
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

  // --------------
  return (
    <>
      <PageContainer title="Manage Site Space" description="Site page">
        <Box>
          <Grid container spacing={3}>
            {/* column */}
            <Grid size={{ xs: 4, lg: 4 }}>
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
                  handleEdit(row.id);
                  setEdittingId(row.id);
                }}
                onDelete={(row) => handleDelete(row.id)}
                onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                onAddData={() => {
                  handleAdd();
                }}
              />{' '}
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
      {/* Dialog create employee */}
      <Dialog
        open={openFormCreateSiteSpace}
        onClose={handleCloseModalCreateSiteSpace}
        fullWidth
        maxWidth="xl"
      >
        <DialogTitle sx={{ position: 'relative', padding: 5 }}>
          {edittingId ? 'Edit' : 'Add'} Site Space
          <IconButton
            aria-label="close"
            onClick={() => {
              if (isFormChanged) {
                setConfirmDialogOpen(true);
              } else {
                handleCloseModalCreateSiteSpace(); // langsung tutup kalau tidak ada perubahan
              }
            }}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent ref={dialogRef}>
          <br />
          <FormSite
            formData={formDataAddSite}
            setFormData={setFormDataAddSite}
            onSuccess={() => {
              handleCloseModalCreateSiteSpace();
              setRefreshTrigger((prev) => prev + 1);
              // localStorage.removeItem('unsavedSiteForm');
            }}
            editingId={edittingId}
          />
        </DialogContent>
      </Dialog>
      {/* Dialog Confirm edit */}
      <Dialog open={confirmDialogOpen} onClose={handleCancelEdit}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          You have unsaved changes for another site. Are you sure you want to discard them and edit
          this site?
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
