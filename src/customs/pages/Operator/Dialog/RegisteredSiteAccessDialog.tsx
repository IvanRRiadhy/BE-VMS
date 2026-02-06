import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';

type SiteType = {
  id?: string;
  name?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  siteRegistered: SiteType[];
  selectedSite: SiteType | null;
  setSelectedSite: (val: SiteType | null) => void;
  action: 'grant' | 'revoke' | '';
  setAction: (val: 'grant' | 'revoke') => void;
  onSubmit: (action: 'grant' | 'revoke', site: SiteType) => void;
  containerRef?: HTMLElement | null;
};

export default function RegisteredSiteAccessDialog({
  open,
  onClose,
  siteRegistered,
  selectedSite,
  setSelectedSite,
  action,
  setAction,
  onSubmit,
  containerRef,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      container={containerRef ?? undefined}
    >
      <DialogTitle display="flex" justifyContent="space-between" alignItems="center">
        Site
        <IconButton aria-label="close" onClick={onClose}>
          <IconX />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <TextField label="Select Site" fullWidth sx={{ mb: 2 }} select={false} />

        <Autocomplete
          fullWidth
          options={siteRegistered}
          getOptionLabel={(o) => o.name || ''}
          value={selectedSite}
          onChange={(_, nv) => setSelectedSite(nv)}
          isOptionEqualToValue={(option, value) =>
            option.id?.toLowerCase() === value?.id?.toLowerCase()
          }
          renderInput={(params) => <TextField {...params} label="Select Site" />}
        />

        <DialogActions
          sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'space-between', px: 0 }}
        >
          <TextField
            select
            size="small"
            label="Action"
            value={action}
            onChange={(e) => setAction(e.target.value as 'grant' | 'revoke')}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="grant">Grant</MenuItem>
            <MenuItem value="revoke">Revoke</MenuItem>
          </TextField>

          <Button
            variant="contained"
            color={action === 'grant' ? 'success' : 'error'}
            disabled={!action}
            onClick={() => {
              if (!selectedSite) return;
              onSubmit(action as 'grant' | 'revoke', selectedSite);
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
