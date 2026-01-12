import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const CurrentTime: React.FC = () => {
  const [time, setTime] = useState<string>('');
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      const locale = i18n.language === 'id' ? 'id-ID' : 'en-US';
      // setTime(now.toLocaleString('id-ID', options));
      setTime(now.toLocaleString(locale, options));
    }, 1000);

    return () => clearInterval(interval);
  }, [i18n.language]);

  return (
    <Typography variant="body1" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
      {time}
    </Typography>
  );
};

export default CurrentTime;
