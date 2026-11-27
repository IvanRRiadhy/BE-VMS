import { useQuery } from '@tanstack/react-query';
import { getInvitationVisitorTypeVehicles } from 'src/customs/api/Admin/InvitationData';


export const useInvitationVisitorTypeVehicles = () => {
  return useQuery({
    queryKey: ['invitation-visitor-type-vehicles'],
    queryFn: async () => {
      const response = await getInvitationVisitorTypeVehicles();
      return response?.collection ?? [];
    },
  });
};
