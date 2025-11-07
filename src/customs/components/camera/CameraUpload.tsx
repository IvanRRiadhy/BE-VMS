import React from 'react';
import { Box, Typography, Divider, IconButton, Button } from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import Webcam from 'react-webcam';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { IconTrash, IconX } from '@tabler/icons-react';
import Dialog from '@mui/material/Dialog';
import { axiosInstance2 } from 'src/customs/api/interceptor';

interface CameraUploadProps {
  value?: string;
  onChange: (url: string) => void;
}

const CameraUpload: React.FC<CameraUploadProps> = ({ value, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(value || null);
  const [screenshot, setScreenshot] = React.useState<string | null>(null);
  const [removing, setRemoving] = React.useState(false);
  const webcamRef = React.useRef<Webcam>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const clearLocal = () => {
    setScreenshot(null);
    setPreviewUrl(null);
    onChange('');
  };

  const uploadFileToCDN = async (file: File | Blob): Promise<string | null> => {
    const formData = new FormData();
    const filename = file instanceof File && file.name ? file.name : 'selfie.png';
    formData.append('file_name', filename);
    formData.append('file', file, filename);
    formData.append('path', 'visitor');
    try {
      const { data } = await axiosInstance2.post('/cdn/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const fileUrl = data?.collection?.file_url;
      return fileUrl ? (fileUrl.startsWith('//') ? `http:${fileUrl}` : fileUrl) : null;
    } catch (e) {
      console.error('Upload failed:', e);
      return null;
    }
  };

  const handleCapture = async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    const blob = await fetch(imageSrc).then((r) => r.blob());
    const cdnUrl = await uploadFileToCDN(blob);
    if (!cdnUrl) return;
    setScreenshot(imageSrc);
    setPreviewUrl(imageSrc);
    onChange(cdnUrl);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const cdnUrl = await uploadFileToCDN(file);
    if (!cdnUrl) return;
    setPreviewUrl(URL.createObjectURL(file));
    onChange(cdnUrl);
  };

  const handleRemove = async () => {
    if (!value) {
      clearLocal();
      return;
    }
    try {
      setRemoving(true);
      await axiosInstance2.delete(`/cdn${value}`);
      clearLocal();
    } catch (e) {
      console.error('Delete failed:', e);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          borderRadius: 2,
          p: 2,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Button size="small" onClick={() => setOpen(true)} startIcon={<PhotoCameraIcon />}>
          Camera
        </Button>
        {previewUrl && (
          <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={handleRemove}
            startIcon={<IconTrash />}
            disabled={removing}
          >
            {removing ? 'Removing...' : 'Remove'}
          </Button>
        )}
        <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleFile} />
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" mb={2}>
            Take Photo From Camera
          </Typography>
          <IconButton
            onClick={() => setOpen(false)}
            size="small"
            sx={{ position: 'absolute', top: 10, right: 10 }}
          >
            <IconX />
          </IconButton>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: 'environment' }}
                style={{ width: '100%', borderRadius: 8, border: '2px solid #ccc' }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
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
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />
          <Box textAlign="right">
            <Button color="warning" sx={{ mr: 1 }} onClick={clearLocal}>
              Clear
            </Button>
            <Button variant="contained" onClick={handleCapture}>
              Take Photo
            </Button>
            <Button sx={{ ml: 1 }} onClick={() => setOpen(false)}>
              Submit
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default CameraUpload;
