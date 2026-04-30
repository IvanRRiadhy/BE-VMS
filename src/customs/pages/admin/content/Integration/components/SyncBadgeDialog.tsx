import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';

type Badge = {
  BadgeID: string;
  FirstName: string;
  LastName: string;
  BadgeType?: { description?: string };
  RowVersion?: string;
  IssueDate?: string;
  ExpireDate?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  data: Badge[];
  selected: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string) => void;
  onConfirm: () => void;
};

const SyncBadgeDialog = ({
  open,
  onClose,
  data,
  selected,
  onSelectAll,
  onSelectOne,
  onConfirm,
}: Props) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Confirm Badge Import To Employee
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <IconX />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selected.length === data.length && data.length > 0}
                  indeterminate={selected.length > 0 && selected.length < data.length}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Badge ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Row Version</TableCell>
              <TableCell>Issue Date</TableCell>
              <TableCell>Expire Date</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((badge) => (
              <TableRow key={badge.BadgeID} hover>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.includes(badge.BadgeID)}
                    onChange={() => onSelectOne(badge.BadgeID)}
                  />
                </TableCell>

                <TableCell>
                  {badge.FirstName} {badge.LastName}
                </TableCell>

                <TableCell>{badge.BadgeID}</TableCell>
                <TableCell>{badge.BadgeType?.description}</TableCell>
                <TableCell>{badge.RowVersion}</TableCell>
                <TableCell>{badge.IssueDate}</TableCell>
                <TableCell>{badge.ExpireDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>

        <Button variant="contained" onClick={onConfirm} disabled={selected.length === 0}>
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SyncBadgeDialog;
