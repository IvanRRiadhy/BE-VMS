import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2 as Grid,
  IconButton,
} from '@mui/material';
import Container from 'src/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import PageContainer from 'src/customs/components/container/PageContainer';
import { useSession } from 'src/customs/contexts/SessionContext';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import CloseIcon from '@mui/icons-material/Close';
import FormAddDepartment from './FormAddDepartment';
import FormAddDistrict from './FormAddDistrict';
import FormAddOrganization from './FormAddOrganization';
import {
  getAllDepartmentsPagination,
  getAllDistrictsPagination,
  getOrganizationById,
  getDepartmentById,
  getDistrictById,
  getAllOrganizationPagination,
  getVisitorEmployee,
} from 'src/customs/api/admin';
import { Item } from 'src/customs/api/models/Admin/Department';
import { IconBuilding, IconBuildingSkyscraper, IconMapPins } from '@tabler/icons-react';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import ConfirmUnsavedDialog from '../../components/ConfirmUnsavedDialog';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useOrganizationPagination } from 'src/hooks/Organization/useOrganizationPagination';
import { useDepartmentPagination } from 'src/hooks/Department/useDepartmentPagination';
import { useDistrictPagination } from 'src/hooks/District/useDistrictPagination';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useDepartmentMutation } from 'src/hooks/Department/useDepartmentMutation';
import { useOrganizationMutation } from 'src/hooks/Organization/useOrganizationMutation';
import { useDistrictMutation } from 'src/hooks/District/useDistrictMutation';

type EnableField = {
  name: boolean;
  code: boolean;
  host: boolean;
};

type SuccessOpts = {
  entity: 'department' | 'district' | 'organization';
  action: 'create' | 'update';
  keepOpen?: boolean;
};

type DialogEntity = 'Organizations' | 'Departments' | 'Districts';
type DialogMode = 'add' | 'edit';
type DialogState = { mode: DialogMode; entity: DialogEntity } | null;

const entityLabel = (e?: DialogEntity) =>
  e
    ? e === 'Organizations'
      ? 'Organization'
      : e === 'Departments'
      ? 'Department'
      : 'District'
    : '';

