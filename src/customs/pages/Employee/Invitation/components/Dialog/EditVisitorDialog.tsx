import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    Grid2 as Grid,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';

interface EditVisitorDialogProps {
    open: boolean;
    visitor: any;
    loading?: boolean;
    onClose: () => void;
    onSubmit: (data: {
        visitor_name?: string;
        visitor_identity_id?: string;
        edit_reason: string;
    }) => void;
}

const EditVisitorDialog = ({
    open,
    visitor,
    loading = false,
    onClose,
    onSubmit,
}: EditVisitorDialogProps) => {
    const [formData, setFormData] = useState({
        visitor_name: '',
        visitor_identity_id: '',
        edit_reason: '',
    });

    useEffect(() => {
        if (open && visitor) {
            setFormData({
                visitor_name: visitor.visitor_name === '-' ? '' : visitor.visitor_name ?? '',
                visitor_identity_id:
                    visitor.visitor_identity_id === '-' ? '' : visitor.visitor_identity_id ?? '',
                edit_reason: '',
            });
        }
    }, [open, visitor]);

    const handleSubmit = () => {
        const payload = {
            ...(formData.visitor_name.trim() && {
                visitor_name: formData.visitor_name.trim(),
            }),
            ...(formData.visitor_identity_id.trim() && {
                visitor_identity_id: formData.visitor_identity_id.trim(),
            }),
            edit_reason: formData.edit_reason.trim(),
        };

        onSubmit(payload);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Edit Visitor
                <IconButton
                    onClick={onClose}
                    disabled={loading}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <IconX size={20} />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        <CustomFormLabel>Visitor Name</CustomFormLabel>
                        <TextField
                            fullWidth
                            size="small"
                            value={formData.visitor_name}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    visitor_name: e.target.value,
                                }))
                            }
                            placeholder="Enter visitor name"
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <CustomFormLabel>Identity ID</CustomFormLabel>
                        <TextField
                            fullWidth
                            size="small"
                            value={formData.visitor_identity_id}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    visitor_identity_id: e.target.value,
                                }))
                            }
                            placeholder="Enter identity ID"
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <CustomFormLabel>Edit Reason</CustomFormLabel>
                        <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            size="small"
                            value={formData.edit_reason}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    edit_reason: e.target.value,
                                }))
                            }
                            placeholder="Enter reason for editing"
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button color="secondary" onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditVisitorDialog;