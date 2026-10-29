import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Container from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { IconUsers, IconX } from '@tabler/icons-react';
import { getUserById } from 'src/customs/api/admin';
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
import {
  assignEmployee,
  createLinkAccountParking,
  createLinkAccountTracking,
  getLinkAccountParking,
  getLinkAccountTracking,
  unassignAccount,
} from 'src/customs/api/Admin/User';
import { useEmployees } from 'src/hooks/Employee/useEmployees';
import { useOrganization } from 'src/hooks/Organization/useOrganization';
import EmployeeAssignDialog from './components/EmployeeAssignDialog';
import AssignTrackingDialog from './components/AssignTrackingDialog';
import useUsers, { useUserPagination, useUserRole } from 'src/hooks/User/useUsers';
import useUsersMutation from 'src/hooks/User/userUsersMutation';
import { useTranslation } from 'react-i18next';
import AssignParkingDialog from './components/AssignParkingDialog';

const Content = () => {
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const [edittingId, setEdittingId] = useState('');
  const [openFormAddDocument, setOpenFormAddDocument] = useState(false);
  const [formAddUser, setFormAddUser] = useState<any>({});
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const [openEmployeeAssign, setOpenEmployeeAssign] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState<any[]>([]);
  const [assignedAccounts, setAssignedAccounts] = useState<any[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<any | null>(null);
  const [selectedAssigned, setSelectedAssigned] = useState<any | null>(null);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openAssignParkingDialog, setOpenAssignParkingDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { employee } = useEmployees();
  const { organizations } = useOrganization();
  const queryClient = useQueryClient();
  // const { data, isLoading } = useUsers();
  const { deleteMutation: deleteUser } = useUsersMutation();
  const [selectedGroup, setSelectedGroup] = useState('All');

  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(undefined);

  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [sortDir] = useState('asc');

  const { data: users, isLoading: isLoadingPagination } = useUserPagination({
    page,
    rowsPerPage,
    sortDir,
    searchKeyword: search,
    user_group_id: selectedGroupId,
  });

  const filteredData = useMemo(
    () =>
      (users?.collection ?? []).map((item: any) => ({
        id: item.id,
        fullname: item.fullname,
        username: item.username,
        email: item.email,
        // group_name: item.group_name,
        description: item.description || '',
        employee_linked: item.employee_linked,
      })),
    [users],
  );


  const totalRecords =
    users?.RecordsTotal ??
    users?.recordsTotal ??
    users?.recordsFiltered ??
    users?.collection?.length ??
    0;

  const cards = useMemo(
    () => [
      {
        title: 'Total User',
        subTitle: `${totalRecords}`,
        subTitleSetting: 10,
        icon: IconUsers,
        color: 'none',
      },
    ],
    [totalRecords],
  );

  const handleAdd = () => {
    setEdittingId('');
    setOpenFormAddDocument(true);
    setFormAddUser(CreateUserSchema.parse({}));
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await getUserById(id);
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
    const confirmed = await showConfirmDelete(t('confirmDelete', { name: 'User' }));
    if (!confirmed) return;

    try {
      await deleteUser.mutateAsync(id);
      showSwal('success', t('deleteSuccess', { name: 'User' }));
    } catch (error: any) {
      showSwal('error', error.response.data.msg || t('deleteFailed', { name: 'User' }));
    }
  };

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

  const handleAssign = (row: any) => {
    setSelectedUser(row);
    setSelectedEmployeeId('');
    setOpenEmployeeAssign(true);
  };

  const handleSubmitAssign = async () => {
    if (!selectedEmployeeId) {
      showSwal('warning', 'Please select employee');
      return;
    }

    try {
      await assignEmployee(selectedUser.id, {
        link_type: 'Employee',
        employee_id: selectedEmployeeId,
      });

      showSwal('success', 'Employee assigned successfully');
      setOpenEmployeeAssign(false);

      queryClient.invalidateQueries({
        queryKey: ['users'],
      });
    } catch (error: any) {
      showSwal('error', error?.response?.data?.msg || 'Failed assign employee');
    }
  };

  const handleUnassign = async (row: any) => {
    const confirmed = await showConfirmDelete(t('unassignEmployeeConfirm'));

    if (!confirmed) return;

    try {
      await unassignAccount(row.id);

      showSwal('success', 'Successfully unassigned employee');

      queryClient.invalidateQueries({
        queryKey: ['users'],
      });
    } catch (error: any) {
      showSwal('error', error?.response?.data?.msg || 'Failed to unassign employee');
    }
  };

  const handleAssignTracking = async (row: any) => {
    const res = await getLinkAccountTracking(row.id);
    setSelectedUser(row);

    const assigned = res?.collection?.has_data || [];
    const servers = res?.collection?.from_server || [];

    const available = servers.flatMap((server: any) =>
      server.accounts.map((acc: any) => ({
        ...acc,
        trackingSystemName: server.name,
        trackingSystemId: server.id,
      })),
    );

    const assignedFormatted = assigned.map((item: any) => ({
      ...item,
    }));

    setAvailableAccounts(available);
    setAssignedAccounts(assignedFormatted);

    setOpenAssignDialog(true);
  };

  const handleAssignParking = async (row: any) => {
    const res = await getLinkAccountParking(row.id);
    setSelectedUser(row);

    const assigned = res?.collection?.has_data || [];
    const servers = res?.collection?.from_server || [];

    const available = servers.flatMap((server: any) =>
      server.accounts.map((acc: any) => ({
        ...acc,
        parkingSystemName: server.name,
        parkingSystemId: server.id,
      })),
    );

    const assignedFormatted = assigned.map((item: any) => ({
      ...item,
    }));

    setAvailableAccounts(available);
    setAssignedAccounts(assignedFormatted);

    setOpenAssignDialog(true);
  };

  const handleSubmitTracking = async () => {
    try {
      const payload = {
        link_type: 'TrackingBle',
        assign_datas: assignedAccounts.map((item) => ({
          tracking_ble_account_id: item.tracking_ble_account_id,
          tracking_ble_username: item.tracking_ble_username,
          tracking_ble_integration_id: item.tracking_ble_integration_id,
        })),
        unassign_datas: availableAccounts.map((item) => ({
          tracking_ble_account_id: item.id,
          tracking_ble_username: item.username,
          tracking_ble_integration_id: item.trackingSystemId,
        })),
      };

      const res = await createLinkAccountParking(selectedUser.id, payload);

      showSwal('success', 'Tracking assigned successfully');

      setOpenAssignDialog(false);

      queryClient.invalidateQueries({
        queryKey: ['users'],
      });
    } catch (error: any) {
      showSwal(
        'error',
        error?.response?.data?.collection?.[0]?.message ||
          error?.response?.data?.msg ||
          'Failed to assign tracking',
      );
    }
  };

  const handleSubmitParking = async () => {
    try {
      const payload = {
        link_type: 'Parking',
        assign_datas: assignedAccounts.map((item) => ({
          parking_account_id: item.parking_account_id,
          parking_username: item.parking_username,
          parking_integration_id: item.parking_integration_id,
        })),
        unassign_datas: availableAccounts.map((item) => ({
          parking_account_id: item.id,
          parking_username: item.username,
          parking_integration_id: item.parkingSystemId,
        })),
      };

      const res = await createLinkAccountTracking(selectedUser.id, payload);

      showSwal('success', 'Successfully assigned parking');

      setOpenAssignParkingDialog(false);

      queryClient.invalidateQueries({
        queryKey: ['users'],
      });
    } catch (error: any) {
      showSwal(
        'error',
        error?.response?.data?.collection?.[0]?.message ||
          error?.response?.data?.msg ||
          'Failed to assign parking',
      );
    }
  };

  const moveToAssigned = () => {
    if (!selectedAvailable) return;

    const id = selectedAvailable.id;

    const alreadyAssigned = assignedAccounts.some((x) => x.tracking_ble_account_id === id);

    if (alreadyAssigned) {
      showSwal('warning', 'Account already assigned');
      return;
    }

    const payloadItem = {
      tracking_ble_account_id: selectedAvailable.id,
      tracking_ble_username: selectedAvailable.username,
      tracking_ble_integration_id: selectedAvailable.trackingSystemId,
    };

    setAssignedAccounts((prev) => [...prev, payloadItem]);

    setAvailableAccounts((prev) => prev.filter((x) => x.id !== id));

    setSelectedAvailable(null);
    setSelectedAssigned(null);
  };

  useEffect(() => {
    const assignedIds = assignedAccounts.map((x) => x.tracking_ble_account_id);

    const availableIds = availableAccounts.map((x) => x.id);

    if (selectedAvailable && !availableIds.includes(selectedAvailable.id)) {
      setSelectedAvailable(null);
    }

    if (selectedAssigned && !assignedIds.includes(selectedAssigned.tracking_ble_account_id)) {
      setSelectedAssigned(null);
    }
  }, [availableAccounts, assignedAccounts]);

  const moveToUnassigned = () => {
    if (!selectedAssigned) return;

    const id = selectedAssigned.tracking_ble_account_id;

    const alreadyExists = availableAccounts.some((x) => x.id === id);

    if (alreadyExists) {
      showSwal('warning', 'Account already exists in available list');
      return;
    }

    setAvailableAccounts((prev) => [
      ...prev,
      {
        id: selectedAssigned.tracking_ble_account_id,
        username: selectedAssigned.tracking_ble_username,
        trackingSystemId: selectedAssigned.tracking_ble_integration_id,
      },
    ]);

    setAssignedAccounts((prev) => prev.filter((x) => x.tracking_ble_account_id !== id));

    setSelectedAssigned(null);
    setSelectedAvailable(null);
  };

  const handleBatchDelete = async (rows: Item[]) => {
    if (!rows.length) return false;

    const confirmed = await showConfirmDelete(
      t('confirmDeleteMultiple', {
        count: rows.length,
        name: 'User',
      }),
    );

    if (!confirmed) return false;

    try {
      for (const row of rows) {
        await deleteUser.mutateAsync(row.id);
      }
      setSelectedRows([]);

      showSwal(
        'success',
        t('deleteSuccessMultiple', {
          count: rows.length,
          name: 'user',
        }),
      );

      return true;
    } catch (error: any) {
      showSwal('error', error?.response?.data?.msg ?? 'Failed to delete some items.');
      return false;
    }
  };

  const { data: userRoleData } = useUserRole();

  const roleItems = useMemo(() => {
    const roles = userRoleData?.collection?.roles ?? {};

    return [
      { name: 'All' },
      ...Object.entries(roles).map(([role, items]) => ({
        name: role === 'OperatorVMS' ? 'Operator VMS' : role,
        children: items as { id: string; name: string }[],
      })),
    ];
  }, [userRoleData]);

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="User" description="User page">
        <Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>

            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={isLoadingPagination}
                overflowX="auto"
                data={filteredData}
                isHavePagination={true}
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
                searchPlaceholder="Search User"
                searchKeyword={search}
                isHaveAssign={false}
                totalCount={totalRecords}
                isHaveUnAssign={true}
                isHaveAssignTracking={true}
                isHaveAssignParking={true}
                onAssignTracking={handleAssignTracking}
                onAssignParking={handleAssignParking}
                onAssign={handleAssign}
                defaultRowsPerPage={25}
                rowsPerPageOptions={[25, 50, 100]}
                currentPage={page}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                onUnAssign={handleUnassign}
                onSearch={handleSearch}
                onCheckedChange={(selected) => setSelectedRows(selected)}
                onEdit={(row) => handleEdit(row.id)}
                onDelete={(row) => handleDelete(row.id)}
                isHaveRole={true}
                onBatchDelete={handleBatchDelete}
                onAddData={handleAdd}
                isHaveAddEmpty={true}
                addDataText="Add User"
                isHaveHeader={false}
                defaultSelectedHeaderItem="All"
                headerContent={{
                  title: '',
                  subTitle: 'Role',
                  items: roleItems,
                }}
                onHeaderItemClick={(item) => {
                  setSelectedGroupId(item.name === 'All' ? undefined : item.id);
                  setPage(0);
                }}
                onAddEmpty={handleAdd}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>

      <DialogFormUser
        open={openFormAddDocument}
        onClose={() => {
          setOpenFormAddDocument(false);
        }}
        edittingId={edittingId}
        onSuccess={() => {
          setOpenFormAddDocument(false);
        }}
        organizationRes={organizations}
      />

      <EmployeeAssignDialog
        open={openEmployeeAssign}
        onClose={() => setOpenEmployeeAssign(false)}
        onSubmit={handleSubmitAssign}
        employee={employee}
        selectedEmployeeId={selectedEmployeeId}
        setSelectedEmployeeId={setSelectedEmployeeId}
      />
      <AssignTrackingDialog
        open={openAssignDialog}
        onClose={() => setOpenAssignDialog(false)}
        onSubmit={handleSubmitTracking}
        availableAccounts={availableAccounts}
        assignedAccounts={assignedAccounts}
        selectedAvailable={selectedAvailable}
        selectedAssigned={selectedAssigned}
        setSelectedAvailable={setSelectedAvailable}
        setSelectedAssigned={setSelectedAssigned}
        moveToAssigned={moveToAssigned}
        moveToUnassigned={moveToUnassigned}
      />

      <AssignParkingDialog
        open={openAssignParkingDialog}
        onClose={() => setOpenAssignParkingDialog(false)}
        onSubmit={handleSubmitParking}
        availableAccounts={availableAccounts}
        assignedAccounts={assignedAccounts}
        selectedAvailable={selectedAvailable}
        selectedAssigned={selectedAssigned}
        setSelectedAvailable={setSelectedAvailable}
        setSelectedAssigned={setSelectedAssigned}
        moveToAssigned={moveToAssigned}
        moveToUnassigned={moveToUnassigned}
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
