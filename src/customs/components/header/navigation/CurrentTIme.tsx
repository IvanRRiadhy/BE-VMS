// import { Typography } from '@mui/material';
// import { useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next';

// const CurrentTime: React.FC = () => {
//   const [time, setTime] = useState<string>('');
//   const { t, i18n } = useTranslation();

//   useEffect(() => {
//     const interval = setInterval(() => {
//       const now = new Date();
//       const options: Intl.DateTimeFormatOptions = {
//         weekday: 'long',
//         day: '2-digit',
//         month: 'long',
//         year: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//         // second: '2-digit',
//         hour12: false,
//       };
//       const locale = i18n.language === 'id' ? 'id-ID' : 'en-US';
//       // setTime(now.toLocaleString('id-ID', options));
//       setTime(now.toLocaleString(locale, options));
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [i18n.language]);

//   return (
//     <Typography variant="body1" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
//       {time}
//     </Typography>
//   );
// };

// export default CurrentTime;


import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const CurrentTime = () => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const { i18n } = useTranslation();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const locale = i18n.language === 'id' ? 'id-ID' : 'en-US';

      setDate(
        now.toLocaleDateString(locale, {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      );

      // const formattedTime = now
      //   .toLocaleTimeString(locale, {
      //     hour: '2-digit',
      //     minute: '2-digit',
      //     hour12: false,
      //   })
      //   .replace('.', ':');

      // const timeZone = new Intl.DateTimeFormat(locale, {
      //   timeZoneName: 'short',
      // })
      //   .formatToParts(now)
      //   .find((part) => part.type === 'timeZoneName')?.value;

      // setTime(`${formattedTime} ${timeZone ?? ''}`);
      const formattedTime = now
        .toLocaleTimeString(locale, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
        .replace('.', ':');

      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const indonesiaTimeZone: Record<string, string> = {
        'Asia/Jakarta': 'WIB',
        'Asia/Pontianak': 'WIB',
        'Asia/Makassar': 'WITA',
        'Asia/Jayapura': 'WIT',
      };

      const timeZoneLabel =
        indonesiaTimeZone[timeZone] ??
        new Intl.DateTimeFormat(locale, {
          timeZoneName: 'short',
        })
          .formatToParts(now)
          .find((part) => part.type === 'timeZoneName')?.value;

      setTime(`${formattedTime} ${timeZoneLabel}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [i18n.language]);

  return (
    <Box display="flex" alignItems="center" gap={1.5}>
      <CalendarTodayOutlinedIcon
        sx={{ fontSize: 18, color: 'text.secondary' }}
      />

      <Box>
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{ lineHeight: 1.2 }}
        >
          {date}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ lineHeight: 1.2 }}
        >
          {time}
        </Typography>
      </Box>
    </Box>
  );
};

export default CurrentTime;