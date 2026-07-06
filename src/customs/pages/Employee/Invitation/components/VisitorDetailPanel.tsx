import { Avatar, Box, Card, CardContent, Chip, Stack, Tab, Tabs, Typography } from '@mui/material';
import {
  IconCalendarEvent,
  IconCircleCheck,
  IconClipboardText,
  IconMail,
  IconPhone,
  IconTicket,
  IconUser,
} from '@tabler/icons-react';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import bg_nodata from 'src/assets/images/backgrounds/bg_nodata.svg';
import {
  IconParking,
  IconCar,
  IconSteeringWheel,
  IconMapPin,
  IconSquareRounded,
} from '@tabler/icons-react';

type Props = {
  selectedVisitor: any;
  tab: number;
  setTab: (value: number) => void;
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
    <Box
      sx={{
        color: 'primary.main',
        mt: 0.2,
        display: 'flex',
      }}
    >
      {icon}
    </Box>

    <Box flex={1}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>

      <Typography variant="body2" fontWeight={500}>
        {value}
      </Typography>
    </Box>
  </Box>
);

export default function VisitorDetailPanel({ selectedVisitor, tab, setTab }: Props) {
  const statusBgMap: Record<string, string> = {
    Checkin: '#21c45d',
    Checkout: '#F44336',
    Block: '#000000',
    Deny: '#8B0000',
    Approve: '#21c45d',
    Pracheckin: '#21c45d',
  };

  if (!selectedVisitor) {
    return (
      <Box
        sx={{
          ml: 0,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          width: {
            xs: '100%',
            md: 360,
          },
          flexShrink: 0,
        }}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          py={10}
          px={3}
        >
          <img src={bg_nodata} width={120} />

          <Typography mt={2} color="text.secondary">
            Select visitor
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        ml: 0,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        height: 'fit-content',
        width: {
          xs: '100%',
          md: 360,
        },
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <Box p={2} borderBottom="1px solid" borderColor="divider">
        <Typography fontWeight={700} fontSize={18}>
          Invitation Detail
        </Typography>
      </Box>

      {/* Profile */}
      <Box
        display="flex"
        alignItems="center"
        gap={2}
        p={2}
        borderBottom="1px solid"
        borderColor="divider"
      >
        <Avatar
          src={`${axiosInstance2.defaults.baseURL}/cdn${selectedVisitor.selfie_image}`}
          sx={{ width: 56, height: 56 }}
        />

        <Box flex={1}>
          <Typography fontWeight={700}>{selectedVisitor.visitor_name}</Typography>

          <Typography variant="body2" color="text.secondary">
            {selectedVisitor.visitor_organization_name}
          </Typography>

          <Typography variant="caption" color="primary">
            {selectedVisitor.visitor_type_name}
          </Typography>
        </Box>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Detail" />
        <Tab label="Card" />
        <Tab label="Parking" />
      </Tabs>

      <Box
        p={2}
        sx={{
          maxHeight: 500,
          overflow: 'auto',
          pb: 0,
        }}
      >
        {tab === 0 && (
          <>
            <DetailItem
              label="Invitation Code"
              value={selectedVisitor.invitation_code}
              icon={<IconTicket size={18} />}
            />

            <DetailItem
              label="Agenda"
              value={selectedVisitor.agenda}
              icon={<IconClipboardText size={18} />}
            />

            <DetailItem
              label="Host"
              value={selectedVisitor.host_name}
              icon={<IconUser size={18} />}
            />

            <DetailItem
              label="Visit Date"
              value={`${formatDateTime(selectedVisitor.visitor_period_start)} - ${formatDateTime(
                selectedVisitor.visitor_period_end,
              )}`}
              icon={<IconCalendarEvent size={18} />}
            />

            <DetailItem
              label="Location"
              value={selectedVisitor.site_place_name}
              icon={<IconMapPin size={18} />}
            />

            <DetailItem
              label="Phone"
              value={selectedVisitor.visitor_phone}
              icon={<IconPhone size={18} />}
            />

            <DetailItem
              label="Email"
              value={selectedVisitor.visitor_email}
              icon={<IconMail size={18} />}
            />

            <DetailItem
              label="Status"
              icon={<IconCircleCheck size={18} />}
              value={
                <Box
                  sx={{
                    display: 'inline-flex',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 5,
                    bgcolor: statusBgMap[selectedVisitor.visitor_status] ?? '#757575',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  {selectedVisitor.visitor_status}
                </Box>
              }
            />
          </>
        )}

        {tab === 1 && (
          <Stack spacing={2}>
            {[...(selectedVisitor.card ?? [])]
              .sort((a, b) => {
                if (a.current_used !== b.current_used) {
                  return Number(b.current_used) - Number(a.current_used);
                }

                return new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime();
              })
              .map((item: any) => (
                <Card key={item.id} variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography fontWeight={700}>{item.card_number}</Typography>

                      <Chip
                        size="small"
                        label={item.card_status}
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
              ))}
          </Stack>
        )}
        {tab === 2 && (
          <>
            <DetailItem
              label="Driving"
              value={selectedVisitor.is_driving ? 'Yes' : 'No'}
              icon={<IconSteeringWheel size={18} stroke={1.9} />}
            />

            <DetailItem
              label="Parking Access"
              value={
                <Chip
                  size="small"
                  label={selectedVisitor.can_parking ? 'Allowed' : 'Not Allowed'}
                  color={selectedVisitor.can_parking ? 'success' : 'default'}
                />
              }
              icon={<IconParking size={18} stroke={1.9} />}
            />

            <DetailItem
              label="Vehicle Plate"
              value={selectedVisitor.vehicle_plate_number || '-'}
              icon={<IconCar size={18} stroke={1.9} />}
            />

            <DetailItem
              label="Parking Area"
              value={selectedVisitor.parking_area || '-'}
              icon={<IconMapPin size={18} stroke={1.9} />}
            />

            <DetailItem
              label="Parking Slot"
              value={selectedVisitor.parking_slot || '-'}
              icon={<IconSquareRounded size={18} stroke={1.9} />}
            />
          </>
        )}
      </Box>
    </Box>
  );
}
