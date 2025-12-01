import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';

const CurrentTime: React.FC = () => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setTime(now.toLocaleString('id-ID', options));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Typography variant="body1" fontWeight={500}>
      {time}
    </Typography>
  );
};

export default CurrentTime;
