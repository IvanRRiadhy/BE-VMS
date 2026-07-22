import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Honeywell from './Honeywell';
import BioPeopleTracking from './BioPeopleTracking';
import BioPeopleParking from './BioPeopleParking';
import axiosInstance from 'src/customs/api/interceptor';
import Ipsotek from './Ipsotek';

const IntegrationDetail = () => {
  const { id } = useParams();
  const [integration, setIntegration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/integration/${id}`, {
          signal: ac.signal,
        });

        const json = res.data;
        setIntegration(json.collection ?? null);
      } catch (e: any) {
        if (e?.name !== 'AbortError') setErr(e?.message || 'Fetch error');
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [id]);

  if (loading) return <p></p>;
  if (err) return <p style={{ color: 'tomato' }}>{err}</p>;
  if (!integration) return <p>Data not found.</p>;

  const brand = String(integration.brand_name || '');
  const brandType = String(integration.brand_type || '');
  const fullName = String(integration.name || '').toLowerCase();
  const name = fullName.split(' - ')[0].trim();

  switch (true) {
    case name == 'honeywell ipsotek' && brandType == 'CameraAnalytics':
      return <Ipsotek id={integration.id} />;

    case brand == 'Honeywell' || name == 'Honeywell':
      return <Honeywell id={integration.id} />;

    case brand == 'Bio Experience' && name == 'bio people tracking system':
      return <BioPeopleTracking id={integration.id} />;

    case brand == 'Bio Experience' && name == 'bio parking system':
      return <BioPeopleParking id={integration.id} />;
    default:
      return <div></div>;
  }
};

export default IntegrationDetail;
