import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import CSS
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function SwiperComponent({ items }) {
  return (
    <Swiper
      modules={[Navigation, Pagination]}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 2500 }}
      spaceBetween={20}
      slidesPerView={1}
      style={{ width: '100%', height: '100%' }}
    >
      {items.map((item, idx) => (
        <SwiperSlide key={idx}>
          <div
            style={{
              height: 200,
              background: '#eaeaea',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}
          >
            {item}
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
