import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
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
  getAllOrganizations,
  getAllDepartments,
  getAllDistricts,
} from 'src/customs/api/admin';

import { IconUsers } from '@tabler/icons-react';

// Alert
import {
  showConfirmDelete,
  showSwal,
} from 'src/customs/components/alerts/alerts';
import FilterMoreContent from './FilterMoreContent';

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
  const [isDataReady, setIsDataReady] = useState(false);
  const { token } = useSession();
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [edittingId, setEdittingId] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [tableRowEmployee, setTableRowEmployee] = useState<EmployeesTableRow[]>([]);
  const [sortDir, setSortDir] = useState<string>('desc');
  const [organizationData, setOrganizationData] = useState<OptionItem[]>([]);
  const [departmentData, setDepartmentData] = useState<OptionItem[]>([]);
  const [districtData, setDistrictData] = useState<OptionItem[]>([]);

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
      title: 'Total Vendor',
      icon: IconUsers,
      subTitle: `${totalFilteredRecords}`,
      subTitleSetting: 10,
      color: 'none',
    },
  ];

  const fetchDataOrganization = async () => {
    try {
      const res = await getAllOrganizations(token as string);
      setOrganizationData(res?.collection ?? []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDataDepartment = async () => {
    try {
      const res = await getAllDepartments(token as string);
      setDepartmentData(res?.collection ?? []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDataDistrict = async () => {
    try {
      const res = await getAllDistricts(token as string);
      setDistrictData(res?.collection ?? []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDataOrganization();
    fetchDataDepartment();
    fetchDataDistrict();
  }, [token]);

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
            searchKeyword,
            filters.gender === 0 ? undefined : filters.gender,
            filters.joinStart,
            filters.exitEnd,
            filters.statusEmployee === 0 ? undefined : filters.statusEmployee,
            String(filters.organization),
            String(filters.district),
            String(filters.department),
          );
        } catch (err: any) {
          if (err?.response?.status === 404 || err?.status === 404) {
            setTableData([]);
            setTableRowEmployee([]);
            setTotalRecords(0);
            setTotalFilteredRecords(0);
            return;
          }
          throw err;
        }

        const safeCollection = Array.isArray(employeeRes?.collection) ? employeeRes.collection : [];
        const isNotFound =
          employeeRes?.status_code === 404 ||
          employeeRes?.status === 'not_found' ||
          safeCollection.length === 0;

        if (isNotFound) {
          setTableData([]);
          setTableRowEmployee([]);
          setTotalRecords(0);
          setTotalFilteredRecords(0);
          setIsDataReady(true);
          return;
        }

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
        setIsDataReady(true);
      } catch (error: any) {
        console.error('Error fetching data:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, page, rowsPerPage, sortColumn, refreshTrigger, searchKeyword]);

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
      console.error('Invalid saved data, fallback to default schema.');
      return CreateEmployeeRequestSchema.parse({});
    }
  });

  const [isEditing, setIsEditing] = useState(false);

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
    setIsEditing(false);
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
    console.log('existingData', existingData);
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
      // pastikan tidak NaN:
      gender: toNum(s?.gender, { female: 0, male: 1, f: 0, m: 1, '0': 0, '1': 1 }, 0),

      status_employee: toNum(
        s?.status_employee,
        { active: 1, 'non active': 2, nonactive: 2, inactive: 2, '0': 0, '1': 1, '2': 2 },
        0,
      ),

      // id relasi → string
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

  const handleConfirmEdit = () => {
    setConfirmDialogOpen(false);
    localStorage.removeItem('unsavedEmployeeData');

    if (pendingEditId) {
      const existingData = tableData.find((item) => item.id === pendingEditId);
      if (existingData) {
        const parsedData = {
          ...CreateEmployeeRequestSchema.parse(existingData),
          id: pendingEditId,
        };
        setEdittingId(pendingEditId);
        setFormDataAddEmployee(parsedData);
        setInitialFormData(parsedData);
        localStorage.setItem('unsavedEmployeeData', JSON.stringify(parsedData));
        setPendingEditId(null);
        setOpenFormAddEmployee(true);
        setIsEditing(true);
      }
    } else {
      setEdittingId('');
      const newForm = CreateEmployeeRequestSchema.parse({});
      setFormDataAddEmployee(newForm);
      setInitialFormData(newForm);
      localStorage.setItem('unsavedEmployeeData', JSON.stringify(newForm));
      handleCloseDialog();
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEdittingId('');
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  const handleDelete = async (id: string) => {
    if (!token) return;

    const confirmed = await showConfirmDelete('Are you sure delete this employee?');

    if (confirmed) {
      setLoading(true);
      try {
        await deleteEmployee(id, token);
        setRefreshTrigger((prev) => prev + 1);
        showSwal('success', 'Succesfully deleted employee.');
      } catch (error) {
        showSwal('error', 'Failed to delete employee.');
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    }
  };

  const handleBatchDelete = async (rows: EmployeesTableRow[]) => {
    if (!token || rows.length === 0) return;

    const confirmed = await showConfirmDelete(`Are you sure to delete ${rows.length} employees?`);

    if (confirmed) {
      setLoading(true);
      try {
        await Promise.all(rows.map((row) => deleteEmployee(row.id, token)));
        setRefreshTrigger((prev) => prev + 1);
        showSwal('success', `Succesfully deleted ${rows.length} employees.`);
        setSelectedRows([]);
      } catch (error) {
        showSwal('error', 'Failed to delete some employees.');
      } finally {
        setLoading(false);
      }
    }
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
  // handle dialog close
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

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Vendor" description="this is Vendor page">
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
                isHavePagination={true}
                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 20, 50, 100]}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                isHaveAddData={true}
                isHaveFilterMore={true}
                filterMoreContent={
                  <FilterMoreContent
                    filters={filters}
                    setFilters={setFilters}
                    onApplyFilter={handleApplyFilter}
                    organizationData={organizationData}
                    departmentData={departmentData}
                    districtData={districtData}
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
                onDelete={(row) => handleDelete(row.id)}
                onBatchDelete={handleBatchDelete}
                onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                onAddData={() => {
                  handleAdd();
                }}
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
        <Divider />
        <DialogContent>
          <br />
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
      <Dialog open={confirmDialogOpen} onClose={handleCancelEdit}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          You have unsaved changes for another Employee. Are you sure you want to discard them and
          edit this Employee?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancel</Button>
          <Button onClick={handleConfirmEdit} color="primary" variant="contained">
            Yes, Discard and Continue
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default Content;
