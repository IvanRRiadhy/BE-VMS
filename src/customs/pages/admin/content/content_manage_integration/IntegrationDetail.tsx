import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSession } from 'src/customs/contexts/SessionContext';
import Honeywell from './Honeywell';
import BioPeopleTracking from './BioPeopleTracking';
import BioPeopleParking from './BioPeopleParking';
import axiosInstance from 'src/customs/api/interceptor';

const IntegrationDetail = () => {
  const { id } = useParams();
  const { token } = useSession();
  const [integration, setIntegration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !token) return;
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/integration/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: ac.signal,
        });

        const json = res.data;

        // const res = await fetch(`http://192.168.1.116:8000/api/integration/${id}`, {
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //     'Content-Type': 'application/json',
        //   },
        //   signal: ac.signal,
        // });
        // const json = await res.json();

        // ✅ ambil yang benar: collection
        setIntegration(json.collection ?? null);
        console.log('Integration:', json.collection);
      } catch (e: any) {
        if (e?.name !== 'AbortError') setErr(e?.message || 'Fetch error');
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [id, token]);

  if (loading) return <p></p>;
  if (err) return <p style={{ color: 'tomato' }}>{err}</p>;
  if (!integration) return <p>Data not found.</p>;

  const brand = String(integration.brand_name || '').toLowerCase();
  const fullName = String(integration.name || '').toLowerCase();
  const name = fullName.split(' - ')[0].trim(); // ambil sebelum " - "

  switch (true) {
    case brand === 'honeywell' || name === 'honeywell':
      return <Honeywell id={integration.id} />;

    case brand === 'bio experience' && name === 'bio people tracking system':
      return <BioPeopleTracking id={integration.id} />;

    case brand === 'bio experience' && name === 'bio parking system':
      return <BioPeopleParking id={integration.id} />;
    default:
      return <div>Integration “{integration.brand_name}” belum didukung.</div>;
  }
};

export default IntegrationDetail;
