import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  IconButton,
  Box,
  Button,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { IconCamera } from '@tabler/icons-react';
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import { Scanner } from '@yudiel/react-qr-scanner';

type Props = {
  open: boolean;
  onClose: () => void;
  qrMode: 'manual' | 'scan';
  setQrMode: (mode: 'manual' | 'scan') => void;
  qrValue: string;
  setQrValue: (val: string) => void;
  loading: boolean;
  onSubmit: (value: string) => Promise<void>;
  scanContainerRef: React.RefObject<HTMLDivElement>;
  facingMode: 'environment' | 'user';
  setFacingMode: React.Dispatch<React.SetStateAction<'environment' | 'user'>>;
  torchOn: boolean;
  setTorchOn: React.Dispatch<React.SetStateAction<boolean>>;
  hasDecoded: boolean;
  setHasDecoded: React.Dispatch<React.SetStateAction<boolean>>;
};


const QrScannerDialog: React.FC<Props> = ({
  open,
  onClose,
  qrMode,
  setQrMode,
  qrValue,
  setQrValue,
  loading,
  onSubmit,
  scanContainerRef,
  facingMode,
  setFacingMode,
  torchOn,
  setTorchOn,
  hasDecoded,
  setHasDecoded,
}) => {
  const handleSafeClose = () => {
    try {
      const video = scanContainerRef.current?.querySelector('video') as HTMLVideoElement | null;
      const stream = video?.srcObject as MediaStream | null;
      const track = stream?.getVideoTracks()?.[0];
      const caps = track?.getCapabilities?.() as any;

      if (track && caps?.torch && torchOn) {
        track.applyConstraints({ advanced: [{ torch: false }] as any });
      }
    } catch {}

    setTorchOn(false);
    setFacingMode('environment');
    setQrMode('manual');
    setHasDecoded(false);
    setQrValue('');
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleSafeClose}>
      <DialogTitle display="flex">
        Scan QR Visitor
        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={handleSafeClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Box display="flex" gap={1} mb={2}>
          <Button
            variant={qrMode === 'manual' ? 'contained' : 'outlined'}
            onClick={() => setQrMode('manual')}
            size="small"
          >
            Manual
          </Button>
          <Button
            variant={qrMode === 'scan' ? 'contained' : 'outlined'}
            onClick={() => {
              setHasDecoded(false);
              setQrMode('scan');
            }}
            size="small"
            startIcon={<IconCamera />}
          >
            Scan Camera
          </Button>
        </Box>

        {/* MANUAL MODE */}
        {qrMode === 'manual' && (
          <>
            <TextField
              fullWidth
              placeholder="Input your invitation code"
              size="small"
              value={qrValue}
              onChange={(e) => setQrValue(e.target.value)}
            />
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button variant="contained" onClick={() => onSubmit(qrValue)} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
            </Box>
          </>
        )}

        {/* SCAN MODE */}
        {qrMode === 'scan' && (
          <Box
            ref={scanContainerRef}
            sx={{
              position: 'relative',
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: 'black',
              aspectRatio: '3 / 4',
            }}
          >
            <Scanner
              constraints={{ facingMode }}
              onScan={async (result: any) => {
                if (!result || hasDecoded) return;

                setHasDecoded(true);

                let value = '';
                if (typeof result === 'string') value = result;
                else if (Array.isArray(result)) value = result[0]?.rawValue || '';
                else value = result.rawValue || '';

                setQrValue(value);
                await onSubmit(value);
                handleSafeClose();
              }}
              styles={{
                container: { width: '100%', height: '100%' },
                video: {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                },
              }}
            />

            {/* Controls */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <Button
                size="small"
                variant="contained"
                onClick={() => setFacingMode((f) => (f === 'environment' ? 'user' : 'environment'))}
              >
                Flip
              </Button>

              <Button
                size="small"
                variant="contained"
                onClick={async () => {
                  try {
                    const video = scanContainerRef.current?.querySelector(
                      'video',
                    ) as HTMLVideoElement | null;
                    const stream = video?.srcObject as MediaStream | null;
                    const track = stream?.getVideoTracks()?.[0];
                    const caps = track?.getCapabilities?.() as any;

                    if (track && caps?.torch) {
                      await track.applyConstraints({
                        advanced: [{ torch: !torchOn }] as any,
                      });
                      setTorchOn((t) => !t);
                    }
                  } catch {}
                }}
                startIcon={torchOn ? <FlashOnIcon /> : <FlashOffIcon />}
              >
                Torch
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QrScannerDialog;
