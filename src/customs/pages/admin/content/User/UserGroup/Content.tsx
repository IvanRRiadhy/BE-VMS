import React, { useCallback, useEffect, useState } from 'react';
import { Backdrop, Box, CircularProgress, Grid2 as Grid, Portal } from '@mui/material';
import Container from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { IconUsers } from '@tabler/icons-react';
import { useSession } from 'src/customs/contexts/SessionContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPermission,
  createPermissionManageVisitor,
  createPermissionOrganization,
  createPermissionRegisterSite,
  createPermissionSite,
  deletePermission,
  deletePermissionManageVisitor,
  deletePermissionOrganization,
  deletePermissionRegisterSite,
  deletePermissionSite,
  deleteUserGroup,
  getAllPermission,
  getAllPermissionManageVisitor,
  getAllPermissionOrganization,
  getAllPermissionRegisterSite,
  getAllPermissionSite,
  getAllSite,
  getUserGroupById,
  getUserGroupDt,
} from 'src/customs/api/admin';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import { CreateUserSchema, Item } from 'src/customs/api/models/Admin/User';
import PageContainer from 'src/customs/components/container/PageContainer';
import { useNavigate } from 'react-router';
import DialogFormUserGroup from '../components/DialogFormUserGroup';
import DialogPermissionUserGroup from '../components/DialogPermissionUserGroup';
import {
  createPermissionAccessControl,
  createPermissionVisitorType,
  deletePermissionAccessControl,
  deletePermissionVisitorType,
  getAllPermissionAccessControl,
  getAllPermissionVisitorType,
} from 'src/customs/api/UserGroup';
import ConfirmUnsavedDialog from '../../../components/ConfirmUnsavedDialog';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import useDropPoint from 'src/hooks/useDropPoint';
import { useOrganization } from 'src/hooks/Organization/useOrganization';
import { useAccessControl } from 'src/hooks/useAccessControl';
import { useVisitorType } from 'src/hooks/useVisitorType';
import { useRegisteredSite } from 'src/hooks/useRegisteredSite';

