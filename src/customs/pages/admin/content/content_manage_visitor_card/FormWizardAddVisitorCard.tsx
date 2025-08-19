import {
  Button,
  Grid2,
  MenuItem,
  Box,
  Alert,
  Step,
  FormControl,
  FormControlLabel,
  CircularProgress,
  Stepper,
  StepLabel,
  Typography,
  Switch,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import ParentCard from 'src/components/shared/ParentCard';
import PageContainer from 'src/components/container/PageContainer';
import {
  createVisitorCard,
  getAllEmployee,
  getAllSite,
  updateVisitorCard,
} from 'src/customs/api/admin';
import { CreateVisitorCardRequest } from 'src/customs/api/models/VisitorCard';
import { Item } from 'src/customs/api/models/VisitorCard';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  CreateVisitorCardRequestSchema,
  UpdateVisitorCardRequest,
} from 'src/customs/api/models/VisitorCard';
const steps = ['Visitor Card Info', 'Card Details'];

type EnabledFields = {
  employee_id: boolean;
  registered_site: boolean;
  is_multi_site: boolean;
  is_employee_used: boolean;
};

interface FormVisitorCardProps {
  formData: CreateVisitorCardRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateVisitorCardRequest>>;
  edittingId?: string;
  onSuccess?: () => void;
  selectedRows?: Item[];
  isBatchEdit?: boolean;
  enabledFields?: EnabledFields;
  setEnabledFields: React.Dispatch<React.SetStateAction<EnabledFields>>;
}

