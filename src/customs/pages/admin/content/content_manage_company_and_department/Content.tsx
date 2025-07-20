import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  DialogActions,
  Button,
  Grid2 as Grid,
  IconButton,
  Skeleton,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';

import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import CloseIcon from '@mui/icons-material/Close';
import FormAddDepartment from './FormAddDepartment';
import FormAddDistrict from './FormAddDistrict';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  getAllOrganizatiosPagination,
  getAllDepartmentsPagination,
  getAllDistrictsPagination,
  deleteDepartment,
  deleteDistrict,
  deleteOrganization,
} from 'src/customs/api/admin';
import FormUpdateDistrict from './FormUpdateDistrict';
import FormUpdateDepartment from './FormUpdateDepartment';
import {
  CreateDepartmentRequest,
  CreateDepartmentSchema,
  Item,
} from 'src/customs/api/models/Department';
import Swal from 'sweetalert2';
import { CreateDistrictRequest, CreateDistrictSchema } from 'src/customs/api/models/District';
import FormAddOrganization from './FormAddOrganization';
import FormUpdateOrganization from './FormUpdateOrganization';
import {
  CreateOrganizationRequest,
  CreateOrganizationSchema,
} from 'src/customs/api/models/Organization';

const Content = () => {
  const [totals, setTotals] = useState({
    organization: 0,
    department: 0,
    district: 0,
  });

  const cards = [
    {
      title: 'Total Organization',
      subTitle: totals.organization.toString(),
      subTitleSetting: totals.organization,
      color: 'none',
    },
    {
      title: 'Total Department',
      subTitle: totals.department.toString(),
      subTitleSetting: totals.department,
      color: 'none',
    },
    {
      title: 'Total District',
      subTitle: totals.district.toString(),
      subTitleSetting: totals.district,
      color: 'none',
    },
  ];

  const [selectedType, setSelectedType] = useState('organization');
  const [openFormType, setOpenFormType] = useState<
    'Organizations' | 'Departments' | 'Districts' | null
  >(null);

  const handleCloseDialog = () => {
    setOpenFormType(null);
    setEditDialogType(null);
    localStorage.removeItem('unsavedOrganizationFormAdd');
    setFormDataAddOrganization(CreateOrganizationSchema.parse({})); // ⬅️ ini penting!
  };

  const handleCancelEdit = () => {
    setConfirmDialogOpen(false);
    // setPendingEditId(null);
  };

  const handleConfirmEdit = () => {
    handleCloseDialog();
    setConfirmDialogOpen(false);
  };

  // Pagination state.
  const [tableData, setTableData] = useState<Item[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const { token } = useSession();
  const [totalRecords, setTotalRecords] = useState(0);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Fetch table data when pagination or type changes
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const start = page * rowsPerPage;
        let response;

        if (selectedType === 'organization') {
          console.log('fetch sukses');

          response = await getAllOrganizatiosPagination(
            token,
            start,
            rowsPerPage,
            sortColumn,
            searchKeyword,
          );
          console.log(response);
        } else if (selectedType === 'department') {
          response = await getAllDepartmentsPagination(
            token,
            start,
            rowsPerPage,
            sortColumn,
            searchKeyword,
          );
        } else if (selectedType === 'district') {
          response = await getAllDistrictsPagination(
            token,
            start,
            rowsPerPage,
            sortColumn,
            searchKeyword,
          );
        }

        if (response) {
          setTableData(response.collection as Item[]);
          setTotalRecords(response.RecordsTotal);
          setIsDataReady(true);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTotals();
    fetchData();
  }, [token, selectedType, page, rowsPerPage, sortColumn, refreshTrigger, searchKeyword]);

  const fetchTotals = async () => {
    if (!token) return;

    try {
      const [orgRes, depRes, distRes] = await Promise.all([
        getAllOrganizatiosPagination(token, 0, 1, 'id'),
        getAllDepartmentsPagination(token, 0, 1, 'id'),
        getAllDistrictsPagination(token, 0, 1, 'id'),
      ]);

      setTotals({
        organization: orgRes.RecordsTotal,
        department: depRes.RecordsTotal,
        district: distRes.RecordsTotal,
      });
    } catch (error) {
      console.error('Failed to fetch totals:', error);
    }
  };

  const [editDialogType, setEditDialogType] = useState<
    'Organizations' | 'Departments' | 'Districts' | null
  >(null);

  const [editingRow, setEditingRow] = useState<Item | null>(null);

  const handleDelete = async (id: string, selectedType: string) => {
    if (!token) return;

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          if (selectedType === 'department') {
            await deleteDepartment(id, token);
          } else if (selectedType === 'district') {
            await deleteDistrict(id, token);
          } else if (selectedType === 'organization') {
            await deleteOrganization(id, token);
          }

          setRefreshTrigger((prev) => prev + 1);
          Swal.fire({
            title: 'Deleted!',
            text: 'Your file has been deleted.',
            icon: 'success',
          });
        } catch (error) {
          console.error(error);
          Swal.fire({
            title: 'Error!',
            text: 'Something went wrong while deleting.',
            icon: 'error',
          });
        }
      }
    });
  };

  // store 01
  const [formDataAddDepartment, setFormDataAddDepartment] = useState<CreateDepartmentRequest>(
    () => {
      const saved = localStorage.getItem('unsavedDepartmentFormAdd');
      try {
        const parsed = saved ? JSON.parse(saved) : {};
        return CreateDepartmentSchema.parse(parsed);
      } catch (e) {
        console.error('Invalid saved data, fallback to default schema.');
        return CreateDepartmentSchema.parse({});
      }
    },
  );

  useEffect(() => {
    localStorage.setItem('unsavedDepartmentFormAdd', JSON.stringify(formDataAddDepartment));
  }, [formDataAddDepartment]);

  // store 02
  const [formDataAddDistrict, setFormDataAddDistrict] = useState<CreateDistrictRequest>(() => {
    const saved = localStorage.getItem('unsavedDistrictFormAdd');
    return saved ? JSON.parse(saved) : CreateDistrictSchema.parse({});
  });

  useEffect(() => {
    localStorage.setItem('unsavedDistrictFormAdd', JSON.stringify(formDataAddDistrict));
  }, [formDataAddDistrict]);

  // srore 03
  const [formDataAddOrganization, setFormDataAddOrganization] = useState<CreateOrganizationRequest>(
    () => {
      const saved = localStorage.getItem('unsavedOrganizationFormAdd');

      // return saved ? JSON.parse(saved) : CreateOrganizationSchema.parse({});

      try {
        const parsed = saved ? JSON.parse(saved) : {};
        return CreateOrganizationSchema.parse(parsed);
      } catch (e) {
        console.error('Invalid saved data, fallback to default schema.');
        return CreateOrganizationSchema.parse({});
      }
    },
  );

  // const [filteredData, setFilteredData] = useState(data);

  // const handleKeywordChange = (keyword: string) => {
  //   const result = data.filter((item) => item.name.toLowerCase().includes(keyword.toLowerCase()));
  //   setFilteredData(result);
  // };

  const defaultFormData = CreateOrganizationSchema.parse({});
  const isFormChanged = JSON.stringify(formDataAddOrganization) !== JSON.stringify(defaultFormData);

  useEffect(() => {
    localStorage.setItem('unsavedOrganizationFormAdd', JSON.stringify(formDataAddOrganization));
  }, [formDataAddOrganization]);

  return (
    <>
      <PageContainer title="Organization & Department" description="this is Dashboard page">
        <Box>
          <Grid container spacing={3}>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} />
            </Grid>

            {/* column */}
            <Grid container mt={1} size={{ xs: 12, lg: 12 }}>
              <Grid size={{ xs: 12, lg: 12 }}>
                {isDataReady ? (
                  <DynamicTable
                    isHavePagination
                    totalCount={totalRecords}
                    defaultRowsPerPage={3}
                    rowsPerPageOptions={[3]}
                    onPaginationChange={(newPage, newRowsPerPage) => {
                      setPage(newPage);
                      setRowsPerPage(newRowsPerPage);
                    }}
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
                    isHaveHeader={true}
                    headerContent={{
                      title: 'Organization | Department | District',
                      subTitle: formatDate(new Date()),
                      items: [
                        { name: 'organization' },
                        { name: 'department' },
                        { name: 'district' },
                      ],
                    }}
                    defaultSelectedHeaderItem="organization"
                    onHeaderItemClick={(item) => {
                      setSelectedType(item.name);
                    }}
                    onCheckedChange={(selected) => console.log('Checked table row:', selected)}
                    onEdit={(row) => {
                      if (selectedType === 'organization') {
                        setEditDialogType('Organizations');
                      } else if (selectedType === 'department') {
                        setEditDialogType('Departments');
                      } else if (selectedType === 'district') {
                        setEditDialogType('Districts');
                      }
                      setEditingRow(row);
                    }}
                    onDelete={(row) => handleDelete(row.id, selectedType)}
                    onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                    onAddData={() => {
                      if (selectedType === 'organization') {
                        setOpenFormType('Organizations');
                      } else if (selectedType === 'department') {
                        setOpenFormType('Departments');
                      } else if (selectedType === 'district') {
                        setOpenFormType('Districts');
                      }
                    }}
                    onFilterByColumn={(column) => {
                      setSortColumn(column.column);
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
          </Grid>
        </Box>
      </PageContainer>
      {/* Dialog view */}
      {/* Organization */}
      <Dialog
        open={openFormType === 'Organizations'}
        // onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Add Organization data
          <IconButton
            aria-label="close"
            onClick={() => {
              if (isFormChanged) {
                setConfirmDialogOpen(true);
              } else {
                handleCloseDialog(); // langsung tutup kalau tidak ada perubahan
              }
            }}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <br />
          <FormAddOrganization
            formData={formDataAddOrganization}
            setFormData={setFormDataAddOrganization}
            onSuccess={() => {
              handleCloseDialog();
              setFormDataAddOrganization(CreateOrganizationSchema.parse({}));
              setTimeout(() => {
                Swal.fire({
                  title: 'Created Successfully!',
                  text: 'Organization data added successfully.',
                  icon: 'success',
                });
              }, 500);
              setRefreshTrigger((prev: number) => prev + 1);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog Department */}
      <Dialog
        open={openFormType === 'Departments'}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Add Department data
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <br />
          <FormAddDepartment
            formData={formDataAddDepartment}
            setFormData={setFormDataAddDepartment}
            onSuccess={() => {
              handleCloseDialog();
              setFormDataAddDepartment(CreateDepartmentSchema.parse({})); // reset form
              setTimeout(() => {
                Swal.fire({
                  title: 'Created Successfully!',
                  text: 'Department data added successfully.',
                  icon: 'success',
                });
              }, 500);
              setRefreshTrigger((prev: number) => prev + 1);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog District */}
      <Dialog
        open={openFormType === 'Districts'}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Add District data
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <br />
          <FormAddDistrict
            formData={formDataAddDistrict}
            setFormData={setFormDataAddDistrict}
            onSuccess={() => {
              handleCloseDialog();
              setFormDataAddDistrict(CreateDistrictSchema.parse({}));
              setTimeout(() => {
                Swal.fire({
                  title: 'Created Successfully!',
                  text: 'District data added successfully.',
                  icon: 'success',
                });
              }, 500);
              setRefreshTrigger((prev) => prev + 1);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editDialogType === 'Organizations'}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Update Organization data
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <br />
          <FormUpdateOrganization
            data={editingRow}
            onSuccess={() => {
              handleCloseDialog();
              setTimeout(() => {
                Swal.fire({
                  title: 'Upadate Successfully!',
                  text: 'Organization data update successfully.',
                  icon: 'success',
                });
              }, 500);
              setRefreshTrigger((prev) => prev + 1);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editDialogType === 'Departments'}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Update Department data
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <br />
          <FormUpdateDepartment
            data={editingRow}
            onSuccess={() => {
              handleCloseDialog();
              setTimeout(() => {
                Swal.fire({
                  title: 'Upadate Successfully!',
                  text: 'Department data update successfully.',
                  icon: 'success',
                });
              }, 500);
              setRefreshTrigger((prev) => prev + 1);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editDialogType === 'Districts'}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ position: 'relative', padding: 5 }}>
          Update District data
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <br />
          <FormUpdateDistrict
            data={editingRow}
            onSuccess={() => {
              handleCloseDialog();
              setTimeout(() => {
                Swal.fire({
                  title: 'Upadate Successfully!',
                  text: 'District data update successfully.',
                  icon: 'success',
                });
              }, 500);
              setRefreshTrigger((prev) => prev + 1);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDialogOpen} onClose={handleCancelEdit}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          You have unsaved changes for another site. Are you sure you want to discard them and edit
          this site?
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

function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  };
  const datePart = new Intl.DateTimeFormat('en-GB', options).format(date);

  // Format jam dan menit menjadi 2 digit
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${datePart} ${hours}:${minutes}`;
}