const Content = () => {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [edittingId, setEdittingId] = useState('');
  const [openFormAddDocument, setOpenFormAddDocument] = useState(false);
  const [formAddUser, setFormAddUser] = useState<any>({});
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [siteOptions, setSiteOptions] = useState<any[]>([]);
  const { dropPoint } = useDropPoint();
  const [permissionSites, setPermissionSites] = useState<Record<string, string[]>>({});
  const [selectedRoleAccess, setSelectedRoleAccess] = useState<string>('');
  const [openPermission, setOpenPermission] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);
  const [sortDir, setSortDir] = useState('desc');
  const { page, search, setPage, setSearch } = useTableQueryParams();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['users-group', page, rowsPerPage, sortDir, search],
    queryFn: async () => {
      const start = page * rowsPerPage;
      const response = await getUserGroupDt(start, rowsPerPage, search, sortDir);

      const filteredData = response.collection.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        homepage: item.homepage,
        level_priority: item.level_priority,
        role_access: item.role_access,
      }));

      return {
        collection: filteredData,
        tableCollection: filteredData,
        totalRecords: response.recordsTotal,
        totalFiltered: response.RecordsFiltered,
      };
    },
  });

  const collection = data?.collection || [];
  const totalRecords = data?.collection.length || 0;

  const cards = [
    {
      title: 'Total User Group',
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
      const response = await getUserGroupById(id);
      setFormAddUser({
        ...response.collection,
      });
      setEdittingId(id);
      setOpenFormAddDocument(true);
    } catch (error) {
      showSwal('error', 'Failed to load user group data');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirmDelete(`Are you sure to delete this user group?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      await deleteUserGroup(id);
      showSwal('success', 'Successfully deleted user group!');
      refetch();
    } catch (error) {
      showSwal('error', 'Failed to delete user group.');
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const siteRes = await getAllSite();

      setSiteOptions(
        (siteRes.collection ?? []).map((site: any) => ({
          ...site,
          id: site.id.toLowerCase(),
        })),
      );
    };

    fetchData();
  }, []);

  const { organizations } = useOrganization();
  const { accessData } = useAccessControl();
  const { visitorType } = useVisitorType();
  const { data: registeredSite } = useRegisteredSite();

  const handlePermission = async (row: any) => {
    try {
      setEdittingId(row.id);
      setSelectedRoleAccess(row.role_access?.toLowerCase() ?? '');

      const results = await Promise.allSettled([
        getAllPermission(row.id),
        getAllPermissionOrganization(row.id),
        getAllPermissionRegisterSite(row.id),
        getAllPermissionManageVisitor(row.id),
        getAllPermissionSite(row.id),
        getAllPermissionVisitorType(row.id),
        getAllPermissionAccessControl(row.id),
      ]);

      const permissionCollection =
        results[0].status === 'fulfilled' ? (results[0].value.collection ?? []) : [];

      const organizationCollection =
        results[1].status === 'fulfilled' ? (results[1].value.collection ?? []) : [];

      const registeredSiteCollection =
        results[2].status === 'fulfilled' ? (results[2].value.collection ?? []) : [];

      const manageVisitorCollection =
        results[3].status === 'fulfilled' ? (results[3].value.collection ?? []) : [];

      const manageSiteCollection =
        results[4].status === 'fulfilled' ? (results[4].value.collection ?? []) : [];

      const visitorTypeCollection =
        results[5].status === 'fulfilled' ? (results[5].value.collection ?? []) : [];

      const accessControlCollection =
        results[6].status === 'fulfilled' ? (results[6].value.collection ?? []) : [];

      const permissions: string[] = [];
      const accesses: any[] = [];
      const organization: string[] = [];
      const registeredSite: string[] = [];
      const manageVisitor: string[] = [];
      const visitorType: any[] = [];
      const manageSite: any[] = [];
      const siteAssignment: any[] = [];

      manageVisitorCollection.forEach((item: any) => {
        if (item.permission) {
          manageVisitor.push(item.permission);
        }
      });

      registeredSiteCollection.forEach((item: any) => {
        if (item.site_id) {
          registeredSite.push(String(item.site_id).toUpperCase());
        }
      });

      if (registeredSite.length > 0) {
        permissions.push('OperatorRegisterSite');
      }

      manageSiteCollection.forEach((item: any) => {
        if (item.permission === 'ManageSiteScope') {
          manageSite.push(item.site_id?.toLowerCase());

          permissions.push('ManageSiteScope');
          return;
        }
        if (item.permission === 'SiteAssignment') {
          siteAssignment.push(item.site_id?.toLowerCase());

          permissions.push('SiteAssignment');
          return;
        }
      });

      accessControlCollection.forEach((item: any) => {
        if (item.permission === 'ManageAccessScope') {
          accesses.push({
            id: item.id,
            access_control_id: item.access_control_id,
            can_grant: item.can_grant,
            can_revoke: item.can_revoke,
            can_block: item.can_block,
          });

          permissions.push('ManageAccessScope');
          return;
        }
      });

      permissionCollection.forEach((item: any) => {
        if (item.permission) {
          permissions.push(item.permission);
        }
      });

      organizationCollection.forEach((item: any) => {
        if (item.organization_id) {
          organization.push(item.organization_id);
        }
      });

      if (organization.length > 0) {
        permissions.push('OrganizationAssignment');
      }
      visitorTypeCollection.forEach((item: any) => {
        if (item.visitor_type_id && item.permission) {
          visitorType.push(item.visitor_type_id);

          if (
            item.permission === 'ManageVisitorTypeScope' ||
            item.permission === 'VisitorTypeAssignment'
          ) {
            permissions.push(item.permission);
          }
        }
      });

      setFormData({
        group_id: row.id,
        permissions: [...new Set(permissions)],
        permission_sites: {},
        deleted_access_ids: [],
        accesses,
        organization,
        registeredSite,
        visitorType,
        manageSite,
        siteAssignment,
        dropPoint,
      });

      setPermissionSites((prev) => ({
        ...prev,
        ManageVisitor: manageVisitor,
      }));

      setOriginalData({
        permissions: [...new Set(permissions)],
        accesses,
        organization,
        registeredSite,
        manageVisitor,
        visitorType,
        manageSite,
      });

      setOpenPermission(true);
    } catch (error) {
      showSwal('error', 'Failed to load permission data.');
    }
  };

  const formatPermissionLabel = (value: string) => {
    const custom: Record<string, string> = {
      InviteWithinOwnOrganization: 'Invite Within Organization',
      InviteWithinOwnSite: 'Invite Within Site',
      InviteWithinAllowPreRegister: 'Invite Allow Pre Register',
    };

    if (custom[value]) return custom[value];

    return value
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleAddSiteAssignment = () => {
    setFormData((prev) => ({
      ...prev,
      accesses: [
        ...prev.accesses,
        {
          access_control_id: '',
          can_grant: false,
          can_revoke: false,
          can_block: false,
        },
      ],
    }));
  };

  const PERMISSION_NEED_SITE = [
    'OrganizationAssignment',
    'ManageOperator',
    'OperatorRegisterSite',
    'ManageAccessScope',
    'ManageVisitor',
    'ManageSiteScope',
    'VisitorTypeAssignment',
    'SiteAssignment',
    'ManageVisitorTypeScope',
    'DropPoint',
  ];

  const getDropdownOptions = (perm: string) => {
    switch (perm) {
      case 'ManageSiteScope':
        return siteOptions;
      case 'OrganizationAssignment':
        return organizations;
      case 'InviteWithinOwnSite':
        return siteOptions;
      case 'ManageAccessScope':
        return accessData;
      case 'OperatorRegisterSite':
        return registeredSite;
      case 'ManageVisitor':
        return MANAGE_VISITOR_PERMISSIONS;
      case 'ManageVisitorTypeScope':
        return visitorType;
      case 'VisitorTypeAssignment':
        return visitorType;
      case 'SiteAssignment':
        return siteOptions;
      default:
        return [];
    }
  };

  const GROUP_PERMISSION_MAP: Record<string, string[]> = {
    employee: [
      'AsHead',
      'InviteVistor',
      'InviteWithinAllowPreRegister',
      'InviteWithinOwnOrganization',
      'InviteWithinOwnSite',
      'AllowMobileLogin',
      'AllowSSOActiveDirectory',
      // 'External',
      // 'ManageTeam',
      'VisitorTypeAssignment',
      'OrganizationAssignment',
      'SiteAssignment',
    ],

    operatorvms: [
      'AsHead',
      'OperatorAsWatcher',
      'ManageInvite',
      'ManageBlacklist',
      'AllowMobileLogin',
      'AllowSSOActiveDirectory',
      'ManageVisitorTypeScope',
      'ManageAccessScope',
      'ManageSiteScope',
      'OperatorRegisterSite',
      'ManageVisitor',
      'OrganizationAssignment',
    ],

    manager: [
      'AsHead',
      'ManageApprove',
      'ManageSchedule',
      'AllowMobileLogin',
      'AllowSSOActiveDirectory',
    ],

    operatoradmin: [
      'AllowSSOLoginParking',
      'AllowSSOLoginTracking',
      'ManageSchedule',
      'AllowMobileLogin',
      'AllowSSOActiveDirectory',
      'ManageUser',
    ],
    visitor: ['AllowMobileLogin', 'OrganizationAssignment'],
  };
  const [formData, setFormData] = useState({
    group_id: '',
    permissions: [] as string[],
    permission_sites: {} as Record<string, string[]>,
    accesses: [] as {
      id?: string;
      access_control_id: string;
      can_grant: boolean;
      can_revoke: boolean;
      can_block: boolean;
    }[],
    organization: [] as string[],
    deleted_access_ids: [] as string[],
    registeredSite: [] as string[],
    manageSite: [] as any[],
    visitorType: [] as any[],
    siteAssignment: [] as any[],
    dropPoint: [] as any[],
  });

  const handleSubmitPermission = async () => {
    try {
      setLoading(true);

      await handleDeleteAll();

      if (formData.permissions.length > 0) {
        await handleSubmitPermissions(formData.permissions);
      }

      if (formData.permissions.includes('ManageAccessScope')) {
        await handleAccessScope();
      }

      if (
        formData.permissions.includes('OrganizationAssignment') ||
        formData.organization.length > 0
      ) {
        await handleOrganizationnPermission();
      }

      if (formData.permissions.includes('SiteAssignment')) {
        await handleSiteAssignment();
      }

      if (formData.permissions.includes('ManageSiteScope') || formData.manageSite.length > 0) {
        await handleManageSitePermission();
      }

      if (formData.permissions.includes('ManageVisitorTypeScope')) {
        await handleVisitorTypePermission('ManageVisitorTypeScope');
      }

      if (formData.permissions.includes('VisitorTypeAssignment')) {
        await handleVisitorTypePermission('VisitorTypeAssignment');
      }
      if (
        formData.permissions.includes('OperatorRegisterSite') ||
        formData.registeredSite.length > 0
      ) {
        await handleRegisteredSite();
      }

      if (
        formData.permissions.includes('ManageVisitor') ||
        (permissionSites['ManageVisitor'] ?? []).length > 0
      ) {
        await handleSubmitManageVisitor();
      }

      showSwal('success', 'Permissions updated successfully');

      setOpenPermission(false);
    } catch (error) {
      showSwal('error', 'Failed updating permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPermissions = async (permissions: string[]) => {
    try {
      const payload = permissions.map((perm: string) => ({
        user_group_id: edittingId,
        permission: perm,
      }));
      await createPermission(payload, edittingId);
    } catch (error: any) {
      showSwal('error', error.response?.data?.msg ?? 'Failed update permission');
    }
  };

  const MANAGE_VISITOR_PERMISSIONS = [
    { id: 'OperatorVisitorSendNotificationArrival', name: 'Send Notification Arrival' },
    { id: 'OperatorVisitorWalkIn', name: 'Walk In' },
    { id: 'OperatorVisitorPreregister', name: 'Pre Register' },
    { id: 'OperatorVisitorCheckIn', name: 'Check In' },
    { id: 'OperatorVisitorCheckout', name: 'Check Out' },
    { id: 'OperatorVisitorBlock', name: 'Block Visitor' },
    { id: 'OperatorVisitorExtend', name: 'Extend Visit' },
    { id: 'OperatorVisitorTriggerOpen', name: 'Trigger Open Gate' },
    { id: 'OperatorVisitorCardIssuance', name: 'Card Issuance' },
    { id: 'OperatorVisitorParkingIssuance', name: 'Parking Issuance' },
  ];

  const handleDeleteAll = async () => {
    if (!originalData) return;

    const promises: Promise<any>[] = [];

    // BASIC PERMISSION
    if (originalData.permissions?.length) {
      promises.push(deletePermission(edittingId));
    }

    if (originalData.manageSite?.length) {
      promises.push(deletePermissionSite(edittingId));
    }

    // ORGANIZATION
    if (originalData.organization?.length) {
      promises.push(deletePermissionOrganization(edittingId));
    }

    // REGISTERED SITE
    if (originalData.registeredSite?.length) {
      promises.push(deletePermissionRegisterSite(edittingId));
    }

    // MANAGE VISITOR
    if (originalData.manageVisitor?.length) {
      promises.push(deletePermissionManageVisitor(edittingId));
    }

    // MANAGE VISITOR TYPE
    if (originalData.visitorType?.length) {
      promises.push(deletePermissionVisitorType(edittingId));
    }

    await Promise.all(promises);
  };

  const handleSubmitManageVisitor = async () => {
    try {
      const selectedVisitorPermissions = permissionSites['ManageVisitor'] ?? [];

      if (!selectedVisitorPermissions.length) return;

      const payload = selectedVisitorPermissions.map((permId: string) => ({
        user_group_id: edittingId,
        permission: permId,
      }));

      await createPermissionManageVisitor(payload, edittingId);
    } catch (error: any) {
      showSwal('error', error.response?.data?.msg ?? 'Failed update permission');
    }
  };

  const handleManageSitePermission = async () => {
    try {
      if (!formData.manageSite.length) return;

      const payload = formData.manageSite.map((site) => ({
        user_group_id: edittingId,
        site_id: site,
        permission: 'ManageSiteScope',
      }));

      await createPermissionSite(payload, edittingId);
    } catch (error: any) {
      showSwal('error', error.response?.data?.msg ?? 'Failed update site permission');
    }
  };

  const handleSiteAssignment = async () => {
    try {
      if (!formData.siteAssignment.length) return;

      const payload = formData.siteAssignment.map((site) => ({
        user_group_id: edittingId,
        site_id: site,
        permission: 'SiteAssignment',
      }));

      await createPermissionSite(payload, edittingId);
    } catch (error: any) {
      showSwal('error', error.response?.data?.msg ?? 'Failed update site permission');
    }
  };

  const handleOrganizationnPermission = async () => {
    try {
      if (!formData.organization.length) return;

      const payload = formData.organization.map((orgId: string) => ({
        user_group_id: edittingId,
        organization_id: orgId,
        organization_type: 'Organization',
      }));

      await createPermissionOrganization(payload, edittingId);
    } catch (error: any) {
      showSwal('error', error.response?.data?.msg ?? 'Failed update organization');
    }
  };

  const handleRegisteredSite = async () => {
    try {
      if (!formData.registeredSite.length) {
        return;
      }

      const payload = formData.registeredSite.map((siteId: string) => ({
        user_group_id: edittingId,
        site_id: siteId,
        permission: 'OperatorRegisterSite',
      }));

      await createPermissionRegisterSite(payload, edittingId);
    } catch (error: any) {
      throw error;
    }
  };

  const handleVisitorTypePermission = async (permissionName: string) => {
    try {
      if (!formData.visitorType.length) return;

      const payload = formData.visitorType.map((visitorTypeId: string) => ({
        user_group_id: edittingId,
        visitor_type_id: visitorTypeId,
        permission: permissionName,
      }));

      await createPermissionVisitorType(payload, edittingId);
    } catch (error: any) {
      showSwal('error', error.response?.data?.msg ?? 'Failed update visitor type');
    }
  };

  const handleAccessScope = async () => {
    try {
      await deletePermissionAccessControl(edittingId);

      if (formData.accesses.length) {
        const payload = formData.accesses.map((access: any) => ({
          user_group_id: edittingId,
          access_control_id: access.access_control_id,
          can_grant: access.can_grant,
          can_revoke: access.can_revoke,
          can_block: access.can_block,
          permission: 'ManageAccessScope',
        }));

        await createPermissionAccessControl(payload, edittingId);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleClosePermission = () => {
    setOpenPermission(false);

    setFormData({
      group_id: '',
      permissions: [],
      permission_sites: {},
      accesses: [],
      organization: [],
      registeredSite: [],
      visitorType: [],
      manageSite: [],
      deleted_access_ids: [],
      siteAssignment: [],
      dropPoint: [],
    });

    setPermissionSites({});
  };

  const isPermissionDirty = () => {
    if (!originalData) return false;

    return (
      JSON.stringify(originalData.permissions ?? []) !==
        JSON.stringify(formData.permissions ?? []) ||
      JSON.stringify(originalData.organization ?? []) !==
        JSON.stringify(formData.organization ?? []) ||
      JSON.stringify(originalData.registeredSite ?? []) !==
        JSON.stringify(formData.registeredSite ?? []) ||
      JSON.stringify(originalData.manageVisitor ?? []) !==
        JSON.stringify(permissionSites['ManageVisitor'] ?? []) ||
      JSON.stringify(originalData.accesses ?? []) !== JSON.stringify(formData.accesses ?? []) ||
      JSON.stringify(originalData.manageSite ?? []) !== JSON.stringify(formData.manageSite ?? []) ||
      JSON.stringify(originalData.visitorType ?? []) !== JSON.stringify(formData.visitorType ?? [])
    );
  };

  const handleRequestClosePermission = () => {
    if (isPermissionDirty()) {
      setConfirmDialogOpen(true);
      return;
    }

    forceClosePermission();
  };

  const forceClosePermission = () => {
    setOpenPermission(false);

    setFormData({
      group_id: '',
      permissions: [],
      permission_sites: {},
      accesses: [],
      organization: [],
      registeredSite: [],
      visitorType: [],
      manageSite: [],
      deleted_access_ids: [],
      siteAssignment: [],
      dropPoint: [],
    });

    setPermissionSites({});
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
    forceClosePermission();
  };

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="User Group" description="User group management page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>

            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={isLoading}
                overflowX="auto"
                data={collection}
                isHavePagination
                selectedRows={selectedRows}
                isNoActionTableHead={true}
                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 50, 100]}
                onPaginationChange={(newPage, newRowsPerPage) => {
                  setPage(newPage);
                  setRowsPerPage(newRowsPerPage);
                }}
                isHaveChecked
                currentPage={page}
                isHaveAction={true}
                isOperatorSetting={true}
                onNavigatePage={() => {
                  navigate('/admin/settings');
                }}
                isHaveAddData={true}
                isHaveSearch={true}
                isHaveSettingOperator={true}
                searchKeyword={search}
                onSearch={handleSearch}
                // onSearchKeywordChange={handleSearchKeywordChange}
                onCheckedChange={(selected) => setSelectedRows(selected)}
                onEdit={(row) => handleEdit(row.id)}
                onDelete={(row) => handleDelete(row.id)}
                onAddData={handleAdd}
                isHavePermission={true}
                onPermission={(row) => handlePermission(row)}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>

      <DialogFormUserGroup
        open={openFormAddDocument}
        onClose={() => setOpenFormAddDocument(false)}
        edittingId={edittingId}
        onSuccess={() => {
          setOpenFormAddDocument(false);
          queryClient.invalidateQueries({ queryKey: ['users-group'] });
        }}
      />

      <DialogPermissionUserGroup
        open={openPermission}
        onClose={handleRequestClosePermission}
        onSubmit={handleSubmitPermission}
        selectedRoleAccess={selectedRoleAccess}
        groupPermissionMap={GROUP_PERMISSION_MAP}
        formData={formData}
        setFormData={setFormData}
        siteOptions={siteOptions}
        permissionSites={permissionSites}
        setPermissionSites={setPermissionSites}
        dropPoint={dropPoint}
        organizationSiteOptions={organizations}
        regsiteredSiteOptions={registeredSite ?? []}
        visitorTypeOptions={visitorType}
        permissionNeedSite={PERMISSION_NEED_SITE}
        getDropdownOptions={getDropdownOptions}
        formatPermissionLabel={formatPermissionLabel}
        handleAddSiteAssignment={handleAddSiteAssignment}
        accessOptions={accessData}
      />

      <ConfirmUnsavedDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onDiscard={handleDiscard}
      />

      <Portal>
        <Backdrop
          open={loading}
          sx={{
            color: '#fff',
            zIndex: 99999999,
          }}
        >
          <CircularProgress color="primary" />
        </Backdrop>
      </Portal>
    </PageContainer>
  );
};

export default Content;
