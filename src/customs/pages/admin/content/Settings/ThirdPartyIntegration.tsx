import React, { useCallback, useState } from 'react';
import Container from 'src/components/container/PageContainer';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useApiKeyDT } from 'src/hooks/Setting/useApiKey';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import ApiKeyFormDialog from './components/ApiKeyFormDialog';
import { ApiKeyFormData } from 'src/customs/api/Admin/Setting/schemas/apikey.schema';
import { getApiKeyById, getRevealById, updateApiKeyActive } from 'src/customs/api/Admin/Setting';
import { useApiKeyMutation } from 'src/hooks/Setting/useApiKeyMutation';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import GlobalBackdropLoading from 'src/customs/pages/Operator/Components/GlobalBackdrop';
import { useTranslation } from 'react-i18next';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const defaultFormData: ApiKeyFormData = {
  name: '',
  description: '',
  is_active: false,
  expired_at: '',
  modules: [],
};

const ThirdPartyIntegration = () => {
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const [sortDir] = useState('desc');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [visibleApiKeys, setVisibleApiKeys] = useState<Record<string, string>>({});
  const [loadingApiKeys, setLoadingApiKeys] = useState<Record<string, boolean>>({});
  const {
    data: apiKeys = [],
    isLoading,
    isFetching,
  } = useApiKeyDT(page, rowsPerPage, 'created_at', sortDir, search);
  const rows = (apiKeys?.collection ?? [])
    .map((item: any) => ({
      id: item.id,
      name: item.name || '-',
      description: item.description || '-',
      apikey: item.apikey ? '••••••••' : '-',
      expired_at: formatDateTime(item.expired_at) || '-',
      modules: item.modules?.join(', ') || '-',
      active: item.is_active,
    }))
    .sort((a: any, b: any) => Number(a.is_active) - Number(b.is_active));
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<ApiKeyFormData>(defaultFormData);
  const handleSearch = useCallback(
    (keyword: string) => {
      setPage(0);
      setSearch(keyword);
    },
    [setPage, setSearch],
  );
  const { t } = useTranslation();

  const {
    remove: removeApiKey,
    create: createApiKey,
    update: updateApiKey,
    updateActive: updateApiKeyActive,
    generate: generateApiKey,
  } = useApiKeyMutation();

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirmDelete(t('confirmDelete', { name: 'Api Key' }));

    if (confirmed) {
      try {
        await removeApiKey.mutateAsync({
          id,
        });
        showSwal('success', 'Successfully deleted API key!');
      } catch (error: any) {
        showSwal('error', error?.message ?? t('deleteFailed', { name: 'Api Key' }));
      }
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await getApiKeyById(id);

      const data = response?.collection;

      if (!data) return;

      setEditingId(id);

      setInitialData({
        name: data.name ?? '',
        description: data.description ?? '',
        is_active: data.is_active ?? false,
        // expired_at: data.expired_at ? formatDateTimeLocal(data.expired_at) : '',
        expired_at: data.expired_at,
        modules: data.modules ?? [],
      });

      setOpenDialog(true);
    } catch (error) {
      console.error('Failed to get API key:', error);
    }
  };

  const handleAdd = () => {
    setOpenDialog(true);
  };

  const handleSubmit = async (data: ApiKeyFormData) => {
    try {
      const payload = {
        ...data,
        expired_at: data.expired_at
          ? dayjs.tz(data.expired_at, 'Asia/Jakarta').utc().toISOString()
          : '',
      };

      if (editingId) {
        await updateApiKey.mutateAsync({
          id: editingId,
          data: payload,
        });

        showSwal('success', t('updatedSuccess', { name: 'API Key' }));
      } else {
        await createApiKey.mutateAsync({
          data: payload,
        });

        showSwal('success', t('createSuccess', { name: 'API Key' }));
      }

      setOpenDialog(false);
      setEditingId(null);
      setInitialData(defaultFormData);
    } catch (error: any) {
      console.error('Failed to save API key:', error);
      showSwal(
        'error',
        error?.response?.data?.message || error?.response?.data?.msg || 'Failed to save API key!',
      );
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setInitialData(defaultFormData);
  };

  const handleActiveToggle = async (row: any, checked: boolean) => {
    try {
      await updateApiKeyActive.mutateAsync({
        id: row.id,
        is_active: checked,
      });

      showSwal('success', t('updatedSuccess', { name: 'API Key' }));
    } catch (error: any) {
      showSwal('error', error?.response?.data?.message || 'Failed to update active status');
    }
  };

  const isMutating =
    createApiKey.isPending ||
    updateApiKey.isPending ||
    removeApiKey.isPending ||
    generateApiKey.isPending;

  const handleRevealApiKey = async (id: string) => {
    if (visibleApiKeys[id]) {
      return;
    }

    try {
      setLoadingApiKeys((prev) => ({
        ...prev,
        [id]: true,
      }));

      const response = await getRevealById(id);

      const apiKey = response?.collection?.api_key ?? response?.api_key;

      if (!apiKey) {
        showSwal('error', 'API Key not found');
        return;
      }

      setVisibleApiKeys((prev) => ({
        ...prev,
        [id]: apiKey,
      }));
    } catch (error: any) {
      showSwal(
        'error',
        error?.response?.data?.message || error?.response?.data?.msg || 'Failed to reveal API Key',
      );
    } finally {
      setLoadingApiKeys((prev) => ({
        ...prev,
        [id]: false,
      }));
    }
  };

  const handleHideApiKey = (id: string) => {
    setVisibleApiKeys((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleGenerateApiKey = async (id: string) => {
    const confirmed = await showConfirmDelete(
      'Are you sure you want to generate a new API Key? The current API Key will be replaced.',
    );

    if (!confirmed) return;

    try {
      await generateApiKey.mutateAsync({ id });

      // supaya secret yang sebelumnya terlihat tidak masih tersimpan di state
      setVisibleApiKeys((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      showSwal('success', 'Successfully generated new API Key!');
    } catch (error: any) {
      showSwal(
        'error',
        error?.response?.data?.message ||
          error?.response?.data?.msg ||
          'Failed to generate API Key',
      );
    }
  };

  const handleBatchDelete = async (rows: any[]) => {
    if (rows.length === 0) return false;

    const confirmed = await showConfirmDelete(
      t('confirmDeleteMultiple', { count: rows.length, name: 'Api Key' }),
    );
    if (!confirmed) return false;

    try {
      await Promise.all(rows.map((row) => removeApiKey.mutateAsync({ id: row.id })));

      setSelectedRows([]);
      showSwal('success', t('deleteSuccessMultiple', { count: rows.length, name: 'Api Key' }));
      return true;
    } catch (error: any) {
      showSwal('error', error?.response?.data?.message || 'Failed to delete some items.');
      return false;
    }
  };

  return (
    <Container title="Apikey Setting" description="">
      <DynamicTable
        overflowX={'auto'}
        data={rows ?? []}
        loading={isLoading}
        isHaveSearch
        isHavePagination
        isHaveChecked
        isHaveAddData
        isHaveAction
        currentPage={page}
        isHaveActive
        defaultRowsPerPage={rowsPerPage}
        onActiveToggle={handleActiveToggle}
        selectedRows={selectedRows}
        onCheckedChange={(selected) => setSelectedRows(selected)}
        rowsPerPageOptions={[10, 50, 100]}
        onPaginationChange={(page, rowsPerPage) => {
          setPage(page);
          setRowsPerPage(rowsPerPage);
        }}
        onAddData={handleAdd}
        onDelete={(row) => handleDelete(row.id)}
        searchKeyword={search}
        onSearch={handleSearch}
        onEdit={(row) => {
          handleEdit(row.id);
        }}
        // API KEY
        isHaveSecret
        visibleSecrets={visibleApiKeys}
        loadingSecrets={loadingApiKeys}
        onRevealSecret={handleRevealApiKey}
        onHideSecret={handleHideApiKey}
        isHaveGenerateApiKey={true}
        onGenerateApiKey={(row: any) => handleGenerateApiKey(row.id)}
        onBatchDelete={handleBatchDelete}
      />

      <ApiKeyFormDialog
        open={openDialog}
        editingId={editingId}
        initialData={initialData}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      />

      <GlobalBackdropLoading open={isMutating} />
    </Container>
  );
};

export default ThirdPartyIntegration;
