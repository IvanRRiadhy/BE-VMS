import {
  Button,
  Grid2 as Grid,
  Alert,
  Typography,
  CircularProgress,
  FormControlLabel,
  Switch,
  Paper,
  Button as MuiButton,
  MenuItem,
  Divider,
  TableContainer,
  TableHead,
  Table,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect, useState, useRef } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { useSession } from 'src/customs/contexts/SessionContext';

import { IconTrash } from '@tabler/icons-react';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import {
  CreateCustomFieldRequest,
  CreateCustomFieldRequestSchema,
  FieldType,
  multiOptField,
} from 'src/customs/api/models/CustomField';
import { createCustomField } from 'src/customs/api/admin';
import { fromPairs, lowerCase } from 'lodash';

interface FormCustomFieldProps {
  formData: CreateCustomFieldRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateCustomFieldRequest>>;
  editingId?: string;
  onSuccess?: () => void;
}

const FormCustomField = ({ formData, setFormData, editingId, onSuccess }: FormCustomFieldProps) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');
  const [alertMessage, setAlertMessage] = useState<string>(
    'Complete the following data properly and correctly',
  );
  const { token } = useSession();

  const [multiOptionList, setMultiOptionList] = useState<multiOptField[]>(
    formData.multiple_option_fields,
  );
  const [newMultiOption, setNewMultiOption] = useState<multiOptField>({
    value: '',
    name: '',
    id: '',
  });

  const assignMultiOption = async () => {
    console.log('multiOptionList', multiOptionList);
    setFormData((prev) => ({
      ...prev,
      multiple_option_fields: multiOptionList,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>,
  ) => {
    const name = (e.target as HTMLInputElement).name || (e.target as HTMLInputElement).id;
    const value = (e.target as HTMLInputElement).value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  function formatEnumLabel(label: string) {
    // Insert a space before all caps and capitalize the first letter
    return label
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }
  const handleOnSubmit = async (e: React.FormEvent) => {
    console.log('Submitting form with data:', formData);
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      if (!token) {
        setAlertType('error');
        setAlertMessage('Something went wrong. Please try again later.');

        setTimeout(() => {
          setAlertType('info');
          setAlertMessage('Complete the following data properly and correctly');
        }, 3000);
        return;
      }
    const data: CreateCustomFieldRequest = {
      ...formData,
      multiple_option_fields: multiOptionList,
    };
    const parsedData = CreateCustomFieldRequestSchema.parse(data);

      console.log('Setting Data: ', parsedData);
      if (editingId && editingId !== '') {
      }
      await createCustomField(parsedData, token);
      localStorage.removeItem('unsavedCustomFieldForm');
      setAlertType('success');
      setAlertMessage('Site successfully created!');
      setTimeout(() => {
        onSuccess?.();
      }, 900);
    } catch (err: any) {
      if (err?.errors) {
        setErrors(err.errors);
      }
      setAlertType('error');
      setAlertMessage('Something went wrong. Please try again later.');
      setTimeout(() => {
        setAlertType('info');
        setAlertMessage('Complete the following data properly and correctly');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleOnSubmit}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={12} sx={{ mt: -3 }}>
            <Alert severity={alertType}>{alertMessage}</Alert>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: formData.field_type <= 2 ? 6 : 4,
              lg: formData.field_type <= 2 ? 6 : 4,
            }}
          >
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ my: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
                Custom Field Details
              </Typography>
              <CustomFormLabel htmlFor="custom_field_name">Custom Field Name</CustomFormLabel>
              <CustomTextField
                id="short_name"
                value={formData.short_name}
                onChange={handleChange}
                error={!!errors.short_name}
                helperText={errors.short_name || ''}
                fullWidth
                required
              />
              <CustomFormLabel htmlFor="display_text">Display Text</CustomFormLabel>
              <CustomTextField
                id="long_display_text"
                value={formData.long_display_text}
                onChange={handleChange}
                error={!!errors.long_display_text}
                helperText={errors.long_display_text || ''}
                fullWidth
                required
              />
            </Paper>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: formData.field_type <= 2 ? 6 : 8,
              lg: formData.field_type <= 2 ? 6 : 8,
            }}
          >
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ my: 2, borderLeft: '4px solid #673ab7', pl: 1 }}>
                Custom Field's Input
              </Typography>
              <Grid container spacing={2}>
                <Grid
                  size={{
                    xs: 12,
                    md: formData.field_type <= 2 ? 12 : 4.5,
                    lg: formData.field_type <= 2 ? 12 : 4.5,
                  }}
                >
                  <CustomFormLabel htmlFor="type">Type</CustomFormLabel>
                  <CustomSelect
                    id="field_type"
                    name="field_type"
                    value={formData.field_type}
                    onChange={handleChange}
                    error={!!errors.field_type}
                    helperText={errors.field_type || ''}
                    fullWidth
                    required
                  >
                    {Object.entries(FieldType)
                      .filter(([k, v]) => isNaN(Number(k)))
                      .map(([key, value]) => (
                        <MenuItem key={value} value={value}>
                          {formatEnumLabel(key)}
                        </MenuItem>
                      ))}
                  </CustomSelect>
                  {formData.field_type >= 3 && (
                    <>
                      <Divider sx={{ my: 5 }} textAlign="left">
                        Multi Option Field
                      </Divider>
                      <CustomFormLabel htmlFor="field-name">Field Name</CustomFormLabel>
                      <CustomTextField
                        id="name"
                        value={newMultiOption.name}
                        onChange={(e: any) => {
                          setNewMultiOption({
                            ...newMultiOption,
                            name: e.target.value,
                          });
                          handleChange(e);
                        }}
                        error={!!errors.long_display_text}
                        helperText={errors.long_display_text || ''}
                        fullWidth
                      />
                      <CustomFormLabel htmlFor="field-value">Field Value</CustomFormLabel>
                      <CustomTextField
                        id="value"
                        value={newMultiOption.value}
                        onChange={(e: any) => {
                          setNewMultiOption({
                            ...newMultiOption,
                            value: e.target.value,
                          });
                          handleChange(e);
                        }}
                        error={!!errors.long_display_text}
                        helperText={errors.long_display_text || ''}
                        fullWidth
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ my: 3 }}
                        disabled={!newMultiOption.name}
                        onClick={() => {
                          setMultiOptionList((prev) => [...prev, { ...newMultiOption, id: '' }]);
                          setNewMultiOption({ name: '', value: '', id: '' });
                        }}
                      >
                        Add Multi-Option Field
                      </Button>
                    </>
                  )}
                </Grid>
                {formData.field_type >= 3 && (
                  <Grid
                    size={{
                      xs: 12,
                      md: 7.5,
                      lg: 7.5,
                    }}
                  >
                    <TableContainer
                      component={Box}
                      sx={{ maxHeight: '300px', overflow: 'auto', mt: 1 }}
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Field Name</TableCell>
                            <TableCell>Value</TableCell>
                            <TableCell align="right"></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {multiOptionList.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={3} align="center" sx={{ color: '#888' }}>
                                No Multi-Option Field added
                              </TableCell>
                            </TableRow>
                          ) : (
                            multiOptionList.map((mult, index) => {
                              return (
                                <TableRow key={index}>
                                  <TableCell> {mult.name}</TableCell>
                                  <TableCell> {mult.value}</TableCell>
                                  <TableCell align="right">
                                    <Button
                                      color="error"
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        minWidth: 28,
                                        width: 28,
                                        height: 28,
                                        p: 0,
                                        fontSize: '1rem',
                                        lineHeight: 1,
                                        bgcolor: '#fff5f5',
                                        borderColor: '#ffcdd2',
                                        '&:hover': { bgcolor: '#ffcdd2' },
                                      }}
                                      onClick={() =>
                                        setMultiOptionList((prev) =>
                                          prev.filter((item, i) => i !== index),
                                        )
                                      }
                                    >
                                      ×
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button color="primary" variant="contained" type="submit" disabled={loading} size="large">
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </Box>
      </form>
    </>
  );
};

export default FormCustomField;
