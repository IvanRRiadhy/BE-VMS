import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  Box,
  Grid2 as Grid,
  Typography,
  Button,
  TextField,
  Autocomplete,
  FormControlLabel,
  Switch,
} from '@mui/material';
// import { Item } from 'src/customs/api/models/Admin/Setting';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import { getAllOrganizations, getRegisteredSite } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';
interface FormSettingRegisteredSiterops {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  editingId: string;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
}

const FormSettingRegisteredSite: React.FC<FormSettingRegisteredSiterops> = ({
  formData,
  setFormData,
  editingId,
  onSubmit,
  onCancel,
}) => {
  const { token } = useSession();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onCancel?.();
  };

  const [AllOrganization, setAllOrganization] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getRegisteredSite(token as string);
      setAllOrganization(res?.collection ?? []);
    };

    fetchData();
  }, [token]);

  return (
    <form onSubmit={handleSubmit} style={{ height: '100%' }}>
      <Box
        sx={{
          overflowX: 'auto',
          p: 1,
          paddingTop: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <CustomFormLabel htmlFor="name" sx={{ margin: 0 }}>
              <Typography variant="h6" mb={1} fontWeight="600">
                Registered Site
              </Typography>
            </CustomFormLabel>
            <Autocomplete
              options={AllOrganization}
              getOptionLabel={(option) => option?.name ?? ''}
              isOptionEqualToValue={(option, value) =>
                option?.id?.toLowerCase() === value?.id?.toLowerCase()
              }
              value={
                formData.site ??
                AllOrganization.find(
                  (o) => o.id?.toLowerCase() === formData.site_id?.toLowerCase(),
                ) ??
                null
              }
              onChange={(_, newValue) => {
                setFormData((prev: any) => ({
                  ...prev,
                  site_id: newValue?.id ?? '',
                  site: newValue ?? null, // 🔴 simpan object
                }));
              }}
              renderInput={(params) => (
                <TextField {...params} placeholder="Select Registered Site" />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!formData.can_confirmation_arrival}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      can_confirmation_arrival: e.target.checked,
                    }))
                  }
                />
              }
              label="Can Confirmation Arrival"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!formData.can_extend_period}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      can_extend_period: e.target.checked,
                    }))
                  }
                />
              }
              label="Can Extend Period"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!formData.can_extend_visit}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      can_extend_visit: e.target.checked,
                    }))
                  }
                />
              }
              label="Can Extend Visit"
            />
          </Grid>
        </Grid>
        <Box display={'flex'} justifyContent={'flex-end'}>
          <Button onClick={onCancel} sx={{ mt: 2, mr: 1 }}>
            Back
          </Button>
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Submit
          </Button>
        </Box>
      </Box>
    </form>
  );
};

export default FormSettingRegisteredSite;
