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
import { IconSitemap } from '@tabler/icons-react';
import {
  showConfirmDelete,
  showSuccessAlert,
  showErrorAlert,
} from 'src/customs/components/alerts/alerts';

type SiteTableRow = {
  id: string;
  name: string;
  description: string;
  image: string;
};

type EnableField = {
  type: boolean;
  type_approval: boolean;
  timezone: boolean;
  signout_time: boolean;
  need_approval: boolean;
  can_visited: boolean;
  can_signout: boolean;
  auto_signout: boolean;
  can_contactless_login: boolean;
  need_document: boolean;
};

const Content = () => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [tableRowSite, setTableRowSite] = useState<SiteTableRow[]>([]);
  // const [selectedRows, setSelectedRows] = useState<SiteTableRow[]>([]);
  const [edittingId, setEdittingId] = useState('');
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const [formDataAddSite, setFormDataAddSite] = useState<Item>(() => {
    const saved = localStorage.getItem('unsavedSiteForm');
    return saved ? JSON.parse(saved) : CreateSiteRequestSchema.parse({});
  });

  const [openFormCreateSiteSpace, setOpenFormCreateSiteSpace] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [shouldSaveToStorage, setShouldSaveToStorage] = useState(true);
  const [isBatchEdit, setIsBatchEdit] = useState(false);

  const cards = [
    {
      title: 'Total Site Space',
      subTitle: `${totalFilteredRecords}`,
      icon: IconSitemap,
      subTitleSetting: 10,
      color: 'none',
    },
  ];
  const defaultFormData = CreateSiteRequestSchema.parse({});

  // Cek apakah form berubah
  const isFormChanged = JSON.stringify(formDataAddSite) !== JSON.stringify(defaultFormData);

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
  useEffect(() => {
    if (!shouldSaveToStorage) return;

    const isDifferentFromDefault =
      JSON.stringify(formDataAddSite) !== JSON.stringify(CreateSiteRequestSchema.parse({}));

    if (isDifferentFromDefault) {
      localStorage.setItem('unsavedSiteForm', JSON.stringify(formDataAddSite));
    }
  }, [formDataAddSite, shouldSaveToStorage]);

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
        console.log('Table data:', response.RecordsFiltered);
        setIsDataReady(true);
        const rows = response.collection.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          image: item.image,
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

  // Create Site space state management

  const handleOpenDialog = () => {
    setOpenFormCreateSiteSpace(true);
  };
  const [isEditing, setIsEditing] = useState(false);

  const handleCloseModalCreateSiteSpace = () => {
    localStorage.removeItem('unsavedSiteForm');
    setOpenFormCreateSiteSpace(false);
    setIsBatchEdit(false);
    setIsEditing(false);
  };

  // Handle Add
  const handleAdd = () => {
    const editing = localStorage.getItem('unsavedSiteForm');

    if (editing) {
      const parsed = JSON.parse(editing);

      // Kalau ID kosong → artinya sedang proses ADD, bukan edit
      if (!parsed.id || parsed.id === '') {
        setFormDataAddSite(parsed); // load kembali data sebelumnya
        setEdittingId('');
        handleOpenDialog(); // langsung buka modal
        return;
      }

      // Kalau ada ID → berarti user lagi ngedit data lain
      setPendingEditId(null);
      setConfirmDialogOpen(true);
      return;
    }

    // Tidak ada data di localStorage → buat form baru
    setFormDataAddSite({ ...CreateSiteRequestSchema.parse({}), id: '' });
    setEdittingId('');
    handleOpenDialog();
  };

  // Handle Edit
  const handleEdit = (id: string) => {
    const editing = localStorage.getItem('unsavedSiteForm');
    console.log(editing);
    if (editing) {
      const parsed = JSON.parse(editing);
      if (parsed.id === id) {
        handleOpenDialog();
      } else {
        setPendingEditId(id);
        setConfirmDialogOpen(true);
        return;
      }
    }

    const found = tableData.find((item) => item.id === id);
    if (!found) return;

    try {
      const parsedData = { ...CreateSiteRequestSchema.parse(found), id };
      setEdittingId(id);
      setFormDataAddSite(parsedData); // ini akan tersimpan ulang di useEffect
      localStorage.setItem('unsavedSiteForm', JSON.stringify(parsedData)); // simpan langsung
      handleOpenDialog();
    } catch (error) {
      console.error('Error parsing data:', error);
    }
  };

  const handleConfirmEdit = () => {
    setConfirmDialogOpen(false);
    localStorage.removeItem('unsavedSiteForm');
    setShouldSaveToStorage(false); // jangan trigger autosave

    if (pendingEditId) {
      const found = tableData.find((item) => item.id === pendingEditId);
      if (found) {
        const parsedData = {
          ...CreateSiteRequestSchema.parse(found),
          id: pendingEditId,
        };

        // 🔁 Set ulang data untuk edit yang baru
        setEdittingId(pendingEditId);
        setFormDataAddSite(parsedData);
        setShouldSaveToStorage(true); // aktifkan kembali autosave
        localStorage.setItem('unsavedSiteForm', JSON.stringify(parsedData));
        handleCloseModalCreateSiteSpace();
        setIsEditing(true);
      }
    } else if (!pendingEditId) {
      setEdittingId('');
      setFormDataAddSite({ ...CreateSiteRequestSchema.parse({}), id: '' });
      // Jangan buka modal, hanya close dialog discard saja
      handleCloseModalCreateSiteSpace();
      setIsEditing(false);
    }

    setPendingEditId(null);
  };

  const handleCancelEdit = () => {
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  // Delete Site Space
  const handleDelete = async (id: string) => {
    if (!token) return;

    const confirm = await showConfirmDelete(
      'Are you sure you want to delete this site space?',
      "You won't be able to revert this!",
    );

    if (confirm) {
      setLoading(true);
      try {
        await deleteSiteSpace(id, token);
        setRefreshTrigger((prev) => prev + 1);
        showSuccessAlert('Deleted!', 'Site space has been deleted.');
      } catch (error) {
        console.error(error);
        showErrorAlert('Failed!', 'Failed to delete site space.');
        setTimeout(() => setLoading(false), 500);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    }
  };

  // Delete Batch Site Space
  const handleBatchDelete = async (rows: SiteTableRow[]) => {
    if (!token || rows.length === 0) return;

    const confirmed = await showConfirmDelete(
      `Are you sure to delete ${rows.length} items?`,
      "You won't be able to revert this!",
    );

    if (confirmed) {
      setLoading(true);
      try {
        await Promise.all(rows.map((row) => deleteSiteSpace(row.id, token)));
        setRefreshTrigger((prev) => prev + 1);
        setSelectedRows([]); // <<< Reset setelah delete
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
        handleCloseModalCreateSiteSpace();
      }
    }
  };

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

  const [enabledFields, setEnabledFields] = useState<EnableField>({
    type: false,
    type_approval: false,
    timezone: false,
    signout_time: false,
    need_approval: false,
    can_visited: false,
    can_signout: false,
    auto_signout: false,
    can_contactless_login: false,
    need_document: false,
  });

  const handleBatchEdit = (rows: any[]) => {
    const selectedId = rows[0]?.id;
    setEdittingId(selectedId);
    setIsBatchEdit(true);
    handleOpenDialog();
  };

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
                isHaveImage={true}
                rowsPerPageOptions={[5, 10, 20, 50, 100]}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                overflowX={'auto'}
                data={tableRowSite}
                selectedRows={selectedRows}
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
                  const fullSelectedItems = tableData.filter((item) =>
                    selected.some((row: SiteTableRow) => row.id === item.id),
                  );
                  setSelectedRows(fullSelectedItems);
                }}
                onEdit={(row) => {
                  handleEdit(row.id);
                  setEdittingId(row.id);
                }}
                onBatchEdit={handleBatchEdit}
                onDelete={(row) => handleDelete(row.id)}
                onBatchDelete={handleBatchDelete}
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
      <Dialog open={openFormCreateSiteSpace} onClose={handleDialogClose} fullWidth maxWidth="xl">
        <DialogTitle
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
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
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ paddingTop: 0 }}>
          <br />
          <FormSite
            formData={formDataAddSite}
            setFormData={setFormDataAddSite}
            onSuccess={() => {
              localStorage.removeItem('unsavedSiteForm');
              setSelectedRows([]); // <<< Tambahkan ini
              setRefreshTrigger((prev) => prev + 1);
              handleCloseModalCreateSiteSpace();
            }}
            editingId={edittingId}
            isBatchEdit={isBatchEdit}
            selectedRows={selectedRows}
            enabledFields={enabledFields}
            setEnabledFields={setEnabledFields}
          />
        </DialogContent>
      </Dialog>
      {/* Dialog Confirm edit */}
      <Dialog open={confirmDialogOpen} onClose={handleCancelEdit}>
        <DialogTitle ref={dialogRef}>Unsaved Changes</DialogTitle>
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
