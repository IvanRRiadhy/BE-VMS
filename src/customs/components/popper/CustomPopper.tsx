import { Popper } from "@mui/material";

export const CustomPopper = (props: any) => {
  return <Popper {...props} placement="bottom-start" style={{ zIndex: 99999 }} />;
};
