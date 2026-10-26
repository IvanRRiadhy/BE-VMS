import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  IconButton,
} from '@mui/material';
import { useState } from 'react';
import dayjs from 'dayjs';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import { IconX } from '@tabler/icons-react';
import moment from 'moment';

const AddBadgeDialog = ({ open, onClose, onSubmit }: any) => {
  const [form, setForm] = useState({
    BadgeID: '',
    CardNumber: '',
    CardStatus: 0,
    PINCode: '',
    IssueDate: dayjs().format('YYYY-MM-DDTHH:mm'),
    ExpireDate: dayjs().format('YYYY-MM-DDTHH:mm'),
    RowVersion: '',
    Partitions: '',
    Email: '',
    CellPhone: '',
    badgeTypeID: '',
    description: '',
  });

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSubmit(form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Add Badge To Employee
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
        <Grid container spacing={2} mt={1}>
          <Grid item xs={6} sx={{ pt: '0px !important' }}>
            <CustomFormLabel sx={{ mt: 0 }}>Badge ID</CustomFormLabel>
            <CustomTextField
              label=""
              fullWidth
              value={form.BadgeID}
              onChange={(e) => handleChange('BadgeID', e.target.value)}
            />
          </Grid>

          <Grid item xs={6} sx={{ pt: '0px !important' }}>
            <CustomFormLabel sx={{ mt: 0 }}>Card Number</CustomFormLabel>
            <CustomTextField
              label=""
              fullWidth
              value={form.CardNumber}
              onChange={(e) => handleChange('CardNumber', e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <CustomFormLabel sx={{ mt: 0 }}>Card Status</CustomFormLabel>
            <CustomTextField
              label=""
              type="number"
              fullWidth
              value={form.CardStatus}
              onChange={(e) => handleChange('CardStatus', e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <CustomFormLabel sx={{ mt: 0 }}>PIN Code</CustomFormLabel>
            <CustomTextField
              label=""
              fullWidth
              value={form.PINCode}
              onChange={(e) => handleChange('PINCode', e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <CustomFormLabel sx={{ mt: 0 }}>Issue Date</CustomFormLabel>
            <CustomTextField
              label=""
              type="datetime-local"
              fullWidth
              value={form.IssueDate}
              onChange={(e) => handleChange('IssueDate', e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <CustomFormLabel sx={{ mt: 0 }}>Expire Date</CustomFormLabel>
            <CustomTextField
              label=""
              type="datetime-local"
              fullWidth
              value={form.ExpireDate}
              onChange={(e) => handleChange('ExpireDate', e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <CustomFormLabel sx={{ mt: 0 }}>Row Version</CustomFormLabel>
            <CustomTextField
              label=""
              fullWidth
              value={form.RowVersion}
              onChange={(e) => handleChange('RowVersion', e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <CustomFormLabel sx={{ mt: 0 }}>Partitions</CustomFormLabel>
            <CustomTextField
              label=""
              fullWidth
              value={form.Partitions}
              onChange={(e) => handleChange('Partitions', e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <CustomFormLabel sx={{ mt: 0 }}>Email</CustomFormLabel>
            <CustomTextField
              label=""
              type="email"
              fullWidth
              value={form.Email}
              onChange={(e) => handleChange('Email', e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <CustomFormLabel sx={{ mt: 0 }}>Cell Phone</CustomFormLabel>
            <CustomTextField
              type="number"
              label=""
              fullWidth
              value={form.CellPhone}
              onChange={(e) => handleChange('CellPhone', e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <CustomFormLabel sx={{ mt: 0 }}>Badge Type ID</CustomFormLabel>
            <CustomTextField
              label=""
              fullWidth
              value={form.badgeTypeID}
              onChange={(e) => handleChange('badgeTypeID', e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <CustomFormLabel sx={{ mt: 0 }}>Badge Type Description</CustomFormLabel>
            <CustomTextField
              label=""
              fullWidth
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBadgeDialog;
