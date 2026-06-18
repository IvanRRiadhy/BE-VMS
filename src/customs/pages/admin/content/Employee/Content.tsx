import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Backdrop,
  Box,
  CircularProgress,
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
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  CreateEmployeeRequest,
  CreateEmployeeRequestSchema,
  Item,
} from 'src/customs/api/models/Admin/Employee';
import {
  getAllEmployeePaginationFilterMore,
  getAllEmployee,
  deleteEmployee,
  createBlacklist,
  createEmployeeBlacklist,
} from 'src/customs/api/admin';

import { IconUsers } from '@tabler/icons-react';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import FilterMoreContent from './FilterMoreContent';
import ConfirmUnsavedDialog from '../../components/ConfirmUnsavedDialog';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import { useOrganization } from 'src/hooks/useOrganization';
import { useDepartment } from 'src/hooks/useDepartment';
import { useDistricts } from 'src/hooks/useDistricts';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

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

interface OptionItem {
  id: string;
  name: string;
}

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
  const [tableData, setTableData] = useState<Item[]>([]);
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const { token } = useSession();
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [edittingId, setEdittingId] = useState('');
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [tableRowEmployee, setTableRowEmployee] = useState<EmployeesTableRow[]>([]);
  const [sortDir, setSortDir] = useState<string>('desc');
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const { organizations } = useOrganization();
  const { department } = useDepartment();
  const { districts } = useDistricts();
  const [loadingData, setLoadingData] = useState(false);
  const { t } = useTranslation();

  const [filters, setFilters] = useState<Filters>({
    joinStart: '',
    // joinEnd: '',
    // exitStart: '',
    exitEnd: '',
    gender: 0,
    statusEmployee: 0,
    organization: '',
    department: '',
    district: '',
  });

  const cards = [
    {
      title: t('total_employee'),
      icon: IconUsers,
      subTitle: `${totalRecords}`,
      subTitleSetting: 10,
      color: 'none',
    },
  ];

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const start = page * rowsPerPage;

        let employeeRes: any;
        try {
          employeeRes = await getAllEmployeePaginationFilterMore(
            token,
            start,
            rowsPerPage,
            sortColumn,
            sortDir,
            search,
            filters.gender === 0 ? undefined : filters.gender,
            filters.joinStart,
            filters.exitEnd,
            filters.statusEmployee === 0 ? undefined : filters.statusEmployee,
            String(filters.organization),
            String(filters.district),
            String(filters.department),
          );
        } catch (err: any) {
          throw err;
        }

        const safeCollection = Array.isArray(employeeRes?.collection) ? employeeRes.collection : [];

        setTableData(safeCollection);
        setTotalRecords(employeeRes?.RecordsTotal ?? safeCollection.length ?? 0);
        setTotalFilteredRecords(employeeRes?.RecordsFiltered ?? safeCollection.length ?? 0);

        const rows = safeCollection.map((item: any) => ({
          id: item.id,
          name: item.name,
          faceimage: item.faceimage,
          organization: item.organization?.name || '-',
          department: item.department?.name || '-',
        }));
        setTableRowEmployee(rows);
      } catch (error: any) {
        console.error('Error fetching data:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, page, rowsPerPage, refreshTrigger, search]);

  const [initialFormData, setInitialFormData] = useState<CreateEmployeeRequest>(() => {
    const saved = localStorage.getItem('unsavedEmployeeData');
    try {
      const parsed = saved ? JSON.parse(saved) : {};
      return CreateEmployeeRequestSchema.parse(parsed);
    } catch (e) {
      return CreateEmployeeRequestSchema.parse({});
    }
  });

  const [formDataAddEmployee, setFormDataAddEmployee] = useState<CreateEmployeeRequest>(() => {
    const saved = localStorage.getItem('unsavedEmployeeData');

    try {
      const parsed = saved ? JSON.parse(saved) : {};
      return CreateEmployeeRequestSchema.parse(parsed);
    } catch (e) {
      return CreateEmployeeRequestSchema.parse({});
    }
  });

  const isFormChanged = useMemo(() => {
    return JSON.stringify(formDataAddEmployee) !== JSON.stringify(initialFormData);
  }, [formDataAddEmployee]);

  useEffect(() => {
    const defaultFormData = CreateEmployeeRequestSchema.parse({});
    const isChanged = JSON.stringify(formDataAddEmployee) !== JSON.stringify(defaultFormData);

    if (isChanged) {
      localStorage.setItem('unsavedEmployeeData', JSON.stringify(formDataAddEmployee));
    }
  }, [formDataAddEmployee]);

  const [openFormAddEmployee, setOpenFormAddEmployee] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [isBatchEdit, setIsBatchEdit] = useState(false);

  const handleOpenDialog = () => setOpenFormAddEmployee(true);
  const handleCloseDialog = () => {
    localStorage.removeItem('unsavedEmployeeData');
    setOpenFormAddEmployee(false);
    setIsBatchEdit(false);
    setEdittingId('');
  };

  const handleAdd = useCallback(() => {
    const freshForm = CreateEmployeeRequestSchema.parse({});
    setFormDataAddEmployee(freshForm);
    setInitialFormData(freshForm);
    localStorage.setItem('unsavedEmployeeData', JSON.stringify(freshForm));
    setPendingEditId(null);
    handleOpenDialog();
  }, []);

  const handleEdit = (id: string) => {
    const existingData = tableData.find((item) => String(item.id) === String(id));

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
        { active: 1, 'non active': 2, nonactive: 2, inactive: 2, '0': 0, '1': 1, '2': 2 },
        0,
      ),

      organization_id: String(s?.organization_id ?? ''),
      department_id: String(s?.department_id ?? ''),
      district_id: String(s?.district_id ?? ''),
    });

    const parseSafe = (raw: any) => CreateEmployeeRequestSchema.parse(coerceEmployee(raw));

    const editing = localStorage.getItem('unsavedEmployeeData');

    if (!editing) {
      const parsedData = parseSafe(existingData);
      setEdittingId(id);
      setFormDataAddEmployee(parsedData);
      setInitialFormData(parsedData);
      localStorage.setItem('unsavedEmployeeData', JSON.stringify({ ...parsedData, id }));
      handleOpenDialog();
      return;
    }

    const editingData = JSON.parse(editing);

    if (editingData.id === id) {
      const parsedData = parseSafe(existingData);
      setEdittingId(id);
      setFormDataAddEmployee(parsedData);
      setInitialFormData(parsedData);
      handleOpenDialog();
      return;
    }

    setPendingEditId(id);
    setConfirmDialogOpen(true);
  };

  const normalizeGender = (val: any) => {
    if (val === 'Female') return 0;
    if (val === 'Male') return 1;
    return Number(val ?? 0);
  };

  const handleConfirmEdit = () => {
    setConfirmDialogOpen(false);
    localStorage.removeItem('unsavedEmployeeData');

    if (pendingEditId) {
      const existingData = tableData.find((item) => item.id === pendingEditId);

      if (existingData) {
        try {
          const normalized = {
            ...existingData,
            gender: normalizeGender(existingData.gender),
          };

          const parsedData = {
            ...CreateEmployeeRequestSchema.parse(normalized),
            id: pendingEditId,
          };

          setEdittingId(pendingEditId);
          setFormDataAddEmployee(parsedData);
          setInitialFormData(parsedData);
          localStorage.setItem('unsavedEmployeeData', JSON.stringify(parsedData));
          setPendingEditId(null);
          setOpenFormAddEmployee(true);
        } catch (err) {
          console.error('Parse error:', err);
        }
      }
    } else {
      setEdittingId('');
      const newForm = CreateEmployeeRequestSchema.parse({});
      setFormDataAddEmployee(newForm);
      setInitialFormData(newForm);
      localStorage.setItem('unsavedEmployeeData', JSON.stringify(newForm));
      handleCloseDialog();
    }
  };

  const handleCancelEdit = () => {
    setEdittingId('');
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  const handleDelete = async (row: EmployeesTableRow) => {
    if (!token) return;

    const name = row.name || '-';

    const confirmed = await showConfirmDelete(
      `Are you sure you want to delete employee "${name}"?`,
    );

    if (confirmed) {
      setLoading(true);
      try {
        await deleteEmployee(row.id, token);
        setRefreshTrigger((prev) => prev + 1);
        showSwal('success', `Successfully deleted employee "${name}".`);
      } catch (error) {
        showSwal('error', `Failed to delete employee "${name}".`);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    }
  };

  const handleBatchDelete = async (rows: EmployeesTableRow[]) => {
    if (!token || rows.length === 0) return;

    const confirmed = await showConfirmDelete(`Are you sure to delete ${rows.length} employees?`);

    if (!confirmed) return false;

    setLoading(true);
    try {
      await Promise.all(rows.map((row) => deleteEmployee(row.id, token)));
      setRefreshTrigger((prev) => prev + 1);
      showSwal('success', `Succesfully deleted ${rows.length} employees.`);
      setSelectedRows([]);
      return true;
    } catch (error) {
      showSwal('error', 'Failed to delete some employees.');
      return false;
    } finally {
      setLoading(false);
    }
    // }
  };

  const handleApplyFilter = () => {
    setPage(0);
    setRefreshTrigger((prev) => prev + 1);
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

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    setInitialFormData((_) => formDataAddEmployee);
    setOpenFormAddEmployee(false);

    localStorage.removeItem('unsavedEmployeeData');
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

      setLoadingData(true);

      const payload = {
        employee_id: id,
        action: isBlacklistAction ? 'blacklist' : 'whitelist',
        reason: inputReason.trim(),
      };
      await createEmployeeBlacklist(token as string, payload);

      showSwal(
        'success',
        isBlacklistAction
          ? 'Successfully blacklisted employee'
          : 'Successfully whitelisted employee',
      );

      setRefreshTrigger((prev) => prev + 1);
    } catch (error: any) {
      showSwal('error', error?.response?.data?.msg ?? 'Failed to blacklist or whitelist employee.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleBlacklistMemo = useCallback((row: any) => {
    handleBlacklist(row.id, Boolean(row.is_blacklist));
  }, []);

  const navigate = useNavigate();

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Employee" description="this is Employee page">
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
          />
        </DialogContent>
      </Dialog>

      <ConfirmUnsavedDialog
        open={confirmDialogOpen}
        onClose={handleCancelEdit}
        onDiscard={handleConfirmEdit}
      />
      <Backdrop
        open={loadingData}
        sx={{
          color: '#fff',
          zIndex: 999999,
        }}
      >
        <CircularProgress color="primary" />
      </Backdrop>
    </PageContainer>
  );
};

export default Content;
