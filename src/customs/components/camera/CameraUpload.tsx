import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axiosInstance2 from '../../api/interceptor';
import {
  Button as MuiButton,
  Dialog,
  Typography,
  Grid2 as Grid,
  Box,
  Divider,
} from '@mui/material';

import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { IconTrash } from '@tabler/icons-react';
import { CameraAlt, CheckCircle, DeleteOutline } from '@mui/icons-material';
const CameraUpload: React.FC<{
  value?: string;
  onChange: (url: string) => void;
}> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      console.log('CDN Response File URL:', fileUrl);
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

  // ⛔ Hapus file di CDN: DELETE ke URL file (http://host/pathcdn/visitor/xxx.png)
  const handleRemove = async () => {
    if (!value) {
      // cuma bersihkan local state kalau belum ada URL CDN
      clearLocal();
      return;
    }
    try {
      setRemoving(true);
      // await axios.delete(value); // <--- sesuai API kamu
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
          p: 0,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <MuiButton size="medium" onClick={() => setOpen(true)} startIcon={<PhotoCameraIcon />}>
          Camera
        </MuiButton>
        {previewUrl && ( // <-- tombol Remove hanya muncul jika ada foto
          <MuiButton
            size="small"
            color="error"
            variant="outlined"
            onClick={handleRemove}
            startIcon={<IconTrash />}
            disabled={removing}
          >
            {removing ? 'Removing...' : 'Remove'}
          </MuiButton>
        )}
        <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleFile} />
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" mb={2}>
            Take Photo From Camera
          </Typography>
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
            <MuiButton
              color="error"
              variant="outlined"
              sx={{ mr: 1 }}
              startIcon={<DeleteOutline />}
              onClick={clearLocal}
            >
              Clear
            </MuiButton>

            <MuiButton
              variant="contained"
              color="primary"
              startIcon={<CameraAlt />}
              onClick={handleCapture}
            >
              Take Photo
            </MuiButton>

            <MuiButton
              color="success"
              variant="contained"
              sx={{ ml: 1 }}
              startIcon={<CheckCircle />}
              onClick={() => setOpen(false)}
            >
              Submit
            </MuiButton>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default CameraUpload;
