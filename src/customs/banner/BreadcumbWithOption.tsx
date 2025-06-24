import { Grid2 as Grid, Typography, Box, Breadcrumbs, Link, Paper } from '@mui/material';
import { NavLink } from 'react-router';
import { IconCircle } from '@tabler/icons-react';

interface BreadCrumbType {
  subtitle?: string;
  items?: any[];
  rightItems?: any[];
  title: string;
  children?: any;
  onRightItemClick?: (item: any) => void; // <- Tambahkan ini
  selectedRightItem?: string;
}

const BreadcrumbWithOption = ({
  subtitle,
  items,
  title,
  children,
  rightItems,
  onRightItemClick,
  selectedRightItem,
}: BreadCrumbType) => (
  <Paper
    elevation={3}
    sx={{
      borderRadius: (theme) => theme.shape.borderRadius / 6,
      p: '30px 25px 20px',
      mb: '30px',
      mt: '5px',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <Grid container>
      <Grid size={{ xs: 12, sm: 4, lg: 6 }} sx={{ mb: 1 }}>
        <Typography variant="h6">{title}</Typography>
        <Typography color="textSecondary" variant="caption" fontWeight={400} mt={0.8} mb={0}>
          {subtitle}
        </Typography>

        <Breadcrumbs
          separator={
            <IconCircle
              size="5"
              fill="textSecondary"
              fillOpacity={'0.6'}
              style={{ margin: '0 5px' }}
            />
          }
          sx={{ alignItems: 'center', mt: items ? '10px' : '' }}
          aria-label="breadcrumb"
        >
          {items
            ? items.map((item) => (
                <div key={item.title}>
                  {item.to ? (
                    <Link underline="none" color="inherit" component={NavLink} to={item.to}>
                      {item.title}
                    </Link>
                  ) : (
                    <Typography color="textPrimary">{item.title}</Typography>
                  )}
                </div>
              ))
            : ''}
        </Breadcrumbs>
      </Grid>

      <Grid
        size={{ xs: 12, sm: 8, lg: 6 }}
        sx={{
          mb: 1,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'flex-end',
            gap: 1,
          }}
        >
          {rightItems &&
            rightItems.map((item, index) => {
              const isSelected = item.title === selectedRightItem;
              return (
                <Box
                  key={index}
                  onClick={() => onRightItemClick?.(item)}
                  sx={{
                    cursor: 'pointer',
                    pb: '2px',
                  }}
                >
                  {item.to ? (
                    <Link underline="none" color="primary" component={NavLink} to={item.to}>
                      {item.title}
                    </Link>
                  ) : (
                    <Typography
                      sx={{ marginRight: '6px', color: isSelected ? 'primary' : 'black' }}
                      color="primary"
                    >
                      {item.title}
                    </Typography>
                  )}
                </Box>
              );
            })}

          {children && <Box sx={{ position: 'absolute', top: '0px' }}>{children}</Box>}
        </Box>
      </Grid>
    </Grid>
  </Paper>
);

export default BreadcrumbWithOption;
