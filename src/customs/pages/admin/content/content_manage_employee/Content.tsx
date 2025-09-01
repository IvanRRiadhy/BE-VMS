import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid2 as Grid,
  Grid2,
  IconButton,
  MenuItem,
  Skeleton,
  RadioGroup,
  Card,
  Typography,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import CloseIcon from '@mui/icons-material/Close';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomRadio from 'src/components/forms/theme-elements/CustomRadio';
import FormWizardAddEmployee from './FormWizardAddEmployee';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  CreateEmployeeRequest,
  CreateEmployeeRequestSchema,
  Item,
} from 'src/customs/api/models/Employee';
import {
  getAllDepartmentsPagination,
  getAllDistrictsPagination,
  getAllEmployeePagination,
  getAllEmployeePaginationFilterMore,
  getAllOrganizatiosPagination,
  getAllEmployee,
  deleteEmployee,
} from 'src/customs/api/admin';

import { IconUsers } from '@tabler/icons-react';

// Alert
import {
  showConfirmDelete,
  showSuccessAlert,
  showErrorAlert,
} from 'src/customs/components/alerts/alerts';

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
  // access_area: boolean;
  // access_area_special: boolean;
};

interface OptionItem {
  id: string; // atau 'number' jika ID dari API berupa angka
  name: string;
}

