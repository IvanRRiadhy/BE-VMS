import {
  Button,
  Grid2,
  Alert,
  Typography,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { createDocument, updateDocument } from 'src/customs/api/admin';
// import { CreateDepartmentRequest, CreateDepartmentSchema } from 'src/customs/api/models/Department';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  CreateDocumentRequest,
  CreateDocumentRequestSchema,
} from 'src/customs/api/models/Document';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface FormAddDocumentProps {
  formData: CreateDocumentRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateDocumentRequest>>;
  edittingId: string;
  onSuccess?: () => void;
}

const FormAddDocument: React.FC<FormAddDocumentProps> = ({
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
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('Submitting form with data:', formData);
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
      const data = {
        name: formData.name,
        document_text: formData.document_text,
        document_type: formData.document_type,
        file: formData.file,
        can_signed: formData.can_signed,
        can_upload: formData.can_upload,
        can_declined: formData.can_declined,
      };
      console.log(edittingId);
      if (edittingId !== '' && edittingId !== undefined) {
        await updateDocument(edittingId, data, token);
      } else {
        await createDocument(data, token);
      }

      localStorage.removeItem('unsavedDocumentFormAdd');
      setAlertType('success');
      setAlertMessage('Document successfully created!');
      setTimeout(() => {
        onSuccess?.();
      }, 900);
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
      setLoading(false);
    }
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('Selected file:', file);
    if (!file) return;

    const isPDF = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');
    const maxSize = 1024 * 1024 * 5; // 5MB limit

    if (file.size > maxSize) {
      alert('File is too large. Max size is 5MB.');
      return;
    }

    if (formData.document_type === 1 && !isPDF) {
      alert('Only PDF files are allowed for this document type.');
      return;
    }

    if ((formData.document_type === 0 || formData.document_type === 2) && !isImage) {
      alert('Only image files are allowed for this document type.');
      return;
    }

    setFile(file);
    setFormData((prev: any) => ({ ...prev, file }));

    if (isImage) {
      const previewURL = URL.createObjectURL(file);
      setPreview(previewURL);
    } else {
      setPreview(null); // No image preview for PDFs
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Grid2 container spacing={2} sx={{ mb: 2 }}>
          <Grid2 size={12}>
            <Alert severity={alertType}>{alertMessage}</Alert>
          </Grid2>
          <Grid2 size={6}>
            <CustomFormLabel htmlFor="name">Department Name</CustomFormLabel>
            <CustomTextField
              id="name"
              value={formData.name}
              onChange={handleChange}
              error={Boolean(errors.name)}
              helperText={errors.name || ''}
              fullWidth
              required
            />
          </Grid2>
          <Grid2 size={6}>
            <CustomFormLabel htmlFor="canSigned">
              Signed Document Validity Period (Days) :
            </CustomFormLabel>
            <CustomTextField
              id="can_signed"
              type="number"
              value={formData.can_signed}
              onChange={handleChange}
              error={Boolean(errors.can_signed)}
              helperText={errors.can_signed || ''}
              fullWidth
              required
              inputProps={{ min: 0 }}
            />
          </Grid2>

          <Grid2 size={6}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Document Type</FormLabel>
              <RadioGroup
                id="document_type"
                row
                value={formData.document_type}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    document_type: Number(e.target.value),
                    document_text: '',
                    file: '',
                  }));
                  handleFileChange({
                    target: { files: null },
                  } as React.ChangeEvent<HTMLInputElement>);
                }}
              >
                <FormControlLabel value={0} control={<Radio />} label="ID Card" />
                <FormControlLabel value={1} control={<Radio />} label="Document" />
                <FormControlLabel value={2} control={<Radio />} label="Face" />
              </RadioGroup>
            </FormControl>
          </Grid2>
          <Grid2 size={6}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Allow Visitors to Decline</FormLabel>
              <RadioGroup
                id="can_declined"
                row
                defaultValue="no"
                value={formData.can_declined}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, can_declined: e.target.value === '0' }))
                }
              >
                <FormControlLabel value={0} control={<Radio />} label="Yes" />
                <FormControlLabel value={1} control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Grid2>
          <Grid2 size={12}>
            <CustomFormLabel>Document Content</CustomFormLabel>
            <Grid2 container spacing={2} sx={{ mb: 2 }}>
              <Grid2 size={6}>
                <CustomFormLabel>Upload File</CustomFormLabel>
                <input
                  type="file"
                  accept={
                    formData.document_type === 1
                      ? 'application/pdf'
                      : 'image/png,image/jpeg,image/jpg,image/bmp,image/webp'
                  }
                  onChange={handleFileChange}
                />
              </Grid2>

              <Grid2 size={6}>
                {preview && (
                  <Box
                    component="img"
                    src={preview}
                    alt="Preview"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: 200,
                      border: '1px solid #ccc',
                      borderRadius: 1,
                    }}
                  />
                )}

                {!preview && file && formData.document_type === 1 && (
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    📄 {file.name}
                  </Typography>
                )}
              </Grid2>
            </Grid2>
            {formData.document_type === 1 && (
              <CKEditor
                editor={ClassicEditor}
                data={formData.document_text || ''}
                onChange={(_, editor) => {
                  const data = editor.getData();
                  setFormData((prev) => ({ ...prev, document_text: data }));
                }}
              />
            )}
          </Grid2>
          <Button
            sx={{ mt: 2 }}
            color="primary"
            variant="contained"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </Grid2>
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
    </>
  );
};

export default FormAddDocument;
