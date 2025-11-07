import { Avatar } from '@mui/material';
import React from 'react';
import AsyncSelect from 'react-select/async';
import { getVisitorInvitation } from 'src/customs/api/admin';
import axiosInstance, { axiosInstance2 } from 'src/customs/api/interceptor';

type Visitor = {
  id: string;
  visitor_status: string;
  visitor_identity_id: string;
  name: string;
  email: string;
  organization: string;
  gender: string;
  identity_id: string;
  phone: string;
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

const DEFAULT_FACE_IMAGE =
  'https://images.unsplash.com/photo-1575936123452-b67c3203c357?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0';

const VisitorSelect: React.FC<Props> = ({ onSelect, token }) => {
  const BASE_URL = axiosInstance.defaults.baseURL;
  const BASE_URL2 = axiosInstance2.defaults.baseURL;

  const loadOptions = async (inputValue: string): Promise<OptionType[]> => {
    if (inputValue.length < 3) return [];

    console.log('🔎 Cari visitor dengan keyword:', inputValue);

    try {
      // ✅ Ambil data dari API
      const res = await getVisitorInvitation(token);

      if (!res || !res.collection) {
        console.error('⚠️ API tidak mengembalikan data visitor');
        return [];
      }

      const allVisitors: Visitor[] = res.collection;

      // ✅ Filter berdasarkan keyword
      const filtered = allVisitors.filter((visitor) => {
        const keyword = inputValue.toLowerCase();
        return (
          visitor.name?.toLowerCase().includes(keyword) ||
          visitor.email?.toLowerCase().includes(keyword) ||
          visitor.phone?.toLowerCase().includes(keyword)
        );
      });

      // ✅ Map ke bentuk yang bisa ditampilkan
      const enrichedVisitors = filtered.map((visitor) => {
        const faceimage = visitor.selfie_image ? `${BASE_URL}/cdn${visitor.selfie_image}` : '';

        return {
          label: visitor.name || '(No Name)',
          value: visitor.id,
          data: {
            ...visitor,
            faceimage,
          },
        };
      });

      return enrichedVisitors;
    } catch (error) {
      console.error('❌ Error load visitor:', error);
      return [];
    }
  };

  const formatOptionLabel = ({ data }: OptionType) => {
    const imageUrl = data.faceimage || '';

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar
          src={imageUrl}
          alt={data.name || 'Profile'}
          style={{
            width: 40,
            height: 40,
            // borderRadius: '50%',
            objectFit: 'cover',
            backgroundColor: '#f0f0f0',
          }}
        />
        <div>
          <div style={{ fontWeight: 600 }}>{data.name ?? ''}</div>
          <div style={{ fontSize: 12 }}>{data.email ?? ''}</div>
          <div style={{ fontSize: 12 }}>{data.phone ?? ''}</div>
        </div>
      </div>
    );
  };

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions={false}
      loadOptions={loadOptions}
      onChange={(selectedOption) => {
        if (selectedOption) onSelect(selectedOption.data);
      }}
      placeholder="Cari Visitor..."
      noOptionsMessage={() => 'Visitor not found'}
      formatOptionLabel={formatOptionLabel}
      isClearable
    />
  );
};

export default VisitorSelect;
