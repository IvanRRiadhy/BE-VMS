
// import {
//     Box,
//     Button,
//     Dialog,
//     DialogActions,
//     DialogContent,
//     DialogTitle,
//     Divider,
//     IconButton,
//     Typography,
// } from '@mui/material';
// import { IconDownload, IconX } from '@tabler/icons-react';
// import QRCode from 'react-qr-code';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';
// import { useRef, useState } from 'react';

// interface Props {
//     open: boolean;
//     onClose: () => void;
//     visitors: any[];
// }

// const VisitorBulkQRCodeDialog = ({
//     open,
//     onClose,
//     visitors,
// }: Props) => {
//     const contentRef = useRef<HTMLDivElement>(null);
//     const [exporting, setExporting] = useState(false);

//     const handleExportPdf = async () => {
//         if (!contentRef.current || visitors.length === 0) return;

//         setExporting(true);

//         try {
//             const cards = contentRef.current.querySelectorAll('.visitor-qr-card');
//             const pdf = new jsPDF('p', 'mm', 'a4');

//             for (let i = 0; i < cards.length; i++) {
//                 const canvas = await html2canvas(cards[i] as HTMLElement, {
//                     scale: 2,
//                     backgroundColor: '#ffffff',
//                     useCORS: true,
//                 });

//                 const image = canvas.toDataURL('image/png');
//                 const pageWidth = 190;
//                 const pageHeight = 277;

//                 const ratio = Math.min(
//                     pageWidth / canvas.width,
//                     pageHeight / canvas.height,
//                 );

//                 const width = canvas.width * ratio;
//                 const height = canvas.height * ratio;

//                 if (i > 0) pdf.addPage();

//                 pdf.addImage(
//                     image,
//                     'PNG',
//                     (210 - width) / 2,
//                     (297 - height) / 2,
//                     width,
//                     height,
//                 );
//             }

//             pdf.save('visitor-qr-codes.pdf');
//         } catch (error) {
//             console.error('Failed to export visitor QR PDF:', error);
//         } finally {
//             setExporting(false);
//         }
//     };

//     return (
//         <Dialog
//             open={open}
//             onClose={onClose}
//             fullWidth
//             maxWidth="md"
//         >
//             <DialogTitle
//                 display="flex"
//                 alignItems="center"
//                 justifyContent="space-between"
//             >
//                 Visitor QR Codes
//                 <IconButton onClick={onClose}>
//                     <IconX />
//                 </IconButton>
//             </DialogTitle>

//             <Divider />

//             <DialogContent>
//                 {/* <Typography color="text.secondary" mb={2}>
//                     {visitors.length} visitor selected
//                 </Typography> */}

//                 <Box ref={contentRef} display="flex" flexDirection="column" gap={2}>
//                     {visitors.map((visitor) => (
//                         <Box
//                             key={visitor.id}
//                             className="visitor-qr-card"
//                             sx={{
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 gap: 4,
//                                 p: 3,
//                                 border: '1px solid #ddd',
//                                 borderRadius: 2,
//                                 backgroundColor: '#fff',
//                                 color: '#222',
//                                 minHeight: 220,
//                                 breakInside: 'avoid',
//                             }}
//                         >
//                             {/* QR sebelah kiri */}
//                             <Box
//                                 width={190}
//                                 flexShrink={0}
//                                 display="flex"
//                                 flexDirection="column"
//                                 alignItems="center"
//                                 gap={1}
//                             >
//                                 <QRCode
//                                     value={visitor.invitation_code || ''}
//                                     size={160}
//                                     level="H"
//                                 />

//                                 <Typography
//                                     fontWeight={700}
//                                     fontSize={13}
//                                     color="#222"
//                                     textAlign="center"
//                                 >
//                                     {visitor.invitation_code || '-'}
//                                 </Typography>
//                             </Box>

//                             <Divider orientation="vertical" flexItem />

//                             {/* Data diri sebelah kanan */}
//                             <Box flex={1} minWidth={0}>
//                                 <Typography
//                                     fontWeight={700}
//                                     fontSize={18}
//                                     mb={2}
//                                     color="#055499"
//                                 >
//                                     Visitor Information
//                                 </Typography>

//                                 {[
//                                     ['Name', visitor.visitor_name],
//                                     ['Email', visitor.visitor_email],
//                                     ['Phone', visitor.visitor_phone],
//                                     ['Identity ID', visitor.visitor_identity_id],
//                                     ['Organization', visitor.visitor_organization_name],
//                                     ['Site', visitor.site_place_name],
//                                     ['Status', visitor.visitor_status],
//                                 ].map(([label, value]) => (
//                                     <Box
//                                         key={label}
//                                         display="flex"
//                                         gap={1}
//                                         mb={1}
//                                     >
//                                         <Typography
//                                             width={115}
//                                             fontSize={13}
//                                             fontWeight={600}
//                                             color="#555"
//                                         >
//                                             {label}
//                                         </Typography>
//                                         <Typography fontSize={13} color="#222">
//                                             : {value || '-'}
//                                         </Typography>
//                                     </Box>
//                                 ))}
//                             </Box>
//                         </Box>
//                     ))}
//                 </Box>
//             </DialogContent>

