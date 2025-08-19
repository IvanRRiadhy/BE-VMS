import React from 'react';
import AsyncSelect from 'react-select/async';
import { components } from 'react-select';

type Employee = {
  id: string;
  name: string;
  email: string;
  phone: string;
  faceimage: string; // URL gambar profil
};

type OptionType = {
  label: string;
  value: string;
  data: Employee;
};

type Props = {
  onSelect: (employee: Employee) => void;
  token: string;
};

const EmployeeSelect: React.FC<Props> = ({ onSelect, token }) => {
  const loadOptions = async (inputValue: string): Promise<OptionType[]> => {
    if (inputValue.length < 3) return [];

    try {
      const res = await fetch(`http://192.168.1.116:8000/api/employee?search=${inputValue}`, {
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
      const data: Employee[] = json.collection; // 👈 Ambil dari field 'collection'

      return data.map((emp) => ({
        label: emp.name,
        value: emp.id,
        data: {
          ...emp,
          faceimage: emp.faceimage
            ? `http://192.168.1.116:8000/cdn/${emp.faceimage.replace(/^\/+/, '')}`
            : 'https://via.placeholder.com/40x40?text=No+Img',
        },
      }));
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
        <div style={{ fontWeight: 600 }}>{data.name}</div>
        <div style={{ fontSize: 12 }}>{data.email}</div>
        {/* <div style={{ fontSize: 12 }}>{data.organization ? ''}</div> */}
        <div style={{ fontSize: 12 }}>{data.phone}</div>
      </div>
    </div>
  );

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions={false}
      loadOptions={loadOptions}
      onChange={(selectedOption) => selectedOption && onSelect(selectedOption.data)}
      placeholder="Cari karyawan..."
      noOptionsMessage={() => 'Karyawan tidak ditemukan'}
      formatOptionLabel={formatOptionLabel}
      isClearable
    />
  );
};

export default EmployeeSelect;
