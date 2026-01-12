import React, { useState, useEffect, useCallback, use } from 'react';
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
  Autocomplete,
  RadioGroup,
  TableCell,
  Typography,
  TableContainer,
  FormControl,
  FormControlLabel,
  Card,
  Divider,
  Grid2 as Grid,
  IconButton,
} from '@mui/material';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';

import Container from 'src/components/container/PageContainer';
import CloseIcon from '@mui/icons-material/Close';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import FormWizardAddVisitorCard from './FormWizardAddVisitorCard';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import {
  CreateVisitorCardRequest,
  CreateVisitorCardRequestSchema,
  Item,
} from 'src/customs/api/models/Admin/VisitorCard';
import { useSession } from 'src/customs/contexts/SessionContext';
import { useRef } from 'react';
import {
  getAllVisitorCardPagination,
  deleteVisitorCard,
  getAllVisitorCard,
} from 'src/customs/api/admin';
import {
  showConfirmDelete,
  showErrorAlert,
  showSuccessAlert,
  showSwal,
} from 'src/customs/components/alerts/alerts';

import {
  IconCards,
  IconUserCheck,
  IconCircleX,
  IconCircleCheck,
  IconUserOff,
  IconX,
} from '@tabler/icons-react';
import axiosInstance from 'src/customs/api/interceptor';
import { useDebounce } from 'src/hooks/useDebounce';

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

const typeMap: Record<string, number> = {
  'Non Access Card': 0,
  RFID: 1,
  'RFID Card': 1,
  BLE: 2,
};

