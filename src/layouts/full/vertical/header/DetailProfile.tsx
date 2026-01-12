import React, { useEffect, useState } from 'react';
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
import axiosInstance from 'src/customs/api/interceptor';
import { getProfile } from 'src/customs/api/users';
import type { GetProfileResponse, Item } from 'src/customs/api/models/profile';
import PageContainer from 'src/customs/components/container/PageContainer';

import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';

const DetailProfile = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { token } = useSession();
  const { user } = useAuth();

  const [formData, setFormData] = useState<Item>({
    id: '',
    fullname: '',
    username: '',
    email: '',
    group_name: '',
    gender: '',
    address: '',
    phone: '',
    is_vip: false,
    is_email_verified: false,
    organization_name: '',
    district_name: '',
    department_name: '',
  });

  // 🔹 Ambil data profil dari API
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const res = await getProfile(token);

        // ✅ API mengembalikan bentuk { status, collection }
        const d = res?.collection;
        if (!d) return;

        setFormData({
          id: d.id || '',
          fullname: d.fullname || '',
          username: d.username || '',
          email: d.email || '',
          group_name: d.group_name || '',
          gender: d.gender || (d as any).Gender || '',
          address: d.address || '',
          phone: d.phone || '',
          is_vip: d.is_vip ?? false,
          is_email_verified: d.is_email_verified ?? false,
          organization_name: d.organization_name || '',
          district_name: d.district_name || '',
          department_name: d.department_name || '',
        });
      } catch (err) {
        console.error('Gagal mengambil data profil:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  // 🔹 Simpan perubahan ke API
  const handleSave = async () => {
    try {
      setLoading(true);
      await axiosInstance.put(
        '/profile',
        {
          fullname: formData.fullname,
          email: formData.email,
          gender: formData.gender,
          phone: formData.phone,
          address: formData.address,
          organization_name: formData.organization_name,
          department_name: formData.department_name,
          district_name: formData.district_name,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setIsEditing(false);
    } catch (err) {
      console.error('Gagal menyimpan perubahan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => setIsEditing(false);
  const handleChange = (_e: React.SyntheticEvent, newValue: number) => setActiveTab(newValue);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    // <PageContainer
    //   itemDataCustomNavListing={AdminNavListingData}
    //   itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    // >
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
                        {activeTab === 0
                          ? 'Edit Personal Information'
                          : 'Edit Organization Information'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {activeTab === 0
                          ? 'You can edit your personal details.'
                          : 'You can edit your organization-related details.'}
                      </Typography>
                      <Divider sx={{ mb: 3, mt: 1 }} />

                      {/* PERSONAL INFO */}
                      {activeTab === 0 && (
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12 }}>
                            <TextField
                              fullWidth
                              label="Full Name"
                              name="fullname"
                              value={formData.fullname}
                              onChange={handleInputChange}
                              InputProps={{ readOnly: !isEditing }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <TextField
                              fullWidth
                              label="Email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              InputProps={{ readOnly: !isEditing }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <TextField
                              fullWidth
                              label="Gender"
                              name="gender"
                              value={formData.gender}
                              onChange={handleInputChange}
                              InputProps={{ readOnly: !isEditing }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <TextField
                              fullWidth
                              label="Phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              InputProps={{ readOnly: !isEditing }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <TextField
                              fullWidth
                              label="Address"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              InputProps={{ readOnly: !isEditing }}
                            />
                          </Grid>
                        </Grid>
                      )}

                      {/* ORGANIZATION INFO */}
                      {activeTab === 1 && (
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12 }}>
                            <TextField
                              fullWidth
                              label="Organization Name"
                              name="organization_name"
                              value={formData.organization_name}
                              onChange={handleInputChange}
                              InputProps={{ readOnly: !isEditing }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <TextField
                              fullWidth
                              label="Department Name"
                              name="department_name"
                              value={formData.department_name}
                              onChange={handleInputChange}
                              InputProps={{ readOnly: !isEditing }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <TextField
                              fullWidth
                              label="District Name"
                              name="district_name"
                              value={formData.district_name}
                              onChange={handleInputChange}
                              InputProps={{ readOnly: !isEditing }}
                            />
                          </Grid>
                        </Grid>
                      )}

                      {/* Tombol aksi */}
                      <Stack direction="row" justifyContent="flex-end" spacing={1} mt={3}>
                        {!isEditing ? (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setIsEditing(true)}
                          >
                            Edit
                          </Button>
                        ) : (
                          <>
                            <Button variant="contained" color="success" onClick={handleSave}>
                              Save Changes
                            </Button>
                            <Button variant="outlined" color="inherit" onClick={handleCancel}>
                              Cancel
                            </Button>
                          </>
                        )}
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    // </PageContainer>
  );
};

export default DetailProfile;
