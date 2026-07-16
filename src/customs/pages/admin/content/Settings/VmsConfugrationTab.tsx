import {
    Autocomplete,
    Box,
    Button,
    Divider,
    FormControl,
    FormControlLabel,
    Grid2 as Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { IconDeviceFloppy, IconInfoCircle } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { getAllApprovalWorkflow } from 'src/customs/api/Admin/ApprovalWorkflow';
import { updateSettingVms } from 'src/customs/api/Admin/Setting';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { useApprovalWorkflow } from 'src/hooks/ApprovalWorkflow/useApprovalWorkflow';
import { useSites } from 'src/hooks/useSites';

interface Props {
    configuration: any;
    setConfiguration: React.Dispatch<React.SetStateAction<any>>;
    initialCardAccessEnabled: boolean;
    setInitialCardAccessEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    giveCardSettingEnabled: boolean;
    setGiveCardSettingEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function VMSConfigurationTab() {

    const [configuration, setConfiguration] = useState({
        default_site_id: "",
        employeeInvitationMode: '',
        visitorInvitationMode: '',
        grant_access_mode: 0,
        grantAccessWhen: 0,
        initialGrantAcess: 0,
        temporaryAccessBeforeMinutes: 0,
        temporaryAccessAfterMinutes: 0,
        needHostApproval: false,
        approval_workflow_id: "",
        autoCheckout: false,
        autoCheckoutAfterMinutes: 0,
    });

    const [initialCardAccessEnabled, setInitialCardAccessEnabled] = useState(false);
    const [giveCardSettingEnabled, setGiveCardSettingEnabled] = useState(false);
    const { sites } = useSites();
    const { data: approvalWorkflow = [], isLoading } = useApprovalWorkflow();

    const handleChange = (key: keyof typeof configuration, value: any) => {
        setConfiguration((prev) => ({
            ...prev,
            [key]: value,
        }));
    };
    const handleSwitch = (key: keyof typeof configuration) => (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setConfiguration((prev) => ({
            ...prev,
            [key]: event.target.checked,
        }));
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                default_site_id: configuration.default_site_id,

                employee_access_mode: configuration.employeeInvitationMode,

                visitor_access_mode: configuration.visitorInvitationMode,

                grant_access_mode: configuration.grant_access_mode,

                grant_access_when: configuration.grantAccessWhen,

                initial_grant_access: configuration.initialGrantAcess,

                temporary_access_before_minutes: Number(
                    configuration.temporaryAccessBeforeMinutes || 0,
                ),

                temporary_access_after_minutes: Number(
                    configuration.temporaryAccessAfterMinutes || 0,
                ),

                need_host_approval: configuration.needHostApproval,

                approval_workflow_id: configuration.needHostApproval
                    ? configuration.approval_workflow_id
                    : null,

                auto_signout: configuration.autoCheckout,

                auto_signout_after_minutes: configuration.autoCheckout
                    ? Number(configuration.autoCheckoutAfterMinutes || 0)
                    : 0,
            };

            console.log(payload);

            await updateSettingVms(payload);

            showSwal('success', 'Configuration saved successfully.');
        } catch (err: any) {
            showSwal(
                'error',
                err?.response?.data?.collection ||
                err?.response?.data?.message ||
                'Failed to save configuration.',
            );
        }
    };
    return (
        <Box sx={{ p: { xs: 1, md: 3 } }}>
            <Grid container spacing={3}>
                {/* Site */}
                <Grid size={{ xs: 12 }}>
                    <Paper variant='outlined' sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>
                            Site
                        </Typography>
                        <FormControl fullWidth>
                            <Autocomplete
                                fullWidth
                                options={sites}
                                value={
                                    sites.find((site) => site.id === configuration.default_site_id) ?? null
                                }
                                getOptionLabel={(option) => option.name}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                onChange={(_, value) =>
                                    handleChange('default_site_id', value?.id ?? '')
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Select Default Site"
                                    />
                                )}
                            />
                        </FormControl>

                    </Paper>
                </Grid>
                {/* Employee */}
                <Grid size={12}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>
                            Employee Configuration
                        </Typography>

                        <FormControl fullWidth>
                            <InputLabel>Employee Access Mode</InputLabel>
                            <Select
                                label="Invitation Mode"
                                value={configuration.employeeInvitationMode}
                                onChange={(e) =>
                                    handleChange('employeeInvitationMode', e.target.value)
                                }
                            >
                                <MenuItem value="DirectAccess">Direct Access</MenuItem>
                                <MenuItem value="NeedCheckIn">Need Check In</MenuItem>
                                <MenuItem value="NeedVisitorCard">Need Visitor Card</MenuItem>
                            </Select>
                        </FormControl>
                    </Paper>
                </Grid>

                {/* Visitor */}
                <Grid size={12}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>
                            Visitor Configuration
                        </Typography>

                        <FormControl fullWidth>
                            <InputLabel>Visitor Access Mode</InputLabel>
                            <Select
                                label="Invitation Mode"
                                value={configuration.visitorInvitationMode}
                                onChange={(e) =>
                                    handleChange('visitorInvitationMode', e.target.value)
                                }
                            >
                                <MenuItem value="QRCode">QR Code</MenuItem>
                                <MenuItem value="TemporaryCard">Temporary Card</MenuItem>
                                <MenuItem value="FaceRecognition">Face Recognition</MenuItem>
                                <MenuItem value="ManualRegistration">
                                    Manual Registration
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Paper>
                </Grid>

                {/* Credential */}
                <Grid size={12}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>
                            Grant Access
                        </Typography>

                        <FormControl fullWidth sx={{ mt: 1 }}>
                            <InputLabel>Mode Grant Access</InputLabel>
                            <Select
                                label="Grant Access"
                                value={configuration.grant_access_mode}
                                onChange={(e) =>
                                    handleChange('grant_access_mode', e.target.value)
                                }
                            >

                                <MenuItem value={0}>Existing Card</MenuItem>
                                <MenuItem value={1}>Visitor Card</MenuItem>
                                <MenuItem value={2}>QR Code</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth sx={{ mt: 3 }}>
                            <InputLabel>When Grant Access</InputLabel>
                            <Select
                                label="Grant Access"
                                value={configuration.grantAccessWhen}
                                onChange={(e) =>
                                    handleChange('grantAccessWhen', e.target.value)
                                }
                            >
                                <MenuItem value={0}>Time Visit</MenuItem>
                            </Select>
                        </FormControl>

                    </Paper>
                </Grid>

                {/* Access */}
                <Grid size={12}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>
                            Access Configuration
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Initial Grant Access</InputLabel>
                                    <Select
                                        label="Grant Access"
                                        value={configuration.initialGrantAcess}
                                        onChange={(e) =>
                                            handleChange('initialGrantAcess', e.target.value)
                                        }
                                    >
                                        <MenuItem value={0}>Time Visit</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Before (Minutes)"
                                    value={configuration.temporaryAccessBeforeMinutes}
                                    onChange={(e) =>
                                        handleChange('temporaryAccessBeforeMinutes', e.target.value)
                                    }
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="After (Minutes)"
                                    value={configuration.temporaryAccessAfterMinutes}
                                    onChange={(e) =>
                                        handleChange('temporaryAccessAfterMinutes', e.target.value)
                                    }
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Automation */}
                <Grid size={12}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>
                            Automation
                        </Typography>

                        <Stack spacing={2}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={configuration.needHostApproval}
                                        onChange={handleSwitch('needHostApproval')}
                                    />
                                }
                                label="Need Host Approval"
                            />
                            {configuration.needHostApproval && (
                                <>
                                    <Typography variant="h6" fontWeight={600} mb={1} mt={2}>
                                        Approval Workflow
                                    </Typography>

                                    <Autocomplete
                                        fullWidth
                                        options={approvalWorkflow}
                                        value={
                                            approvalWorkflow.find(
                                                (item: any) => item.id === configuration.approval_workflow_id,
                                            ) ?? null
                                        }
                                        getOptionLabel={(option) => option.name}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        onChange={(_, value) =>
                                            handleChange('approval_workflow_id', value?.id ?? '')
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder="Select Approval Workflow"
                                            />
                                        )}
                                    />
                                </>
                            )}

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={configuration.autoCheckout}
                                        onChange={handleSwitch('autoCheckout')}
                                    />
                                }
                                label="Enable Auto Checkout"
                            />

                            {configuration.autoCheckout && (
                                <TextField
                                    sx={{ maxWidth: 300 }}
                                    type="number"
                                    label="Auto Checkout After (Minutes)"
                                    value={configuration.autoCheckoutAfterMinutes}
                                    onChange={(e) =>
                                        handleChange('autoCheckoutAfterMinutes', e.target.value)
                                    }
                                />
                            )}
                        </Stack>
                    </Paper>
                </Grid>

                {/* Visitor Card */}
                <Grid size={12}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>
                            Visitor Card Setting
                        </Typography>

                        <Divider sx={{ mb: 2 }} />

                        <Box display="flex" justifyContent="space-between" alignItems="center" >
                            <Typography display="flex" alignItems="center" gap={1}>
                                Initial Card Access
                                <Tooltip title="Initial Card Access">
                                    <IconInfoCircle size={18} />
                                </Tooltip>
                            </Typography>

                            <Switch
                                checked={initialCardAccessEnabled}
                                onChange={(e) =>
                                    setInitialCardAccessEnabled(e.target.checked)
                                }
                            />
                        </Box>

                        {initialCardAccessEnabled && (
                            <Select fullWidth sx={{ mt: 2 }} value="QR">
                                <MenuItem value="QR">Card Access (QR)</MenuItem>
                            </Select>
                        )}

                        <Box
                            mt={1}
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Typography display="flex" alignItems="center" gap={1}>
                                Give Card Setting
                                <Tooltip title="Give Card Setting">
                                    <IconInfoCircle size={18} />
                                </Tooltip>
                            </Typography>

                            <Switch
                                checked={giveCardSettingEnabled}
                                onChange={(e) =>
                                    setGiveCardSettingEnabled(e.target.checked)
                                }
                            />
                        </Box>

                        {giveCardSettingEnabled && (
                            <Select fullWidth sx={{ mt: 2 }} value="old">
                                <MenuItem value="old">Disabled Access Old Card</MenuItem>
                            </Select>
                        )}
                    </Paper>
                </Grid>

                <Grid size={12} display="flex" justifyContent="flex-end">
                    <Button
                        variant="contained"
                        size="medium"
                        onClick={handleSubmit}
                        startIcon={<IconDeviceFloppy />}
                    >
                        Save Configuration
                    </Button>
                </Grid>
            </Grid >
        </Box >
    );
}