import {
  Box,
  Typography,
  TableHead,
  Grid2 as Grid,
  TableRow,
  TableCell,
  Button,
  Button as MuiButton,
  TableContainer,
  Paper,
  IconButton,
  Table,
  TableBody,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';
import RequiredFieldNotice from './RequiredFieldNotice';
import { IconCheck, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import VisitorSelect from 'src/customs/components/select2/VisitorSelect';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
const VisitorFormStep = ({
  step,
  isAddTransaction,
  isSingle,
  isGroup,
  activeStep,
  sectionsData,
  setSectionsData,
  dataVisitor,
  setDataVisitor,
  activeGroupIdx,
  isMobile,
  groupedPages,
  setGroupedPages,
  errors,
  sameField,
  hasAns,
  pickAns,
  getSectionIndex,
  getSectionType,
  isEmployeeSection,
  handleSelectDataVisitor,
  handleSelectVisitor,
  renderDetailRows,
  updateSectionForm,
  renderFieldInput,
  formsOf,
  getVisibilityMap,
  validateField,
  handleDeleteGroupRow,
  handleAddDetails,
  handleOpenSelfOnly,
  t,
}: any) => {
  const currentSection = isAddTransaction ? sectionsData[step] : sectionsData[step - 1];

  if (!currentSection) {
    return null;
  }

  return (
    <>
      {isSingle && (
        <Grid>
          <RequiredFieldNotice />
          {(() => {
            // const section = currentSection;
            const sectionIndex = getSectionIndex(activeStep);
            const section = sectionsData[sectionIndex];
            const sectionType = getSectionType(section);
            const isEmployee = isEmployeeSection(section);
            if (sectionType === 'visitor_information') {
              return (
                <>
                  <VisitorSelect
                    key={String(isEmployee)}
                    isEmployee={isEmployee}
                    onSelect={(v) => handleSelectDataVisitor(v, isEmployee)}
                  />

                  <Accordion key={activeStep} expanded sx={{ mt: 0 }}>
                    <AccordionDetails sx={{ paddingTop: 0 }}>
                      <Table>
                        <TableBody>
                          {renderDetailRows(formsOf(section), (index, field, value) => {
                            setSectionsData((prev: any) =>
                              prev.map((s, sIdx) =>
                                sIdx !== sectionIndex
                                  ? s
                                  : updateSectionForm(s, (arr) =>
                                      arr.map((item, i) =>
                                        i === index ? { ...item, [field]: value } : item,
                                      ),
                                    ),
                              ),
                            );
                          })}
                        </TableBody>
                      </Table>
                    </AccordionDetails>
                  </Accordion>
                </>
              );
            } else if (sectionType === 'parking') {
              return (
                <Table>
                  <TableBody>
                    {renderDetailRows(formsOf(section), (index, field, value) => {
                      setSectionsData((prev) =>
                        prev.map((s, sIdx) =>
                          sIdx !== sectionIndex
                            ? s
                            : updateSectionForm(s, (arr) =>
                                arr.map((item, i) =>
                                  i === index ? { ...item, [field]: value } : item,
                                ),
                              ),
                        ),
                      );
                    })}
                  </TableBody>
                </Table>
              );
            } else if (sectionType === 'purpose_visit') {
              return (
                <Table>
                  <TableBody>
                    {renderDetailRows(formsOf(section), (index, field, value) => {
                      // Add Transaction tidak boleh mengubah Purpose Visit
                      if (isAddTransaction) return;

                      setSectionsData((prev) =>
                        prev.map((s, sIdx) =>
                          sIdx !== (isAddTransaction ? activeStep : sectionIndex)
                            ? s
                            : updateSectionForm(s, (arr) =>
                                arr.map((item, i) =>
                                  i === index ? { ...item, [field]: value } : item,
                                ),
                              ),
                        ),
                      );
                    })}
                  </TableBody>
                </Table>
              );
            } else if (sectionType === 'nda') {
              return (
                <Table>
                  <TableBody>
                    {renderDetailRows(formsOf(section), (index, field, value) => {
                      setSectionsData((prev) =>
                        prev.map((s, sIdx) =>
                          sIdx !== sectionIndex
                            ? s
                            : updateSectionForm(s, (arr) =>
                                arr.map((item, i) =>
                                  i === index ? { ...item, [field]: value } : item,
                                ),
                              ),
                        ),
                      );
                    })}
                  </TableBody>
                </Table>
              );
            } else if (sectionType === 'identity_image') {
              return (
                <Table>
                  <TableBody>
                    {renderDetailRows(formsOf(section), (index, field, value) => {
                      setSectionsData((prev) =>
                        prev.map((s, sIdx) =>
                          sIdx !== sectionIndex
                            ? s
                            : updateSectionForm(s, (arr) =>
                                arr.map((item, i) =>
                                  i === index ? { ...item, [field]: value } : item,
                                ),
                              ),
                        ),
                      );
                    })}
                  </TableBody>
                </Table>
              );
            } else if (sectionType === 'selfie_image') {
              return (
                <Table>
                  <TableBody>
                    {renderDetailRows(formsOf(section), (index, field, value) => {
                      setSectionsData((prev) =>
                        prev.map((s, sIdx) =>
                          sIdx !== sectionIndex
                            ? s
                            : updateSectionForm(s, (arr) =>
                                arr.map((item, i) =>
                                  i === index ? { ...item, [field]: value } : item,
                                ),
                              ),
                        ),
                      );
                    })}
                  </TableBody>
                </Table>
              );
            }

            return null;
          })()}
        </Grid>
      )}

      {isGroup && (
        <Grid>
          <RequiredFieldNotice />
          {(() => {
            const sectionIndex = getSectionIndex(activeStep);
            const section = sectionsData[sectionIndex];

            const sectionType = getSectionType(section);

            if (sectionType === 'visitor_information_group') {
              return (
                <Grid>
                  <Box>
                    <TableContainer component={Paper} sx={{ mb: 1 }}>
                      {isMobile ? (
                        <>
                          {dataVisitor.length > 0 ? (
                            dataVisitor.map((group, gIdx) => {
                              const page = group.question_page[sectionIndex];
                              if (!page) return null;
                              const isEmployee =
                                dataVisitor[activeGroupIdx]?.question_page?.[1]?.form?.find(
                                  (f) => f.remarks === 'is_employee',
                                )?.answer_text === 'true';

                              return (
                                <Accordion key={gIdx} sx={{ mb: 1 }}>
                                  <Box sx={{ position: 'relative' }}>
                                    <AccordionSummary
                                      expandIcon={<ExpandMoreIcon />}
                                      sx={{
                                        padding: '10px !important',
                                      }}
                                    >
                                      <Typography fontWeight="bold" mb={0} mx={1}>
                                        Visitor {gIdx + 1}
                                      </Typography>
                                    </AccordionSummary>
                                    {dataVisitor.length > 1 && (
                                      <IconButton
                                        size="small"
                                        color="error"
                                        sx={{
                                          position: 'absolute',
                                          right: 50,
                                          top: '50%',
                                          transform: 'translateY(-50%)',
                                          backgroundColor: 'red',
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteGroupRow(gIdx);
                                        }}
                                      >
                                        <IconTrash color="white" />
                                      </IconButton>
                                    )}
                                  </Box>

                                  <AccordionDetails>
                                    <Box sx={{ width: '100%', mb: 2 }}>
                                      <CustomFormLabel sx={{ mt: 0 }}>Search</CustomFormLabel>
                                      <VisitorSelect
                                        key={String(isEmployee)}
                                        isEmployee={isEmployee}
                                        onSelect={(v) => handleSelectVisitor(gIdx, v)}
                                      />
                                    </Box>

                                    {page.form
                                      ?.filter(
                                        (field: any) =>
                                          (field.remarks || '').toLowerCase() !== 'employee' &&
                                          field.is_enable === true,
                                      )
                                      .map((field: any, fIdx: any) => {
                                        const matchedKey = Object.keys(
                                          groupedPages.batch_page || {},
                                        ).find((k) => sameField(groupedPages.batch_page[k], field));
                                        const shared = matchedKey
                                          ? groupedPages.batch_page[matchedKey]
                                          : undefined;
                                        const proxyField = hasAns(field)
                                          ? field
                                          : shared
                                            ? { ...field, ...pickAns(shared) }
                                            : field;
                                        const originalIndex = page?.form?.findIndex(
                                          (f: any) => f.custom_field_id === field.custom_field_id,
                                        );

                                        return (
                                          <Box key={field.custom_field_id} sx={{ mb: 2 }}>
                                            {renderFieldInput(
                                              proxyField,
                                              originalIndex || fIdx,
                                              (idx, fieldKey, value) => {
                                                setDataVisitor((prev) => {
                                                  const next = [...prev];
                                                  const s = sectionIndex;
                                                  if (
                                                    !next[gIdx]?.question_page?.[s]?.form?.[
                                                      originalIndex || fIdx
                                                    ]
                                                  )
                                                    return prev;
                                                  next[gIdx].question_page[s].form[
                                                    originalIndex || fIdx
                                                  ] = {
                                                    ...next[gIdx].question_page[s].form[
                                                      originalIndex || fIdx
                                                    ],
                                                    [fieldKey]: value,
                                                  };
                                                  return next;
                                                });
                                              },
                                              // undefined,
                                              {
                                                showLabel: true,
                                                // uniqueKey: `${sectionIndex}:${gIdx}:${fIdx}`,
                                                uniqueKey: `${sectionIndex}:${gIdx}:${field.custom_field_id}`,
                                              },
                                            )}
                                          </Box>
                                        );
                                      })}
                                  </AccordionDetails>
                                </Accordion>
                              );
                            })
                          ) : (
                            <Typography align="center" sx={{ py: 2 }}>
                              No visitor data. Click "Add New" to start.
                            </Typography>
                          )}

                          <MuiButton
                            size="small"
                            onClick={handleAddDetails}
                            sx={{ my: 2 }}
                            variant="contained"
                            fullWidth
                            startIcon={<IconPlus />}
                          >
                            {t('addVisitor')}
                          </MuiButton>
                        </>
                      ) : (
                        <Table
                          size="small"
                          sx={{
                            minWidth: 1000,
                            tableLayout: 'auto',
                            '& th, & td': { whiteSpace: 'nowrap' },
                          }}
                        >
                          <TableHead>
                            <TableRow>
                              <TableCell>
                                <CustomFormLabel>{t('search')}</CustomFormLabel>
                              </TableCell>
                              {(dataVisitor[0]?.question_page[sectionIndex]?.form || [])
                                .filter(
                                  (f: any) =>
                                    (f.remarks || '').toLowerCase() !== 'employee' &&
                                    f.is_enable === true,
                                )
                                .map((f: any, i: any) => (
                                  <TableCell key={f.custom_field_id || i}>
                                    <CustomFormLabel required={f.mandatory === true}>
                                      {f.long_display_text}
                                    </CustomFormLabel>
                                  </TableCell>
                                ))}
                              <TableCell align="center">
                                <Typography variant="subtitle2" fontWeight={600}>
                                  Action
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {dataVisitor.length > 0 ? (
                              dataVisitor.map((group, gIdx) => {
                                const page = group.question_page[sectionIndex];
                                if (!page?.form) return null;

                                const fields = page.form;
                                const hasSelfOnly = dataVisitor[gIdx]?.single_page?.some(
                                  (f: any) => f.answer_text || f.answer_datetime || f.answer_file,
                                );

                                const isEmployee =
                                  dataVisitor[activeGroupIdx]?.question_page?.[1]?.form?.find(
                                    (f) => f.remarks === 'is_employee',
                                  )?.answer_text === 'true';
                                return (
                                  <TableRow key={gIdx}>
                                    <TableCell sx={{ minWidth: 250 }}>
                                      <VisitorSelect
                                        key={String(isEmployee)}
                                        isEmployee={isEmployee}
                                        onSelect={(v) => handleSelectVisitor(gIdx, v)}
                                      />
                                    </TableCell>
                                    {fields
                                      .filter(
                                        (field: any) =>
                                          (field.remarks || '').toLowerCase() !== 'employee' &&
                                          field.is_enable === true,
                                      )
                                      .map((field: any) => {
                                        const matchedKey = Object.keys(
                                          groupedPages.batch_page || {},
                                        ).find((k) => sameField(groupedPages.batch_page[k], field));

                                        const shared = matchedKey
                                          ? groupedPages.batch_page[matchedKey]
                                          : undefined;

                                        const proxyField = hasAns(field)
                                          ? field
                                          : shared
                                            ? { ...field, ...pickAns(shared) }
                                            : field;

                                        return (
                                          <TableCell key={field.custom_field_id}>
                                            {renderFieldInput(
                                              proxyField,
                                              field.custom_field_id,
                                              (idx, fieldKey, value) => {
                                                setDataVisitor((prev) => {
                                                  const next = [...prev];
                                                  const s = sectionIndex;

                                                  if (!next[gIdx]?.question_page?.[s]?.form)
                                                    return prev;

                                                  next[gIdx].question_page[s].form = next[
                                                    gIdx
                                                  ].question_page[s].form.map((f: any) =>
                                                    f.custom_field_id === field.custom_field_id
                                                      ? { ...f, [fieldKey]: value }
                                                      : f,
                                                  );

                                                  return next;
                                                });
                                              },
                                              {
                                                showLabel: false,
                                                uniqueKey: `${sectionIndex}:${gIdx}:${field.custom_field_id}`,
                                                details: page.form || [],
                                              },
                                            )}
                                          </TableCell>
                                        );
                                      })}

                                    <TableCell align="right">
                                      {dataVisitor.length > 1 && (
                                        <>
                                          <IconButton
                                            aria-label="delete-row"
                                            onClick={() => handleDeleteGroupRow(gIdx)}
                                            size="small"
                                            color="error"
                                          >
                                            <IconTrash />
                                          </IconButton>
                                          {!isAddTransaction && (
                                            <Button
                                              variant="contained"
                                              size="small"
                                              color={hasSelfOnly ? 'success' : 'primary'}
                                              startIcon={
                                                hasSelfOnly ? <IconCheck /> : <IconPencil />
                                              }
                                              onClick={() => handleOpenSelfOnly(gIdx)}
                                            >
                                              {hasSelfOnly ? 'Filled' : 'Self Only'}
                                            </Button>
                                          )}
                                        </>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            ) : (
                              <TableRow>
                                <TableCell colSpan={12} align="center">
                                  No visitor data. Click "Add New" to start.
                                </TableCell>
                              </TableRow>
                            )}

                            <TableRow>
                              <TableCell colSpan={99} align="left">
                                <MuiButton
                                  size="small"
                                  onClick={handleAddDetails}
                                  sx={{ mx: 1, my: 1 }}
                                  variant="contained"
                                  startIcon={<IconPlus />}
                                >
                                  {t('addVisitor')}
                                </MuiButton>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      )}
                    </TableContainer>
                  </Box>
                </Grid>
              );
            } else if (sectionType === 'purpose_visit') {
              const visitor = dataVisitor[0];
              if (!visitor) return null;
              const pIdx = visitor?.question_page?.findIndex((p) =>
                p.name.toLowerCase().includes('purpose visit'),
              );
              if (pIdx < 0) return null;
              const pickAns = (f: any) => {
                const out: any = {};
                if (f?.answer_text != null) out.answer_text = f.answer_text;
                if (f?.answer_datetime != null) out.answer_datetime = f.answer_datetime;
                if (f?.answer_file != null) out.answer_file = f.answer_file;
                return out;
              };

              const sameField = (a: any, b: any) =>
                (a?.custom_field_id &&
                  b?.custom_field_id &&
                  a.custom_field_id === b.custom_field_id) ||
                (a?.remarks && b?.remarks && a.remarks === b.remarks);
              const mergedVisitForm = formsOf(section).map((f: any) => {
                const shared = groupedPages.single_page.find((sf) => sameField(sf, f));
                return shared ? { ...f, ...pickAns(shared) } : f;
              });

              const visibilityMap: any = getVisibilityMap(mergedVisitForm);

              mergedVisitForm.forEach((item: any) => {
                if (!item?.mandatory) return;

                const remark = (item.remarks || '').toLowerCase();
                const isVisible = visibilityMap.hasOwnProperty(remark)
                  ? visibilityMap[remark]
                  : true;

                if (!isVisible) return;
                const fieldId = item.custom_field_id || item.id;
                const key = `${sectionIndex}:${fieldId}`;

                validateField(item, key, errors);
              });

              return (
                <Table>
                  <TableBody>
                    {renderDetailRows(
                      mergedVisitForm,
                      (idx, fieldKey, value) => {
                        setGroupedPages((prev) => {
                          const next = { ...prev, single_page: [...prev.single_page] };
                          const base = formsOf(section)[idx];
                          const found = next.single_page.findIndex((sf) => sameField(sf, base));

                          const resolvedForeign =
                            base?.foreign_id ??
                            section?.foreign_id ??
                            base?.custom_field_id ??
                            null;

                          const payload = {
                            ...(found >= 0 ? next.single_page[found] : base),
                            foreign_id:
                              found >= 0
                                ? (next.single_page[found].foreign_id ?? resolvedForeign)
                                : resolvedForeign,
                            [fieldKey]: value,
                          };

                          if (found >= 0) next.single_page[found] = payload;
                          else next.single_page.push(payload);

                          return next;
                        });
                      },
                      undefined,
                      false,
                      {
                        disabled: isAddTransaction,
                      },
                    )}
                  </TableBody>
                </Table>
              );
            }

            return null;
          })()}
        </Grid>
      )}
    </>
  );
};

export default VisitorFormStep;
