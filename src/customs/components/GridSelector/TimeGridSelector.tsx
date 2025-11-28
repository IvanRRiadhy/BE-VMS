import { Box, Paper, Typography, useTheme, Button, IconButton, Chip } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import {
  IconX,
  IconClock,
  IconSquare,
  IconSquareCheck,
  IconChecklist,
  IconSquareOff,
  IconTrash,
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
  onSubmit?: any;
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
  const [dragStart, setDragStart] = useState<{ day: number; time: number } | null>(null);

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

  const totalCells = daysOfWeek.length * timeSlots.length;
  const isAllSelected = Object.keys(selectedCells).length === totalCells;

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

  useEffect(() => {
    onSelectionChange(days);
  }, [days, onSelectionChange]);

  useEffect(() => {
    console.log('### TimeGridSelector initialData berubah:', initialData);

    if (initialData && initialData.length > 0) {
      console.log('   -> Memuat initialData ke days state');
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

  // useEffect(() => {
  //   const newDays = convertSelectionToTimeBlocks();
  //   onSelectionChange(newDays);
  // }, [selectedCells]);

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
  // const handleMouseDown = useCallback(
  //   (dayIndex: number, timeIndex: number) => {
  //     setIsSelecting(true);
  //     handleCellClick(dayIndex, timeIndex);
  //   },
  //   [handleCellClick],
  // );

  // const handleMouseDown = useCallback((dayIndex: number, timeIndex: number) => {
  //   setIsSelecting(true);
  //   setDragStart({ day: dayIndex, time: timeIndex });
  // }, []);

  const handleMouseDown = (dayIndex: number, timeIndex : number) => {
    setIsSelecting(true);
    setDragStart({ day: dayIndex, time: timeIndex });

    const cellId = `${dayIndex}-${timeIndex}`;
    setSelectedCells((prev) => {
      const updated = { ...prev };
      if (selectionMode === 'add') updated[cellId] = true;
      else delete updated[cellId];
      return updated;
    });
  };

  // Handle mouse enter on cell during selection
  // const handleMouseEnter = useCallback(
  //   (dayIndex: number, timeIndex: number) => {
  //     if (!isSelecting) return;
  //     // cuma update selectedCells, tanpa convert
  //     handleCellClick(dayIndex, timeIndex);
  //   },
  //   [isSelecting, handleCellClick],
  // );

  // const handleMouseEnter = useCallback(
  //   (dayIndex: number, timeIndex: number) => {
  //     if (!isSelecting || !dragStart) return;

  //     const start = dragStart.time;
  //     const end = timeIndex;

  //     const min = Math.min(start, end);
  //     const max = Math.max(start, end);

  //     const updates: Record<string, boolean> = {};

  //     for (let i = min; i <= max; i++) {
  //       const cellId = `${dragStart.day}-${i}`;
  //       updates[cellId] = true;
  //     }

  //     setSelectedCells((prev) => ({ ...prev, ...updates }));
  //   },
  //   [isSelecting, dragStart],
  // );

  const handleMouseEnter = useCallback(
    (dayIndex: number, timeIndex: number) => {
      if (!isSelecting || !dragStart) return;

      const start = dragStart.time;
      const end = timeIndex;

      const min = Math.min(start, end);
      const max = Math.max(start, end);

      setSelectedCells((prev) => {
        const updated = { ...prev };

        for (let i = min; i <= max; i++) {
          const cellId = `${dragStart.day}-${i}`;

          if (selectionMode === 'add') {
            updated[cellId] = true;
          } else {
            delete updated[cellId];
          }
        }

        return updated;
      });
    },
    [isSelecting, dragStart, selectionMode],
  );

  useEffect(() => {
    const handleUp = () => {
      if (isSelecting) {
        setIsSelecting(false);
        setDragStart(null);

        const newDays = convertSelectionToTimeBlocks();
        setDays(newDays);
        onSelectionChange(newDays);
        onSubmit?.(newDays);
      }
    };

    window.addEventListener('mouseup', handleUp);
    return () => window.removeEventListener('mouseup', handleUp);
  }, [isSelecting]);

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
          <Button
            startIcon={<IconTrash size={16} />}
            variant="contained"
            color="error"
            onClick={handleClearAll}
            size="small"
          >
            Clear
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              const newDays = convertSelectionToTimeBlocks();
              onSelectionChange(newDays);
              onSubmit?.(newDays);
            }}
            size="small"
          >
            Apply
          </Button>
        </Box>
      </Box>

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
        {timeGroups.map((group, groupIndex) => (
          <Box key={groupIndex} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', gap: 0.5, position: 'relative' }}>
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

      <Box mt={1}>
        <Typography variant="caption" color="textSecondary">
          Tip: Click and drag to select multiple hours
        </Typography>
      </Box>
    </Paper>
  );
};

export default TimeGridSelector;
