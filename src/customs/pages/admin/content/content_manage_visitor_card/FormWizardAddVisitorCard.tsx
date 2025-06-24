import {
  Button,
  Grid2,
  MenuItem,
  Box,
  Alert,
  Step,
  Stepper,
  StepLabel,
  Typography,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import ParentCard from 'src/components/shared/ParentCard';
import PageContainer from 'src/components/container/PageContainer';
import { Stack } from '@mui/system';

const steps = ['Visitor Card Info', 'Card Details'];

const FormWizardAddVisitorCard = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());

  const isStepSkipped = (step: any) => skipped.has(step);

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prev) => prev + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleSteps = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid2 container spacing={2}>
            <Grid2 mt={2} size={{ xs: 12, sm: 12 }}>
              <Alert severity="info">Complete the following data properly and correctly</Alert>
            </Grid2>

            {/* Name */}
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="name">
                <Typography variant="caption">Name</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="name"
                helperText="You have to make sure that the name of this Employee is true."
                variant="outlined"
                fullWidth
              />
            </Grid2>

            {/* Tags */}
            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="tags">
                <Typography variant="caption">Tags</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="tags"
                helperText="Enter any tags related to the employee or the card for better classification."
                variant="outlined"
                fullWidth
              />
            </Grid2>

            {/* Card Type */}
            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="card-type">
                <Typography variant="caption">Card Type</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="card-type"
                select
                variant="outlined"
                fullWidth
                defaultValue=""
                helperText="Select the appropriate type of card used by the employee."
              >
                <MenuItem value="RFID">RFID card</MenuItem>
              </CustomTextField>
            </Grid2>
          </Grid2>
        );

      case 1:
        return (
          <Grid2 container spacing={2}>
            <Grid2 mt={2} size={{ xs: 12, sm: 12 }}>
              <Alert severity="info">Complete the following data properly and correctly</Alert>
            </Grid2>

            {/* Card Number */}
            <Grid2 size={{ xs: 12, sm: 12 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="card-number">
                <Typography variant="caption">Card Number</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="card-number"
                helperText="You have to make sure that the card number is correct."
                variant="outlined"
                fullWidth
              />
            </Grid2>

            {/* QR Code */}
            <Grid2 sx={{ mt: 1 }} size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="qr-code">
                <Typography variant="caption">QR Code</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="qr-code"
                helperText="Ensure the QR code is valid and correctly."
                variant="outlined"
                fullWidth
              />
            </Grid2>

            {/* MAC Address */}
            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="mac-address">
                <Typography variant="caption">MAC Address</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="mac-address"
                helperText="Enter the MAC Address for the employee's device, if applicable."
                variant="outlined"
                fullWidth
              />
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
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => {
            const stepProps: { completed?: boolean } = {};
            const labelProps: { optional?: React.ReactNode } = {};

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
          <Stack spacing={2} mt={3}>
            <Alert severity="success">All steps completed - you&apos;re finished</Alert>
            <Box textAlign="right">
              <Button onClick={handleReset} variant="contained" color="error">
                Reset
              </Button>
            </Box>
          </Stack>
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

export default FormWizardAddVisitorCard;
