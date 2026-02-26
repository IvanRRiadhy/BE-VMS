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
import { IconArrowRight, IconX } from '@tabler/icons-react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import { showSwal } from 'src/customs/components/alerts/alerts';

interface Site {
  id: string | number;
  name: string;
}

interface SelectRegisteredSiteDialogProps {
  open: boolean;
  onClose: () => void;
  siteData: Site[];
  selectedSite: Site | null;
  setSelectedSite: (site: Site | null) => void;
  setFormDataAddVisitor: React.Dispatch<
    React.SetStateAction<{
      registered_site: string | number | '';
    }>
  >;
  setOpenInvitationVisitor: (value: boolean) => void;
  container?: any | null;
}

const SelectRegisteredSiteDialog: React.FC<SelectRegisteredSiteDialogProps> = ({
  open,
  onClose,
  siteData,
  selectedSite,
  setSelectedSite,
  setFormDataAddVisitor,
  setOpenInvitationVisitor,
  container,
}) => {
  const handleNext = () => {
    if (!selectedSite) {
      showSwal('error', 'Minimal pilih 1 Registered Site.');
      return;
    }

    setFormDataAddVisitor((prev) => ({
      ...prev,
      registered_site: selectedSite.id,
    }));

    onClose(); // tutup dialog
    setOpenInvitationVisitor(true);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" container={container.current}>
      <DialogTitle display="flex" justifyContent={'space-between'} alignItems="center">
        Select Registered Site
        <IconButton aria-label="close" onClick={onClose}>
          <IconX />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <CustomFormLabel sx={{ marginTop: 0 }}>Registered Site</CustomFormLabel>
        <Autocomplete
          fullWidth
          // disablePortal={true}
          options={siteData ?? []}
          getOptionLabel={(o) => o.name || ''}
          value={selectedSite}
          onChange={(_, nv) => {
            setSelectedSite(nv);
            setFormDataAddVisitor((prev) => ({
              ...prev,
              registered_site: nv?.id || '',
            }));
          }}
          isOptionEqualToValue={(option, value) => option.id === value?.id}
          renderInput={(params) => <TextField {...params} label="" />}
          slotProps={{
            popper: {
              container: container.current,
            },
          }}
        />
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            endIcon={<IconArrowRight size={18} />}
          >
            Next
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SelectRegisteredSiteDialog;
