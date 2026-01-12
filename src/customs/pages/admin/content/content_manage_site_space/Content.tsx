import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Divider,
  Grid2 as Grid,
  Skeleton,
  Card,
  IconButton,
  Portal,
  Backdrop,
  CircularProgress,
  Autocomplete,
  TextField,
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
import { deleteSiteSpace, getAllSite, getAllSitePagination } from 'src/customs/api/admin';
import { IconSitemap, IconX } from '@tabler/icons-react';
import {
  showConfirmDelete,
  showSuccessAlert,
  showErrorAlert,
  showSwal,
} from 'src/customs/components/alerts/alerts';
import FilterMoreContent from './FilterMoreContent';
import { useNavigate, useParams } from 'react-router';

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
  type_approval: boolean;
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
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
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
  const [isEditing, setIsEditing] = useState(false);
  const [sortDir, setSortDir] = useState<string>('desc');

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
    3: [], // Room → nothing
  };
  useEffect(() => {
    if (!allData) return;

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
    if (!shouldSaveToStorage) return;
    if (!openFormCreateSiteSpace || !initialFormSnapshot) return;

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
          sortColumn,
          sortDir,
          searchKeyword,
          appliedType !== -1 ? appliedType : undefined,
          parent,
          is_child,
        );
        const res = await getAllSite(token);
        setAllData(res.collection);
        setTableData(response.collection);
        setTotalRecords(response.RecordsTotal);
        setTotalFilteredRecords(response.RecordsFiltered);

        const tableRows = response.collection.map((item: any) => ({
          id: item.id,
          name: item.name,
          type: item.type,
          description: item.description || '',
          image: item.image || '',
        }));

        setTableRowSite(tableRows);
      } catch (error) {
        // console.error('Fetch error:', error);
        setTableRowSite([]);
        setTableData([]);
        setTotalRecords(0);
        setTotalFilteredRecords(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    token,
    page,
    rowsPerPage,
    sortColumn,
    sortDir,
    refreshTrigger,
    searchKeyword,
    appliedType,
    wildcard,
  ]);

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
    setIsEditing(false);
    setInitialFormSnapshot(null);
  };

  // Handle Add
  const handleAdd = (type?: number) => {
    handleCloseDetailType();
    const editing = localStorage.getItem('unsavedSiteForm');
    if (editing) {
      const parsed = JSON.parse(editing);
      if (!parsed.id) {
        // set type jika ada
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
      is_registered_point: false,
      parent: '',
      is_child: false,
      type: type ?? 0,
    };
    setFormDataAddSite(empty);
    setInitialFormSnapshot(empty);
    setEdittingId('');
    setOpenFormCreateSiteSpace(true);
  };

  const handleEdit = (id: string) => {
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

    const found = allData.find((item) => item.id === id);

    if (!found) return;

    try {
      const parsedData = {
        ...CreateSiteRequestSchema.parse(found),
        id,
        access: [],
        parking: [],
        tracking: [],
        parent: '',
        is_child: false,
        type: 0,
        // is_registered_point: false,
      };
      setEdittingId(id);
      setFormDataAddSite(parsedData);
      setInitialFormSnapshot(parsedData);
      localStorage.setItem('unsavedSiteForm', JSON.stringify(parsedData));
      setOpenFormCreateSiteSpace(true);
    } catch (error) {
      console.error('Error parsing data:', error);
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
          is_registered_point: false,
          parent: '',
          is_child: false,
          type: 0,
        };
        setEdittingId(pendingEditId);
        setFormDataAddSite(parsedData);
        setInitialFormSnapshot(parsedData);
        setShouldSaveToStorage(true);
        localStorage.setItem('unsavedSiteForm', JSON.stringify(parsedData));
        setOpenFormCreateSiteSpace(true);
        setIsEditing(true);
      }
    } else {
      const empty = {
        ...CreateSiteRequestSchema.parse({}),
        id: '',
        access: [],
        parking: [],
        tracking: [],
        is_registered_point: false,
        parent: '',
        is_child: false,
        type: 0,
      };
      setEdittingId('');
      setFormDataAddSite(empty);
      setInitialFormSnapshot(empty);
      setIsEditing(false);
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
      } catch (error) {
        showSwal('error', 'Failed to delete site space.');
        setTimeout(() => setLoading(false), 500);
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    }
  };

  const handleBatchDelete = async (rows: SiteTableRow[]) => {
    if (!token || rows.length === 0) return;

    const confirmed = await showConfirmDelete(`Are you sure to delete ${rows.length} items?`);
    if (confirmed) {
      setLoading(true);
      try {
        await Promise.all(rows.map((row) => deleteSiteSpace(row.id, token)));
        setRefreshTrigger((prev) => prev + 1);
        setSelectedRows([]);
        showSwal('success', `${rows.length} site space have been deleted.`);
        setSelectedRows([]);
      } catch (error) {
        showSwal('error', 'Failed to delete some items.');
      } finally {
        setLoading(false);
      }
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
    type_approval: false,
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
                rowsPerPageOptions={[10, 25, 50, 100, 250]}
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
                onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                onAddData={() => {
                  // handleAdd();
                  handleOpenType();
                }}
                sortColumns={['name']}
                onFilterByColumn={(column) => setSortColumn(column.column)}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Dialog open={openFormCreateSiteSpace} onClose={handleDialogClose} fullWidth maxWidth="xl">
        <DialogTitle
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          {edittingId ? 'Edit' : 'Add'} Site Space
          <IconButton
            aria-label="close"
            onClick={() => {
              if (isFormChanged) {
                setConfirmDialogOpen(true);
              } else {
                handleCloseModalCreateSiteSpace();
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ paddingTop: 0 }}>
          <br />
          <FormSite
            formData={formDataAddSite}
            setFormData={setFormDataAddSite}
            onSuccess={() => {
              localStorage.removeItem('unsavedSiteForm');
              setSelectedRows([]);
              setRefreshTrigger((prev) => prev + 1);
              handleCloseModalCreateSiteSpace();
            }}
            editingId={edittingId}
            isBatchEdit={isBatchEdit}
            selectedRows={selectedRows}
            enabledFields={enabledFields}
            setEnabledFields={setEnabledFields}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={openDetailType} onClose={handleCloseDetailType} fullWidth maxWidth="sm">
        <DialogTitle>
          Select Type Site
          <IconButton
            onClick={handleCloseDetailType}
            sx={{ position: 'absolute', right: 10, top: 10 }}
          >
            <IconX />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Autocomplete
            fullWidth
            options={allowedTypes}
            value={allowedTypes.find((o) => o.value === selectedType) || null}
            onChange={(e, newValue) => {
              setSelectedType(newValue?.value ?? null);
            }}
            renderInput={(params) => <TextField {...params} placeholder="Select site type..." />}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDetailType}>Cancel</Button>
          <Button
            onClick={() => {
              if (selectedType === null) {
                showSwal('error', 'Please select a type first');
                return;
              }
              handleAdd(selectedType);
            }}
            variant="contained"
            disabled={allowedTypes.length === 0}
          >
            Next
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirmDialogOpen} onClose={handleCancelEdit}>
        <DialogTitle ref={dialogRef}>Unsaved Changes</DialogTitle>
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
    </PageContainer>
  );
};

export default Content;
