import { Box, Typography } from '@mui/material';

interface TimelineItemProps {
  time: string;
  title: string;
  location: string;
  active?: boolean;
  last?: boolean;
}

const TimelineItem = ({ time, title, location, active, last }: TimelineItemProps) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: '100px 24px 1fr',
      minHeight: last ? 48 : 60,
    }}
  >
    <Typography fontSize={13} color="text.secondary" pt={0.2} fontWeight={600} width={100}>
      {time}
    </Typography>

    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      {!last && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            bottom: -2,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '1px',
            backgroundColor: '#d7dee8',
          }}
        />
      )}

      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          width: 9,
          height: 9,
          mt: 0.35,
          borderRadius: '50%',
          backgroundColor: active ? '#1976d2' : '#c8d0dc',
          border: '2px solid #fff',
          boxSizing: 'content-box',
        }}
      />
    </Box>

    <Box>
      <Typography fontSize={13} fontWeight={600} lineHeight={1.3}>
        {title}
      </Typography>

      <Typography fontSize={12} color="text.secondary" lineHeight={1.8}>
        {location}
      </Typography>
    </Box>
  </Box>
);

export default TimelineItem;
