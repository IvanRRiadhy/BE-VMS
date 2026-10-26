import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Box,
  Tabs,
  Tab,
  Button,
  Autocomplete,
  Chip,
} from '@mui/material';
import { IconLink, IconX } from '@tabler/icons-react';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
import GlobalBackdropLoading from 'src/customs/pages/Operator/Components/GlobalBackdrop';

type Props = {
  open: boolean;
  onClose: () => void;
  generatedLink: string;
  getExpireText: () => string;
  handleCopyLink: (link: string) => void;
  handleSendInvitation: (emails: string[]) => void;
  expiredAt?: string | null;
  // shareLinkList?: any;
  shareLinkData?: any;
  loading?: any;
};

const InvitationShareDialog: React.FC<Props> = ({
  open,
  onClose,
  generatedLink,
  getExpireText,
  handleCopyLink,
  handleSendInvitation,
  expiredAt,
  shareLinkData,
  loading,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [emails, setEmails] = useState<any>();
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ position: 'relative' }}>
        Invite Share Link
        <IconButton
          onClick={() => {
            onClose();
            setEmails([]);
            setTabValue(0);
          }}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <IconX />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
            <Tab label="Invite via Link" />
            <Tab label="Invite via Email" />
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <Box>
            <Typography sx={{ mb: 2 }}>Share this link to invite users:</Typography>

            <CustomTextField fullWidth value={generatedLink} InputProps={{ readOnly: true }} />

            <Typography sx={{ my: 1, color: 'text.secondary' }}>
              The invitation expires in <strong>{expiredAt}</strong>
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                fullWidth
                startIcon={<IconLink />}
                onClick={() => {
                  const shareText = `
Invitation Visit

Agenda : ${shareLinkData?.agenda ?? '-'}
Visitor Type: ${shareLinkData?.visitor_type_name ?? '-'}
Start  : ${formatDateTime(shareLinkData?.visitor_period_start) ?? '-'}  - ${formatDateTime(shareLinkData?.visitor_period_end) ?? '-'}
Site  : ${shareLinkData?.site_name ?? '-'}
Host: ${shareLinkData?.host_name ?? '-'}
Link Expired : ${expiredAt ?? '-'}

Untuk bergabung ke undangan klik link di bawah ini::
${generatedLink}
`;

                  handleCopyLink(shareText);
                }}
              >
                Copy Invitation
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                startIcon={<IconLink />}
                onClick={() => handleCopyLink(generatedLink)}
              >
                Copy Link Only
              </Button>
            </Box>
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            <Typography sx={{ mb: 1 }}>Enter email address to send invitation:</Typography>

            <CustomTextField
              fullWidth
              value={emails}
              placeholder="Input your email"
              onChange={(e) => setEmails(e.target.value)}
            />

            <Typography sx={{ my: 1, color: 'text.secondary' }}>
              The invitation expires in <strong>{expiredAt}</strong>
            </Typography>

            <Button
              variant="contained"
              sx={{ mt: 2 }}
              fullWidth
              onClick={() => {
                handleSendInvitation([emails]);
                setEmails('');
              }}
            >
              Send Invitation
            </Button>
          </Box>
        )}
      </DialogContent>
      <GlobalBackdropLoading open={loading} />
    </Dialog>
  );
};

export default React.memo(InvitationShareDialog);
