import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Typography } from '@mui/material';

export default function SwiperComponent({ images }: any) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 2500 }}
          spaceBetween={10}
          slidesPerView={1}
          style={{ width: '100%', maxWidth: 900 }}
        >
          {images.map((src: any, idx: any) => (
            <SwiperSlide key={idx} style={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src={src}
                alt={`Slide ${idx + 1}`}
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  height: '400px',
                  objectFit: 'contain',
                  borderRadius: 12,
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
}
