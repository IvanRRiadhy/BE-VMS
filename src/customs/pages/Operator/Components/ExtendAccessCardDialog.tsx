import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Autocomplete,
  CircularProgress,
  Chip,
  IconButton,
} from '@mui/material';
import { useState, useEffect } from 'react';

import { useMutation } from '@tanstack/react-query';
import { extendAccessCard } from 'src/customs/api/operator';
import { IconX } from '@tabler/icons-react';
import { showSwal } from 'src/customs/components/alerts/alerts';

interface Props {
  open: boolean;
  onClose: () => void;
  visitor?: any;
  card?: any;
  registeredSiteId?: string;
  accessControls?: any[];
  isLoadingAccess?: boolean;
  onSuccess?: () => void;
}

const ExtendAccessCardDialog = ({
  open,
  onClose,
  visitor,
  card,
  registeredSiteId,
  accessControls,
  isLoadingAccess,
  onSuccess,
}: Props) => {
  const [selectedAccess, setSelectedAccess] = useState<any[]>([]);

  useEffect(() => {
    if (open) setSelectedAccess([]);
  }, [open, card?.id]);

  const mutation = useMutation({
    mutationFn: extendAccessCard,

    onSuccess: (response) => {
      showSwal('success', 'Successfully extend access card');

      onSuccess?.();
      onClose();
    },

    onError: (error: any) => {
      console.error('Extend access card error:', error);

      showSwal('error', error?.response?.data?.message || 'Failed to extend access card');
    },
  });
  const handleSubmit = () => {
    const payload = {
      trx_visitor_id: visitor?.id,
      trx_card_id: card?.id,
      registered_site_id: registeredSiteId,
      card_number: card?.card_number,
      access_controls: selectedAccess.map((item) => item.Id),
    };

    mutation.mutate(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Extend Access Card
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <IconX />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Card Number
            </Typography>
            <Typography fontWeight={600}>{card?.card_number || '-'}</Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Visitor
            </Typography>
            <Typography fontWeight={600}>{visitor?.name || '-'}</Typography>
          </Box>

          <Autocomplete
            multiple
            disableCloseOnSelect
            options={accessControls ?? []}
            value={selectedAccess}
            onChange={(_, value) => setSelectedAccess(value)}
            loading={isLoadingAccess}
            getOptionLabel={(option) => option.Name || ''}
            isOptionEqualToValue={(option, value) => option.Id === value.Id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Access Control"
                placeholder="Select access control"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isLoadingAccess && <CircularProgress size={18} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          {/* 
          {selectedAccess.length > 0 && (
            <Box display="flex" gap={1} flexWrap="wrap">
              {selectedAccess.map((item) => (
                <Chip key={item.id} label={item.Name} />
              ))}
            </Box>
          )} */}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            !selectedAccess.length ||
            !visitor?.id ||
            !card?.id ||
            !registeredSiteId ||
            mutation.isPending
          }
        >
          {mutation.isPending ? 'Processing...' : 'Extend Access'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExtendAccessCardDialog;
