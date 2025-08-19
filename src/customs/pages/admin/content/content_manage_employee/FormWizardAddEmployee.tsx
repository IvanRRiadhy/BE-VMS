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
  FormControl,
  FormControlLabel,
  Grid2,
  Typography,
  Paper,
  Dialog,
  Divider,
  CircularProgress,
  Switch,
} from '@mui/material';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomRadio from 'src/components/forms/theme-elements/CustomRadio';
import Webcam from 'react-webcam';
import Swal from 'sweetalert2';
import ReactCrop, { Crop } from 'react-image-crop';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  createEmployee,
  getAllDepartments,
  getAllDepartmentsPagination,
  getAllDistricts,
  getAllDistrictsPagination,
  getAllOrganizations,
  getAllOrganizatiosPagination,
  updateEmployee,
  getEmployeeById,
  getAllEmployeePagination,
  getAllEmployee,
  uploadImageEmployee,
} from 'src/customs/api/admin';

import {
  CreateEmployeeRequest,
  CreateEmployeeRequestSchema,
  UpdateEmployeeRequest,
} from 'src/customs/api/models/Employee';
import { Item } from 'src/customs/api/models/Employee.ts';
import { showSuccessAlert } from 'src/customs/components/alerts/alerts';
const steps = ['Personal Info', 'Work Details', 'Access & Address', 'Other Details', 'Photo'];

type EnabledFields = {
  organization_id: boolean;
  department_id: boolean;
  district_id: boolean;
  access_area: boolean; // ⬅️ WAJIB ADA
  access_area_special: boolean;
  gender: boolean;
};

interface FormEmployeeProps {
  formData: CreateEmployeeRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateEmployeeRequest>>;
  edittingId?: string;
  onSuccess?: () => void;
  isBatchEdit?: boolean;
  selectedRows?: Item[]; // For batch edit, this will be the selected employee rows
  enabledFields?: EnabledFields;
  setEnabledFields: React.Dispatch<React.SetStateAction<EnabledFields>>;
}

const BASE_URL = 'http://192.168.1.116:8000';

