import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '60vh', padding: '40px',
          textAlign: 'center', fontFamily: 'sans-serif'
        }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ color: '#dc2626', marginBottom: '10px', fontSize: '24px', fontWeight: '800' }}>Kutilmagan xatolik yuz berdi</h2>
          <p style={{ color: '#64748b', marginBottom: '16px', maxWidth: '500px', fontSize: '14px', lineHeight: '1.6' }}>
            Ilovada xatolik yuz berdi. Iltimos sahifani yangilang yoki quyidagi tugma orqali qayta urinib ko'ring.
          </p>
          {this.state.error && (
            <div style={{
              backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b',
              padding: '12px 16px', borderRadius: '12px', fontSize: '13px', maxWidth: '600px',
              marginBottom: '20px', textAlign: 'left', wordBreak: 'break-word', fontFamily: 'monospace'
            }}>
              <strong>Xatolik:</strong> {this.state.error.toString()}
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                padding: '12px 24px', backgroundColor: '#eff6ff', color: '#1d4ed8',
                border: '1px solid #bfdbfe', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700'
              }}
            >
              🔄 Qayta urinib ko'rish
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px', backgroundColor: '#2563eb', color: '#fff',
                border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '800'
              }}
            >
              Sahifani to'liq yangilash
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
