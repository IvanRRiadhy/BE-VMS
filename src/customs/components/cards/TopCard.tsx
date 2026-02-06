import { Box, CardContent, Grid2, Typography } from '@mui/material';
import BlankCard from 'src/components/shared/BlankCard';
import { Stack } from '@mui/system';
import React from 'react';
import { TablerIconsProps } from '@tabler/icons-react';

interface CardItem {
  title: string;
  subTitle?: string;
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
  size?: { xs: number; lg: number };
}

const defaultColor = '#FFFFFF';

const TopCard: React.FC<TopCardsProps> = ({ items, onImageClick, cardMarginBottom, size }) => {
  const smSize = 12 / items.length;

  return (
    <Grid2 container spacing={3} sx={{ height: '100%', alignItems: 'stretch' }}>
      {items.map((card, index) => {
        const isImage = typeof card.subTitleSetting === 'string';
        const cardColor =
          !card.color || card.color.toLowerCase() === 'none' ? defaultColor : card.color;

        return (
          <Grid2
            // size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}
            size={size || { xs: 12, lg: 2.4 }}
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
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '120px',
                    height: '120px',
                    background:
                      'linear-gradient(135deg, transparent 40%, rgba(25,118,210,0.2) 100%)',
                    pointerEvents: 'none',
                  },
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
                          onClick={() => card.onIconClick?.(card)}
                          sx={{
                            backgroundColor:
                              card.title === 'Check In'
                                ? '#21c45d' // hijau
                                : card.title === 'Check Out'
                                  ? '#F44336' // merah
                                  : card.title === 'Denied'
                                    ? '#8B0000' // merah tua
                                    : card.title === 'Block'
                                      ? '#000000' // hitam
                                      : '#055499', // default biru
                            borderRadius: '50%',
                            color: '#fff',
                            padding: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: card.onIconClick ? 'pointer' : 'default',
                          }}
                        >
                          <card.icon size={24} color="#fff" />
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
