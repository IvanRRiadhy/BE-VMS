// import { useState, useRef, useCallback, useMemo } from 'react';
// import { Box, Grid2 as Grid } from '@mui/material';
// import Container from 'src/components/container/PageContainer';
// import PageContainer from 'src/customs/components/container/PageContainer';
// import {
//   AdminCustomSidebarItemsData,
//   AdminNavListingData,
// } from 'src/customs/components/header/navigation/AdminMenu';

// import TopCard from 'src/customs/components/cards/TopCard';
// import { DynamicTable } from 'src/customs/components/table/DynamicTable';
// import { getCustomFieldById } from 'src/customs/api/admin';
// import {
//   CreateCustomFieldRequest,
//   multiOptField,
//   CreateCustomFieldRequestSchema,
// } from 'src/customs/api/models/Admin/CustomField';
// import { IconSettings } from '@tabler/icons-react';
// import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
// import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
// import ConfirmUnsavedDialog from '../../components/ConfirmUnsavedDialog';
// import CustomFieldDialog from './components/CustomFIeldDialog';
// import useCustomFieldPagination from 'src/hooks/CustomField/useCustomFieldPagination';
// import useCustomFieldMutation from 'src/hooks/CustomField/useCustomFieldMutation';
// import GlobalBackdropLoading from 'src/customs/pages/Operator/Components/GlobalBackdrop';
// import { useTranslation } from 'react-i18next';

// type CustomFieldTableRow = {
//   id: string;
//   name: string;
//   display_text: string;
//   field_type: string;
//   multiple_option_fields: multiOptField[];
// };

// const Content = () => {
//   const [selectedRows, setSelectedRows] = useState<CustomFieldTableRow[]>([]);
//   const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
//   const { page, search, setPage, setSearch } = useTableQueryParams();
//   const [rowsPerPage, setRowsPerPage] = useState(30);
//   const [edittingId, setEdittingId] = useState('');
//   const [initialFormSnapshot, setInitialFormSnapshot] = useState<string | null>(null);
//   const [openCreateCustomField, setOpenCreateCustomField] = useState(false);
//   const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
//   const [pendingEditId, setPendingEditId] = useState<string | null>(null);
//   const { t } = useTranslation();

//   const { data, isLoading } = useCustomFieldPagination({
//     page,
//     rowsPerPage,
//     search,
//   });

//   const { deleteMutation } = useCustomFieldMutation();

//   const tableData = data?.collection ?? [];
//   const totalRecords = data?.totalRecords ?? 0;

//   const [formDataAddCustomField, setFormDataAddCustomField] = useState<CreateCustomFieldRequest>(
//     CreateCustomFieldRequestSchema.parse({}),
//   );
//   const isFormChanged =
//     initialFormSnapshot !== null && JSON.stringify(formDataAddCustomField) !== initialFormSnapshot;

//   const cards = useMemo(
//     () => [
//       {
//         title: 'Total Custom Field',
//         subTitle: `${totalRecords ?? 0}`,
//         icon: IconSettings,
//         subTitleSetting: 10,
//         color: 'none',
//       },
//     ],
//     [totalRecords],
//   );

//   const handleOpenDialog = () => {
//     setOpenCreateCustomField(true);
//   };
//   const handleCloseDialog = () => {
//     setOpenCreateCustomField(false);
//     setInitialFormSnapshot(null);
//   };

//   const handleAdd = () => {
//     const data = CreateCustomFieldRequestSchema.parse({});

//     setFormDataAddCustomField(data);
//     setInitialFormSnapshot(JSON.stringify(data));
//     setEdittingId('');
//     handleOpenDialog();
//   };

//   const handleEdit = async (id: string) => {
//     // const data = tableData.find((item) => item.id === id) || {};
//     const data = await getCustomFieldById(id);
//     const parsed = CreateCustomFieldRequestSchema.parse(data.collection);

//     setFormDataAddCustomField(parsed);
//     setInitialFormSnapshot(JSON.stringify(parsed));
//     setEdittingId(id);

//     handleOpenDialog();
//   };

//   const handleConfirmEdit = () => {
//     setConfirmDialogOpen(false);

