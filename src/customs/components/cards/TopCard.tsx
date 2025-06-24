import { Box, CardContent, Grid2, Typography } from '@mui/material';
import BlankCard from 'src/components/shared/BlankCard';
import { Stack } from '@mui/system';
import React from 'react';

interface CardItem {
  title: string;
  subTitle: string;
  subTitleSetting: number | string;
  color?: string;
}

interface TopCardsProps {
  items: CardItem[];
  cardColors?: string[];
  onImageClick?: (item: CardItem, index: number) => void;
  cardMarginBottom?: number;
}

const defaultColor = '#FFFFFF';

const TopCard: React.FC<TopCardsProps> = ({ items, onImageClick, cardMarginBottom }) => {
  const smSize = 12 / items.length;

  return (
    <Grid2 container spacing={3}>
      {items.map((card, index) => {
        const isImage = typeof card.subTitleSetting === 'string';
        const cardColor =
          !card.color || card.color.toLowerCase() === 'none' ? defaultColor : card.color;

        return (
          <Grid2
            size={{ xs: 12, sm: smSize }}
            key={index}
            sx={{ display: 'flex', marginBottom: cardMarginBottom }}
          >
            <BlankCard sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <CardContent
                sx={{
                  backgroundColor: cardColor,
                  color: '#000',
                  flex: 1, // agar CardContent mengisi tinggi maksimum dari BlankCard
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography variant="subtitle2">{card.title}</Typography>
                    <Box
                      sx={{
                        marginTop: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      {typeof card.subTitleSetting === 'string' ? (
                        <Box
                          component="img"
                          src={card.subTitle}
                          alt={card.title}
                          sx={{ width: 32, height: 32, objectFit: 'contain', cursor: 'pointer' }}
                          onClick={() => onImageClick?.(card, index)}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/default-icon.png';
                          }}
                        />
                      ) : (
                        <Typography variant="h6" color="textSecondary" fontSize={'1.1rem'}>
                          {card.subTitle}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </BlankCard>
          </Grid2>
        );
      })}
    </Grid2>
  );
};

export default TopCard;
