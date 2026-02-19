import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Card,
  Skeleton,
  Grid2 as Grid,
  IconButton,
} from '@mui/material';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';

import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import CloseIcon from '@mui/icons-material/Close';
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
import { useNavigate } from 'react-router-dom';
import {
  showConfirmDelete,
  showErrorAlert,
  showSuccessAlert,
  showSwal,
} from 'src/customs/components/alerts/alerts';

type IntegrationTableRow = {
  id: string;
  name: string;
  brand_name: string;
  brand_type: string;
  integration_type: string;
  api_type_auth: string;
  api_url: string;
};

function sanitizeIntegrationForForm(item: Item): CreateIntegrationRequest {
  return CreateIntegrationRequestSchema.parse({
    ...item,
    brand_type: Number(item.brand_type),
    integration_type: Number(item.integration_type),
    api_type_auth: Number(item.api_type_auth),
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
  const [isDataReady, setIsDataReady] = useState(false);
  const { token } = useSession();
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [edittingId, setEdittingId] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  function formatEnumLabel(label: unknown) {
    if (label === null || label === undefined) return '';

    const str = String(label);

    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (c) => c.toUpperCase())
      .trim();
  }

  function normalizeBrandType(value: unknown): number {
    // sudah number
    if (typeof value === 'number') return value;

    // string enum → number enum
    if (typeof value === 'string' && value in BrandType) {
      return BrandType[value as keyof typeof BrandType];
    }

    console.warn('Unknown brand_type:', value);
    return 0; // fallback aman
  }

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

        // Normalize to arrays
        const integrations: Item[] = Array.isArray(response?.collection) ? response.collection : [];
        const availables = (availableResponse.collection ?? []).map((item) => ({
          ...item,
          brand_type: normalizeBrandType(item.brand_type),
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
          integration_type: formatEnumLabel(IntegrationType[item.integration_type]),
          api_type_auth: formatEnumLabel(ApiTypeAuth[item.api_type_auth]),
          api_url: item.api_url || '',
        }));

        setTableData(rows);
        setIsDataReady(true);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Reset to safe defaults so the UI still renders
        if (!cancelled) {
          setIntegrationData([]);
          setAvailableIntegration([]);
          setTableData([]);
          setTotalRecords(0);
          setIsDataReady(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [token, page, rowsPerPage, sortColumn, refreshTrigger]);

  const [formDataAddIntegration, setFormDataAddIntegration] = useState<any>(() => {
    const saved = localStorage.getItem('unsavedIntegrationData');
    if (!saved)
      return CreateIntegrationRequestSchema.parse({
        name: '',
        brand_name: '',
        brand_type: 0,
        integration_type: 0,
        api_type_auth: 0,
      });

    const parsed = JSON.parse(saved);
    return sanitizeIntegrationForForm(parsed as Item);
  });

  useEffect(() => {
    localStorage.setItem('unsavedIntegrationData', JSON.stringify(formDataAddIntegration));
  }, [formDataAddIntegration]);

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

  //Create Integration management
  const [openFormAddIntegration, setOpenFormAddIntegration] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);

  const handleOpenDialog = () => {
    setOpenFormAddIntegration(true);
  };
  const handleCloseDialog = () => setOpenFormAddIntegration(false);

  const handleAdd = (chosenIntegration: AvailableItem) => {
    const integration = CreateIntegrationRequestSchema.parse({
      name: chosenIntegration.name,
      brand_name: chosenIntegration.brand_name,
      brand_type: chosenIntegration.brand_type,
      integration_type: chosenIntegration.integration_type,
      api_type_auth: chosenIntegration.api_type_auth,
      integration_list_id: chosenIntegration.id,
      api_url: '',
      api_auth_username: '',
      api_auth_passwd: '',
      api_key_field: getApiKeyField(chosenIntegration.api_type_auth, chosenIntegration.name),
      api_key_value: '',
    });

    setFormDataAddIntegration(integration);
    handleOpenDialog();
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

    const confirmed = await showConfirmDelete(
      `Are you sure to delete ${rows.length} items?`,
      "You won't be able to revert this!",
    );

    if (confirmed) {
      setLoading(true);
      try {
        await Promise.all(rows.map((row) => deleteIntegration(row.id, token)));
        setRefreshTrigger((prev) => prev + 1);
        showSuccessAlert('Deleted!', `${rows.length} items have been deleted.`);
        setSelectedRows([]); // reset selected rows
      } catch (error) {
        console.error(error);
        showErrorAlert('Error!', 'Failed to delete some items.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Integration" description="Integration page">
        <Box>
          <Grid container spacing={3}>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              {/* {isDataReady ? ( */}
              <DynamicTable
                loading={loading}
                isHavePagination={false}
                totalCount={totalRecords}
                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 20, 50, 100]}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                overflowX={'auto'}
                data={tableData}
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
                onSearchKeywordChange={(keyword) => console.log('Search keyword:', keyword)}
                onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
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
                      marginBottom: 2,
                      backgroundColor: brandTypeBgColorMap[integration.brand_type] || '#fff',
                    }}
                  >
                    <Box component="h3">{integration.name}</Box>
                    <Box component="h5" sx={{ color: 'gray', mt: -1.5 }}>
                      {integration.brand_name}
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mt: 1 }}>
                      <Box fontSize={12} sx={{ mt: 1 }}>
                        <strong>Brand Type:</strong> {BrandType[integration.brand_type]}
                      </Box>
                      <Box fontSize={12} sx={{ mt: -2 }}>
                        <strong>Integration Type:</strong>{' '}
                        {IntegrationType[integration.integration_type]}
                      </Box>
                      <Box fontSize={12} sx={{ mt: -2 }}>
                        <strong>API Auth Type:</strong> {ApiTypeAuth[integration.api_type_auth]}
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
      <Dialog open={openFormAddIntegration} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ position: 'relative', padding: 3 }}>
          {edittingId ? 'Edit Integration' : 'Add Integration'}
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
          <br />
          <FormIntegration
            formData={formDataAddIntegration}
            setFormData={setFormDataAddIntegration}
            onSuccess={() => {
              setRefreshTrigger(refreshTrigger + 1);
              handleCloseDialog();
            }}
            editingId={edittingId}
          />
        </DialogContent>
      </Dialog>
      {/* Dialog Confirm edit */}
      {/* <Dialog open={confirmDialogOpen} onClose={handleCancelEdit}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          You have unsaved changes for another Document. Are you sure you want to discard them and
          edit this Document?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancel</Button>
          <Button onClick={handleConfirmEdit} color="primary" variant="contained">
            Yes, Discard and Continue
          </Button>
        </DialogActions>
      </Dialog> */}
    </PageContainer>
  );
};

export default Content;
