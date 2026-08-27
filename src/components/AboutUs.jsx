import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

import 'swiper/css';

function AboutUs() {
  const stats = [
    {
      id: 1,
      title: "1000+",
      subtitle: "Muvaffaqiyatli bitiruvchilar",
      description: "Bizning o'quvchilar nufuzli OTM lar talabasiga aylanmoqda."
    },
    {
      id: 2,
      title: "95%",
      subtitle: "O'zlashtirish ko'rsatkichi",
      description: "Har bir o'quvchi bilan individual shug'ullanish orqali yuqori natija."
    },
    {
      id: 3,
      title: "50+",
      subtitle: "Malakali ustozlar",
      description: "O'z ishining ustalari va xalqaro tajribaga ega o'qituvchilar."
    },
    {
      id: 4,
      title: "Innovatsion",
      subtitle: "Zamonaviy metodika",
      description: "Natijaga yo'naltirilgan, eng so'nggi texnologiyalar asosidagi darslar."
    }
  ];

  const images = Array.from({ length: 10 }, (_, i) => 
    `https://picsum.photos/seed/${i + 50}/400/300`
  );

  return (
    <div style={{ padding: '80px 20px', backgroundColor: '#f8fafc' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '38px', fontWeight: '800', color: '#0f172a' }}>
            <span className="gradient-text">"Ta'lim Plus"</span> bu -
          </h2>
        </div>

        {/* Kartalar qismi */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '30px',
          marginBottom: '80px'
        }}>
          {stats.map(stat => (
            <div key={stat.id} style={{
              backgroundColor: '#ffffff',
              border: '1px solid #bfdbfe',
              padding: '40px 30px',
              borderRadius: '24px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(37,99,235,0.06)',
              transition: 'transform 0.4s ease, boxShadow 0.4s ease, borderColor 0.4s ease',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-15px) scale(1.02)';
              e.currentTarget.style.borderColor = '#2563eb';
              e.currentTarget.style.boxShadow = '0 25px 50px rgba(37, 99, 235, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.borderColor = '#bfdbfe';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(37,99,235,0.06)';
            }}>
              <h3 style={{ fontSize: '48px', fontWeight: '900', color: '#2563eb', marginBottom: '10px' }}>
                {stat.title}
              </h3>
              <h4 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '15px' }}>
                {stat.subtitle}
              </h4>
              <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6' }}>
                {stat.description}
              </p>
            </div>
          ))}
        </div>

      </div>

      {/* Aylanuvchi rasmlar karuseli */}
      <div style={{ paddingBottom: '20px' }}>
        <Swiper
          spaceBetween={20}
          slidesPerView={'auto'}
          loop={true}
          speed={3000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
          }}
          modules={[Autoplay]}
          style={{ width: '100%' }}
          className="continuous-swiper"
        >
          {images.map((url, index) => (
            <SwiperSlide key={index} style={{ width: '300px', height: '220px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #bfdbfe' }}>
              <img src={url} alt={`Gallery ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default AboutUs;
