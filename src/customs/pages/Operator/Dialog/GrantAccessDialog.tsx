import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  Typography,
  Avatar,
  Paper,
  Box,
  Checkbox,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';

type Props = {
  open: boolean;
  onClose: () => void;
  invitationCode: any[];
  selectedCards: string[];
  handleToggleCard: (card: string) => void;
  dataDummyAccess: any[];
  formatDateTime: (date: string) => string;
};

export default function GrantAccessDialog({
  open,
  onClose,
  invitationCode,
  selectedCards,
  handleToggleCard,
  dataDummyAccess,
  formatDateTime,
}: Props) {
  const invitation = invitationCode?.[0];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>
        Grant Access Issuance
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <IconX />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} p={2}>
          {/* Visitor Info */}
          <Grid container spacing={2} width="100%">
            <Grid item xs={12} sm={3}>
              <Avatar sx={{ width: 150, height: 150, margin: '0 auto' }} />
            </Grid>

            <Grid item xs={12} sm={9}>
              <Typography fontWeight={600} variant="h6" mb={2}>
                Visitor Information
              </Typography>

              <Grid container spacing={2}>
                <Info label="Email" value={invitation?.visitor_email} />
                <Info label="Name" value={invitation?.visitor_name} />
                <Info label="Phone" value={invitation?.visitor_phone || '-'} />
                <Info label="Organization" value={invitation?.visitor_organization_name || '-'} />
                <Info label="Host" value={invitation?.host_name} />
                <Info label="Site" value={invitation?.site_place_name} />
                <Info label="Status" value={invitation?.visitor_status} />
                <Info label="Agenda" value={invitation?.agenda} />
                <Info label="Vehicle Type" value={invitation?.vehicle_type} />
                <Info label="Vehicle Plate" value={invitation?.vehicle_plate_number} />
                <Info
                  label="Visit Start"
                  value={formatDateTime(invitation?.visitor_period_start)}
                />
                <Info label="Visit End" value={formatDateTime(invitation?.visitor_period_end)} />
              </Grid>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2, width: '100%' }} />

          {/* Card History */}
          <Grid item xs={12}>
            <Typography fontWeight={600} variant="h6" mb={2}>
              History Cards
            </Typography>

            <Grid container spacing={2}>
              {invitation?.card?.map((card: any) => {
                const isChosen = selectedCards.includes(card.card_number);
                const isCurrentUsed = card.current_used;

                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={card.id}>
                    <Paper
                      onClick={() => handleToggleCard(card.card_number)}
                      sx={(theme) => ({
                        p: 2,
                        borderRadius: 2,
                        position: 'relative',
                        height: 260,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: isChosen ? theme.palette.primary.main : 'divider',
                        boxShadow: isChosen ? theme.shadows[8] : theme.shadows[2],
                      })}
                    >
                      {isCurrentUsed && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            bgcolor: 'warning.main',
                            color: '#fff',
                            px: 1.2,
                            py: 0.3,
                            borderRadius: 1,
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          Current
                        </Box>
                      )}
                      <Box
                        flexGrow={1}
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                        padding={2}
                      >
                        <Typography variant="h2" color="text.secondary">
                          {card.card_type || '-'}
                        </Typography>

                        <Box
                          display="flex"
                          justifyContent="space-between"
                          width="100%"
                          maxWidth={300}
                          mt={1}
                          gap={1}
                        >
                          <Typography fontWeight={600}>Card</Typography>
                          <Typography color="text.secondary">{card.card_number || '-'}</Typography>
                        </Box>

                        <Box
                          display="flex"
                          justifyContent="space-between"
                          width="100%"
                          maxWidth={300}
                          mt={0.5}
                          gap={1}
                        >
                          <Typography fontWeight={600}>BLE</Typography>
                          <Typography>{card.card_mac || '-'}</Typography>
                        </Box>

                        <Box
                          display="flex"
                          justifyContent="space-between"
                          width="100%"
                          maxWidth={300}
                          mt={0.5}
                          gap={1}
                        >
                          <Typography fontWeight={600}>Status</Typography>
                          <Typography color="text.secondary">{card.card_status || '-'}</Typography>
                        </Box>
                      </Box>

                      <FormControlLabel
                        onClick={(e) => e.stopPropagation()}
                        control={
                          <Checkbox
                            checked={isChosen}
                            onChange={() => handleToggleCard(card.card_number)}
                          />
                        }
                        label=""
                      />
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>

          <Divider sx={{ my: 2, width: '100%' }} />

          {/* Table */}
          <Grid item xs={12}>
            <DynamicTable
              data={dataDummyAccess}
              isHaveChecked
              isHaveSearch
              isHaveActionRevoke
              onActionRevoke={() => {}}
            />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

/* Sub Component supaya lebih clean */
function Info({ label, value }: any) {
  return (
    <Grid item xs={12} sm={6} lg={4}>
      <Typography variant="h6">{label}</Typography>
      <Typography>{value || '-'}</Typography>
    </Grid>
  );
}
