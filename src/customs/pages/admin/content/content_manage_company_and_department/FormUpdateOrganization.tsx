import { Button, Grid2, Alert, Typography } from '@mui/material';
import React from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import ParentCard from 'src/components/shared/ParentCard';

const FormUpdateOrganization = () => {
  const [state, setState] = React.useState({
    checkedB: false,
  });

  const handleChange = (event: any) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  return (
    <form>
      <Grid2 size={{ xs: 12, sm: 12 }}>
        <Alert severity="info">Complete the following data properly and correctly</Alert>
      </Grid2>
      <CustomFormLabel
        sx={{
          marginY: 1,
          marginX: 1,
        }}
        htmlFor="company-name"
      >
        <Typography variant="caption">Company Name</Typography>
      </CustomFormLabel>
      <CustomTextField
        id="company-name"
        helperText="You have to make sure that the name of this company is true."
        variant="outlined"
        fullWidth
      />

      <CustomFormLabel
        sx={{
          marginY: 1,
          marginX: 1,
        }}
        htmlFor="company-host"
      >
        <Typography variant="caption">Company Host</Typography>
      </CustomFormLabel>
      <CustomTextField
        id="company-host"
        helperText="You have to make sure that the host of this company is true."
        variant="outlined"
        fullWidth
      />

      <CustomFormLabel
        sx={{
          marginY: 1,
          marginX: 1,
        }}
        htmlFor="company-code"
      >
        <Typography variant="caption">Company Code</Typography>
      </CustomFormLabel>
      <CustomTextField
        id="company-code"
        helperText="You have to make sure that the code of this company is true."
        variant="outlined"
        fullWidth
      />

      <div>
        <Button sx={{ mt: 2 }} color="primary" variant="contained">
          Submit
        </Button>
      </div>
    </form>
  );
};

export default FormUpdateOrganization;
