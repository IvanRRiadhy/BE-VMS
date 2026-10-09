import {
  Box,
  Chip,
  Stack,
  Step,
  StepConnector,
  Card,
  CardContent,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { CalendarTodayOutlined, LocationOnOutlined } from '@mui/icons-material';
const ScheduleConnector = styled(StepConnector)(({ theme }) => ({
  [`&.MuiStepConnector-vertical`]: {
    marginLeft: 4,
  },

  [`& .MuiStepConnector-line`]: {
    minHeight: 28,
    border: 0,
    borderLeft: `1px solid ${theme.palette.divider}`,
  },
}));
export type ScheduleStatus =
  | 'Available'
  | 'Rejected'
  | 'Denied'
  | 'Check In'
  | 'Preregis'
  | 'Check Out'
  | 'Cancelled'
  | 'Upcoming';
const ScheduleStepIcon = ({ color }: { color: string }) => {
  return (
    <Box
      sx={{
        width: 9,
        height: 9,
        borderRadius: '50%',
        backgroundColor: color,
        border: '2px solid white',
        boxSizing: 'content-box',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.05)',
      }}
    />
  );
};
export interface TodayScheduleItem {
  id: string;
  time: string;
  timeEnd: string;
  visitorName: string;
  company: string;
  agenda: string;
  location: string;
  status: ScheduleStatus;
}

interface TodayScheduleCardProps {
  schedules: TodayScheduleItem[];
  onViewAll?: () => void;
}

const statusConfig: Record<
  ScheduleStatus,
  {
    color: string;
    backgroundColor: string;
    dotColor: string;
  }
> = {
  Available: {
    color: '#FFFFFF',
    backgroundColor: '#808080',
    dotColor: '#808080',
  },

  Rejected: {
    color: '#EF4444',
    backgroundColor: '#FEF2F2',
    dotColor: '#EF4444',
  },

  Denied: {
    color: '#991B1B',
    backgroundColor: '#FEF2F2',
    dotColor: '#991B1B',
  },

  'Check In': {
    color: '#16A34A',
    backgroundColor: '#EAF8EF',
    dotColor: '#16A34A',
  },

  Preregis: {
    color: '#3B82F6',
    backgroundColor: '#EAF3FF',
    dotColor: '#3B82F6',
  },

  'Check Out': {
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    dotColor: '#64748B',
  },

  Cancelled: {
    color: '#EF4444',
    backgroundColor: '#FEF2F2',
    dotColor: '#EF4444',
  },

  Upcoming: {
    color: '#3B82F6',
    backgroundColor: '#EAF3FF',
    dotColor: '#3B82F6',
  },
};

export default function TodayScheduleCard({ schedules, onViewAll }: TodayScheduleCardProps) {
  return (
    <Card
      sx={{
        width: '100%',
        height: '100%',
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0px 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <CardContent
        sx={{
          p: 2,
          pt: '10px !important',
          '&:last-child': {
            pb: 2,
          },
        }}
      >
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            {/* <CalendarTodayOutlined
              sx={{
                fontSize: 20,
                color: 'primary.main',
              }}
            /> */}

            <Typography variant="h6" fontWeight={700} color="text.primary">
              Today's Schedule
            </Typography>
          </Stack>

          {/* <Typography
            component="button"
            onClick={onViewAll}
            sx={{
              border: 0,
              background: 'transparent',
              color: 'primary.main',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              p: 0,
            }}
          >
            View All
          </Typography> */}
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            mb: 1.5,
            // ml: 3.5,
          }}
        >
          Your visitor schedule for today.
        </Typography>

        <Box
          sx={{
            minHeight: 250,
            display: 'flex',
            alignItems: schedules.length === 0 ? 'center' : 'stretch',
            justifyContent: schedules.length === 0 ? 'center' : 'flex-start',
          }}
        >
          {schedules.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                textAlign: 'center',
              }}
            >
              No schedule for today.
            </Typography>
          ) : (
            <Stepper
              orientation="vertical"
              connector={<ScheduleConnector />}
              sx={{
                '& .MuiStep-root': {
                  p: 0,
                },

                '& .MuiStepLabel-root': {
                  p: 0,
                },

                '& .MuiStepLabel-iconContainer': {
                  p: 0,
                  pr: 1,
                },

                '& .MuiStepLabel-labelContainer': {
                  width: '100%',
                },
              }}
            >
              {schedules.map((schedule) => {
                const status = statusConfig[schedule.status];

                return (
                  <Step key={schedule.id}>
                    <StepLabel
                      StepIconComponent={() => <ScheduleStepIcon color={status.dotColor} />}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        sx={{
                          width: '100%',
                          minWidth: 0,
                          pb: 0,
                        }}
                      >
                        {/* Time */}
                        <Box
                          sx={{
                            width: 50,
                            flexShrink: 0,
                          }}
                        >
                          <Typography variant="caption" fontWeight={700} color="text.primary">
                            {schedule.time} {schedule.timeEnd}
                          </Typography>
                        </Box>

                        {/* Visitor */}
                        <Box
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            pr: 1,
                          }}
                        >
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {schedule.agenda}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            display="block"
                          >
                            {schedule.company}
                            {/* <Box component="span" sx={{ mx: 0.7 }}>
                            •
                          </Box> */}
                          </Typography>
                        </Box>

                        {/* Status */}
                        <Chip
                          size="small"
                          label={schedule.status}
                          icon={
                            <Box
                              component="span"
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                backgroundColor: status.color,
                              }}
                            />
                          }
                          sx={{
                            height: 23,
                            flexShrink: 0,
                            borderRadius: 5,
                            backgroundColor: status.backgroundColor,
                            color: status.color,
                            fontSize: 10,
                            fontWeight: 600,

                            '& .MuiChip-icon': {
                              ml: 0.8,
                              mr: -0.3,
                            },

                            '& .MuiChip-label': {
                              px: 0.8,
                            },
                          }}
                        />

                        {/* Location */}
                        <Stack
                          direction="row"
                          alignItems="center"
                          sx={{
                            width: 150,
                            flexShrink: 0,
                            ml: 1,
                          }}
                        >
                          <LocationOnOutlined
                            sx={{
                              fontSize: 14,
                              color: 'text.secondary',
                              mr: 0.3,
                            }}
                          />

                          <Typography variant="caption" color="text.secondary" noWrap>
                            {schedule.location}
                          </Typography>
                        </Stack>
                      </Stack>
                    </StepLabel>
                  </Step>
                );
              })}
            </Stepper>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
