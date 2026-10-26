import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';

import {
  IconCalendarEvent,
  IconCar,
  IconCircleCheck,
  IconClipboardText,
  IconMail,
  IconMapPin,
  IconPhone,
  IconSquareRounded,
  IconSteeringWheel,
  IconTicket,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { axiosInstance2 } from 'src/customs/api/interceptor';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';

type Props = {
  open: boolean;
  onClose: () => void;
  visitor: any;
};

const DetailItem = ({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <Box
    display="flex"
    alignItems="flex-start"
    gap={1.5}
    py={1.2}
    borderBottom="1px dashed"
    borderColor="divider"
  >
    {icon && <Box sx={{ color: 'primary.main', mt: 0.2, display: 'flex' }}>{icon}</Box>}

    <Box flex={1} minWidth={0}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>

      <Typography variant="body2" fontWeight={500} sx={{ overflowWrap: 'anywhere' }}>
        {value ?? '-'}
      </Typography>
    </Box>
  </Box>
);

export default function VisitorDetailDialog({ open, onClose, visitor }: Props) {
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (open) setTab(0);
  }, [open, visitor?.id]);

  const statusBgMap: Record<string, string> = {
    Checkin: '#21c45d',
    Checkout: '#F44336',
    Block: '#000000',
    Deny: '#8B0000',
    Approve: '#21c45d',
    Pracheckin: '#21c45d',
    Waiting: 'gray',
    Available: 'gray',
  };

  const statusLabelMap: Record<string, string> = {
    Checkin: 'Check In',
    Checkout: 'Check Out',
    Block: 'Block',
    Deny: 'Deny',
    Approve: 'Approve',
    Pracheckin: 'Precheckin',
    Available: 'Available',
    Waiting: 'Waiting',
  };

  if (!visitor) return null;

  const cards = [...(visitor.card ?? [])].sort((a, b) => {
    if (a.current_used !== b.current_used) {
      return Number(b.current_used) - Number(a.current_used);
    }

    return new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime();
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
      <DialogTitle sx={{ pr: 7 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            src={`${axiosInstance2.defaults.baseURL}/cdn${visitor.selfie_image}`}
            sx={{ width: 52, height: 52 }}
          />

          <Box flex={1} minWidth={0}>
            <Typography fontWeight={700} fontSize={18}>
              {visitor.visitor_name}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {visitor.visitor_organization_name || '-'}
            </Typography>

            <Typography variant="caption" color="primary">
              {visitor.visitor_type_name || '-'}
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            aria-label="Close dialog"
            sx={{ position: 'absolute', right: 12, top: 12 }}
          >
            <IconX size={24} />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="fullWidth">
        <Tab label="Detail" />
        <Tab label="Card" />
        <Tab label="Parking" />
      </Tabs>

      <DialogContent dividers sx={{ minHeight: 300, maxHeight: '65vh' }}>
        {tab === 0 && (
          <>
            <DetailItem
              label="Invitation Code"
              value={visitor.invitation_code}
              icon={<IconTicket size={18} />}
            />

            <DetailItem
              label="Agenda"
              value={visitor.agenda}
              icon={<IconClipboardText size={18} />}
            />

            <DetailItem label="Host" value={visitor.host_name} icon={<IconUser size={18} />} />

            <DetailItem
              label="Visit Date"
              value={`${formatDateTime(visitor.visitor_period_start)} - ${formatDateTime(
                visitor.visitor_period_end,
                visitor.extend_visitor_period,
              )}`}
              icon={<IconCalendarEvent size={18} />}
            />

            <DetailItem
              label="Site"
              value={visitor.site_place_name}
              icon={<IconMapPin size={18} />}
            />

            <DetailItem
              label="Phone"
              value={visitor.visitor_phone}
              icon={<IconPhone size={18} />}
            />

            <DetailItem label="Email" value={visitor.visitor_email} icon={<IconMail size={18} />} />

            <DetailItem
              label="Status"
              icon={<IconCircleCheck size={18} />}
              value={
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 5,
                    bgcolor: statusBgMap[visitor.visitor_status] ?? '#757575',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  {statusLabelMap[visitor.visitor_status] ?? visitor.visitor_status}
                </Box>
              }
            />
          </>
        )}

        {tab === 1 && (
          <Stack spacing={2}>
            {cards.length > 0 ? (
              cards.map((item: any) => (
                <Card key={item.id} variant="outlined">
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      gap={1}
                      mb={2}
                    >
                      <Typography fontWeight={700}>{item.card_number || '-'}</Typography>

                      <Chip
                        size="small"
                        label={item.card_status || '-'}
                        color={
                          item.card_status === 'Issued'
                            ? 'success'
                            : item.card_status === 'Swapped'
                              ? 'warning'
                              : 'default'
                        }
                      />
                    </Box>

                    <DetailItem label="Card Type" value={item.card_type} />
                    <DetailItem label="Barcode" value={item.card_barcode} />
                    <DetailItem label="MAC Address" value={item.card_mac || '-'} />

                    <DetailItem
                      label="Current Used"
                      value={
                        <Chip
                          size="small"
                          label={item.current_used ? 'Yes' : 'No'}
                          color={item.current_used ? 'success' : 'default'}
                        />
                      }
                    />

                    <DetailItem label="Issued By" value={item.issued_by} />
                    <DetailItem label="Issued At" value={formatDateTime(item.issued_at)} />

                    {item.swap_at && (
                      <>
                        <DetailItem label="Swap By" value={item.swap_by} />
                        <DetailItem label="Swap At" value={formatDateTime(item.swap_at)} />
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography color="text.secondary" textAlign="center" py={5}>
                No card data
              </Typography>
            )}
          </Stack>
        )}

        {tab === 2 && (
          <>
            <DetailItem
              label="Driving"
              value={visitor.is_driving ? 'Yes' : 'No'}
              icon={<IconSteeringWheel size={18} />}
            />

            <DetailItem
              label="Vehicle Type"
              value={visitor.vehicle_type || '-'}
              icon={<IconCar size={18} />}
            />

            <DetailItem
              label="Vehicle Plate"
              value={visitor.vehicle_plate_number || '-'}
              icon={<IconCar size={18} />}
            />

            <DetailItem
              label="Parking Area"
              value={visitor.parking_area || '-'}
              icon={<IconMapPin size={18} />}
            />

            <DetailItem
              label="Parking Slot"
              value={visitor.parking_slot || '-'}
              icon={<IconSquareRounded size={18} />}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
