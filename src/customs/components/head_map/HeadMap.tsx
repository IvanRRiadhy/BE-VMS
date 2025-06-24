import React, { useEffect, useState } from 'react';
import { parseISO } from 'date-fns';
import { Typography } from '@mui/material';

type Data = {
  id: number;
  name: string;
  createdAt: string;
};

type HeatmapData = {
  [day: string]: {
    [hour: string]: number;
  };
};

type HeatmapProps = {
  dataCreated: Data[];
  title?: string;
};

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

const Heatmap: React.FC<HeatmapProps> = ({ dataCreated, title = 'Title Of Headmap view' }) => {
  const [data, setData] = useState<HeatmapData>({});

  useEffect(() => {
    const transformData = (dataCreated: Data[]): HeatmapData => {
      const result: HeatmapData = {};
      dataCreated.forEach((visitor) => {
        const date = parseISO(visitor.createdAt);
        const day = days[date.getUTCDay()];
        const hour = String(date.getUTCHours()).padStart(2, '0');

        if (!result[day]) result[day] = {};
        if (!result[day][hour]) result[day][hour] = 0;

        result[day][hour]++;
      });
      return result;
    };

    setData(transformData(dataCreated));
  }, [dataCreated]);

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 6,
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        maxWidth: '100%',
        overflowX: 'auto',
        fontSize: 12,
      }}
    >
      <Typography variant="subtitle2" fontSize={'0.8rem'} sx={{ marginBottom: 1.7, marginTop: 1 }}>
        {title}
      </Typography>
      <div style={{ display: 'grid', gridTemplateColumns: `50px repeat(7, 28px)`, gap: 2 }}>
        <div></div>
        {days.map((day) => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontWeight: 600,
              fontSize: 11,
              whiteSpace: 'nowrap',
            }}
          >
            {day}
          </div>
        ))}

        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <div style={{ fontSize: 10, textAlign: 'right', paddingRight: 4 }}>
              {parseInt(hour) === 0
                ? '12 AM'
                : parseInt(hour) < 12
                ? `${parseInt(hour)} AM`
                : parseInt(hour) === 12
                ? '12 PM'
                : `${parseInt(hour) - 12} PM`}
            </div>
            {days.map((day) => {
              const count = data[day]?.[hour] || 0;
              const color =
                count > 0 ? `rgba(0, 200, 180, ${Math.min(0.3 + count * 0.2, 1)})` : '#eee';
              return (
                <div
                  key={day + hour}
                  title={`${count} visitor(s)`}
                  style={{
                    height: 14,
                    width: '100%',
                    borderRadius: 3,
                    background: color,
                    transition: 'background 0.2s',
                  }}
                ></div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Heatmap;
