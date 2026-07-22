import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
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
import FormWizardAddEmployee from './FormWizardAddEmployee';
import {
  CreateEmployeeRequestSchema,
  Item,
} from 'src/customs/api/models/Admin/Employee';
import { getEmployeeById } from 'src/customs/api/admin';
import { IconUsers } from '@tabler/icons-react';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import FilterMoreContent from './FilterMoreContent';
import ConfirmUnsavedDialog from '../../components/ConfirmUnsavedDialog';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import { useOrganization } from 'src/hooks/Organization/useOrganization';
import { useDepartment } from 'src/hooks/Department/useDepartment';
import { useDistricts } from 'src/hooks/District/useDistricts';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useEmployeePagination } from 'src/hooks/Employee/useEmployeePagination';
import { useEmployeeMutation } from 'src/hooks/Employee/useEmployeeMutation';
import GlobalBackdropLoading from 'src/customs/pages/Operator/Components/GlobalBackdrop';
import { QueryClient, useQueryClient } from '@tanstack/react-query';

type EmployeesTableRow = {
  id: string;
  name: string;
  faceimage?: string;
  organization_id?: string;
  department_id?: string;
  district_id?: string;
};

type EnableField = {
  gender: boolean;
  organization_id: boolean;
  department_id: boolean;
  district_id: boolean;
};

interface Filters {
  gender: number;
  organization: string;
  department: string;
  district: string;
  joinStart: string;
  exitEnd: string;
  statusEmployee: number;
}

