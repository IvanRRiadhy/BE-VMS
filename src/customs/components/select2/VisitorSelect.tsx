import React from 'react';
import AsyncSelect from 'react-select/async';
import { getAllVisitor } from 'src/customs/api/admin';
import axiosInstance, { axiosInstance2 } from 'src/customs/api/interceptor';

type Visitor = {
  id: string;
  visitor_type: string;
  identity_id: string;
  name: string;
  email: string;
  organization: string;
  gender: string;
  address: string;
  phone: string;
  is_vip: boolean;
  is_email_verified: boolean;
  email_verification_send_at: string;
  email_verification_token: string;
  visitor_period_start: string;
  visitor_period_end: string;
  is_employee: boolean;
  employee_id: string | null;
  section_page_visitor_types: any[];
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

      const data = allVisitors.filter(
        (visitor: any) =>
          visitor.name.toLowerCase().includes(inputValue.toLowerCase()) ||
          visitor.email.toLowerCase().includes(inputValue.toLowerCase()) ||
          visitor.phone.includes(inputValue),
      );

      // Ambil faceimage dari employee_id (jika ada)
      const enrichedVisitors = await Promise.all(
        data.map(async (visitor: any) => {
          let faceimage = '';

          if (visitor.employee_id) {
            try {
              const empRes = await fetch(`${BASE_URL}/employee/${visitor.employee_id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: 'application/json',
                },
              });

              console.log('empRes:', empRes);

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
            label: visitor.name,
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
        src={data.faceimage}
        alt={data.name}
        style={{ width: 40, height: 40, borderRadius: '50%' }}
      />
      <div>
        <div style={{ fontWeight: 600 }}>{data.name ?? ''}</div>
        <div style={{ fontSize: 12 }}>{data.email ?? ''}</div>
        <div style={{ fontSize: 12 }}>{data.phone ?? ''}</div>
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
