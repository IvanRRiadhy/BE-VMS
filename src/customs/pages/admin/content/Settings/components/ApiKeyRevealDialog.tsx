import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  InputAdornment,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { IconEye, IconEyeOff, IconCopy, IconX } from '@tabler/icons-react';
import { getRevealById } from 'src/customs/api/Admin/Setting';
import { showSwal } from 'src/customs/components/alerts/alerts';

interface Props {
  open: boolean;
  id: string | null;
  onClose: () => void;
}

const ApiKeyRevealDialog = ({ open, id, onClose }: Props) => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!open || !id) return;

    const fetchApiKey = async () => {
      try {
        setLoading(true);
        setApiKey('');
        setVisible(true);

        const response = await getRevealById(id);

        const secret = response?.collection?.api_key ?? response?.api_key;

        if (!secret) {
          showSwal('error', 'API Key not found');
          return;
        }

        setApiKey(secret);
      } catch (error: any) {
        showSwal(
          'error',
          error?.response?.data?.message ||
            error?.response?.data?.msg ||
            'Failed to reveal API Key',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApiKey();

    return () => {
      setApiKey('');
    };
  }, [open, id]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      showSwal('success', 'API Key copied successfully!');
    } catch {
      showSwal('error', 'Failed to copy API Key');
    }
  };

  const handleClose = () => {
    setApiKey('');
    setVisible(true);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        API Key
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <IconX />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <TextField
          fullWidth
          margin="normal"
          label="API Key"
          value={loading ? '' : visible ? apiKey : '•'.repeat(apiKey.length)}
          placeholder={loading ? 'Loading API Key...' : ''}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                {loading ? (
                  <CircularProgress size={20} />
                ) : (
                  <>
                    <Tooltip title={visible ? 'Hide API Key' : 'Show API Key'}>
                      <IconButton onClick={() => setVisible((prev) => !prev)} disabled={!apiKey}>
                        {visible ? <IconEyeOff /> : <IconEye />}
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Copy API Key">
                      <IconButton onClick={handleCopy} disabled={!apiKey}>
                        <IconCopy />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyRevealDialog;