//     if (pendingEditId) {
//       const data = tableData.find((item: any) => item.id === pendingEditId);
//       setFormDataAddCustomField(CreateCustomFieldRequestSchema.parse(data || {}));
//       setEdittingId(pendingEditId);
//     } else {
//       setFormDataAddCustomField(CreateCustomFieldRequestSchema.parse({}));
//       setEdittingId('');
//     }

//     setPendingEditId(null);
//     handleCloseDialog();
//   };

//   const handleDialogClose = (_event: object, reason: string) => {
//     if (reason === 'backdropClick') {
//       if (isFormChanged) {
//         setConfirmDialogOpen(true);
//       } else {
//         handleCloseDialog();
//       }
//     }
//   };

//   const handleDelete = async (id: string) => {
//     const confirm = await showConfirmDelete(t('confirmDelete', { name: 'Custom Field' }));

//     if (confirm) {
//       try {
//         await deleteMutation.mutateAsync(id);
//         showSwal('success', t('deleteSuccess', { name: 'Custom Field' }));
//       } catch (error: any) {
//         showSwal('error', error.response.data.msg ?? 'Failed to delete custom field.');
//       }
//     }
//   };

//   const handleBatchDelete = async (rows: CustomFieldTableRow[]) => {
//     if (rows.length === 0) return;

//     const confirmed = await showConfirmDelete(
//       t('confirmDeleteMultiple', { count: rows.length, name: 'Custom Field' }),
//     );

//     if (confirmed) {
//       try {
//         await Promise.all(rows.map((row) => deleteMutation.mutateAsync(row.id)));
//         setSelectedRows([]);
//         showSwal(
//           'success',
//           t('deleteSuccessMultiple', { count: rows.length, name: 'Custom Field' }),
//         );
//         return true;
//       } catch (error: any) {
//         showSwal(
//           'error',
//           error.response.data.msg ??
//             t('deleteSuccessMultiple', { count: rows.length, name: 'Custom Field' }),
//         );
//         return false;
//       }
//     }
//   };

//   const handleSuccess = () => {
//     handleCloseDialog();
//     if (edittingId) {
//       showSwal('success', t('updatedSuccess', { name: 'Custom Field' }));
//     } else {
//       showSwal('success', t('createSuccess', { name: 'Custom Field' }));
//     }
//   };

//   const handleSearch = useCallback(
//     (keyword: string) => {
//       setPage(0);
//       setSearch(keyword);
//     },
//     [setPage, setSearch],
//   );

//   return (
//     <PageContainer
//       itemDataCustomNavListing={AdminNavListingData}
//       itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
//     >
//       <Container title="Custom Field" description="Custom Field page">
//         <Box>
//           <Grid container spacing={3}>
//             <Grid size={{ xs: 12, lg: 12 }}>
//               <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
//             </Grid>
//             <Grid size={{ xs: 12, lg: 12 }}>
//               <DynamicTable
//                 loading={isLoading}
//                 overflowX={'auto'}
//                 isHavePagination={false}
//                 data={tableData}
//                 selectedRows={selectedRows}
//                 totalCount={totalFilteredRecords}
//                 isHaveChecked={true}
//                 isHaveAction={true}
//                 isHaveSearch={true}
//                 isHaveFilter={false}
//                 searchPlaceholder="Search Custom Field"
//                 isHaveExportPdf={false}
//                 isNoActionTableHead={false}
//                 isHaveExportXlf={false}
//                 isHaveFilterDuration={false}
//                 isHaveAddData={true}
//                 isHaveHeader={false}
//                 onCheckedChange={(selected) => {
//                   setSelectedRows(selected);
//                 }}
//                 onEdit={(row) => {
//                   handleEdit(row.id);
//                   setEdittingId(row.id);
//                 }}
//                 onDelete={(row) => handleDelete(row.id)}
//                 onBatchDelete={handleBatchDelete}
//                 searchKeyword={search}
//                 onSearch={handleSearch}
//                 onAddData={handleAdd}
//                 isHaveObjectData={true}
//                 isHaveAddEmpty={true}
//                 addDataText={t('add') + ' Custom Field'}
//                 onAddEmpty={handleAdd}
//               />
//             </Grid>
//           </Grid>
//         </Box>
//       </Container>
//       <CustomFieldDialog
//         open={openCreateCustomField}
//         editingId={edittingId}
//         formData={formDataAddCustomField}
//         setFormData={setFormDataAddCustomField}
//         isFormChanged={isFormChanged}
//         onClose={handleCloseDialog}
//         onConfirmClose={() => setConfirmDialogOpen(true)}
//         onDialogClose={handleDialogClose}
//         onSuccess={handleSuccess}
//       />
//       <ConfirmUnsavedDialog
//         open={confirmDialogOpen}
//         onClose={() => setConfirmDialogOpen(false)}
//         onDiscard={handleConfirmEdit}
//       />
//       <GlobalBackdropLoading open={deleteMutation.isPending} />
//     </PageContainer>
//   );
// };

