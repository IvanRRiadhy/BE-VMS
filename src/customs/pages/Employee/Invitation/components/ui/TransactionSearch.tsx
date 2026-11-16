import { memo, useEffect, useState } from 'react';
import { InputAdornment } from '@mui/material';
import { IconSearch } from '@tabler/icons-react';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

interface TransactionSearchProps {
  onSearch: (value: string) => void;
}

const TransactionSearch = memo(({ onSearch }: TransactionSearchProps) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, 300);

    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <CustomTextField
      fullWidth
      size="small"
      placeholder="Search Transaction"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
      sx={{ mb: 2 }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <IconSearch color="gray" size={18} />
          </InputAdornment>
        ),
      }}
    />
  );
});

export default TransactionSearch;
