import { useQuery } from '@tanstack/react-query';
import { getInvestigateVisitorId } from 'src/customs/api/operator';


export const useInvestigateVisitor = (
  visitorId: string | undefined,
  payload: any,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: ['investigate-visitor', visitorId, payload],
    queryFn: () => getInvestigateVisitorId(visitorId!, payload),
    enabled: enabled && !!visitorId,
  });
};
