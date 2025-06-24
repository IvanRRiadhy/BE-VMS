import { useState } from 'react';
import '../../../styles/calendar.css';

type EventDate = {
  day: number;
  month: number; // 0-based (Jan = 0)
  year: number;
};

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const today = new Date();

const dummyEvents: EventDate[] = [
  { day: 12, month: 5, year: 2025 },
  { day: 20, month: 5, year: 2025 },
];

export const EventCalendar: React.FC = () => {
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  // const navigate = useNavigate();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month).getDay();
  const adjustedFirstDay = (firstDay + 6) % 7; // Adjust if Monday is first

  const changeMonth = (offset: number) => {
    let newMonth = month + offset;
    let newYear = year;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    setMonth(newMonth);
    setYear(newYear);
  };

  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const isEvent = (d: number) =>
    dummyEvents.some((e) => e.day === d && e.month === month && e.year === year);

  const goToEvent = (d: number) => {
    // navigate(`/event_calender_detail?day=${d}&month=${month + 1}&year=${year}`);
  };

  return (
    <div id="calendar">
      <div className="month" style={{ background: '#4570EA' }}>
        <ul>
          <li className="prev" onClick={() => changeMonth(-1)}>
            &#10094;
          </li>
          <li className="next" onClick={() => changeMonth(1)}>
            &#10095;
          </li>
          <li>
            Event in ({months[month]})<br />
            <span style={{ fontSize: 12 }}>{year}</span>
          </li>
        </ul>
      </div>

      <ul className="weekdays">
        {weekdays.map((day) => (
          <li key={day}>{day}</li>
        ))}
      </ul>

      <ul className="days rounded-bottom">
        {/* Padding awal */}
        {[...Array(adjustedFirstDay)].map((_, i) => (
          <li key={`pad-${i}`}></li>
        ))}

        {/* Hari dalam bulan */}
        {[...Array(daysInMonth)].map((_, i) => {
          const d = i + 1;
          const todayFlag = isToday(d);
          const eventFlag = isEvent(d);
          let className = '';

          if (todayFlag && eventFlag) {
            className = 'active event';
          } else if (todayFlag) {
            className = 'active';
          } else if (eventFlag) {
            className = 'event';
          }

          return (
            <li key={d}>
              {eventFlag ? (
                <a
                  onClick={() => goToEvent(d)}
                  className={className}
                  style={{ cursor: 'pointer', display: 'inline-block', width: '100%' }}
                >
                  {d}
                </a>
              ) : className ? (
                <span className={className}>{d}</span>
              ) : (
                <span>{d}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
