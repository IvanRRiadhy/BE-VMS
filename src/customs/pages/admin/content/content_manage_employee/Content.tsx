import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
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
  RadioGroup,
  Typography,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import CloseIcon from '@mui/icons-material/Close';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useNavigate } from 'react-router';
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
  getAllDepartments,
  getAllDepartmentsPagination,
  getAllDistricts,
  getAllDistrictsPagination,
  getAllEmployeePagination,
  getAllOrganizations,
  getAllOrganizatiosPagination,
} from 'src/customs/api/admin';

const Content = () => {
  // Pagination state.
  const [tableData, setTableData] = useState<Item[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const { token } = useSession();
  const [totalRecords, setTotalRecords] = useState(0);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [edittingId, setEdittingId] = useState('');
  const cards = [
    {
      title: 'Total Employee',
      subTitle: `${tableData.length}`,
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
        const response = await getAllEmployeePagination(token, start, rowsPerPage, sortColumn);
        const organization = await getAllOrganizatiosPagination(token, start, 99, sortColumn);
        const department = await getAllDepartmentsPagination(token, start, 99, sortColumn);
        const district = await getAllDistrictsPagination(token, start, 99, sortColumn);
        console.log('Response from API:', response);
        if (response && organization && department && district) {
          const orgMap = (organization.collection ?? []).reduce(
            (acc: Record<string, string>, org: any) => {
              acc[org.id] = org.name;
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
          // Map organization_id to organization_name and remove organization_id
          const mappedEmployees = response.collection.map((emp: any) => {
            const { organization_id, department_id, district_id, upload_fr, qr_code, ...rest } =
              emp;
            return {
              ...rest,
              organization_name: orgMap[organization_id] || 'Unknown Organization',
              department_name: deptMap[department_id] || 'Unknown Department',
              district_name: distMap[district_id] || 'Unknown District',
            };
          });
          setTableData(mappedEmployees);
          setTotalRecords(response.RecordsTotal);
          setIsDataReady(true);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // console.log('Fetching data: ', tableData);
  }, [token, page, rowsPerPage, sortColumn, refreshTrigger]);

  const tableRowEmployees = [
    {
      id: 1,
      Name: 'Ahmad Pratama',
      Organization: 'Tech Nusantara',
      Card: 'EMP-TN-001',
      Email: 'ahmad.pratama@technusantara.com',
      Phone: '+62 812 3456 7890',
      Gender: 'Male',
    },
    {
      id: 2,
      Name: 'Siti Aisyah',
      Organization: 'Inovasi Digital',
      Card: 'EMP-ID-002',
      Email: 'siti.aisyah@inovasidigital.id',
      Phone: '+62 813 2233 4455',
      Gender: 'Female',
    },
    {
      id: 3,
      Name: 'Budi Santoso',
      Organization: 'Smart Retail',
      Card: 'EMP-SR-003',
      Email: 'budi.santoso@smartretail.co.id',
      Phone: '+62 814 7788 9900',
      Gender: 'Male',
    },
    {
      id: 4,
      Name: 'Dewi Lestari',
      Organization: 'GoLogistik',
      Card: 'EMP-GL-004',
      Email: 'dewi.lestari@gologistik.co.id',
      Phone: '+62 812 3344 5566',
      Gender: 'Female',
    },
    {
      id: 5,
      Name: 'Fajar Nugroho',
      Organization: 'EduPrime',
      Card: 'EMP-EP-005',
      Email: 'fajar.nugroho@eduprime.com',
      Phone: '+62 815 6677 8899',
      Gender: 'Male',
    },
    {
      id: 6,
      Name: 'Indah Permata',
      Organization: 'AgroTech',
      Card: 'EMP-AT-006',
      Email: 'indah.permata@agrotech.id',
      Phone: '+62 816 9900 1122',
      Gender: 'Female',
    },
  ];
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
  const defaultFormData = CreateEmployeeRequestSchema.parse({});
  const isFormChanged = JSON.stringify(formDataAddEmployee) !== JSON.stringify(defaultFormData);

  useEffect(() => {
    localStorage.setItem('unsavedEmployeeData', JSON.stringify(formDataAddEmployee));
  }, [formDataAddEmployee]);

  const [openFormAddEmployee, setOpenFormAddEmployee] = React.useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [pendingEditId, setPendingEditId] = React.useState<string | null>(null);

  const handleOpenDialog = () => setOpenFormAddEmployee(true);
  const handleCloseDialog = () => {
    localStorage.removeItem('unsavedEmployeeData');
    setOpenFormAddEmployee(false);
  };

  // const handleAdd = () => {
  //   const editing = localStorage.getItem('unsavedEmployeeData');
  //   if (editing) {
  //     // If editing exists, show confirmation dialog for add
  //     setPendingEditId(null); // null means it's an add, not edit
  //     setConfirmDialogOpen(true);
  //   } else {
  //     setEdittingId('');
  //     setFormDataAddEmployee(CreateEmployeeRequestSchema.parse({}));
  //     handleOpenDialog();
  //   }
  // };

  const handleAdd = useCallback(() => {
    const freshForm = CreateEmployeeRequestSchema.parse({});
    setFormDataAddEmployee(freshForm);
    localStorage.setItem('unsavedEmployeeData', JSON.stringify(freshForm));
    setPendingEditId(null);
    handleOpenDialog();
  }, []);

  const handleEdit = (id: string) => {
    const editing = localStorage.getItem('unsavedEmployeeData');
    if (editing) {
      const parsed = JSON.parse(editing);
      if (parsed.id === id) {
        setFormDataAddEmployee(parsed);
        handleOpenDialog();
      } else {
        console.log('ID tidak cocok');
        setPendingEditId(id);
        setConfirmDialogOpen(true);
      }
    } else {
      setFormDataAddEmployee(
        CreateEmployeeRequestSchema.parse(tableData.find((item) => item.id === id) || {}),
      );
      handleOpenDialog();
      console.log('Form data:', edittingId);
    }
  };

  const handleConfirmEdit = () => {
    // setConfirmDialogOpen(false);
    // if (pendingEditId) {
    //   // Edit existing site
    //   setFormDataAddEmployee(
    //     tableData.find((item) => item.id === pendingEditId) ||
    //       CreateEmployeeRequestSchema.parse({}),
    //   );
    // } else {
    //   // Add new site
    //   setFormDataAddEmployee(CreateEmployeeRequestSchema.parse({}));
    //   handleCloseDialog();
    // }
    // // handleOpenDialog();
    // setPendingEditId(null);
    handleCloseDialog();
    setConfirmDialogOpen(false);
  };

  const handleCancelEdit = () => {
    setEdittingId('');
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  return (
    <>
      <PageContainer title="Manage Employee" description="this is Dashboard page">
        <Box>
          <Grid container spacing={3}>
            {/* column */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <TopCard items={cards} />
            </Grid>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                overflowX={'auto'}
                data={tableData}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveSearch={true}
                isHaveFilter={true}
                isHaveExportPdf={true}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                isHaveAddData={true}
                isHaveFilterMore={true}
                filterMoreContent={<FilterMoreContent />}
                isHaveHeader={false}
                onCheckedChange={(selected) => console.log('Checked table row:', selected)}
                onEdit={(row) => {
                  handleEdit(row.id);
                  setEdittingId(row.id);
                }}
                onDelete={(row) => console.log('Delete:', row)}
                onSearchKeywordChange={(keyword) => console.log('Search keyword:', keyword)}
                onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                onAddData={() => {
                  handleAdd();
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
      <Dialog open={openFormAddEmployee} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ position: 'relative', padding: 5 }}>
          Add Employee
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
              position: 'absolute',
              right: 8,
              top: 8,
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
            onSuccess={handleCloseDialog}
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

const FilterMoreContent = () => {
  return (
    <Box sx={{ padding: 3, margin: 1.5, boxShadow: 0, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Employee Filter
      </Typography>

      <Grid2 container spacing={3}>
        {/* Join Dates */}
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <CustomFormLabel htmlFor="joinStart">
            <Typography variant="caption">Join Start :</Typography>
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
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
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
        </Grid2>

        {/* Exit Dates */}
        <Grid2 size={{ xs: 12, sm: 6 }}>
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
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <CustomFormLabel htmlFor="exitEnd">
            <Typography variant="caption">Exit End :</Typography>
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
          />
        </Grid2>

        {/* Dropdown Fields */}
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <CustomFormLabel htmlFor="organization">
            <Typography variant="caption">Organization :</Typography>
          </CustomFormLabel>
          <CustomTextField
            InputProps={{
              sx: {
                fontSize: '0.7rem', // atau 12px
              },
            }}
            id="organization"
            select
            fullWidth
            variant="outlined"
            defaultValue=""
          >
            <MenuItem sx={{ fontSize: '0.75rem' }} value="A">
              Head A
            </MenuItem>
            <MenuItem sx={{ fontSize: '0.75rem' }} value="B">
              Head B
            </MenuItem>
            <MenuItem sx={{ fontSize: '0.75rem' }} value="C">
              Head C
            </MenuItem>
          </CustomTextField>
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <CustomFormLabel htmlFor="department">
            <Typography variant="caption">Department :</Typography>
          </CustomFormLabel>
          <CustomTextField
            InputProps={{
              sx: {
                fontSize: '0.7rem', // atau 12px
              },
            }}
            id="department"
            select
            fullWidth
            variant="outlined"
            defaultValue=""
          >
            <MenuItem sx={{ fontSize: '0.75rem' }} value="A">
              Dept A
            </MenuItem>
            <MenuItem sx={{ fontSize: '0.75rem' }} value="B">
              Dept B
            </MenuItem>
            <MenuItem sx={{ fontSize: '0.75rem' }} value="C">
              Dept C
            </MenuItem>
          </CustomTextField>
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <CustomFormLabel htmlFor="district">
            <Typography variant="caption">District :</Typography>
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
          >
            <MenuItem sx={{ fontSize: '0.75rem' }} value="A">
              District A
            </MenuItem>
            <MenuItem sx={{ fontSize: '0.75rem' }} value="B">
              District B
            </MenuItem>
            <MenuItem sx={{ fontSize: '0.75rem' }} value="C">
              District C
            </MenuItem>
          </CustomTextField>
        </Grid2>

        {/* Gender Radio Buttons */}
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <CustomFormLabel>
            <Typography variant="caption">Gender :</Typography>
          </CustomFormLabel>
          <FormControl>
            <RadioGroup row name="gender">
              <FormControlLabel
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
                value="male"
                control={<CustomRadio />}
                label="Male"
              />
              <FormControlLabel
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
                value="female"
                control={<CustomRadio />}
                label="Female"
              />
            </RadioGroup>
          </FormControl>
        </Grid2>

        {/* Status Radio Buttons */}
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <CustomFormLabel>
            <Typography variant="caption">Status Employee :</Typography>
          </CustomFormLabel>
          <FormControl>
            <RadioGroup row name="status">
              <FormControlLabel
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
                value="active"
                control={<CustomRadio />}
                label="Active"
              />
              <FormControlLabel
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
                value="non-active"
                control={<CustomRadio />}
                label="Non Active"
              />
            </RadioGroup>
          </FormControl>
        </Grid2>
      </Grid2>
    </Box>
  );
};
