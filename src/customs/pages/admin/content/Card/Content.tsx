import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
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
import {
  CreateVisitorCardRequest,
  CreateVisitorCardRequestSchema,
  Item,
} from 'src/customs/api/models/Admin/VisitorCard';
import {
  showConfirmDelete,
  showErrorAlert,
  showSuccessAlert,
  showSwal,
} from 'src/customs/components/alerts/alerts';
import {
  IconCards,
  IconUserCheck,
  IconUserOff,
  IconCreditCardOff,
  IconCreditCard,
} from '@tabler/icons-react';
import axiosInstance from 'src/customs/api/interceptor';
import FilterMoreContent from './FilterMoreContent';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import ImportErrorDialog from './components/ImportErroDialog';
import ConfirmUnsavedDialog from '../../components/ConfirmUnsavedDialog';
import { useTranslation } from 'react-i18next';
import { useVisitorCardPagination } from 'src/hooks/Card/useVisitorCard';
import { useVisitorCardSummary } from 'src/hooks/Card/useVisitorCardSummary';
import { useVisitorCardMutation } from 'src/hooks/Card/useVisitorCardMutation';
import GlobalBackdropLoading from 'src/customs/pages/Operator/Components/GlobalBackdrop';
import { getVisitorCardById } from 'src/customs/api/admin';

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

interface Filters {
  type: number;
  card_status: number;
}

const typeMap: Record<string, number> = {
  'Non Access Card': 0,
  RFID: 1,
  'RFID Card': 1,
  BLE: 2,
};

