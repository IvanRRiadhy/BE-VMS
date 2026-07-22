import {
    Autocomplete,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid2 as Grid,
    IconButton,
    Switch,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';

import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

type Props = {
    open: boolean;
    loading: boolean;
    editingId?: string | number | null;
    formCategory: any;
    visitorType: any[];
    integration: any[];
    onClose: () => void;
    onSubmit: () => void;
    setFormCategory: React.Dispatch<React.SetStateAction<any>>;
};

const CategoryDialog = ({
    open,
    loading,
    editingId,
    formCategory,
    visitorType,
    integration,
    onClose,
    onSubmit,
    setFormCategory,
}: Props) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
                {editingId ? 'Edit Category' : 'Add Category'}
            </DialogTitle>

            <IconButton
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 10,
                    top: 10,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <IconX />
            </IconButton>

            <DialogContent dividers sx={{ p: 2, pt: 1 }}>
                <Grid container spacing={2}>
                    <Grid sx={{ xs: 12 }}>
                        <CustomFormLabel sx={{ my: 1 }}>
                            Category Name
                        </CustomFormLabel>

                        <CustomTextField
                            fullWidth
                            size="small"
                            value={formCategory.category}
                            onChange={(e) =>
                                setFormCategory((prev: any) => ({
                                    ...prev,
                                    category: e.target.value,
                                }))
                            }
                        />
                    </Grid>

                    <Grid sx={{ xs: 12 }}>
                        <CustomFormLabel sx={{ my: 1 }}>
                            Visitor Type
                        </CustomFormLabel>

                        <Autocomplete
                            options={visitorType}
                            getOptionLabel={(opt: any) => opt.name || ''}
                            value={
                                visitorType.find(
                                    (v) => v.id === formCategory.visitor_type_id,
                                ) || null
                            }
                            onChange={(_, newValue: any) =>
                                setFormCategory((prev: any) => ({
                                    ...prev,
                                    visitor_type_id: newValue?.id ?? '',
                                }))
                            }
                            renderInput={(params) => (
                                <CustomTextField
                                    {...params}
                                    size="small"
                                    placeholder="Select Visitor Type"
                                />
                            )}
                        />
                    </Grid>

                    <Grid sx={{ xs: 12 }}>
                        <CustomFormLabel sx={{ my: 1 }}>
                            Integration
                        </CustomFormLabel>

                        <Autocomplete
                            disabled
                            options={integration}
                            getOptionLabel={(opt: any) => opt.name || ''}
                            value={
                                integration.find(
                                    (i) => i.id === formCategory.integration_id,
                                ) || null
                            }
                            onChange={(_, newValue: any) =>
                                setFormCategory((prev: any) => ({
                                    ...prev,
                                    integration_id: newValue?.id ?? '',
                                }))
                            }
                            renderInput={(params) => (
                                <CustomTextField
                                    {...params}
                                    size="small"
                                    placeholder="Select Integration"
                                />
                            )}
                        />
                    </Grid>

                    <Grid sx={{ xs: 12 }}>
                        <CustomFormLabel sx={{ my: 1 }}>
                            Status (Inactive / Active)
                        </CustomFormLabel>

                        <Switch
                            checked={formCategory.active}
                            onChange={(e) =>
                                setFormCategory((prev: any) => ({
                                    ...prev,
                                    active: e.target.checked,
                                }))
                            }
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button variant="contained" color="secondary" onClick={onClose}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={loading}
                >
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CategoryDialog;