import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Select,
  IconButton,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';

interface EmployeeAssignDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  employee: any[];
  selectedEmployeeId: string | number;
  setSelectedEmployeeId: (value: any) => void;
}

const EmployeeAssignDialog = ({
  open,
  onClose,
  onSubmit,
  employee,
  selectedEmployeeId,
  setSelectedEmployeeId,
}: EmployeeAssignDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Assign Employee
        <IconButton sx={{ position: 'absolute', right: '10px', top: '10px' }} onClick={onClose}>
          <IconX />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <CustomFormLabel sx={{ mt: 0 }}>Employee</CustomFormLabel>

        <Select
          value={selectedEmployeeId}
          onChange={(e) => setSelectedEmployeeId(e.target.value)}
          fullWidth
        >
          {employee?.map((item: any) => (
            <MenuItem key={item.id} value={item.id}>
              {item.name}
            </MenuItem>
          ))}
        </Select>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>

        <Button variant="contained" onClick={onSubmit}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeAssignDialog;
