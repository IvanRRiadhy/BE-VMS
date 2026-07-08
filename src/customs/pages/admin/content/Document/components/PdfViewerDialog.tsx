import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';

interface PdfViewerDialogProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  title?: string;
}

const PdfViewerDialog = ({ open, onClose, pdfUrl, title = 'View PDF' }: PdfViewerDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
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
        <CloseIcon />
      </IconButton>

      <DialogContent dividers sx={{ height: '80vh' }}>
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            title={title}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewerDialog;
