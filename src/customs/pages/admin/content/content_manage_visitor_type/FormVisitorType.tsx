import {
  Button,
  Grid2 as Grid,
  Alert,
  Typography,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  Stack,
  FormControlLabel,
  Radio,
  Switch,
  MenuItem,
  IconButton,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stepper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
} from '@mui/material';
import { Box, width } from '@mui/system';
import React, { useEffect, useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  CreateVisitorTypeRequest,
  CreateVisitorTypeRequestSchema,
  FormVisitorTypes,
  SectionPageVisitorType,
} from 'src/customs/api/models/VisitorType';
import { IconTrash } from '@tabler/icons-react';
import { createVisitorType, getAllDocumentPagination } from 'src/customs/api/admin';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useNavigate } from 'react-router';
import { useDrag, useDrop } from 'react-dnd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface FormVisitorTypeProps {
  formData: CreateVisitorTypeRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateVisitorTypeRequest>>;
  edittingId?: string;
  onSuccess?: () => void;
}

const FormVisitorType: React.FC<FormVisitorTypeProps> = ({
  formData,
  setFormData,
  edittingId,
  onSuccess,
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState<'info' | 'success' | 'error'>('info');
  const [alertMessage, setAlertMessage] = useState<string>(
    'Complete the following data properly and correctly',
  );
  const { token } = useSession();
  // Stepper
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());
  const isStepSkipped = (step: number) => skipped.has(step);

  const handleMoveStep = (fromIndex: number, toIndex: number) => {
    const updatedSteps = [...dynamicSteps];
    const [movedStep] = updatedSteps.splice(fromIndex, 1);
    updatedSteps.splice(toIndex, 0, movedStep);

    const updatedSections = [...sectionsData];
    const [movedSection] = updatedSections.splice(fromIndex, 1);
    updatedSections.splice(toIndex, 0, movedSection);

    const reSortedSections = updatedSections.map((section, idx) => ({
      ...section,
      sort: idx,
    }));

    setDynamicSteps(updatedSteps);
    setSectionsData(reSortedSections);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }
    setActiveStep((prev) => prev + 1);
    setSkipped(newSkipped);
  };

  const [document, setDocument] = useState<any[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    console.log(id, value);
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleMultipleChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;

    const selectedValues = typeof value === 'string' ? value.split(',') : (value as string[]);

    const mapped = selectedValues.map((val) => ({ document_id: val }));

    setFormData((prev) => ({
      ...prev,
      [name!]: mapped,
    }));
  };
  // Get Document
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      const documentRes = await getAllDocumentPagination(token, 0, 99, 'id');
      setDocument(documentRes?.collection ?? []);
    };
    fetchData();
  }, [token]);

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (!token) {
        setAlertType('error');
        setAlertMessage('Something went wrong. Please try again later.');
        setTimeout(() => {
          setAlertType('info');
          setAlertMessage('Complete the following data properly and correctly');
        }, 3000);
        return;
      }

      const transformedSections = sectionsData.map((section) => ({
        sort: section.sort,
        name: section.name,
        status: 1,
        form_visitor: Object.values(section.form_visitor || {}),
        pra_form_visitor: Object.values(section.pra_form_visitor || {}),
        signout_form_visitor: Object.values(section.signout_form_visitor || {}),
      }));

      const data: CreateVisitorTypeRequest = {
        ...formData,
        section_page_visitor_types: transformedSections,
      };

      // ✅ Cek data hasil akhir
      console.log('Final data to submit:', data);

      const parseData = CreateVisitorTypeRequestSchema.parse(data);
      await createVisitorType(token, parseData);
      // Opsional: reset form atau kasih notifikasi berhasil
      setAlertType('success');
      setAlertMessage('Visitor type created successfully!');
      // navigate('/visitor-type');
    } catch (err: any) {
      if (err?.errors) {
        setErrors(err.errors);
      }
      setAlertType('error');
      setAlertMessage('Something went wrong. Please try again later.');
      setTimeout(() => {
        setAlertType('info');
        setAlertMessage('Complete the following data properly and correctly');
      }, 3000);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 800);
    }
  };
  const renderDetailRows = (
    details: FormVisitorTypes[] | any,
    onChange: (index: number, field: keyof FormVisitorTypes, value: any) => void,
    onDelete?: (index: number) => void,
    showMandatory = true,
  ) => {
    if (!Array.isArray(details)) {
      console.error('Expected array for details, but got:', details);
      return (
        <TableRow>
          <TableCell colSpan={5}>Invalid data format</TableCell>
        </TableRow>
      );
    }

    return details.map((item, index) => (
      <TableRow key={index}>
        <TableCell>
          <TextField
            size="small"
            value={item.short_name}
            onChange={(e) => onChange(index, 'short_name', e.target.value)}
            placeholder="Short Name"
          />
        </TableCell>
        <TableCell>
          <TextField
            size="small"
            value={item.long_display_text}
            onChange={(e) => onChange(index, 'long_display_text', e.target.value)}
            placeholder="Display Text"
          />
        </TableCell>
        <TableCell align="center">
          <Switch
            checked={!!item.is_enable}
            onChange={(_, checked) => onChange(index, 'is_enable', checked)}
          />
        </TableCell>
        <TableCell align="center">
          {/* <Switch
            checked={!!item.field_type}
            onChange={(_, checked) => onChange(index, 'field_type', checked)}
          /> */}
          <TextField
            size="small"
            type="number"
            value={item.field_type}
            onChange={(e) => onChange(index, 'field_type', Number(e.target.value))}
            inputProps={{ min: 0 }}
          />
        </TableCell>
        <TableCell align="center">
          <Switch
            checked={!!item.is_primary}
            onChange={(_, checked) => onChange(index, 'is_primary', checked)}
          />
        </TableCell>

        {showMandatory && (
          <TableCell align="center">
            <Switch
              checked={!!item.mandatory}
              onChange={(_, checked) => onChange(index, 'mandatory', checked)}
            />
          </TableCell>
        )}
        {onDelete && (
          <TableCell align="center">
            <IconButton onClick={() => onDelete(index)} size="small">
              <IconTrash fontSize="small" />
            </IconButton>
          </TableCell>
        )}
      </TableRow>
    ));
  };

  type SectionKey = 'form_visitor' | 'pra_form_visitor' | 'signout_form_visitor';

  const handleAddDetail = (sectionKey: SectionKey) => {
    const newItem = {
      short_name: '',
      long_display_text: '',
      is_enable: false,
      is_primary: false,
      field_type: 0,
      mandatory: false,
    };

    setSectionsData((prev) =>
      prev.map((section, index) => {
        if (index === activeStep - 1) {
          const currentDetails = Array.isArray(section[sectionKey]) ? section[sectionKey] : [];

          return {
            ...section,

            [sectionKey]: [...currentDetails, newItem],
          };
        }
        return section;
      }),
    );
  };

  const handleDetailChange = (
    sectionKey: SectionKey,
    index: number,
    field: keyof FormVisitorTypes,
    value: any,
  ) => {
    console.log(`Changing [${sectionKey}][${index}].${String(field)} =`, value);
    setSectionsData((prev) =>
      prev.map((section, i) => {
        if (i === activeStep - 1) {
          const originalFields = section[sectionKey];
          if (!Array.isArray(originalFields)) {
            console.error(`Expected array for ${sectionKey}, got:`, originalFields);
            return section; // jangan ubah kalau tidak valid
          }

          const updatedFields = [...originalFields];
          updatedFields[index] = {
            ...updatedFields[index],
            [field]: value,
          };

          return {
            ...section,
            [sectionKey]: updatedFields,
          };
        }
        return section;
      }),
    );
  };

  const handleDeleteDetail = (sectionKey: SectionKey, key: any) => {
    setSectionsData((prev) =>
      prev.map((section, index) => {
        if (index === activeStep - 1) {
          const updated = { ...section[sectionKey] };
          delete updated[key];
          return {
            ...section,
            [sectionKey]: updated,
          };
        }
        return section;
      }),
    );
  };

  const [newSectionName, setNewSectionName] = useState('');
  const [sectionsData, setSectionsData] = useState<SectionPageVisitorType[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const handleAddSection = () => {
    if (newSectionName.trim() !== '') {
      const newSection = {
        sort: sectionsData.length, // ini opsional, bisa diatur ulang nanti
        name: newSectionName, // ✅ WAJIB diset di sini
        status: 1,
        form_visitor: [],
        pra_form_visitor: [],
        signout_form_visitor: [],
      };

      setSectionsData((prev) => [...prev, newSection]);
      setDynamicSteps((prev) => [...prev, newSectionName]);
      setOpenModal(false);
      setNewSectionName('');
    }
  };

  const staticStep = 'Visitor Type Info';
  const [dynamicSteps, setDynamicSteps] = useState<string[]>([]);
  const [draggableSteps, setDraggableSteps] = useState<string[]>([]);

  useEffect(() => {
    setDraggableSteps([...dynamicSteps]);
  }, [dynamicSteps]);
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(draggableSteps);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setDraggableSteps(reordered);

    // 🔁 Reorder sectionsData sesuai urutan baru draggableSteps
    const reorderedSections = reordered.map((sectionName, index) => {
      const matchedSection = sectionsData.find((s) => s.name === sectionName);
      return {
        ...matchedSection!,
        sort: index, // update nilai sort berdasarkan urutan baru
      };
    });

    setSectionsData(reorderedSections);
  };

  const StepContent = (step: number) => {
    if (step === 0) {
      return (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* <Grid size={12}>
            <Alert severity={alertType}>{alertMessage}</Alert>
          </Grid> */}
          <Grid size={6}>
            <CustomFormLabel htmlFor="visitor-type" sx={{ mt: 1 }}>
              Name
            </CustomFormLabel>
            <CustomTextField
              id="name"
              value={formData.name}
              onChange={handleChange}
              error={Boolean(errors.name)}
              helperText={errors.name || ''}
              fullWidth
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid size={6}>
            <CustomFormLabel htmlFor="org" sx={{ mt: 1 }}>
              Document
            </CustomFormLabel>
            <CustomSelect
              id="visitor_type_documents"
              name="visitor_type_documents"
              value={(formData.visitor_type_documents ?? []).map((d) => d.document_id)}
              onChange={handleMultipleChange}
              fullWidth
              required
              multiple
              variant="outlined"
              renderValue={(selected: any) =>
                (selected as string[])
                  .map((id) => document.find((doc) => doc.id === id)?.name ?? id)
                  .join(', ')
              }
            >
              {document?.map((item: any) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>
          <Grid size={6}>
            <CustomFormLabel htmlFor="visitor-type" sx={{ mt: 1 }}>
              Description
            </CustomFormLabel>
            <CustomTextField
              id="description"
              value={formData.description}
              onChange={handleChange}
              error={Boolean(errors.description)}
              helperText={errors.description || ''}
              fullWidth
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid size={6}>
            <CustomFormLabel htmlFor="duration_visit" sx={{ mt: 1 }}>
              Duration Visit
            </CustomFormLabel>
            <CustomTextField
              id="duration_visit"
              value={formData.duration_visit}
              onChange={handleChange}
              error={Boolean(errors.duration_visit)}
              helperText={errors.duration_visit || ''}
              fullWidth
              type="number"
            />
          </Grid>
          <Grid size={6}>
            <CustomFormLabel htmlFor="duration_visit" sx={{ mt: 1 }}>
              Max Duration Visit
            </CustomFormLabel>
            <CustomTextField
              id="max_time_visit"
              value={formData.max_time_visit}
              onChange={handleChange}
              error={Boolean(errors.max_time_visit)}
              helperText={errors.max_time_visit || ''}
              fullWidth
              type="number"
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid size={6}>
            <CustomFormLabel htmlFor="period" sx={{ mt: 1 }}>
              Period
            </CustomFormLabel>
            <CustomTextField
              id="period"
              value={formData.period}
              onChange={handleChange}
              error={Boolean(errors.period)}
              helperText={errors.period || ''}
              fullWidth
              type="number"
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid size={12}>
            <CustomFormLabel htmlFor="grace_time" sx={{ mt: 1 }}>
              Grace Time
            </CustomFormLabel>
            <CustomTextField
              id="grace_time"
              value={formData.grace_time}
              onChange={handleChange}
              error={Boolean(errors.grace_time)}
              helperText={errors.grace_time || ''}
              fullWidth
              type="number"
              inputProps={{ min: 0 }}
            />
          </Grid>
          {/* <br /> */}
          <Grid size={3} mt={1}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Can Parking</FormLabel>
              <RadioGroup
                id="can_parking"
                row
                value={formData.can_parking ? '1' : '0'} // ikuti nilai boolean dari state
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    can_parking: e.target.value === '1', // konversi string ke boolean
                  }));
                }}
              >
                <FormControlLabel value="0" control={<Radio />} label="No" />
                <FormControlLabel value="1" control={<Radio />} label="Yes" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid size={3} mt={1}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Show In Form</FormLabel>
              <RadioGroup
                id="show_in_form"
                row
                defaultValue={0}
                value={formData.show_in_form ? '1' : '0'}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    show_in_form: e.target.value === '0' ? false : true,
                  }));
                }}
              >
                <FormControlLabel value={0} control={<Radio />} label="No" />
                <FormControlLabel value={1} control={<Radio />} label="Yes" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid size={3} mt={1}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Can Access</FormLabel>
              <RadioGroup
                id="captureVisitorId"
                row
                defaultValue={0}
                value={formData.can_access ? '1' : '0'}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    captureVisitorId: e.target.value === '0' ? false : true,
                  }));
                }}
              >
                <FormControlLabel value={0} control={<Radio />} label="No" />
                <FormControlLabel value={1} control={<Radio />} label="Yes" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid size={3} mt={1}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Add To Menu</FormLabel>
              <RadioGroup
                id="add_to_menu"
                row
                defaultValue={0}
                value={formData.add_to_menu ? '1' : '0'}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    add_to_menu: e.target.value === '0' ? false : true,
                  }));
                }}
              >
                <FormControlLabel value={0} control={<Radio />} label="No" />
                <FormControlLabel value={1} control={<Radio />} label="Yes" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid size={3} mt={1}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Need Document</FormLabel>
              <RadioGroup
                id="need_document"
                row
                defaultValue={0}
                value={formData.need_document ? '1' : '0'}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    need_document: e.target.value === '0' ? false : true,
                  }));
                }}
              >
                <FormControlLabel value={0} control={<Radio />} label="No" />
                <FormControlLabel value={1} control={<Radio />} label="Yes" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid size={3} mt={1}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Direct Visit</FormLabel>
              <RadioGroup
                id="direct_visit"
                row
                defaultValue={0}
                value={formData.direct_visit ? '1' : '0'}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    direct_visit: e.target.value === '0' ? false : true,
                  }));
                }}
              >
                <FormControlLabel value={0} control={<Radio />} label="No" />
                <FormControlLabel value={1} control={<Radio />} label="Yes" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid size={3} mt={1}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Can Notification Arrival</FormLabel>
              <RadioGroup
                id="can_notification_arrival"
                row
                defaultValue={0}
                value={formData.can_notification_arrival ? '1' : '0'}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    can_notification_arrival: e.target.value === '0' ? false : true,
                  }));
                }}
              >
                <FormControlLabel value={0} control={<Radio />} label="No" />
                <FormControlLabel value={1} control={<Radio />} label="Yes" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid size={3} mt={1}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Is Primary</FormLabel>
              <RadioGroup
                id="is_primary"
                row
                defaultValue={0}
                value={formData.is_primary ? '1' : '0'}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    is_primary: e.target.value === '0' ? false : true,
                  }));
                }}
              >
                <FormControlLabel value={0} control={<Radio />} label="No" />
                <FormControlLabel value={1} control={<Radio />} label="Yes" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid size={3} mt={1}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Is Enable</FormLabel>
              <RadioGroup
                id="is_enable"
                row
                defaultValue={0}
                value={formData.is_enable ? '1' : '0'}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    is_enable: e.target.value === '0' ? false : true,
                  }));
                }}
              >
                <FormControlLabel value={0} control={<Radio />} label="No" />
                <FormControlLabel value={1} control={<Radio />} label="Yes" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid size={3} mt={1}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Vip</FormLabel>
              <RadioGroup
                id="vip"
                row
                defaultValue={0}
                value={formData.vip ? '1' : '0'}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    vip: e.target.value === '0' ? false : true,
                  }));
                }}
              >
                <FormControlLabel value={0} control={<Radio />} label="No" />
                <FormControlLabel value={1} control={<Radio />} label="Yes" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid size={3} mt={1}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Simple Visitor</FormLabel>
              <RadioGroup
                id="simple_visitor"
                row
                defaultValue={0}
                value={formData.simple_visitor ? '1' : '0'}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    simple_visitor: e.target.value === '0' ? false : true,
                  }));
                }}
              >
                <FormControlLabel value={0} control={<Radio />} label="No" />
                <FormControlLabel value={1} control={<Radio />} label="Yes" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid size={3} mt={1}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Simple Period</FormLabel>
              <RadioGroup
                id="simple_period"
                row
                defaultValue={0}
                value={formData.simple_period ? '1' : '0'}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    simple_period: e.target.value === '0' ? false : true,
                  }));
                }}
              >
                <FormControlLabel value={0} control={<Radio />} label="No" />
                <FormControlLabel value={1} control={<Radio />} label="Yes" />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      );
    }

    const currentSection = sectionsData[step - 1]; // dikurangi 1 karena step 0 khusus
    if (!currentSection) return null;

    return (
      <div>
        {/* <Typography variant="h6" gutterBottom>
          Section: {currentSection.sectionName}
        </Typography> */}
        {/* Form Visitor */}
        <Grid size={12}>
          <Box mt={3}>
            <Typography variant="subtitle1" fontWeight={600}>
              Sign In Visitors Details
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Field Name</TableCell>
                    <TableCell>Display</TableCell>
                    <TableCell align="center">Is Enable</TableCell>
                    <TableCell align="center">Field Type</TableCell>
                    <TableCell align="center">Is Primary</TableCell>
                    <TableCell align="center">Mandatory</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {renderDetailRows(
                    currentSection.form_visitor || [],
                    (index, field, value) =>
                      handleDetailChange('form_visitor', index, field, value),
                    (index) => handleDeleteDetail('form_visitor', index),
                    true,
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <MuiButton size="small" onClick={() => handleAddDetail('form_visitor')}>
              Add New
            </MuiButton>
          </Box>
        </Grid>
        {/* Pra Regist */}
        <Grid size={12}>
          <Box mt={3}>
            <Typography variant="subtitle1" fontWeight={600}>
              Pra Regist
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Field Name</TableCell>
                    <TableCell>Display</TableCell>
                    <TableCell align="center">Is Enable</TableCell>
                    <TableCell align="center">Field Type</TableCell>
                    <TableCell align="center">Is Primary</TableCell>
                    <TableCell align="center">Mandatory</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {renderDetailRows(
                    currentSection.pra_form_visitor || [],
                    (key, field, value) =>
                      handleDetailChange('pra_form_visitor' as const, key, field, value),
                    (key) => handleDeleteDetail('pra_form_visitor' as const, key),
                    true,
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <MuiButton size="small" onClick={() => handleAddDetail('pra_form_visitor' as const)}>
              Add New
            </MuiButton>
          </Box>
        </Grid>
        {/* Sign Out Visitors Details */}
        <Grid size={12}>
          <Box mt={3}>
            <Typography variant="subtitle1" fontWeight={600}>
              Sign Out Visitors Details
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Field Name</TableCell>
                    <TableCell>Display</TableCell>
                    <TableCell align="center">Is Enable</TableCell>
                    <TableCell align="center">Field Type</TableCell>
                    <TableCell align="center">Is Primary</TableCell>
                    <TableCell align="center">Mandatory</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {renderDetailRows(
                    currentSection.signout_form_visitor || [],
                    (key, field, value) =>
                      handleDetailChange('signout_form_visitor', key, field, value),
                    (key) => handleDeleteDetail('signout_form_visitor', key),
                    true,
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <MuiButton size="small" onClick={() => handleAddDetail('signout_form_visitor')}>
              Add New
            </MuiButton>
          </Box>
        </Grid>
      </div>
    );
  };

  const allSteps = ['Visitor Type Info', ...dynamicSteps];
  const isFinalStep = activeStep === allSteps.length - 1;
  return (
    <>
      <form onSubmit={handleOnSubmit}>
        <Grid size={12}>
          <Alert severity={alertType}>{alertMessage}</Alert>
        </Grid>
        <Box width="100%">
          {/* <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="steps" direction="horizontal">
              {(provided: any) => (
                <Stepper
                  activeStep={activeStep}
                  alternativeLabel
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <Step key={staticStep}>
                    <StepLabel>{staticStep}</StepLabel>
                  </Step>

                  {draggableSteps.map((label, index) => (
                    <Draggable key={label} draggableId={label} index={index}>
                      {(provided: any) => (
                        <Step
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <StepLabel>{label}</StepLabel>
                        </Step>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </Stepper>
              )}
            </Droppable>
          </DragDropContext> */}

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="stepper" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '16px 0',
                  }}
                >
                  <Stepper
                    activeStep={activeStep}
                    alternativeLabel
                    sx={{
                      width: '100%',
                      '& .MuiStepLabel-label': {
                        fontSize: '0.875rem',
                      },
                      '& .MuiStepIcon-root.Mui-active': {
                        color: 'primary.main',
                      },
                      '& .MuiStepIcon-root.Mui-completed': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {/* Static Step Pertama */}
                    <Step key="Visitor Type Info">
                      <StepLabel
                        sx={{
                          fontWeight: activeStep === 0 ? 'bold' : 'normal',
                          color: activeStep === 0 ? 'primary.main' : 'text.secondary',
                        }}
                      >
                        Visitor Type Info
                      </StepLabel>
                    </Step>

                    {/* Dynamic Draggable Steps */}
                    {draggableSteps.map((label, index) => (
                      <Draggable key={label} draggableId={label} index={index}>
                        {(provided, snapshot) => (
                          <Step
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              mx: 1,
                            }}
                          >
                            <Box
                              sx={{
                                backgroundColor: snapshot.isDragging ? '#1976d2' : '#e3f2fd',
                                color: snapshot.isDragging ? '#fff' : '#000',
                                width: 30,
                                height: 30,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 0.5,
                                fontWeight: 'bold',
                                border: snapshot.isDragging
                                  ? '2px solid #1976d2'
                                  : '1px solid #90caf9',
                                transition: 'all 0.2s ease',
                                marginRight: -2,
                              }}
                            >
                              {index + 2}
                            </Box>
                            <StepLabel
                              sx={{
                                fontSize: '0.875rem',
                                fontWeight: activeStep === index + 1 ? 'bold' : 'normal',
                                color: activeStep === index + 1 ? 'primary.main' : 'text.secondary',
                                textAlign: 'center',
                                px: 1,
                              }}
                            >
                              {label}
                            </StepLabel>
                          </Step>
                        )}
                      </Draggable>
                    ))}
                  </Stepper>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <Box mt={1}>
            <Button
              onClick={() => setOpenModal(true)}
              startIcon={<AddCircleOutlineIcon />}
            ></Button>
          </Box>

          <Box mt={3}>{StepContent(activeStep)}</Box>

          <Box mt={3} display="flex" justifyContent="space-between">
            {/* Tombol Back */}
            <Button disabled={activeStep === 0} onClick={() => setActiveStep((prev) => prev - 1)}>
              Back
            </Button>

            {/* Tombol Next / Submit */}
            {isFinalStep ? (
              <Button
                color="success"
                variant="contained"
                onClick={handleOnSubmit}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
            ) : (
              <Button variant="contained" onClick={() => setActiveStep((prev) => prev + 1)}>
                Next
              </Button>
            )}
          </Box>
        </Box>
      </form>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <CircularProgress color="inherit" />
        </Box>
      )}

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Section Page Visitor Type</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Section Name"
            type="text"
            fullWidth
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button onClick={handleAddSection} color="success">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FormVisitorType;
