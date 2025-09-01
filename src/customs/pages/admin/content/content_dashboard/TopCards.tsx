import { Box, CardContent, Grid2 as Grid, Typography } from '@mui/material';

import BlankCard from 'src/components/shared/BlankCard';
import { Stack } from '@mui/system';
import { useTranslation } from 'react-i18next';

interface CardItems {
  title: string;
  subTitle: string;
}

const CardItems: CardItems[] = [
  { title: 'cards.visitors', subTitle: '17' },
  { title: 'cards.blocked', subTitle: '2' },
  { title: 'cards.usage', subTitle: '12' },
  { title: 'cards.denied', subTitle: '5' },
  { title: 'cards.all', subTitle: '93' },
];

const cardColors = ['#6C63FF', '#FF69B4', '#FFD700', '#B388FF', '#FF6B6B'];

const TopCards = () => {
  const { t } = useTranslation();

  return (
    <>
      <Grid container spacing={3}>
        {CardItems.map((card, index) => (
          <Grid
            sx={{ borderRadius: '50px' }}
            key={index}
            size={{
              xs: 12,
              sm: 2.4,
            }}
          >
            <BlankCard>
              <CardContent sx={{ backgroundColor: cardColors[index], color: '#fff' }}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack direction="row" spacing={2}>
                    <Box>
                      <Typography variant="subtitle2">{t(card.title)}</Typography>
                      <Typography
                        variant="h6"
                        color="textSecondary"
                        display="flex"
                        alignItems="center"
                        gap="3px"
                        marginTop={1}
                        fontSize={'1.1rem'}
                      >
                        {card.subTitle}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </CardContent>
            </BlankCard>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default TopCards;
