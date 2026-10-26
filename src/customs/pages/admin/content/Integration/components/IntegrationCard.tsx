import { Box, Button, Divider } from '@mui/material';
import { BrandType } from 'src/customs/api/models/Admin/Integration';

interface IntegrationCardProps {
    integration: any;
    onAdd: (integration: any) => void;
}

const IntegrationCard = ({ integration, onAdd }: IntegrationCardProps) => {
    return (
        <Box
            sx={{
                border: '1px solid #ccc',
                borderRadius: 2,
                p: 2,
                backgroundColor: 'primary.light',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Box component="h3">{integration.name}</Box>

            <Box component="h5" sx={{ color: 'gray', mt: 0, mb: 2 }}>
                {integration.brand_name}
            </Box>

            <Divider />

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    mt: 2,
                    flexGrow: 1,
                }}
            >
                <Box fontSize={12}>
                    <strong>Brand Type:</strong> {BrandType[integration.brand_type]}
                </Box>

                <Box fontSize={12}>
                    <strong>Integration Type:</strong> {integration.integration_type}
                </Box>

                <Box fontSize={12}>
                    <strong>API Auth Type:</strong> {integration.api_type_auth}
                </Box>
            </Box>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                    // fullWidth
                    variant="contained"
                    color="success"
                    onClick={() => onAdd(integration)}
                >
                    Add Integration
                </Button>
            </Box>
        </Box>
    );
};

export default IntegrationCard;