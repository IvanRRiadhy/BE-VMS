import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Card,
  Skeleton,
  Grid2 as Grid,
  IconButton,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';

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
} from 'src/customs/api/models/Integration';
import { useTheme } from '@mui/material/styles';
import FormIntegration from './FormIntegration';
import Swal from 'sweetalert2';
import { IconWorldCog } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

type IntegrationTableRow = {
  id: string;
  name: string;
  brand_name: string;
  brand_type: string;
  integration_type: string;
  api_type_auth: string;
  api_url: string;
};

const Content = () => {
  const theme = useTheme();

  // Pagination state.
  const [integrationData, setIntegrationData] = useState<Item[]>([]);
  const [tableData, setTableData] = useState<IntegrationTableRow[]>([]);
  const [availableIntegration, setAvailableIntegration] = useState<AvailableItem[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const { token } = useSession();
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [edittingId, setEdittingId] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();

  function formatEnumLabel(label: string) {
    // Insert a space before all caps and capitalize the first letter
    return label
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getAllIntegration(token);
        const availableResponse = await getAvailableIntegration(token);
        setAvailableIntegration(availableResponse.collection);
        setIntegrationData(response.collection);
        setTotalRecords(response.collection.length);

        const rows: IntegrationTableRow[] = response.collection.map((item) => ({
          id: item.id,
          name: item.name,
          brand_name: item.brand_name,
          brand_type: formatEnumLabel(BrandType[item.brand_type]),
          integration_type: formatEnumLabel(IntegrationType[item.integration_type]),
          api_type_auth: formatEnumLabel(ApiTypeAuth[item.api_type_auth]),
          api_url: item.api_url || '',
        }));
        if (rows) {
          setTableData(rows);
          setIsDataReady(true);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, page, rowsPerPage, sortColumn, refreshTrigger]);
  const [formDataAddIntegration, setFormDataAddIntegration] = useState<CreateIntegrationRequest>(
    () => {
      const saved = localStorage.getItem('unsavedIntegrationData');
      return saved
        ? JSON.parse(saved)
        : { name: '', brand_name: '', brand_type: 0, integration_type: 0, api_type_auth: 0 };
    },
  );
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
    console.log('Integration data:', integration);
  };

  const handleEdit = (id: string) => {
    const editing = localStorage.getItem('unsavedIntegrationData');
    const integration = integrationData.find((item) => item.id === id);
    const available = availableIntegration.find(
      (item) => item.name === integration?.name && item.brand_name === integration?.brand_name,
    );
    const integrationWithListId = {
      ...integration,
      integration_list_id: available?.id || '',
    };
    console.log('Integration data:', integrationWithListId);
    setFormDataAddIntegration(CreateIntegrationRequestSchema.parse(integrationWithListId));
    handleOpenDialog();
    // }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteIntegration(id, token);

          setRefreshTrigger((prev) => prev + 1);
          Swal.fire({
            title: 'Deleted!',
            text: 'Your file has been deleted.',
            icon: 'success',
          });
        } catch (error) {
          console.error(error);
          Swal.fire({
            title: 'Error!',
            text: 'Something went wrong while deleting.',
            icon: 'error',
          });
        }
      }
    });
  };

  return (
    <>
      <PageContainer title="Manage Integration" description="Integration page">
        <Box>
          <Grid container spacing={3}>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} />
            </Grid>
            {/* column */}
            <Grid size={{ xs: 12, lg: 12 }}>
              {isDataReady ? (
                <DynamicTable
                  isHavePagination={false}
                  totalCount={totalRecords}
                  defaultRowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[5, 10, 20]}
                  onPaginationChange={(page, rowsPerPage) => {
                    setPage(page);
                    setRowsPerPage(rowsPerPage);
                  }}
                  overflowX={'auto'}
                  data={tableData}
                  isHaveChecked={true}
                  isHaveAction={false}
                  isHaveSearch={true}
                  isHaveFilter={false}
                  isHaveExportPdf={true}
                  isHaveExportXlf={false}
                  isHaveFilterDuration={false}
                  isHaveAddData={false}
                  isHaveFilterMore={false}
                  isHaveHeader={false}
                  isHaveIntegration={true}
                  onNameClick={(row) => navigate(`/admin/manage/integration/${row.id}`)}
                  onCheckedChange={(selected) => console.log('Checked table row:', selected)}
                  onEdit={(row) => {
                    handleEdit(row.id);
                    setEdittingId(row.id);
                  }}
                  onDelete={(row) => {
                    handleDelete(row.id);
                  }}
                  onSearchKeywordChange={(keyword) => console.log('Search keyword:', keyword)}
                  onFilterCalenderChange={(ranges) => console.log('Range filtered:', ranges)}
                  // onAddData={() => {
                  //   handleAdd();
                  // }}
                />
              ) : (
                <Card sx={{ width: '100%' }}>
                  <Skeleton />
                  <Skeleton animation="wave" />
                  <Skeleton animation={false} />
                </Card>
              )}
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
      </PageContainer>
      <Dialog open={openFormAddIntegration} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ position: 'relative', padding: 5 }}>
          Add Integration
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
        <DialogContent>
          <br />
          <FormIntegration
            formData={formDataAddIntegration}
            setFormData={setFormDataAddIntegration}
            onSuccess={() => {
              handleCloseDialog();
              setRefreshTrigger(refreshTrigger + 1);
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
    </>
  );
};

export default Content;
