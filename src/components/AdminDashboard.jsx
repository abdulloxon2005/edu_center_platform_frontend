import React, { useState, useEffect } from 'react';
import { usersAPI, financeAPI, attendanceAPI, analyticsAPI, coursesAPI, groupsAPI, certificatesAPI, reportsAPI, crmAPI } from '../api';

const KpiCard = ({ title, value, change, icon }) => (
  <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#64748b', margin: '0 0 8px 0' }}>{title}</h4>
        <p style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: 0 }}>{value}</p>
      </div>
      <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{icon}</span>
      </div>
    </div>
    <div style={{ fontSize: '13px', fontWeight: '800', color: '#1d4ed8', backgroundColor: '#eff6ff', padding: '6px 12px', borderRadius: '8px', display: 'inline-flex', alignSelf: 'flex-start' }}>
      {change}
    </div>
  </div>
);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationToast, setNotificationToast] = useState('');

  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, activeStudents: 0, activeTeachers: 0, debtorsCount: 0 });
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [payments, setPayments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [exams, setExams] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [debtorsList, setDebtorsList] = useState([]);
  const [billingMonth, setBillingMonth] = useState(new Date().toISOString().slice(0, 7));
  const [generatingBilling, setGeneratingBilling] = useState(false);
  const [attendanceFilterGroup, setAttendanceFilterGroup] = useState('ALL');

  // Leads / Konsultatsiya so'rovlari
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsFilterStatus, setLeadsFilterStatus] = useState('ALL');
  const [leadsSearch, setLeadsSearch] = useState('');

  // Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editUserModal, setEditUserModal] = useState(null);
  const [userSubmitting, setUserSubmitting] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [selectedStudentForFreeze, setSelectedStudentForFreeze] = useState(null);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [uSearch, setUSearch] = useState('');
  
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [editCourseModal, setEditCourseModal] = useState(null);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState(null);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [editGroupModal, setEditGroupModal] = useState(null);
  const [selectedGroupDetail, setSelectedGroupDetail] = useState(null);
  const [showAssignStudentModal, setShowAssignStudentModal] = useState(false);
  const [assignSelectedGroupId, setAssignSelectedGroupId] = useState(null);
  const [assignSelectedStudentId, setAssignSelectedStudentId] = useState(null);
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignTariffType, setAssignTariffType] = useState('STANDART');
  const [assignCustomPrice, setAssignCustomPrice] = useState('');
  const [assignDiscountNote, setAssignDiscountNote] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProRataModal, setShowProRataModal] = useState(false);
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);

  // Smart Tariff & Payment Calculator States
  const [calcMonthlyFee, setCalcMonthlyFee] = useState(500000);
  const [calcTariffType, setCalcTariffType] = useState('STANDART');
  const [calcTotalLessons, setCalcTotalLessons] = useState(12);
  const [calcRemainingLessons, setCalcRemainingLessons] = useState(6);
  const [calcCustomPrice, setCalcCustomPrice] = useState('');
  const [calcSelectedStudent, setCalcSelectedStudent] = useState(null);
  const [calcSelectedCourse, setCalcSelectedCourse] = useState(null);
  const [calcDiscountNote, setCalcDiscountNote] = useState('');

  // Tariff Edit for existing student in group modal
  const [tariffEditModal, setTariffEditModal] = useState(null); // { group_id, student_id, student_name, current_tariff, current_price, current_note }

  // Enhanced Payment States
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState(null);
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('');
  const [paymentBillingInfo, setPaymentBillingInfo] = useState(null);
  const [paymentBillingLoading, setPaymentBillingLoading] = useState(false);
  const [paymentAmountVal, setPaymentAmountVal] = useState('');
  const [paymentMonthVal, setPaymentMonthVal] = useState(new Date().toISOString().slice(0, 7));
  const [paymentMethodVal, setPaymentMethodVal] = useState('CASH');
  const [paymentNoteVal, setPaymentNoteVal] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [editPaymentModal, setEditPaymentModal] = useState(null);
  const [editPaymentSubmitting, setEditPaymentSubmitting] = useState(false);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState(null);

  const normalizePhone = (phoneStr) => {
    if (!phoneStr) return null;
    let cleaned = phoneStr.trim().replace(/[^\d+]/g, '');
    if (!cleaned || cleaned === '+') return null;
    let digits = cleaned.replace(/\+/g, '');
    if (digits.length === 9) {
      return `+998${digits}`;
    }
    if (digits.length === 12 && digits.startsWith('998')) {
      return `+${digits}`;
    }
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    return `+${digits}`;
  };

  const handleSelectStudentForPayment = async (student, month = paymentMonthVal) => {
    setSelectedStudentForPayment(student);
    setPaymentBillingLoading(true);
    try {
      const info = await financeAPI.getStudentBillingInfo(student.id, month);
      setPaymentBillingInfo(info);
      if (info.month_remaining_due > 0) {
        setPaymentAmountVal(info.month_remaining_due);
      } else if (info.month_amount_paid > 0 && info.month_remaining_due === 0) {
        setPaymentAmountVal('');
      } else if (info.total_monthly_fee > 0) {
        setPaymentAmountVal(info.total_monthly_fee);
      } else {
        setPaymentAmountVal('');
      }
    } catch(err) {
      console.error(err);
    }
    setPaymentBillingLoading(false);
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm("Haqiqatan ham ushbu to'lovni o'chirmoqchimisiz? O'chirilgandan so'ng tegishli oy hisob-kitobi va qarzdorlik qayta hisoblanadi.")) {
      return;
    }
    try {
      await financeAPI.deletePayment(paymentId);
      setPayments(prev => prev.filter(p => p.id !== paymentId));
      triggerNotification("To'lov muvaffaqiyatli o'chirildi! 🗑️");
      const [st, debts] = await Promise.all([
        financeAPI.getDashboardStats().catch(() => null),
        financeAPI.getDebtors().catch(() => [])
      ]);
      if (Array.isArray(debts)) {
        setDebtorsList(debts);
      }
      if (st) {
        setStats(prev => ({
          ...prev,
          totalIncome: st.total_income || 0,
          totalExpense: st.total_expense || 0,
          debtorsCount: Array.isArray(debts) ? debts.length : 0
        }));
      }
    } catch(err) {
      triggerNotification("To'lovni o'chirishda xatolik yuz berdi");
    }
  };

  // Admin Exam & Certificate States
  const [adminExamTab, setAdminExamTab] = useState('exams'); // 'exams' or 'certificates'
  const [examSearchText, setExamSearchText] = useState('');
  const [certSearchText, setCertSearchText] = useState('');
  const [adminExamResultsModal, setAdminExamResultsModal] = useState(null);
  const [adminExamResultsList, setAdminExamResultsList] = useState([]);
  const [adminResultsLoading, setAdminResultsLoading] = useState(false);
  const [adminOfflineModal, setAdminOfflineModal] = useState(null);
  const [adminOfflineStudents, setAdminOfflineStudents] = useState([]);
  const [adminOfflineScores, setAdminOfflineScores] = useState({});
  const [adminOfflineFeedbacks, setAdminOfflineFeedbacks] = useState({});
  const [adminOfflineSaving, setAdminOfflineSaving] = useState(false);
  const [adminCertPreviewModal, setAdminCertPreviewModal] = useState(null);

  // Admin Attendance & Group Journal States
  const [groupsAttendanceSummary, setGroupsAttendanceSummary] = useState([]);
  const [selectedAttendanceGroup, setSelectedAttendanceGroup] = useState(null);
  const [groupJournalData, setGroupJournalData] = useState(null);
  const [groupJournalLoading, setGroupJournalLoading] = useState(false);
  const [attendanceSearchQuery, setAttendanceSearchQuery] = useState('');
  const [showAdminAddLessonModal, setShowAdminAddLessonModal] = useState(false);
  const [adminAddLessonDate, setAdminAddLessonDate] = useState(new Date().toISOString().slice(0, 10));
  const [adminAddLessonTopic, setAdminAddLessonTopic] = useState('');
  const [adminAddLessonSaving, setAdminAddLessonSaving] = useState(false);
  const [adminMarkModalLesson, setAdminMarkModalLesson] = useState(null);
  const [adminMarkStatusMap, setAdminMarkStatusMap] = useState({});
  const [adminMarkNoteMap, setAdminMarkNoteMap] = useState({});
  const [adminMarkSaving, setAdminMarkSaving] = useState(false);
  
  // Reports State
  const [reportPeriodType, setReportPeriodType] = useState('monthly'); // 'monthly' | 'yearly' | 'custom'
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportStartDate, setReportStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10));
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportActiveSubTab, setReportActiveSubTab] = useState('overview'); // 'overview' | 'courses' | 'teachers' | 'payments' | 'expenses'
  const [reportDownloading, setReportDownloading] = useState(null); // 'excel' | 'pdf' | 'docx' | null
  const [reportPaymentSearch, setReportPaymentSearch] = useState('');
  const [reportExpenseSearch, setReportExpenseSearch] = useState('');

  const fetchReportData = async (pType = reportPeriodType, yr = reportYear, mo = reportMonth, sDate = reportStartDate, eDate = reportEndDate) => {
    setReportLoading(true);
    try {
      const params = {
        period_type: pType,
        year: yr,
        month: mo,
        start_date: sDate,
        end_date: eDate
      };
      const res = await reportsAPI.getSummary(params);
      setReportData(res);
    } catch(err) {
      console.error(err);
      triggerNotification("Hisobot ma'lumotlarini yuklashda xatolik yuz berdi");
    }
    setReportLoading(false);
  };

  const handleDownloadReport = async (format) => {
    setReportDownloading(format);
    try {
      const params = {
        period_type: reportPeriodType,
        year: reportYear,
        month: reportMonth,
        start_date: reportStartDate,
        end_date: reportEndDate
      };
      if (format === 'excel') {
        await reportsAPI.downloadExcel(params);
        triggerNotification("Excel hisobot muvaffaqiyatli yuklab olindi! 📥");
      } else if (format === 'pdf') {
        await reportsAPI.downloadPdf(params);
        triggerNotification("PDF hisobot muvaffaqiyatli yuklab olindi! 📄");
      } else if (format === 'docx') {
        await reportsAPI.downloadDocx(params);
        triggerNotification("Word hisobot muvaffaqiyatli yuklab olindi! 📝");
      }
    } catch(err) {
      console.error(err);
      triggerNotification("Hisobotni yuklab olishda xatolik yuz berdi");
    }
    setReportDownloading(null);
  };

  const handleOpenGroupJournal = async (group) => {
    setSelectedAttendanceGroup(group);
    setGroupJournalLoading(true);
    try {
      const journal = await attendanceAPI.getGroupJournal(group.group_id || group.id);
      setGroupJournalData(journal);
    } catch(err) {
      console.error(err);
      triggerNotification("Guruh davomat jurnalini yuklashda xatolik yuz berdi");
    }
    setGroupJournalLoading(false);
  };

  const handleOpenMarkModal = (lesson) => {
    setAdminMarkModalLesson(lesson);
    const initialStatus = {};
    const initialNotes = {};
    if (groupJournalData && groupJournalData.students) {
      groupJournalData.students.forEach(s => {
        const existing = groupJournalData.matrix?.[String(s.id)]?.[String(lesson.id)];
        initialStatus[s.id] = existing ? existing.status : 'PRESENT';
        initialNotes[s.id] = existing ? (existing.note || '') : '';
      });
    }
    setAdminMarkStatusMap(initialStatus);
    setAdminMarkNoteMap(initialNotes);
  };

  const handleSaveMarkAttendance = async (e) => {
    e.preventDefault();
    if (!adminMarkModalLesson || !groupJournalData) return;
    setAdminMarkSaving(true);
    try {
      const attendancesPayload = groupJournalData.students.map(s => ({
        student_id: s.id,
        status: adminMarkStatusMap[s.id] || 'PRESENT',
        note: adminMarkNoteMap[s.id] || null
      }));

      await attendanceAPI.markAttendance({
        lesson_id: adminMarkModalLesson.id,
        attendances: attendancesPayload
      });

      triggerNotification("Davomat muvaffaqiyatli saqlandi! ✅");
      setAdminMarkModalLesson(null);
      const [journal, gSum] = await Promise.all([
        attendanceAPI.getGroupJournal(selectedAttendanceGroup.group_id || selectedAttendanceGroup.id),
        attendanceAPI.getGroupsSummary().catch(() => [])
      ]);
      if (journal) setGroupJournalData(journal);
      if (Array.isArray(gSum)) setGroupsAttendanceSummary(gSum);
    } catch(err) {
      triggerNotification("Davomatni saqlashda xatolik yuz berdi");
    }
    setAdminMarkSaving(false);
  };

  const handleCreateLessonAndOpenJournal = async (e) => {
    e.preventDefault();
    if (!selectedAttendanceGroup) return;
    setAdminAddLessonSaving(true);
    try {
      const newLesson = await attendanceAPI.createLesson({
        group_id: selectedAttendanceGroup.group_id || selectedAttendanceGroup.id,
        lesson_date: adminAddLessonDate,
        topic: adminAddLessonTopic || null
      });
      triggerNotification(`Dars sanasi qo'shildi (${adminAddLessonDate})! ✅`);
      setShowAdminAddLessonModal(false);
      setAdminAddLessonTopic('');
      const journal = await attendanceAPI.getGroupJournal(selectedAttendanceGroup.group_id || selectedAttendanceGroup.id);
      setGroupJournalData(journal);
      handleOpenMarkModal(newLesson);
    } catch(err) {
      triggerNotification("Dars sanasini yaratishda xatolik yuz berdi");
    }
    setAdminAddLessonSaving(false);
  };
  
  const adminName = localStorage.getItem('full_name') || 'Administrator';

  const triggerNotification = (msg) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(''), 4000);
  };

  const fetchLeads = async () => {
    setLeadsLoading(true);
    try {
      const data = await crmAPI.getLeads();
      if (Array.isArray(data)) setLeads(data);
    } catch (e) {
      setLeads([]);
    }
    setLeadsLoading(false);
  };

  const fetchData = async () => {
    try {
      const u = await usersAPI.getUsers();
      if(Array.isArray(u)) setUsers(u);
    } catch(e) {
      setUsers([]);
    }

    try {
      const c = await coursesAPI.getCourses();
      if(Array.isArray(c)) setCourses(c);
    } catch(e) {
      setCourses([]);
    }

    try {
      const g = await groupsAPI.getGroups();
      if(Array.isArray(g)) setGroups(g);
    } catch(e) {
      setGroups([]);
    }

    try {
      const r = await coursesAPI.getRooms();
      if(Array.isArray(r)) setRooms(r);
    } catch(e) {
      setRooms([]);
    }

    try {
      const p = await financeAPI.getPayments();
      if(Array.isArray(p)) setPayments(p);
    } catch(e) {
      setPayments([]);
    }

    try {
      const ex = await analyticsAPI.getExams();
      if(Array.isArray(ex)) setExams(ex);
    } catch(e) {
      setExams([]);
    }

    try {
      const certs = await certificatesAPI.getCertificates();
      if(Array.isArray(certs)) setCertificates(certs);
    } catch(e) {
      setCertificates([]);
    }

    try {
      const debts = await financeAPI.getDebtors();
      if(Array.isArray(debts)) setDebtorsList(debts);
    } catch(e) {
      setDebtorsList([]);
    }

    try {
      const st = await financeAPI.getDashboardStats();
      let debtors = [];
      try { debtors = await financeAPI.getDebtors(); } catch(e) { debtors = []; }
      if(st) {
        setStats({
          totalIncome: st.total_income || 0,
          totalExpense: st.total_expense || 0,
          activeStudents: st.active_students || 0,
          activeTeachers: st.active_teachers || 0,
          debtorsCount: Array.isArray(debtors) ? debtors.length : 0
        });
      }
    } catch(e) {
      setStats({ totalIncome: 0, totalExpense: 0, activeStudents: 0, activeTeachers: 0, debtorsCount: 0 });
    }

    try {
      const att = await attendanceAPI.getAllAttendances();
      if(Array.isArray(att)) setAttendances(att);
    } catch(e) {
      setAttendances([]);
    }

    try {
      const gSum = await attendanceAPI.getGroupsSummary();
      if(Array.isArray(gSum)) setGroupsAttendanceSummary(gSum);
    } catch(e) {
      setGroupsAttendanceSummary([]);
    }

    setSchedules([]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'reports' && !reportData) {
      fetchReportData();
    }
    if (activeTab === 'leads' && leads.length === 0) {
      fetchLeads();
    }
  }, [activeTab]);

  const handleUpdateLeadStatus = async (leadId, newStatus, notes = null) => {
    try {
      const res = await crmAPI.updateLeadStatus(leadId, newStatus, notes);
      triggerNotification(res.message || "Lead holati yangilandi!");
      if (res.new_login_id) {
        triggerNotification(`O'quvchi yaratildi! Login: ${res.new_login_id}, Parol: ${res.temp_password}`);
      }
      await fetchLeads();
    } catch (e) {
      triggerNotification("Lead holatini yangilashda xatolik!");
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm("Bu konsultatsiya so'rovini o'chirishni xohlaysizmi?")) return;
    try {
      await crmAPI.deleteLead(leadId);
      triggerNotification("So'rov muvaffaqiyatli o'chirildi!");
      setLeads(prev => prev.filter(l => l.id !== leadId));
    } catch (e) {
      triggerNotification("O'chirishda xatolik yuz berdi!");
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'leads', label: 'Konsultatsiyalar', icon: 'contact_mail' },
    { id: 'reports', label: 'Hisobotlar', icon: 'summarize' },
    { id: 'users', label: 'Foydalanuvchilar', icon: 'group' },
    { id: 'courses', label: 'Fanlar', icon: 'auto_stories' },
    { id: 'groups', label: 'Guruhlar', icon: 'groups' },
    { id: 'payments', label: 'To\'lovlar', icon: 'payments' },
    { id: 'schedule', label: 'Dars Jadvallari', icon: 'calendar_month' },
    { id: 'exams', label: 'Imtihon Natijalari', icon: 'quiz' },
    { id: 'attendance', label: 'Davomat', icon: 'fact_check' }
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const renderLeads = () => {
    const statusLabels = {
      'NEW': { label: 'Yangi', color: '#2563eb', bg: '#eff6ff' },
      'CONTACTED': { label: 'Bog\'lanildi', color: '#d97706', bg: '#fffbeb' },
      'TRIAL_SCHEDULED': { label: 'Sinov belgilandi', color: '#7c3aed', bg: '#f5f3ff' },
      'ENROLLED': { label: 'Ro\'yxatdan o\'tdi', color: '#059669', bg: '#ecfdf5' },
      'REJECTED': { label: 'Rad etildi', color: '#dc2626', bg: '#fef2f2' }
    };

    const filteredLeads = leads.filter(l => {
      const matchesStatus = leadsFilterStatus === 'ALL' || l.status === leadsFilterStatus;
      const matchesSearch = leadsSearch === '' ||
        (l.full_name || '').toLowerCase().includes(leadsSearch.toLowerCase()) ||
        (l.phone || '').includes(leadsSearch);
      return matchesStatus && matchesSearch;
    });

    const newCount = leads.filter(l => l.status === 'NEW').length;
    const contactedCount = leads.filter(l => l.status === 'CONTACTED').length;
    const enrolledCount = leads.filter(l => l.status === 'ENROLLED').length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: '0 0 4px 0' }}>Konsultatsiya So'rovlari</h2>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Saytdan kelgan bepul konsultatsiya so'rovlari</p>
          </div>
          <button onClick={fetchLeads} disabled={leadsLoading} style={{
            padding: '10px 20px', borderRadius: '12px', border: '1px solid #bfdbfe',
            backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: '800', fontSize: '14px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
            {leadsLoading ? 'Yuklanmoqda...' : 'Yangilash'}
          </button>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <KpiCard title="Jami so'rovlar" value={leads.length} change="Barcha so'rovlar" icon="inbox" />
          <KpiCard title="Yangi (kutilmoqda)" value={newCount} change="Javob berilmagan" icon="mark_email_unread" />
          <KpiCard title="Bog'lanildi" value={contactedCount} change="Jarayonda" icon="phone_in_talk" />
          <KpiCard title="Ro'yxatdan o'tdi" value={enrolledCount} change="Muvaffaqiyatli" icon="how_to_reg" />
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center',
          padding: '16px 20px', backgroundColor: '#ffffff', borderRadius: '16px',
          border: '1px solid #bfdbfe'
        }}>
          {['ALL', 'NEW', 'CONTACTED', 'TRIAL_SCHEDULED', 'ENROLLED', 'REJECTED'].map(s => (
            <button key={s} onClick={() => setLeadsFilterStatus(s)} style={{
              padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              fontWeight: '800', fontSize: '13px',
              backgroundColor: leadsFilterStatus === s ? '#2563eb' : '#f1f5f9',
              color: leadsFilterStatus === s ? '#ffffff' : '#475569'
            }}>
              {s === 'ALL' ? 'Barchasi' : statusLabels[s]?.label || s}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc',
            padding: '8px 14px', borderRadius: '10px', border: '1px solid #e2e8f0'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#94a3b8' }}>search</span>
            <input type="text" placeholder="Ism yoki telefon..." value={leadsSearch}
              onChange={e => setLeadsSearch(e.target.value)}
              style={{ border: 'none', background: 'none', outline: 'none', fontSize: '13px', width: '160px' }}
            />
          </div>
        </div>

        {/* Loading */}
        {leadsLoading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', animation: 'spin 1s linear infinite' }}>progress_activity</span>
            <p>Yuklanmoqda...</p>
          </div>
        )}

        {/* Table */}
        {!leadsLoading && (
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #bfdbfe',
            overflow: 'hidden', boxShadow: '0 4px 20px rgba(37,99,235,0.06)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>#</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>F.I.O</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Telefon</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Fan</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Holat</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Sana</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Izoh</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, idx) => {
                  const st = statusLabels[lead.status] || { label: lead.status, color: '#475569', bg: '#f1f5f9' };
                  const courseName = lead.course_id ? (courses.find(c => c.id === lead.course_id)?.title || `#${lead.course_id}`) : '—';
                  const createdAt = lead.created_at ? new Date(lead.created_at).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

                  return (
                    <tr key={lead.id} style={{
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: lead.status === 'NEW' ? '#fefce8' : '#ffffff',
                      transition: 'background 0.2s'
                    }}>
                      <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '13px', fontWeight: '700' }}>{idx + 1}</td>
                      <td style={{ padding: '14px 16px', fontWeight: '800', color: '#0f172a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            backgroundColor: st.bg, color: st.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: '900', fontSize: '14px'
                          }}>
                            {(lead.full_name || '?').charAt(0).toUpperCase()}
                          </div>
                          {lead.full_name}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <a href={`tel:${lead.phone}`} style={{ color: '#2563eb', fontWeight: '700', fontSize: '13px' }}>{lead.phone}</a>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: '13px' }}>{courseName}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800',
                          backgroundColor: st.bg, color: st.color
                        }}>
                          {st.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px' }}>{createdAt}</td>
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lead.notes || '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          {lead.status === 'NEW' && (
                            <button onClick={() => handleUpdateLeadStatus(lead.id, 'CONTACTED')} title="Bog'lanildi deb belgilash" style={{
                              padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                              backgroundColor: '#fffbeb', color: '#d97706', fontWeight: '800', fontSize: '11px',
                              display: 'flex', alignItems: 'center', gap: '4px'
                            }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>call</span> Bog'lanish
                            </button>
                          )}
                          {(lead.status === 'NEW' || lead.status === 'CONTACTED') && (
                            <button onClick={() => handleUpdateLeadStatus(lead.id, 'TRIAL_SCHEDULED')} title="Sinov darsini belgilash" style={{
                              padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                              backgroundColor: '#f5f3ff', color: '#7c3aed', fontWeight: '800', fontSize: '11px',
                              display: 'flex', alignItems: 'center', gap: '4px'
                            }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>event</span> Sinov
                            </button>
                          )}
                          {lead.status !== 'ENROLLED' && lead.status !== 'REJECTED' && (
                            <button onClick={() => handleUpdateLeadStatus(lead.id, 'ENROLLED')} title="O'quvchi sifatida ro'yxatdan o'tkazish" style={{
                              padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                              backgroundColor: '#ecfdf5', color: '#059669', fontWeight: '800', fontSize: '11px',
                              display: 'flex', alignItems: 'center', gap: '4px'
                            }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>person_add</span> Qabul
                            </button>
                          )}
                          {lead.status !== 'ENROLLED' && lead.status !== 'REJECTED' && (
                            <button onClick={() => handleUpdateLeadStatus(lead.id, 'REJECTED', 'Admin tomonidan rad etildi')} title="Rad etish" style={{
                              padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                              backgroundColor: '#fef2f2', color: '#dc2626', fontWeight: '800', fontSize: '11px',
                              display: 'flex', alignItems: 'center', gap: '4px'
                            }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                            </button>
                          )}
                          <button onClick={() => handleDeleteLead(lead.id)} title="O'chirish" style={{
                            padding: '6px 8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            backgroundColor: '#f1f5f9', color: '#94a3b8', fontSize: '11px'
                          }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>inbox</span>
                      {leads.length === 0 ? "Hozircha konsultatsiya so'rovlari yo'q" : "Filtrlarga mos so'rovlar topilmadi"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Dashboard</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <KpiCard title="Umumiy Tushum" value={`${stats.totalIncome.toLocaleString()} so'm`} change="Live" icon="attach_money" />
        <KpiCard title="Xarajatlar" value={`${stats.totalExpense.toLocaleString()} so'm`} change="Live" icon="money_off" />
        <KpiCard title="Sof Foyda" value={`${(stats.totalIncome - stats.totalExpense).toLocaleString()} so'm`} change="Live" icon="savings" />
        <KpiCard title="Faol O'quvchilar" value={stats.activeStudents} change="Live" icon="school" />
        <KpiCard title="O'qituvchilar" value={stats.activeTeachers} change="Live" icon="record_voice_over" />
        <KpiCard title="Faol Guruhlar" value={groups.filter(g => g.is_active).length} change="Live" icon="groups" />
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1.2, minWidth: '320px', backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Oxirgi To'lovlar</h3>
            <button onClick={() => setActiveTab('payments')} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>Barchasi &rarr;</button>
          </div>
          {payments.slice(0, 5).map(p => {
            const st = users.find(u => u.id === p.student_id);
            return (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #eff6ff' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>
                    {st ? st.full_name : `O'quvchi #${p.student_id}`}
                  </p>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {p.month_for || p.month || ''} • {p.payment_method || 'CASH'}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#16a34a', fontWeight: '900', fontSize: '15px' }}>
                    +{(p.amount || 0).toLocaleString()} UZS
                  </span>
                  <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8' }}>
                    {p.created_at ? p.created_at.split('T')[0] : ''}
                  </span>
                </div>
              </div>
            );
          })}
          {payments.length === 0 && (
            <p style={{ color: '#64748b', textAlign: 'center', margin: '20px 0' }}>Hozircha to'lovlar qayd etilmagan.</p>
          )}
        </div>

        <div style={{ flex: 0.8, minWidth: '300px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="material-symbols-outlined" style={{ color: '#e11d48', fontSize: '28px' }}>warning</span>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#9f1239', margin: 0 }}>Qarzdorlar Holati</h3>
          </div>
          <p style={{ fontSize: '14px', color: '#881337', margin: 0, lineHeight: '1.5' }}>
            Tizimda <strong>{stats.debtorsCount} nafar</strong> o'quvchining to'lov qarzdorligi mavjud.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
            {debtorsList.slice(0, 4).map(d => (
              <div key={d.student_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '10px', border: '1px solid #fecdd3' }}>
                <div>
                  <span style={{ fontWeight: '800', fontSize: '13px', color: '#0f172a', display: 'block' }}>{d.student_name}</span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>ID: {d.login_id}</span>
                </div>
                <span style={{ color: '#e11d48', fontWeight: '900', fontSize: '13px' }}>-{(d.total_debt || 0).toLocaleString()} UZS</span>
              </div>
            ))}
          </div>
          <button onClick={() => setActiveTab('payments')} style={{ marginTop: 'auto', padding: '10px', borderRadius: '12px', border: 'none', backgroundColor: '#e11d48', color: '#ffffff', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>
            Qarzdorlar Ro'yxatini Ko'rish &rarr;
          </button>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => {
    const filteredUsers = users.filter(u => 
      (roleFilter === 'ALL' || u.role === roleFilter) &&
      (u.full_name.toLowerCase().includes(uSearch.toLowerCase()) || u.login_id.includes(uSearch))
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Foydalanuvchilar</h2>
          <button onClick={() => setShowAddUserModal(true)} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '14px', cursor: 'pointer', fontWeight: '800' }}>
            Yangi Foydalanuvchi Qo'shish
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ padding: '10px', borderRadius: '12px', border: '1px solid #bfdbfe', outline: 'none' }}>
            <option value="ALL">Barcha</option>
            <option value="STUDENT">O'quvchilar</option>
            <option value="TEACHER">O'qituvchilar</option>
            <option value="ADMIN">Adminlar</option>
          </select>
          <input type="text" placeholder="ID yoki Ism bo'yicha qidiruv" value={uSearch} onChange={e => setUSearch(e.target.value)} style={{ padding: '10px', borderRadius: '12px', border: '1px solid #bfdbfe', flex: 1, outline: 'none' }} />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <thead style={{ backgroundColor: '#eff6ff' }}>
            <tr>
              <th style={{ padding: '16px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Ism</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Telefon</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Rol</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Telegram</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #eff6ff' }}>
                <td style={{ padding: '16px', fontWeight: '800' }}>{u.login_id}</td>
                <td style={{ padding: '16px' }}>{u.full_name}</td>
                <td style={{ padding: '16px' }}>{u.phone}</td>
                <td style={{ padding: '16px' }}>{u.role}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '800',
                    backgroundColor: u.student_status === 'FROZEN' ? '#e0f2fe' : u.student_status === 'ARCHIVED' ? '#f1f5f9' : '#dcfce7',
                    color: u.student_status === 'FROZEN' ? '#0369a1' : u.student_status === 'ARCHIVED' ? '#475569' : '#166534'
                  }}>
                    {u.student_status || 'ACTIVE'}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  {u.telegram_chat_id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800',
                        backgroundColor: '#dcfce7', color: '#166534'
                      }}>
                        ✅ Ulangan
                      </span>
                      <button onClick={async () => {
                        if (!window.confirm(`${u.full_name} ning Telegram botini uzishni xohlaysizmi?`)) return;
                        try {
                          await usersAPI.updateUser(u.id, { telegram_chat_id: null });
                          setUsers(prev => prev.map(usr => usr.id === u.id ? { ...usr, telegram_chat_id: null } : usr));
                          triggerNotification(`${u.full_name} Telegram boti uzildi`);
                        } catch(e) {
                          triggerNotification("Telegram uzishda xatolik!");
                        }
                      }} title="Telegram botini uzish" style={{
                        padding: '3px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                        backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '11px', fontWeight: '800'
                      }}>
                        Uzish
                      </button>
                    </div>
                  ) : (
                    <span style={{
                      padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800',
                      backgroundColor: '#f1f5f9', color: '#94a3b8'
                    }}>
                      — Ulanmagan
                    </span>
                  )}
                </td>
                <td style={{ padding: '16px', display: 'flex', gap: '8px' }}>
                  <button onClick={() => setEditUserModal(u)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', cursor: 'pointer', fontWeight: '700' }}>Tahrirlash</button>
                  <button onClick={() => { setSelectedStudentForFreeze(u); setShowFreezeModal(true); }} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', cursor: 'pointer', fontWeight: '700' }}>Muzlatish ❄️</button>
                  <button onClick={async () => {
                    const newStatus = u.student_status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED';
                    try {
                      await usersAPI.updateUser(u.id, { student_status: newStatus });
                      setUsers(prev => prev.map(usr => usr.id === u.id ? { ...usr, student_status: newStatus } : usr));
                      triggerNotification(`${u.full_name} holati ${newStatus === 'ARCHIVED' ? 'Arxivlandi 📦' : 'Faollashtirildi'}`);
                    } catch(e) {
                      triggerNotification("Holatni o'zgartirishda xatolik");
                    }
                  }} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', cursor: 'pointer', fontWeight: '700' }}>
                    {u.student_status === 'ARCHIVED' ? 'Tiklash 🔄' : 'Arxivlash 📦'}
                  </button>
                  <button onClick={async () => {
                    if (!window.confirm(`"${u.full_name}" foydalanuvchisini tizimdan butunlay o'chirmoqchimisiz? (Bog'langan barcha ma'lumotlar ham tozalanadi)`)) return;
                    try {
                      const res = await usersAPI.deleteUser(u.id, true);
                      setUsers(prev => prev.filter(usr => usr.id !== u.id));
                      triggerNotification(res?.message || `${u.full_name} muvaffaqiyatli o'chirildi 🗑️`);
                    } catch(e) {
                      const detail = e.response?.data?.detail || "O'chirishda xatolik yuz berdi";
                      triggerNotification(`❌ ${detail}`);
                    }
                  }} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#fee2e2', color: '#dc2626', cursor: 'pointer', fontWeight: '700' }}>O'chirish</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCourses = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: 0 }}>O'quv Fanlari</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>Mavjud fanlar, oylik to'lovlar va davomiyliklar</p>
        </div>
        <button onClick={() => setShowAddCourseModal(true)} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '12px 20px', borderRadius: '14px', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span> Yangi Fan Qo'shish
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {courses.map(c => {
          const connectedGroups = groups.filter(g => g.course_id === c.id);
          return (
            <div key={c.id} style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 14px rgba(37,99,235,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: 0 }}>{c.title}</h3>
                <span style={{ fontSize: '12px', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '50px', fontWeight: '800' }}>
                  {connectedGroups.length} ta guruh
                </span>
              </div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px', lineHeight: '1.5', minHeight: '42px' }}>{c.description || "Tavsif berilmagan"}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '16px', border: '1px solid #eff6ff' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', display: 'block' }}>Oylik to'lov</span>
                  <span style={{ fontWeight: '900', color: '#2563eb', fontSize: '16px' }}>{c.price_monthly.toLocaleString()} UZS</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', display: 'block' }}>Davomiyligi</span>
                  <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>{c.duration_months} oy</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button onClick={() => setSelectedCourseDetail(c)} style={{ flex: 1.2, padding: '10px 8px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '13px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span> Batafsil
                </button>
                <button onClick={() => setEditCourseModal(c)} style={{ flex: 1, padding: '10px 8px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>
                  Tahrirlash
                </button>
                <button onClick={async () => {
                  if (!window.confirm(`"${c.title}" fanini o'chirishni tasdiqlaysizmi?`)) return;
                  try {
                    await coursesAPI.deleteCourse(c.id);
                    setCourses(prev => prev.filter(cr => cr.id !== c.id));
                    triggerNotification(`"${c.title}" fani muvaffaqiyatli o'chirildi`);
                  } catch(e){ triggerNotification("O'chirishda xatolik yuz berdi"); }
                }} style={{ padding: '10px 14px', borderRadius: '12px', border: 'none', backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>
                  O'chirish
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderGroups = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Guruhlar</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>Muntazam mashg'ulot guruhlari va talabalar taqsimoti</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => {
              setAssignSelectedGroupId(null);
              setShowAssignStudentModal(true);
            }} 
            style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '12px 18px', borderRadius: '14px', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person_add</span> O'quvchi Biriktirish
          </button>
          <button onClick={() => setShowAddGroupModal(true)} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '12px 20px', borderRadius: '14px', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span> Yangi Guruh Qo'shish
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {(groups || []).filter(Boolean).map(g => {
          const course = (courses || []).find(c => c && c.id === g.course_id);
          const room = (rooms || []).find(r => r && r.id === g.room_id);
          return (
            <div key={g.id} style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 14px rgba(37,99,235,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '12px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', padding: '4px 10px', borderRadius: '6px', display: 'inline-block', marginBottom: '8px' }}>
                    {course?.title || 'Fan'}
                  </span>
                  <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: 0 }}>{g.name}</h3>
                </div>
                <span style={{ fontSize: '12px', backgroundColor: g.is_active ? '#dcfce7' : '#fee2e2', color: g.is_active ? '#166534' : '#991b1b', padding: '4px 10px', borderRadius: '50px', fontWeight: '800' }}>
                  {g.is_active ? 'Faol' : 'Yakunlangan'}
                </span>
              </div>
              
              <div style={{ fontSize: '13px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '16px', border: '1px solid #eff6ff' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563eb' }}>calendar_month</span> 
                  <strong>Kunlar:</strong> {g.days_of_week || 'Belgilanmagan'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563eb' }}>schedule</span> 
                  <strong>Vaqt:</strong> {g.start_time || '14:00'} - {g.end_time || '16:00'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563eb' }}>meeting_room</span> 
                  <strong>Xona:</strong> {room?.name || (g.room_id ? `${g.room_id}-xona` : "Belgilanmagan")}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button onClick={async () => {
                  try {
                    const detail = await groupsAPI.getGroupDetail(g.id);
                    setSelectedGroupDetail(detail || g);
                  } catch(e) {
                    setSelectedGroupDetail(g);
                  }
                }} style={{ flex: 1.2, padding: '10px 8px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '13px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span> Batafsil
                </button>
                <button onClick={() => setEditGroupModal(g)} style={{ flex: 1, padding: '10px 8px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>
                  Tahrirlash
                </button>
                <button onClick={async () => {
                  try {
                    const newStatus = !g.is_active;
                    await groupsAPI.updateGroup(g.id, { is_active: newStatus });
                    setGroups(prev => (prev || []).map(item => item.id === g.id ? { ...item, is_active: newStatus } : item));
                    triggerNotification(`${g.name} holati o'zgartirildi!`);
                  } catch(e) { triggerNotification("Holatni o'zgartirishda xatolik"); }
                }} style={{ flex: 1, padding: '10px 8px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', color: '#475569', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}>
                  {g.is_active ? 'Tugatish 🏁' : 'Faollashtirish'}
                </button>
                <button onClick={async () => {
                  if (!window.confirm(`"${g.name}" guruhini o'chirishni tasdiqlaysizmi?`)) return;
                  try {
                    await groupsAPI.deleteGroup(g.id);
                    setGroups(prev => (prev || []).filter(item => item.id !== g.id));
                    triggerNotification(`${g.name} o'chirildi`);
                  } catch(e) { triggerNotification("O'chirishda xatolik"); }
                }} style={{ padding: '10px 12px', borderRadius: '12px', border: 'none', backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>
                  O'chirish
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderPayments = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: 0 }}>To'lovlar & Moliya</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>O'quvchilar to'lovlari, qarzdorliklar nazorati va rasmiy kvitansiyalar</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowProRataModal(true)} style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '10px 18px', borderRadius: '14px', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calculate</span> Pro-rata Kalkulyator
          </button>
          <button 
            onClick={() => {
              setSelectedStudentForPayment(null);
              setPaymentSearchQuery('');
              setPaymentBillingInfo(null);
              setPaymentAmountVal('');
              setPaymentMonthVal(new Date().toISOString().slice(0, 7));
              setPaymentNoteVal('');
              setShowPaymentModal(true);
            }} 
            style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '14px', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span> To'lov Qabul Qilish
          </button>
        </div>
      </div>

      {/* 1. DEBTORS LIST */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Qarzdor O'quvchilar Ro'yxati</h3>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>To'lov muddati o'tgan o'quvchilar va qarzdorlik summasi</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input 
              type="month" 
              value={billingMonth} 
              onChange={e => setBillingMonth(e.target.value)} 
              style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '13px', backgroundColor: '#f8fafc' }} 
            />
            <button 
              onClick={async () => {
                setGeneratingBilling(true);
                try {
                  const res = await financeAPI.autoRunMonthlyBilling(billingMonth);
                  triggerNotification(res?.message || "Oylik to'lovlar yangilandi va Telegramga xabarnomalar yuborildi!");
                  const debts = await financeAPI.getDebtors();
                  if(Array.isArray(debts)) {
                    setDebtorsList(debts);
                    setStats(prev => ({ ...prev, debtorsCount: debts.length }));
                  }
                } catch(e) {
                  triggerNotification("Oylik to'lovlarni yangilashda xatolik");
                }
                setGeneratingBilling(false);
              }}
              disabled={generatingBilling}
              style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #2563eb', backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: '800', cursor: 'pointer', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send_and_archive</span>
              {generatingBilling ? 'Yangilanmoqda...' : '🔄 1-sana Avto-Hisob & Telegram'}
            </button>
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800' }}>
              <tr>
                <th style={{ padding: '14px 16px' }}>O'quvchi ID</th>
                <th style={{ padding: '14px 16px' }}>Ism Familiya</th>
                <th style={{ padding: '14px 16px' }}>Telefon</th>
                <th style={{ padding: '14px 16px' }}>Qarzdor Oylar</th>
                <th style={{ padding: '14px 16px' }}>Qarz Summasi</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Harakat</th>
              </tr>
            </thead>
            <tbody>
              {debtorsList.map(d => (
                <tr key={d.student_id} style={{ borderBottom: '1px solid #eff6ff' }}>
                  <td style={{ padding: '14px 16px', fontWeight: '800', color: '#2563eb' }}>{d.login_id}</td>
                  <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0f172a' }}>{d.student_name}</td>
                  <td style={{ padding: '14px 16px' }}>{d.phone}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '12px', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontWeight: '700' }}>
                      {d.unpaid_months?.join(', ') || "Noma'lum"}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '6px', fontWeight: '900' }}>
                      -{(d.total_debt || 0).toLocaleString()} UZS
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <button 
                      onClick={() => {
                        const st = users.find(u => u.id === d.student_id);
                        if (st) {
                          handleSelectStudentForPayment(st, billingMonth);
                          setPaymentMonthVal(billingMonth);
                        }
                        setShowPaymentModal(true);
                      }} 
                      style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
                    >
                      To'lov olish
                    </button>
                  </td>
                </tr>
              ))}
              {debtorsList.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#166534', backgroundColor: '#f0fdf4', fontWeight: '700' }}>
                    🎉 Barcha to'lovlar o'z vaqtida amalga oshirilgan, qarzdorliklar mavjud emas!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. PAYMENTS HISTORY */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '900', margin: 0, color: '#0f172a' }}>To'lovlar Tarixi</h3>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>Barcha qabul qilingan to'lovlar, kvitansiyalar, tahrirlash va bekor qilish</p>
          </div>
          <span style={{ fontSize: '13px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', padding: '6px 14px', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
            Jami: {payments.length} ta to'lov
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead style={{ backgroundColor: '#f8fafc', color: '#475569', fontWeight: '800' }}>
              <tr>
                <th style={{ padding: '14px 16px' }}>Chek ID</th>
                <th style={{ padding: '14px 16px' }}>O'quvchi</th>
                <th style={{ padding: '14px 16px' }}>Summa</th>
                <th style={{ padding: '14px 16px' }}>Oy</th>
                <th style={{ padding: '14px 16px' }}>Usul</th>
                <th style={{ padding: '14px 16px' }}>Izoh</th>
                <th style={{ padding: '14px 16px' }}>Sana</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => {
                const st = users.find(u => u.id === p.student_id);
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #eff6ff' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '800' }}>#{p.id}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '700' }}>
                      {st ? `${st.full_name} (${st.login_id})` : `O'quvchi ID: ${p.student_id}`}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '900', color: '#2563eb' }}>{(p.amount || 0).toLocaleString()} UZS</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontWeight: '700', fontSize: '13px' }}>
                        {p.month_for || p.month || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800' }}>
                        {p.payment_method || p.method || 'CASH'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.note || '-'}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>
                      {p.created_at ? p.created_at.split('T')[0] : '-'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button 
                          onClick={() => setSelectedPaymentForReceipt(p)} 
                          title="Chekni ko'rish va chop etish"
                          style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', cursor: 'pointer', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>receipt_long</span> Chek
                        </button>
                        <button 
                          onClick={() => setEditPaymentModal(p)}
                          title="To'lovni tahrirlash"
                          style={{ padding: '6px 10px', borderRadius: '1px solid #bfdbfe', backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: '800', cursor: 'pointer', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span> Tahrirlash
                        </button>
                        <button 
                          onClick={() => handleDeletePayment(p.id)}
                          title="To'lovni o'chirish"
                          style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: '800', cursor: 'pointer', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span> O'chirish
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {payments.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                    Hozircha to'lovlar qayd etilmagan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Dars Jadvallari</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>Barcha guruhlarning dars kunlari, vaqtlari va xonalari taqsimoti</p>
        </div>
        <button onClick={() => setShowAddGroupModal(true)} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '12px 20px', borderRadius: '14px', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span> Yangi Guruh & Dars Jadvali
        </button>
      </div>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', padding: '24px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800' }}>
              <tr>
                <th style={{ padding: '16px' }}>Guruh & Fan</th>
                <th style={{ padding: '16px' }}>Kunlar</th>
                <th style={{ padding: '16px' }}>Dars Vaqti</th>
                <th style={{ padding: '16px' }}>Dars Xonasi</th>
                <th style={{ padding: '16px' }}>O'qituvchi</th>
                <th style={{ padding: '16px' }}>Holat</th>
                <th style={{ padding: '16px', textAlign: 'center' }}>Amal</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(g => {
                const course = courses.find(c => c.id === g.course_id);
                const teacher = users.find(u => u.id === g.teacher_id);
                const room = rooms.find(r => r.id === g.room_id);
                return (
                  <tr key={g.id} style={{ borderBottom: '1px solid #eff6ff' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '800', color: '#0f172a' }}>{g.name}</div>
                      <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '700' }}>{course?.title || 'Fan'}</div>
                    </td>
                    <td style={{ padding: '16px', fontWeight: '700', color: '#334155' }}>
                      {g.days_of_week === 'MON,WED,FRI' ? 'Dush / Chor / Jum (Toq)' : g.days_of_week === 'TUE,THU,SAT' ? 'Sesh / Pay / Shan (Juft)' : g.days_of_week === 'ALL' ? 'Har kuni (Dush - Shan)' : g.days_of_week}
                    </td>
                    <td style={{ padding: '16px', fontWeight: '800', color: '#0f172a' }}>
                      ⏱️ {g.start_time} - {g.end_time}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#0f172a', fontWeight: '800', fontSize: '13px' }}>
                        🚪 {room?.name || `${g.room_id}-xona`}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontWeight: '700' }}>
                      {teacher ? `${teacher.full_name}` : "Biriktirilmagan"}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontSize: '12px', backgroundColor: g.is_active ? '#dcfce7' : '#fee2e2', color: g.is_active ? '#166534' : '#991b1b', padding: '4px 10px', borderRadius: '50px', fontWeight: '800' }}>
                        {g.is_active ? 'Faol' : 'Yakunlangan'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <button onClick={() => setEditGroupModal(g)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}>
                        Tahrirlash
                      </button>
                    </td>
                  </tr>
                );
              })}
              {groups.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                    Hozircha guruhlar va dars jadvallari mavjud emas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const handleAdminStartExam = async (exam) => {
    try {
      const res = await analyticsAPI.startExam(exam.id);
      setExams(prev => prev.map(e => e.id === exam.id ? { ...e, status: 'ACTIVE', started_at: res.started_at } : e));
      triggerNotification(`🚀 "${exam.title}" imtihoni boshlandi!`);
    } catch(err) {
      triggerNotification("Imtihonni boshlashda xatolik");
    }
  };

  const handleAdminFinishExam = async (exam) => {
    try {
      await analyticsAPI.finishExam(exam.id);
      setExams(prev => prev.map(e => e.id === exam.id ? { ...e, status: 'COMPLETED' } : e));
      triggerNotification(`⏹️ "${exam.title}" imtihoni yakunlandi!`);
    } catch(err) {
      triggerNotification("Imtihonni yakunlashda xatolik");
    }
  };

  const handleAdminDeleteExam = async (examId) => {
    if (!window.confirm("Haqiqatdan ham ushbu imtihonni o'chirmoqchimisiz?")) return;
    try {
      await analyticsAPI.deleteExam(examId);
      setExams(prev => prev.filter(e => e.id !== examId));
      triggerNotification("Imtihon o'chirildi");
    } catch(err) {
      triggerNotification("O'chirishda xatolik");
    }
  };

  const handleAdminOpenResults = async (exam) => {
    setAdminExamResultsModal(exam);
    setAdminResultsLoading(true);
    try {
      const res = await analyticsAPI.getExamResults(exam.id);
      setAdminExamResultsList(Array.isArray(res) ? res : []);
    } catch(e) {
      setAdminExamResultsList([]);
    }
    setAdminResultsLoading(false);
  };

  const handleAdminOpenOffline = async (exam) => {
    setAdminOfflineModal(exam);
    setAdminOfflineScores({});
    setAdminOfflineFeedbacks({});
    try {
      const [students, existingResults] = await Promise.all([
        groupsAPI.getGroupStudents(exam.group_id).catch(() => []),
        analyticsAPI.getExamResults(exam.id).catch(() => [])
      ]);
      const sList = Array.isArray(students) ? students : [];
      setAdminOfflineStudents(sList);

      const initialScores = {};
      const initialFeedbacks = {};
      if (Array.isArray(existingResults)) {
        existingResults.forEach(r => {
          initialScores[r.student_id] = r.score;
          if (r.feedback) initialFeedbacks[r.student_id] = r.feedback;
        });
      }
      setAdminOfflineScores(initialScores);
      setAdminOfflineFeedbacks(initialFeedbacks);
    } catch(e) {
      setAdminOfflineStudents([]);
    }
  };

  const handleAdminSaveOffline = async () => {
    if (!adminOfflineModal) return;
    setAdminOfflineSaving(true);
    try {
      const resultsPayload = adminOfflineStudents.map(s => ({
        student_id: s.id,
        score: parseFloat(adminOfflineScores[s.id] || 0),
        feedback: adminOfflineFeedbacks[s.id] || (parseFloat(adminOfflineScores[s.id] || 0) >= adminOfflineModal.pass_score ? "Imtihondan muvaffaqiyatli o'tdi" : "Qoniqarsiz")
      }));

      const res = await analyticsAPI.recordExamResults({
        exam_id: adminOfflineModal.id,
        results: resultsPayload
      });

      triggerNotification(`✅ ${res.results_count} ta o'quvchi natijasi saqlandi! (${res.certificates_awarded} ta sertifikat berildi 🎓)`);
      setAdminOfflineModal(null);
      const [updatedExams, updatedCerts] = await Promise.all([
        analyticsAPI.getExams().catch(() => []),
        certificatesAPI.getCertificates().catch(() => [])
      ]);
      if (Array.isArray(updatedExams)) setExams(updatedExams);
      if (Array.isArray(updatedCerts)) setCertificates(updatedCerts);
    } catch(err) {
      triggerNotification("Natijalarni saqlashda xatolik");
    }
    setAdminOfflineSaving(false);
  };

  const renderExams = () => {
    const filteredExams = exams.filter(e => 
      e.title.toLowerCase().includes(examSearchText.toLowerCase()) || 
      (e.group_name && e.group_name.toLowerCase().includes(examSearchText.toLowerCase()))
    );

    const filteredCerts = certificates.filter(c => 
      c.certificate_code.toLowerCase().includes(certSearchText.toLowerCase()) ||
      (c.student_name && c.student_name.toLowerCase().includes(certSearchText.toLowerCase())) ||
      (c.course_title && c.course_title.toLowerCase().includes(certSearchText.toLowerCase()))
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Imtihonlar & Sertifikatlar Tizimi</h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>Barcha guruhlar imtihonlari, natijalari va berilgan rasmiy sertifikatlar reyestri</p>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', backgroundColor: '#eff6ff', padding: '4px', borderRadius: '14px', border: '1px solid #bfdbfe' }}>
            <button 
              onClick={() => setAdminExamTab('exams')}
              style={{
                padding: '8px 16px', borderRadius: '10px', border: 'none',
                backgroundColor: adminExamTab === 'exams' ? '#2563eb' : 'transparent',
                color: adminExamTab === 'exams' ? '#ffffff' : '#1d4ed8',
                fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>quiz</span>
              Imtihonlar ({exams.length})
            </button>
            <button 
              onClick={() => setAdminExamTab('certificates')}
              style={{
                padding: '8px 16px', borderRadius: '10px', border: 'none',
                backgroundColor: adminExamTab === 'certificates' ? '#2563eb' : 'transparent',
                color: adminExamTab === 'certificates' ? '#ffffff' : '#1d4ed8',
                fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>workspace_premium</span>
              Sertifikatlar Reyestri ({certificates.length})
            </button>
          </div>
        </div>

        {/* SUBTAB 1: EXAMS LIST */}
        {adminExamTab === 'exams' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="Imtihon nomi yoki guruh bo'yicha qidirish..." 
                value={examSearchText} 
                onChange={e => setExamSearchText(e.target.value)} 
                style={{ padding: '12px 16px', borderRadius: '14px', border: '1px solid #bfdbfe', flex: 1, backgroundColor: '#ffffff' }} 
              />
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800' }}>
                  <tr>
                    <th style={{ padding: '16px' }}>Imtihon</th>
                    <th style={{ padding: '16px' }}>Turi</th>
                    <th style={{ padding: '16px' }}>Guruh</th>
                    <th style={{ padding: '16px' }}>Sana & Vaqt</th>
                    <th style={{ padding: '16px' }}>Ball & Sertifikat</th>
                    <th style={{ padding: '16px' }}>Holat</th>
                    <th style={{ padding: '16px', textAlign: 'center' }}>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExams.map(e => {
                    const isOnline = e.exam_type === 'ONLINE';
                    const isScheduled = e.status === 'SCHEDULED';
                    const isActive = e.status === 'ACTIVE';

                    return (
                      <tr key={e.id} style={{ borderBottom: '1px solid #eff6ff' }}>
                        <td style={{ padding: '16px', fontWeight: '800', color: '#0f172a' }}>{e.title}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', backgroundColor: isOnline ? '#eff6ff' : '#f5f3ff', color: isOnline ? '#1d4ed8' : '#7c3aed' }}>
                            {isOnline ? '🌐 Online' : '📝 Offline'}
                          </span>
                        </td>
                        <td style={{ padding: '16px', fontWeight: '700', color: '#2563eb' }}>{e.group_name || `Guruh #${e.group_id}`}</td>
                        <td style={{ padding: '16px', color: '#475569' }}>
                          <div>📅 {e.exam_date}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>⏱️ {e.duration_minutes || 30} daqiqa</div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div>Max: <strong>{e.max_score}</strong></div>
                          <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700' }}>🎓 Sertifikat: {e.pass_score || 70}+</div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '50px',
                            backgroundColor: isScheduled ? '#fef3c7' : isActive ? '#dbeafe' : '#dcfce7',
                            color: isScheduled ? '#b45309' : isActive ? '#1d4ed8' : '#166534'
                          }}>
                            {isScheduled ? '⏳ Kutilmoqda' : isActive ? '⚡️ Jonli' : '✅ Yakunlangan'}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {isScheduled && (
                              <button onClick={() => handleAdminStartExam(e)} style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>
                                Boshlash
                              </button>
                            )}
                            {isActive && (
                              <button onClick={() => handleAdminFinishExam(e)} style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', color: '#fff', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>
                                Yakunlash
                              </button>
                            )}
                            {!isOnline && (
                              <button onClick={() => handleAdminOpenOffline(e)} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #7c3aed', backgroundColor: '#f5f3ff', color: '#7c3aed', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>
                                Natija kiritish
                              </button>
                            )}
                            <button onClick={() => handleAdminOpenResults(e)} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>
                              Natijalar
                            </button>
                            <button onClick={() => handleAdminDeleteExam(e.id)} style={{ padding: '6px 8px', borderRadius: '8px', border: 'none', backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredExams.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                        Imtihonlar topilmadi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB 2: CERTIFICATES REGISTRY */}
        {adminExamTab === 'certificates' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="Sertifikat kodi, o'quvchi ismi yoki fan bo'yicha qidirish..." 
                value={certSearchText} 
                onChange={e => setCertSearchText(e.target.value)} 
                style={{ padding: '12px 16px', borderRadius: '14px', border: '1px solid #bfdbfe', flex: 1, backgroundColor: '#ffffff' }} 
              />
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ backgroundColor: '#f0fdf4', color: '#166534', fontWeight: '800' }}>
                  <tr>
                    <th style={{ padding: '16px' }}>Sertifikat Kodi</th>
                    <th style={{ padding: '16px' }}>O'quvchi</th>
                    <th style={{ padding: '16px' }}>Fan Nomi</th>
                    <th style={{ padding: '16px' }}>Berilgan Sana</th>
                    <th style={{ padding: '16px' }}>Holat</th>
                    <th style={{ padding: '16px', textAlign: 'center' }}>Harakat</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCerts.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #eff6ff' }}>
                      <td style={{ padding: '16px', fontWeight: '900', color: '#15803d' }}>
                        🎓 {c.certificate_code}
                      </td>
                      <td style={{ padding: '16px', fontWeight: '800', color: '#0f172a' }}>
                        {c.student_name} <span style={{ color: '#2563eb', fontSize: '12px' }}>({c.student_login_id})</span>
                      </td>
                      <td style={{ padding: '16px', fontWeight: '700', color: '#334155' }}>
                        {c.course_title}
                      </td>
                      <td style={{ padding: '16px', color: '#64748b' }}>
                        {c.issue_date?.split('T')[0]}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '6px' }}>
                          ✓ Haqiqiy
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button 
                          onClick={() => setAdminCertPreviewModal(c)}
                          style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #86efac', backgroundColor: '#f0fdf4', color: '#166534', fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span> Ko'rish & Chop etish
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredCerts.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                        Hozircha berilgan sertifikatlar yo'q yoki qidiruv bo'yicha topilmadi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    );
  };


  const renderAttendance = () => {
    // 1. GROUP ATTENDANCE JOURNAL (JURNAL) VIEW
    if (selectedAttendanceGroup) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header with Back button and Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={() => { setSelectedAttendanceGroup(null); setGroupJournalData(null); }}
                style={{ padding: '8px 16px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span> Guruhlar Ro'yxatiga Qaytish
              </button>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedAttendanceGroup.group_name || selectedAttendanceGroup.name} — Davomat Jurnali 📋
                </h2>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
                  📚 Fan: <strong>{selectedAttendanceGroup.course_title || selectedAttendanceGroup.courseName}</strong> • 👨‍🏫 O'qituvchi: <strong>{selectedAttendanceGroup.teacher_name}</strong> • 🚪 Xona: <strong>{selectedAttendanceGroup.room_name || selectedAttendanceGroup.roomName}</strong> • 📅 {selectedAttendanceGroup.days_of_week} ({selectedAttendanceGroup.start_time} - {selectedAttendanceGroup.end_time})
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setShowAdminAddLessonModal(true)}
                style={{ padding: '10px 16px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span> + Yangi Dars Sanasi
              </button>
              <button 
                onClick={() => handleOpenGroupJournal(selectedAttendanceGroup)}
                title="Jurnalni yangilash"
                style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
              </button>
            </div>
          </div>

          {/* Journal Table */}
          {groupJournalLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏳</div>
              <p style={{ margin: 0, color: '#64748b', fontWeight: '800' }}>Guruh davomat jurnali yuklanmoqda...</p>
            </div>
          ) : groupJournalData ? (
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              
              {/* Legend & Stats Banner */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', padding: '12px 16px', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', fontSize: '13px', fontWeight: '700' }}>
                  <span style={{ color: '#475569' }}>Davomat belgilari:</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#166534', backgroundColor: '#dcfce7', padding: '4px 10px', borderRadius: '8px', border: '1px solid #86efac' }}>
                    ✅ Keldi (Ptichka)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#991b1b', backgroundColor: '#fee2e2', padding: '4px 10px', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                    ❌ Kelmadi (X)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#b45309', backgroundColor: '#fef3c7', padding: '4px 10px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                    🕒 Kech qoldi (Soat)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#1d4ed8', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    📋 Sababli
                  </span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>
                  Jami o'quvchilar: <span style={{ color: '#2563eb' }}>{groupJournalData.students?.length || 0} ta</span> • Jami darslar: <span style={{ color: '#2563eb' }}>{groupJournalData.lessons?.length || 0} ta</span>
                </div>
              </div>

              {/* MATRIX TABLE */}
              <div style={{ overflowX: 'auto', maxHeight: '650px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#eff6ff', zIndex: 10 }}>
                    <tr>
                      <th style={{ padding: '14px 10px', width: '40px', borderRight: '1px solid #bfdbfe', borderBottom: '2px solid #bfdbfe', color: '#1d4ed8', fontWeight: '800' }}>#</th>
                      <th style={{ padding: '14px 16px', minWidth: '220px', textAlign: 'left', borderRight: '2px solid #bfdbfe', borderBottom: '2px solid #bfdbfe', color: '#1d4ed8', fontWeight: '800' }}>
                        O'quvchi F.I.Sh.
                      </th>
                      {groupJournalData.lessons.map(lesson => (
                        <th key={lesson.id} style={{ padding: '10px 12px', minWidth: '95px', borderRight: '1px solid #bfdbfe', borderBottom: '2px solid #bfdbfe', color: '#0f172a', fontWeight: '800', whiteSpace: 'nowrap' }}>
                          <div style={{ fontSize: '13px', color: '#1d4ed8', fontWeight: '900' }}>
                            {lesson.lesson_date ? lesson.lesson_date.split('-').slice(1).join('/') : '-'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {lesson.topic || 'Dars'}
                          </div>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '4px' }}>
                            <button 
                              type="button"
                              onClick={() => handleOpenMarkModal(lesson)}
                              title="Ushbu sana davomatini tahrirlash"
                              style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', color: '#2563eb', fontSize: '10px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>edit</span> Tahrir
                            </button>
                            <button 
                              type="button"
                              onClick={async () => {
                                if (!window.confirm(`${lesson.lesson_date} sanasidagi darsni va uning davomatini o'chirishni tasdiqlaysizmi?`)) return;
                                try {
                                  await attendanceAPI.deleteLesson(lesson.id);
                                  triggerNotification("Dars sanasi muvaffaqiyatli o'chirildi ✅");
                                  const journal = await attendanceAPI.getGroupJournal(selectedAttendanceGroup.group_id || selectedAttendanceGroup.id);
                                  setGroupJournalData(journal);
                                } catch (err) {
                                  triggerNotification("O'chirishda xatolik yuz berdi");
                                }
                              }}
                              title="Dars sanasini o'chirish"
                              style={{ padding: '3px 6px', borderRadius: '6px', border: '1px solid #fee2e2', backgroundColor: '#ffffff', color: '#dc2626', fontSize: '10px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>delete</span>
                            </button>
                          </div>
                        </th>
                      ))}
                      {groupJournalData.lessons.length === 0 && (
                        <th style={{ padding: '14px 16px', color: '#64748b', fontStyle: 'italic', fontWeight: '600' }}>
                          Dars sanalari mavjud emas. Yuqoridagi "+ Yangi Dars Sanasi" tugmasi orqali dars qo'shing.
                        </th>
                      )}
                      <th style={{ padding: '14px 12px', minWidth: '110px', borderLeft: '2px solid #bfdbfe', borderBottom: '2px solid #bfdbfe', color: '#1d4ed8', fontWeight: '800' }}>
                        Davomat %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupJournalData.students.map((student, idx) => {
                      let presentCount = 0;
                      let lateCount = 0;
                      let absentCount = 0;
                      let recordedCount = 0;

                      groupJournalData.lessons.forEach(lesson => {
                        const att = groupJournalData.matrix?.[String(student.id)]?.[String(lesson.id)];
                        if (att) {
                          recordedCount++;
                          if (att.status === 'PRESENT') presentCount++;
                          else if (att.status === 'LATE') lateCount++;
                          else if (att.status === 'ABSENT') absentCount++;
                        }
                      });

                      const rate = recordedCount > 0 ? Math.round(((presentCount + (lateCount * 0.75)) / recordedCount) * 100) : null;

                      return (
                        <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                          <td style={{ padding: '12px 8px', fontWeight: '700', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>
                            {idx + 1}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '800', color: '#0f172a', borderRight: '2px solid #bfdbfe' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '14px' }}>{student.full_name}</span>
                              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                                ID: <strong style={{ color: '#2563eb' }}>{student.login_id}</strong> • 📞 {student.phone}
                              </span>
                            </div>
                          </td>
                          {groupJournalData.lessons.map(lesson => {
                            const att = groupJournalData.matrix?.[String(student.id)]?.[String(lesson.id)];
                            return (
                              <td key={lesson.id} style={{ padding: '8px', borderRight: '1px solid #f1f5f9' }}>
                                {att ? (
                                  att.status === 'PRESENT' ? (
                                    <span 
                                      title="Keldi (Ptichka)" 
                                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#dcfce7', color: '#16a34a', fontWeight: '900', fontSize: '16px', border: '1px solid #86efac' }}
                                    >
                                      ✓
                                    </span>
                                  ) : att.status === 'ABSENT' ? (
                                    <span 
                                      title="Kelmadi (X)" 
                                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: '900', fontSize: '16px', border: '1px solid #fecdd3' }}
                                    >
                                      ✕
                                    </span>
                                  ) : att.status === 'LATE' ? (
                                    <span 
                                      title="Kechikib keldi (Soat)" 
                                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#d97706', fontWeight: '900', fontSize: '16px', border: '1px solid #fde68a' }}
                                    >
                                      🕒
                                    </span>
                                  ) : (
                                    <span 
                                      title="Sababli" 
                                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: '900', fontSize: '14px', border: '1px solid #bfdbfe' }}
                                    >
                                      📋
                                    </span>
                                  )
                                ) : (
                                  <span style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '700' }}>—</span>
                                )}
                              </td>
                            );
                          })}
                          {groupJournalData.lessons.length === 0 && (
                            <td style={{ padding: '8px', color: '#94a3b8' }}>—</td>
                          )}
                          <td style={{ padding: '12px', borderLeft: '2px solid #bfdbfe', fontWeight: '800' }}>
                            {rate !== null ? (
                              <span style={{ 
                                padding: '4px 10px', borderRadius: '8px', fontSize: '12px',
                                backgroundColor: rate >= 80 ? '#dcfce7' : rate >= 60 ? '#fef3c7' : '#fee2e2',
                                color: rate >= 80 ? '#166534' : rate >= 60 ? '#b45309' : '#991b1b',
                                border: `1px solid ${rate >= 80 ? '#86efac' : rate >= 60 ? '#fde68a' : '#fecdd3'}`
                              }}>
                                {rate}%
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '11px' }}>Dars yo'q</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {groupJournalData.students.length === 0 && (
                      <tr>
                        <td colSpan={groupJournalData.lessons.length + 3} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                          Ushbu guruhga hali o'quvchilar biriktirilmagan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      );
    }

    // 2. ALL GROUPS OVERVIEW WITH EDGE ATTENDANCE BADGES
    const filteredGroupSummaries = groupsAttendanceSummary.filter(g => {
      if (!attendanceSearchQuery) return true;
      const q = attendanceSearchQuery.toLowerCase();
      return (
        g.group_name?.toLowerCase().includes(q) ||
        g.course_title?.toLowerCase().includes(q) ||
        g.teacher_name?.toLowerCase().includes(q)
      );
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Davomat Monitoringi & Guruh Jurnallari</h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>Barcha guruhlar bo'yicha davomat statistikasi va to'liq elektron jurnallar</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="Guruh, fan yoki o'qituvchi bo'yicha qidirish..." 
              value={attendanceSearchQuery} 
              onChange={e => setAttendanceSearchQuery(e.target.value)} 
              style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid #bfdbfe', width: '280px', fontSize: '13px', backgroundColor: '#ffffff' }} 
            />
            <button 
              onClick={async () => {
                const gSum = await attendanceAPI.getGroupsSummary().catch(() => []);
                if (Array.isArray(gSum)) setGroupsAttendanceSummary(gSum);
                triggerNotification("Davomatlar yangilandi!");
              }} 
              style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span> Yangilash
            </button>
          </div>
        </div>

        {/* GROUP CARDS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredGroupSummaries.map(g => {
            const attendancePercent = g.total_students > 0 ? Math.round((g.attended_count / g.total_students) * 100) : 0;
            return (
              <div 
                key={g.group_id} 
                onClick={() => handleOpenGroupJournal(g)}
                style={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #bfdbfe', 
                  borderRadius: '20px', 
                  padding: '20px', 
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(37,99,235,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}
              >
                {/* TOP ROW: Group Name and Edge Attendance Badge */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0 }}>{g.group_name}</h3>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#2563eb', backgroundColor: '#eff6ff', padding: '3px 8px', borderRadius: '6px', border: '1px solid #bfdbfe', display: 'inline-block', marginTop: '4px' }}>
                        📚 {g.course_title}
                      </span>
                    </div>

                    {/* CHEKADAGI DAVOMAT KO'RSATKICHI (EDGE BADGE) */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '5px',
                        padding: '6px 12px', 
                        borderRadius: '12px', 
                        fontWeight: '900', 
                        fontSize: '13px',
                        backgroundColor: g.total_students === 0 ? '#f1f5f9' : attendancePercent >= 80 ? '#dcfce7' : attendancePercent >= 50 ? '#fef3c7' : '#fee2e2',
                        color: g.total_students === 0 ? '#64748b' : attendancePercent >= 80 ? '#166534' : attendancePercent >= 50 ? '#b45309' : '#991b1b',
                        border: `1px solid ${g.total_students === 0 ? '#e2e8f0' : attendancePercent >= 80 ? '#86efac' : attendancePercent >= 50 ? '#fde68a' : '#fecdd3'}`
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>groups</span>
                        {g.attended_count} / {g.total_students} keldi
                      </div>
                      {g.total_students > 0 && g.latest_lesson_date && (
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', marginTop: '2px' }}>
                          {attendancePercent}% davomat
                        </div>
                      )}
                    </div>
                  </div>

                  {/* DETAILS */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#475569', margin: '14px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#64748b' }}>person</span>
                      <span>O'qituvchi: <strong>{g.teacher_name}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#64748b' }}>meeting_room</span>
                      <span>Xona: <strong>{g.room_name}</strong> • 📅 {g.days_of_week}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#64748b' }}>schedule</span>
                      <span>Vaqt: <strong>{g.start_time} - {g.end_time}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>event</span>
                      <span>So'nggi dars: <strong>{g.latest_lesson_date ? `${g.latest_lesson_date} ${g.latest_lesson_topic ? `(${g.latest_lesson_topic})` : ''}` : 'Hali dars o\'tilmagan'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* BOTTOM BUTTON */}
                <div style={{ paddingTop: '12px', borderTop: '1px solid #eff6ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>
                    {g.total_students} ta o'quvchi
                  </span>
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); handleOpenGroupJournal(g); }}
                    style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>table_chart</span> Jurnalni Ochish →
                  </button>
                </div>
              </div>
            );
          })}
          {filteredGroupSummaries.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '48px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #bfdbfe', color: '#64748b' }}>
              Guruhlar topilmadi.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderReports = () => {
    const f = reportData?.financial || {
      total_income: 0,
      total_expense: 0,
      net_profit: 0,
      payments_count: 0,
      expenses_count: 0,
      by_payment_method: {},
      expenses_by_category: {},
      teacher_salaries_paid: 0
    };

    const ac = reportData?.academic_and_students || {
      total_active_students: 0,
      new_students_count: 0,
      total_lessons_held: 0,
      attendance_rate: 100,
      attendance_breakdown: { PRESENT: 0, LATE: 0, ABSENT: 0, EXCUSED: 0 },
      exams_count: 0,
      exams_avg_score: 0,
      exams_pass_rate: 0
    };

    const filteredPayments = (reportData?.payments || []).filter(p => {
      if (!reportPaymentSearch) return true;
      const q = reportPaymentSearch.toLowerCase();
      return (
        p.student_name?.toLowerCase().includes(q) ||
        p.login_id?.toLowerCase().includes(q) ||
        p.phone?.toLowerCase().includes(q) ||
        p.payment_method?.toLowerCase().includes(q) ||
        p.note?.toLowerCase().includes(q)
      );
    });

    const filteredExpenses = (reportData?.expenses || []).filter(e => {
      if (!reportExpenseSearch) return true;
      const q = reportExpenseSearch.toLowerCase();
      return (
        e.title?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q)
      );
    });

    const trendMax = Math.max(
      ...((reportData?.trend_data || []).map(t => Math.max(t.income, t.expense))),
      1
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* HEADER & EXPORT ACTIONS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#2563eb' }}>analytics</span>
              <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Hisobotlar & Analitika</h2>
            </div>
            <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '14px' }}>
              O'quv markazining oylik, yillik va istalgan davr bo'yicha moliyaviy, akademik va to'liq faoliyat hisobotlari
            </p>
          </div>

          {/* DOWNLOAD BUTTONS */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleDownloadReport('excel')}
              disabled={reportDownloading !== null}
              style={{
                backgroundColor: '#10b981', color: '#ffffff', border: 'none',
                padding: '10px 18px', borderRadius: '14px', cursor: 'pointer',
                fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 4px 12px rgba(16,185,129,0.2)', opacity: reportDownloading ? 0.7 : 1
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {reportDownloading === 'excel' ? 'hourglass_top' : 'table_view'}
              </span>
              {reportDownloading === 'excel' ? 'Tayyorlanmoqda...' : 'Excel (.xlsx) Yuklab Olish'}
            </button>

            <button
              onClick={() => handleDownloadReport('pdf')}
              disabled={reportDownloading !== null}
              style={{
                backgroundColor: '#2563eb', color: '#ffffff', border: 'none',
                padding: '10px 18px', borderRadius: '14px', cursor: 'pointer',
                fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 4px 12px rgba(37,99,235,0.2)', opacity: reportDownloading ? 0.7 : 1
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {reportDownloading === 'pdf' ? 'hourglass_top' : 'picture_as_pdf'}
              </span>
              {reportDownloading === 'pdf' ? 'Tayyorlanmoqda...' : 'PDF (.pdf) Hisobot'}
            </button>

            <button
              onClick={() => handleDownloadReport('docx')}
              disabled={reportDownloading !== null}
              style={{
                backgroundColor: '#6366f1', color: '#ffffff', border: 'none',
                padding: '10px 18px', borderRadius: '14px', cursor: 'pointer',
                fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 4px 12px rgba(99,102,241,0.2)', opacity: reportDownloading ? 0.7 : 1
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {reportDownloading === 'docx' ? 'hourglass_top' : 'description'}
              </span>
              {reportDownloading === 'docx' ? 'Tayyorlanmoqda...' : 'Word (.docx)'}
            </button>
          </div>
        </div>

        {/* PERIOD SELECTOR & CONTROLS */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 14px rgba(37,99,235,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            
            {/* Period Type Buttons */}
            <div style={{ display: 'inline-flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '14px', gap: '4px' }}>
              <button
                type="button"
                onClick={() => {
                  setReportPeriodType('monthly');
                  fetchReportData('monthly', reportYear, reportMonth, reportStartDate, reportEndDate);
                }}
                style={{
                  padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
                  backgroundColor: reportPeriodType === 'monthly' ? '#2563eb' : 'transparent',
                  color: reportPeriodType === 'monthly' ? '#ffffff' : '#64748b'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_month</span>
                Oylik Hisobot
              </button>

              <button
                type="button"
                onClick={() => {
                  setReportPeriodType('yearly');
                  fetchReportData('yearly', reportYear, reportMonth, reportStartDate, reportEndDate);
                }}
                style={{
                  padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
                  backgroundColor: reportPeriodType === 'yearly' ? '#2563eb' : 'transparent',
                  color: reportPeriodType === 'yearly' ? '#ffffff' : '#64748b'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>bar_chart</span>
                Yillik Hisobot
              </button>

              <button
                type="button"
                onClick={() => {
                  setReportPeriodType('custom');
                  fetchReportData('custom', reportYear, reportMonth, reportStartDate, reportEndDate);
                }}
                style={{
                  padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
                  backgroundColor: reportPeriodType === 'custom' ? '#2563eb' : 'transparent',
                  color: reportPeriodType === 'custom' ? '#ffffff' : '#64748b'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>date_range</span>
                Istalgan Sana Oralig'i
              </button>
            </div>

            {/* Inputs based on period type */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {reportPeriodType === 'monthly' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Yil:</span>
                    <select
                      value={reportYear}
                      onChange={e => {
                        const y = parseInt(e.target.value);
                        setReportYear(y);
                        fetchReportData('monthly', y, reportMonth, reportStartDate, reportEndDate);
                      }}
                      style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '13px', backgroundColor: '#f8fafc', fontWeight: '700' }}
                    >
                      {[2024, 2025, 2026, 2027, 2028].map(y => (
                        <option key={y} value={y}>{y}-yil</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Oy:</span>
                    <select
                      value={reportMonth}
                      onChange={e => {
                        const m = parseInt(e.target.value);
                        setReportMonth(m);
                        fetchReportData('monthly', reportYear, m, reportStartDate, reportEndDate);
                      }}
                      style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '13px', backgroundColor: '#f8fafc', fontWeight: '700' }}
                    >
                      {['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'].map((name, i) => (
                        <option key={i + 1} value={i + 1}>{name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {reportPeriodType === 'yearly' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Yil:</span>
                  <select
                    value={reportYear}
                    onChange={e => {
                      const y = parseInt(e.target.value);
                      setReportYear(y);
                      fetchReportData('yearly', y, reportMonth, reportStartDate, reportEndDate);
                    }}
                    style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '13px', backgroundColor: '#f8fafc', fontWeight: '700' }}
                  >
                    {[2024, 2025, 2026, 2027, 2028].map(y => (
                      <option key={y} value={y}>{y}-yil</option>
                    ))}
                  </select>
                </div>
              )}

              {reportPeriodType === 'custom' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Boshlanish:</span>
                    <input
                      type="date"
                      value={reportStartDate}
                      onChange={e => setReportStartDate(e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '13px', backgroundColor: '#f8fafc' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Tugash:</span>
                    <input
                      type="date"
                      value={reportEndDate}
                      onChange={e => setReportEndDate(e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '13px', backgroundColor: '#f8fafc' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchReportData('custom', reportYear, reportMonth, reportStartDate, reportEndDate)}
                    style={{ padding: '8px 14px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Qo'llash
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => fetchReportData()}
                disabled={reportLoading}
                style={{
                  padding: '8px 16px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb',
                  color: '#ffffff', fontWeight: '800', fontSize: '13px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {reportLoading ? 'hourglass_top' : 'refresh'}
                </span>
                {reportLoading ? 'Yuklanmoqda...' : 'Yangilash'}
              </button>
            </div>
          </div>

          {/* Current Period Badge & Quick Presets */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Tanlangan davr:</span>
              <span style={{ fontSize: '13px', fontWeight: '900', color: '#1e40af', backgroundColor: '#eff6ff', padding: '4px 12px', borderRadius: '8px' }}>
                {reportData?.period_label || 'Hisobot davri'}
              </span>
            </div>

            {/* Quick Presets */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setReportPeriodType('monthly');
                  setReportYear(now.getFullYear());
                  setReportMonth(now.getMonth() + 1);
                  fetchReportData('monthly', now.getFullYear(), now.getMonth() + 1, reportStartDate, reportEndDate);
                }}
                style={{ padding: '4px 10px', borderRadius: '8px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', color: '#475569', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                Bu oy
              </button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  let prevMonth = now.getMonth();
                  let prevYear = now.getFullYear();
                  if (prevMonth === 0) { prevMonth = 12; prevYear -= 1; }
                  setReportPeriodType('monthly');
                  setReportYear(prevYear);
                  setReportMonth(prevMonth);
                  fetchReportData('monthly', prevYear, prevMonth, reportStartDate, reportEndDate);
                }}
                style={{ padding: '4px 10px', borderRadius: '8px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', color: '#475569', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                O'tgan oy
              </button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setReportPeriodType('yearly');
                  setReportYear(now.getFullYear());
                  fetchReportData('yearly', now.getFullYear(), reportMonth, reportStartDate, reportEndDate);
                }}
                style={{ padding: '4px 10px', borderRadius: '8px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', color: '#475569', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                Bu yil ({new Date().getFullYear()})
              </button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const past30 = new Date();
                  past30.setDate(now.getDate() - 30);
                  const s = past30.toISOString().slice(0, 10);
                  const e = now.toISOString().slice(0, 10);
                  setReportPeriodType('custom');
                  setReportStartDate(s);
                  setReportEndDate(e);
                  fetchReportData('custom', reportYear, reportMonth, s, e);
                }}
                style={{ padding: '4px 10px', borderRadius: '8px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', color: '#475569', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                So'nggi 30 kun
              </button>
            </div>
          </div>
        </div>

        {/* REPORT MAIN KPI CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          
          {/* Total Income */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#64748b' }}>Jami Tushum (Daromad)</span>
                <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '6px 0 0' }}>
                  {f.total_income.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: '700', color: '#64748b' }}>UZS</span>
                </h3>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>payments</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#166534', fontWeight: '800', backgroundColor: '#f0fdf4', padding: '4px 10px', borderRadius: '8px', width: 'fit-content' }}>
              <span>{f.payments_count} ta to'lov qabul qilindi</span>
            </div>
          </div>

          {/* Total Expenses */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#64748b' }}>Jami Xarajatlar</span>
                <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '6px 0 0' }}>
                  {f.total_expense.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: '700', color: '#64748b' }}>UZS</span>
                </h3>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>account_balance_wallet</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#991b1b', fontWeight: '800', backgroundColor: '#fef2f2', padding: '4px 10px', borderRadius: '8px', width: 'fit-content' }}>
              <span>{f.expenses_count} ta xarajat qayd etilgan</span>
            </div>
          </div>

          {/* Net Profit */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#64748b' }}>Sof Foyda</span>
                <h3 style={{ fontSize: '24px', fontWeight: '900', color: f.net_profit >= 0 ? '#16a34a' : '#dc2626', margin: '6px 0 0' }}>
                  {f.net_profit.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: '700', color: '#64748b' }}>UZS</span>
                </h3>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: f.net_profit >= 0 ? '#eff6ff' : '#fee2e2', color: f.net_profit >= 0 ? '#2563eb' : '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>trending_up</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: f.net_profit >= 0 ? '#1d4ed8' : '#991b1b', fontWeight: '800', backgroundColor: f.net_profit >= 0 ? '#eff6ff' : '#fef2f2', padding: '4px 10px', borderRadius: '8px', width: 'fit-content' }}>
              <span>Rentabellik: {f.total_income > 0 ? ((f.net_profit / f.total_income) * 100).toFixed(1) : 0}%</span>
            </div>
          </div>

          {/* Active & New Students */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#64748b' }}>O'quvchilar Soni</span>
                <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '6px 0 0' }}>
                  {ac.total_active_students} <span style={{ fontSize: '14px', fontWeight: '700', color: '#64748b' }}>faol o'quvchi</span>
                </h3>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>school</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#1d4ed8', fontWeight: '800', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '8px', width: 'fit-content' }}>
              <span>+{ac.new_students_count} nafar yangi qo'shildi</span>
            </div>
          </div>

          {/* Attendance & Lessons */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#64748b' }}>O'rtacha Davomat</span>
                <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '6px 0 0' }}>
                  {ac.attendance_rate}%
                </h3>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: '#fdf4ff', color: '#c026d3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>fact_check</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#86198f', fontWeight: '800', backgroundColor: '#fdf4ff', padding: '4px 10px', borderRadius: '8px', width: 'fit-content' }}>
              <span>{ac.total_lessons_held} ta dars o'tkazildi</span>
            </div>
          </div>

          {/* Teacher Salaries */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#64748b' }}>O'qituvchilar Maoshi</span>
                <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '6px 0 0' }}>
                  {f.teacher_salaries_paid.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: '700', color: '#64748b' }}>UZS</span>
                </h3>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>badge</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#b45309', fontWeight: '800', backgroundColor: '#fef3c7', padding: '4px 10px', borderRadius: '8px', width: 'fit-content' }}>
              <span>{(reportData?.teachers_breakdown || []).length} ta o'qituvchi</span>
            </div>
          </div>

        </div>

        {/* VISUAL TRENDS & BREAKDOWNS (Chart + Payment Methods + Attendance) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
          
          {/* Trend Dynamics Bar Chart */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 14px rgba(37,99,235,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Moliya Dinamikasi</h3>
                <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '13px' }}>Tushum va xarajatlarning vaqt bo'yicha taqsimoti</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '12px', fontWeight: '700' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#10b981', display: 'inline-block' }}></span> Tushum
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#ef4444', display: 'inline-block' }}></span> Xarajat
                </span>
              </div>
            </div>

            {/* Custom Bar Visualization */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              {(reportData?.trend_data || []).map((t, idx) => {
                const incPct = Math.min(100, Math.round((t.income / trendMax) * 100));
                const expPct = Math.min(100, Math.round((t.expense / trendMax) * 100));
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                      <span>{t.label}</span>
                      <span>
                        <strong style={{ color: '#10b981' }}>+{t.income.toLocaleString()}</strong> / <strong style={{ color: '#ef4444' }}>-{t.expense.toLocaleString()}</strong> UZS
                      </span>
                    </div>
                    {/* Double Bar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', backgroundColor: '#f8fafc', padding: '4px', borderRadius: '8px' }}>
                      <div style={{ height: '8px', borderRadius: '4px', backgroundColor: '#10b981', width: `${Math.max(incPct, 2)}%`, transition: 'width 0.4s ease' }} title={`Tushum: ${t.income.toLocaleString()} UZS`}></div>
                      <div style={{ height: '8px', borderRadius: '4px', backgroundColor: '#ef4444', width: `${Math.max(expPct, 2)}%`, transition: 'width 0.4s ease' }} title={`Xarajat: ${t.expense.toLocaleString()} UZS`}></div>
                    </div>
                  </div>
                );
              })}
              {(!reportData?.trend_data || reportData.trend_data.length === 0) && (
                <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                  Ma'lumotlar mavjud emas
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods & Attendance Distribution */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Payment Methods */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, boxShadow: '0 4px 14px rgba(37,99,235,0.04)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>To'lov Usullari Taqsimoti</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(f.by_payment_method || {}).map(([method, amount]) => {
                  const pct = f.total_income > 0 ? Math.round((amount / f.total_income) * 100) : 0;
                  return (
                    <div key={method} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700' }}>
                        <span style={{ color: '#0f172a' }}>{method}</span>
                        <span style={{ color: '#2563eb' }}>{amount.toLocaleString()} UZS ({pct}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#eff6ff', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#2563eb', borderRadius: '4px', transition: 'width 0.3s' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Attendance Distribution */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, boxShadow: '0 4px 14px rgba(37,99,235,0.04)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Davomat Tahlili</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' }}>
                <div style={{ backgroundColor: '#dcfce7', padding: '12px 8px', borderRadius: '14px', border: '1px solid #bbf7d0' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#166534', display: 'block' }}>Qatnashdi</span>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: '#166534' }}>{ac.attendance_breakdown?.PRESENT || 0}</span>
                </div>
                <div style={{ backgroundColor: '#fef3c7', padding: '12px 8px', borderRadius: '14px', border: '1px solid #fde68a' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#92400e', display: 'block' }}>Kech qoldi</span>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: '#92400e' }}>{ac.attendance_breakdown?.LATE || 0}</span>
                </div>
                <div style={{ backgroundColor: '#fee2e2', padding: '12px 8px', borderRadius: '14px', border: '1px solid #fecaca' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#991b1b', display: 'block' }}>Kelmadi</span>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: '#991b1b' }}>{ac.attendance_breakdown?.ABSENT || 0}</span>
                </div>
                <div style={{ backgroundColor: '#eff6ff', padding: '12px 8px', borderRadius: '14px', border: '1px solid #bfdbfe' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#1e40af', display: 'block' }}>Sababli</span>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: '#1e40af' }}>{ac.attendance_breakdown?.EXCUSED || 0}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* SUB-TABS DETAILED DATA SECTION */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 4px 14px rgba(37,99,235,0.04)' }}>
          
          {/* Sub Tab Switcher */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'overview', label: '📖 Fanlar Samaradorligi', count: (reportData?.courses_breakdown || []).length },
                { id: 'teachers', label: '👨‍🏫 O\'qituvchilar', count: (reportData?.teachers_breakdown || []).length },
                { id: 'payments', label: '💳 To\'lovlar Tarixi', count: (reportData?.payments || []).length },
                { id: 'expenses', label: '🧾 Xarajatlar Tarixi', count: (reportData?.expenses || []).length }
              ].map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setReportActiveSubTab(st.id)}
                  style={{
                    padding: '10px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                    fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
                    backgroundColor: reportActiveSubTab === st.id ? '#2563eb' : '#f8fafc',
                    color: reportActiveSubTab === st.id ? '#ffffff' : '#64748b'
                  }}
                >
                  <span>{st.label}</span>
                  <span style={{ fontSize: '11px', backgroundColor: reportActiveSubTab === st.id ? 'rgba(255,255,255,0.25)' : '#e2e8f0', padding: '2px 6px', borderRadius: '10px', color: reportActiveSubTab === st.id ? '#fff' : '#475569' }}>
                    {st.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Sub-tab quick search */}
            {reportActiveSubTab === 'payments' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', padding: '6px 12px', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748b' }}>search</span>
                <input
                  type="text"
                  placeholder="To'lovlardan qidirish..."
                  value={reportPaymentSearch}
                  onChange={e => setReportPaymentSearch(e.target.value)}
                  style={{ border: 'none', background: 'none', outline: 'none', fontSize: '13px', width: '180px' }}
                />
              </div>
            )}

            {reportActiveSubTab === 'expenses' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', padding: '6px 12px', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748b' }}>search</span>
                <input
                  type="text"
                  placeholder="Xarajatlardan qidirish..."
                  value={reportExpenseSearch}
                  onChange={e => setReportExpenseSearch(e.target.value)}
                  style={{ border: 'none', background: 'none', outline: 'none', fontSize: '13px', width: '180px' }}
                />
              </div>
            )}
          </div>

          {/* SUB TAB 1: COURSES */}
          {reportActiveSubTab === 'overview' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: '800' }}>
                    <th style={{ padding: '14px 16px' }}>Fan Nomi</th>
                    <th style={{ padding: '14px 16px' }}>Oylik Narxi</th>
                    <th style={{ padding: '14px 16px' }}>Davomiyligi</th>
                    <th style={{ padding: '14px 16px' }}>Faol Guruhlar</th>
                    <th style={{ padding: '14px 16px' }}>O'quvchilar Soni</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right' }}>Oylik Prognoz Tushum</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData?.courses_breakdown || []).map((crs, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', fontWeight: '600' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '800', color: '#0f172a' }}>{crs.title}</td>
                      <td style={{ padding: '14px 16px' }}>{crs.price_monthly.toLocaleString()} UZS</td>
                      <td style={{ padding: '14px 16px' }}>{crs.duration_months} oy</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '6px', fontWeight: '800' }}>
                          {crs.active_groups} ta guruh
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '4px 10px', borderRadius: '6px', fontWeight: '800' }}>
                          {crs.total_students} nafar o'quvchi
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '900', color: '#2563eb' }}>
                        {crs.estimated_monthly_revenue.toLocaleString()} UZS
                      </td>
                    </tr>
                  ))}
                  {(!reportData?.courses_breakdown || reportData.courses_breakdown.length === 0) && (
                    <tr>
                      <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>Fanlar ma'lumoti mavjud emas</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* SUB TAB 2: TEACHERS */}
          {reportActiveSubTab === 'teachers' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: '800' }}>
                    <th style={{ padding: '14px 16px' }}>O'qituvchi F.I.Sh</th>
                    <th style={{ padding: '14px 16px' }}>Login ID</th>
                    <th style={{ padding: '14px 16px' }}>Telefon</th>
                    <th style={{ padding: '14px 16px' }}>Guruhlar</th>
                    <th style={{ padding: '14px 16px' }}>O'quvchilar</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right' }}>To'langan Oylik</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData?.teachers_breakdown || []).map((t, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', fontWeight: '600' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '800', color: '#0f172a' }}>{t.full_name}</td>
                      <td style={{ padding: '14px 16px', color: '#2563eb', fontWeight: '800' }}>{t.login_id}</td>
                      <td style={{ padding: '14px 16px' }}>{t.phone}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '6px', fontWeight: '800' }}>
                          {t.groups_count} ta guruh
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '4px 10px', borderRadius: '6px', fontWeight: '800' }}>
                          {t.students_count} nafar
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '900', color: '#16a34a' }}>
                        {t.salary_paid.toLocaleString()} UZS
                      </td>
                    </tr>
                  ))}
                  {(!reportData?.teachers_breakdown || reportData.teachers_breakdown.length === 0) && (
                    <tr>
                      <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>O'qituvchilar ma'lumoti mavjud emas</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* SUB TAB 3: PAYMENTS */}
          {reportActiveSubTab === 'payments' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: '800' }}>
                    <th style={{ padding: '14px 16px' }}>Chek ID</th>
                    <th style={{ padding: '14px 16px' }}>Sana</th>
                    <th style={{ padding: '14px 16px' }}>O'quvchi</th>
                    <th style={{ padding: '14px 16px' }}>Login ID</th>
                    <th style={{ padding: '14px 16px' }}>Summa</th>
                    <th style={{ padding: '14px 16px' }}>To'lov Turi</th>
                    <th style={{ padding: '14px 16px' }}>Oy Uchun</th>
                    <th style={{ padding: '14px 16px' }}>Izoh</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center' }}>Amal</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', fontWeight: '600' }}>
                      <td style={{ padding: '14px 16px', color: '#2563eb', fontWeight: '800' }}>#{p.id}</td>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>{p.created_at}</td>
                      <td style={{ padding: '14px 16px', fontWeight: '800', color: '#0f172a' }}>{p.student_name}</td>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>{p.login_id}</td>
                      <td style={{ padding: '14px 16px', fontWeight: '900', color: '#16a34a' }}>
                        {p.amount.toLocaleString()} UZS
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', fontSize: '11px' }}>
                          {p.payment_method}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>{p.month_for}</td>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>{p.note || '-'}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentForReceipt(p)}
                          style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', cursor: 'pointer', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>receipt_long</span> Chek
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan="9" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>Ushbu davrda to'lovlar topilmadi</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* SUB TAB 4: EXPENSES */}
          {reportActiveSubTab === 'expenses' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: '800' }}>
                    <th style={{ padding: '14px 16px' }}>№</th>
                    <th style={{ padding: '14px 16px' }}>Sana</th>
                    <th style={{ padding: '14px 16px' }}>Xarajat Nomi</th>
                    <th style={{ padding: '14px 16px' }}>Kategoriya</th>
                    <th style={{ padding: '14px 16px' }}>Summa</th>
                    <th style={{ padding: '14px 16px' }}>Tavsif</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((e, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', fontWeight: '600' }}>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>#{e.id}</td>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>{e.date}</td>
                      <td style={{ padding: '14px 16px', fontWeight: '800', color: '#0f172a' }}>{e.title}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', fontSize: '11px' }}>
                          {e.category}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: '900', color: '#dc2626' }}>
                        {e.amount.toLocaleString()} UZS
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>{e.description || '-'}</td>
                    </tr>
                  ))}
                  {filteredExpenses.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>Ushbu davrda xarajatlar topilmadi</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff', color: '#0f172a', fontFamily: "'Inter', sans-serif" }}>
      
      {/* SIDEBAR */}
      <aside style={{
        width: sidebarCollapsed ? '90px' : '280px',
        backgroundColor: '#ffffff', borderRight: '1px solid #bfdbfe',
        display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease'
      }}>
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #eff6ff', cursor: 'pointer' }} onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
          <img src="/logo.png" alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #2563eb' }} />
          {!sidebarCollapsed && <h1 style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}>Ta'lim Plus</h1>}
        </div>
        
        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '12px',
                border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '14px',
                backgroundColor: activeTab === item.id ? '#2563eb' : 'transparent',
                color: activeTab === item.id ? '#ffffff' : '#475569'
              }}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid #eff6ff' }}>
          <button onClick={handleLogout} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#fee2e2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '800' }}>
            <span className="material-symbols-outlined">logout</span>
            {!sidebarCollapsed && <span>Chiqish</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        <header style={{ padding: '16px 32px', backgroundColor: '#ffffff', borderBottom: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f8fafc', padding: '8px 16px', borderRadius: '12px', border: '1px solid #bfdbfe', width: '300px' }}>
            <span className="material-symbols-outlined" style={{ color: '#2563eb' }}>search</span>
            <input type="text" placeholder="Qidiruv..." style={{ border: 'none', background: 'none', outline: 'none', width: '100%' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: '800', color: '#0f172a' }}>{adminName}</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>{adminName.charAt(0)}</div>
          </div>
        </header>

        {notificationToast && (
          <div style={{ margin: '20px 32px 0', padding: '16px', backgroundColor: '#eff6ff', border: '1px solid #2563eb', borderRadius: '12px', color: '#1d4ed8', fontWeight: '800', display: 'flex', justifyContent: 'space-between' }}>
            <span>{notificationToast}</span>
            <button onClick={() => setNotificationToast('')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer' }}><span className="material-symbols-outlined">close</span></button>
          </div>
        )}

        <div style={{ padding: '32px', flex: 1, backgroundColor: '#f8fafc' }}>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'leads' && renderLeads()}
          {activeTab === 'reports' && renderReports()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'courses' && renderCourses()}
          {activeTab === 'groups' && renderGroups()}
          {activeTab === 'payments' && renderPayments()}
          {activeTab === 'schedule' && renderSchedule()}
          {activeTab === 'exams' && renderExams()}
          {activeTab === 'attendance' && renderAttendance()}
        </div>
      </main>

      {/* MODALS */}
      {showAddUserModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '420px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>Yangi Foydalanuvchi</h3>
            <form onSubmit={async e => {
              e.preventDefault();
              const full_name = e.target.fullname.value.trim();
              const rawPhone = e.target.phone.value;
              const rawParentPhone = e.target.parent_phone.value;
              const password = e.target.password.value ? e.target.password.value.trim() : '123456';
              const role = e.target.role.value;

              if (!full_name) {
                triggerNotification("Iltimos, ism va familiyani kiriting!");
                return;
              }

              const phone = normalizePhone(rawPhone);
              if (!phone || phone.length < 9) {
                triggerNotification("Telefon raqami noto'g'ri kiritildi! Masalan: +998901234567");
                return;
              }

              const parent_phone = normalizePhone(rawParentPhone);

              setUserSubmitting(true);
              try {
                const res = await usersAPI.createUser({ full_name, phone, parent_phone, role, password });
                if (res && res.id) {
                  setUsers(prev => [res, ...prev]);
                  triggerNotification(`Yangi ${role === 'STUDENT' ? "o'quvchi" : role === 'TEACHER' ? "o'qituvchi" : "admin"} muvaffaqiyatli qo'shildi! ID: ${res.login_id} ✅`);
                  setShowAddUserModal(false);
                }
              } catch(err) {
                const detail = err.response?.data?.detail || "Foydalanuvchi yaratishda xatolik yuz berdi";
                triggerNotification(detail);
              } finally {
                setUserSubmitting(false);
              }
            }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Ism va familiya *</label>
              <input name="fullname" type="text" placeholder="Masalan: Ali Valiyev" required style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc' }} />
              
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Telefon raqam *</label>
              <input name="phone" type="tel" defaultValue="+998" placeholder="+998901234567" required style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc' }} />
              
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Ota-ona telefon raqami (ixtiyoriy)</label>
              <input name="parent_phone" type="tel" defaultValue="+998" placeholder="+998901234567" style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc' }} />
              
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Parol (bo'sh qoldirilsa: 123456)</label>
              <input name="password" type="text" placeholder="Standart: 123456" style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc' }} />
              
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Rol (lavozim) *</label>
              <select name="role" style={{ width: '100%', padding: '12px', marginBottom: '24px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc', fontWeight: '700' }}>
                <option value="STUDENT">O'quvchi</option>
                <option value="TEACHER">O'qituvchi</option>
                <option value="ADMIN">Admin</option>
              </select>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowAddUserModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc', cursor: 'pointer', fontWeight: '700' }}>Bekor qilish</button>
                <button type="submit" disabled={userSubmitting} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: userSubmitting ? '#93c5fd' : '#2563eb', color: '#fff', cursor: userSubmitting ? 'not-allowed' : 'pointer', fontWeight: '800' }}>
                  {userSubmitting ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editUserModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '420px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>Tahrirlash: {editUserModal.full_name}</h3>
            <p style={{ fontSize: '13px', color: '#2563eb', fontWeight: '800', marginBottom: '20px' }}>ID: {editUserModal.login_id}</p>
            
            <form onSubmit={async e => {
              e.preventDefault();
              const full_name = e.target.fullname.value.trim();
              const rawPhone = e.target.phone.value;
              const rawParentPhone = e.target.parent_phone.value;
              const role = e.target.role.value;

              if (!full_name) {
                triggerNotification("Iltimos, ism va familiyani kiriting!");
                return;
              }

              const phone = normalizePhone(rawPhone);
              if (!phone || phone.length < 9) {
                triggerNotification("Telefon raqami noto'g'ri kiritildi! Masalan: +998901234567");
                return;
              }

              const parent_phone = normalizePhone(rawParentPhone);
              const updateData = { full_name, phone, parent_phone, role };

              setUserSubmitting(true);
              try {
                const res = await usersAPI.updateUser(editUserModal.id, updateData);
                setUsers(prev => prev.map(u => u.id === editUserModal.id ? { ...u, ...(res || updateData) } : u));
                setEditUserModal(null);
                triggerNotification("Foydalanuvchi ma'lumotlari muvaffaqiyatli saqlandi! ✅");
              } catch(err) {
                const detail = err.response?.data?.detail || "Foydalanuvchini tahrirlashda xatolik yuz berdi";
                triggerNotification(detail);
              } finally {
                setUserSubmitting(false);
              }
            }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Ism va familiya *</label>
              <input name="fullname" defaultValue={editUserModal.full_name} required style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc' }} />
              
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Telefon raqam *</label>
              <input name="phone" type="tel" defaultValue={editUserModal.phone || '+998'} required style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc' }} />
              
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Ota-ona telefon raqami</label>
              <input name="parent_phone" type="tel" defaultValue={editUserModal.parent_phone || '+998'} style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc' }} />
              
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Rol (lavozim) *</label>
              <select name="role" defaultValue={editUserModal.role} style={{ width: '100%', padding: '12px', marginBottom: '24px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc', fontWeight: '700' }}>
                <option value="STUDENT">O'quvchi</option>
                <option value="TEACHER">O'qituvchi</option>
                <option value="ADMIN">Admin</option>
              </select>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setEditUserModal(null)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc', cursor: 'pointer', fontWeight: '700' }}>Bekor qilish</button>
                <button type="submit" disabled={userSubmitting} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: userSubmitting ? '#93c5fd' : '#2563eb', color: '#fff', cursor: userSubmitting ? 'not-allowed' : 'pointer', fontWeight: '800' }}>
                  {userSubmitting ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFreezeModal && selectedStudentForFreeze && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '400px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '900' }}>Muzlatish ❄️: {selectedStudentForFreeze.full_name}</h3>
            <form onSubmit={async e => {
              e.preventDefault();
              const studentId = selectedStudentForFreeze.id;
              try {
                await usersAPI.updateUser(studentId, { student_status: 'FROZEN' });
                setUsers(prev => prev.map(u => u.id === studentId ? { ...u, student_status: 'FROZEN' } : u));
                triggerNotification(`${selectedStudentForFreeze.full_name} muzlatildi ❄️`);
              } catch(err) {
                triggerNotification("Muzlatishda xatolik yuz berdi");
              }
              setShowFreezeModal(false);
            }}>
              <label style={{ fontSize: '12px', fontWeight: '800' }}>Boshlanish</label>
              <input type="date" required style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }} />
              <label style={{ fontSize: '12px', fontWeight: '800' }}>Tugash</label>
              <input type="date" required style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }} />
              <input type="text" placeholder="Sabab" required style={{ width: '100%', padding: '12px', marginBottom: '24px', borderRadius: '12px', border: '1px solid #bfdbfe' }} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowFreezeModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc', cursor: 'pointer' }}>Bekor qilish</button>
                <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: '800' }}>Muzlatish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddCourseModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '420px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '900' }}>Yangi Fan</h3>
            <form onSubmit={async e => {
              e.preventDefault();
              const title = e.target.title.value;
              const price_monthly = parseFloat(e.target.price_monthly.value);
              const duration_months = parseInt(e.target.duration_months.value);
              const description = e.target.description.value || null;
              try {
                const res = await coursesAPI.createCourse({ title, price_monthly, duration_months, description });
                if (res && res.id) {
                  setCourses(prev => [res, ...prev]);
                  triggerNotification(`"${title}" fani qo'shildi`);
                }
              } catch(err) { triggerNotification("Fan qo'shishda xatolik"); }
              setShowAddCourseModal(false);
            }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Fan nomi</label>
              <input name="title" type="text" placeholder="Masalan: General English" required style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }} />
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Oylik to'lov summasi (so'm)</label>
              <input name="price_monthly" type="number" placeholder="Masalan: 500000" required style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }} />
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Davomiyligi (oy)</label>
              <input name="duration_months" type="number" placeholder="Masalan: 3" required style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }} />
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Tavsif (ixtiyoriy)</label>
              <textarea name="description" placeholder="Fan haqida qisqa ma'lumot" style={{ width: '100%', padding: '12px', marginBottom: '24px', borderRadius: '12px', border: '1px solid #bfdbfe', resize: 'none' }}></textarea>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowAddCourseModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc', cursor: 'pointer' }}>Bekor qilish</button>
                <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: '800' }}>Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editCourseModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '420px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '900' }}>Tahrirlash: {editCourseModal.title}</h3>
            <form onSubmit={async e => {
              e.preventDefault();
              const title = e.target.title.value;
              const price_monthly = parseFloat(e.target.price_monthly.value);
              const duration_months = parseInt(e.target.duration_months.value);
              const description = e.target.description.value || null;
              try {
                await coursesAPI.updateCourse(editCourseModal.id, { title, price_monthly, duration_months, description });
                setCourses(prev => prev.map(c => c.id === editCourseModal.id ? { ...c, title, price_monthly, duration_months, description } : c));
                triggerNotification("Fan ma'lumotlari saqlandi");
              } catch(err) { triggerNotification("Tahrirlashda xatolik"); }
              setEditCourseModal(null);
            }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Fan nomi</label>
              <input name="title" type="text" defaultValue={editCourseModal.title} required style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }} />
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Oylik to'lov summasi (so'm)</label>
              <input name="price_monthly" type="number" defaultValue={editCourseModal.price_monthly} required style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }} />
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Davomiyligi (oy)</label>
              <input name="duration_months" type="number" defaultValue={editCourseModal.duration_months} required style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }} />
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Tavsif (ixtiyoriy)</label>
              <textarea name="description" defaultValue={editCourseModal.description || ''} style={{ width: '100%', padding: '12px', marginBottom: '24px', borderRadius: '12px', border: '1px solid #bfdbfe', resize: 'none' }}></textarea>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setEditCourseModal(null)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc', cursor: 'pointer' }}>Bekor qilish</button>
                <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: '800' }}>Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddGroupModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '440px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '900' }}>Yangi Guruh</h3>
            <form onSubmit={async e => {
              e.preventDefault();
              const name = e.target.group_name.value.trim();
              const course_id = parseInt(e.target.course_id.value);
              const teacher_id = parseInt(e.target.teacher_id.value);
              const room_name = e.target.room_name.value.trim();
              const days_of_week = e.target.days_of_week.value;
              const start_time = e.target.start_time.value;
              const end_time = e.target.end_time.value;

              try {
                const res = await groupsAPI.createGroup({ name, course_id, teacher_id, room_name, days_of_week, start_time, end_time });
                if(res && res.id) {
                  setGroups(prev => [res, ...prev]);
                  const r = await coursesAPI.getRooms().catch(() => []);
                  if (Array.isArray(r)) setRooms(r);
                  triggerNotification(`"${name}" guruhi muvaffaqiyatli ochildi! (Xona: ${room_name})`);
                  setShowAddGroupModal(false);
                }
              } catch(err) {
                const detail = err.response?.data?.detail || "Guruh yaratishda xatolik yuz berdi";
                triggerNotification(detail);
              }
            }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Guruh nomi</label>
              <input name="group_name" type="text" placeholder="Masalan: Python Backend 01" required style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }} />
              
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Fanni tanlang</label>
              <select name="course_id" required style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.price_monthly?.toLocaleString()} UZS)</option>)}
              </select>

              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>O'qituvchini tanlang</label>
              <select name="teacher_id" required style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                {users.filter(u => u.role === 'TEACHER').map(t => <option key={t.id} value={t.id}>{t.full_name} ({t.login_id})</option>)}
                {users.filter(u => u.role === 'TEACHER').length === 0 && <option value="1">Bosh Ustoz</option>}
              </select>

              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>
                Dars xonasi (qo'lda yozing yoki mavjud xonalardan tanlang)
              </label>
              <input 
                name="room_name" 
                type="text" 
                list="add-room-datalist" 
                placeholder="Masalan: 3-xona, IT Lab, 204-xona" 
                required 
                style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }} 
              />
              <datalist id="add-room-datalist">
                {rooms.map(r => (
                  <option key={r.id} value={r.name}>{r.capacity ? `(${r.capacity} o'rin)` : ''}</option>
                ))}
              </datalist>

              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Dars kunlari</label>
              <select name="days_of_week" style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                <option value="MON,WED,FRI">Dush / Chor / Jum (MON,WED,FRI)</option>
                <option value="TUE,THU,SAT">Sesh / Pay / Shan (TUE,THU,SAT)</option>
                <option value="ALL">Har kuni (Dushanba - Shanba)</option>
              </select>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Boshlanish vaqti</label>
                  <input name="start_time" type="text" defaultValue="14:00" required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Tugash vaqti</label>
                  <input name="end_time" type="text" defaultValue="16:00" required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowAddGroupModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc', cursor: 'pointer' }}>Bekor qilish</button>
                <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: '800' }}>Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editGroupModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '440px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '900' }}>Tahrirlash: {editGroupModal.name}</h3>
            <form onSubmit={async e => {
              e.preventDefault();
              const name = e.target.group_name.value.trim();
              const course_id = parseInt(e.target.course_id.value);
              const teacher_id = parseInt(e.target.teacher_id.value);
              const room_name = e.target.room_name.value.trim();
              const days_of_week = e.target.days_of_week.value;
              const start_time = e.target.start_time.value;
              const end_time = e.target.end_time.value;

              try {
                const res = await groupsAPI.updateGroup(editGroupModal.id, { name, course_id, teacher_id, room_name, days_of_week, start_time, end_time });
                if(res) {
                  setGroups(prev => prev.map(g => g.id === editGroupModal.id ? { ...g, ...res } : g));
                  const r = await coursesAPI.getRooms().catch(() => []);
                  if (Array.isArray(r)) setRooms(r);
                  triggerNotification("Guruh ma'lumotlari yangilandi!");
                  setEditGroupModal(null);
                }
              } catch(err) {
                const detail = err.response?.data?.detail || "Guruhni tahrirlashda xatolik";
                triggerNotification(detail);
              }
            }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Guruh nomi</label>
              <input name="group_name" defaultValue={editGroupModal.name} type="text" required style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }} />
              
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Fanni tanlang</label>
              <select name="course_id" defaultValue={editGroupModal.course_id} required style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>

              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>O'qituvchini tanlang</label>
              <select name="teacher_id" defaultValue={editGroupModal.teacher_id} required style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                {users.filter(u => u.role === 'TEACHER').map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              </select>

              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>
                Dars xonasi (qo'lda yozing yoki mavjud xonalardan tanlang)
              </label>
              <input 
                name="room_name" 
                type="text" 
                defaultValue={rooms.find(r => r.id === editGroupModal.room_id)?.name || `${editGroupModal.room_id}-xona`} 
                list="edit-room-datalist" 
                required 
                style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }} 
              />
              <datalist id="edit-room-datalist">
                {rooms.map(r => (
                  <option key={r.id} value={r.name} />
                ))}
              </datalist>

              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Dars kunlari</label>
              <select name="days_of_week" defaultValue={editGroupModal.days_of_week} style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                <option value="MON,WED,FRI">Dush / Chor / Jum (MON,WED,FRI)</option>
                <option value="TUE,THU,SAT">Sesh / Pay / Shan (TUE,THU,SAT)</option>
                <option value="ALL">Har kuni (Dushanba - Shanba)</option>
              </select>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Boshlanish vaqti</label>
                  <input name="start_time" type="text" defaultValue={editGroupModal.start_time} required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Tugash vaqti</label>
                  <input name="end_time" type="text" defaultValue={editGroupModal.end_time} required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setEditGroupModal(null)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc', cursor: 'pointer' }}>Bekor qilish</button>
                <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: '800' }}>Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignStudentModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '480px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>O'quvchini Guruhga Biriktirish</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Guruh, individual tarif (100% Grant, 50% chegirma, bola/katta tarifi yoki maxsus narx) ni belgilang.</p>
            <form onSubmit={async e => {
              e.preventDefault();
              const studentIdVal = e.target.student_id?.value;
              const groupIdVal = e.target.group_id?.value;

              if (!studentIdVal || !groupIdVal) {
                triggerNotification("Iltimos, o'quvchi va guruhni tanlang!");
                return;
              }

              const studentId = parseInt(studentIdVal);
              const groupId = parseInt(groupIdVal);

              if (isNaN(studentId) || isNaN(groupId)) {
                triggerNotification("Iltimos, o'quvchi va guruhni to'g'ri tanlang!");
                return;
              }

              const customPriceVal = assignTariffType === 'GRANT_100' 
                ? 0 
                : (assignCustomPrice && String(assignCustomPrice).trim() !== '' ? parseFloat(assignCustomPrice) : null);

              setAssignSubmitting(true);
              try {
                const res = await groupsAPI.addStudentToGroup(groupId, studentId, {
                  tariff_type: assignTariffType === 'STANDART' ? 'STANDARD' : assignTariffType,
                  discount_type: assignTariffType === 'STANDART' ? 'STANDARD' : assignTariffType,
                  custom_price: customPriceVal,
                  discount_note: assignDiscountNote ? String(assignDiscountNote).trim() : null
                });
                triggerNotification(res?.message || "O'quvchi guruhga muvaffaqiyatli biriktirildi! 🎓");
                
                // Refresh groups list
                try {
                  const grps = await groupsAPI.getGroups();
                  if (Array.isArray(grps)) setGroups(grps);
                } catch(ge) {
                  console.error("Groups reload error:", ge);
                }

                // Refresh group detail modal if open
                if (selectedGroupDetail && (selectedGroupDetail.id === groupId || selectedGroupDetail.id === assignSelectedGroupId)) {
                  try {
                    const updatedDetail = await groupsAPI.getGroupDetail(groupId);
                    if (updatedDetail) setSelectedGroupDetail(updatedDetail);
                  } catch(de) {
                    console.error("Group detail reload error:", de);
                  }
                }

                setShowAssignStudentModal(false);
                setAssignTariffType('STANDART');
                setAssignCustomPrice('');
                setAssignDiscountNote('');
                setAssignSelectedGroupId(null);
                setAssignSelectedStudentId(null);
              } catch(err) {
                const detail = err.response?.data?.detail || err.message || "Biriktirishda xatolik yuz berdi";
                triggerNotification(detail);
              } finally {
                setAssignSubmitting(false);
              }
            }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>O'quvchini tanlang *</label>
              <select 
                name="student_id" 
                required 
                defaultValue={assignSelectedStudentId || ((users || []).filter(u => u && u.role === 'STUDENT')[0]?.id || '')} 
                style={{ width: '100%', padding: '12px', marginBottom: '14px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc', fontSize: '14px' }}
              >
                {(users || []).filter(u => u && u.role === 'STUDENT').length === 0 ? (
                  <option value="" disabled>O'quvchilar mavjud emas (Avval o'quvchi qo'shing)</option>
                ) : (
                  (users || []).filter(u => u && u.role === 'STUDENT').map(s => (
                    <option key={s.id} value={s.id}>{s.full_name || "O'quvchi"} (ID: {s.login_id || s.id})</option>
                  ))
                )}
              </select>

              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Guruhni tanlang *</label>
              <select 
                name="group_id" 
                required 
                defaultValue={assignSelectedGroupId || ((groups || [])[0]?.id || '')} 
                style={{ width: '100%', padding: '12px', marginBottom: '14px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc', fontSize: '14px' }}
              >
                {(groups || []).length === 0 ? (
                  <option value="" disabled>Guruhlar mavjud emas (Avval guruh oching)</option>
                ) : (
                  (groups || []).filter(Boolean).map(g => {
                    const courseTitle = (courses || []).find(c => c && c.id === g.course_id)?.title || 'Fan';
                    return (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.days_of_week || 'Kunlar'} • {courseTitle})
                      </option>
                    );
                  })
                )}
              </select>

              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>To'lov Tarifi / Imtiyoz</label>
              <select 
                value={assignTariffType} 
                onChange={(e) => setAssignTariffType(e.target.value)} 
                style={{ width: '100%', padding: '12px', marginBottom: '14px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1e40af', fontWeight: '700', fontSize: '14px' }}
              >
                <option value="STANDART">Standart Tarif (Kurs to'liq oylik to'lovi)</option>
                <option value="GRANT_100">100% Imtiyozli / Grant (0 UZS)</option>
                <option value="DISCOUNT_50">50% Yarim Imtiyoz (Yarim to'lov)</option>
                <option value="CHILD_TARIFF">Bolalar Tarifi (Kichik yoshdagilar narxi)</option>
                <option value="ADULT_TARIFF">Kattalar Tarifi (Katta yoshdagilar narxi)</option>
                <option value="CUSTOM_PRICE">Maxsus / Kelishilgan Narx (Ixtiyoriy summa)</option>
              </select>

              {assignTariffType !== 'STANDART' && assignTariffType !== 'STANDARD' && assignTariffType !== 'GRANT_100' && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>
                    {assignTariffType === 'DISCOUNT_50' ? "Oylik to'lov summasi (Bo'sh qoldirilsa kurs narxining 50% olinadi)" : "Belgilangan oylik narx (UZS) *"}
                  </label>
                  <input 
                    type="number" 
                    placeholder="Masalan: 350000" 
                    value={assignCustomPrice} 
                    onChange={e => setAssignCustomPrice(e.target.value)}
                    required={assignTariffType === 'CUSTOM_PRICE' || assignTariffType === 'CHILD_TARIFF' || assignTariffType === 'ADULT_TARIFF'}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc', fontSize: '14px' }} 
                  />
                </div>
              )}

              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Imtiyoz / Tarif Sababi (Izoh)</label>
              <input 
                type="text" 
                placeholder="Masalan: Olimpiada g'olibi, SAT guruh fiks, 2-farzand..." 
                value={assignDiscountNote} 
                onChange={e => setAssignDiscountNote(e.target.value)}
                style={{ width: '100%', padding: '12px', marginBottom: '24px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc', fontSize: '14px' }} 
              />

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => { setShowAssignStudentModal(false); setAssignSelectedGroupId(null); setAssignSelectedStudentId(null); }} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc', cursor: 'pointer', fontWeight: '700' }}>Bekor qilish</button>
                <button type="submit" disabled={assignSubmitting} style={{ flex: 1.5, padding: '12px', borderRadius: '12px', border: 'none', background: assignSubmitting ? '#93c5fd' : '#2563eb', color: '#fff', cursor: assignSubmitting ? 'not-allowed' : 'pointer', fontWeight: '800' }}>
                  {assignSubmitting ? "Biriktirilmoqda..." : "Biriktirish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '28px', width: '560px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #bfdbfe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>To'lov Qabul Qilish</h3>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>O'quvchi kursini aniqlash, qarz/haqdorlik hisobi va Telegram chek</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowPaymentModal(false)}
                style={{ width: '36px', height: '36px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={async e => {
              e.preventDefault();
              if (!selectedStudentForPayment) {
                triggerNotification("Iltimos, avval o'quvchini tanlang!");
                return;
              }
              const amount = parseFloat(paymentAmountVal);
              if (isNaN(amount) || amount <= 0) {
                triggerNotification("Iltimos, to'g'ri to'lov summasini kiriting!");
                return;
              }

              setPaymentSubmitting(true);
              try {
                const res = await financeAPI.recordPayment({
                  student_id: selectedStudentForPayment.id,
                  amount: amount,
                  month_for: paymentMonthVal,
                  payment_method: paymentMethodVal,
                  note: paymentNoteVal || null
                });
                triggerNotification(res?.message || "To'lov muvaffaqiyatli qabul qilindi!");
                
                const [p, st, debts] = await Promise.all([
                  financeAPI.getPayments().catch(() => []),
                  financeAPI.getDashboardStats().catch(() => null),
                  financeAPI.getDebtors().catch(() => [])
                ]);
                if (Array.isArray(p)) setPayments(p);
                if (Array.isArray(debts)) setDebtorsList(debts);
                if (st) {
                  setStats({
                    totalIncome: st.total_income || 0,
                    totalExpense: st.total_expense || 0,
                    activeStudents: st.active_students || 0,
                    activeTeachers: st.active_teachers || 0,
                    debtorsCount: Array.isArray(debts) ? debts.length : 0
                  });
                }
                setShowPaymentModal(false);
              } catch(err) {
                const detail = err.response?.data?.detail || "To'lovni saqlashda xatolik yuz berdi";
                triggerNotification(detail);
              }
              setPaymentSubmitting(false);
            }}>

              {/* 1. STUDENT SEARCH & SELECTION */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                  1. O'quvchini qidirish va tanlash (ID yoki Ism bo'yicha)
                </label>

                {!selectedStudentForPayment ? (
                  <div>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text" 
                        placeholder="🔍 6 talik ID (masalan: 100101) yoki Ism (masalan: Ali) yozing..." 
                        value={paymentSearchQuery} 
                        onChange={e => setPaymentSearchQuery(e.target.value)} 
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '2px solid #bfdbfe', outline: 'none', fontSize: '14px', backgroundColor: '#f8fafc' }}
                      />
                    </div>

                    <div style={{ maxHeight: '180px', overflowY: 'auto', marginTop: '8px', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '6px', backgroundColor: '#ffffff' }}>
                      {users
                        .filter(u => u.role === 'STUDENT' && (
                          u.full_name.toLowerCase().includes(paymentSearchQuery.toLowerCase()) || 
                          u.login_id.includes(paymentSearchQuery) ||
                          (u.phone && u.phone.includes(paymentSearchQuery))
                        ))
                        .slice(0, 8)
                        .map(s => (
                          <div 
                            key={s.id}
                            onClick={() => handleSelectStudentForPayment(s)}
                            style={{ 
                              padding: '10px 12px', 
                              borderRadius: '10px', 
                              cursor: 'pointer', 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              marginBottom: '4px',
                              backgroundColor: '#f8fafc',
                              border: '1px solid #f1f5f9',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#eff6ff'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                          >
                            <div>
                              <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '14px', display: 'block' }}>
                                {s.full_name}
                              </span>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>
                                ID: <strong style={{ color: '#2563eb' }}>{s.login_id}</strong> • 📞 {s.phone}
                              </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ 
                                fontSize: '11px', 
                                padding: '3px 8px', 
                                borderRadius: '6px', 
                                backgroundColor: s.telegram_chat_id ? '#dcfce7' : '#f1f5f9',
                                color: s.telegram_chat_id ? '#166534' : '#64748b',
                                fontWeight: '800' 
                              }}>
                                {s.telegram_chat_id ? '📱 Bot ulangan' : 'Bot ulanmagan'}
                              </span>
                            </div>
                          </div>
                        ))}
                      {users.filter(u => u.role === 'STUDENT' && (u.full_name.toLowerCase().includes(paymentSearchQuery.toLowerCase()) || u.login_id.includes(paymentSearchQuery))).length === 0 && (
                        <p style={{ margin: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>Mos keluvchi o'quvchi topilmadi.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '14px 16px', borderRadius: '16px', backgroundColor: '#eff6ff', border: '1.5px solid #93c5fd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-symbols-outlined" style={{ color: '#2563eb', fontSize: '20px' }}>person</span>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#1e3a8a' }}>
                          {selectedStudentForPayment.full_name}
                        </h4>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#3b82f6' }}>
                        ID: <strong>{selectedStudentForPayment.login_id}</strong> • 📞 {selectedStudentForPayment.phone}
                      </p>
                      <div style={{ marginTop: '6px' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          padding: '2px 8px', 
                          borderRadius: '6px', 
                          backgroundColor: selectedStudentForPayment.telegram_chat_id ? '#dcfce7' : '#fee2e2',
                          color: selectedStudentForPayment.telegram_chat_id ? '#15803d' : '#b91c1c',
                          fontWeight: '800' 
                        }}>
                          {selectedStudentForPayment.telegram_chat_id ? '📱 Telegram Bot Ulangan (Chek botga yuboriladi ✅)' : '⚠️ Telegram Bot Ulanmagan'}
                        </span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        setSelectedStudentForPayment(null);
                        setPaymentBillingInfo(null);
                        setPaymentAmountVal('');
                      }} 
                      style={{ padding: '6px 12px', borderRadius: '10px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', color: '#1d4ed8', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                    >
                      O'zgartirish 🔄
                    </button>
                  </div>
                )}
              </div>

              {/* 2. MONTH SELECTOR */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#374151', marginBottom: '4px', display: 'block' }}>
                  2. Qaysi oy uchun to'lov
                </label>
                <input 
                  type="month" 
                  value={paymentMonthVal} 
                  onChange={e => {
                    setPaymentMonthVal(e.target.value);
                    if (selectedStudentForPayment) {
                      handleSelectStudentForPayment(selectedStudentForPayment, e.target.value);
                    }
                  }} 
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', fontSize: '14px', fontWeight: '700' }} 
                />
              </div>

              {/* 3. AUTO-DETERMINED COURSE & BILLING INFO */}
              {selectedStudentForPayment && (
                <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '18px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  {paymentBillingLoading ? (
                    <p style={{ margin: 0, color: '#64748b', fontSize: '13px', textAlign: 'center' }}>⏳ O'quvchi kurslari va to'lov ma'lumotlari hisoblanmoqda...</p>
                  ) : paymentBillingInfo ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Biriktirilgan kurs(lar):</span>
                        <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {paymentBillingInfo.groups.length > 0 ? (
                            paymentBillingInfo.groups.map(g => (
                              <span key={g.group_id} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', border: '1px solid #bfdbfe' }}>
                                📚 {g.course_title} ({g.group_name}) — {(g.price_monthly || 0).toLocaleString()} UZS
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Guruh biriktirilmagan</span>
                          )}
                        </div>
                      </div>

                      {/* Oy bo'yicha to'lov statusi kartochkasi */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '14px', backgroundColor: '#ffffff', border: '1px solid #bfdbfe' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Oylik to'lov summasi ({paymentBillingInfo.month_for}):</span>
                          <div style={{ fontSize: '18px', fontWeight: '900', color: '#2563eb' }}>
                            {((paymentBillingInfo.month_amount_due > 0 ? paymentBillingInfo.month_amount_due : paymentBillingInfo.total_monthly_fee) || 0).toLocaleString()} UZS
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '12px' }}>
                          <span style={{ color: '#16a34a', fontWeight: '800', display: 'block' }}>
                            Avval to'langan: {(paymentBillingInfo.month_amount_paid || 0).toLocaleString()} UZS
                          </span>
                          <span style={{ color: paymentBillingInfo.month_remaining_due > 0 ? '#dc2626' : '#16a34a', fontWeight: '900', display: 'block' }}>
                            Qolgan to'lov: {(paymentBillingInfo.month_remaining_due || 0).toLocaleString()} UZS
                          </span>
                        </div>
                      </div>

                      {/* Agar ushbu oy allaqachon to'liq to'langan bo'lsa */}
                      {paymentBillingInfo.month_amount_paid > 0 && paymentBillingInfo.month_remaining_due === 0 && (
                        <div style={{ fontSize: '12px', padding: '8px 12px', borderRadius: '10px', backgroundColor: '#f0fdf4', color: '#166534', fontWeight: '800', border: '1px solid #86efac', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                          Ushbu ({paymentBillingInfo.month_for}) oy uchun to'lov to'liq amalga oshirilgan (To'langan: {paymentBillingInfo.month_amount_paid.toLocaleString()} UZS).
                        </div>
                      )}

                      {/* Agar ushbu oyda eski to'lov qisman to'langan bo'lsa */}
                      {paymentBillingInfo.month_amount_paid > 0 && paymentBillingInfo.month_remaining_due > 0 && (
                        <div style={{ fontSize: '12px', padding: '8px 12px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>info</span>
                          Eski to'lov ({paymentBillingInfo.month_amount_paid.toLocaleString()} UZS) inobatga olindi. Oyni yopish uchun qolgan summa: {paymentBillingInfo.month_remaining_due.toLocaleString()} UZS.
                        </div>
                      )}

                      {paymentBillingInfo.total_debt > 0 && (
                        <div style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: '800' }}>
                          ⚠️ O'quvchining jami umumiy qarzdorligi: -{(paymentBillingInfo.total_debt || 0).toLocaleString()} UZS
                        </div>
                      )}
                      {paymentBillingInfo.total_credit > 0 && (
                        <div style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px', backgroundColor: '#dcfce7', color: '#166534', fontWeight: '800' }}>
                          ✨ O'quvchining jami haqdorligi (ortiqcha to'lovi): +{(paymentBillingInfo.total_credit || 0).toLocaleString()} UZS
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}

              {/* 4. TO'LANAYOTGAN SUMMA INPUT & PRESETS */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>
                    3. Yangi to'lov summasi (so'm)
                  </label>
                  {paymentBillingInfo && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {paymentBillingInfo.month_remaining_due > 0 && (
                        <button 
                          type="button" 
                          onClick={() => setPaymentAmountVal(paymentBillingInfo.month_remaining_due)}
                          style={{ padding: '2px 8px', borderRadius: '6px', border: '1px solid #2563eb', backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                        >
                          Qolgan summa ({paymentBillingInfo.month_remaining_due.toLocaleString()} UZS)
                        </button>
                      )}
                      <button 
                        type="button" 
                        onClick={() => setPaymentAmountVal(paymentBillingInfo.month_amount_due > 0 ? paymentBillingInfo.month_amount_due : paymentBillingInfo.total_monthly_fee)}
                        style={{ padding: '2px 8px', borderRadius: '6px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                      >
                        To'liq oylik
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setPaymentAmountVal(Math.round(((paymentBillingInfo.month_amount_due > 0 ? paymentBillingInfo.month_amount_due : paymentBillingInfo.total_monthly_fee) || 0) / 2))}
                        style={{ padding: '2px 8px', borderRadius: '6px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                      >
                        50% (Yarmi)
                      </button>
                    </div>
                  )}
                </div>
                <input 
                  type="number" 
                  value={paymentAmountVal} 
                  onChange={e => setPaymentAmountVal(e.target.value)} 
                  placeholder={paymentBillingInfo?.month_remaining_due > 0 ? `Qolgan summa: ${paymentBillingInfo.month_remaining_due}` : "Masalan: 600000"} 
                  required 
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '2px solid #3b82f6', fontSize: '16px', fontWeight: '900', color: '#0f172a' }} 
                />
              </div>

              {/* 5. DYNAMIC REAL-TIME DEBT / CREDIT PREVIEW */}
              {selectedStudentForPayment && paymentBillingInfo && (() => {
                const enteredSum = parseFloat(paymentAmountVal) || 0;
                if (enteredSum <= 0) return null;

                const alreadyPaid = paymentBillingInfo.month_amount_paid || 0;
                const monthDue = paymentBillingInfo.month_amount_due > 0 ? paymentBillingInfo.month_amount_due : (paymentBillingInfo.total_monthly_fee || 0);
                const newTotalPaid = alreadyPaid + enteredSum;
                const diff = newTotalPaid - monthDue;

                if (diff < 0) {
                  const remaining = Math.abs(diff);
                  return (
                    <div style={{ marginBottom: '18px', padding: '14px 16px', borderRadius: '14px', backgroundColor: '#fff1f2', border: '1.5px solid #fecdd3' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '900', color: '#e11d48', fontSize: '14px' }}>
                          🔴 QARZDORLIK QOLADI: -{remaining.toLocaleString()} UZS
                        </span>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', backgroundColor: '#ffe4e6', color: '#be123c', fontWeight: '800' }}>
                          Yetishmadi
                        </span>
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#9f1239' }}>
                        {alreadyPaid > 0 ? `Eski to'lov (${alreadyPaid.toLocaleString()} UZS) + Yangi (${enteredSum.toLocaleString()} UZS) = Jami ${newTotalPaid.toLocaleString()} UZS. ` : ''}
                        Ushbu oy uchun to'liq to'lovga yana <strong>{remaining.toLocaleString()} so'm</strong> yetishmadi.
                      </p>
                    </div>
                  );
                } else if (diff > 0) {
                  return (
                    <div style={{ marginBottom: '18px', padding: '14px 16px', borderRadius: '14px', backgroundColor: '#ecfdf5', border: '1.5px solid #a7f3d0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '900', color: '#059669', fontSize: '14px' }}>
                          ✨ HAQDORLIK (ORTIQCHA TO'LOV): +{diff.toLocaleString()} UZS
                        </span>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', backgroundColor: '#d1fae5', color: '#065f46', fontWeight: '800' }}>
                          Depozit
                        </span>
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#065f46' }}>
                        {alreadyPaid > 0 ? `Eski to'lov (${alreadyPaid.toLocaleString()} UZS) + Yangi (${enteredSum.toLocaleString()} UZS) = Jami ${newTotalPaid.toLocaleString()} UZS. ` : ''}
                        Oylik talab etilgan {monthDue.toLocaleString()} so'mdan oshiq {diff.toLocaleString()} so'm to'landi va o'quvchi hisobida <strong>HAQDORLIK</strong> sifatida saqlanadi.
                      </p>
                    </div>
                  );
                } else {
                  return (
                    <div style={{ marginBottom: '18px', padding: '14px 16px', borderRadius: '14px', backgroundColor: '#eff6ff', border: '1.5px solid #bfdbfe' }}>
                      <span style={{ fontWeight: '900', color: '#2563eb', fontSize: '14px', display: 'block' }}>
                        ✅ TO'LIQ TO'LOV: 0 UZS qarz / haqdorlik
                      </span>
                      <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#1e40af' }}>
                        {alreadyPaid > 0 ? `Eski to'lov (${alreadyPaid.toLocaleString()} UZS) + Yangi (${enteredSum.toLocaleString()} UZS) = ${monthDue.toLocaleString()} UZS. ` : ''}
                        Ushbu oy uchun to'lov majburiyati 100% to'liq qoplanadi.
                      </p>
                    </div>
                  );
                }
              })()}

              {/* 6. PAYMENT METHOD & NOTE */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>To'lov usuli</label>
                  <select 
                    value={paymentMethodVal} 
                    onChange={e => setPaymentMethodVal(e.target.value)} 
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', fontSize: '13px', fontWeight: '700' }}
                  >
                    <option value="CASH">💵 Naqd (CASH)</option>
                    <option value="CARD">💳 Karta (CARD)</option>
                    <option value="CLICK">🔵 Click</option>
                    <option value="PAYME">🟢 Payme</option>
                    <option value="UZUM">🟣 Uzum Bank</option>
                    <option value="BANK_TRANSFER">🏛 Bank o'tkazmasi</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Izoh (ixtiyoriy)</label>
                <input 
                  type="text"
                  value={paymentNoteVal}
                  onChange={e => setPaymentNoteVal(e.target.value)}
                  placeholder="Masalan: Kvitansiya raqami yoki chegirma izohi..." 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #bfdbfe', fontSize: '13px' }} 
                />
              </div>

              {/* 7. ACTION BUTTONS */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowPaymentModal(false)} 
                  style={{ flex: 1, padding: '12px', borderRadius: '14px', border: '1px solid #bfdbfe', background: '#f8fafc', color: '#475569', cursor: 'pointer', fontWeight: '700' }}
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  disabled={paymentSubmitting}
                  style={{ 
                    flex: 1.5, 
                    padding: '12px', 
                    borderRadius: '14px', 
                    border: 'none', 
                    background: '#2563eb', 
                    color: '#fff', 
                    cursor: 'pointer', 
                    fontWeight: '900', 
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.4)'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
                  {paymentSubmitting ? "Qabul qilinmoqda..." : "To'lovni Qabul Qilish & Chek"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PAYMENT MODAL */}
      {editPaymentModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '28px', width: '480px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #bfdbfe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>To'lovni Tahrirlash</h3>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>To'lov cheki #{editPaymentModal.id}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setEditPaymentModal(null)}
                style={{ width: '36px', height: '36px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={async e => {
              e.preventDefault();
              const amount = parseFloat(e.target.amount.value);
              const month_for = e.target.month_for.value;
              const payment_method = e.target.payment_method.value;
              const note = e.target.note.value || null;

              if (isNaN(amount) || amount <= 0) {
                triggerNotification("Iltimos, to'g'ri to'lov summasini kiriting!");
                return;
              }

              setEditPaymentSubmitting(true);
              try {
                const updated = await financeAPI.updatePayment(editPaymentModal.id, {
                  amount,
                  month_for,
                  payment_method,
                  note
                });
                setPayments(prev => prev.map(p => p.id === editPaymentModal.id ? updated : p));
                triggerNotification("To'lov ma'lumotlari muvaffaqiyatli saqlandi! ✅");
                
                const [st, debts] = await Promise.all([
                  financeAPI.getDashboardStats().catch(() => null),
                  financeAPI.getDebtors().catch(() => [])
                ]);
                if (Array.isArray(debts)) setDebtorsList(debts);
                if (st) {
                  setStats(prev => ({
                    ...prev,
                    totalIncome: st.total_income || 0,
                    totalExpense: st.total_expense || 0,
                    debtorsCount: Array.isArray(debts) ? debts.length : 0
                  }));
                }
                setEditPaymentModal(null);
              } catch(err) {
                const detail = err.response?.data?.detail || "To'lovni tahrirlashda xatolik yuz berdi";
                triggerNotification(detail);
              }
              setEditPaymentSubmitting(false);
            }}>
              {/* O'quvchi ma'lumotlari */}
              {(() => {
                const st = users.find(u => u.id === editPaymentModal.student_id);
                return (
                  <div style={{ padding: '12px 14px', borderRadius: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', marginBottom: '16px' }}>
                    <span style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: '800', textTransform: 'uppercase' }}>O'quvchi:</span>
                    <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '15px' }}>
                      {st ? st.full_name : `ID: ${editPaymentModal.student_id}`}
                    </div>
                    {st && <div style={{ fontSize: '12px', color: '#64748b' }}>ID: <strong>{st.login_id}</strong> • 📞 {st.phone}</div>}
                  </div>
                );
              })()}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#374151', marginBottom: '4px', display: 'block' }}>To'lov summasi (so'm)</label>
                <input 
                  name="amount" 
                  type="number" 
                  defaultValue={editPaymentModal.amount} 
                  required 
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #3b82f6', fontSize: '16px', fontWeight: '900', color: '#0f172a' }} 
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#374151', marginBottom: '4px', display: 'block' }}>Qaysi oy uchun</label>
                <input 
                  name="month_for" 
                  type="month" 
                  defaultValue={editPaymentModal.month_for || new Date().toISOString().slice(0, 7)} 
                  required 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', fontSize: '14px', fontWeight: '700' }} 
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#374151', marginBottom: '4px', display: 'block' }}>To'lov usuli</label>
                <select 
                  name="payment_method" 
                  defaultValue={editPaymentModal.payment_method || 'CASH'} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', fontSize: '13px', fontWeight: '700' }}
                >
                  <option value="CASH">💵 Naqd (CASH)</option>
                  <option value="CARD">💳 Karta (CARD)</option>
                  <option value="CLICK">🔵 Click</option>
                  <option value="PAYME">🟢 Payme</option>
                  <option value="UZUM">🟣 Uzum Bank</option>
                  <option value="BANK_TRANSFER">🏛 Bank o'tkazmasi</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#374151', marginBottom: '4px', display: 'block' }}>Izoh</label>
                <input 
                  name="note" 
                  type="text" 
                  defaultValue={editPaymentModal.note || ''} 
                  placeholder="Izoh yoki kvitansiya raqami" 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #bfdbfe', fontSize: '13px' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setEditPaymentModal(null)} 
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc', color: '#475569', cursor: 'pointer', fontWeight: '700' }}
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  disabled={editPaymentSubmitting}
                  style={{ flex: 1.5, padding: '12px', borderRadius: '12px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: '900', fontSize: '14px' }}
                >
                  {editPaymentSubmitting ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Smart Payment & Tariff Calculator Modal */}
      {showProRataModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '28px', width: '560px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #bfdbfe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eff6ff', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#2563eb', fontSize: '24px' }}>calculate</span>
                  <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>To'lov & Tarif Kalkulyatori</h3>
                </div>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>Imtiyozli (100% / 50%), yarmidan kelgan (pro-rata), bola/katta tarifi va SAT narxlarini tezkor hisoblash</p>
              </div>
              <button onClick={() => setShowProRataModal(false)} style={{ background: '#f8fafc', border: '1px solid #bfdbfe', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* O'quvchini tanlash (Ixtiyoriy) */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px', display: 'block' }}>O'quvchini tanlash (Ixtiyoriy - to'lovga to'g'ridan-to'g'ri o'tkazish uchun)</label>
                <select 
                  value={calcSelectedStudent?.id || ''} 
                  onChange={e => {
                    const st = users.find(u => u.id === parseInt(e.target.value));
                    setCalcSelectedStudent(st || null);
                  }}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc', fontSize: '14px' }}
                >
                  <option value="">-- O'quvchini tanlang (yoki erkin hisoblash) --</option>
                  {users.filter(u => u.role === 'STUDENT').map(s => (
                    <option key={s.id} value={s.id}>{s.full_name} (ID: {s.login_id})</option>
                  ))}
                </select>
              </div>

              {/* Tarif / Hisoblash Turi */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px', display: 'block' }}>Tarif / Hisoblash Turi *</label>
                <select 
                  value={calcTariffType} 
                  onChange={e => setCalcTariffType(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #2563eb', background: '#eff6ff', color: '#1e40af', fontWeight: '800', fontSize: '14px' }}
                >
                  <option value="PRORATA">⏱️ Oyni yarmidan kelgan (Darslar soni bo'yicha Pro-rata)</option>
                  <option value="GRANT_100">🎓 100% Imtiyozli / Grant (0 UZS)</option>
                  <option value="DISCOUNT_50">🎁 50% Yarim Imtiyoz (Yarim to'lov)</option>
                  <option value="CHILD_TARIFF">🧒 Bolalar Tarifi (Kichik yoshdagilar narxi)</option>
                  <option value="ADULT_TARIFF">👨‍💼 Kattalar Tarifi (Katta yoshdagilar narxi)</option>
                  <option value="CUSTOM_PRICE">🎯 Maxsus / Fiks Narx (SAT yoki kelishilgan summa)</option>
                  <option value="STANDART">📘 Standart Oylik To'lov (To'liq summa)</option>
                </select>
              </div>

              {/* Baza Oylik To'lov */}
              <div style={{ display: 'grid', gridTemplateColumns: calcTariffType === 'PRORATA' ? '1fr 1fr 1fr' : '1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Baza Oylik Narx (UZS)</label>
                  <input 
                    type="number" 
                    value={calcMonthlyFee} 
                    onChange={e => setCalcMonthlyFee(parseFloat(e.target.value) || 0)} 
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc', fontSize: '14px', fontWeight: '700' }} 
                  />
                </div>

                {calcTariffType === 'PRORATA' && (
                  <>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Oydagi jami dars</label>
                      <input 
                        type="number" 
                        value={calcTotalLessons} 
                        onChange={e => setCalcTotalLessons(parseInt(e.target.value) || 1)} 
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc', fontSize: '14px', fontWeight: '700' }} 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Qolgan darslar</label>
                      <input 
                        type="number" 
                        value={calcRemainingLessons} 
                        onChange={e => setCalcRemainingLessons(parseInt(e.target.value) || 0)} 
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc', fontSize: '14px', fontWeight: '700' }} 
                      />
                    </div>
                  </>
                )}
              </div>

              {(calcTariffType === 'CUSTOM_PRICE' || calcTariffType === 'CHILD_TARIFF' || calcTariffType === 'ADULT_TARIFF') && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Maxsus Narx (UZS) *</label>
                  <input 
                    type="number" 
                    placeholder="Masalan: SAT kursi fiks narxi yoki bola/katta narxi"
                    value={calcCustomPrice} 
                    onChange={e => setCalcCustomPrice(e.target.value)} 
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc', fontSize: '14px', fontWeight: '700' }} 
                  />
                </div>
              )}

              {/* Calculated Result Box */}
              {(() => {
                let finalAmount = calcMonthlyFee;
                let explanation = "Standart to'liq oylik to'lov";

                if (calcTariffType === 'GRANT_100') {
                  finalAmount = 0;
                  explanation = "100% Imtiyozli grant: To'lov talab qilinmaydi (0 UZS)";
                } else if (calcTariffType === 'DISCOUNT_50') {
                  finalAmount = Math.round(calcMonthlyFee * 0.5);
                  explanation = `50% Chegirma: ${calcMonthlyFee.toLocaleString()} UZS * 50% = ${finalAmount.toLocaleString()} UZS`;
                } else if (calcTariffType === 'PRORATA') {
                  const t = calcTotalLessons || 12;
                  const r = calcRemainingLessons || 0;
                  finalAmount = Math.round((calcMonthlyFee / t) * r);
                  explanation = `Pro-rata (${r}/${t} dars): (${calcMonthlyFee.toLocaleString()} / ${t}) * ${r} = ${finalAmount.toLocaleString()} UZS`;
                } else if (calcTariffType === 'CHILD_TARIFF' || calcTariffType === 'ADULT_TARIFF' || calcTariffType === 'CUSTOM_PRICE') {
                  finalAmount = calcCustomPrice ? parseFloat(calcCustomPrice) : calcMonthlyFee;
                  explanation = `Belgilangan maxsus tarif: ${finalAmount.toLocaleString()} UZS`;
                }

                return (
                  <div style={{ backgroundColor: '#f0fdf4', border: '2px dashed #86efac', padding: '18px 20px', borderRadius: '18px', textAlign: 'center', marginTop: '6px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#15803d', marginBottom: '4px' }}>HISOBLANGAN TO'LOV SUMMASI:</div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#166534', letterSpacing: '-0.5px' }}>
                      {finalAmount.toLocaleString()} <span style={{ fontSize: '18px' }}>UZS</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#166534', marginTop: '6px', fontWeight: '600' }}>
                      {explanation}
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowProRataModal(false)} 
                  style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1px solid #bfdbfe', background: '#f8fafc', color: '#475569', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
                >
                  Yopish
                </button>
                <button 
                  type="button" 
                  onClick={async () => {
                    let finalAmount = calcMonthlyFee;
                    let explanation = "Standart oylik to'lov";

                    if (calcTariffType === 'GRANT_100') {
                      finalAmount = 0;
                      explanation = "100% Grant";
                    } else if (calcTariffType === 'DISCOUNT_50') {
                      finalAmount = Math.round(calcMonthlyFee * 0.5);
                      explanation = "50% Chegirma";
                    } else if (calcTariffType === 'PRORATA') {
                      const t = calcTotalLessons || 12;
                      const r = calcRemainingLessons || 0;
                      finalAmount = Math.round((calcMonthlyFee / t) * r);
                      explanation = `Pro-rata (${r}/${t} dars)`;
                    } else if (calcTariffType === 'CHILD_TARIFF' || calcTariffType === 'ADULT_TARIFF' || calcTariffType === 'CUSTOM_PRICE') {
                      finalAmount = calcCustomPrice ? parseFloat(calcCustomPrice) : calcMonthlyFee;
                      explanation = `Tarif: ${calcTariffType}`;
                    }

                    setShowProRataModal(false);
                    setPaymentAmountVal(finalAmount);
                    setPaymentNoteVal(explanation);

                    if (calcSelectedStudent) {
                      await handleSelectStudentForPayment(calcSelectedStudent);
                      setPaymentAmountVal(finalAmount);
                    }
                    setShowPaymentModal(true);
                    triggerNotification(`Kalkulyator to'lovi (${finalAmount.toLocaleString()} UZS) to'lov oynasiga o'tkazildi! 💳`);
                  }}
                  style={{ flex: 2, padding: '14px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#fff', cursor: 'pointer', fontWeight: '900', fontSize: '14px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>payments</span>
                  To'lovni Qabul Qilishga O'tkazish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddScheduleModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '420px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '900' }}>Dars Jadvalini Shakllantirish</h3>
            <form onSubmit={e => {
              e.preventDefault();
              const group_id = e.target.group_id.value;
              const days = e.target.days.value;
              const time = e.target.time.value;
              const room = e.target.room.value;
              setSchedules(prev => [...prev, { id: Date.now(), days, time, group_id, teacher_id: 'O\'qituvchi', room }]);
              setShowAddScheduleModal(false);
              triggerNotification("Dars jadvali muvaffaqiyatli qo'shildi!");
            }}>
              <label style={{ fontSize: '13px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Guruhni tanlang:</label>
              <select name="group_id" style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc' }}>
                {groups.map(g => (
                  <option key={g.id} value={g.name}>{g.name}</option>
                ))}
              </select>

              <label style={{ fontSize: '13px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Hafta kunlari:</label>
              <select name="days" style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc' }}>
                <option value="MON,WED,FRI">Dush / Chor / Jum (MON,WED,FRI)</option>
                <option value="TUE,THU,SAT">Sesh / Pay / Shan (TUE,THU,SAT)</option>
              </select>

              <label style={{ fontSize: '13px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Dars vaqti:</label>
              <input name="time" type="text" defaultValue="14:00 - 16:00" required style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc' }} />

              <label style={{ fontSize: '13px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Xona:</label>
              <input name="room" type="text" defaultValue="1-xona (Kompyuter sinfi)" required style={{ width: '100%', padding: '12px', marginBottom: '24px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc' }} />

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowAddScheduleModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc', cursor: 'pointer', fontWeight: '800' }}>Bekor qilish</button>
                <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: '800' }}>Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Course Details Modal */}
      {selectedCourseDetail && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '650px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eff6ff', paddingBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', padding: '4px 10px', borderRadius: '6px' }}>
                  Fan Ma'lumotlari
                </span>
                <h3 style={{ margin: '8px 0 0', fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>
                  {selectedCourseDetail.title}
                </h3>
              </div>
              <button onClick={() => setSelectedCourseDetail(null)} style={{ background: '#f8fafc', border: '1px solid #bfdbfe', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #eff6ff', fontSize: '14px' }}>
              <div><strong>Oylik narxi:</strong> <span style={{ color: '#2563eb', fontWeight: '900' }}>{selectedCourseDetail.price_monthly?.toLocaleString()} UZS</span></div>
              <div><strong>Davomiyligi:</strong> {selectedCourseDetail.duration_months} oy</div>
              <div style={{ gridColumn: '1 / -1' }}><strong>Tavsif:</strong> {selectedCourseDetail.description || "Tavsif berilmagan"}</div>
            </div>

            <h4 style={{ fontSize: '16px', fontWeight: '900', margin: '0 0 12px 0', color: '#0f172a' }}>
              Ushbu fanga biriktirilgan guruhlar ({groups.filter(g => g.course_id === selectedCourseDetail.id).length} ta)
            </h4>

            <div style={{ border: '1px solid #bfdbfe', borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead style={{ backgroundColor: '#eff6ff' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>Guruh Nomi</th>
                    <th style={{ padding: '12px 16px' }}>Kunlar</th>
                    <th style={{ padding: '12px 16px' }}>Vaqt</th>
                    <th style={{ padding: '12px 16px' }}>Holat</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.filter(g => g.course_id === selectedCourseDetail.id).map(g => (
                    <tr key={g.id} style={{ borderBottom: '1px solid #eff6ff' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '800', color: '#0f172a' }}>{g.name}</td>
                      <td style={{ padding: '12px 16px' }}>{g.days_of_week}</td>
                      <td style={{ padding: '12px 16px' }}>{g.start_time} - {g.end_time}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '11px', backgroundColor: g.is_active ? '#dcfce7' : '#fee2e2', color: g.is_active ? '#166534' : '#991b1b', padding: '2px 8px', borderRadius: '50px', fontWeight: '800' }}>
                          {g.is_active ? 'Faol' : 'Yakunlangan'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {groups.filter(g => g.course_id === selectedCourseDetail.id).length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                        Hozircha guruhlar ochilmagan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button onClick={() => setSelectedCourseDetail(null)} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '800', cursor: 'pointer' }}>
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Group Details Modal */}
      {selectedGroupDetail && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '780px', maxWidth: '92%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eff6ff', paddingBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', padding: '4px 10px', borderRadius: '6px' }}>
                  {selectedGroupDetail.course?.title || courses.find(c => c.id === selectedGroupDetail.course_id)?.title || 'Fan'}
                </span>
                <h3 style={{ margin: '8px 0 0', fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>
                  {selectedGroupDetail.name} (Guruh ma'lumotlari)
                </h3>
              </div>
              <button onClick={() => setSelectedGroupDetail(null)} style={{ background: '#f8fafc', border: '1px solid #bfdbfe', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #eff6ff', fontSize: '13px' }}>
              <div><strong>Dars kunlari:</strong> {selectedGroupDetail.days_of_week || 'Belgilanmagan'}</div>
              <div><strong>Dars vaqti:</strong> {selectedGroupDetail.start_time || '14:00'} - {selectedGroupDetail.end_time || '16:00'}</div>
              <div><strong>Xona:</strong> {selectedGroupDetail.room?.name || (rooms || []).find(r => r && r.id === selectedGroupDetail.room_id)?.name || (selectedGroupDetail.room_id ? `${selectedGroupDetail.room_id}-xona` : "Belgilanmagan")}</div>
              <div><strong>O'qituvchi:</strong> {selectedGroupDetail.teacher?.full_name || (users || []).find(u => u && u.id === selectedGroupDetail.teacher_id)?.full_name || "Biriktirilmagan"}</div>
            </div>

            <h4 style={{ fontSize: '16px', fontWeight: '900', margin: '0 0 12px 0', color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Biriktirilgan O'quvchilar ({selectedGroupDetail.students?.length || 0} ta)</span>
              <button 
                onClick={() => { 
                  setAssignSelectedGroupId(selectedGroupDetail.id); 
                  setShowAssignStudentModal(true); 
                }} 
                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #2563eb', backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
              >
                + O'quvchi qo'shish
              </button>
            </h4>

            <div style={{ border: '1px solid #bfdbfe', borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead style={{ backgroundColor: '#eff6ff' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>ID</th>
                    <th style={{ padding: '12px 16px' }}>Ism Familiya</th>
                    <th style={{ padding: '12px 16px' }}>Telefon</th>
                    <th style={{ padding: '12px 16px' }}>Tarif / Imtiyoz</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Amal</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedGroupDetail.students || []).filter(Boolean).map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #eff6ff' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '800', color: '#2563eb' }}>{s.login_id || s.id}</td>
                      <td style={{ padding: '12px 16px', fontWeight: '700' }}>{s.full_name || "O'quvchi"}</td>
                      <td style={{ padding: '12px 16px' }}>{s.phone || '-'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {s.discount_type === 'GRANT_100' ? (
                          <span style={{ fontSize: '11px', backgroundColor: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '6px', fontWeight: '800' }}>100% Grant (0 UZS)</span>
                        ) : s.discount_type === 'DISCOUNT_50' ? (
                          <span style={{ fontSize: '11px', backgroundColor: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '6px', fontWeight: '800' }}>50% Chegirma</span>
                        ) : s.discount_type === 'CHILD_TARIFF' ? (
                          <span style={{ fontSize: '11px', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '6px', fontWeight: '800' }}>Bola tarifi {s.custom_price != null ? `(${Number(s.custom_price).toLocaleString()} UZS)` : ''}</span>
                        ) : s.discount_type === 'ADULT_TARIFF' ? (
                          <span style={{ fontSize: '11px', backgroundColor: '#f3e8ff', color: '#6b21a8', padding: '3px 8px', borderRadius: '6px', fontWeight: '800' }}>Katta tarifi {s.custom_price != null ? `(${Number(s.custom_price).toLocaleString()} UZS)` : ''}</span>
                        ) : s.discount_type === 'CUSTOM_PRICE' ? (
                          <span style={{ fontSize: '11px', backgroundColor: '#fae8ff', color: '#86198f', padding: '3px 8px', borderRadius: '6px', fontWeight: '800' }}>Maxsus {s.custom_price != null ? `(${Number(s.custom_price).toLocaleString()} UZS)` : ''}</span>
                        ) : (
                          <span style={{ fontSize: '11px', backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>Standart</span>
                        )}
                        {s.discount_note && (
                          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{s.discount_note}</div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            onClick={() => setTariffEditModal({
                              group_id: selectedGroupDetail.id,
                              student_id: s.id,
                              student_name: s.full_name,
                              current_tariff: s.discount_type || 'STANDART',
                              current_price: s.custom_price != null ? s.custom_price : '',
                              current_note: s.discount_note || ''
                            })}
                            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                          >
                            ⚙️ Tarif
                          </button>
                          <button 
                            onClick={async () => {
                              if (!window.confirm(`"${s.full_name}"ni guruhdan chiqarishni tasdiqlaysizmi?`)) return;
                              try {
                                await groupsAPI.removeStudentFromGroup(selectedGroupDetail.id, s.id);
                                triggerNotification(`"${s.full_name}" guruhdan muvaffaqiyatli chiqarildi!`);
                                const updatedDetail = await groupsAPI.getGroupDetail(selectedGroupDetail.id);
                                setSelectedGroupDetail(updatedDetail);
                                const grps = await groupsAPI.getGroups();
                                if (Array.isArray(grps)) setGroups(grps);
                              } catch(err) {
                                triggerNotification(err.response?.data?.detail || "Guruhdan chiqarishda xatolik yuz berdi");
                              }
                            }}
                            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                          >
                            ❌ Chiqarish
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!selectedGroupDetail.students || selectedGroupDetail.students.length === 0) && (
                    <tr>
                      <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                        Ushbu guruhga hali o'quvchilar biriktirilmagan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button onClick={() => setSelectedGroupDetail(null)} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '800', cursor: 'pointer' }}>
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9.1 Tariff Edit Modal */}
      {tariffEditModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '480px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>O'quvchi Tarifini O'zgartirish</h3>
            <p style={{ fontSize: '13px', color: '#2563eb', fontWeight: '700', marginBottom: '20px' }}>{tariffEditModal.student_name}</p>

            <form onSubmit={async e => {
              e.preventDefault();
              const tariffType = e.target.tariff_type.value;
              const customPrice = tariffType === 'GRANT_100' ? 0 : (e.target.custom_price?.value ? parseFloat(e.target.custom_price.value) : null);
              const discountNote = e.target.discount_note?.value || null;

              try {
                const res = await groupsAPI.updateStudentTariff(tariffEditModal.group_id, tariffEditModal.student_id, {
                  tariff_type: tariffType === 'STANDART' ? 'STANDARD' : tariffType,
                  custom_price: customPrice,
                  discount_note: discountNote
                });
                triggerNotification(res?.message || "O'quvchi tarifi muvaffaqiyatli yangilandi! 🎓");
                
                // Refresh group detail
                const updatedDetail = await groupsAPI.getGroupDetail(tariffEditModal.group_id);
                if (updatedDetail) setSelectedGroupDetail(updatedDetail);
              } catch(err) {
                triggerNotification(err.response?.data?.detail || "Tarifni yangilashda xatolik yuz berdi");
              }
              setTariffEditModal(null);
            }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>To'lov Tarifi / Imtiyoz *</label>
              <select 
                name="tariff_type" 
                value={tariffEditModal.current_tariff === 'STANDARD' ? 'STANDART' : (tariffEditModal.current_tariff || 'STANDART')}
                onChange={e => {
                  setTariffEditModal(prev => ({ ...prev, current_tariff: e.target.value }));
                }}
                style={{ width: '100%', padding: '12px', marginBottom: '14px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1e40af', fontWeight: '800', fontSize: '14px' }}
              >
                <option value="STANDART">Standart Tarif (Kurs to'liq narxi)</option>
                <option value="GRANT_100">100% Imtiyozli / Grant (0 UZS)</option>
                <option value="DISCOUNT_50">50% Yarim Imtiyoz (Yarim to'lov)</option>
                <option value="CHILD_TARIFF">Bolalar Tarifi (Kichik yoshdagilar narxi)</option>
                <option value="ADULT_TARIFF">Kattalar Tarifi (Katta yoshdagilar narxi)</option>
                <option value="CUSTOM_PRICE">Maxsus / Kelishilgan Narx (Ixtiyoriy summa)</option>
              </select>

              {tariffEditModal.current_tariff !== 'STANDART' && tariffEditModal.current_tariff !== 'STANDARD' && tariffEditModal.current_tariff !== 'GRANT_100' && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>
                    {tariffEditModal.current_tariff === 'DISCOUNT_50' ? "Oylik to'lov summasi (Bo'sh qoldirilsa 50% hisoblanadi)" : "Belgilangan oylik narx (UZS) *"}
                  </label>
                  <input 
                    name="custom_price" 
                    type="number" 
                    placeholder="Masalan: 350000" 
                    defaultValue={tariffEditModal.current_price != null ? tariffEditModal.current_price : ''} 
                    required={tariffEditModal.current_tariff === 'CUSTOM_PRICE' || tariffEditModal.current_tariff === 'CHILD_TARIFF' || tariffEditModal.current_tariff === 'ADULT_TARIFF'}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc', fontSize: '14px' }} 
                  />
                </div>
              )}

              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Tarif / Imtiyoz Sababi (Izoh)</label>
              <input 
                name="discount_note" 
                type="text" 
                placeholder="Masalan: Olimpiada g'olibi, SAT fiks narx, 2-farzand..." 
                defaultValue={tariffEditModal.current_note} 
                style={{ width: '100%', padding: '12px', marginBottom: '24px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc', fontSize: '14px' }} 
              />

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setTariffEditModal(null)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc', cursor: 'pointer', fontWeight: '700' }}>Bekor qilish</button>
                <button type="submit" style={{ flex: 1.5, padding: '12px', borderRadius: '12px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: '800' }}>Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. Admin Detailed Exam Results Modal */}
      {adminExamResultsModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '750px', maxWidth: '92%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eff6ff', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', padding: '4px 10px', borderRadius: '6px' }}>Imtihon Natijalari</span>
                <h3 style={{ margin: '6px 0 0', fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>{adminExamResultsModal.title} — Natijalar Jadvali</h3>
              </div>
              <button onClick={() => setAdminExamResultsModal(null)} style={{ background: '#f8fafc', border: '1px solid #bfdbfe', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '14px 18px', borderRadius: '16px', marginBottom: '20px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', border: '1px solid #e2e8f0' }}>
              <span>Max ball: <strong>{adminExamResultsModal.max_score}</strong></span>
              <span>Sertifikat o'tish bali: <strong style={{ color: '#16a34a' }}>{adminExamResultsModal.pass_score}</strong></span>
              <span>Topshirganlar: <strong>{adminExamResultsList.length} ta</strong></span>
            </div>

            {adminResultsLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#2563eb', fontWeight: '800' }}>Natijalar yuklanmoqda...</div>
            ) : (
              <div style={{ border: '1px solid #bfdbfe', borderRadius: '16px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead style={{ backgroundColor: '#eff6ff', fontWeight: '800', color: '#1d4ed8' }}>
                    <tr>
                      <th style={{ padding: '12px 16px' }}>O'quvchi</th>
                      <th style={{ padding: '12px 16px' }}>To'plagan Bali</th>
                      <th style={{ padding: '12px 16px' }}>Foiz</th>
                      <th style={{ padding: '12px 16px' }}>Holat</th>
                      <th style={{ padding: '12px 16px' }}>Sertifikat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminExamResultsList.map(r => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #eff6ff' }}>
                        <td style={{ padding: '12px 16px', fontWeight: '800', color: '#0f172a' }}>
                          {r.student_name} <span style={{ color: '#2563eb', fontSize: '11px' }}>({r.student_login_id})</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: '900', color: '#2563eb', fontSize: '15px' }}>
                          {r.score} ball
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: '700' }}>
                          {r.percentage}%
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', backgroundColor: r.is_passed ? '#dcfce7' : '#fee2e2', color: r.is_passed ? '#166534' : '#991b1b' }}>
                            {r.is_passed ? "O'tdi ✅" : "O'tmadi ❌"}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {r.certificate_code ? (
                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#15803d', backgroundColor: '#dcfce7', padding: '3px 8px', borderRadius: '6px' }}>
                              🎓 {r.certificate_code}
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Mavjud emas</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {adminExamResultsList.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                          Hozircha natijalar mavjud emas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setAdminExamResultsModal(null)} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '800', cursor: 'pointer' }}>
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. Admin Offline Exam Results Entry Modal */}
      {adminOfflineModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '700px', maxWidth: '92%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eff6ff', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', backgroundColor: '#f5f3ff', color: '#7c3aed', fontWeight: '800', padding: '4px 10px', borderRadius: '6px' }}>Offline Imtihon Natijalari</span>
                <h3 style={{ margin: '6px 0 0', fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>{adminOfflineModal.title} — Ballarni Kiritish</h3>
              </div>
              <button onClick={() => setAdminOfflineModal(null)} style={{ background: '#f8fafc', border: '1px solid #bfdbfe', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ backgroundColor: '#eff6ff', padding: '12px 16px', borderRadius: '14px', marginBottom: '20px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🎯 Max ball: <strong>{adminOfflineModal.max_score}</strong></span>
              <span>🎓 Sertifikat o'tish bali: <strong style={{ color: '#16a34a' }}>{adminOfflineModal.pass_score}</strong>+ ball</span>
              <span>👥 O'quvchilar: <strong>{adminOfflineStudents.length} ta</strong></span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {adminOfflineStudents.map(s => {
                const scoreVal = adminOfflineScores[s.id] !== undefined ? adminOfflineScores[s.id] : '';
                const isPassed = parseFloat(scoreVal) >= adminOfflineModal.pass_score;

                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: '#f8fafc', borderRadius: '16px', border: `1px solid ${isPassed ? '#86efac' : '#bfdbfe'}`, gap: '16px' }}>
                    <div style={{ flex: 1.5 }}>
                      <p style={{ margin: 0, fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>{s.full_name}</p>
                      <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '700' }}>ID: {s.login_id} • {s.phone}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>To'plagan bali:</span>
                        <input 
                          type="number"
                          min="0"
                          max={adminOfflineModal.max_score}
                          placeholder="0"
                          value={scoreVal}
                          onChange={e => setAdminOfflineScores({...adminOfflineScores, [s.id]: e.target.value})}
                          style={{ width: '90px', padding: '8px 12px', borderRadius: '10px', border: '1px solid #bfdbfe', fontWeight: '900', fontSize: '15px', color: '#0f172a', textAlign: 'center' }}
                        />
                      </div>
                      {isPassed && (
                        <span style={{ fontSize: '18px' }} title="Sertifikat beriladi 🎓">🎓</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {adminOfflineStudents.length === 0 && (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>Guruhda o'quvchilar mavjud emas.</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="button" onClick={() => setAdminOfflineModal(null)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', fontWeight: '800', cursor: 'pointer' }}>
                Bekor qilish
              </button>
              <button 
                type="button" 
                onClick={handleAdminSaveOffline}
                disabled={adminOfflineSaving || adminOfflineStudents.length === 0}
                style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '900', cursor: adminOfflineSaving ? 'not-allowed' : 'pointer' }}
              >
                {adminOfflineSaving ? 'Saqlanmoqda...' : '💾 Natijalarni Saqlash & Sertifikatlarni Berish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. Admin Official Certificate View Modal (Printable) */}
      {adminCertPreviewModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="animate-fade-in" style={{ backgroundColor: '#ffffff', borderRadius: '28px', maxWidth: '540px', width: '100%', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 30px 70px rgba(0,0,0,0.3)' }}>
            
            <div id="admin-printable-certificate" style={{ border: '6px double #d97706', padding: '24px', borderRadius: '20px', backgroundColor: '#fffbeb', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
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
                {adminCertPreviewModal.student_name}
              </h3>

              <p style={{ fontSize: '12px', color: '#78350f', margin: 0, lineHeight: '1.6' }}>
                O'quvchi <strong>"{adminCertPreviewModal.course_title}"</strong> kursi dasturi va imtihon sinovlarini muvaffaqiyatli yakunlagani tasdiqlanadi.
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px dashed #d97706', paddingTop: '14px' }}>
                <div style={{ textAlign: 'left', fontSize: '11px', color: '#78350f' }}>
                  <p style={{ margin: 0 }}><strong>Seriya:</strong> {adminCertPreviewModal.certificate_code}</p>
                  <p style={{ margin: '2px 0 0' }}><strong>Sana:</strong> {adminCertPreviewModal.issue_date?.split('T')[0]}</p>
                  <p style={{ margin: '2px 0 0', color: '#16a34a', fontWeight: '800' }}>✓ Haqiqiy (Verified)</p>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '6px', borderRadius: '10px', border: '1px solid #fde68a' }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=VERIFY_${adminCertPreviewModal.certificate_code}`} 
                    alt="Certificate QR" 
                    style={{ width: '80px', height: '80px', display: 'block' }} 
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setAdminCertPreviewModal(null)} 
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

      {/* 13. Admin Add Lesson Date Modal */}
      {showAdminAddLessonModal && selectedAttendanceGroup && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '24px', width: '420px', maxWidth: '92%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #bfdbfe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>+ Yangi Dars Sanasi Qo'shish</h3>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '12px' }}>{selectedAttendanceGroup.group_name || selectedAttendanceGroup.name} guruhi uchun</p>
              </div>
              <button 
                onClick={() => setShowAdminAddLessonModal(false)}
                style={{ width: '32px', height: '32px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLessonAndOpenJournal}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#374151', marginBottom: '4px', display: 'block' }}>Dars Sanasi</label>
                <input 
                  type="date" 
                  value={adminAddLessonDate} 
                  onChange={e => setAdminAddLessonDate(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #bfdbfe', fontSize: '14px', fontWeight: '700' }} 
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#374151', marginBottom: '4px', display: 'block' }}>Dars Mavzusi (ixtiyoriy)</label>
                <input 
                  type="text" 
                  value={adminAddLessonTopic} 
                  onChange={e => setAdminAddLessonTopic(e.target.value)} 
                  placeholder="Masalan: Present Perfect Continuous yoki 12-Mavzu" 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #bfdbfe', fontSize: '13px' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAdminAddLessonModal(false)} 
                  style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc', color: '#475569', cursor: 'pointer', fontWeight: '700' }}
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  disabled={adminAddLessonSaving}
                  style={{ flex: 1.5, padding: '10px', borderRadius: '12px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: '900', fontSize: '13px' }}
                >
                  {adminAddLessonSaving ? "Qo'shilmoqda..." : "Darsni Ochish & Davomat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 14. Admin Mark Attendance Modal for specific lesson */}
      {adminMarkModalLesson && groupJournalData && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 65, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '24px', width: '650px', maxWidth: '92%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #bfdbfe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eff6ff', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                  📅 Sana: {adminMarkModalLesson.lesson_date}
                </span>
                <h3 style={{ margin: '6px 0 0', fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>
                  {selectedAttendanceGroup.group_name || selectedAttendanceGroup.name} — Davomat Qilish
                </h3>
              </div>
              <button 
                onClick={() => setAdminMarkModalLesson(null)}
                style={{ width: '32px', height: '32px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}
              >
                ✕
              </button>
            </div>

            {/* Quick button to mark all as PRESENT */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Tezkor harakat:</span>
              <button 
                type="button" 
                onClick={() => {
                  const allPresent = {};
                  groupJournalData.students.forEach(s => { allPresent[s.id] = 'PRESENT'; });
                  setAdminMarkStatusMap(prev => ({ ...prev, ...allPresent }));
                }}
                style={{ padding: '4px 10px', borderRadius: '8px', border: '1px solid #86efac', backgroundColor: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
              >
                ✅ Hammasini "Keldi" qilish
              </button>
            </div>

            <form onSubmit={handleSaveMarkAttendance}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {groupJournalData.students.map((student, idx) => {
                  const currentStatus = adminMarkStatusMap[student.id] || 'PRESENT';
                  return (
                    <div key={student.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '14px', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc', border: '1px solid #eff6ff', gap: '10px', flexWrap: 'wrap' }}>
                      <div style={{ minWidth: '160px' }}>
                        <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '13px' }}>{student.full_name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>ID: {student.login_id}</div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          type="button" 
                          onClick={() => setAdminMarkStatusMap(prev => ({ ...prev, [student.id]: 'PRESENT' }))}
                          style={{ 
                            padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer',
                            border: currentStatus === 'PRESENT' ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                            backgroundColor: currentStatus === 'PRESENT' ? '#dcfce7' : '#ffffff',
                            color: currentStatus === 'PRESENT' ? '#166534' : '#64748b'
                          }}
                        >
                          ✅ Keldi
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setAdminMarkStatusMap(prev => ({ ...prev, [student.id]: 'LATE' }))}
                          style={{ 
                            padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer',
                            border: currentStatus === 'LATE' ? '1.5px solid #d97706' : '1px solid #e2e8f0',
                            backgroundColor: currentStatus === 'LATE' ? '#fef3c7' : '#ffffff',
                            color: currentStatus === 'LATE' ? '#b45309' : '#64748b'
                          }}
                        >
                          🕒 Kechikdi
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setAdminMarkStatusMap(prev => ({ ...prev, [student.id]: 'ABSENT' }))}
                          style={{ 
                            padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer',
                            border: currentStatus === 'ABSENT' ? '1.5px solid #dc2626' : '1px solid #e2e8f0',
                            backgroundColor: currentStatus === 'ABSENT' ? '#fee2e2' : '#ffffff',
                            color: currentStatus === 'ABSENT' ? '#991b1b' : '#64748b'
                          }}
                        >
                          ❌ Kelmadi
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setAdminMarkStatusMap(prev => ({ ...prev, [student.id]: 'EXCUSED' }))}
                          style={{ 
                            padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer',
                            border: currentStatus === 'EXCUSED' ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                            backgroundColor: currentStatus === 'EXCUSED' ? '#eff6ff' : '#ffffff',
                            color: currentStatus === 'EXCUSED' ? '#1d4ed8' : '#64748b'
                          }}
                        >
                          📋 Sababli
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setAdminMarkModalLesson(null)} 
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#f8fafc', color: '#475569', cursor: 'pointer', fontWeight: '700' }}
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  disabled={adminMarkSaving}
                  style={{ flex: 1.5, padding: '12px', borderRadius: '12px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: '900', fontSize: '14px' }}
                >
                  {adminMarkSaving ? "Saqlanmoqda..." : "Davomatni Saqlash & Xabarnoma"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL PAYMENT RECEIPT (CHEK) MODAL */}
      {selectedPaymentForReceipt && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(6px)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="animate-fade-in" style={{ backgroundColor: '#ffffff', borderRadius: '28px', maxWidth: '440px', width: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            
            {/* PRINTABLE RECEIPT CONTAINER */}
            <div id="admin-printable-receipt" style={{ border: '2px dashed #cbd5e1', borderRadius: '18px', padding: '20px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* RECEIPT HEADER */}
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                  <img src="/logo.png" alt="Logo" style={{ width: '24px', height: '24px', objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
                  <span style={{ fontSize: '13px', fontWeight: '900', color: '#1e3a8a', letterSpacing: '1px' }}>TA'LIM PLUS EDUCATION</span>
                </div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: '#0f172a' }}>TO'LOV KVITANSIYASI (CHEK)</h3>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Chek №: <strong style={{ color: '#2563eb' }}>#CHK-{selectedPaymentForReceipt.id}</strong></span>
              </div>

              {/* DETAILS TABLE */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>O'quvchi (F.I.SH):</span>
                  <strong style={{ color: '#0f172a' }}>
                    {selectedPaymentForReceipt.student_name || users.find(u => u.id === selectedPaymentForReceipt.student_id)?.full_name || `ID: ${selectedPaymentForReceipt.student_id}`}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Student Login ID:</span>
                  <code>{selectedPaymentForReceipt.login_id || users.find(u => u.id === selectedPaymentForReceipt.student_id)?.login_id || selectedPaymentForReceipt.student_id}</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>To'lov Oyi:</span>
                  <strong>{selectedPaymentForReceipt.month_for || selectedPaymentForReceipt.month}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>To'lov Usuli:</span>
                  <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '6px', fontWeight: '800', fontSize: '11px' }}>
                    {selectedPaymentForReceipt.payment_method || selectedPaymentForReceipt.method || 'CASH'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Sana va Vaqt:</span>
                  <span>{selectedPaymentForReceipt.created_at ? selectedPaymentForReceipt.created_at.replace('T', ' ').slice(0, 16) : new Date().toISOString().slice(0, 10)}</span>
                </div>
                {selectedPaymentForReceipt.note && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Izoh:</span>
                    <span style={{ color: '#475569', fontStyle: 'italic' }}>{selectedPaymentForReceipt.note}</span>
                  </div>
                )}
              </div>

              {/* AMOUNT BOX */}
              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '12px', textAlign: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: '800', textTransform: 'uppercase' }}>To'langan Summa</span>
                <h2 style={{ margin: '4px 0 0', fontSize: '22px', fontWeight: '900', color: '#1e40af' }}>
                  {(selectedPaymentForReceipt.amount || 0).toLocaleString()} SO'M
                </h2>
              </div>

              {/* QR & OFFICIAL SEAL */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#166534', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>verified</span> Muvaffaqiyatli to'landi
                  </span>
                  <span style={{ fontSize: '9px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>Fiskal Tasdiq: TALIM-PLUS-PAY</span>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=PAYMENT_VERIFIED_${selectedPaymentForReceipt.id}`} 
                    alt="QR Check" 
                    style={{ width: '56px', height: '56px', display: 'block' }} 
                  />
                </div>
              </div>

            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                onClick={() => setSelectedPaymentForReceipt(null)}
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
                onClick={() => window.open(`http://127.0.0.1:8000/api/v1/finance/payments/${selectedPaymentForReceipt.id}/pdf`, '_blank')}
                style={{ flex: 1.2, padding: '10px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '900', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span> PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}


