// components/analytics/AnalyticsCards.tsx

import React from 'react';
import { Box, Card, Typography, Stack, Divider } from '@mui/material';

import {
  Person,
  Groups,
  DirectionsCar,
  LocalParking,
  AccessTime,
  WarningAmber,
  TwoWheeler,
  LocalShipping,
  DirectionsBus,
  Commute,
  TrendingUp,
} from '@mui/icons-material';

const iconMap: Record<string, React.ReactNode> = {
  person: <Person />,
  groups: <Groups />,
  car: <DirectionsCar />,
  parking: <LocalParking />,
  clock: <AccessTime />,
  alert: <WarningAmber />,
  motorcycle: <TwoWheeler />,
  truck: <LocalShipping />,
  bus: <DirectionsBus />,
  vehicle: <Commute />,
};

interface PanelProps {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  sx?: object;
}

export const AnalyticsPanel = ({ title, icon, children, sx = {} }: PanelProps) => (
  <Card
    elevation={0}
    sx={{
      height: '100%',
      minWidth: 0,
      p: 2,
      border: '1px solid #e1e6ef',
      borderRadius: 2.5,
      boxShadow: '0 2px 8px rgba(25,45,80,.045)',
      ...sx,
    }}
  >
    {title && (
      <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
        {icon && (
          <Box
            sx={{
              color: '#425b91',
              display: 'flex',
              '& svg': { fontSize: 22 },
            }}
          >
            {icon}
          </Box>
        )}

        <Typography fontWeight={750} fontSize={15.5} color="#172033">
          {title}
        </Typography>
      </Stack>
    )}

    {children}
  </Card>
);

interface StatCardProps {
  item: {
    title: string;
    value: string;
    change: string;
    note?: string;
    icon: string;
    color: string;
  };
}

export const StatCard = ({ item }: StatCardProps) => (
  <Card
    elevation={0}
    sx={{
      height: '100%',
      p: 1.5,
      display: 'flex',
      alignItems: 'center',
      gap: 1.3,
      border: '1px solid #e1e6ef',
      borderRadius: 2.5,
      boxShadow: '0 2px 8px rgba(25,45,80,.045)',
      minWidth: 0,
    }}
  >
    <Box
      sx={{
        color: item.color,
        display: 'flex',
        flexShrink: 0,
        '& svg': { fontSize: 32 },
      }}
    >
      {iconMap[item.icon]}
    </Box>

    <Box minWidth={0} flex={1}>
      <Typography fontSize={11.5} fontWeight={650} color="#344054" noWrap>
        {item.title}
      </Typography>

      <Stack direction="row" alignItems="baseline" spacing={0.8} flexWrap="wrap">
        <Typography fontSize={22} lineHeight={1.3} fontWeight={800} color="#111827">
          {item.value}
        </Typography>
        <Typography
          fontSize={10.5}
          fontWeight={750}
          color={Number(item.change) < 0 ? '#d7353e' : '#168344'}
        >
          {Number(item.change) < 0 ? '▼' : '▲'} {item.change}
        </Typography>
      </Stack>

      {item.note && (
        <Typography fontSize={10.5} color="#667085">
          {item.note}
        </Typography>
      )}
    </Box>
  </Card>
);

// Kunjungan per Site

