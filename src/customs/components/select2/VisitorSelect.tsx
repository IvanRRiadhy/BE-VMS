import React from 'react';
import AsyncSelect from 'react-select/async';
import { getAllVisitor } from 'src/customs/api/admin';
import axiosInstance, { axiosInstance2 } from 'src/customs/api/interceptor';

type Visitor = {
  id: string;
  visitor_status: string;
  visitor: {
    id: string;
    identity_id: string;
    name: string;
    email: string;
    organization: string;
    gender: string;
    phone: string;
  };
  identity_image?: string;
  selfie_image?: string;
  nda?: string;
};

type OptionType = {
  label: string;
  value: string;
  data: Visitor & { faceimage: string };
};

type Props = {
  onSelect: (visitor: Visitor & { faceimage: string }) => void;
  token: string;
};

const getFaceImageUrl = (employee_id: string | null) => {
  if (!employee_id)
    return 'https://images.unsplash.com/photo-1575936123452-b67c3203c357?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D';
  return `http://192.168.1.116:8000/cdn`;
};

const VisitorSelect: React.FC<Props> = ({ onSelect, token }) => {
  const BASE_URL = axiosInstance.defaults.baseURL;
  const BASE_URL2 = axiosInstance2.defaults.baseURL;
  const loadOptions = async (inputValue: string): Promise<OptionType[]> => {
    if (inputValue.length < 3) return [];

    console.log('🔎 Cari visitor dengan keyword:', inputValue);

    try {
      const res = await fetch(`${BASE_URL}/visitor?search=${inputValue}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        console.error('Fetch error:', res.statusText);
        return [];
      }
      const json = await res.json();

      const allVisitors: Visitor[] = json.collection;
      console.log('👥 Total visitor dari API:', allVisitors.length);

      const data = allVisitors.filter((visitor) => {
        const name = visitor.visitor.name?.toLowerCase() || '';
        const email = visitor.visitor.email?.toLowerCase() || '';
        const phone = visitor.visitor.phone?.toLowerCase() || '';
        const keyword = inputValue.toLowerCase();

        return name.includes(keyword) || email.includes(keyword) || phone.includes(keyword);
      });

      // Ambil faceimage dari employee_id (jika ada)
      const enrichedVisitors = await Promise.all(
        data.map(async (visitor: any) => {
          let faceimage = '';

          if (visitor.host) {
            try {
              const empRes = await fetch(`${BASE_URL}/employee/${visitor.host}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: 'application/json',
                },
              });

              // console.log('empRes:', empRes);

              if (empRes.ok) {
                const empJson = await empRes.json();
                const faceimagePath = empJson.collection?.faceimage;

                faceimage = faceimagePath ? `${BASE_URL2}/cdn${faceimagePath}` : faceimage;
              } else {
                console.warn('Gagal ambil data emp:', empRes.status);
              }
            } catch (err) {
              console.warn('Error ambil employee:', err);
            }
          }

          // Jika tetap kosong, pakai default
          if (!faceimage) {
            faceimage =
              'https://images.unsplash.com/photo-1575936123452-b67c3203c357?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D';
          }

          return {
            label: visitor.visitor.name,
            value: visitor.id,
            data: {
              ...visitor,
              faceimage,
            },
          };
        }),
      );

      return enrichedVisitors;
    } catch (error) {
      console.error('Fetch exception:', error);
      return [];
    }
  };

  const formatOptionLabel = ({ data }: OptionType) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img
        // src={data.faceimage}
        src={
          'https://images.unsplash.com/photo-1575936123452-b67c3203c357?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D'
        }
        alt={data.visitor.name}
        style={{ width: 40, height: 40, borderRadius: '50%' }}
      />
      <div>
        <div style={{ fontWeight: 600 }}>{data.visitor.name ?? ''}</div>
        <div style={{ fontSize: 12 }}>{data.visitor.email ?? ''}</div>
        <div style={{ fontSize: 12 }}>{data.visitor.phone ?? ''}</div>
      </div>
    </div>
  );

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions={false}
      loadOptions={loadOptions}
      onChange={(selectedOption) => {
        if (selectedOption) {
          onSelect(selectedOption.data);
        }
      }}
      placeholder="Cari Visitor..."
      noOptionsMessage={() => 'Visitor tidak ditemukan'}
      formatOptionLabel={formatOptionLabel}
      isClearable
    />
  );
};

export default VisitorSelect;
