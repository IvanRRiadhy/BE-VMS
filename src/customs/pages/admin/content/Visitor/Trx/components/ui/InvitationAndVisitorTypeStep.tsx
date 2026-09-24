import { InfoOutlined } from '@mui/icons-material';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  TableHead,
  MenuItem,
  Grid2 as Grid,
  Dialog,
  Checkbox,
  TableRow,
  TableCell,
  Button,
  FormGroup,
  TextField,
  Radio,
  Button as MuiButton,
  TableContainer,
  Paper,
  IconButton,
  FormControlLabel,
  Table,
  TableBody,
  FormControl,
  RadioGroup,
  Tooltip,
  Avatar,
} from '@mui/material';
import { IconArrowRight, IconInfoCircle, IconUser, IconUsers, IconX } from '@tabler/icons-react';
import React from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import VisitorTypeList from 'src/customs/pages/Operator/Invitation/components/VisitorTypeList';

interface InvitationAndVisitorTypeStepProps {
  step: number;

  enableInvitationTypeStep?: boolean;
  isAddTransaction: boolean;

  // invitation
  isSelfInvitation: boolean | null;
  setIsSelfInvitation?: React.Dispatch<React.SetStateAction<boolean | null>>;

  // visitor type
  vtLoading: boolean;
  visitorType: any[];
  formData: any;
  handleVisitorTypeChange: (event: any) => void;

  // single/group
  isSingle: boolean;
  setIsSingle: React.Dispatch<React.SetStateAction<boolean>>;

  isGroup: boolean;
  setIsGroup: React.Dispatch<React.SetStateAction<boolean>>;

  setFormData: React.Dispatch<React.SetStateAction<any>>;

  // group
  groupVisitors: any[];
  setGroupVisitors: React.Dispatch<React.SetStateAction<any[]>>;

  setActiveGroupIdx: React.Dispatch<React.SetStateAction<number>>;

  sectionsData: any[];

  setDataVisitor: React.Dispatch<React.SetStateAction<any[]>>;

  setActiveStep: React.Dispatch<React.SetStateAction<number>>;

  seedDataVisitorFromSections: (sections: any[]) => any[];

  handleDeleteGroup: (id: string) => void;
  handleAddGroup: () => void;

  t: (key: string) => string;
}

