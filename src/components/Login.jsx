import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../api';

function Login() {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [tgLoading, setTgLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [telegramUser, setTelegramUser] = useState(null);

    // Responsive state
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
    const [isTablet, setIsTablet] = useState(typeof window !== 'undefined' ? (window.innerWidth > 768 && window.innerWidth <= 1024) : false);

    const triggerHaptic = (style = 'light') => {
        try {
            if (window.Telegram?.WebApp?.HapticFeedback) {
                if (style === 'success' || style === 'warning' || style === 'error') {
                    window.Telegram.WebApp.HapticFeedback.notificationOccurred(style);
                } else {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
                }
            }
        } catch (e) {
            // ignore
        }
    };

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width <= 768);
            setIsTablet(width > 768 && width <= 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (window.Telegram?.WebApp) {
            try {
                window.Telegram.WebApp.ready();
                window.Telegram.WebApp.expand();
                if (window.Telegram.WebApp.setHeaderColor) {
                    window.Telegram.WebApp.setHeaderColor('#ffffff');
                }
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
        triggerHaptic('success');
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
        }, 500);
    };

    const handleTelegramLogin = async () => {
        if (!telegramUser?.id) return;
        triggerHaptic('medium');
        setError('');
        setSuccessMsg('');
        setTgLoading(true);

        try {
            const data = await authAPI.telegramLogin(telegramUser.id);
            processLoginSuccess(data);
        } catch (err) {
            triggerHaptic('error');
            setError(err.response?.data?.detail || "Telegram hisobi bog'lanmagan. Iltimos, Login ID orqali kiring.");
        } finally {
            setTgLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        triggerHaptic('medium');
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            const data = await authAPI.login(loginId.trim(), password);
            processLoginSuccess(data);
        } catch (err) {
            triggerHaptic('error');
            setError(err.response?.data?.detail || 'Server bilan bog\'lanib bo\'lmadi. Iltimos qayta urinib ko\'ring.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '16px 16px 40px 16px' : isTablet ? '30px 24px' : '40px 20px',
            boxSizing: 'border-box'
        }}>
            <div style={{
                width: '100%',
                maxWidth: isMobile ? '100%' : isTablet ? '460px' : '440px',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: '1.5px solid #bfdbfe',
                borderRadius: isMobile ? '22px' : '26px',
                padding: isMobile ? '24px 18px' : isTablet ? '32px 28px' : '36px 32px',
                boxShadow: isMobile ? '0 10px 30px rgba(37, 99, 235, 0.08)' : '0 20px 50px rgba(37, 99, 235, 0.12)',
                boxSizing: 'border-box',
                position: 'relative'
            }}>
                {/* LOGO & TITLE */}
                <div style={{ textAlign: 'center', marginBottom: isMobile ? '20px' : '24px' }}>
                    <img 
                        src="/logo.png" 
                        alt="Ta'lim Plus Logo" 
                        style={{ 
                            width: isMobile ? '52px' : '60px', 
                            height: isMobile ? '52px' : '60px', 
                            margin: '0 auto 10px', 
                            borderRadius: '50%', 
                            background: '#ffffff', 
                            padding: '2px', 
                            border: '2px solid #2563eb', 
                            boxShadow: '0 4px 15px rgba(37, 99, 235, 0.2)',
                            objectFit: 'contain'
                        }} 
                    />
                    <h2 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                        Ta'lim Plus — <span className="gradient-text">Tizimga Kirish</span>
                    </h2>
                    <p style={{ fontSize: isMobile ? '12px' : '13px', color: '#64748b', marginTop: '4px' }}>
                        ID va parolingiz orqali shaxsiy profilingizga kiring
                    </p>
                </div>

                {/* ERROR & SUCCESS ALERTS */}
                {error && (
                    <div style={{ color: '#dc2626', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '10px 14px', borderRadius: '12px', marginBottom: '14px', fontSize: '13px', textAlign: 'center', fontWeight: '700' }}>
                        {error}
                    </div>
                )}
                {successMsg && (
                    <div style={{ color: '#15803d', backgroundColor: '#f0fdf4', border: '1px solid #86efac', padding: '10px 14px', borderRadius: '12px', marginBottom: '14px', fontSize: '13px', textAlign: 'center', fontWeight: '700' }}>
                        {successMsg}
                    </div>
                )}
                
                {/* TELEGRAM 1-CLICK LOGIN BUTTON (If WebApp detected) */}
                {telegramUser && (
                    <div style={{ marginBottom: '18px' }}>
                        <button 
                            type="button"
                            onClick={handleTelegramLogin}
                            disabled={tgLoading}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                backgroundColor: '#0284c7',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: '800',
                                fontSize: isMobile ? '13px' : '14px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
                            {tgLoading ? 'Tekshirilmoqda...' : `Telegram orqali kirish (${telegramUser.first_name})`}
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 0', color: '#94a3b8', fontSize: '11px', fontWeight: '700' }}>
                            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                            <span>yoki Login ID bilan</span>
                            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                        </div>
                    </div>
                )}

                {/* LOGIN FORM */}
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '14px' : '16px' }}>
                    <div>
                        <label style={{ fontSize: isMobile ? '12px' : '13px', color: '#334155', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
                            Login ID:
                        </label>
                        <input 
                            type="text" 
                            inputMode="numeric"
                            value={loginId} 
                            onChange={(e) => setLoginId(e.target.value)} 
                            placeholder="Masalan: 939223"
                            required 
                            style={{ 
                                width: '100%', 
                                padding: isMobile ? '12px 14px' : '12px 16px', 
                                backgroundColor: '#f8fafc', 
                                border: '1.5px solid #cbd5e1', 
                                borderRadius: '12px', 
                                color: '#0f172a', 
                                fontSize: '16px',
                                outline: 'none',
                                boxSizing: 'border-box',
                                WebkitAppearance: 'none'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: isMobile ? '12px' : '13px', color: '#334155', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
                            Parol:
                        </label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="Parolingizni kiriting..."
                                required 
                                style={{ 
                                    width: '100%', 
                                    padding: isMobile ? '12px 42px 12px 14px' : '12px 42px 12px 16px', 
                                    backgroundColor: '#f8fafc', 
                                    border: '1.5px solid #cbd5e1', 
                                    borderRadius: '12px', 
                                    color: '#0f172a', 
                                    fontSize: '16px',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    WebkitAppearance: 'none'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#64748b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '4px'
                                }}
                                title={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                    {showPassword ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="btn-primary"
                        style={{ 
                            width: '100%', 
                            padding: isMobile ? '13px' : '14px', 
                            fontSize: isMobile ? '14px' : '15px', 
                            fontWeight: '900', 
                            borderRadius: '12px',
                            marginTop: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Tekshirilmoqda...' : 'Tizimga Kirish'}
                    </button>
                </form>

                {/* BACK TO HOME */}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Link to="/" style={{ fontSize: '12px', color: '#2563eb', fontWeight: '800', textDecoration: 'none' }}>
                        ← Bosh sahifaga qaytish
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
