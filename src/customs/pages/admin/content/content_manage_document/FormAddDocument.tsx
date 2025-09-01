import React, { useState, useRef } from 'react';
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
} from '@mui/material';
import { Box } from '@mui/system';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { IconTrash } from '@tabler/icons-react';

import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import axios from 'axios';
import { createDocument, updateDocument } from 'src/customs/api/admin';
import { useSession } from 'src/customs/contexts/SessionContext';
import { CreateDocumentRequest } from 'src/customs/api/models/Document';

import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface FormAddDocumentProps {
  formData: CreateDocumentRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateDocumentRequest>>;
  edittingId: string;
  onSuccess?: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const resetFileState = () => {
    setFile(null);
    setPreview(null);
    setFormData((prev: any) => ({ ...prev, file: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const f = event.target.files?.[0];
    if (!f) {
      // user cancel or reset
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

    if (formData.document_type === 1) {
      if (!isPDF && !isDocx) {
        alert('Only PDF or DOCX are allowed for Document type.');
        resetFileState();
        return;
      }
    } else {
      // type 0 atau 2 → harus image
      if (!isImage) {
        alert('Only image files are allowed for this document type.');
        resetFileState();
        return;
      }
    }

    setFile(f);
    setFormData((prev: any) => ({ ...prev, file: f }));

    if (isImage) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const API_BASE = 'http://192.168.1.116:8000';

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

      const data = {
        name: formData.name,
        document_text: formData.document_text,
        document_type: formData.document_type,
        can_signed: formData.can_signed ?? false,
        can_upload: formData.can_upload ?? false,
        can_declined: formData.can_declined ?? false,
      };

      let docId = edittingId;
      if (docId) {
        await updateDocument(docId, data, token);
      } else {
        await createDocument(data, token);
      }

      if (formData.document_type === 1 && file) {
        await uploadDocumentFile({
          baseUrl: API_BASE,
          docId,
          file,
          token,
          onProgress: (p) => {
            // opsional: tampilkan progress ke UI kalau kamu mau
            console.log('Upload:', p, '%');
          },
        });
      }

      localStorage.removeItem('unsavedDocumentFormAdd');
      setAlertType('success');
      setAlertMessage('Document successfully created!');
      setTimeout(() => {
        onSuccess?.();
      }, 900);
    } catch (err: any) {
      if (err?.errors) setErrors(err.errors);
      setAlertType('error');
      setAlertMessage('Something went wrong. Please try again later.');
      setTimeout(() => {
        setAlertType('info');
        setAlertMessage('Complete the following data properly and correctly');
      }, 3000);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 600);
    }
  };

  const acceptByType =
    formData.document_type === 1
      ? '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'image/png,image/jpeg,image/jpg,image/bmp,image/webp';

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Grid2 container spacing={2} sx={{ mb: 2 }}>
          <Grid2 size={12}>
            <Alert severity={alertType}>{alertMessage}</Alert>
          </Grid2>

          <Grid2 size={{ xs: 12, lg: 12 }}>
            <CustomFormLabel htmlFor="name" sx={{ mt: 0 }}>
              Document Name
            </CustomFormLabel>
            <CustomTextField
              id="name"
              value={formData.name}
              onChange={handleChange}
              error={Boolean(errors.name)}
              helperText={errors.name ?? ''}
              fullWidth
              required
              disabled={loading}
            />
          </Grid2>

          <Grid2 size={{ xs: 6, lg: 6 }}>
            <FormControl component="fieldset" disabled={loading}>
              <CustomFormLabel sx={{ mt: 0 }}>Document Type</CustomFormLabel>
              <RadioGroup
                id="document_type"
                row
                value={formData.document_type}
                onChange={(e) => {
                  const nextType = Number(e.target.value);
                  // Reset konten saat ganti tipe
                  setFormData((prev) => ({
                    ...prev,
                    document_type: nextType,
                    document_text: '',
                    file: '',
                  }));
                  // Reset file & preview
                  resetFileState();
                }}
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
                  formData.can_declined === true
                    ? 'true'
                    : formData.can_declined === false
                    ? 'false'
                    : '' // ⬅️ kosong → tidak ada radio terpilih
                }
                onChange={(e) =>
                  setFormData((prev) => ({
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
                formData.can_signed === true ? 'true' : formData.can_signed === false ? 'false' : '' // ⬅️ kosong → tidak ada radio terpilih
              }
              onChange={(e) =>
                setFormData((prev) => ({
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
                formData.can_upload === true ? 'true' : formData.can_upload === false ? 'false' : '' // ⬅️ kosong → tidak ada radio terpilih
              }
              onChange={(e) =>
                setFormData((prev) => ({
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
            <CustomFormLabel sx={{ mt: 0 }}>Document Content</CustomFormLabel>
            {/* Tipe 1 → upload file (PDF/DOCX) */}
            {formData.document_type === 1 && (
              <Grid2 container spacing={2} sx={{ mt: 1 }}>
                <Grid2 size={{ xs: 12, lg: 12 }}>
                  <Box>
                    {formData.can_signed && (
                      <Box mb={2}>
                        <CKEditor
                          editor={ClassicEditor}
                          data={formData.document_text || ''}
                          disabled={loading}
                          onChange={(_, editor) => {
                            const data = editor.getData();
                            setFormData((prev) => ({ ...prev, document_text: data }));
                          }}
                        />
                      </Box>
                    )}
                    {formData.can_upload && (
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
                          Supports: PDF
                        </Typography>

                        {(preview || file) && (
                          <Box
                            mt={2}
                            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
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
                    )}
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

                  {/* {!preview && file && (
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      📄 {file.name}
                    </Typography>
                  )} */}
                </Grid2>
              </Grid2>
            )}
          </Grid2>

          <Button
            sx={{ mt: 0 }}
            color="primary"
            variant="contained"
            type="submit"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} /> : undefined}
          >
            {loading ? 'Submitting…' : 'Submit'}
          </Button>
        </Grid2>
      </form>

      {/* Loading overlay */}
      <Portal>
        <Backdrop
          open={loading}
          sx={{
            color: '#fff',
            zIndex: (t) => (t.zIndex.snackbar ?? 1400) - 1, // di atas modal, di bawah snackbar
          }}
        >
          <CircularProgress />
        </Backdrop>
      </Portal>
    </>
  );
};

export default FormAddDocument;

async function uploadDocumentFile({
  baseUrl,
  docId,
  file,
  token,
  onProgress,
}: {
  baseUrl: string; // "http://192.168.1.116:8000"
  docId: string; // UUID dokumen
  file: File; // file yang dipilih user
  token: string; // bearer
  onProgress?: (pct: number) => void; // optional utk UI progress
}) {
  const url = `${baseUrl}/api/document/upload/${docId}`;

  const form = new FormData();
  form.append('file', file); // field name "file" - sesuaikan jika backend pakai nama lain

  const res = await axios.post(url, form, {
    headers: {
      Authorization: `Bearer ${token}`,
      // ❌ Jangan set Content-Type manual; biarkan axios set boundary otomatis
    },
    onUploadProgress: (evt) => {
      if (!onProgress || !evt.total) return;
      const pct = Math.round((evt.loaded * 100) / evt.total);
      onProgress(pct);
    },
  });

  return res.data;
}
