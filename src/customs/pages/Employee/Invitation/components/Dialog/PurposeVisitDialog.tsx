import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  Table,
  TableBody,
  Box,
  Button,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';

type Props = {
  open: boolean;
  onClose: () => void;
  visitorIndex: number;
  selfForms: any[];
  renderDetailRows: any;
  onChangeField: (idx: number, fieldKey: string, value: any) => void;
  onSave: () => void;
};

const PurposeVisitDialog = ({
  open,
  onClose,
  visitorIndex,
  selfForms,
  renderDetailRows,
  onChangeField,
  onSave,
}: Props) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Purpose Visit - Visitor {Number(visitorIndex) + 1}
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
      </DialogTitle>

      <DialogContent dividers sx={{ pt: '0 !important' }}>
        <Grid mb={2} width={'100%'}>
          <Table>
            <TableBody>
              {renderDetailRows(
                selfForms,
                (idx: number, fieldKey: string, value: any) => {
                  onChangeField(idx, fieldKey, value);
                },
                undefined,
                true,
              )}
            </TableBody>
          </Table>
        </Grid>

        <Box textAlign="right" mt={2}>
          <Button variant="contained" onClick={onSave}>
            Save
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PurposeVisitDialog;
