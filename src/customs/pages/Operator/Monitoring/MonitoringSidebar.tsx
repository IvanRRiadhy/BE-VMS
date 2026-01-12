import { Avatar, Card, CardContent, Divider, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { IconBell, IconUser } from '@tabler/icons-react';
import React from 'react';

interface Alarm {
  id: number;
  title: string;
  message: string;
  time: string;
  type: string;
}

interface History {
  id: number;
  title: string;
  message: string;
  time: string;
}

interface Props {
  alarms: Alarm[];
  histories: History[];
  width: number;
}

const MonitoringSidebar: React.FC<Props> = ({ alarms, histories, width }) => {
  return (
    <Box
      sx={{
        width: { xs: '100%', md: width },
        minWidth: { md: width },
        maxWidth: { md: width },
        flexShrink: 0,
        p: 1,
        borderRight: { md: '1px solid #eee' },
        borderTop: { xs: '1px solid #eee', md: 'none' },
        order: { xs: 2, md: 0 },
        backgroundColor: '#fff',
        overflowY: { md: 'auto', xs: 'visible' },
      }}
    >
      <Box display="flex" alignItems="center" gap={0.5} mb={1}>
        <IconBell width={18} />
        <Typography variant="h6" >Alarm</Typography>
      </Box>
      <Divider sx={{ mb: 0.5 }} />

      <Box display="flex" flexDirection="column" gap={0.5}>
        {alarms.map((alarm) => (
          <Card
            key={alarm.id}
            sx={{
              borderLeft: `4px solid ${alarm.type === 'Critical' ? '#FF3B3B' : '#FFC107'}`,
              boxShadow: 'none',
              borderRadius: 2,
              p: 1,
            }}
          >
            <CardContent sx={{ p: 0, pb: '0 !important' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {alarm.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {alarm.message}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {alarm.time}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
      <Box display="flex" alignItems="center" gap={0.5} mt={1} mb={1}>
        <IconUser width={18} />
        <Typography variant="h6">Visitor</Typography>
      </Box>
      <Divider sx={{ mb: 1 }} />

      <Box display="flex" flexDirection="column" gap={0.5}>
        {histories.map((history) => (
          <Card
            key={history.id}
            sx={{
              borderLeft: '4px solid #5D87FF',
              boxShadow: 'none',
              borderRadius: 2,
              p: 1,
            }}
          >
            <CardContent sx={{ p: 0, display: 'flex', gap: 1, pb: '0 !important' }}>
              <Avatar />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  {history.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {history.message}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {history.time}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default MonitoringSidebar;
