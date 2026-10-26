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
  Autocomplete,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type SiteType = {
  id: string;
  name: string;
};

type Props = {
  open: boolean;
  siteData: SiteType[];
  selectedSite: SiteType | null;
  setSelectedSite: (site: SiteType | null) => void;
  onNext: (site: SiteType) => void;
  onClose: () => void;
  onDiscard?: () => void;
  isFormChanged?: boolean;
};

const SelectRegisteredSiteDialog: React.FC<Props> = ({
  open,
  siteData,
  selectedSite,
  setSelectedSite,
  onNext,
  onClose,
  onDiscard,
  isFormChanged,
}) => {
  const handleCloseClick = () => {
    if (isFormChanged && onDiscard) {
      onDiscard();
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleCloseClick} fullWidth maxWidth="sm">
      <DialogTitle
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          background: 'linear-gradient(135deg, rgba(2,132,199,0.05), rgba(99,102,241,0.08))',
        }}
      >
        Select Registered Site
        <IconButton aria-label="close" onClick={handleCloseClick}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Autocomplete
          fullWidth
          options={siteData}
          getOptionLabel={(o) => o.name || ''}
          value={selectedSite}
          onChange={(_, nv) => setSelectedSite(nv)}
          isOptionEqualToValue={(option, value) => option.id === value?.id}
          renderInput={(params) => <TextField {...params} label="Registered Site" />}
        />

        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button
            variant="contained"
            onClick={() => {
              if (!selectedSite) return;
              onNext(selectedSite);
            }}
          >
            Next
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SelectRegisteredSiteDialog;
