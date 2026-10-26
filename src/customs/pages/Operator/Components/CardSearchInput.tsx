import { InputAdornment, TextField } from "@mui/material";
import { Box } from "@mui/system";
import { IconSearch } from "@tabler/icons-react";
import { memo } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

const CardSearchInput = memo(({ value, onChange }: Props) => {
  return (
    <Box mb={2}>
      <TextField
        fullWidth
        size="small"
        placeholder="Search card"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconSearch size={20} />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
});

export default CardSearchInput;
