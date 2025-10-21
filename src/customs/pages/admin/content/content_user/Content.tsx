import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2 as Grid,
  Card,
  Skeleton,
  IconButton,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';

import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import CloseIcon from '@mui/icons-material/Close';

import { useSession } from 'src/customs/contexts/SessionContext';
// import { deleteDocument, getAllDocumentPagination } from 'src/customs/api/admin';
// import FormAddDocument from './FormAddDocument';
import { IconScript } from '@tabler/icons-react';
import {
  showConfirmDelete,
  showErrorAlert,
  showSuccessAlert,
} from 'src/customs/components/alerts/alerts';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import FormUser from './FormUser';
import { CreateUserSchema, Item } from 'src/customs/api/models/Admin/User';

export const dummyUsers: Item[] = [
  {
    id: '416befe2-b840-4f35-b310-a079bf1b6a3b',
    application_id: '074ddc10-9b66-4466-8195-7bf972914603',
    organization_id: '27b31844-1649-417a-b50d-ddfc0661abe3',
    group_id: 'd4a77461-6628-47c9-8a11-b54864012876',
    email: 'admin@example.com',
    username: 'admin',
    fullname: 'Administrator',
    description: 'Main system administrator',
    access: 'Full',
    employee_id: 'EMP001',
    distributor_id: 'DIST001',
    menu: [],
    groupAccess: [
      {
        group_id: 'd4a77461-6628-47c9-8a11-b54864012876',
        access_code: 'ALLMENU:FULLACCESS|MASTERSTAFF:ACCESS',
        is_private: 0,
        userId: null,
        id: '715365ae-32e4-49b5-988f-b2a86aee9937',
        status: 1,
      },
    ],
    status: 1,
  },
  {
    id: '526befe2-b840-4f35-b310-a079bf1b6a3b',
    application_id: '174ddc10-9b66-4466-8195-7bf972914603',
    organization_id: '37b31844-1649-417a-b50d-ddfc0661abe3',
    group_id: 'e5a77461-6628-47c9-8a11-b54864012876',
    email: 'john.doe@example.com',
    username: 'johndoe',
    fullname: 'John Doe',
    description: 'General staff for operations',
    access: 'Limited',

    employee_id: 'EMP002',
    distributor_id: 'DIST002',
    menu: [],
    groupAccess: [
      {
        group_id: 'e5a77461-6628-47c9-8a11-b54864012876',
        access_code: 'MASTERSTAFF:ACCESS',
        is_private: 0,
        userId: null,
        id: '825365ae-32e4-49b5-988f-b2a86aee9937',
        status: 1,
      },
    ],
    status: 1,
  },
  {
    id: '636befe2-b840-4f35-b310-a079bf1b6a3b',
    application_id: '274ddc10-9b66-4466-8195-7bf972914603',
    organization_id: '47b31844-1649-417a-b50d-ddfc0661abe3',
    group_id: 'f6a77461-6628-47c9-8a11-b54864012876',
    email: 'jane.smith@example.com',
    username: 'janesmith',
    fullname: 'Jane Smith',
    description: 'Finance department lead',
    access: 'Full',

    employee_id: 'EMP003',
    distributor_id: 'DIST003',
    menu: [],
    groupAccess: [
      {
        group_id: 'f6a77461-6628-47c9-8a11-b54864012876',
        access_code: 'FINANCE:FULLACCESS|REPORT:ACCESS',
        is_private: 0,
        userId: null,
        id: '935365ae-32e4-49b5-988f-b2a86aee9937',
        status: 1,
      },
    ],
    status: 1,
  },
  {
    id: '746befe2-b840-4f35-b310-a079bf1b6a3b',
    application_id: '374ddc10-9b66-4466-8195-7bf972914603',
    organization_id: '57b31844-1649-417a-b50d-ddfc0661abe3',
    group_id: 'g7a77461-6628-47c9-8a11-b54864012876',
    email: 'michael.brown@example.com',
    username: 'michaelb',
    fullname: 'Michael Brown',
    description: 'Sales representative',
    access: 'Limited',

    employee_id: 'EMP004',
    distributor_id: 'DIST004',
    menu: [],
    groupAccess: [
      {
        group_id: 'g7a77461-6628-47c9-8a11-b54864012876',
        access_code: 'SALES:ACCESS',
        is_private: 0,
        userId: null,
        id: '045365ae-32e4-49b5-988f-b2a86aee9937',
        status: 1,
      },
    ],
    status: 1,
  },
  {
    id: '856befe2-b840-4f35-b310-a079bf1b6a3b',
    application_id: '474ddc10-9b66-4466-8195-7bf972914603',
    organization_id: '67b31844-1649-417a-b50d-ddfc0661abe3',
    group_id: 'h8a77461-6628-47c9-8a11-b54864012876',
    email: 'emily.watson@example.com',
    username: 'emilyw',
    fullname: 'Emily Watson',
    description: 'HR department officer',
    access: 'Full',

    employee_id: 'EMP005',
    distributor_id: 'DIST005',
    menu: [],
    groupAccess: [
      {
        group_id: 'h8a77461-6628-47c9-8a11-b54864012876',
        access_code: 'HR:FULLACCESS|REPORT:ACCESS',
        is_private: 0,
        userId: null,
        id: '155365ae-32e4-49b5-988f-b2a86aee9937',
        status: 1,
      },
    ],
    status: 1,
  },
];

