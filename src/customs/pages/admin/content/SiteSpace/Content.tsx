import { useCallback, useEffect, useMemo, useState } from 'react';
import { Backdrop, Box, CircularProgress, Grid2 as Grid } from '@mui/material';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';

import { useRef } from 'react';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { CreateSiteRequestSchema, Item } from 'src/customs/api/models/Admin/Sites';
import {
  deleteSiteSpace,
  getAllEmployee,
  getAllSite,
  getAllSitePagination,
  getSiteById,
} from 'src/customs/api/admin';
import { IconSitemap } from '@tabler/icons-react';
import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import FilterMoreContent from './FilterMoreContent';
import { useNavigate, useParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import SelectSiteTypeDialog from './components/Dialog/SelectSiteTypeDialog';
import ConfirmUnsavedDialog from 'src/customs/pages/admin/components/ConfirmUnsavedDialog';
import { useEmployees } from 'src/hooks/Employee/useEmployees';
import DialogSiteSpace from './components/Dialog/DialogSiteSpace';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import { useTranslation } from 'react-i18next';
import { useSitePagination } from 'src/hooks/Sites/useSitesPagination';
import { useSiteMutation } from 'src/hooks/Sites/useSiteMutation';

type SiteTableRow = {
  id: string;
  // parent: string | null;
  name: string;
  type: number;
  description: string | null;
  image: string | null;
};

type EnableField = {
  type: boolean;
  approval_workflow_id: boolean;
  timezone: boolean;
  signout_time: boolean;
  need_approval: boolean;
  can_visited: boolean;
  can_signout: boolean;
  auto_signout: boolean;
  can_contactless_login: boolean;
  need_document: boolean;
  is_registered_point: boolean;
};

const Content = () => {
  // const [tableData, setTableData] = useState<Item[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const [edittingId, setEdittingId] = useState('');
  const dialogRef = useRef<HTMLDivElement | null>(null);
  // const [searchKeyword, setSearchKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortDir, setSortDir] = useState<string>('desc');
  const queryClient = useQueryClient();
  const [openFormCreateSiteSpace, setOpenFormCreateSiteSpace] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [isBatchEdit, setIsBatchEdit] = useState(false);
  const [openDetailType, setOpenDetailType] = useState(false);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const navigate = useNavigate();
  const [breadcrumbItems, setBreadcrumbItems] = useState<{ id: string; name: string }[]>([]);
  const [appliedType, setAppliedType] = useState<number>(-1);
  const { '*': wildcard } = useParams();
  const { t } = useTranslation();

  const handleCloseDetailType = () => {
    setSelectedType(null);
    setOpenDetailType(false);
  };

  const [currentId, setCurrentId] = useState<string | null>(null);

  const typeOptions = [
    { label: 'Site', value: 0 },
    { label: 'Building', value: 1 },
    { label: 'Floor', value: 2 },
    { label: 'Room', value: 3 },
  ];

  const [allowedTypes, setAllowedTypes] = useState(typeOptions);
  const [id, setId] = useState<string | undefined>(undefined);

  const typeHierarchy: Record<number, number[]> = {
    0: [1, 2, 3], // Site → Building, Floor, Room
    1: [2, 3], // Building → Floor, Room
    2: [3], // Floor → Room
    3: [], // Room →
  };

  const [allData, setAllData] = useState<any[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllSite();
      setAllData(res.collection);
    };
    fetchData();
  }, []);

  useEffect(() => {
    // if (!allData) return;
    if (!allData || allData.length === 0) return;

    const lastParentId = wildcard ? wildcard.split('/').slice(-1)[0] : id;

    if (!lastParentId) {
      setAllowedTypes(typeOptions);
      return;
    }

    const parentItem = allData.find((item) => item.id === lastParentId);

    if (!parentItem) {
      setAllowedTypes(typeOptions);
      return;
    }

    const parentType = parentItem.type;
    const allowedChildTypes = typeHierarchy[parentType] || [];

    const filtered = typeOptions.filter(
      (opt) => allowedChildTypes.includes(opt.value) && opt.value !== parentType,
    );

    setAllowedTypes(filtered);
  }, [id, wildcard, allData]);
  const { employee } = useEmployees();
  const [initialFormSnapshot, setInitialFormSnapshot] = useState<Item | null>(null);
  const [formDataAddSite, setFormDataAddSite] = useState<any>(CreateSiteRequestSchema.parse({}));
  const [isDirty, setIsDirty] = useState(false);

  const getHierarchyParams = (wildcard?: string) => {
    if (!wildcard) {
      return {
        parent: undefined,
        is_child: false,
      };
    }

    const lastParentId = wildcard.split('/').slice(-1)[0];

    return {
      parent: lastParentId,
      is_child: true,
    };
  };

  const { parent, is_child } = getHierarchyParams(wildcard);

  const {
    data: sitePagination,
    isLoading,
    isFetching,
    refetch,
  } = useSitePagination({
    page,
    rowsPerPage,
    sortDir,
    searchKeyword: search,
    type: appliedType !== -1 ? appliedType : undefined,
    parent,
    isChild: is_child,
  });

  const totalRecords = sitePagination?.RecordsTotal ?? 0;
  const totalFilteredRecords = sitePagination?.RecordsFiltered ?? 0;

  const cards = [
    {
      title: `Total ${t('navigation.site_space')}`,
      subTitle: `${totalFilteredRecords}`,
      icon: IconSitemap,
      subTitleSetting: 10,
      color: 'none',
    },
  ];

  const { remove, updateActive } = useSiteMutation();

  const [filters, setFilters] = useState<any>({
    type: -1,
  });

  const tableRowSite = useMemo(() => {
    return (
      sitePagination?.collection?.map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        description: item.description || '',
        image: item.image || '',
        active: item.is_active,
      })) ?? []
    );
  }, [sitePagination]);

  useEffect(() => {
    if (!allData?.length) {
      setBreadcrumbItems([{ id: '', name: 'Home' }]);
      return;
    }

    if (!wildcard) {
      setBreadcrumbItems([{ id: '', name: 'Home' }]);
      return;
    }

    const ids = wildcard.split('/');

    const chain = ids
      .map((id) => allData.find((item) => item.id === id))
      .filter(Boolean)
      .map((item) => ({
        id: item.id,
        name: item.name,
      }));

    setBreadcrumbItems([{ id: '', name: 'Home' }, ...chain]);
  }, [wildcard, allData]);

  const handleOpenDialog = () => {
    setOpenFormCreateSiteSpace(true);
  };

  const handleCloseModalCreateSiteSpace = () => {
    setOpenFormCreateSiteSpace(false);
    setIsBatchEdit(false);
    setInitialFormSnapshot(null);
    setEdittingId('');
  };

  const handleAdd = (type?: number) => {
    handleCloseDetailType();

    const empty = {
      ...CreateSiteRequestSchema.parse({}),
      id: '',
      access: [],
      parking: [],
      tracking: [],
      parent: null,
      type: type ?? 0,
    };

    setFormDataAddSite(empty);
    setInitialFormSnapshot(empty);
    setEdittingId('');
    setPendingEditId(null);
    setIsDirty(false);

    setOpenFormCreateSiteSpace(true);
  };

  const siteTypeMap: Record<string, number> = {
    Site: 0,
    Building: 1,
    Floor: 2,
    Room: 3,
  };

  const handleEdit = async (id: string) => {
    const safeNumber = (val: any, fallback = 0) => {
      const n = Number(val);
      return Number.isFinite(n) ? n : fallback;
    };

    try {
      const res = await getSiteById(id);
      const found = res?.collection ?? null;

      if (!found) return;

      const toLocalTime = (utcTime?: string | null) => {
        if (!utcTime) return '';

        const [hours = 0, minutes = 0, seconds = 0] = utcTime.split(':').map((v) => Number(v));

        const utcDate = new Date(Date.UTC(1970, 0, 1, hours, minutes, seconds));

        return utcDate.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      };

      const normalized = {
        ...found,
        // type: safeNumber(found.type),
        type: typeof found.type === 'string' ? (siteTypeMap[found.type] ?? 0) : Number(found.type),
        approval_workflow_id:
          found.approval_workflow_id !== null && found.approval_workflow_id !== undefined
            ? String(found.approval_workflow_id)
            : null,
        open_time: toLocalTime(found.open_time),
        close_time: toLocalTime(found.close_time),
      };

      const parsed = CreateSiteRequestSchema.parse(normalized);

      const parsedData = {
        ...parsed,
        id,
        access: [],
        parking: [],
        tracking: [],
        parent: parsed.parent || null,
        is_child: parsed.is_child || false,
        host: parsed.host || null,
        signout_time: parsed.signout_time || null,
        approval_workflow_id: parsed.approval_workflow_id || null,
      };

      setEdittingId(id);
      setFormDataAddSite(parsedData);
      setInitialFormSnapshot(parsedData);
      setPendingEditId(null);
      setIsDirty(false);
      setOpenFormCreateSiteSpace(true);
    } catch (error) {
      console.error('Error fetching/parsing data:', error);
    }
  };
  const handleConfirmEdit = () => {
    setConfirmDialogOpen(false);

    const empty = {
      ...CreateSiteRequestSchema.parse({}),
      id: '',
      access: [],
      parking: [],
      tracking: [],
    };

    setFormDataAddSite(empty);
    setInitialFormSnapshot(null);
    setEdittingId('');
    setPendingEditId(null);

    handleCloseModalCreateSiteSpace();
  };

  const handleCancelEdit = () => {
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  const handleDelete = async (id: string) => {


    const confirm = await showConfirmDelete('Are you sure you want to delete this site space?');

    if (!confirm) return;

    if (confirm) {
      try {
        await remove.mutateAsync({
          id,
        });

        showSwal('success', 'Successfully deleted site space!');
      } catch (error: any) {
        showSwal('error', error.response?.data?.msg || 'Failed to delete site space.');
      }
    }
  };

  const handleBatchDelete = async (rows: SiteTableRow[]) => {
    if (rows.length === 0) return false;

    const confirmed = await showConfirmDelete(`Are you sure to delete ${rows.length} items?`);
    if (!confirmed) return false;

    try {
      await Promise.all(rows.map((row) => remove.mutateAsync({ id: row.id })));

      setSelectedRows([]);
      showSwal('success', `${rows.length} site space have been deleted.`);
      return true;
    } catch (error) {
      showSwal('error', 'Failed to delete some items.');

      return false;
    }
  };

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.relatedTarget as Node)) {
        if (isDirty) {
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
  }, [isDirty]);

  const [enabledFields, setEnabledFields] = useState<EnableField>({
    type: false,
    approval_workflow_id: false,
    timezone: false,
    signout_time: false,
    need_approval: false,
    can_visited: false,
    can_signout: false,
    auto_signout: false,
    can_contactless_login: false,
    need_document: false,
    is_registered_point: false,
  });

  const handleBatchEdit = (rows: any[]) => {
    const selectedId = rows[0]?.id;
    setEdittingId(selectedId);
    setIsBatchEdit(true);
    handleOpenDialog();
  };

  const handleApplyFilter = () => {
    setPage(0);
    setAppliedType(filters.type);
  };

  const handleOpenType = () => {
    setOpenDetailType(true);
  };

  const handleSearchKeywordChange = useCallback((keyword: string) => {
    setSearchInput(keyword);
  }, []);

  const handleSearch = useCallback(
    (keyword: string) => {
      setPage(0);
      setSearch(keyword);
    },
    [setPage, setSearch],
  );

  const handleSuccess = () => {
    setSelectedRows([]);
    handleCloseModalCreateSiteSpace();

    queryClient.invalidateQueries({
      queryKey: ['registeredSites'],
    });
    setIsDirty(false);
  };

  const [loadingBackdrop, setLoadingBackdrop] = useState(false);

  const handleActiveToggle = async (row: any, checked: boolean) => {
    try {
      setLoadingBackdrop(true);;
      await updateActive.mutateAsync({
        id: row.id,
        active: checked,
      });

      showSwal('success', 'Site space successfully updated');
    } catch (error: any) {
      showSwal('error', error?.response?.data?.message || 'Failed to update status active');
    } finally {
      setLoadingBackdrop(false);
    }
  };

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Site Space" description="Site space">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={isLoading || isFetching}
                isHavePagination={true}
                totalCount={totalFilteredRecords}
                defaultRowsPerPage={rowsPerPage}
                isHaveImage={true}
                rowsPerPageOptions={[10, 50, 100]}
                currentPage={page}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                isSiteSpaceName={true}
                titleHeader="Site"
                isHaveIntegration={true}
                onNameClick={(row) => {
                  const currentPath = wildcard ? wildcard.split('/') : [];
                  const newPath = [...currentPath, row.id].join('/');
                  navigate(`/admin/manage/site-space/${newPath}`);
                }}
                setCurrentId={(id: any) => setCurrentId(id)}
                isHaveActive={true}
                onActiveToggle={handleActiveToggle}
                overflowX={'auto'}
                data={tableRowSite}
                breadcrumbItems={breadcrumbItems}
                selectedRows={selectedRows}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveSearch={true}
                isHaveFilter={false}
                isHaveExportPdf={false}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                isHaveAddData={true}
                isHaveHeader={false}
                isSiteSpaceType={true}
                onCheckedChange={(selected) => {
                  const fullSelectedItems = tableRowSite.filter((item: any) =>
                    selected.some((row: SiteTableRow) => row.id === item.id),
                  );
                  setSelectedRows(fullSelectedItems);
                }}
                onEdit={(row) => {
                  handleEdit(row.id);
                  setEdittingId(row.id);
                }}
                isHaveFilterMore={true}
                filterMoreContent={
                  <FilterMoreContent
                    filters={filters}
                    setFilters={setFilters}
                    onApplyFilter={handleApplyFilter}
                  />
                }
                onBatchEdit={handleBatchEdit}
                onDelete={(row) => handleDelete(row.id)}
                onBatchDelete={handleBatchDelete}
                onSearchKeywordChange={handleSearchKeywordChange}
                searchKeyword={searchInput}
                onSearch={handleSearch}
                // onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                onAddData={handleOpenType}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>

      <DialogSiteSpace
        open={openFormCreateSiteSpace}
        editingId={edittingId}
        isBatchEdit={isBatchEdit}
        selectedRows={selectedRows}
        enabledFields={enabledFields}
        employee={employee}
        formData={formDataAddSite}
        setFormData={setFormDataAddSite}
        setEnabledFields={setEnabledFields}
        onSuccess={handleSuccess}
        onClose={handleCloseModalCreateSiteSpace}
        onConfirmClose={() => setConfirmDialogOpen(true)}
        isDirty={isDirty}
        setIsDirty={setIsDirty}
      />

      <SelectSiteTypeDialog
        open={openDetailType}
        onClose={handleCloseDetailType}
        options={allowedTypes}
        value={selectedType}
        onChange={setSelectedType}
        onNext={(val) => handleAdd(val)}
        showError={showSwal}
      />

      <ConfirmUnsavedDialog
        open={confirmDialogOpen}
        onClose={handleCancelEdit}
        onDiscard={handleConfirmEdit}
      />
      <Backdrop open={loadingBackdrop} sx={{ zIndex: (theme) => theme.zIndex.drawer + 999999 }}>
        <CircularProgress color="primary" />
      </Backdrop>
    </PageContainer>
  );
};

export default Content;