const Content = () => {
  const { token } = useSession();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [tableVisitorCard, setTableVisitorCard] = useState<Item[]>([]);
  const [edittingId, setEdittingId] = useState('');
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const debounceSearch = useDebounce(searchKeyword, 500);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [isDataReady, setIsDataReady] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [isBatchEdit, setIsBatchEdit] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  // Create Visitor card state management
  const [openFormCreateVisitorCard, setOpenFormCreateVisitorCard] = useState(false);
  const BASE_URL = axiosInstance.defaults.baseURL;
  const [importErrorOpen, setImportErrorOpen] = useState(false);
  const [importErrorTitle, setImportErrorTitle] = useState<string>('');
  const [importErrorMsg, setImportErrorMsg] = useState<string>('');
  const [importErrorRows, setImportErrorRows] = useState<ImportErrorRow[]>([]);
  const [cardActiveCount, setCardActiveCount] = useState(0);
  const [cardInactiveCount, setCardInactiveCount] = useState(0);
  const [usedCard, setUsedCard] = useState(0);
  const [unUsedCard, setUnUsedCard] = useState(0);
  const cards = [
    {
      title: 'Total Card',
      icon: IconCards,
      subTitle: `${totalRecords}`,
      subTitleSetting: tableVisitorCard.length,
      color: 'none',
    },
    {
      title: 'Total Used Card',
      icon: IconUserCheck,
      subTitle: `${usedCard}`,
      color: 'none',
    },
    {
      title: 'Total Unused Card',
      icon: IconUserOff,
      subTitle: `${unUsedCard}`,
      // subTitleSetting: tableVisitorCard.filter((v) => v.is_used === false).length,
      color: 'none',
    },
    {
      title: 'Total Card Active',
      icon: IconCircleCheck,
      subTitle: `${cardActiveCount}`,
      subTitleSetting: tableVisitorCard.filter((v) => v.card_status === 1).length,
      color: 'none',
    },
    {
      title: 'Total Card Inactive',
      icon: IconCircleCheck,
      subTitle: `${cardInactiveCount}`,
      subTitleSetting: tableVisitorCard.filter((v) => v.card_status === 0).length,
      color: 'none',
    },
  ];

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const start = page * rowsPerPage;
        const res = await getAllVisitorCard(token);
        const response = await getAllVisitorCardPagination(
          token,
          start,
          rowsPerPage,
          sortColumn,
          searchKeyword,
          filters.type === -1 ? undefined : filters.type,
          filters.card_status === -1 ? undefined : filters.card_status,
        );

        setTotalRecords(response.RecordsTotal);
        setTotalFilteredRecords(response.RecordsFiltered);

        if (response) {
          const mapped = response.collection.map((x: any) => ({
            id: x.id,
            name: x.name,
            card_number: x.card_number,
            card_mac: x.card_mac,
            card_barcode: x.card_barcode,
            card_status: x.card_status,
            remarks: x.remarks,
            // employee_id: x.employee_id,
            employee_name: x.employee_name,
            type: x.type,
            site_name: x.site_name,
            registered_site: x.registered_site,
            is_used: x.is_used,
            is_employee_used: x.is_employee_used,
            is_multi_site: x.is_multi_site,
            // checkin_at: x.checkin_at,
            // checkout_at: x.checkout_at,
          }));
          setTableVisitorCard(mapped);
          setIsDataReady(true);
          const activeCount = res.collection.filter((item: any) => item.card_status === 1).length;
          const nonActiveCount = res.collection.filter(
            (item: any) => item.card_status === 0,
          ).length;
          const isUsedCount = res.collection.filter((item: any) => item.is_used === true).length;
          const isUnusedCount = res.collection.filter((item: any) => item.is_used === false).length;

          setCardActiveCount(activeCount);
          setCardInactiveCount(nonActiveCount);
          setUsedCard(isUsedCount);
          setUnUsedCard(isUnusedCount);
        }
      } catch (error: any) {
        // ✅ kalau 404 → kosongkan data
        if (error?.response?.status === 404) {
          setTableVisitorCard([]);
          setTotalRecords(0);
          setTotalFilteredRecords(0);
        } else {
          console.error('Error fetching data:', error);
        }
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

  const [initialFormData, setInitialFormData] = useState<CreateVisitorCardRequest>(
    CreateVisitorCardRequestSchema.parse({}),
  );

  const isFormChanged = React.useMemo(
    () => JSON.stringify(formAddVisitorCard) !== JSON.stringify(initialFormData),
    [formAddVisitorCard, initialFormData],
  );

  // const defaultFormData = CreateVisitorCardRequestSchema.parse({});

  // const isFormChanged = JSON.stringify(formAddVisitorCard) !== JSON.stringify(defaultFormData);

  useEffect(() => {
    if (Object.keys(formAddVisitorCard).length > 0) {
      localStorage.setItem('unsavedVisitorCardData', JSON.stringify(formAddVisitorCard));
    }
  }, [formAddVisitorCard]);

  // Handle Add Visitor Card
  const handleAddVisitorCard = useCallback(() => {
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
    setInitialFormData(freshForm);
    setPendingEditId(null);
    handleOpenDialog();
  }, []);

  // Handle Edit Visitor Card
  // const handleEdit = (id: string) => {
  //   const existingData = tableVisitorCard.find((item) => item.id === id);
  //   if (!existingData) return;

  //   const editing = localStorage.getItem('unsavedVisitorCardData');

  //   if (!editing) {
  //     const parsedData = CreateVisitorCardRequestSchema.parse(existingData);
  //     setEdittingId(id);
  //     setFormAddVisitorCard(parsedData);
  //     localStorage.setItem('unsavedVisitorCardData', JSON.stringify({ ...parsedData, id }));
  //     handleOpenDialog();
  //     return;
  //   }

  //   const editingData = JSON.parse(editing);

  //   const formChanged =
  //     JSON.stringify(editingData) !== JSON.stringify(CreateVisitorCardRequestSchema.parse({}));

  //   if (editingData.id === id || !formChanged) {
  //     const parsedData = CreateVisitorCardRequestSchema.parse(existingData);
  //     setEdittingId(id);
  //     setFormAddVisitorCard(parsedData);
  //     setInitialFormData(parsedData);
  //     handleOpenDialog();
  //     return;
  //   }

  //   setPendingEditId(id);
  //   setConfirmDialogOpen(true);
  // };

  const handleEdit = (id: string) => {
    const existingData = tableVisitorCard.find((item) => item.id === id);
    if (!existingData) return;

    const parsedData = {
      ...existingData,
      registered_site: existingData.registered_site ?? '', // simpan id string
      type: typeMap[existingData.type] ?? 0, // Convert to number
    } as CreateVisitorCardRequest;

    setEdittingId(id);
    setFormAddVisitorCard(parsedData);
    setInitialFormData(parsedData);
    localStorage.setItem('unsavedVisitorCardData', JSON.stringify({ ...parsedData, id }));
    handleOpenDialog();
  };

  const handleDeleteVisitorCard = async (id: string) => {
    const confirmed = await showConfirmDelete('Are you sure to delete this card?');

    if (confirmed) {
      setLoading(true);
      try {
        await deleteVisitorCard(token as string, id);
        setRefreshTrigger(refreshTrigger + 1);
        showSwal('success', 'Successfully deleted card!');
      } catch (error) {
        showSwal('error', 'Failed to delete card.');
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
    handleCloseModalCreateVisitorCard();
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

  const [enabledFields, setEnabledFields] = useState<EnableField>({
    employee_id: false,
    registered_site: false,
    is_multi_site: false,
    is_employee_used: false,
  });

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
      const parsed = CreateVisitorCardRequestSchema.parse(existingData ?? {});
      setEdittingId(pendingEditId);
      setFormAddVisitorCard(parsed);
      +setInitialFormData(parsed); // ⬅️ baseline baru
      setOpenFormCreateVisitorCard(true);
      setPendingEditId(null);
      return;
    }

    handleCloseModalCreateVisitorCard();
    const empty = CreateVisitorCardRequestSchema.parse({});
    setFormAddVisitorCard(empty);
    setInitialFormData(empty);
  };

  const handleCancelEditDiscard = () => {
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  const handleRequestClose = (
    _e?: object,
    reason?: 'backdropClick' | 'escapeKeyDown' | 'closeButton',
  ) => {
    // Kalau user menutup via klik backdrop / ESC dan form sudah berubah → tampilkan konfirmasi
    if (
      isFormChanged &&
      (reason === 'backdropClick' || reason === 'escapeKeyDown' || reason === 'closeButton')
    ) {
      setConfirmDialogOpen(true);
      return;
    }
    handleCloseModalCreateVisitorCard();
  };

  const [filters, setFilters] = useState<Filters>({
    type: -1,
    card_status: -1,
  });

  const handleApplyFilter = () => {
    setPage(0);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Card" description="this is Dashboard page">
        <Box>
          <Grid container spacing={3}>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 2.4 }} />
            </Grid>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              {/* {isDataReady ? ( */}
              <DynamicTable
                loading={loading}
                overflowX={'auto'}
                data={tableVisitorCard}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                isHavePagination={true}
                totalCount={totalFilteredRecords}
                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 25, 50, 100]}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveSearch={true}
                isHaveFilter={false}
                isHaveExportPdf={false}
                isHaveExportXlf={false}
                onImportExcel={handleImportExcel}
                isHaveImportExcel={true}
                isHaveFilterDuration={false}
                isHaveAddData={true}
                isHaveHeader={false}
                isDataVerified={true}
                sortColumns={['name']}
                // onFilterByColumn={(column) => setSortColumn(column.column)}
                onCheckedChange={(selected) => setSelectedRows(selected)}
                onEdit={(row) => {
                  handleEdit(row.id);
                  setEdittingId(row.id);
                }}
                onBatchEdit={handleBatchEdit}
                onDelete={(row) => handleDeleteVisitorCard(row.id)}
                onBatchDelete={handleBatchDelete}
                onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                onAddData={() => {
                  handleAddVisitorCard();
                }}
                isHaveFilterMore={true}
                filterMoreContent={
                  <FilterMoreContent
                    filters={filters}
                    setFilters={setFilters}
                    onApplyFilter={handleApplyFilter}
                  />
                }
              />
              {/* ) : (
                <Card sx={{ width: '100%' }}>
                  <Skeleton />
                  <Skeleton animation="wave" />
                  <Skeleton animation={false} />
                </Card>
              )} */}
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Dialog
        open={importErrorOpen}
        onClose={() => setImportErrorOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>{importErrorTitle}</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => setImportErrorOpen(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <IconX />
        </IconButton>

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
      </Dialog>

      <Dialog open={openFormCreateVisitorCard} onClose={handleRequestClose} fullWidth maxWidth="md">
        <DialogTitle display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
          {isBatchEdit ? 'Batch Edit' : edittingId ? 'Edit' : 'Add'} Card
          <IconButton
            aria-label="close"
            onClick={() => handleRequestClose(undefined, 'closeButton')}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ mt: 0, pt: 0 }}>
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
    </PageContainer>
  );
};

