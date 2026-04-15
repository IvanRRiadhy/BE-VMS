import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  Grid2,
  Alert,
  Typography,
  CircularProgress,
  Portal,
  Backdrop,
  TextField,
  MenuItem,
  Autocomplete,
  Switch,
} from '@mui/material';
import { Box, useMediaQuery, useTheme } from '@mui/system';
import { IconTrash } from '@tabler/icons-react';

import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { useSession } from 'src/customs/contexts/SessionContext';
import { showSwal } from 'src/customs/components/alerts/alerts';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import {
  createApprovalWorkflow,
  getApprovalWorkflowById,
  updateApprovalWorkflow,
} from 'src/customs/api/Admin/ApprovalWorkflow';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import { getAllUser, getAllEmployee } from 'src/customs/api/admin';

interface FormApproveProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  edittingId: string;
  onSuccess?: () => void;
}

type RuleNode = {
  id: string;
  type: 'GROUP' | 'ROLE';
  operator?: 'AND' | 'OR';
  role?: string;
  entity_id?: string;
  step_order?: number;
  children?: RuleNode[];
};

const FormApprove: React.FC<FormApproveProps> = ({
  formData,
  setFormData,
  edittingId,
  onSuccess,
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const { token } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const roleOptions = [
    { label: 'Host', value: 'Host' },
    // { label: 'User', value: 'User' },
    { label: 'Manager', value: 'Manager' },
    { label: 'PIC', value: 'PIC' },
  ];
  const [expanded, setExpanded] = useState<string[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  const createId = () => Math.random().toString(36).substring(2, 9);
  const [rules, setRules] = useState<RuleNode[]>([]);

  const buildRulesFromConditions = (conditions: any[], rootLogic: 'AND' | 'OR'): RuleNode[] => {
    const convert = (cond: any): RuleNode => {
      if (cond.children && cond.children.length > 0) {
        return {
          id: createId(),
          type: 'GROUP',
          operator: cond.logic,
          children: cond.children.map(convert),
        };
      }

      const roleName =
        Object.entries(roleMap).find(([_, v]) => v === cond.approver_type)?.[0] ?? '';

      return {
        id: createId(),
        type: 'ROLE',
        role: roleName,
        entity_id: cond.entity_id,
      };
    };

    return conditions.map(convert);
  };

  useEffect(() => {
    if (!edittingId) return;

    const loadData = async () => {
      try {
        // setLoading(true);

        const res = await getApprovalWorkflowById(token as string, edittingId);
        const data = res.collection;
        // console.log('data', data);
        

        setFormData({
          name: data.name,
          description: data.description,
          type: data.type,
          step_order: data.step_order ?? false,
        });

        const parsedRules = buildRulesFromConditions(data.conditions, data.root_logic);

        setRules(parsedRules);
      } catch (err) {
        showSwal('error', 'Failed to load workflow');
      }
    };

    loadData();
  }, [edittingId]);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;

      setFormData((prev: any) => ({
        ...prev,
        [name]: value,
      }));
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    stepRef.current = 1;
    try {
      // const root = rules[0];

      // const conditions =
      //   root?.type === 'GROUP'
      //     ? buildConditions(root.children ?? [], root.operator)
      //     : buildConditions(rules);

      const conditions = buildConditions(rules, undefined, undefined, true);

      const payload = {
        name: formData.name,
        description: formData.description,
        root_logic: rules[0]?.operator ?? null,
        type: formData.type,
        conditions,
      };

      console.log('payload', JSON.stringify(payload, null, 2));

      if (edittingId) {
        await updateApprovalWorkflow(token as string, edittingId, payload);
      } else {
        await createApprovalWorkflow(token as string, payload);
      }

      setLoading(false);
      onSuccess?.();
    } catch (err: any) {
      setLoading(false);
      if (err?.errors) setErrors(err.errors);
      showSwal('error', err?.message || 'Failed to create document.');
    }
  };

  const addRootRule = (operator: 'AND' | 'OR') => {
    setRules((prev) => [
      ...prev,
      {
        id: createId(),
        type: 'GROUP',
        operator,
        children: [],
      },
    ]);
  };

  const uuid = () => crypto.randomUUID();
  const roleMap: Record<string, string> = {
    Host: 'InvitationHost',
    Manager: 'Manager',
    PIC: 'PIC',
    // User: 'User',
  };
  // let step = 1;
  const stepRef = useRef(1);
  // stepRef.current = 1;
  const rootLogic = rules[0]?.operator;
  const buildConditions = (
    nodes: RuleNode[],
    parentLogic?: 'AND' | 'OR',
    parentStep?: number,
    isRootLevel: boolean = false,
  ): any[] => {
    return nodes.flatMap((node) => {
      if (node.type === 'GROUP') {
        if (!node.children?.length) return [];
        // const myStep = groupStep++;
        // const myStep = node.step_order ?? 1;
        const myStep = isRootLevel ? (node.step_order ?? 1) : parentStep;
        return {
          logic: node.operator ?? 'NONE',
          approver_type: roleMap?.[node.role as string] ?? null,
          entity_id: node.entity_id ?? null,
          parent_id: null,
          // step_order: Number(formData.step_order) ? step++ : null,
          // step_order: Number(formData.step_order) ? stepRef.current++ : null,
          step_order: myStep,
          escalation_hours: formData.escalation_hours ?? null,
          // escalation_status: null,
          delegate_user_id: null,
          // children: buildConditions(node.children),
          children: buildConditions(node.children, node.operator, myStep, false),
        };
      }

      if (!node.role) return [];

      return {
        logic: parentLogic === rootLogic ? 'NONE' : (parentLogic ?? 'NONE'),
        // logic: parentLogic ?? 'NONE',
        approver_type: roleMap[node.role] ?? null,
        entity_id: node.entity_id ?? null,
        parent_id: null,
        // step_order: Number(formData.step_order) ? step++ : null,
        // step_order: Number(formData.step_order) ? stepRef.current++ : null,
        // step_order: stepRef.current++,
        step_order: parentStep,
        escalation_hours: formData.escalation_hours ?? null,
        // escalation_status: null,
        delegate_user_id: null,
      };
    });
  };

  const addRole = (groupId: string, role: string) => {
    const update = (nodes: RuleNode[]): RuleNode[] =>
      nodes.map((node) => {
        if (node.id === groupId) {
          return {
            ...node,
            children: [
              ...(node.children || []),
              {
                id: createId(),
                type: 'ROLE',
                role,
              },
            ],
          };
        }

        if (node.children) {
          return { ...node, children: update(node.children) };
        }

        return node;
      });

    setRules(update);
    setExpanded((prev) => [...new Set([...prev, groupId])]);
  };

  const addGroup = (targetId: string, operator: 'AND' | 'OR') => {
    const update = (nodes: RuleNode[]): RuleNode[] =>
      nodes.flatMap((node) => {
        if (node.id === targetId && node.type === 'ROLE') {
          return [
            node,
            {
              id: createId(),
              type: 'GROUP',
              operator,
              children: [],
            },
          ];
        }

        if (node.id === targetId && node.type === 'GROUP') {
          return {
            ...node,
            children: [
              ...(node.children || []),
              {
                id: createId(),
                type: 'GROUP',
                operator,
                children: [],
              },
            ],
          };
        }

        if (node.children) {
          return {
            ...node,
            children: update(node.children),
          };
        }

        return node;
      });

    setRules(update);
    setExpanded((prev) => [...new Set([...prev, targetId])]);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getAllUser(token as string);
        setUsers(res.collection || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  const getOptionsByRole = (role?: string) => {
     if (role === 'Manager') {
       return users
         .filter((u) => u.group_name === 'Manager')
         .map((u) => ({
           label: u.fullname,
           value: u.id,
         }));
     }

    if (role === 'PIC' ) {
      return employees.map((e) => ({
        label: e.name,
        value: e.id,
      }));
    }

    return [];
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await getAllEmployee(token as string);
        setEmployees(res.collection || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchEmployees();
  }, []);

  const countRootGroups = (nodes: RuleNode[]): number => {
    return nodes.filter((n) => n.type === 'GROUP').length;
  };

  const totalSteps = countRootGroups(rules);
  const stepOptions = Array.from({ length: totalSteps }, (_, i) => i + 1);

  const renderNode = (node: RuleNode) => {
    const options = getOptionsByRole(node.role);
    if (node.type === 'ROLE') {
      return (
        <TreeItem
          key={node.id}
          itemId={node.id}
          label={
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Typography
                sx={{
                  borderRadius: 1,
                  backgroundColor: '#f5f5f5',
                  textTransform: 'capitalize',
                  px: 1,
                }}
              >
                {node.role}
              </Typography>
              <CustomSelect
                size="small"
                value={node.entity_id || ''}
                sx={{ minWidth: 150 }}
                onChange={(e: any) => {
                  const value = e.target.value;

                  const update = (nodes: any[]): any[] =>
                    nodes.map((n) => {
                      if (n.id === node.id) {
                        return { ...n, entity_id: value };
                      }
                      if (n.children) {
                        return { ...n, children: update(n.children) };
                      }
                      return n;
                    });

                  setRules(update);
                }}
              >
                <MenuItem value="">Select User</MenuItem>

                {options.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </CustomSelect>
              <Button
                size="small"
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  addGroup(node.id, 'AND');
                }}
              >
                + AND
              </Button>

              <Button
                size="small"
                variant="contained"
                color="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  addGroup(node.id, 'OR');
                }}
              >
                + OR
              </Button>

              <IconTrash
                size={20}
                style={{ cursor: 'pointer', color: 'red' }}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNode(node.id);
                }}
              />
            </Box>
          }
        />
      );
    }
    return (
      <TreeItem
        key={node.id}
        itemId={node.id}
        label={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              padding: '0!important',
              flexWrap: 'wrap',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography
              fontWeight={700}
              sx={{
                px: 1.2,
                py: 0.2,
                borderRadius: 1,
                backgroundColor: '#f5f5f5',
                minWidth: 45,
                textAlign: 'center',
              }}
            >
              {node.operator}
            </Typography>
            <CustomSelect
              size="small"
              value={node.step_order || 1}
              sx={{ minWidth: 80 }}
              onChange={(e: any) => {
                const value = Number(e.target.value);

                const updateNode = (nodes: RuleNode[]): RuleNode[] =>
                  nodes.map((n) => {
                    if (n.id === node.id) {
                      return { ...n, step_order: value };
                    }
                    if (n.children) {
                      return { ...n, children: updateNode(n.children) };
                    }
                    return n;
                  });

                setRules((prev) => updateNode(prev));
              }}
            >
              {stepOptions.map((s) => (
                <MenuItem key={s} value={s}>
                  Step {s}
                </MenuItem>
              ))}
            </CustomSelect>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                flex: 1,
              }}
            >
              {roleOptions.map((r) => (
                <Button
                  key={r.value}
                  size="small"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    addRole(node.id, r.value);
                  }}
                >
                  + {r.label}
                </Button>
              ))}
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexShrink: 0,
              }}
            >
              <IconTrash
                size={24}
                // color="error"
                style={{ cursor: 'pointer', color: 'red', marginTop: '1px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNode(node.id);
                }}
              />
            </Box>
          </Box>
        }
      >
        {node.children?.map((child) => renderNode(child))}
      </TreeItem>
    );
  };

  const deleteNode = (id: string) => {
    const remove = (nodes: RuleNode[]): RuleNode[] =>
      nodes
        .filter((n) => n.id !== id)
        .map((n) => ({
          ...n,
          children: n.children ? remove(n.children) : [],
        }));

    setRules((prev) => remove(prev));
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Grid2 container spacing={2} sx={{ mb: 0 }}>
          <Grid2 size={{ xs: 12, lg: 12 }}>
            <CustomFormLabel htmlFor="description" sx={{ mt: 0 }} required>
              Name
            </CustomFormLabel>

            <TextField
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={Boolean(errors.name)}
              helperText={errors.name ?? ''}
              fullWidth
            />
          </Grid2>
          <Grid2 size={{ xs: 12, lg: 12 }}>
            <CustomFormLabel htmlFor="description" sx={{ mt: 0 }}>
              Description
            </CustomFormLabel>

            <TextField
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={Boolean(errors.description)}
              helperText={errors.description ?? ''}
              fullWidth
            />
          </Grid2>
          <Grid2 size={{ xs: 12, lg: 12 }}>
            <CustomFormLabel htmlFor="type" sx={{ mt: 0 }} required>
              Type Approve
            </CustomFormLabel>

            <CustomTextField
              id="type"
              name="type"
              select
              value={formData.type ?? ''}
              onChange={handleChange}
              error={Boolean(errors.type)}
              helperText={errors.type ?? ''}
              fullWidth
            >
              <MenuItem value="Invitation">Invitation</MenuItem>
            </CustomTextField>
          </Grid2>
          <Grid2 size={{ xs: 12, lg: 12 }}>
            <CustomFormLabel htmlFor="step_order" sx={{ mt: 0 }}>
              Escalation Hour
            </CustomFormLabel>

            <CustomTextField
              id="escalation_hours"
              name="escalation_hours"
              value={formData.escalation_hours}
              onChange={handleChange}
              error={Boolean(errors.escalation_hours)}
              helperText={errors.escalation_hours ?? null}
              fullWidth
            />
          </Grid2>
          {/* <Grid2 size={{ xs: 12, lg: 12 }}>
            <Box>
       
              <CustomFormLabel htmlFor="step_order" sx={{ mt: 0 }}>
                Step Order
              </CustomFormLabel>
              <Switch
                id="step_order"
                name="step_order"
                checked={formData.step_order}
                onChange={(e) => setFormData({ ...formData, step_order: e.target.checked })}
              />
            </Box>
          </Grid2> */}

          <Grid2 size={{ xs: 12, lg: 12 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Button variant="contained" onClick={() => addRootRule('AND')}>
                Add AND
              </Button>

              <Button variant="contained" color="secondary" onClick={() => addRootRule('OR')}>
                Add OR
              </Button>
            </Box>

            <SimpleTreeView
              expandedItems={expanded}
              onExpandedItemsChange={(event, itemIds) => setExpanded(itemIds)}
            >
              {rules.map((rule) => renderNode(rule))}
            </SimpleTreeView>
          </Grid2>
          <hr
            style={{
              backgroundColor: 'gray',
              height: '1px',
              width: '100%',
              opacity: '0.4',
              margin: '5px 0',
            }}
          />
          <Grid2 size={{ xs: 12, lg: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" disabled={loading}>
              Submit
            </Button>
          </Grid2>
        </Grid2>
      </form>

      <Portal>
        <Backdrop
          open={loading}
          sx={{
            color: '#fff',
            zIndex: (t) => 9999999,
          }}
        >
          <CircularProgress />
        </Backdrop>
      </Portal>
    </>
  );
};

export default React.memo(FormApprove);
