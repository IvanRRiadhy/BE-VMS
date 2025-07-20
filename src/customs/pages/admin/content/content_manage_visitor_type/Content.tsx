import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Divider,
  Grid2 as Grid,
  IconButton,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';

import CloseIcon from '@mui/icons-material/Close';
import TopCard from 'src/customs/components/cards/TopCard';
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
  getAllDocumentPagination,
  updateVisitorType,
  deleteVisitorType,
} from 'src/customs/api/admin';

import { UpdateVisitorTypeRequest } from 'src/customs/api/models/VisitorType';
import Swal from 'sweetalert2';

import { useRef } from 'react';

type VisitorTypeTableRow = {
  id: string;
  name: string;
  show_in_form: boolean;
  duration_visit: number;
  max_time_visit: number;
  can_parking: boolean;
  can_access: boolean;
  add_to_menu: boolean;
  need_document: boolean;
  grace_time: number;
  period: number;
  simple_visitor: boolean;
  simple_period: boolean;
};

const Content = () => {
  const { token } = useSession();
  const [visitorData, setVisitorData] = useState<Item[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [tableRowVisitorType, setTableRowVisitorType] = React.useState<VisitorTypeTableRow[]>([]);

  const [isDataReady, setIsDataReady] = useState(false);

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
  const dialogRef = useRef<HTMLDivElement | null>(null);

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
        const document = await getAllDocumentPagination(token, start, 99, sortColumn);
        console.log('Response from API:', response);
        if (response && document) {
          const orgMap = (document.collection ?? []).reduce(
            (acc: Record<string, string>, org: any) => {
              acc[org.id] = org.name;
              return acc;
            },
            {},
          );
          setVisitorData(response.collection);
          const rows = response.collection.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            show_in_form: item.show_in_form,
            duration_visit: item.duration_visit,
            max_time_visit: item.max_time_visit,
            can_parking: item.can_parking,
            can_access: item.can_access,
            add_to_menu: item.add_to_menu,
            need_document: item.need_document,
            grace_time: item.grace_time,
            period: item.period,
            simple_visitor: item.simple_visitor,
            simple_period: item.simple_period,
            can_notification_arrival: item.can_notification_arrival,
            is_primary: item.is_primary,
            is_enable: item.is_enable,
          }));
          // setTableData(mappedDocument);
          setTotalRecords(response.RecordsTotal);
          setIsDataReady(true);

          setTableRowVisitorType(rows);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // console.log('Fetching data: ', tableData);
  }, [token, page, rowsPerPage, sortColumn, refreshTrigger, searchKeyword]);

  const handleOpenDialog = () => {
    setOpenFormCreateVisitorType(true);
  };
  const handleCloseDialog = () => {
    // localStorage.removeItem('unsavedVisitorTypeData'); // Pastikan dihapus hanya saat keluar
    setOpenFormCreateVisitorType(false);
  };

  const handleAdd = useCallback(() => {
    const freshForm = CreateVisitorTypeRequestSchema.parse({});
    setEdittingId('');
    setFormDataAddVisitorType(freshForm);
    localStorage.setItem('unsavedVisitorTypeData', JSON.stringify(freshForm));
    setPendingEditId(null);
    handleOpenDialog();
  }, []);

  const handleEdit = (id: string) => {
    console.log('Editing ID:', id);

    const existing = visitorData.find((item) => item.id === id);
    if (!existing) {
      console.warn('No visitor data found for ID:', id);
      return;
    }

    const parsed = CreateVisitorTypeRequestSchema.parse({
      name: existing.name,
      description: existing.description,
      show_in_form: existing.show_in_form,
      duration_visit: existing.duration_visit,
      max_time_visit: existing.max_time_visit,
      can_parking: existing.can_parking,
      can_access: existing.can_access,
      add_to_menu: existing.add_to_menu,
      need_document: existing.need_document,
      grace_time: existing.grace_time,
      direct_visit: existing.direct_visit,
      period: existing.period,
      can_notification_arrival: existing.can_notification_arrival,
      is_primary: existing.is_primary,
      is_enable: existing.is_enable,
      vip: existing.vip,
      simple_visitor: existing.simple_visitor,
      simple_period: existing.simple_period,
      visitor_type_documents: existing.visitor_type_documents ?? null,
      section_page_visitor_types: existing.section_page_visitor_types ?? [],
    });

    const editingLocal = localStorage.getItem('unsavedVisitorTypeData');

    if (editingLocal) {
      const editingData = JSON.parse(editingLocal);
      if (editingData.id && editingData.id !== id) {
        console.log('Editing different item than unsaved one. Prompt confirmation.');
        setPendingEditId(id);
        setConfirmDialogOpen(true);
        return;
      }
    }

    // ✅ Ini penting: set edittingId agar title dialog bisa menunjukkan mode Edit
    setEdittingId(id);
    setFormDataAddVisitorType(parsed);
    localStorage.setItem('unsavedVisitorTypeData', JSON.stringify({ id, ...parsed }));
    handleOpenDialog();
  };

  // setConfirmDialogOpen(false);

  // // ✅ Ini penting
  // localStorage.removeItem('unsavedVisitorTypeData');

  // if (pendingEditId) {
  //   const existingData = visitorTypeData.find((item) => item.id === pendingEditId);
  //   setFormDataAddVisitorType(existingData || CreateVisitorTypeRequestSchema.parse({}));
  //   setPendingEditId(null);
  //   handleOpenDialog();
  // } else {
  //   handleCloseDialog();
  //   setFormDataAddVisitorType(CreateVisitorTypeRequestSchema.parse({}));
  // }

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
        is_primary: nextItem.is_primary,
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
    }
  };

  const handleCancelEdit = () => {
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  const removeEmptyArrays = (obj: Record<string, any>) => {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, value]) => !Array.isArray(value) || value.length > 0),
    );
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
      console.error('Error updating data:', error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 800);
    }
  };

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
        } finally {
          setTimeout(() => {
            setLoading(false);
          }, 500);
        }
      }
    });
  };
  return (
    <>
      <PageContainer title="Manage Visitor Type" description="Visitor Type Page">
        <Box>
          <Grid container spacing={3}>
            {/* column */}
            {/* <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} />
            </Grid> */}
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                overflowX={'auto'}
                data={tableRowVisitorType}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveSearch={true}
                isHaveFilter={true}
                isHaveExportPdf={true}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                isHaveAddData={true}
                isHaveHeader={false}
                isHaveBooleanSwitch={true}
                onCheckedChange={(selected) => console.log('Checked table row:', selected)}
                onEdit={(row) => {
                  handleEdit(row.id);
                }}
                onDelete={(row) => handleDelete(row.id)}
                onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                onAddData={() => {
                  handleAdd();
                }}
                onBooleanSwitchChange={(row, col, checked) =>
                  handleBooleanSwitch(row, col as keyof VisitorTypeTableRow, checked)
                }
              />{' '}
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
      <Dialog
        open={openFormCreateVisitorType}
        onClose={(event, reason) => {
          if (reason === 'backdropClick') {
            if (isFormChanged) {
              setConfirmDialogOpen(true);
            } else {
              handleCloseDialog();
            }
          }
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ position: 'relative', padding: 5 }}>
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
          <FormVisitorType
            formData={formDataAddVisitorType}
            setFormData={setFormDataAddVisitorType}
            onSuccess={handleCloseDialog}
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

      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <CircularProgress color="inherit" />
        </Box>
      )}
    </>
  );
};

export default Content;
