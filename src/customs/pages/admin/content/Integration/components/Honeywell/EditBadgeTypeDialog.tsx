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

interface EditBadgeTypeDialogProps {
    open: boolean;
    saving: boolean;
    isBatchEdit: boolean;

    badgeTypeForm: any;
    setBadgeTypeForm: React.Dispatch<React.SetStateAction<any>>;

    enabled: any;
    setEnabled: React.Dispatch<React.SetStateAction<any>>;

    visitorTypeOptions: any[];

    onClose: () => void;
    onSubmit: () => void;
    onExited: () => void;
}

export default function EditBadgeTypeDialog({
    open,
    saving,
    isBatchEdit,
    badgeTypeForm,
    setBadgeTypeForm,
    enabled,
    setEnabled,
    visitorTypeOptions,
    onClose,
    onSubmit,
    onExited,
}: EditBadgeTypeDialogProps) {
    return (
        <Dialog
            open={open}
            transitionDuration={0}
            fullWidth
            maxWidth="md"
            onClose={onClose}
            TransitionProps={{
                onExited,
            }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                Edit Badge Type

                <IconButton
                    onClick={onClose}
                    disabled={saving}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>



            <DialogContent sx={{ pt: 2 }} dividers>
                {!badgeTypeForm ? (
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
                                <CustomFormLabel htmlFor="bt_name" sx={{ mt: 0 }}>
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
                                id="bt_name"
                                value={badgeTypeForm.name}
                                onChange={(e: any) =>
                                    setBadgeTypeForm((p: any) => ({ ...p, name: e.target.value }))
                                }
                                fullWidth
                                disabled={isBatchEdit ? !enabled.name || saving : saving}
                            />
                        </Box>

                        <Box>
                            <Box
                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                            >
                                <CustomFormLabel htmlFor="visitor_type_id" sx={{ mt: 0 }}>
                                    Visitor Type
                                </CustomFormLabel>
                                {isBatchEdit && (
                                    <FormControlLabel
                                        sx={{ m: 0 }}
                                        control={
                                            <Switch
                                                size="small"
                                                checked={enabled.visitor_type_id}
                                                onChange={(e) =>
                                                    setEnabled((p: any) => ({ ...p, visitor_type_id: e.target.checked }))
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
                                options={visitorTypeOptions}
                                value={
                                    visitorTypeOptions.find(
                                        (o) => o.id === String(badgeTypeForm.visitor_type_id ?? ''),
                                    ) || null
                                }
                                onChange={(_, newVal) =>
                                    setBadgeTypeForm((p: any) => ({
                                        ...p,
                                        visitor_type_id: newVal ? newVal.id : '',
                                    }))
                                }
                                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                                getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
                                renderInput={(params) => (
                                    <CustomTextField
                                        {...params}
                                        label=""
                                        size="small"
                                        disabled={isBatchEdit ? !enabled.visitor_type_id || saving : saving}
                                    />
                                )}
                            />
                        </Box>

                        {/* === Readonly (opsional ditampilkan) === */}
                        <Box>
                            <CustomFormLabel sx={{ mt: 0 }}>Description</CustomFormLabel>
                            <CustomTextField value={badgeTypeForm.description} fullWidth disabled />
                        </Box>
                        <Box>
                            <CustomFormLabel sx={{ mt: 0 }}>Badge Type ID</CustomFormLabel>
                            <CustomTextField value={badgeTypeForm.badge_type_id} fullWidth disabled />
                        </Box>
                        <Box>
                            <CustomFormLabel sx={{ mt: 0 }}>Honeywell ID</CustomFormLabel>
                            <CustomTextField value={badgeTypeForm.honeywell_id} fullWidth disabled />
                        </Box>
                    </Box>
                )}
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={onClose}
                    disabled={saving}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    disabled={!badgeTypeForm || saving}
                    onClick={onSubmit}
                >
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
}