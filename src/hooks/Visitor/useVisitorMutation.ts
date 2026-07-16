
import {
  createQuickAccess,
} from 'src/customs/api/Admin/Visitor';


import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createVisitor,
  createPraRegister,
  createVisitorsGroup,
  createPraRegisterGroup,
} from 'src/customs/api/admin';

export const useVisitorMutation = () => {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['visitors'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['quick-access'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['transaction-visitor'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['transaction-visitor-detail'],
      }),
    ]);
  };

  const createVisitorMutation = useMutation({
    mutationFn: createVisitor,
    onSuccess: invalidate,
  });

  const createPraRegisterMutation = useMutation({
    mutationFn: createPraRegister,
    onSuccess: invalidate,
  });

  const createVisitorsGroupMutation = useMutation({
    mutationFn: createVisitorsGroup,
    onSuccess: invalidate,
  });

  const createPraRegisterGroupMutation = useMutation({
    mutationFn: createPraRegisterGroup,
    onSuccess: invalidate,
  });

  const createQuickAccessMutation = useMutation({
    mutationFn: createQuickAccess,
    onSuccess: invalidate,
  });

  return {
    createVisitorMutation,
    createPraRegisterMutation,
    createVisitorsGroupMutation,
    createPraRegisterGroupMutation,
    createQuickAccessMutation
  };
};