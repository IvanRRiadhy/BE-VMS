import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Card,
  Skeleton,
  Grid2 as Grid,
  IconButton,
  DialogActions,
} from '@mui/material';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';

import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  deleteIntegration,
  getAllIntegration,
  getAvailableIntegration,
} from 'src/customs/api/admin';
import {
  Item,
  AvailableItem,
  BrandType,
  IntegrationType,
  ApiTypeAuth,
  CreateIntegrationRequestSchema,
  CreateIntegrationRequest,
  apiKeyFieldMap,
} from 'src/customs/api/models/Admin/Integration';
import { useTheme } from '@mui/material/styles';
import FormIntegration from './FormIntegration';
import { IconWorldCog } from '@tabler/icons-react';

import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import IntegrationDialog from './components/IntegrationDialog';

type IntegrationTableRow = {
  id: string;
  name: string;
  brand_name: string;
  brand_type: string;
  integration_type: string;
  api_type_auth: string;
  api_url: string;
};

const IntegrationTypeMap: Record<string, number> = {
  SDK: 0,
  API: 1,
  INTERNALMODULE: 2,
};

function sanitizeIntegrationForForm(item: Item): CreateIntegrationRequest {
  return CreateIntegrationRequestSchema.parse({
    ...item,
    brand_type: Number(item.brand_type),
    // integration_type: Number(item.integration_type),
    // integration_type: item.integration_type,
    integration_type: IntegrationTypeMap[item.integration_type] ?? 0,
    // api_type_auth: Number(item.api_type_auth),
    api_type_auth: item.api_type_auth,
    integration_list_id: item.integration_list_id || '',
  });
}

