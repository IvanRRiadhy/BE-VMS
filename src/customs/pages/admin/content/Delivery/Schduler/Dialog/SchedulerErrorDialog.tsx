import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';

interface Props {
  open: boolean;
  onClose: () => void;
  rows: any[];
}

export default function SchedulerErrorDialog({ open, onClose, rows }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>This Required Fields on visitor type</DialogTitle>

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
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
          <Table size="small" sx={{ minWidth: 650 }}>
            {/* HEADER */}
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell
                  colSpan={rows.length || 1}
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    textAlign: 'start',
                  }}
                >
                  Missing Field
                </TableCell>
              </TableRow>
            </TableHead>

            {/* BODY */}
            <TableBody>
              {rows.length > 0 ? (
                <TableRow
                  sx={{
                    '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                    '& td': { paddingY: 1.5 },
                  }}
                >
                  {rows.map((item, index) => (
                    <TableCell
                      key={index}
                      align="center"
                      sx={{
                        borderLeft: '1px solid #eee',
                        borderRight: index === rows.length - 1 ? 'none' : '1px solid #eee',
                        paddingX: 2,
                        fontSize: '0.95rem',
                      }}
                    >
                      {item.short_name}
                    </TableCell>
                  ))}
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={rows.length + 1}
                    align="center"
                    sx={{
                      padding: 3,
                      fontStyle: 'italic',
                      color: 'text.secondary',
                    }}
                  >
                    No missing field details.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
}
