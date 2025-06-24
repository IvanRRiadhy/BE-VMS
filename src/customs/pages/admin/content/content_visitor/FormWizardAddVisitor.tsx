import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Alert,
  Stack,
  MenuItem,
  Dialog,
  Grid,
  Divider,
  Grid2,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import ParentCard from 'src/components/shared/ParentCard';
import Webcam from 'react-webcam';

import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const steps = [
  'Personal Data',
  'Upload ID Card',
  'Upload Visitor Photo',
  'Purpose Of Visit - Part 1',
  'Purpose Of Visit - Part 2',
];

const FormWizardAddVisitor = () => {
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [visitorPhotoFile, setVisitorPhotoFile] = useState<File | null>(null);
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());

  const isStepSkipped = (step: any) => skipped.has(step);

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSteps = (step: any) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Grid2 container spacing={2}>
              <Grid2 sx={{ mt: 5 }} size={{ xs: 12, sm: 12 }}>
                <Alert severity="info">Complete the following data properly and correctly</Alert>
              </Grid2>

              {/* ID card */}
              <Grid2 size={{ xs: 6, sm: 6 }}>
                <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="id_card_number">
                  <Typography variant="caption">ID card number</Typography>
                </CustomFormLabel>
                <CustomTextField
                  id="id_card_number"
                  variant="outlined"
                  fullWidth
                  helperText="You have to make sure that the ID card number is true."
                />
              </Grid2>

              {/* name */}
              <Grid2 size={{ xs: 6, sm: 6 }}>
                <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="name">
                  <Typography variant="caption">Name</Typography>
                </CustomFormLabel>
                <CustomTextField
                  id="name"
                  variant="outlined"
                  fullWidth
                  helperText="You have to make sure that the name of this Visitor is true."
                />
              </Grid2>

              {/* email */}
              <Grid2 size={{ xs: 6, sm: 6 }}>
                <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="email">
                  <Typography variant="caption">Email</Typography>
                </CustomFormLabel>
                <CustomTextField
                  id="email"
                  variant="outlined"
                  fullWidth
                  helperText="You have to make sure that the email of this Visitor is true."
                />
              </Grid2>

              {/* personal title */}
              <Grid2 size={{ xs: 6, sm: 6 }}>
                <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="professional_title">
                  <Typography variant="caption">Title</Typography>
                </CustomFormLabel>
                <CustomTextField
                  id="professional_title"
                  select
                  variant="outlined"
                  fullWidth
                  defaultValue=""
                  helperText="You have to make sure that the title of this Visitor is true."
                >
                  <MenuItem value="Ibu">Ibu</MenuItem>
                  <MenuItem value="Bapak">Bapak</MenuItem>
                  <MenuItem value="Mr">Mr</MenuItem>
                  <MenuItem value="Mrs">Mrs</MenuItem>
                </CustomTextField>
              </Grid2>
            </Grid2>
          </Box>
        );

      case 1:
        return (
          <Box>
            <ImageUploadCard
              title="You can upload  ID card photo, or using"
              file={idCardFile}
              onFileChange={(file) => setIdCardFile(file)}
            />
          </Box>
        );

      case 2:
        return (
          <Box>
            <ImageUploadCard
              title="You can post visitor photo,  or using"
              file={visitorPhotoFile}
              onFileChange={(file) => setVisitorPhotoFile(file)}
            />
          </Box>
        );

      case 3:
        return (
          <Box>
            <Grid2 container spacing={2}>
              <Grid2 sx={{ mt: 5 }} size={{ xs: 12, sm: 12 }}>
                <Alert severity="info">Complete the following data properly and correctly</Alert>
              </Grid2>

              {/* Name of person */}
              <Grid2 size={{ xs: 6, sm: 6 }}>
                <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="name_of_person">
                  <Typography variant="caption">Name of person</Typography>
                </CustomFormLabel>
                <CustomTextField
                  id="name_of_person"
                  variant="outlined"
                  fullWidth
                  helperText="You have to make sure that the name of this Visitor is true."
                />
              </Grid2>

              {/* Phone */}
              <Grid2 size={{ xs: 6, sm: 6 }}>
                <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="phone">
                  <Typography variant="caption">Phone</Typography>
                </CustomFormLabel>
                <CustomTextField
                  id="phone"
                  variant="outlined"
                  fullWidth
                  helperText="You have to make sure that the phone of this Visitor is true."
                />
              </Grid2>

              {/* Email */}
              <Grid2 size={{ xs: 6, sm: 6 }}>
                <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="email">
                  <Typography variant="caption">Email</Typography>
                </CustomFormLabel>
                <CustomTextField
                  id="email"
                  variant="outlined"
                  fullWidth
                  helperText="You have to make sure that the email of this Visitor is true."
                />
              </Grid2>

              {/* Purpose */}
              <Grid2 size={{ xs: 6, sm: 6 }}>
                <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="purpose">
                  <Typography variant="caption">Purpose</Typography>
                </CustomFormLabel>
                <CustomTextField
                  id="purpose"
                  select
                  variant="outlined"
                  fullWidth
                  defaultValue=""
                  helperText="You have to make sure that the purpose of this Visitor is true."
                >
                  <MenuItem value="Meeting">Meeting</MenuItem>
                  <MenuItem value="Survey">Survey</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </CustomTextField>
              </Grid2>
            </Grid2>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Grid2 container spacing={2}>
              {/* Agenda */}
              <Grid2 size={{ xs: 6, sm: 6 }}>
                <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="Agenda">
                  <Typography variant="caption">Agenda</Typography>
                </CustomFormLabel>
                <CustomTextField
                  id="Agenda"
                  variant="outlined"
                  fullWidth
                  helperText="You have to make sure that the agenda of this Visitor is true."
                />
              </Grid2>

              {/* Place */}
              <Grid2 size={{ xs: 6, sm: 6 }}>
                <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="Place">
                  <Typography variant="caption">Place</Typography>
                </CustomFormLabel>
                <CustomTextField
                  id="Place"
                  variant="outlined"
                  fullWidth
                  helperText="You have to make sure that the place of this Visitor is true."
                />
              </Grid2>

              {/* Start Date */}
              <Grid2 size={{ xs: 6, sm: 6 }}>
                <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="Start">
                  <Typography variant="caption">Start</Typography>
                </CustomFormLabel>
                <CustomTextField
                  type="date"
                  id="Start"
                  variant="outlined"
                  fullWidth
                  helperText="You have to make sure that the start date of this Visitor is true."
                />
              </Grid2>

              {/* End Date */}
              <Grid2 size={{ xs: 6, sm: 6 }}>
                <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="End">
                  <Typography variant="caption">End</Typography>
                </CustomFormLabel>
                <CustomTextField
                  type="date"
                  id="End"
                  variant="outlined"
                  fullWidth
                  helperText="You have to make sure that the end date of this Visitor is true."
                />
              </Grid2>
            </Grid2>
          </Box>
        );

      default:
        return null;
    }
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <PageContainer>
      <Box width="100%">
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => {
            const stepProps: { completed?: boolean } = {};
            const labelProps: {
              optional?: React.ReactNode;
            } = {};
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
        {activeStep === steps.length ? (
          <>
            <Stack spacing={2} mt={3}>
              <Alert severity="success">All steps completed - you&apos;re finished</Alert>

              <Box textAlign="right">
                <Button onClick={handleReset} variant="contained" color="error">
                  Reset
                </Button>
              </Box>
            </Stack>
          </>
        ) : (
          <>
            <Box>{handleSteps(activeStep)}</Box>

            <Box display="flex" flexDirection="row" mt={3}>
              <Button
                color="inherit"
                variant="contained"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
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

export default FormWizardAddVisitor;

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
            Ambil Foto dari Kamera
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
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
            </Grid>

            <Grid item xs={12} md={6}>
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
                  <Typography color="text.secondary">Belum ada foto diambil</Typography>
                </Box>
              )}
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ textAlign: 'right' }}>
            <Button onClick={handleClear} color="warning" sx={{ mr: 2 }}>
              Clear Foto
            </Button>
            <Button variant="contained" onClick={handleCapture}>
              Ambil Foto
            </Button>
            <Button onClick={() => setOpenCamera(false)} sx={{ ml: 2 }}>
              Tutup
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
            Crop Gambar
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
              Batal
            </Button>
            <Button variant="contained" onClick={handleCropSave}>
              Simpan Hasil Crop
            </Button>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};
