// import React, { useMemo } from 'react';
// import {
//   TextField,
//   MenuItem,
//   Checkbox,
//   FormControlLabel,
//   Typography,
//   Box,
//   IconButton,
//   Paper,
// } from '@mui/material';
// import { IconX } from '@tabler/icons-react';
// import CloudUploadIcon from '@mui/icons-material/CloudUpload';
// import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
// import dayjs from 'dayjs';
// import 'dayjs/locale/id';
// import CameraUpload from 'src/customs/components/camera/CameraUpload'; // sesuaikan path kamu
// import { FormVisitor } from 'src/customs/api/models/Visitor';

// // ==========================================================
// // 🧩 Helper: Debounce universal
// // ==========================================================
// const useDebouncedCallback = (fn: Function, delay = 300) => {
//   const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

//   return useMemo(
//     () =>
//       (...args: any[]) => {
//         if (timeoutRef.current) clearTimeout(timeoutRef.current);
//         timeoutRef.current = setTimeout(() => fn(...args), delay);
//       },
//     [fn, delay],
//   );
// };

// // ==========================================================
// // 🧱 FieldInput (memoized component)
// // ==========================================================
// interface FieldInputProps {
//   field: FormVisitor;
//   index: number;
//   onChange: (index: number, fieldKey: keyof FormVisitor, value: any) => void;
//   onDelete?: (index: number) => void;
//   opts?: { showLabel?: boolean; uniqueKey?: string };
//   uploadMethods?: Record<string, string>;
//   uploadNames?: Record<string, string>;
//   removing?: Record<string, boolean>;
//   handleUploadMethodChange?: (key: string, value: string) => void;
//   handleFileChangeForField?: (
//     e: React.ChangeEvent<HTMLInputElement>,
//     cb: (url: string) => void,
//     key: string,
//   ) => void;
//   handleRemoveFileForField?: (url: string, cb: (url: string) => void, key: string) => void;
// }

// const FieldInput: React.FC<FieldInputProps> = React.memo(
//   ({
//     field,
//     index,
//     onChange,
//     opts,
//     uploadMethods = {},
//     uploadNames = {},
//     removing = {},
//     handleUploadMethodChange = () => {},
//     handleFileChangeForField = () => {},
//     handleRemoveFileForField = () => {},
//   }) => {
//     const showLabel = opts?.showLabel ?? true;
//     const key = opts?.uniqueKey ?? String(index);

//     // 🔹 Debounced onChange agar tidak berat tiap ketikan
//     const debouncedOnChange = useDebouncedCallback(onChange, 300);

//     const renderInput = () => {
//       switch (field.field_type) {
//         case 0: // Text
//           return (
//             <TextField
//               size="small"
//               value={field.answer_text || ''}
//               onChange={(e) => debouncedOnChange(index, 'answer_text', e.target.value)}
//               fullWidth
//               sx={{ minWidth: 160 }}
//             />
//           );

//         case 1: // Number
//           return (
//             <TextField
//               type="number"
//               size="small"
//               value={field.answer_text || ''}
//               onChange={(e) => onChange(index, 'answer_text', e.target.value)}
//               fullWidth
//             />
//           );

//         case 2: // Email
//           return (
//             <TextField
//               type="email"
//               size="small"
//               value={field.answer_text || ''}
//               onChange={(e) => debouncedOnChange(index, 'answer_text', e.target.value)}
//               fullWidth
//             />
//           );

//         case 4: // Date
//           return (
//             <TextField
//               type="date"
//               size="small"
//               value={field.answer_datetime || ''}
//               onChange={(e) => onChange(index, 'answer_datetime', e.target.value)}
//               fullWidth
//             />
//           );

//         case 5: // Select (Gender, Vehicle Type)
//           if (field.remarks === 'gender') {
//             const genderOptions = field.multiple_option_fields?.length
//               ? field.multiple_option_fields
//               : [
//                   { id: '1', value: '0', name: 'Female' },
//                   { id: '2', value: '1', name: 'Male' },
//                   { id: '3', value: '2', name: 'Prefer not to say' },
//                 ];

//             return (
//               <TextField
//                 select
//                 size="small"
//                 fullWidth
//                 value={field.answer_text || ''}
//                 onChange={(e) => onChange(index, 'answer_text', e.target.value)}
//                 sx={{ width: 120 }}
//               >
//                 {genderOptions.map((opt) => (
//                   <MenuItem key={opt.id} value={opt.value}>
//                     {opt.name}
//                   </MenuItem>
//                 ))}
//               </TextField>
//             );
//           }

//           if (field.remarks === 'vehicle_type') {
//             let options = field.multiple_option_fields || [];
//             if (options.length === 0 && field.answer_text) {
//               options = [{ id: 'default', value: field.answer_text, name: field.answer_text }];
//             }

//             if (options.length === 0) {
//               options = [
//                 { id: '1', value: 'truck', name: 'Truck' },
//                 { id: '2', value: 'other', name: 'Other' },
//                 { id: '3', value: 'bicycle', name: 'Bicycle' },
//                 { id: '4', value: 'motor', name: 'Motor' },
//                 { id: '5', value: 'private_car', name: 'Private Car' },
//                 { id: '6', value: 'car', name: 'Car' },
//                 { id: '7', value: 'bus', name: 'Bus' },
//               ];
//             }

