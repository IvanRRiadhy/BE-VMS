import React, { useCallback, useState } from 'react';
import Container from 'src/components/container/PageContainer';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';

import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import GlobalBackdropLoading from 'src/customs/pages/Operator/Components/GlobalBackdrop';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { useIdentityTypeDT } from 'src/hooks/Setting/useIdentityType';
import { useIdentityTypeMutation } from 'src/hooks/Setting/useIdentityTypeMutation';
import FormIdentityType from './FormIdentityType';
import { getIdentityTypeById } from 'src/customs/api/Admin/Setting';

dayjs.extend(utc);
dayjs.extend(timezone);

const content = () => {
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const [sortDir] = useState('desc');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const {
    data: vehicle = [],
    isLoading,
    isFetching,
  } = useIdentityTypeDT(page, rowsPerPage, 'created_at', sortDir, search);
  const rows = (vehicle?.collection ?? [])
    .map((item: any) => ({
      id: item.id,
      name: item.name || '-',
      identity_type: item.identity_type || '-',
      char_length: item.char_length || '-',
      remarks: item.remarks || '-',
      mandatory: item.mandatory || false,
      is_enable: item.is_enable || false,
    }))
    .sort((a: any, b: any) => Number(a.is_active) - Number(b.is_active));
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const handleSearch = useCallback(
    (keyword: string) => {
      setPage(0);
      setSearch(keyword);
    },
    [setPage, setSearch],
  );
  const { t } = useTranslation();

  const { create, deleteIdentityTypes } = useIdentityTypeMutation();
  const [openDialog, setOpenDialog] = useState(false);

  const handleAdd = () => {
    setOpenDialog(true);
  };

  const { update } = useIdentityTypeMutation();

  const handleSubmit = async (data: any) => {
    if (!selectedId) return;

    try {
      await update.mutateAsync({
        id: selectedId,
        data: {
          ...data,
          char_length: Number(data.char_length),
        },
      });

      showSwal('success', t('updatedSuccess', { name: 'Identity Type' }));
      setOpenDialog(false);
      setSelectedIdentity(undefined);
      setSelectedId(undefined);
    } catch (error: any) {
      showSwal(
        'error',
        error?.response?.data?.message ||
          error?.response?.data?.msg ||
          'Failed to update Identity Type!',
      );
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const [selectedIdentity, setSelectedIdentity] = useState<any | undefined>();
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const handleEdit = async (id: string) => {
    try {
      const res = await getIdentityTypeById(id);
      const item = res.collection;

      setSelectedId(id);
      setSelectedIdentity({
        name: item.name ?? '',
        identity_type: item.identity_type ?? '',
        char_length: Number(item.char_length ?? 0),
        remarks: item.remarks ?? '',
        is_enable: item.is_enable ?? false,
        mandatory: item.mandatory ?? false,
      });

      setOpenDialog(true);
    } catch {
      showSwal('error', 'Failed to load Identity Type');
    }
  };
  const handleActiveChange = async (id: string, col: string, checked: boolean) => {
    if (col !== 'is_enable' && col !== 'mandatory') return;

    const item = vehicle?.collection?.find((x: any) => x.id === id);

    if (!item) return;

    try {
      await update.mutateAsync({
        id,
        data: {
          name: item.name,
          identity_type: item.identity_type,
          char_length: Number(item.char_length),
          remarks: item.remarks,
          is_enable: col === 'is_enable' ? checked : item.is_enable,
          mandatory: col === 'mandatory' ? checked : item.mandatory,
        },
      });

      showSwal('success', t('updatedSuccess', { name: 'Identity Type' }));
    } catch (error: any) {
      showSwal(
        'error',
        error?.response?.data?.message ||
          error?.response?.data?.msg ||
          'Failed to update Identity Type!',
      );
    }
  };
  return (
    <Container title="Identity Type" description="">
      <DynamicTable
        overflowX={'auto'}
        data={rows ?? []}
        loading={isLoading}
        isHaveSearch
        isHavePagination
        isHaveChecked
        // isHaveAddData
        searchPlaceholder="Search Identity Type"
        // isHaveAction={true}
        currentPage={page}
        totalCount={vehicle?.RecordsFiltered ?? 0}
        isNoActionTableHead
        isHaveActive
        isSelectedType
        defaultRowsPerPage={rowsPerPage}
        isActionVisitor={false}
        isHaveActionOnlyEdit={true}
        selectedRows={selectedRows}
        onCheckedChange={(selected) => setSelectedRows(selected)}
        rowsPerPageOptions={[10, 50, 100]}
        onPaginationChange={(page, rowsPerPage) => {
          setPage(page);
          setRowsPerPage(rowsPerPage);
        }}
        // onAddData={handleAdd}
        isHaveBooleanSwitch
        onBooleanSwitchChange={(id, col, checked) => {
          handleActiveChange(id, col, checked);
        }}
        searchKeyword={search}
        onSearch={handleSearch}
        onEdit={(row) => handleEdit(row.id)}
        // isHaveAddEmpty={true}
        // addDataText="Add Identity Type"
        // onAddEmpty={handleAdd}
      />
      <FormIdentityType
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedIdentity(undefined);
          setSelectedId(undefined);
        }}
        onSubmit={handleSubmit}
        initialData={selectedIdentity}
        loading={update.isPending}
      />
      <GlobalBackdropLoading
        open={create.isPending || deleteIdentityTypes.isPending || update.isPending}
      />
    </Container>
  );
};

export default content;
