import { Box, Button, Dialog, Divider, Grid2 as Grid, IconButton, Typography } from '@mui/material';
import Webcam from 'react-webcam';
import { IconCamera, IconDeviceFloppy, IconTrash, IconX } from '@tabler/icons-react';
import { RefObject } from 'react';

interface CameraCaptureDialogProps {
  open: boolean;
  onClose: () => void;
  webcamRef: any;
  screenshot: string | null;
  facingMode: 'user' | 'environment';
  onCapture: () => void;
  onClear: () => void;
  onSubmit: () => void;
}

const CameraDialog = ({
  open,
  onClose,
  webcamRef,
  screenshot,
  facingMode,
  onCapture,
  onClear,
  onSubmit,
}: CameraCaptureDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box p={3}>
        <Box>
          <Typography variant="h6" mb={2}>
            Take Photo From Camera
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', top: 10, right: 10 }}
          >
            <IconX size={22} />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode }}
              style={{
                width: '100%',
                height: '250px',
                objectFit: 'cover',
                borderRadius: 8,
                border: '2px solid #ccc',
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            {screenshot ? (
              <img
                src={screenshot}
                alt="Captured"
                style={{
                  width: '100%',
                  borderRadius: 8,
                  border: '2px solid #ccc',
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  minHeight: 250,
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

        <Divider sx={{ my: 2 }} />

        <Box display="flex" justifyContent="flex-end">
          <Button color="error" startIcon={<IconTrash />} onClick={onClear} sx={{ mr: 1 }}>
            Clear Photo
          </Button>

          <Button variant="contained" startIcon={<IconCamera />} onClick={onCapture}>
            Take Photo
          </Button>

          <Button sx={{ ml: 1 }} startIcon={<IconDeviceFloppy />} onClick={onSubmit}>
            Submit
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default CameraDialog;
