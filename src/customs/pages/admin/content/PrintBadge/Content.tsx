import React, { useEffect, useState } from 'react';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import {
  Avatar,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2 as Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import printBadge from 'src/assets/images/print_badge.jpeg';
import { PrintBadgeSchema } from 'src/customs/api/validations/PrintBadgeSchema';
import { showSwal } from 'src/customs/components/alerts/alerts';
import axiosInstance, { axiosInstance2, BASE_URL } from 'src/customs/api/interceptor';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  getPrintBadgeConfig,
  updatePrintBadgeConfig,
} from 'src/customs/api/models/Admin/PrintBadge';
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

  const handleChange = (field: keyof PrintBadgeForm, value: any) => {
    // console.log('typing:', field);
    setFormData((prev) => ({ ...prev, [field]: value }));

    // // clear error on change
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const uploadFileToCDN = async (file: File, id: string, token: string): Promise<string | null> => {
    if (!(file instanceof File)) return null;

    const formData = new FormData();
    formData.append('logo', file);

    try {
    const response = await axiosInstance2.post(`/api/print-badge/upload/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('response', response);

      const fileUrl = response.data?.collection?.file_url;
      if (!fileUrl) return null;

      return fileUrl.startsWith('//') ? `https:${fileUrl}` : fileUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!printBadgeConfig?.id) return;

    setLoading(true);
    setErrors({});

    // 1️⃣ VALIDASI
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
      let logoUrl: string | null = printBadgeConfig.logo ?? null;

      // 2️⃣ UPLOAD FILE JIKA ADA FILE BARU
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

      // 3️⃣ SAFETY CHECK (opsional tapi bagus)
      if (!logoUrl) {
        setErrors({ logo: 'Logo is required' });
        return;
      }

      // 4️⃣ BUILD PAYLOAD
      const payload = {
        logo: logoUrl,
        name: result.data.name,
        footer_text: result.data.footer_text,
        printer_name: result.data.printer_name,
        printer_paper_size: result.data.printer_paper_size,
      };

      console.log('payload', payload);

      // 5️⃣ UPDATE CONFIG
      await updatePrintBadgeConfig(printBadgeConfig.id, payload, token as string);

      showSwal('success', 'Print Badge updated.');
    } catch (error) {
      console.error(error);
      showSwal('error', 'Failed to update print badge.');
    } finally {
      setLoading(false);
    }
  };

  const [printBadgeConfig, setPrintBadgeConfig] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPrintBadgeConfig(token as string);
        const config = res?.collection;
        console.log('config', config);

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
  }, []);

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Print Badge" description="Print Badge page">
        <Box>
          <Grid container spacing={3} alignItems={'start'} justifyContent={'center'}>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Box sx={{ backgroundColor: 'white', p: 2, height: '100%' }}>
                <Typography variant="h5" gutterBottom mb={2}>
                  Print Badge
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
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <img src={printBadge} alt="printBadge" />
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Backdrop sx={{ color: '#fff', zIndex: 99999 }} open={loading}>
        <CircularProgress color="primary" size={50} />
      </Backdrop>
    </PageContainer>
  );
};

export default Content;