const InvitationAndVisitorTypeStep = ({
  step,
  enableInvitationTypeStep,
  isAddTransaction,

  isSelfInvitation,
  setIsSelfInvitation,

  vtLoading,
  visitorType,
  formData,
  handleVisitorTypeChange,

  isSingle,
  setIsSingle,

  isGroup,
  setIsGroup,

  setFormData,

  groupVisitors,
  setGroupVisitors,

  setActiveGroupIdx,
  sectionsData,
  setDataVisitor,
  setActiveStep,

  seedDataVisitorFromSections,

  handleDeleteGroup,
  handleAddGroup,

  t,
}: InvitationAndVisitorTypeStepProps) => {
  const showVTListSkeleton = vtLoading;

  if (step === -1 && enableInvitationTypeStep) {
    return (
      // ============================================
      // COPY PERSIS bagian step === -1 kamu
      // ============================================
      <Box
        sx={{
          p: 3,
          borderRadius: 4,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
              : 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box mb={3}>
          <Typography variant="h5" fontWeight={700}>
            {t('questionInvitation')}
          </Typography>

          <Typography variant="body2" color="text.secondary" mt={1}>
            {t('subtitleQuestionInvitation')}
          </Typography>
        </Box>
        <RadioGroup
          value={isSelfInvitation === null ? '' : isSelfInvitation ? 'self' : 'other'}
          onChange={(e) => setIsSelfInvitation?.(e.target.value === 'self')}
        >
          <Grid container spacing={2}>
            {/* SELF */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  cursor: 'pointer',
                  border: '2px solid',
                  transition: 'all 0.25s ease',
                  borderColor: isSelfInvitation === true ? 'primary.main' : 'divider',
                  backgroundColor: isSelfInvitation === true ? 'primary.light' : 'background.paper',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => setIsSelfInvitation?.(true)}
              >
                <FormControlLabel
                  value="self"
                  control={<Radio checked={isSelfInvitation === true} />}
                  sx={{ width: '100%', m: 0, alignItems: 'flex-start' }}
                  label={
                    <Box ml={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography fontWeight={700} fontSize={18}>
                          {t('self')}
                        </Typography>

                        <Tooltip title={t('selfTooltip')} arrow>
                          <InfoOutlined
                            fontSize="small"
                            color="action"
                            sx={{ cursor: 'pointer' }}
                          />
                        </Tooltip>
                      </Box>

                      <Typography variant="body2" color="text.secondary" mt={0.5}>
                        {t('selfOption')}
                      </Typography>
                    </Box>
                  }
                />
              </Paper>
            </Grid>

            {/* OTHER */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  cursor: 'pointer',
                  border: '2px solid',
                  transition: 'all 0.25s ease',
                  borderColor: isSelfInvitation === false ? 'primary.main' : 'divider',
                  backgroundColor:
                    isSelfInvitation === false ? 'primary.light' : 'background.paper',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => setIsSelfInvitation?.(false)}
              >
                <FormControlLabel
                  value="other"
                  control={<Radio checked={isSelfInvitation === false} />}
                  sx={{ width: '100%', m: 0, alignItems: 'flex-start' }}
                  label={
                    <Box ml={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography fontWeight={700} fontSize={18}>
                          {t('others')}
                        </Typography>

                        <Tooltip title={t('otherTooltip')} arrow>
                          <InfoOutlined
                            fontSize="small"
                            color="action"
                            sx={{ cursor: 'pointer' }}
                          />
                        </Tooltip>
                      </Box>

                      <Typography variant="body2" color="text.secondary" mt={0.5}>
                        {t('othersOption')}
                      </Typography>
                    </Box>
                  }
                />
              </Paper>
            </Grid>
          </Grid>
        </RadioGroup>
      </Box>
    );
  }

  if (step === 0 && !isAddTransaction) {
    return (
      <Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel
              htmlFor="visitor-type"
              sx={{ mb: 1, borderLeft: '4px solid #673ab7', pl: 1 }}
            >
              Visitor Type
            </CustomFormLabel>
            <FormControl component="fieldset">
              <VisitorTypeList
                visitorType={visitorType || []}
                formData={formData}
                showVTListSkeleton={showVTListSkeleton}
                onChange={(e: any) => handleVisitorTypeChange(e)}
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel
              htmlFor="visitor-type"
              sx={{ mb: 1, borderLeft: '4px solid #673ab7', pl: 1 }}
            >
              {t('selectStatusVisitor')}
              {/* <br /> */}
            </CustomFormLabel>
            <Typography sx={{ color: 'secondary', opacity: '0.7' }}>
              {t('subtitleStatusVisitor')}
            </Typography>

            {/* <Box display="flex" alignItems="center" gap={2}>
                <FormControlLabel
                  control={
                    <Radio
                      checked={formData.is_group === false}
                      value={formData.is_group}
                      onChange={() => {
                        setIsSingle(true);
                        setIsGroup(false);
                        setFormData((prev: any) => ({
                          ...prev,
                          is_group: false,
                        }));
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconUser size={18} />
                      Single
                      <Tooltip arrow title="Only one visitor can be added">
                        <IconButton size="small" sx={{ ml: 0 }}>
                          <IconInfoCircle size={22} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={
                    <Radio
                      checked={formData.is_group === true}
                      value={formData.is_group}
                      onChange={() => {
                        const value = true;

                        setIsSingle(false);
                        setIsGroup(value);

                        setFormData((prev: any) => ({
                          ...prev,
                          is_group: value,
                        }));
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconUsers size={18} />
                      Group
                      <Tooltip arrow title="Multiple visitors can be added">
                        <IconButton size="small" sx={{ ml: 0 }}>
                          <IconInfoCircle size={22} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Box> */}
            <Box display="flex" gap={2} flexWrap={'wrap'} mt={0.6}>
              {/* Single */}
              <Paper
                variant="outlined"
                onClick={() => {
                  setIsSingle(true);
                  setIsGroup(false);

                  setFormData((prev: any) => ({
                    ...prev,
                    is_group: false,
                  }));
                }}
                sx={{
                  flex: 1,
                  p: 2,
                  borderRadius: 2,
                  cursor: 'pointer',
                  borderColor: formData.is_group === false ? 'primary.main' : 'divider',
                  bgcolor: formData.is_group === false ? 'primary.50' : 'background.paper',
                  transition: 'all .2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
              >
                <Box display="flex" alignItems="center">
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: formData.is_group === false ? 'primary.main' : 'grey.200',
                      color: formData.is_group === false ? '#fff' : 'text.secondary',
                    }}
                  >
                    <IconUser size={20} />
                  </Avatar>

                  <Box ml={2} flex={1}>
                    <Typography fontWeight={600}>Single</Typography>

                    <Typography variant="body2" color="text.secondary">
                      {t('onlyOneVisitor')}
                    </Typography>
                  </Box>

                  <Tooltip arrow title="Only one visitor can be added">
                    <IconButton size="small">
                      <IconInfoCircle size={18} />
                    </IconButton>
                  </Tooltip>

                  <Radio checked={formData.is_group === false} />
                </Box>
              </Paper>

              {/* Group */}
              <Paper
                variant="outlined"
                onClick={() => {
                  setIsSingle(false);
                  setIsGroup(true);

                  setFormData((prev: any) => ({
                    ...prev,
                    is_group: true,
                  }));
                }}
                sx={{
                  flex: 1,
                  p: 2,
                  borderRadius: 2,
                  cursor: 'pointer',
                  borderColor: formData.is_group ? 'primary.main' : 'divider',
                  bgcolor: formData.is_group ? 'primary.50' : 'background.paper',
                  transition: 'all .2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
              >
                <Box display="flex" alignItems="center">
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: formData.is_group ? 'primary.main' : 'grey.200',
                      color: formData.is_group ? '#fff' : 'text.secondary',
                    }}
                  >
                    <IconUsers size={20} />
                  </Avatar>

                  <Box ml={2} flex={1}>
                    <Typography fontWeight={600}>Group</Typography>

                    <Typography variant="body2" color="text.secondary">
                      {t('moreThanOneVisitor')}
                    </Typography>
                  </Box>

                  <Tooltip arrow title="Multiple visitors can be added">
                    <IconButton size="small">
                      <IconInfoCircle size={18} />
                    </IconButton>
                  </Tooltip>

                  <Radio checked={formData.is_group === true} />
                </Box>
              </Paper>
            </Box>
            {isGroup && (
              <Box>
                <CustomFormLabel sx={{ mb: 1, borderLeft: '4px solid #673ab7', pl: 1 }}>
                  Group List
                </CustomFormLabel>

                <TableContainer
                  component={Paper}
                  sx={{
                    '@media (max-width:600px)': {
                      background: 'transparent',
                      boxShadow: 'none',
                    },
                  }}
                >
                  <Table
                    size="small"
                    sx={{
                      '@media (max-width:600px)': {
                        display: 'block',

                        '& thead': {
                          display: 'none',
                        },

                        '& tbody': {
                          display: 'block',
                        },

                        '& tr': {
                          display: 'block',
                          mb: 2,
                          p: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          backgroundColor: 'background.paper',
                        },

                        '& td': {
                          display: 'block',
                          minWidth: 'unset !important',
                          width: '100%',
                          border: 0,
                          padding: '6px 0',
                        },

                        '& td:nth-of-type(1)::before': {
                          content: '"Group Name"',
                          display: 'block',
                          fontSize: 12,
                          fontWeight: 600,
                          mb: 0.5,
                        },

                        '& td:nth-of-type(2)::before': {
                          content: '"Code"',
                          display: 'block',
                          fontSize: 12,
                          fontWeight: 600,
                          mb: 0.5,
                        },
                        '& td:nth-of-type(3)': {
                          display: 'inline-flex',
                          width: 'calc(100% - 45px)',
                          verticalAlign: 'middle',
                          paddingRight: 0,
                          position: 'relative',
                        },

                        '& td:nth-of-type(3)::before': {
                          display: 'none',
                        },

                        '& td:nth-of-type(3) .MuiButton-root': {
                          width: '100%',
                          justifyContent: 'space-between',
                        },

                        '& td:nth-of-type(4)': {
                          display: 'inline-flex',
                          width: '45px',
                          verticalAlign: 'middle',
                          paddingLeft: '8px',
                          paddingTop: '6px',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                        },
                      },
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>Group Name</TableCell>
                        <TableCell>Code</TableCell>
                        <TableCell
                          sx={{
                            '@media (max-width:600px)': {
                              display: 'none !important',
                            },
                          }}
                        >
                          Visitor Form
                        </TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {groupVisitors.map((g, index) => (
                        <TableRow key={g.id}>
                          <TableCell>
                            <TextField
                              size="small"
                              fullWidth
                              name="group_name"
                              value={g.group_name}
                              placeholder="Enter group name"
                              onChange={(e) =>
                                setGroupVisitors((prev) =>
                                  prev.map((item) =>
                                    item.id === g.id
                                      ? { ...item, group_name: e.target.value }
                                      : item,
                                  ),
                                )
                              }
                            />
                          </TableCell>

                          <TableCell>
                            <CustomTextField
                              size="small"
                              fullWidth
                              name="group_code"
                              value={g.group_code}
                              InputProps={{ readOnly: true }}
                              sx={{
                                '& .MuiInputBase-input': {
                                  backgroundColor: '#f5f5f5',
                                },
                              }}
                            />
                          </TableCell>

                          <TableCell>
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              endIcon={<IconArrowRight size={20} />}
                              onClick={() => {
                                setActiveGroupIdx(index);

                                const deepClone = (obj: any) => {
                                  try {
                                    return structuredClone(obj);
                                  } catch {
                                    return JSON.parse(JSON.stringify(obj));
                                  }
                                };

                                if (g.data_visitor && g.data_visitor.length > 0) {
                                  setDataVisitor(deepClone(g.data_visitor));
                                } else {
                                  setDataVisitor(
                                    deepClone(seedDataVisitorFromSections(sectionsData)),
                                  );
                                }

                                setActiveStep(1);
                              }}
                            >
                              Visitor Form
                            </Button>
                          </TableCell>

                          <TableCell
                            align="center"
                            sx={{
                              paddingTop: '0 !important',
                              '@media (max-width: 600px)': {
                                paddingLeft: 0,
                              },
                            }}
                          >
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteGroup(g.id || '')}
                              size="small"
                            >
                              <IconX />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}

                      {groupVisitors.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            No group added yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {groupVisitors.length === 0 && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleAddGroup}
                    sx={{ mb: 1, mt: 1 }}
                  >
                    + {t('add')} Group
                  </Button>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    );
  }

  return null;
};

export default InvitationAndVisitorTypeStep;
