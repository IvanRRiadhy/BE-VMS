import { Grid2 as Grid, Card, Typography, Box, Stack, Button } from '@mui/material';

import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';

const CardItems = [
  {
    title: 'Visitors Expected',
    value: 20,
  },
  {
    title: 'Completed Meetings',
    value: 10,
  },
  {
    title: 'Defaulted Visitors',
    value: 5,
  },
  {
    title: 'Pending Visits',
    value: 21,
  },
];

export default function TopCardsUI() {
  return (
    <Grid container spacing={2} alignItems="stretch">
      {CardItems.map((item, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} sx={{ display: 'flex' }}>
          <Card
            sx={{
              flex: 1,
              borderRadius: 3,
              p: 4,
              minHeight: 120,
              boxShadow: '0px 2px 10px rgba(0,0,0,0.08)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography
                  sx={{
                    fontSize: 42,
                    fontWeight: 500,
                    lineHeight: 1,
                    color: '#4A4A4A',
                  }}
                >
                  {item.value}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 12,
                    color: '#A0A0A0',
                    mt: 0.5,
                  }}
                >
                  Today
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  backgroundColor: '#3F51F7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PersonSearchIcon
                  sx={{
                    color: '#fff',
                    fontSize: 25,
                  }}
                />
              </Box>
            </Stack>

            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: '#4A4A4A',
              }}
            >
              {item.title}
            </Typography>
          </Card>
        </Grid>
      ))}
      <Grid size={{ xs: 12, md: 12, lg: 2.4 }} sx={{ display: 'flex' }}>
        <Card
          onClick={() => {}}
          sx={{
            flex: 1,
            borderRadius: 4,
            cursor: 'pointer',
            minHeight: 120,
            backgroundColor: 'primary.main',
            boxShadow: '0px 2px 10px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
              color: '#fff',
            },
          }}
        >
          <Button
            startIcon={<AddBoxOutlinedIcon />}
            sx={{
              color: '#fff',
              backgroundColor: 'transparent !important',
              fontSize: 22,
              fontWeight: 600,
              textTransform: 'none',
              '& .MuiButton-startIcon svg': {
                fontSize: 32,
              },
              '&:hover': {
                backgroundColor: 'transparent !important',
                color: '#fff',
              },
            }}
          >
            Add Visitor
          </Button>
        </Card>
      </Grid>
    </Grid>
  );
}
