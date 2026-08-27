import React from 'react';
import { Navigate, Link } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        fontFamily: 'sans-serif'
      }}>
        <div style={{
          backgroundColor: '#eff6ff',
          padding: '24px',
          borderRadius: '24px',
          border: '1px solid #bfdbfe',
          maxWidth: '28rem',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#dbeafe',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            color: '#2563eb'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>security</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0' }}>
            Ruxsat Berilmadi! (403 Forbidden)
          </h2>
          <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.625', margin: '0' }}>
            Sizning akkountingiz roli (<b>{userRole || 'MEHMON'}</b>) ushbu bo'limga kirish huquqiga ega emas. Faqat <b>{allowedRole}</b> ruxsatiga ega foydalanuvchilar kirishi mumkin.
          </p>
          <Link 
            to="/" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: '800',
              padding: '12px 24px',
              borderRadius: '12px',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              width: '100%',
              boxSizing: 'border-box'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
            Bosh Sahifaga Qaytish
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
