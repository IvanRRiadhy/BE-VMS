import { useMemo } from 'react';

export const usePermission = (data: any) => {
  type ScopeKey =
    | 'manage_visitors'
    | 'manage_sites'
    | 'manage_accesss'
    | 'organization_assignments'
    | 'site_assignments'
    | 'visitor_type_assignments'
    | 'manage_visitor_types'
    | 'manage_registersites';

  const permissionMap = useMemo(() => {
    const permissions = new Set(data?.permissions?.map((p: any) => p.permission));

    const scopes = {
      manage_visitors: new Set(data?.scopes?.manage_visitors?.map((p: any) => p.permission)),
      manage_sites: new Set(data?.scopes?.manage_sites?.map((p: any) => p.permission)),
      manage_accesss: new Set(data?.scopes?.manage_accesss?.map((p: any) => p.permission)),
      organization_assignments: new Set(
        data?.scopes?.organization_assignments?.map((p: any) => p.permission),
      ),
      site_assignments: new Set(data?.scopes?.site_assignments?.map((p: any) => p.permission)),
      visitor_type_assignments: new Set(
        data?.scopes?.visitor_type_assignments?.map((p: any) => p.permission),
      ),
      manage_visitor_types: new Set(
        data?.scopes?.manage_visitor_types?.map((p: any) => p.permission),
      ),
      manage_registersites: new Set(
        data?.scopes?.manage_registersites?.map((p: any) => p.permission),
      ),
    };

    return { permissions, scopes };
  }, [data]);

  const hasPermission = (permission: string) => {
    return permissionMap.permissions.has(permission);
  };

  const hasScope = (scope: ScopeKey, permission: string) => {
    return permissionMap.scopes[scope]?.has(permission);
  };

  const organizationSet = new Set(
    data?.scopes?.organization_assignments?.map((o: any) => o.organization_id),
  );

  const hasOrganization = (organizationId: string) => {
    return organizationSet.has(organizationId);
  };

  const siteMap = new Map(data?.scopes?.manage_sites?.map((s: any) => [s.site_id, s]));

  //   const getSitePermission = (siteId: string) => {
  //     return siteMap.get(siteId);
  //   };

  const hasSite = (siteId: string) => {
    return siteMap.has(siteId);
  };

  const canGrantSite = (siteId: string) => {
    return (siteMap.get(siteId) as { can_grant: boolean })?.can_grant;
  };

  const canRevokeSite = (siteId: string) => {
    return (siteMap.get(siteId) as { can_revoke: boolean })?.can_revoke;
  };

  const canBlockSite = (siteId: string) => {
    return (siteMap.get(siteId) as { can_block: boolean })?.can_block;
  };

  const visitorTypeMap = new Map(
    data?.scopes?.manage_visitor_types?.map((v: any) => [v.visitor_type_id, v]),
  );

  const hasManageVisitorType = (visitorTypeId: string) => {
    return visitorTypeMap.has(visitorTypeId);
  };
  const accessMap = new Map(
    data?.scopes?.manage_accesss?.map((a: any) => [a.access_control_id, a]),
  );

  const hasAccess = (accessId: string) => {
    return accessMap.has(accessId);
  };

  const canGrantAccess = (accessId: string) => {
    return accessMap.get(accessId) as { can_grant: boolean };
  };

  const canRevokeAccess = (accessId: string) => {
    return accessMap.get(accessId) as { can_revoke: boolean };
  };

  const canBlockAccess = (accessId: string) => {
    return accessMap.get(accessId) as { can_block: boolean };
  };

  const registerSiteSet = new Set(data?.scopes?.manage_registersites?.map((s: any) => s.site_id));

  const canRegisterSite = (siteId: string) => {
    return registerSiteSet.has(siteId);
  };

  return {
    // Operator
    canAllowSSOActiveDirectory: hasPermission('AllowSSOActiveDirectory'),
    canManageInvite: hasPermission('ManageInvite'),
    canManageOrganizationAssignment: hasPermission('OrganizationAssignment'),
    canOperatorAsWatcher: hasPermission('OperatorAsWatcher'),
    canOperatorRegisterSite: hasPermission('OperatorRegisterSite'),
    canManageAccess: hasPermission('ManageAccessScope'),
    canManageVisitor: hasPermission('ManageVisitor'),
    canBlacklist: hasPermission('ManageBlacklist'),
    canManageVisitorTypeAssignment: hasPermission('ManageVisitorTypeScope'),
    canAsHead: hasPermission('AsHead'),
    canAllowMobileLogin: hasPermission('AllowMobileLogin'),
    canManageSiteScope: hasPermission('ManageSiteScope'),

    // Employee
    canManageVisitorType: hasPermission('ManageVisitorType'),
    canManageRegisterSite: hasPermission('ManageRegisterSite'),
    canManageSiteAssignment: hasPermission('ManageSiteAssignment'),

    // Scope
    canCheckin: hasScope('manage_visitors', 'OperatorVisitorCheckIn'),
    canExtend: hasScope('manage_visitors', 'OperatorVisitorExtend'),
    canSendNotificationArrival: hasScope(
      'manage_visitors',
      'OperatorVisitorSendNotificationArrival',
    ),
    canCardIssuance: hasScope('manage_visitors', 'OperatorVisitorCardIssuance'),
    canVisitorTriggerOpen: hasScope('manage_visitors', 'OperatorVisitorTriggerOpen'),
    canBlock: hasScope('manage_visitors', 'OperatorVisitorBlock'),
    canParking: hasScope('manage_visitors', 'OperatorVisitorParkingIssuance'),
    canWalkIn: hasScope('manage_visitors', 'OperatorVisitorWalkIn'),
    canCheckout: hasScope('manage_visitors', 'OperatorVisitorCheckout'),
    canVisitorPreregister: hasScope('manage_visitors', 'OperatorVisitorPreregister'),

    // Organization Assignment
    hasOrganization,

    // Site
    hasSite,
    canGrantSite,
    canRevokeSite,
    canBlockSite,
    // Visitor Type
    hasManageVisitorType,

    // Access Scope
    hasAccess,
    canGrantAccess,
    canRevokeAccess,
    canBlockAccess,
    // Register Sites
    canRegisterSite,
  };
};
