import React, { useState, useEffect, memo } from 'react';
import { Box, Button, Typography, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { IconArrowAutofitLeft } from '@tabler/icons-react';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

type SearchToolbarProps = {
  value?: string;
  t: (key: string) => string;
  onSearch?: (keyword: string) => void;
  onKeyDown?: any;
  onNavigatePage?: () => void;
  isOperatorSetting?: boolean;
  isBlacklistPage?: boolean;
};

const SearchToolbar = memo(
  ({
    value = '',
    t,
    onSearch,
    onKeyDown,
    onNavigatePage,
    isOperatorSetting = false,
    isBlacklistPage = false,
  }: SearchToolbarProps) => {
    const [keyword, setKeyword] = useState(value);

    useEffect(() => {
      setKeyword(value);
    }, [value]);

    const submit = () => {
      onSearch?.(keyword);
    };

    return (
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={0.5}
        // flexWrap="wrap"
        // width="100%"
      >
        <CustomTextField
          fullWidth
          variant="outlined"
          size="small"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={onKeyDown}
          sx={{
            flexGrow: 1,
            minWidth: 0,
            width: { xs: '100%', sm: '300px' },
          }}
          InputProps={{
            sx: { height: 36 },
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Box display="flex" gap={0.5}>
          <Button
            variant="contained"
            onClick={submit}
            sx={{
              height: 36,
              fontSize: '0.7rem',
              whiteSpace: 'nowrap',
            }}
          >
            <Typography fontSize="0.7rem" variant="caption">
              {t('search')}
            </Typography>
          </Button>

          {isOperatorSetting && (
            <Button
              variant="contained"
              color="primary"
              onClick={onNavigatePage}
              startIcon={<IconArrowAutofitLeft width={18} />}
              sx={{
                height: 36,
                fontSize: '0.7rem',
                whiteSpace: 'nowrap',
              }}
            >
              Operator
            </Button>
          )}

          {isBlacklistPage && (
            <Button
              variant="contained"
              color="primary"
              onClick={onNavigatePage}
              startIcon={<IconArrowAutofitLeft width={18} />}
              sx={{
                height: 36,
                fontSize: '0.7rem',
                whiteSpace: 'nowrap',
              }}
            >
              Blacklist
            </Button>
          )}
        </Box>
      </Box>
    );
  },
);

export default SearchToolbar;
