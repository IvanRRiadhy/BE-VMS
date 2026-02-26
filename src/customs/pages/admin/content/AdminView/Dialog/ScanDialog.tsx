import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Grid2 as Grid,
  LinearProgress,
  Box,
  Avatar,
  Snackbar,
  Alert,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { IconScan, IconX } from '@tabler/icons-react';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import type { AlertColor } from '@mui/material/Alert';

const scanPulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
`;

const ScanContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: 250,
  gap: 16,
}));

const ScanIcon = styled(IconScan)(() => ({
  animation: `${scanPulse} 1.2s infinite ease-in-out`,
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: 8,
  top: 8,
  color: theme.palette.grey[500],
}));

const ScanDialog = ({
  open,
  onClose,
  scanStep,
  documentType,
  onConfirm,
  onScanSuccess,
  isSingle,
  ws,
  scanSessionRef,
  forceTick,
}: {
  open: boolean;
  onClose: () => void;
  documentType: 'ktp' | 'passport';
  scanStep: 'scanning' | 'done';
  onConfirm: (result: any) => void;
  onScanSuccess?: () => void;
  isSingle?: boolean;
  scanSessionRef?: any;
  forceTick?: any;
  // ws: {
  //   payload: any;
  //   send: (payload: any) => void;
  // };
  ws: {
    imageQueue: React.MutableRefObject<string[]>;
    ocrQueue: React.MutableRefObject<string[]>;
    send: (payload: any) => void;
  };
}) => {
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanImageUrl, setScanImageUrl] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  function mapKtpOcrToScanResult(collection: any) {
    return {
      name: collection?.nama?.trim() || null,
      gender: collection?.jenis_kelamin || null,
      indentity_id: collection?.nik?.replace(/\s+/g, '') || null,
    };
  }

  function mapPassportOcrToScanResult(collection: any) {
    return {
      name: collection?.given_name?.trim() || null,
      gender: collection?.sex || null,
      indentity_id: collection?.document_number?.replace(/\s+/g, '') || null,
    };
  }

  function parseScannerBase64(input: string) {
    const [meta, base64] = input.split(',');

    const match = meta.match(/data:(image\/\w+);base64/i);
    if (!match) throw new Error('Invalid base64 header');

    const mime = match[1];
    const ext = mime.split('/')[1];

    return { base64, ext, mime };
  }

  function formatDateTime() {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');

    return (
      d.getFullYear().toString() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      '_' +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      pad(d.getSeconds())
    );
  }

  function generateFilename(type: 'ktp' | 'passport', ext: string) {
    return `visitor_${type}_${formatDateTime()}.${ext}`;
  }

  async function uploadScannerImageBase64(
    rawBase64: string,
    documentType: 'ktp' | 'passport',
  ): Promise<string | null> {
    try {
      const parsed = parseScannerBase64(rawBase64);

      const formData = new FormData();
      formData.append('file_name', generateFilename(documentType, parsed.ext));
      formData.append('file', rawBase64);
      formData.append('path', documentType);

      const res = await axiosInstance2.post('/cdn/upload-base64', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const fileUrl = res.data?.collection?.file_url;
      if (!fileUrl) return null;

      return fileUrl.startsWith('//') ? `http:${fileUrl}` : fileUrl;
    } catch (err) {
      console.error('Upload base64 failed', err);
      return null;
    }
  }

  const handleScanSuccess = async (
    msg: { collection: any; image_base64?: string },
    documentType: 'ktp' | 'passport',
  ) => {
    const mapped =
      documentType === 'ktp'
        ? mapKtpOcrToScanResult(msg.collection)
        : mapPassportOcrToScanResult(msg.collection);
    setScanResult(mapped);

    if (msg.image_base64?.startsWith('data:image')) {
      setScanImageUrl(msg.image_base64);
      return;
    }
  };

  const [scanBuffer, setScanBuffer] = useState<{
    imageBase64?: string;
    collection?: any;
  }>({});

  const imageNamesRef = useRef<string[]>([]);

  const sendTimeoutRef = useRef<any>(null);

  const completedRef = useRef(false);
  const lastPayloadRef = useRef<any>(null);
  const [localDone, setLocalDone] = useState(false);
  const pushedRef = useRef(false);
  const mappedResultRef = useRef<any>(null);
  const pendingPayloadRef = useRef<any>(null);
  const sendGroupConfirm = () => {
    if (!scanSessionRef?.current) return;
    if (imageNamesRef.current.length === 0) return;

    ws.send({
      cmd: 'send',
      doc_type: documentType,
      action_type: 'group',
      action_source: 'scanner/praregist',
      images: imageNamesRef.current,
    });

    imageNamesRef.current = [];
  };

  // useEffect(() => {
  //   const payload = ws?.payload;
  //   console.log('payload', payload);

  //   if (!payload) return;
  //   if (completedRef.current) return;

  //   lastPayloadRef.current = payload;
  //   console.log('📩 WS payload (prop):', payload);

  //   if (typeof payload === 'string') {
  //     if (payload.includes('|data:image')) {
  //       const [imageName, base64] = payload.split('|');
  //       // const imageName = payload.split('|')[0];
  //       imageNamesRef.current.push(imageName);

  //       setScanBuffer((prev) => ({
  //         ...prev,
  //         imageBase64: base64,
  //       }));

  //       clearTimeout(sendTimeoutRef.current);
  //       sendTimeoutRef.current = setTimeout(() => {
  //         if (imageNamesRef.current.length === 0) return;

  //         if (isSingle) {
  //           ws.send({
  //             cmd: 'send',
  //             doc_type: documentType,
  //             action_type: 'single',
  //             action_source: 'scanner/praregist',
  //             images: imageNamesRef.current,
  //           });
  //         }

  //         imageNamesRef.current = [];
  //       }, 200);

  //       return;
  //     }

  //     // pure base64 image
  //     if (payload.startsWith('data:image')) {
  //       setScanBuffer((prev) => ({
  //         ...prev,
  //         imageBase64: payload,
  //       }));
  //       return;
  //     }
  //   }

  //   let msg: any;
  //   try {
  //     msg = JSON.parse(payload);
  //   } catch {
  //     console.warn('⚠️ Invalid JSON payload');
  //     return;
  //   }

  //   if (msg.status === 'error') {
  //     showSwal('error', msg.message || 'Failed to scan document');
  //     return;
  //   }

  //   const items = msg.data?.items;
  //   const collection = items?.[0]?.result?.collection;
  //   console.log('OCR collection:', collection);

  //   if (!collection) {
  //     return;
  //   }

  //   setScanBuffer((prev) => {
  //     if (completedRef.current) return prev;

  //     completedRef.current = true;

  //     handleScanSuccess(
  //       {
  //         collection,
  //         image_base64: prev.imageBase64,
  //       },
  //       documentType,
  //     );

  //     setSnackbar({
  //       open: true,
  //       severity: 'success',
  //       message: 'Successfully scanned ' + (documentType === 'ktp' ? 'KTP' : 'Passport'),
  //     });

  //     setLocalDone(true);
  //     if (isSingle) {
  //       onScanSuccess?.();
  //     }
  //     return {
  //       ...prev,
  //       collection,
  //       completed: true,
  //     };
  //   });

  //   const mappedResult =
  //     documentType === 'ktp'
  //       ? mapKtpOcrToScanResult(collection)
  //       : mapPassportOcrToScanResult(collection);

  //   mappedResultRef.current = mappedResult;

  //   const handleGroupConfirm = async () => {
  //     if (!scanSessionRef?.current) return;

  //     if (pushedRef.current) return;

  //     const base64 = scanBuffer.imageBase64;
  //     let uploadedUrl: string | null = null;

  //     if (base64?.startsWith('data:image')) {
  //       uploadedUrl = await uploadScannerImageBase64(base64, documentType);
  //     }

  //     pushedRef.current = true;
  //     // scanSessionRef.current = false;

  //     onConfirm({
  //       type: documentType,
  //       data: {
  //         ...mappedResultRef.current,
  //         document_image_url: uploadedUrl,
  //       },
  //       image: {
  //         base64,
  //         cdn_url: uploadedUrl,
  //       },
  //     });
  //   };

  //   if (!isSingle) {
  //     if (!scanSessionRef?.current) {
  //       console.log('⏸️ Group payload ignored (scanner not clicked)');
  //       return;
  //     }

  //     handleGroupConfirm();
  //     return;
  //   }

  //   pendingPayloadRef.current = payload;

  //   return () => {
  //     clearTimeout(sendTimeoutRef.current);
  //   };
  // }, [ws?.payload]);

  useEffect(() => {
    if (!open || !isSingle) return;

    console.log('suc');
    const queue = ws.imageQueue.current;
    console.log('tes', queue);
    if (!queue.length) return;

    const items = [...queue];
    queue.length = 0;

    items.forEach((raw) => {
      if (!raw.includes('|data:image')) return;

      const [imageName, base64] = raw.split('|');

      imageNamesRef.current.push(imageName);

      setScanBuffer((prev) => ({
        ...prev,
        imageBase64: base64,
      }));
    });

    // debounce kirim ke OCR
    clearTimeout(sendTimeoutRef.current);
    sendTimeoutRef.current = setTimeout(() => {
      if (!imageNamesRef.current.length) return;

      ws.send({
        cmd: 'send',
        doc_type: documentType,
        action_type: 'single',
        action_source: 'scanner/praregist',
        images: imageNamesRef.current,
      });

      imageNamesRef.current = [];
    }, 200);
  }, [open, isSingle, forceTick]);

  useEffect(() => {
    if (!open || completedRef.current) return;

    const queue = ws.ocrQueue.current;
    if (!queue.length) return;

    const payloads = [...queue];
    console.log('payloads', payloads);
    queue.length = 0;

    payloads.forEach((raw) => {
      let msg: any;
      try {
        msg = JSON.parse(raw);
      } catch {
        return;
      }

      // if (msg.event !== 'OCR_RESULT') return;

      const collection = msg.data?.items?.[0]?.result?.collection;
      console.log('collection', collection);
      if (!collection) return;

      completedRef.current = true;

      const mapped =
        documentType === 'ktp'
          ? mapKtpOcrToScanResult(collection)
          : mapPassportOcrToScanResult(collection);

      console.log('mapped', mapped);

      setScanResult(mapped);
      setScanImageUrl(scanBuffer.imageBase64 ?? null);

      console.log('🟢 OCR SUCCESS – CALL onScanSuccess');
      onScanSuccess?.();
    });
  }, [open, forceTick]);

  useEffect(() => {
    if (!open) {
      completedRef.current = false;
      pushedRef.current = false;
      imageNamesRef.current = [];
      setScanResult(null);
      setScanImageUrl(null);
      setScanBuffer({});
      if (scanSessionRef) {
        scanSessionRef.current = false;
      }
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" style={{ zIndex: 999999 }}>
      <DialogTitle> Scanning {documentType === 'ktp' ? 'KTP' : 'Passport'}</DialogTitle>

      <CloseButton onClick={onClose}>
        <IconX />
      </CloseButton>

      <DialogContent dividers>
        {scanStep === 'scanning' && (
          <ScanContainer>
            <ScanIcon size={48} />
            <Typography variant="h6">Scanning document...</Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait a moment
            </Typography>
            <LinearProgress style={{ width: 220 }} />
            <Button onClick={onClose} variant="outlined" color="error">
              Cancel
            </Button>
          </ScanContainer>
        )}

        {isSingle && scanStep === 'done' && (
          <Grid container spacing={3}>
            <Grid size={12}>
              <img
                src={
                  scanImageUrl ??
                  'https://www.shutterstock.com/image-vector/ktp-indonesia-id-card-ektp-260nw-1628461459.jpg'
                }
                style={{ margin: '0 auto', width: 400, height: 250, display: 'block' }}
              />
            </Grid>
            <Grid size={6}>
              <Typography>Name</Typography>
              <Typography>{scanResult?.name ?? '-'}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography>Identity Id</Typography>
              <Typography>{scanResult?.indentity_id ?? '-'}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography>Gender</Typography>
              <Typography>{scanResult?.gender ?? '-'}</Typography>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      {isSingle && scanStep === 'done' && (
        <DialogActions>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              let uploadedUrl: string | null = null;

              if (scanImageUrl?.startsWith('data:image')) {
                uploadedUrl = await uploadScannerImageBase64(scanImageUrl, documentType);
              }
              console.log('uploadedUrl', uploadedUrl);

              onConfirm({
                type: documentType,
                data: {
                  ...scanResult,
                  document_image_url: uploadedUrl,
                },
              });
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ zIndex: 99999999 }}
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
    </Dialog>
  );
};

export default ScanDialog;