export default Content;

interface Filters {
  type: number;
  card_status: number;
}

type FilterMoreContentProps = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onApplyFilter: () => void;
};
const FilterMoreContent: React.FC<FilterMoreContentProps> = ({
  filters,
  setFilters,
  onApplyFilter,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, name } = e.target as any;
    const key = (id || name) as keyof Filters;
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onApplyFilter();
  };

  const initialFilters: Filters = {
    type: -1,
    card_status: -1,
  };

  const typeOptions = [
    { value: -1, label: 'All Types' },
    { value: 0, label: 'Non Access Card' },
    { value: 1, label: 'RFID' },
    { value: 2, label: 'BLE' },
  ];

  const cardStatusOptions = [
    { value: -1, label: 'All Status' },
    { value: 0, label: 'Not Found' },
    { value: 1, label: 'Active' },
    { value: 2, label: 'Lost' },
    { value: 3, label: 'Broken' },
    { value: 4, label: 'Not Return' },
  ];

  const getOption = (options: { value: number; label: string }[], val: number) =>
    options.find((o) => o.value === val) || options[0];

  return (
    <Box
      sx={{ padding: { xs: 0, lg: 3 }, margin: 1.5, boxShadow: 0, borderRadius: 2 }}
      onKeyDown={handleKeyDown}
    >
      <Typography variant="h5" gutterBottom>
        Card Filter
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <CustomFormLabel sx={{ marginTop: '0px' }}>
            <Typography variant="caption">Type</Typography>
          </CustomFormLabel>
          <Autocomplete
            size="small"
            disablePortal
            options={typeOptions}
            getOptionLabel={(opt) => opt.label}
            value={getOption(typeOptions, filters.type)}
            onChange={(_, newVal) =>
              setFilters((prev) => ({ ...prev, type: newVal ? newVal.value : -1 }))
            }
            renderInput={(params) => <CustomTextField {...params} placeholder="Select type" />}
          />
        </Grid>

        {/* Status Radio Buttons */}
        <Grid size={{ xs: 12 }}>
          <CustomFormLabel sx={{ marginTop: '0px' }}>
            <Typography variant="caption">Status</Typography>
          </CustomFormLabel>
          <Autocomplete
            size="small"
            disablePortal
            options={cardStatusOptions}
            getOptionLabel={(opt) => opt.label}
            value={getOption(cardStatusOptions, filters.card_status)}
            onChange={(_, newVal) =>
              setFilters((prev) => ({ ...prev, card_status: newVal ? newVal.value : -1 }))
            }
            renderInput={(params) => <CustomTextField {...params} placeholder="Select status" />}
          />
        </Grid>
        {/* Actions */}
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              justifyContent: 'flex-end',
              mt: 1,
              alignItems: 'center',
            }}
          >
            <Button variant="outlined" onClick={() => setFilters(initialFilters)}>
              Reset
            </Button>
            <Button variant="contained" onClick={onApplyFilter}>
              Apply
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
