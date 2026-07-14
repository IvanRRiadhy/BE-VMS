import { useEffect, useState } from "react";
import { getAllVisitorRole } from "src/customs/api/Admin/VisitorRole";

export const useVisitorRoles = () => {
  const [visitorRole, setVisitorRole] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await getAllVisitorRole();

        setVisitorRole(res?.collection ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    visitorRole,
    loading,
  };
};
