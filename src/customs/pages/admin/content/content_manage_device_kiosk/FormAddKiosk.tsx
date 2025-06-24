import {
  FormControlLabel,
  Button,
  Grid2,
  MenuItem,
  FormControl,
  Box,
  Typography,
  Dialog,
  Grid,
  Divider,
  Alert,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import Webcam from 'react-webcam';
import CustomCheckbox from 'src/components/forms/theme-elements/CustomCheckbox';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomRadio from 'src/components/forms/theme-elements/CustomRadio';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import ParentCard from 'src/components/shared/ParentCard';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const FormAddKiosk = () => {
  const [state, setState] = React.useState({
    checkedB: false,
  });

  const handleChange = (event: any) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  return (
    <form>
      <Grid2 container spacing={2}>
        <Grid2 size={12}>
          <Alert severity="info">Please fill in the details below</Alert>
        </Grid2>

        <Grid2 size={4}>
          <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="name">
            <Typography variant="caption">Name *</Typography>
          </CustomFormLabel>
          <CustomTextField
            id="name"
            variant="outlined"
            fullWidth
            required
            helperText="You have to make sure that the name of this item is correct."
          />
        </Grid2>

        <Grid2 size={4}>
          <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="pair-code">
            <Typography variant="caption">Pair Code *</Typography>
          </CustomFormLabel>
          <CustomTextField
            id="pair-code"
            variant="outlined"
            fullWidth
            required
            helperText="Enter the pairing code required for connection."
          />
        </Grid2>

        <Grid2 size={4}>
          <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="site-spaces">
            <Typography variant="caption">Site Spaces *</Typography>
          </CustomFormLabel>
          <CustomTextField
            id="site-spaces"
            select
            fullWidth
            required
            variant="outlined"
            defaultValue=""
            helperText="Select the appropriate site space."
          >
            <MenuItem value="space-1">Site Space 1</MenuItem>
            <MenuItem value="space-2">Site Space 2</MenuItem>
            <MenuItem value="space-3">Site Space 3</MenuItem>
          </CustomTextField>
        </Grid2>

        <Grid2 size={6}>
          <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="description">
            <Typography variant="caption">Description</Typography>
          </CustomFormLabel>
          <CustomTextField
            id="description"
            variant="outlined"
            fullWidth
            multiline
            rows={1}
            helperText="Describe this item briefly."
          />
        </Grid2>
        <Grid2 size={6}>
          <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="template">
            <Typography variant="caption">Template *</Typography>
          </CustomFormLabel>
          <CustomTextField
            id="template"
            select
            fullWidth
            required
            variant="outlined"
            defaultValue=""
            helperText="Select the template used for configuration."
          >
            <MenuItem value="template-a">Template A</MenuItem>
            <MenuItem value="template-b">Template B</MenuItem>
            <MenuItem value="template-c">Template C</MenuItem>
          </CustomTextField>
        </Grid2>

        <Grid2 size={12}>
          <Button variant="contained" color="primary">
            Submit
          </Button>
        </Grid2>
      </Grid2>
    </form>
  );
};

export default FormAddKiosk;
