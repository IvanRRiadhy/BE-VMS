import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Box,
  Button,
  Grid2 as Grid,
} from '@mui/material';
import { IconX, IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import React from 'react';

const InvitationDialog = ({
  open,
  onClose,
  activeStep,
  setActiveStep,
  groupedSections,
  steps,
  handleNext,
  handleBack,
  handleSubmit,
  renderStepContent,
}: any) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      PaperProps={{
        sx: {
          width: '100vw',
        },
      }}
    >
      <DialogTitle>Add Invitation</DialogTitle>

      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
        }}
      >
        <IconX />
      </IconButton>

      <Divider />

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {groupedSections.map((s: any, idx: any) => (
                <Step key={idx} completed={false}>
                  <StepLabel
                    onClick={() => setActiveStep(idx)}
                    sx={{
                      fontSize: '16px !important',
                      '& .MuiStepLabel-label': {
                        fontSize: '15px !important',
                        fontWeight: '500 !important',
                      },
                    }}
                  >
                    {s.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box mt={4}>{renderStepContent(activeStep)}</Box>

            <Box display="flex" mt={4}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<IconArrowLeft size={18} />}
              >
                Back
              </Button>

              <Box flex="1 1 auto" />

              {activeStep !== steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  endIcon={<IconArrowRight size={18} />}
                >
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} variant="contained">
                  Submit
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(InvitationDialog);
