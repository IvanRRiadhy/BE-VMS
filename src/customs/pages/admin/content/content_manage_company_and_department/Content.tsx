import React, { useEffect, useState, useRef } from 'react';
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
import { IconBuilding, IconBuildingSkyscraper, IconMapPins } from '@tabler/icons-react';
// Alert
import {
  showConfirmDelete,
  showSuccessAlert,
  showErrorAlert,
} from 'src/customs/components/alerts/alerts';
import { set } from 'lodash';

type EnableField = {
  name: boolean;
};

const Content = () => {
  const [totals, setTotals] = useState({
    organization: 0,
    department: 0,
    district: 0,
  });

  const dialogRef = useRef<HTMLDivElement>(null);
  const cards = [
    {
      title: 'Total Organization',
      subTitle: totals.organization.toString(),
      subTitleSetting: totals.organization,
      icon: IconBuildingSkyscraper,
      color: 'none',
    },
    {
      title: 'Total Department',
      subTitle: totals.department.toString(),
      subTitleSetting: totals.department,
      icon: IconBuilding,
      color: 'none',
    },
    {
      title: 'Total District',
      subTitle: totals.district.toString(),
      subTitleSetting: totals.district,
      icon: IconMapPins,
      color: 'none',
    },
  ];

  const [selectedType, setSelectedType] = useState('organization');
  const [openFormType, setOpenFormType] = useState<
    'Organizations' | 'Departments' | 'Districts' | null
  >(null);

  const handleCloseDialog = () => {
    setConfirmDialogOpen(false);
    setEditingRow(null);
    setEditDialogType(null);
    setOpenFormType(null);
    setIsBatchEdit(false); // ✅ tambahkan ini
    setPendingEditId(null);
  };

  const [pendingEditId, setPendingEditId] = useState<string | null>(null);

  const handleCancelEdit = () => {
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  const handleConfirmEdit = () => {
    handleCloseDialog();
    setConfirmDialogOpen(false);
  };

  // Pagination state.
  const [tableData, setTableData] = useState<Item[]>([]);
  //selected rows
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const { token } = useSession();
  const [totalRecords, setTotalRecords] = useState(0);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isBatchEdit, setIsBatchEdit] = useState(false);

  const [formDataAddDepartment, setFormDataAddDepartment] = useState<CreateDepartmentRequest>(
    () => {
      const saved = localStorage.getItem('unsavedDepartmentFormAdd');
      // return saved ? JSON.parse(saved) : CreateDepartmentSchema.parse({});
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
    const defaultForm = CreateDepartmentSchema.parse({});
    const isChanged = JSON.stringify(formDataAddDepartment) !== JSON.stringify(defaultForm);

    if (isChanged) {
      localStorage.setItem('unsavedDepartmentFormAdd', JSON.stringify(formDataAddDepartment));
    }
  }, [formDataAddDepartment]);

  // store 02
  const [formDataAddDistrict, setFormDataAddDistrict] = useState<CreateDistrictRequest>(() => {
    const saved = localStorage.getItem('unsavedDistrictFormAdd');
    return saved ? JSON.parse(saved) : CreateDistrictSchema.parse({});
  });

  useEffect(() => {
    const defaultForm = CreateDistrictSchema.parse({});
    const isChanged = JSON.stringify(formDataAddDistrict) !== JSON.stringify(defaultForm);

    if (isChanged) {
      localStorage.setItem('unsavedDistrictFormAdd', JSON.stringify(formDataAddDistrict));
    }
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

  useEffect(() => {
    const defaultForm = CreateOrganizationSchema.parse({});
    const isChanged = JSON.stringify(formDataAddOrganization) !== JSON.stringify(defaultForm);

    if (isChanged) {
      localStorage.setItem('unsavedOrganizationFormAdd', JSON.stringify(formDataAddOrganization));
    }
  }, [formDataAddOrganization]);

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

  const defaultFormData = CreateOrganizationSchema.parse({});
  const isFormChanged = JSON.stringify(formDataAddOrganization) !== JSON.stringify(defaultFormData);
  const handleDialogClose = (_event: object, reason: string) => {
    if (reason === 'backdropClick') {
      if (isFormChanged) {
        setConfirmDialogOpen(true);
      } else {
        handleCloseDialog();
      }
    }
  };

  // ✅ HANDLE KETIKA MOUSE LEAVE DARI DIALOG
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      const current = dialogRef.current;
      if (current && !current.contains(e.relatedTarget as Node)) {
        if (isFormChanged) {
          setConfirmDialogOpen(true);
        }
      }
    };

    const dialogEl = dialogRef.current;
    if (dialogEl) {
      dialogEl.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (dialogEl) {
        dialogEl.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [isFormChanged]);

  const [editingRow, setEditingRow] = useState<Item | null>(null);

  const handleDelete = async (id: string, selectedType: string) => {
    if (!token) return;

    const confirmed = await showConfirmDelete('Are you sure?', "You won't be able to revert this!");

    if (!confirmed) return;

    try {
      switch (selectedType) {
        case 'department':
          await deleteDepartment(id, token);
          break;
        case 'district':
          await deleteDistrict(id, token);
          break;
        case 'organization':
          await deleteOrganization(id, token);
          break;
        default:
          throw new Error('Unknown type');
      }

      setRefreshTrigger((prev) => prev + 1);
      showSuccessAlert('Deleted!', 'The selected data has been deleted.');
    } catch (error) {
      console.error(error);
      showErrorAlert('Error!', 'Something went wrong while deleting.');
    }
  };

  const handleBatchDelete = async (rows: Item[]) => {
    if (!token || rows.length === 0) return;

    const confirmed = await showConfirmDelete(
      `Are you sure to delete ${rows.length} items?`,
      "You won't be able to revert this!",
    );

    if (!confirmed) return;
    try {
      setLoading(true);
      await Promise.all(
        rows.map((row) => {
          switch (selectedType) {
            case 'department':
              return deleteDepartment(row.id, token);
            case 'district':
              return deleteDistrict(row.id, token);
            case 'organization':
              return deleteOrganization(row.id, token);
            default:
              throw new Error('Unknown type');
          }
        }),
      );
      setRefreshTrigger((prev) => prev + 1);
      showSuccessAlert('Deleted!', `${rows.length} items have been deleted.`);
      setSelectedRows([]); // Clear selected rows
    } catch (error) {
      console.error(error);
      showErrorAlert('Error!', 'Something went wrong while deleting items.');
    }
  };

  useEffect(() => {
    if (!editingRow && !isBatchEdit) return;

    let type: typeof editDialogType = null;
    if (selectedType === 'organization') type = 'Organizations';
    else if (selectedType === 'department') type = 'Departments';
    else if (selectedType === 'district') type = 'Districts';

    // Tambahkan pengecekan agar tidak membuka dialog jika sudah terbuka
    if (editDialogType !== type) {
      setEditDialogType(type);
    }
  }, [editingRow, isBatchEdit, selectedType]);

  const handleBatchEdit = () => {
    if (selectedRows.length === 0) return;

    setIsBatchEdit(true);

    // ✅ Kalau hanya satu yang dipilih, set editingRow
    if (selectedRows.length === 1) {
      setEditingRow(selectedRows[0]);
    } else {
      setEditingRow(null); // atau biarkan kosong
    }
    setTimeout(() => {
      if (selectedType === 'organization') setEditDialogType('Organizations');
      else if (selectedType === 'department') setEditDialogType('Departments');
      else if (selectedType === 'district') setEditDialogType('Districts');
    }, 0);
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    handleCloseDialog();
  };

  useEffect(() => {
    // Hanya buka dialog jika ada editingRow atau sedang batch edit
    if (editingRow || isBatchEdit) {
      if (selectedType === 'organization') {
        setEditDialogType('Organizations');
      } else if (selectedType === 'department') {
        setEditDialogType('Departments');
      } else if (selectedType === 'district') {
        setEditDialogType('Districts');
      }
    } else {
      setEditDialogType(null); // Tutup semua dialog edit kalau tidak sedang edit apa pun
    }
  }, [editingRow, isBatchEdit, selectedType]);

  const [enabledFields, setEnabledFields] = useState<EnableField>({
    name: false,
  });

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
                    defaultRowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    onPaginationChange={(newPage, newRowsPerPage) => {
                      setPage(newPage);
                      setRowsPerPage(newRowsPerPage);
                    }}
                    overflowX={'auto'}
                    data={tableData}
                    selectedRows={selectedRows}
                    isHaveChecked={true}
                    isHaveAction={true}
                    isHaveSearch={true}
                    isHaveFilter={true}
                    isHaveExportPdf={true}
                    isHaveExportXlf={false}
                    isHaveFilterDuration={false}
                    isHaveAddData={true}
                    onBatchEdit={handleBatchEdit}
                    isHaveHeader={true}
                    headerContent={{
                      title: 'Organization | Department | District',
                      // subTitle: formatDate(new Date()),
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
                    onCheckedChange={(selected) => {
                      setSelectedRows(selected);
                    }}
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
                    onBatchDelete={handleBatchDelete}
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
        onClose={handleDialogClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle display={'flex'} justifyContent="space-between" alignItems="center">
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
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ paddingTop: 0 }}>
          <br />
          <FormAddOrganization
            formData={formDataAddOrganization}
            setFormData={setFormDataAddOrganization}
            onSuccess={() => {
              localStorage.removeItem('unsavedOrganizationFormAdd');
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
        <DialogTitle display={'flex'} justifyContent="space-between" alignItems="center">
          Add Department data
          <IconButton aria-label="close" onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ paddingTop: 0 }}>
          <br />
          <FormAddDepartment
            formData={formDataAddDepartment}
            setFormData={setFormDataAddDepartment}
            onSuccess={() => {
              localStorage.removeItem('unsavedDepartmentData');
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
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Add District data
          <IconButton aria-label="close" onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ paddingTop: 0 }}>
          <br />
          <FormAddDistrict
            formData={formDataAddDistrict}
            setFormData={setFormDataAddDistrict}
            onSuccess={() => {
              localStorage.removeItem('unsavedDistrictData');
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
        // onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Update Organization data
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ paddingTop: 0 }}>
          <br />
          {editDialogType === 'Organizations' && (
            <FormUpdateOrganization
              data={editingRow}
              onSuccess={() => {
                localStorage.removeItem('unsavedOrganizationData');
                handleCloseDialog();
                setTimeout(() => {
                  Swal.fire({
                    title: 'Update Successfully!',
                    text: 'Organization data updated successfully.',
                    icon: 'success',
                  });
                }, 600);
                setRefreshTrigger((prev) => prev + 1);
              }}
              isBatchEdit={isBatchEdit}
              selectedRows={selectedRows}
              enabledFields={enabledFields}
              setEnabledFields={setEnabledFields}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={editDialogType === 'Departments'}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Update Department data
          <IconButton aria-label="close" onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ paddingTop: 0 }}>
          <br />
          {editDialogType === 'Departments' && (
            <FormUpdateDepartment
              data={editingRow}
              onSuccess={() => {
                localStorage.removeItem('unsavedDepartmentData');
                handleCloseDialog();
                setTimeout(() => {
                  Swal.fire({
                    title: 'Upadate Successfully!',
                    text: 'Department data update successfully.',
                    icon: 'success',
                  });
                }, 600);
                setRefreshTrigger((prev) => prev + 1);
              }}
              isBatchEdit={isBatchEdit}
              selectedRows={selectedRows}
              enabledFields={enabledFields}
              setEnabledFields={setEnabledFields}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={editDialogType === 'Districts'}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Update District data
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            // sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ paddingTop: 0 }}>
          <br />
          {editDialogType === 'Districts' && (
            <FormUpdateDistrict
              data={editingRow}
              onSuccess={() => {
                localStorage.removeItem('unsavedDistrictData');
                handleCloseDialog();
                setTimeout(() => {
                  Swal.fire({
                    title: 'Upadate Successfully!',
                    text: 'District data update successfully.',
                    icon: 'success',
                  });
                }, 600);
                setRefreshTrigger((prev) => prev + 1);
              }}
              isBatchEdit={isBatchEdit}
              selectedRows={selectedRows}
              enabledFields={enabledFields}
              setEnabledFields={setEnabledFields}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDialogOpen} onClose={handleCancelEdit}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent ref={dialogRef}>
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
