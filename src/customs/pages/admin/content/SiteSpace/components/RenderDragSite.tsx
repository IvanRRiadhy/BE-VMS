import React from 'react';
import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

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
  Switch,
  IconButton,
  Autocomplete,
} from '@mui/material';

import { IconTrash } from '@tabler/icons-react';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';

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
    // <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
    <SortableContext
      // items={items.map((_, i) => `${sectionKey}-${i}`)}
      items={items.map((item) => item.id)}
      strategy={verticalListSortingStrategy}
    >
      <TableBody>
        {items.map((item, index) => {
          // const id = `${sectionKey}-${index}`;
          const id = item.id;

          return (
            <SortableRow
              key={id}
              id={id}
              item={item}
              items={items}
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
    //  </DndContext>
  );
};

const SortableRow = ({
  id,
  item,
  items,
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
          <Autocomplete
            fullWidth
            size="small"
            options={selectList}
            getOptionLabel={(option: any) =>
              option.area_name || option.masked_area_name || option.name || ''
            }
            getOptionDisabled={(option: any) =>
              items.some(
                (selected: any, selectedIndex: number) =>
                  // abaikan row yang sedang diedit
                  selectedIndex !== index &&
                  String(
                    selected[fieldName] ||
                      selected.trk_ble_card_access_id ||
                      selected.prk_area_parking_id ||
                      selected.access_control_id,
                  ).toLowerCase() === String(option.id).toLowerCase(),
              )
            }
            value={
              selectList.find(
                (x: any) =>
                  String(x.id) === String(item[fieldName]) ||
                  String(x.id) === String(item.trk_ble_card_access_id) ||
                  String(x.id) === String(item.prk_area_parking_id),
              ) ||
              (item[fieldName]
                ? {
                    id: item[fieldName],
                    masked_area_name: item.name,
                    area_name: item.name,
                  }
                : null)
            }
            onChange={(_, newValue) => {
              const selectedId =
                newValue?.trk_ble_card_access_id ||
                newValue?.prk_area_parking_id ||
                newValue?.id ||
                '';

              onChange(sectionKey, index, fieldName, selectedId);

              if (newValue) {
                const label =
                  newValue.area_name || newValue.masked_area_name || newValue.name || '';

                onChange(sectionKey, index, 'name', label);
              }
            }}
            renderInput={(params) => (
              <CustomTextField {...params} placeholder={`Select ${sectionKey}`} />
            )}
            ListboxProps={{
              style: {
                maxHeight: 250,
                overflow: 'auto',
              },
            }}
          />
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
