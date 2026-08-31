import React, { useEffect, useRef, useState } from 'react';
import {
  Grid2 as Grid,
  Typography,
  Card,
  CardContent,
  Avatar,
  Tabs,
  Tab,
  Box,
  TextField,
  Divider,
  Button,
  Stack,
  useMediaQuery,
  useTheme,
  MenuItem,
  Chip,
} from '@mui/material';
import Container from 'src/components/container/PageContainer';
import { useAuth } from 'src/customs/contexts/AuthProvider';
import { updatePasswordUser, updateProfile } from 'src/customs/api/users';
import type { Item } from 'src/customs/api/models/profile';
import PageContainer from 'src/customs/components/container/PageContainer';

import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import { showSwal } from 'src/customs/components/alerts/alerts';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { InputAdornment, IconButton } from '@mui/material';
import { useProfile } from 'src/hooks/Profile/useProfile';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

const DetailProfile = () => {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const { data: profile, refetch } = useProfile();
  const isAdmin = profile?.group_name === 'Admin';
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    con_password: '',
  });
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [formData, setFormData] = useState<Item>({
    id: '',
    fullname: '',
    username: '',
    email: '',
    group_name: '',
    gender: '',
    address: '',
    password: '',
    phone: '',
    is_vip: false,
    is_email_verified: false,
    organization_name: '',
    district_name: '',
    department_name: '',
  });

  useEffect(() => {
    if (!profile) return;

    setFormData({
      id: profile.id ?? '',
      fullname: profile.fullname ?? '',
      username: profile.username ?? '',
      email: profile.email ?? '',
      group_name: profile.group_name ?? '',
      gender: profile.gender ?? '',
      address: profile.address ?? '',
      phone: profile.phone ?? '',
      password: profile.password ?? '',
      is_vip: profile.is_vip ?? false,
      is_email_verified: profile.is_email_verified ?? false,
      organization_name: profile.organization_name ?? '',
      district_name: profile.district_name ?? '',
      department_name: profile.department_name ?? '',
    });
  }, [profile]);

  const handleUpdate = async () => {
    try {
      const payload = {
        group_name: formData.group_name,
        email: formData.email,
        fullname: formData.fullname,
        gender: formData.gender as 'Female' | 'Male' | 'Other',
        address: formData.address,
        phone: formData.phone,
      };
      await updateProfile(payload);
      await refetch();
      showSwal('success', 'Successfully updated profile');
    } catch (error) {
      showSwal('error', 'Failed to update profile');
    }
  };

  // const handleCancel = () => setIsEditing(false);
  const handleChange = (_e: React.SyntheticEvent, newValue: number) => setActiveTab(newValue);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async () => {
    try {
      if (passwordData.new_password !== passwordData.con_password) {
        showSwal('error', 'Password confirmation does not match');
        return;
      }

      await updatePasswordUser({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
        con_password: passwordData.con_password,
      });

      setPasswordData({
        old_password: '',
        new_password: '',
        con_password: '',
      });

      showSwal('success', 'Password updated successfully');
    } catch (error: any) {
      const collection = error?.response?.data?.collection || error?.collection;
      const messages = Array.isArray(collection)
        ? collection.join('\n')
        : error?.message || 'Failed to update password';

      showSwal('error', messages);
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);

  const passwordMismatch =
    !!passwordData.new_password &&
    !!passwordData.con_password &&
    passwordData.new_password !== passwordData.con_password;

  const content = (
    <Container title="Profile">
      <Grid container justifyContent="center" sx={{ mt: 4 }}>
        <Grid size={{ xs: 12, md: 10, lg: 8 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent sx={{ px: 0 }}>
              <Grid container spacing={3}>
                {/* Sidebar kiri */}
                <Grid
                  size={{ xs: 12, md: 4 }}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  textAlign="center"
                  sx={{
                    borderRight: { md: '1px solid #eee' },
                    borderBottom: { xs: '1px solid #eee', md: 'none' },
                    pb: 2,
                    px: { xs: 2, md: 0 },
                  }}
                >
                  <Avatar
                    alt="User Avatar"
                    src={user?.photo || ''}
                    sx={{ width: 120, height: 120, mb: 2 }}
                  />
                  <Typography variant="h6" fontWeight="bold">
                    {formData.fullname}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" mt={1}>
                    {formData.group_name || 'User'}
                  </Typography>

                  <Tabs
                    orientation={isMobile ? 'horizontal' : 'vertical'}
                    value={activeTab}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                      mt: 4,
                      width: '100%',
                      '& .MuiTab-root': {
                        alignItems: 'flex-start',
                        justifyContent: isMobile ? 'center' : 'flex-start',
                        textTransform: 'none',
                        fontWeight: 500,
                      },
                      '& .MuiTabs-flexContainer': {
                        flexDirection: isMobile ? 'row' : 'column',
                      },
                    }}
                  >
                    <Tab label="Personal Info" />
                    <Tab label="Change Password" />
                    <Tab label="License Info" />
                  </Tabs>
                </Grid>

                {/* Konten kanan */}
                <Grid size={{ xs: 12, md: 8 }}>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {/* active tab 0 1 2 */}
                      {activeTab === 0
                        ? 'Personal Information'
                        : activeTab === 1
                          ? 'Change Password'
                          : activeTab === 2
                            ? 'License Info'
                            : 'License Information'}
                    </Typography>
                    {/* <Typography variant="body2" color="text.secondary" gutterBottom>
                      {activeTab === 0
                        ? 'You can edit your personal details.'
                        : 'You can edit your organization-related details.'}
                    </Typography> */}
                    <Divider sx={{ mb: 3, mt: 1 }} />

                    {activeTab === 0 && (
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                          <CustomFormLabel sx={{ mt: 0 }}>Fullname</CustomFormLabel>
                          <TextField
                            fullWidth
                            label=""
                            name="fullname"
                            value={formData.fullname}
                            onChange={handleInputChange}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <CustomFormLabel sx={{ mt: 0 }}>Email</CustomFormLabel>
                          <TextField
                            fullWidth
                            label=""
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                        </Grid>
                        {/* <Grid size={{ xs: 12 }}>
                            <TextField
                              fullWidth
                              label="Group Name"
                              name="group_name"
                              value={formData.group_name}
                              onChange={handleInputChange}
                 
                            />
                          </Grid> */}
                        <Grid size={{ xs: 12 }}>
                          <CustomFormLabel sx={{ mt: 0 }}>Gender</CustomFormLabel>

                          <TextField
                            select
                            fullWidth
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                          >
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <CustomFormLabel sx={{ mt: 0 }}>Phone Number</CustomFormLabel>
                          <TextField
                            fullWidth
                            label=""
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <CustomFormLabel sx={{ mt: 0 }}>Address</CustomFormLabel>
                          <TextField
                            fullWidth
                            label=""
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <CustomFormLabel sx={{ mt: 0 }}>Organization Name</CustomFormLabel>
                          <CustomTextField
                            fullWidth
                            label=""
                            name="organization_name"
                            value={formData.organization_name}
                            onChange={handleInputChange}
                            disabled
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <CustomFormLabel sx={{ mt: 0 }}>Department Name</CustomFormLabel>
                          <CustomTextField
                            fullWidth
                            label=""
                            name="department_name"
                            value={formData.department_name}
                            onChange={handleInputChange}
                            disabled
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <CustomFormLabel sx={{ mt: 0 }}>District Name</CustomFormLabel>
                          <CustomTextField
                            fullWidth
                            label=""
                            name="district_name"
                            value={formData.district_name}
                            onChange={handleInputChange}
                            disabled
                          />
                        </Grid>
                        {/* Tombol aksi */}
                        <Stack direction="row" justifyContent="flex-end" spacing={1} mt={1}>
                          <>
                            <Button variant="contained" color="primary" onClick={handleUpdate}>
                              Update Profile
                            </Button>
                            {/* <Button variant="outlined" color="inherit" onClick={handleCancel}>
                            Cancel
                          </Button> */}
                          </>
                        </Stack>
                      </Grid>
                    )}

                    {/* ORGANIZATION INFO */}
                    {/* {activeTab === 1 && <Grid container spacing={2}></Grid>} */}
                    {activeTab === 1 && (
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                          <CustomFormLabel sx={{ mt: 0 }}>Old Password</CustomFormLabel>
                          <TextField
                            fullWidth
                            type={showOldPassword ? 'text' : 'password'}
                            name="old_password"
                            value={passwordData.old_password}
                            onChange={handlePasswordChange}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowOldPassword((v) => !v)}
                                    edge="end"
                                  >
                                    {showOldPassword ? <IconEyeOff /> : <IconEye />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                          <CustomFormLabel>New Password</CustomFormLabel>
                          <TextField
                            fullWidth
                            type={showPassword ? 'text' : 'password'}
                            name="new_password"
                            value={passwordData.new_password}
                            onChange={handlePasswordChange}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton onClick={() => setShowPassword((v) => !v)} edge="end">
                                    {showPassword ? <IconEyeOff /> : <IconEye />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                          <CustomFormLabel>Confirm Password</CustomFormLabel>
                          <TextField
                            fullWidth
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="con_password"
                            value={passwordData.con_password}
                            onChange={handlePasswordChange}
                            error={passwordMismatch}
                            helperText={
                              passwordMismatch
                                ? 'Confirm password must match the new password.'
                                : ''
                            }
                            FormHelperTextProps={{
                              sx: {
                                ml: 0,
                                mr: 0,
                                mt: 0.5, // sesuaikan atau 0 jika ingin benar-benar rapat
                              },
                            }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowConfirmPassword((v) => !v)}
                                    edge="end"
                                  >
                                    {showConfirmPassword ? <IconEyeOff /> : <IconEye />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                          <Button variant="contained" onClick={handleChangePassword}>
                            Change Password
                          </Button>
                        </Grid>
                      </Grid>
                    )}
                    {activeTab === 2 && (
                      <Box>
                        {/* App Details */}
                        <Typography variant="h6" fontWeight={600} mb={2}>
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
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );

  if (isAdmin) {
    return (
      <PageContainer
        itemDataCustomNavListing={AdminNavListingData}
        itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
      >
        {content}
      </PageContainer>
    );
  }
  return content;
};

export default DetailProfile;
