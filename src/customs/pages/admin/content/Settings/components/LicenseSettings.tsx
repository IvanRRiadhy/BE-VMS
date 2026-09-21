import { Box, Card, Chip, CircularProgress, IconButton, Stack, Typography } from '@mui/material';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

import { IconX } from '@tabler/icons-react';

interface LicenseSettingsProps {
  uploadingLicense: boolean;
  licenseFileName?: string | null;
  handleLicenseUpload: (file: File) => void;
  handleRemoveLicense: () => void;
}

const LicenseSettings = ({
  uploadingLicense,
  licenseFileName,
  handleLicenseUpload,
  handleRemoveLicense,
}: LicenseSettingsProps) => {
  const appDetails = [
    {
      label: 'Status',
      value: (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2">License is valid</Typography>

          <Chip label="Valid" size="small" color="success" sx={{ fontWeight: 500 }} />
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
  ];

  const coreFeatures = [
    {
      name: 'Visitor Management',
      description: 'Manage visitor registration, invitations, and visitor information',
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
  ];

  const modules = [
    {
      name: 'Visitor Management',
      description: 'Visitor registration, pre-registration, invitation, and check-in/out',
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
  ];

  return (
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
                    backgroundColor: uploadingLicense ? 'background.paper' : 'action.hover',
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
        {appDetails.map((item, index) => (
          <Box
            key={item.label}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              px: 2,
              py: 2,
              borderBottom: index !== appDetails.length - 1 ? '1px solid' : 'none',
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
      {/* <Typography variant="h6" fontWeight={600} mt={4} mb={2}>
        Core Features
      </Typography>

      <Box>
        {coreFeatures.map((feature, index) => (
          <Box
            key={feature.name}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              py: 2,
              borderBottom: index !== coreFeatures.length - 1 ? '1px solid' : 'none',
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

            <Chip label="Enabled" size="small" color="success" sx={{ fontWeight: 500 }} />
          </Box>
        ))}
      </Box> */}

      {/* Modules */}
      {/* <Typography variant="h6" fontWeight={600} mt={4} mb={2}>
        Modules
      </Typography>

      <Box>
        {modules.map((module) => (
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

            <Chip label="Enabled" size="small" color="success" sx={{ fontWeight: 500 }} />
          </Box>
        ))}
      </Box> */}
    </Card>
  );
};

export default LicenseSettings;
