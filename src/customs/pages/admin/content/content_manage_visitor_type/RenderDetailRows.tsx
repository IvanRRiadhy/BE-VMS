import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  MenuItem,
  Switch,
  TextField,
} from '@mui/material';
import { IconTrash } from '@tabler/icons-react';

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type SectionKey = 'access' | 'parking' | 'tracking' | 'visit_form' | string;

function SortableRow({
  id,
  item,
  index,
  onChange,
  onDelete,
  customField,
  showMandatory,
  isDocument,
  canMultiple,
  sectionKey,
}: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isDragging ? '#f1f1f1' : 'inherit',
  };

  // helper untuk menentukan opsi yang ditampilkan di dropdown sesuai rule lama
  const filterField = (field: any) => {
    if (isDocument) return field.field_type >= 10 && field.field_type <= 12;
    if (canMultiple) return field.field_type >= 0 && field.field_type <= 12;
    return field.field_type >= 0 && field.field_type <= 9;
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell {...attributes} {...listeners} sx={{ textAlign: 'center', cursor: 'grab' }}>
        ⇅
      </TableCell>

      <TableCell
        sx={{
          width: { xs: '50%', sm: 'auto' },
          padding: { xs: 0, sm: 'auto' },
        }}
      >
        <TextField
          select
          size="small"
          sx={{ width: { xs: '150px', sm: '100%' } }}
          value={item.short_name || ''}
          onChange={(e) => {
            const selectedShortName = e.target.value;
            const matchedField = (customField || []).find(
              (f: any) => f.short_name === selectedShortName,
            );

            onChange(index, 'short_name', selectedShortName);

            if (matchedField) {
              onChange(index, 'custom_field_id', matchedField.id);
              onChange(index, 'remarks', matchedField.remarks);
              onChange(index, 'field_type', matchedField.field_type);
              onChange(index, 'multiple_option_fields', matchedField.multiple_option_fields ?? []);
            }
          }}
          placeholder="Select Field"
          fullWidth
        >
          {(customField || []).filter(filterField).map((field: any) => (
            <MenuItem key={field.id} value={field.short_name}>
              {field.short_name}
            </MenuItem>
          ))}
        </TextField>
      </TableCell>

      <TableCell
        sx={{
          width: { xs: '50%', sm: 'auto' },
          padding: { xs: 0.3, sm: 1 },
        }}
      >
        <TextField
          sx={{ width: { xs: '150px', sm: '100%' } }}
          size="small"
          value={item.long_display_text || ''}
          onChange={(e) => onChange(index, 'long_display_text', e.target.value)}
          placeholder="Display Text"
          fullWidth
        />
      </TableCell>

      <TableCell align="left">
        <Switch
          checked={!!item.is_enable}
          onChange={(_, checked) => onChange(index, 'is_enable', checked)}
        />
      </TableCell>

      {showMandatory && (
        <TableCell align="left">
          <Switch
            checked={!!item.mandatory}
            onChange={(_, checked) => onChange(index, 'mandatory', checked)}
          />
        </TableCell>
      )}

      <TableCell align="center">
        <IconButton onClick={() => onDelete(index)} size="small" sx={{ color: 'error.main' }}>
          <IconTrash fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

export default function RenderDetailRows({
  title,
  data = [],
  customField = [],
  onChange,
  onDelete,
  onReorder,
  showMandatory = true,
  isDocument = false,
  canMultiple = false,
  sectionKey,
  sectionName,
}: any) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // safety: pastikan data array
  const rows: any[] = Array.isArray(data) ? data : [];

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || !active) return;
    if (active.id === over.id) return;

    const oldIndex = rows.findIndex((i: any) => String(i.id) === String(active.id));
    const newIndex = rows.findIndex((i: any) => String(i.id) === String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(rows, oldIndex, newIndex);
    // mempertahankan struktur lama: tambahkan sort index
    const withSort = reordered.map((x: any, i: number) => ({ ...x, sort: i }));
    onReorder && onReorder(withSort);
  };

  return (
    <TableContainer component={Paper} sx={{ mb: 1 }}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={rows.map((d: any) => String(d.id))}
          strategy={verticalListSortingStrategy}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 40, textAlign: 'center' }}>*</TableCell>
                <TableCell>Field Name</TableCell>
                <TableCell>Display</TableCell>
                <TableCell>Enabled</TableCell>
                {showMandatory && <TableCell>Mandatory</TableCell>}
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((item: any, index: number) => (
                <SortableRow
                  key={item.id ?? index}
                  id={String(item.id ?? index)}
                  item={item}
                  index={index}
                  onChange={onChange}
                  onDelete={onDelete}
                  customField={customField}
                  showMandatory={showMandatory}
                  isDocument={isDocument}
                  canMultiple={canMultiple}
                  sectionKey={sectionKey}
                />
              ))}
            </TableBody>
          </Table>
        </SortableContext>
      </DndContext>
    </TableContainer>
  );
}
