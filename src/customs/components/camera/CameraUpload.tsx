import React, { useRef, useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  IconButton,
  Button,
  LinearProgress,
  AlertColor,
  Portal,
  Snackbar,
  Alert,
} from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import Webcam from 'react-webcam';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { IconCamera, IconDeviceFloppy, IconRefresh, IconTrash, IconX } from '@tabler/icons-react';
import Dialog from '@mui/material/Dialog';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import { useTranslation } from 'react-i18next';

interface CameraUploadProps {
  value?: string;
  onChange: (url: string) => void;
  containerRef?: any | null;
}

const CameraUpload: React.FC<CameraUploadProps> = ({ value, onChange, containerRef }) => {
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor; // 'success' | 'info' | 'warning' | 'error'
  }>({ open: false, message: '', severity: 'info' });
  const toast = (message: string, severity: AlertColor = 'info') => {
    setSnackbar((s) => ({ ...s, open: false }));
    setTimeout(() => setSnackbar({ open: true, message, severity }), 0);
  };

  const clearLocal = () => {
    toast('Successfully deleted file', 'success');
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

    try {
      setIsUploading(true);

      const blob = await fetch(imageSrc).then((r) => r.blob());
      const MAX_FILE_SIZE = 5 * 1024 * 1024;

      if (blob.size > MAX_FILE_SIZE) {
        toast(t('maxFileSize'), 'info');
        return;
      }
      const cdnUrl = await uploadFileToCDN(blob);

      if (!cdnUrl) return;

      setScreenshot(imageSrc);
      setPreviewUrl(imageSrc);
      onChange(cdnUrl);
    } catch (error: any) {
      toast(error?.response?.data?.message || 'Failed to upload file', 'error');
    } finally {
      setIsUploading(false);
    }
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

  const { t } = useTranslation();

  return (
    <>
      <Box
        sx={{
          borderRadius: 2,
          py: 1,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Button
          size="small"
          onClick={() => setOpen(true)}
          startIcon={<PhotoCameraIcon />}
          fullWidth
        >
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
            fullWidth
          >
            {removing ? 'Removing...' : 'Remove'}
          </Button>
        )}
        <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleFile} />
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        // container={containerRef.current}
        slotProps={{
          // backdrop: { container: containerRef },
          root: { container: containerRef },
          paper: {
            sx: {
              '@media (max-width: 600px)': {
                margin: 1,
                maxHeight: 'calc(100vh - 16px)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              },
            },
          },
        }}
      >
        <Box
          sx={{
            p: 3,

            '@media (max-width: 600px)': {
              overflowY: 'auto',
              flex: 1,
              minHeight: 0,
              pb: 10, // space untuk tombol floating
            },
          }}
        >
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

          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ position: 'relative' }}>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    facingMode,
                  }}
                  style={{
                    width: '100%',
                    height: '250px',
                    objectFit: 'cover',
                    borderRadius: 8,
                    border: '2px solid #ccc',
                  }}
                />

                <IconButton
                  onClick={() =>
                    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
                  }
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: '#fff',
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.7)',
                    },
                  }}
                >
                  <IconRefresh />
                </IconButton>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              {screenshot ? (
                <img
                  src={screenshot}
                  alt="Captured"
                  style={{
                    width: '100%',
                    height: '250px',
                    objectFit: 'cover',
                    borderRadius: 8,
                    border: '2px solid #ccc',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: 250,
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Typography color="text.secondary">No Photos Have Been Taken Yet</Typography>
                </Box>
              )}
            </Grid>
          </Grid>
          {isUploading && (
            <Box
              sx={{
                mt: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <LinearProgress
                sx={{
                  width: '220px',
                  height: 6,
                  borderRadius: 3,
                }}
              />

              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75 }}>
                Uploading file...
              </Typography>
            </Box>
          )}
          <Divider
            sx={{
              my: 2,
              '@media (max-width: 600px)': {
                display: 'none',
              },
            }}
          />

          <Box
            textAlign="right"
            display="flex"
            justifyContent="flex-end"
            gap={1}
            sx={{
              '@media (max-width: 600px)': {
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 10,

                px: 2,
                py: 1,

                backgroundColor: 'background.paper',
                borderTop: '1px solid',
                borderColor: 'divider',

                boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',

                justifyContent: 'stretch',

                '& .MuiButton-root': {
                  flex: 1,
                  minWidth: 0,
                },
              },
            }}
          >
            <Button color="error" sx={{ mr: 1 }} onClick={clearLocal} startIcon={<IconTrash />}>
              {t('clear')}
            </Button>
            <Button variant="contained" onClick={handleCapture} startIcon={<IconCamera />}>
              {t('takePhoto')}
            </Button>
            <Button sx={{ ml: 1 }} onClick={() => setOpen(false)} startIcon={<IconDeviceFloppy />}>
              Submit
            </Button>
          </Box>
        </Box>
      </Dialog>
      <Portal>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ zIndex: 2000 }}
        >
          <Alert
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Portal>
    </>
  );
};

export default CameraUpload;
