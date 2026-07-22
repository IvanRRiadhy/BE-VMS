import {
    Box,
    Button,
    CircularProgress,
    InputAdornment,
    Skeleton,
    Typography,
} from '@mui/material';
import { IconSearch } from '@tabler/icons-react';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

type TransactionVisitorListProps = {
    mdUp: boolean;
    secdrawerWidth: number;
    loading: boolean;
    loadingMore: boolean;
    searchAgenda: string;
    setSearchAgenda: (value: string) => void;
    filteredVisitors: any[];
    selectedGroup: any;
    setSelectedGroup: (group: any) => void;
    setSelectedGroupId: any;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
};

const TransactionVisitorList = ({
    mdUp,
    secdrawerWidth,
    loading,
    loadingMore,
    searchAgenda,
    setSearchAgenda,
    filteredVisitors,
    selectedGroup,
    setSelectedGroup,
    setSelectedGroupId,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
}: TransactionVisitorListProps) => {
    return (
        <Box
            sx={{
                width: mdUp ? secdrawerWidth : '100%',
                borderRight: '1px solid #eee',
                p: 2,
                pt: 2,
                overflow: 'auto',
                height: { xs: '100%', md: '75vh' },
            }}
        >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontSize="1rem">
                    Transaction Visitor
                </Typography>
            </Box>

            <CustomTextField
                fullWidth
                size="small"
                placeholder="Search Transaction"
                value={searchAgenda}
                onChange={(e) => setSearchAgenda(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <IconSearch color="gray" />
                        </InputAdornment>
                    ),
                }}
            />

            {loading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <Box
                        key={i}
                        sx={{
                            backgroundColor: '#f5f5f5',
                            borderRadius: 2,
                            p: 1.5,
                            mb: 1,
                        }}
                    >
                        <Skeleton variant="text" width="60%" height={24} />
                        <Skeleton variant="text" width="40%" height={20} />
                    </Box>
                ))
                : filteredVisitors.map((group) => (
                    <Box
                        key={group.id}
                        sx={{
                            backgroundColor:
                                selectedGroup?.id === group.id ? '#e3f2fd' : '#f5f5f5',
                            borderRadius: 2,
                            p: 1.5,
                            cursor: 'pointer',
                            mb: 1,
                            '&:hover': {
                                backgroundColor: '#eee',
                            },
                        }}
                        onClick={() => {
                            setSelectedGroup(group);
                            setSelectedGroupId(group.id);
                        }}
                    >
                        <Typography fontWeight="bold">{group.agenda}</Typography>

                        <Box display="flex" justifyContent="space-between">
                            <Typography>{group.visitor_type}</Typography>
                            <Typography>{group.host_name}</Typography>
                        </Box>

                        <Typography>
                            Start : {group.visitor_period_start}
                        </Typography>

                        <Typography>
                            End : {group.visitor_period_end}
                        </Typography>
                    </Box>
                ))}

            {hasNextPage && (
                <Box display="flex" justifyContent="center" mt={2}>
                    <Button
                        fullWidth
                        variant="outlined"
                        disabled={isFetchingNextPage}
                        onClick={fetchNextPage}
                    >
                        {loadingMore ? <CircularProgress size={18} /> : 'Load More'}
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default TransactionVisitorList;