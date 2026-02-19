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
import { IconArrowRight } from '@tabler/icons-react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';

type SiteType = {
  id: string;
  name: string;
};

type Props = {
  open: boolean;
  siteData: SiteType[];
  selectedSite: SiteType | null;
  setSelectedSite: (value: SiteType | null) => void;
  onClose: () => void;
  onDiscard?: () => void;
  isFormChanged?: boolean;
  onSubmit: (site: SiteType) => void;
  toast: (msg: string, type?: string) => void;
};

const RegisteredSiteDialog: React.FC<Props> = ({
  open,
  siteData,
  selectedSite,
  setSelectedSite,
  onClose,
  onDiscard,
  isFormChanged,
  onSubmit,
  toast,
}) => {
  const handleCloseClick = () => {
    if (isFormChanged && onDiscard) {
      onDiscard();
    } else {
      onClose();
    }
  };

  const handleNext = () => {
    if (!selectedSite) {
      toast('Minimal pilih 1 Registered Site.', 'warning');
      return;
    }

    onSubmit(selectedSite);
  };

  return (
    <Dialog open={open} onClose={handleCloseClick} fullWidth maxWidth="sm">
      <DialogTitle display="flex" justifyContent="space-between" alignItems="center">
        Select Registered Site
        <IconButton aria-label="close" onClick={handleCloseClick}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <CustomFormLabel sx={{ marginTop: 0 }}>Registered Site</CustomFormLabel>
        <Autocomplete
          fullWidth
          options={siteData}
          getOptionLabel={(o) => o.name || ''}
          value={selectedSite}
          onChange={(_, nv) => setSelectedSite(nv)}
          isOptionEqualToValue={(option, value) => option.id === value?.id}
          renderInput={(params) => <TextField {...params} label="" />}
        />

        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button variant="contained" onClick={handleNext} endIcon={<IconArrowRight width={18} />}>
            Next
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default RegisteredSiteDialog;
