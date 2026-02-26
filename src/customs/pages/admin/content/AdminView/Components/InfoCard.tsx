import { Card, CardContent, Typography, Box } from '@mui/material';

const InfoCard = ({ icon, title, value, subtitle }: any) => {
  return (
    <Card
      sx={{
        flex: 1,
        borderRadius: 3,
        transition: '0.3s',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
        },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
            }}
          >
            {icon}
          </Box>

          <Typography variant="subtitle1" fontWeight={500}>
            {title}
          </Typography>
        </Box>

        {/* Value */}
        <Typography
          variant="h3"
          fontWeight={700}
          sx={{
            lineHeight: 1,
            mb: subtitle ? 0.5 : 0,
          }}
        >
          {value}
        </Typography>

        {/* Subtitle */}
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default InfoCard;
