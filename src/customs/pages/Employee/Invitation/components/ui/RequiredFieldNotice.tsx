import { Box, Typography } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const RequiredFieldNotice = () => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        p: 1.5,
        borderRadius: 2,
        bgcolor: '#EFF6FF',
        border: '1px solid',
        borderColor: '#BFDBFE',
        mt: 1,
        mb: 1,
      }}
    >
      <InfoOutlined
        sx={{
          color: '#2563EB',
          fontSize: 20,
          mt: 0.15,
        }}
      />

      <Typography
        variant="body2"
        sx={{
          lineHeight: 1.5,
          color: '#475569',
        }}
      >
        <Box
          component="span"
          sx={{
            fontWeight: 600,
            color: '#1E3A8A',
          }}
        >
          {t('required_fields')}{' '}
          <Box
            component="span"
            sx={{
              color: 'error.main',
              fontWeight: 700,
            }}
          >
            *
          </Box>
          <br />
        </Box>

        {t('required_field_note')}
      </Typography>
    </Box>
  );
};

export default RequiredFieldNotice;
