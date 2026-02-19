import { Avatar } from '@mui/material';
import React from 'react';
import AsyncSelect from 'react-select/async';
import { getAllEmployee, getListVisitor, getVisitorInvitation } from 'src/customs/api/admin';
import axiosInstance, { axiosInstance2 } from 'src/customs/api/interceptor';

type Visitor = {
  id: string;
  visitor_status: string;
  visitor_identity_id: string;
  name: string;
  email: string;
  // organization: string;
  organization: string | { id: string; name: string };
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
  data: Visitor & { faceimage: string; is_blacklist?: boolean };
};

type Props = {
  onSelect: (visitor: Visitor & { faceimage: string }) => void;
  token: string;
  isEmployee?: boolean;
};

const VisitorSelect: React.FC<Props> = ({ onSelect, token, isEmployee }) => {
  const BASE_URL = axiosInstance2.defaults.baseURL;

  const [selectedOption, setSelectedOption] = React.useState<OptionType | null>(null);

  const loadOptions = async (inputValue: string): Promise<OptionType[]> => {
    if (inputValue.length < 3) return [];

    try {
      let list: any[] = [];

      if (isEmployee) {
        const res = await getAllEmployee(token);
        console.log('res', res);
        list = res?.collection ?? [];
      } else {
        const res = await getListVisitor(token);
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
          isDisabled: item.is_blacklist === true,
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #eaeaea' }}>
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
          <div style={{ fontWeight: 600 }}>
            {data.name ?? ''}

            {data.is_blacklist && (
              <span
                style={{
                  marginLeft: 8,
                  color: 'white',
                  fontSize: 11,
                  fontWeight: 700,
                  backgroundColor: 'rgba(255, 0, 0, 1)',
                  padding: '4px 4px',
                  borderRadius: 1,
                }}
              >
                Blacklist
              </span>
            )}
          </div>
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
      isOptionDisabled={(option) => option.data?.is_blacklist === true}
      onChange={(option) => {
        setSelectedOption(option as any | null);
        onSelect(option ? (option as any).data : null);
      }}
      value={selectedOption}
      placeholder={isEmployee ? 'Search Employee' : 'Search Visitor'}
      noOptionsMessage={() => (isEmployee ? 'No employee found' : 'No visitor found')}
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
