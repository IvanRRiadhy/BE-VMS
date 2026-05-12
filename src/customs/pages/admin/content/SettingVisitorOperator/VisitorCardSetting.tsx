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
} from '@mui/material';
import { Box } from '@mui/system';
import { IconInfoCircle, IconX } from '@tabler/icons-react';
import React, { useState } from 'react';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';

const VisitorCardSetting = () => {
  const [openDialogSetting, setOpenDialogSetting] = useState(false);

  const [initialCardAccessEnabled, setInitialCardAccessEnabled] = useState(false);
  const [giveCardSettingEnabled, setGiveCardSettingEnabled] = useState(false);

  const handleAdd = () => {
    setOpenDialogSetting(true);
  };

  return (
    <div>
      <DynamicTable
        data={[]}
        onAddData={handleAdd}
        isHaveAction
        isHaveAddData
        isHaveHeaderTitle
        titleHeader="Visitor Card"
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
          Form Visitor Card Setting
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
                  Initial Card Access
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
                <Select fullWidth value="QR">
                  <MenuItem value="QR">Card Access (QR)</MenuItem>
                </Select>
              )}
            </Grid>

            {/* GIVE CARD SETTING */}
            <Grid size={{ xs: 12 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Give Card Setting
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

export default VisitorCardSetting;
