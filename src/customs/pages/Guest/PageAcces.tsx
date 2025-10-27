import React, { useState } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import {
  Grid2 as Grid,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  IconButton,
  Avatar,
  DialogActions,
  Button,
} from '@mui/material';
import { Download } from '@mui/icons-material';
import { IconX } from '@tabler/icons-react';
const PageAcces = () => {
  const [open, setOpen] = useState(false);
  const [openInvitation, setOpenInvitation] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <PageContainer title="Page Access" description="this is Page Acces page">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Card
            onClick={handleClickOpen}
            sx={{
              cursor: 'pointer',
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              '&:hover': {
                transform: 'translateY(-6px)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
              },
            }}
          >
            {/* Banner / Cover */}
            <Box
              sx={{
                height: 100,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Avatar
                src="https://i.pravatar.cc/150?img=32"
                sx={{
                  width: 80,
                  height: 80,
                  border: '3px solid white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
              />
            </Box>

            <CardContent sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Tommy
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  display: 'inline-block',
                }}
              >
                3F21ASDASDASD
              </Typography>

              <Typography variant="body1" sx={{ fontWeight: 'medium', mt: 2 }}>
                Gedung HQ
              </Typography>
            </CardContent>

            {/* Footer Info */}
            <Box
              sx={{
                bgcolor: 'grey.50',
                borderTop: '1px solid #eee',
                py: 1,
                px: 2,
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Tap to view your Access Pass
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Card
            onClick={handleClickOpen}
            sx={{
              cursor: 'pointer',
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              '&:hover': {
                transform: 'translateY(-6px)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
              },
            }}
          >
            {/* Banner / Cover */}
            <Box
              sx={{
                height: 100,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Avatar
                src="https://i.pravatar.cc/150?img=32"
                sx={{
                  width: 80,
                  height: 80,
                  border: '3px solid white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
              />
            </Box>

            <CardContent sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Tommy
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  display: 'inline-block',  
                }}
              >
                79EWQWQWQW
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'medium', mt: 2 }}>
                Gedung HQ
              </Typography>
            </CardContent>

            {/* Footer Info */}
            <Box
              sx={{
                bgcolor: 'grey.50',
                borderTop: '1px solid #eee',
                py: 1,
                px: 2,
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Tap to view your Access Pass
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>
     
    </PageContainer>
  );
};

export default PageAcces;