export const SiteBars = ({ data }: { data: any[] }) => {
  const max = Math.max(...data.map((item) => item.value));

  return (
    <Stack spacing={1.05}>
      {data.map((item) => (
        <Stack key={item.name} direction="row" alignItems="center" spacing={1}>
          <Typography fontSize={11.5} width={80} flexShrink={0}>
            {item.name}
          </Typography>

          <Box
            sx={{
              flex: 1,
              bgcolor: '#f0f2f6',
              height: 15,
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: `${(item.value / max) * 100}%`,
                height: '100%',
                borderRadius: 1,
                background: 'linear-gradient(90deg,#78b6f5,#1976e8)',
              }}
            />
          </Box>

          <Typography fontSize={11} width={84} textAlign="right" fontWeight={650}>
            {item.value.toLocaleString('id-ID')}{' '}
            <Box component="span" color="text.secondary">
              ({item.percentage} %)
            </Box>
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
};

// Tipe pengunjung

export const VisitorTypeLegend = ({ data }: { data: any[] }) => (
  <Stack spacing={0.9}>
    {data.map((item) => (
      <Stack key={item.name} direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 10,
            height: 10,
            bgcolor: item.color,
            borderRadius: 0.6,
            flexShrink: 0,
          }}
        />

        <Typography fontSize={11.5} flex={1}>
          {item.name}
        </Typography>

        <Typography fontSize={11.5} fontWeight={650}>
          {item.value.toLocaleString('id-ID')}
        </Typography>

        <Typography fontSize={10.5} color="text.secondary" width={43} textAlign="right">
          {((item.value / 12480) * 100).toFixed(1).replace('.', ',')}%
        </Typography>
      </Stack>
    ))}
  </Stack>
);

// Analisa kendaraan

export const VehicleList = ({ data }: { data: any[] }) => (
  <Stack spacing={0.8}>
    {data.map((item) => (
      <Stack key={item.name} direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            color: '#52658a',
            display: 'flex',
            '& svg': { fontSize: 17 },
          }}
        >
          {iconMap[item.icon]}
        </Box>

        <Typography fontSize={11.5} flex={1}>
          {item.name}
        </Typography>

        <Typography fontSize={11.5} fontWeight={650}>
          {item.value}
        </Typography>

        <Typography fontSize={10.5} color="text.secondary" width={43} textAlign="right">
          {item.percent}
        </Typography>
      </Stack>
    ))}
  </Stack>
);

// Jenis alarm

export const AlarmList = ({ data }: { data: any[] }) => (
  <Stack divider={<Divider flexItem />} spacing={0}>
    {data.map((item) => (
      <Stack key={item.name} direction="row" alignItems="center" py={0.65} spacing={1}>
        <Typography fontSize={10.8} flex={1}>
          {item.name}
        </Typography>

        <Typography fontSize={11} fontWeight={700}>
          {item.value}
        </Typography>

        <Typography fontSize={10.5} color="text.secondary" width={43} textAlign="right">
          {item.percent}
        </Typography>
      </Stack>
    ))}
  </Stack>
);

// Tabel pertumbuhan

export const GrowthTable = ({ rows }: { rows: any[] }) => (
  <Box sx={{ overflowX: 'auto' }}>
    <Box
      component="table"
      sx={{
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: 330,

        '& th': {
          bgcolor: '#f2f5fa',
          fontSize: 10.5,
          textAlign: 'left',
          p: 0.8,
          color: '#344054',
        },

        '& td': {
          borderBottom: '1px solid #edf0f4',
          p: 0.7,
          fontSize: 10.8,
          whiteSpace: 'nowrap',
        },
      }}
    >
      <thead>
        <tr>
          <th>Metrik</th>
          <th>Okt 2026</th>
          <th>Nov 2026</th>
          <th>Perubahan</th>
        </tr>
      </thead>

      <tbody>
        {rows.map((item) => (
          <tr key={item.label}>
            <td>
              <Stack direction="row" spacing={0.7} alignItems="center">
                <Box
                  sx={{
                    color: item.negative ? '#df3c45' : '#405d9a',
                    display: 'flex',
                    '& svg': { fontSize: 16 },
                  }}
                >
                  {iconMap[item.icon]}
                </Box>

                <b>{item.label}</b>
              </Stack>
            </td>

            <td>{item.oct}</td>
            <td>
              <b>{item.nov}</b>
            </td>

            <td
              style={{
                color: item.negative ? '#d7353e' : '#168344',
                fontWeight: 700,
              }}
            >
              ▲ {item.change}
            </td>
          </tr>
        ))}
      </tbody>
    </Box>
  </Box>
);
type GrowthHighlightProps = {
  value: number;
};

const formatGrowth = (value?: number) => {
  const growth = value ?? 0;

  return `${growth > 0 ? '+' : ''}${growth.toFixed(1).replace('.', ',')}%`;
};
export const GrowthHighlight = ({ value }: GrowthHighlightProps) => {
  const isNegative = value < 0;

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 130,
        borderRadius: 2,
        bgcolor: isNegative ? '#fff0f0' : '#e7f7ed',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 1.2,
        textAlign: 'center',
      }}
    >
      <TrendingUp sx={{ fontSize: 34, color: isNegative ? '#d7353e' : '#148347', mb: 0.5 }} />

      <Typography fontSize={12} fontWeight={700}>
        Pertumbuhan
      </Typography>

      <Typography fontSize={12}>Total Kunjungan</Typography>

      <Typography fontSize={28} fontWeight={850} color={isNegative ? '#d7353e' : '#087b3c'}>
        {formatGrowth(value)}
      </Typography>
    </Box>
  );
};
