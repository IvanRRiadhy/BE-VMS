// ImportErrorDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';

interface ImportErrorRow {
  msg?: string;
  data?: {
    card_number?: string;
    card_mac?: string;
    card_barcode?: string;
    card_status?: number;
    name?: string;
    remarks?: string;
    type?: string;
  };
}

interface ImportErrorDialogProps {
  open: boolean;
  title: string;
  rows: ImportErrorRow[];
  onClose: () => void;
}

const ImportErrorDialog = ({ open, title, rows, onClose }: ImportErrorDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{title}</DialogTitle>

      <IconButton
        aria-label="close"
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
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Card Number</TableCell>
                <TableCell>Card MAC</TableCell>
                <TableCell>Barcode</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((row, i) => {
                const d = row.data || {};

                const statusLabel =
                  d.card_status === 1
                    ? 'Active'
                    : d.card_status === 0
                      ? 'Inactive'
                      : (d.card_status ?? '-');

                return (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{row.msg || '-'}</TableCell>
                    <TableCell>{d.card_number ?? '-'}</TableCell>
                    <TableCell>{d.card_mac ?? '-'}</TableCell>
                    <TableCell>{d.card_barcode ?? '-'}</TableCell>
                    <TableCell align="center">{statusLabel}</TableCell>
                    <TableCell>{d.name ?? '-'}</TableCell>
                    <TableCell>{d.remarks ?? '-'}</TableCell>
                    <TableCell>{d.type ?? '-'}</TableCell>
                  </TableRow>
                );
              })}

              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No error details.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
};

export default ImportErrorDialog;
