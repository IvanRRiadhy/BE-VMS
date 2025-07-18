import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
} from 'src/customs/api/admin';

import { UpdateVisitorTypeRequest } from 'src/customs/api/models/VisitorType';

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

import { useRef } from 'react';

const Content = () => {
  // const visitorTypeData: Item[] = [
  //   {
  //     id: '123',
  //     show_in_form: true,
  //     visitor_Type: 'Contractor',
  //     document: '{KTP}',
  //     need_Photo: true,
  //     print_Badge: false,
  //     wifiCred: true,
  //     captureVisitorId: true,
  //     show_Ipad: true,
  //     videoURL: '',
  //     welcomeMessage: 'Welcome to Bio Experience',
  //     watchlistMessage: 'Ngapain Hayoo??!?',
  //     customBadge: '',
  //     signinDetails: {
  //       fullName: {
  //         display: 'Enter Your Full Name',
  //         status: true,
  //         mandatory: true,
  //       },
  //       email: {
  //         display: 'Enter Your Email',
  //         status: true,
  //         mandatory: true,
  //       },
  //       host: {
  //         display: 'Who is inviting you?',
  //         status: true,
  //         mandatory: true,
  //       },
  //       company: {
  //         display: 'Enter Your Company Name',
  //         status: true,
  //         mandatory: true,
  //       },
  //       phoneNumber: {
  //         display: 'Enter Your Phone Number',
  //         status: true,
  //         mandatory: true,
  //       },
  //     },
  //     signOutDetails: {},
  //     adminFields: {},
  //   },
  //   {
  //     id: '124',
  //     show_in_form: true,
  //     visitor_Type: 'Family Member',
  //     document: '{Kartu Keluarga, KTP}',
  //     need_Photo: true,
  //     print_Badge: false,
  //     wifiCred: true,
  //     captureVisitorId: true,
  //     show_Ipad: false,
  //     videoURL: '',
  //     welcomeMessage: 'Welcome to Bio Experience',
  //     watchlistMessage: 'Ngapain Hayoo??!?',
  //     customBadge: '',
  //     signinDetails: {
  //       fullName: {
  //         display: 'Enter Your Full Name',
  //         status: true,
  //         mandatory: true,
  //       },
  //       email: {
  //         display: 'Enter Your Email',
  //         status: true,
  //         mandatory: true,
  //       },
  //       host: {
  //         display: 'Which Employee is your family?',
  //         status: true,
  //         mandatory: true,
  //       },
  //       company: {
  //         display: 'Enter Your Company Name',
  //         status: true,
  //         mandatory: true,
  //       },
  //       phoneNumber: {
  //         display: 'Enter Your Phone Number',
  //         status: true,
  //         mandatory: true,
  //       },
  //     },
  //     signOutDetails: {},
  //     adminFields: {},
  //   },
  //   {
  //     id: '125',
  //     visitor_Type: 'Tukang',
  //     document: '{KTP}',
  //     need_Photo: true,
  //     print_Badge: false,
  //     wifiCred: false,
  //     captureVisitorId: false,
  //     show_Ipad: false,
  //     videoURL: '',
  //     welcomeMessage: 'Welcome to Bio Experience',
  //     watchlistMessage: 'Ngapain Hayoo??!?',
  //     customBadge: '',
  //     signinDetails: {
  //       fullName: {
  //         display: 'Enter Your Full Name',
  //         status: true,
  //         mandatory: true,
  //       },
  //       email: {
  //         display: 'Enter Your Email',
  //         status: true,
  //         mandatory: true,
  //       },
  //       host: {
  //         display: 'Who is inviting you?',
  //         status: true,
  //         mandatory: true,
  //       },
  //       company: {
  //         display: 'Enter Your Company Name',
  //         status: true,
  //         mandatory: true,
  //       },
  //       phoneNumber: {
  //         display: 'Enter Your Phone Number',
  //         status: true,
  //         mandatory: true,
  //       },
  //     },
  //     signOutDetails: {},
  //     adminFields: {},
  //   },
  // ];
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
  // const visitorTypeData: Item[] = [
  //   {
  //     id: '123',
  //     name: 'Contractor',
  //     description: 'Contractor visitors',
  //     show_in_form: true,
  //     duration_visit: 30,
  //     max_time_visit: 120,
  //     can_parking: true,
  //     can_access: true,
  //     add_to_menu: true,
  //     need_document: true,
  //     grace_time: 10,
  //     direct_visit: true,
  //     period: 1,
  //     can_notification_arrival: true,
  //     is_primary: false,
  //     is_enable: true,
  //     vip: false,
  //     simple_visitor: false,
  //     simple_period: false,
  //     site_visitor_types: null,
  //     visitor_type_documents: [],
  //     section_page_visitor_types: [],
  //   },
  //   // Tambah data lainnya sesuai format di atas
  // ];
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
        const response = await getAllVisitorTypePagination(token, start, rowsPerPage, sortColumn);
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
            // status: item.settings.status === true ? 'Active' : 'Inactive',
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
  }, [token, page, rowsPerPage, sortColumn, refreshTrigger]);

  const handleOpenDialog = () => {
    setOpenFormCreateVisitorType(true);
  };
  const handleCloseDialog = () => {
    // localStorage.removeItem('unsavedVisitorTypeData'); // Pastikan dihapus hanya saat keluar
    setOpenFormCreateVisitorType(false);
  };
  // const handleAdd = () => {
  //   const editing = localStorage.getItem('unsavedVisitorTypeData');
  //   if (editing) {
  //     // If editing exists, show confirmation dialog for add
  //     setPendingEditId(null); // null means it's an add, not edit
  //     setConfirmDialogOpen(true);
  //   } else {
  //     setFormDataAddVisitorType(CreateVisitorTypeRequestSchema.parse({}));
  //     handleOpenDialog();
  //   }
  // };
  // const [initialFormData, setInitialFormData] = useState<formDataAddVisitorType | null>(null);

  const handleAdd = useCallback(() => {
    const freshForm = CreateVisitorTypeRequestSchema.parse({});
    setFormDataAddVisitorType(freshForm);
    localStorage.setItem('unsavedVisitorTypeData', JSON.stringify(freshForm));
    setPendingEditId(null);
    handleOpenDialog();
    // handleOpenDialog();
  }, []);

  const handleEdit = (id: string) => {
    const editing = localStorage.getItem('unsavedVisitorTypeData');

    const existing = visitorData.find((item) => item.id === id);
    if (!existing) return;

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

    if (editing) {
      const editingData = JSON.parse(editing);
      if (editingData.id === id) {
        setFormDataAddVisitorType(parsed);
        handleOpenDialog(); // ✅ BUKA FORM SETELAH DATA DISET
      } else {
        setPendingEditId(id);
        setConfirmDialogOpen(true);
      }
    } else {
      setFormDataAddVisitorType(parsed);
      handleOpenDialog(); // ✅ BUKA FORM SETELAH DATA DISET
    }

    localStorage.setItem('unsavedVisitorTypeData', JSON.stringify({ id, ...parsed }));
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
    handleCloseDialog();
    setPendingEditId(null);
  };

  const handleCancelEdit = () => {
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  // const handleBooleanSwitch = (rowId: string, col: keyof VisitorTypeTableRow, checked: boolean) => {
  //   setTableRowVisitorType((prev) =>
  //     prev.map((row) => (row.id === rowId ? { ...row, [col]: checked } : row)),
  //   );
  // };
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
      const updatedData: UpdateVisitorTypeRequest = updateVisitorTypeSchmea.parse({
        ...row,
        [col]: checked,
      });

      // // Filter array kosong agar tidak dikirim
      // const filteredData = removeEmptyArrays(rawData);

      // const updatedData: UpdateVisitorTypeRequest = updateVisitorTypeSchmea.parse(filteredData);

      console.log(updatedData);
      await updateVisitorType(token, rowId, updatedData);

      setTableRowVisitorType((prev) =>
        prev.map((r) => (r.id === rowId ? { ...r, [col]: checked } : r)),
      );
    } catch (error) {
      console.error('Error updating data:', error);
    }
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
                  console.log('Edit clicked:', row); // 👈 Tambahkan ini
                  handleEdit(row.id);
                  // setEdittingId(row.id);
                }}
                onDelete={(row) => console.log('Delete:', row)}
                onSearchKeywordChange={(keyword) => console.log('Search keyword:', keyword)}
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
    </>
  );
};

export default Content;
