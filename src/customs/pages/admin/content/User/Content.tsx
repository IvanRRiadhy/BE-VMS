import React, { useCallback, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Container from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { IconUsers } from '@tabler/icons-react';
import { useSession } from 'src/customs/contexts/SessionContext';
import { useQuery } from '@tanstack/react-query';
import { deleteUser, getAllOrganizations, getAllUser, getUserById } from 'src/customs/api/admin';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import { CreateUserSchema, Item } from 'src/customs/api/models/Admin/User';
import PageContainer from 'src/customs/components/container/PageContainer';
import { useNavigate } from 'react-router';
import DialogFormUser from './components/DialogFormUser';
import { GroupRoleId } from 'src/constant/GroupRoleId';
import { useQueryClient } from '@tanstack/react-query';
import ConfirmUnsavedDialog from '../../components/ConfirmUnsavedDialog';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';

const Content = () => {
  const { token } = useSession();
  // const [searchInput, setSearchInput] = useState('');
  // const [searchKeyword, setSearchKeyword] = useState('');
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const [edittingId, setEdittingId] = useState('');
  const [openFormAddDocument, setOpenFormAddDocument] = useState(false);
  const [formAddUser, setFormAddUser] = useState<any>({});
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const navigate = useNavigate();
  const [organizaitonRes, setOrganizaitonRes] = useState<any[]>([]);

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
      .filter((item: any) => item.fullname.toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

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

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirmDelete(`Are you sure to delete this user?`);
    if (!confirmed) return;

    try {
      await deleteUser(token as string, id);
      showSwal('success', 'Successfully deleted user!');

      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error: any) {
      showSwal('error', error.response.data.msg || 'Failed to delete user.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      const orgRes = await getAllOrganizations(token);
      setOrganizaitonRes(orgRes.collection ?? []);
    };
    fetchData();
  }, [token]);

  // const handleSearchKeywordChange = useCallback((keyword: string) => {
  //   setSearchInput(keyword);
  // }, []);

  // const handleSearch = useCallback((keyword: string) => {
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

  const handleDiscard = () => {
    setConfirmDialogOpen(false);
    if (pendingEditId) handleEdit(pendingEditId);
    setPendingEditId(null);
  };

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
                isHaveChecked
                isHaveAction={true}
                isOperatorSetting={true}
                onNavigatePage={() => {
                  navigate('/admin/settings');
                }}
                isHaveAddData={true}
                isHaveSearch={true}
                isHaveSettingOperator={true}
                // onSettingOperator={(row) => handleSetting(row.id)}
                // onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                searchKeyword={search}
                onSearch={handleSearch}
                // onSearchKeywordChange={handleSearchKeywordChange}
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
        onClose={() => {
          setOpenFormAddDocument(false);
          localStorage.removeItem('unsavedUserForm');
        }}
        edittingId={edittingId}
        onSuccess={() => {
          setOpenFormAddDocument(false);
          queryClient.invalidateQueries({ queryKey: ['users'] });
        }}
        organizationRes={organizaitonRes}
      />
      <ConfirmUnsavedDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onDiscard={handleDiscard}
      />
    </PageContainer>
  );
};

export default Content;
