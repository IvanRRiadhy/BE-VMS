import { Button, Divider, MenuItem, Tooltip, Typography, Grid2 as Grid } from '@mui/material';
import { Box } from '@mui/system';
import {
  IconAlertCircle,
  IconBell,
  IconFilter,
  IconHeartRateMonitor,
  IconPencil,
  IconRefresh,
  IconSettings,
  IconTrash,
} from '@tabler/icons-react';
import React, { useState } from 'react';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import FRImage from 'src/assets/images/products/pic_fr.png';
import QRCode from 'react-qr-code';

interface Props {
  loading: boolean;
  onOpenFilter: () => void;
  onRefresh: () => void;
}

type Mode = 'viewer' | 'config';
type Layout = 1 | 2;

const CARD_HEIGHT = 420;

const MonitoringMain: React.FC<Props> = ({ loading, onOpenFilter, onRefresh }) => {
  const [mode, setMode] = useState<Mode>('viewer');
  const [layout, setLayout] = useState<Layout>(1);

  const cardCount = layout === 1 ? 4 : 8;
  const gridSize = layout === 1 ? { xs: 12, lg: 6 } : { xs: 12, lg: 3 };

  const agents = Array.from({ length: 7 }).map((_, i) => ({
    id: i + 1,
    name: `Agent ${i + 1}`,
  }));

  const cardSx = {
    height: CARD_HEIGHT,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
    p: 1,
    backgroundColor: 'background.paper',
    overflow: 'hidden',
  };

  const viewerCellSx = {
    height: '100%',
    borderRadius: 1,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: '#000',
  };

  const configCardSx = {
    height: CARD_HEIGHT,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
    p: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    backgroundColor: 'background.paper',
  };

  const circleBtnSx = {
    borderRadius: '50%',
    minWidth: 0,
    width: 30,
    height: 30,
    padding: 0,
  };

  const StatusBadge = ({
    label,
    color = 'success',
  }: {
    label: string;
    color?: 'success' | 'error' | 'warning';
  }) => (
    <Box
      sx={{
        px: 1.5,
        py: 0.5,
        borderRadius: 999,
        fontSize: '0.75rem',
        fontWeight: 600,
        border: '1px solid',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        backgroundColor: (t) => t.palette[color].light,
        color: (t) => t.palette[color].dark,
        borderColor: (t) => t.palette[color].main,
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: (t) => t.palette[color].main,
        }}
      />
      {label}
    </Box>
  );

  const SplitStatusBadge = ({
    leftLabel,
    rightLabel,
  }: {
    leftLabel: string;
    rightLabel: string;
  }) => (
    <Box
      sx={{
        position: 'relative',
        height: 32,
        minWidth: 140,
        borderRadius: 999,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        fontWeight: 700,
        color: '#fff',
        background: (t) =>
          `linear-gradient(
          135deg,
          ${t.palette.success.main} 0%,
          ${t.palette.success.main} 48%,
          ${t.palette.error.main} 52%,
          ${t.palette.error.main} 100%
        )`,
      }}
    >
      <Box sx={{ flex: 1, textAlign: 'left', pl: 2 }}>{leftLabel}</Box>
      <Box sx={{ flex: 1, textAlign: 'right', pr: 2 }}>{rightLabel}</Box>
    </Box>
  );

  const EmptyAgentCard = () => (
    <Box
      sx={{
        height: '100%',
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.disabled',
        gap: 1,
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '2px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          fontWeight: 700,
        }}
      >
        ×
      </Box>

      <Typography variant="body1">Empty Slot</Typography>
    </Box>
  );

  return (
    <Box flexGrow={1} sx={{ p: 1, display: 'flex', flexDirection: 'column', pt: 0.5 }}>
      <Box display="flex" gap={1} alignItems="center" flexWrap={'wrap'}>
        <Box display="flex" gap={1} alignItems="center">
          <Tooltip title="Viewer" arrow>
            <Button
              variant={mode === 'viewer' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setMode('viewer')}
              startIcon={<IconHeartRateMonitor width={18} />}
            >
              Viewer
            </Button>
          </Tooltip>
          <Tooltip title="Configuration" arrow>
            <Button
              variant={mode === 'config' ? 'contained' : 'outlined'}
              size="small"
              color="secondary"
              onClick={() => setMode('config')}
              startIcon={<IconSettings width={18} />}
            >
              Config
            </Button>
          </Tooltip>

          {mode === 'viewer' && (
            <CustomSelect
              size="small"
              value={layout}
              onChange={(e: any) => setLayout(Number(e.target.value) as Layout)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value={1}>Layout 1</MenuItem>
              <MenuItem value={2}>Layout 2</MenuItem>
            </CustomSelect>
          )}
        </Box>

        <Tooltip title="Filter" arrow>
          <Button size="small" variant="contained" onClick={onOpenFilter}>
            <IconFilter />
          </Button>
        </Tooltip>

        <Tooltip title="Alert" arrow>
          <Button size="small" variant="contained" color="error">
            <IconAlertCircle />
          </Button>
        </Tooltip>

        <Tooltip title="Alarm" arrow>
          <Button size="small" variant="contained" color="warning">
            <IconBell />
          </Button>
        </Tooltip>

        <Tooltip title="Refresh" arrow>
          <Button size="small" variant="outlined" onClick={onRefresh}>
            <Box
              sx={{
                animation: loading ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  from: { transform: 'rotate(0deg)' },
                  to: { transform: 'rotate(360deg)' },
                },
                // width: 20,
                // height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconRefresh />
            </Box>
          </Button>
        </Tooltip>
      </Box>

      <Divider sx={{ my: 1 }} />
      {mode === 'viewer' && (
        <Grid container spacing={1}>
          {Array.from({ length: cardCount }).map((_, idx) => (
            <Grid key={idx} size={gridSize}>
              <Box sx={cardSx}>
                <Grid container spacing={1} height="100%">
                  <Grid size={{ xs: 12, lg: 6 }} height="50%">
                    <Box sx={viewerCellSx}>
                      <img
                        src={FRImage}
                        alt="cam"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, lg: 6 }} height="50%">
                    <Box sx={viewerCellSx}>
                      <img
                        src={FRImage}
                        alt="cam"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, lg: 6 }} height="50%">
                    <Box sx={{ ...viewerCellSx, backgroundColor: '#fff', flexDirection: 'column' }}>
                      <QRCode value="https://google.com" size={120} />
                      <Typography variant="h6" mt={1} color="text.secondary">
                        Name
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, lg: 6 }} height="50%">
                    <Box
                      sx={{
                        height: '100%',
                        p: 1.5,
                        border: '1px dashed',
                        borderColor: 'divider',
                        borderRadius: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'start',
                        gap: 1,
                      }}
                    >
                      <Typography variant="h6" color="text.secondary">
                        Status
                      </Typography>
                      <StatusBadge label="MATCH" color="success" />
                      {/* <StatusBadge label="NO MATCH" color="error" /> */}
                      <Divider />
                      <Typography variant="h6" color="text.secondary">
                        Gate SCP5
                      </Typography>

                      {/* <Divider /> */}
                      <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                        <StatusBadge label="OPEN" color="success" />
                        <StatusBadge label="CLOSED" color="error" />
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {mode === 'config' && (
        <Grid container spacing={1}>
          {Array.from({ length: 8 }).map((_, idx) => {
            const agent = agents[idx];
            return (
              <Grid key={idx} size={{ xs: 12, lg: 3 }}>
                {agent ? (
                  <Box sx={configCardSx}>
                    <Typography variant="h4" fontWeight={600}>
                      {agent.name}
                    </Typography>

                    <Box display="flex" gap={1}>
                      <Tooltip title="Edit Agent">
                        <Button color="warning" variant="contained" sx={circleBtnSx}>
                          <IconPencil />
                        </Button>
                      </Tooltip>

                      <Tooltip title="Delete Agent">
                        <Button color="error" variant="contained" sx={circleBtnSx}>
                          <IconTrash />
                        </Button>
                      </Tooltip>
                    </Box>
                  </Box>
                ) : (
                  <EmptyAgentCard />
                )}
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default MonitoringMain;
