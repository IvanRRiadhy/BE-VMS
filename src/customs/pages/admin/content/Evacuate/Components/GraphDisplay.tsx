import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Grid2 as Grid,
  Divider,
  FormControl,
  InputLabel,
  useTheme,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  IconButton,
} from '@mui/material';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { textAlign, useMediaQuery } from '@mui/system';
import {
  IconBuildingCommunity,
  IconClock,
  IconFlag,
  IconHistory,
  IconHome,
  IconMapPin,
  IconPlus,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import AssemblyPointDialog from './AssemblyPointDialog';
import HistoryEvacuateDialog from './HistoryEvacuateDialog';

// Dummy data as before...
const dataMap = {
  organization: [
    { id: 'org1', name: 'Org Alpha', evacuated: 42, confirmed: 10, notConfirm: 13 },
    { id: 'org2', name: 'Org Beta', evacuated: 34, confirmed: 5, notConfirm: 20 },
    { id: 'org3', name: 'Org Gamma', evacuated: 21, confirmed: 8, notConfirm: 27 },
    { id: 'org4', name: 'Org Delta', evacuated: 29, confirmed: 3, notConfirm: 0 },
    { id: 'org5', name: 'Org Epsilon', evacuated: 54, confirmed: 12, notConfirm: 8 },
  ],
  department: [
    { id: 'dep1', name: 'Dept Security', evacuated: 12, confirmed: 5, notConfirm: 0 },
    { id: 'dep2', name: 'Dept Facilities', evacuated: 7, confirmed: 2, notConfirm: 1 },
    { id: 'dep3', name: 'Dept HR', evacuated: 16, confirmed: 4, notConfirm: 9 },
    { id: 'dep4', name: 'Dept IT', evacuated: 22, confirmed: 6, notConfirm: 1 },
    { id: 'dep5', name: 'Dept Finance', evacuated: 11, confirmed: 3, notConfirm: 5 },
  ],
  district: [
    { id: 'dist1', name: 'District North', evacuated: 24, confirmed: 8, notConfirm: 0 },
    { id: 'dist2', name: 'District South', evacuated: 14, confirmed: 3, notConfirm: 13 },
    { id: 'dist3', name: 'District East', evacuated: 19, confirmed: 5, notConfirm: 0 },
    { id: 'dist4', name: 'District West', evacuated: 9, confirmed: 2, notConfirm: 17 },
    { id: 'dist5', name: 'District Central', evacuated: 28, confirmed: 7, notConfirm: 10 },
  ],
};

const dummyAreaMap = [
  {
    id: 'building1',
    name: 'Gedung Baru',
    floors: [
      {
        id: 'floor1',
        name: 'Lantai 1',
        areas: [
          { id: 'area1', name: 'Area 1', evacuated: 10, confirmed: 2, notConfirm: 3 },
          { id: 'area2', name: 'Area 2', evacuated: 8, confirmed: 4, notConfirm: 0 },
        ],
      },
      {
        id: 'floor2',
        name: 'Lantai 2',
        areas: [
          { id: 'area3', name: 'Area 3', evacuated: 12, confirmed: 4, notConfirm: 3 },
          { id: 'area4', name: 'Area 4', evacuated: 6, confirmed: 2, notConfirm: 0 },
        ],
      },
      {
        id: 'floor5',
        name: 'Lantai 3',
        areas: [{ id: 'area9', name: 'Area A', evacuated: 6, confirmed: 2, notConfirm: 7 }],
      },
    ],
  },
  {
    id: 'building2',
    name: 'Gedung Lama',
    floors: [
      {
        id: 'floor3',
        name: 'Lantai 1',
        areas: [
          { id: 'area5', name: 'Area 5', evacuated: 9, confirmed: 1, notConfirm: 2 },
          { id: 'area6', name: 'Area 6', evacuated: 7, confirmed: 0, notConfirm: 0 },
          { id: 'area7', name: 'Lobby', evacuated: 10, confirmed: 2, notConfirm: 4 },
        ],
      },
      {
        id: 'floor4',
        name: 'Lantai 2',
        areas: [
          { id: 'area7', name: 'Area 7', evacuated: 8, confirmed: 1, notConfirm: 3 },
          { id: 'area8', name: 'Area 8', evacuated: 6, confirmed: 0, notConfirm: 2 },
        ],
      },
      {
        id: 'floor6',
        name: 'Rooftop',
        areas: [
          { id: 'area10', name: 'Area B', evacuated: 6, confirmed: 2, notConfirm: 7 },
          { id: 'area11', name: 'Area C', evacuated: 2, confirmed: 1, notConfirm: 6 },
          { id: 'area12', name: 'Area D', evacuated: 0, confirmed: 0, notConfirm: 14 },
        ],
      },
    ],
  },
];

const PIE_COLORS = ['#43a047', '#fdd835', '#ff5252']; // green, yellow, red

const GraphDisplay: React.FC = () => {
  const [entityLevel, setEntityLevel] = useState<'organization' | 'department' | 'district'>(
    'organization',
  );
  const [selectedId, setSelectedId] = useState<string>(dataMap.organization[0].id);

  const handleLevelChange = (
    _: React.MouseEvent<HTMLElement>,
    newLevel: 'organization' | 'department' | 'district' | null,
  ) => {
    if (!newLevel) return;
    setEntityLevel(newLevel);
    setSelectedId(dataMap[newLevel][0].id);
  };

  const handleChange = (e: SelectChangeEvent<string>) => {
    setSelectedId(e.target.value as string);
  };
  const handleMiddleLevelChange = (
    _: React.MouseEvent<HTMLElement>,
    newLevel: 'organization' | 'department' | 'district' | null,
  ) => {
    if (!newLevel) return;
    setMiddleChartLevel(newLevel);
    setMiddleSelectedId(dataMap[newLevel][0].id);
  };

  const handleBottomLevelChange = (
    _: React.MouseEvent<HTMLElement>,
    newLevel: 'organization' | 'department' | 'district' | null,
  ) => {
    if (!newLevel) return;
    setBottomChartLevel(newLevel);
    setBottomSelectedId(dataMap[newLevel][0].id);
  };

  const currData = dataMap[entityLevel];
  const selected = currData.find((x) => x.id === selectedId)!;
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [middleChartLevel, setMiddleChartLevel] = useState<
    'organization' | 'department' | 'district'
  >('organization');
  const [middleSelectedId, setMiddleSelectedId] = useState<string>(dataMap.organization[0].id);

  const [bottomChartLevel, setBottomChartLevel] = useState<
    'organization' | 'department' | 'district'
  >('organization');
  const [bottomSelectedId, setBottomSelectedId] = useState<string>(dataMap.organization[0].id);

  const bottomData = dataMap[bottomChartLevel];
  const bottomSelected = bottomData.find((x) => x.id === bottomSelectedId)!;

  const pieData = [
    { name: 'Evacuated', value: bottomSelected.evacuated },
    { name: 'Confirmed', value: bottomSelected.confirmed },
    { name: 'Not Evacuated', value: bottomSelected.notConfirm },
  ];
  // Pie data for distribution by entity (middle donut chart)
  const middleData = dataMap[middleChartLevel];
  const middleSelected = middleData.find((x) => x.id === middleSelectedId)!;

  const donutData = middleData.map((item) => ({
    name: item.name,
    value: item.evacuated,
  }));

  const getAreaStats = () => {
    let areas: { evacuated: number; confirmed: number; notConfirm: number }[] = [];

    dummyAreaMap.forEach((building) => {
      if (selectedBuilding && building.id !== selectedBuilding) return;

      building.floors.forEach((floor) => {
        if (selectedFloor && floor.id !== selectedFloor) return;

        floor.areas.forEach((area) => {
          if (selectedArea && area.id !== selectedArea) return;
          areas.push({
            evacuated: area.evacuated,
            confirmed: area.confirmed,
            notConfirm: area.notConfirm,
          });
        });
      });
    });

    const evacuated = areas.reduce((sum, a) => sum + a.evacuated, 0);
    const confirmed = areas.reduce((sum, a) => sum + a.confirmed, 0);
    const notConfirm = areas.reduce((sum, a) => sum + a.notConfirm, 0);
    return { evacuated, confirmed, notConfirm };
  };

  const areaPieData = [
    { name: 'Evacuated', value: getAreaStats().evacuated },
    { name: 'Confirmed', value: getAreaStats().confirmed },
    { name: 'Not Evacuated', value: getAreaStats().notConfirm },
  ];

  const dropdownLabel = entityLevel.charAt(0).toUpperCase() + entityLevel.slice(1);
  const generateColors = (count: number): string[] => {
    const colors = [];
    const saturation = 70;
    const lightness = 50;

    for (let i = 0; i < count; i++) {
      const hue = Math.round((360 / count) * i); // spread colors evenly
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }

    return colors;
  };
  const donutColors = generateColors(donutData.length);

  const theme = useTheme();
  const lg = useMediaQuery(theme.breakpoints.up('lg'));

  const [openDialogAssemblyPoint, setOpenDialogAssemblyPoint] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const evacuationData = [
    { name: 'Evacuated', value: 3, color: '#22C55E' },
    { name: 'Confirmed', value: 0, color: '#F59E0B' },
    { name: 'Remaining', value: 20, color: '#F04448' },
  ];

  const totalPeople = evacuationData.reduce((total, item) => total + item.value, 0);
  const [selectedFloorplan, setSelectedFloorplan] = useState<string | null>(null);
  return (
    <Card
      sx={{
        maxWidth: lg ? '260' : '100%',
        minHeight: '100vh',
        // maxHeight: '80vh',
        p: 1,
        borderRadius: 4,
        boxShadow: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        bgcolor: '#fff',
        mx: 0,
      }}
    >
      <CardContent sx={{ width: '100%', textAlign: 'center', flex: 1 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
          height={'100%'}
        >
          <Typography variant="h6" fontWeight={700}>
            Evacuation Statistics
          </Typography>

          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              startIcon={<IconPlus />}
              onClick={() => setOpenDialogAssemblyPoint(true)}
            >
              Add Assembly Point
            </Button>
            <Button
              variant="outlined"
              startIcon={<IconHistory />}
              onClick={() => setOpenHistory(true)}
            >
              History
            </Button>
          </Box>
        </Box>
        <Grid container spacing={2} alignItems="flex-start" sx={{ width: '100%', mb: 2 }}>
          <Grid size={{ xs: 12 }}>
            {/* Filter, Select, and Legend - Right */}
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                {/* Kiri: Title */}
                <Box sx={{ flex: 1, minWidth: 180 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 16, textAlign: 'left' }}>
                    Evacuation Overview
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', textAlign: 'left' }}>
                    Total people and their current evacuation status
                  </Typography>
                </Box>

                {/* Kanan: Filters */}
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ justifyContent: 'flex-end' }}
                >
                  {/* Building */}
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel id="building-label">Building</InputLabel>
                    <Select
                      labelId="building-label"
                      value={selectedBuilding ?? ''}
                      label="Building"
                      onChange={(e) => {
                        setSelectedBuilding(e.target.value || null);
                        setSelectedFloor(null);
                        setSelectedArea(null);
                      }}
                    >
                      <MenuItem value="">All</MenuItem>
                      {dummyAreaMap.map((b) => (
                        <MenuItem key={b.id} value={b.id}>
                          {b.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Floor */}
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel id="floor-label">Floor</InputLabel>
                    <Select
                      labelId="floor-label"
                      value={selectedFloor ?? ''}
                      label="Floor"
                      onChange={(e) => {
                        setSelectedFloor(e.target.value || null);
                        setSelectedArea(null);
                      }}
                      disabled={!selectedBuilding}
                    >
                      <MenuItem value="">All</MenuItem>
                      {dummyAreaMap
                        .find((b) => b.id === selectedBuilding)
                        ?.floors.map((f) => (
                          <MenuItem key={f.id} value={f.id}>
                            {f.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>

                  {/* Area */}
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel id="area-label">Area</InputLabel>
                    <Select
                      labelId="area-label"
                      value={selectedArea ?? ''}
                      label="Area"
                      onChange={(e) => setSelectedArea(e.target.value || null)}
                      disabled={!selectedFloor}
                    >
                      <MenuItem value="">All</MenuItem>
                      {dummyAreaMap
                        .find((b) => b.id === selectedBuilding)
                        ?.floors.find((f) => f.id === selectedFloor)
                        ?.areas.map((a) => (
                          <MenuItem key={a.id} value={a.id}>
                            {a.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Box>
            </Grid>
            <Grid container spacing={2} alignItems="center">
              {/* Donut Chart */}

              <Grid size={{ xs: 12, sm: 5 }}>
                <Box
                  sx={{
                    width: '100%',
                    height: 230,
                    position: 'relative',
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={evacuationData.filter((item) => item.value > 0)}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius="68%"
                        outerRadius="88%"
                        paddingAngle={2}
                        stroke="none"
                      >
                        {evacuationData
                          .filter((item) => item.value > 0)
                          .map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center Total */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <Typography sx={{ fontSize: 26, fontWeight: 700, lineHeight: 1.3 }}>
                      {totalPeople}
                    </Typography>
                    <Typography sx={{ fontSize: 12 }}>Total People</Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Evacuation Summary */}
              <Grid size={{ xs: 12, sm: 7 }}>
                <Stack spacing={1.5}>
                  {evacuationData.map((item) => {
                    const percentage =
                      totalPeople > 0 ? Math.round((item.value / totalPeople) * 100) : 0;

                    const descriptionMap: Record<string, string> = {
                      Evacuated: 'Reached assembly point',
                      Confirmed: 'Manually confirmed',
                      Remaining: 'Still inside the building',
                    };

                    return (
                      <Box
                        key={item.name}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.5,
                          borderRadius: 3,
                          bgcolor: 'grey.50',
                          border: '1px solid',
                          borderColor: 'grey.100',
                        }}
                      >
                        <Box
                          sx={{
                            width: 14,
                            height: 14,
                            minWidth: 14,
                            borderRadius: '50%',
                            bgcolor: item.color,
                          }}
                        />

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                            {item.name}
                          </Typography>
                          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                            {descriptionMap[item.name]}
                          </Typography>
                        </Box>

                        <Box sx={{ textAlign: 'right', minWidth: 40 }}>
                          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
                            {item.value}
                          </Typography>
                          <Typography sx={{ fontSize: 12 }}>{percentage}%</Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* People by Assembly Point */}
        <Box sx={{ width: '100%', mb: 2 }}>
          {/* Header */}
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 3,
                bgcolor: '#E0F2FE',
                color: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconMapPin size={24} />
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 16, textAlign: 'left' }}>
                People by Assembly Point
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                Distribution of evacuated people across assembly points
              </Typography>
            </Box>
          </Stack>

          {/* Assembly Point Progress */}
          <Stack spacing={1.5} sx={{ mb: 2.5 }}>
            {donutData.map((entry, idx) => {
              const total = donutData.reduce((sum, item) => sum + item.value, 0);
              const percentage = total > 0 ? Math.round((entry.value / total) * 100) : 0;

              const colors = ['#1976F3', '#4387F5', '#68A5F8'];

              return (
                <Stack key={entry.name} direction="row" alignItems="center" spacing={2}>
                  <Typography
                    sx={{
                      width: { xs: 130, sm: 180 },
                      minWidth: 0,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {entry.name}
                  </Typography>

                  <Box
                    sx={{
                      flex: 1,
                      height: 28,
                      p: 0.5,
                      borderRadius: 2,
                      bgcolor: '#EDF2F8',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${percentage}%`,
                        minWidth: entry.value > 0 ? 8 : 0,
                        borderRadius: 1.5,
                        bgcolor: colors[idx % colors.length],
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </Box>

                  <Typography
                    sx={{
                      width: 20,
                      textAlign: 'right',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {entry.value}
                  </Typography>

                  <Typography
                    sx={{
                      width: 38,
                      textAlign: 'right',
                      fontSize: 12,
                      color: 'text.secondary',
                    }}
                  >
                    {percentage}%
                  </Typography>
                </Stack>
              );
            })}
          </Stack>

          {/* Summary Card */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
              p: 2,
              borderRadius: 4,
              bgcolor: '#F7F9FC',
              border: '1px solid #EAF0F7',
            }}
          >
            {/* People at Assembly Points */}
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{
                p: 0.5,
                borderRight: { xs: 'none', sm: '1px solid #DCE5F0' },
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  minWidth: 48,
                  borderRadius: 3,
                  bgcolor: '#E0F2FE',
                  color: '#0284C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconUsers size={24} />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
                  {donutData.reduce((sum, item) => sum + item.value, 0)}
                </Typography>
                <Typography sx={{ fontSize: 12 }}>People at Assembly Points</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                  (Evacuated + Confirmed)
                </Typography>
              </Box>
            </Stack>

            {/* Assembly Points Used */}
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 0.5 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  minWidth: 48,
                  borderRadius: 3,
                  bgcolor: '#FEE2E2',
                  color: '#EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconFlag size={24} />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
                  {donutData.filter((item) => item.value > 0).length}
                </Typography>
                <Typography sx={{ fontSize: 12 }}>Assembly Points Used out of</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                  total available
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>

        {/* People Remaining by Area */}
        <Box sx={{ width: '100%' }}>
          <Grid container spacing={2} alignItems="flex-start">
            {/* Left: Header + Area Progress */}
            <Grid size={{ xs: 12, md: 12 }}>
              {/* Header */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={1}
                sx={{ mb: 3 }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      minWidth: 44,
                      borderRadius: 3,
                      bgcolor: '#F3E8FF',
                      color: '#9333EA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconBuildingCommunity size={24} />
                  </Box>

                  <Box>
                    <Typography
                      sx={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2, textAlign: 'left' }}
                    >
                      People Remaining by Area
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: 'text.secondary',
                        lineHeight: 1.4,
                        textAlign: 'left',
                        mt: '0.5',
                      }}
                    >
                      Number of people still inside per current location area
                    </Typography>
                  </Box>
                </Stack>

                {/* Filters */}
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  useFlexGap
                  gap={1}
                  justifyContent="flex-end"
                  sx={{ minWidth: 150 }}
                >
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel id="remaining-building-label">Building</InputLabel>
                    <Select
                      labelId="remaining-building-label"
                      value={selectedBuilding ?? ''}
                      label="Building"
                      onChange={(e) => {
                        setSelectedBuilding(e.target.value || null);
                        setSelectedFloor(null);
                        setSelectedArea(null);
                      }}
                    >
                      <MenuItem value="">All</MenuItem>
                      {dummyAreaMap.map((b) => (
                        <MenuItem key={b.id} value={b.id}>
                          {b.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 80 }}>
                    <InputLabel id="remaining-floor-label">Floor</InputLabel>
                    <Select
                      labelId="remaining-floor-label"
                      value={selectedFloor ?? ''}
                      label="Floor"
                      onChange={(e) => {
                        setSelectedFloor(e.target.value || null);
                        setSelectedArea(null);
                      }}
                      disabled={!selectedBuilding}
                    >
                      <MenuItem value="">All</MenuItem>
                      {dummyAreaMap
                        .find((b) => b.id === selectedBuilding)
                        ?.floors.map((f) => (
                          <MenuItem key={f.id} value={f.id}>
                            {f.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel id="remaining-floorplan-label">Floorplan</InputLabel>
                    <Select
                      labelId="remaining-floorplan-label"
                      value={selectedFloorplan ?? ''}
                      label="Floorplan"
                      onChange={(e) => setSelectedFloorplan(e.target.value || null)}
                    >
                      <MenuItem value="">All</MenuItem>
                      {/* Replace with your floorplan options */}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 80 }}>
                    <InputLabel id="remaining-area-label">Area</InputLabel>
                    <Select
                      labelId="remaining-area-label"
                      value={selectedArea ?? ''}
                      label="Area"
                      onChange={(e) => setSelectedArea(e.target.value || null)}
                      disabled={!selectedFloor}
                    >
                      <MenuItem value="">All</MenuItem>
                      {dummyAreaMap
                        .find((b) => b.id === selectedBuilding)
                        ?.floors.find((f) => f.id === selectedFloor)
                        ?.areas.map((a) => (
                          <MenuItem key={a.id} value={a.id}>
                            {a.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>

              {/* Area Progress List */}
              <Stack spacing={1.5}>
                {pieData.map((item) => {
                  const maxValue = Math.max(...pieData.map((x) => x.value), 1);
                  const percentage = (item.value / maxValue) * 100;

                  return (
                    <Stack key={item.name} direction="row" spacing={1.5} alignItems="center">
                      <Typography
                        sx={{
                          width: 180,
                          minWidth: 0,
                          fontSize: 12,
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={item.name}
                      >
                        {item.name}
                      </Typography>

                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 35,
                          height: 28,
                          p: 0.5,
                          borderRadius: 2,
                          bgcolor: '#F0F3F8',
                        }}
                      >
                        <Box
                          sx={{
                            width: `${percentage}%`,
                            minWidth: item.value > 0 ? 5 : 0,
                            height: '100%',
                            borderRadius: 1.5,
                            bgcolor: '#EF3038',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </Box>

                      <Typography
                        sx={{
                          width: 28,
                          textAlign: 'right',
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
      <AssemblyPointDialog
        open={openDialogAssemblyPoint}
        onClose={() => setOpenDialogAssemblyPoint(false)}
      />

      <HistoryEvacuateDialog open={openHistory} onClose={() => setOpenHistory(false)} />
    </Card>
  );
};

export default GraphDisplay;
