import { Box, Dialog, DialogContent, DialogTitle, LinearProgress, Typography } from '@mui/material';
import { IconScan } from '@tabler/icons-react';
import { styled, keyframes } from '@mui/material/styles';

interface ScanningDialogProps {
    open: boolean;
    title?: string;
    description?: string;
}

const scanPulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
`;

const ScanContainer = styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
    gap: 16,
}));


const ScanIcon = styled(IconScan)(() => ({
    animation: `${scanPulse} 1.2s infinite ease-in-out`,
}));

const ScanningDialog = ({
    open,
    title = 'Scanning Document',
    description = 'Please wait a moment',
}: ScanningDialogProps) => {
    return (
        <Dialog open={open} fullWidth maxWidth="sm">
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dividers>
                <ScanContainer>
                    <ScanIcon size={48} />
                    <Typography variant="h6">
                        Scanning document...
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {description}
                    </Typography>
                    <LinearProgress sx={{ width: 220 }} />
                </ScanContainer>
            </DialogContent>
        </Dialog>
    );
};

export default ScanningDialog;