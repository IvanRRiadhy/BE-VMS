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
  Dialog,
  Divider,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomRadio from 'src/components/forms/theme-elements/CustomRadio';
import Webcam from 'react-webcam';
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
} from 'src/customs/api/admin';
import {
  CreateEmployeeRequest,
  CreateEmployeeRequestSchema,
  UpdateEmployeeRequest,
} from 'src/customs/api/models/Employee';

const steps = ['Personal Info', 'Work Details', 'Access & Address', 'Other Details', 'Photo'];

interface FormEmployeeProps {
  formData: CreateEmployeeRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateEmployeeRequest>>;
  edittingId?: string;
  onSuccess?: () => void;
}

const FormWizardAddEmployee = ({
  formData,
  setFormData,
  edittingId,
  onSuccess,
}: FormEmployeeProps) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');
  const [alertMessage, setAlertMessage] = useState<string>(
    'Complete the following data properly and correctly',
  );
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());
  const [employeePhotoFile, setEmployeePhotoFile] = useState<File | null>(null);
  const { token } = useSession(); // Assuming you have a session context to get the token
  const [organization, setOrganization] = useState<any[]>([]);
  const [department, setDepartment] = useState<any[]>([]);
  const [district, setDistrict] = useState<any[]>([]);
  const isStepSkipped = (step: number) => skipped.has(step);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      const orgRes = await getAllOrganizatiosPagination(token, 0, 99, 'id');
      const deptRes = await getAllDepartmentsPagination(token, 0, 99, 'id');
      const distRes = await getAllDistrictsPagination(token, 0, 99, 'id');
      setOrganization(orgRes?.collection ?? []);
      setDepartment(deptRes?.collection ?? []);
      setDistrict(distRes?.collection ?? []);
    };
    fetchData();
  }, [token]);
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      faceimage:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFcAAABXAQMAAABLBksvAAAABlBMVEX///8AAABVwtN+AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAtUlEQVQ4jc3SMQ7DIAwF0I8YuiUXiJRrsHGl5AQNF4ArsfkaSFyg3TJUdZ0hbQdk1jC9AYT9beBqZ2TeXGUuigfYDXWDal+js2nvWO53Hahn2MD2W0PTUn/866Xp44n7RdH0uPPbSRSaDZeVJpOL4sFbJpsIig1jpdfgNOM2P/z8pKL5aHMOu2bJQcK8ZyiWPBNP5tyBtr0MRUbccSAsHroT13juUtvyb8YCKD7qJ8u5KL7W+QBqIwtw+AKG3gAAAABJRU5ErkJggg==',
      // faceimage: '',
    }));
  }, []);
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
      setFormData((prev) => ({ ...prev, qr_code: formData.card_number }));
      // const filteredFormData: CreateEmployeeRequest = Object.fromEntries(Object.entries(formData).filter(([key, value]) => value !== undefined));
      const data: CreateEmployeeRequest = CreateEmployeeRequestSchema.parse(formData);
      console.log(edittingId);
      console.log('Data: ', data);
      if (edittingId !== '' && edittingId !== undefined) {
        const editData: UpdateEmployeeRequest = {
          ...data,
          is_email_verify: false,
        };
        await updateEmployee(edittingId, editData, token);
      } else {
        await createEmployee(data, token);
      }

      localStorage.removeItem('unsavedEmployeeForm');
      setAlertType('success');
      setAlertMessage('Employee created successfully!');
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
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="name">
                <Typography variant="caption">Employee Name</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                helperText="Make sure the name is correct."
                required
              />
            </Grid2>
            {/* Person ID */}
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="nik">
                <Typography variant="caption">Employee ID</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="person_id"
                value={formData.person_id}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                helperText="Ensure valid ID."
                required
              />
            </Grid2>
            {/* NIK */}
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="nik">
                <Typography variant="caption">Employee NIK</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="identity_id"
                value={formData.identity_id}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                helperText="Ensure valid NIK."
                required
              />
            </Grid2>

            {/* Email */}
            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="email">
                <Typography variant="caption">Employee Email</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                helperText="Check email validity."
                required
              />
            </Grid2>

            {/* Gender */}
            <Grid2 sx={{ paddingLeft: '25px' }} size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }}>
                <Typography variant="caption">Gender</Typography>
              </CustomFormLabel>
              <FormControl sx={{ display: 'flex', flexDirection: 'row' }}>
                <FormControlLabel
                  value={1}
                  label="Male"
                  control={
                    <CustomRadio
                      checked={formData.gender === 1}
                      onChange={() => setFormData((prev) => ({ ...prev, gender: 1 }))}
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
            <Grid2 mt={2} size={{ xs: 12, sm: 12 }}>
              <Alert severity="info">Work-related details</Alert>
            </Grid2>
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
                helperText="Enter phone number."
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="district">
                <Typography variant="caption">Employee District</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="district_id"
                name="district_id"
                select
                value={formData.district_id || ''}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              >
                {district?.map((item: any) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid2>
            
            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="org">
                <Typography variant="caption">Employee Organization</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="organization_id"
                name="organization_id"
                select
                value={formData.organization_id}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              >
                {organization?.map((item: any) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid2>


            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="dept">
                <Typography variant="caption">Employee Department</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="department_id"
                name="department_id"
                select
                value={formData.department_id}
                onChange={handleChange}
                fullWidth
                variant="outlined"
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
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <Alert severity="info">Access and location info</Alert>
            </Grid2>
            {/* Is Head */}
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <FormControlLabel
                control={
                  <CustomRadio
                    checked={formData.is_head === true}
                    onChange={() => setFormData((prev) => ({ ...prev, is_head: !prev.is_head }))}
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
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="access_area">
                <Typography variant="caption">Access Area</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="access_area"
                value={formData.access_area}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </Grid2>
            {/* Access Area Special */}
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="access_area_special">
                <Typography variant="caption">Access Area Special</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="access_area_special"
                value={formData.access_area_special}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </Grid2>
          </Grid2>
        );

      case 3:
        return (
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <Alert severity="info">Other details</Alert>
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="dob">
                <Typography variant="caption">Date of Birth</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="join">
                <Typography variant="caption">Join Date</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="join_date"
                type="date"
                value={formData.join_date}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="join">
                <Typography variant="caption">Exit Date</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="exit_date"
                type="date"
                value={formData.exit_date}
                onChange={handleChange}
                fullWidth
                variant="outlined"
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
              />
            </Grid2>
          </Grid2>
        );

      case 4:
        return (
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <Alert severity="info">Upload photo</Alert>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <ImageUploadCard
                title="Upload employee photo"
                file={employeePhotoFile}
                onFileChange={(file) => setEmployeePhotoFile(file)}
              />
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
    </form>
  );
};

export default FormWizardAddEmployee;

// Post photo.
type ImageUploadCardProps = {
  title: string;
  file: File | null;
  onFileChange: (file: File) => void;
};

const ImageUploadCard: React.FC<ImageUploadCardProps> = ({ title, file, onFileChange }) => {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [openCamera, setOpenCamera] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);

  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 0,
    y: 0,
    width: 50,
    height: 50,
  });

  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Convert base64 or File to object URL for preview
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const openCropDialog = (imageSrc: string) => {
    setImageToCrop(imageSrc);
    setCropDialogOpen(true);
  };

  const getCroppedImage = async () => {
    if (!completedCrop || !imageRef.current) return;

    const canvas = document.createElement('canvas');
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
    canvas.width = completedCrop.width!;
    canvas.height = completedCrop.height!;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(
      imageRef.current,
      completedCrop.x! * scaleX,
      completedCrop.y! * scaleY,
      completedCrop.width! * scaleX,
      completedCrop.height! * scaleY,
      0,
      0,
      completedCrop.width!,
      completedCrop.height!,
    );

    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], `${title.replace(/\s+/g, '_')}_cropped.jpg`, {
            type: 'image/jpeg',
          });
          resolve(croppedFile);
        }
      }, 'image/jpeg');
    });
  };

  const handleCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setScreenshot(imageSrc);
      openCropDialog(imageSrc);
    }
  };

  const handleClear = () => {
    setScreenshot(null);
    setPreviewUrl(null);
    onFileChange(null as any);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        openCropDialog(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleCropSave = async () => {
    const cropped = await getCroppedImage();
    if (cropped) {
      onFileChange(cropped);
    }
    setCropDialogOpen(false);
    setImageToCrop(null);
  };

  return (
    <>
      <Box
        sx={{
          border: '2px dashed #90caf9',
          borderRadius: 2,
          padding: 4,
          textAlign: 'center',
          mt: 5,
          backgroundColor: '#f5faff',
          cursor: 'pointer',
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <CloudUploadIcon sx={{ fontSize: 48, color: '#42a5f5' }} />
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          {title}{' '}
          <Typography
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
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Supports: JPG, JPEG, PNG
        </Typography>

        {previewUrl && (
          <Box mt={2}>
            <img
              src={previewUrl}
              alt="preview"
              style={{
                width: 100,
                height: 100,
                borderRadius: 8,
                objectFit: 'cover',
                cursor: 'pointer',
              }}
              onClick={() => openCropDialog(previewUrl)}
            />
          </Box>
        )}

        {/* hidden file input */}
        <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileSelect} />
      </Box>

      {/* Webcam Dialog */}
      <Dialog open={openCamera} onClose={() => setOpenCamera(false)} maxWidth="md" fullWidth>
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
                  <Typography color="text.secondary">No Photos Have Been Taken Yet</Typography>
                </Box>
              )}
            </Grid2>
          </Grid2>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ textAlign: 'right' }}>
            <Button onClick={handleClear} color="warning" sx={{ mr: 2 }}>
              Clear Foto
            </Button>
            <Button variant="contained" onClick={handleCapture}>
              Take Foto
            </Button>
            <Button onClick={() => setOpenCamera(false)} sx={{ ml: 2 }}>
              Close
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Crop Dialog */}
      <Dialog
        open={cropDialogOpen}
        onClose={() => setCropDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" mb={2}>
            Crop Image
          </Typography>

          {imageToCrop && (
            <ReactCrop
              crop={crop}
              onChange={(newCrop) => setCrop(newCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
            >
              <img
                src={imageToCrop}
                ref={imageRef}
                alt="crop source"
                style={{ maxWidth: '100%' }}
              />
            </ReactCrop>
          )}

          <Box sx={{ textAlign: 'right', mt: 2 }}>
            <Button onClick={() => setCropDialogOpen(false)} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleCropSave}>
              Save Result Crop
            </Button>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};
