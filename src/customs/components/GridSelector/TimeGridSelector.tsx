import { Box, Paper, Typography, useTheme, Button, IconButton, Chip } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import {
  IconX,
  IconClock,
  IconSquare,
  IconSquareCheck,
  IconChecklist,
  IconSquareOff,
} from '@tabler/icons-react';

// Define types
interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  id: string;
  day: 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  hours: TimeBlock[];
}

// Map day names to abbreviations
const daysOfWeek: DaySchedule['day'][] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface TimeGridSelectorProps {
  onSelectionChange: (days: DaySchedule[]) => void;
  initialData?: DaySchedule[];
  onSubmit?: () => void;
}

export const TimeGridSelector = ({
  onSelectionChange,
  initialData = [],
  onSubmit,
}: TimeGridSelectorProps) => {
  const theme = useTheme();
  const [selectedCells, setSelectedCells] = useState<Record<string, boolean>>({});
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'add' | 'remove'>('add');

  // Generate time slots from 00:00 to 23:00 (hourly)
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  // Group time slots into 4-hour chunks for better display
  const timeGroups = Array.from({ length: 6 }, (_, i) => {
    const start = i * 4;
    return {
      start: timeSlots[start],
      end: timeSlots[start + 3] || '23:00',
      indices: [start, start + 1, start + 2, start + 3],
    };
  });

  // Calculate total number of cells (7 days * 24 hours)
  const totalCells = daysOfWeek.length * timeSlots.length;

  // Check if all cells are selected
  const isAllSelected = Object.keys(selectedCells).length === totalCells;

  // Initialize days structure
  const initializeDays = useCallback((): DaySchedule[] => {
    return daysOfWeek.map((day) => ({
      id: `day-${day}`,
      day,
      hours: [],
    }));
  }, []);

  const [days, setDays] = useState<DaySchedule[]>(() => {
    return initialData.length > 0 ? initialData : initializeDays();
  });

  // ⬇️ Tambahkan ini
  useEffect(() => {
    onSelectionChange(days);
  }, [days, onSelectionChange]);

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setDays(initialData);

      // isi selectedCells biar grid terwarnai
      const newSelected: Record<string, boolean> = {};

      initialData.forEach((day, dayIndex) => {
        day.hours.forEach((block) => {
          const startIdx = timeSlots.findIndex((t) => t === block.startTime);
          const endIdx = timeSlots.findIndex((t) => t === block.endTime);

          if (startIdx !== -1 && endIdx !== -1) {
            for (let i = startIdx; i <= endIdx; i++) {
              const cellId = `${dayIndex}-${i}`;
              newSelected[cellId] = true;
            }
          }
        });
      });

      setSelectedCells(newSelected);
      onSelectionChange(initialData);
    }
  }, [initialData]);

  // Handle global mouse up to clear selection state
  const handleGlobalMouseUp = useCallback(() => {
    if (isSelecting) {
      setIsSelecting(false);
    }
  }, [isSelecting]);

  // Handle global mouse leave to clear selection state
  const handleGlobalMouseLeave = useCallback(() => {
    if (isSelecting) {
      setIsSelecting(false);
    }
  }, [isSelecting]);

  // Add global event listeners
  useEffect(() => {
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mouseleave', handleGlobalMouseLeave);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mouseleave', handleGlobalMouseLeave);
    };
  }, [handleGlobalMouseUp, handleGlobalMouseLeave]);

  // Prevent default drag behavior
  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Prevent context menu on grid
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Handle cell click
  const handleCellClick = useCallback(
    (dayIndex: number, timeIndex: number) => {
      const cellId = `${dayIndex}-${timeIndex}`;

      setSelectedCells((prev) => {
        const newSelectedCells = { ...prev };

        if (selectionMode === 'add') {
          newSelectedCells[cellId] = true;
        } else {
          delete newSelectedCells[cellId];
        }

        return newSelectedCells;
      });
    },
    [selectionMode],
  );

  // Handle mouse down on cell
  const handleMouseDown = useCallback(
    (dayIndex: number, timeIndex: number) => {
      setIsSelecting(true);
      handleCellClick(dayIndex, timeIndex);
    },
    [handleCellClick],
  );

  // Handle mouse enter on cell during selection
  const handleMouseEnter = useCallback(
    (dayIndex: number, timeIndex: number) => {
      if (!isSelecting) return;
      handleCellClick(dayIndex, timeIndex);
    },
    [isSelecting, handleCellClick],
  );

  // Toggle between selecting all and removing all
  const handleToggleAll = useCallback(() => {
    if (isAllSelected) {
      // Remove all selections
      setSelectedCells({});
      const emptyDays = initializeDays();
      setDays(emptyDays);
      onSelectionChange(emptyDays);
    } else {
      // Select all hours for all days
      setSelectedCells((prev) => {
        const newSelectedCells = { ...prev };

        // Select every hour for every day
        daysOfWeek.forEach((_, dayIndex) => {
          timeSlots.forEach((_, timeIndex) => {
            const cellId = `${dayIndex}-${timeIndex}`;
            newSelectedCells[cellId] = true;
          });
        });

        return newSelectedCells;
      });

      // Also update the days state immediately
      const allDaysWithAllHours = daysOfWeek.map((day) => ({
        id: `day-${day}`,
        day,
        hours: [
          {
            id: `block-${day}-all`,
            startTime: '00:00',
            endTime: '23:00',
          },
        ],
      }));

      setDays(allDaysWithAllHours);
      onSelectionChange(allDaysWithAllHours);
    }
  }, [isAllSelected, timeSlots, initializeDays, onSelectionChange]);

  // Convert selected cells to time blocks
  const convertSelectionToTimeBlocks = useCallback(() => {
    const newDays = initializeDays();

    const dayGroups: Record<number, number[]> = {};

    Object.keys(selectedCells).forEach((cellId) => {
      const [dayIndexStr, timeIndexStr] = cellId.split('-');
      const dayIndex = parseInt(dayIndexStr, 10);
      const timeIndex = parseInt(timeIndexStr, 10);

      if (!dayGroups[dayIndex]) dayGroups[dayIndex] = [];
      dayGroups[dayIndex].push(timeIndex);
    });

    Object.entries(dayGroups).forEach(([dayIndexStr, timeIndices]) => {
      const dayIndex = parseInt(dayIndexStr, 10);
      const sortedIndices = timeIndices.sort((a, b) => a - b);
      if (!sortedIndices.length) return;

      let currentBlockStart = sortedIndices[0];
      for (let i = 1; i < sortedIndices.length; i++) {
        if (sortedIndices[i] !== sortedIndices[i - 1] + 1) {
          newDays[dayIndex].hours.push({
            id: `block-${dayIndex}-${currentBlockStart}`,
            startTime: timeSlots[currentBlockStart],
            endTime: timeSlots[sortedIndices[i - 1]],
          });
          currentBlockStart = sortedIndices[i];
        }
      }

      newDays[dayIndex].hours.push({
        id: `block-${dayIndex}-${currentBlockStart}`,
        startTime: timeSlots[currentBlockStart],
        endTime: timeSlots[sortedIndices[sortedIndices.length - 1]],
      });
    });

    setDays(newDays);
    onSelectionChange(newDays);

    return newDays; // ⬅️ penting
  }, [selectedCells, initializeDays, timeSlots, onSelectionChange]);

  // Apply the selection
  const handleApplySelection = () => {
    convertSelectionToTimeBlocks();
  };

  // Clear all selections
  const handleClearAll = () => {
    setSelectedCells({});
    const emptyDays = initializeDays();
    setDays(emptyDays);
    onSelectionChange(emptyDays);
  };

  // Select all hours for a day
  const handleSelectAllDay = (dayIndex: number) => {
    setSelectedCells((prev) => {
      const newSelectedCells = { ...prev };
      timeSlots.forEach((_, timeIndex) => {
        const cellId = `${dayIndex}-${timeIndex}`;
        newSelectedCells[cellId] = true;
      });
      return newSelectedCells;
    });
  };

  // Clear all hours for a day
  const handleClearDay = (dayIndex: number) => {
    setSelectedCells((prev) => {
      const newSelectedCells = { ...prev };
      timeSlots.forEach((_, timeIndex) => {
        const cellId = `${dayIndex}-${timeIndex}`;
        delete newSelectedCells[cellId];
      });
      return newSelectedCells;
    });
  };

  return (
    <Paper
      elevation={1}
      sx={{ overflow: 'hidden', pt: '7px', px: '0.5rem' }}
      onDragStart={handleDragStart}
      onContextMenu={handleContextMenu}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight="bold">
          Time Access Schedule
        </Typography>
        <Box display="flex" gap={1}>
          <Chip
            icon={
              selectionMode === 'add' ? <IconSquareCheck size={16} /> : <IconSquare size={16} />
            }
            label={selectionMode === 'add' ? 'Adding' : 'Removing'}
            onClick={() => setSelectionMode((prev) => (prev === 'add' ? 'remove' : 'add'))}
            color={selectionMode === 'add' ? 'primary' : 'error'}
            variant={selectionMode === 'add' ? 'filled' : 'outlined'}
            size="small"
            sx={{ margin: '2.8px 0' }}
          />
          <Button
            variant="outlined"
            color={isAllSelected ? 'error' : 'primary'}
            size="small"
            startIcon={isAllSelected ? <IconSquareOff size={16} /> : <IconChecklist size={16} />}
            onClick={handleToggleAll}
            sx={{ fontSize: '0.75rem' }}
          >
            {isAllSelected ? 'Remove All' : 'Select All'}
          </Button>
          <Button variant="outlined" color="error" onClick={handleClearAll} size="small">
            Clear
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              const newDays = convertSelectionToTimeBlocks();
              onSelectionChange(newDays); // submit dulu
              onSubmit?.(); // optional
              // ⬅️ reset setelah submit
              setSelectedCells({});
              const emptyDays = initializeDays();
              setDays(emptyDays);
            }}
            size="small"
          >
            Apply
          </Button>
        </Box>
      </Box>

      {/* Quick Actions Row */}
      <Box display="flex" justifyContent="center" mb={2} gap={1}></Box>

      {/* Compact Grid */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          maxHeight: '600px',
          overflowY: 'auto',
          pr: 1,
          position: 'relative',
          userSelect: 'none',
        }}
        onDragStart={handleDragStart}
        onContextMenu={handleContextMenu}
      >
        {/* Header row */}
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            position: 'sticky',
            top: 0,
            backgroundColor: 'background.paper',
            zIndex: 10,
            py: 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          {/* Time label spacer */}
          <Box
            sx={{
              width: 60,
              flexShrink: 0,
              visibility: 'hidden',
            }}
          />

          {daysOfWeek.map((day, dayIndex) => (
            <Box
              key={day}
              sx={{
                flex: 1,
                minWidth: 80,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <Typography variant="body2" fontWeight="bold">
                {day}
              </Typography>
              <Box display="flex" gap={0.5}>
                <IconButton
                  size="small"
                  onClick={() => handleSelectAllDay(dayIndex)}
                  sx={{ p: 0.25, color: 'primary.main' }}
                  onDragStart={handleDragStart}
                >
                  <IconSquareCheck size={14} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleClearDay(dayIndex)}
                  sx={{ p: 0.25, color: 'error.main' }}
                  onDragStart={handleDragStart}
                >
                  <IconX size={14} />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Time rows */}
        {timeGroups.map((group, groupIndex) => (
          <Box key={groupIndex} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', gap: 0.5, position: 'relative' }}>
              {/* Time labels column */}
              <Box
                sx={{
                  width: 60,
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  position: 'sticky',
                  left: 0,
                  backgroundColor: 'background.paper',
                  zIndex: 5,
                }}
              >
                {group.indices.map((timeIndex) => (
                  <Box
                    key={timeIndex}
                    sx={{
                      height: 25,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      color: 'text.secondary',
                      backgroundColor: 'background.paper',
                      borderRight: `1px solid ${theme.palette.divider}`,
                      userSelect: 'none',
                    }}
                    onDragStart={handleDragStart}
                  >
                    {timeSlots[timeIndex]}
                  </Box>
                ))}
              </Box>

              {/* Day columns */}
              {daysOfWeek.map((_, dayIndex) => (
                <Box
                  key={dayIndex}
                  sx={{
                    flex: 1,
                    minWidth: 80,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    zIndex: 1,
                  }}
                >
                  {group.indices.map((timeIndex) => {
                    const cellId = `${dayIndex}-${timeIndex}`;
                    const isSelected = selectedCells[cellId];

                    return (
                      <Box
                        key={timeIndex}
                        sx={{
                          height: 25,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 0.5,
                          backgroundColor: isSelected
                            ? theme.palette.primary.main
                            : theme.palette.grey[100],
                          opacity: isSelected ? 0.8 : 0.6,
                          '&:hover': {
                            backgroundColor: isSelected
                              ? theme.palette.primary.dark
                              : theme.palette.grey[300],
                            cursor: 'pointer',
                          },
                          transition: 'all 0.2s ease',
                          position: 'relative',
                          zIndex: 1,
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleMouseDown(dayIndex, timeIndex);
                        }}
                        onMouseEnter={() => handleMouseEnter(dayIndex, timeIndex)}
                        onDragStart={handleDragStart}
                        onContextMenu={handleContextMenu}
                      />
                    );
                  })}
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Selected time blocks summary */}
      {/* <Box
        mt={2}
        p={1}
        sx={{
          backgroundColor: theme.palette.grey[50],
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="subtitle2" gutterBottom display="flex" alignItems="center" gap={1}>
          <IconClock size={16} />
          Selected Time Blocks
        </Typography>

        <Box sx={{ maxHeight: 120, overflowY: 'auto' }}>
          {days.map(
            (day) =>
              day.hours.length > 0 && (
                <Box key={day.id} mb={0.5}>
                  <Typography variant="caption" fontWeight="bold">
                    {day.day}:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5} ml={1}>
                    {day.hours.map((hour) => (
                      <Chip
                        key={hour.id}
                        label={`${hour.startTime} - ${hour.endTime}`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              ),
          )}
          {days.every((day) => day.hours.length === 0) && (
            <Typography variant="caption" color="textSecondary">
              No time blocks selected. Click on the grid to select hours.
            </Typography>
          )}
        </Box>
      </Box> */}

      <Box mt={1}>
        <Typography variant="caption" color="textSecondary">
          Tip: Click and drag to select multiple hours
        </Typography>
      </Box>
    </Paper>
  );
};

export default TimeGridSelector;