//             <DialogActions sx={{ p: 2 }}>
//                 {/* <Button onClick={onClose} color="inherit">
//                     Close
//                 </Button> */}

//                 <Button
//                     variant="contained"
//                     color="error"
//                     startIcon={<IconDownload />}
//                     onClick={handleExportPdf}
//                     disabled={exporting || visitors.length === 0}
//                 >
//                     {exporting ? 'Exporting...' : 'Export PDF'}
//                 </Button>
//             </DialogActions>
//         </Dialog>
//     );
// };

// export default VisitorBulkQRCodeDialog;



import { useRef, useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
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
import jsPDF from 'jspdf';
import GlobalBackdropLoading from 'src/customs/pages/admin/components/GlobalBackdrop';

interface VisitorBulkQRCodeDialogProps {
    open: boolean;
    onClose: () => void;
    visitors: any[];
    logoSrc?: string;
}

const VisitorBulkQRCodeDialog = ({
    open,
    onClose,
    visitors,
    logoSrc,
}: VisitorBulkQRCodeDialogProps) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const cardsRef = useRef<HTMLDivElement>(null);

    const handleDownloadPDF = async () => {
        if (!cardsRef.current || isGenerating || !visitors.length) return;

        setIsGenerating(true);

        try {
            const cards =
                cardsRef.current.querySelectorAll<HTMLElement>('.bulk-qr-card');

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a6',
            });

            for (let i = 0; i < cards.length; i++) {
                const canvas = await html2canvas(cards[i], {
                    scale: 3,
                    useCORS: true,
                    backgroundColor: '#FFFFFF',
                });

                const image = canvas.toDataURL('image/png');

                if (i > 0) pdf.addPage();

                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();

                const margin = 4;
                const maxWidth = pageWidth - margin * 2;
                const maxHeight = pageHeight - margin * 2;

                const ratio = Math.min(
                    maxWidth / canvas.width,
                    maxHeight / canvas.height,
                );

                const imageWidth = canvas.width * ratio;
                const imageHeight = canvas.height * ratio;

                const x = (pageWidth - imageWidth) / 2;
                const y = (pageHeight - imageHeight) / 2;

                pdf.addImage(
                    image,
                    'PNG',
                    x,
                    y,
                    imageWidth,
                    imageHeight,
                );
            }

            pdf.save('Visitor-QR-Codes.pdf');
        } catch (error) {
            console.error('Failed to generate QR PDF:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={isGenerating ? undefined : onClose}
            maxWidth="md"
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
                            Visitor QR Codes
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {visitors.length} selected visitor(s)
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
                    ref={cardsRef}
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, minmax(0, 1fr))',
                        },
                        gap: 3,
                        justifyItems: 'center',
                        py: 1,
                    }}
                >
                    {visitors.map((visitor, index) => {
                        const invitationCode = String(
                            visitor?.invitation_code ?? '',
                        ).trim();

                        return (
                            <Box
                                key={visitor.id ?? `${invitationCode}-${index}`}
                                className="bulk-qr-card"
                                sx={{
                                    position: 'relative',
                                    width: 340,
                                    maxWidth: '100%',
                                    height: 550,
                                    boxSizing: 'border-box',
                                    overflow: 'hidden',
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '24px',
                                    px: 3,
                                    pt: 4,
                                    pb: 3,
                                    textAlign: 'center',
                                    fontFamily: 'Arial, Helvetica, sans-serif',
                                    color: '#172B4D',
                                    boxShadow: '0 5px 24px rgba(30, 65, 100, 0.10)',
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
                                        mb: 3,
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
                                        mb: 3,
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
                                            <Typography
                                                variant="caption"
                                                color="error"
                                            >
                                                Invitation code unavailable
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

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

                                {/* <Typography
                                    sx={{
                                        position: 'absolute',
                                        zIndex: 2,
                                        bottom: 20,
                                        left: 0,
                                        right: 0,
                                        fontSize: 9,
                                        fontWeight: 600,
                                        letterSpacing: 2,
                                        color: '#718096',
                                    }}
                                >
                                    VISITOR MANAGEMENT SYSTEM
                                </Typography> */}
                            </Box>
                        );
                    })}
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
                    onClick={handleDownloadPDF}
                    disabled={!visitors.length || isGenerating}
                >
                    {isGenerating ? 'Generating...' : 'Download PDF'}
                </Button>
            </DialogActions>

            <GlobalBackdropLoading open={isGenerating} />
        </Dialog>
    );
};

export default VisitorBulkQRCodeDialog;
