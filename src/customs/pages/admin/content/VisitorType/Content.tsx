import { useEffect, useState, useCallback, useLayoutEffect, useMemo } from 'react';
import { Box, CircularProgress, Divider, Grid2 as Grid } from '@mui/material';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import PageContainer from 'src/customs/components/container/PageContainer';
import Container from 'src/components/container/PageContainer';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import {
  CreateVisitorTypeRequest,
  CreateVisitorTypeRequestSchema,
  Item,
} from 'src/customs/api/models/Admin/VisitorType';
import {
  getVisitorTypeById,
} from 'src/customs/api/admin';
import { IconUsersGroup } from '@tabler/icons-react';
import { useRef } from 'react';
import TopCard from 'src/customs/components/cards/TopCard';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import ConfirmUnsavedDialog from '../../components/ConfirmUnsavedDialog';
import { getVisitorTypeAccessByVisitorId } from 'src/customs/api/VisitorType/Access';
import VisitorTypeDialog from './components/VisitorTypeDialog';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import { useTranslation } from 'react-i18next';
import { useVisitorTypePagination } from 'src/hooks/VisitorType/useVisitorTypePagination';
import { useVisitorTypeMutation } from 'src/hooks/VisitorType/useVisitorTypeMutation';
import GlobalBackdropLoading from 'src/customs/pages/Operator/Components/GlobalBackdrop';

type VisitorTypeTableRow = {
  id: string;
  name: string;
  description: string;
  period: number;
};

