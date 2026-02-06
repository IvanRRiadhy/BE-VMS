import { Avatar } from '@mui/material';
import React from 'react';
import AsyncSelect from 'react-select/async';
import { getAllEmployee, getVisitorInvitation } from 'src/customs/api/admin';
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
  isEmployee?: boolean;
};

const VisitorSelect: React.FC<Props> = ({ onSelect, token, isEmployee }) => {
  const BASE_URL = axiosInstance.defaults.baseURL;

  // const loadOptions = async (inputValue: string): Promise<OptionType[]> => {
  //   if (inputValue.length < 3) return [];

  //   // console.log('🔎 Cari visitor dengan keyword:', inputValue);

  //   try {
  //     const res = await getVisitorInvitation(token);

  //     if (!res || !res.collection) {
  //       console.error('⚠️ API tidak mengembalikan data visitor');
  //       return [];
  //     }

  //     const allVisitors: Visitor[] = res.collection;

  //     // ✅ Filter berdasarkan keyword
  //     const filtered = allVisitors.filter((visitor) => {
  //       const keyword = inputValue.toLowerCase();
  //       return (
  //         visitor.name?.toLowerCase().includes(keyword) ||
  //         visitor.email?.toLowerCase().includes(keyword) ||
  //         visitor.phone?.toLowerCase().includes(keyword)
  //       );
  //     });

  //     // ✅ Map ke bentuk yang bisa ditampilkan
  //     const enrichedVisitors = filtered.map((visitor) => {
  //       const faceimage = visitor.selfie_image ? `${BASE_URL}/cdn${visitor.selfie_image}` : '';

  //       return {
  //         label: visitor.name || '(No Name)',
  //         value: visitor.id,
  //         data: {
  //           ...visitor,
  //           faceimage,
  //         },
  //       };
  //     });

  //     return enrichedVisitors;
  //   } catch (error) {
  //     console.error('❌ Error load visitor:', error);
  //     return [];
  //   }
  // };

  const loadOptions = async (inputValue: string): Promise<OptionType[]> => {
    if (inputValue.length < 3) return [];

    try {
      let list: any[] = [];

      if (isEmployee) {
        // 🔥 API EMPLOYEE
        const res = await getAllEmployee(token);
        list = res?.collection ?? [];
      } else {
        // 🔥 API VISITOR
        const res = await getVisitorInvitation(token);
        list = res?.collection ?? [];
      }

      const keyword = inputValue.toLowerCase();

      const filtered = list.filter(
        (item) =>
          item.name?.toLowerCase().includes(keyword) ||
          item.email?.toLowerCase().includes(keyword) ||
          item.phone?.toLowerCase().includes(keyword),
      );

      return filtered.map((item) => {
        const faceimage = item.selfie_image
          ? `${BASE_URL}/cdn${item.selfie_image}`
          : item.photo
            ? `${BASE_URL}/cdn${item.photo}`
            : '';

        return {
          label: item.name || '(No Name)',
          value: item.id,
          data: {
            ...item,
            faceimage,
          },
        };
      });
    } catch (err) {
      console.error('❌ loadOptions error', err);
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
        if (!selectedOption) {
          onSelect(null as any);
          return;
        }
        onSelect(selectedOption.data);
      }}
      placeholder={isEmployee ? 'Search Employee' : 'Search Visitor'}
      noOptionsMessage={() => isEmployee ? 'No employee found' : 'No visitor found'}
      formatOptionLabel={formatOptionLabel}
      isClearable
      menuPortalTarget={document.body}
      styles={{
        menuPortal: (base) => ({
          ...base,
          zIndex: 1300, 
        }),
      }}
    />
  );
};

export default VisitorSelect;
