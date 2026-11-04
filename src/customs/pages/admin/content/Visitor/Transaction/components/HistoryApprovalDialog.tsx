import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  CircularProgress,
  Divider,
  Chip,
  Stack,
  IconButton,
} from '@mui/material';
import { IconHistory, IconCheck, IconX, IconClock, IconSend } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { getHistoryApproval } from 'src/customs/api/Admin/ApprovalWorkflow';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';

interface HistoryApprovalDialogProps {
  open: boolean;
  onClose: () => void;
  id: string | null;
}

const HistoryApprovalDialog = ({ open, onClose, id }: HistoryApprovalDialogProps) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !id) return;

    let active = true;

    const fetchHistory = async () => {
      try {
        setLoading(true);

        const response = await getHistoryApproval(id);

        if (active) {
          setData(response?.collection ?? null);
        }
      } catch (error) {
        console.error('Failed to fetch approval history:', error);

        if (active) setData(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchHistory();

    return () => {
      active = false;
    };
  }, [open, id]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
      case 'submitted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'waiting':
        return 'info';
      case 'pending':
        return 'warning';
      case 'in progress':
      case 'in_progress':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
      case 'submitted':
        return <IconCheck size={16} />;
      case 'rejected':
        return <IconX size={16} />;
      default:
        return <IconClock size={16} />;
    }
  };

  const timeline = data?.timeline ?? [];
  const formatStatus = (status?: string) => {
    return (status ?? '-').replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconHistory size={22} />
          <Box>
            <Typography variant="h6" fontWeight={600}>
              History Approval
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {data?.ticket_name ?? 'Approval history'}
            </Typography>
          </Box>
        </Stack>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 10, top: 10 }}
        >
          <IconX size={24} />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3, minHeight: 250 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : !data ? (
          <Typography textAlign="center" color="text.secondary" py={5}>
            No approval history found.
          </Typography>
        ) : (
          <>
            {/* Ticket Information */}
            <Box p={2} mb={3} border="1px solid" borderColor="divider" borderRadius={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={1}
              >
                <Box>
                  <Typography fontWeight={600}>{data.ticket_name}</Typography>

                  <Typography variant="body2" color="text.secondary">
                    {data.ticket_description}
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  label={data.approval_status}
                  color={getStatusColor(data.approval_status) as any}
                />
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created By
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {data.created_by ?? '-'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created At
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {data.created_at ? formatDateTime(data.created_at) : '-'}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Approval Timeline */}
            <Typography fontWeight={600} mb={2}>
              Approval Timeline
            </Typography>

            {timeline.length === 0 ? (
              <Typography color="text.secondary">No timeline available.</Typography>
            ) : (
              <Box>
                {timeline.map((item: any, index: number) => (
                  <Box
                    key={`${item.step_order}-${index}`}
                    display="flex"
                    gap={2}
                    sx={{ pb: index === timeline.length - 1 ? 0 : 3 }}
                  >
                    {/* Timeline Line */}
                    <Box display="flex" flexDirection="column" alignItems="center">
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        width={32}
                        height={32}
                        borderRadius="50%"
                        bgcolor={`${getStatusColor(item.status)}.light`}
                        color={`${getStatusColor(item.status)}.main`}
                      >
                        {item.action === 'submitted' ? (
                          <IconSend size={16} />
                        ) : (
                          getStatusIcon(item.status)
                        )}
                      </Box>

                      {index !== timeline.length - 1 && (
                        <Box width="2px" flex={1} bgcolor="divider" mt={0.5} />
                      )}
                    </Box>

                    {/* Timeline Detail */}
                    <Box flex={1}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        flexWrap="wrap"
                        gap={1}
                      >
                        <Typography fontWeight={600}>{item.title}</Typography>

                        <Chip
                          size="small"
                          label={formatStatus(item.status)}
                          color={getStatusColor(item.status) as any}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Stack>

                      <Typography variant="body2" color="text.secondary" mt={0.5}>
                        {item.subtitle}
                      </Typography>

                      {item.description && (
                        <Typography variant="body2" mt={0.5}>
                          {item.description}
                        </Typography>
                      )}

                      {item.actors?.map((actor: any, actorIndex: number) => (
                        <Box
                          key={actor.actor_id ?? actorIndex}
                          mt={1}
                          p={1.5}
                          bgcolor="action.hover"
                          borderRadius={1}
                        >
                          <Typography variant="body2" fontWeight={600}>
                            {actor.fullname}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            {actor.email} · {actor.approver_type}
                          </Typography>

                          <Box mt={0.5} display="flex" gap={1} flexWrap="wrap" alignItems="center">
                            <Chip
                              size="small"
                              label={formatStatus(actor.approval_actor_status)}
                              color={getStatusColor(actor.approval_actor_status) as any}
                              sx={{ textTransform: 'capitalize' }}
                            />
                            {actor.is_reviewer && (
                              <Chip size="small" label="Reviewer" color="info" variant="outlined" />
                            )}

                            {actor.is_final && (
                              <Chip
                                size="small"
                                label="Final Approver"
                                color="secondary"
                                variant="outlined"
                              />
                            )}
                          </Box>

                          {actor.approved_at && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              mt={0.5}
                            >
                              {formatDateTime(actor.approved_at)}
                            </Typography>
                          )}
                        </Box>
                      ))}

                      {/* <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                        {item.time_display ? formatDateTime(item.time_display) : '-'}
                      </Typography> */}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <Divider />
    </Dialog>
  );
};

export default HistoryApprovalDialog;
