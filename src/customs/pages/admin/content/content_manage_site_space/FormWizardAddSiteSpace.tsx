import { Box, Stack } from '@mui/system';
import React, { useEffect, useRef, useState } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Alert, Button, Dialog, Grid2, Step, StepLabel, Stepper, Typography } from '@mui/material';
import ParentCard from 'src/components/shared/ParentCard';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import PageContainer from 'src/components/container/PageContainer';

//

const steps = ['Site Information', 'Site Image'];

const FormWizardAddSiteSpace = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());

  const [sitePhotoFile, setSitePhotoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    siteName: '',
    siteDescription: '',
  });

  const isStepSkipped = (step: number) => skipped.has(step);

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

  const handleReset = () => {
    setActiveStep(0);
    setFormData({
      siteName: '',
      siteDescription: '',
    });
    setSitePhotoFile(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = () => {
    console.log('Form submitted:', { ...formData, sitePhotoFile });
    // Kirim ke backend via API
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12 }}>
              <Alert severity="info">Complete the following data properly and correctly</Alert>
            </Grid2>

            <Grid2 size={{ xs: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="siteName">
                <Typography variant="caption">Site Name</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="siteName"
                variant="outlined"
                fullWidth
                value={formData.siteName}
                onChange={handleChange}
                helperText="You have to make sure that the name of this Site is true."
              />
            </Grid2>

            <Grid2 size={{ xs: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="siteDescription">
                <Typography variant="caption">Site Description</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="siteDescription"
                variant="outlined"
                fullWidth
                value={formData.siteDescription}
                onChange={handleChange}
                helperText="You have to make sure that the description of this Site is true."
              />
            </Grid2>
          </Grid2>
        );

      case 1:
        return (
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12 }}>
              <Alert severity="info">Upload image of the site carefully</Alert>
            </Grid2>

            <Grid2 size={{ xs: 12 }}>
              <ImageUploadCard
                title="Upload The Site Image"
                file={sitePhotoFile}
                onFileChange={(file) => setSitePhotoFile(file)}
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
          {steps.map((label, index) => (
            <Step key={label} completed={!isStepSkipped(index)}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
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
            <Box mt={3}>{renderStepContent(activeStep)}</Box>

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
                variant="contained"
                color={activeStep === steps.length - 1 ? 'success' : 'primary'}
                onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
              >
                {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </PageContainer>
  );
};

export default FormWizardAddSiteSpace;

type ImageUploadCardProps = {
  title: string;
  file: File | null;
  onFileChange: (file: File) => void;
};

const ImageUploadCard: React.FC<ImageUploadCardProps> = ({ title, file, onFileChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleClear = () => {
    setPreviewUrl(null);
    onFileChange(null as any);
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
          {title}
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

        <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileSelect} />
      </Box>

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
