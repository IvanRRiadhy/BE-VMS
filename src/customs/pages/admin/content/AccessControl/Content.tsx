import { useEffect, useState, useRef, useCallback } from 'react';
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
  getAllAccessControlPagination,
  deleteAccessControl,
  getAccessControlById,
  getAccessControlsById,
} from 'src/customs/api/admin';
import {
  CreateAccessControlRequest,
  CreateAccessControlRequestSchema,
} from 'src/customs/api/models/Admin/AccessControl';

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
import { useSession } from 'src/customs/contexts/SessionContext';
import ConfirmUnsavedDialog from '../../components/ConfirmUnsavedDialog';
import AccessControlDialog from './AccessControlDialog';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import { useTranslation } from 'react-i18next';

const Content = () => {
  const [tableData, setTableData] = useState<Item[]>([]);
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);

  const [totalRecords, setTotalRecords] = useState(0);
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [edittingId, setEdittingId] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [openCreateAccessControl, setOpenCreateAccessControl] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const { t } = useTranslation();

  const cards = [
    {
      title: t('totalAccessControl'),
      icon: IconAccessible,
      subTitle: `${totalRecords}`,
      subTitleSetting: 10,
      color: 'none',
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const start = page * rowsPerPage;
        const response = await getAllAccessControlPagination(
          start,
          rowsPerPage,
          sortColumn,
          search,
        );

        setTotalRecords(response.RecordsTotal);
        setTotalFilteredRecords(response.RecordsFiltered);

        const rows: any[] = response.collection.map((item: any) => ({
          // brand_name: item.brand_name,
          id: item.id,
          name: item.name,
          type: item.type,
          description: item.description,
          channel: item.channel,
          door_id: item.door_id,
          // raw: item.raw,
          integration_name: item.integration_name,
          // integration_id: item.integration_id,
        }));
        if (response) {
          setTableData(rows);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, rowsPerPage, sortColumn, refreshTrigger, search]);

  const defaultFormData: CreateAccessControlRequest = {
    brand_id: null,
    brand_name: '',
    integration_id: '',
    integration_name: '',
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
    integration_name: item?.integration_name ?? '',
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
      'Are you sure you want to delete this Access Control?',
    );

    if (confirmed) {
      try {
        await deleteAccessControl(id);
        setRefreshTrigger((prev) => prev + 1);
        showSwal('success', 'Successfully deleted Access Control!');
      } catch (error) {
        console.error(error);
        showSwal('error', 'Failed to delete Access Control.');
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    }
  };

  const handleBatchDelete = async (rows: Item[]) => {
    if (rows.length === 0) return;

    const confirmed = await showConfirmDelete(`Are you sure to delete ${rows.length} items?`);

    if (confirmed) {
      setLoading(true);
      try {
        await Promise.all(rows.map((row) => deleteAccessControl(row.id)));
        setRefreshTrigger((prev) => prev + 1);
        showSwal('success', `${rows.length} items have been deleted.`);
        setSelectedRows([]);
      } catch (error) {
        console.error(error);
        showSwal('error', 'Failed to delete some items.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSuccess = () => {
    setIsDirty(false);
    handleCloseDialog();
    setRefreshTrigger((prev) => prev + 1);

    showSwal(
      'success',
      edittingId ? 'Access Control successfully updated!' : 'Access Control successfully created!',
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
                loading={loading}
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
                // onSearchKeywordChange={handleSearchKeywordChange}
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
    </PageContainer>
  );
};

export default Content;
