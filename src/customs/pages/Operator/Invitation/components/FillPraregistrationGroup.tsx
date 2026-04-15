import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Step,
  StepLabel,
  Stepper,
  TableBody,
  Table,
  TableCell,
  TableContainer,
  TableRow,
  Grid2 as Grid,
  Typography,
  DialogActions,
  Button,
  TableHead,
} from '@mui/material';
import { Box } from '@mui/system';
import { IconArrowLeft, IconArrowRight, IconX } from '@tabler/icons-react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';

type Props = {
  open: boolean;
  onClose: () => void;
  containerRef: any;
  fillFormData: any[];
  fillFormActiveStep: number;
  setFillFormActiveStep: React.Dispatch<any>;
  fillFormDataVisitor: any[];
  setFillFormDataVisitor: React.Dispatch<any>;
  loadingAccess: boolean;
  handleSubmitPramultiple: () => void;
  renderFieldInput: any;
  getSectionType: any;
  formsOf: any;
};

function FillPraregistrationGroup({
  open,
  onClose,
  containerRef,
  fillFormData,
  fillFormActiveStep,
  setFillFormActiveStep,
  fillFormDataVisitor,
  setFillFormDataVisitor,
  loadingAccess,
  handleSubmitPramultiple,
  renderFieldInput,
  getSectionType,
  formsOf,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      PaperProps={{ sx: { width: '100vw' } }}
      container={containerRef.current}
    >
      <DialogTitle sx={{ pb: 1, fontWeight: 600 }}>Fill Pra Registration Group Form</DialogTitle>

      <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={onClose}>
        <IconX />
      </IconButton>

      <DialogContent dividers>
        {fillFormData.length > 0 && (
          <>
            <Stepper activeStep={fillFormActiveStep} alternativeLabel sx={{ mb: 3 }}>
              {fillFormData.map((s, i) => (
                <Step key={i} completed={false}>
                  <StepLabel
                    onClick={() => setFillFormActiveStep(i)}
                    sx={{
                      '& .MuiStepLabel-label': {
                        fontSize: '0.9rem !important',
                        fontWeight: 600,
                        cursor: 'pointer',
                      },
                    }}
                  >
                    {s.name}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box>
              {(() => {
                const section = fillFormData[fillFormActiveStep];
                if (!section) return null;

                const sectionType = getSectionType(section);

                if (sectionType === 'visitor_information_group') {
                  return (
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            {(
                              fillFormDataVisitor[0]?.question_page?.[fillFormActiveStep]
                                ?.visit_form ||
                              formsOf(section) ||
                              []
                            )
                              .filter(
                                (f: any) =>
                                  fillFormDataVisitor[0]?.question_page?.[fillFormActiveStep],
                              )

                              //       ?.form?.find(
                              //         (x: any) =>
                              //           x.remarks === 'is_driving' && x.answer_text === 'true',
                              //       ) || !['vehicle_type', 'vehicle_plate'].includes(f.remarks),
                              //   )
                              .map((f: any, i: any) => (
                                <TableCell key={i}>
                                  <CustomFormLabel required={f.mandatory == true}>
                                    {f.long_display_text}
                                  </CustomFormLabel>
                                </TableCell>
                              ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {fillFormDataVisitor.map((group, gIdx) => {
                            const page = group.question_page?.[fillFormActiveStep] ?? section;

                            return (
                              <TableRow key={gIdx}>
                                {page.form?.map((field: any) => {
                                  const formIdx = page.form.findIndex(
                                    (x: any) => x.remarks === field.remarks,
                                  );

                                  return (
                                    <TableCell key={field.remarks}>
                                      {renderFieldInput(
                                        field,
                                        formIdx,
                                        (idx: any, fieldKey: any, value: any) => {
                                          setFillFormDataVisitor((prev: any) => {
                                            const next = structuredClone(prev);
                                            const s = fillFormActiveStep;

                                            const targetIdx = next[gIdx].question_page[
                                              s
                                            ].form.findIndex(
                                              (x: any) => x.remarks === field.remarks,
                                            );

                                            if (targetIdx === -1) return prev;

                                            next[gIdx].question_page[s].form[targetIdx] = {
                                              ...next[gIdx].question_page[s].form[targetIdx],
                                              [fieldKey]: value,
                                            };

                                            return next;
                                          });
                                        },
                                        undefined,
                                        {
                                          uniqueKey: `${fillFormActiveStep}:${gIdx}:${field.remarks}`,
                                        },
                                      )}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  );
                }

                if (sectionType === 'purpose_visit') {
                  const mergedVisitForm = formsOf(section);

                  return (
                    <Grid container spacing={2}>
                      {mergedVisitForm.map((f: any, idx: number) => (
                        <Grid size={{ xs: 12 }} key={idx}>
                          <Typography fontWeight={600}>{f.long_display_text}</Typography>

                          <Box sx={{ pointerEvents: 'none', opacity: 0.6 }}>
                            {renderFieldInput(f, idx, () => {})}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  );
                }

                return null;
              })()}
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 2 }}>
        <Button
          onClick={() => setFillFormActiveStep((p: number) => Math.max(p - 1, 0))}
          disabled={fillFormActiveStep === 0}
          startIcon={<IconArrowLeft width={18} />}
        >
          Back
        </Button>

        {fillFormActiveStep < fillFormData.length - 1 ? (
          <Button
            variant="contained"
            onClick={() => setFillFormActiveStep((p: number) => p + 1)}
            endIcon={<IconArrowRight width={18} />}
          >
            Next
          </Button>
        ) : (
          <Button variant="contained" onClick={handleSubmitPramultiple} disabled={loadingAccess}>
            Submit
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default FillPraregistrationGroup;
