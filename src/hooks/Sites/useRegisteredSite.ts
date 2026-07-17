import { useQuery } from "@tanstack/react-query";
import { getRegisteredSite } from "src/customs/api/admin";


export const useRegisteredSite = () => {
  return useQuery({
    queryKey: ['registeredSites'],
    queryFn: async () => {
      const res = await getRegisteredSite();
      return res.collection;
    },
  });
};
