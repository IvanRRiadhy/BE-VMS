import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Divider, Grid2 as Grid } from '@mui/material';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';

import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import {
  deleteIntegration,
  getAllIntegration,
  getAvailableIntegration,
  getIntegrationById,
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
import { IconWorldCog } from '@tabler/icons-react';

import { showConfirmDelete, showSwal } from 'src/customs/components/alerts/alerts';
import IntegrationDialog from './components/IntegrationDialog';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import { useTranslation } from 'react-i18next';
import IntegrationCard from './components/IntegrationCard';

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
    // brand_type: normalizeBrandType(item.brand_type),
    brand_type:
      typeof item.brand_type === 'string'
        ? BrandType[item.brand_type as keyof typeof BrandType]
        : item.brand_type,
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
  const [integrationData, setIntegrationData] = useState<Item[]>([]);
  const [selectedRows, setSelectedRows] = useState<IntegrationTableRow[]>([]);
  const [tableData, setTableData] = useState<IntegrationTableRow[]>([]);
  const [availableIntegration, setAvailableIntegration] = useState<AvailableItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [edittingId, setEdittingId] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [openFormAddIntegration, setOpenFormAddIntegration] = useState(false);

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

    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);

      try {
        const [responseResult, availableResponseResult] = await Promise.allSettled([
          getAllIntegration(),
          getAvailableIntegration(),
        ]);

        const integrations: Item[] =
          responseResult.status === 'fulfilled' && Array.isArray(responseResult.value?.collection)
            ? responseResult.value.collection
            : [];

        const availables =
          availableResponseResult.status === 'fulfilled'
            ? (availableResponseResult.value.collection ?? []).map((item: any) => ({
              ...item,
              brand_type: normalizeBrandType(item.brand_type),
              api_type_auth: item.api_type_auth,
            }))
            : [];

        if (availableResponseResult.status === 'rejected') {
          console.error('getAvailableIntegration failed:', availableResponseResult.reason);
        }

        if (responseResult.status === 'rejected') {
          console.error('getAllIntegration failed:', responseResult.reason);
        }

        if (cancelled) return;

        setAvailableIntegration(availables);

        // setIntegrationData(integrations);
        setTotalRecords(integrations.length);

        const rows: any = integrations.map((item) => ({
          id: item.id,
          name: item.name,
          brand_name: item.brand_name,
          brand_type: item.brand_type,
          integration_type: item.integration_type,
          api_type_auth: item.api_type_auth,
          api_url: item.api_url || '',
        }));

        setTableData(rows);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [page, rowsPerPage, search, refreshTrigger]);

  const filteredData = useMemo(() => {
    if (!search) return tableData;

    const keyword = search.toLowerCase();

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
  }, [tableData, search]);

  const [formDataAddIntegration, setFormDataAddIntegration] = useState<any>(
    CreateIntegrationRequestSchema.parse({
      name: '',
      brand_name: '',
      brand_type: 0,
      integration_type: 0,
      api_type_auth: '',
    }),
  );
  const { t } = useTranslation();

  const cards = useMemo(
    () => [
      {
        title: t('totalIntegration'),
        subTitle: `${totalRecords ?? 0}`,
        icon: IconWorldCog,
        color: 'none',
      },
    ],
    [t, totalRecords],
  );

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


  const handleCloseDialog = () => setOpenFormAddIntegration(false);

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
    openForm(integration);
  };

  const handleEdit = async (id: string) => {
    const integration = await getIntegrationById(id);
    const res = integration?.collection ?? integration;
    if (!integration) return;

    const sanitized = sanitizeIntegrationForForm(res as Item);

    setFormDataAddIntegration(sanitized);
    setEdittingId(id);
    setOpenFormAddIntegration(true);
  };

  const handleDelete = async (id: string) => {

    const isConfirmed = await showConfirmDelete(
      'Are you sure you want to delete this integration?',
    );

    if (!isConfirmed) return;

    setLoading(true);

    try {
      await deleteIntegration(id);
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
    if (rows.length === 0) return;

    const confirmed = await showConfirmDelete(`Are you sure to delete ${rows.length} items?`);

    if (confirmed) {
      setLoading(true);
      try {
        await Promise.all(rows.map((row) => deleteIntegration(row.id)));
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

  const handleSearch = useCallback(
    (keyword: string) => {
      setPage(0);
      setSearch(keyword);
    },
    [setPage, setSearch],
  );

  const [isDirty, setIsDirty] = useState(false);

  const handleRequestClose = () => {
    if (isDirty) {
      setConfirmDialogOpen(true);
      return;
    }
    setOpenFormAddIntegration(false);
  };

  const handleCopy = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);

      showSwal('success', 'ID copied successfully');
    } catch (error) {
      console.error(error);

      showSwal('error', 'Failed to copy ID');
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
                currentPage={page}
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
                isCopy={true}
                onCopy={(row) => {
                  handleCopy(row.id);
                }}
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
                searchKeyword={search}
                onSearch={handleSearch}
              />
            </Grid>
            <Grid container size={{ xs: 12, lg: 12 }} sx={{ mt: 4 }} justifyContent={'center'}>
              {availableIntegration.map((integration, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                  <IntegrationCard
                    integration={integration}
                    onAdd={handleAdd}
                  />
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
    </PageContainer>
  );
};

export default Content;
