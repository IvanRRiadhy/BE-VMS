
import { useRef, useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
    CircularProgress,
} from '@mui/material';
import {
    IconDownload,
    IconX,
    IconQrcode,
} from '@tabler/icons-react';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import { useTranslation } from 'react-i18next';

interface VisitorQRCodeDialogProps {
    open: boolean;
    onClose: () => void;
    visitor: any;
    logoSrc?: string;
}

const VisitorQRCodeDialog = ({
    open,
    onClose,
    visitor,
    logoSrc,
}: VisitorQRCodeDialogProps) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    const invitationCode = String(
        visitor?.invitation_code ?? '',
    ).trim();

    const handleDownload = async () => {
        if (!cardRef.current || !invitationCode || isGenerating) return;

        setIsGenerating(true);

        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#FFFFFF',
            });

            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `Visitor-QR-${invitationCode}.png`;
            link.click();
        } catch (error) {
            console.error('Failed to download visitor QR:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={isGenerating ? undefined : onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    overflow: 'hidden',
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    py: 2,
                }}
            >
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                        sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 2,
                            bgcolor: '#E8F2FC',
                            color: '#1976C9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <IconQrcode size={23} />
                    </Box>

                    <Box>
                        <Typography fontWeight={700} fontSize={17}>
                            Visitor QR Code
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {visitor?.visitor_name || 'Visitor'}
                        </Typography>
                    </Box>
                </Box>

                <IconButton onClick={onClose} disabled={isGenerating}>
                    <IconX />
                </IconButton>
            </DialogTitle>

            <DialogContent
                sx={{
                    bgcolor: '#F5F7FA',
                    p: { xs: 2, sm: 3 },
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        py: 1,
                    }}
                >
                    <Box
                        ref={cardRef}
                        sx={{
                            position: 'relative',
                            width: 340,
                            maxWidth: '100%',
                            minHeight: 550,
                            boxSizing: 'border-box',
                            overflow: 'hidden',
                            bgcolor: '#FFFFFF',
                            borderRadius: '24px',
                            px: 3,
                            pt: 4,
                            pb: 3,
                            textAlign: 'center',
                            fontFamily: 'Arial, Helvetica, sans-serif',
                            color: '#172B4D',
                            border: '1px solid #E3EDF9',
                        }}
                    >
                        {/* Top decoration */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: 115,
                                height: 105,
                                overflow: 'hidden',
                                pointerEvents: 'none',
                            }}
                        >
                            <Box
                                sx={{
                                    position: 'absolute',
                                    width: 150,
                                    height: 45,
                                    top: 5,
                                    left: -40,
                                    bgcolor: '#E8F2FC',
                                    transform: 'rotate(-28deg)',
                                    borderRadius: '0 0 50px 0',
                                }}
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    width: 155,
                                    height: 80,
                                    top: -42,
                                    left: -45,
                                    bgcolor: '#1976C9',
                                    transform: 'rotate(-28deg)',
                                    borderRadius: '0 0 70px 0',
                                }}
                            />
                        </Box>

                        {/* Bottom decoration */}
                        <Box
                            sx={{
                                position: 'absolute',
                                right: 0,
                                bottom: 0,
                                width: 120,
                                height: 100,
                                overflow: 'hidden',
                                pointerEvents: 'none',
                            }}
                        >
                            <Box
                                sx={{
                                    position: 'absolute',
                                    width: 160,
                                    height: 65,
                                    right: -55,
                                    bottom: -35,
                                    bgcolor: '#1976C9',
                                    transform: 'rotate(-28deg)',
                                    borderRadius: '70px 0 0 0',
                                }}
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    width: 145,
                                    height: 42,
                                    right: -45,
                                    bottom: 5,
                                    bgcolor: '#E8F2FC',
                                    transform: 'rotate(-28deg)',
                                    borderRadius: '60px 0 0 0',
                                }}
                            />
                        </Box>

                        {/* Header */}
                        <Box
                            sx={{
                                position: 'relative',
                                zIndex: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                mb: 2,
                            }}
                        >
                            {logoSrc ? (
                                <Box
                                    component="img"
                                    src={logoSrc}
                                    alt="Logo"
                                    crossOrigin="anonymous"
                                    sx={{
                                        width: 70,
                                        height: 70,
                                        objectFit: 'contain',
                                        mb: 1.5,
                                    }}
                                />
                            ) : (
                                <Box
                                    sx={{
                                        width: 70,
                                        height: 70,
                                        borderRadius: '50%',
                                        bgcolor: '#E8F2FC',
                                        color: '#1976C9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mb: 1.5,
                                    }}
                                >
                                    <IconQrcode size={36} />
                                </Box>
                            )}

                            <Typography
                                sx={{
                                    fontSize: 16,
                                    fontWeight: 700,
                                    letterSpacing: 2.5,
                                    color: '#16365C',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Visitor Code
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: 10,
                                    color: '#718096',
                                    letterSpacing: 1.5,
                                    mt: 0.5,
                                }}
                            >
                                SCAN YOUR QR CODE
                            </Typography>
                        </Box>

                        {/* QR Code */}
                        <Box
                            sx={{
                                position: 'relative',
                                zIndex: 2,
                                display: 'flex',
                                justifyContent: 'center',
                                mb: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 210,
                                    height: 210,
                                    p: 2,
                                    boxSizing: 'border-box',
                                    bgcolor: '#FFFFFF',
                                    border: '2px solid #E3EDF9',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {invitationCode ? (
                                    <QRCode
                                        value={invitationCode}
                                        size={174}
                                        level="H"
                                        bgColor="#FFFFFF"
                                        fgColor="#000000"
                                    />
                                ) : (
                                    <Typography variant="caption" color="error">
                                        Invitation code unavailable
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        {/* Visitor Name */}
                        <Typography
                            sx={{
                                position: 'relative',
                                zIndex: 2,
                                fontSize: 17,
                                fontWeight: 700,
                                color: '#16365C',
                                mt: 1,
                                mb: 1,
                                textAlign: 'center',
                                overflowWrap: 'anywhere',
                            }}
                        >
                            {visitor?.visitor_name || 'Visitor Name'}
                        </Typography>

                        {/* Invitation label */}
                        <Typography
                            sx={{
                                position: 'relative',
                                zIndex: 2,
                                fontSize: 11,
                                fontWeight: 600,
                                letterSpacing: 2.5,
                                color: '#718096',
                                textTransform: 'uppercase',
                                mb: 1,
                            }}
                        >
                            Invitation Code
                        </Typography>

                        {/* Invitation code */}
                        <Box
                            sx={{
                                position: 'relative',
                                zIndex: 2,
                                width: '100%',
                                minHeight: 65,
                                px: 2,
                                boxSizing: 'border-box',
                                bgcolor: '#F1F6FD',
                                borderRadius: '16px',
                                border: '1px solid #E3EDF9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: 19,
                                    fontWeight: 700,
                                    letterSpacing: 1.5,
                                    color: '#172F50',
                                    lineHeight: 1.3,
                                    wordBreak: 'break-word',
                                }}
                            >
                                {invitationCode || '-'}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions
                sx={{
                    px: 3,
                    py: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={
                        isGenerating ? (
                            <CircularProgress size={17} color="inherit" />
                        ) : (
                            <IconDownload size={18} />
                        )
                    }
                    onClick={handleDownload}
                    disabled={!invitationCode || isGenerating}
                >
                    {isGenerating ? 'Generating...' : 'Download QR Code'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default VisitorQRCodeDialog;
