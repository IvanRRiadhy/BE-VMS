import { useEffect, useState } from 'react';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import {
  Backdrop,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid2 as Grid,
  Portal,
  Typography,
} from '@mui/material';
import printBadge from 'src/assets/images/print_badge.jpeg';
import { PrintBadgeSchema } from 'src/customs/api/validations/PrintBadgeSchema';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getPrintBadgeConfig, updatePrintBadgeConfig } from 'src/customs/api/Admin/PrintBadge';
import FormPrintBadge from './FormPrintBadge';

type PrintBadgeForm = {
  logo: File | null;
  footer_text: string;
  name: string;
  printer_name: string;
  printer_vendor_id: string;
  printer_paper_size: string;
};

const Content = () => {
  const { token } = useSession();
  const [formData, setFormData] = useState<PrintBadgeForm>({
    logo: null,
    footer_text: '',
    name: '',
    printer_name: '',
    printer_vendor_id: '',
    printer_paper_size: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [printBadgeConfig, setPrintBadgeConfig] = useState<any | null>(null);
  const handleChange = (field: keyof PrintBadgeForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // const uploadFileToCDN = async (file: File, id: string, token: string): Promise<string | null> => {
  //   if (!(file instanceof File)) return null;

  //   const formData = new FormData();
  //   formData.append('logo', file);

  //   try {
  //     const response = await axiosInstance2.post(`/api/print-badge/upload/${id}`, formData, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     const fileUrl = response.data?.collection?.file_url;
  //     if (!fileUrl) return null;

  //     return fileUrl.startsWith('//') ? `https:${fileUrl}` : fileUrl;
  //   } catch (error) {
  //     console.error('Upload failed:', error);
  //     return null;
  //   }
  // };

  const uploadFileToCDN = async (file: File, id: string, token: string): Promise<string | null> => {
    if (!(file instanceof File)) return null;

    const uploadFormData = new FormData();
    uploadFormData.append('logo', file);

    try {
      const response = await axiosInstance2.post(`/api/print-badge/upload/${id}`, uploadFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': undefined,
        },
        transformRequest: [(data) => data],
      });

      const fileUrl = response.data?.collection?.file_url;
      console.log('uploaded file url:', fileUrl);
      if (!fileUrl) return null;

      return fileUrl.startsWith('//') ? `https:${fileUrl}` : fileUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
  };

  const deleteCDN = async (fileUrl: string, token: string) => {
    try {
      await axiosInstance2.delete(`/cdn${fileUrl}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          file_url: fileUrl,
        },
      });
      console.log('Deleted old logo from CDN:', fileUrl);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleSubmit = async () => {
    if (!printBadgeConfig?.id) return;

    setLoading(true);
    setErrors({});

    const result = await PrintBadgeSchema.safeParseAsync({
      ...formData,
      printer_paper_size: formData.printer_paper_size
        ? Number(formData.printer_paper_size)
        : undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0];
        if (field) fieldErrors[field as string] = err.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      // let logoUrl: string | null = printBadgeConfig.logo ?? null;
      const oldLogo = printBadgeConfig.logo ?? null;

      let logoUrl: string | null = oldLogo;

      if (formData.logo instanceof File) {
        const uploadedUrl = await uploadFileToCDN(
          formData.logo,
          printBadgeConfig.id,
          token as string,
        );

        if (!uploadedUrl) {
          setErrors({ logo: 'Upload failed' });
          return;
        }

        logoUrl = uploadedUrl;
      }

      const payload = {
        logo: logoUrl,
        name: result.data.name,
        footer_text: result.data.footer_text,
        printer_name: result.data.printer_name,
        printer_paper_size: result.data.printer_paper_size,
      };

      await updatePrintBadgeConfig(printBadgeConfig.id, payload, token as string);

      if (oldLogo && oldLogo !== logoUrl) {
        try {
          await deleteCDN(oldLogo, token as string);
        } catch (err) {
          console.error(err);
        }
      }
      setPrintBadgeConfig((prev: any) => ({
        ...prev,
        ...payload,
      }));

      if (formData.logo instanceof File) {
        setFormData((prev) => ({
          ...prev,
          logo: null,
        }));
      }
      showSwal('success', 'Successfully updated print badge.');
    } catch (error: any) {
      showSwal('error', error?.response?.data?.msg || 'Failed to update print badge.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPrintBadgeConfig(token as string);
        const config = res?.collection;

        setPrintBadgeConfig(config);

        setFormData({
          logo: null,
          name: config.name ?? '',
          footer_text: config.footer_text ?? '',
          printer_name: config.printer_name ?? '',
          printer_vendor_id: config.printer_vendor_id ?? '',
          printer_paper_size: config.printer_paper_size ?? '',
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [token]);

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Print Badge" description="Print Badge page">
        <Box>
          <Grid container spacing={3} alignItems={'stretch'} justifyContent={'center'}>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Box sx={{ backgroundColor: 'white', p: 2, height: '100%', alignItems: 'stretch' }}>
                <Typography variant="h5" gutterBottom mb={2}>
                  Print Badge Configuration
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <FormPrintBadge
                  formData={formData}
                  errors={errors}
                  printBadgeConfig={printBadgeConfig}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 4.5, xl: 3.8 }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" mb={1} fontWeight={'bold'}>
                  Live Preview
                </Typography>
                <Divider sx={{ mb: 1 }} />
                <CardContent
                  sx={{
                    backgroundColor: '#e1e6e8',
                    borderRadius: 1,
                    flexGrow: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <img src={printBadge} alt="printBadge" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
      <Portal>
        <Backdrop sx={{ color: '#fff', zIndex: 99999 }} open={loading}>
          <CircularProgress color="primary" />
        </Backdrop>
      </Portal>
    </PageContainer>
  );
};

export default Content;
