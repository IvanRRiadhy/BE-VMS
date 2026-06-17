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
  CircularProgress,
} from '@mui/material';
import Container from 'src/components/container/PageContainer';
import { useAuth } from 'src/customs/contexts/AuthProvider';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getProfile, updateProfile } from 'src/customs/api/users';
import type { GetProfileResponse, Item } from 'src/customs/api/models/profile';
import PageContainer from 'src/customs/components/container/PageContainer';

import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import { updateUser } from 'src/customs/api/admin';
import { showSwal } from 'src/customs/components/alerts/alerts';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';

const DetailProfile = () => {
  const [activeTab, setActiveTab] = useState(0);
  // const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { token } = useSession();
  const { user } = useAuth();
  const roleAccess = localStorage.getItem('roleAccess');
  const isAdmin = roleAccess === 'Admin';

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

  const fetchProfile = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const res = await getProfile(token);

      const d = res?.collection;

      if (!d) return;

      setFormData({
        id: d.id || '',
        fullname: d.fullname || '',
        username: d.username || '',
        email: d.email || '',
        group_name: d.group_name || '',
        gender: d.gender || '',
        address: d.address || '',
        phone: d.phone || '',
        password: d.password || '',
        is_vip: d.is_vip ?? false,
        is_email_verified: d.is_email_verified ?? false,
        organization_name: d.organization_name || '',
        district_name: d.district_name || '',
        department_name: d.department_name || '',
      });
    } finally {
      setLoading(false);
    }
  };
  const prevToken = useRef<string | null>(null);

  useEffect(() => {
    if (!token) return;
    if (prevToken.current === token) return;

    prevToken.current = token;

    fetchProfile();
  }, [token]);

  // 🔹 Simpan perubahan ke API
  const handleUpdate = async () => {
    try {
      if (!token) return;

      // setLoading(true);

      const payload = {
        group_name: formData.group_name,
        email: formData.email,
        fullname: formData.fullname,
        gender: formData.gender as 'Female' | 'Male' | 'Other',
        address: formData.address,
        phone: formData.phone,
      };

      await updateProfile(token, payload);

      await fetchProfile();

      showSwal('success', 'Successfully updated profile');
      // setIsEditing(false);
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
                    <Tab label="Organization Info" />
                  </Tabs>
                </Grid>

                {/* Konten kanan */}
                <Grid size={{ xs: 12, md: 8 }}>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {activeTab === 0 ? ' Personal Information' : ' Organization Information'}
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
                            fullWidth
                            label=""
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                          />
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
                          <CustomFormLabel sx={{ mt: 0 }}>Password</CustomFormLabel>
                          <TextField
                            fullWidth
                            label=""
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <CustomFormLabel sx={{ mt: 0 }}>Confirmation Password</CustomFormLabel>
                          <TextField
                            fullWidth
                            label=""
                            name="passsowrd"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                          />
                        </Grid>
                      </Grid>
                    )}

                    {/* ORGANIZATION INFO */}
                    {activeTab === 1 && (
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                          <CustomFormLabel sx={{ mt: 0 }}>Organization Name</CustomFormLabel>
                          <TextField
                            fullWidth
                            label=""
                            name="organization_name"
                            value={formData.organization_name}
                            onChange={handleInputChange}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <CustomFormLabel sx={{ mt: 0 }}>Department Name</CustomFormLabel>
                          <TextField
                            fullWidth
                            label=""
                            name="department_name"
                            value={formData.department_name}
                            onChange={handleInputChange}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <CustomFormLabel sx={{ mt: 0 }}>District Name</CustomFormLabel>
                          <TextField
                            fullWidth
                            label=""
                            name="district_name"
                            value={formData.district_name}
                            onChange={handleInputChange}
                          />
                        </Grid>
                      </Grid>
                    )}

                    {/* Tombol aksi */}
                    <Stack direction="row" justifyContent="flex-end" spacing={1} mt={3}>
                      {/* {!isEditing ? (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => setIsEditing(true)}
                        >
                          Edit
                        </Button>
                      ) : ( */}
                      <>
                        <Button variant="contained" color="primary" onClick={handleUpdate}>
                          Update Profile
                        </Button>
                        {/* <Button variant="outlined" color="inherit" onClick={handleCancel}>
                            Cancel
                          </Button> */}
                      </>
                      {/* )} */}
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }
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
