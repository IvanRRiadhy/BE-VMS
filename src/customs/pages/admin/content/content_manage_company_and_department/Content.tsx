import React, { useEffect, useState, useRef, useMemo } from 'react';
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
import FormAddOrganization from './FormAddOrganization';

import FormUpdateDistrict from './FormUpdateDistrict';
import FormUpdateDepartment from './FormUpdateDepartment';
import FormUpdateOrganization from './FormUpdateOrganization';

import { useSession } from 'src/customs/contexts/SessionContext';
import {
  getAllOrganizatiosPagination,
  getAllDepartmentsPagination,
  getAllDistrictsPagination,
  deleteDepartment,
  deleteDistrict,
  deleteOrganization,
  getOrganizationById,
  getDepartmentById,
  getDistrictById,
  getAllEmployee,
} from 'src/customs/api/admin';

import {
  CreateDepartmentRequest,
  CreateDepartmentSchema,
  Item,
} from 'src/customs/api/models/Department';
import { CreateDistrictRequest, CreateDistrictSchema } from 'src/customs/api/models/District';
import {
  CreateOrganizationRequest,
  CreateOrganizationSchema,
} from 'src/customs/api/models/Organization';

import { IconBuilding, IconBuildingSkyscraper, IconMapPins } from '@tabler/icons-react';
import {
  showConfirmDelete,
  showSuccessAlert,
  showErrorAlert,
} from 'src/customs/components/alerts/alerts';

