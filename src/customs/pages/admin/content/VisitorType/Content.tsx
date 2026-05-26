import { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Divider,
  Grid2 as Grid,
  IconButton,
  Backdrop,
} from '@mui/material';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import PageContainer from 'src/customs/components/container/PageContainer';
import Container from 'src/components/container/PageContainer';

import CloseIcon from '@mui/icons-material/Close';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import {
  CreateVisitorTypeRequest,
  CreateVisitorTypeRequestSchema,
  Item,
  updateVisitorTypeSchmea,
  UpdateVisitorTypeRequest,
} from 'src/customs/api/models/Admin/VisitorType';
import FormVisitorType from './FormVisitorType';
import { useSession } from 'src/customs/contexts/SessionContext';

import {
  getAllVisitorTypePagination,
  updateVisitorType,
  deleteVisitorType,
  getVisitorTypeById,
} from 'src/customs/api/admin';
import Swal from 'sweetalert2';

import { IconUsersGroup } from '@tabler/icons-react';
import { useRef } from 'react';
import TopCard from 'src/customs/components/cards/TopCard';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import ConfirmUnsavedDialog from '../../components/ConfirmUnsavedDialog';
import { getVisitorTypeAccessByVisitorId } from 'src/customs/api/VisitorType/Access';
import VisitorTypeDialog from './components/VisitorTypeDialog';
import { updateVisitorTypeActive } from 'src/customs/api/Admin/VisitorType';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';

type VisitorTypeTableRow = {
  id: string;
  name: string;
  description: string;
  period: number;
};

