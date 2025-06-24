import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Alert,
  Stack,
  MenuItem,
  Grid2,
  Typography,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import ParentCard from 'src/components/shared/ParentCard';

import 'react-image-crop/dist/ReactCrop.css';

const steps = ['Personal Data', 'Purpose Of Visit', 'Place & Time'];

const FormWizardAddInvitation = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());

  const isStepSkipped = (step: any) => skipped.has(step);

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

  const handleSteps = (step: any) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Grid2 container spacing={2}>
              <Grid2 sx={{ mt: 5 }} size={{ xs: 12, sm: 12 }}>
                <Alert severity="info">Complete the following data properly and correctly</Alert>
              </Grid2>

              {/* name */}
              <Grid2 size={{ xs: 12, sm: 12 }}>
                <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="name">
                  <Typography variant="caption">Name</Typography>
                </CustomFormLabel>
                <CustomTextField
                  id="name"
                  variant="outlined"
                  fullWidth
                  helperText="You have to make sure that the name of this Visitor is true."
                />
              </Grid2>

              {/* email */}
              <Grid2 size={{ xs: 12, sm: 12 }}>
                <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="email">
                  <Typography variant="caption">Email</Typography>
                </CustomFormLabel>
                <CustomTextField
                  id="email"
                  variant="outlined"
                  fullWidth
                  helperText="You have to make sure that the email of this Visitor is true."
                />
              </Grid2>
            </Grid2>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Grid2 container spacing={2}>
              <Grid2 sx={{ mt: 5 }} size={{ xs: 12, sm: 12 }}>
                <Alert severity="info">Complete the following data properly and correctly</Alert>
              </Grid2>

              {/* Name of person */}
              <Grid2 size={{ xs: 6, sm: 6 }}>
                <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="name_of_person">
                  <Typography variant="caption">Name of person</Typography>
                </CustomFormLabel>
                <CustomTextField
                  id="name_of_person"
                  variant="outlined"
                  fullWidth
                  helperText="You have to make sure that the name of this Visitor is true."
                />
              </Grid2>

              {/* Phone */}
              <Grid2 size={{ xs: 6, sm: 6 }}>
                <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="phone">
                  <Typography variant="caption">Phone</Typography>
                </CustomFormLabel>
                <CustomTextField
                  id="phone"
                  variant="outlined"
                  fullWidth
                  helperText="You have to make sure that the phone number is true."
                />
              </Grid2>

              {/* Email */}
              <Grid2 size={{ xs: 6, sm: 6 }}>
                <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="email">
                  <Typography variant="caption">Email</Typography>
                </CustomFormLabel>
                <CustomTextField
                  id="email"
                  variant="outlined"
                  fullWidth
                  helperText="You have to make sure that the email of this Visitor is true."
                />
              </Grid2>

              {/* Purpose */}
              <Grid2 size={{ xs: 6, sm: 6 }}>
                <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="purpose">
                  <Typography variant="caption">Purpose</Typography>
                </CustomFormLabel>
                <CustomTextField
                  id="purpose"
                  select
                  variant="outlined"
                  fullWidth
                  defaultValue=""
                  helperText="You have to make sure that the purpose of this Visitor is true."
                >
                  <MenuItem value="Meeting">Meeting</MenuItem>
                  <MenuItem value="Survey">Survey</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </CustomTextField>
              </Grid2>
            </Grid2>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Grid2 container spacing={2}>
              <Grid2 sx={{ mt: 5 }} size={{ xs: 12, sm: 12 }}>
                <Alert severity="info">Complete the remaining data</Alert>
              </Grid2>

              {/* Agenda */}
              <Grid2 size={{ xs: 6, sm: 6 }}>
                <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="Agenda">
                  <Typography variant="caption">Agenda</Typography>
                </CustomFormLabel>
                <CustomTextField
                  id="Agenda"
                  variant="outlined"
                  fullWidth
                  helperText="You have to make sure that the agenda of this Visitor is true."
                />
              </Grid2>

              {/* Place */}
              <Grid2 size={{ xs: 6, sm: 6 }}>
                <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="Place">
                  <Typography variant="caption">Place</Typography>
                </CustomFormLabel>
                <CustomTextField
                  id="Place"
                  variant="outlined"
                  fullWidth
                  helperText="You have to make sure that the place of this Visitor is true."
                />
              </Grid2>

              {/* Start Date */}
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="Start">
                  <Typography variant="caption">Start</Typography>
                </CustomFormLabel>
                <CustomTextField
                  type="date"
                  id="Start"
                  variant="outlined"
                  fullWidth
                  helperText="You have to make sure that the start date of this Visitor is true."
                />
              </Grid2>

              {/* End Date */}
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="End">
                  <Typography variant="caption">End</Typography>
                </CustomFormLabel>
                <CustomTextField
                  type="date"
                  id="End"
                  variant="outlined"
                  fullWidth
                  helperText="You have to make sure that the end date of this Visitor is true."
                />
              </Grid2>
            </Grid2>
          </Box>
        );

      default:
        return null;
    }
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <PageContainer>
      <Box width="100%">
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => {
            const stepProps: { completed?: boolean } = {};
            const labelProps: {
              optional?: React.ReactNode;
            } = {};

            if (isStepSkipped(index)) {
              stepProps.completed = false;
            }

            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        {activeStep === steps.length ? (
          <>
            <Stack spacing={2} mt={3}>
              <Alert severity="success">All steps completed - you&apos;re finished</Alert>

              <Box textAlign="right">
                <Button onClick={handleReset} variant="contained" color="error">
                  Reset
                </Button>
              </Box>
            </Stack>
          </>
        ) : (
          <>
            <Box>{handleSteps(activeStep)}</Box>

            <Box display="flex" flexDirection="row" mt={3}>
              <Button
                color="inherit"
                variant="contained"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Box flex="1 1 auto" />

              <Button
                onClick={handleNext}
                variant="contained"
                color={activeStep === steps.length - 1 ? 'success' : 'secondary'}
              >
                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </PageContainer>
  );
};

export default FormWizardAddInvitation;
