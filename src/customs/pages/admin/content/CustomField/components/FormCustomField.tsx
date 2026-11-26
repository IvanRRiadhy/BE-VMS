
import React, {
    useState,
    useCallback,
} from 'react';

import {
    Grid2 as Grid,
    Typography,
    Paper,
    Button,
    MenuItem,
    Divider,
    TableContainer,
    TableHead,
    Table,
    TableRow,
    TableCell,
    TableBody,
} from '@mui/material';

import { Box } from '@mui/system';

import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';

import {
    CreateCustomFieldRequest,
    CreateCustomFieldRequestSchema,
    FieldType,
    multiOptField,
} from 'src/customs/api/models/Admin/CustomField';

import { showSwal } from 'src/customs/components/alerts/alerts';

import GlobalBackdropLoading from 'src/customs/pages/Operator/Components/GlobalBackdrop';

import useCustomFieldMutation from 'src/hooks/CustomField/useCustomFieldMutation';
import { useVehicle } from 'src/hooks/Setting/useVehicle';
import { useIdentityType } from 'src/hooks/Setting/useIdentityType';

interface FormCustomFieldProps {
    initialData: CreateCustomFieldRequest;
    editingId?: string;
    onSuccess?: () => void;
    onDirtyChange?: (dirty: boolean) => void;
}

type MultiOptionErrors = {
    [key: string]: string;
};

