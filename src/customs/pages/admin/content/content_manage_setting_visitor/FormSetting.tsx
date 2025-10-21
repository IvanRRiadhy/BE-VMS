import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { Box, Grid2 as Grid, Typography, Button, TextField, Autocomplete } from '@mui/material';
import { Item } from 'src/customs/api/models/Admin/Setting';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import { getAllOrganizations } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';
interface FormSettingSmtpProps {
  formData: Item;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  editingId: string;
  onSubmit: (data: Item) => void;
  onCancel?: () => void;
}

const FormSetting: React.FC<FormSettingSmtpProps> = ({
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
  };
  const [AllOrganization, setAllOrganization] = useState<any[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllOrganizations(token as string);
      setAllOrganization(res?.collection ?? []);
    };

    fetchData();
  }, [token]);

  return (
    <form onSubmit={handleSubmit} style={{ height: '100%' }}>
      <Box
        sx={{
          overflowX: 'auto',
          p: 2,
          paddingTop: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <CustomFormLabel htmlFor="name" sx={{ margin: 0 }}>
              <Typography variant="subtitle1" mb={1} fontWeight="500">
                Visitor Organization
              </Typography>
            </CustomFormLabel>
            <Autocomplete
              options={AllOrganization}
              getOptionLabel={(option) => option?.name ?? ''}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              value={AllOrganization.find((o) => o.id === formData.organization_id) ?? null}
              onChange={(_, newValue) => {
                const orgId = newValue?.id ?? null;
                setSelectedOrganizationId(orgId);
                setFormData((prev: Item) => ({
                  ...prev,
                  organization_id: orgId,
                }));
              }}
              renderInput={(params) => (
                <TextField {...params} placeholder="Select Visitor Organization" />
              )}
            />
          </Grid>
        </Grid>
        <Box display={'flex'} justifyContent={'flex-end'}>
          <Button onClick={onCancel} sx={{ mt: 2, mr: 1 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Save
          </Button>
        </Box>
      </Box>
    </form>
  );
};

export default FormSetting;
