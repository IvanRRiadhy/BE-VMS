import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';

interface ApprovalVisitorGroupDialogProps {
    open: boolean;
    onClose: () => void;
    loading: boolean;
    data: any[];
    selectedRows: any[];
    setSelectedRows: React.Dispatch<React.SetStateAction<any[]>>;
    triggerCheckAll: boolean;
    selectedId?: string;
    onReject: (id: string) => void;
    onApprove: (id: string) => void;
    t: (key: string) => string;
}

export default function ApprovalVisitorGroupDialog({
    open,
    onClose,
    loading,
    data,
    selectedRows,
    setSelectedRows,
    triggerCheckAll,
    selectedId,
    onReject,
    onApprove,
    t,
}: ApprovalVisitorGroupDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth={false}
            PaperProps={{
                sx: {
                    width: '100vw',
                },
            }}
        >
            <DialogTitle>
                Visitor Group

                <IconButton
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                    onClick={onClose}
                >
                    <IconX />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: '0 !important' }}>
                <DynamicTable
                    loading={loading}
                    data={data}
                    selectedRows={selectedRows}
                    onCheckedChange={setSelectedRows}
                    setSelectedRows={setSelectedRows}
                    triggerCheckAll={triggerCheckAll}
                    isHaveChecked
                    titleHeader="Select visitors for approval or rejection"
                    isHaveHeaderTitle
                    isNoActionTableHead
                />
            </DialogContent>

            <DialogActions>
                <Button
                    fullWidth
                    color="error"
                    variant="contained"
                    onClick={(e) => {
                        e.stopPropagation();

                        if (!selectedId) return;

                        onReject(selectedId);
                        onClose();
                    }}
                >
                    {t('reject')}
                </Button>

                <Button
                    fullWidth
                    variant="contained"
                    onClick={(e) => {
                        e.stopPropagation();

                        if (!selectedId) return;

                        onApprove(selectedId);
                    }}
                >
                    {t('approve')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}