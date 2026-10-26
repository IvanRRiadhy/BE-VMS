import { Box, Button, Card, CardContent, Grid2 as Grid, Stack, Typography } from '@mui/material';
import { IconLink, IconPlus, IconUserPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface VisitorInvitationActionsProps {
  onRegisterVisitor: () => void;
  onGenerateLink: () => void;
}

const VisitorInvitationActions = ({
  onRegisterVisitor,
  onGenerateLink,
}: VisitorInvitationActionsProps) => {
  const { t } = useTranslation();

  return (
    <Grid
      size={{ xs: 12, lg: 6 }}
      sx={{
        display: 'flex',
        // flexDirection: 'row',
        flexDirection: { xs: 'column', sm: 'row' },
        alignSelf: 'stretch',
        gap: 1,
        flexWrap: 'wrap',
      }}
    >
      {/* Register Visitor */}
      <Card
        sx={{
          flex: 1,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'primary.main',
          boxShadow: 'none',
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 0 } }}>
          <Stack direction="row" spacing={4} alignItems="flex-start">
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
                color: '#1554B8',
                flexShrink: 0,
              }}
            >
              <IconUserPlus size={30} />
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                gap: 1,
              }}
            >
              <Typography variant="h6" fontWeight={600} color="white">
                {t('registerVisitor')}
              </Typography>

              <Typography variant="body2" color="white">
                {t('registerVisitorDescription')}
              </Typography>

              <Button
                onClick={onRegisterVisitor}
                startIcon={<IconPlus size={18} />}
                sx={{
                  mb: 0,
                  width: 'max-content',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'white',
                    color: 'primary.main',
                  },
                }}
              >
                {t('registerVisitor')}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Share Link Invitation */}
      <Card
        sx={{
          flex: 1,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: '#EEF4FF',
          boxShadow: 'none',
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 0 } }}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
                color: '#1554B8',
                flexShrink: 0,
              }}
            >
              <IconLink size={30} />
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                gap: 1,
              }}
            >
              <Typography variant="h6" fontWeight={600} color="text.primary">
                Share Link Invitation
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {t('generateLinkDescription')}
              </Typography>

              <Button
                variant="contained"
                onClick={onGenerateLink}
                startIcon={<IconLink size={18} />}
                sx={{
                  backgroundColor: 'white',
                  color: '#1554B8',
                  width: 'fit-content',
                  boxShadow: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#E3EDFF',
                    boxShadow: 'none',
                  },
                }}
              >
                Generate Link
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default VisitorInvitationActions;
