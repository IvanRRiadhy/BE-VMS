import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Grid2 as Grid,
  Typography,
  Switch,
  Tooltip,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import { Box } from '@mui/system';
import { IconExternalLink, IconInfoCircle, IconX } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';

const NotificationSetting = () => {
  const [openDialogSetting, setOpenDialogSetting] = useState(false);

  const [initialCardAccessEnabled, setInitialCardAccessEnabled] = useState(false);
  const [giveCardSettingEnabled, setGiveCardSettingEnabled] = useState(false);
  const navigate = useNavigate();

  const handleAdd = () => {
    setOpenDialogSetting(true);
  };

  const handleDirectSMTPSetting = () => {
    // handle direct smtp setting
    navigate('/admin/manage/setting-smtp');
  };

  return (
    <div>
      <DynamicTable
        data={[]}
        onAddData={handleAdd}
        isHaveAction
        isHaveAddData
        isHaveHeaderTitle
        titleHeader="Notification Setting"
      />

      <Dialog
        open={openDialogSetting}
        onClose={() => {
          setOpenDialogSetting(false);
          setInitialCardAccessEnabled(false);
          setGiveCardSettingEnabled(false);
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Form Notification Setting
          <IconButton
            aria-label="close"
            onClick={() => {
              setOpenDialogSetting(false);
              setInitialCardAccessEnabled(false);
              setGiveCardSettingEnabled(false);
            }}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <IconX />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* INITIAL CARD ACCESS */}
            <Grid size={{ xs: 12 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Email Notification
                  <Tooltip title="Initial Card Access" arrow placement="bottom">
                    <IconInfoCircle />
                  </Tooltip>
                </Typography>

                <Switch
                  checked={initialCardAccessEnabled}
                  onChange={(e) => setInitialCardAccessEnabled(e.target.checked)}
                />
              </Box>

              {initialCardAccessEnabled && (
                // <Select fullWidth value="QR">
                //   <MenuItem value="QR">Card Access (QR)</MenuItem>
                // </Select><
                <Box>
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="flex-start" alignItems="center" gap={2}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      Email
                    </Typography>
                    <Button
                      variant="contained"
                      endIcon={<IconExternalLink />}
                      onClick={handleDirectSMTPSetting}
                    >
                      Setting SMTP
                    </Button>

                    {/* <Switch checked={false} onChange={() => {}} /> */}
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      Reminder Notification
                      <Tooltip title="Initial Card Access" arrow placement="bottom">
                        <IconInfoCircle />
                      </Tooltip>
                    </Typography>

                    <Switch checked={false} onChange={() => {}} />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      Arrival Notification
                      <Tooltip title="Initial Card Access" arrow placement="bottom">
                        <IconInfoCircle />
                      </Tooltip>
                    </Typography>

                    <Switch checked={false} onChange={() => {}} />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      Expiry Notification
                      <Tooltip title="Initial Card Access" arrow placement="bottom">
                        <IconInfoCircle />
                      </Tooltip>
                    </Typography>

                    <Switch checked={false} onChange={() => {}} />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      Alarm Notification
                      <Tooltip title="Initial Card Access" arrow placement="bottom">
                        <IconInfoCircle />
                      </Tooltip>
                    </Typography>

                    <Switch checked={false} onChange={() => {}} />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      Evacuate Notification
                      <Tooltip title="Initial Card Access" arrow placement="bottom">
                        <IconInfoCircle />
                      </Tooltip>
                    </Typography>

                    <Switch checked={false} onChange={() => {}} />
                  </Box>
                  <Divider sx={{ mt: 1 }} />
                </Box>
              )}
            </Grid>

            {/* GIVE CARD SETTING */}
            <Grid size={{ xs: 12 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  App Notification
                  <Tooltip title="Give Card Setting" arrow placement="bottom">
                    <IconInfoCircle />
                  </Tooltip>
                </Typography>

                <Switch
                  checked={giveCardSettingEnabled}
                  onChange={(e) => setGiveCardSettingEnabled(e.target.checked)}
                />
              </Box>

              {giveCardSettingEnabled && (
                <Select fullWidth value="old">
                  <MenuItem value="old">Disabled Access Old Card</MenuItem>
                </Select>
              )}
            </Grid>
            {/* GIVE CARD SETTING */}
            <Grid size={{ xs: 12 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Notification WA (Whatsapp)
                  <Tooltip title="Give Card Setting" arrow placement="bottom">
                    <IconInfoCircle />
                  </Tooltip>
                </Typography>

                <Switch
                  checked={giveCardSettingEnabled}
                  onChange={(e) => setGiveCardSettingEnabled(e.target.checked)}
                />
              </Box>

              {giveCardSettingEnabled && (
                <Select fullWidth value="old">
                  <MenuItem value="old">Disabled Access Old Card</MenuItem>
                </Select>
              )}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default NotificationSetting;
