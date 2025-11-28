import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  Box,
  Button,
  CircularProgress,
  IconButton,
  TextField,
  Tooltip,
} from '@mui/material';
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import { IconCamera, IconUser, IconX } from '@tabler/icons-react';
import { Scanner } from '@yudiel/react-qr-scanner';
type Props = {
  open: boolean;
  onClose: () => void;
  handleSubmitQRCode: (value: string) => Promise<void>;
  container?: HTMLElement;
  onOpenInvitation?: () => void;
};

const ScanQrVisitorDialog: React.FC<Props> = ({
  open,
  onClose,
  handleSubmitQRCode,
  container,
  onOpenInvitation,
}) => {
  const [qrMode, setQrMode] = useState<'manual' | 'scan'>('manual');
  const [qrValue, setQrValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);
  const [hasDecoded, setHasDecoded] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const scanContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setQrValue('');
      setQrMode('manual');
      setHasDecoded(false);
      setTorchOn(false);
      setFacingMode('environment');
      setIsSubmitting(false);
      setScannerKey((prev) => prev + 1);
    }
  }, [open]);

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} container={container}>
      <DialogTitle display="flex">
        Scan QR Visitor
        <IconButton
          aria-label="close"
          sx={{ position: 'absolute', right: 8, top: 8 }}
          onClick={onClose}
        >
          <IconX />
        </IconButton>
      </DialogTitle>
      <Divider />

      <DialogContent>
        <Box display="flex" gap={1} mb={2}>
          <Tooltip
            title="Enter the code manually"
            placement="top"
            arrow
            slotProps={{
              tooltip: {
                sx: {
                  fontSize: '1rem',
                  padding: '8px 14px',
                },
              },
              popper: {
                container: container,
              },
            }}
          >
            <Button
              variant={qrMode === 'manual' ? 'contained' : 'outlined'}
              onClick={() => setQrMode('manual')}
              size="small"
            >
              Manual
            </Button>
          </Tooltip>
          <Tooltip
            title="Scan the code using your camera"
            placement="top"
            arrow
            slotProps={{
              tooltip: {
                sx: {
                  fontSize: '1rem',
                  padding: '8px 14px',
                },
              },
              popper: {
                container: container,
              },
            }}
          >
            <Button
              variant={qrMode === 'scan' ? 'contained' : 'outlined'}
              onClick={() => {
                setHasDecoded(false);
                setQrMode('scan');
              }}
              startIcon={<IconCamera />}
              size="small"
            >
              Scan Kamera
            </Button>
          </Tooltip>
        </Box>

        {/* MODE: MANUAL */}
        {qrMode === 'manual' && (
          <>
            <TextField
              fullWidth
              label=""
              variant="outlined"
              placeholder="Enter your code"
              size="small"
              value={qrValue}
              onChange={(e) => setQrValue(e.target.value)}
            />
            <Divider sx={{ my: 2 }} />
            <Box mt={2} display="flex" justifyContent="space-between" alignItems={'center'}>
              <Tooltip
                title="Create a new invitation"
                placement="top"
                arrow
                slotProps={{
                  tooltip: {
                    sx: {
                      fontSize: '1rem',
                      padding: '8px 14px',
                    },
                  },
                  popper: {
                    container: container,
                  },
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<IconUser size={18} />}
                  onClick={onOpenInvitation}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2.5,
                    background: 'linear-gradient(135deg, #5D87FF 0%, #4169E1 100%)',
                    boxShadow: '0 2px 6px rgba(93, 135, 255, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4169E1 0%, #3657D6 100%)',
                    },
                  }}
                >
                  New Invitation
                </Button>
              </Tooltip>
              <Button
                variant="contained"
                color="primary"
                onClick={async () => {
                  try {
                    setIsSubmitting(true);
                    await handleSubmitQRCode(qrValue);
                    onClose();
                  } finally {
                    setTimeout(() => setIsSubmitting(false), 400);
                  }
                }}
                disabled={!qrValue || isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
              >
                {isSubmitting ? 'Submit...' : 'Submit'}
              </Button>
            </Box>
          </>
        )}

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
              key={scannerKey}
              constraints={{ facingMode }}
              onScan={async (result: any) => {
                if (!result || hasDecoded) return;

                console.log('📸 QR scan raw result:', result);
                setHasDecoded(true);

                let value = '';
                if (typeof result === 'string') value = result;
                else if (Array.isArray(result)) value = result[0]?.rawValue || '';
                else if (typeof result === 'object')
                  value = result.rawValue || JSON.stringify(result);

                console.log('✅ Extracted QR value:', value);
                setQrValue(value);

                try {
                  setIsSubmitting(true);
                  await handleSubmitQRCode(value);
                  onClose();
                } catch (err) {
                  console.error('❌ Error saat submit QR:', err);
                } finally {
                  setIsSubmitting(false);
                }
              }}
              onError={(error: any) => {
                console.error('❌ QR Scanner error:', error?.message || error);
              }}
              styles={{
                container: { width: '100%', height: '100%' },
                video: { width: '100%', height: '100%', objectFit: 'cover', border: 'none' },
              }}
            />

            {/* Overlay scanning box */}
            <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <Box
                sx={{
                  '--scanSize': { xs: '70vw', sm: '370px' },
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 'var(--scanSize)',
                  height: 'var(--scanSize)',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                  borderRadius: 2,
                  outline: '2px solid rgba(255,255,255,0.18)',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    '& .corner': {
                      position: 'absolute',
                      width: 50,
                      height: 50,
                      border: '3px solid #00e5ff',
                    },
                    '& .tl': { top: 0, left: 0, borderRight: 'none', borderBottom: 'none' },
                    '& .tr': { top: 0, right: 0, borderLeft: 'none', borderBottom: 'none' },
                    '& .bl': { bottom: 0, left: 0, borderRight: 'none', borderTop: 'none' },
                    '& .br': { bottom: 0, right: 0, borderLeft: 'none', borderTop: 'none' },
                  }}
                >
                  <Box className="corner tl" />
                  <Box className="corner tr" />
                  <Box className="corner bl" />
                  <Box className="corner br" />
                </Box>

                {/* Laser animation */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: 10,
                    right: 10,
                    height: 2,
                    top: 0,
                    background: 'linear-gradient(90deg, transparent, #00e5ff, transparent)',
                    animation: 'scanLine 2s linear infinite',
                    '@keyframes scanLine': {
                      '0%': { transform: 'translateY(0)' },
                      '100%': { transform: 'translateY(calc(var(--scanSize) - 2px))' },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Control buttons */}
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 8,
                display: 'flex',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <Button
                onClick={() => setFacingMode((f) => (f === 'environment' ? 'user' : 'environment'))}
                variant="contained"
                size="small"
                sx={{ bgcolor: 'rgba(0,0,0,0.6)' }}
                startIcon={<FlipCameraAndroidIcon fontSize="small" />}
              >
                Flip
              </Button>

              <Button
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
                    } else {
                      console.log('Torch not supported on this device.');
                    }
                  } catch (e) {
                    console.log('Torch toggle error:', e);
                  }
                }}
                variant="contained"
                size="small"
                sx={{ bgcolor: 'rgba(0,0,0,0.6)' }}
                startIcon={
                  torchOn ? <FlashOnIcon fontSize="small" /> : <FlashOffIcon fontSize="small" />
                }
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

export default ScanQrVisitorDialog;
