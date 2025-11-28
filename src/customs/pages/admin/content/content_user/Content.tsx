import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Card,
  Skeleton,
  IconButton,
  Typography,
  Tab,
  Tabs,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import PageContainer from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import CloseIcon from '@mui/icons-material/Close';
import { IconScript, IconUsers } from '@tabler/icons-react';
import { useSession } from 'src/customs/contexts/SessionContext';
import { useQuery } from '@tanstack/react-query';
import { deleteUser, getAllUser, getUserById } from 'src/customs/api/admin';
import {
  showConfirmDelete,
  showErrorAlert,
  showSuccessAlert,
} from 'src/customs/components/alerts/alerts';
import { CreateUserSchema, Item, UpdateUserSchema } from 'src/customs/api/models/Admin/User';
import FormUser from './FormUser';
import { filter } from 'lodash';

const Content = () => {
  const { token } = useSession();

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [edittingId, setEdittingId] = useState('');
  const [openFormAddDocument, setOpenFormAddDocument] = useState(false);
  const [formAddUser, setFormAddUser] = useState<any>({});
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [openDialogSetting, setOpenDialogSetting] = useState(false);

  const handleChangeTab = (event: any, newValue: any) => {
    setTabValue(newValue);
  };

  // const { data, isLoading, isError, refetch } = useQuery({
  //   queryKey: ['users', token, page, rowsPerPage, searchKeyword],
  //   queryFn: async () => {
  //     const response = await getAllUser(token as string);

  //     // 🔹 Ambil hanya kolom yang dibutuhkan
  //     const filteredData = response.collection.map((item: any) => ({
  //       id: item.id,
  //       fullname: item.fullname,
  //       username: item.username,
  //       group_id: item.group_id,
  //       email: item.email,
  //       group_name: item.group_name,
  //       description: item.description || '',
  //       status: item.status,
  //     }));

  //     return {
  //       collection: filteredData,
  //       totalRecords: response.RecordsTotal,
  //       totalFiltered: response.RecordsFiltered,
  //     };
  //   },
  //   enabled: !!token,
  // });

  // const collection = data?.collection || [];
  // const totalRecords = collection.length;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['users', token, page, rowsPerPage, searchKeyword],
    queryFn: async () => {
      const response = await getAllUser(token as string);

      // console.log('response', response);

      const filteredData = response.collection.map((item: any) => ({
        id: item.id,
        fullname: item.fullname,
        username: item.username,
        group_id: item.group_id, // tetap ambil untuk logika internal
        email: item.email,
        group_name: item.group_name,
        description: item.description || '',
        status: item.status,
      }));

      // 🧠 Sembunyikan group_id hanya di UI (buat versi tanpa kolom itu)
      const dataForTable = filteredData.map(({ group_id, ...rest }: any) => rest);

      return {
        collection: filteredData,
        tableCollection: dataForTable,
        totalRecords: response.recordsTotal,
        totalFiltered: response.RecordsFiltered,
      };
    },
    enabled: !!token,
  });

  const collection = data?.collection || [];
  const totalRecords = data?.collection.length || 0;

  const cards = [
    {
      title: 'Total User',
      subTitle: `${totalRecords}`,
      subTitleSetting: 10,
      icon: IconUsers,
      color: 'none',
    },
  ];

  const handleAdd = () => {
    setFormAddUser(CreateUserSchema.parse({}));
    setEdittingId('');
    setOpenFormAddDocument(true);
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await getUserById(id, token as string);
      // Pastikan response sudah sesuai struktur UpdateUserSchema
      // const parsedData = CreateUserSchema.parse(response);
      setFormAddUser(response.collection);
      setEdittingId(id);
      setOpenFormAddDocument(true);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      showErrorAlert('Error!', 'Failed to load user data for editing.');
    }
  };

  const handleSetting = async (id: string) => {
    try {
      // const response = await getUserById(id, token as string);
      // // Pastikan response sudah sesuai struktur UpdateUserSchema
      // // const parsedData = CreateUserSchema.parse(response);
      // setFormAddUser(response.collection);
      // setEdittingId(id);
      // setOpenFormAddDocument(true);
      setOpenDialogSetting(true);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      showErrorAlert('Error!', 'Failed to load user data for editing.');
    }
  };

  const handleCloseDialog = () => setOpenFormAddDocument(false);

  // Delete single user
  const handleDelete = async (id: string) => {
    const confirmed = await showConfirmDelete(
      `Are you sure to delete this user?`,
      "You won't be able to revert this!",
    );
    if (!confirmed) return;

    try {
      showSuccessAlert('Deleted!', 'User has been deleted.');
      await deleteUser(token as string, id);
      refetch();
    } catch (error) {
      console.error(error);
      showErrorAlert('Error!', 'Failed to delete user.');
    }
  };

  // Batch delete
  const handleBatchDelete = async (rows: Item[]) => {
    if (!rows.length) return;
    const confirmed = await showConfirmDelete(
      `Are you sure to delete ${rows.length} users?`,
      "You won't be able to revert this!",
    );
    if (!confirmed) return;

    try {
      showSuccessAlert('Deleted!', `${rows.length} users have been deleted.`);
      setSelectedRows([]);
      refetch();
    } catch (error) {
      console.error(error);
      showErrorAlert('Error!', 'Failed to delete some users.');
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
              {/* {isLoading ? (
                <Card sx={{ width: '100%' }}>
                  <Skeleton />
                  <Skeleton animation="wave" />
                  <Skeleton animation={false} />
                </Card>
              ) : ( */}

              <DynamicTable
                loading={isLoading}
                overflowX="auto"
                data={collection}
                isHavePagination
                selectedRows={selectedRows}
                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 20, 50, 100]}
                onPaginationChange={(newPage, newRowsPerPage) => {
                  setPage(newPage);
                  setRowsPerPage(newRowsPerPage);
                }}
                isHaveChecked
                isHaveAction={true}
                isHaveAddData={true}
                isHaveSearch={true}
                isHaveSettingOperator={true}
                onSettingOperator={(row) => handleSetting(row.id)}
                onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                onCheckedChange={(selected) => setSelectedRows(selected)}
                onEdit={(row) => handleEdit(row.id)}
                onDelete={(row) => handleDelete(row.id)}
                onBatchDelete={handleBatchDelete}
                onAddData={handleAdd}
              />
              {/* )} */}
            </Grid>
          </Grid>
        </Box>
      </PageContainer>

      {/* Add / Edit Dialog */}
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
          <FormUser
            formData={formAddUser}
            setFormData={setFormAddUser}
            edittingId={edittingId}
            onSuccess={() => {
              handleCloseDialog();
              refetch();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog Setting Operator */}
      <Dialog
        open={openDialogSetting}
        onClose={() => setOpenDialogSetting(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Setting Operator</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => {
            setOpenDialogSetting(false);
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
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Bagian kiri: Tabs vertikal */}
            <Grid size={{ xs: 12, md: 2 }}>
              <Tabs
                orientation="vertical"
                variant="scrollable"
                value={tabValue}
                onChange={handleChangeTab}
                sx={{
                  borderRight: 1,
                  borderColor: 'divider',
                  minHeight: '300px',
                }}
              >
                <Tab label="Registered Site" />
                <Tab label="Give Access" />
                <Tab label="Sites" />
              </Tabs>
            </Grid>

            {/* Bagian kanan: Konten tab */}
            <Grid size={{ xs: 12, md: 10 }}>
              {tabValue === 0 && (
                <Box>
                  {/* <Typography variant="h6" gutterBottom>
                    Register Site
                  </Typography>
                  <Typography variant="body2">
                    Ini adalah konten untuk tab <strong>Register Site</strong>.
                  </Typography> */}
                  <DynamicTable data={[]} isHaveHeaderTitle={true} titleHeader="Registered Site" />
                </Box>
              )}

              {tabValue === 1 && (
                <Box>
                  <DynamicTable data={[]} isHaveHeaderTitle={true} titleHeader="Give Access" />
                </Box>
              )}
              {tabValue === 2 && (
                <Box>
                  <DynamicTable data={[]} isHaveHeaderTitle={true} titleHeader="Sites" />
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>You have unsaved changes. Discard them and continue editing?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setConfirmDialogOpen(false);
              if (pendingEditId) handleEdit(pendingEditId);
              setPendingEditId(null);
            }}
            color="primary"
            variant="contained"
          >
            Yes, Continue
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Content;
