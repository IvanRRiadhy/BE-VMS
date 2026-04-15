import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Tab,
  Tabs,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import Container from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import CloseIcon from '@mui/icons-material/Close';
import { IconScript, IconUsers } from '@tabler/icons-react';
import { useSession } from 'src/customs/contexts/SessionContext';
import { useQuery } from '@tanstack/react-query';
import {
  deleteUser,
  getAllOrganizations,
  getAllSite,
  getAllUser,
  getUserById,
} from 'src/customs/api/admin';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import { CreateUserSchema, Item, UpdateUserSchema } from 'src/customs/api/models/Admin/User';
import PageContainer from 'src/customs/components/container/PageContainer';
import { useNavigate } from 'react-router';
import DialogFormUser from './components/DialogFormUser';
import { GroupRoleId } from 'src/constant/GroupRoleId';
import { useDebounce } from 'src/hooks/useDebounce';
import { useQueryClient } from '@tanstack/react-query';

const Content = () => {
  const { token } = useSession();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState('');
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

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users', token],
    queryFn: async () => {
      const response = await getAllUser(token as string);

      return {
        collection: response.collection,
      };
    },
    enabled: !!token,
  });

  const filteredData = React.useMemo(() => {
    if (!data?.collection) return [];

    return data.collection
      .map((item: any) => ({
        id: item.id,
        fullname: item.fullname,
        username: item.username,
        email: item.email,
        group_name: item.group_name,
        description: item.description || '',
      }))
      .filter((item: any) => item.fullname.toLowerCase().includes(searchKeyword.toLowerCase()));
  }, [data, searchKeyword]);

  const totalRecords = data?.collection.length ?? 0;

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
    setEdittingId('');
    setOpenFormAddDocument(true);
    setFormAddUser(CreateUserSchema.parse({}));
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await getUserById(id, token as string);

      const rawGroup = response?.collection?.user_group_id;

      const matched = Object.values(GroupRoleId).find(
        (value) => value.toLowerCase() === rawGroup?.toLowerCase(),
      );

      console.log('matched', matched);

      setFormAddUser({
        ...response.collection,
        user_group_id: matched ?? '',
      });

      setEdittingId(id);
      setOpenFormAddDocument(true);
    } catch (error) {
      showSwal('error', 'Failed to load user data for editing.');
    }
  };

  const handleSetting = async (id: string) => {
    try {
      setOpenDialogSetting(true);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      showSwal('error', 'Failed to load user data for editing.');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirmDelete(`Are you sure to delete this user?`);
    if (!confirmed) return;

    try {
      await deleteUser(token as string, id);
      showSwal('success', 'Successfully deleted user!');

      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      showSwal('error', 'Failed to delete user.');
    }
  };

  const navigate = useNavigate();

  const [organizaitonRes, setOrganizaitonRes] = useState<any[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      const orgRes = await getAllOrganizations(token);
      setOrganizaitonRes(orgRes.collection ?? []);
    };

    fetchData();
  }, [token]);

  const handleSearchKeywordChange = useCallback((keyword: string) => {
    setSearchInput(keyword);
  }, []);

  const handleSearch = useCallback(() => {
    setPage(0);
    setSearchKeyword(searchInput);
  }, [searchInput]);

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="User" description="User page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>

            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={isLoading}
                overflowX="auto"
                data={filteredData}
                isHavePagination={false}
                selectedRows={selectedRows}
                // defaultRowsPerPage={rowsPerPage}
                // rowsPerPageOptions={[10, 20, 50, 100, 500]}
                // onPaginationChange={(newPage, newRowsPerPage) => {
                //   setPage(newPage);
                //   setRowsPerPage(newRowsPerPage);
                // }}
                isHaveChecked
                isHaveAction={true}
                isOperatorSetting={true}
                onNavigatePage={() => {
                  navigate('/admin/settings');
                }}
                isHaveAddData={true}
                isHaveSearch={true}
                isHaveSettingOperator={true}
                onSettingOperator={(row) => handleSetting(row.id)}
                // onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                searchKeyword={searchInput}
                onSearch={handleSearch}
                onSearchKeywordChange={handleSearchKeywordChange}
                onCheckedChange={(selected) => setSelectedRows(selected)}
                onEdit={(row) => handleEdit(row.id)}
                onDelete={(row) => handleDelete(row.id)}
                onAddData={handleAdd}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>

      <DialogFormUser
        open={openFormAddDocument}
        onClose={() => setOpenFormAddDocument(false)}
        edittingId={edittingId}
        onSuccess={() => {
          setOpenFormAddDocument(false);

          queryClient.invalidateQueries({ queryKey: ['users'] });
        }}
        organizationRes={organizaitonRes}
      />

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
    </PageContainer>
  );
};

export default Content;