const FormWizardAddVisitorCard = ({
  formData,
  setFormData,
  onSuccess,
  edittingId,
  selectedRows = [],
  isBatchEdit,
  enabledFields,
  setEnabledFields,
}: FormVisitorCardProps) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());
  const isStepSkipped = (step: any) => skipped.has(step);
  const { token } = useSession();
  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');
  const [alertMessage, setAlertMessage] = useState<string>(
    'Complete the following data properly and correctly',
  );
  const [employeeRes, setEmployeeRes] = useState<any[]>([]);
  const [siteSpaceRes, setSiteSpaceRes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prev) => prev + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | React.ChangeEvent<{ name?: string; value: unknown }>,
  ) => {
    const { id, name, value } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name || id]: value,
    }));
  };

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const employeeRes = await getAllEmployee(token);
        const siteSpaceRes = await getAllSite(token);
        setEmployeeRes(employeeRes.collection);
        setSiteSpaceRes(siteSpaceRes.collection);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [token]);

  const handleOnSubmit = async (e: React.FormEvent) => {
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
      if (isBatchEdit && selectedRows.length > 0) {
        const updatedFields: Partial<CreateVisitorCardRequest> = {};

        if (enabledFields?.employee_id) updatedFields.employee_id = formData.employee_id;
        if (enabledFields?.registered_site)
          updatedFields.registered_site = formData.registered_site;
        if (enabledFields?.is_multi_site) updatedFields.is_multi_site = formData.is_multi_site;
        if (enabledFields?.is_employee_used)
          updatedFields.is_employee_used = formData.is_employee_used;

        if (Object.keys(updatedFields).length === 0) {
          setAlertType('error');
          setAlertMessage('Please enable at least one field to update.');
          setTimeout(() => {
            setAlertType('info');
            setAlertMessage('Complete the following data properly and correctly');
          }, 3000);
          return;
        }

        try {
          await Promise.all(
            selectedRows.map(async (row) => {
              const updatedData = {
                ...row,
                ...updatedFields,
                is_employee_used: updatedFields.is_employee_used ?? row.is_employee_used,
                employee_id: updatedFields.employee_id ?? row.employee_id,
              } as UpdateVisitorCardRequest;
              console.log('📤 Updating card ID:', row.id, updatedData);
              await updateVisitorCard(token as string, row.id, updatedData);
            }),
          );

          setLoading(false);
          setAlertType('success');
          setAlertMessage('Card updated successfully!');
          resetEnabledFields();
          onSuccess?.();
          return;
        } catch (err) {
          console.error('❌ Batch update failed:', err);
          setLoading(false);
          setAlertType('error');
          setAlertMessage('Some cards failed to update.');
          return;
        }
      }

      const data: CreateVisitorCardRequest = CreateVisitorCardRequestSchema.parse(formData);

      if (edittingId !== '' && edittingId !== undefined) {
        const updatedData = {
          ...data,
        } as UpdateVisitorCardRequest;
        await updateVisitorCard(token as string, edittingId, updatedData);
        setAlertType('success');
        setAlertMessage('Card updated successfully!');
      } else {
        await createVisitorCard(token as string, data);
        setAlertType('success');
        setAlertMessage('Card created successfully!');
      }
      setTimeout(() => {
        setLoading(false);
        onSuccess?.();
      }, 900);
    } catch (error: any) {
      // const backendErrors: { [key: string]: string } = {};

      // if (error.response && error.response.data?.collection) {
      //   error.response.data.collection.forEach((err: { message: string }) => {
      //     // Coba ekstrak key dari message, atau buat default
      //     if (err.message.toLowerCase().includes('card number')) {
      //       backendErrors['card_number'] = err.message;
      //     } else if (err.message.toLowerCase().includes('site')) {
      //       backendErrors['registered_site'] = err.message;
      //     } else {
      //       backendErrors['employee_id'] = err.message;
      //     }
      //   });
      // }

      // setErrors(backendErrors);
      setAlertType('error');
      setAlertMessage('Failed to submit data.');
      setLoading(false);
    }
  };
  const handleChanges = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numericFields = ['type', 'card_status'];
    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? parseInt(value) : value,
    }));
  };

  const handleSteps = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid2 container spacing={2}>
            {/* Name */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="name" required>
                <Typography variant="caption">Name</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                variant="outlined"
                fullWidth
                disabled={isBatchEdit}
              />
            </Grid2>

            {/* Tags / Remarks */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="remarks" required>
                <Typography variant="caption">Remarks</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                required
                variant="outlined"
                fullWidth
                disabled={isBatchEdit}
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                htmlFor="card-type"
              >
                <Typography variant="caption">Employee</Typography>

                <FormControlLabel
                  value={formData.is_employee_used}
                  label=""
                  sx={{ marginRight: 0 }}
                  control={
                    <Switch
                      checked={formData.is_employee_used || false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData((prev) => ({
                          ...prev,
                          is_employee_used: checked,
                        }));

                        setEnabledFields((prev) => ({
                          ...prev,
                          employee_id: checked,
                          is_employee_used: checked,
                        }));
                      }}
                    />
                  }
                />
              </CustomFormLabel>
              <CustomTextField
                name="employee_id"
                select
                fullWidth
                onChange={handleChange}
                value={formData.employee_id || ''}
                disabled={!enabledFields?.employee_id}
                error={!!errors?.employee_id}
                helperText={errors?.employee_id}
              >
                <MenuItem value="">Select Employee</MenuItem>
                {employeeRes.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid2>

            {/* Site Space */}

            <Grid2 size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                htmlFor="card-type"
              >
                <Typography variant="caption">Site Space</Typography>
                <FormControlLabel
                  value={formData.is_multi_site}
                  label=""
                  sx={{ marginRight: 0 }}
                  control={
                    <Switch
                      checked={formData.is_multi_site || false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData((prev) => ({
                          ...prev,
                          is_multi_site: checked,
                          registered_site: checked ? prev.registered_site : null,
                        }));

                        setEnabledFields((prev) => ({
                          ...prev,
                          registered_site: !checked,
                        }));
                      }}
                    />
                  }
                />
              </CustomFormLabel>
              <CustomTextField
                name="registered_site"
                select
                fullWidth
                onChange={handleChange}
                value={formData.registered_site || ''}
                disabled={!enabledFields?.registered_site}
                error={!!errors?.registered_site}
                helperText={errors?.registered_site}
              >
                <MenuItem value="">Select Site</MenuItem>
                {siteSpaceRes.map((site) => (
                  <MenuItem key={site.id} value={site.id}>
                    {site.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid2>
          </Grid2>
        );

      case 1:
        return (
          <Grid2 container spacing={2}>
            <Grid2 mt={2} size={{ xs: 12, sm: 12 }}>
              <Alert severity={alertType}>{alertMessage}</Alert>
            </Grid2>

            {/* Card Type */}
            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel htmlFor="card-type">
                <Typography variant="caption">Card Type</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="type"
                name="type"
                select
                value={formData.type}
                onChange={handleChanges}
                variant="outlined"
                fullWidth
                disabled={isBatchEdit}
              >
                <MenuItem value="">Select type</MenuItem>
                <MenuItem value={0}>Non Access Card</MenuItem>
                <MenuItem value={1}>RFID Card</MenuItem>
                <MenuItem value={2}>BLE</MenuItem>
              </CustomTextField>
            </Grid2>
            {/* Card Status */}
            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel htmlFor="card-type">
                <Typography variant="caption">Card Status</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="card_status"
                name="card_status"
                select
                value={formData.card_status || ''}
                onChange={handleChanges}
                variant="outlined"
                fullWidth
                disabled={isBatchEdit}
              >
                <MenuItem value="">Select status</MenuItem>
                <MenuItem value={0}>Not Found</MenuItem>
                <MenuItem value={1}>Active</MenuItem>
                <MenuItem value={2}>Lost</MenuItem>
                <MenuItem value={3}>Broken</MenuItem>
                <MenuItem value={4}>Not Returned</MenuItem>
              </CustomTextField>
            </Grid2>

            {/* Card Number */}
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel htmlFor="card_number">
                <Typography variant="caption">Card Number</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="card_number"
                name="card_number"
                value={formData.card_number}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                disabled={isBatchEdit}
                error={Boolean(errors?.card_number)} // kasih border merah kalau error
                helperText={errors?.card_number}
              />
            </Grid2>

            {/* Card Barode */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="card_barcode">
                <Typography variant="caption">Card Barcode</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="card_barcode"
                name="card_barcode"
                value={formData.card_barcode}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                disabled={isBatchEdit}
              />
            </Grid2>

            {/* MAC Address */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="card_mac">
                <Typography variant="caption">Card MAC</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="mac-address"
                name="card_mac"
                value={formData.card_mac}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                disabled={isBatchEdit}
              />
            </Grid2>
          </Grid2>
        );

      default:
        return null;
    }
  };

  const resetEnabledFields = () => {
    setFormData((prev) => ({
      ...prev,
      is_multi_site: false,
      registered_site: null,
      is_employee_used: false,
      employee_id: null,
    }));
    setEnabledFields({
      is_multi_site: false,
      registered_site: false,
      is_employee_used: false,
      employee_id: false,
    });
  };

  // Get Data Employee & Site Space
  return (
    <form onSubmit={handleOnSubmit}>
      <PageContainer>
        <Box width="100%">
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => {
              const stepProps: { completed?: boolean } = {};
              const labelProps: { optional?: React.ReactNode } = {};

              if (isStepSkipped(index)) {
                stepProps.completed = false;
              }

              return (
                <Step key={label} {...stepProps}>
                  <StepLabel {...labelProps}>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>

          <>
            <Box>{handleSteps(activeStep)}</Box>
            <Box display="flex" flexDirection="row" mt={3}>
              <Button
                color="inherit"
                disabled={activeStep === 0 || loading}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Box flex="1 1 auto" />
              {activeStep !== steps.length - 1 ? (
                <Button onClick={handleNext} variant="contained" color="secondary">
                  Next
                </Button>
              ) : (
                <Button
                  color="success"
                  variant="contained"
                  onClick={handleOnSubmit}
                  disabled={loading || activeStep !== steps.length - 1}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </Button>
              )}
            </Box>
          </>
        </Box>
      </PageContainer>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: '#ffff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      )}
    </form>
  );
};

export default FormWizardAddVisitorCard;
