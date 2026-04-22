import { z, ZodObject, ZodEffects } from 'zod';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Alert,
  Stack,
  MenuItem,
  FormHelperText,
  FormControl,
  FormControlLabel,
  Grid2,
  Typography,
  Autocomplete,
  Paper,
  Dialog,
  Divider,
  CircularProgress,
  Backdrop,
  Switch,
  Checkbox,
  StepButton,
} from '@mui/material';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomRadio from 'src/components/forms/theme-elements/CustomRadio';
import Webcam from 'react-webcam';
import Swal from 'sweetalert2';
import ReactCrop, { Crop } from 'react-image-crop';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  createEmployee,
  updateEmployee,
  getEmployeeById,
  getAllEmployee,
  uploadImageEmployee,
  getAllOrganizations,
  getAllDepartments,
  getAllDistricts,
} from 'src/customs/api/admin';

import {
  CreateEmployeeRequest,
  CreateEmployeeRequestSchema,
  CreateEmployeeSubmitSchema,
  UpdateEmployeeRequest,
} from 'src/customs/api/models/Admin/Employee';
import { Item } from 'src/customs/api/models/Admin/Employee';
import { showSwal } from 'src/customs/components/alerts/alerts';
const steps = ['Personal Info', 'Work Details', 'Access & Address', 'Other Details', 'Photo'];
import { getStepSchema, stepFieldMap } from 'src/customs/api/validations/employeeSchemas';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import { MobileStepper, useTheme, useMediaQuery } from '@mui/material';

type EnabledFields = {
  organization_id: boolean;
  department_id: boolean;
  district_id: boolean;
  // access_area: boolean;
  // access_area_special: boolean;
  gender: boolean;
};

interface FormEmployeeProps {
  formData: CreateEmployeeRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateEmployeeRequest>>;
  edittingId?: string;
  onSuccess?: () => void;
  isBatchEdit?: boolean;
  selectedRows?: Item[];
  enabledFields?: EnabledFields;
  setEnabledFields: React.Dispatch<React.SetStateAction<EnabledFields>>;
  // setIsFormChanged: React.Dispatch<React.SetStateAction<boolean>>;
}

const BASE_URL = axiosInstance2.defaults.baseURL;

