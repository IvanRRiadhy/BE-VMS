import { useEffect, useState } from "react";
import { getCameraAnalytics } from "src/customs/api/admin";

export const useCameraAnalytics = (token?: string) => {
  const [analyticCctv, setAnalyticCctv] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;

    const fetchAnalytics = async () => {
      try {
        const res = await getCameraAnalytics(token);
        setAnalyticCctv(res?.collection ?? []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAnalytics();
  }, [token]);

  return {
    analyticCctv,
  };
};
