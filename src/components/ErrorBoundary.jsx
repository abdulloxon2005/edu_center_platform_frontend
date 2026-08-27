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
          <h2 style={{ color: '#dc2626', marginBottom: '10px' }}>Kutilmagan xatolik yuz berdi</h2>
          <p style={{ color: '#6b7280', marginBottom: '20px', maxWidth: '500px' }}>
            Ilovada xatolik yuz berdi. Iltimos sahifani yangilang yoki administratorga murojaat qiling.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px', backgroundColor: '#2563eb', color: '#fff',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
            }}
          >
            Sahifani yangilash
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
