import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';

import {
  KeyboardArrowDownOutlined,
  KeyboardArrowUpOutlined,
} from '@mui/icons-material';

import { IconFileSpreadsheet, IconPdf } from '@tabler/icons-react';

import VisitorRow from 'src/customs/pages/admin/content/Visitor/Transaction/VisitorRow';
import bg_nodata from 'src/assets/images/backgrounds/bg_nodata.svg';
type Props = {
  selectedGroupId: any;
  groupHeader: any;
  groupVisitors: any[];
  groupDetailLoading: boolean;
  selectedVisitor: any;
  setSelectedVisitor: any;
  openGroup: boolean;
  setOpenGroup: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function VisitorListTable({
  selectedGroupId,
  groupHeader,
  groupVisitors,
  groupDetailLoading,
  selectedVisitor,
  setSelectedVisitor,
  openGroup,
  setOpenGroup,
}: Props) {
  if (!selectedGroupId) {
    return (
      <Box
        flex={1}
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
      >
        <img src={bg_nodata} width={150} />

        <Typography color="text.secondary" mt={2} variant="h5">
          Select a group from the list.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      flexGrow={1}
      sx={{
        width: '100%',
        flex: 1,
        minWidth: 0,
        overflowX: 'auto',
      }}
    >
      <TableContainer
        component={Paper}
        sx={{
          border: '1px solid #d6d6d6ff',
          minWidth: 900,
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 50 }}>
                <IconButton
                  size="small"
                  onClick={() => setOpenGroup((prev) => !prev)}
                >
                  {openGroup ? (
                    <KeyboardArrowUpOutlined />
                  ) : (
                    <KeyboardArrowDownOutlined />
                  )}
                </IconButton>
              </TableCell>

              <TableCell colSpan={7}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: 18,
                    }}
                  >
                    {groupHeader?.group_name ?? '-'}
                  </Typography>

                  <Box display="flex" gap={1}>
                    <Tooltip title="Export PDF">
                      <Button variant="contained" color="error">
                        <IconPdf />
                      </Button>
                    </Tooltip>

                    <Tooltip title="Export Excel">
                      <Button variant="contained" color="success">
                        <IconFileSpreadsheet />
                      </Button>
                    </Tooltip>
                  </Box>
                </Box>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell />
              <TableCell>Visitor Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Organization</TableCell>
              <TableCell>Host</TableCell>
              <TableCell>Site</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {groupDetailLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : groupVisitors.length > 0 ? (
              groupVisitors.map((visitor, index) => (
                <VisitorRow
                  key={`${visitor.id}-${index}`}
                  visitor={visitor}
                  index={index}
                  selectedVisitor={selectedVisitor}
                  setSelectedVisitor={setSelectedVisitor}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary">
                    No visitor data
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}