//             return (
//               <TextField
//                 select
//                 size="small"
//                 fullWidth
//                 value={field.answer_text || ''}
//                 onChange={(e) => onChange(index, 'answer_text', e.target.value)}
//               >
//                 {options.map((opt) => (
//                   <MenuItem key={opt.id} value={opt.name}>
//                     {opt.name}
//                   </MenuItem>
//                 ))}
//               </TextField>
//             );
//           }

//           return (
//             <TextField
//               size="small"
//               value={field.answer_text || ''}
//               onChange={(e) => debouncedOnChange(index, 'answer_text', e.target.value)}
//               fullWidth
//             />
//           );

//         case 6: // Checkbox
//           return (
//             <FormControlLabel
//               control={
//                 <Checkbox
//                   checked={Boolean(field.answer_text)}
//                   onChange={(e) => onChange(index, 'answer_text', e.target.checked)}
//                 />
//               }
//               label=""
//             />
//           );

//         case 9: // DateTime
//           return (
//             <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
//               <DateTimePicker
//                 value={field.answer_datetime ? dayjs(field.answer_datetime) : null}
//                 ampm={false}
//                 onChange={(newValue) => {
//                   if (newValue) {
//                     const utc = newValue.utc().format();
//                     onChange(index, 'answer_datetime', utc);
//                   }
//                 }}
//                 format="ddd, DD - MMM - YYYY, HH:mm"
//                 viewRenderers={{
//                   hours: renderTimeViewClock,
//                   minutes: renderTimeViewClock,
//                   seconds: renderTimeViewClock,
//                 }}
//                 slotProps={{ textField: { fullWidth: true } }}
//               />
//             </LocalizationProvider>
//           );

//         case 10: // Camera
//           return (
//             <CameraUpload
//               value={field.answer_file}
//               onChange={(url) => onChange(index, 'answer_file', url)}
//             />
//           );

//         case 12: // Upload / Camera Choice
//           return (
//             <Box
//               display="flex"
//               flexDirection={{ xs: 'column', md: 'row' }}
//               alignItems={{ xs: 'stretch', md: 'center' }}
//               justifyContent="space-between"
//               gap={1.5}
//               sx={{ maxWidth: 400 }}
//             >
//               <TextField
//                 select
//                 size="small"
//                 value={uploadMethods[key] || 'file'}
//                 onChange={(e) => handleUploadMethodChange(key, e.target.value)}
//                 fullWidth
//               >
//                 <MenuItem value="file">Choose File</MenuItem>
//                 <MenuItem value="camera">Take Photo</MenuItem>
//               </TextField>

//               {(uploadMethods[key] || 'file') === 'camera' ? (
//                 <CameraUpload
//                   value={field.answer_file}
//                   onChange={(url) => onChange(index, 'answer_file', url)}
//                 />
//               ) : (
//                 <Box sx={{ width: { xs: '100%', md: '200px' } }}>
//                   <label htmlFor={key}>
//                     <Box
//                       sx={{
//                         border: '2px dashed #90caf9',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         gap: 1.5,
//                         borderRadius: 2,
//                         p: 0.5,
//                         textAlign: 'center',
//                         backgroundColor: '#f5faff',
//                         cursor: 'pointer',
//                         '&:hover': { backgroundColor: '#e3f2fd' },
//                       }}
//                     >
//                       <CloudUploadIcon sx={{ fontSize: 20, color: '#42a5f5' }} />
//                       <Typography variant="subtitle1" sx={{ fontSize: { xs: 13, md: 14 } }}>
//                         Upload File
//                       </Typography>
//                     </Box>
//                   </label>

//                   <input
//                     id={key}
//                     type="file"
//                     hidden
//                     accept="*"
//                     onChange={(e) =>
//                       handleFileChangeForField(
//                         e as React.ChangeEvent<HTMLInputElement>,
//                         (url) => onChange(index, 'answer_file', url),
//                         key,
//                       )
//                     }
//                   />

//                   {!!field.answer_file && (
//                     <Box mt={0.5} display="flex" alignItems="center" justifyContent="space-between">
//                       <Typography variant="caption" noWrap>
//                         {uploadNames[key] ??
//                           field.answer_file.split('/').pop()?.split('?')[0] ??
//                           'Uploaded File'}
//                       </Typography>
//                       <IconButton
//                         size="small"
//                         color="error"
//                         disabled={!!removing[key]}
//                         onClick={() =>
//                           handleRemoveFileForField(
//                             field?.answer_file ?? '',
//                             (url) => onChange(index, 'answer_file', url),
//                             key,
//                           )
//                         }
//                       >
//                         <IconX size={16} />
//                       </IconButton>
//                     </Box>
//                   )}
//                 </Box>
//               )}
//             </Box>
//           );

//         default:
//           return (
//             <TextField
//               size="small"
//               value={field.answer_text || ''}
//               onChange={(e) => debouncedOnChange(index, 'answer_text', e.target.value)}
//               fullWidth
//             />
//           );
//       }
//     };

//     return (
//       <Box sx={{ overflow: 'auto', width: '100%' }}>
//         {showLabel && (
//           <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
//             {field.long_display_text}
//           </Typography>
//         )}
//         {renderInput()}
//       </Box>
//     );
//   },
// );

// export default FieldInput;
