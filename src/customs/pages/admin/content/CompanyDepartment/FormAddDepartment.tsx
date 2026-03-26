import {
  Button,
  Autocomplete,
  CircularProgress,
  Backdrop,
  FormControlLabel,
  RadioGroup,
  Radio,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect, useMemo, useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { createDepartment, getVisitorEmployee } from 'src/customs/api/admin';
import {
  CreateDepartementSubmitSchema,
  CreateDepartmentRequest,
} from 'src/customs/api/models/Admin/Department';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { useSession } from 'src/customs/contexts/SessionContext';

// RHF
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface FormAddDepartmentProps {
  onSuccess?: () => void;
}

const FormAddDepartment: React.FC<FormAddDepartmentProps> = ({ onSuccess }) => {
  const { token } = useSession();
  const [loading, setLoading] = useState(false);
  const [allEmployes, setAllEmployees] = useState<any[]>([]);

  // ✅ RHF setup
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateDepartmentRequest>({
    resolver: zodResolver(CreateDepartementSubmitSchema),
    defaultValues: {
      name: '',
      code: '',
      host: '',
    },
  });

  // fetch employee
  useEffect(() => {
    if (!token) return;

    const fetchEmployees = async () => {
      try {
        const res = await getVisitorEmployee(token);
        setAllEmployees(res?.collection ?? []);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
        setAllEmployees([]);
      }
    };

    fetchEmployees();
  }, [token]);

  const employeeOptions = useMemo(
    () => allEmployes.map((emp: any) => ({ id: emp.id, label: emp.name })),
    [allEmployes],
  );

  // ✅ submit clean
  const onSubmit = async (data: CreateDepartmentRequest) => {
    setLoading(true);
    try {
      await createDepartment(data, token as string);

      showSwal('success', 'Department successfully created!');
      reset();

      onSuccess?.();
    } catch (err) {
      showSwal('error', 'Failed to create department.', 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* NAME */}
        <CustomFormLabel required sx={{ mt: 0 }}>
          Department Name
        </CustomFormLabel>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <CustomTextField
              {...field}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
            />
          )}
        />

        {/* CODE */}
        <CustomFormLabel required sx={{ mt: 2 }}>
          Department Code
        </CustomFormLabel>
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <CustomTextField
              {...field}
              error={!!errors.code}
              helperText={errors.code?.message}
              fullWidth
            />
          )}
        />

        {/* HOST */}
        <CustomFormLabel required sx={{ mt: 2 }}>
          Head of Department
        </CustomFormLabel>
        <Controller
          name="host"
          control={control}
          render={({ field }) => (
            <Autocomplete
              options={employeeOptions}
              value={employeeOptions.find((e) => e.id === field.value) ?? null}
              onChange={(_, newValue) => {
                field.onChange(newValue?.id ?? '');
              }}
              renderInput={(params) => (
                <CustomTextField
                  {...params}
                  error={!!errors.host}
                  helperText={errors.host?.message}
                  fullWidth
                />
              )}
            />
          )}
        />

        {/* TYPE */}
        {/* <CustomFormLabel sx={{ mt: 2 }}>Type (Optional)</CustomFormLabel>
        <Controller
          name="type"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <RadioGroup row {...field}>
              <FormControlLabel value="internal" control={<Radio />} label="Internal" />
              <FormControlLabel value="external" control={<Radio />} label="External" />
            </RadioGroup>
          )}
        /> */}

        {/* SUBMIT */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button sx={{ mt: 2 }} variant="contained" type="submit" disabled={loading}>
            Submit
          </Button>
        </Box>
      </form>

      {/* LOADING */}
      <Backdrop open={loading} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress />
      </Backdrop>
    </>
  );
};

export default FormAddDepartment;
