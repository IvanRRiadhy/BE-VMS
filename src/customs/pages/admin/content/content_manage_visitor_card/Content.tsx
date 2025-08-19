import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Skeleton,
  TableRow,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  Card,
  Divider,
  Grid2 as Grid,
  IconButton,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import CloseIcon from '@mui/icons-material/Close';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import FormWizardAddVisitorCard from './FormWizardAddVisitorCard';
import {
  CreateVisitorCardRequest,
  CreateVisitorCardRequestSchema,
  Item,
} from 'src/customs/api/models/VisitorCard';
import { useSession } from 'src/customs/contexts/SessionContext';
import { useRef } from 'react';
import { getAllVisitorCardPagination, deleteVisitorCard } from 'src/customs/api/admin';
import {
  showConfirmDelete,
  showErrorAlert,
  showSuccessAlert,
} from 'src/customs/components/alerts/alerts';

import {
  IconCards,
  IconUserCheck,
  IconCircleX,
  IconCircleCheck,
  IconUserOff,
} from '@tabler/icons-react';
import axiosInstance from 'src/customs/api/interceptor';

type EnableField = {
  employee_id: boolean;
  is_multi_site: boolean;
  registered_site: boolean;
  is_employee_used: boolean;
};

type ImportErrorRow = {
  status?: string;
  msg?: string;
  data?: {
    name?: string;
    remarks?: string;
    type?: number;
    card_number?: string;
    card_mac?: string;
    card_barcode?: string;
    card_status?: number | null;
    [k: string]: any;
  };
};

