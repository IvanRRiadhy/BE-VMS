import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    IconButton,
} from "@mui/material";
import { IconX } from "@tabler/icons-react";
import html2canvas from "html2canvas";
import { useRef } from "react";
import QRCode from "react-qr-code";

interface Props {
    open: boolean;
    onClose: () => void;
    visitorDetail: any;
}

const VisitorQrCodeDialog = ({
    open,
    onClose,
    visitorDetail,
}: Props) => {
    const visitorNumber = visitorDetail?.visitor_number ?? "";
    const invitationCode = visitorDetail?.invitation_code ?? "";


    const qrRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (!qrRef.current) return;

        const canvas = await html2canvas(qrRef.current, {
            backgroundColor: "#ffffff",
            scale: 3, // hasil lebih tajam
            useCORS: true,
        });

        const link = document.createElement("a");
        link.download = `visitor-${visitorNumber}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    return (
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>
          Visitor QR Code
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
        </DialogTitle>

        <DialogContent dividers>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            bgcolor="#fff"
            py={2}
            p={2}
            borderRadius={2}
          >
            <Box bgcolor="#fff" p={2} borderRadius={2} ref={qrRef}>
              <QRCode value={visitorNumber} size={220} viewBox="0 0 256 256" />
            </Box>

            <Typography mt={2} variant="body2">
              Invitation Code
            </Typography>

            <Typography variant="h6" fontWeight={700}>
              {invitationCode}
            </Typography>

            <Typography mt={2} variant="body2">
              Visitor Number
            </Typography>

            <Typography variant="h6" fontWeight={700}>
              {visitorNumber}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="contained" onClick={handleDownload} fullWidth>
            Download Qr Code
          </Button>
        </DialogActions>
      </Dialog>
    );
};

export default VisitorQrCodeDialog;