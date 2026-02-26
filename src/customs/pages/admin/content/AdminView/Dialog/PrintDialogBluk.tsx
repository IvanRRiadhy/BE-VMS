import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';
import moment from 'moment';
import { render, Printer, Text, Br, Cut, Image, QRCode } from 'react-thermal-printer';
import QRCODE from 'react-qr-code';
import { IconX } from '@tabler/icons-react';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import { useState } from 'react';
const PrintDialogBulk = ({ open, onClose, visitors, printData }: any) => {
  const COL = printData?.printer_paper_size === 80 ? 24 : 16;
  const row = (l = '', r = '') => `${l.padEnd(COL, ' ')}${r.padStart(COL, ' ')}`;

  const [printing, setPrinting] = useState(false);

  const formatDateTimes = (dateStr?: string) =>
    dateStr ? moment.utc(dateStr).local().format('DDMMMY,HH:mm') : '-';

  const uint8ToBase64 = (u8: Uint8Array) => {
    let b = '';
    u8.forEach((c) => (b += String.fromCharCode(c)));
    return btoa(b);
  };

  const printOne = async (visitor: any) => {
    const arriveTime = moment()
      .utcOffset(7 * 60)
      .format('DDMMMY,HH:mm');

    const untilTime = formatDateTimes(visitor.visitor_period_end);

    const escpos = await render(
      <Printer type="epson" width={printData.printer_paper_size || 58}>
        <Text align="center" size={{ width: 2, height: 2 }}>
          General Visitor
        </Text>

        <Image
          src={`${axiosInstance2.defaults.baseURL}/cdn/${printData.logo}`}
          align="center"
          width={80}
        />

        <Text bold>Name</Text>
        <Text>{visitor?.name ?? '-'}</Text>
        <Text bold>Phone</Text>
        <Text>{visitor.phone ?? '-'}</Text>

        <Text bold>Organization / Company</Text>
        <Text>{visitor?.organization ?? '-'}</Text>

        <Text>------------------------------</Text>

        <Text align="center" bold>
          {visitor?.site_place_name ?? '-'}
        </Text>

        <Br />

        <QRCode content={visitor?.invitation_code ?? '-'} align="center" cellSize={8} />

        <Br />

        <Text align="center">Show this while visiting</Text>

        <Text align="center" bold>
          ID : {visitor?.visitor_number ?? '-'}
        </Text>

        <Text>------------------------------</Text>

        <Text bold>{row('Agenda', 'Host')}</Text>
        <Text>{row(visitor?.agenda ?? '-', visitor?.host_name ?? '-')}</Text>

        <Text bold>{row('Arrive', 'Until')}</Text>
        <Text>{row(arriveTime, untilTime)}</Text>

        <Text>------------------------------</Text>
        <Text align="center">{printData.footer_text}</Text>
        <Cut partial={true} />
      </Printer>,
    );

    await fetch('http://localhost:5147/print', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: uint8ToBase64(escpos) }),
    });
  };

  const handleConfirm = async () => {
    if (printing) return;

    setPrinting(true);

    try {
      for (const v of visitors) {
        await printOne(v);
        await new Promise((r) => setTimeout(r, 500));
      }
      onClose();
    } catch (err) {
      console.error('BULK PRINT ERROR:', err);
      // alert('Failed to print badges. Please check printer.');
    } finally {
      setTimeout(() => setPrinting(false), 500);
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Confirm Print</DialogTitle>
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <IconX />
      </IconButton>

      <DialogContent dividers>
        <Typography variant="h6">
          Do you want to print <b>{visitors.length}</b> badges?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleConfirm} disabled={printing}>
          {printing ? <CircularProgress size={20} /> : 'Print'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrintDialogBulk;
