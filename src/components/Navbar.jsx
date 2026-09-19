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
      padding: '12px 16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #dbeafe',
      boxShadow: '0 4px 20px rgba(37, 99, 235, 0.08)'
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img src="/logo.png" alt="Ta'lim Plus Logo" style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '50%', background: '#ffffff', padding: '2px', border: '1px solid #2563eb' }} />
        <h1 className="gradient-text" style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>
          Ta'lim Plus
        </h1>
      </Link>

      {/* Navigation links - hidden on mobile screens */}
      <ul className="desktop-only" style={{
        display: 'flex',
        gap: '24px',
        fontWeight: '600',
        fontSize: '14px',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <a href="tel:+998901234567" className="desktop-only" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: '#0f172a',
          fontWeight: '600',
          fontSize: '13px'
        }}>
          <FiPhoneCall style={{ color: '#2563eb' }} />
          +998 90 123 45 67
        </a>

        {token ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to={getDashboardPath()} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              padding: '6px 12px',
              borderRadius: '50px',
              color: '#1d4ed8',
              fontSize: '12px',
              fontWeight: '700'
            }}>
              <FiLayout style={{ color: '#2563eb' }} />
              <span>{fullName?.split(' ')[0]}</span>
            </Link>

            <button 
              onClick={handleLogout}
              style={{
                backgroundColor: '#fee2e2',
                border: 'none',
                color: '#dc2626',
                padding: '6px 10px',
                borderRadius: '50px',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <FiLogOut />
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            <FiUser style={{ marginRight: '6px' }} />
            Kirish
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;