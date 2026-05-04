import { useQuery } from "@tanstack/react-query";
import { getRegisteredSite } from "src/customs/api/admin";

export const useRegisteredSite = (token?: string) => {
  return useQuery({
    queryKey: ['registeredSites', token],
    queryFn: async () => {
      const res = await getRegisteredSite(token as string);
      return res.collection;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
};
