import React, { useCallback, useState } from 'react';
import Container from 'src/components/container/PageContainer';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import { ApiKeyFormData } from 'src/customs/api/Admin/Setting/schemas/apikey.schema';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import GlobalBackdropLoading from 'src/customs/pages/Operator/Components/GlobalBackdrop';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useVehicleDT } from 'src/hooks/Setting/useVehicle';
import VehicleFormDialog from './components/VehicleFormDialog';
import { useVehicleMutation } from 'src/hooks/Setting/useVehicleMutation';

dayjs.extend(utc);
dayjs.extend(timezone);

const defaultFormData: ApiKeyFormData = {
  name: '',
  description: '',
  is_active: false,
  expired_at: '',
  modules: [],
};

const Vehicle = () => {
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const [sortDir] = useState('desc');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const {
    data: vehicle = [],
    isLoading,
    isFetching,
  } = useVehicleDT(page, rowsPerPage, 'created_at', sortDir, search);
  const rows = (vehicle?.collection ?? [])
    .map((item: any) => ({
      id: item.id,
      name: item.name || '-',
      value: item.value || '-',
    }))
    .sort((a: any, b: any) => Number(a.is_active) - Number(b.is_active));
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const handleSearch = useCallback(
    (keyword: string) => {
      setPage(0);
      setSearch(keyword);
    },
    [setPage, setSearch],
  );
  const { t } = useTranslation();

  // const { create: createApiKey } = useApiKeyMutation();
  const { create: createVehicle } = useVehicleMutation();
  const [openDialog, setOpenDialog] = useState(false);

  const handleAdd = () => {
    setOpenDialog(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      await createVehicle.mutateAsync({
        data,
      });

      showSwal('success', t('createSuccess', { name: 'Vehicle' }));

      setOpenDialog(false);
    } catch (error: any) {
      console.error('Failed to save vehicle:', error);

      showSwal(
        'error',
        error?.response?.data?.message || error?.response?.data?.msg || 'Failed to save vehicle!',
      );
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
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
        searchPlaceholder="Search Vehicle"
        isHaveAction={false}
        currentPage={page}
        totalCount={vehicle?.RecordsFiltered ?? 0}
        isNoActionTableHead
        isHaveActive
        defaultRowsPerPage={rowsPerPage}
        selectedRows={selectedRows}
        onCheckedChange={(selected) => setSelectedRows(selected)}
        rowsPerPageOptions={[10, 50, 100]}
        onPaginationChange={(page, rowsPerPage) => {
          setPage(page);
          setRowsPerPage(rowsPerPage);
        }}
        onAddData={handleAdd}
        searchKeyword={search}
        onSearch={handleSearch}
        isHaveAddEmpty={true}
        addDataText="Add Vehicle"
        onAddEmpty={handleAdd}
      />
      <VehicleFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        loading={createVehicle.isPending}
      />
      <GlobalBackdropLoading open={createVehicle.isPending} />
    </Container>
  );
};

export default Vehicle;
