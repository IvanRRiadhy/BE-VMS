import { InputAdornment } from "@mui/material";
import { IconSearch } from "@tabler/icons-react";
import CustomTextField from "src/components/forms/theme-elements/CustomTextField";



interface VisitorSearchInputProps {
  onOpenSearch: () => void;
}

const VisitorSearchInput = ({ onOpenSearch }: VisitorSearchInputProps) => {
  return (
    <CustomTextField
      fullWidth
      size="small"
      placeholder="Search Visitor"
      onClick={onOpenSearch}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <IconSearch size={20} />
          </InputAdornment>
        ),
      }}
    />
  );
};


export default VisitorSearchInput;