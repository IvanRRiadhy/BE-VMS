import { Button, Grid2, MenuItem, Typography } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import ParentCard from 'src/components/shared/ParentCard';

const FormAddUser = () => {
  return (
    <PageContainer>
      <ParentCard title="Add New User">
        <form>
          <Grid2 container spacing={2}>
            {/* Username */}
            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel htmlFor="username" sx={{ marginY: 1, marginX: 1 }}>
                <Typography variant="caption">Username</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="username"
                helperText="You have to make sure that the username of this Operator is true."
                variant="outlined"
                fullWidth
              />
            </Grid2>

            {/* Full Name */}
            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel htmlFor="fullname" sx={{ marginY: 1, marginX: 1 }}>
                <Typography variant="caption">Full Name</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="fullname"
                helperText="Enter the full name of the Operator."
                variant="outlined"
                fullWidth
              />
            </Grid2>

            {/* Password */}
            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel htmlFor="password" sx={{ marginY: 1, marginX: 1 }}>
                <Typography variant="caption">Password</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="password"
                type="password"
                helperText="Password must be at least 8 characters."
                variant="outlined"
                fullWidth
              />
            </Grid2>

            {/* Confirm Password */}
            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel htmlFor="confirmPassword" sx={{ marginY: 1, marginX: 1 }}>
                <Typography variant="caption">Confirm Password</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="confirmPassword"
                type="password"
                helperText="Re-enter the password to confirm."
                variant="outlined"
                fullWidth
              />
            </Grid2>

            {/* Email */}
            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel htmlFor="email" sx={{ marginY: 1, marginX: 1 }}>
                <Typography variant="caption">Email</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="email"
                type="email"
                helperText="Enter a valid email address."
                variant="outlined"
                fullWidth
              />
            </Grid2>
            {/* Role */}
            <Grid2 size={{ xs: 6, sm: 6 }}>
              <CustomFormLabel htmlFor="role" sx={{ marginY: 1, marginX: 1 }}>
                <Typography variant="caption">Role</Typography>
              </CustomFormLabel>
              <CustomTextField id="role" select variant="outlined" fullWidth defaultValue="">
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Operator">Operator</MenuItem>
                <MenuItem value="Supervisor">Supervisor</MenuItem>
              </CustomTextField>
            </Grid2>

            {/* Employee */}
            <Grid2 size={{ xs: 3, sm: 3 }}>
              <CustomFormLabel htmlFor="employee" sx={{ marginY: 1, marginX: 1 }}>
                <Typography variant="caption">Employee</Typography>
              </CustomFormLabel>
              <CustomTextField id="employee" select variant="outlined" fullWidth defaultValue="">
                <MenuItem value="Employee1">Employee 1</MenuItem>
                <MenuItem value="Employee2">Employee 2</MenuItem>
                <MenuItem value="Employee3">Employee 3</MenuItem>
              </CustomTextField>
            </Grid2>

            {/* Organization / Company */}
            <Grid2 size={{ xs: 3, sm: 3 }}>
              <CustomFormLabel htmlFor="organization" sx={{ marginY: 1, marginX: 1 }}>
                <Typography variant="caption">Organization / Company</Typography>
              </CustomFormLabel>
              <CustomTextField
                id="organization"
                select
                variant="outlined"
                fullWidth
                defaultValue=""
              >
                <MenuItem value="CompanyA">Company A</MenuItem>
                <MenuItem value="CompanyB">Company B</MenuItem>
                <MenuItem value="CompanyC">Company C</MenuItem>
              </CustomTextField>
            </Grid2>

            {/* Department */}
            <Grid2 size={{ xs: 3, sm: 3 }}>
              <CustomFormLabel htmlFor="department" sx={{ marginY: 1, marginX: 1 }}>
                <Typography variant="caption">Department</Typography>
              </CustomFormLabel>
              <CustomTextField id="department" select variant="outlined" fullWidth defaultValue="">
                <MenuItem value="HR">HR</MenuItem>
                <MenuItem value="IT">IT</MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
              </CustomTextField>
            </Grid2>

            {/* District */}
            <Grid2 size={{ xs: 3, sm: 3 }}>
              <CustomFormLabel htmlFor="district" sx={{ marginY: 1, marginX: 1 }}>
                <Typography variant="caption">District</Typography>
              </CustomFormLabel>
              <CustomTextField id="district" select variant="outlined" fullWidth defaultValue="">
                <MenuItem value="Central">Central</MenuItem>
                <MenuItem value="East">East</MenuItem>
                <MenuItem value="West">West</MenuItem>
              </CustomTextField>
            </Grid2>

            <Button sx={{ mt: 0 }} color="primary" variant="contained">
              Submit
            </Button>
          </Grid2>
        </form>
      </ParentCard>
    </PageContainer>
  );
};

export default FormAddUser;
