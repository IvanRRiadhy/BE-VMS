import { Box, Card, CardContent, Chip, Divider, List, ListItem, Typography } from '@mui/material';
import { Fragment } from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';

export interface AlertItem {
  id: number | string;
  title: string;
  visitor: string;
  time: string;
}

interface AlertCardProps {
  isFullscreen?: boolean;
  title?: string;
  data: AlertItem[];
  maxItems?: number;
  height?: number;
  onViewAll?: () => void;
  onItemClick?: (item: AlertItem) => void;
}

const AlertCard = ({
  isFullscreen = false,
  title = 'Alerts',
  data,
  maxItems = 5,
  height = 190,
  onViewAll,
  onItemClick,
}: AlertCardProps) => {
  const items = data.slice(0, maxItems);

  return (
    <Card
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          pt: 0,
          pb: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">{title}</Typography>
        {data.length > 0 && (
          <Typography
            variant="body2"
            color="primary"
            fontWeight="bold"
            sx={{ cursor: 'pointer' }}
            onClick={onViewAll}
          >
            View All
          </Typography>
        )}
      </Box>

      <CardContent
        sx={{
          flex: 1,
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          '&:last-child': {
            pb: 0,
          },
        }}
      >
        {items.length > 0 ? (
          <List
            disablePadding
            sx={{
              flex: 1,
              overflowY: 'auto',
            }}
          >
            {items.map((item, index) => (
              <Fragment key={item.id}>
                <ListItem
                  disablePadding
                  onClick={() => onItemClick?.(item)}
                  sx={{
                    py: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: onItemClick ? 'pointer' : 'default',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: 'warning.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconAlertTriangle size={22} color="#ed6c02" />
                    </Box>

                    <Box>
                      <Typography fontWeight={600}>{item.title}</Typography>

                      <Typography variant="body2" color="text.secondary">
                        {item.visitor}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip label={item.time} size="small" color="warning" variant="outlined" />
                </ListItem>

                {index !== items.length - 1 && <Divider sx={{ my: 1 }} />}
              </Fragment>
            ))}
          </List>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              bgcolor: 'grey.50',
              borderRadius: 2,
            }}
          >
            <IconAlertTriangle size={40} color="#bdbdbd" />
            <Typography mt={1} variant="body2" color="text.secondary">
              No alerts available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertCard;
