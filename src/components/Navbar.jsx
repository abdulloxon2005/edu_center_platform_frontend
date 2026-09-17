import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPhoneCall, FiUser, FiLogOut, FiLayout } from 'react-icons/fi';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role');
  const fullName = localStorage.getItem('full_name') || 'Foydalanuvchi';
  const loginId = localStorage.getItem('login_id');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (userRole === 'ADMIN') return '/admin';
    if (userRole === 'TEACHER') return '/teacher';
    if (userRole === 'STUDENT') return '/student';
    return '/';
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      padding: '14px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #dbeafe',
      boxShadow: '0 4px 20px rgba(37, 99, 235, 0.08)'
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src="/logo.png" alt="Ta'lim Plus Logo" style={{ width: '42px', height: '42px', objectFit: 'contain', borderRadius: '50%', background: '#ffffff', padding: '2px', border: '1px solid #2563eb' }} />
        <h1 className="gradient-text" style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>
          Ta'lim Plus
        </h1>
      </Link>

      {/* Navigation links */}
      <ul style={{
        display: 'flex',
        gap: '35px',
        fontWeight: '600',
        fontSize: '15px',
        color: '#0f172a'
      }}>
        <li>
          <Link to="/" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#2563eb'} onMouseLeave={(e) => e.target.style.color = '#0f172a'}>
            Bosh Sahifa
          </Link>
        </li>
        <li>
          <Link to="/fanlar" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#2563eb'} onMouseLeave={(e) => e.target.style.color = '#0f172a'}>
            Fanlar
          </Link>
        </li>
        <li>
          <Link to="/natijalar" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#2563eb'} onMouseLeave={(e) => e.target.style.color = '#0f172a'}>
            Bizning Natijalar
          </Link>
        </li>
      </ul>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <a href="tel:+998901234567" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: '#0f172a',
          fontWeight: '600',
          fontSize: '14px'
        }}>
          <FiPhoneCall style={{ color: '#2563eb' }} />
          +998 90 123 45 67
        </a>

        {token ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to={getDashboardPath()} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              padding: '8px 16px',
              borderRadius: '50px',
              color: '#1d4ed8',
              fontSize: '13px',
              fontWeight: '700'
            }}>
              <FiLayout style={{ color: '#2563eb' }} />
              <span>{fullName}</span>
              {loginId && <span style={{ color: '#2563eb', fontSize: '11px', fontFamily: 'monospace' }}>({loginId})</span>}
            </Link>

            <button 
              onClick={handleLogout}
              style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#1e293b',
                padding: '8px 14px',
                borderRadius: '50px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FiLogOut /> Chiqish
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn-primary">
            <FiUser style={{ marginRight: '8px' }} />
            Tizimga Kirish
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;