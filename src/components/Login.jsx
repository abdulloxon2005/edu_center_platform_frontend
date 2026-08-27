import { useState } from 'react';
import api from '../api';

function Login() {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            const response = await api.post('auth/login', {
                login_id: loginId,
                password: password,
            });

            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('user_role', response.data.role);
            localStorage.setItem('full_name', response.data.full_name);
            localStorage.setItem('login_id', response.data.login_id);
            
            setSuccessMsg("Muvaffaqiyatli tizimga kirdingiz!");

            setTimeout(() => {
                const role = response.data.role;
                if (role === 'ADMIN') {
                    window.location.href = '/admin';
                } else if (role === 'TEACHER') {
                    window.location.href = '/teacher';
                } else if (role === 'STUDENT') {
                    window.location.href = '/student';
                } else {
                    window.location.href = '/';
                }
            }, 800);
            
        } catch (err) {
            setError(err.response?.data?.detail || 'Server bilan bog\'lanib bo\'lmadi. Iltimos qayta urinib ko\'ring.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '440px', margin: '40px auto', padding: '35px', backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #bfdbfe', borderRadius: '24px', boxShadow: '0 20px 50px rgba(37, 99, 235, 0.12)' }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <img src="/logo.png" alt="Ta'lim Plus Logo" style={{ width: '60px', height: '60px', margin: '0 auto 12px', borderRadius: '50%', background: '#ffffff', padding: '3px', border: '2px solid #2563eb', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.2)' }} />
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>Ta'lim Plus — <span className="gradient-text">Tizimga Kirish</span></h2>
                <p style={{ fontSize: '13px', color: '#475569', marginTop: '6px' }}>6 talik unikal ID va parolingiz orqali tizimga kiring</p>
            </div>

            {error && <div style={{ color: '#dc2626', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '13px', textAlign: 'center', fontWeight: '600' }}>{error}</div>}
            {successMsg && <div style={{ color: '#15803d', backgroundColor: '#f0fdf4', border: '1px solid #86efac', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '13px', textAlign: 'center', fontWeight: '600' }}>{successMsg}</div>}
            
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                    <label style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>6 Talik Login ID raqamingiz:</label>
                    <input 
                        type="text" 
                        value={loginId} 
                        onChange={(e) => setLoginId(e.target.value)} 
                        placeholder="Login ID kiriting"
                        required 
                        style={{ width: '100%', padding: '12px 16px', marginTop: '6px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', color: '#0f172a', fontSize: '14px', outline: 'none' }}
                    />
                </div>

                <div>
                    <label style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>Parolingiz:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Parol..."
                        required 
                        style={{ width: '100%', padding: '12px 16px', marginTop: '6px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', color: '#0f172a', fontSize: '14px', outline: 'none' }}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading} 
                    className="btn-primary"
                    style={{ padding: '14px', fontSize: '14px', marginTop: '6px' }}
                >
                    {loading ? 'Tekshirilmoqda...' : 'Tizimga Kirish'}
                </button>
            </form>

        </div>
    );
}

export default Login;