const Content = () => {
  const { token } = useSession();
  const [visitorData, setVisitorData] = useState<Item[]>([]);
  // const [page, setPage] = useState(0);
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [tableRowVisitorType, setTableRowVisitorType] = useState<VisitorTypeTableRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<VisitorTypeTableRow[]>([]);
  const [formDataAddVisitorType, setFormDataAddVisitorType] = useState<CreateVisitorTypeRequest>(
    () => {
      const saved = localStorage.getItem('unsavedVisitorTypeData');
      return saved ? JSON.parse(saved) : CreateVisitorTypeRequestSchema.parse({});
    },
  );
  const [edittingId, setEdittingId] = useState('');
  const defaultFormData = CreateVisitorTypeRequestSchema.parse({});
  const isFormChanged = JSON.stringify(formDataAddVisitorType) !== JSON.stringify(defaultFormData);
  const [openFormCreateVisitorType, setOpenFormCreateVisitorType] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  // const [searchKeyword, setSearchKeyword] = useState('');
  // const [searchInput, setSearchInput] = useState('');
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [documentIdentities, setDocumentIdentities] = useState<
    { document_id: string; identity_type: number }[]
  >([]);
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [duplicatedAccess, setDuplicatedAccess] = useState<any[]>([]);
  const cards = [
    {
      title: 'Total Visitor Type',
      subTitle: `${totalRecords}`,
      icon: IconUsersGroup,
      subTitleSetting: 10,
      color: 'none',
    },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        openFormCreateVisitorType &&
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        if (isFormChanged) {
          setConfirmDialogOpen(true);
        } else {
          handleCloseDialog();
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openFormCreateVisitorType, isFormChanged]);

  useEffect(() => {
    if (Object.keys(formDataAddVisitorType).length === 0) return;

    const timer = setTimeout(() => {
      localStorage.setItem('unsavedVisitorTypeData', JSON.stringify(formDataAddVisitorType));
    }, 500);

    return () => clearTimeout(timer);
  }, [formDataAddVisitorType]);

  useLayoutEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const start = page * rowsPerPage;
        const response = await getAllVisitorTypePagination(
          token,
          start,
          rowsPerPage,
          sortColumn,
          sortDir,
          search,
        );
        setVisitorData(response.collection);
        setTotalRecords(response.RecordsTotal);
        setTotalFilteredRecords(response.RecordsFiltered);

        const rows = response.collection.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          period: item.period,
          grace_time: item.grace_time,
          active: item.is_enable,
        }));
        if (rows) {
          setTableRowVisitorType(rows);
        }
      } catch (error) {
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    };

    fetchData();
  }, [token, page, rowsPerPage, refreshTrigger, search]);

  const handleOpenDialog = () => {
    setOpenFormCreateVisitorType(true);
  };
  const handleCloseDialog = () => {
    setOpenFormCreateVisitorType(false);
    localStorage.removeItem('unsavedVisitorTypeData');
  };

  const handleAdd = useCallback(() => {
    const saved = localStorage.getItem('unsavedVisitorTypeData');
    let freshForm;
    if (saved) {
      freshForm = JSON.parse(saved);
    } else {
      freshForm = CreateVisitorTypeRequestSchema.parse({});
      localStorage.setItem('unsavedVisitorTypeData', JSON.stringify(freshForm));
    }
    setEdittingId('');
    setFormDataAddVisitorType(freshForm);
    setPendingEditId(null);
    handleOpenDialog();
  }, []);

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

  const handleEdit = async (id: string) => {
    try {
      setLoading(true);
      const resp = await getVisitorTypeById(token as string, id);
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

      localStorage.setItem(
        'unsavedVisitorTypeData',
        JSON.stringify({
          id,
          ...hydrated,
          visitor_type_documents: raw?.visitor_type_documents ?? [],
        }),
      );

      handleOpenDialog();
    } catch (err) {
      console.error('Error fetching visitor type detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEdit = () => {
    setConfirmDialogOpen(false);
    localStorage.removeItem('unsavedVisitorTypeData');

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
      localStorage.setItem(
        'unsavedVisitorTypeData',
        JSON.stringify({ id: pendingEditId, ...parsed }),
      );
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

  const handleBooleanSwitch = async (
    rowId: string,
    col: keyof VisitorTypeTableRow,
    checked: boolean,
  ) => {
    const row = tableRowVisitorType.find((r) => r.id === rowId);
    if (!token || !row) return;

    try {
      setLoading(true);
      const updatedData: UpdateVisitorTypeRequest = updateVisitorTypeSchmea.parse({
        ...row,
        [col]: checked,
      });
      await updateVisitorType(token, rowId, updatedData);

      setTableRowVisitorType((prev) =>
        prev.map((r) => (r.id === rowId ? { ...r, [col]: checked } : r)),
      );
    } catch (error) {
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 800);
    }
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
    if (!token) return;

    const confirmed = await showConfirmDelete('Are you sure to delete this visitor type?');
    if (!confirmed) return;
    try {
      setLoadingData(true);
      await deleteVisitorType(token, id);

      setRefreshTrigger((prev) => prev + 1);
      showSwal('success', 'Successfully deleted visitor type!');
    } catch (error: any) {
      showSwal('error', error.response.data.msg || 'Failed to delete visitor type.');
    } finally {
      setTimeout(() => {
        setLoadingData(false);
      }, 500);
    }
  };

  const handleBatchDelete = async (rows: VisitorTypeTableRow[]) => {
    if (!token || rows.length === 0) return;

    const result = await Swal.fire({
      title: `Are you sure to delete ${rows.length} items?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await Promise.all(rows.map((row) => deleteVisitorType(token, row.id)));
        setRefreshTrigger((prev) => prev + 1);
        showSwal('success', 'Successfully deleted selected items!');
        setSelectedRows([]);
      } catch (error) {
        showSwal('error', 'Failed to delete some items.');
      } finally {
        setLoading(false);
      }
    }
  };

  // const handleSearchKeywordChange = useCallback((keyword: string) => {
  //   setSearchInput(keyword);
  // }, []);

  // const handleSearch = useCallback((keyword: string) => {
  //   setPage(0);
  //   setSearchInput(keyword);
  //   setSearchKeyword(keyword);
  // }, []);

  const handleSearch = useCallback(
    (keyword: string) => {
      setPage(0);
      setSearch(keyword);
    },
    [setPage, setSearch],
  );

  const handleSuccess = () => {
    localStorage.removeItem('unsavedVisitorTypeData');
    handleCloseDialog();
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDuplicate = async (id: string) => {
    try {
      setLoadingData(true);

      const resp = await getVisitorTypeById(token as string, id);
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
        const accessRes = await getVisitorTypeAccessByVisitorId(id, token as string);
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
      await updateVisitorTypeActive(token as string, row.id, checked);
      showSwal('success', 'Visitor Type successfully updated');
      setRefreshTrigger((prev) => prev + 1);
    } catch (error: any) {
      showSwal('error', error?.response?.data?.msg || 'Failed to update status active');
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
                loading={loading}
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
                // onSearchKeywordChange={handleSearchKeywordChange}
                searchKeyword={search}
                onSearch={handleSearch}
                onAddData={handleAdd}
                onBooleanSwitchChange={(row, col, checked) =>
                  handleBooleanSwitch(row, col as keyof VisitorTypeTableRow, checked)
                }
                isHaveActive={true}
                onActiveToggle={handleActiveToggle}
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
