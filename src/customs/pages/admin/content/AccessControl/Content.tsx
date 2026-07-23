import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Box, Grid2 as Grid } from '@mui/material';
import PageContainer from 'src/customs/components/container/PageContainer';
import Container from 'src/components/container/PageContainer';

import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import {
  getAccessControlsById,
} from 'src/customs/api/admin';
import { CreateAccessControlRequest } from 'src/customs/api/models/Admin/AccessControl';

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
import ConfirmUnsavedDialog from '../../components/ConfirmUnsavedDialog';
import AccessControlDialog from './AccessControlDialog';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import { useTranslation } from 'react-i18next';
import { useAccessControlPagination } from 'src/hooks/AccessControl/useAccessControlPagination';
import { useAccessControlMutation } from 'src/hooks/AccessControl/useAccessControlMutation';
import GlobalBackdropLoading from 'src/customs/pages/Operator/Components/GlobalBackdrop';

const Content = () => {
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [edittingId, setEdittingId] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [openCreateAccessControl, setOpenCreateAccessControl] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const { t } = useTranslation();

  const { data, isLoading } = useAccessControlPagination({
    page,
    rowsPerPage,
    sortColumn,
    search,
  });

  const { deleteMutation } = useAccessControlMutation();
  const tableData: any =
    data?.collection.map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      description: item.description,
      channel: item.channel,
      door_id: item.door_id,
      integration_name: item.integration_name,
    })) ?? [];

  const totalRecords = data?.RecordsTotal ?? 0;
  const totalFilteredRecords = data?.RecordsFiltered ?? 0;

  const cards = useMemo(
    () => [
      {
        title: t('totalAccessControl'),
        icon: IconAccessible,
        subTitle: `${totalRecords}`,
        color: 'none',
      },
    ],
    [t, totalRecords]
  );

  const defaultFormData: CreateAccessControlRequest = {
    brand_id: null,
    brand_name: '',
    integration_id: '',
    // integration_name: '',
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
    // integration_name: item?.integration_name ?? '',
    type: item?.type ?? -1,
    name: item?.name ?? '',
    description: item?.description ?? '',
    channel: item?.channel ?? '',
    door_id: item?.door_id ?? '',
    raw: item?.raw ?? '{}',
  });

  const [formDataAddAccessControl, setFormDataAddAccessControl] =
    useState<CreateAccessControlRequest>(defaultFormData);

  const handleOpenDialog = () => {
    setOpenCreateAccessControl(true);
  };
  const handleCloseDialog = () => {
    setIsDirty(false);
    setOpenCreateAccessControl(false);
  };

  const handleAdd = () => {
    setIsDirty(false);
    setPendingEditId(null);
    setEdittingId('');
    setFormDataAddAccessControl(defaultFormData);
    handleOpenDialog();
  };

  const handleEdit = async (id: string) => {
    if (isDirty) {
      setPendingEditId(id);
      setConfirmDialogOpen(true);
      return;
    }

    const res = await getAccessControlsById(id);

    setFormDataAddAccessControl(mapItemToFormData(res.collection as any));
    setEdittingId(id);
    handleOpenDialog();
  };

  const handleConfirmEdit = () => {
    setConfirmDialogOpen(false);
    setIsDirty(false);

    if (pendingEditId) {
      setEdittingId(pendingEditId);
      handleOpenDialog();
    }

    setPendingEditId(null);
  };

  const handleCancelEdit = () => {
    setConfirmDialogOpen(false);
    setPendingEditId(null);
    setEdittingId('');
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirmDelete(
      t("confirmDelete", { name: 'Access Control' }),
    );

    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(id);
        showSwal('success', t("deleteSuccess", { name: 'Access Control' }));
      } catch (error: any) {
        showSwal('error', error?.message ?? t("deleteFailed", { name: 'Access Control' }));
      }
    }
  };

  const handleBatchDelete = async (rows: Item[]) => {
    if (rows.length === 0) return;

    const confirmed = await showConfirmDelete(t("confirmDeleteMultiple", { count: rows.length, name: 'Access Control' }));

    if (confirmed) {
      try {
        await Promise.all(rows.map((row) => deleteMutation.mutateAsync(row.id)));
        showSwal('success', `${t("deleteSuccessMultiple", { count: rows.length, name: 'Access Control' })}`);
        setSelectedRows([]);
      } catch (error: any) {
        showSwal('error', error?.message ?? t("deleteFailed", { name: 'Access Control' }));
      }
    }
  };

  const handleSuccess = () => {
    setIsDirty(false);
    handleCloseDialog();

    showSwal(
      'success',
      edittingId ? t("updatedSuccess", { name: 'Access Control' }) : t("createdSuccess", { name: 'Access Control' }),
    );
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
      <Container title="Access Control" description="Access Control page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={isLoading}
                isHavePagination={true}
                isAccessControlType={true}
                selectedRows={selectedRows}
                totalCount={totalFilteredRecords}
                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 50, 100]}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                overflowX={'auto'}
                data={tableData}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveSearch={true}
                currentPage={page}
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
                searchKeyword={search}
                onSearch={handleSearch}
                onAddData={handleAdd}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>

      <AccessControlDialog
        open={openCreateAccessControl}
        edittingId={edittingId}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
        setConfirmDialogOpen={setConfirmDialogOpen}
        isDirty={isDirty}
        onDirty={(dirty: any) => setIsDirty(dirty)}
      />

      <ConfirmUnsavedDialog
        open={confirmDialogOpen}
        onClose={handleCancelEdit}
        onDiscard={handleConfirmEdit}
      />
      <GlobalBackdropLoading open={deleteMutation.isPending} />
    </PageContainer>
  );
};

export default Content;
