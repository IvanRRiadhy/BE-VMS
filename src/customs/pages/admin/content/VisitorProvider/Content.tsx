import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Backdrop,
  Box,
  CircularProgress,
  Grid2 as Grid,
  Portal,
  Dialog,
  DialogContent,
  DialogTitle,
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
import { IconCategory, IconX } from '@tabler/icons-react';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import {
  getVisitorProvidersById,
} from 'src/customs/api/Admin/VisitorProviders';
import FormVisitorProvider from './FormVisitorProvider';
import ConfirmUnsavedDialog from '../../components/ConfirmUnsavedDialog';
import { useTranslation } from 'react-i18next';
import { useVisitorProviderPagination } from 'src/hooks/VisitorProvider/useVisitorProviderPagination';
import { useVisitorProviderMutation } from 'src/hooks/VisitorProvider/useVisitorProviderMutation';
import GlobalBackdropLoading from 'src/customs/pages/Operator/Components/GlobalBackdrop';
interface VisitorProviderForm {
  name: string;
  code: string;
  description: string;
  logo: any;
  active: boolean;
  visitor_category: string;
  support_vehicle: boolean;
  need_plate_number: boolean;
  max_duration_minutes: number;
  auto_approve: boolean;
  is_quick_access: boolean;
}
const Content = () => {
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const [sortDir, setSortDir] = useState('desc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openDialogVisitorProvider, setOpenDialogVisitorProvider] = useState(false);
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const { t } = useTranslation();

  const { data, isLoading } = useVisitorProviderPagination({
    page,
    rowsPerPage,
    sortDir,
    search,
  });

  const {
    deleteMutation,
    updateMutation,
  } = useVisitorProviderMutation();

  const totalRecords = data?.RecordsTotal ?? 0;
  const totalFilteredRecords = data?.RecordsFiltered ?? 0;

  const cards = useMemo(
    () => [
      {
        title: t('totalVisitorProviders'),
        subTitle: `${totalRecords}`,
        icon: IconCategory,
        color: 'none',
      },
    ],
    [t, totalRecords],
  );

  const tableData =
    data?.collection.map((item: any) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      visitor_category: item.visitor_category,
      max_duration: item.max_duration_minutes,
      need_plate_number: item.need_plate_number,
      support_vehicle: item.support_vehicle,
      auto_approve: item.auto_approve,
      is_quick_access: item.is_quick_access,
      active: item.active,
    })) ?? [];

  const handleSearch = useCallback(
    (keyword: string) => {
      setPage(0);
      setSearch(keyword);
    },
    [setPage, setSearch],
  );


  const defaultForm = {
    name: '',
    code: '',
    description: '',
    logo: null,
    active: false,
    visitor_category: 'Regular',
    support_vehicle: false,
    need_plate_number: false,
    max_duration_minutes: 0,
    auto_approve: false,
    is_quick_access: false,
  };
  const [localForm, setLocalForm] = useState<VisitorProviderForm>(defaultForm);
  const [initialForm, setInitialForm] = useState<VisitorProviderForm>(defaultForm);
  const actionLoading =
    updateMutation.isPending ||
    deleteMutation.isPending;

  const handleActiveToggle = async (row: any, checked: boolean) => {
    try {
      const payload = {
        name: row.name,
        role: row.role,
        active: checked,
      };
      await updateMutation.mutateAsync({
        id: row.id,
        data: payload,
      });

      showSwal('success', t('updatedSuccess', { name: 'Visitor Provider' }));

    } catch (error: any) {
      showSwal('error', error?.response?.data?.message || 'Failed to update status active');
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setLocalForm(defaultForm);
    setIsDirty(false);
    setOpenDialogVisitorProvider(true);
  };

  const handleSuccess = () => {
    setOpenDialogVisitorProvider(false);
    setLocalForm(defaultForm);
    setIsDirty(false);
  };

  const handleDiscard = () => {
    setOpenUnsavedDialog(false);
    setOpenDialogVisitorProvider(false);
    setLocalForm(defaultForm);
    setIsDirty(false);
  };

  const handleDelete = async (id: string) => {

    const confirmed = await showConfirmDelete(
      t("confirmDelete", { name: 'Visitor Provider' }),
    );

    if (confirmed) {

      try {
        await deleteMutation.mutateAsync(id);
        showSwal('success', t("deleteSuccess", { name: 'Visitor Provider' }));
      } catch (error: any) {
        showSwal('error', error?.response?.data?.message ?? t("deleteFailed", { name: 'Visitor Provider' }));
      }
    }
  };

  const handleEdit = async (id: string) => {
    try {
      setEditingId(id);
      const res = await getVisitorProvidersById(id);
      setLocalForm(res.collection);
      setInitialForm(res.collection);

      setIsDirty(false);

      setOpenDialogVisitorProvider(true);
    } catch (error) {
      console.error(error);
    }
  };
  const handleClose = () => {
    if (isDirty) {
      setOpenUnsavedDialog(true);
      return;
    }

    setOpenDialogVisitorProvider(false);
    setLocalForm(defaultForm);
  };

  const handleChangeForm = (updater: any) => {
    setLocalForm((prev: any) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;

      return next;
    });

    if (!isDirty) {
      setIsDirty(true);
    }
  };

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Visitor Providers" description="Visitor Providers page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={isLoading}
                overflowX={'auto'}
                data={tableData}
                selectedRows={selectedRows}
                isHaveChecked={true}
                isHaveSearch={true}
                isHaveFilter={false}
                isHaveExportPdf={false}
                isHaveExportXlf={false}
                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 50, 100]}
                currentPage={page}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                isHavePagination={true}
                isHaveFilterDuration={false}
                isHaveHeader={false}
                onCheckedChange={(selected) => setSelectedRows(selected)}
                searchKeyword={search}
                onSearch={handleSearch}
                isHaveActive={true}
                onActiveToggle={handleActiveToggle}
                isHaveAddData={true}
                onAddData={handleAdd}
                isHaveAction={true}
                onDelete={(row) => handleDelete(row.id)}
                onEdit={(row) => {
                  handleEdit(row.id);
                  setEditingId(row.id);
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
      <Dialog open={openDialogVisitorProvider} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle sx={{ position: 'relative', padding: 3 }}>
          {editingId ? 'Edit Visitor Provider' : 'Add Visitor Provider'}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 10,
              top: 10,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <IconX />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <FormVisitorProvider
            form={localForm}
            setForm={handleChangeForm}
            editingId={editingId}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>
      <ConfirmUnsavedDialog
        open={openUnsavedDialog}
        onClose={() => setOpenUnsavedDialog(false)}
        onDiscard={handleDiscard}
      />
      <GlobalBackdropLoading open={actionLoading} />
    </PageContainer>
  );
};

export default Content;
