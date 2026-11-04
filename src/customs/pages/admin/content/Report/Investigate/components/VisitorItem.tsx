import { Avatar, Box, Stack, Typography } from '@mui/material';
import { KeyboardArrowRight } from '@mui/icons-material';

import StatusChip from './StatusChip';
import { axiosInstance2 } from 'src/customs/api/interceptor';

interface VisitorItemProps {
  visitor?: any;
  selected?: boolean;
  statusLabelMap?: Record<string, string>;
  statusBgMap?: Record<string, string>;
}

const VisitorItem = ({ visitor, selected, statusLabelMap, statusBgMap }: VisitorItemProps) => {
  const status = visitor.visitor_status;

  const statusLabel = statusLabelMap[status] ?? status ?? '-';
  const statusColor = statusBgMap[status] ?? 'gray';

  return (
    <Box
      sx={{
        px: 1.75,
        py: 1.25,
        cursor: 'pointer',
        borderLeft: selected ? '3px solid #1976d2' : '3px solid transparent',
        backgroundColor: selected ? '#eaf3ff' : '#fff',
        boxShadow: selected ? 'inset 0 0 0 1px rgba(25, 118, 210, 0.08)' : 'none',
        transition: 'all 0.15s ease',
        '&:hover': {
          backgroundColor: selected ? '#eaf3ff' : '#f7faff',
        },
      }}
    >
      <Stack direction="row" spacing={1.2} alignItems="center">
        <Avatar
          src={
            visitor.selfie_image
              ? `${axiosInstance2.defaults.baseURL}/cdn${visitor.selfie_image}`
              : undefined
          }
          sx={{
            width: 45,
            height: 45,
            flexShrink: 0,
          }}
        >
          {!visitor.selfie_image && visitor.visitor_name?.charAt(0)?.toUpperCase()}
        </Avatar>

        <Box flex={1} minWidth={0}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography
              fontSize={14}
              fontWeight={selected ? 700 : 600}
              color={selected ? '#1565c0' : '#182230'}
              noWrap
            >
              {visitor.visitor_name}
            </Typography>

            <Typography fontSize={10} color="text.secondary" noWrap>
              {visitor.time}
            </Typography>
          </Stack>

          <Typography fontSize={12} color="text.secondary" noWrap>
            {visitor.visitor_organization_name}
          </Typography>

          <StatusChip label={statusLabel} color={statusColor} />
        </Box>

        <KeyboardArrowRight sx={{ fontSize: 18, color: '#8792a2' }} />
      </Stack>
    </Box>
  );
};

export default VisitorItem;
