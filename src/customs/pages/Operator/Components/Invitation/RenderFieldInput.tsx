import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Grid2 as Grid,
    Typography,
    TextField,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Checkbox,
    FormControlLabel,
    MenuItem,
    AlertColor,
    Autocomplete,
    FormControl,
    RadioGroup,
    Radio,
    Box
} from '@mui/material';
import { } from '@mui/system';
import { IconX } from '@tabler/icons-react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
    CreateVisitorRequest,
    CreateVisitorRequestSchema,
    FormVisitor,
} from 'src/customs/api/models/Admin/Visitor';
import { DateTimePicker, LocalizationProvider, renderTimeViewClock } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import utc from 'dayjs/plugin/utc';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CameraUpload from 'src/customs/components/camera/CameraUpload';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

dayjs.extend(utc);
dayjs.extend(weekday);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.locale('id');

interface RenderFieldInputProps {
    field: FormVisitor;
    index: number;

    onChange: (
        index: number,
        fieldKey: keyof FormVisitor,
        value: any,
    ) => void;

    onDelete?: (index: number) => void;

    opts?: {
        showLabel?: boolean;
        uniqueKey?: string;
    };

    invitationDetail: any;
    allVisitorEmployee: any[];

    activeStep: number;

    inputValues: Record<string, string>;
    setInputValues: React.Dispatch<
        React.SetStateAction<Record<string, string>>
    >;

    setFillFormDataVisitor: React.Dispatch<any>;

    uploadMethods: Record<string, string>;
    handleUploadMethodChange: (
        key: string,
        value: string,
    ) => void;

    uploadNames: Record<string, string>;

    removing: Record<string, boolean>;

    handleFileChangeForField: (
        e: React.ChangeEvent<HTMLInputElement>,
        callback: (url: string) => void,
        key: string,
    ) => void;

    handleRemoveFileForField: (
        url: string,
        callback: (url: string) => void,
        key: string,
    ) => void;
}


