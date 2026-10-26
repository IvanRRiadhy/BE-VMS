import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  Stack,
  Button,
  Typography,
  Autocomplete,
} from '@mui/material';
import { IconX, IconArrowRight } from '@tabler/icons-react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

interface SelectAgendaInvitationDialogProps {
  open: boolean;
  onClose: () => void;
  invitations: any[];
  onSelectInvitation: (_: any, value: any) => void;
  onNext: () => void;
}

const SelectAgendaInvitationDialog: React.FC<SelectAgendaInvitationDialogProps> = ({
  open,
  onClose,
  invitations,
  onSelectInvitation,
  onNext,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Invitation</DialogTitle>

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

      <DialogContent dividers>
        <form>
          <Stack spacing={2} mt={1}>
            <Grid container spacing={2}>
              <Grid xs={12}>
                <CustomFormLabel sx={{ mt: 0 }}>Select Agenda</CustomFormLabel>

                <Autocomplete
                  options={invitations}
                  getOptionLabel={(option: any) => option.agenda || ''}
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  onChange={onSelectInvitation}
                  renderInput={(params) => (
                    <CustomTextField
                      {...params}
                      placeholder="Choose or input invitation"
                      fullWidth
                      variant="outlined"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Stack>

          <Button
            variant="contained"
            sx={{ mt: 3 }}
            fullWidth
            onClick={onNext}
            endIcon={<IconArrowRight size={18} />}
          >
            <Typography>Next</Typography>
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SelectAgendaInvitationDialog;
