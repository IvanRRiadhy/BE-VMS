import { useEffect, useState } from 'react';
import { Box, TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { useDebounce } from 'src/hooks/useDebounce';

interface Props {
    onSearch: (value: string) => void;
}

const VisitorSearchResults = ({ onSearch }: Props) => {
    const [value, setValue] = useState('');
    const debouncedValue = useDebounce(value, 500);

    useEffect(() => {
        onSearch(debouncedValue);
    }, [debouncedValue, onSearch]);

    return (
        <Box>
            <TextField
                fullWidth
                size="small"
                placeholder="Search visitor..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search fontSize="small" />
                        </InputAdornment>
                    ),
                }}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        height: 34,
                        fontSize: 12,
                        backgroundColor: '#fff',
                    },
                }}
            />
        </Box>
    );
};

export default VisitorSearchResults;