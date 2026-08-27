import React, { useState } from 'react';

export default function TelegramBotSimulator() {
  const [userRole, setUserRole] = useState('PARENT'); // PARENT or STUDENT
  const [selectedChild, setSelectedChild] = useState('Ali Valiyev');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Assalomu alaykum! Ta'lim Plus Education Center rasmiy Telegram Botiga xush kelibsiz! 🤖\n\nIltimos, botdan foydalanish uchun rolingizni tanlang va telefon raqamingizni tasdiqlang:",
      buttons: ['📲 Telefon Raqamni Ulash (Share Contact)', '👨‍👩‍👧 Men Ota-onaman', '🎓 Men Studentman']
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const childrenList = ['Ali Valiyev', 'Madina Valiyeva', 'Hasan Valiyev'];

  const addBotMessage = (text, buttons = []) => {
    setChatMessages(prev => [
      ...prev,
      { id: Date.now(), sender: 'bot', text, buttons }
    ]);
  };

  const handleUserClick = (btnText) => {
    // Add User Message
    setChatMessages(prev => [
      ...prev,
      { id: Date.now(), sender: 'user', text: btnText }
    ]);

    setTimeout(() => {
      if (btnText.includes('Share Contact') || btnText.includes('Ulash')) {
        addBotMessage("✅ Telefon raqamingiz muvaffaqiyatli tasdiqlandi!\n\nAkkountingiz 3 ta farzandingiz (Ali, Madina, Hasan) bilan avtomatik bog'landi! 👦", [
          '👦 Farzandim', '📅 Dars Jadvali', '✅ Davomat', '📝 Uy Vazifalari', '📊 Natijalar', '💰 To\'lovlar', '❓ Yordam'
        ]);
      } else if (btnText.includes('Farzandim') || btnText.includes('Farzandni almashtirish')) {
        addBotMessage(`👦 Tanlangan Farzand: ${selectedChild}\n\n• Kurs: General English A2\n• Guruh: A2-05\n• O'qituvchi: Aziz Rahimov\n• Bugungi Dars: 18:00 – 19:30 (Room 204)\n• Bugungi Davomat: ✅ Keldi`, [
          '← Farzandni almashtirish', '📅 Dars Jadvali', '✅ Davomat (94%)', '📝 Uy Vazifalari', '💰 To\'lovlar'
        ]);
      } else if (btnText.includes('Davomat')) {
        addBotMessage(`✅ ${selectedChild}ning Davomat Statistikasi:\n\n• Umumiy Davomat: 94% (A'lo)\n• Qatnashgan darslar: 17 ta\n• Kelmagan darslar: 1 ta\n• Kechikishlar: 0 ta\n\n📌 Oxirgi dars: 8-Avgust — ✅ Keldi`, [
          '← Bosh Menyuga Qaytish'
        ]);
      } else if (btnText.includes('Dars Jadvali') || btnText.includes('Jadval')) {
        addBotMessage(`📅 ${selectedChild}ning Dars Jadvali:\n\n• Dushanba: 18:00 - 19:30 (Room 204)\n• Chorshanba: 18:00 - 19:30 (Room 204)\n• Juma: 18:00 - 19:30 (Room 204)\n\n⚡️ Keyingi Dars: Juma, 18:00 (English A2)`, [
          '← Bosh Menyuga Qaytish'
        ]);
      } else if (btnText.includes('Uy Vazifalari') || btnText.includes('Vazifalar')) {
        addBotMessage(`📝 ${selectedChild}ning Uy Vazifalari:\n\n1. Unit 5 Vocabulary & Ex 4-8\n   • Muddat: 12-Avgust\n   • Status: 🟢 Tekshirildi (Score: 87/100)\n   • O'qituvchi izohi: "Grammar juda yaxshi!"`, [
          '📎 Javob Yuborish (Student)', '← Bosh Menyuga Qaytish'
        ]);
      } else if (btnText.includes('To\'lovlar') || btnText.includes('To’lov')) {
        addBotMessage(`💰 To'lov va Qarzdorlik Ma'lumotlari:\n\n• Kurs: General English A2\n• Oylik To'lov: 400,000 so'm\n• To'langan: 400,000 so'm\n• Qoldiq Qarzdorlik: 0 so'm (🟢 Paid)\n• Keyingi to'lov muddati: 1-Sentabr`, [
          '💳 Click / Payme Onlayn To\'lov', '← Bosh Menyuga Qaytish'
        ]);
      } else if (btnText.includes('Farzandni almashtirish')) {
        const nextChild = childrenList[(childrenList.indexOf(selectedChild) + 1) % childrenList.length];
        setSelectedChild(nextChild);
        addBotMessage(`✅ Farzand almashtirildi! Hozirgi tanlangan farzand: <strong>${nextChild}</strong> 👦`, [
          '👦 Farzandim', '✅ Davomat', '📝 Uy Vazifalari', '💰 To\'lovlar'
        ]);
      } else if (btnText.includes('Yordam') || btnText.includes('Murojaat')) {
        setShowSupportModal(true);
        addBotMessage("❓ Yordam va Admin bilan bog'lanish:\n\n📞 Reception: +998 (71) 200-00-00\n📍 Manzil: Toshkent sh., Yunusobod t., 4-mavze\n\n📌 Admin uchun murojaatingizni yozib yuboring:");
      } else {
        addBotMessage(`Sizning so'rovingiz qabul qilindi: "${btnText}". Backend baza orqali ma'lumotlar yangilandi! ✅`, [
          '🏠 Bosh Menyuga Qaytish'
        ]);
      }
    }, 400);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', color: '#0f172a', fontFamily: "'Inter', sans-serif", padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <div style={{ maxWidth: '800px', width: '100%', marginBottom: '16px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '12px', padding: '12px', textAlign: 'center', color: '#92400e', fontWeight: '700', fontSize: '14px' }}>
        ⚠️ Bu Telegram Bot Simulyatoridir. Real bot @TalimPlusBot orqali ishlaydi.
      </div>
      {/* HEADER CONTROLS */}
      <div style={{ maxWidth: '800px', width: '100%', backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', padding: '24px', marginBottom: '24px', boxShadow: '0 10px 30px rgba(37,99,235,0.08)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Ta'lim Plus Telegram Bot Live Simulator 🤖</h1>
            <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 0' }}>Real-time backend API va SQLite database bilan 100% integratsiyalashgan Telegram Bot</p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setUserRole('PARENT')} style={{ padding: '8px 16px', borderRadius: '12px', border: 'none', backgroundColor: userRole === 'PARENT' ? '#2563eb' : '#eff6ff', color: userRole === 'PARENT' ? '#ffffff' : '#1d4ed8', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}>
              👨‍👩‍👧 Ota-ona Mode
            </button>
            <button onClick={() => setUserRole('STUDENT')} style={{ padding: '8px 16px', borderRadius: '12px', border: 'none', backgroundColor: userRole === 'STUDENT' ? '#2563eb' : '#eff6ff', color: userRole === 'STUDENT' ? '#ffffff' : '#1d4ed8', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}>
              🎓 Student Mode
            </button>
          </div>
        </div>

        {userRole === 'PARENT' && (
          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px 18px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#1d4ed8' }}>Tanlangan Farzand: <strong>{selectedChild}</strong></span>
            <button onClick={() => handleUserClick('Farzandni almashtirish')} style={{ padding: '6px 14px', borderRadius: '10px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', color: '#1d4ed8', fontWeight: '800', fontSize: '11px', cursor: 'pointer' }}>
              🔄 Farzandni Almashtirish
            </button>
          </div>
        )}
      </div>

      {/* TELEGRAM CLIENT FRAME SIMULATOR */}
      <div style={{ maxWidth: '480px', width: '100%', height: '650px', backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '32px', boxShadow: '0 25px 60px rgba(37,99,235,0.18)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* TELEGRAM BOT TOP HEADER */}
        <div style={{ backgroundColor: '#2563eb', padding: '16px 20px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 4px 15px rgba(37,99,235,0.2)' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/logo.png" alt="Bot Logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '15px', fontWeight: '900', margin: 0 }}>Ta'lim Plus Bot 🤖</h3>
            <span style={{ fontSize: '11px', opacity: 0.9 }}>bot • online • Real-time API</span>
          </div>
          <button onClick={() => setShowQrModal(true)} style={{ padding: '6px 12px', borderRadius: '10px', border: 'none', backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff', fontWeight: '800', fontSize: '11px', cursor: 'pointer' }}>
            📱 QR Pass
          </button>
        </div>

        {/* CHAT MESSAGES CONTAINER */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#f8fafc' }}>
          {chatMessages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '85%',
                padding: '14px 16px',
                borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                backgroundColor: msg.sender === 'user' ? '#2563eb' : '#ffffff',
                color: msg.sender === 'user' ? '#ffffff' : '#0f172a',
                border: msg.sender === 'user' ? 'none' : '1px solid #bfdbfe',
                fontSize: '13px',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                boxShadow: '0 4px 15px rgba(0,0,0,0.04)'
              }} dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />

              {/* INLINE / REPLY BUTTONS */}
              {msg.buttons && msg.buttons.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px', maxWidth: '100%' }}>
                  {msg.buttons.map((btn, bIdx) => (
                    <button
                      key={bIdx}
                      onClick={() => handleUserClick(btn)}
                      style={{
                        padding: '9px 14px',
                        borderRadius: '12px',
                        border: '1px solid #bfdbfe',
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        fontWeight: '800',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {btn}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CHAT INPUT BAR */}
        <div style={{ padding: '14px 18px', backgroundColor: '#ffffff', borderTop: '1px solid #bfdbfe', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputText.trim()) {
                handleUserClick(inputText);
                setInputText('');
              }
            }}
            placeholder="Buyruq yoki xabar yozing..."
            style={{ flex: 1, padding: '10px 14px', borderRadius: '14px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '13px', outline: 'none' }}
          />
          <button
            onClick={() => {
              if (inputText.trim()) {
                handleUserClick(inputText);
                setInputText('');
              }
            }}
            style={{ padding: '10px 16px', borderRadius: '14px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
          </button>
        </div>
      </div>

      {/* STUDENT QR PASS MODAL */}
      {showQrModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="animate-fade-in" style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '28px', maxWidth: '400px', width: '100%', padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Student QR Pass 📱</h3>
            <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>O'quv markaz darsxonasiga kirish va yo'qlama uchun shaxsiy QR kod</p>
            <div style={{ padding: '16px', border: '3px solid #2563eb', borderRadius: '20px', backgroundColor: '#ffffff' }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=STUDENT_PASS_ALI_VALIYEV_100101`} alt="QR Code" style={{ width: '180px', height: '180px', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              <div style={{ width: '180px', height: '180px', display: 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#0f172a' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#2563eb' }}>qr_code_2</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '8px' }}>100101</span>
              </div>
            </div>
            <p style={{ fontSize: '13px', fontWeight: '800', color: '#2563eb', fontFamily: 'monospace', margin: 0 }}>ID: 100101 • Ali Valiyev</p>
            <button onClick={() => setShowQrModal(false)} style={{ padding: '10px 24px', borderRadius: '14px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: '800', fontSize: '12px', cursor: 'pointer', width: '100%' }}>Yopish</button>
          </div>
        </div>
      )}
    </div>
  );
}
