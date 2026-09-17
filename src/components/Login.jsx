import { useState, useEffect } from 'react';
import { authAPI } from '../api';

function Login() {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [tgLoading, setTgLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [telegramUser, setTelegramUser] = useState(null);

    useEffect(() => {
        if (window.Telegram?.WebApp) {
            try {
                window.Telegram.WebApp.ready();
                window.Telegram.WebApp.expand();
                const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
                if (tgUser && tgUser.id) {
                    setTelegramUser(tgUser);
                }
            } catch (e) {
                console.warn("Telegram WebApp init warning:", e);
            }
        }
    }, []);

    const processLoginSuccess = (data) => {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token || '');
        localStorage.setItem('user_role', data.role);
        localStorage.setItem('full_name', data.full_name);
        localStorage.setItem('login_id', data.login_id);
        if (data.user_id) {
            localStorage.setItem('user_id', String(data.user_id));
        }

        setSuccessMsg(`Xush kelibsiz, ${data.full_name}!`);

        setTimeout(() => {
            const role = data.role;
            if (role === 'ADMIN') {
                window.location.href = '/admin';
            } else if (role === 'TEACHER') {
                window.location.href = '/teacher';
            } else if (role === 'STUDENT') {
                window.location.href = '/student';
            } else {
                window.location.href = '/';
            }
        }, 600);
    };

    const handleTelegramLogin = async () => {
        if (!telegramUser?.id) return;
        setError('');
        setSuccessMsg('');
        setTgLoading(true);

        try {
            const data = await authAPI.telegramLogin(telegramUser.id);
            processLoginSuccess(data);
        } catch (err) {
            setError(err.response?.data?.detail || "Telegram hisobi bog'lanmagan. Iltimos, 6 talik ID orqali kiring.");
        } finally {
            setTgLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            const data = await authAPI.login(loginId.trim(), password);
            processLoginSuccess(data);
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
            
            {telegramUser && (
                <div style={{ marginBottom: '20px' }}>
                    <button 
                        type="button"
                        onClick={handleTelegramLogin}
                        disabled={tgLoading}
                        style={{
                            width: '100%',
                            padding: '13px',
                            backgroundColor: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: '800',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.2)'
                        }}
                    >
                        <span>✈️</span>
                        {tgLoading ? 'Tekshirilmoqda...' : `Telegram orqali kirish (${telegramUser.first_name})`}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '16px 0', color: '#94a3b8', fontSize: '12px' }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                        <span>yoki Login ID bilan</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                    </div>
                </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                    <label style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>6 Talik Login ID raqamingiz:</label>
                    <input 
                        type="text" 
                        value={loginId} 
                        onChange={(e) => setLoginId(e.target.value)} 
                        placeholder="Masalan: 100101"
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
