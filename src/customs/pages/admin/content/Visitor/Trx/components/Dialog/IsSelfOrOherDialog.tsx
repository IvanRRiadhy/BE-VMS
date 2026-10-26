import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';

type Props = {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  onDiscard?: () => void;
  isFormChanged?: boolean;
  onSubmit: (isSelf: boolean) => void;
  toast: (msg: string, type?: string) => void;
};

const IsSelfOrOherDialog: React.FC<Props> = ({
  open,
  onClose,
  onBack,
  onDiscard,
  isFormChanged,
  onSubmit,
}) => {
  const [isSelf, setIsSelf] = useState(true);

  const handleCloseClick = () => {
    if (isFormChanged && onDiscard) {
      onDiscard();
    } else {
      onClose();
    }
  };

  const handleNext = () => {
    onSubmit(isSelf);
  };

  return (
    <Dialog open={open} onClose={handleCloseClick} fullWidth maxWidth="sm">
      <DialogTitle display="flex" justifyContent="space-between" alignItems="center">
        Invitation Recipient
        <IconButton aria-label="close" onClick={handleCloseClick}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <CustomFormLabel sx={{ mt: 0, fontSize: '16px' }}  required>
          'Are you filling this invitation for yourself or someone else?'
        </CustomFormLabel>
        <RadioGroup
          row
          value={isSelf ? 'self' : 'other'}
          onChange={(e) => setIsSelf(e.target.value === 'self')}
        >
          <FormControlLabel value="self" control={<Radio />} label="Self" />
          <FormControlLabel value="other" control={<Radio />} label="Other" />
        </RadioGroup>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Button variant="outlined" onClick={onBack} startIcon={<IconArrowLeft width={18} />}>
          Back
        </Button>
        <Button variant="contained" onClick={handleNext} endIcon={<IconArrowRight width={18} />}>
          Next
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IsSelfOrOherDialog;
