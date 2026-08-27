import React, { useState, useEffect } from 'react';
import { analyticsAPI, certificatesAPI, homeworkAPI, attendanceAPI, financeAPI, authAPI } from '../api';

export default function StudentApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [darkMode, setDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  
  // Student Profile State
  const [currentUser, setCurrentUser] = useState(null);
  const [studentInfo, setStudentInfo] = useState({
    name: localStorage.getItem('user_name') || 'O\'quvchi',
    id: localStorage.getItem('login_id') || '100101',
    userId: localStorage.getItem('user_id') || null,
    phone: '',
    parentPhone: '',
    course: 'Kurs yuklanmoqda...',
    group: 'Guruh yuklanmoqda...',
    teacher: 'O\'qituvchi',
    coins: 0,
    attendanceRate: 100,
  });

  // Data States
  const [homeworks, setHomeworks] = useState([]);
  const [homeworkFilter, setHomeworkFilter] = useState('ALL'); // ALL, PENDING, SUBMITTED, GRADED
  const [attendanceData, setAttendanceData] = useState({ total_lessons: 0, present_count: 0, late_count: 0, absent_count: 0, excused_count: 0, attendance_rate: 100, records: [] });
  const [payments, setPayments] = useState([]);
  const [billingInfo, setBillingInfo] = useState(null);
  const [myExams, setMyExams] = useState([]);
  const [myCertificates, setMyCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notificationToast, setNotificationToast] = useState('');

  // Modals & Sheets
  const [showCardModal, setShowCardModal] = useState(false);
  const [showSubmitModalHw, setShowSubmitModalHw] = useState(null);
  const [submitText, setSubmitText] = useState('');
  const [submitFile, setSubmitFile] = useState(null);
  const [submittingHw, setSubmittingHw] = useState(false);

  // In-app Payment Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Online Exam Taking State & Modal
  const [activeTakingExam, setActiveTakingExam] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [examTimeRemaining, setExamTimeRemaining] = useState(0);
  const [submittingExam, setSubmittingExam] = useState(false);
  const [examResultOutcome, setExamResultOutcome] = useState(null);

  // Certificate Detailed View Modal
  const [selectedCertView, setSelectedCertView] = useState(null);

  // Change Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const triggerToast = (msg) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(''), 4500);
  };

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(clockInterval);
  }, []);

  useEffect(() => {
    loadAllStudentData();
  }, []);

  useEffect(() => {
    let timerId = null;
    if (activeTakingExam && examTimeRemaining > 0 && !examResultOutcome) {
      timerId = setInterval(() => {
        setExamTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerId);
            handleSubmitOnlineExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [activeTakingExam, examTimeRemaining, examResultOutcome]);

  const loadAllStudentData = async () => {
    setLoading(true);
    try {
      let userData = null;
      try {
        userData = await authAPI.me();
        setCurrentUser(userData);
        setStudentInfo(prev => ({
          ...prev,
          name: userData.full_name,
          id: userData.login_id,
          userId: userData.id,
          phone: userData.phone || '',
          parentPhone: userData.parent_phone || '',
          coins: userData.coins_balance || 0,
        }));
      } catch (err) {
        console.error("Auth me error:", err);
      }

      const uid = userData?.id || localStorage.getItem('user_id');

      const [hwData, attData, payData, billData, examsData, certsData] = await Promise.all([
        homeworkAPI.getAssignedHomeworks().catch(() => []),
        uid ? attendanceAPI.getStudentAttendanceDetailed(uid).catch(() => null) : null,
        uid ? financeAPI.getStudentPayments(uid).catch(() => []) : [],
        uid ? financeAPI.getStudentBillingInfo(uid).catch(() => null) : null,
        analyticsAPI.getMyExams().catch(() => []),
        certificatesAPI.getMyCertificates().catch(() => [])
      ]);

      if (Array.isArray(hwData)) setHomeworks(hwData);
      if (attData) {
        setAttendanceData(attData);
        setStudentInfo(prev => ({ ...prev, attendanceRate: attData.attendance_rate }));
      }
      if (Array.isArray(payData)) setPayments(payData);
      if (billData) {
        setBillingInfo(billData);
        if (billData.groups && billData.groups.length > 0) {
          const g = billData.groups[0];
          setStudentInfo(prev => ({
            ...prev,
            course: g.course_title,
            group: g.group_name
          }));
        }
      }
      if (Array.isArray(examsData)) setMyExams(examsData);
      if (Array.isArray(certsData)) setMyCertificates(certsData);

    } catch (e) {
      console.error("Data loading error:", e);
    }
    setLoading(false);
  };

  const handleSubmitHomework = async (e) => {
    e.preventDefault();
    if (!showSubmitModalHw) return;

    if (!submitText.trim() && !submitFile) {
      triggerToast("Iltimos, matnli javob yozing yoki fayl biriktiring!");
      return;
    }

    setSubmittingHw(true);
    try {
      const formData = new FormData();
      formData.append('homework_id', showSubmitModalHw.id);
      if (submitText.trim()) formData.append('text_submission', submitText.trim());
      if (submitFile) formData.append('file', submitFile);

      await homeworkAPI.submitHomework(formData);
      triggerToast("Uy vazifasi topshirildi! O'qituvchi tekshirib coin taqdim etadi 🪙");
      setShowSubmitModalHw(null);
      setSubmitText('');
      setSubmitFile(null);
      const updatedHw = await homeworkAPI.getAssignedHomeworks();
      setHomeworks(updatedHw);
    } catch (err) {
      const detail = err.response?.data?.detail || "Vazifani topshirishda xatolik";
      triggerToast(`❌ ${detail}`);
    }
    setSubmittingHw(false);
  };

  const handleStartTakingExam = (exam) => {
    try {
      let qList = [];
      if (exam.questions) {
        qList = Array.isArray(exam.questions) ? exam.questions : (typeof exam.questions === 'string' ? JSON.parse(exam.questions) : []);
      } else if (exam.questions_data) {
        qList = typeof exam.questions_data === 'string' ? JSON.parse(exam.questions_data) : exam.questions_data;
      }
      if (!Array.isArray(qList) || qList.length === 0) {
        triggerToast("Ushbu imtihon uchun test savollari mavjud emas!");
        return;
      }

      setExamQuestions(qList);
      setUserAnswers({});
      setExamResultOutcome(null);
      
      const durationSec = (exam.duration_minutes || 30) * 60;
      setExamTimeRemaining(durationSec);
      setActiveTakingExam(exam);
    } catch (err) {
      triggerToast("Savollarni ochishda xatolik yuz berdi");
    }
  };

  const handleSubmitOnlineExam = async (e) => {
    if (e) e.preventDefault();
    if (!activeTakingExam) return;

    setSubmittingExam(true);
    try {
      const res = await analyticsAPI.submitOnlineExam(activeTakingExam.id, userAnswers);
      setExamResultOutcome(res);
      triggerToast(`Imtihon topshirildi! Natija: ${res.score}/${res.max_score} ball 🎯`);
      loadAllStudentData();
    } catch (err) {
      const detail = err.response?.data?.detail || "Imtihonni topshirishda xatolik";
      triggerToast(`❌ ${detail}`);
    }
    setSubmittingExam(false);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;
    setChangingPass(true);
    try {
      await authAPI.changePassword(oldPassword, newPassword);
      triggerToast("Parolingiz muvaffaqiyatli almashtirildi! 🔒");
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      const detail = err.response?.data?.detail || "Parolni o'zgartirishda xatolik";
      triggerToast(`❌ ${detail}`);
    }
    setChangingPass(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Xayrli tong ☀️';
    if (hour < 17) return 'Xayrli kun 🌤️';
    return 'Xayrli kech 🌙';
  };

  const pendingHwCount = homeworks.filter(h => !h.submission).length;
  const activeExamsCount = myExams.filter(e => e.status === 'ACTIVE' && !e.has_submitted).length;

  const filteredHomeworks = homeworks.filter(hw => {
    if (homeworkFilter === 'PENDING') return !hw.submission;
    if (homeworkFilter === 'SUBMITTED') return hw.submission && hw.submission.status !== 'GRADED';
    if (homeworkFilter === 'GRADED') return hw.submission?.status === 'GRADED';
    return true;
  });

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: darkMode ? '#0b0f19' : '#f1f5f9',
      fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      color: darkMode ? '#f8fafc' : '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box'
    }}>

      {/* GLOBAL RESPONSIVE MOBILE APP STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        
        * {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }

        body {
          background-color: ${darkMode ? '#0b0f19' : '#f1f5f9'};
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }

        .student-app-screen {
          width: 100%;
          max-width: 540px;
          min-height: 100vh;
          background-color: ${darkMode ? '#0f172a' : '#f8fafc'};
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: ${darkMode ? '0 0 40px rgba(0,0,0,0.5)' : '0 0 30px rgba(0,0,0,0.06)'};
        }

        .pulse-badge {
          animation: pulse 1.8s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.75; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* SEAMLESS RESPONSIVE APP CONTAINER */}
      <div className="student-app-screen">

        {/* STICKY TOP APP HEADER */}
        <header style={{
          position: 'sticky',
          top: 0,
          backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}`,
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 40
        }}>
          {/* STUDENT AVATAR & INFO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              onClick={() => setActiveTab('profile')}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '18px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
              }}
            >
              {studentInfo.name.charAt(0)}
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', display: 'block' }}>{getGreeting()}</span>
              <h3 style={{ fontSize: '15px', fontWeight: '900', margin: 0, color: darkMode ? '#ffffff' : '#0f172a', lineHeight: '1.2' }}>
                {studentInfo.name.split(' ')[0]}
              </h3>
            </div>
          </div>

          {/* RIGHT ACTION BUTTONS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* COIN BALANCE PILL */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: darkMode ? '#272015' : '#fef3c7',
              border: `1px solid ${darkMode ? '#78350f' : '#fde68a'}`,
              padding: '6px 10px',
              borderRadius: '50px',
              boxShadow: '0 2px 8px rgba(245,158,11,0.15)'
            }}>
              <span style={{ fontSize: '14px' }}>🪙</span>
              <span style={{ fontSize: '12px', fontWeight: '900', color: '#d97706' }}>{studentInfo.coins}</span>
            </div>

            {/* DIGITAL PASS QR SHORTCUT */}
            <button 
              onClick={() => setShowCardModal(true)}
              title="Digital Student Pass"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                backgroundColor: darkMode ? '#1e293b' : '#eff6ff',
                border: `1px solid ${darkMode ? '#334155' : '#bfdbfe'}`,
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>qr_code_2</span>
            </button>

            {/* DARK / LIGHT THEME TOGGLE */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              title="Rejimni almashtirish"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
                border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                color: darkMode ? '#fde047' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>
                {darkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>
        </header>

        {/* TOAST NOTIFICATION BANNER */}
        {notificationToast && (
          <div className="animate-fade-in" style={{
            position: 'fixed',
            top: '72px',
            left: '16px',
            right: '16px',
            maxWidth: '508px',
            margin: '0 auto',
            padding: '12px 16px',
            backgroundColor: '#1e3a8a',
            color: '#ffffff',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: '800',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 10px 25px rgba(30,58,138,0.4)',
            zIndex: 99
          }}>
            <span>{notificationToast}</span>
            <button onClick={() => setNotificationToast('')} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
          </div>
        )}

        {/* MAIN SCROLLABLE APP BODY */}
        <main style={{
          flex: 1,
          padding: '16px',
          paddingBottom: '96px', // ensures space above fixed bottom bar
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>

          {/* ============================================================ */}
          {/* TAB 1: HOME (ASOSIY BOSH SAHIFA)                             */}
          {/* ============================================================ */}
          {activeTab === 'home' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* HERO COURSE CARD */}
              <div style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
                borderRadius: '24px',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: '0 12px 28px rgba(37,99,235,0.25)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.85, fontWeight: '800' }}>Faol Kurs</span>
                    <h4 style={{ margin: '2px 0 0', fontSize: '17px', fontWeight: '900' }}>{studentInfo.course}</h4>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.9 }}>Guruh: <strong>{studentInfo.group}</strong></p>
                  </div>
                  <div style={{ width: '46px', height: '46px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>school</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', backgroundColor: 'rgba(0,0,0,0.18)', padding: '10px 8px', borderRadius: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '10px', opacity: 0.85 }}>Davomat</span>
                    <h5 style={{ margin: '2px 0 0', fontSize: '14px', fontWeight: '900' }}>{attendanceData.attendance_rate}%</h5>
                  </div>
                  <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                    <span style={{ fontSize: '10px', opacity: 0.85 }}>Tangalar</span>
                    <h5 style={{ margin: '2px 0 0', fontSize: '14px', fontWeight: '900' }}>🪙 {studentInfo.coins}</h5>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '10px', opacity: 0.85 }}>Sertifikat</span>
                    <h5 style={{ margin: '2px 0 0', fontSize: '14px', fontWeight: '900' }}>🎓 {myCertificates.length}</h5>
                  </div>
                </div>
              </div>

              {/* QUICK ACTION TILES (4 ICONS) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { id: 'homework', label: 'Vazifalar', icon: 'assignment', color: '#2563eb', bg: '#eff6ff', badge: pendingHwCount > 0 ? pendingHwCount : null },
                  { id: 'attendance', label: 'Davomat', icon: 'calendar_month', color: '#16a34a', bg: '#f0fdf4' },
                  { id: 'finance', label: 'To\'lovlar', icon: 'payments', color: '#d97706', bg: '#fffbeb', badge: billingInfo?.total_debt > 0 ? '!' : null },
                  { id: 'exams', label: 'Imtihonlar', icon: 'quiz', color: '#7c3aed', bg: '#f5f3ff', badge: activeExamsCount > 0 ? '⚡' : null },
                ].map(tile => (
                  <button
                    key={tile.id}
                    onClick={() => setActiveTab(tile.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      padding: '14px 4px', borderRadius: '18px',
                      border: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}`,
                      backgroundColor: darkMode ? '#1e293b' : tile.bg,
                      cursor: 'pointer', position: 'relative'
                    }}
                  >
                    {tile.badge && (
                      <span className={tile.badge === '⚡' ? 'pulse-badge' : ''} style={{
                        position: 'absolute', top: '6px', right: '6px',
                        backgroundColor: tile.badge === '!' ? '#dc2626' : '#2563eb',
                        color: '#ffffff', fontSize: '10px', fontWeight: '900',
                        width: '18px', height: '18px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {tile.badge}
                      </span>
                    )}
                    <span className="material-symbols-outlined" style={{ fontSize: '26px', color: tile.color }}>{tile.icon}</span>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: darkMode ? '#ffffff' : '#0f172a' }}>{tile.label}</span>
                  </button>
                ))}
              </div>

              {/* ACTIVE LIVE EXAM BANNER (IF ACTIVE) */}
              {myExams.some(e => e.status === 'ACTIVE' && !e.has_submitted) && (
                <div style={{
                  padding: '14px 16px',
                  backgroundColor: '#fee2e2',
                  border: '2px solid #ef4444',
                  borderRadius: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 6px 16px rgba(239,68,68,0.2)'
                }}>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: '900', color: '#dc2626', textTransform: 'uppercase' }}>⚡️ JONLI TEST BOSHLANDI</span>
                    <h5 style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: '900', color: '#991b1b' }}>
                      {myExams.find(e => e.status === 'ACTIVE' && !e.has_submitted)?.title}
                    </h5>
                  </div>
                  <button
                    onClick={() => {
                      const activeEx = myExams.find(e => e.status === 'ACTIVE' && !e.has_submitted);
                      if (activeEx) handleStartTakingExam(activeEx);
                    }}
                    style={{ padding: '8px 14px', borderRadius: '12px', border: 'none', backgroundColor: '#dc2626', color: '#ffffff', fontWeight: '900', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Boshlash 🚀
                  </button>
                </div>
              )}

              {/* RECENT HOMEWORKS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: darkMode ? '#ffffff' : '#0f172a' }}>Uy Vazifalari 📝</h4>
                  <button onClick={() => setActiveTab('homework')} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '800', fontSize: '11px', cursor: 'pointer' }}>Barchasi →</button>
                </div>

                {homeworks.slice(0, 3).map(hw => {
                  const isGraded = hw.submission?.status === 'GRADED';
                  const isPending = hw.submission && !isGraded;

                  return (
                    <div key={hw.id} style={{
                      padding: '14px 16px',
                      backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                      borderRadius: '18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h5 style={{ margin: 0, fontSize: '13px', fontWeight: '900', color: darkMode ? '#ffffff' : '#0f172a' }}>{hw.title}</h5>
                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>Guruh: {hw.group_name}</p>
                      </div>

                      {isGraded ? (
                        <span style={{ fontSize: '11px', fontWeight: '900', backgroundColor: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '8px' }}>
                          +{hw.submission.coins_awarded} 🪙
                        </span>
                      ) : isPending ? (
                        <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '4px 8px', borderRadius: '8px' }}>
                          📥 Tekshiruvda
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setShowSubmitModalHw(hw);
                            setSubmitText('');
                            setSubmitFile(null);
                          }}
                          style={{ padding: '6px 12px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '800', fontSize: '11px', cursor: 'pointer' }}
                        >
                          Topshirish
                        </button>
                      )}
                    </div>
                  );
                })}

                {homeworks.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', padding: '16px' }}>Hozircha yangi vazifalar yo'q.</p>
                )}
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: HOMEWORK (UY VAZIFALARI & TOPSHIRISH)                 */}
          {/* ============================================================ */}
          {activeTab === 'homework' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', color: darkMode ? '#ffffff' : '#0f172a', margin: 0 }}>Uy Vazifalari 📚</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>Vazifalarni topshiring va coinlar oling</p>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb', backgroundColor: darkMode ? '#1e293b' : '#eff6ff', padding: '4px 10px', borderRadius: '50px' }}>
                  {homeworks.length} ta
                </span>
              </div>

              {/* FILTER PILLS */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                {[
                  { id: 'ALL', label: 'Barchasi' },
                  { id: 'PENDING', label: 'Topshirilmagan' },
                  { id: 'SUBMITTED', label: 'Tekshiruvda' },
                  { id: 'GRADED', label: 'Baholangan' }
                ].map(flt => (
                  <button
                    key={flt.id}
                    onClick={() => setHomeworkFilter(flt.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '10px',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      backgroundColor: homeworkFilter === flt.id ? '#2563eb' : (darkMode ? '#1e293b' : '#f1f5f9'),
                      color: homeworkFilter === flt.id ? '#ffffff' : '#64748b'
                    }}
                  >
                    {flt.label}
                  </button>
                ))}
              </div>

              {/* HOMEWORKS LIST */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredHomeworks.map(hw => {
                  const sub = hw.submission;
                  const isGraded = sub?.status === 'GRADED';
                  const isPending = sub && !isGraded;

                  return (
                    <div key={hw.id} style={{
                      padding: '16px',
                      backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                      border: `1px solid ${isGraded ? '#86efac' : isPending ? '#bfdbfe' : (darkMode ? '#334155' : '#e2e8f0')}`,
                      borderRadius: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '6px' }}>
                            {hw.group_name}
                          </span>
                          <h4 style={{ fontSize: '14px', fontWeight: '900', margin: '6px 0 0', color: darkMode ? '#ffffff' : '#0f172a' }}>{hw.title}</h4>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#fef3c7', padding: '3px 8px', borderRadius: '8px' }}>
                          <span style={{ fontSize: '12px' }}>🪙</span>
                          <span style={{ fontSize: '11px', fontWeight: '900', color: '#b45309' }}>max {hw.max_coins}</span>
                        </div>
                      </div>

                      {hw.description && (
                        <p style={{ margin: 0, fontSize: '12px', color: darkMode ? '#cbd5e1' : '#475569', lineHeight: '1.5' }}>
                          {hw.description}
                        </p>
                      )}

                      {/* TEACHER ATTACHED FILE */}
                      {hw.pdf_file_url && (
                        <a
                          href={`http://127.0.0.1:8000${hw.pdf_file_url}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px',
                            color: '#2563eb', fontWeight: '800', textDecoration: 'none',
                            padding: '6px 12px', borderRadius: '10px', backgroundColor: '#eff6ff', width: 'fit-content'
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>attach_file</span> Dars materialini yuklab olish
                        </a>
                      )}

                      {/* SUBMISSION STATUS BOX */}
                      {isGraded ? (
                        <div style={{ padding: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', fontWeight: '900', color: '#166534' }}>✅ Baholandi: {sub.grade} ball</span>
                            <span style={{ fontSize: '12px', fontWeight: '900', color: '#b45309' }}>+{sub.coins_awarded} Coin 🪙</span>
                          </div>
                          {sub.feedback && (
                            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#15803d' }}>
                              💬 Ustoz izohi: <i>"{sub.feedback}"</i>
                            </p>
                          )}
                        </div>
                      ) : isPending ? (
                        <div style={{ padding: '10px 12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: '#1d4ed8' }}>📥 Topshirildi (Tekshiruvda)</span>
                          <span style={{ fontSize: '10px', color: '#64748b' }}>{sub.submitted_at?.split('T')[0]}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setShowSubmitModalHw(hw);
                            setSubmitText('');
                            setSubmitFile(null);
                          }}
                          style={{ padding: '10px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '900', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload</span> Vazifani Topshirish
                        </button>
                      )}
                    </div>
                  );
                })}

                {filteredHomeworks.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '36px 16px', backgroundColor: darkMode ? '#1e293b' : '#ffffff', borderRadius: '20px', border: `1px dashed ${darkMode ? '#334155' : '#cbd5e1'}` }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '42px', color: '#94a3b8' }}>assignment</span>
                    <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#64748b' }}>Ushbu bo'limda vazifalar topilmadi.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: ATTENDANCE (DAVOMAT STATISTIKASI)                     */}
          {/* ============================================================ */}
          {activeTab === 'attendance' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', color: darkMode ? '#ffffff' : '#0f172a', margin: 0 }}>Davomat Statistikasi 📊</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>Darslarda ishtirok ko'rsatkichi</p>
                </div>
                <div style={{ padding: '6px 14px', backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: '50px', fontWeight: '900', fontSize: '13px', color: '#166534' }}>
                  {attendanceData.attendance_rate}%
                </div>
              </div>

              {/* 4 SUMMARY STAT TILES */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                <div style={{ padding: '10px 4px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '9px', color: '#166534', fontWeight: '800' }}>Keldi ✅</span>
                  <h4 style={{ margin: '2px 0 0', fontSize: '15px', fontWeight: '900', color: '#166534' }}>{attendanceData.present_count}</h4>
                </div>
                <div style={{ padding: '10px 4px', backgroundColor: '#fefce8', border: '1px solid #fef08a', borderRadius: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '9px', color: '#854d0e', fontWeight: '800' }}>Kechikdi 🕒</span>
                  <h4 style={{ margin: '2px 0 0', fontSize: '15px', fontWeight: '900', color: '#854d0e' }}>{attendanceData.late_count}</h4>
                </div>
                <div style={{ padding: '10px 4px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '9px', color: '#1e40af', fontWeight: '800' }}>Sababli 📋</span>
                  <h4 style={{ margin: '2px 0 0', fontSize: '15px', fontWeight: '900', color: '#1e40af' }}>{attendanceData.excused_count}</h4>
                </div>
                <div style={{ padding: '10px 4px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '9px', color: '#991b1b', fontWeight: '800' }}>Kelmadi ❌</span>
                  <h4 style={{ margin: '2px 0 0', fontSize: '15px', fontWeight: '900', color: '#991b1b' }}>{attendanceData.absent_count}</h4>
                </div>
              </div>

              {/* ATTENDANCE RECORDS LIST */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: '900', color: darkMode ? '#ffffff' : '#0f172a' }}>Darslar Jurnali:</h4>
                
                {attendanceData.records.map((rec, idx) => {
                  let statusBg = '#dcfce7';
                  let statusColor = '#166534';
                  let statusLabel = 'Keldi ✓';

                  if (rec.status === 'LATE') {
                    statusBg = '#fef3c7'; statusColor = '#b45309'; statusLabel = 'Kechikdi 🕒';
                  } else if (rec.status === 'ABSENT') {
                    statusBg = '#fee2e2'; statusColor = '#991b1b'; statusLabel = 'Kelmadi ✕';
                  } else if (rec.status === 'EXCUSED') {
                    statusBg = '#eff6ff'; statusColor = '#1d4ed8'; statusLabel = 'Sababli 📋';
                  }

                  return (
                    <div key={idx} style={{
                      padding: '12px 14px',
                      backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                      borderRadius: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '900', color: darkMode ? '#ffffff' : '#0f172a' }}>📅 {rec.lesson_date}</span>
                          <span style={{ fontSize: '10px', color: '#64748b' }}>({rec.group_name})</span>
                        </div>
                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: darkMode ? '#cbd5e1' : '#475569' }}>{rec.topic}</p>
                      </div>

                      <span style={{ fontSize: '10px', fontWeight: '900', backgroundColor: statusBg, color: statusColor, padding: '4px 8px', borderRadius: '8px' }}>
                        {statusLabel}
                      </span>
                    </div>
                  );
                })}

                {attendanceData.records.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', padding: '24px' }}>Hozircha davomat yozuvlari mavjud emas.</p>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: FINANCE (TO'LOVLAR TARIXI & CHEKLAR)                  */}
          {/* ============================================================ */}
          {activeTab === 'finance' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', color: darkMode ? '#ffffff' : '#0f172a', margin: 0 }}>To'lovlar & Moliya 💳</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>Oylik to'lov va rasmiy kvitansiyalar</p>
                </div>
              </div>

              {/* FINANCIAL SUMMARY CARD */}
              {billingInfo && (
                <div style={{
                  padding: '16px',
                  background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
                  borderRadius: '20px',
                  color: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  boxShadow: '0 8px 20px rgba(13,148,136,0.25)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', opacity: 0.9 }}>Joriy Oy: <strong>{billingInfo.month_for}</strong></span>
                    <span style={{ fontSize: '10px', fontWeight: '900', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '6px' }}>
                      {billingInfo.total_debt > 0 ? '⚠️ Qarz mavjud' : '✅ Qarz yo\'q'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: '14px' }}>
                    <div>
                      <span style={{ fontSize: '10px', opacity: 0.85 }}>Oylik To'lov:</span>
                      <h4 style={{ margin: '2px 0 0', fontSize: '14px', fontWeight: '900' }}>{billingInfo.month_amount_due?.toLocaleString()} so'm</h4>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', opacity: 0.85 }}>To'langan:</span>
                      <h4 style={{ margin: '2px 0 0', fontSize: '14px', fontWeight: '900', color: '#a7f3d0' }}>{billingInfo.month_amount_paid?.toLocaleString()} so'm</h4>
                    </div>
                  </div>

                  {billingInfo.total_debt > 0 ? (
                    <div style={{ fontSize: '12px', fontWeight: '900', color: '#fef08a' }}>
                      Qoldiq qarz: {billingInfo.total_debt?.toLocaleString()} so'm
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', fontWeight: '900', color: '#a7f3d0' }}>
                      ✓ Ushbu oy uchun to'lov to'liq amalga oshirilgan!
                    </div>
                  )}
                </div>
              )}

              {/* PAYMENTS HISTORY WITH INTERACTIVE CHEK BUTTON */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: '900', color: darkMode ? '#ffffff' : '#0f172a' }}>To'lov Kvitansiyalari (Cheklar):</h4>

                {payments.map(pay => (
                  <div key={pay.id} style={{
                    padding: '14px 16px',
                    backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                    border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                    borderRadius: '18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '900', color: '#16a34a' }}>+{pay.amount?.toLocaleString()} so'm</span>
                        <span style={{ fontSize: '10px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>{pay.payment_method}</span>
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>
                        📅 {pay.created_at?.split('T')[0]} • Oy: {pay.month_for}
                      </p>
                    </div>

                    {/* OPEN OFFICIAL RECEIPT MODAL BUTTON */}
                    <button
                      onClick={() => setSelectedReceipt(pay)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '12px',
                        border: '1px solid #bfdbfe',
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        fontWeight: '900',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>receipt_long</span> Chek
                    </button>
                  </div>
                ))}

                {payments.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', padding: '24px' }}>Hozircha to'lov yozuvlari mavjud emas.</p>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: EXAMS (IMTIHONLAR & JONLI TEST)                      */}
          {/* ============================================================ */}
          {activeTab === 'exams' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', color: darkMode ? '#ffffff' : '#0f172a', margin: 0 }}>Imtihonlar & Sinovlar 🎯</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>Online testlar va imtihon natijalari</p>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#7c3aed', backgroundColor: '#f5f3ff', padding: '4px 10px', borderRadius: '50px' }}>
                  {myExams.length} ta
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {myExams.map(e => {
                  const isActive = e.status === 'ACTIVE';
                  const isScheduled = e.status === 'SCHEDULED';

                  return (
                    <div key={e.id} style={{
                      padding: '16px',
                      backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                      border: `1px solid ${isActive ? '#2563eb' : (darkMode ? '#334155' : '#e2e8f0')}`,
                      borderRadius: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px', backgroundColor: e.exam_type === 'ONLINE' ? '#eff6ff' : '#f5f3ff', color: e.exam_type === 'ONLINE' ? '#1d4ed8' : '#7c3aed' }}>
                            {e.exam_type === 'ONLINE' ? '🌐 Online Test' : '📝 Offline'}
                          </span>
                          <h4 style={{ fontSize: '14px', fontWeight: '900', margin: '6px 0 0', color: darkMode ? '#ffffff' : '#0f172a' }}>{e.title}</h4>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>Guruh: {e.group_name}</p>
                        </div>

                        <span style={{
                          fontSize: '10px', fontWeight: '900', padding: '3px 8px', borderRadius: '50px',
                          backgroundColor: isActive ? '#dbeafe' : isScheduled ? '#fef3c7' : '#dcfce7',
                          color: isActive ? '#1d4ed8' : isScheduled ? '#b45309' : '#166534'
                        }}>
                          {isActive ? '⚡️ Jonli' : isScheduled ? '⏳ Kutilmoqda' : '✅ Yakunlangan'}
                        </span>
                      </div>

                      <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${darkMode ? '#334155' : '#f1f5f9'}`, paddingTop: '8px' }}>
                        <span>📅 {e.exam_date}</span>
                        <span>⏱️ {e.duration_minutes || 30} daqiqa</span>
                        <span>🎯 O'tish: <strong style={{ color: '#16a34a' }}>{e.pass_score}</strong>/{e.max_score}</span>
                      </div>

                      {/* SUBMITTED OR START TEST BUTTON */}
                      {e.has_submitted ? (
                        <div style={{ padding: '10px 12px', backgroundColor: e.is_passed ? '#f0fdf4' : '#fef2f2', border: `1px solid ${e.is_passed ? '#86efac' : '#fecaca'}`, borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: '900', color: e.is_passed ? '#166534' : '#991b1b' }}>
                            {e.is_passed ? '🎉 O\'tdingiz' : '❌ O\'tmadingiz'} • Ball: {e.my_score}/{e.max_score}
                          </span>
                          {e.certificate_code && (
                            <button
                              onClick={() => setActiveTab('certs')}
                              style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', backgroundColor: '#16a34a', color: '#ffffff', fontWeight: '800', fontSize: '10px', cursor: 'pointer' }}
                            >
                              Sertifikat 🎓
                            </button>
                          )}
                        </div>
                      ) : isActive && e.exam_type === 'ONLINE' ? (
                        <button 
                          onClick={() => handleStartTakingExam(e)}
                          style={{ padding: '10px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '900', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_arrow</span> Testni Boshlash (Online)
                        </button>
                      ) : null}
                    </div>
                  );
                })}

                {myExams.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '36px 16px', backgroundColor: darkMode ? '#1e293b' : '#ffffff', borderRadius: '20px', border: `1px dashed ${darkMode ? '#334155' : '#cbd5e1'}` }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '42px', color: '#94a3b8' }}>quiz</span>
                    <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#64748b' }}>Hozircha imtihonlar belgilanmagan.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 6: CERTS (SERTIFIKATLAR)                                 */}
          {/* ============================================================ */}
          {activeTab === 'certs' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', color: darkMode ? '#ffffff' : '#0f172a', margin: 0 }}>Mening Sertifikatlarim 🎓</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>Rasmiy bitiruv sertifikatlari</p>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#16a34a', backgroundColor: '#dcfce7', padding: '4px 10px', borderRadius: '50px' }}>
                  {myCertificates.length} ta
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {myCertificates.map(c => (
                  <div key={c.id} style={{
                    padding: '16px',
                    backgroundColor: '#f0fdf4',
                    border: '2px solid #86efac',
                    borderRadius: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    boxShadow: '0 4px 14px rgba(22,163,74,0.08)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: '9px', backgroundColor: '#dcfce7', color: '#166534', fontWeight: '800', padding: '2px 8px', borderRadius: '4px' }}>
                          RASMIY SERTIFIKAT
                        </span>
                        <h4 style={{ fontSize: '15px', fontWeight: '900', margin: '4px 0 0', color: '#0f172a' }}>{c.course_title}</h4>
                        <p style={{ fontSize: '11px', color: '#15803d', fontWeight: '800', margin: '2px 0 0' }}>Seriya: {c.certificate_code}</p>
                      </div>
                      <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#16a34a' }}>workspace_premium</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #bbf7d0', paddingTop: '8px', fontSize: '11px', color: '#475569' }}>
                      <span>Sana: {c.issue_date?.split('T')[0]}</span>
                      <button 
                        onClick={() => setSelectedCertView(c)}
                        style={{ padding: '6px 12px', borderRadius: '10px', border: 'none', backgroundColor: '#16a34a', color: '#ffffff', fontWeight: '800', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>visibility</span> Ko'rish
                      </button>
                    </div>
                  </div>
                ))}

                {myCertificates.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '36px 16px', backgroundColor: darkMode ? '#1e293b' : '#ffffff', borderRadius: '20px', border: `1px dashed ${darkMode ? '#334155' : '#cbd5e1'}` }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '42px', color: '#94a3b8' }}>workspace_premium</span>
                    <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#64748b' }}>Imtihonlardan o'tib sertifikatlarni qo'lga kiriting!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 7: PROFILE (PROFIL & SOZLAMALAR)                         */}
          {/* ============================================================ */}
          {activeTab === 'profile' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '900', color: darkMode ? '#ffffff' : '#0f172a', margin: 0 }}>Mening Profilim 👤</h3>
              
              <div style={{
                padding: '16px',
                backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '12px'
              }}>
                <p style={{ margin: 0 }}><strong>F.I.SH:</strong> {studentInfo.name}</p>
                <p style={{ margin: 0 }}><strong>Login ID:</strong> <code>{studentInfo.id}</code></p>
                <p style={{ margin: 0 }}><strong>Telefon:</strong> {studentInfo.phone || 'Kiritilmagan'}</p>
                <p style={{ margin: 0 }}><strong>Ota-ona telefoni:</strong> {studentInfo.parentPhone || 'Kiritilmagan'}</p>
                <p style={{ margin: 0 }}><strong>Guruh:</strong> {studentInfo.group}</p>
                <p style={{ margin: 0 }}><strong>Tangalar:</strong> 🪙 {studentInfo.coins} Coin</p>
              </div>

              <button 
                onClick={() => setShowCardModal(true)}
                style={{ padding: '12px', borderRadius: '14px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>qr_code_2</span> Digital Student Pass (QR Karta)
              </button>

              {/* CHANGE PASSWORD */}
              <div style={{
                padding: '16px',
                backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '900', color: darkMode ? '#ffffff' : '#0f172a' }}>🔒 Parolni Yangilash</h4>
                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="password"
                    required
                    placeholder="Eski parol"
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', backgroundColor: darkMode ? '#0f172a' : '#ffffff', color: darkMode ? '#ffffff' : '#0f172a' }}
                  />
                  <input
                    type="password"
                    required
                    placeholder="Yangi parol (kamida 8 ta belgi)"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', backgroundColor: darkMode ? '#0f172a' : '#ffffff', color: darkMode ? '#ffffff' : '#0f172a' }}
                  />
                  <button
                    type="submit"
                    disabled={changingPass}
                    style={{ padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
                  >
                    {changingPass ? 'Saqlanmoqda...' : 'Saqlash'}
                  </button>
                </form>
              </div>

              {/* LOGOUT BUTTON */}
              <button 
                onClick={handleLogout}
                style={{ padding: '12px', borderRadius: '14px', border: 'none', backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '4px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span> Tizimdan Chiqish
              </button>
            </div>
          )}

        </main>

        {/* BOTTOM FIXED NAVIGATION BAR (7 TABS WITH MOBILE SAFE-AREA SUPPORT) */}
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: '540px',
          margin: '0 auto',
          backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderTop: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}`,
          padding: '8px 6px',
          paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 50,
          userSelect: 'none',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
        }}>
          {[
            { id: 'home', label: 'Asosiy', icon: 'home' },
            { id: 'homework', label: 'Vazifa', icon: 'assignment', badge: pendingHwCount > 0 ? pendingHwCount : null },
            { id: 'attendance', label: 'Davomat', icon: 'calendar_month' },
            { id: 'finance', label: 'To\'lov', icon: 'payments' },
            { id: 'exams', label: 'Imtihon', icon: 'quiz', badge: activeExamsCount > 0 ? '⚡' : null },
            { id: 'certs', label: 'Sertifikat', icon: 'workspace_premium' },
            { id: 'profile', label: 'Profil', icon: 'person' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  padding: '4px 2px',
                  color: isActive ? '#2563eb' : (darkMode ? '#94a3b8' : '#64748b'),
                  position: 'relative'
                }}
              >
                {tab.badge && (
                  <span style={{
                    position: 'absolute', top: '1px', right: '12px',
                    backgroundColor: '#dc2626', color: '#ffffff',
                    fontSize: '9px', fontWeight: '900',
                    width: '14px', height: '14px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {tab.badge}
                  </span>
                )}
                <span className="material-symbols-outlined" style={{ fontSize: '22px', fontWeight: isActive ? '900' : 'normal' }}>
                  {tab.icon}
                </span>
                <span style={{ fontSize: '10px', fontWeight: isActive ? '900' : '700' }}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

      </div>

      {/* ============================================================ */}
      {/* IN-APP OFFICIAL PAYMENT RECEIPT (CHEK) MODAL                  */}
      {/* ============================================================ */}
      {selectedReceipt && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 150,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px'
        }}>
          <div className="animate-fade-in" style={{
            backgroundColor: '#ffffff',
            borderRadius: '28px',
            maxWidth: '420px',
            width: '100%',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)'
          }}>
            
            {/* PRINTABLE RECEIPT FRAME */}
            <div id="student-printable-receipt" style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '18px',
              padding: '20px',
              backgroundColor: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {/* HEADER */}
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                  <img src="/logo.png" alt="Logo" style={{ width: '24px', height: '24px', objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
                  <span style={{ fontSize: '13px', fontWeight: '900', color: '#1e3a8a', letterSpacing: '1px' }}>TA'LIM PLUS EDUCATION</span>
                </div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: '#0f172a' }}>TO'LOV KVITANSIYASI (CHEK)</h3>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Chek №: <strong style={{ color: '#2563eb' }}>#CHK-{selectedReceipt.id}</strong></span>
              </div>

              {/* DETAILS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>O'quvchi:</span>
                  <strong style={{ color: '#0f172a' }}>{studentInfo.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Student ID:</span>
                  <code>{studentInfo.id}</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Guruh / Kurs:</span>
                  <strong>{studentInfo.group}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>To'lov Oyi:</span>
                  <strong>{selectedReceipt.month_for}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>To'lov Turi:</span>
                  <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '6px', fontWeight: '800', fontSize: '11px' }}>
                    {selectedReceipt.payment_method}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Sana va Vaqt:</span>
                  <span>{selectedReceipt.created_at ? selectedReceipt.created_at.replace('T', ' ').slice(0, 16) : new Date().toISOString().slice(0, 10)}</span>
                </div>
                {selectedReceipt.note && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Izoh:</span>
                    <span style={{ color: '#475569', fontStyle: 'italic' }}>{selectedReceipt.note}</span>
                  </div>
                )}
              </div>

              {/* AMOUNT BOX */}
              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '12px', textAlign: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: '800', textTransform: 'uppercase' }}>To'langan Summa</span>
                <h2 style={{ margin: '4px 0 0', fontSize: '22px', fontWeight: '900', color: '#1e40af' }}>
                  {(selectedReceipt.amount || 0).toLocaleString()} SO'M
                </h2>
              </div>

              {/* QR & VERIFICATION */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#166534', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>verified</span> Muvaffaqiyatli to'landi
                  </span>
                  <span style={{ fontSize: '9px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>Fiskal Tasdiq: TALIM-PLUS-PAY</span>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=PAYMENT_VERIFIED_${selectedReceipt.id}`} 
                    alt="QR Check" 
                    style={{ width: '56px', height: '56px', display: 'block' }} 
                  />
                </div>
              </div>

            </div>

            {/* BUTTONS */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                onClick={() => setSelectedReceipt(null)}
                style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
              >
                Yopish
              </button>
              <button 
                type="button" 
                onClick={() => window.print()}
                style={{ flex: 1.2, padding: '10px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '900', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>print</span> Chop etish
              </button>
              <button 
                type="button" 
                onClick={() => window.open(`http://127.0.0.1:8000/api/v1/finance/payments/${selectedReceipt.id}/pdf`, '_blank')}
                style={{ flex: 1.2, padding: '10px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '900', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span> PDF
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ONLINE EXAM TEST TAKING MODAL                                */}
      {/* ============================================================ */}
      {activeTakingExam && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="animate-fade-in" style={{ backgroundColor: '#ffffff', borderRadius: '28px', maxWidth: '440px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            
            {/* If Results received */}
            {examResultOutcome ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '16px 0' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: examResultOutcome.is_passed ? '#dcfce7' : '#fee2e2', color: examResultOutcome.is_passed ? '#166534' : '#991b1b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '36px' }}>
                  {examResultOutcome.is_passed ? '🎓' : '📝'}
                </div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>
                  {examResultOutcome.is_passed ? "Tabriklaymiz! Siz o'tdingiz!" : "Imtihon yakunlandi"}
                </h3>
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#2563eb' }}>
                    {examResultOutcome.score} / {examResultOutcome.max_score} ball
                  </p>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                    Natija: {examResultOutcome.percentage}%
                  </span>
                </div>

                {examResultOutcome.certificate_awarded && (
                  <div style={{ backgroundColor: '#f0fdf4', border: '2px solid #86efac', borderRadius: '16px', padding: '14px', textAlign: 'left' }}>
                    <p style={{ margin: 0, fontWeight: '900', color: '#166534', fontSize: '13px' }}>
                      🎉 Sizga rasmiy sertifikat berildi!
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#15803d' }}>
                      Sertifikat kodi: <strong>{examResultOutcome.certificate_code}</strong>
                    </p>
                  </div>
                )}

                <button 
                  onClick={() => {
                    setActiveTakingExam(null);
                    setExamResultOutcome(null);
                    if (examResultOutcome.certificate_awarded) setActiveTab('certs');
                  }}
                  style={{ padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '900', cursor: 'pointer' }}
                >
                  Yopish
                </button>
              </div>
            ) : (
              // Test Questions Screen
              <form onSubmit={handleSubmitOnlineExam} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eff6ff', paddingBottom: '12px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: '#0f172a' }}>{activeTakingExam.title}</h4>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Jami {examQuestions.length} ta savol</span>
                  </div>
                  {/* LIVE COUNTDOWN TIMER */}
                  <div style={{ padding: '6px 12px', backgroundColor: examTimeRemaining < 120 ? '#fee2e2' : '#eff6ff', color: examTimeRemaining < 120 ? '#dc2626' : '#1d4ed8', borderRadius: '50px', fontWeight: '900', fontSize: '13px', border: `1px solid ${examTimeRemaining < 120 ? '#fca5a5' : '#bfdbfe'}`, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>timer</span>
                    {formatTimer(examTimeRemaining)}
                  </div>
                </div>

                {/* QUESTIONS LIST */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '420px', overflowY: 'auto' }}>
                  {examQuestions.map((q, qIdx) => (
                    <div key={qIdx} style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
                      <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                        {qIdx + 1}. {q.question_text}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(Array.isArray(q.options) ? q.options : []).map((opt, oIdx) => {
                          const isSelected = userAnswers[qIdx] === opt;
                          return (
                            <label 
                              key={oIdx}
                              onClick={() => setUserAnswers({...userAnswers, [qIdx]: opt})}
                              style={{
                                padding: '10px 12px', borderRadius: '10px', fontSize: '12px', cursor: 'pointer',
                                backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                                border: `1px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                                color: isSelected ? '#1d4ed8' : '#0f172a',
                                fontWeight: isSelected ? '800' : 'normal',
                                display: 'flex', alignItems: 'center', gap: '8px'
                              }}
                            >
                              <input 
                                type="radio" 
                                name={`question_${qIdx}`} 
                                checked={isSelected} 
                                onChange={() => setUserAnswers({...userAnswers, [qIdx]: opt})}
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button 
                    type="button" 
                    onClick={() => {
                      if (window.confirm("Haqiqatdan ham testdan chiqmoqchimisiz? Natijangiz saqlanmasligi mumkin.")) {
                        setActiveTakingExam(null);
                      }
                    }}
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Chiqish
                  </button>
                  <button 
                    type="submit" 
                    disabled={submittingExam}
                    style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '900', cursor: submittingExam ? 'not-allowed' : 'pointer', fontSize: '13px' }}
                  >
                    {submittingExam ? 'Tekshirilmoqda...' : '🏁 Topshirish va Yakunlash'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* OFFICIAL CERTIFICATE VIEW MODAL (PRINTABLE / DOWNLOADABLE)   */}
      {/* ============================================================ */}
      {selectedCertView && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', zIndex: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="animate-fade-in" style={{ backgroundColor: '#ffffff', borderRadius: '28px', maxWidth: '520px', width: '100%', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 30px 70px rgba(0,0,0,0.3)' }}>
            
            {/* CERTIFICATE FRAME */}
            <div id="printable-certificate" style={{ border: '6px double #d97706', padding: '24px', borderRadius: '20px', backgroundColor: '#fffbeb', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#d97706' }}>workspace_premium</span>
                <span style={{ fontSize: '13px', fontWeight: '900', color: '#92400e', letterSpacing: '2px' }}>TA'LIM PLUS EDUCATION</span>
              </div>

              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#b45309', fontFamily: 'serif', letterSpacing: '1px' }}>
                SERTIFIKAT
              </h2>
              <span style={{ fontSize: '11px', color: '#92400e', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Certificate of Achievement
              </span>

              <p style={{ fontSize: '12px', color: '#78350f', margin: 0 }}>
                Ushbu sertifikat quyidagi o'quvchiga beriladi:
              </p>

              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#1e3a8a', borderBottom: '2px solid #fbbf24', paddingBottom: '6px', display: 'inline-block' }}>
                {selectedCertView.student_name || studentInfo.name}
              </h3>

              <p style={{ fontSize: '12px', color: '#78350f', margin: 0, lineHeight: '1.6' }}>
                O'quvchi <strong>"{selectedCertView.course_title}"</strong> kursi dasturi va imtihon sinovlarini muvaffaqiyatli yakunlagani tasdiqlanadi.
              </p>

              {/* QR CODE & VERIFICATION INFO */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px dashed #d97706', paddingTop: '14px' }}>
                <div style={{ textAlign: 'left', fontSize: '11px', color: '#78350f' }}>
                  <p style={{ margin: 0 }}><strong>Seriya:</strong> {selectedCertView.certificate_code}</p>
                  <p style={{ margin: '2px 0 0' }}><strong>Sana:</strong> {selectedCertView.issue_date?.split('T')[0]}</p>
                  <p style={{ margin: '2px 0 0', color: '#16a34a', fontWeight: '800' }}>✓ Haqiqiy (Verified)</p>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '6px', borderRadius: '10px', border: '1px solid #fde68a' }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=VERIFY_${selectedCertView.certificate_code}`} 
                    alt="Certificate QR" 
                    style={{ width: '80px', height: '80px', display: 'block' }} 
                  />
                </div>
              </div>

            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setSelectedCertView(null)} 
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', fontWeight: '800', cursor: 'pointer' }}
              >
                Yopish
              </button>
              <button 
                onClick={() => window.print()} 
                style={{ flex: 1.5, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#16a34a', color: '#ffffff', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>print</span> Chop etish / Yuklab olish
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DIGITAL STUDENT CARD MODAL WITH QR PASS                      */}
      {/* ============================================================ */}
      {showCardModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(6px)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="animate-fade-in" style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '28px', maxWidth: '380px', width: '100%', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Digital Student Card 📱</h3>
            <div style={{ width: '100%', padding: '20px', background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', borderRadius: '20px', color: '#ffffff', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#ffffff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '20px' }}>
                {studentInfo.name.charAt(0)}
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: '900', margin: 0 }}>{studentInfo.name}</h4>
              <p style={{ fontSize: '11px', opacity: 0.9, margin: 0 }}>ID: {studentInfo.id} • {studentInfo.course}</p>
              <div style={{ padding: '10px', backgroundColor: '#ffffff', borderRadius: '14px', marginTop: '6px' }}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=STUDENT_PASS_${studentInfo.id}`} alt="QR Code" style={{ width: '140px', height: '140px', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                <div style={{ width: '140px', height: '140px', display: 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#0f172a' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#2563eb' }}>qr_code_2</span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '8px' }}>{studentInfo.id}</span>
                </div>
              </div>
            </div>
            <button onClick={() => setShowCardModal(false)} style={{ padding: '10px 24px', borderRadius: '14px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: '800', fontSize: '12px', cursor: 'pointer', width: '100%' }}>Yopish</button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUBMIT HOMEWORK MODAL SHEET                                  */}
      {/* ============================================================ */}
      {showSubmitModalHw && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="animate-fade-in" style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', maxWidth: '440px', width: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eff6ff', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Uy Vazifasini Topshirish</h3>
                <span style={{ fontSize: '11px', color: '#64748b' }}>{showSubmitModalHw.title}</span>
              </div>
              <button onClick={() => setShowSubmitModalHw(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>

            <form onSubmit={handleSubmitHomework} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#334155', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Matnli Javob (Text):</label>
                <textarea 
                  placeholder="Javobingizni yoki topshiriq izohini shu yerga yozing..." 
                  value={submitText}
                  onChange={e => setSubmitText(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '13px', height: '80px', resize: 'none' }} 
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#334155', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Fayl biriktirish (PDF, Word, Rasm, Zip):</label>
                <input 
                  type="file" 
                  onChange={e => setSubmitFile(e.target.files[0] || null)}
                  style={{ fontSize: '12px', width: '100%' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button type="button" onClick={() => setShowSubmitModalHw(null)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', fontWeight: '800', cursor: 'pointer' }}>
                  Bekor qilish
                </button>
                <button type="submit" disabled={submittingHw} style={{ flex: 1.5, padding: '12px', fontSize: '13px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '900', cursor: submittingHw ? 'not-allowed' : 'pointer' }}>
                  {submittingHw ? 'Yuborilmoqda...' : 'Yuborish (Submit)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
