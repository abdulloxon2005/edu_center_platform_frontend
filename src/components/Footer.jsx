import React from 'react';
import { Link } from 'react-router-dom';
import { FiPhone, FiMapPin, FiInstagram, FiSend } from 'react-icons/fi';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: '#f8fafc', color: '#475569', borderTop: '1px solid #bfdbfe', paddingTop: '60px', paddingBottom: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '50px', 
          marginBottom: '50px' 
        }}>
          
          {/* Chap ustun: Logotip va Qisqacha */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
              <img src="/logo.png" alt="Ta'lim Plus Logo" style={{ width: '45px', height: '45px', objectFit: 'contain', borderRadius: '50%', background: '#ffffff', padding: '2px', border: '1px solid #2563eb' }} />
              <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
                Ta'lim Plus
              </h2>
            </Link>
            <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#475569', paddingRight: '20px' }}>
              Zamonaviy kasblar va fundamental fanlarni chuqur o'rganish markazi. Biz bilan kelajagingiz ishonchli qo'llarda.
            </p>
          </div>

          {/* O'rta ustun: Aloqa va Manzil */}
          <div>
            <h3 style={{ color: '#0f172a', fontSize: '18px', fontWeight: '700', marginBottom: '25px', letterSpacing: '0.5px' }}>Aloqa uchun</h3>
            
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: 0 }}>
              <li>
                <a href="tel:+998901234567" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: '#0f172a', transition: 'color 0.2s' }} 
                   onMouseEnter={(e) => e.target.style.color = '#2563eb'} onMouseLeave={(e) => e.target.style.color = '#0f172a'}>
                  <div style={{ padding: '10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '50%', display: 'flex' }}>
                    <FiPhone size={18} color="#2563eb" />
                  </div>
                  +998 90 123 45 67
                </a>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '15px', color: '#475569', lineHeight: '1.6' }}>
                <div style={{ padding: '10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '50%', display: 'flex', flexShrink: 0 }}>
                  <FiMapPin size={18} color="#2563eb" />
                </div>
                <span style={{ paddingTop: '8px' }}>Toshkent shahri, Yunusobod tumani, Amir Temur ko'chasi, 12-uy.</span>
              </li>
            </ul>
          </div>

          {/* O'ng ustun: Ijtimoiy tarmoqlar */}
          <div>
            <h3 style={{ color: '#0f172a', fontSize: '18px', fontWeight: '700', marginBottom: '25px', letterSpacing: '0.5px' }}>Bizni kuzating</h3>
            <p style={{ fontSize: '15px', color: '#475569', marginBottom: '20px' }}>Eng so'nggi yangiliklar va chegirmalardan xabardor bo'ling:</p>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <a href="https://t.me/talimplus" target="_blank" rel="noreferrer" style={{
                width: '45px', height: '45px', borderRadius: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', color: '#2563eb'
              }} onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.transform = 'translateY(-3px)';}} 
                 onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; e.currentTarget.style.transform = 'translateY(0)';}}>
                <FiSend size={20} />
              </a>
              
              <a href="https://instagram.com/talimplus" target="_blank" rel="noreferrer" style={{
                width: '45px', height: '45px', borderRadius: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', color: '#2563eb'
              }} onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.transform = 'translateY(-3px)';}} 
                 onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; e.currentTarget.style.transform = 'translateY(0)';}}>
                <FiInstagram size={20} />
              </a>
            </div>
          </div>

        </div>

        {/* Pastki qism: Huquqlar va Maxfiylik */}
        <div style={{ 
          borderTop: '1px solid #e2e8f0', 
          paddingTop: '20px', 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          fontSize: '13px',
          color: '#64748b'
        }}>
          <p>© {currentYear} "Ta'lim Plus" MChJ. Barcha huquqlar himoyalangan.</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/shartlar" style={{ transition: 'color 0.2s', textDecoration: 'none', color: 'inherit' }} onMouseEnter={(e) => e.target.style.color = '#2563eb'} onMouseLeave={(e) => e.target.style.color = '#64748b'}>
              Maxfiylik shartlari
            </Link>
            <Link to="/shartlar" style={{ transition: 'color 0.2s', textDecoration: 'none', color: 'inherit' }} onMouseEnter={(e) => e.target.style.color = '#2563eb'} onMouseLeave={(e) => e.target.style.color = '#64748b'}>
              Ommaviy oferta
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
