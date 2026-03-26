import React, { useState, useRef, useEffect } from 'react';
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
  Portal,
  Backdrop,
  TextField,
} from '@mui/material';
import { Box } from '@mui/system';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { IconTrash } from '@tabler/icons-react';

import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import axios from 'axios';
import { createDocument, updateDocument } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';
import { CreateDocumentRequest } from 'src/customs/api/models/Admin/Document';

import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import axiosInstance from 'src/customs/api/interceptor';
import { showSwal } from 'src/customs/components/alerts/alerts';
import MemoEditor from 'src/customs/components/CKEditor/MemoEditor';

interface FormAddDocumentProps {
  // formData: CreateDocumentRequest;
  initialData: CreateDocumentRequest;
  // setFormData: React.Dispatch<React.SetStateAction<CreateDocumentRequest>>;
  edittingId: string;
  onSuccess?: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const FormAddDocument: React.FC<FormAddDocumentProps> = ({
  // formData,
  initialData,
  // setFormData,
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
  const [localForm, setLocalForm] = useState(initialData);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setLocalForm((prev) => ({
      ...prev,
      [id]: value,
    }));
  }, []);

  const resetFileState = () => {
    setFile(null);
    setPreview(null);
    setLocalForm((prev: any) => ({ ...prev, file: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const f = event.target.files?.[0];
    if (!f) {
      resetFileState();
      return;
    }

    if (f.size > MAX_FILE_SIZE) {
      alert('File is too large. Max size is 5MB.');
      resetFileState();
      return;
    }

    // Tipe diterima tergantung document_type:
    // 0 (ID Card) & 2 (Face): gambar
    // 1 (Document): PDF/DOCX
    const isImage = f.type.startsWith('image/');
    const isPDF = f.type === 'application/pdf';
    const isDocx =
      f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      /\.docx$/i.test(f.name);

    if (initialData.document_type === 1) {
      if (!isPDF && !isDocx) {
        alert('Only PDF or DOCX are allowed for Document type.');
        resetFileState();
        return;
      }
    } else {
      if (!isImage) {
        alert('Only image files are allowed for this document type.');
        resetFileState();
        return;
      }
    }

    setFile(f);
    setLocalForm((prev: any) => ({ ...prev, file: f }));

    if (isImage) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const API_BASE = axiosInstance.defaults.baseURL || '';
  useEffect(() => {
    setLocalForm(initialData);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (!token) {
        setAlertType('error');
        setAlertMessage('Something went wrong. Please try again later.');
        return;
      }

      const payload = {
        name: localForm.name,
        document_text: localForm.document_text,
        document_type: localForm.document_type,
        can_signed: localForm.can_signed ?? false,
        can_upload: localForm.can_upload ?? false,
        can_declined: localForm.can_declined ?? false,
        remarks: '',
      };
      console.log('payload : ', JSON.stringify(payload, null, 2));

      let docId: string;

      if (edittingId) {
        // Edit
        docId = edittingId;
        await updateDocument(docId, payload, token);
      } else {
        // Create
        const res = await createDocument(payload, token);
        console.log('res create : ', res);

        if (!res?.collection?.id) {
          throw new Error('Document ID not returned from API');
        }

        docId = res?.collection?.id;
        console.log('Document ID:', docId);
      }

      if (localForm.document_type === 1 && file) {
        await uploadDocumentFile({
          baseUrl: API_BASE,
          docId,
          file,
          token,
          // onProgress: (p) => console.log('Upload:', p, '%'),
        });
      }
      showSwal(
        'success',
        edittingId ? 'Document updated successfully!' : 'Document created successfully!',
      );
      setTimeout(() => {
        onSuccess?.();
      }, 600);
    } catch (err: any) {
      if (err?.errors) setErrors(err.errors);
      showSwal('error', err?.message || 'Failed to create document.');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 600);
    }
  };

  const handleChangeDocumentType = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextType = Number(e.target.value);

    setLocalForm((prev) => ({
      ...prev,
      document_type: nextType,
      document_text: '',
      file: '',
    }));

    resetFileState();
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Grid2 container spacing={2} sx={{ mb: 2 }}>
          <Grid2 size={{ xs: 12, lg: 12 }}>
            <CustomFormLabel htmlFor="name" sx={{ mt: 0 }} required>
              Document Name
            </CustomFormLabel>
            <TextField
              id="name"
              value={localForm.name}
              onChange={handleChange}
              error={Boolean(errors.name)}
              helperText={errors.name ?? ''}
              fullWidth
              disabled={loading}
            />
          </Grid2>

          <Grid2 size={{ xs: 6, lg: 6 }}>
            <FormControl component="fieldset" disabled={loading}>
              <CustomFormLabel sx={{ mt: 0 }} required>
                Document Type
              </CustomFormLabel>
              <RadioGroup
                id="document_type"
                row
                value={localForm.document_type}
                onChange={handleChangeDocumentType}
              >
                <FormControlLabel value={0} control={<Radio />} label="ID Card" />
                <FormControlLabel value={1} control={<Radio />} label="Document" />
                <FormControlLabel value={2} control={<Radio />} label="Face" />
              </RadioGroup>
            </FormControl>
          </Grid2>

          <Grid2 size={{ xs: 6, lg: 6 }}>
            <FormControl component="fieldset" disabled={loading}>
              <CustomFormLabel sx={{ mt: 0 }}>Allow Visitors to Decline</CustomFormLabel>
              <RadioGroup
                name="can_declined"
                row
                value={
                  localForm.can_declined === true
                    ? 'true'
                    : localForm.can_declined === false
                      ? 'false'
                      : ''
                }
                onChange={(e) =>
                  setLocalForm((prev) => ({
                    ...prev,
                    can_declined: e.target.value === 'true',
                  }))
                }
              >
                <FormControlLabel value="true" control={<Radio />} label="Yes" />
                <FormControlLabel value="false" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Grid2>

          <Grid2 size={{ xs: 6, lg: 3 }}>
            <CustomFormLabel htmlFor="canSigned" sx={{ mt: 0 }}>
              Can Signed
            </CustomFormLabel>
            <RadioGroup
              name="can_signed"
              row
              value={
                localForm.can_signed === true
                  ? 'true'
                  : localForm.can_signed === false
                    ? 'false'
                    : ''
              }
              onChange={(e) =>
                setLocalForm((prev) => ({
                  ...prev,
                  can_signed: e.target.value === 'true',
                }))
              }
            >
              <FormControlLabel value="true" control={<Radio />} label="Yes" />
              <FormControlLabel value="false" control={<Radio />} label="No" />
            </RadioGroup>
          </Grid2>

          <Grid2 size={{ xs: 6, lg: 3 }}>
            <CustomFormLabel htmlFor="canSigned" sx={{ mt: 0 }}>
              Can Upload
            </CustomFormLabel>
            <RadioGroup
              name="can_upload"
              row
              value={
                localForm.can_upload === true
                  ? 'true'
                  : localForm.can_upload === false
                    ? 'false'
                    : ''
              }
              onChange={(e) =>
                setLocalForm((prev) => ({
                  ...prev,
                  can_upload: e.target.value === 'true',
                }))
              }
            >
              <FormControlLabel value="true" control={<Radio />} label="Yes" />
              <FormControlLabel value="false" control={<Radio />} label="No" />
            </RadioGroup>
          </Grid2>

          <Grid2 size={12}>
            {localForm.document_type === 1 && (
              <Box>
                <CustomFormLabel sx={{ mt: 0 }}>Document Content</CustomFormLabel>
                <Grid2 container spacing={2} sx={{ mt: 1 }}>
                  <Grid2 size={{ xs: 12, lg: 12 }}>
                    <Box>
                      {/* {localForm.can_signed && ( */}
                      <Box mb={2}>
                        {/* <CKEditor
                          editor={ClassicEditor}
                          data={formData.document_text || ''}
                          disabled={loading}
                          onReady={(editor) => {
                            const editableElement = editor.ui.view.editable?.element;
                            if (editableElement) {
                              editableElement.style.height = '300px';
                            }
                          }}
                          onChange={(_, editor) => {
                            const data = editor.getData();
                            setFormData((prev) => ({ ...prev, document_text: data }));
                          }}
                        /> */}
                        <MemoEditor
                          value={localForm.document_text}
                          disabled={loading}
                          onChange={(data: string) =>
                            setLocalForm((prev) => ({
                              ...prev,
                              document_text: data,
                            }))
                          }
                        />
                      </Box>
                      {/* )} */}
                      {/* {formData.can_upload && ( */}
                      <Box
                        sx={{
                          border: '2px dashed #90caf9',
                          borderRadius: 2,
                          p: 4,
                          textAlign: 'center',
                          bgcolor: '#f5faff',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          opacity: loading ? 0.6 : 1,
                          pointerEvents: loading ? 'none' : 'auto',
                        }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <CloudUploadIcon sx={{ fontSize: 48, color: '#42a5f5' }} />
                        <Typography variant="subtitle1" sx={{ mt: 1 }}>
                          Upload File
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Supports: PDF, Up to 100 KB
                        </Typography>

                        {(preview || file) && (
                          <Box
                            mt={2}
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                            }}
                          >
                            {preview ? (
                              <>
                                <img
                                  src={preview}
                                  alt="preview"
                                  style={{
                                    width: 200,
                                    height: 200,
                                    borderRadius: 12,
                                    objectFit: 'cover',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                                  }}
                                />
                              </>
                            ) : (
                              <Typography variant="caption" noWrap>
                                📄 {file?.name}
                              </Typography>
                            )}

                            <Button
                              color="error"
                              size="small"
                              variant="outlined"
                              sx={{ mt: 2, minWidth: 120 }}
                              onClick={resetFileState}
                              startIcon={<IconTrash size={16} />}
                              disabled={loading}
                            >
                              Remove
                            </Button>
                          </Box>
                        )}

                        <input
                          ref={fileInputRef}
                          type="file"
                          // accept={acceptByType}
                          accept="*"
                          hidden
                          onChange={handleFileChange}
                          disabled={loading}
                        />
                      </Box>
                      {/* )} */}
                    </Box>
                  </Grid2>

                  <Grid2 size={{ xs: 12, lg: 6 }}>
                    {/* Duplikat preview (opsional) */}
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
                  </Grid2>
                </Grid2>
              </Box>
            )}
            <Box display="flex" justifyContent="flex-end" mt={0}>
              <Button
                color="primary"
                variant="contained"
                type="submit"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} /> : undefined}
              >
                Submit
              </Button>
            </Box>
          </Grid2>
        </Grid2>
      </form>

      {/* Loading overlay */}
      <Portal>
        <Backdrop
          open={loading}
          sx={{
            color: '#fff',
            zIndex: (t) => (t.zIndex.snackbar ?? 1400) - 1,
          }}
        >
          <CircularProgress />
        </Backdrop>
      </Portal>
    </>
  );
};

export default React.memo(FormAddDocument);

async function uploadDocumentFile({
  baseUrl,
  docId,
  file,
  token,
  onProgress,
}: {
  baseUrl: string;
  docId: string;
  file: File;
  token: string;
  onProgress?: (pct: number) => void;
}) {
  const url = `${baseUrl}/api/document/upload/${docId}`;

  const form = new FormData();
  form.append('file', file);

  const res = await axios.post(url, form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    // onUploadProgress: (evt) => {
    //   if (!onProgress || !evt.total) return;
    //   const pct = Math.round((evt.loaded * 100) / evt.total);
    //   onProgress(pct);
    // },
  });

  return res.data;
}