const Content = () => {
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [edittingId, setEdittingId] = useState('');
  const [sortDir, setSortDir] = useState<string>('desc');
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const { organizations } = useOrganization();
  const { department } = useDepartment();
  const { districts } = useDistricts();
  const [openFormAddEmployee, setOpenFormAddEmployee] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [isBatchEdit, setIsBatchEdit] = useState(false);
  const navigate = useNavigate();
  const { remove, blacklist } = useEmployeeMutation();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<Filters>({
    joinStart: '',
    exitEnd: '',
    gender: 0,
    statusEmployee: 0,
    organization: '',
    department: '',
    district: '',
  });
  const { t } = useTranslation();
  const [isDirty, setIsDirty] = useState(false);
  const employeeQuery = useEmployeePagination({
    page,
    rowsPerPage,
    sortDir,
    search,
    filters,
  });

  const tableData = useMemo<Item[]>(() => {
    return employeeQuery.data?.collection ?? [];
  }, [employeeQuery.data]);

  const totalRecords = employeeQuery.data?.RecordsTotal ?? 0;
  const totalFilteredRecords = employeeQuery.data?.RecordsFiltered ?? 0;
  const cards = useMemo(
    () => [
      {
        title: t('total_employee'),
        icon: IconUsers,
        subTitle: `${totalRecords}`,
        subTitleSetting: 10,
        color: 'none',
      },
    ],
    [t, totalRecords]
  );
  const loading = employeeQuery.isPending;
  const tableRowEmployee = useMemo(() => {
    const collection = employeeQuery.data?.collection ?? [];

    return collection.map((item: any) => ({
      id: item.id,
      name: item.name,
      organization: item.organization?.name ?? item.Organization?.name ?? '-',
      department: item.department?.name ?? item.Department?.name ?? '-',
      faceimage: item.faceimage,
      is_blacklist: item.is_blacklist,
    }));
  }, [employeeQuery.data]);

  const [initialFormData, setInitialFormData] = useState(CreateEmployeeRequestSchema.parse({}));
  const [formDataAddEmployee, setFormDataAddEmployee] = useState(
    CreateEmployeeRequestSchema.parse({}),
  );

  const isFormChanged = useMemo(() => {
    return JSON.stringify(formDataAddEmployee) !== JSON.stringify(initialFormData);
  }, [formDataAddEmployee]);

  const handleOpenDialog = () => setOpenFormAddEmployee(true);
  const handleCloseDialog = () => {
    setOpenFormAddEmployee(false);
    setIsBatchEdit(false);
    setEdittingId('');
  };

  const handleAdd = () => {
    const fresh = CreateEmployeeRequestSchema.parse({});

    setFormDataAddEmployee(fresh);
    setInitialFormData(fresh);
    setIsDirty(false);

    handleOpenDialog();
  };

  const handleEdit = async (id: string) => {
    // const existingData = await getEmployeeById(String(id));
    const existingData = employeeQuery.data?.collection.find(
      (item) => item.id === id
    );
    if (!existingData) return;


    const toNum = (
      v: unknown,
      map: Record<string, number> = {},
      fallback: number | undefined = 0,
    ) => {
      if (v === '' || v == null) return fallback;
      if (typeof v === 'number' && Number.isFinite(v)) return v;
      if (typeof v === 'boolean') return v ? 1 : 0;

      if (typeof v === 'string') {
        const t = v.trim().toLowerCase();

        if (t in map) return map[t];

        const n = Number(t);
        return Number.isFinite(n) ? n : fallback;
      }

      return fallback;
    };

    const coerceEmployee = (s: any) => ({
      ...s,
      gender: toNum(s?.gender, { female: 0, male: 1, f: 0, m: 1, '0': 0, '1': 1 }, 0),

      status_employee: toNum(
        s?.status_employee,
        {
          active: 1,
          'non active': 2,
          nonactive: 2,
          inactive: 2,
          '0': 0,
          '1': 1,
          '2': 2,
        },
        0,
      ),

      organization_id: String(s?.organization_id ?? ''),
      department_id: String(s?.department_id ?? ''),
      district_id: String(s?.district_id ?? ''),
    });

    const parsedData = CreateEmployeeRequestSchema.parse(coerceEmployee(existingData));

    if (isDirty) {
      setPendingEditId(id);
      setConfirmDialogOpen(true);
      return;
    }

    setEdittingId(id);
    setFormDataAddEmployee(parsedData);
    setInitialFormData(parsedData);
    setIsDirty(false);

    handleOpenDialog();
  };

  const toNum = (
    v: unknown,
    map: Record<string, number> = {},
    fallback: number | undefined = 0,
  ) => {
    if (v === '' || v == null) return fallback;
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'boolean') return v ? 1 : 0;

    if (typeof v === 'string') {
      const t = v.trim().toLowerCase();

      if (t in map) return map[t];

      const n = Number(t);
      return Number.isFinite(n) ? n : fallback;
    }

    return fallback;
  };

  const coerceEmployee = (employee: Item) =>
    CreateEmployeeRequestSchema.parse({
      ...employee,
      gender: toNum(
        employee.gender,
        {
          female: 0,
          male: 1,
          f: 0,
          m: 1,
          '0': 0,
          '1': 1,
        },
        0,
      ),

      status_employee: toNum(
        employee.status_employee,
        {
          active: 1,
          'non active': 2,
          nonactive: 2,
          inactive: 2,
          '0': 0,
          '1': 1,
          '2': 2,
        },
        0,
      ),

      organization_id: String(employee.organization_id ?? ''),
      department_id: String(employee.department_id ?? ''),
      district_id: String(employee.district_id ?? ''),
    });

  const handleConfirmEdit = () => {
    setConfirmDialogOpen(false);
    handleCloseDialog();
    if (!pendingEditId) {
      return;
    }
    const existingData = tableData.find((item) => item.id === pendingEditId);
    if (!existingData) return;

    const parsedData = coerceEmployee(existingData);
    setEdittingId(pendingEditId);
    setFormDataAddEmployee(parsedData);
    setInitialFormData(parsedData);
    setIsDirty(false);

    setPendingEditId(null);
    handleOpenDialog();
  };

  const handleCancelEdit = () => {
    setEdittingId('');
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  const handleDelete = async (row: EmployeesTableRow) => {
    const name = row.name || '-';

    const confirmed = await showConfirmDelete(
      t('confirmDelete', { name: `employee "${name}"` }),
    );

    if (confirmed) {
      try {
        await remove.mutateAsync({
          id: row.id,
        });

        showSwal('success', t('deleteSuccess', { name: `employee "${name}"` }));
      } catch (error: any) {
        showSwal('error', error.reseponse.data.message || t('deleteFailed', { name: `employee "${name}"` }));
      }
    }
  };

  const handleBatchDelete = async (rows: EmployeesTableRow[]) => {
    if (rows.length === 0) return;

    const confirmed = await showConfirmDelete(t('confirmDeleteMultiple', { count: rows.length, name: 'employees' }));

    if (!confirmed) return false;

    try {
      await Promise.all(
        rows.map((row) =>
          remove.mutateAsync({
            id: row.id,
          }),
        ),
      );

      showSwal('success', t('deleteSuccessMultiple', { count: rows.length, name: 'employees' }));
      setSelectedRows([]);
      return true;
    } catch (error: any) {
      showSwal('error', error.message || 'Failed to delete some employees.');
      return false;
    }
  };

  const handleApplyFilter = () => {
    setPage(0);
  };

  const [enabledFields, setEnabledFields] = useState<EnableField>({
    gender: false,
    organization_id: false,
    department_id: false,
    district_id: false,
  });

  const handleBatchEdit = (rows: any[]) => {
    const selectedId = rows[0]?.id;
    setEdittingId(selectedId);
    setIsBatchEdit(true);
    handleOpenDialog();
  };

  const handleSuccess = async () => {
    setInitialFormData((_) => formDataAddEmployee);
    // queryClient.invalidateQueries({ queryKey: ['employees'] });
    await employeeQuery.refetch();
    setOpenFormAddEmployee(false);
  };

  const handleDialogClose = (_event?: object, reason?: string) => {
    const isChanged = JSON.stringify(formDataAddEmployee) !== JSON.stringify(initialFormData);

    if ((reason === 'backdropClick' || reason === 'closeButton') && isChanged) {
      setConfirmDialogOpen(true);
      return;
    }

    if (isChanged) {
      setConfirmDialogOpen(true);
    } else {
      setConfirmDialogOpen(false);
      handleCloseDialog();
    }
  };

  const handleSearch = useCallback(
    (keyword: string) => {
      setPage(0);
      setSearch(keyword);
    },
    [setPage, setSearch],
  );

  const handleBlacklist = async (id: string, isBlacklist?: boolean) => {
    try {
      const isBlacklistAction = !isBlacklist;

      const { value: inputReason } = await Swal.fire({
        icon: isBlacklistAction ? 'warning' : 'question',
        title: isBlacklistAction ? 'Blacklist Employee' : 'Whitelist Employee',
        text: isBlacklistAction
          ? 'Please provide a reason for blacklist this employee'
          : 'Please provide a reason for whitelist this employee',
        input: 'text',
        inputPlaceholder: 'Enter reason...',
        inputAttributes: { maxlength: '200' },
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes',
        confirmButtonColor: isBlacklistAction ? '#16a34a' : '#16a34a',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        inputValidator: (value) => {
          if (!value || value.trim().length < 3) {
            return 'Reason must be at least 3 characters long.';
          }
          return null;
        },
      });

      if (!inputReason) return;

      const payload = {
        employee_id: id,
        action: isBlacklistAction ? 'blacklist' : 'whitelist',
        reason: inputReason.trim(),
      };
      await blacklist.mutateAsync({
        data: {
          employee_id: id,
          action: isBlacklistAction ? 'blacklist' : 'whitelist',
          reason: inputReason.trim(),
        },
      });

      showSwal(
        'success',
        isBlacklistAction
          ? 'Successfully blacklisted employee'
          : 'Successfully whitelisted employee',
      );
    } catch (error: any) {
      showSwal('error', error?.response?.data?.msg ?? 'Failed to blacklist or whitelist employee.');
    }
  };

  const handleBlacklistMemo = useCallback((row: any) => {
    handleBlacklist(row.id, Boolean(row.is_blacklist));
  }, []);



  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title={t('navigation.employees')} description="this is Employee page">
        <Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={loading}
                overflowX={'auto'}
                data={tableRowEmployee}
                selectedRows={selectedRows}
                totalCount={totalFilteredRecords}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveSearch={true}
                isHaveImage={true}
                isHaveFilter={false}
                isHaveExportPdf={false}
                // isListBlacklist={true}
                isBlacklistPage={true}
                onNavigatePage={() => {
                  navigate('/admin/manage/blacklist-employees');
                }}
                isHavePagination={true}
                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 50, 100]}
                currentPage={page}
                isHaveBlacklist={true}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                isHaveAddData={true}
                isHaveFilterMore={true}
                onBlacklist={handleBlacklistMemo}
                filterMoreContent={
                  <FilterMoreContent
                    filters={filters}
                    setFilters={setFilters}
                    onApplyFilter={handleApplyFilter}
                    organizationData={organizations}
                    departmentData={department}
                    districtData={districts}
                  />
                }
                isHaveHeader={false}
                onCheckedChange={(selected) => {
                  const fullSelectedItems = tableData.filter((item) =>
                    selected.some((row: EmployeesTableRow) => row.id === item.id),
                  );
                  setSelectedRows(fullSelectedItems);
                }}
                onEdit={(row) => {
                  handleEdit(row.id);
                  setEdittingId(row.id);
                }}
                onBatchEdit={handleBatchEdit}
                onDelete={(row) => handleDelete(row)}
                onBatchDelete={handleBatchDelete}
                searchKeyword={search}
                onSearch={handleSearch}
                onAddData={handleAdd}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
      <Dialog open={openFormAddEmployee} onClose={handleDialogClose} fullWidth maxWidth="md">
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 2,
          }}
        >
          {isBatchEdit ? 'Batch Edit' : edittingId ? 'Edit' : 'Add'} Employee
          <IconButton
            aria-label="close"
            onClick={() => {
              if (isFormChanged) {
                setConfirmDialogOpen(true);
              } else {
                handleCloseDialog();
              }
            }}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <FormWizardAddEmployee
            formData={formDataAddEmployee}
            setFormData={setFormDataAddEmployee}
            edittingId={edittingId}
            onSuccess={handleSuccess}
            isBatchEdit={isBatchEdit}
            selectedRows={selectedRows}
            enabledFields={enabledFields}
            setEnabledFields={setEnabledFields}
            organizations={organizations}
            department={department}
            districts={districts}
          />
        </DialogContent>
      </Dialog>

      <ConfirmUnsavedDialog
        open={confirmDialogOpen}
        onClose={handleCancelEdit}
        onDiscard={handleConfirmEdit}
      />
      <GlobalBackdropLoading open={remove.isPending || blacklist.isPending} />
    </PageContainer>
  );
};

export default Content;
