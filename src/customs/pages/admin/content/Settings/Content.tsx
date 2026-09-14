import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid2 as Grid,
  Paper,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
  Typography,
  Chip,
  Stack,
  Card,
  CircularProgress,
  IconButton,
} from '@mui/material';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import Container from 'src/components/container/PageContainer';
import { IconInfoCircle, IconSettingsFilled, IconX } from '@tabler/icons-react';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { Item } from 'src/customs/api/models/Admin/Setting';
import ApprovalWorkflow from 'src/customs/pages/admin/content/Approve/content';
import { getAllOrganizations, getSetting, updateSetting } from 'src/customs/api/admin';
import { showSwal } from 'src/customs/components/alerts/alerts';
import FormSetting from './FormSetting';
import { useTableQueryParams } from 'src/hooks/useTableQueryParams';
import NotificationSetting from './NotificationSetting';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import VMSConfigurationTab from './VmsConfugrationTab';
import useApprovalWorkflowPagination from 'src/hooks/ApprovalWorkflow/useApprovalWorkflowPagination';
import ThirdPartyIntegration from './ThirdPartyIntegration';
import { useOrganization } from 'src/hooks/Organization/useOrganization';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { uploadLicense } from 'src/customs/api/Admin/Setting';
import GlobalBackdropLoading from 'src/customs/pages/Operator/Components/GlobalBackdrop';
const Content = () => {
  const [settingData, setSettingData] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const initialFormData: Item = {
    id: '',
    organization_id: '',
  };
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [sortDir, setSortDir] = useState('desc');
  const { page, search, setPage, setSearch } = useTableQueryParams();
  const [formData, setFormData] = useState<Item>(() => initialFormData);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [edittingId, setEdittingId] = useState('');
  const [tabIndex, setTabIndex] = useState(0);

  const handleSubmit = async () => {
    try {
      // const validated = CreateSettingSmtpSchema.parse(data);
      if (edittingId) {
        await updateSetting(edittingId, formData);
        showSwal('success', 'Setting updated successfully!');
      }

      setShowForm(false);
      setEdittingId('');
    } catch (error: any) {
      showSwal('error', error.message || 'Failed to update setting');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  const { organizations } = useOrganization();
  useEffect(() => {
    setLoading(true);

    const fetchData = async () => {
      try {
        const settingRes = await getSetting();

        const raw = settingRes?.collection;

        let data: any[] = [];

        if (Array.isArray(raw)) {
          data = raw;
        } else if (raw) {
          data = [raw];
        }

        const enriched = data.map((item) => {
          const org = organizations?.find((o: any) => o.id === item.organization_id);

          return {
            id: item.id,
            organization_id: item.organization_id,
            organization_name: org?.name ?? '-',
          };
        });

        setSettingData(enriched);
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (organizations) {
      fetchData();
    }
  }, [organizations]);

  const handleEdit = (id: number) => {
    const row = settingData.find((x) => x.id === id);
    if (!row) return;
    setEdittingId(id.toString());
    setFormData({ ...row, id: row.id.toString() } as Item);
    setShowForm(true);
  };

  const { data, isLoading } = useApprovalWorkflowPagination({
    page,
    rowsPerPage,
    search,
    sortDir,
  });

  const tableData = data?.collection ?? [];
  const totalRecords = data?.totalRecords ?? 0;

  const cards = useMemo(
    () => [
      {
        title: 'Total Visitor Setting',
        subTitle: `${settingData.length ?? 0}`,
        icon: IconSettingsFilled,
        color: 'none',
      },
      {
        title: 'Total Approval Workflow',
        subTitle: `${totalRecords ?? 0}`,
        icon: IconSettingsFilled,
        color: 'none',
      },
    ],
    [settingData.length, totalRecords],
  );

  const [uploadingLicense, setUploadingLicense] = useState(false);
  const [licenseFileName, setLicenseFileName] = useState<string>('');

  const handleLicenseUpload = async (file: File) => {
    try {
      setUploadingLicense(true);

      // API upload license di sini
      const response = await uploadLicense(file);

      setLicenseFileName(file.name);

      showSwal('success', 'License uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload license:', error);
      showSwal('error', 'Failed to upload license');
    } finally {
      setUploadingLicense(false);
    }
  };

  const handleRemoveLicense = () => {
    setLicenseFileName('');
  };

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Settings" description="Setting Smtp page">
        <Box>
          <Grid size={{ xs: 12 }}>
            <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
          </Grid>
          <Paper
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              minHeight: 400,
              mt: 2,
              p: 2,
              overflowX: 'auto',
            }}
          >
            <Tabs
              orientation={isMobile ? 'horizontal' : 'vertical'}
              value={tabIndex}
              onChange={(_, newValue) => setTabIndex(newValue)}
              variant={isMobile ? 'scrollable' : 'standard'}
              scrollButtons={isMobile ? 'auto' : false}
              sx={{
                borderRight: isMobile ? 0 : 1,
                borderBottom: isMobile ? 1 : 0,
                borderColor: 'divider',
                minWidth: isMobile ? '100%' : 180,
              }}
            >
              <Tab label="Configuration" />
              <Tab label="Visitor Setting" />
              <Tab label="Approval Workflow" />
              <Tab label="Apikey Setting" />
              <Tab label="License" />
              <Tab label="Vehicle" />
              {/* <Tab label="Visitor Card Setting" /> */}
              {/* <Tab label="Notification Setting" /> */}
            </Tabs>

            <Box
              sx={{
                flex: 1,
                mt: isMobile ? 2 : 0,
              }}
            >
              {/* vms configuration */}
              {tabIndex === 0 && <VMSConfigurationTab />}
              {tabIndex === 1 ? (
                <Box sx={{ overflowX: 'auto', p: { xs: 0, md: 2 }, height: '100%' }}>
                  {!showForm ? (
                    <DynamicTable
                      loading={loading}
                      isHavePagination={false}
                      isHaveHeaderTitle={true}
                      titleHeader="Setting"
                      data={settingData.map(({ organization_id, ...rest }) => rest)}
                      isHaveChecked={true}
                      isHaveAction={false}
                      isHaveSearch={false}
                      isHaveFilter={false}
                      isHaveExportPdf={false}
                      isHaveAddData={false}
                      isSelectedType={true}
                      isHaveActionOnlyEdit={true}
                      isNoActionTableHead
                      isHaveHeader={false}
                      // onCheckedChange={setSelectedRows}
                      onEdit={(row) => handleEdit(row.id)}
                      // onDelete={(row) => handleDelete(row.id.toString())}
                      // onSearchKeywordChange={search}
                    />
                  ) : (
                    <FormSetting
                      formData={formData}
                      setFormData={setFormData}
                      editingId={edittingId}
                      onSubmit={handleSubmit}
                      onCancel={handleCancelForm}
                    />
                  )}
                </Box>
              ) : null}
              {tabIndex === 2 ? (
                <Box sx={{ overflowX: 'auto', p: { xs: 0, md: 2 }, height: '100%' }}>
                  {!showForm ? (
                    <ApprovalWorkflow
                      tableData={tableData}
                      loading={isLoading}
                      searchKeyword={search}
                      setSearchKeyword={setSearch}
                      page={page}
                      setPage={setPage}
                    />
                  ) : null}
                </Box>
              ) : null}
              {/* 
              {tabIndex === 3 ? (
                <Box sx={{ overflowX: 'auto', p: { xs: 0, md: 2 }, height: '100%' }}>
                  {!showForm ? <VisitorCardSetting /> : null}
                </Box>
              ) : null} */}
              {tabIndex === 3 ? <ThirdPartyIntegration /> : null}
              {/* {tabIndex === 4 ? (
                <Box sx={{ overflowX: 'auto', p: { xs: 0, md: 2 }, height: '100%' }}>
                  {!showForm ? <NotificationSetting /> : null}
                </Box>
              ) : null} */}

              {tabIndex === 4 ? (
                <Box>
                  <Card sx={{ p: 2, mt: 2 }}>
                    {/* License Upload */}
                    <Typography variant="h6" fontWeight={600} mb={1}>
                      License
                    </Typography>

                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Upload a valid license file to activate or update your application license.
                    </Typography>

                    <Box
                      sx={{
                        border: '1px dashed',
                        borderColor: 'primary.main',
                        borderRadius: 2,
                        p: 2,
                        backgroundColor: 'action.hover',
                      }}
                    >
                      <Box
                        display="flex"
                        flexDirection={{ xs: 'column', sm: 'row' }}
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                        justifyContent="space-between"
                        gap={2}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            License File
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            Supported formats: .lic, .license, .json
                          </Typography>
                        </Box>

                        <Box>
                          <label htmlFor="license-upload">
                            <Box
                              sx={{
                                minWidth: 150,
                                border: '1px solid',
                                borderColor: 'primary.main',
                                borderRadius: 1.5,
                                px: 2,
                                py: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1,
                                cursor: uploadingLicense ? 'not-allowed' : 'pointer',
                                color: 'primary.main',
                                backgroundColor: 'background.paper',
                                opacity: uploadingLicense ? 0.6 : 1,
                                transition: '0.2s',

                                '&:hover': {
                                  backgroundColor: uploadingLicense
                                    ? 'background.paper'
                                    : 'action.hover',
                                },
                              }}
                            >
                              {uploadingLicense ? (
                                <>
                                  <CircularProgress size={18} />
                                  <Typography variant="body2" fontWeight={500}>
                                    Uploading...
                                  </Typography>
                                </>
                              ) : (
                                <>
                                  <CloudUploadIcon fontSize="small" />
                                  <Typography variant="body2" fontWeight={500}>
                                    Upload License
                                  </Typography>
                                </>
                              )}
                            </Box>
                          </label>

                          <input
                            id="license-upload"
                            type="file"
                            accept=".lic,.license,.json"
                            hidden
                            disabled={uploadingLicense}
                            onChange={(e) => {
                              const file = e.target.files?.[0];

                              if (file) {
                                handleLicenseUpload(file);
                              }

                              e.target.value = '';
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Uploaded File */}
                      {licenseFileName && !uploadingLicense && (
                        <Box
                          mt={2}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                            p: 1.25,
                            borderRadius: 1.5,
                            backgroundColor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={1} minWidth={0}>
                            <DescriptionOutlinedIcon fontSize="small" color="primary" />

                            <Box minWidth={0}>
                              <Typography variant="body2" fontWeight={500} noWrap>
                                {licenseFileName}
                              </Typography>

                              <Typography variant="caption" color="text.secondary">
                                License file uploaded
                              </Typography>
                            </Box>
                          </Box>

                          <IconButton size="small" color="error" onClick={handleRemoveLicense}>
                            <IconX size={17} />
                          </IconButton>
                        </Box>
                      )}
                    </Box>

                    {/* App Details */}
                    <Typography variant="h6" fontWeight={600} mt={4} mb={2}>
                      App Details
                    </Typography>

                    <Box
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      {[
                        {
                          label: 'Status',
                          value: (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2">License is valid</Typography>

                              <Chip
                                label="Valid"
                                size="small"
                                color="success"
                                sx={{ fontWeight: 500 }}
                              />
                            </Stack>
                          ),
                        },
                        {
                          label: 'License',
                          value: 'Perpetual - Enterprise',
                        },
                        {
                          label: 'App Name',
                          value: 'VMS - Visitor Management System',
                        },
                        {
                          label: 'Custom Name & Domain',
                          value: 'VMS | Visitor Management System (vms.com)',
                        },
                        {
                          label: 'Customer Name',
                          value: 'VMS',
                        },
                        {
                          label: 'Expiration Date',
                          value: '5/20/2126 (36,421 days remaining)',
                        },
                      ].map((item, index) => (
                        <Box
                          key={item.label}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 2,
                            px: 2,
                            py: 2,
                            borderBottom: index !== 5 ? '1px solid' : 'none',
                            borderColor: 'divider',
                          }}
                        >
                          <Typography variant="body2" fontWeight={500}>
                            {item.label}
                          </Typography>

                          <Box sx={{ textAlign: 'right' }}>
                            {typeof item.value === 'string' ? (
                              <Typography variant="body2">{item.value}</Typography>
                            ) : (
                              item.value
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Box>

                    {/* Core Features */}
                    <Typography variant="h6" fontWeight={600} mt={4} mb={2}>
                      Core Features
                    </Typography>

                    <Box>
                      {[
                        {
                          name: 'Visitor Management',
                          description:
                            'Manage visitor registration, invitations, and visitor information',
                        },
                        {
                          name: 'Real-Time Tracking',
                          description: 'Real-time visitor tracking and position monitoring',
                        },
                        {
                          name: 'Monitoring Dashboard',
                          description: 'Live visitor monitoring dashboard and site overview',
                        },
                        {
                          name: 'Reports & Analytics',
                          description: 'Reports, analytics, and visitor data export',
                        },
                      ].map((feature, index) => (
                        <Box
                          key={feature.name}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            py: 2,
                            borderBottom: index !== 3 ? '1px solid' : 'none',
                            borderColor: 'divider',
                          }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {feature.name}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                              {feature.description}
                            </Typography>
                          </Box>

                          <Chip
                            label="Enabled"
                            size="small"
                            color="success"
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>
                      ))}
                    </Box>

                    {/* Modules */}
                    <Typography variant="h6" fontWeight={600} mt={4} mb={2}>
                      Modules
                    </Typography>

                    <Box>
                      {[
                        {
                          name: 'Visitor Management',
                          description:
                            'Visitor registration, pre-registration, invitation, and check-in/out',
                        },
                        {
                          name: 'Card Management',
                          description: 'Visitor card issuance, return, and card tracking',
                        },
                        {
                          name: 'Blacklist & Whitelist',
                          description: 'Manage restricted and trusted visitors',
                        },
                        {
                          name: 'Parking Management',
                          description: 'Manage visitor parking and vehicle information',
                        },
                        {
                          name: 'Access Control',
                          description: 'Manage visitor access to registered sites',
                        },
                      ].map((module) => (
                        <Box
                          key={module.name}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 2,
                            py: 2,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {module.name}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                              {module.description}
                            </Typography>
                          </Box>

                          <Chip
                            label="Enabled"
                            size="small"
                            color="success"
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Card>
                </Box>
              ) : null}

              {tabIndex === 5 ? (
                <Box>
                  <DynamicTable data={[]} />
                </Box>
              ) : null}
            </Box>
          </Paper>
        </Box>
        <GlobalBackdropLoading open={uploadingLicense} />
      </Container>
    </PageContainer>
  );
};

export default Content;