const FormWizardAddEmployee = ({
  formData,
  setFormData,
  edittingId,
  onSuccess,
  isBatchEdit,
  selectedRows = [],
  enabledFields,
  setEnabledFields,
  // setIsFormChanged,
}: FormEmployeeProps) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');
  const [alertMessage, setAlertMessage] = useState<string>(
    'Complete the following data properly and correctly',
  );
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());
  const { token } = useSession();
  const [organization, setOrganization] = useState<any[]>([]);
  const [department, setDepartment] = useState<any[]>([]);
  const [district, setDistrict] = useState<any[]>([]);
  const isStepSkipped = (step: number) => skipped.has(step);
  const [siteImageFile, setSiteImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [openCamera, setOpenCamera] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const [removing, setRemoving] = useState(false);
  const [employeeAllRes, setEmployeeAllRes] = useState<Item[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const clearLocal = () => {
    setSiteImageFile(null);
    setPreviewUrl(null);
    setScreenshot(null);
    setLocalForm((prev) => ({ ...prev, faceimage: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = async (e?: React.MouseEvent) => {
    e?.stopPropagation?.();
    if (removing) return;

    const serverPath =
      localForm.faceimage &&
      !localForm.faceimage.startsWith('data:') &&
      !/^https?:\/\//i.test(localForm.faceimage)
        ? localForm.faceimage
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

  const handleClear = () => {
    setScreenshot(null);
    setPreviewUrl(null);
    handleFileChange(null as any);
  };

  const handleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setScreenshot(imageSrc);
        setPreviewUrl(imageSrc);
        setFormData((prev) => ({
          ...prev,
          faceimage: imageSrc,
        }));
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      const [orgRes, deptRes, distRes] = await Promise.all([
        getAllOrganizations(token),
        getAllDepartments(token),
        getAllDistricts(token),
      ]);

      setOrganization(orgRes.collection ?? []);
      setDepartment(deptRes.collection ?? []);
      setDistrict(distRes.collection ?? []);

      // const employeeAll = await getAllEmployee(token);
      // setEmployeeAllRes(employeeAll.collection ?? []);

      if (edittingId && !isBatchEdit) {
        const employeeRes = await getEmployeeById(edittingId, token);
        const employee = employeeRes?.collection ?? null;
        if (employee) {
          const normalizedGender =
            typeof employee.gender === 'string'
              ? employee.gender === 'Female'
                ? 0
                : 1
              : Number(employee.gender ?? 0);

          setFormData((prev) => ({
            ...prev,
            ...employee,
            gender: normalizedGender,
            organization_id: String(employee.organization_id ?? ''),
            department_id: String(employee.department_id ?? ''),
            district_id: String(employee.district_id ?? ''),
          }));
        }
      }
    };

    fetchData();
  }, [token, edittingId, isBatchEdit]);

  const pick = (obj: Record<string, any>, keys: readonly string[]) => {
    const out: Record<string, any> = {};
    keys.forEach((k) => {
      if (k in obj) out[k] = obj[k];
    });
    return out;
  };

  const scrollToField = (key: string) => {
    const el = document.getElementById(key);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  function unwrapZodObject(schema: any): ZodObject<any> | null {
    if (schema instanceof z.ZodObject) {
      return schema;
    }
    if (schema instanceof z.ZodEffects) {
      const inner = (schema as ZodEffects<any>)._def.schema;
      if (inner instanceof z.ZodObject) {
        return inner;
      }
    }
    return null;
  }

  const validateStep = (step: number): boolean => {
    const schema = getStepSchema(step);
    if (!schema) return true;

    const fields = stepFieldMap[step] ?? [];
    let payload = pick(localForm, fields as any);

    if (isBatchEdit) {
      const enabledKeys = fields.filter((k) => (enabledFields as any)?.[k] === true);
      if (enabledKeys.length === 0) return true;

      payload = pick(localForm, enabledKeys as any);

      const baseSchema = unwrapZodObject(schema);
      if (baseSchema) {
        const shape: Record<string, true> = {};
        enabledKeys.forEach((k) => (shape[k as string] = true));

        const partialSchema = baseSchema.pick(shape);
        const res = partialSchema.safeParse(payload);

        if (!res.success) {
          const em = toErrorMap(res.error.issues);
          setErrors((prev) => ({ ...prev, ...em }));
          setAlertType('error');
          setAlertMessage('Please fix the highlighted fields on this step.');

          const firstKey = Object.keys(em)[0];
          if (firstKey) scrollToField(firstKey);
          return false;
        }
      }

      return true;
    }
    if (step === 1) {
      (payload as any).district_id = String((payload as any).district_id ?? '');
      (payload as any).organization_id = String((payload as any).organization_id ?? '');
      (payload as any).department_id = String((payload as any).department_id ?? '');
    }

    const res = schema.safeParse(payload);
    if (res.success) return true;

    const em = toErrorMap(res.error.issues);
    setErrors((prev) => ({ ...prev, ...em }));
    setAlertType('error');
    setAlertMessage('Please fix the highlighted fields on this step.');

    const firstKey = Object.keys(em)[0];
    if (firstKey) scrollToField(firstKey);

    return false;
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | React.ChangeEvent<{ name?: string; value: unknown }>,
  ) => {
    const { id, name, value } = e.target as any;
    const key = (name || id) as string;
    setLocalForm((prev) => ({
      ...prev,
      [name || id]: value,
    }));
    // setIsFormChanged?.(true);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  useEffect(() => {
    if (!isBatchEdit) return;

    setFormData((prev) => ({
      ...prev,
      organization_id: '',
      department_id: '',
      district_id: '',
      gender: 0,
    }));

    setEnabledFields?.({
      organization_id: false,
      department_id: false,
      district_id: false,
      gender: false,
    });
  }, [isBatchEdit]);

  const resetEnabledFields = () => {
    setFormData((prev) => ({
      ...prev,
      gender: 0,
      department_id: '',
      district_id: '',
      organization_id: '',
    }));
    setEnabledFields({
      organization_id: false,
      department_id: false,
      district_id: false,
      gender: false,
    });
  };

  const handleNext = () => {
    if (!validateStep(activeStep)) return;

    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }
    setActiveStep((prev) => prev + 1);
    setSkipped(newSkipped);

    setAlertType('info');
    setAlertMessage('Complete the following data properly and correctly');
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleReset = () => setActiveStep(0);

  const toErrorMap = (issues: z.ZodIssue[]) => {
    const out: Record<string, string> = {};
    for (const i of issues) {
      const key = (i.path.join('.') || '').toString();
      if (key) out[key] = i.message;
    }
    return out;
  };

  const normalizeForSubmit = (v: CreateEmployeeRequest) => ({
    ...v,
    organization_id: String(v.organization_id ?? ''),
    department_id: String(v.department_id ?? ''),
    district_id: String(v.district_id ?? ''),
    type: String(v.type ?? 'Permanent'),
  });

  const isDataUrl = (s?: string) => typeof s === 'string' && /^data:image\//i.test(s);

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (!token) {
        showSwal('error', 'Something went wrong. Please try again later.');
        return;
      }
      if (isBatchEdit && selectedRows.length > 0) {
        const enabledKeys = Object.keys(enabledFields ?? {}).filter(
          (k) => (enabledFields as any)[k] === true,
        ) as (keyof CreateEmployeeRequest)[];

        if (enabledKeys.length === 0) {
          showSwal('error', 'Please enable at least one field to update.');
          setLoading(false);
          return;
        }

        const payload = pick(localForm, enabledKeys);
        const baseSchema = unwrapZodObject(CreateEmployeeSubmitSchema);
        const partialSchema = baseSchema?.pick(
          Object.fromEntries(enabledKeys.map((k) => [k, true])),
        );

        const res = partialSchema?.safeParse(payload);
        if (res && !res.success) {
          const em = toErrorMap(res.error.issues);
          setErrors(em);
          showSwal('error', 'Please complete the required fields.');
          const firstKey = Object.keys(em)[0];
          if (firstKey) scrollToField(firstKey);
          setLoading(false);
          return;
        }

        for (const row of selectedRows) {
          await updateEmployee(
            row.id,
            {
              ...row,
              ...payload,
              vehicle_plate_number: payload.vehicle_plate_number,
              vehicle_type: payload.vehicle_type,
            },
            token,
          );
        }

        showSwal('success', 'Batch update successfully!');
        resetEnabledFields();
        onSuccess?.();
        return;
      }

      const mergedFormData = normalizeForSubmit({
        ...localForm,

        type: String(localForm.type ?? 'Permanent'),
        gender:
          typeof localForm.gender === 'string'
            ? localForm.gender === 'Female'
              ? 0
              : 1
            : Number(localForm.gender ?? 0),
      });

      const result = CreateEmployeeSubmitSchema.safeParse(mergedFormData);

      if (!result.success) {
        const em = toErrorMap(result.error.issues);
        setErrors(em);
        showSwal('error', 'Please complete the required fields.');
        const firstKey = Object.keys(em)[0];
        if (firstKey) {
          const el = document.getElementById(firstKey);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      const data = result.data;
      const rawFaceImage = localForm.faceimage;
      const rawFileImage = siteImageFile;

      const hasNewImage = Boolean(rawFileImage) || isDataUrl(rawFaceImage);

      if (edittingId) {
        const { faceimage: _drop, ...withoutImage } = data;
        const editData: UpdateEmployeeRequest = {
          ...withoutImage,
          type: String(data.type ?? ''),
          qr_code: localForm.card_number,
          is_email_verify: false,
        };

        const res = await updateEmployee(edittingId, editData, token);
        if (hasNewImage) {
          await handleFileUploads(edittingId, rawFileImage, rawFaceImage);
        }
        showSwal('success', 'Employee successfully updated!');
      } else {
        console.log('Creating employee with data:', data);
        const created = await createEmployee(data, token);

        const employeeId = created?.collection.employee_id;

        if (hasNewImage) {
          await handleFileUploads(employeeId as string, rawFileImage, rawFaceImage);
        }

        showSwal('success', 'Employee successfully created!');

        setFormData(CreateEmployeeRequestSchema.parse({}));
      }

      onSuccess?.();
    } catch (err: any) {
      if (err?.errors) {
        setErrors(err.errors);
      }
      showSwal('error', err?.message ?? 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUploads = async (
    employeeId: string,
    fileFromInput?: File | null,
    faceImage?: string | null,
  ) => {
    const tasks: Promise<any>[] = [];

    if (fileFromInput instanceof File) {
      tasks.push(uploadImageEmployee(employeeId, fileFromInput, token as string));
    }

    if (faceImage && isDataUrl(faceImage)) {
      const blob = await fetch(faceImage).then((res) => res.blob());
      const file = new File([blob], 'webcam.jpg', { type: 'image/jpeg' });
      tasks.push(uploadImageEmployee(employeeId, file, token as string));
    }

    if (tasks.length === 0) return;

    await Promise.all(tasks);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setSiteImageFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };
  const [localForm, setLocalForm] = useState(formData);

  useEffect(() => {
    const handler = setTimeout(() => {
      setFormData(localForm);
    }, 200);

    return () => clearTimeout(handler);
  }, [localForm]);

  useEffect(() => {
    if (siteImageFile) return;

    const v = localForm.faceimage?.toString() ?? '';
    if (!v) {
      setPreviewUrl(null);
      return;
    }
    if (/^(data:image\/|blob:|https?:\/\/)/i.test(v)) {
      setPreviewUrl(v);
      return;
    }

    const rel = v.startsWith('/') ? v : `/${v}`;

    const url = rel.startsWith('/cdn/') ? `${BASE_URL}${rel}` : `${BASE_URL}/cdn${rel}`;

    setPreviewUrl(url);
  }, [localForm.faceimage, siteImageFile]);

  const StepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid2 container spacing={1}>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1 }} htmlFor="name" required>
                <Typography variant="caption">Employee Name</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="name"
                value={localForm.name}
                onChange={handleChange}
                fullWidth
                required
                disabled={isBatchEdit}
                variant="outlined"
                error={Boolean(errors.name)}
                helperText={errors.name}
              />
            </Grid2>
            {/* Person ID */}
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1 }} htmlFor="person_id" required>
                <Typography variant="caption">Person ID </Typography>
              </CustomFormLabel>
              <CustomTextField
                id="person_id"
                value={localForm.person_id}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                required
                disabled={isBatchEdit}
                error={Boolean(errors.person_id)}
                helperText={errors.person_id}
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 12 }}>
              <FormControl fullWidth error={Boolean(errors.identity_type)}>
                <CustomFormLabel sx={{ my: 1 }} htmlFor="identity_type" required>
                  <Typography variant="caption">Identity Type</Typography>
                </CustomFormLabel>

                <CustomSelect
                  id="identity_type"
                  value={localForm.identity_type}
                  onChange={(e: any) => {
                   setLocalForm((prev) => ({
                     ...prev,
                     identity_type: e.target.value,
                   }));

                  //  setIsFormChanged?.(true);

                   if (errors.identity_type) {
                     setErrors((p) => ({ ...p, identity_type: '' }));
                   }
                  }}
                  fullWidth
                  disabled={isBatchEdit}
                >
                  <MenuItem value={'NIK'}>NIK</MenuItem>
                  <MenuItem value={'KTP'}>KTP</MenuItem>
                  <MenuItem value={'Passport'}>Passport</MenuItem>
                  <MenuItem value={'DriverLicense'}>Driver License</MenuItem>
                  <MenuItem value={'CardAccess'}>Card Access</MenuItem>
                  <MenuItem value={'Face'}>Face</MenuItem>
                  <MenuItem value={'NDA'}>NDA</MenuItem>
                  <MenuItem value={'Other'}>Other</MenuItem>
                </CustomSelect>

                <FormHelperText sx={{ marginLeft: '0 !important' }}>
                  {errors.identity_type}
                </FormHelperText>
              </FormControl>
            </Grid2>
            {/* Identity ID */}
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1 }} htmlFor="identity_id" required>
                <Typography variant="caption">Identity ID (KTP/SIM/Paspor)</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="identity_id"
                value={localForm.identity_id}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                required
                disabled={isBatchEdit}
                error={Boolean(errors.identity_id)}
                helperText={errors.identity_id}
              />
            </Grid2>

            {/* Email */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel sx={{ marginY: 1 }} htmlFor="email" required>
                <Typography variant="caption">Email</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="email"
                value={localForm.email}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                required
                disabled={isBatchEdit}
                error={Boolean(errors.email)}
                helperText={errors.email}
              />
            </Grid2>

            {/* Gender */}
            <Grid2
              sx={{ paddingLeft: isMobile ? '0px !important' : '25px' }}
              size={{ xs: 12, sm: 6 }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ marginTop: '0px' }}
              >
                <CustomFormLabel required sx={{ marginY: 1 }}>
                  <Typography variant="caption" sx={{ marginLeft: '0px', marginTop: '0px' }}>
                    Gender
                  </Typography>
                </CustomFormLabel>
                {isBatchEdit && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={enabledFields?.gender}
                        onChange={(e) =>
                          setEnabledFields((prev) => ({
                            ...prev,
                            gender: e.target.checked,
                          }))
                        }
                      />
                    }
                    label=""
                  />
                )}
              </Box>

              <FormControl error={Boolean(errors.gender)} component="fieldset">
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <FormControlLabel
                    value="0"
                    label="Female"
                    control={
                      <CustomRadio
                        checked={localForm.gender === 0}
                        onChange={() => {
                          setLocalForm((prev) => ({ ...prev, gender: 0 }));
                          if (errors.gender) setErrors((p) => ({ ...p, gender: '' }));
                        }}
                        disabled={isBatchEdit && !enabledFields?.gender}
                      />
                    }
                  />
                  <FormControlLabel
                    value="1"
                    label="Male"
                    control={
                      <CustomRadio
                        checked={localForm.gender === 1}
                        onChange={() => {
                          setLocalForm((prev) => ({ ...prev, gender: 1 }));
                          if (errors.gender) setErrors((p) => ({ ...p, gender: '' }));
                        }}
                        disabled={isBatchEdit && !enabledFields?.gender}
                      />
                    }
                  />
                </Box>
                {errors.gender && (
                  <FormHelperText error sx={{ mt: 0.5, marginLeft: '0' }}>
                    {errors.gender}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid2>
          </Grid2>
        );

      case 1:
        return (
          <Grid2 container spacing={1}>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1 }} htmlFor="phone">
                <Typography variant="caption">Employee Phone</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="phone"
                value={localForm.phone}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                disabled={isBatchEdit}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ my: 1 }} htmlFor="vehicle_type">
                <Typography variant="caption">Vehicle Type</Typography>
              </CustomFormLabel>
              <CustomSelect
                id="vehicle_type"
                value={localForm.vehicle_type}
                onChange={(e: any) => setLocalForm({ ...localForm, vehicle_type: e.target.value })}
                fullWidth
                disabled={isBatchEdit}
              >
                <MenuItem value="">Select Type</MenuItem>
                <MenuItem value="Car">Car</MenuItem>
                <MenuItem value="Bus">Bus</MenuItem>
                <MenuItem value="Motor">Motor</MenuItem>
                <MenuItem value="Truck">Truck</MenuItem>
                <MenuItem value="Bicycle">Bicycle</MenuItem>
                <MenuItem value="Private Car">Private Car</MenuItem>
              </CustomSelect>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ my: 1 }} htmlFor="vehiclePlateNumber">
                <Typography variant="caption">Vehicle Plate Number</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="vehiclePlateNumber"
                value={localForm.vehicle_plate_number}
                onChange={(e: any) =>
                  setLocalForm({ ...localForm, vehicle_plate_number: e.target.value })
                }
                fullWidth
                variant="outlined"
                disabled={isBatchEdit}
                placeholder="Enter vehicle plate number"
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 12 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ marginX: 0, marginTop: 0.8 }}
              >
                <CustomFormLabel sx={{ marginY: 1 }} htmlFor="district_id" required>
                  <Typography variant="caption">Employee District</Typography>
                </CustomFormLabel>

                {isBatchEdit && (
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={enabledFields?.district_id || false}
                        onChange={(e) =>
                          setEnabledFields((prev) => ({
                            ...prev,
                            district_id: e.target.checked,
                          }))
                        }
                      />
                    }
                    label=""
                    labelPlacement="start"
                  />
                )}
              </Box>
              <Autocomplete
                fullWidth
                autoHighlight
                disablePortal
                options={district.map((d: any) => ({ id: String(d.id), label: d.name ?? '' }))}
                value={(() => {
                  const cur = String(localForm.district_id ?? '');
                  return (
                    district
                      .map((d: any) => ({ id: String(d.id), label: d.name ?? '' }))
                      .find((opt) => opt.id === cur) || null
                  );
                })()}
                onChange={(_, newVal) => {
                  setLocalForm((prev) => ({
                    ...prev,
                    district_id: newVal ? newVal.id : '',
                  }));
                  setErrors((prev) => ({ ...prev, district_id: '' }));
                }}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
                disabled={isBatchEdit && !enabledFields?.district_id}
                renderInput={(params) => (
                  <CustomTextField
                    {...params}
                    id="district_id"
                    placeholder="Search district…"
                    variant="outlined"
                    error={Boolean(errors.district_id)}
                    helperText={errors.district_id}
                  />
                )}
              />
            </Grid2>

            <Grid2 size={{ xs: 6, sm: 6 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ marginX: 0, marginTop: 0.8 }}
              >
                <CustomFormLabel sx={{ marginY: 1 }} htmlFor="organization_id" required>
                  <Typography variant="caption">Employee Organization</Typography>
                </CustomFormLabel>

                {isBatchEdit && (
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={enabledFields?.organization_id || false}
                        onChange={(e) =>
                          setEnabledFields((prev) => ({
                            ...prev,
                            organization_id: e.target.checked,
                          }))
                        }
                      />
                    }
                    label=""
                    labelPlacement="start"
                  />
                )}
              </Box>
              <Autocomplete
                fullWidth
                autoHighlight
                disablePortal
                options={organization.map((o: any) => ({
                  id: String(o.id),
                  label: o.name ?? '',
                }))}
                value={(() => {
                  const currentId = String(localForm.organization_id ?? '');
                  return (
                    organization
                      .map((o: any) => ({ id: String(o.id), label: o.name ?? '' }))
                      .find((opt) => opt.id === currentId) || null
                  );
                })()}
                onChange={(_, newVal) => {
                  setLocalForm((prev) => ({
                    ...prev,
                    organization_id: newVal ? newVal.id : '',
                  }));
                  setErrors((prev) => ({ ...prev, organization_id: '' }));
                }}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
                disabled={isBatchEdit && !enabledFields?.organization_id}
                renderInput={(params) => (
                  <CustomTextField
                    {...params}
                    id="organization_id"
                    placeholder="Search organization…"
                    variant="outlined"
                    error={Boolean(errors.organization_id)}
                    helperText={errors.organization_id}
                  />
                )}
              />
            </Grid2>

            <Grid2 size={{ xs: 6, sm: 6 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ marginX: 0, marginTop: 0.8 }}
              >
                <CustomFormLabel sx={{ marginY: 1 }} htmlFor="department_id" required>
                  <Typography variant="caption">Employee Department</Typography>
                </CustomFormLabel>

                {isBatchEdit && (
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={enabledFields?.department_id || false}
                        onChange={(e) =>
                          setEnabledFields((prev) => ({
                            ...prev,
                            department_id: e.target.checked,
                          }))
                        }
                      />
                    }
                    label=""
                    labelPlacement="start"
                  />
                )}
              </Box>
              <Autocomplete
                fullWidth
                autoHighlight
                disablePortal
                options={department.map((d: any) => ({ id: String(d.id), label: d.name ?? '' }))}
                value={(() => {
                  const cur = String(localForm.department_id ?? '');
                  return (
                    department
                      .map((d: any) => ({ id: String(d.id), label: d.name ?? '' }))
                      .find((opt) => opt.id === cur) || null
                  );
                })()}
                onChange={(_, newVal) => {
                  setLocalForm((prev) => ({
                    ...prev,
                    department_id: newVal ? newVal.id : '',
                  }));
                  setErrors((prev) => ({ ...prev, department_id: '' }));
                }}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
                disabled={isBatchEdit && !enabledFields?.department_id}
                renderInput={(params) => (
                  <CustomTextField
                    {...params}
                    id="department_id"
                    placeholder="Search department…"
                    variant="outlined"
                    error={Boolean(errors.department_id)}
                    helperText={errors.department_id}
                  />
                )}
              />
            </Grid2>
          </Grid2>
        );

      case 2:
        return (
          <Grid2 container spacing={1}>
            {/* Is Head */}
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(localForm.is_head)}
                    onChange={(e) => {
                      setLocalForm((prev) => ({ ...prev, is_head: e.target.checked }));
                      setErrors((prev) => ({ ...prev, is_head: '' }));
                    }}
                  />
                }
                label="Is Head Employee"
                sx={{
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.75rem',
                  },
                  marginTop: '10px',
                }}
              />
            </Grid2>
            {/* <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1 }} htmlFor="head_employee_1">
                <Typography variant="caption">Employee Head - 1</Typography>
              </CustomFormLabel>
              <Autocomplete
                fullWidth
                autoHighlight
                // disablePortal
                options={employeeAllRes}
                filterOptions={(opts) => opts.filter((o) => o.id !== localForm.head_employee_2)}
                getOptionLabel={(opt) => opt?.name ?? ''}
                value={employeeAllRes.find((e) => e.id === localForm.head_employee_1) || null}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                onChange={(_, newVal) => {
                  setFormData((prev) => ({
                    ...prev,
                    head_employee_1: newVal ? newVal.id : '',
                  }));
                }}
                disabled={isBatchEdit}
                renderInput={(params) => (
                  <CustomTextField
                    {...params}
                    id="head_employee_1"
                    placeholder="Search employee…"
                    variant="outlined"
                  />
                )}
                // optional: tampilkan nama + email di dropdown
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2">{option.name}</Typography>
  
                    </Box>
                  </li>
                )}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1 }} htmlFor="head2">
                <Typography variant="caption">Employee Head - 2</Typography>
              </CustomFormLabel>
              <Autocomplete
                fullWidth
                autoHighlight
                // disablePortal
                options={employeeAllRes}
                // cegah pilih orang yg sama dgn Head-1
                filterOptions={(opts) => opts.filter((o) => o.id !== localForm.head_employee_1)}
                getOptionLabel={(opt) => opt?.name ?? ''}
                value={employeeAllRes.find((e) => e.id === localForm.head_employee_2) || null}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                onChange={(_, newVal) => {
                  setFormData((prev) => ({
                    ...prev,
                    head_employee_2: newVal ? newVal.id : '',
                  }));
                }}
                disabled={isBatchEdit}
                renderInput={(params) => (
                  <CustomTextField
                    {...params}
                    id="head_employee_2"
                    placeholder="Search employee…"
                    variant="outlined"
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2">{option.name}</Typography>
                    
                    </Box>
                  </li>
                )}
              />
            </Grid2> */}
            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ marginY: 1 }} htmlFor="card_number">
                <Typography variant="caption">Card Access</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="card_number"
                value={localForm.card_number}
                onChange={(e: any) => {
                  setLocalForm((prev) => ({ ...prev, qr_code: prev.card_number }));
                  handleChange(e);
                }}
                fullWidth
                variant="outlined"
                disabled={isBatchEdit}
              />
            </Grid2>
            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ marginY: 1 }} htmlFor="card_number">
                <Typography variant="caption">BLE Card</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="ble_card_number"
                value={localForm.ble_card_number}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                disabled={isBatchEdit}
              />
            </Grid2>
          </Grid2>
        );

      case 3:
        return (
          <Grid2 container spacing={1}>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1 }} htmlFor="dob" required>
                <Typography variant="caption">Date of Birth</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="birth_date"
                type="date"
                value={localForm.birth_date}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                disabled={isBatchEdit}
                error={Boolean(errors.birth_date)}
                helperText={errors.birth_date}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1 }} htmlFor="join" required>
                <Typography variant="caption">Join Date</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="join_date"
                type="date"
                value={localForm.join_date}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                disabled={isBatchEdit}
                error={Boolean(errors.join_date)}
                helperText={errors.join_date}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1 }} htmlFor="join" required>
                <Typography variant="caption">Exit Date</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="exit_date"
                type="date"
                value={localForm.exit_date}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                disabled={isBatchEdit}
                error={Boolean(errors.exit_date)}
                helperText={errors.exit_date}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1 }} htmlFor="address">
                <Typography variant="caption">Employee Address</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="address"
                value={localForm.address}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
                variant="outlined"
                disabled={isBatchEdit}
              />
            </Grid2>
          </Grid2>
        );

      case 4:
        return (
          <Grid2 container spacing={1}>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <Paper sx={{ p: 3 }}>
                <Box>
                  <Box
                    sx={{
                      border: '2px dashed #90caf9',
                      borderRadius: 2,
                      padding: 4,
                      textAlign: 'center',
                      backgroundColor: '#f5faff',
                      cursor: isBatchEdit ? 'not-allowed' : 'pointer',
                      width: '100%',
                      margin: '0 auto',
                      pointerEvents: isBatchEdit ? 'none' : 'auto',
                      opacity: isBatchEdit ? 0.5 : 1,
                    }}
                    onClick={() => !isBatchEdit && fileInputRef.current?.click()}
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
                        Supports: JPG, JPEG, PNG, Up to <strong>1 MB</strong>
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        component="span"
                        color="primary"
                        sx={{ fontWeight: 600, ml: 1, cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenCamera(true);
                        }}
                      >
                        Camera
                      </Typography>
                    </Box>

                    <Dialog
                      open={openCamera}
                      onClose={() => setOpenCamera(false)}
                      maxWidth="md"
                      fullWidth
                    >
                      <Box sx={{ p: 3 }}>
                        <Typography variant="h6" mb={2}>
                          Take Photo From Camera
                        </Typography>

                        <Grid2 container spacing={2}>
                          <Grid2 size={{ xs: 6, sm: 6 }}>
                            <Webcam
                              audio={false}
                              ref={webcamRef}
                              screenshotFormat="image/jpeg"
                              videoConstraints={{ facingMode: 'environment' }}
                              style={{
                                width: '100%',
                                borderRadius: 8,
                                border: '2px solid #ccc',
                              }}
                            />
                          </Grid2>

                          <Grid2 size={{ xs: 6, sm: 6 }}>
                            {screenshot ? (
                              <img
                                src={screenshot}
                                alt="Captured"
                                style={{ width: '100%', borderRadius: 8, border: '2px solid #ccc' }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  border: '2px dashed #ccc',
                                  borderRadius: 8,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  minHeight: 240,
                                }}
                              >
                                <Typography color="text.secondary">
                                  No Photos Have Been Taken Yet
                                </Typography>
                              </Box>
                            )}
                          </Grid2>
                        </Grid2>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ textAlign: 'right' }}>
                          <Button onClick={handleClear} color="warning" sx={{ mr: 2 }}>
                            Clear Foto
                          </Button>
                          <Button
                            variant="contained"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCapture();
                            }}
                          >
                            Take Foto
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenCamera(false);
                            }}
                            sx={{ ml: 2 }}
                          >
                            Close
                          </Button>
                        </Box>
                      </Box>
                    </Dialog>

                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      disabled={isBatchEdit}
                    />

                    {previewUrl && (
                      <Box
                        mt={2}
                        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                      >
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
                          disabled={removing || isBatchEdit}
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
              </Paper>
            </Grid2>
          </Grid2>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleOnSubmit}>
      <Box width="100%">
        {isMobile ? (
          <>
            <Box textAlign="center" mt={1}>
              <Typography variant="h5">{steps[activeStep]}</Typography>
            </Box>

            <MobileStepper
              variant="dots"
              steps={steps.length}
              position="static"
              activeStep={activeStep}
              nextButton={null}
              backButton={null}
              sx={{
                justifyContent: 'center',
                mt: 1,
              }}
            />
          </>
        ) : (
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => (
              <Step key={label} completed={false}>
                <StepButton onClick={() => setActiveStep(index)}>{label}</StepButton>
              </Step>
            ))}
          </Stepper>
        )}

        {/* {activeStep === steps.length ? (
          <Stack spacing={2} mt={3}>
            <Alert severity="success">All steps completed - you're finished</Alert>
            <Box textAlign="right">
              <Button onClick={handleReset} variant="contained" color="error">
                Reset
              </Button>
            </Box>
          </Stack>
        ) : ( */}
        <>
          <Box mt={1}>{StepContent(activeStep)}</Box>
          <Divider sx={{ mt: 2 }} />
          <Box display="flex" flexDirection="row" mt={2}>
            <Button
              // variant="outlined"
              color="primary"
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
              sx={{ backgroundColor: '#edf3ff' }}
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
        {/* )} */}
      </Box>
      <Backdrop
        open={loading}
        sx={{
          color: '#fff',
          zIndex: 999999,
        }}
      >
        <CircularProgress color="primary" />
      </Backdrop>
    </form>
  );
};

export default FormWizardAddEmployee;