const Content = () => {
  const theme = useTheme();

  // Pagination state.
  const [integrationData, setIntegrationData] = useState<Item[]>([]);
  const [selectedRows, setSelectedRows] = useState<IntegrationTableRow[]>([]);
  const [tableData, setTableData] = useState<IntegrationTableRow[]>([]);
  const [availableIntegration, setAvailableIntegration] = useState<AvailableItem[]>([]);
  const { token } = useSession();
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [edittingId, setEdittingId] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [openFormAddIntegration, setOpenFormAddIntegration] = useState(false);

  const DRAFT_KEY = 'unsavedIntegrationData';

  const getDraft = () => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  function formatEnumLabel(label: unknown) {
    if (label === null || label === undefined) return '';

    const str = String(label);

    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (c) => c.toUpperCase())
      .trim();
  }

  function normalizeBrandType(value: unknown): number {
    if (typeof value === 'number') return value;

    if (typeof value === 'string' && value in BrandType) {
      return BrandType[value as keyof typeof BrandType];
    }

    return 0;
  }

  const ApiTypeAuthMap: Record<string, number> = {
    Basic: 0,
    Bearer: 1,
    ApiKey: 2,
    Bacnet: 4,
  };

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [response, availableResponse] = await Promise.all([
          getAllIntegration(token),
          getAvailableIntegration(token),
        ]);

        const integrations: Item[] = Array.isArray(response?.collection) ? response.collection : [];
        const availables = (availableResponse.collection ?? []).map((item: any) => ({
          ...item,
          brand_type: normalizeBrandType(item.brand_type),
          // integration_type: normalizeBrandType(item.integration_type),
          // integration_type: IntegrationTypeMap[item.integration_type],
          // api_type_auth: normalizeBrandType(item.api_type_auth),
          api_type_auth: item.api_type_auth,
        }));

        setAvailableIntegration(availables);

        if (cancelled) return;

        setIntegrationData(integrations);
        // setAvailableIntegration(availables);
        setTotalRecords(integrations.length);

        const rows: any[] = integrations.map((item) => ({
          id: item.id,
          name: item.name,
          brand_name: item.brand_name,
          brand_type: item.brand_type,
          // integration_type: formatEnumLabel(IntegrationType[item.integration_type]),
          // api_type_auth: formatEnumLabel(ApiTypeAuth[item.api_type_auth]),
          integration_type: item.integration_type,
          api_type_auth: item.api_type_auth,
          api_url: item.api_url || '',
        }));

        setTableData(rows);
      } catch (error) {
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [token, page, rowsPerPage, searchKeyword, refreshTrigger]);

  const filteredData = useMemo(() => {
    if (!searchKeyword) return tableData;

    const keyword = searchKeyword.toLowerCase();

    return tableData.filter((item) =>
      [
        item.name,
        item.brand_name,
        item.brand_type,
        item.integration_type,
        item.api_type_auth,
        item.api_url,
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    );
  }, [tableData, searchKeyword]);

  // const [formDataAddIntegration, setFormDataAddIntegration] = useState<any>(() => {
  //   const saved = localStorage.getItem('unsavedIntegrationData');
  //   if (!saved)
  //     return CreateIntegrationRequestSchema.parse({
  //       name: '',
  //       brand_name: '',
  //       brand_type: 0,
  //       integration_type: 0,
  //       api_type_auth: 0,
  //     });

  //   const parsed = JSON.parse(saved);
  //   return sanitizeIntegrationForForm(parsed as Item);
  // });

  const [formDataAddIntegration, setFormDataAddIntegration] = useState<any>(
    CreateIntegrationRequestSchema.parse({
      name: '',
      brand_name: '',
      brand_type: 0,
      integration_type: 0,
      api_type_auth: '',
    }),
  );


  const cards = [
    {
      title: 'Total Integration',
      subTitle: `${totalRecords}`,
      icon: IconWorldCog,
      subTitleSetting: 10,
      color: 'none',
    },
  ];

  const brandTypeBgColorMap: Record<number, string> = {
    0: theme.palette.error.light, // red
    1: theme.palette.success.light, // green
    2: theme.palette.primary.light, // blue
    3: theme.palette.warning.light, // yellow/orange
    4: theme.palette.secondary.light, // magenta/purple
    5: theme.palette.info.light, // light blue? cyan?
  };
  //   const apiKeyFieldMap: Record<string, string> = {
  //     'Bio People Tracking System': 'X-BIO-PEOPLE-KEY',
  //     'Bio Parking System': 'X-BIO-PARKING-KEY',
  //     'Bio Meeting Room System': 'X-BIO-SMR-KEY',
  //     // Add more mappings as needed
  //   };

  function getApiKeyField(api_type_auth: number, name: string) {
    if (api_type_auth === 1) return 'Bearer';
    if (api_type_auth === 2) return apiKeyFieldMap[name] || '';
    return '';
  }

  const IntegrationTypeMap: Record<string, IntegrationType> = {
    SDK: IntegrationType.SDK,
    API: IntegrationType.API,
    INTERNALMODULE: IntegrationType.InternalModule,
  };

  const handleOpenDialog = () => {
    setOpenFormAddIntegration(true);
  };
  const handleCloseDialog = () => setOpenFormAddIntegration(false);
  const [pendingIntegration, setPendingIntegration] = useState<AvailableItem | null>(null);

  const openForm = (integration?: AvailableItem | null) => {
    let newData = CreateIntegrationRequestSchema.parse({
      name: '',
      brand_name: '',
      brand_type: 0,
      integration_type: 0,
      api_type_auth: '',
    });

    if (integration) {
      newData = CreateIntegrationRequestSchema.parse({
        name: integration.name,
        brand_name: integration.brand_name,
        brand_type: integration.brand_type,
        integration_type: IntegrationTypeMap[integration.integration_type],
        api_type_auth: integration.api_type_auth,
        integration_list_id: integration.id,
        api_url: '',
      });
    }

    setFormDataAddIntegration(newData);
    setEdittingId('');
    setOpenFormAddIntegration(true);
  };

  const handleAdd = (integration?: AvailableItem) => {
    const draft = getDraft();

    if (draft) {
      // simpan dulu intent user
      setPendingIntegration(integration || null);

      // tampilkan confirm dulu
      setConfirmDialogOpen(true);
      return;
    }

    openForm(integration);
  };

  const handleEdit = (id: string) => {
    const integration = integrationData.find((item) => item.id === id);
    if (!integration) return;

    const sanitized = sanitizeIntegrationForForm(integration);

    setFormDataAddIntegration(sanitized);
    setEdittingId(id);
    setOpenFormAddIntegration(true);
  };

  const handleDelete = async (id: string) => {
    if (!token) return;

    const isConfirmed = await showConfirmDelete(
      'Are you sure you want to delete this integration?',
    );

    if (!isConfirmed) return;

    setLoading(true);

    try {
      await deleteIntegration(id, token);
      setRefreshTrigger((prev) => prev + 1);
      showSwal('success', 'Successfully deleted integration');
    } catch (error) {
      console.error(error);
      showSwal('error', 'Failed to delete the item.');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchDelete = async (rows: any[]) => {
    if (!token || rows.length === 0) return;

    const confirmed = await showConfirmDelete(`Are you sure to delete ${rows.length} items?`);

    if (confirmed) {
      setLoading(true);
      try {
        await Promise.all(rows.map((row) => deleteIntegration(row.id, token)));
        setRefreshTrigger((prev) => prev + 1);
        showSwal('success', `${rows.length} items have been deleted.`);
        setSelectedRows([]);
      } catch (error) {
        showSwal('error', 'Failed to delete some items.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSearchKeywordChange = useCallback((keyword: string) => {
    setSearchInput(keyword);
  }, []);

  const handleSearch = useCallback(() => {
    setPage(0);
    setSearchKeyword(searchInput);
  }, [searchInput]);

  const [isDirty, setIsDirty] = useState(false);

  const handleContinueEditing = () => {
    const draft = getDraft();

    if (draft) {
      setFormDataAddIntegration(draft);
    }

    setConfirmDialogOpen(false);
    setOpenFormAddIntegration(true);
  };

  const handleDiscard = () => {
    localStorage.removeItem(DRAFT_KEY);

    setConfirmDialogOpen(false);

    // lanjut buka form baru (pakai pendingIntegration)
    openForm(pendingIntegration);
    setPendingIntegration(null);
  };

  // const handleContinueEditing = () => {
  //   const draft = getDraft();

  //   if (draft) {
  //     setFormDataAddIntegration(draft);
  //     setIsDirty(true);
  //   }

  //   setConfirmDialogOpen(false);
  //   setOpenFormAddIntegration(true);
  // };

  // const handleDiscard = () => {
  //   setAllowAutoSave(false);

  //   localStorage.removeItem(DRAFT_KEY);

  //   setFormDataAddIntegration(
  //     CreateIntegrationRequestSchema.parse({
  //       name: '',
  //       brand_name: '',
  //       brand_type: 0,
  //       integration_type: 0,
  //       api_type_auth: '',
  //     }),
  //   );

  //   setIsDirty(false);
  //   setConfirmDialogOpen(false);
  //   setOpenFormAddIntegration(false);

  //   setTimeout(() => setAllowAutoSave(true), 0);
  // };

  const handleRequestClose = () => {
    if (isDirty) {
      setConfirmDialogOpen(true);
      return;
    }
    localStorage.removeItem(DRAFT_KEY);
    setOpenFormAddIntegration(false);
  };

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Integration" description="Integration page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={loading}
                isHavePagination={false}
                totalCount={totalRecords}
                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 50, 100]}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                overflowX={'auto'}
                data={filteredData}
                selectedRows={selectedRows}
                isHaveChecked={true}
                isHaveAction={true}
                isHaveSearch={true}
                isHaveFilter={false}
                isHaveExportPdf={false}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                isHaveAddData={false}
                isHaveFilterMore={false}
                isHaveHeader={false}
                isHaveIntegration={true}
                onNameClick={(row) =>
                  window.open(
                    `/admin/manage/integration/${row.id}`,
                    '_blank',
                    'noopener,noreferrer',
                  )
                }
                onCheckedChange={(selected) => {
                  setSelectedRows(selected);
                }}
                onEdit={(row) => {
                  handleEdit(row.id);
                  setEdittingId(row.id);
                }}
                onBatchDelete={handleBatchDelete}
                onDelete={(row) => {
                  handleDelete(row.id);
                }}
                searchKeyword={searchInput}
                onSearch={handleSearch}
                onSearchKeywordChange={handleSearchKeywordChange}
                // onSearchKeywordChange={(keyword) => console.log('Search keyword:', keyword)}
                // onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                // onAddData={() => {
                //   handleAdd();
                // }}
              />
            </Grid>
            <Grid container size={{ xs: 12, lg: 12 }} sx={{ mt: 4 }} justifyContent={'center'}>
              {availableIntegration.map((integration, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                  <Box
                    sx={{
                      border: '1px solid #ccc',
                      borderRadius: 2,
                      padding: 2,
                      marginBottom: 0,
                      // backgroundColor: brandTypeBgColorMap[integration.brand_type] || '#fff',
                      backgroundColor: 'primary.light',
                    }}
                  >
                    <Box component="h3">{integration.name}</Box>
                    <Box component="h5" sx={{ color: 'gray', mt: 0, mb: 2 }}>
                      {integration.brand_name}
                    </Box>
                    <Divider />
                    {/* <br /> */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        flexWrap: 'wrap',
                        mt: 1,
                        alignItems: 'center',
                      }}
                    >
                      <Box fontSize={12} sx={{ mt: 0 }}>
                        <strong>Brand Type:</strong> {BrandType[integration.brand_type]}
                      </Box>
                      <Box fontSize={12} sx={{ mt: 0, textAlign: 'left' }}>
                        <strong>Integration Type:</strong>
                        {/* {IntegrationType[integration.integration_type]} */}

                        {integration.integration_type}
                      </Box>
                      <Box fontSize={12} sx={{ mt: 0 }}>
                        <strong>API Auth Type:</strong>
                        {/* {ApiTypeAuth[integration.api_type_auth]} */}
                        {integration.api_type_auth}
                      </Box>
                    </Box>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => {
                          handleAdd(integration);
                          // handleOpenDialog();
                        }}
                      >
                        Add Integration
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Box>
      </Container>
      <IntegrationDialog
        open={openFormAddIntegration}
        onClose={handleRequestClose}
        editingId={edittingId}
        initialData={formDataAddIntegration}
        onSuccess={() => {
          setRefreshTrigger((prev) => prev + 1);
          handleCloseDialog();
        }}
      />
      {/* Dialog Confirm edit */}
      {/* <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Unsaved Changes
          <IconButton
            aria-label="close"
            onClick={() => setConfirmDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <IconX />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          You have unsaved changes. Do you want to continue editing or discard them?
        </DialogContent>

        <DialogActions>
          <Button onClick={handleDiscard} color="error" variant="contained">
            Discard Changes
          </Button>

          <Button onClick={handleContinueEditing} color="primary" variant="contained">
            Yes, Continue Editing
          </Button>
        </DialogActions>
      </Dialog> */}
    </PageContainer>
  );
};

export default Content;
