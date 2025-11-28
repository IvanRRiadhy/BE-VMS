import React from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

import {
  TableBody,
  TableRow,
  TableCell,
  TextField,
  MenuItem,
  Switch,
  IconButton,
} from '@mui/material';

import { IconTrash } from '@tabler/icons-react';

interface Props {
  sectionKey: 'parking' | 'tracking' | 'access';
  items: any[];
  onChange: (section: string, index: number, field: string, value: any) => void;
  onDelete?: (section: string, index: number) => void;

  accessControlList?: any[];
  parkingList?: any[];
  trackingList?: any[];
  onReorder: (newItems: any[]) => void;
}

const RenderDragSite: React.FC<Props> = ({
  sectionKey,
  items,
  onChange,
  onDelete,
  accessControlList,
  parkingList,
  trackingList,
  onReorder,
}) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    const oldIndex = items.findIndex((_, idx) => `${sectionKey}-${idx}` === active.id);
    const newIndex = items.findIndex((_, idx) => `${sectionKey}-${idx}` === over.id);

    const reordered = arrayMove(items, oldIndex, newIndex);
    onReorder(reordered);
  };

  const getSelectList = () => {
    if (sectionKey === 'access') return accessControlList ?? [];
    if (sectionKey === 'parking') return parkingList ?? [];
    if (sectionKey === 'tracking') return trackingList ?? [];
    return [];
  };

  const getFieldName = () => {
    if (sectionKey === 'access') return 'access_control_id';
    if (sectionKey === 'parking') return 'prk_area_parking_id';
    if (sectionKey === 'tracking') return 'trk_ble_card_access_id';
    return 'name';
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={items.map((_, i) => `${sectionKey}-${i}`)}
        strategy={verticalListSortingStrategy}
      >
        <TableBody>
          {items.map((item, index) => {
            const id = `${sectionKey}-${index}`;

            return (
              <SortableRow
                key={id}
                id={id}
                item={item}
                index={index}
                sectionKey={sectionKey}
                onChange={onChange}
                onDelete={onDelete}
                selectList={getSelectList()}
                fieldName={getFieldName()}
              />
            );
          })}
        </TableBody>
      </SortableContext>
    </DndContext>
  );
};

const SortableRow = ({
  id,
  item,
  index,
  sectionKey,
  onChange,
  onDelete,
  selectList,
  fieldName,
}: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: isDragging ? '#f0f0f0' : undefined,
  };

  const isDropdown = selectList.length > 0;

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes}>
      {/* Drag handle */}
      <TableCell {...listeners} sx={{ cursor: 'grab', width: 40 }}>
        ⇅
      </TableCell>

      {/* Name / Dropdown */}
      <TableCell>
        {isDropdown ? (
          <TextField
            select
            fullWidth
            size="small"
            value={item[fieldName] || ''}
            onChange={(e) => {
              const selectedId = e.target.value;
              const selected = selectList.find((x: any) => x.id === selectedId);

              onChange(sectionKey, index, fieldName, selectedId);
              if (selected) onChange(sectionKey, index, 'name', selected.name);
            }}
          >
            <MenuItem value="" disabled>
              Select {sectionKey}
            </MenuItem>
            {selectList.map((x: any) => (
              <MenuItem key={x.id} value={x.id}>
                {x.name}
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <TextField
            fullWidth
            size="small"
            value={item.name || ''}
            onChange={(e) => onChange(sectionKey, index, 'name', e.target.value)}
          />
        )}
      </TableCell>

      {/* Early Access */}
      <TableCell>
        <Switch
          checked={!!item.early_access}
          onChange={(_, checked) => onChange(sectionKey, index, 'early_access', checked)}
        />
      </TableCell>

      {/* Delete */}
      {onDelete && (
        <TableCell>
          <IconButton onClick={() => onDelete(sectionKey, index)} color="error">
            <IconTrash size={22} />
          </IconButton>
        </TableCell>
      )}
    </TableRow>
  );
};

export default RenderDragSite;
