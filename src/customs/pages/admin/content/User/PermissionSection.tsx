import React, { memo, useMemo, useState, useCallback } from 'react';
import {
  Grid2,
  Switch,
  FormControlLabel,
  Box,
  Autocomplete,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  IconButton,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import { IconTrash } from '@tabler/icons-react';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';

interface Props {
  groupId: string;
  permissions: string[];
  setPermissions: (value: string[]) => void;
  siteOptions: any[];
  organizationSiteOptions: any[];
  regsiteredSiteOptions: any[];
  accessOptions: any[];
}

const GROUP_PERMISSION_MAP: Record<string, string[]> = {
  employee: ['AsHead', 'InviteVisitor', 'InviteWithinOwnOrganization', 'InviteWithinOwnSite'],
  operatorvms: ['ManageAccess', 'ManageRegisterSite'],
};

const PermissionSection: React.FC<Props> = ({
  groupId,
  permissions,
  setPermissions,
  siteOptions,
  organizationSiteOptions,
  regsiteredSiteOptions,
  accessOptions,
}) => {
  const [selectedAccess, setSelectedAccess] = useState<any[]>([]);
  const [permissionSites, setPermissionSites] = useState<Record<string, string[]>>({});

  const permissionList = useMemo(() => {
    return GROUP_PERMISSION_MAP[groupId?.toLowerCase()] ?? [];
  }, [groupId]);

  const togglePermission = useCallback(
    (perm: string, checked: boolean) => {
      if (checked) {
        setPermissions([...permissions, perm]);
      } else {
        setPermissions(permissions.filter((p) => p !== perm));
      }
    },
    [permissions, setPermissions],
  );

  const handleAddNewAccess = () => {
    setSelectedAccess((prev) => [
      ...prev,
      {
        access_control_id: '',
        can_grant: false,
        can_revoke: false,
        can_block: false,
      },
    ]);
  };

  if (!groupId) return null;

  return (
    <Grid2 size={{ xs: 12 }}>
      <CustomFormLabel sx={{ mt: 0.5 }}>Permissions</CustomFormLabel>

      <Grid2 container spacing={2}>
        {permissionList.map((perm) => {
          const checked = permissions.includes(perm);

          return (
            <Grid2 size={{ xs: 12 }} key={perm}>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={checked}
                      onChange={(e) => togglePermission(perm, e.target.checked)}
                    />
                  }
                  label={perm}
                />

                {/* MANAGE ACCESS TABLE */}
                {checked && perm === 'ManageAccess' && (
                  <TableContainer component={Paper} sx={{ mt: 1 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Access</TableCell>
                          <TableCell align="center">Grant</TableCell>
                          <TableCell align="center">Revoke</TableCell>
                          <TableCell align="center">Block</TableCell>
                          <TableCell align="center">Action</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {selectedAccess.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <FormControl size="small" fullWidth>
                                <Select
                                  value={row.access_control_id}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setSelectedAccess((prev) =>
                                      prev.map((r, i) =>
                                        i === index ? { ...r, access_control_id: value } : r,
                                      ),
                                    );
                                  }}
                                >
                                  {accessOptions.map((a) => (
                                    <MenuItem key={a.id} value={a.id}>
                                      {a.name}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>

                            <TableCell align="center">
                              <Switch
                                checked={row.can_grant}
                                onChange={(e) =>
                                  setSelectedAccess((prev) =>
                                    prev.map((r, i) =>
                                      i === index ? { ...r, can_grant: e.target.checked } : r,
                                    ),
                                  )
                                }
                              />
                            </TableCell>

                            <TableCell align="center">
                              <Switch
                                checked={row.can_revoke}
                                onChange={(e) =>
                                  setSelectedAccess((prev) =>
                                    prev.map((r, i) =>
                                      i === index ? { ...r, can_revoke: e.target.checked } : r,
                                    ),
                                  )
                                }
                              />
                            </TableCell>

                            <TableCell align="center">
                              <Switch
                                checked={row.can_block}
                                onChange={(e) =>
                                  setSelectedAccess((prev) =>
                                    prev.map((r, i) =>
                                      i === index ? { ...r, can_block: e.target.checked } : r,
                                    ),
                                  )
                                }
                              />
                            </TableCell>

                            <TableCell align="center">
                              <IconButton
                                onClick={() =>
                                  setSelectedAccess((prev) => prev.filter((_, i) => i !== index))
                                }
                              >
                                <IconTrash size={18} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <Box sx={{ p: 2 }}>
                      <Button variant="contained" onClick={handleAddNewAccess}>
                        Add New
                      </Button>
                    </Box>
                  </TableContainer>
                )}
              </Box>
            </Grid2>
          );
        })}
      </Grid2>
    </Grid2>
  );
};

export default memo(PermissionSection);
