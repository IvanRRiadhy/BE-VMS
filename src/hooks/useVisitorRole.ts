import { useEffect, useState } from "react";
import { getAllVisitorRole } from "src/customs/api/Admin/VisitorRole";

export const useVisitorRoles = (token?: string) => {
  const [visitorRole, setVisitorRole] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await getAllVisitorRole(token);

        setVisitorRole(res?.collection ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return {
    visitorRole,
    loading,
  };
};
