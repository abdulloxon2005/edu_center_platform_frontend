import React from 'react';
import { FiCheckCircle, FiTarget, FiUsers, FiTrendingUp } from 'react-icons/fi';

function WhyUs() {
  const reasons = [
    {
      id: 1,
      title: "Sifatli va Kafolatlangan Ta'lim",
      description: "Bizning ta'lim tizimimiz zamonaviy standartlarga javob beradi. Darslar amaliyotga asoslangan holda, tushunarli va qiziqarli tarzda olib boriladi.",
      icon: <FiCheckCircle size={36} color="#2563eb" />
    },
    {
      id: 2,
      title: "Kuchli Motivatsiya va Muhit",
      description: "O'quv markazimizda ilm olishga intiluvchan yoshlar bilan birga o'qiysiz. Bu sizga doimiy raqobat va o'z ustingizda ishlash uchun kuch beradi.",
      icon: <FiUsers size={36} color="#1d4ed8" />
    },
    {
      id: 3,
      title: "Aniq Maqsad va Yo'nalish",
      description: "Har bir o'quvchining qiziqishi va qobiliyatini inobatga olgan holda, ularga kelajak kasbini tanlashda to'g'ri yo'llanma beramiz.",
      icon: <FiTarget size={36} color="#2563eb" />
    },
    {
      id: 4,
      title: "Doimiy Nazorat va Natija",
      description: "O'quvchilarning o'zlashtirishi oylik testlar orqali tekshirib boriladi. Natijalar ota-onalarga doimiy ravishda yetkaziladi.",
      icon: <FiTrendingUp size={36} color="#1d4ed8" />
    }
  ];

  return (
    <div style={{ padding: '80px 20px', backgroundColor: '#ffffff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a' }}>
            Nima uchun <span className="gradient-text">“Ta'lim Plus”</span> da o‘qish kerak?
          </h2>
          <div style={{ width: '80px', height: '4px', backgroundColor: '#2563eb', margin: '20px auto 0', borderRadius: '2px' }}></div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', 
          gap: '30px'
        }}>
          {reasons.map((reason) => (
            <div key={reason.id} style={{
              display: 'flex',
              gap: '20px',
              padding: '30px',
              backgroundColor: '#f8fafc',
              border: '1px solid #bfdbfe',
              borderRadius: '20px',
              transition: 'transform 0.3s ease, borderColor 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.borderColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#bfdbfe';
            }}>
              
              <div style={{ 
                minWidth: '70px', 
                height: '70px', 
                backgroundColor: '#eff6ff', 
                border: '1px solid #bfdbfe',
                borderRadius: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(37,99,235,0.08)'
              }}>
                {reason.icon}
              </div>

              <div>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '10px' }}>
                  {reason.title}
                </h3>
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.7' }}>
                  {reason.description}
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default WhyUs;
