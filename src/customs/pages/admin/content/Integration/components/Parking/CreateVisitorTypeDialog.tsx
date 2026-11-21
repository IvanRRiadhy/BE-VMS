
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid2 as Grid,
    Switch,
    FormControlLabel,
    Autocomplete,
    CircularProgress,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

interface VisitorTypeOption {
    id: string;
    label: string;
}

interface Props {
    open: boolean;
    saving: boolean;
    options: VisitorTypeOption[];
    loadingOptions?: boolean;
    selectedVisitorTypes: VisitorTypeOption[];
    active: boolean;
    onClose: () => void;
    onSubmit: () => void;
    setSelectedVisitorTypes: (value: VisitorTypeOption[]) => void;
    setActive: (value: boolean) => void;
}

const CreateVisitorTypeParkingDialog = ({
    open,
    saving,
    options,
    loadingOptions = false,
    selectedVisitorTypes,
    active,
    onClose,
    onSubmit,
    setSelectedVisitorTypes,
    setActive,
}: Props) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                Create Visitor Type
                <IconButton
                    onClick={onClose}
                    disabled={saving}
                    sx={{ position: 'absolute', right: 12, top: 12 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid size={12}>
                        <CustomFormLabel>
                            Visitor Type <span style={{ color: 'red' }}>*</span>
                        </CustomFormLabel>

                        <Autocomplete
                            multiple
                            options={options}
                            value={selectedVisitorTypes}
                            loading={loadingOptions}
                            onChange={(_, value) => setSelectedVisitorTypes(value)}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            getOptionLabel={(option) => option.label}
                            renderInput={(params) => (
                                <CustomTextField
                                    {...params}
                                    placeholder="Select Visitor Type"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loadingOptions && <CircularProgress size={18} />}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />
                    </Grid>

                    <Grid size={12}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={active}
                                    onChange={(e) => setActive(e.target.checked)}
                                />
                            }
                            label="Active"
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button
                    color="secondary"
                    variant="contained"
                    onClick={onClose}
                    disabled={saving}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={saving || selectedVisitorTypes.length === 0}
                >
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateVisitorTypeParkingDialog;
