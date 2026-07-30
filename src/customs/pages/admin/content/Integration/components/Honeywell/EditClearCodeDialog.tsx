
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Button,
    Box,
    IconButton,
    CircularProgress,
    Switch,
    FormControlLabel,
    Autocomplete,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "src/components/forms/theme-elements/CustomTextField";

interface EditClearCodeDialogProps {
    open: boolean;
    saving: boolean;
    isBatchEdit: boolean;

    clearCodeForm: any;
    setClearCodeForm: React.Dispatch<React.SetStateAction<any>>;

    enabled: any;
    setEnabled: React.Dispatch<React.SetStateAction<any>>;

    accessControlOptions: Array<{
        id: string;
        label: string;
    }>;

    onClose: () => void;
    onSubmit: () => void;
    onExited: () => void;
}


export default function EditClearCodeDialog({
    open,
    saving,
    isBatchEdit,
    clearCodeForm,
    setClearCodeForm,
    enabled,
    setEnabled,
    accessControlOptions,
    onClose,
    onSubmit,
    onExited,
}: EditClearCodeDialogProps) {
    return (
        <Dialog
            open={open}
            fullWidth
            maxWidth="md"
            transitionDuration={0}
            onClose={onClose}
            TransitionProps={{
                onExited,
            }}
        >
            <DialogTitle
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                Edit Clear Codes
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    disabled={saving}
                    sx={{ color: (t) => t.palette.grey[500] }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }} dividers>
                {!clearCodeForm ? (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            py: 4,
                        }}
                    >
                        <CircularProgress size={36} thickness={4} />
                    </Box>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        {/* === Editable === */}
                        <Box>
                            <Box
                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                            >
                                <CustomFormLabel htmlFor="cc_name" sx={{ mt: 0 }}>
                                    Name
                                </CustomFormLabel>
                                {isBatchEdit && (
                                    <FormControlLabel
                                        sx={{ m: 0 }}
                                        control={
                                            <Switch
                                                size="small"
                                                checked={enabled.name}
                                                onChange={(e) => setEnabled((p: any) => ({ ...p, name: e.target.checked }))}
                                            />
                                        }
                                        label=""
                                    />
                                )}
                            </Box>

                            <CustomTextField
                                id="cc_name"
                                value={clearCodeForm.name}
                                onChange={(e: any) =>
                                    setClearCodeForm((p: any) => ({ ...p, name: e.target.value }))
                                }
                                fullWidth
                                disabled={isBatchEdit ? !enabled.name || saving : saving}
                            />
                        </Box>

                        <Box>
                            <Box
                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                            >
                                <CustomFormLabel htmlFor="access_control_id" sx={{ mt: 0 }}>
                                    Access Control
                                </CustomFormLabel>
                                {isBatchEdit && (
                                    <FormControlLabel
                                        sx={{ m: 0 }}
                                        control={
                                            <Switch
                                                size="small"
                                                checked={enabled.access_control_id}
                                                onChange={(e) =>
                                                    setEnabled((p: any) => ({ ...p, access_control_id: e.target.checked }))
                                                }
                                            />
                                        }
                                        label=""
                                    />
                                )}
                            </Box>

                            <Autocomplete
                                fullWidth
                                autoHighlight
                                // disablePortal
                                options={accessControlOptions}
                                value={
                                    accessControlOptions.find(
                                        (o) => o.id === String(clearCodeForm.access_control_id ?? ''),
                                    ) || null
                                }
                                onChange={(_, newVal) =>
                                    setClearCodeForm((p: any) => ({
                                        ...p,
                                        access_control_id: newVal ? newVal.id : '',
                                    }))
                                }
                                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                                getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
                                renderInput={(params) => (
                                    <CustomTextField
                                        {...params}
                                        label=""
                                        size="small"
                                        disabled={isBatchEdit ? !enabled.access_control_id || saving : saving}
                                    />
                                )}
                            />
                        </Box>

                        {/* === Readonly (opsional) === */}
                        <Box>
                            <CustomFormLabel sx={{ mt: 0 }}>Description</CustomFormLabel>
                            <CustomTextField value={clearCodeForm.description} fullWidth disabled />
                        </Box>
                        <Box>
                            <CustomFormLabel sx={{ mt: 0 }}>Clearcode ID</CustomFormLabel>
                            <CustomTextField value={clearCodeForm.clearcode_id} fullWidth disabled />
                        </Box>
                        <Box>
                            <CustomFormLabel sx={{ mt: 0 }}>Honeywell ID</CustomFormLabel>
                            <CustomTextField value={clearCodeForm.honeywell_id} fullWidth disabled />
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={!clearCodeForm || saving}
                    onClick={onSubmit}
                >
                    Submit
                </Button>
            </DialogActions>

        </Dialog>
    );
}