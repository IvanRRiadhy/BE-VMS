import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Card,
  CircularProgress,
  Divider,
  Grid2 as Grid,
  IconButton,
  Backdrop,
  Portal,
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
import {
  showConfirmDelete,
  showErrorAlert,
  showSuccessAlert,
  showSwal,
} from 'src/customs/components/alerts/alerts';

type VisitorTypeTableRow = {
  id: string;
  name: string;
  description: string;
  period: number;
};

const Content = () => {
  const { token } = useSession();
  const [visitorData, setVisitorData] = useState<Item[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [tableRowVisitorType, setTableRowVisitorType] = React.useState<VisitorTypeTableRow[]>([]);
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
  const [openFormCreateVisitorType, setOpenFormCreateVisitorType] = React.useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [openFormCreateSiteSpace, setOpenFormCreateSiteSpace] = React.useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isDataReady, setIsDataReady] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [documentIdentities, setDocumentIdentities] = useState<
    { document_id: string; identity_type: number }[]
  >([]);
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);

  const cards = [
    {
      title: 'Total Visitor Type',
      subTitle: `${totalFilteredRecords}`,
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
          setConfirmDialogOpen(true); // buka dialog konfirmasi
        } else {
          handleCloseDialog(); // tutup langsung kalau tidak ada perubahan
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openFormCreateVisitorType, isFormChanged]);

  useEffect(() => {
    if (Object.keys(formDataAddVisitorType).length > 0) {
      localStorage.setItem('unsavedVisitorTypeData', JSON.stringify(formDataAddVisitorType));
    }
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
          searchKeyword,
        );
        // const document = await getAllDocumentPagination(token, start, 99, sortColumn);
        setVisitorData(response.collection);
        setTotalRecords(response.RecordsTotal);
        setTotalFilteredRecords(response.RecordsFiltered);

        const rows = response.collection.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          period: item.period,
        }));
        // setTableData(mappedDocument);
        if (rows) {
          setTableRowVisitorType(rows);
          setIsDataReady(true);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    };

    fetchData();
  }, [token, page, rowsPerPage, sortColumn, refreshTrigger, searchKeyword]);

  const handleOpenDialog = () => {
    setOpenFormCreateVisitorType(true);
  };
  const handleCloseDialog = () => {
    // localStorage.removeItem('unsavedVisitorTypeData'); // Pastikan dihapus hanya saat keluar
    setOpenFormCreateVisitorType(false);
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

  const identityLabelMap: Record<number, string> = {
    1: 'NIK',
    2: 'KTP',
    3: 'PASSPORT',
    4: 'DriverLicense',
    5: 'CardAccess',
    6: 'Face',
  };

  const identityValueMap: Record<string, number> = {
    NIK: 0,
    KTP: 1,
    PASSPORT: 2,
    DriverLicense: 3,
    CardAccess: 4,
    Face: 5,
  };

  const normalizeDetail = (d: any) => ({
    ...d,
    // FE kamu butuh array of { document_id }, sementara API mengembalikan objek lengkap
    visitor_type_documents: (d.visitor_type_documents ?? []).map((x: any) => ({
      document_id: x.document_id,
    })),
    // pastikan semua form array, bukan null
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
      if (!raw) throw new Error('No data found.');

      const hydrated = normalizeDetail(raw);

      setEdittingId(id);
      setFormDataAddVisitorType(hydrated);

      // 🧩 Ambil langsung visitor_type_documents dari raw (bukan dari hydrated)
      if (Array.isArray(raw.visitor_type_documents)) {
        const mappedDocs = raw.visitor_type_documents.map((doc: any) => ({
          document_id: doc.document_id,
          identity_type:
            typeof doc.identity_type === 'string'
              ? identityValueMap[doc.identity_type]
              : doc.identity_type ?? -1,
        }));

        setDocumentIdentities(mappedDocs);
      } else {
        // console.warn('⚠️visitor_type_documents tidak ditemukan di response');
        setDocumentIdentities([]);
      }

      localStorage.setItem(
        'unsavedVisitorTypeData',
        JSON.stringify({
          id,
          ...hydrated,
          visitor_type_documents: raw.visitor_type_documents ?? [],
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
    localStorage.removeItem('unsavedCustomDataData'); // Bersihkan data tersimpan

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

    // setLoading(true);
    const confirmed = await showConfirmDelete(
      'Are you sure to delete this visitor type?',
      // "You won't be able to revert this!",
    );
    if (!confirmed) return;
    try {
      setLoadingData(true);
      await deleteVisitorType(token, id);

      setRefreshTrigger((prev) => prev + 1);
      // showSuccessAlert('Deleted!', 'Visitor type has been deleted.');
      showSwal('success', 'Visitor type has been deleted.');
    } catch (error) {
      console.error(error);
      showErrorAlert('Failed!', 'Failed to delete visitor type.');
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
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete all!',
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        // Bisa pakai Promise.all untuk hapus semua
        await Promise.all(rows.map((row) => deleteVisitorType(token, row.id)));
        setRefreshTrigger((prev) => prev + 1);
        Swal.fire('Deleted!', 'Selected data has been deleted.', 'success');
        setSelectedRows([]); // reset selected rows
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete some items.', 'error');
      } finally {
        setLoading(false);
      }
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
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={loading}
                overflowX={'auto'}
                data={tableRowVisitorType}
                selectedRows={selectedRows}
                totalCount={totalFilteredRecords}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveSearch={true}
                isHavePagination={true}
                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 20, 50, 100, 200, 500]}
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
                onDelete={(row) => handleDelete(row.id)}
                onBatchDelete={handleBatchDelete}
                onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                onAddData={() => {
                  handleAdd();
                }}
                onBooleanSwitchChange={(row, col, checked) =>
                  handleBooleanSwitch(row, col as keyof VisitorTypeTableRow, checked)
                }
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
      <Dialog
        open={openFormCreateVisitorType}
        onClose={handleDialogClose} // sebelumnya: handleCloseDialog
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle
          sx={{
            // padding: { xs: 2, md: 1 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {edittingId ? 'Edit' : 'Add'} Visitor Type
          <IconButton
            aria-label="close"
            onClick={() => {
              if (isFormChanged) {
                setConfirmDialogOpen(true); // ada perubahan, tampilkan dialog konfirmasi
              } else {
                handleCloseDialog(); // tidak ada perubahan, langsung tutup
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
        <DialogContent sx={{ padding: { xs: 2, md: 3 } }}>
          <FormVisitorType
            formData={formDataAddVisitorType}
            setFormData={setFormDataAddVisitorType}
            onSuccess={() => {
              localStorage.removeItem('unsavedVisitorTypeData');
              handleCloseDialog();
              setRefreshTrigger((prev) => prev + 1);
            }}
            edittingId={edittingId}
            initialDocuments={documentIdentities}
          />
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
      <Portal>
        <Backdrop
          open={loadingData}
          sx={{
            color: '#fff',
            zIndex: (t) => (t.zIndex.snackbar ?? 1400) - 1, // di atas modal (1300), di bawah snackbar (1400)
          }}
        >
          <CircularProgress />
        </Backdrop>
      </Portal>
    </PageContainer>
  );
};

export default Content;