const Content = () => {
  // Pagination state.
  const [tableData, setTableData] = useState<Item[]>([]);
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const { token } = useSession();
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [edittingId, setEdittingId] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [formAddUser, setFormAddUser] = useState<any>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const cards = [
    {
      title: 'Total User',
      subTitle: `${tableData.length}`,
      subTitleSetting: 10,
      icon: IconScript,
      color: 'none',
    },
  ];

  const [openFormAddDocument, setOpenFormAddDocument] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [openPdfDialog, setOpenPdfDialog] = useState(false);

  useEffect(() => {
    setTableData(dummyUsers);
    setIsDataReady(true);
  }, []);

  const handleOpenDialog = () => {
    setIsDirty(false);
    setOpenFormAddDocument(true);
  };
  const handleCloseDialog = () => {
    setOpenFormAddDocument(false);
    localStorage.removeItem('unsavedUser');
  };
  const defaultDoc = CreateUserSchema.parse({});

  const isEmptyDoc = (doc: any) => {
    if (!doc || typeof doc !== 'object') return true;
    try {
      return JSON.stringify(doc) === JSON.stringify(defaultDoc);
    } catch {
      return false;
    }
  };

  const hasUnsaved = () => {
    const raw = localStorage.getItem('unsavedUser');
    if (!raw) return false;
    try {
      const parsed = JSON.parse(raw);
      return !isEmptyDoc(parsed); // hanya true kalau beda dengan default
    } catch {
      return false;
    }
  };

  const handleAdd = () => {
    if (hasUnsaved()) {
      setPendingEditId(null);
      setConfirmDialogOpen(true);
    } else {
      setFormAddUser(CreateUserSchema.parse({}));
      setOpenFormAddDocument(true);
    }
  };

  const handleEdit = (id: string) => {
    if (hasUnsaved()) {
      const parsed = JSON.parse(localStorage.getItem('unsavedUser') as string);
      if (parsed?.id === id) {
        setOpenFormAddDocument(true);
      } else {
        setPendingEditId(id);
        setConfirmDialogOpen(true);
      }
    } else {
      setFormAddUser(CreateUserSchema.parse(tableData.find((item) => item.id === id) || {}));
      setOpenFormAddDocument(true);
    }
  };

  const handleConfirmEdit = () => {
    setConfirmDialogOpen(false);
    if (pendingEditId) {
      setFormAddUser(
        tableData.find((item) => item.id === pendingEditId) || CreateUserSchema.parse({}),
      );
    } else {
      setFormAddUser(CreateUserSchema.parse({}));
    }
    setOpenFormAddDocument(true);
    setPendingEditId(null);
  };

  const handleCancelEdit = () => {
    setEdittingId('');
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  useEffect(() => {
    if (!openFormAddDocument) return;
    localStorage.setItem('unsavedUser', JSON.stringify({ ...formAddUser }));
  }, [formAddUser, openFormAddDocument]);

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!token) return;
    setLoading(true);

    const confirmed = await showConfirmDelete(
      `Are you sure to delete items?`,
      "You won't be able to revert this!",
    );

    if (!confirmed) {
      setLoading(false);
      return;
    }

    try {
      setRefreshTrigger((prev) => prev + 1);
      showSuccessAlert('Deleted!', 'Item has been deleted.');
    } catch (error) {
      console.error(error);
      showErrorAlert('Error!', 'Failed to delete item.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Batch Delete
  const handleBatchDelete = async (rows: Item[]) => {
    if (!token || rows.length === 0) return;

    const confirmed = await showConfirmDelete(
      `Are you sure to delete ${rows.length} items?`,
      "You won't be able to revert this!",
    );

    if (confirmed) {
      setLoading(true);
      try {
        setRefreshTrigger((prev) => prev + 1);
        showSuccessAlert('Deleted!', `${rows.length} items have been deleted.`);
        setSelectedRows([]); // reset selected rows
      } catch (error) {
        console.error(error);
        showErrorAlert('Error!', 'Failed to delete some items.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <PageContainer title="User" description="User page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              {isDataReady ? (
                <DynamicTable
                  overflowX={'auto'}
                  data={dummyUsers}
                  isHavePagination={true}
                  selectedRows={selectedRows}
                  defaultRowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[5, 10, 20, 50, 100]}
                  onPaginationChange={(page, rowsPerPage) => {
                    setPage(page);
                    setRowsPerPage(rowsPerPage);
                  }}
                  isHaveChecked={true}
                  isHaveAction={true}
                  isHaveSearch={true}
                  isHaveFilter={false}
                  isHaveExportPdf={false}
                  isHaveExportXlf={false}
                  isHaveFilterDuration={false}
                  isHaveAddData={true}
                  isHaveFilterMore={false}
                  isHaveHeader={false}
                  isHavePdf={true}
                  onCheckedChange={(selected) => setSelectedRows(selected)}
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
      <Dialog open={openFormAddDocument} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ position: 'relative', padding: 3 }}>
          {edittingId ? 'Edit' : 'Add'} User
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
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
        <DialogContent sx={{ paddingTop: 0 }}>
          <br />
          {/* <FormUser
            formData={formAddUser}
            setFormData={setFormAddUser}
            edittingId={edittingId}
            onSuccess={() => {
              // handleCloseDialog();
              setRefreshTrigger(refreshTrigger + 1);
            }}
          /> */}
        </DialogContent>
      </Dialog>

      {/* Dialog Confirm edit */}
      <Dialog open={confirmDialogOpen} onClose={handleCancelEdit}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          You have unsaved changes for another Document. Are you sure you want to discard them and
          edit this Document?
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