type EnableField = {
  name: boolean;
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
  // ======= Cards summary =======
  const [totals, setTotals] = useState({ organization: 0, department: 0, district: 0 });
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

  // ======= Table & fetch =======
  const { token } = useSession();
  const [selectedType, setSelectedType] = useState<'organization' | 'department' | 'district'>(
    'organization',
  );
  const [tableData, setTableData] = useState<Item[]>([]);
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const start = page * rowsPerPage;
        let response: any;

        if (selectedType === 'organization') {
          response = await getAllOrganizatiosPagination(
            token,
            start,
            rowsPerPage,
            sortColumn,
            searchKeyword,
          );
        } else if (selectedType === 'department') {
          response = await getAllDepartmentsPagination(
            token,
            start,
            rowsPerPage,
            sortColumn,
            searchKeyword,
          );
        } else {
          response = await getAllDistrictsPagination(
            token,
            start,
            rowsPerPage,
            sortColumn,
            searchKeyword,
          );
        }

        if (response) {
          // Map host id -> employee name (kalau ada)
          const employees = await getAllEmployee(token);
          const employeeMap = employees.collection.reduce((acc: any, emp: any) => {
            acc[emp.id] = emp.name;
            return acc;
          }, {});

          const mapped = (response.collection ?? []).map((item: any) => ({
            id: item.id,
            name: item.name,
            code: item.code,
            host: employeeMap[item.host] || item.host,
          }));

          setTableData(mapped);
          setTotalRecords(response.RecordsTotal ?? mapped.length ?? 0);
          setIsDataReady(true);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTotals = async () => {
      if (!token) return;
      try {
        const [orgRes, depRes, distRes] = await Promise.all([
          getAllOrganizatiosPagination(token, 0, 9999, 'id'),
          getAllDepartmentsPagination(token, 0, 9999, 'id'),
          getAllDistrictsPagination(token, 0, 9999, 'id'),
        ]);
        setTotals({
          organization: orgRes.RecordsTotal,
          department: depRes.RecordsTotal,
          district: distRes.RecordsTotal,
        });
      } catch (err) {
        console.error('Failed to fetch totals:', err);
      }
    };

    fetchTotals();
    fetchData();
  }, [token, selectedType, page, rowsPerPage, sortColumn, refreshTrigger, searchKeyword]);

  // ======= Single dialog state (Add & Edit) =======
  const [dialog, setDialog] = useState<DialogState>(null);
  const editTokenRef = useRef(0); // anti-stale untuk fetch detail edit

  // Data edit
  const [editingRow, setEditingRow] = useState<Item | null>(null);

  // Batch edit (kalau dipakai form update)
  const [isBatchEdit, setIsBatchEdit] = useState(false);
  const [enabledFields, setEnabledFields] = useState<EnableField>({ name: false });

  // ======= ADD forms state + draft =======
  const [formDataAddDepartment, setFormDataAddDepartment] = useState<CreateDepartmentRequest>(
    () => {
      const saved = localStorage.getItem('unsavedDepartmentFormAdd');
      try {
        const parsed = saved ? JSON.parse(saved) : {};
        return CreateDepartmentSchema.parse(parsed);
      } catch {
        return CreateDepartmentSchema.parse({});
      }
    },
  );
  const [formDataAddDistrict, setFormDataAddDistrict] = useState<CreateDistrictRequest>(() => {
    const saved = localStorage.getItem('unsavedDistrictFormAdd');
    try {
      const parsed = saved ? JSON.parse(saved) : {};
      return CreateDistrictSchema.parse(parsed);
    } catch {
      return CreateDistrictSchema.parse({});
    }
  });
  const [formDataAddOrganization, setFormDataAddOrganization] = useState<CreateOrganizationRequest>(
    () => {
      const saved = localStorage.getItem('unsavedOrganizationFormAdd');
      try {
        const parsed = saved ? JSON.parse(saved) : {};
        return CreateOrganizationSchema.parse(parsed);
      } catch {
        return CreateOrganizationSchema.parse({});
      }
    },
  );

  // Persist draft add-forms
  useEffect(() => {
    const def = CreateDepartmentSchema.parse({});
    if (JSON.stringify(formDataAddDepartment) !== JSON.stringify(def)) {
      localStorage.setItem('unsavedDepartmentFormAdd', JSON.stringify(formDataAddDepartment));
    }
  }, [formDataAddDepartment]);

  useEffect(() => {
    const def = CreateDistrictSchema.parse({});
    if (JSON.stringify(formDataAddDistrict) !== JSON.stringify(def)) {
      localStorage.setItem('unsavedDistrictFormAdd', JSON.stringify(formDataAddDistrict));
    }
  }, [formDataAddDistrict]);

  useEffect(() => {
    const def = CreateOrganizationSchema.parse({});
    if (JSON.stringify(formDataAddOrganization) !== JSON.stringify(def)) {
      localStorage.setItem('unsavedOrganizationFormAdd', JSON.stringify(formDataAddOrganization));
    }
  }, [formDataAddOrganization]);

  // ======= Open/Close dialog helpers =======
  const mapSelectedToEntity = useMemo<DialogEntity>(() => {
    if (selectedType === 'organization') return 'Organizations';
    if (selectedType === 'department') return 'Departments';
    return 'Districts';
  }, [selectedType]);

  const openAdd = (entity: DialogEntity) => {
    setDialog({ mode: 'add', entity });
  };

  const openEdit = async (entity: DialogEntity, row: Item) => {
    if (!token) return;
    setLoading(true);
    const myToken = ++editTokenRef.current; // generate token
    try {
      let res: any;
      if (entity === 'Organizations') res = await getOrganizationById(row.id, token);
      else if (entity === 'Departments') res = await getDepartmentById(row.id, token);
      else res = await getDistrictById(row.id, token);

      if (myToken !== editTokenRef.current) return; // stale → abaikan

      const full = res?.collection ?? res ?? row;
      setEditingRow(full);
      setDialog({ mode: 'edit', entity });
    } catch (e) {
      console.error('Fetch detail error:', e);
    } finally {
      setLoading(false);
    }
  };

  const closeDialog = () => {
    // invalidate semua fetch in-flight
    editTokenRef.current++;
    setDialog(null);
    setEditingRow(null);
    setIsBatchEdit(false);
  };

  // ======= Confirm discard untuk ADD (unsaved drafts) =======
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const currentAddChanged = useMemo(() => {
    if (!dialog || dialog.mode !== 'add') return false;
    if (dialog.entity === 'Organizations') {
      return (
        JSON.stringify(formDataAddOrganization) !==
        JSON.stringify(CreateOrganizationSchema.parse({}))
      );
    }
    if (dialog.entity === 'Departments') {
      return (
        JSON.stringify(formDataAddDepartment) !== JSON.stringify(CreateDepartmentSchema.parse({}))
      );
    }
    return JSON.stringify(formDataAddDistrict) !== JSON.stringify(CreateDistrictSchema.parse({}));
  }, [dialog, formDataAddOrganization, formDataAddDepartment, formDataAddDistrict]);

  const attemptCloseDialog = () => {
    if (dialog?.mode === 'add' && currentAddChanged) {
      setConfirmDialogOpen(true);
    } else {
      closeDialog();
    }
  };

  const confirmDiscard = () => {
    // clear draft sesuai entity aktif
    if (dialog?.entity === 'Organizations') {
      setFormDataAddOrganization(CreateOrganizationSchema.parse({}));
      localStorage.removeItem('unsavedOrganizationFormAdd');
    } else if (dialog?.entity === 'Departments') {
      setFormDataAddDepartment(CreateDepartmentSchema.parse({}));
      localStorage.removeItem('unsavedDepartmentFormAdd');
    } else if (dialog?.entity === 'Districts') {
      setFormDataAddDistrict(CreateDistrictSchema.parse({}));
      localStorage.removeItem('unsavedDistrictFormAdd');
    }
    setConfirmDialogOpen(false);
    closeDialog();
  };

  // ======= Table actions =======
  const handleDelete = async (id: string) => {
    if (!token) return;
    const confirmed = await showConfirmDelete('Are you sure?', "You won't be able to revert this!");
    if (!confirmed) return;

    try {
      if (selectedType === 'department') await deleteDepartment(id, token);
      else if (selectedType === 'district') await deleteDistrict(id, token);
      else await deleteOrganization(id, token);

      setRefreshTrigger((p) => p + 1);
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
          if (selectedType === 'department') return deleteDepartment(row.id, token);
          if (selectedType === 'district') return deleteDistrict(row.id, token);
          return deleteOrganization(row.id, token);
        }),
      );
      setRefreshTrigger((p) => p + 1);
      showSuccessAlert('Deleted!', `${rows.length} items have been deleted.`);
      setSelectedRows([]);
    } catch (error) {
      console.error(error);
      showErrorAlert('Error!', 'Something went wrong while deleting items.');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchEdit = () => {
    if (selectedRows.length === 0) return;
    setIsBatchEdit(true);
    // Optional: kalau satu item, fetch detail sekalian
    if (selectedRows.length === 1) {
      openEdit(mapSelectedToEntity, selectedRows[0]);
    } else {
      // kalau banyak, langsung buka dialog edit kosong (tergantung FormUpdateXXX mendukung batch)
      setEditingRow(null);
      setDialog({ mode: 'edit', entity: mapSelectedToEntity });
    }
  };

  // ======= Success handler (Add & Edit) =======
  const handleSuccess = ({ entity, action, keepOpen }: SuccessOpts) => {
    // bersihkan draft add
    const lsKey: Record<SuccessOpts['entity'], string> = {
      department: 'unsavedDepartmentFormAdd',
      district: 'unsavedDistrictFormAdd',
      organization: 'unsavedOrganizationFormAdd',
    };
    localStorage.removeItem(lsKey[entity]);

    // reset form add
    if (entity === 'department') setFormDataAddDepartment(CreateDepartmentSchema.parse({}));
    if (entity === 'district') setFormDataAddDistrict(CreateDistrictSchema.parse({}));
    if (entity === 'organization') setFormDataAddOrganization(CreateOrganizationSchema.parse({}));

    if (!keepOpen) {
      closeDialog();
    }

    setRefreshTrigger((p) => p + 1);
  };

  // ======= Render =======
  return (
    <>
      <PageContainer title="Company & Department" description="this is Dashboard page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>

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
                    overflowX="auto"
                    data={tableData}
                    selectedRows={selectedRows}
                    isHaveChecked
                    isHaveAction
                    isActionVisitor={false}
                    isHaveSearch
                    isHaveFilter
                    isHaveExportPdf={false}
                    isHaveExportXlf={false}
                    isHaveFilterDuration={false}
                    isHaveAddData
                    onBatchEdit={handleBatchEdit}
                    isHaveHeader
                    headerContent={{
                      title: '',
                      items: [
                        { name: 'organization' },
                        { name: 'department' },
                        { name: 'district' },
                      ],
                    }}
                    defaultSelectedHeaderItem="organization"
                    onHeaderItemClick={(item) => {
                      if (
                        item.name === 'organization' ||
                        item.name === 'department' ||
                        item.name === 'district'
                      ) {
                        setSelectedType(item.name);
                      }
                    }}
                    onCheckedChange={(selected) => setSelectedRows(selected)}
                    onEdit={(row) => openEdit(mapSelectedToEntity, row)}
                    onDelete={(row) => handleDelete(row.id)}
                    onBatchDelete={handleBatchDelete}
                    onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                    onAddData={() => openAdd(mapSelectedToEntity)}
                    onFilterByColumn={(column) => setSortColumn(column.column)}
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

      {/* ======= Unified Dialog for ADD & EDIT ======= */}
      <Dialog
        open={!!dialog}
        onClose={(_, __) => attemptCloseDialog()}
        fullWidth
        maxWidth="md"
        transitionDuration={0} // ⬅️ hilangkan fade supaya tidak ada “Update” yang muncul sepersekian detik
        TransitionProps={{ onExited: () => setEditingRow(null) }} // ⬅️ bersihkan data edit setelah benar-benar tertutup
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(2,132,199,0.05), rgba(99,102,241,0.08))',
          }}
        >
          {dialog?.mode === 'add' ? 'Add' : 'Update'} {entityLabel(dialog?.entity)}
          <IconButton aria-label="close" onClick={attemptCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ paddingTop: 0 }}>
          <br />
          {/* ADD forms */}
          {dialog?.mode === 'add' && dialog?.entity === 'Organizations' && (
            <FormAddOrganization
              formData={formDataAddOrganization}
              setFormData={setFormDataAddOrganization}
              onSuccess={() =>
                handleSuccess({ entity: 'organization', action: 'create', keepOpen: true })
              }
            />
          )}
          {dialog?.mode === 'add' && dialog?.entity === 'Departments' && (
            <FormAddDepartment
              formData={formDataAddDepartment}
              setFormData={setFormDataAddDepartment}
              onSuccess={() =>
                handleSuccess({ entity: 'department', action: 'create', keepOpen: true })
              }
            />
          )}
          {dialog?.mode === 'add' && dialog?.entity === 'Districts' && (
            <FormAddDistrict
              formData={formDataAddDistrict}
              setFormData={setFormDataAddDistrict}
              onSuccess={() =>
                handleSuccess({ entity: 'district', action: 'create', keepOpen: true })
              }
            />
          )}

          {/* EDIT forms */}
          {dialog?.mode === 'edit' && dialog?.entity === 'Organizations' && (
            <FormUpdateOrganization
              data={editingRow}
              setData={setEditingRow}
              isBatchEdit={isBatchEdit}
              selectedRows={selectedRows}
              enabledFields={enabledFields}
              setEnabledFields={setEnabledFields}
              onSuccess={() =>
                handleSuccess({ entity: 'organization', action: 'update', keepOpen: true })
              }
            />
          )}
          {dialog?.mode === 'edit' && dialog?.entity === 'Departments' && (
            <FormUpdateDepartment
              data={editingRow}
              isBatchEdit={isBatchEdit}
              selectedRows={selectedRows}
              enabledFields={enabledFields}
              setEnabledFields={setEnabledFields}
              onSuccess={() =>
                handleSuccess({ entity: 'department', action: 'update', keepOpen: true })
              }
            />
          )}
          {dialog?.mode === 'edit' && dialog?.entity === 'Districts' && (
            <FormUpdateDistrict
              data={editingRow}
              isBatchEdit={isBatchEdit}
              selectedRows={selectedRows}
              enabledFields={enabledFields}
              setEnabledFields={setEnabledFields}
              onSuccess={() =>
                handleSuccess({ entity: 'district', action: 'update', keepOpen: true })
              }
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm discard for unsaved ADD forms */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          You have unsaved changes. Discard and close this {entityLabel(dialog?.entity)} form?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDiscard} color="primary" variant="contained">
            Yes, Discard Unsaved Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Content;