const Content = () => {
  const [visitorData, setVisitorData] = useState<Item[]>([]);
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedRows, setSelectedRows] = useState<VisitorTypeTableRow[]>([]);
  const [formDataAddVisitorType, setFormDataAddVisitorType] = useState<CreateVisitorTypeRequest>(
    CreateVisitorTypeRequestSchema.parse({}),
  );
  const initialFormRef = useRef(CreateVisitorTypeRequestSchema.parse({}));
  const [edittingId, setEdittingId] = useState('');
  const defaultFormData = CreateVisitorTypeRequestSchema.parse({});
  const isFormChanged = JSON.stringify(formDataAddVisitorType) !== JSON.stringify(defaultFormData);
  const [openFormCreateVisitorType, setOpenFormCreateVisitorType] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [documentIdentities, setDocumentIdentities] = useState<
    { document_id: string; identity_type: number }[]
  >([]);
  const [duplicatedAccess, setDuplicatedAccess] = useState<any[]>([]);
  const { t } = useTranslation();
  const identityValueMap: Record<string, number> = {
    NIK: 0,
    KTP: 1,
    Passport: 2,
    DriverLicense: 3,
    CardAccess: 4,
    Face: 5,
  };

  const normalizeDetail = (d: any) => ({
    ...d,
    visitor_type_documents: (d.visitor_type_documents ?? []).map((x: any) => ({
      document_id: x.document_id,
    })),
    section_page_visitor_types: (d.section_page_visitor_types ?? []).map((s: any, i: number) => ({
      ...s,
      sort: s.sort ?? i,
      visit_form: Array.isArray(s.visit_form) ? s.visit_form : [],
      pra_form: Array.isArray(s.pra_form) ? s.pra_form : [],
      checkout_form: Array.isArray(s.checkout_form) ? s.checkout_form : [],
    })),
  });

  const { data, isLoading } = useVisitorTypePagination({
    page,
    rowsPerPage,
    sortDir,
    search,
  });

  const { deleteMutation, activeMutation, quickAccessMutation } = useVisitorTypeMutation();

  const tableRowVisitorType =
    data?.collection.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      period: item.period,
      grace_time: item.grace_time,
      active: item.is_enable,
      quick_access: item.is_quick_access,
    })) ?? [];

  const totalRecords = data?.RecordsTotal ?? 0;
  const totalFilteredRecords = data?.RecordsFiltered ?? 0;

  const cards = useMemo(
    () => [
      {
        title: t('totalVisitorType'),
        subTitle: `${totalRecords}`,
        icon: IconUsersGroup,
        color: 'none',
      },
    ],
    [t, totalRecords],
  );

  const handleOpenDialog = () => {
    setOpenFormCreateVisitorType(true);
  };
  const handleCloseDialog = () => {
    setOpenFormCreateVisitorType(false);
  };

  const handleAdd = useCallback(() => {
    const freshForm = CreateVisitorTypeRequestSchema.parse({});

    setEdittingId('');
    setFormDataAddVisitorType(freshForm);
    setPendingEditId(null);

    handleOpenDialog();
  }, [handleOpenDialog]);

  const handleEdit = async (id: string) => {
    try {
      const resp = await getVisitorTypeById(id);
      const raw = resp?.collection;

      const hydrated = normalizeDetail(raw);

      setEdittingId(id);
      setFormDataAddVisitorType(hydrated);

      if (Array.isArray(raw?.visitor_type_documents)) {
        const mappedDocs = raw.visitor_type_documents.map((doc: any) => ({
          document_id: doc.document_id,
          identity_type:
            typeof doc.identity_type === 'string'
              ? identityValueMap[doc.identity_type]
              : (doc.identity_type ?? -1),
        }));

        setDocumentIdentities(mappedDocs);
      } else {
        setDocumentIdentities([]);
      }

      initialFormRef.current = hydrated;

      handleOpenDialog();
    } catch (err) {
      console.error('Error fetching visitor type detail:', err);
    }
  };

  const handleConfirmEdit = () => {
    setConfirmDialogOpen(false);

    if (pendingEditId) {
      const nextItem = visitorData.find((item) => item.id === pendingEditId);
      if (!nextItem) return;

      const parsed = CreateVisitorTypeRequestSchema.parse({
        name: nextItem.name,
        description: nextItem.description,
        show_in_form: nextItem.show_in_form,
        duration_visit: nextItem.duration_visit,
        max_time_visit: nextItem.max_time_visit,
        can_parking: nextItem.can_parking,
        can_access: nextItem.can_access,
        add_to_menu: nextItem.add_to_menu,
        need_document: nextItem.need_document,
        grace_time: nextItem.grace_time,
        direct_visit: nextItem.direct_visit,
        period: nextItem.period,
        can_notification_arrival: nextItem.can_notification_arrival,
        // is_primary: nextItem.is_primary,
        is_enable: nextItem.is_enable,
        prefix: nextItem.prefix,
        vip: nextItem.vip,
        simple_visitor: nextItem.simple_visitor,
        simple_period: nextItem.simple_period,
        visitor_type_documents: nextItem.visitor_type_documents ?? null,
        section_page_visitor_types: nextItem.section_page_visitor_types ?? [],
      });

      setEdittingId(pendingEditId);
      setFormDataAddVisitorType(parsed);
      initialFormRef.current = parsed;
      setPendingEditId(null);
      handleOpenDialog();
    } else {
      setFormDataAddVisitorType(CreateVisitorTypeRequestSchema.parse({}));
      setEdittingId('');
    }
    setPendingEditId(null);
    handleCloseDialog();
  };

  const handleCancelEdit = () => {
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  const handleDialogClose = (_event: object, reason: string) => {
    if (reason === 'backdropClick') {
      if (isFormChanged) {
        setConfirmDialogOpen(true);
      } else {
        handleCloseDialog();
      }
    }
  };

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.relatedTarget as Node)) {
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

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirmDelete(t('confirmDelete', { name: 'Visitor Type' }));
    if (!confirmed) return;
    try {
      setLoadingData(true);
      // await deleteVisitorType(id);
      await deleteMutation.mutateAsync(id);

      showSwal('success', t('deleteSuccess', { name: 'Visitor Type' }));
    } catch (error: any) {
      showSwal('error', error.response.data.msg || t('deleteFailed', { name: 'Visitor Type' }));
    } finally {
      setTimeout(() => {
        setLoadingData(false);
      }, 500);
    }
  };

  const handleBatchDelete = async (rows: VisitorTypeTableRow[]) => {
    if (rows.length === 0) return;

    const result = await showConfirmDelete(t('confirmDeleteMultiple', { count: rows.length, name: 'Visitor Type' }));
    if (result) {

      try {
        await Promise.all(rows.map((row) => deleteMutation.mutateAsync(row.id)));
        showSwal('success', t('deleteSuccessMultiple', { count: rows.length, name: 'Visitor Type' }));
        setSelectedRows([]);
      } catch (error) {
        showSwal('error', t('deleteFailedMultiple', { count: rows.length, name: 'Visitor Type' }));
      }
    }
  };

  const handleSearch = useCallback(
    (keyword: string) => {
      setPage(0);
      setSearch(keyword);
    },
    [setPage, setSearch],
  );

  const handleSuccess = () => {
    handleCloseDialog();
  };

  const handleDuplicate = async (id: string) => {
    try {
      setLoadingData(true);

      const resp = await getVisitorTypeById(id);
      const raw = resp?.collection;
      const hydrated = normalizeDetail(raw);
      if (Array.isArray(raw?.visitor_type_documents)) {
        const mappedDocs = raw.visitor_type_documents.map((doc: any) => ({
          document_id: doc.document_id,
          identity_type:
            typeof doc.identity_type === 'string'
              ? identityValueMap[doc.identity_type]
              : (doc.identity_type ?? -1),
        }));

        setDocumentIdentities(mappedDocs);
      } else {
        setDocumentIdentities([]);
      }

      let mappedAccess: any[] = [];

      try {
        const accessRes = await getVisitorTypeAccessByVisitorId(id);
        mappedAccess = (accessRes?.collection ?? []).map((a: any, index: number) => ({
          access_control_id: a.access_control_id ?? '',
          early_access: a.early_access ?? false,
          sort: a.sort ?? index,
        }));
      } catch (error) {
        mappedAccess = [];
      }

      setDuplicatedAccess(mappedAccess);
      const duplicatedData = {
        ...hydrated,
        name: `${hydrated.name} Copy`,
      };

      delete duplicatedData.id;
      setEdittingId('');
      setFormDataAddVisitorType(duplicatedData);
      setPendingEditId(null);
      handleOpenDialog();
    } catch (err) {
      showSwal('error', 'Failed to duplicate visitor type.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleActiveToggle = async (row: any, checked: boolean) => {
    try {
      setLoadingData(true);
      await activeMutation.mutateAsync({
        id: row.id,
        active: checked,
      });
      showSwal('success', t('updatedSuccess', { name: 'Visitor Type' }));
    } catch (error: any) {
      showSwal('error', error?.response?.data?.msg || 'Failed to update status active');
    } finally {
      setLoadingData(false);
    }
  };

  const handleQuickAccessToggle = async (row: any, checked: boolean) => {
    try {
      setLoadingData(true);
      // await updateQuickVisitorType(row.id, checked);
      await quickAccessMutation.mutateAsync({
        id: row.id,
        quickAccess: checked,
      });
      showSwal('success', t('updatedSuccess', { name: 'Visitor Type' }));
    } catch (error: any) {
      showSwal('error', error?.response?.data?.msg || t('updatedFailed', { name: 'Visitor Type' }));
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Visitor Type" description="Visitor Type Page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={isLoading}
                overflowX={'auto'}
                data={tableRowVisitorType}
                selectedRows={selectedRows}
                totalCount={totalFilteredRecords}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveDuplicate={true}
                isHaveSearch={true}
                isHavePagination={true}
                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 50, 100]}
                currentPage={page}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                isHaveFilter={false}
                isHaveExportPdf={false}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                isHaveAddData={true}
                isHaveHeader={false}
                isHaveBooleanSwitch={true}
                onCheckedChange={(selected) => {
                  setSelectedRows(selected);
                }}
                onEdit={(row) => {
                  handleEdit(row.id);
                  setEdittingId(row.id);
                }}
                onDuplicate={(row) => handleDuplicate(row.id)}
                onDelete={(row) => handleDelete(row.id)}
                onBatchDelete={handleBatchDelete}
                searchKeyword={search}
                onSearch={handleSearch}
                onAddData={handleAdd}
                isHaveActive={true}
                onActiveToggle={handleActiveToggle}
                onQuickAccessToggle={handleQuickAccessToggle}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
      <VisitorTypeDialog
        open={openFormCreateVisitorType}
        onClose={handleDialogClose}
        edittingId={edittingId}
        isFormChanged={isFormChanged}
        setConfirmDialogOpen={setConfirmDialogOpen}
        handleCloseDialog={handleCloseDialog}
        formDataAddVisitorType={formDataAddVisitorType}
        setFormDataAddVisitorType={setFormDataAddVisitorType}
        documentIdentities={documentIdentities}
        duplicatedAccess={duplicatedAccess}
        onSuccess={handleSuccess}
      />

      <ConfirmUnsavedDialog
        open={confirmDialogOpen}
        onClose={handleCancelEdit}
        onDiscard={handleConfirmEdit}
      />
      <GlobalBackdropLoading open={loadingData} />
    </PageContainer>
  );
};

export default Content;
