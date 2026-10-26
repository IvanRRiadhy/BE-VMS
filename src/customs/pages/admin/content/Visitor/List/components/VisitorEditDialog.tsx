import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid2 as Grid,
  Switch,
  FormControlLabel,
  IconButton,
  Autocomplete,
  TextField,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { useEmployees } from 'src/hooks/Employee/useEmployees';

interface Props {
  open: boolean;
  detail: any;
  onClose: () => void;
  onSave: (payload: any) => void;
}

export default function VisitorEditDialog({ open, detail, onClose, onSave }: Props) {
  const [form, setForm] = useState<any>({});
  const [errorEmployee, setErrorEmployee] = useState(false);

  const { employee: employees, loading: employeeLoading } = useEmployees();

  useEffect(() => {
    if (detail) {
      setForm({
        ...detail,
        is_employee: Boolean(detail.is_employee),
        employee_id: detail.employee_id ?? null,
      });

      setErrorEmployee(false);
    }
  }, [detail]);

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEmployeeSwitch = (checked: boolean) => {
    setForm((prev: any) => ({
      ...prev,
      is_employee: checked,
      employee_id: checked ? (prev.employee_id ?? null) : '',
    }));

    setErrorEmployee(false);
  };

  const handleEmployeeChange = (value: any) => {
    setForm((prev: any) => ({
      ...prev,
      employee_id: value?.id ?? null,
    }));

    setErrorEmployee(false);
  };

  const handleSubmit = () => {
    if (form.is_employee && !form.employee_id) {
      setErrorEmployee(true);
      return;
    }

    onSave(form);
  };

  const selectedEmployee = employees.find((item: any) => item.id === form.employee_id) ?? null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit Visitor
        <IconButton
          size="small"
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
          onClick={onClose}
        >
          <IconX />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: '0 !important' }}>
        <Grid container spacing={2} mt={1}>
          {/* Name */}
          <Grid size={12}>
            <CustomFormLabel sx={{ pt: '0px !important' }}>Name</CustomFormLabel>

            <CustomTextField
              fullWidth
              value={form.name ?? ''}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </Grid>

          {/* Email */}
          <Grid size={12}>
            <CustomFormLabel sx={{ pt: '0px !important' }}>Email</CustomFormLabel>

            <CustomTextField
              fullWidth
              value={form.email ?? ''}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </Grid>

          {/* Phone */}
          <Grid size={12}>
            <CustomFormLabel sx={{ pt: '0px !important' }}>Phone</CustomFormLabel>

            <CustomTextField
              fullWidth
              value={form.phone ?? ''}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </Grid>

          {/* Is Employee */}
          <Grid size={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(form.is_employee)}
                  onChange={(e) => handleEmployeeSwitch(e.target.checked)}
                />
              }
              label="Is Employee?"
            />
          </Grid>

          {/* Employee */}
          {form.is_employee && (
            <Grid size={12}>
              <CustomFormLabel sx={{ pt: '0px !important' }}>Employee</CustomFormLabel>

              <Autocomplete
                fullWidth
                loading={employeeLoading}
                options={employees}
                value={selectedEmployee}
                onChange={(_, value) => handleEmployeeChange(value)}
                getOptionLabel={(option: any) => option?.name ?? ''}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select Employee"
                    error={errorEmployee}
                    helperText={errorEmployee ? 'Employee is required' : ''}
                  />
                )}
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={handleSubmit}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