const Content = () => {
  // Pagination state.
  const [tableData, setTableData] = useState<Item[]>([]);
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const { token } = useSession();
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [edittingId, setEdittingId] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [tableRowEmployee, setTableRowEmployee] = useState<EmployeesTableRow[]>([]);
  // const [organization, setOrganization] = useState<number>(0);
  // const [department, setDepartment] = useState(0);
  // const [district, setDistrict] = useState(0);
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
      title: 'Total Employee',
      icon: IconUsers,
      subTitle: `${totalFilteredRecords}`,
      subTitleSetting: 10,
      color: 'none',
    },
  ];

  // Fetch table data when pagination or Filter changes.
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const start = page * rowsPerPage;
        const toISODateStart = (d?: string) =>
          d ? new Date(d + 'T00:00:00').toISOString() : undefined;
        const toISODateEnd = (d?: string) =>
          d ? new Date(d + 'T23:59:59').toISOString() : undefined;

        const responseGetAll = await getAllEmployee(token);
        const responseEmployee = await getAllEmployeePagination(
          token,
          start,
          rowsPerPage,
          sortColumn,
          searchKeyword,
        );

        const organization = await getAllOrganizatiosPagination(token, start, 99, sortColumn, '');
        const department = await getAllDepartmentsPagination(token, start, 99, sortColumn, '');
        const district = await getAllDistrictsPagination(token, start, 99, sortColumn, '');
        if (responseEmployee && organization && department && district) {
          const orgMap = (organization.collection ?? []).reduce(
            (acc: Record<string, string>, org: any) => {
              acc[org.id] = org.name; // id sudah string
              return acc;
            },
            {},
          );
          const deptMap = (department.collection ?? []).reduce(
            (acc: Record<string, string>, dept: any) => {
              acc[dept.id] = dept.name;
              return acc;
            },
            {},
          );

          const distMap = (district.collection ?? []).reduce(
            (acc: Record<string, string>, dist: any) => {
              acc[dist.id] = dist.name;
              return acc;
            },
            {},
          );

          let employeeRes: any;
          try {
            employeeRes = await getAllEmployeePaginationFilterMore(
              token,
              start,
              rowsPerPage,
              sortColumn,
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
            // ←— JIKA HTTP 404, KOSONGKAN STATE & KELUAR
            if (err?.response?.status === 404 || err?.status === 404) {
              setTableData([]);
              setTableRowEmployee([]);
              setTotalRecords(0);
              setTotalFilteredRecords(0);
              setIsDataReady(true);
              return; // (finally di luar tetap setLoading(false))
            }
            throw err; // error lain biar ditangani catch luar
          }

          // Normalisasi payload yang mengembalikan body 200 tapi isinya "not_found"
          const safeCollection = Array.isArray(employeeRes?.collection)
            ? employeeRes.collection
            : [];
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

          // Lanjut mapping seperti biasa
          setTableData(safeCollection);
          setTotalRecords(employeeRes?.RecordsTotal ?? safeCollection.length ?? 0);
          setTotalFilteredRecords(employeeRes?.RecordsFiltered ?? safeCollection.length ?? 0);

          const rows = safeCollection.map((item: any) => ({
            id: item.id,
            name: item.name,
            faceimage: item.faceimage,
            organization: orgMap[String(item.organization_id)] || 'Unknown Organization',
            department: deptMap[String(item.department_id)] || 'Unknown Department',
            district: distMap[String(item.district_id)] || 'Unknown District',
          }));
          setTableRowEmployee(rows);
          setIsDataReady(true);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    console.log('Fetching data: ', tableData);
  }, [token, page, rowsPerPage, sortColumn, refreshTrigger, searchKeyword]);

  const [initialFormData, setInitialFormData] = React.useState<CreateEmployeeRequest>(() => {
    const saved = localStorage.getItem('unsavedEmployeeData');
    try {
      const parsed = saved ? JSON.parse(saved) : {};
      return CreateEmployeeRequestSchema.parse(parsed);
    } catch (e) {
      return CreateEmployeeRequestSchema.parse({});
    }
  });

  const [formDataAddEmployee, setFormDataAddEmployee] = React.useState<CreateEmployeeRequest>(
    () => {
      const saved = localStorage.getItem('unsavedEmployeeData');

      try {
        const parsed = saved ? JSON.parse(saved) : {};
        return CreateEmployeeRequestSchema.parse(parsed);
      } catch (e) {
        console.error('Invalid saved data, fallback to default schema.');
        return CreateEmployeeRequestSchema.parse({});
      }
    },
  );

  const [isEditing, setIsEditing] = useState(false);

  const defaultFormData = CreateEmployeeRequestSchema.parse({});
  const isFormChanged = React.useMemo(() => {
    return JSON.stringify(formDataAddEmployee) !== JSON.stringify(initialFormData);
  }, [formDataAddEmployee]);

  useEffect(() => {
    // if (Object.keys(formDataAddEmployee).length > 0 && !isEditing && isFormChanged) {
    //   localStorage.setItem('unsavedEmployeeData', JSON.stringify(formDataAddEmployee));
    // }
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
    const existingData = tableData.find((item) => item.id === id);
    if (!existingData) return;

    const editing = localStorage.getItem('unsavedEmployeeData');

    if (!editing) {
      const parsedData = CreateEmployeeRequestSchema.parse(existingData);
      setEdittingId(id);
      setFormDataAddEmployee(parsedData);
      setInitialFormData(parsedData);
      localStorage.setItem('unsavedEmployeeData', JSON.stringify({ ...parsedData, id }));
      handleOpenDialog();
      return;
    }

    const editingData = JSON.parse(editing);

    if (editingData.id === id) {
      const parsedData = CreateEmployeeRequestSchema.parse(existingData);
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
        setInitialFormData(parsedData); // <--- set initial form juga
        localStorage.setItem('unsavedEmployeeData', JSON.stringify(parsedData));
        setPendingEditId(null);
        setOpenFormAddEmployee(true);
        setIsEditing(true);
      }
    } else {
      setEdittingId('');
      const newForm = CreateEmployeeRequestSchema.parse({});
      setFormDataAddEmployee(newForm);
      setInitialFormData(newForm); // <--- set initial form juga
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

    const confirmed = await showConfirmDelete('Are you sure?', "You won't be able to revert this!");

    if (confirmed) {
      setLoading(true);
      try {
        await deleteEmployee(id, token);
        setRefreshTrigger((prev) => prev + 1);
        showSuccessAlert('Deleted!', 'Employee has been deleted.');
      } catch (error) {
        console.error(error);
        showErrorAlert('Gagal!', 'Failed to delete employee.');
        setTimeout(() => setLoading(false), 500);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    }
  };

  const handleBatchDelete = async (rows: EmployeesTableRow[]) => {
    if (!token || rows.length === 0) return;

    const confirmed = await showConfirmDelete(
      `Are you sure to delete ${rows.length} items?`,
      "You won't be able to revert this!",
    );

    if (confirmed) {
      setLoading(true);
      try {
        await Promise.all(rows.map((row) => deleteEmployee(row.id, token)));
        setRefreshTrigger((prev) => prev + 1);
        showSuccessAlert('Deleted!', `${rows.length} items have been deleted.`);
        setSelectedRows([]); // reset selected rows
      } catch (error) {
        console.error(error);
        showErrorAlert('Error!', 'Failed to delete some items.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleApplyFilter = () => {
    setPage(0);
    setRefreshTrigger((prev) => prev + 1);
  };

  const [enabledFields, setEnabledFields] = React.useState<EnableField>({
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
    // refresh table dsb
    setRefreshTrigger((prev) => prev + 1);

    // <<— penting: set baseline = current form
    setInitialFormData((_) => formDataAddEmployee);

    // opsional: bersihkan atau sinkronkan draft di localStorage
    // localStorage.setItem('unsavedEmployeeData', JSON.stringify(formDataAddEmployee));
    // atau kalau tidak mau simpan draft:
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
    <>
      <PageContainer title="Manage Employee" description="this is Dashboard page">
        <Box>
          <Grid container spacing={3}>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              {isDataReady ? (
                <DynamicTable
                  overflowX={'auto'}
                  data={tableRowEmployee}
                  selectedRows={selectedRows}
                  totalCount={totalFilteredRecords}
                  isHaveChecked={true}
                  isHaveAction={true}
                  isHaveSearch={true}
                  isHaveImage={true}
                  isHaveFilter={true}
                  isHaveExportPdf={false}
                  isHavePagination={true}
                  defaultRowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[5, 10, 20, 50, 100]}
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
                  onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                  onAddData={() => {
                    handleAdd();
                  }}
                />
              ) : (
                <Card sx={{ width: '100%' }}>
                  <Skeleton />
                  <Skeleton animation="wave" />
                  <Skeleton animation={false} />
                </Card>
              )}
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
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
                handleCloseDialog(); // langsung tutup kalau tidak ada perubahan
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
      {/* Dialog Confirm edit */}
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
    </>
  );
};

export default Content;

interface Filters {
  gender: number;
  organization: string;
  department: string;
  district: string;
  joinStart: string;
  exitEnd: string;
  statusEmployee: number;
}

type FilterMoreContentProps = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onApplyFilter: () => void;
  organizationData: OptionItem[];
  departmentData: OptionItem[];
  districtData: OptionItem[];
};

const FilterMoreContent: React.FC<FilterMoreContentProps> = ({
  filters,
  setFilters,
  onApplyFilter,
  organizationData,
  departmentData,
  districtData,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, name } = e.target as any;
    const key = (id || name) as keyof Filters;
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onApplyFilter();
  };

  const initialFilters: Filters = {
    gender: 0,
    organization: '',
    department: '',
    district: '',
    joinStart: '',
    exitEnd: '',
    statusEmployee: 0,
  };

  return (
    <Box
      sx={{ padding: { xs: 0, lg: 3 }, margin: 1.5, boxShadow: 0, borderRadius: 2 }}
      onKeyDown={handleKeyDown}
    >
      <Typography variant="h6" gutterBottom>
        Employee Filter
      </Typography>

      <Grid2 container spacing={3}>
        {/* Join Dates */}
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <CustomFormLabel htmlFor="joinStart">
            <Typography variant="caption">Join Start</Typography>
          </CustomFormLabel>
          <CustomTextField
            InputProps={{
              sx: {
                fontSize: '0.7rem', // atau 12px
              },
            }}
            id="joinStart"
            type="date"
            fullWidth
            variant="outlined"
            value={filters.joinStart}
            onChange={handleChange}
          />
        </Grid2>
        {/* <Grid2 size={{ xs: 12, sm: 6 }}>
          <CustomFormLabel htmlFor="joinEnd">
            <Typography variant="caption">Join End :</Typography>
          </CustomFormLabel>
          <CustomTextField
            InputProps={{
              sx: {
                fontSize: '0.7rem', // atau 12px
              },
            }}
            id="joinEnd"
            type="date"
            fullWidth
            variant="outlined"
          />
        </Grid2> */}

        {/* Exit Dates */}
        {/* <Grid2 size={{ xs: 12, sm: 6 }}>
          <CustomFormLabel htmlFor="exitStart">
            <Typography variant="caption">Exit Start :</Typography>
          </CustomFormLabel>
          <CustomTextField
            InputProps={{
              sx: {
                fontSize: '0.7rem', // atau 12px
              },
            }}
            id="exitStart"
            type="date"
            fullWidth
            variant="outlined"
          />
        </Grid2> */}
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <CustomFormLabel htmlFor="exitEnd">
            <Typography variant="caption">Exit End</Typography>
          </CustomFormLabel>
          <CustomTextField
            InputProps={{
              sx: {
                fontSize: '0.7rem', // atau 12px
              },
            }}
            id="exitEnd"
            type="date"
            fullWidth
            variant="outlined"
            value={filters.exitEnd}
            onChange={handleChange}
          />
        </Grid2>

        {/* Dropdown Fields */}
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <CustomFormLabel htmlFor="organization">
            <Typography variant="caption">Organization</Typography>
          </CustomFormLabel>
          <CustomTextField
            id="organization"
            select
            value={filters.organization}
            onChange={(e: any) =>
              setFilters((prev) => ({
                ...prev,
                organization: e.target.value,
              }))
            }
            fullWidth
            InputProps={{
              sx: {
                fontSize: '0.7rem', // atau 12px
              },
            }}
          >
            <MenuItem value="">
              <Typography>None</Typography>
            </MenuItem>

            {organizationData.map((org) => (
              <MenuItem key={org.id} value={org.id}>
                {org.name ?? 'Unknown'}
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <CustomFormLabel htmlFor="department">
            <Typography variant="caption">Department</Typography>
          </CustomFormLabel>
          <CustomTextField
            InputProps={{
              sx: {
                fontSize: '0.7rem', // atau 12px
              },
            }}
            id="departmentData"
            name="departmentData"
            select
            fullWidth
            variant="outlined"
            defaultValue=""
            value={filters.department}
            onChange={(e: any) =>
              setFilters((prev) => ({
                ...prev,
                department: e.target.value,
              }))
            }
          >
            <MenuItem value="">
              <Typography>None</Typography>
            </MenuItem>
            {departmentData.map((org) => (
              <MenuItem key={org.id} value={org.id}>
                {org.name ?? 'Unknown'}
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <CustomFormLabel htmlFor="district">
            <Typography variant="caption">District</Typography>
          </CustomFormLabel>
          <CustomTextField
            InputProps={{
              sx: {
                fontSize: '0.7rem', // atau 12px
              },
            }}
            id="district"
            select
            fullWidth
            variant="outlined"
            defaultValue=""
            value={filters.district}
            onChange={(e: any) =>
              setFilters((prev) => ({
                ...prev,
                district: e.target.value,
              }))
            }
          >
            <MenuItem value="">
              <Typography>None</Typography>
            </MenuItem>
            {districtData.map((org) => (
              <MenuItem key={org.id} value={org.id}>
                {org.name ?? 'Unknown'}
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid2>

        {/* Gender Radio Buttons */}
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <CustomFormLabel>
            <Typography variant="caption">Gender</Typography>
          </CustomFormLabel>
          <FormControl>
            <RadioGroup row name="gender" value={String(filters.gender)} onChange={handleChange}>
              <FormControlLabel
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
                value="female"
                control={<CustomRadio />}
                label="Female"
              />
              <FormControlLabel
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
                value="male"
                control={<CustomRadio />}
                label="Male"
              />
            </RadioGroup>
          </FormControl>
        </Grid2>

        {/* Status Radio Buttons */}
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <CustomFormLabel>
            <Typography variant="caption">Status Employee</Typography>
          </CustomFormLabel>
          <FormControl>
            <RadioGroup
              row
              name="statusEmployee"
              value={String(filters.statusEmployee)} // RadioGroup butuh string
              onChange={handleChange}
            >
              <FormControlLabel
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
                value="Active"
                control={<CustomRadio />}
                label="Active"
              />
              <FormControlLabel
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
                value="Non Active"
                control={<CustomRadio />}
                label="Non Active"
              />
            </RadioGroup>
          </FormControl>
        </Grid2>
        {/* Actions */}
        <Grid2 size={{ xs: 12 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              justifyContent: 'flex-end',
              mt: 1,
              alignItems: 'center',
            }}
          >
            <Button variant="outlined" onClick={() => setFilters(initialFilters)}>
              Reset
            </Button>
            <Button variant="contained" onClick={onApplyFilter}>
              Apply
            </Button>
          </Box>
        </Grid2>
      </Grid2>
    </Box>
  );
};
