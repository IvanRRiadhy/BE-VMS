import {
  RadioGroup,
  Grid2 as Grid,
  FormControlLabel,
  Radio,
  Card,
  Paper,
  Skeleton,
} from '@mui/material';
import { memo } from 'react';

const VisitorTypeList = memo(({ visitorType, formData, onChange, showVTListSkeleton }: any) => {
  return (
    <RadioGroup row value={formData.visitor_type} onChange={onChange}>
      <Grid container spacing={1}>
        {showVTListSkeleton
          ? Array.from({ length: 6 }).map((_, i) => (
              <Grid size={{ xs: 6, sm: 6 }} key={`sk-${i}`}>
                <Card sx={{ width: '100%', p: 1 }}>
                  <Skeleton />
                  <Skeleton animation="wave" />
                  <Skeleton animation={false} />
                </Card>
              </Grid>
            ))
          : visitorType.map((type: any) => (
              <Grid size={{ xs: 12, md: 6 }} key={type.id}>
                <FormControlLabel
                  value={type.id}
                  control={<Radio />}
                  sx={{ m: 0, width: '100%' }}
                  label={
                    <Paper
                      sx={{
                        px: 2,
                        py: 1,
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontWeight: formData.visitor_type === type.id ? 600 : 400,
                        border: '1px solid',
                        borderColor: formData.visitor_type === type.id ? 'primary.main' : 'divider',
                        bgcolor:
                          formData.visitor_type === type.id ? 'primary.light' : 'background.paper',
                      }}
                    >
                      {type.name}
                    </Paper>
                  }
                />
              </Grid>
            ))}
      </Grid>
    </RadioGroup>
  );
});

export default VisitorTypeList;
