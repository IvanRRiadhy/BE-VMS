import React, { useEffect, useState, useCallback } from 'react';
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
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';

import CloseIcon from '@mui/icons-material/Close';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import {
  CreateVisitorTypeRequest,
  CreateVisitorTypeRequestSchema,
  Item,
  updateVisitorTypeSchmea,
} from 'src/customs/api/models/VisitorType';
import FormVisitorType from './FormVisitorType';
import { useSession } from 'src/customs/contexts/SessionContext';

import {
  getAllVisitorTypePagination,
  updateVisitorType,
  deleteVisitorType,
  getVisitorTypeById,
} from 'src/customs/api/admin';

import { UpdateVisitorTypeRequest } from 'src/customs/api/models/VisitorType';
import Swal from 'sweetalert2';

import { IconUsersGroup } from '@tabler/icons-react';
import { useRef } from 'react';
import TopCard from 'src/customs/components/cards/TopCard';
import { showErrorAlert, showSuccessAlert } from 'src/customs/components/alerts/alerts';

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
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
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
        setLoading(false);
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

  // const handleEdit = (id: string) => {
  //   const existing = visitorData.find((item: any) => item.id === id);
  //   if (!existing) {
  //     console.warn('No visitor data found for ID:', id);
  //     return;
  //   }

  //   const parsed = CreateVisitorTypeRequestSchema.parse({
  //     name: existing.name,
  //     description: existing.description,
  //     show_in_form: existing.show_in_form,
  //     duration_visit: existing.duration_visit,
  //     max_time_visit: existing.max_time_visit,
  //     can_parking: existing.can_parking,
  //     can_access: existing.can_access,
  //     add_to_menu: existing.add_to_menu,
  //     need_document: existing.need_document,
  //     grace_time: existing.grace_time,
  //     direct_visit: existing.direct_visit,
  //     period: existing.period,
  //     can_notification_arrival: existing.can_notification_arrival,
  //     // is_primary: existing.is_primary,
  //     is_enable: existing.is_enable,
  //     vip: existing.vip,
  //     simple_visitor: existing.simple_visitor,
  //     simple_period: existing.simple_period,
  //     visitor_type_documents: existing.visitor_type_documents ?? null,
  //     section_page_visitor_types: existing.section_page_visitor_types ?? [],
  //   });

  //   const editingLocal = localStorage.getItem('unsavedVisitorTypeData');

  //   if (editingLocal) {
  //     const editingData = JSON.parse(editingLocal);
  //     if (editingData.id && editingData.id !== id) {
  //       setPendingEditId(id);
  //       setConfirmDialogOpen(true);
  //       return;
  //     }
  //   }

  //   // ✅ Ini penting: set edittingId agar title dialog bisa menunjukkan mode Edit
  //   setEdittingId(id);
  //   setFormDataAddVisitorType(parsed);
  //   localStorage.setItem('unsavedVisitorTypeData', JSON.stringify({ id, ...parsed }));
  //   handleOpenDialog();
  // };

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
      const raw = resp?.collection; // <-- ini yang benar
      if (!raw) throw new Error('Empty collection');

      // Saat EDIT, skip Zod (validasi nanti saat submit)
      const hydrated = normalizeDetail(raw);

      setEdittingId(id);
      setFormDataAddVisitorType(hydrated);
      localStorage.setItem('unsavedVisitorTypeData', JSON.stringify({ id, ...hydrated }));
      handleOpenDialog();

      // debug
      console.log('api visit_form len:', raw.section_page_visitor_types?.[0]?.visit_form?.length);
      console.log(
        'hydrated visit_form len:',
        hydrated.section_page_visitor_types?.[0]?.visit_form?.length,
      );
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
        setLoading(true);
        try {
          setLoading(true);
          await deleteVisitorType(token, id);

          setRefreshTrigger((prev) => prev + 1);
          showSuccessAlert('Deleted!', 'Visitor type has been deleted.');
        } catch (error) {
          console.error(error);
          showErrorAlert('Failed!', 'Failed to delete visitor type.');
        } finally {
          setTimeout(() => {
            setLoading(false);
          }, 500);
        }
      }
    });
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
    <>
      <PageContainer title="Manage Visitor Type" description="Visitor Type Page">
        <Box>
          <Grid container spacing={3}>
            {/* column */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <TopCard items={cards} />
            </Grid>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              {isDataReady ? (
                <DynamicTable
                  overflowX={'auto'}
                  data={tableRowVisitorType}
                  selectedRows={selectedRows}
                  totalCount={totalFilteredRecords}
                  isHaveChecked={true}
                  isHaveAction={true}
                  isHaveSearch={true}
                  isHavePagination={true}
                  defaultRowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[5, 10, 20, 50, 100]}
                  onPaginationChange={(page, rowsPerPage) => {
                    setPage(page);
                    setRowsPerPage(rowsPerPage);
                  }}
                  isHaveFilter={true}
                  isHaveExportPdf={true}
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
      <Dialog
        open={openFormCreateVisitorType}
        onClose={handleDialogClose} // sebelumnya: handleCloseDialog
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle
          sx={{
            padding: 3,
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
        <DialogContent>
          <FormVisitorType
            formData={formDataAddVisitorType}
            setFormData={setFormDataAddVisitorType}
            onSuccess={() => {
              localStorage.removeItem('unsavedVisitorTypeData');
              handleCloseDialog();
              setRefreshTrigger((prev) => prev + 1);
            }}
            edittingId={edittingId}
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
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            bgcolor: '#fff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 20000,
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      )}
    </>
  );
};

export default Content;
