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
import { getAllDepartments, getAllDistricts, getAllOrganizations } from 'src/customs/api/admin';

const steps = ['Personal Info', 'Work Details', 'Access & Address', 'Other Details', 'Photo'];

const FormWizardAddEmployee = () => {
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
      const orgRes = await getAllOrganizations(token);
      const deptRes = await getAllDepartments(token);
      const distRes = await getAllDistricts(token);
    setOrganization(orgRes?.collection ?? []);
    setDepartment(deptRes?.collection ?? []);
    setDistrict(distRes?.collection ?? []);
    };
    fetchData();
  }, [token]);

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
                <Typography variant="caption">Employee Name :</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="name"
                fullWidth
                variant="outlined"
                helperText="Make sure the name is correct."
              />
            </Grid2>
            {/* NIK */}
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="nik">
                <Typography variant="caption">Employee NIK :</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="nik"
                fullWidth
                variant="outlined"
                helperText="Ensure valid NIK."
              />
            </Grid2>

            {/* Email */}
            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="email">
                <Typography variant="caption">Employee Email :</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="email"
                fullWidth
                variant="outlined"
                helperText="Check email validity."
              />
            </Grid2>

            {/* Gender */}
            <Grid2 sx={{ paddingLeft: '25px' }} size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }}>
                <Typography variant="caption">Gender :</Typography>
              </CustomFormLabel>
              <FormControl sx={{ display: 'flex', flexDirection: 'row' }}>
                <FormControlLabel value="male" label="Male" control={<CustomRadio />} />
                <FormControlLabel value="female" label="Female" control={<CustomRadio />} />
              </FormControl>
            </Grid2>
          </Grid2>
        );

      case 1:
        return (
          <Grid2 container spacing={2}>
            <Grid2 mt={2}  size={{ xs: 12, sm: 12 }}>
              <Alert severity="info">Work-related details</Alert>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="phone">
                <Typography variant="caption">Employee Phone :</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="phone"
                fullWidth
                variant="outlined"
                helperText="Enter phone number."
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="district">
                <Typography variant="caption">Employee District :</Typography>
              </CustomFormLabel>
              <CustomTextField id="district" select fullWidth variant="outlined" defaultValue="">
                {district?.map((item: any) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid2>
            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="org">
                <Typography variant="caption">Employee Organization :</Typography>
              </CustomFormLabel>
              <CustomTextField id="org" select fullWidth variant="outlined" defaultValue="">
                {organization?.map((item: any) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid2>
            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="dept">
                <Typography variant="caption">Employee Department :</Typography>
              </CustomFormLabel>
              <CustomTextField id="dept" select fullWidth variant="outlined" defaultValue="">
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

            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="head1">
                <Typography variant="caption">Employee Head-1 :</Typography>
              </CustomFormLabel>
              <CustomTextField id="head1" select fullWidth variant="outlined" defaultValue="">
                <MenuItem value="A">Head A</MenuItem>
                <MenuItem value="B">Head B</MenuItem>
                <MenuItem value="C">Head C</MenuItem>
              </CustomTextField>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="head2">
                <Typography variant="caption">Employee Head-2 :</Typography>
              </CustomFormLabel>
              <CustomTextField id="head2" select fullWidth variant="outlined" defaultValue="">
                <MenuItem value="A">Head A</MenuItem>
                <MenuItem value="B">Head B</MenuItem>
                <MenuItem value="C">Head C</MenuItem>55
              </CustomTextField>
            </Grid2>
            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="card">
                <Typography variant="caption">Card Access :</Typography>
              </CustomFormLabel>
              <CustomTextField id="card" fullWidth variant="outlined" />
            </Grid2>
            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="qr">
                <Typography variant="caption">QR Access :</Typography>
              </CustomFormLabel>
              <CustomTextField id="qr" fullWidth variant="outlined" />
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
                <Typography variant="caption">Date of Birth :</Typography>
              </CustomFormLabel>
              <CustomTextField id="dob" type="date" fullWidth variant="outlined" />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="join">
                <Typography variant="caption">Join Date :</Typography>
              </CustomFormLabel>
              <CustomTextField id="join" type="date" fullWidth variant="outlined" />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="address">
                <Typography variant="caption">Employee Address :</Typography>
              </CustomFormLabel>
              <CustomTextField id="address" multiline rows={3} fullWidth variant="outlined" />
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
      <PageContainer>
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
                <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
                <Box flex="1 1 auto" />
                <Button
                  onClick={handleNext}
                  variant="contained"
                  color={activeStep === steps.length - 1 ? 'success' : 'secondary'}
                >
                  {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </PageContainer>
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
