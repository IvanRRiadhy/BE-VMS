import React, { useState } from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Alert,
  Typography,
  MenuItem,
  Stack,
  Grid2,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';

//

const FormWizardAddOperator = () => {
  const steps = ['Account Info', 'Role & Assignment', 'Assignment Details'];
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());

  const isStepSkipped = (step: number) => skipped.has(step);

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <Alert severity="info">Complete the following data properly and correctly</Alert>
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ my: 1, mx: 1 }} htmlFor="username">
                <Typography variant="caption">Username</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="username"
                helperText="Ensure the username is correct."
                fullWidth
              />
            </Grid2>

            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ my: 1, mx: 1 }} htmlFor="fullname">
                <Typography variant="caption">Full Name</Typography>
              </CustomFormLabel>
              <CustomTextField id="fullname" helperText="Enter full name." fullWidth />
            </Grid2>

            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ my: 1, mx: 1 }} htmlFor="email">
                <Typography variant="caption">Email</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="email"
                type="email"
                helperText="Valid email required."
                fullWidth
              />
            </Grid2>
          </Grid2>
        );

      case 1:
        return (
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <Alert severity="info">Security and Role Info</Alert>
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ my: 1, mx: 1 }} htmlFor="password">
                <Typography variant="caption">Password</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="password"
                type="password"
                helperText="Minimum 8 characters."
                fullWidth
              />
            </Grid2>

            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ my: 1, mx: 1 }} htmlFor="confirmPassword">
                <Typography variant="caption">Confirm Password</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="confirmPassword"
                type="password"
                helperText="Re-enter password."
                fullWidth
              />
            </Grid2>

            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ my: 1, mx: 1 }} htmlFor="role">
                <Typography variant="caption">Role</Typography>
              </CustomFormLabel>
              <CustomTextField id="role" select fullWidth defaultValue="">
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Operator">Operator</MenuItem>
                <MenuItem value="Supervisor">Supervisor</MenuItem>
              </CustomTextField>
            </Grid2>
          </Grid2>
        );

      case 2:
        return (
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <Alert severity="info">Assignment Details</Alert>
            </Grid2>

            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ my: 1, mx: 1 }} htmlFor="employee">
                <Typography variant="caption">Employee</Typography>
              </CustomFormLabel>
              <CustomTextField id="employee" select fullWidth defaultValue="">
                <MenuItem value="Employee1">Employee 1</MenuItem>
                <MenuItem value="Employee2">Employee 2</MenuItem>
                <MenuItem value="Employee3">Employee 3</MenuItem>
              </CustomTextField>
            </Grid2>

            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ my: 1, mx: 1 }} htmlFor="organization">
                <Typography variant="caption">Organization / Company</Typography>
              </CustomFormLabel>
              <CustomTextField id="organization" select fullWidth defaultValue="">
                <MenuItem value="CompanyA">Company A</MenuItem>
                <MenuItem value="CompanyB">Company B</MenuItem>
                <MenuItem value="CompanyC">Company C</MenuItem>
              </CustomTextField>
            </Grid2>

            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ my: 1, mx: 1 }} htmlFor="department">
                <Typography variant="caption">Department</Typography>
              </CustomFormLabel>
              <CustomTextField id="department" select fullWidth defaultValue="">
                <MenuItem value="HR">HR</MenuItem>
                <MenuItem value="IT">IT</MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
              </CustomTextField>
            </Grid2>

            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ my: 1, mx: 1 }} htmlFor="district">
                <Typography variant="caption">District</Typography>
              </CustomFormLabel>
              <CustomTextField id="district" select fullWidth defaultValue="">
                <MenuItem value="Central">Central</MenuItem>
                <MenuItem value="East">East</MenuItem>
                <MenuItem value="West">West</MenuItem>
              </CustomTextField>
            </Grid2>
          </Grid2>
        );

      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <Box width="100%">
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label, index) => (
            <Step key={label} completed={!isStepSkipped(index)}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === steps.length ? (
          <Stack spacing={2}>
            <Alert severity="success">All steps completed - operator data submitted!</Alert>
            <Box textAlign="right">
              <Button onClick={handleReset} variant="outlined" color="secondary">
                Reset
              </Button>
            </Box>
          </Stack>
        ) : (
          <>
            <form>{renderStepContent()}</form>
            <Box display="flex" flexDirection="row" mt={4}>
              <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
              <Box flex="1 1 auto" />
              <Button
                onClick={handleNext}
                variant="contained"
                color={activeStep === steps.length - 1 ? 'success' : 'primary'}
              >
                {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </PageContainer>
  );
};

export default FormWizardAddOperator;
