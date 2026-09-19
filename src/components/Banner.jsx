import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { crmAPI, coursesAPI } from '../api';

import 'swiper/css';
import 'swiper/css/pagination';

function Banner() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '+998 ',
    selectedCourse: '',
    agreement: false
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await coursesAPI.getCourses();
        if (Array.isArray(data)) setCourses(data);
      } catch (error) {
        console.error('Kurslarni yuklashda xatolik:', error);
      }
    };
    fetchCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      await crmAPI.createLead({
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        course_id: formData.selectedCourse ? parseInt(formData.selectedCourse) : null,
        notes: "Bepul konsultatsiya so'rovi (saytdan)"
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setFormData({ firstName: '', lastName: '', phone: '+998 ', selectedCourse: '', agreement: false });
      }, 3000);
    } catch (error) {
      setSubmitError(error.response?.data?.detail || "Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setSubmitting(false);
    }
  };

  const slides = [
    {
      id: 1,
      title: "Zamonaviy IT ta'lim",
      url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Kuchli mutaxassislar",
      url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Amaliyot va Natija",
      url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop"
    }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', display: 'flex', gap: '30px', alignItems: 'stretch' }}>
      
      {/* Chap tomon: Karusel */}
      <div style={{ flex: '1.5', borderRadius: '24px', overflow: 'hidden', height: '500px', boxShadow: '0 20px 40px rgba(37,99,235,0.12)', border: '1px solid #bfdbfe' }}>
        <Swiper
          direction={'vertical'}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          modules={[Autoplay, Pagination]}
          style={{ width: '100%', height: '100%' }}
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id} style={{ position: 'relative' }}>
              <img src={slide.url} alt={slide.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(to top, rgba(15,23,42,0.9), transparent)',
                padding: '40px', color: '#ffffff'
              }}>
                <h2 style={{ fontSize: '32px', color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{slide.title}</h2>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* O'ng tomon: Bepul konsultatsiya formasi */}
      <div style={{ 
        flex: '1', 
        padding: '40px 30px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #bfdbfe',
        boxShadow: '0 10px 30px rgba(37,99,235,0.08)'
      }}>
        <h3 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '8px', color: '#0f172a' }}>
          Bepul <span className="gradient-text">Konsultatsiya</span>
        </h3>
        <p style={{ color: '#475569', marginBottom: '25px', fontSize: '14px' }}>Malakali mutaxassislarimizdan maslahat oling. Ma'lumotlaringizni qoldiring.</p>
        
        {submitSuccess ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{ marginBottom: '15px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#16a34a' }}>check_circle</span>
            </div>
            <h4 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '10px' }}>So'rovingiz muvaffaqiyatli jo'natildi!</h4>
            <p style={{ color: '#475569', marginBottom: '20px' }}>Tez orada siz bilan bog'lanamiz.</p>
            <button onClick={() => setSubmitSuccess(false)} className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
              Orqaga
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <input type="text" placeholder="Ism" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <input type="text" placeholder="Familiya" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <input type="tel" placeholder="Telefon raqam (+998...)" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <select 
                value={formData.selectedCourse} 
                onChange={(e) => setFormData({...formData, selectedCourse: e.target.value})} 
                style={inputStyle}
              >
                <option value="">Qiziqayotgan fan (ixtiyoriy)</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>
            
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px', color: '#64748b', cursor: 'pointer', marginTop: '5px' }}>
              <input type="checkbox" required checked={formData.agreement} onChange={(e) => setFormData({...formData, agreement: e.target.checked})} style={{ marginTop: '3px' }} />
              <span>
                <Link to="/shartlar" target="_blank" style={{ color: '#2563eb', textDecoration: 'underline' }}>Maxfiylik siyosati va foydalanish shartlari</Link> ga rozilik bildiraman
              </span>
            </label>
            
            {submitError && (
              <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '5px' }}>
                {submitError}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary" style={{ marginTop: '10px', padding: '14px', fontSize: '15px', opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? "Jo'natilmoqda..." : "Jo'natish"}
            </button>
          </form>
        )}
      </div>

    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 16px', borderRadius: '12px', 
  border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px',
  backgroundColor: '#f8fafc', color: '#0f172a'
};

export default Banner;
