import React, { useState, useEffect, memo } from 'react';
import { Box, Button, Typography, InputAdornment, TextField, Tooltip } from '@mui/material';
import { Search } from '@mui/icons-material';
import { IconArrowAutofitLeft, IconExternalLink } from '@tabler/icons-react';
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
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              submit();
            }
          }}
          sx={{
            // flexGrow: 1,
            // minWidth: 270,
            // width: { xs: '100%', sm: '280px' },
            flex: 1,
            minWidth: 280,
          }}
          InputProps={{
            sx: { height: 36 },
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
            // onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
            //   if (e.key === 'Enter') {
            //     submit();
            //   }

            //   onKeyDown?.(e);
            // },
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
              flexShrink: 0,
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
            <Tooltip title="List Blacklist" arrow placement="top">
              <Button
                variant="contained"
                color="primary"
                onClick={onNavigatePage}
                endIcon={<IconExternalLink width={18} />}
                sx={{
                  height: 36,
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap',
                }}
              >
                Blacklist
              </Button>
            </Tooltip>
          )}
        </Box>
      </Box>
    );
  },
);

export default SearchToolbar;
