import { Box, CardContent, Grid2, Typography } from '@mui/material';
import BlankCard from 'src/components/shared/BlankCard';
import { Stack } from '@mui/system';
import React from 'react';
import { TablerIconsProps } from '@tabler/icons-react';
import { useState } from 'react';

interface CardItem {
  title: string;
  subTitle: string;
  subTitleSetting?: number | string;
  color?: string;
  icon?: React.FC<TablerIconsProps>;
  onIconClick?: (item: CardItem) => Promise<void> | void;
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
  const [spinning, setSpinningIndex] = useState<number | null>(null);
  const handleIconClick = async (item: CardItem, index: number) => {
    if (!item.onIconClick) return;
    setSpinningIndex(index); // mulai animasi

    try {
      await item.onIconClick(item); // jalankan callback
    } finally {
      setSpinningIndex(null); // berhenti animasi
    }
  };

  return (
    <Grid2 container spacing={3}>
      {items.map((card, index) => {
        const isImage = typeof card.subTitleSetting === 'string';
        const cardColor =
          !card.color || card.color.toLowerCase() === 'none' ? defaultColor : card.color;

        return (
          <Grid2
            size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
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
                    <Stack direction="row" alignItems="center" spacing={1} gap={1}>
                      {card.icon && (
                        <Box
                          sx={{
                            backgroundColor: '#5c87ff',
                            borderRadius: '50%',
                            padding: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: card.onIconClick ? 'pointer' : 'default',
                            transition: 'transform 0.8s linear',
                            transform: spinning === index ? 'rotate(360deg)' : 'rotate(0deg)',
                          }}
                          onClick={() => handleIconClick(card, index)}
                        >
                          <card.icon size={24} color="#FFFF" />
                        </Box>
                      )}
                      <Box>
                        <Typography variant="h5">{card.title}</Typography>
                        {/* <Typography variant="h6" color="textSecondary" fontSize={'1.1rem'}>
                          {card.subTitle}
                        </Typography> */}
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
                    </Stack>
                    {/* <Box
                      sx={{
                        marginTop: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    ></Box> */}
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
