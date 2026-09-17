import React from 'react';
import { FiBookOpen, FiGlobe, FiPieChart, FiZap, FiAward, FiClock, FiActivity, FiMessageCircle, FiMessageSquare, FiDroplet } from 'react-icons/fi';

function Courses() {
  const courses = [
    {
      id: 1,
      title: "Matematika",
      description: "Maktab dasturi, olimpiadalar va OTM ga tayyorgarlik uchun chuqurlashtirilgan matematika.",
      icon: <FiPieChart size={32} color="#2563eb" />,
      duration: "9 oy",
      price: "400 000 so'm / oy"
    },
    {
      id: 2,
      title: "Fizika",
      description: "Fizika qonuniyatlarini amaliy misollar bilan o'rganing va testlarni oson yeching.",
      icon: <FiZap size={32} color="#1d4ed8" />,
      duration: "9 oy",
      price: "400 000 so'm / oy"
    },
    {
      id: 3,
      title: "Ingliz Tili",
      description: "Grammatika, so'zlashuv, IELTS va CEFR ga sifatli tayyorgarlik.",
      icon: <FiGlobe size={32} color="#2563eb" />,
      duration: "6 oy",
      price: "450 000 so'm / oy"
    },
    {
      id: 4,
      title: "SAT",
      description: "Xalqaro universitetlarga kirish uchun SAT Math va English boyicha intensiv kurs.",
      icon: <FiAward size={32} color="#1d4ed8" />,
      duration: "4 oy",
      price: "600 000 so'm / oy"
    },
    {
      id: 5,
      title: "Ona Tili va Adabiyot",
      description: "Ona tili qoidalari va adabiyot asarlarini chuqur o'rganish.",
      icon: <FiBookOpen size={32} color="#2563eb" />,
      duration: "8 oy",
      price: "350 000 so'm / oy"
    },
    {
      id: 6,
      title: "Tarix",
      description: "Jahon va O'zbekiston tarixi bo'yicha to'liq va tizimli tayyorgarlik.",
      icon: <FiClock size={32} color="#1d4ed8" />,
      duration: "8 oy",
      price: "350 000 so'm / oy"
    },
    {
      id: 7,
      title: "Biologiya",
      description: "Tibbiyot va tabiiy fanlar yo'nalishi uchun chuqurlashtirilgan biologiya.",
      icon: <FiActivity size={32} color="#2563eb" />,
      duration: "9 oy",
      price: "400 000 so'm / oy"
    },
    {
      id: 8,
      title: "Koreys Tili",
      description: "Koreyada o'qish va ishlash uchun TOPIK darajalariga tayyorgarlik.",
      icon: <FiMessageCircle size={32} color="#1d4ed8" />,
      duration: "6 oy",
      price: "450 000 so'm / oy"
    },
    {
      id: 9,
      title: "Rus Tili",
      description: "Erkin so'zlashuv va grammatika noldan boshlab o'rgatiladi.",
      icon: <FiMessageSquare size={32} color="#2563eb" />,
      duration: "5 oy",
      price: "350 000 so'm / oy"
    },
    {
      id: 10,
      title: "Kimyo",
      description: "Kimyoviy jarayonlar, formulalar va masalalar yechish sirlari.",
      icon: <FiDroplet size={32} color="#1d4ed8" />,
      duration: "9 oy",
      price: "400 000 so'm / oy"
    }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '80px auto 40px', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', marginBottom: '15px' }}>
          Bizning <span className="gradient-text">Fanlar</span>
        </h2>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '30px' 
      }}>
        {courses.map(course => (
          <div key={course.id} style={{
            backgroundColor: '#ffffff',
            border: '1px solid #bfdbfe',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(37,99,235,0.06)',
            transition: 'transform 0.3s ease, boxShadow 0.3s ease, borderColor 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-10px)';
            e.currentTarget.style.borderColor = '#2563eb';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(37,99,235,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#bfdbfe';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(37,99,235,0.06)';
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              {course.icon}
            </div>
            
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '15px' }}>
              {course.title}
            </h3>
            
            <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', marginBottom: '25px', flex: 1 }}>
              {course.description}
            </p>
            
            <div style={{ 
              borderTop: '1px solid #e2e8f0', 
              paddingTop: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Davomiyligi:</div>
                <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: '700' }}>{course.duration}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Narxi:</div>
                <div style={{ fontSize: '15px', color: '#1d4ed8', fontWeight: '700' }}>{course.price}</div>
              </div>
            </div>
            
            <button className="btn-primary" style={{ marginTop: '25px', width: '100%', padding: '12px' }}>
              Batafsil ma'lumot
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Courses;