export const renderFieldInput = ({
    field,
    index,
    onChange,
    onDelete,
    opts,

    invitationDetail,
    allVisitorEmployee,

    activeStep,

    inputValues,
    setInputValues,

    setFillFormDataVisitor,

    uploadMethods,
    handleUploadMethodChange,

    uploadNames,
    removing,

    handleFileChangeForField,
    handleRemoveFileForField,
}: RenderFieldInputProps) => {
    const renderInput = () => {
        switch (field.field_type) {
            case 0: // Text
                return (
                    <CustomTextField
                        size="small"
                        value={field.answer_text}
                        onChange={(e) => onChange(index, 'answer_text', e.target.value)}
                        placeholder=""
                        fullWidth
                        sx={{ minWidth: 160, maxWidth: '100%' }}
                    />
                );

            case 1: // Number
                return (
                    <CustomTextField
                        type="number"
                        size="small"
                        value={field.answer_text}
                        onChange={(e) => onChange(index, 'answer_text', e.target.value)}
                        placeholder="Enter number"
                        fullWidth
                    />
                );

            case 2: // Email
                return (
                    <CustomTextField
                        type="email"
                        size="small"
                        value={field.answer_text}
                        onChange={(e) => onChange(index, 'answer_text', e.target.value)}
                        placeholder=""
                        fullWidth
                        sx={{ minWidth: 160, maxWidth: '100%' }}
                    />
                );

            case 3: {
                let options: { value: string; name: string }[] = [];

                const hostName = invitationDetail?.collection?.host_name ?? '';
                const hostId = invitationDetail?.collection?.host ?? '';
                const sitePlaceName = invitationDetail?.collection?.site_place_name ?? '';
                const sitePlaceId = invitationDetail?.collection?.site_place ?? '';

                switch (field.remarks) {
                    case 'host':
                        options = [{ value: hostId, name: hostName }];
                        break;

                    case 'employee':
                        options = allVisitorEmployee.map((emp: any) => ({
                            value: emp.id,
                            name: emp.name,
                        }));
                        break;

                    case 'site_place':
                        options = sitePlaceName
                            ? [
                                {
                                    value: field.answer_text || sitePlaceId,
                                    name: sitePlaceName,
                                },
                            ]
                            : [];
                        break;

                    default:
                        options = (field.multiple_option_fields || []).map((opt: any) =>
                            typeof opt === 'object' ? opt : { value: opt, name: opt },
                        );
                        break;
                }
                const uniqueKey = opts?.uniqueKey ?? `${activeStep}:${index}`;
                const inputVal = inputValues[uniqueKey as any] || '';

                return (
                    <Autocomplete
                        size="small"
                        freeSolo
                        options={options}
                        getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
                        inputValue={inputVal}
                        onInputChange={(_, newInputValue) =>
                            setInputValues((prev) => ({ ...prev, [uniqueKey]: newInputValue }))
                        }
                        filterOptions={(opts, state) => {
                            const term = (state.inputValue || '').toLowerCase();
                            if (term.length < 3) return [];
                            return opts.filter((opt) => (opt.name || '').toLowerCase().includes(term));
                        }}
                        noOptionsText={
                            inputVal.length < 3 ? 'Enter at least 3 characters to search.' : 'Not found'
                        }
                        // value={
                        //   options.find(
                        //     (opt: { value: string; name: string }) =>
                        //       opt.value?.toLowerCase?.() === field.answer_text?.toLowerCase?.(),
                        //   ) || null
                        // }
                        value={
                            options.find(
                                (opt: { value: string; name: string }) => opt.value === field.answer_text,
                            ) || null
                        }
                        onChange={(_, newValue) =>
                            onChange(index, 'answer_text', newValue instanceof Object ? newValue.value : '')
                        }
                        renderInput={(params) => (
                            <CustomTextField
                                {...params}
                                placeholder="Enter at least 3 characters to search"
                                fullWidth
                                sx={{ minWidth: 160 }}
                            />
                        )}
                    />
                );
            }

            case 4: // Date
                return (
                    <CustomTextField
                        type="date"
                        size="small"
                        value={field.answer_datetime}
                        onChange={(e) => onChange(index, 'answer_datetime', e.target.value)}
                        fullWidth
                    />
                );

            case 5: // Radio
                if (field.remarks === 'gender') {
                    const options = [
                        { value: '0', name: 'Female' },
                        { value: '1', name: 'Male' },
                        { value: '2', name: 'Prefer not to say' },
                    ];

                    const value = field.answer_text != null ? String(field.answer_text) : '';

                    return (
                        <CustomTextField
                            select
                            size="small"
                            fullWidth
                            sx={{ width: 160 }}
                            value={value}
                            onChange={(e) => onChange(index, 'answer_text', e.target.value)}
                            SelectProps={{
                                MenuProps: {
                                    disablePortal: true,
                                    PaperProps: {
                                        sx: {
                                            zIndex: 20000,
                                        },
                                    },
                                },
                            }}
                        >
                            {options.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.name}
                                </MenuItem>
                            ))}
                        </CustomTextField>
                    );
                }
                if (field.remarks === 'vehicle_type') {
                    const options = [
                        { value: 'car', label: 'Car' },
                        { value: 'bus', label: 'Bus' },
                        { value: 'motor', label: 'Motor' },
                        { value: 'bicycle', label: 'Bicycle' },
                        { value: 'truck', label: 'Truck' },
                        { value: 'private_car', label: 'Private Car' },
                        { value: 'other', label: 'Other' },
                    ];

                    const currentValue = field.answer_text ?? '';

                    return (
                        <CustomTextField
                            select
                            size="small"
                            fullWidth
                            value={currentValue}
                            onChange={(e) => onChange(index, 'answer_text', e.target.value)}
                            sx={{ minWidth: 160 }}
                        >
                            <MenuItem value="" disabled>
                                Select Vehicle Type
                            </MenuItem>
                            {options.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </CustomTextField>
                    );
                }

                if (field.remarks === 'is_driving' || field.remarks === 'is_employee') {
                    const options = [
                        { value: 'true', label: 'Yes' },
                        { value: 'false', label: 'No' },
                    ];
                    const currentValue = field.answer_text ?? '';

                    return (
                        <FormControl component="fieldset" sx={{ width: '100%' }}>
                            <RadioGroup
                                value={currentValue}
                                row
                                sx={{ minWidth: 130 }}
                                onChange={(e) => {
                                    onChange(index, 'answer_text', e.target.value);

                                    setFillFormDataVisitor((prev: any) => {
                                        return [...prev];
                                    });
                                }}
                            >
                                {options.map((opt) => (
                                    <FormControlLabel
                                        key={opt.value}
                                        value={opt.value}
                                        control={<Radio size="small" />}
                                        label={opt.label}
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>
                    );
                }

                return (
                    <CustomTextField
                        select
                        size="small"
                        value={field.answer_text || ''}
                        onChange={(e) => onChange(index, 'answer_text', e.target.value)}
                        fullWidth
                    >
                        {field.multiple_option_fields?.map((opt: any) => (
                            <MenuItem key={opt.id} value={opt.value}>
                                {opt.name}
                            </MenuItem>
                        ))}
                    </CustomTextField>
                );

            case 6:
                return (
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={Boolean(field.answer_text)}
                                onChange={(e) => onChange(index, 'answer_text', e.target.checked)}
                            />
                        }
                        label=""
                    />
                );
            case 8: // Time
                return (
                    <CustomTextField
                        type="time"
                        size="small"
                        value={field.answer_datetime}
                        onChange={(e) => onChange(index, 'answer_datetime', e.target.value)}
                        fullWidth
                    />
                );

            case 9: //Datetimepicker
                return (
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
                        <DateTimePicker
                            value={field.answer_datetime ? dayjs(field.answer_datetime) : null}
                            ampm={false}
                            onChange={(newValue) => {
                                if (newValue) {
                                    const utc = newValue.utc().format();
                                    onChange(index, 'answer_datetime', utc);
                                }
                            }}
                            format="dddd, DD MMMM YYYY, HH:mm"
                            viewRenderers={{
                                hours: renderTimeViewClock,
                                minutes: renderTimeViewClock,
                                seconds: renderTimeViewClock,
                            }}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                },
                            }}
                        />
                    </LocalizationProvider>
                );

            case 10: // Camera
                if (field.remarks === 'selfie_image') {
                    return (
                        <CameraUpload
                            value={field.answer_file as string | undefined}
                            onChange={(url) => {
                                onChange(index, 'answer_file', url);
                            }}
                        />
                    );
                }
                return (
                    <CameraUpload
                        value={field.answer_file as string | undefined}
                        onChange={(url) => onChange(index, 'answer_file', url)}
                    />
                );

            case 11: {
                const key = opts?.uniqueKey ?? String(index);
                const fileUrl = (field as any).answer_file as string | undefined;
                return (
                    <Box>
                        <label htmlFor={key}>
                            <Box
                                sx={{
                                    border: '2px dashed #90caf9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 2,
                                    borderRadius: 2,
                                    p: 0.5,
                                    textAlign: 'center',
                                    backgroundColor: '#f5faff',
                                    cursor: 'pointer',
                                    width: '100%',
                                    minWidth: 160,
                                }}
                            >
                                <CloudUploadIcon sx={{ fontSize: 20, color: '#42a5f5' }} />
                                <Typography variant="subtitle1">Upload File</Typography>
                            </Box>
                        </label>

                        <input
                            id={key}
                            type="file"
                            accept="*"
                            hidden
                            onChange={(e) =>
                                handleFileChangeForField(
                                    e as React.ChangeEvent<HTMLInputElement>,
                                    (url) => onChange(index, 'answer_file', url),
                                    key,
                                )
                            }
                        />

                        {fileUrl && (
                            <Box mt={1} display="flex" alignItems="center" gap={1}>
                                <Typography variant="caption" noWrap>
                                    {uploadNames[key] ?? ''}
                                </Typography>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() =>
                                        handleRemoveFileForField(
                                            (field as any).answer_file,
                                            (url) => onChange(index, 'answer_file', url),
                                            key,
                                        )
                                    }
                                >
                                    <IconX size={16} />
                                </IconButton>
                            </Box>
                        )}
                    </Box>
                );
            }

            case 12: {
                const key = opts?.uniqueKey ?? String(index);
                return (
                    <Box
                        display="flex"
                        flexDirection={{ xs: 'column', sm: 'column', md: 'row' }}
                        alignItems={{ xs: 'stretch', md: 'center' }}
                        justifyContent="space-between"
                        gap={1.5}
                        width="100%"
                        sx={{ maxWidth: 400 }}
                    >
                        <TextField
                            select
                            size="small"
                            value={uploadMethods[key] || 'file'}
                            onChange={(e) => handleUploadMethodChange(key, e.target.value)}
                            fullWidth
                            sx={{
                                width: { xs: '100%', md: '200px' },
                            }}
                        >
                            <MenuItem value="file">Choose File</MenuItem>
                            <MenuItem value="camera">Take Photo</MenuItem>
                        </TextField>

                        {(uploadMethods[key] || 'file') === 'camera' ? (
                            <CameraUpload
                                value={field.answer_file as string | undefined}
                                onChange={(url) => onChange(index, 'answer_file', url)}
                            />
                        ) : (
                            <Box sx={{ width: { xs: '100%', md: '200px' } }}>
                                <label htmlFor={key}>
                                    <Box
                                        sx={{
                                            border: '2px dashed #90caf9',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 1.5,
                                            borderRadius: 2,
                                            p: 0.5,
                                            textAlign: 'center',
                                            backgroundColor: '#f5faff',
                                            cursor: 'pointer',
                                            width: '100%',
                                            transition: '0.2s',
                                            '&:hover': { backgroundColor: '#e3f2fd' },
                                        }}
                                    >
                                        <CloudUploadIcon sx={{ fontSize: 20, color: '#42a5f5' }} />
                                        <Typography variant="subtitle1" sx={{ fontSize: { xs: 13, md: 14 } }}>
                                            Upload File
                                        </Typography>
                                    </Box>
                                </label>

                                <input
                                    id={key}
                                    type="file"
                                    accept="*"
                                    hidden
                                    onChange={(e) =>
                                        handleFileChangeForField(
                                            e as React.ChangeEvent<HTMLInputElement>,
                                            (url) => onChange(index, 'answer_file', url),
                                            key,
                                        )
                                    }
                                />

                                {(field.answer_file || uploadNames[key]) && (
                                    <Box mt={0.5} display="flex" alignItems="center" justifyContent="space-between">
                                        <Typography variant="caption" color="text.secondary" noWrap>
                                            {uploadNames[key] ?? field.answer_file?.split('/').pop() ?? ''}
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            disabled={!!removing[key]}
                                            onClick={() =>
                                                handleRemoveFileForField(
                                                    (field as any).answer_file,
                                                    (url) => onChange(index, 'answer_file', url),
                                                    key,
                                                )
                                            }
                                        >
                                            <IconX size={16} />
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Box>
                );
            }
            default:
                return (
                    <CustomTextField
                        size="small"
                        value={field.long_display_text}
                        onChange={(e) => onChange(index, 'long_display_text', e.target.value)}
                        placeholder="Enter value"
                        fullWidth
                    />
                );
        }
    };

    return (
        <Box
            sx={{
                overflow: 'auto',
                width: '100%',
            }}
        >
            {renderInput()}
        </Box>
    );
};