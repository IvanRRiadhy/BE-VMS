import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Grid2 as Grid,
  Typography,
} from '@mui/material';
import { IconClipboardText, IconLink, IconX } from '@tabler/icons-react';

type InviteOrCreateLinkDialogProps = {
  open: boolean;
  onClose: () => void;
  onPreregister: () => void;
  onCreateLink: () => void;
};

const InviteOrCreateLinkDialog = ({
  open,
  onClose,
  onPreregister,
  onCreateLink,
}: InviteOrCreateLinkDialogProps) => {
  const cardSx = {
    height: '100%',
    borderRadius: 2,
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: 'primary.main',
      backgroundColor: 'primary.50',
      transform: 'translateY(-2px)',
      boxShadow: 2,
    },
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Preregister Visitor
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'grey.500',
          }}
        >
          <IconX size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 2 }}>
        {/* <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Choose how you want to invite your visitor.
        </Typography> */}

        <Grid container spacing={2}>
          {/* Preregister */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card variant="outlined" sx={cardSx}>
              <CardActionArea onClick={onPreregister} sx={{ height: '100%' }}>
                <CardContent
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'primary.50',
                      color: 'primary.main',
                      mb: 2,
                    }}
                  >
                    <IconClipboardText size={28} />
                  </Box>

                  <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                    Preregister Visitor
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Register visitor information in advance before their arrival.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          {/* Share Link */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card variant="outlined" sx={cardSx}>
              <CardActionArea onClick={onCreateLink} sx={{ height: '100%' }}>
                <CardContent
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'primary.50',
                      color: 'primary.main',
                      mb: 2,
                    }}
                  >
                    <IconLink size={28} />
                  </Box>

                  <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                    Share Link Invitation
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Generate an invitation link and share it directly with your visitor.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default InviteOrCreateLinkDialog;