const FormCustomField = ({
    initialData,
    editingId,
    onSuccess,
    onDirtyChange,
}: FormCustomFieldProps) => {

    // ---------------------------------
    // Local form state
    // ---------------------------------

    const [formData, setFormData] =
        useState<CreateCustomFieldRequest>(initialData);

    const [multiOptionList, setMultiOptionList] =
        useState<multiOptField[]>(
            initialData.multiple_option_fields ?? [],
        );

    const [newMultiOption, setNewMultiOption] =
        useState<multiOptField>({
            value: '',
            name: '',
            id: '',
        });

    const [errors, setErrors] =
        useState<MultiOptionErrors>({});

    const {
        createMutation,
        updateMutation,
    } = useCustomFieldMutation();

    const isSubmitting =
        createMutation.isPending ||
        updateMutation.isPending;

    // ---------------------------------
    // Queries
    // ---------------------------------

    const {
        data: vehicle = [],
        isLoading: isVehicleLoading,
    } = useVehicle();

    const {
        data: identityType = [],
        isLoading: isIdentityTypeLoading,
    } = useIdentityType();

    // ---------------------------------
    // Dirty state
    // ---------------------------------

    const markDirty = useCallback(() => {
        onDirtyChange?.(true);
    }, [onDirtyChange]);

    // ---------------------------------
    // Input handlers
    // ---------------------------------

    const handleChange = useCallback(
        (
            e: React.ChangeEvent<
                HTMLInputElement | { name?: string; value: unknown }
            >,
        ) => {
            const target = e.target as HTMLInputElement;

            const name = target.name || target.id;
            const value = target.value;

            setFormData((prev) => ({
                ...prev,
                [name]:
                    name === 'field_type'
                        ? Number(value)
                        : value,
            }));

            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));

            markDirty();
        },
        [markDirty],
    );

    const formatEnumLabel = (label: string) => {
        return label
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
    };

    // ---------------------------------
    // Multi option handlers
    // ---------------------------------

    const handleMultiOptionNameChange = (
        value: string,
    ) => {
        setNewMultiOption((prev) => ({
            ...prev,
            name: value,
        }));
    };

    const handleMultiOptionValueChange = (
        value: string,
    ) => {
        setNewMultiOption((prev) => ({
            ...prev,
            value,
        }));
    };

    const handleMultiOptionSelect = (
        selectedId: string,
        type: 'vehicle' | 'identity',
    ) => {
        if (type === 'vehicle') {
            const selected = vehicle.find(
                (item: any) => item.id === selectedId,
            );

            setNewMultiOption({
                id: selected?.id ?? '',
                name: selected?.name ?? '',
                value: selected?.value ?? '',
            });
        } else {
            const selected = identityType.find(
                (item: any) => item.id === selectedId,
            );

            setNewMultiOption({
                id: selected?.id ?? '',
                name: selected?.name ?? '',
                value: selected?.id ?? '',
            });
        }
    };

    const handleAddMultiOption = () => {
        if (!newMultiOption.name.trim()) return;

        setMultiOptionList((prev) => [
            ...prev,
            { ...newMultiOption },
        ]);

        setNewMultiOption({
            name: '',
            value: '',
            id: '',
        });

        markDirty();
    };

    const handleRemoveMultiOption = (index: number) => {
        setMultiOptionList((prev) =>
            prev.filter((_, i) => i !== index),
        );

        markDirty();
    };

    // ---------------------------------
    // Submit
    // ---------------------------------

    const handleOnSubmit = async (
        e: React.FormEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();

        setErrors({});

        try {
            const payload: CreateCustomFieldRequest = {
                ...formData,
                multiple_option_fields: multiOptionList,
            };

            const parsedData =
                CreateCustomFieldRequestSchema.parse(payload);

            if (editingId) {
                await updateMutation.mutateAsync({
                    id: editingId,
                    payload: parsedData,
                });
            } else {
                await createMutation.mutateAsync(parsedData);
            }

            onDirtyChange?.(false);
            onSuccess?.();

        } catch (err: any) {

            // Zod validation errors
            if (err?.issues || err?.errors) {
                const issues = err.issues ?? err.errors;

                if (Array.isArray(issues)) {
                    const validationErrors: MultiOptionErrors = {};

                    issues.forEach((issue: any) => {
                        const fieldName = issue.path?.[0];

                        if (fieldName) {
                            validationErrors[fieldName] = issue.message;
                        }
                    });

                    setErrors(validationErrors);
                    return;
                }
            }

            showSwal(
                'error',
                err?.response?.data?.msg ??
                'Failed to save custom field.',
            );
        }
    };

    // ---------------------------------
    // Render
    // ---------------------------------

    const isMultiOption = Number(formData.field_type) >= 3;

    const isBasicField = Number(formData.field_type) <= 2;

    const isVehicleField = formData.remarks === 'vehicle_id';

    const isIdentityField = formData.remarks === 'identity_type';

    return (
        <>
            <form onSubmit={handleOnSubmit}>
                <Grid container spacing={2} sx={{ mb: 2 }}>

                    {/* Custom Field Details */}

                    <Grid
                        size={{
                            xs: 12,
                            md: isBasicField ? 6 : 4,
                            lg: isBasicField ? 6 : 4,
                        }}
                    >
                        <Paper sx={{ p: 2 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    my: 0,
                                    borderLeft: '4px solid #673ab7',
                                    pl: 1,
                                }}
                            >
                                Custom Field Details
                            </Typography>

                            <CustomFormLabel htmlFor="short_name">
                                Custom Field Name
                            </CustomFormLabel>

                            <CustomTextField
                                id="short_name"
                                value={formData.short_name ?? ''}
                                onChange={handleChange}
                                error={!!errors.short_name}
                                helperText={errors.short_name || ''}
                                fullWidth
                                required
                            />

                            <CustomFormLabel htmlFor="long_display_text">
                                Display Text
                            </CustomFormLabel>

                            <CustomTextField
                                id="long_display_text"
                                value={formData.long_display_text ?? ''}
                                onChange={handleChange}
                                error={!!errors.long_display_text}
                                helperText={errors.long_display_text || ''}
                                fullWidth
                                required
                            />

                            <CustomFormLabel htmlFor="remarks">
                                Remarks
                            </CustomFormLabel>

                            <CustomTextField
                                id="remarks"
                                value={formData.remarks ?? ''}
                                onChange={handleChange}
                                error={!!errors.remarks}
                                helperText={errors.remarks || ''}
                                fullWidth
                                required
                            />
                        </Paper>
                    </Grid>

                    {/* Custom Field Input */}

                    <Grid
                        size={{
                            xs: 12,
                            md: isBasicField ? 6 : 8,
                            lg: isBasicField ? 6 : 8,
                        }}
                    >
                        <Paper sx={{ p: 2 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    my: 0,
                                    borderLeft: '4px solid #673ab7',
                                    pl: 1,
                                    mb: 2,
                                }}
                            >
                                Custom Field's Input
                            </Typography>

                            <Grid container spacing={2}>

                                {/* Multi Option Input */}

                                <Grid
                                    size={{
                                        xs: 12,
                                        md: isBasicField ? 12 : 4.5,
                                        lg: isBasicField ? 12 : 4.5,
                                    }}
                                >
                                    <CustomFormLabel htmlFor="field_type">
                                        Type
                                    </CustomFormLabel>

                                    <CustomSelect
                                        id="field_type"
                                        name="field_type"
                                        value={formData.field_type}
                                        onChange={handleChange}
                                        error={!!errors.field_type}
                                        helperText={errors.field_type || ''}
                                        fullWidth
                                        required
                                    >
                                        {Object.entries(FieldType)
                                            .filter(([key]) => isNaN(Number(key)))
                                            .map(([key, value]) => (
                                                <MenuItem key={value} value={value}>
                                                    {formatEnumLabel(key)}
                                                </MenuItem>
                                            ))}
                                    </CustomSelect>

                                    {isMultiOption && (
                                        <>
                                            <Divider sx={{ my: 3 }} textAlign="left">
                                                Multi Option Field
                                            </Divider>

                                            <CustomFormLabel>
                                                Field Name
                                            </CustomFormLabel>

                                            {isVehicleField ? (
                                                <CustomSelect
                                                    id="vehicle-id"
                                                    value={newMultiOption.id}
                                                    onChange={(e: any) =>
                                                        handleMultiOptionSelect(
                                                            e.target.value,
                                                            'vehicle',
                                                        )
                                                    }
                                                    fullWidth
                                                    disabled={isVehicleLoading}
                                                >
                                                    {vehicle.map((item: any) => (
                                                        <MenuItem
                                                            key={item.id}
                                                            value={item.id}
                                                        >
                                                            {item.name}
                                                        </MenuItem>
                                                    ))}
                                                </CustomSelect>
                                            ) : isIdentityField ? (
                                                <CustomSelect
                                                    id="identity-type"
                                                    value={newMultiOption.id}
                                                    onChange={(e: any) =>
                                                        handleMultiOptionSelect(
                                                            e.target.value,
                                                            'identity',
                                                        )
                                                    }
                                                    fullWidth
                                                    disabled={isIdentityTypeLoading}
                                                >
                                                    {identityType.map((item: any) => (
                                                        <MenuItem
                                                            key={item.id}
                                                            value={item.id}
                                                        >
                                                            {item.name}
                                                        </MenuItem>
                                                    ))}
                                                </CustomSelect>
                                            ) : (
                                                <>
                                                    <CustomTextField
                                                        id="multi-option-name"
                                                        value={newMultiOption.name}
                                                        onChange={(e: any) =>
                                                            handleMultiOptionNameChange(
                                                                e.target.value,
                                                            )
                                                        }
                                                        fullWidth
                                                    />

                                                    <CustomFormLabel>
                                                        Field Value
                                                    </CustomFormLabel>

                                                    <CustomTextField
                                                        id="multi-option-value"
                                                        value={newMultiOption.value}
                                                        onChange={(e: any) =>
                                                            handleMultiOptionValueChange(
                                                                e.target.value,
                                                            )
                                                        }
                                                        fullWidth
                                                    />
                                                </>
                                            )}

                                            <Button
                                                variant="contained"
                                                color="primary"
                                                fullWidth
                                                sx={{ my: 3 }}
                                                disabled={
                                                    !newMultiOption.name.trim()
                                                }
                                                onClick={handleAddMultiOption}
                                            >
                                                Add Multi-Option Field
                                            </Button>
                                        </>
                                    )}
                                </Grid>

                                {/* Multi Option Table */}

                                {isMultiOption && (
                                    <Grid
                                        size={{
                                            xs: 12,
                                            md: 7.5,
                                            lg: 7.5,
                                        }}
                                    >
                                        <TableContainer
                                            component={Box}
                                            sx={{
                                                maxHeight: 300,
                                                overflow: 'auto',
                                                mt: 1,
                                            }}
                                        >
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Field Name</TableCell>
                                                        <TableCell>Value</TableCell>
                                                        <TableCell align="right" />
                                                    </TableRow>
                                                </TableHead>

                                                <TableBody>
                                                    {multiOptionList.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell
                                                                colSpan={3}
                                                                align="center"
                                                                sx={{ color: '#888' }}
                                                            >
                                                                No Multi-Option Field added
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        multiOptionList.map((mult, index) => (
                                                            <TableRow key={mult.id || index}>
                                                                <TableCell>
                                                                    {mult.name}
                                                                </TableCell>

                                                                <TableCell>
                                                                    {isVehicleField ? mult.name : mult.value}
                                                                </TableCell>

                                                                <TableCell align="right">
                                                                    <Button
                                                                        color="error"
                                                                        size="small"
                                                                        variant="outlined"
                                                                        sx={{
                                                                            minWidth: 28,
                                                                            width: 28,
                                                                            height: 28,
                                                                            p: 0,
                                                                            fontSize: '1rem',
                                                                            lineHeight: 1,
                                                                        }}
                                                                        onClick={() =>
                                                                            handleRemoveMultiOption(index)
                                                                        }
                                                                    >
                                                                        ×
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Submit */}

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        mt: 2,
                    }}
                >
                    <Button
                        color="primary"
                        variant="contained"
                        type="submit"
                        disabled={isSubmitting}
                        size="medium"
                    >
                        {isSubmitting ? 'Saving...' : 'Submit'}
                    </Button>
                </Box>
            </form>

            <GlobalBackdropLoading open={isSubmitting} />
        </>
    );
};

export default FormCustomField;