const Content = () => {
  const { token } = useSession();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [tableVisitorCard, setTableVisitorCard] = useState<Item[]>([]);
  const [edittingId, setEdittingId] = useState('');
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [isDataReady, setIsDataReady] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [isBatchEdit, setIsBatchEdit] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  // Create Visitor card state management
  const [openFormCreateVisitorCard, setOpenFormCreateVisitorCard] = React.useState(false);
  const BASE_URL = axiosInstance.defaults.baseURL;
  const [importErrorOpen, setImportErrorOpen] = React.useState(false);
  const [importErrorTitle, setImportErrorTitle] = React.useState<string>('');
  const [importErrorMsg, setImportErrorMsg] = React.useState<string>('');
  const [importErrorRows, setImportErrorRows] = React.useState<ImportErrorRow[]>([]);
  const cards = [
    {
      title: 'Total Card',
      icon: IconCards,
      subTitle: `${tableVisitorCard.length}`,
      color: 'none',
    },
    {
      title: 'Total Check In',
      icon: IconUserCheck,
      subTitle: `${tableVisitorCard.filter((v) => v.checkin_at).length}`, // contoh filter
      subTitleSetting: tableVisitorCard.filter((v) => v.checkin_at).length,
      color: 'none',
    },
    {
      title: 'Total Check Out',
      icon: IconUserOff,
      subTitle: `${tableVisitorCard.filter((v) => v.checkout_at).length}`,
      subTitleSetting: tableVisitorCard.filter((v) => v.checkout_at).length,
      color: 'none',
    },
    {
      title: 'Total Card Active',
      icon: IconCircleCheck,
      subTitle: `${tableVisitorCard.filter((v) => v.card_status === 1).length}`,
      subTitleSetting: tableVisitorCard.filter((v) => v.card_status === 1).length,
      color: 'none',
    },
    // {
    //   title: 'Total Card Non Active',
    //   icon: IconCircleX,
    //   subTitle: `${tableVisitorCard.filter((v) => v.card_status === 0).length}`,
    //   subTitleSetting: tableVisitorCard.filter((v) => v.card_status === 0).length,
    //   color: 'none',
    // },
  ];

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const start = page * rowsPerPage;
        const response = await getAllVisitorCardPagination(
          token,
          start,
          rowsPerPage,
          sortColumn,
          searchKeyword,
        );
        setTotalRecords(response.RecordsTotal);
        setTotalFilteredRecords(response.RecordsFiltered);
        if (response) {
          setTableVisitorCard(response.collection);
          setIsDataReady(true);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, page, rowsPerPage, sortColumn, refreshTrigger, searchKeyword]);

  const handleOpenDialog = () => {
    setOpenFormCreateVisitorCard(true);
  };
  const handleCloseModalCreateVisitorCard = () => {
    setOpenFormCreateVisitorCard(false);
    setEdittingId(''); // Reset editing state
    setIsBatchEdit(false);
    localStorage.removeItem('unsavedVisitorCardData');
  };

  // Form Default State Management
  const [formAddVisitorCard, setFormAddVisitorCard] = useState<CreateVisitorCardRequest>(() => {
    const saved = localStorage.getItem('unsavedVisitorCardData');
    return saved ? JSON.parse(saved) : CreateVisitorCardRequestSchema.parse({});
  });

  const defaultFormData = CreateVisitorCardRequestSchema.parse({});

  const isFormChanged = JSON.stringify(formAddVisitorCard) !== JSON.stringify(defaultFormData);

  useEffect(() => {
    if (Object.keys(formAddVisitorCard).length > 0) {
      localStorage.setItem('unsavedVisitorCardData', JSON.stringify(formAddVisitorCard));
    }
  }, [formAddVisitorCard]);

  // Handle Add Visitor Card
  const handleAddVisitorCard = useCallback(() => {
    // try {
    //   const freshForm = CreateVisitorCardRequestSchema.parse({});
    //   setFormAddVisitorCard(freshForm);
    //   localStorage.setItem('unsavedVisitorCardData', JSON.stringify(freshForm));
    //   handleOpenDialog();
    // } catch (error) {
    //   console.error('Error adding visitor card:', error);
    // }
    let saved = localStorage.getItem('unsavedVisitorCardData');
    let freshForm;
    if (saved) {
      freshForm = JSON.parse(saved);
    } else {
      freshForm = CreateVisitorCardRequestSchema.parse({});
      localStorage.setItem('unsavedVisitorCardData', JSON.stringify(freshForm));
    }

    setEdittingId('');
    setFormAddVisitorCard(freshForm);
    setPendingEditId(null);
    handleOpenDialog();
  }, []);

  // Handle Edit Visitor Card
  const handleEdit = (id: string) => {
    const existingData = tableVisitorCard.find((item) => item.id === id);
    if (!existingData) return;

    const editing = localStorage.getItem('unsavedVisitorCardData');

    if (!editing) {
      const parsedData = CreateVisitorCardRequestSchema.parse(existingData);
      setEdittingId(id);
      setFormAddVisitorCard(parsedData);
      localStorage.setItem('unsavedVisitorCardData', JSON.stringify({ ...parsedData, id }));
      handleOpenDialog();
      return;
    }

    const editingData = JSON.parse(editing);

    const formChanged =
      JSON.stringify(editingData) !== JSON.stringify(CreateVisitorCardRequestSchema.parse({}));

    if (editingData.id === id || !formChanged) {
      const parsedData = CreateVisitorCardRequestSchema.parse(existingData);
      setEdittingId(id);
      setFormAddVisitorCard(parsedData);
      handleOpenDialog();
      return;
    }

    setPendingEditId(id);
    setConfirmDialogOpen(true);
  };

  // Handle Delete Visitor Card
  const handleDeleteVisitorCard = async (id: string) => {
    const confirmed = await showConfirmDelete('Are you sure?', "You won't be able to revert this!");

    if (confirmed) {
      setLoading(true);
      try {
        await deleteVisitorCard(token as string, id);
        setRefreshTrigger(refreshTrigger + 1);
        showSuccessAlert('Deleted!', 'Visitor Card has been deleted.');
      } catch (error) {
        console.error('Error deleting visitor card:', error);
        showErrorAlert('Failed!', 'Failed to delete visitor card.');
        setTimeout(() => setLoading(false), 500);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    }
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    localStorage.removeItem('unsavedVisitorCardData');

    if (!edittingId) {
      setFormAddVisitorCard(CreateVisitorCardRequestSchema.parse({}));
    }
  };

  const handleBatchDelete = async (rows: Item[]) => {
    if (rows.length === 0) return;

    const confirmed = await showConfirmDelete(
      `Are you sure to delete ${rows.length} items?`,
      "You won't be able to revert this!",
    );

    if (confirmed) {
      setLoading(true);
      try {
        await Promise.all(rows.map((row) => deleteVisitorCard(token as string, row.id)));

        // Kosongkan selected dan checkbox setelah delete berhasil
        setSelectedRows([]);
        setCheckedIds([]);

        setRefreshTrigger((prev) => prev + 1);
        showSuccessAlert('Deleted!', `${rows.length} items have been deleted.`);
        return true;
      } catch (error) {
        console.error(error);
        showErrorAlert('Error!', 'Failed to delete some items.');
        return false;
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBatchEdit = (rows: any[]) => {
    const selectedId = rows[0]?.id;
    setEdittingId(selectedId);
    setIsBatchEdit(true);
    handleOpenDialog();
  };

  const [enabledFields, setEnabledFields] = React.useState<EnableField>({
    employee_id: false,
    registered_site: false,
    is_multi_site: false,
    is_employee_used: false,
  });

  // const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   const formData = new FormData();
  //   formData.append('batch', file); // pastikan backend menerima 'file' sebagai key

  //   try {
  //     setLoading(true);
  //     const response = await fetch('http://192.168.1.116:8000/api/card/create-batch', {
  //       method: 'POST',
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: formData,
  //     });

  //     const text = await response.text(); // ✅ ini aman untuk semua format

  //     let result: any;
  //     try {
  //       result = JSON.parse(text); // ✅ hanya parse jika memang JSON
  //     } catch (err) {
  //       throw new Error(`Unexpected response: ${text}`);
  //     }

  //     if (!response.ok) throw new Error(result.message || 'Import failed.');

  //     showSuccessAlert('Success', 'Visitor Card imported successfully');
  //     setRefreshTrigger((prev) => prev + 1);
  //   } catch (err: any) {
  //     console.error('Import error:', err);
  //     showErrorAlert('Error', err.message || 'Failed to import data.');
  //   } finally {
  //     setLoading(false);
  //     // Reset file input agar bisa upload ulang file yang sama jika perlu
  //     e.target.value = '';
  //   }
  // };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('batch', file);

    try {
      setLoading(true);
      const resp = await fetch(`${BASE_URL}/card/create-batch`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const text = await resp.text(); // aman untuk semua
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        json = null;
      }

      if (!resp.ok) {
        const title = 'Import failed';
        const msg = json?.msg || 'Bad request';
        const rows: ImportErrorRow[] = Array.isArray(json?.collection) ? json.collection : [];

        setImportErrorTitle(title);
        setImportErrorMsg(msg);
        setImportErrorRows(rows);
        setImportErrorOpen(true);

        return;
      }

      showSuccessAlert('Success', 'Visitor Card imported successfully');
      setRefreshTrigger((p) => p + 1);
    } catch (err: any) {
      showErrorAlert('Error', err?.message ?? 'Failed to import');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleConfirmEditDiscard = () => {
    setConfirmDialogOpen(false);
    localStorage.removeItem('unsavedVisitorCardData');
    if (pendingEditId) {
      const existingData = tableVisitorCard.find((item) => item.id === pendingEditId);

      setEdittingId(pendingEditId);
      setFormAddVisitorCard(CreateVisitorCardRequestSchema.parse(existingData));
      localStorage.setItem(
        'unsavedVisitorCardData',
        JSON.stringify({
          ...CreateVisitorCardRequestSchema.parse(existingData),
          id: pendingEditId,
        }),
      );
      setOpenFormCreateVisitorCard(true);
    } else {
      setFormAddVisitorCard(CreateVisitorCardRequestSchema.parse({}));
      handleOpenDialog();
    }
    setPendingEditId(null);
    handleCloseModalCreateVisitorCard();
  };

  const handleCancelEditDiscard = () => {
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  return (
    <>
      <PageContainer title="Manage Visitor Card" description="this is Dashboard page">
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
                  overflowX={'auto'}
                  data={tableVisitorCard}
                  selectedRows={selectedRows}
                  setSelectedRows={setSelectedRows}
                  isHavePagination={true}
                  totalCount={totalFilteredRecords}
                  defaultRowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[5, 10, 20, 50, 100]}
                  onPaginationChange={(page, rowsPerPage) => {
                    setPage(page);
                    setRowsPerPage(rowsPerPage);
                  }}
                  isHaveChecked={true}
                  isHaveAction={true}
                  isHaveSearch={true}
                  isHaveFilter={true}
                  isHaveExportPdf={true}
                  isHaveExportXlf={false}
                  onImportExcel={handleImportExcel}
                  isHaveImportExcel={true}
                  isHaveFilterDuration={false}
                  isHaveAddData={true}
                  isHaveHeader={false}
                  onCheckedChange={(selected) => setSelectedRows(selected)}
                  onEdit={(row) => {
                    handleEdit(row.id);
                    setEdittingId(row.id);
                  }}
                  onBatchEdit={handleBatchEdit}
                  onDelete={(row) => handleDeleteVisitorCard(row.id)}
                  onBatchDelete={handleBatchDelete}
                  onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                  onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                  onAddData={() => {
                    handleAddVisitorCard();
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

      <Dialog
        open={importErrorOpen}
        onClose={() => setImportErrorOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>{importErrorTitle}</DialogTitle>
        <DialogContent dividers>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Card Number</TableCell>
                  <TableCell>Card MAC</TableCell>
                  <TableCell>Barcode</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Remarks</TableCell>
                  <TableCell>Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {importErrorRows.map((row, i) => {
                  const d = row.data || {};
                  const statusLabel =
                    d.card_status === 1
                      ? 'Active'
                      : d.card_status === 0
                      ? 'Inactive'
                      : d.card_status ?? '-';
                  return (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{row.msg || '-'}</TableCell>
                      <TableCell>{d.card_number ?? '-'}</TableCell>
                      <TableCell>{d.card_mac ?? '-'}</TableCell>
                      <TableCell>{d.card_barcode ?? '-'}</TableCell>
                      <TableCell align="center">{statusLabel}</TableCell>
                      <TableCell>{d.name ?? '-'}</TableCell>
                      <TableCell>{d.remarks ?? '-'}</TableCell>
                      <TableCell>{d.type ?? '-'}</TableCell>
                    </TableRow>
                  );
                })}
                {importErrorRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No error details.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportErrorOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openFormCreateVisitorCard}
        onClose={handleCloseModalCreateVisitorCard}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
          {isBatchEdit ? 'Batch Edit' : edittingId ? 'Edit' : 'Add'} Card
          <IconButton
            aria-label="close"
            onClick={() => {
              if (isFormChanged) {
                setConfirmDialogOpen(true); // ada perubahan, tampilkan dialog konfirmasi
              } else {
                handleCloseModalCreateVisitorCard(); // tidak ada perubahan, langsung tutup
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <br />
          <FormWizardAddVisitorCard
            formData={formAddVisitorCard}
            setFormData={setFormAddVisitorCard}
            edittingId={edittingId}
            isBatchEdit={isBatchEdit}
            onSuccess={handleSuccess}
            selectedRows={selectedRows}
            enabledFields={enabledFields}
            setEnabledFields={setEnabledFields}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDialogOpen} onClose={handleCancelEditDiscard}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          You have unsaved changes for another Employee. Are you sure you want to discard them and
          edit this Employee?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEditDiscard}>Cancel</Button>
          <Button onClick={handleConfirmEditDiscard} color="primary" variant="contained">
            Yes, Discard and Continue
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Content;
