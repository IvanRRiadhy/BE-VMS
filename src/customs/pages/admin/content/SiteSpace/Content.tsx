import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Backdrop,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2 as Grid,
  IconButton,
} from '@mui/material';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';

import { useRef } from 'react';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import FormSite from './FormSite';
import CloseIcon from '@mui/icons-material/Close';
import { CreateSiteRequestSchema, Item } from 'src/customs/api/models/Admin/Sites';
import { useSession } from 'src/customs/contexts/SessionContext';
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
import { useEmployees } from 'src/hooks/useEmployees';
import { updateSiteActive } from 'src/customs/api/Admin/Site';
import DialogSiteSpace from './components/Dialog/DialogSiteSpace';
import { onMessageListener, requestForToken } from 'src/fcm';

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
  const [tableData, setTableData] = useState<Item[]>([]);
  const [allData, setAllData] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const { token } = useSession();
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [tableRowSite, setTableRowSite] = useState<SiteTableRow[]>([]);
  const [edittingId, setEdittingId] = useState('');
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortDir, setSortDir] = useState<string>('desc');
  const queryClient = useQueryClient();
  const [openFormCreateSiteSpace, setOpenFormCreateSiteSpace] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [shouldSaveToStorage, setShouldSaveToStorage] = useState(true);
  const [isBatchEdit, setIsBatchEdit] = useState(false);
  const [openDetailType, setOpenDetailType] = useState(false);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const navigate = useNavigate();
  const [breadcrumbItems, setBreadcrumbItems] = useState<{ id: string; name: string }[]>([]);
  const [appliedType, setAppliedType] = useState<number>(-1);
  const { '*': wildcard } = useParams();

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
  const { employee } = useEmployees(token);
  const [initialFormSnapshot, setInitialFormSnapshot] = useState<Item | null>(null);
  const [formDataAddSite, setFormDataAddSite] = useState<Item>(() => {
    const saved = localStorage.getItem('unsavedSiteForm');
    return saved ? JSON.parse(saved) : CreateSiteRequestSchema.parse({});
  });

  const cards = [
    {
      title: 'Total Site Space',
      subTitle: `${totalFilteredRecords}`,
      icon: IconSitemap,
      subTitleSetting: 10,
      color: 'none',
    },
  ];

  const isFormChanged = useMemo(() => {
    if (!openFormCreateSiteSpace || !initialFormSnapshot) return false;
    return JSON.stringify(formDataAddSite) !== JSON.stringify(initialFormSnapshot);
  }, [openFormCreateSiteSpace, formDataAddSite, initialFormSnapshot]);

  useEffect(() => {
    if (isFormChanged) {
      localStorage.setItem('unsavedSiteForm', JSON.stringify(formDataAddSite));
    } else {
      localStorage.removeItem('unsavedSiteForm');
    }
  }, [
    formDataAddSite,
    shouldSaveToStorage,
    openFormCreateSiteSpace,
    initialFormSnapshot,
    isFormChanged,
  ]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        openFormCreateSiteSpace &&
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        if (isFormChanged) {
          setConfirmDialogOpen(true);
        } else {
          handleCloseModalCreateSiteSpace();
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openFormCreateSiteSpace, isFormChanged]);
  useEffect(() => {
    if (!shouldSaveToStorage) return;

    const isDifferentFromDefault =
      JSON.stringify(formDataAddSite) !== JSON.stringify(CreateSiteRequestSchema.parse({}));

    if (isDifferentFromDefault) {
      localStorage.setItem('unsavedSiteForm', JSON.stringify(formDataAddSite));
    }
  }, [formDataAddSite, shouldSaveToStorage]);

  const [filters, setFilters] = useState<any>({
    type: -1,
  });

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

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const start = page * rowsPerPage;

        const { parent, is_child } = getHierarchyParams(wildcard);

        const response = await getAllSitePagination(
          token,
          start,
          rowsPerPage,
          sortDir,
          searchKeyword,
          appliedType !== -1 ? appliedType : undefined,
          parent,
          is_child,
        );
        const res = await getAllSite(token);
        // setAllData(res.collection);
        setAllData(
          res.collection.map((item: any) => ({
            ...item,
            type:
              item.type === 'Site'
                ? 0
                : item.type === 'Building'
                  ? 1
                  : item.type === 'Floor'
                    ? 2
                    : item.type === 'Room'
                      ? 3
                      : 0,
          })),
        );
        setTableData(response.collection);
        setTotalRecords(response.RecordsTotal);
        setTotalFilteredRecords(response.RecordsFiltered);

        const tableRows = response.collection.map((item: any) => ({
          id: item.id,
          name: item.name,
          type: item.type,
          description: item.description || '',
          image: item.image || '',
          active: item.is_active,
        }));

        setTableRowSite(tableRows);
      } catch (error) {
        setTableRowSite([]);
        setTableData([]);
        setTotalRecords(0);
        setTotalFilteredRecords(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, page, rowsPerPage, sortDir, refreshTrigger, searchKeyword, appliedType, wildcard]);

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
    localStorage.removeItem('unsavedSiteForm');
    setOpenFormCreateSiteSpace(false);
    setIsBatchEdit(false);
    setInitialFormSnapshot(null);
  };

  const handleAdd = (type?: number) => {
    handleCloseDetailType();
    const editing = localStorage.getItem('unsavedSiteForm');
    if (editing) {
      const parsed = JSON.parse(editing);
      if (!parsed.id) {
        if (type !== undefined) parsed.type = type;
        setFormDataAddSite(parsed);
        setInitialFormSnapshot(parsed);
        setEdittingId('');
        setOpenFormCreateSiteSpace(true);
        return;
      }
      setPendingEditId(null);
      setConfirmDialogOpen(true);
      return;
    }

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
    setOpenFormCreateSiteSpace(true);
  };

  const handleEdit = async (id: string) => {
    const editing = localStorage.getItem('unsavedSiteForm');

    if (editing) {
      const parsed = JSON.parse(editing);

      if (parsed.id === id) {
        setInitialFormSnapshot(parsed);
        setOpenFormCreateSiteSpace(true);
        return;
      } else {
        setPendingEditId(id);
        setConfirmDialogOpen(true);
        return;
      }
    }

    if (!token) return;

    const safeNumber = (val: any, fallback = 0) => {
      const n = Number(val);
      return Number.isFinite(n) ? n : fallback;
    };

    try {
      const res = await getSiteById(id, token);
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
        type: safeNumber(found.type),
        // type_approval: safeNumber(found.type_approval),
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

      localStorage.setItem('unsavedSiteForm', JSON.stringify(parsedData));

      setOpenFormCreateSiteSpace(true);
    } catch (error) {
      console.error('Error fetching/parsing data:', error);
    }
  };

  const handleConfirmEdit = () => {
    setConfirmDialogOpen(false);
    localStorage.removeItem('unsavedSiteForm');
    setShouldSaveToStorage(false);

    if (pendingEditId) {
      const found = tableData.find((item) => item.id === pendingEditId);
      if (found) {
        const parsedData = {
          ...CreateSiteRequestSchema.parse(found),
          id: pendingEditId,
          access: [],
          parking: [],
          tracking: [],
        };
        setEdittingId(pendingEditId);
        setFormDataAddSite(parsedData);
        setInitialFormSnapshot(parsedData);
        setShouldSaveToStorage(true);
        localStorage.setItem('unsavedSiteForm', JSON.stringify(parsedData));
        setOpenFormCreateSiteSpace(true);
      }
    } else {
      const empty = {
        ...CreateSiteRequestSchema.parse({}),
        id: '',
        access: [],
        parking: [],
        tracking: [],
      };
      setEdittingId('');
      setFormDataAddSite(empty);
      setInitialFormSnapshot(empty);
      handleCloseModalCreateSiteSpace();
    }

    setPendingEditId(null);
  };

  const handleCancelEdit = () => {
    setConfirmDialogOpen(false);
    setPendingEditId(null);
  };

  const handleDelete = async (id: string) => {
    if (!token) return;

    const confirm = await showConfirmDelete('Are you sure you want to delete this site space?');

    if (!confirm) return;

    if (confirm) {
      setLoading(true);
      try {
        await deleteSiteSpace(id, token);
        setRefreshTrigger((prev) => prev + 1);
        showSwal('success', 'Successfully deleted site space!');
      } catch (error: any) {
        showSwal('error', error.response?.data?.msg || 'Failed to delete site space.');
        setTimeout(() => setLoading(false), 500);
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    }
  };

  const handleBatchDelete = async (rows: SiteTableRow[]) => {
    if (!token || rows.length === 0) return false;

    const confirmed = await showConfirmDelete(`Are you sure to delete ${rows.length} items?`);
    if (!confirmed) return false;
    setLoading(true);
    try {
      await Promise.all(rows.map((row) => deleteSiteSpace(row.id, token)));
      setRefreshTrigger((prev) => prev + 1);
      setSelectedRows([]);
      showSwal('success', `${rows.length} site space have been deleted.`);
      return true;
    } catch (error) {
      showSwal('error', 'Failed to delete some items.');
      setLoading(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = (_event: object, reason: string) => {
    if (reason === 'backdropClick') {
      if (isFormChanged) {
        setConfirmDialogOpen(true);
      } else {
        handleCloseModalCreateSiteSpace();
      }
    }
  };

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.relatedTarget as Node)) {
        if (isFormChanged) {
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
  }, [isFormChanged]);

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
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleOpenType = () => {
    setOpenDetailType(true);
  };

  const handleSearchKeywordChange = useCallback((keyword: string) => {
    setSearchInput(keyword);
  }, []);

  const handleSearch = useCallback((keyword: string) => {
    setPage(0);
    setSearchInput(keyword);
    setSearchKeyword(keyword);
  }, []);

  const handleSuccess = () => {
    localStorage.removeItem('unsavedSiteForm');
    setSelectedRows([]);
    setRefreshTrigger((prev) => prev + 1);
    handleCloseModalCreateSiteSpace();
    queryClient.invalidateQueries({
      queryKey: ['registeredSites'],
    });
  };

  const [loadingBackdrop, setLoadingBackdrop] = useState(false);

  const handleActiveToggle = async (row: any, checked: boolean) => {
    try {
      setLoadingBackdrop(true);
      await updateSiteActive(token as string, row.id, checked);

      showSwal('success', 'Site space successfully updated');

      setRefreshTrigger((prev) => prev + 1);
    } catch (error: any) {
      showSwal('error', error?.response?.data?.message || 'Failed to update status active');
    } finally {
      setLoadingBackdrop(false);
    }
  };

  // useEffect(() => {
  //   const setupFCM = async () => {
  //     const token = await requestForToken();

  //     console.log('TOKEN:', token);
  //   };

  //   setupFCM();

  //   onMessageListener().then((payload: any) => {
  //     console.log('Foreground message:', payload);

  //     alert(payload.notification?.title);
  //   });
  // }, []);

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
                loading={loading}
                isHavePagination={true}
                totalCount={totalFilteredRecords}
                defaultRowsPerPage={rowsPerPage}
                isHaveImage={true}
                rowsPerPageOptions={[10, 50, 100]}
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
                  const fullSelectedItems = tableData.filter((item) =>
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
                onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                onAddData={handleOpenType}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>

      <DialogSiteSpace
        open={openFormCreateSiteSpace}
        editingId={edittingId}
        isFormChanged={isFormChanged}
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
