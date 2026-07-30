import { Autocomplete, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, IconButton, Switch } from "@mui/material";
import { Box } from "@mui/system";
import { IconX } from "@tabler/icons-react";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "src/components/forms/theme-elements/CustomTextField";


interface EditCompanyDialogProps {
    open: boolean;
    saving: boolean;
    isBatchEdit: boolean;

    companyForm: any;
    setCompanyForm: React.Dispatch<React.SetStateAction<any>>;

    enabled: any;
    setEnabled: React.Dispatch<React.SetStateAction<any>>;

    orgOptions: Array<{ id: string; label: string }>;

    onClose: () => void;
    onSubmit: () => void;
    onExited?: () => void;
}

const EditCompanyDialog = ({
    open,
    saving,
    isBatchEdit,
    companyForm,
    setCompanyForm,
    enabled,
    setEnabled,
    orgOptions,
    onClose,
    onSubmit,
    onExited,
}: EditCompanyDialogProps) => {
    return (
        <Dialog
            open={open}
            transitionDuration={0}
            keepMounted
            fullWidth
            maxWidth="md"
            onClose={onClose}
            TransitionProps={{
                onExited,
            }}
        >
            <DialogTitle
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                Edit Company
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    disabled={saving}
                    sx={{ color: (t) => t.palette.grey[500] }}
                >
                    <IconX />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }} dividers>
                {!companyForm ? (
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
                        <Box>
                            <Box
                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                            >
                                <CustomFormLabel htmlFor="name" sx={{ mt: 0 }}>
                                    Name
                                </CustomFormLabel>

                                {/* Toggle hanya muncul saat batch */}
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
                                id="name"
                                value={companyForm?.name ?? ''}
                                onChange={(e: any) =>
                                    setCompanyForm((p: any) => ({ ...p, name: e.target.value }))
                                }
                                fullWidth
                                // single: aktif, batch: tergantung toggle
                                disabled={isBatchEdit ? !enabled.name || saving : saving}
                            />
                        </Box>

                        <Box>
                            <Box
                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                            >
                                <CustomFormLabel htmlFor="organization_id" sx={{ mt: 0 }}>
                                    Organization
                                </CustomFormLabel>

                                {/* Toggle hanya muncul saat batch */}
                                {isBatchEdit && (
                                    <FormControlLabel
                                        sx={{ m: 0 }}
                                        control={
                                            <Switch
                                                size="small"
                                                checked={enabled.organization_id}
                                                onChange={(e) =>
                                                    setEnabled((p: any) => ({ ...p, organization_id: e.target.checked }))
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
                                disablePortal
                                options={orgOptions}
                                value={
                                    orgOptions.find((o) => o.id === String(companyForm?.organization_id ?? '')) ||
                                    null
                                }
                                onChange={(_, newVal) =>
                                    setCompanyForm((p: any) => ({ ...p, organization_id: newVal ? newVal.id : '' }))
                                }
                                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                                getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
                                renderInput={(params) => (
                                    <CustomTextField
                                        {...params}
                                        label=""
                                        size="small"
                                        disabled={isBatchEdit ? !enabled.organization_id || saving : saving}
                                    />
                                )}
                                // single: aktif, batch: tergantung toggle
                                disabled={isBatchEdit ? !enabled.organization_id || saving : saving}
                            />
                        </Box>

                        {/* === Readonly info (opsional) === */}
                        <Box>
                            <CustomFormLabel sx={{ mt: 0 }}>Address</CustomFormLabel>
                            <CustomTextField value={companyForm.address} fullWidth disabled />
                        </Box>
                        <Box>
                            <CustomFormLabel sx={{ mt: 0 }}>City</CustomFormLabel>
                            <CustomTextField value={companyForm.city} fullWidth disabled />
                        </Box>
                        <Box>
                            <CustomFormLabel sx={{ mt: 0 }}>State</CustomFormLabel>
                            <CustomTextField value={companyForm.state} fullWidth disabled />
                        </Box>
                        <Box>
                            <CustomFormLabel sx={{ mt: 0 }}>ZIP</CustomFormLabel>
                            <CustomTextField value={companyForm.zip} fullWidth disabled />
                        </Box>
                        <Box>
                            <CustomFormLabel sx={{ mt: 0 }}>Description</CustomFormLabel>
                            <CustomTextField value={companyForm.description} fullWidth disabled />
                        </Box>
                        <Box>
                            <CustomFormLabel sx={{ mt: 0 }}>Company ID</CustomFormLabel>
                            <CustomTextField value={companyForm.company_id} fullWidth disabled />
                        </Box>
                        <Box>
                            <CustomFormLabel sx={{ mt: 0 }}>Honeywell ID</CustomFormLabel>
                            <CustomTextField value={companyForm.honeywell_id} fullWidth disabled />
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
                    disabled={!companyForm || saving}
                    onClick={onSubmit}
                >
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditCompanyDialog;