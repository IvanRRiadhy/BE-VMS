// import {
//   Box,
//   Button,
//   Typography,
//   Grid2 as Grid,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
//   TextField,
//   Divider,
// } from '@mui/material';
// import { SelectChangeEvent } from '@mui/material/Select';
// import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';

// interface VisitorFilters {
//   visitor_type: string;
//   site: string;
//   status: string;
//   created_at: string;
// }

// type FilterMoreContentProps = {
//   filters: VisitorFilters;
//   setFilters: React.Dispatch<React.SetStateAction<VisitorFilters>>;
//   onApplyFilter: () => void;
// };

// const FilterMoreContentVisitor: React.FC<FilterMoreContentProps> = ({
//   filters,
//   setFilters,
//   onApplyFilter,
// }) => {
//   const handleSelectChange = (e: SelectChangeEvent) => {
//     const { name, value } = e.target;
//     setFilters((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFilters((prev) => ({ ...prev, [name]: value }));
//   };

//   return (
//     <Box sx={{ padding: { xs: 0, lg: 3 }, margin: 1.5, boxShadow: 0, borderRadius: 2 }}>
//       <Typography variant="h5" gutterBottom>
//         Filter Visitor
//       </Typography>
//       <Divider />
//       <Grid container spacing={3} sx={{ marginTop: '5px' }}>
//         {/* Visitor Type */}
//         <Grid size={{ xs: 12, md: 6 }}>
//           <FormControl fullWidth>
//             <CustomFormLabel htmlFor="visitor-type">Visitor Type</CustomFormLabel>
//             <Select
//               labelId="visitor-type-label"
//               name="visitor_type"
//               value={filters.visitor_type}
//               label="Visitor Type"
//               onChange={handleSelectChange}
//             >
//               <MenuItem value="">All</MenuItem>
//               <MenuItem value="guest">Guest</MenuItem>
//               <MenuItem value="employee">Employee</MenuItem>
//               <MenuItem value="vendor">Vendor</MenuItem>
//             </Select>
//           </FormControl>
//         </Grid>

//         {/* Site */}
//         <Grid size={{ xs: 12, md: 6 }}>
//           <FormControl fullWidth>
//             <CustomFormLabel htmlFor="site">Site</CustomFormLabel>
//             <Select
//               labelId="site-label"
//               name="site"
//               value={filters.site}
//               label="Site"
//               onChange={handleSelectChange}
//             >
//               <MenuItem value="">All</MenuItem>
//               <MenuItem value="siteA">Site A</MenuItem>
//               <MenuItem value="siteB">Site B</MenuItem>
//               <MenuItem value="siteC">Site C</MenuItem>
//             </Select>
//           </FormControl>
//         </Grid>

//         {/* Status */}
//         <Grid size={{ xs: 12, md: 6 }}>
//           <FormControl fullWidth>
//             <CustomFormLabel htmlFor="status" sx={{ marginTop: '0px' }}>
//               Status
//             </CustomFormLabel>
//             <Select
//               labelId="status-label"
//               name="status"
//               value={filters.status}
//               label=""
//               onChange={handleSelectChange}
//             >
//               <MenuItem value="">All</MenuItem>
//               <MenuItem value="check-in">Check-in</MenuItem>
//               <MenuItem value="check-out">Check-out</MenuItem>
//               <MenuItem value="block">Block</MenuItem>
//               <MenuItem value="denied">Denied</MenuItem>
//             </Select>
//           </FormControl>
//         </Grid>

//         {/* Created At */}
//         <Grid size={{ xs: 12, md: 6 }}>
//           <CustomFormLabel htmlFor="created_at" sx={{ marginTop: '0px' }}>
//             Created At
//           </CustomFormLabel>
//           <TextField
//             fullWidth
//             type="date"
//             label=""
//             name="created_at"
//             value={filters.created_at}
//             onChange={handleInputChange}
//             InputLabelProps={{ shrink: true }}
//           />
//         </Grid>

//         {/* Search Button */}
//         <Grid size={{ xs: 12, md: 6 }}>
//           <Button variant="contained" color="primary" onClick={onApplyFilter}>
//             Search
//           </Button>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// export default FilterMoreContentVisitor;

import { Box, Button, Typography, Divider, Checkbox } from '@mui/material';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PersonIcon from '@mui/icons-material/Person';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

interface VisitorFilters {
  visitor_type: string[];
  site: string[];
  status: string[];
  created_at: string[];
}

type FilterMoreContentProps = {
  filters: VisitorFilters;
  setFilters: React.Dispatch<React.SetStateAction<VisitorFilters>>;
  onApplyFilter: () => void;
};

// komponen kecil untuk label row dengan checkbox
const Row = ({
  icon,
  label,
  checked,
  onToggle,
}: {
  icon?: React.ReactNode;
  label: string;
  checked: boolean;
  onToggle: () => void;
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    {icon}
    <Checkbox size="small" checked={checked} onChange={onToggle} sx={{ p: 0.5 }} />
    <Typography variant="body2">{label}</Typography>
  </Box>
);

const FilterMoreContentVisitor: React.FC<FilterMoreContentProps> = ({
  filters,
  setFilters,
  onApplyFilter,
}) => {
  // toggle helper
  const toggleFilter = (type: keyof VisitorFilters, value: string) => {
    setFilters((prev) => {
      const current = prev[type];
      const exists = current.includes(value);
      return {
        ...prev,
        [type]: exists ? current.filter((v) => v !== value) : [...current, value],
      };
    });
  };

  return (
    <Box sx={{ padding: { xs: 0, lg: 3 }, margin: 1, boxShadow: 0, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        Filter Visitor
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <TreeView
        slots={{
          collapseIcon: ExpandMoreIcon,
          expandIcon: ChevronRightIcon,
        }}
      >
        {/* Visitor Type */}
        <TreeItem
          itemId="1"
          label={
            <Row
            //   icon={<PersonIcon fontSize="small" />}
              label="Visitor Type"
              checked={filters.visitor_type.length > 0}
              onToggle={() => {}} // parent tidak toggle, hanya child
            />
          }
        >
          {['guest', 'employee', 'vendor'].map((v) => (
            <TreeItem
              key={v}
              itemId={`1-${v}`}
              label={
                <Row
                  label={v.charAt(0).toUpperCase() + v.slice(1)}
                  checked={filters.visitor_type.includes(v)}
                  onToggle={() => toggleFilter('visitor_type', v)}
                />
              }
            />
          ))}
        </TreeItem>

        {/* Site */}
        <TreeItem
          itemId="2"
          label={
            <Row
            //   icon={<LocationCityIcon fontSize="small" />}
              label="Site"
              checked={filters.site.length > 0}
              onToggle={() => {}}
            />
          }
        >
          {['Site A', 'Site B', 'Site C'].map((s) => (
            <TreeItem
              key={s}
              itemId={`2-${s}`}
              label={
                <Row
                  label={s}
                  checked={filters.site.includes(s)}
                  onToggle={() => toggleFilter('site', s)}
                />
              }
            />
          ))}
        </TreeItem>

        {/* Status */}
        {/* <TreeItem
          itemId="3"
          label={
            <Row
            //   icon={<AssignmentTurnedInIcon fontSize="small" />}
              label="Status"
              checked={filters.status.length > 0}
              onToggle={() => {}}
            />
          }
        >
          {['check-in', 'check-out', 'block', 'denied'].map((st) => (
            <TreeItem
              key={st}
              itemId={`3-${st}`}
              label={
                <Row
                  label={st}
                  checked={filters.status.includes(st)}
                  onToggle={() => toggleFilter('status', st)}
                />
              }
            />
          ))}
        </TreeItem> */}

        {/* Created At */}
        {/* <TreeItem
          itemId="4"
          label={
            <Row
            //   icon={<EventAvailableIcon fontSize="small" />}
              label="Created At"
              checked={filters.created_at.length > 0}
              onToggle={() => {}}
            />
          }
        >
          {['today', 'this_week'].map((d) => (
            <TreeItem
              key={d}
              itemId={`4-${d}`}
              label={
                <Row
                  label={d === 'today' ? 'Today' : 'This Week'}
                  checked={filters.created_at.includes(d)}
                  onToggle={() => toggleFilter('created_at', d)}
                />
              }
            />
          ))}
        </TreeItem> */}
      </TreeView>

      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button variant="contained" color="primary" onClick={onApplyFilter}  size='small'>
          Apply
        </Button>
      </Box>
    </Box>
  );
};

export default FilterMoreContentVisitor;