const Content = () => {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const [edittingId, setEdittingId] = useState('');
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [isBatchEdit, setIsBatchEdit] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [sortDir, setSortDir] = useState('desc');
  const [openFormCreateVisitorCard, setOpenFormCreateVisitorCard] = useState(false);
  const BASE_URL = axiosInstance.defaults.baseURL;
  const [importErrorOpen, setImportErrorOpen] = useState(false);
  const [importErrorTitle, setImportErrorTitle] = useState<string>('');
  const [importErrorMsg, setImportErrorMsg] = useState<string>('');
  const [importErrorRows, setImportErrorRows] = useState<ImportErrorRow[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const { t } = useTranslation();

  const [filters, setFilters] = useState<Filters>({
    type: -1,
    card_status: -1,
  });
  const [appliedFilters, setAppliedFilters] = useState<Filters>({
    type: -1,
    card_status: -1,
  });

  const { data, isLoading } = useVisitorCardPagination({
    page,
    rowsPerPage,
    sortDir,
    search,
    filters: appliedFilters,
  });

  const { deleteMutation } = useVisitorCardMutation();
  const { data: summary } = useVisitorCardSummary();

  const tableVisitorCard =
    data?.collection.map((x: any) => ({
      id: x.id,
      name: x.name,
      card_number: x.card_number,
      card_mac: x.card_mac,
      card_barcode: x.card_barcode,
      card_status: x.card_status,
      remarks: x.remarks,
      employee_name: x.employee_name,
      type: x.type,
      site_name: x.site_name,
      registered_site: x.registered_site,
      is_used: x.is_used,
      is_employee_used: x.is_employee_used,
      is_multi_site: x.is_multi_site,
    })) ?? [];

  const totalRecords = data?.RecordsTotal ?? 0;
  const totalFilteredRecords = data?.RecordsFiltered ?? 0;

  const cardActiveCount = summary?.cardActiveCount ?? 0;
  const cardInactiveCount = summary?.cardInactiveCount ?? 0;
  const usedCard = summary?.usedCard ?? 0;
  const unUsedCard = summary?.unusedCard ?? 0;

  const cards = [
    {
      title: t('totalCards'),
      icon: IconCards,
      subTitle: `${totalRecords}`,
      subTitleSetting: totalRecords,
      color: 'none',
    },
    {
      title: t('totalUsedCards'),
      icon: IconUserCheck,
      subTitle: `${usedCard}`,
      color: 'none',
    },
    {
      title: t('totalUnusedCards'),
      icon: IconUserOff,
      subTitle: `${unUsedCard}`,
      color: 'none',
    },
    {
      title: t('totalCardActive'),
      icon: IconCreditCard,
      subTitle: `${cardActiveCount}`,
      subTitleSetting: tableVisitorCard.filter((v) => v.card_status === 1).length,
      color: 'none',
    },
    {
      title: t('totalCardNonActive'),
      icon: IconCreditCardOff,
      subTitle: `${cardInactiveCount}`,
      subTitleSetting: tableVisitorCard.filter((v) => v.card_status === 0).length,
      color: 'none',
    },
  ];

  const handleOpenDialog = () => {
    setOpenFormCreateVisitorCard(true);
  };
  const handleCloseModalCreateVisitorCard = () => {
    setOpenFormCreateVisitorCard(false);
    setEdittingId('');
    setIsBatchEdit(false);
    setIsDirty(false);
  };

  // Form Default State Management
  const [formAddVisitorCard, setFormAddVisitorCard] = useState<CreateVisitorCardRequest>(
    CreateVisitorCardRequestSchema.parse({}),
  );
  const [initialFormData, setInitialFormData] = useState<CreateVisitorCardRequest>(
    CreateVisitorCardRequestSchema.parse({}),
  );

  const handleAddVisitorCard = useCallback(() => {
    let freshForm;

    freshForm = CreateVisitorCardRequestSchema.parse({});
    setEdittingId('');
    setFormAddVisitorCard(freshForm);
    setInitialFormData(freshForm);
    setPendingEditId(null);
    handleOpenDialog();
  }, []);

  const handleEdit = async (id: string) => {
    const existingData = tableVisitorCard.find((item) => item.id === id);
    // const existingData = await getVisitorCardById(id);
    // const data = existingData.collection;
    if (!existingData) return;

    const parsedData = {
      ...existingData,
      registered_site: existingData.registered_site ?? '',
      // registered_site: existingData.registered_site ?? '',
      type: typeMap[existingData.type] ?? 0,
    } as CreateVisitorCardRequest;

    setEdittingId(id);
    setFormAddVisitorCard(parsedData);
    setInitialFormData(parsedData);
    handleOpenDialog();
  };

  const handleDeleteVisitorCard = async (id: string) => {
    const confirmed = await showConfirmDelete('Are you sure to delete this card?');

    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(id);
        showSwal('success', 'Successfully deleted card!');
      } catch (error: any) {
        showSwal('error', error?.response?.data?.msg || 'Failed to delete card.');
      }
    }
  };

  const handleSuccess = () => {
    if (!edittingId) {
      setFormAddVisitorCard(CreateVisitorCardRequestSchema.parse({}));
    }
    setIsDirty(false);
    handleCloseModalCreateVisitorCard();
  };

  const handleBatchDelete = async (rows: Item[]) => {
    if (rows.length === 0) return;

    const confirmed = await showConfirmDelete(`Are you sure to delete ${rows.length} items?`);

    if (confirmed) {
      try {
        await Promise.all(rows.map((row) => deleteMutation.mutateAsync(row.id)));
        setSelectedRows([]);

        showSuccessAlert('Deleted!', `${rows.length} items have been deleted.`);
        return true;
      } catch (error) {
        showSwal('error', 'Failed to delete some items.');
        return false;
      }
    }
  };

  const handleBatchEdit = (rows: Item[]) => {
    if (!rows.length) return;

    setEdittingId(rows[0].id);
    setIsBatchEdit(true);

    setEnabledFields({
      employee_id: false,
      registered_site: false,
      is_multi_site: false,
      is_employee_used: false,
    });

    setFormAddVisitorCard((prev) => ({
      ...prev,
      employee_id: null,
      registered_site: null,
      is_multi_site: false,
      is_employee_used: false,
    }));

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
      const resp = await fetch(`${BASE_URL}/card/create-batch`, {
        method: 'POST',
        body: formData,
      });

      const text = await resp.text();
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
    } catch (err: any) {
      showErrorAlert('Error', err?.message ?? 'Failed to import');
    } finally {
      e.target.value = '';
    }
  };

  const handleConfirmEditDiscard = () => {
    setIsDirty(false);
    setConfirmDialogOpen(false);
    if (pendingEditId) {
      const existingData = tableVisitorCard.find((item) => item.id === pendingEditId);
      const parsed = CreateVisitorCardRequestSchema.parse(existingData ?? {});
      setEdittingId(pendingEditId);
      setFormAddVisitorCard(parsed);
      setInitialFormData(parsed);
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
    if (
      isDirty &&
      (reason === 'backdropClick' || reason === 'escapeKeyDown' || reason === 'closeButton')
    ) {
      setConfirmDialogOpen(true);
      return;
    }
    handleCloseModalCreateVisitorCard();
  };

  const handleApplyFilter = () => {
    setPage(0);
    setAppliedFilters(filters);
  };
  const handleResetFilter = () => {
    const initial = {
      type: -1,
      card_status: -1,
    };

    setPage(0);
    setFilters(initial);
    setAppliedFilters(initial);
  };

  const handleSearch = useCallback(
    (keyword: string) => {
      setPage(0);
      setSearch(keyword);
    },
    [setPage, setSearch],
  );

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Card" description="this is Dashboard page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 2.4 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={isLoading}
                overflowX={'auto'}
                data={tableVisitorCard}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                isHavePagination={true}
                totalCount={totalFilteredRecords}
                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 50, 100]}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                currentPage={page}
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
                onCheckedChange={(selected) => setSelectedRows(selected)}
                onEdit={(row) => {
                  handleEdit(row.id);
                  setEdittingId(row.id);
                }}
                onBatchEdit={handleBatchEdit}
                onDelete={(row) => handleDeleteVisitorCard(row.id)}
                onBatchDelete={handleBatchDelete}
                searchKeyword={search}
                onSearch={handleSearch}
                onAddData={handleAddVisitorCard}
                isHaveFilterMore={true}
                filterMoreContent={
                  <FilterMoreContent
                    filters={filters}
                    setFilters={setFilters}
                    onApplyFilter={handleApplyFilter}
                    onReset={handleResetFilter}
                  />
                }
              />
            </Grid>
          </Grid>
        </Box>
      </Container>

      <ImportErrorDialog
        open={importErrorOpen}
        title={importErrorTitle}
        rows={importErrorRows as any}
        onClose={() => setImportErrorOpen(false)}
      />

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
            setIsDirty={setIsDirty}
          />
        </DialogContent>
      </Dialog>

      <ConfirmUnsavedDialog
        open={confirmDialogOpen}
        onClose={handleCancelEditDiscard}
        onDiscard={handleConfirmEditDiscard}
      />
      <GlobalBackdropLoading open={deleteMutation.isPending} />
    </PageContainer>
  );
};

export default Content;
