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
  Autocomplete,
  Backdrop,
  Switch,
  FormHelperText,
  Divider,
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
  getRegisteredSite,
  getVisitorEmployee,
  updateVisitorCard,
} from 'src/customs/api/admin';
import {
  CreateVisitorCardRequest,
  UpdateBatchCardSchema,
} from 'src/customs/api/models/Admin/VisitorCard';
import { Item } from 'src/customs/api/models/Admin/VisitorCard';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  CreateVisitorCardRequestSchema,
  UpdateVisitorCardRequest,
} from 'src/customs/api/models/Admin/VisitorCard';
import { showSwal } from 'src/customs/components/alerts/alerts';
const steps = ['Card Info', 'Card Details'];

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
    if (!validateStep(activeStep)) return;
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
        const employeeRes = await getVisitorEmployee(token);
        const siteSpaceRes = await getRegisteredSite(token);
        setEmployeeRes(employeeRes.collection);
        setSiteSpaceRes(siteSpaceRes.collection);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    if (formData.is_multi_site) {
      setErrors((prev) => {
        const { registered_site, ...rest } = prev;
        return rest;
      });
    }
  }, [formData.is_multi_site]);

  // useEffect(() => {
  //   if (!formData.registered_site || siteSpaceRes.length === 0) return;

  //   const foundSite = siteSpaceRes.find(
  //     (s) => String(s.id).toLowerCase() === String(formData.registered_site).toLowerCase(),
  //   );

  //   if (foundSite) {
  //     setSelectedSite(foundSite);
  //   } else {
  //     console.warn('⚠️ Tidak ditemukan site dengan id:', formData.registered_site);
  //   }
  // }, [formData.registered_site, siteSpaceRes]);

  useEffect(() => {
    if (!formData.is_employee_used) {
      setErrors((prev) => {
        const { employee_id, ...rest } = prev;
        return rest;
      });
    }
  }, [formData.is_employee_used]);

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validasi sebelum submit
    if (!validateStep(activeStep)) {
      setLoading(false);
      return;
    }
    const typeMap: Record<string | number, number> = {
      0: 0,
      1: 1,
      2: 2,
      'Non Access Card': 0,
      RFID: 1,
      'RFID Card': 1,
      BLE: 2,
    };

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
        console.log('🧪 BATCH EDIT SUBMIT');
        console.log('enabledFields:', enabledFields);
        console.log('formData:', formData);
        console.log('selectedRows:', selectedRows);
        setLoading(true);

        try {
          const updatedFields: Partial<UpdateBatchCardSchema> = {};
          console.log('enabledFields:', enabledFields);

          if (enabledFields?.is_employee_used)
            updatedFields.is_employee_used = formData.is_employee_used as boolean;

          if (enabledFields?.employee_id)
            updatedFields.employee_id = formData.employee_id as string;

          // 🔹 multi site
          if (enabledFields?.is_multi_site) {
            updatedFields.is_multi_site = formData.is_multi_site;

            // kalau multi-site aktif → kosongkan site
            if (formData.is_multi_site === true) {
              updatedFields.registered_site = null;
            }
          }

          // 🔹 registered site (HANYA kalau user enable)
          if (enabledFields?.registered_site != null && formData.is_multi_site === false) {
            updatedFields.registered_site = formData.registered_site;
          }

          if (Object.keys(updatedFields).length === 0) {
            showSwal('error', 'Please enable at least one field to update.');
            return;
          }

          // await Promise.all(
          //   selectedRows.map((row) =>
          //     updateVisitorCard(token as string, row.id, updatedFields as any),
          //   ),
          // );
          await Promise.all(
            selectedRows.map(async (row) => {
              const mergedPayload: any = {
                ...row,
                ...updatedFields,

                // 🔹 safeguard relasi
                is_employee_used:
                  updatedFields.is_employee_used ?? (row.is_employee_used as boolean),

                employee_id: updatedFields.employee_id ?? (row.employee_id as string),

                is_multi_site: updatedFields.is_multi_site ?? (row.is_multi_site as boolean),

                registered_site:
                  updatedFields.is_multi_site === true
                    ? null
                    : (updatedFields.registered_site ?? (row.registered_site as string)),

                employee_name: updatedFields.employee_name ?? (row.employee_name as string),
              };
              await updateVisitorCard(token as string, row.id, mergedPayload);
            }),
          );

          showSwal('success', 'Card updated successfully');
          resetEnabledFields();
          onSuccess?.();
        } catch (err) {
          console.error('❌ Batch update failed:', err);
          showSwal('error', 'Some cards failed to update.');
        } finally {
          setLoading(false);
        }

        return;
      }

      const data: CreateVisitorCardRequest = CreateVisitorCardRequestSchema.parse(formData);

      if (edittingId) {
        const updatedData: UpdateVisitorCardRequest = {
          ...data,
          type: typeMap[String(data?.type ?? 0)] ?? 0,
        } as UpdateVisitorCardRequest;

        console.log('📤 Updating card ID:', edittingId, updatedData);

        await updateVisitorCard(token as string, edittingId, updatedData);
        showSwal('success', 'Card updated successfully');
      } else {
        const createdData: CreateVisitorCardRequest = {
          ...data,
          type: typeMap[String(data?.type ?? 0)] ?? 0,
        };
        await createVisitorCard(token as string, createdData);
        // setAlertType('success');
        // setAlertMessage('Card created successfully!');
        showSwal('success', 'Card created successfully');
      }

      setTimeout(() => {
        setLoading(false);
        onSuccess?.();
      }, 600);
    } catch (error: any) {
      setLoading(false);

      // Coba ambil pesan error dari backend
      const messages: string[] =
        error?.response?.data?.collection?.map((err: any) => err.message) || [];

      if (messages.length > 0) {
        // Kalau ada pesan error dari backend → tampilkan pakai Swal
        showSwal('error', messages.join('\n'));
      } else {
        // Kalau tidak ada → fallback pesan umum
        showSwal('error', 'Failed to submit data.');
      }
    }
  };

  const handleChanges = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericFields = ['type', 'card_status'];
    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? (value === '' ? null : Number(value)) : value,
    }));
  };

  // ⬇️ Tambahkan di dalam komponen, dekat state errors / alert
  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (isBatchEdit) {
        // ✅ Batch Edit → hanya validasi field yg di-enable
        if (
          (enabledFields?.is_employee_used || enabledFields?.employee_id) &&
          formData.is_employee_used &&
          !formData.employee_id
        ) {
          newErrors.employee_id = 'Employee is required';
        }

        if (
          enabledFields?.registered_site &&
          !formData.is_multi_site &&
          !formData.registered_site
        ) {
          newErrors.registered_site = 'Site is required';
        }

        // ⚠️ name & remarks tidak ikut divalidasi di batch edit
      } else {
        // ✅ Normal add/edit → selalu validasi
        if (!formData.name?.trim()) newErrors.name = 'Name is required';
        if (!formData.remarks?.trim()) newErrors.remarks = 'Remarks is required';

        if (formData.is_employee_used && !formData.employee_id) {
          newErrors.employee_id = 'Employee is required';
        }
        if (!formData.is_multi_site && !formData.registered_site) {
          newErrors.registered_site = 'Site is required';
        }
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setAlertType('error');
      setAlertMessage('Please fix the fields highlighted in red.');
      return false;
    }

    setAlertType('info');
    setAlertMessage('Complete the following data properly and correctly');
    return true;
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
                error={Boolean(errors?.name)}
                helperText={errors?.name}
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
                error={Boolean(errors?.remarks)}
                helperText={errors?.remarks}
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '0px',
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
              <Autocomplete
                id="employee_id"
                options={employeeRes}
                getOptionLabel={(option) => option.name ?? ''}
                value={employeeRes.find((emp) => emp.id === formData.employee_id) || null}
                onChange={(_, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    employee_id: newValue ? newValue.id : '',
                  }));
                }}
                disabled={!enabledFields?.employee_id}
                renderInput={(params) => (
                  <CustomTextField
                    {...params}
                    label=""
                    error={!!errors?.employee_id}
                    helperText={errors?.employee_id}
                    name="employee_id"
                  />
                )}
              />
            </Grid2>

            {/* Site Space */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '0px',
                }}
                htmlFor="card-type"
              >
                <Typography variant="caption">Registered Site</Typography>
                <FormControlLabel
                  value={formData.is_multi_site}
                  label=""
                  sx={{ marginRight: 0 }}
                  control={
                    <Switch
                      checked={formData.is_multi_site}
                      onChange={(e) => {
                        const checked = e.target.checked;

                        setFormData((prev) => ({
                          ...prev,
                          is_multi_site: checked,
                          registered_site: checked ? null : prev.registered_site,
                        }));

                        setErrors((prev) => {
                          if (checked) {
                            const { registered_site, ...rest } = prev;
                            return rest;
                          }
                          return prev;
                        });
                      }}
                    />
                  }
                />
              </CustomFormLabel>
              <Autocomplete
                fullWidth
                options={siteSpaceRes}
                getOptionLabel={(option) => option?.name || ''}
                value={
                  formData.is_multi_site
                    ? null
                    : siteSpaceRes.find(
                        (s) =>
                          String(s.id).toLowerCase() ===
                          String(formData.registered_site ?? '').toLowerCase(),
                      ) || null
                }
                isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
                onChange={(_, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    registered_site: newValue ? newValue.id : null,
                  }));
                }}
                renderInput={(params) => (
                  <CustomTextField
                    {...params}
                    error={!!errors?.registered_site}
                    helperText={errors?.registered_site}
                  />
                )}
                disabled={formData.is_multi_site}
              />
            </Grid2>
          </Grid2>
        );

      case 1:
        return (
          <Grid2 container spacing={2}>
            {/* Card Type */}
            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel htmlFor="card-type" sx={{ mt: 2 }}>
                <Typography variant="caption">Card Type</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="type"
                name="type"
                select
                value={formData.type ?? ''}
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
              <CustomFormLabel htmlFor="card-type" sx={{ mt: 2 }}>
                <Typography variant="caption">Card Status</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="card_status"
                name="card_status"
                select
                value={formData.card_status ?? ''}
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
              <CustomFormLabel htmlFor="card_number" sx={{ mt: 0 }}>
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
                error={Boolean(errors?.card_number)}
                helperText={errors?.card_number}
              />
            </Grid2>

            {/* Card Barode */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="card_barcode" sx={{ mt: 0 }}>
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
              <CustomFormLabel htmlFor="card_mac" sx={{ mt: 0 }}>
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
              {/* {formData.type === 2 && ( */}
              <FormHelperText sx={{ color: 'gray', mt: 0.5 }}>
                *) MAC Address is required only for BLE Card.
              </FormHelperText>
              {/* )} */}
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
                color="primary"
                disabled={activeStep === 0 || loading}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Box flex="1 1 auto" />
              {activeStep !== steps.length - 1 ? (
                <Button onClick={handleNext} variant="contained" color="primary">
                  Next
                </Button>
              ) : (
                <Button
                  color="primary"
                  variant="contained"
                  onClick={handleOnSubmit}
                  disabled={loading || activeStep !== steps.length - 1}
                >
                  Submit
                </Button>
              )}
            </Box>
          </>
        </Box>
      </PageContainer>
      <Backdrop
        open={loading}
        sx={{
          color: 'primary',
          zIndex: 999999,
        }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </form>
  );
};

export default FormWizardAddVisitorCard;
