import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Snackbar,
} from '@mui/material';
import { Box, fontSize, fontWeight, textAlign } from '@mui/system';
import { IconX } from '@tabler/icons-react';
import { render, Printer, Text, Line, Br, Row, QRCode, Cut, Image } from 'react-thermal-printer';

import QRCODE from 'react-qr-code';

import { axiosInstance2 } from 'src/customs/api/interceptor';
import moment from 'moment';
import { useState } from 'react';
import { showSwal } from 'src/customs/components/alerts/alerts';
// import { serial } from 'node:serialport';

const PrintDialog = ({ open, onClose, invitationData, printData }: any) => {
  function uint8ToBase64(u8: Uint8Array) {
    let binary = '';
    for (let i = 0; i < u8.length; i++) {
      binary += String.fromCharCode(u8[i]);
    }
    return btoa(binary);
  }

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  const COL = printData?.printer_paper_size === 80 ? 24 : 16;
  const row = (l = '', r = '') => `${l.padEnd(COL, ' ')}${r.padStart(COL, ' ')}`;

  const [printing, setPrinting] = useState(false);

  // const handlePrint = async () => {
  //   if (!printData) return;

  //   const escpos = await render(
  //     // <BadgePrinter printData={printData} invitationData={invitationData} />,
  //     <Printer type="epson" width={printData.printer_paper_size || 58} characterSet="korea">
  //       {/* <Br /> */}
  //       <Text size={{ width: 2, height: 2 }} align="center">
  //         General Visitor
  //       </Text>

  //       <Image
  //         src={`${axiosInstance2.defaults.baseURL}/cdn/${printData.logo}`}
  //         align="center"
  //         // height={30}
  //         width={80}
  //       />
  //       <br />
  //       <Text bold>Name</Text>
  //       <Text>{invitationData?.visitor_name ?? '-'}</Text>
  //       <Text bold>Phone</Text>
  //       <Text>{invitationData?.visitor_phone ?? '-'}</Text>

  //       {/* <Br /> */}

  //       <Text bold>Organization / Company</Text>
  //       <Text>{invitationData?.visitor_organization_name ?? '-'}</Text>

  //       {/* <Line /> */}

  //       <Text>------------------------------</Text>

  //       <Text align="center" bold>
  //         {invitationData?.site_place_name ?? '-'}
  //       </Text>

  //       <Br />

  //       <QRCode content={invitationData?.invitation_code ?? '-'} align="center" cellSize={8} />

  //       <Br />

  //       <Text align="center">Show this while visiting</Text>

  //       <Text align="center" bold>
  //         ID : {invitationData?.visitor_number ?? '-'}
  //       </Text>

  //       <Text>------------------------------</Text>

  //       {/* <Row left={<Text bold>Agenda</Text>} right={<Text bold>Host</Text>} /> */}
  //       <Text bold>{row('Agenda', 'Host')}</Text>
  //       <Text>{row(invitationData?.agenda ?? '-', invitationData?.host_name ?? '-')}</Text>
  //       {/* <Row
  //         left={<Text>{invitationData?.agenda ?? '-'}</Text>}
  //         right={<Text>{invitationData?.host_name ?? '-'} </Text>}
  //       /> */}

  //       {/* <Br /> */}

  //       <Text bold>{row('Arrive', 'Until')}</Text>
  //       <Text>
  //         {row(arriveTime ?? '-', formatDateTimes(invitationData?.visitor_period_end) ?? '-')}
  //       </Text>

  //       {/* <Text bold>Arrive</Text>
  //       <Text>{formatDateTime(invitationData?.visitor_period_start) ?? '-'}</Text>

  //       <Text bold>Until</Text>
  //       <Text>{formatDateTime(invitationData?.visitor_period_end) ?? '-'}</Text> */}

  //       {/* <Row left={<Text bold>Arrive</Text>} right={<Text bold>Until</Text>} />

  //       <Row
  //         left={formatDateTimes(invitationData?.visitor_period_start) ?? '-'}
  //         right={formatDateTimes(invitationData?.visitor_period_end) ?? '-'}
  //       /> */}
  //       {/* <Br /> */}

  //       <Text>------------------------------</Text>
  //       <Text align="center">{printData.footer_text}</Text>

  //       <Cut />
  //     </Printer>,
  //   );

  //   const base64 = uint8ToBase64(escpos);
  //   await fetch('http://localhost:5147/print', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ data: base64 }),
  //   });
  // };

  const arriveTime = moment()
    .utcOffset(7 * 60)
    .format('DDMMMY,HH:mm');

  const handlePrint = async () => {
    if (!printData || printing) return;

    setPrinting(true);

    try {
      const arriveTime = moment()
        .utcOffset(7 * 60)
        .format('DDMMMY,HH:mm');

      const escpos = await render(
        <Printer type="epson" width={printData.printer_paper_size || 58} characterSet="korea">
          <Text size={{ width: 2, height: 2 }} align="center">
            General Visitor
          </Text>

          <Image
            src={`${axiosInstance2.defaults.baseURL}/cdn/${printData.logo}`}
            align="center"
            width={80}
          />

          <Text bold>Name</Text>
          <Text>{invitationData?.visitor_name ?? '-'}</Text>

          <Text bold>Phone</Text>
          <Text>{invitationData?.visitor_phone ?? '-'}</Text>

          <Text bold>Organization / Company</Text>
          <Text>{invitationData?.visitor_organization_name ?? '-'}</Text>

          <Text>------------------------------</Text>

          <Text align="center" bold>
            {invitationData?.site_place_name ?? '-'}
          </Text>

          <Br />

          <QRCode content={invitationData?.invitation_code ?? '-'} align="center" cellSize={8} />

          <Br />

          <Text align="center">Show this while visiting</Text>

          <Text align="center" bold>
            ID : {invitationData?.visitor_number ?? '-'}
          </Text>

          <Text>------------------------------</Text>

          <Text bold>{row('Agenda', 'Host')}</Text>
          <Text>{row(invitationData?.agenda ?? '-', invitationData?.host_name ?? '-')}</Text>

          <Text bold>{row('Arrive', 'Until')}</Text>
          <Text>{row(arriveTime, formatDateTimes(invitationData?.visitor_period_end) ?? '-')}</Text>

          <Text>------------------------------</Text>
          <Text align="center">{printData.footer_text}</Text>

          <Br />
          <Cut partial />
        </Printer>,
      );

      const base64 = uint8ToBase64(escpos);

      const res = await fetch('http://localhost:5147/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: base64 }),
      });

      if (!res.ok) {
        throw new Error('Printer service error');
      }

      // OPTIONAL: toast kecil saja
      // toast.success('Printed');
    } catch (err) {
      console.error('PRINT ERROR:', err);
      // alert('Failed to print. Please check printer connection.');
      showSwal('error', 'Failed to print. Please check printer connection.');
    } finally {
      setTimeout(() => {
        setPrinting(false);
      }, 500);
    }
  };

  const formatDateTimes = (dateStr?: string, extendMinutes = 0) => {
    if (!dateStr) return '-';

    const base = moment.utc(dateStr);

    if (extendMinutes !== 0) {
      base.add(extendMinutes, 'minutes');
    }

    // Konversi manual ke waktu lokal (WIB)
    return base
      .local()
      .utcOffset(7 * 60)
      .format('DDMMMY,HH:mm');
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Preview</DialogTitle>

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
        <Box>
          <Text
            style={{
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '30px',
              marginBottom: '30px',
            }}
          >
            General Visitor
          </Text>
          {printData && (
            <Image
              src={`${axiosInstance2.defaults.baseURL}/cdn/${printData.logo}`}
              align="center"
              height={100}
              width={100}
              style={{ display: 'block', margin: '0 auto' }}
            />
          )}
          <br />
          <Text
            style={{ fontWeight: 'bold', fontSize: '16px', marginTop: '10px', marginBottom: '5px' }}
          >
            Name
          </Text>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>{invitationData?.visitor_name ?? '-'}</Text>
            {/* <Text bold>Phone</Text> */}
            <Text>{invitationData?.visitor_phone ?? '-'}</Text>
          </Box>

          <Br />

          <Text style={{ fontWeight: 'bold', fontSize: '16px' }}>Organization / Company</Text>
          <Text>{invitationData?.visitor_organization_name ?? '-'}</Text>
          <br />

          {/* <Line />
           */}

          <Divider
            sx={{
              borderStyle: 'dashed',
              borderWidth: 2,
              borderColor: 'gray',
            }}
          />

          <Text
            align="center"
            style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', marginTop: '15px' }}
          >
            {invitationData?.site_place_name ?? '-'}
          </Text>

          <Br />

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <QRCODE value={invitationData?.invitation_code ?? '-'} size={150} />
          </Box>

          <Br />

          <Text align="center" style={{ textAlign: 'center' }}>
            Show this while visiting
          </Text>

          <Text
            align="center"
            style={{ textAlign: 'center', fontWeight: 'bold', margin: '10px 0' }}
          >
            ID : {invitationData?.visitor_number ?? '-'}
          </Text>

          {/* <Line /> */}

          <Divider
            sx={{
              borderStyle: 'dashed',
              borderWidth: 2,
              borderColor: 'gray',
            }}
          />
          <Br />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: 'bold' }}>Agenda</Text>
            <Text style={{ fontWeight: 'bold' }}>Host</Text>
          </Box>
          {/* <Row left="Agenda" right="Host" />*/}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <Text>{invitationData?.agenda ?? '-'}</Text>
            <Text>{invitationData?.host_name ?? '-'}</Text>
          </Box>
          {/* <Row left={invitationData?.agenda ?? '-'} right={invitationData?.host_name ?? '-'} /> */}

          {/* <Br /> */}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <Text style={{ fontWeight: 'bold' }}>Arrive</Text>
            <Text style={{ fontWeight: 'bold' }}>Until</Text>
          </Box>
          {/* <Row left="Agenda" right="Host" />*/}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            {/* <Text>{formatDateTimes(invitationData?.visitor_period_start) ?? '-'}</Text> */}
            <Text>{'-'}</Text>
            <Text>{formatDateTimes(invitationData?.visitor_period_end) ?? '-'}</Text>
          </Box>
          {/* <Row left="Arrive" right="Until" />
          <Row
            left={formatDateTime(invitationData?.visitor_period_start) ?? '-'}
            right={formatDateTime(invitationData?.visitor_period_end) ?? '-'}
          /> */}
          <Br />
          {/* <Line /> */}

          <Divider
            sx={{
              borderStyle: 'dashed',
              borderWidth: 2,
              borderColor: 'gray',
            }}
          />
          <Br />
          {printData && (
            <>
              <Text align="center" style={{ textAlign: 'center' }}>
                {printData.footer_text}
              </Text>
            </>
          )}

          <Cut />
        </Box>

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handlePrint}
          disabled={printing}
        >
          {printing ? <CircularProgress size={20} color="inherit" /> : 'Print'}
        </Button>
      </DialogContent>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ zIndex: 2000 }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default PrintDialog;
