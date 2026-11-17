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
import { extendAccessCard, revokeAccessCard } from 'src/customs/api/operator';
import { IconX } from '@tabler/icons-react';
import { showSwal } from 'src/customs/components/alerts/alerts';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';

interface Props {
  open: boolean;
  onClose: () => void;
  visitor?: any;
  card?: any;
  registeredSiteId?: string;
  accessControls?: any[];
  isLoadingAccess?: boolean;
  onSuccess?: () => void;
  mode?: any;
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
  mode
}: Props) => {
  const [selectedAccess, setSelectedAccess] = useState<any[]>([]);

  useEffect(() => {
    if (open) setSelectedAccess([]);
  }, [open, card?.id]);

  const isExtend = mode === 'extend';


  const mutation = useMutation({
    mutationFn: (payload: any) =>
      isExtend
        ? extendAccessCard(payload)
        : revokeAccessCard(payload),

    onSuccess: () => {
      showSwal(
        'success',
        isExtend
          ? 'Successfully extend access card'
          : 'Successfully revoke access card'
      );

      onSuccess?.();
      onClose();
    },

    onError: (error: any) => {
      showSwal(
        'error',
        error?.response?.data?.msg ||
        (isExtend
          ? 'Failed to extend access card'
          : 'Failed to revoke access card')
      );
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
        <Box display="flex" flexDirection="column" gap={1}>
          <Box>
            <Typography variant="body1" color="text.secondary">
              Card Number
            </Typography>
            <Typography fontWeight={600}>{card?.card_number || '-'}</Typography>
          </Box>

          <Box>
            <Typography variant="body1" color="text.secondary">
              Visitor
            </Typography>
            <Typography fontWeight={600}>{visitor?.name || '-'}</Typography>
          </Box>


          <Box>
            <CustomFormLabel sx={{ mb: 0.5 }}>Access Control</CustomFormLabel>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={accessControls ?? []}
              value={selectedAccess}
              onChange={(_, value) => setSelectedAccess(value)}
              loading={isLoadingAccess}
              getOptionLabel={(option) => option?.Name ?? option?.name ?? ''}
              isOptionEqualToValue={(option, value) =>
                String(option?.Id ?? option?.id) ===
                String(value?.Id ?? value?.id)
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label=""
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
          </Box>
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
        <Button onClick={onClose} color="secondary">
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
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExtendAccessCardDialog;