const Content = () => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<'organization' | 'department' | 'district'>(
    'organization',
  );
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const [pendingAdd, setPendingAdd] = useState<DialogEntity | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDir, setSortDir] = useState<string>('desc');
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [searchKeyword, setSearchKeyword] = useState(initialSearch);
  const initialPage = Number(searchParams.get('page') || 0);
  const [page, setPage] = useState(initialPage);
  const [employeeMap, setEmployeeMap] = useState<Record<string, string>>({});
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  useEffect(() => {
   

    const fetchEmployees = async () => {
      try {
        const res = await getVisitorEmployee();
        const map = Array.isArray(res?.collection)
          ? res.collection.reduce((acc: any, emp: any) => {
              acc[emp.id] = emp.name;
              return acc;
            }, {})
          : {};
        setEmployeeMap(map);
      } catch (err) {
        console.error('Failed to fetch employees:', err);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [selectedType]);

  const organizationQuery = useOrganizationPagination({
    page,
    rowsPerPage,
    sortDir,
    searchKeyword,
  });

  const departmentQuery = useDepartmentPagination({
    page,
    rowsPerPage,
    sortDir,
    searchKeyword,
  });

  const districtQuery = useDistrictPagination({
    page,
    rowsPerPage,
    sortDir,
    searchKeyword,
  });

  const { remove } = useDepartmentMutation();
  const { removeOrganization: deleteOrganization } = useOrganizationMutation();
  const { remove: deleteDistrict } = useDistrictMutation();

  const currentQuery =
    selectedType === 'organization'
      ? organizationQuery
      : selectedType === 'department'
      ? departmentQuery
      : districtQuery;
  const loading = currentQuery.isLoading || currentQuery.isFetching;
  const response = currentQuery.data;
  const tableData = useMemo(
    () =>
      (response?.collection ?? []).map((item: any) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        host: employeeMap[item.host] || item.host,
      })),
    [response, employeeMap],
  );

  const totalRecords = response?.RecordsTotal ?? 0;
  const hasFetched = currentQuery.isSuccess;

  const totalsQueries = useQueries({
    queries: [
      {
        queryKey: ['organization-total'],
        queryFn: () => getAllOrganizationPagination(0, 1, sortDir),
      },
      {
        queryKey: ['department-total'],
        queryFn: () => getAllDepartmentsPagination(0, 1, sortDir),
      },
      {
        queryKey: ['district-total'],
        queryFn: () => getAllDistrictsPagination(0, 1, sortDir),
      },
    ],
  });
  const totals = {
    organization: totalsQueries[0].data?.RecordsTotal ?? 0,
    department: totalsQueries[1].data?.RecordsTotal ?? 0,
    district: totalsQueries[2].data?.RecordsTotal ?? 0,
  };

  const cards = [
    {
      title: t('total_organization'),
      subTitle: totals.organization.toString(),
      subTitleSetting: totals.organization,
      icon: IconBuildingSkyscraper,
      color: 'none',
    },
    {
      title: t('total_department'),
      subTitle: totals.department.toString(),
      subTitleSetting: totals.department,
      icon: IconBuilding,
      color: 'none',
    },
    {
      title: t('total_district'),
      subTitle: totals.district.toString(),
      subTitleSetting: totals.district,
      icon: IconMapPins,
      color: 'none',
    },
  ];

  const [dialog, setDialog] = useState<DialogState>(null);
  const editTokenRef = useRef(0);
  const [editingRow, setEditingRow] = useState<Item | null>(null);
  const [isBatchEdit, setIsBatchEdit] = useState(false);
  const [enabledFields, setEnabledFields] = useState<EnableField>({
    name: false,
    code: false,
    host: false,
  });
  const [isAttemptingClose, setIsAttemptingClose] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const mapSelectedToEntity = useMemo<DialogEntity>(() => {
    if (selectedType === 'organization') return 'Organizations';
    if (selectedType === 'department') return 'Departments';
    return 'Districts';
  }, [selectedType]);

  const handleAdd = (entity: DialogEntity) => {
    if (isDirty) {
      setPendingAdd(entity);
      setConfirmDialogOpen(true);
      return;
    }

    setDialog({ mode: 'add', entity });
  };

  const openEdit = async (entity: DialogEntity, row: Item) => {
    
    // setLoading(true);
    const myToken = ++editTokenRef.current;
    try {
      let res: any;
      if (entity === 'Organizations') res = await getOrganizationById(row.id);
      else if (entity === 'Departments') res = await getDepartmentById(row.id);
      else res = await getDistrictById(row.id);

      if (myToken !== editTokenRef.current) return;

      const full = res?.collection ?? res ?? row;
      setEditingRow(full);
      setDialog({ mode: 'edit', entity });
    } catch (e) {
      console.error('Fetch detail error:', e);
    }
  };

  const closeDialog = () => {
    editTokenRef.current++;
    setDialog(null);
    setEditingRow(null);
    setIsBatchEdit(false);
    setEnabledFields({ name: false, code: false, host: false });
  };

  const attemptCloseDialog = () => {
    if ((dialog?.mode === 'add' || dialog?.mode === 'edit') && isDirty) {
      setIsAttemptingClose(true);
      setConfirmDialogOpen(true);
      return;
    }

    closeDialog();
  };

  const handleDelete = useCallback(
    async (row: Item) => {
  

      const confirmed = await showConfirmDelete(
        `Are you sure you want to delete ${selectedType} "${row.name}"?`,
      );

      if (!confirmed) return;

      try {
        let successText = '';

        switch (selectedType) {
          case 'department':
            await remove.mutateAsync({
              id: row.id,
     
            });

            successText = `Department "${row.name}" has been successfully deleted.`;
            break;

          case 'district':
            await deleteDistrict.mutateAsync({
              id: row.id,
        
            });

            successText = `District "${row.name}" has been successfully deleted.`;
            break;

          case 'organization':
          default:
            await deleteOrganization.mutateAsync({
              id: row.id,
       
            });

            successText = `Organization "${row.name}" has been successfully deleted.`;
            break;
        }

        showSwal('success', successText);
      } catch (error) {
        showSwal('error', `Failed to delete ${selectedType} "${row.name}".`);
      }
    },
    [ selectedType, remove, deleteDistrict, deleteOrganization],
  );

  const handleBatchDelete = async (rows: Item[]) => {
    if ( rows.length === 0) return;

    const confirmed = await showConfirmDelete(`Are you sure to delete ${rows.length} items?`);

    if (!confirmed) return;

    try {
      await Promise.all(
        rows.map((row) => {
          switch (selectedType) {
            case 'department':
              return remove.mutateAsync({
                id: row.id,
             
              });

            case 'district':
              return deleteDistrict.mutateAsync({
                id: row.id,
            
              });

            default:
              return deleteOrganization.mutateAsync({
                id: row.id,
             
              });
          }
        }),
      );

      showSwal('success', `${rows.length} items have been deleted.`);
      setSelectedRows([]);
    } catch (err: any) {
      showSwal('error', err.message || 'Failed to delete some items.');
    }
  };

  const handleBatchEdit = () => {
    if (selectedRows.length === 0) return;
    setIsBatchEdit(true);
    if (selectedRows.length === 1) {
      openEdit(mapSelectedToEntity, selectedRows[0]);
    } else {
      setEditingRow(null);
      setDialog({ mode: 'edit', entity: mapSelectedToEntity });
    }
  };

  const handleSuccess = ({ keepOpen }: SuccessOpts) => {
    if (!keepOpen) {
      closeDialog();
    }

    setIsDirty(false);
  };

  const handleDiscard = () => {
    if (isAttemptingClose) {
      setConfirmDialogOpen(false);
      setIsAttemptingClose(false);
      setIsDirty(false);

      closeDialog();
      return;
    }

    if (pendingAdd) {
      setDialog({ mode: 'add', entity: pendingAdd });
    }

    setConfirmDialogOpen(false);
    setPendingAdd(null);
  };

  const handleSearchKeywordChange = useCallback((keyword: string) => {
    setSearchInput(keyword);
  }, []);

  const handleSearch = useCallback(
    (keyword: string) => {
      setPage(0);
      setSearchInput(keyword);
      setSearchKeyword(keyword);

      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);

        if (keyword?.trim()) {
          params.set('search', keyword);
        } else {
          params.delete('search');
        }

        params.set('page', '0');

        return params;
      });
    },
    [setSearchParams],
  );

  const [tableKey, setTableKey] = useState(0);

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Company & Department" description="this is Dashboard page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>

            <Grid container mt={1} size={{ xs: 12, lg: 12 }}>
              <Grid size={{ xs: 12, lg: 12 }}>
                <DynamicTable
                  key={tableKey}
                  loading={loading}
                  isHavePagination
                  totalCount={totalRecords}
                  currentPage={page}
                  defaultRowsPerPage={rowsPerPage}
                  onPaginationChange={(newPage, newRowsPerPage) => {
                    setPage(newPage);
                    setRowsPerPage(newRowsPerPage);

                    // setSearchParams((prev) => {
                    //   const params = new URLSearchParams(prev);

                    //   params.set('page', String(newPage));
                    //   return params;
                    // });
                  }}
                  overflowX="auto"
                  data={tableData}
                  selectedRows={selectedRows}
                  isHaveChecked
                  isHaveAction
                  isActionVisitor={false}
                  isHaveSearch
                  isHaveFilter={false}
                  hasFetched={hasFetched}
                  isHaveExportPdf={false}
                  isHaveExportXlf={false}
                  isHaveFilterDuration={false}
                  selectedHeaderItem={selectedType}
                  isHaveAddData
                  onBatchEdit={handleBatchEdit}
                  isHaveHeader
                  headerContent={{
                    title: '',
                    items: [{ name: 'organization' }, { name: 'department' }, { name: 'district' }],
                  }}
                  defaultSelectedHeaderItem="organization"
                  onHeaderItemClick={(item) => {
                    if (
                      item.name === 'organization' ||
                      item.name === 'department' ||
                      item.name === 'district'
                    ) {
                      setSelectedType(item.name);
                      setPage(0);
                      setTableKey((prev) => prev + 1);
                      setSearchParams((prev) => {
                        const params = new URLSearchParams(prev);
                        params.set('page', '0');
                        return params;
                      });
                    }
                  }}
                  onCheckedChange={(selected) => setSelectedRows(selected)}
                  onEdit={(row) => openEdit(mapSelectedToEntity, row)}
                  onDelete={handleDelete}
                  onBatchDelete={handleBatchDelete}
                  searchKeyword={searchInput}
                  onSearch={handleSearch}
                  onSearchKeywordChange={handleSearchKeywordChange}
                  onAddData={() => handleAdd(mapSelectedToEntity)}
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Dialog
        open={!!dialog}
        onClose={(_, reason) => {
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            attemptCloseDialog();
          }
        }}
        disableEscapeKeyDown
        fullWidth
        maxWidth="md"
        transitionDuration={0}
        TransitionProps={{ onExited: () => setEditingRow(null) }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {dialog?.mode === 'add' && `Add ${entityLabel(dialog?.entity)}`}
          {dialog?.mode === 'edit' &&
            (isBatchEdit
              ? `Edit Batch ${entityLabel(dialog?.entity)}`
              : `Edit ${entityLabel(dialog?.entity)}`)}
          <IconButton aria-label="close" onClick={attemptCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ paddingTop: 0 }}>
          <br />
          {dialog?.entity === 'Organizations' && (
            <FormAddOrganization
              mode={dialog.mode === 'add' ? 'create' : isBatchEdit ? 'batch' : 'edit'}
              data={editingRow}
              selectedRows={selectedRows}
              enabledFields={enabledFields}
              setEnabledFields={setEnabledFields}
              onSuccess={() => {
                handleSuccess({
                  entity: 'organization',
                  action: dialog.mode === 'add' ? 'create' : 'update',
                  keepOpen: false,
                });
                selectedRows.length > 0 && setSelectedRows([]);
              }}
              onDirtyChange={setIsDirty}
            />
          )}

          {dialog?.entity === 'Departments' && (
            <FormAddDepartment
              mode={dialog.mode === 'add' ? 'create' : isBatchEdit ? 'batch' : 'edit'}
              data={editingRow}
              selectedRows={selectedRows}
              enabledFields={enabledFields}
              setEnabledFields={setEnabledFields}
              onSuccess={() => {
                handleSuccess({
                  entity: 'department',
                  action: dialog.mode === 'add' ? 'create' : 'update',
                  keepOpen: false,
                });
                selectedRows.length > 0 && setSelectedRows([]);
              }}
              onDirtyChange={setIsDirty}
            />
          )}

          {dialog?.entity === 'Districts' && (
            <FormAddDistrict
              mode={dialog.mode === 'add' ? 'create' : isBatchEdit ? 'batch' : 'edit'}
              data={editingRow}
              selectedRows={selectedRows}
              enabledFields={enabledFields}
              setEnabledFields={setEnabledFields}
              onSuccess={() => {
                handleSuccess({
                  entity: 'district',
                  action: dialog.mode === 'add' ? 'create' : 'update',
                  keepOpen: false,
                });
                selectedRows.length > 0 && setSelectedRows([]);
              }}
              onDirtyChange={setIsDirty}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmUnsavedDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onDiscard={handleDiscard}
      />
    </PageContainer>
  );
};

export default Content;
