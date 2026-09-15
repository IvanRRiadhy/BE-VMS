import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  Divider,
  Grid2 as Grid,
  IconButton,
  LinearProgress,
  Typography,
} from '@mui/material';
import Webcam from 'react-webcam';
import { IconCamera, IconDeviceFloppy, IconRefresh, IconTrash } from '@tabler/icons-react';
import { RefObject } from 'react';
import { IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface CameraDialogProps {
  open: boolean;
  onClose: () => void;
  webcamRef: RefObject<Webcam>;
  screenshot?: string | null;
  facingMode: 'user' | 'environment';
  onSwitchCamera: () => void;
  onCapture: () => void;
  isUploading?: any;
  onClear: () => void;
  onSubmit: () => void;
}

const CameraDialog = ({
  open,
  onClose,
  webcamRef,
  screenshot,
  facingMode,
  onSwitchCamera,
  isUploading,
  onCapture,
  onClear,
  onSubmit,
}: CameraDialogProps) => {
  const { t } = useTranslation();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            '@media (max-width: 600px)': {
              margin: 1,
              width: 'calc(100% - 16px)',
              maxHeight: 'calc(100vh - 16px)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            },
          },
        },
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          p: 3,
          pb: 2,
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <Typography variant="h6" mb={2}>
          Take Photo From Camera
        </Typography>

        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
          }}
        >
          <IconX size={22} />
        </IconButton>

        <Divider />
      </Box>

      {/* CONTENT */}
      <Box
        sx={{
          px: 3,
          pb: 2,

          // Hanya content yang bisa scroll di mobile
          '@media (max-width: 600px)': {
            overflowY: 'auto',
            flex: 1,
            minHeight: 0,
          },
        }}
      >
        <Grid container spacing={2}>
          {/* CAMERA */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ position: 'relative' }}>
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

              <IconButton
                onClick={onSwitchCamera}
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  bgcolor: 'rgba(0,0,0,.5)',
                  color: '#fff',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,.7)',
                  },
                }}
              >
                <IconRefresh />
              </IconButton>
            </Box>
          </Grid>

          {/* PREVIEW */}
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

        {/* UPLOAD PROGRESS */}
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
      </Box>

      {/* FOOTER */}
      <Box
        sx={{
          px: 3,
          py: 1.5,
          flexShrink: 0,
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1,
          zIndex: 10,

          '@media (max-width: 600px)': {
            px: 2,
            py: 1.5,
            justifyContent: 'stretch',
            gap: 1,

            boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.08)',

            '& .MuiButton-root': {
              flex: 1,
              minWidth: 0,
              margin: 0,
            },
          },
        }}
      >
        <Button color="error" startIcon={<IconTrash />} onClick={onClear} disabled={isUploading}>
          {t('clear')}
        </Button>

        <Button
          variant="contained"
          disabled={isUploading}
          startIcon={isUploading ? <CircularProgress size={18} color="inherit" /> : <IconCamera />}
          onClick={onCapture}
        >
          {isUploading ? 'Uploading...' : t('takePhoto')}
        </Button>

        <Button startIcon={<IconDeviceFloppy />} onClick={onSubmit} disabled={isUploading}>
          Submit
        </Button>
      </Box>
    </Dialog>
  );
};

export default CameraDialog;
