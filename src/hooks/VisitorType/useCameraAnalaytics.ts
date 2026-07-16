import { useEffect, useState } from "react";
import { getCameraAnalytics } from "src/customs/api/admin";

export const useCameraAnalytics = () => {
  const [analyticCctv, setAnalyticCctv] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getCameraAnalytics();
        setAnalyticCctv(res?.collection ?? []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAnalytics();
  }, []);

  return {
    analyticCctv,
  };
};
