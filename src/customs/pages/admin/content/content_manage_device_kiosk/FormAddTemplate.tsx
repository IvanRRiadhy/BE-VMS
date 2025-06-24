import { Alert, Button, Grid2, Typography } from '@mui/material';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import ParentCard from 'src/components/shared/ParentCard';

const FormAddTemplate = () => {
  return (
    <form>
      <Grid2 container spacing={2}>
        <Grid2 size={12}>
          <Alert severity="info">Please fill in the details below</Alert>
        </Grid2>

        <Grid2 size={{ xs: 6, sm: 6 }}>
          <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="name">
            <Typography variant="caption">Name</Typography>
          </CustomFormLabel>
          <CustomTextField
            type="text"
            id="name"
            fullWidth
            helperText="You have to make sure that the name of this Template is true."
          />
        </Grid2>

        <Grid2 size={{ xs: 6, sm: 6, md: 6 }}>
          <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="speed">
            <Typography variant="caption">Running Text Speed *</Typography>
          </CustomFormLabel>
          <CustomTextField id="speed" fullWidth required type="number" placeholder="e.g. 50" />
        </Grid2>

        <Grid2 size={{ xs: 3, sm: 3, md: 3 }}>
          <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="logo">
            <Typography variant="caption">Logo</Typography>
          </CustomFormLabel>
          <CustomTextField type="file" id="logo" fullWidth inputProps={{ accept: 'image/*' }} />
        </Grid2>

        <Grid2 size={{ xs: 3, sm: 3, md: 3 }}>
          <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="background-image">
            <Typography variant="caption">Background Image</Typography>
          </CustomFormLabel>
          <CustomTextField
            type="file"
            id="background-image"
            fullWidth
            inputProps={{ accept: 'image/*' }}
          />
        </Grid2>

        <Grid2 size={{ xs: 3, sm: 3, md: 3 }}>
          <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="bg-color">
            <Typography variant="caption">Text Background Color *</Typography>
          </CustomFormLabel>
          <CustomTextField id="bg-color" fullWidth required type="color" defaultValue="#cccc33" />
        </Grid2>

        <Grid2 size={{ xs: 3, sm: 3, md: 3 }}>
          <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="text-color">
            <Typography variant="caption">Text Color *</Typography>
          </CustomFormLabel>
          <CustomTextField id="text-color" fullWidth required type="color" defaultValue="#000000" />
        </Grid2>

        <Grid2 size={{ xs: 9, sm: 9 }}>
          <CustomFormLabel sx={{ marginY: 1, marginX: 1 }} htmlFor="running-text">
            <Typography variant="caption">Running Text</Typography>
          </CustomFormLabel>
          <CustomTextField
            id="running-text"
            variant="outlined"
            fullWidth
            multiline
            rows={1}
            helperText="You have to make sure that the running text of this Template is true."
          />
        </Grid2>

        <Grid2
          size={{ xs: 3, sm: 3 }}
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <Button sx={{ mt: 2 }} variant="contained" color="primary">
            Submit
          </Button>
        </Grid2>
      </Grid2>
    </form>
  );
};

export default FormAddTemplate;
