import React from 'react';
import { Link } from 'react-router-dom';

function TermsAndConditions() {
  const lastUpdated = "2026-yil 1-avgust";

  const styles = {
    container: {
      maxWidth: '900px',
      margin: '0 auto',
      padding: '40px 20px 80px 20px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      color: '#1e293b',
      backgroundColor: '#ffffff',
      lineHeight: '1.7',
    },
    topNav: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
      paddingBottom: '16px',
      borderBottom: '1px solid #e2e8f0',
      flexWrap: 'wrap',
      gap: '12px',
    },
    backLink: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      color: '#2563eb',
      textDecoration: 'none',
      fontWeight: '600',
      fontSize: '14px',
      padding: '8px 16px',
      backgroundColor: '#eff6ff',
      borderRadius: '8px',
      border: '1px solid #bfdbfe',
      transition: 'all 0.2s ease',
    },
    headerBadge: {
      display: 'inline-block',
      padding: '4px 12px',
      backgroundColor: '#eff6ff',
      color: '#2563eb',
      borderRadius: '9999px',
      fontSize: '13px',
      fontWeight: '600',
      border: '1px solid #bfdbfe',
      marginBottom: '12px',
    },
    title: {
      fontSize: '32px',
      fontWeight: '800',
      color: '#0f172a',
      letterSpacing: '-0.5px',
      margin: '0 0 8px 0',
      lineHeight: '1.25',
    },
    subtitle: {
      fontSize: '15px',
      color: '#64748b',
      margin: '0 0 24px 0',
    },
    introCard: {
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderLeft: '4px solid #2563eb',
      borderRadius: '12px',
      padding: '20px 24px',
      marginBottom: '40px',
      fontSize: '15px',
      color: '#334155',
    },
    section: {
      marginBottom: '36px',
      padding: '28px',
      backgroundColor: '#ffffff',
      borderRadius: '14px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    },
    sectionHeading: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '20px',
      fontWeight: '700',
      color: '#0f172a',
      margin: '0 0 16px 0',
      paddingBottom: '12px',
      borderBottom: '1px solid #f1f5f9',
    },
    sectionIcon: {
      fontSize: '22px',
      lineHeight: '1',
    },
    paragraph: {
      fontSize: '15px',
      color: '#334155',
      marginBottom: '14px',
      lineHeight: '1.75',
    },
    list: {
      paddingLeft: '20px',
      margin: '12px 0 16px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    listItem: {
      fontSize: '15px',
      color: '#334155',
      lineHeight: '1.65',
    },
    highlightBox: {
      backgroundColor: '#eff6ff',
      border: '1px solid #bfdbfe',
      borderRadius: '10px',
      padding: '16px 20px',
      marginTop: '16px',
      fontSize: '14px',
      color: '#1e40af',
    },
    contactCard: {
      backgroundColor: '#f8fafc',
      border: '1px solid #bfdbfe',
      borderRadius: '14px',
      padding: '28px',
      marginTop: '40px',
      marginBottom: '32px',
    },
    contactGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '16px',
      marginTop: '16px',
    },
    contactItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      fontSize: '14px',
    },
    contactLabel: {
      fontWeight: '600',
      color: '#64748b',
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    contactValue: {
      color: '#0f172a',
      fontWeight: '500',
    },
    bottomNav: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '32px',
      paddingTop: '24px',
      borderTop: '1px solid #e2e8f0',
      flexWrap: 'wrap',
      gap: '16px',
    },
  };

  return (
    <div style={styles.container}>
      {/* Yuqori navigatsiya */}
      <div style={styles.topNav}>
        <Link to="/" style={styles.backLink}>
          <span>←</span> Bosh sahifaga qaytish
        </Link>
        <span style={{ fontSize: '13px', color: '#64748b' }}>
          Tashkilot: <strong>"Ta'lim Plus" MChJ</strong>
        </span>
      </div>

      {/* Sarlavha qismi */}
      <div style={{ marginBottom: '28px' }}>
        <span style={styles.headerBadge}>Rasmiy huquqiy hujjat</span>
        <h1 style={styles.title}>Foydalanish shartlari va Maxfiylik siyosati</h1>
        <p style={styles.subtitle}>
          So'nggi yangilanish sanasi: <strong>{lastUpdated}</strong>
        </p>
      </div>

      {/* Kirish qismi */}
      <div style={styles.introCard}>
        <strong>Hurmatli foydalanuvchi!</strong> Ushbu hujjat "Ta'lim Plus" o'quv markazi veb-saytidan, axborot tizimlaridan va ta'lim xizmatlaridan foydalanish qoidalari hamda shaxsiy ma'lumotlaringizni himoya qilish tartibini belgilaydi. Biz bilan hamkorlik qilish yoki saytimizda ro'yxatdan o'tish orqali siz mazkur shartlarga rozilik bildirasiz.
      </div>

      {/* 1. Umumiy qoidalar */}
      <section style={styles.section}>
        <h2 style={styles.sectionHeading}>
          <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#2563eb' }}>description</span>
          1. Umumiy qoidalar
        </h2>
        <p style={styles.paragraph}>
          1.1. Mazkur hujjat "Ta'lim Plus" MChJ (keyingi o'rinlarda <strong>"O'quv markazi"</strong> yoki <strong>"Ijrochi"</strong>) hamda markaz xizmatlaridan foydalanuvchi jismoniy shaxs yoki uning qonuniy vakili (keyingi o'rinlarda <strong>"Foydalanuvchi"</strong> yoki <strong>"Tinglovchi"</strong>) o'rtasida tuzilgan ta'lim xizmatlarini ko'rsatish bo'yicha ommaviy oferta hisoblanadi.
        </p>
        <p style={styles.paragraph}>
          1.2. O'quv markazi zamonaviy axborot texnologiyalari (IT), xorijiy tillar, aniq fanlar va kasbiy ko'nikmalarni rivojlantirish yo'nalishlarida sifatli ta'lim, amaliy mashg'ulotlar, diagnostik testlar hamda bepul konsultatsiya xizmatlarini ko'rsatadi.
        </p>
        <p style={styles.paragraph}>
          1.3. Sayt orqali arizani yuborish, konsultatsiyaga yozilish, shaxsiy kabinet ochish yoki ta'lim xizmatlari uchun to'lovni amalga oshirish ushbu shartlarni to'liq, cheklovlarsiz va so'zsiz qabul qilish (aksept) deb hisoblanadi.
        </p>
        <p style={styles.paragraph}>
          1.4. Agar foydalanuvchi 18 yoshga to'lmagan (voyaga yetmagan) bo'lsa, shartnoma shartlari va to'lovlar uning ota-onasi yoki qonuniy vakillari roziligi bilan amalga oshiriladi.
        </p>
      </section>

      {/* 2. Maxfiylik siyosati */}
      <section style={styles.section}>
        <h2 style={styles.sectionHeading}>
          <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#2563eb' }}>lock</span>
          2. Maxfiylik siyosati
        </h2>
        <p style={styles.paragraph}>
          "Ta'lim Plus" o'quv markazi foydalanuvchilarning shaxsiy ma'lumotlari daxlsizligini va xavfsizligini kafolatlaydi.
        </p>
        
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '16px 0 8px 0' }}>
          2.1. Yig'iladigan shaxsiy ma'lumotlar tarkibi:
        </h3>
        <ul style={styles.list}>
          <li style={styles.listItem}><strong>Identifikatsiya ma'lumotlari:</strong> Foydalanuvchining ismi, familiyasi va otasining ismi;</li>
          <li style={styles.listItem}><strong>Bog'lanish ma'lumotlari:</strong> Telefon raqami, elektron pochta manzili (email), Telegram profili;</li>
          <li style={styles.listItem}><strong>Ta'limiy ma'lumotlar:</strong> Qiziqayotgan o'quv kursi, mavjud bilim darajasi, tanlangan dars jadvali;</li>
          <li style={styles.listItem}><strong>Texnik ma'lumotlar:</strong> IP-manzil, foydalanilayotgan brauzer turi, kirish vaqti va tizimdagi harakatlar tarixi.</li>
        </ul>

        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '16px 0 8px 0' }}>
          2.2. Ma'lumotlarni to'plash maqsadlari:
        </h3>
        <ul style={styles.list}>
          <li style={styles.listItem}>Foydalanuvchiga bepul konsultatsiya taqdim etish va uni qiziqtirgan kursga ro'yxatga olish;</li>
          <li style={styles.listItem}>O'quv jarayonini samarali tashkil etish, dars jadvallari, imtihonlar va o'zgarishlar haqida xabar berish;</li>
          <li style={styles.listItem}>To'lov kvitansiyalari, billing hisoblari va shartnoma hujjatlarini rasmiylashtirish;</li>
          <li style={styles.listItem}>Ta'lim sifatini tahlil qilish hamda yangi foydali o'quv materiallarini tavsiya etish.</li>
        </ul>

        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '16px 0 8px 0' }}>
          2.3. Ma'lumotlarni uchinchi shaxslarga bermaslik kafolati:
        </h3>
        <p style={styles.paragraph}>
          Foydalanuvchining shaxsiy ma'lumotlari uning yozma yoki elektron roziligisiz hech qanday tijoriy maqsadlarda uchinchi shaxslarga berilmaydi, ijaraga berilmaydi va sotilmaydi. Ma'lumotlar faqat O'zbekiston Respublikasining amaldagi qonunchiligida nazarda tutilgan hollarda (vakolatli davlat organlarining qonuniy so'roviga asosan) taqdim etilishi mumkin.
        </p>

        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '16px 0 8px 0' }}>
          2.4. Saqlash muddati:
        </h3>
        <p style={styles.paragraph}>
          Shaxsiy ma'lumotlar foydalanuvchi markaz xizmatlaridan foydalanish davrida hamda ta'lim yakunlangach arxiv va buxgalteriya hisobi qonunlarida belgilangan muddat davomida yoki foydalanuvchi ma'lumotlarni o'chirish bo'yicha so'rov yuborguniga qadar saqlanadi.
        </p>
      </section>

      {/* 3. Xavfsizlik choralari */}
      <section style={styles.section}>
        <h2 style={styles.sectionHeading}>
          <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#2563eb' }}>shield</span>
          3. Xavfsizlik choralari
        </h2>
        <p style={styles.paragraph}>
          "Ta'lim Plus" axborot tizimlarida foydalanuvchilar ma'lumotlarini ruxsatsiz kirish, o'zgartirish, yo'qotish yoki oshkor qilishdan himoyalash uchun zamonaviy xalqaro xavfsizlik standartlari qo'llaniladi:
        </p>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <strong>SSL/TLS Shifrlash:</strong> Veb-saytimiz va serverlarimiz o'rtasidagi barcha aloqa va tranzaksiyalar 256-bitli xavfsiz SSL/TLS protokollari orqali himoyalangan.
          </li>
          <li style={styles.listItem}>
            <strong>Ma'lumotlar bazasi xavfsizligi:</strong> Maxfiy yozuvlar va foydalanuvchi parollari kuchli bir tomonlama xesh algoritmlari (bcrypt) bilan shifrlanadi. Tizim ma'lumotlari har kuni avtomatik zaxira nusxalash (backup) tizimi orqali himoyalanadi.
          </li>
          <li style={styles.listItem}>
            <strong>Ruxsatlarni qat'iy nazorat qilish (RBAC):</strong> Shaxsiy ma'lumotlarga faqat xizmat vazifasini bajaruvchi vakolatli xodimlar roli bo'yicha cheklangan darajada kira oladi.
          </li>
          <li style={styles.listItem}>
            <strong>Muntazam xavfsizlik auditi:</strong> Server infratuzilmasi va dasturiy ta'minot yuzaga kelishi mumkin bo'lgan zaifliklarni aniqlash uchun muntazam texnik sinovlar va xavfsizlik auditidan o'tkaziladi.
          </li>
        </ul>
      </section>

      {/* 4. Shaxsiy ma'lumotlarni qayta ishlash */}
      <section style={styles.section}>
        <h2 style={styles.sectionHeading}>
          <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#2563eb' }}>person</span>
          4. Shaxsiy ma'lumotlarni qayta ishlash va foydalanuvchi huquqlari
        </h2>
        <p style={styles.paragraph}>
          <strong>Huquqiy asos:</strong> Shaxsiy ma'lumotlarni qayta ishlash O'zbekiston Respublikasining "Shaxsiy ma'lumotlar to'g'risida"gi Qonuni (O'RQ-547-son) talablariga muvofiq, foydalanuvchining ixtiyoriy ravishda bergan roziligi asosida amalga oshiriladi.
        </p>
        <p style={styles.paragraph}>
          <strong>Foydalanuvchining huquqlari:</strong>
        </p>
        <ul style={styles.list}>
          <li style={styles.listItem}>O'zining qaysi ma'lumotlari qayta ishlanayotganligi haqida to'liq ma'lumot olish;</li>
          <li style={styles.listItem}>Noto'g'ri, to'liq bo'lmagan yoki eskirgan ma'lumotlarga aniqlik kiritish yoki o'zgartirish;</li>
          <li style={styles.listItem}>O'z shaxsiy ma'lumotlarini qayta ishlashga berilgan rozilikni istalgan vaqtda bekor qilish va ma'lumotlarni o'chirishni talab qilish.</li>
        </ul>
        <div style={styles.highlightBox}>
          <strong>Ma'lumotlarni o'chirish tartibi:</strong> Agar siz o'z shaxsiy ma'lumotlaringizni tizimimizdan to'liq o'chirib tashlashni istasangiz, rasmiy elektron pochtamizga (<strong>info@talimplus.uz</strong>) yoki telefon raqamimizga (<strong>+998 90 123 45 67</strong>) so'rov yuborishingiz kifoya. Murojaatingiz 3 (uch) ish kuni ichida ko'rib chiqiladi va barcha yozuvlar qayta tiklanmaydigan qilib o'chiriladi.
        </div>
      </section>

      {/* 5. Bepul konsultatsiya shartlari */}
      <section style={styles.section}>
        <h2 style={styles.sectionHeading}>
          <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#2563eb' }}>lightbulb</span>
          5. Bepul konsultatsiya shartlari
        </h2>
        <p style={styles.paragraph}>
          "Ta'lim Plus" ta'lim markazi har bir yangi o'quvchiga o'z maqsadlariga to'g'ri yo'nalish tanlashi uchun bepul maslahat xizmatini taqdim etadi.
        </p>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <strong>Konsultatsiya tarkibi:</strong> O'quvchining qiziqishlari va maqsadlarini tahlil qilish, bepul daraja aniqlash testi (Placement test), o'quv dasturlari va o'qituvchilar malakasi bilan tanishtirish.
          </li>
          <li style={styles.listItem}>
            <strong>Javob berish muddati:</strong> Veb-sayt orqali qoldirilgan barcha arizalar <strong>24 soat</strong> ichida malakali ma'murlarimiz tomonidan ko'rib chiqiladi va ko'rsatilgan raqamga qo'ng'iroq qilinadi.
          </li>
          <li style={styles.listItem}>
            <strong>Majburiyat yuklamasligi:</strong> Bepul konsultatsiya yoki sinov darsida qatnashish foydalanuvchiga kurslarni xarid qilish yoki o'qishni boshlash bo'yicha hech qanday moliyaviy majburiyat yuklamaydi.
          </li>
          <li style={styles.listItem}>
            <strong>Aloqa vositalari:</strong> Konsultatsiya telefon orqali, Telegram orqali yoki to'g'ridan-to'g'ri o'quv markazimiz binosida yuzma-yuz shaklda o'tkaziladi.
          </li>
        </ul>
      </section>

      {/* 6. To'lov shartlari */}
      <section style={styles.section}>
        <h2 style={styles.sectionHeading}>
          <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#2563eb' }}>credit_card</span>
          6. To'lov shartlari va qaytarish siyosati
        </h2>
        <p style={styles.paragraph}>
          6.1. <strong>Qabul qilinadigan to'lov usullari:</strong> O'quv kurslari uchun to'lovlar Payme, Click, Uzum Bank milliy to'lov ilovalari, rasmiy bank hisob raqamiga o'tkazma yoki markaz ma'muriyatida naqd pul va bank kartalari (Uzcard / Humo / Visa) orqali amalga oshiriladi.
        </p>
        <p style={styles.paragraph}>
          6.2. <strong>Narxlar shaffofligi:</strong> Barcha kurslar narxlari O'zbekiston Respublikasi milliy valyutasi (so'm)da qat'iy ko'rsatiladi. Hech qanday yashirin komissiyalar yoki kutilmagan qo'shimcha to'lovlar olinmaydi.
        </p>
        <p style={styles.paragraph}>
          6.3. <strong>Mablag'larni qaytarish siyosati (Refund policy):</strong>
        </p>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            Agar o'quvchi kursning dastlabki 2 ta darsida qatnashib, ta'lim metodikasi yoki sifatidan qoniqmasa, yozma ariza asosida to'langan summaning <strong>100 foizi</strong> to'liq qaytarib beriladi.
          </li>
          <li style={styles.listItem}>
            O'quv oyi davomida uzrli sabablarga ko'ra (salomatlik, safar) o'qish to'xtatilgan taqdirda, o'tilmagan darslar uchun mablag' keyingi oylarga ko'chiriladi yoki qoldiq summa foydalanuvchiga qaytariladi.
          </li>
        </ul>
      </section>

      {/* 7. Mas'uliyat chegaralari */}
      <section style={styles.section}>
        <h2 style={styles.sectionHeading}>
          <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#2563eb' }}>gavel</span>
          7. Mas'uliyat chegaralari
        </h2>
        <p style={styles.paragraph}>
          7.1. O'quv markazi darslarni yuqori professional darajada tashkil etish, malakali pedagoglarni jalb qilish va zarur o'quv materiallari bilan ta'minlash majburiyatini oladi. Biroq, o'quvchining yakuniy natijasi uning shaxsiy tirishqoqligi, darslarga qatnashishi va topshiriqlarni mustaqil bajarishiga bog'liq.
        </p>
        <p style={styles.paragraph}>
          7.2. O'quv markazi fors-major holatlar (tabiiy ofatlar, davlat miqyosidagi telekommunikatsiya uzilishlari, rasmiy cheklovlar) tufayli mashg'ulotlar vaqtincha kechikkan hollarda javobgar hisoblanmaydi, ammo darslarning to'liq hajmda o'tilishini boshqa qulay vaqtlarga ko'chirish orqali ta'minlaydi.
        </p>
        <p style={styles.paragraph}>
          7.3. Foydalanuvchi ro'yxatdan o'tishda kiritilgan ma'lumotlarning aniqligi va o'z shaxsiy hisobiga kirish ma'lumotlarini boshqalarga bermaslik uchun shaxsan javobgardir.
        </p>
      </section>

      {/* 8. Nizolarni hal qilish */}
      <section style={styles.section}>
        <h2 style={styles.sectionHeading}>
          <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#2563eb' }}>handshake</span>
          8. Nizolarni hal qilish
        </h2>
        <p style={styles.paragraph}>
          8.1. Mazkur shartlar va ta'lim xizmatlarini ko'rsatish jarayonida yuzaga keladigan barcha kelishmovchiliklar eng avvalo tomonlarning o'zaro konstruktiv muloqoti va muzokaralari yo'li bilan hal qilinadi.
        </p>
        <p style={styles.paragraph}>
          8.2. Muzokaralar orqali murosaga erishilmagan taqdirda, nizolar O'zbekiston Respublikasining amaldagi qonunchiligiga muvofiq tegishli tuman yoki shahar fuqarolik/iqtisodiy sudlarida ko'rib chiqiladi.
        </p>
      </section>

      {/* 9. Shartlarga o'zgartirishlar kiritish */}
      <section style={styles.section}>
        <h2 style={styles.sectionHeading}>
          <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#2563eb' }}>update</span>
          9. O'zgartirishlar kiritish tartibi
        </h2>
        <p style={styles.paragraph}>
          9.1. "Ta'lim Plus" MChJ qonunchilikka kiritilgan o'zgartirishlar, yangi xizmat turlarining joriy etilishi yoki texnik takomillashtirishlar munosabati bilan ushbu Shartlarga bir tomonlama tartibda o'zgartirish va qo'shimchalar kiritish huquqini o'zida saqlab qoladi.
        </p>
        <p style={styles.paragraph}>
          9.2. Shartlarning yangi tahriri ushbu sahifada e'lon qilingan paytdan boshlab rasman kuchga kiradi. Foydalanuvchilar o'zgarishlar bilan muntazam tanishib borishlari tavsiya etiladi.
        </p>
      </section>

      {/* Aloqa va rekvizitlar */}
      <div style={styles.contactCard}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#2563eb' }}>corporate_fare</span>
          Bog'lanish va rekvizitlar
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#475569' }}>
          Shartlar yoki maxfiylik siyosati yuzasidan savollaringiz bo'lsa, quyidagi aloqa kanallari orqali biz bilan bog'lanishingiz mumkin:
        </p>
        <div style={styles.contactGrid}>
          <div style={styles.contactItem}>
            <span style={styles.contactLabel}>Tashkilot nomi</span>
            <span style={styles.contactValue}>"Ta'lim Plus" MChJ</span>
          </div>
          <div style={styles.contactItem}>
            <span style={styles.contactLabel}>Yuridik manzil</span>
            <span style={styles.contactValue}>Toshkent shahri, Yunusobod tumani, Amir Temur ko'chasi 12-uy</span>
          </div>
          <div style={styles.contactItem}>
            <span style={styles.contactLabel}>Telefon raqam</span>
            <a href="tel:+998901234567" style={{ ...styles.contactValue, color: '#2563eb', textDecoration: 'none' }}>
              +998 90 123 45 67
            </a>
          </div>
          <div style={styles.contactItem}>
            <span style={styles.contactLabel}>Elektron pochta</span>
            <a href="mailto:info@talimplus.uz" style={{ ...styles.contactValue, color: '#2563eb', textDecoration: 'none' }}>
              info@talimplus.uz
            </a>
          </div>
          <div style={styles.contactItem}>
            <span style={styles.contactLabel}>Ish tartibi</span>
            <span style={styles.contactValue}>Dushanba - Shanba, 09:00 - 20:00</span>
          </div>
        </div>
      </div>

      {/* Quyi navigatsiya */}
      <div style={styles.bottomNav}>
        <Link to="/" style={styles.backLink}>
          <span>←</span> Bosh sahifaga qaytish
        </Link>
        <span style={{ fontSize: '13px', color: '#64748b' }}>
          © {new Date().getFullYear()} "Ta'lim Plus" MChJ. Barcha huquqlar himoyalangan.
        </span>
      </div>
    </div>
  );
}

export default TermsAndConditions;
