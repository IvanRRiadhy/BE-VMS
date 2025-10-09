import React, { FormEvent, useEffect, useState } from 'react';
import {
  Grid2 as Grid,
  Box,
  Card,
  Stack,
  Link,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  TextField,
  MenuItem,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router';
import PageContainer from 'src/components/container/PageContainer';
import Logo from 'src/customs/components/logo/Logo';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { ArrowBack, ArrowForward, CameraAlt } from '@mui/icons-material'; // icon kamera
import Avatar from '@mui/material/Avatar';
import CameraUpload from 'src/customs/components/camera/CameraUpload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import { IconX } from '@tabler/icons-react';
const GuestNda = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code'); // ✅ ambil kode undangan

  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0].name); // simpan nama file
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
  };
  return (
    <>
      <PageContainer title="Photo Identity" description="this is Login page">
        <Box
          sx={{
            position: 'relative',
            '&:before': {
              content: '""',
              background: 'radial-gradient(#d2f1df, #d3d7fa, #bad8f4)',
              backgroundSize: '400% 400%',
              animation: 'gradient 15s ease infinite',
              position: 'absolute',
              height: '100%',
              width: '100%',
              opacity: '0.3',
            },
          }}
        >
          <Grid container spacing={0} justifyContent="center" sx={{ height: '100vh' }}>
            <Grid
              display="flex"
              justifyContent="center"
              alignItems="center"
              size={{
                xs: 11,
                sm: 8,
                lg: 5,
              }}
            >
              <Card elevation={9} sx={{ p: 4, zIndex: 1, width: '100%' }}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection={'column'}
                >
                  <Logo />

                  <Avatar
                    alt="Selfie Preview"
                    src="/images/selfie-placeholder.png"
                    variant="square" // 👈 biar dasar kotak
                    sx={{ width: 300, height: 160, borderRadius: 2, marginTop: 2 }} // 👈 lebar 200, tinggi 130
                  />
                  <Typography variant="h5" mb={1} mt={4}>
                    Sign NDA
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    textAlign="center"
                    px={4}
                    sx={{ color: '#6e6e6e' }}
                  >
                    Silakan unggah dokumen NDA yang sudah ditandatangani.
                  </Typography>
                </Box>

                <form>
                  <Stack spacing={2} alignItems="center" marginTop={4}>
                    {/* Dummy image / avatar */}

                    {/* Label dengan icon */}
                    <Box display="flex" alignItems="center" gap={3} sx={{ mt: 1 }}>
                      {/* <Box display={'flex'} gap={1} alignItems="center"> */}
                      {/* <CameraAlt fontSize="small" color="action" sx={{ color: '#5c87ff' }} />
                        <CustomFormLabel
                          htmlFor="selfie"
                          sx={{
                            cursor: 'pointer',
                            m: 0,
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '15px',
                            color: '#5c87ff',
                          }}
                        >
                          Ambil Foto
                        </CustomFormLabel> */}
                      {/* <CameraUpload value={''} onChange={() => {}} /> */}
                      {/* </Box>
                      <Box display={'flex'} gap={1} alignItems="center">
                        <CameraAlt fontSize="small" color="action" sx={{ color: '#5c87ff' }} />
                        <CustomFormLabel
                          htmlFor="selfie"
                          sx={{
                            cursor: 'pointer',
                            m: 0,
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '15px',
                            color: '#5c87ff',
                          }}
                        >
                          Dari Galeri
                        </CustomFormLabel>
                      </Box> */}

                      <Box
                        display={'flex'}
                        alignItems={'center'}
                        justifyContent={'center'}
                        gap={1}
                        width={'380px'}
                      >
                        {/* <TextField
                          select
                          size="small"
                          // value={uploadMethods[key] || 'file'}
                          // onChange={(e) => handleUploadMethodChange(key, e.target.value)}
                          fullWidth
                          sx={{ width: '200px' }}
                        >
                          <MenuItem value="file">Choose File</MenuItem>
                          <MenuItem value="camera">Take Photo</MenuItem>
                        </TextField> */}

                        {/* {(uploadMethods[key] || 'file') === 'camera' ? ( */}
                        {/* <CameraUpload value={''} onChange={() => {}} /> */}
                        {/* ) : ( */}
                        <Box>
                          <label>
                            <Box
                              sx={{
                                border: '2px dashed #90caf9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2,
                                borderRadius: 2,
                                p: 0.5,
                                textAlign: 'center',
                                backgroundColor: '#f5faff',
                                cursor: 'pointer',
                                width: '100%',
                              }}
                            >
                              <CloudUploadIcon sx={{ fontSize: 20, color: '#42a5f5' }} />
                              <Typography variant="subtitle1">Upload File</Typography>
                            </Box>
                          </label>

                          <input
                            // id={key}
                            type="file"
                            accept="*"
                            hidden
                            // onChange={(e) =>
                            //   handleFileChangeForField(
                            //     e as React.ChangeEvent<HTMLInputElement>,
                            //     (url) => onChange(index, 'answer_file', url),
                            //     key,
                            //   )
                            // }
                          />

                          {/* INFO + REMOVE */}
                          {uploadedFile && (
                            <Box
                              sx={{ paddingTop: '5px' }}
                              display="flex"
                              alignItems="center"
                              gap={1}
                            >
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {uploadedFile}
                              </Typography>

                              <IconButton
                                size="small"
                                color="error"
                                // disabled={!!removing[key]}
                                // onClick={() =>
                                //   handleRemoveFileForField(
                                //     (field as any).answer_file,
                                //     (url) => onChange(index, 'answer_file', url),
                                //     key,
                                //   )
                                // }
                              >
                                <IconX size={16} />
                              </IconButton>
                            </Box>
                          )}
                        </Box>
                        {/* )} */}
                      </Box>
                    </Box>
                  </Stack>
                  <Box marginTop={4} display="flex" justifyContent="space-between" gap={2}>
                    <Button
                      color="primary"
                      variant="outlined"
                      size="medium"
                      fullWidth
                      component={RouterLink}
                      to="/portal/photo-identity?code=${code}"
                      startIcon={<ArrowBack />}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      color="primary"
                      variant="contained"
                      size="medium"
                      fullWidth
                      component={RouterLink}
                      to={`/portal/term-of-service?code=${code}`}
                      endIcon={<ArrowForward />}
                    >
                      Selanjutnya
                    </Button>
                  </Box>
                </form>

                {/* {error && (
                  <Typography
                    sx={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}
                    variant="subtitle1"
                    color="error"
                  >
                    Username or Password is invalid
                  </Typography>
                )} */}
              </Card>
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
    </>
  );
};

export default GuestNda;