// export default Content;



import { useState, useRef, useCallback, useMemo } from 'react';
import { Box, Grid2 as Grid } from '@mui/material';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';

import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';

import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { getCustomFieldById } from 'src/customs/api/admin';

import {
  CreateCustomFieldRequest,
  CreateCustomFieldRequestSchema,
  multiOptField,
} from 'src/customs/api/models/Admin/CustomField';

import { IconSettings } from '@tabler/icons-react';
import {
  showConfirmDelete,
  showSwal,
} from 'src/customs/components/alerts/alerts';

import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import ConfirmUnsavedDialog from '../../components/ConfirmUnsavedDialog';

import useCustomFieldPagination from 'src/hooks/CustomField/useCustomFieldPagination';
import useCustomFieldMutation from 'src/hooks/CustomField/useCustomFieldMutation';

import GlobalBackdropLoading from 'src/customs/pages/Operator/Components/GlobalBackdrop';
import { useTranslation } from 'react-i18next';
import CustomFieldDialog from './components/CustomFIeldDialog';

type CustomFieldTableRow = {
  id: string;
  name: string;
  display_text: string;
  field_type: string;
  multiple_option_fields: multiOptField[];
};

const Content = () => {
  const { t } = useTranslation();

  // Table state
  const [selectedRows, setSelectedRows] = useState<CustomFieldTableRow[]>([]);
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const [rowsPerPage] = useState(30);

  // Dialog state
  const [openCreateCustomField, setOpenCreateCustomField] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState('');

  // Initial form data
  const [initialFormData, setInitialFormData] =
    useState<CreateCustomFieldRequest>(
      CreateCustomFieldRequestSchema.parse({}),
    );

  // Use ref so typing in form does not trigger Content rerender.
  const isDirtyRef = useRef(false);

  const { data, isLoading } = useCustomFieldPagination({
    page,
    rowsPerPage,
    search,
  });

  const { deleteMutation } = useCustomFieldMutation();

  const tableData = data?.collection ?? [];
  const totalRecords = data?.totalRecords ?? 0;

  const cards = useMemo(
    () => [
      {
        title: 'Total Custom Field',
        subTitle: `${totalRecords}`,
        icon: IconSettings,
        subTitleSetting: 10,
        color: 'none',
      },
    ],
    [totalRecords],
  );

  // ---------------------------------
  // Form dirty state
  // ---------------------------------

  const handleDirtyChange = useCallback((dirty: boolean) => {
    isDirtyRef.current = dirty;
  }, []);

  // ---------------------------------
  // Dialog handlers
  // ---------------------------------

  const handleCloseDialog = useCallback(() => {
    setOpenCreateCustomField(false);
    setConfirmDialogOpen(false);
    setEditingId('');
    isDirtyRef.current = false;
  }, []);

  const handleRequestClose = useCallback(() => {
    if (isDirtyRef.current) {
      setConfirmDialogOpen(true);
      return;
    }

    handleCloseDialog();
  }, [handleCloseDialog]);

  const handleAdd = useCallback(() => {
    const emptyData = CreateCustomFieldRequestSchema.parse({});

    setInitialFormData(emptyData);
    setEditingId('');
    isDirtyRef.current = false;
    setOpenCreateCustomField(true);
  }, []);

  const handleEdit = useCallback(async (id: string) => {
    try {
      const response = await getCustomFieldById(id);

      const parsed = CreateCustomFieldRequestSchema.parse(
        response.collection,
      );

      setInitialFormData(parsed);
      setEditingId(id);
      isDirtyRef.current = false;
      setOpenCreateCustomField(true);
    } catch (error: any) {
      showSwal(
        'error',
        error?.response?.data?.msg ?? 'Failed to load custom field.',
      );
    }
  }, []);

  const handleDiscardChanges = useCallback(() => {
    handleCloseDialog();
  }, [handleCloseDialog]);

  // ---------------------------------
  // Search
  // ---------------------------------

  const handleSearch = useCallback(
    (keyword: string) => {
      setPage(0);
      setSearch(keyword);
    },
    [setPage, setSearch],
  );

  // ---------------------------------
  // Delete
  // ---------------------------------

  const handleDelete = useCallback(
    async (id: string) => {
      const confirmed = await showConfirmDelete(
        t('confirmDelete', { name: 'Custom Field' }),
      );

      if (!confirmed) return;

      try {
        await deleteMutation.mutateAsync(id);

        setSelectedRows([]);

        showSwal(
          'success',
          t('deleteSuccess', { name: 'Custom Field' }),
        );
      } catch (error: any) {
        showSwal(
          'error',
          error?.response?.data?.msg ?? 'Failed to delete custom field.',
        );
      }
    },
    [deleteMutation, t],
  );

  const handleBatchDelete = useCallback(
    async (rows: CustomFieldTableRow[]) => {
      if (!rows.length) return false;

      const confirmed = await showConfirmDelete(
        t('confirmDeleteMultiple', {
          count: rows.length,
          name: 'Custom Field',
        }),
      );

      if (!confirmed) return false;

      try {
        await Promise.all(
          rows.map((row) =>
            deleteMutation.mutateAsync(row.id),
          ),
        );

        setSelectedRows([]);

        showSwal(
          'success',
          t('deleteSuccessMultiple', {
            count: rows.length,
            name: 'Custom Field',
          }),
        );

        return true;
      } catch (error: any) {
        showSwal(
          'error',
          error?.response?.data?.msg ?? 'Failed to delete custom fields.',
        );

        return false;
      }
    },
    [deleteMutation, t],
  );

  // ---------------------------------
  // Table callbacks
  // ---------------------------------

  const handleCheckedChange = useCallback(
    (selected: CustomFieldTableRow[]) => {
      setSelectedRows(selected);
    },
    [],
  );

  const handleTableEdit = useCallback(
    (row: CustomFieldTableRow) => {
      handleEdit(row.id);
    },
    [handleEdit],
  );

  const handleTableDelete = useCallback(
    (row: CustomFieldTableRow) => {
      handleDelete(row.id);
    },
    [handleDelete],
  );

  // ---------------------------------
  // Success
  // ---------------------------------

  const handleSuccess = useCallback(() => {
    const wasEditing = !!editingId;

    handleCloseDialog();

    showSwal(
      'success',
      wasEditing
        ? t('updatedSuccess', { name: 'Custom Field' })
        : t('createSuccess', { name: 'Custom Field' }),
    );
  }, [editingId, handleCloseDialog, t]);

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container
        title="Custom Field"
        description="Custom Field page"
      >
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard
                items={cards}
                size={{ xs: 12, lg: 4 }}
              />
            </Grid>

            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={isLoading}
                overflowX="auto"
                isHavePagination={false}
                data={tableData}
                selectedRows={selectedRows}
                totalCount={totalRecords}
                isHaveChecked
                isHaveAction
                isHaveSearch
                isHaveFilter={false}
                searchPlaceholder="Search Custom Field"
                isHaveExportPdf={false}
                isNoActionTableHead={false}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                isHaveAddData
                isHaveHeader={false}
                onCheckedChange={handleCheckedChange}
                onEdit={handleTableEdit}
                onDelete={handleTableDelete}
                onBatchDelete={handleBatchDelete}
                searchKeyword={search}
                onSearch={handleSearch}
                onAddData={handleAdd}
                isHaveObjectData
                isHaveAddEmpty
                addDataText={t('add') + ' Custom Field'}
                onAddEmpty={handleAdd}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>

      <CustomFieldDialog
        open={openCreateCustomField}
        editingId={editingId}
        initialData={initialFormData}
        onClose={handleRequestClose}
        onDirtyChange={handleDirtyChange}
        onSuccess={handleSuccess}
      />

      <ConfirmUnsavedDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onDiscard={handleDiscardChanges}
      />

      <GlobalBackdropLoading
        open={deleteMutation.isPending}
      />
    </PageContainer>
  );
};

export default Content;
