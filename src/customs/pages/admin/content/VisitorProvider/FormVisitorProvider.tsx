import {
  TextField,
  Grid2 as Grid,
  Button,
  Switch,
  FormControl,
  Select,
  FormHelperText,
  Typography,
  InputLabel,
  Paper,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useRef, useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { showSwal } from 'src/customs/components/alerts/alerts';
import {
  createVisitorProvider,
  updateVisitorProviders,
  uploadLogoVisitorProvider,
} from 'src/customs/api/Admin/VisitorProviders';
import { MenuItem } from '@mui/material';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import { useVisitorProviderMutation } from 'src/hooks/VisitorProvider/useVisitorProviderMutation';
import { update } from 'lodash';

interface Props {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  editingId?: string | null;
  onSuccess?: () => void;
}

const FormVisitorProvider = ({ editingId, onSuccess, form, setForm }: Props) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [siteImageFile, setSiteImageFile] = useState<File | null>(null);
  const [removing, setRemoving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    createMutation,
    updateMutation,
    uploadLogoMutation,
  } = useVisitorProviderMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);

    const preview = URL.createObjectURL(file);

    setPreviewUrl(preview);
  };

  const clearLocal = () => {
    setSiteImageFile(null);
    setPreviewUrl(null);
    setForm((prev: any) => ({ ...prev, logo: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = async (e?: React.MouseEvent) => {
    e?.stopPropagation?.();
    if (removing) return;

    const serverPath =
      form.logo && !form.logo.startsWith('data:') && !/^https?:\/\//i.test(form.logo)
        ? form.logo
        : null;

    try {
      setRemoving(true);
      if (serverPath) {
        const rel = serverPath.startsWith('/') ? serverPath : `/${serverPath}`;
        const deletePath = rel.startsWith('/cdn/') ? rel : `/cdn${rel}`;
        await axiosInstance2.delete(deletePath);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      clearLocal();
      setRemoving(false);
    }
  };

  const isDataUrl = (s?: string) => typeof s === 'string' && /^data:image\//i.test(s);

  const handleFileUploads = async (
    id: string,
    fileFromInput?: File | null,
    image?: string | null,
  ) => {
    const tasks: Promise<any>[] = [];

    if (fileFromInput instanceof File) {
      tasks.push(await uploadLogoMutation.mutateAsync({
        id,
        file: fileFromInput,
      }));
    }

    if (image && isDataUrl(image)) {
      const blob = await fetch(image).then((res) => res.blob());
      const file = new File([blob], 'webcam.jpg', { type: 'image/jpeg' });
      tasks.push(await uploadLogoMutation.mutateAsync({
        id,
        file,
      }));
    }

    if (tasks.length === 0) return;

    await Promise.all(tasks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors: Record<string, string> = {};

    if (!form.name?.trim()) {
      validationErrors.name = 'Name is required';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        code: form.code,
        description: form.description,
        // logo: form.logo,
        active: form.active,
        // sort: Number(form.sort),
        // color: form.color,
        // icon: form.icon,
        visitor_category: form.visitor_category,
        support_vehicle: form.support_vehicle,
        need_plate_number: form.need_plate_number,
        max_duration_minutes: Number(form.max_duration_minutes),
        auto_approve: form.auto_approve,
        is_quick_access: form.is_quick_access,
      };


      let id = editingId;

      if (editingId) {
        // await updateVisitorProviders(editingId, payload);
        await updateMutation.mutateAsync({
          id: editingId,
          data: payload,
        });
      } else {
        // const response = await createVisitorProvider(payload);
        const response = await createMutation.mutateAsync(payload);
        id = response?.data?.id ?? response?.id ?? response?.visitor_provider_id;
      }

      if (id) {
        await handleFileUploads(id, selectedFile, null);
      }

      showSwal(
        'success',
        editingId
          ? 'Visitor Provider successfully updated'
          : 'Visitor Provider successfully created',
      );

      onSuccess?.();
    } catch (error: any) {
      showSwal('error', error?.response?.data?.message ?? 'Failed to save Visitor Provider');
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <CustomFormLabel htmlFor="name" sx={{ mt: 0 }} required>
            Name
          </CustomFormLabel>
          <CustomTextField
            id="name"
            value={form.name}
            onChange={(e) =>
              setForm((prev: any) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            error={Boolean(errors.name)}
            helperText={errors.name ?? ''}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <CustomFormLabel htmlFor="code" sx={{ mt: 0 }}>
            Code
          </CustomFormLabel>
          <CustomTextField
            id="code"
            value={form.code}
            onChange={(e) =>
              setForm((prev: any) => ({
                ...prev,
                code: e.target.value,
              }))
            }
            error={Boolean(errors.code)}
            helperText={errors.code ?? ''}
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <CustomFormLabel htmlFor="visitor_category" sx={{ mt: 0 }}>
            Category
          </CustomFormLabel>

          <FormControl fullWidth error={Boolean(errors.visitor_category)}>
            <Select
              //   labelId="visitor-category-label"
              id="visitor_category"
              value={form.visitor_category}
              label="Category"
              onChange={(e) =>
                setForm((prev: any) => ({
                  ...prev,
                  visitor_category: e.target.value,
                }))
              }
            >
              <MenuItem value="Regular">Regular</MenuItem>
              <MenuItem value="VIP">VIP</MenuItem>
              <MenuItem value="Contractor">Contractor</MenuItem>
              <MenuItem value="Vendor">Vendor</MenuItem>
              <MenuItem value="Internship">Internship</MenuItem>
              <MenuItem value="TemporaryWorker">Temporary Worker</MenuItem>
            </Select>

            {errors.visitor_category && <FormHelperText>{errors.visitor_category}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <CustomFormLabel htmlFor="code" sx={{ mt: 0 }}>
            Max Duration (Minutes)
          </CustomFormLabel>
          <TextField
            id="code"
            type="number"
            value={form.max_duration_minutes}
            onChange={(e) =>
              setForm((prev: any) => ({
                ...prev,
                max_duration_minutes: e.target.value,
              }))
            }
            error={Boolean(errors.max_duration_minutes)}
            helperText={errors.max_duration_minutes ?? ''}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 12 }}>
          <CustomFormLabel htmlFor="code" sx={{ mt: 0 }}>
            Description
          </CustomFormLabel>
          <TextField
            id="code"
            value={form.description}
            rows={3}
            onChange={(e) =>
              setForm((prev: any) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            error={Boolean(errors.description)}
            helperText={errors.description ?? ''}
            fullWidth
          />
        </Grid>
        {/* <Grid size={{ xs: 12, lg: 6 }}>
          <CustomFormLabel htmlFor="color" sx={{ mt: 0 }}>
            Color
          </CustomFormLabel>

          <FormControl fullWidth error={Boolean(errors.color)}>
  
            <Select
              id="color"
              displayEmpty
              value={form.color}
              notched={false}
              onChange={(e) =>
                setForm((prev: any) => ({
                  ...prev,
                  color: e.target.value,
                }))
              }
              
              renderValue={(selected) => {
                const selectedItem = [
                  { label: 'Regular', value: '#607D8B' },
                  { label: 'VIP', value: '#FFC107' },
                  { label: 'Contractor', value: '#FF9800' },
                  { label: 'Vendor', value: '#9C27B0' },
                  { label: 'Internship', value: '#4CAF50' },
                  { label: 'Temporary Worker', value: '#F44336' },
                ].find((item) => item.value === selected);

                if (!selectedItem) return 'Select Color';

                return (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        backgroundColor: selectedItem.value,
                        mr: 1,
                      }}
                    />
                    {selectedItem.label}
                  </Box>
                );
              }}
            >
              {[
                { label: 'Regular', value: '#607D8B' },
                { label: 'VIP', value: '#FFC107' },
                { label: 'Contractor', value: '#FF9800' },
                { label: 'Vendor', value: '#9C27B0' },
                { label: 'Internship', value: '#4CAF50' },
                { label: 'Temporary Worker', value: '#F44336' },
              ].map((item) => (
                <MenuItem
                  key={item.value}
                  value={item.value}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 2, // kiri kanan
                  }}
                >
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      backgroundColor: item.value,
                      mr: 1,
                    }}
                  />
                  {item.label}
                </MenuItem>
              ))}
            </Select>

            {errors.color && <FormHelperText>{errors.color}</FormHelperText>}
          </FormControl>
        </Grid> */}
        <Grid size={{ xs: 6, md: 4 }}>
          <CustomFormLabel htmlFor="code" sx={{ mt: 0 }}>
            Active
          </CustomFormLabel>
          <Switch
            checked={form.active}
            onChange={(e) =>
              setForm((prev: any) => ({
                ...prev,
                active: e.target.checked,
              }))
            }
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <CustomFormLabel htmlFor="code" sx={{ mt: 0 }}>
            Support Vehicle
          </CustomFormLabel>
          <Switch
            checked={form.support_vehicle}
            onChange={(e) =>
              setForm((prev: any) => ({
                ...prev,
                support_vehicle: e.target.checked,
              }))
            }
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <CustomFormLabel htmlFor="code" sx={{ mt: 0 }}>
            Need Plate Number
          </CustomFormLabel>
          <Switch
            checked={form.need_plate_number}
            onChange={(e) =>
              setForm((prev: any) => ({
                ...prev,
                need_plate_number: e.target.checked,
              }))
            }
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <CustomFormLabel htmlFor="code" sx={{ mt: 0 }}>
            Auto Approve
          </CustomFormLabel>
          <Switch
            checked={form.auto_approve}
            onChange={(e) =>
              setForm((prev: any) => ({
                ...prev,
                auto_approve: e.target.checked,
              }))
            }
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <CustomFormLabel htmlFor="code" sx={{ mt: 0 }}>
            Quick Access
          </CustomFormLabel>
          <Switch
            checked={form.is_quick_access}
            onChange={(e) =>
              setForm((prev: any) => ({
                ...prev,
                is_quick_access: e.target.checked,
              }))
            }
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 12 }}>
          <CustomFormLabel htmlFor="code" sx={{ mt: 0 }}>
            Logo
          </CustomFormLabel>
          {/* <Paper sx={{ p: 1 }}> */}
          <Box>
            <Box
              sx={{
                border: '2px dashed #90caf9',
                borderRadius: 2,
                padding: 4,
                textAlign: 'center',
                backgroundColor: '#f5faff',
                cursor: 'pointer',
                width: '100%',
                margin: '0 auto',
                pointerEvents: 'auto',
                opacity: 1,
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: '#42a5f5' }} />
              <Typography variant="subtitle1" sx={{ mt: 1 }}>
                Upload Employee Image
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mt: 0.5,
                }}
              >
                <Typography variant="body1" color="textSecondary">
                  Supports: JPG, JPEG, PNG, Up to:
                  <span style={{ fontWeight: '700' }}>1 Mb</span>
                </Typography>
              </Box>

              <input
                type="file"
                accept="image/*"
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
              //   disabled={isBatchEdit}
              />

              {previewUrl && (
                <Box mt={2} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      width: 300,
                      aspectRatio: '16/9',
                      borderRadius: 12,
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                    }}
                  >
                    <img
                      src={previewUrl}
                      alt="preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        cursor: 'pointer',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <Button
                    sx={{ mt: 1 }}
                    size="small"
                    variant="outlined"
                    color="error"
                    disabled={removing}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                  >
                    {removing ? 'Removing…' : 'Remove'}
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
          {/* </Paper> */}
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Box display="flex" justifyContent="flex-end" mt={0}>
            <Button
              color="primary"
              variant="contained"
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Submit
            </Button>
          </Box>
        </Grid>
      </Grid>
      <Backdrop open={updateMutation.isPending || createMutation.isPending}>
        <CircularProgress />
      </Backdrop>
    </form>
  );
};

export default FormVisitorProvider;
