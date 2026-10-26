// import { useQuery } from '@tanstack/react-query';
// import { getAllVisitorRole } from 'src/customs/api/Admin/VisitorRole';

// export const useVisitorRoles = () => {
//   const { data, isLoading } = useQuery({
//     queryKey: ['visitor-roles'],
//     queryFn: async () => {
//       const res = await getAllVisitorRole();
//       return res.collection ?? [];
//     },
//     placeholderData: (prev) => prev,
//   });

//   return {
//     visitorRole: data ?? [],
//     loading: isLoading,
//   };
// };
import { useQuery } from '@tanstack/react-query';
import { getAllVisitorRole } from 'src/customs/api/Admin/VisitorRole';

export const useVisitorRoles = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['visitor-roles'],
    queryFn: async () => {
      const res = await getAllVisitorRole();
      return res.collection ?? [];
    },
    placeholderData: (prev) => prev,
  });

  const visitorRole = (data ?? []).filter(
    (item: any) => item.name?.trim().toLowerCase() === 'visitor',
  );

  return {
    visitorRole,
    loading: isLoading,
  };
};