const FormWizardAddEmployee = ({
  formData,
  setFormData,
  edittingId,
  onSuccess,
  isBatchEdit,
  selectedRows = [],
  enabledFields,
  setEnabledFields,
}: FormEmployeeProps) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');
  const [alertMessage, setAlertMessage] = useState<string>(
    'Complete the following data properly and correctly',
  );
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());
  const { token } = useSession(); // Assuming you have a session context to get the token
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
        setPreviewUrl(imageSrc); // <-- tambahkan ini agar masuk preview
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
        getAllOrganizatiosPagination(token, 0, 99, 'id'),
        getAllDepartmentsPagination(token, 0, 99, 'id'),
        getAllDistrictsPagination(token, 0, 99, 'id'),
      ]);

      // Simpan ke state
      setOrganization(orgRes.collection ?? []);
      setDepartment(deptRes.collection ?? []);
      setDistrict(distRes.collection ?? []);

      // Mapping ID ke Nama
      const orgMap = (orgRes.collection ?? []).reduce((acc: Record<string, string>, org: any) => {
        acc[org.id] = org.name;
        return acc;
      }, {});

      const deptMap = (deptRes.collection ?? []).reduce(
        (acc: Record<string, string>, dept: any) => {
          acc[dept.id] = dept.name;
          return acc;
        },
        {},
      );

      const distMap = (distRes.collection ?? []).reduce(
        (acc: Record<string, string>, dist: any) => {
          acc[dist.id] = dist.name;
          return acc;
        },
        {},
      );

      // Ambil data employee
      if (edittingId) {
        const employeeRes = await getEmployeeById(edittingId, token);
        const employee = employeeRes.collection[0];

        if (employee) {
          setFormData({
            ...employee,
            organization_id: String(employee.organization_id) || '',
            department_id: String(employee.department_id) || '',
            district_id: String(employee.district_id) || '',
          });
        } else {
          console.warn('Employee not found for editing ID:', edittingId);
        }
      }
    };

    fetchData();
  }, [token, edittingId]);

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

  const resetEnabledFields = () => {
    setFormData((prev) => ({
      ...prev,
      gender: 0,
      department_id: '',
      district_id: '',
      access_area_special: '',
      access_area: '', // Access area is always enabled
      organization_id: '',
    }));
    setEnabledFields({
      organization_id: false,
      department_id: false,
      district_id: false,
      access_area_special: false,
      access_area: false, // Access area is always enabled
      gender: false,
    });
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }
    setActiveStep((prev) => prev + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleReset = () => setActiveStep(0);
  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Save form data to localStorage for unsaved changes
      if (!token) {
        setAlertType('error');
        setAlertMessage('Something went wrong. Please try again later.');
        setTimeout(() => {
          setAlertType('info');
          setAlertMessage('Complete the following data properly and correctly');
        }, 3000);
        return;
      }

      // Batch Edit Mode
      if (isBatchEdit && selectedRows.length > 0) {
        const updatedFields: Partial<CreateEmployeeRequest> = {};

        // Misal ada field access_area_special dan gender juga
        if (enabledFields?.organization_id)
          updatedFields.organization_id = formData.organization_id;
        if (enabledFields?.department_id) updatedFields.department_id = formData.department_id;
        if (enabledFields?.district_id) updatedFields.district_id = formData.district_id;

        if (enabledFields?.access_area_special)
          updatedFields.access_area_special = formData.access_area_special;
        if (enabledFields?.gender) updatedFields.gender = formData.gender;

        // Kalau gak ada fields aktif, jangan update
        if (Object.keys(updatedFields).length === 0) {
          setAlertType('error');
          setAlertMessage('Please enable at least one field to update.');
          setTimeout(() => {
            setAlertType('info');
            setAlertMessage('Complete the following data properly and correctly');
          }, 3000);
          setLoading(false);
          return;
        }

        for (const row of selectedRows) {
          const updatedData: UpdateEmployeeRequest = {
            ...row,
            ...updatedFields,
          };
          await updateEmployee(row.id, updatedData, token);
        }

        setAlertType('success');
        setAlertMessage('Batch update successfully!');
        showSuccessAlert('Batch update successfully!');
        resetEnabledFields();
        onSuccess?.();
        return;
      }

      // NORMAL MODE (add/edit biasa)
      const mergedFormData = {
        ...formData,
        qr_code: formData.card_number,
        faceimage: formData.faceimage,
      };
      const data: CreateEmployeeRequest = CreateEmployeeRequestSchema.parse(mergedFormData);

      console.log('test', data);
      if (edittingId !== '' && edittingId !== undefined) {
        const editData: UpdateEmployeeRequest = {
          ...data,
          qr_code: formData.card_number,
          is_email_verify: false,
        };
        await updateEmployee(edittingId, editData, token);
        setAlertType('success');
        setAlertMessage('Employee successfully updated!');
      } else {
        await createEmployee(data, token);
        setAlertType('success');
        setAlertMessage('Employee successfully created!');
        setFormData(CreateEmployeeRequestSchema.parse({}));
      }
      handleFileUploads();
      localStorage.removeItem('unsavedEmployeeData');
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
      setTimeout(() => {
        setLoading(false);
      }, 800);
    }
  };

  // Handle Upload Image
  const handleFileUploads = async () => {
    if (fileInputRef.current && token) {
      const allSite = await getAllEmployeePagination(token, 0, 100, 'id');
      const otherAllSite = await getAllEmployee(token);

      const matchedSite = allSite.collection.find(
        (employee: any) =>
          employee.name === formData.name && employee.card_number === formData.card_number,
      );

      const otherMatchedSite = otherAllSite.collection.find(
        (employee: any) =>
          employee.name === formData.name && employee.card_number === formData.card_number,
      );

      // Upload manual (file input)
      if ((matchedSite || otherMatchedSite) && siteImageFile) {
        const id = matchedSite?.id || otherMatchedSite?.id!;
        console.log('Upload via file input, employee id:', id);
        await uploadImageEmployee(id, siteImageFile, token);
      }

      // Upload dari webcam
      else if ((matchedSite || otherMatchedSite) && formData.faceimage) {
        const id = matchedSite?.id || otherMatchedSite?.id!;
        console.log('Upload via webcam, employee id:', id);

        const blob = await fetch(formData.faceimage).then((res) => res.blob());
        const file = new File([blob], 'webcam.jpg', { type: 'image/jpeg' });

        await uploadImageEmployee(id, file, token);
      }

      // Tidak ditemukan
      else {
        console.log('No matching site found or no image data');
      }
    }
  };

  // Handle Change Image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setSiteImageFile(selectedFile);
      console.log('Slected file:', selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  useEffect(() => {
    if (!siteImageFile && formData.faceimage) {
      // Jika dari backend berupa URL atau base64, set preview
      if (
        formData.faceimage.startsWith('data:faceimage') ||
        formData.faceimage.startsWith('http') ||
        formData.faceimage.startsWith('https')
      ) {
        setPreviewUrl(formData.faceimage);
      } else {
        // Jika bukan URL atau base64 (misal path lokal dari backend), kamu bisa prepend base URL
        setPreviewUrl(`${BASE_URL}/cdn${formData.faceimage}`);
      }
    }
  }, [formData.faceimage, siteImageFile]);

  const StepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <Alert severity="info">Fill in employee personal info</Alert>
            </Grid2>
            {/* Name */}
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="name" required>
                <Typography variant="caption">Employee Name</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                disabled={isBatchEdit}
                variant="outlined"
              />
            </Grid2>
            {/* Person ID */}
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="nik" required>
                <Typography variant="caption">Employee ID</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="person_id"
                value={formData.person_id}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                required
                disabled={isBatchEdit}
              />
            </Grid2>
            {/* NIK */}
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="nik" required>
                <Typography variant="caption">Employee NIK</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="identity_id"
                value={formData.identity_id}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                required
                disabled={isBatchEdit}
              />
            </Grid2>

            {/* Email */}
            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="email" required>
                <Typography variant="caption">Employee Email</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                required
                disabled={isBatchEdit}
              />
            </Grid2>

            {/* Gender */}
            <Grid2 sx={{ paddingLeft: '25px' }} size={{ xs: 6, sm: 6 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ marginX: 1, marginTop: 0.8 }}
              >
                <CustomFormLabel required>
                  <Typography variant="caption">Gender</Typography>
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

              <FormControl sx={{ display: 'flex', flexDirection: 'row' }}>
                <FormControlLabel
                  value={1}
                  label="Male"
                  control={
                    <CustomRadio
                      checked={formData.gender === 1}
                      onChange={() => setFormData((prev) => ({ ...prev, gender: 1 }))}
                      disabled={isBatchEdit && !enabledFields?.gender}
                    />
                  }
                />
                <FormControlLabel
                  value={2}
                  label="Female"
                  control={
                    <CustomRadio
                      checked={formData.gender === 2}
                      onChange={() => setFormData((prev) => ({ ...prev, gender: 2 }))}
                      disabled={isBatchEdit && !enabledFields?.gender}
                    />
                  }
                />
              </FormControl>
            </Grid2>
          </Grid2>
        );

      case 1:
        return (
          <Grid2 container spacing={2}>
            {/* <Grid2 mt={2} size={{ xs: 12, sm: 12 }}>
              <Alert severity="info">Work-related details</Alert>
            </Grid2> */}
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="phone">
                <Typography variant="caption">Employee Phone :</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                disabled={isBatchEdit}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ marginX: 1, marginTop: 0.8 }}
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

              <CustomTextField
                id="district_id"
                name="district_id"
                select
                value={String(formData.district_id) || ''}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                disabled={isBatchEdit && !enabledFields?.district_id}
              >
                {district.map((item: any) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid2>

            <Grid2 size={{ xs: 6, sm: 6 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ marginX: 1, marginTop: 0.8 }}
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

              <CustomTextField
                id="organization_id"
                name="organization_id"
                select
                value={String(formData.organization_id)}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                disabled={isBatchEdit && !enabledFields?.organization_id}
              >
                {organization?.map((item: any) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid2>

            <Grid2 size={{ xs: 6, sm: 6 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ marginX: 1, marginTop: 0.8 }}
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

              <CustomTextField
                id="department_id"
                name="department_id"
                select
                value={formData.department_id}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                disabled={isBatchEdit && !enabledFields?.department_id}
              >
                {department?.map((item: any) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid2>
          </Grid2>
        );

      case 2:
        return (
          <Grid2 container spacing={2}>
            {/* <Grid2 size={{ xs: 12, sm: 12 }}>
              <Alert severity="info">Access and location info</Alert>
            </Grid2> */}
            {/* Is Head */}
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <FormControlLabel
                control={
                  <CustomRadio
                    checked={formData.is_head === true}
                    onChange={() => setFormData((prev) => ({ ...prev, is_head: !prev.is_head }))}
                    disabled={isBatchEdit}
                  />
                }
                label="Is Head Employee"
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="head1">
                <Typography variant="caption">Employee Head-1</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="head_employee_1"
                name="head_employee_1"
                value={formData.head_employee_1}
                onChange={handleChange}
                select
                fullWidth
                variant="outlined"
                disabled={isBatchEdit}
              >
                {/* Replace with your actual head employee options */}
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="A">Head A</MenuItem>
                <MenuItem value="B">Head B</MenuItem>
                <MenuItem value="C">Head C</MenuItem>
              </CustomTextField>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="head2">
                <Typography variant="caption">Employee Head-2</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="head_employee_2"
                name="head_employee_2"
                value={formData.head_employee_2}
                onChange={handleChange}
                select
                fullWidth
                variant="outlined"
                disabled={isBatchEdit}
              >
                {/* Replace with your actual head employee options */}
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="A">Head A</MenuItem>
                <MenuItem value="B">Head B</MenuItem>
                <MenuItem value="C">Head C</MenuItem>
              </CustomTextField>
            </Grid2>
            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="card_number">
                <Typography variant="caption">Card Access</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="card_number"
                value={formData.card_number}
                onChange={(e: any) => {
                  setFormData((prev) => ({ ...prev, qr_code: prev.card_number }));
                  handleChange(e);
                }}
                fullWidth
                variant="outlined"
                disabled={isBatchEdit}
              />
            </Grid2>
            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="card_number">
                <Typography variant="caption">BLE Card</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="ble_card_number"
                value={formData.ble_card_number}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                disabled={isBatchEdit}
              />
            </Grid2>
            {/* <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="qr">
                <Typography variant="caption">QR Access :</Typography>
              </CustomFormLabel>
              <CustomTextField id="qr" fullWidth variant="outlined" />
            </Grid2> */}
            {/* Access Area */}
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="access_are" required>
                  <Typography variant="caption">Access Area Special</Typography>
                </CustomFormLabel>

                {isBatchEdit && (
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={enabledFields?.access_area || false}
                        onChange={(e) =>
                          setEnabledFields((prev) => ({
                            ...prev,
                            access_area: e.target.checked,
                          }))
                        }
                      />
                    }
                    label=""
                    labelPlacement="start"
                  />
                )}
              </Box>

              <CustomTextField
                id="access_are"
                value={formData.access_area}
                onChange={handleChange}
                fullWidth
                required
                disabled={isBatchEdit && !enabledFields?.access_area}
                variant="outlined"
              />
            </Grid2>
            {/* Access Area Special */}
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <CustomFormLabel
                  sx={{ marginY: 1, marginX: 1 }}
                  htmlFor="access_area_special"
                  required
                >
                  <Typography variant="caption">Access Area Special</Typography>
                </CustomFormLabel>

                {isBatchEdit && (
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={enabledFields?.access_area_special || false}
                        onChange={(e) =>
                          setEnabledFields((prev) => ({
                            ...prev,
                            access_area_special: e.target.checked,
                          }))
                        }
                      />
                    }
                    label=""
                    labelPlacement="start"
                  />
                )}
              </Box>

              <CustomTextField
                id="access_area_special"
                value={formData.access_area_special}
                onChange={handleChange}
                fullWidth
                required
                disabled={isBatchEdit && !enabledFields?.access_area_special}
                variant="outlined"
              />
            </Grid2>
          </Grid2>
        );

      case 3:
        return (
          <Grid2 container spacing={2}>
            {/* <Grid2 size={{ xs: 12, sm: 12 }}>
              <Alert severity="info">Other details</Alert>
            </Grid2> */}

            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="dob" required>
                <Typography variant="caption">Date of Birth</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                disabled={isBatchEdit}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="join" required>
                <Typography variant="caption">Join Date</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="join_date"
                type="date"
                value={formData.join_date}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                disabled={isBatchEdit}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="join" required>
                <Typography variant="caption">Exit Date</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="exit_date"
                type="date"
                value={formData.exit_date}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                disabled={isBatchEdit}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="address">
                <Typography variant="caption">Employee Address</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="address"
                value={formData.address}
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
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <Alert severity={alertType}>{alertMessage}</Alert>
            </Grid2>
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

                    <Typography variant="caption" color="textSecondary">
                      Supports: JPG, JPEG, PNG
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
                              e.stopPropagation(); // ✅ cegah trigger upload
                              handleCapture(); // 📸 ambil foto dari kamera
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

                    {previewUrl && (
                      <Box
                        mt={2}
                        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                      >
                        <img
                          src={previewUrl}
                          alt="preview"
                          style={{
                            width: 200,
                            height: 200,
                            borderRadius: 12,
                            objectFit: 'cover',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                          }}
                        />
                      </Box>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      disabled={isBatchEdit}
                    />
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
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => {
            const stepProps: { completed?: boolean } = {};
            const labelProps: { optional?: React.ReactNode } = {};
            if (isStepSkipped(index)) stepProps.completed = false;
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>

        {activeStep === steps.length ? (
          <Stack spacing={2} mt={3}>
            <Alert severity="success">All steps completed - you're finished</Alert>
            <Box textAlign="right">
              <Button onClick={handleReset} variant="contained" color="error">
                Reset
              </Button>
            </Box>
          </Stack>
        ) : (
          <>
            <Box mt={3}>{StepContent(activeStep)}</Box>
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
        )}
      </Box>
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

export default FormWizardAddEmployee;
