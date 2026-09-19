import React, { useState, useEffect } from 'react';
import { groupsAPI, attendanceAPI, financeAPI, analyticsAPI, coursesAPI, homeworkAPI } from '../api';

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notificationToast, setNotificationToast] = useState('');

  // Responsive screen state
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const [isTablet, setIsTablet] = useState(typeof window !== 'undefined' ? (window.innerWidth > 768 && window.innerWidth <= 1024) : false);

  // Teacher Profile
  const [teacherName, setTeacherName] = useState(localStorage.getItem('full_name') || "O'qituvchi");
  const teacherId = localStorage.getItem('login_id') || 'T-1234';
  const [teacherPhone, setTeacherPhone] = useState('+998 90 123 45 67');
  const [teacherSpec, setTeacherSpec] = useState('Ingliz tili (IELTS 8.0)');
  const [teacherExp, setTeacherExp] = useState('5 yil');
  const [avatar, setAvatar] = useState(null);
  const [certificates, setCertificates] = useState([]);

  // Data States
  const [myGroups, setMyGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);

  // Selected Group in "Guruhlarim" tab
  const [selectedGroup, setSelectedGroup] = useState(null); // active group object or null
  const [groupSubTab, setGroupSubTab] = useState('details'); // 'details' | 'attendance' | 'matrix' | 'homeworks' | 'billing'

  // SubTab 3: Matrix Journal
  const [groupJournalData, setGroupJournalData] = useState(null);
  const [groupJournalLoading, setGroupJournalLoading] = useState(false);
  const [teacherMarkModalLesson, setTeacherMarkModalLesson] = useState(null);
  const [teacherMarkStatusMap, setTeacherMarkStatusMap] = useState({});
  const [teacherMarkNoteMap, setTeacherMarkNoteMap] = useState({});
  const [teacherMarkSaving, setTeacherMarkSaving] = useState(false);

  // SubTab 4: Homeworks
  const [groupHomeworks, setGroupHomeworks] = useState([]);
  const [homeworksLoading, setHomeworksLoading] = useState(false);
  const [showAddHomeworkModal, setShowAddHomeworkModal] = useState(false);
  const [newHwTitle, setNewHwTitle] = useState('');
  const [newHwDesc, setNewHwDesc] = useState('');
  const [newHwMaxCoins, setNewHwMaxCoins] = useState(10);
  const [newHwFile, setNewHwFile] = useState(null);
  const [newHwSaving, setNewHwSaving] = useState(false);
  const [activeHwSubmissionsModal, setActiveHwSubmissionsModal] = useState(null);
  const [hwSubmissions, setHwSubmissions] = useState([]);
  const [hwSubmissionsLoading, setHwSubmissionsLoading] = useState(false);
  const [gradingSubId, setGradingSubId] = useState(null);
  const [gradeScore, setGradeScore] = useState(100);
  const [gradeCoins, setGradeCoins] = useState(10);
  const [gradeFeedback, setGradeFeedback] = useState("A'lo darajada bajarilgan!");
  const [gradeSaving, setGradeSaving] = useState(false);

  const [attendanceStudents, setAttendanceStudents] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [lessonDate, setLessonDate] = useState(new Date().toISOString().split('T')[0]);
  const [lessonTopic, setLessonTopic] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [attendanceNotes, setAttendanceNotes] = useState({});

  const [paymentStudents, setPaymentStudents] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMonth, setPaymentMonth] = useState(new Date().toISOString().slice(0, 7));

  // Exam & Test Management Modals
  const [certModal, setCertModal] = useState(false);
  const [addExamModal, setAddExamModal] = useState(false);
  const [questionsBankModal, setQuestionsBankModal] = useState(false);
  const [qBankTab, setQBankTab] = useState('word'); // 'word', 'text', 'manual', 'list'
  const [offlineResultModal, setOfflineResultModal] = useState(null);
  const [offlineStudents, setOfflineStudents] = useState([]);
  const [offlineScores, setOfflineScores] = useState({});
  const [offlineFeedbacks, setOfflineFeedbacks] = useState({});
  const [offlineSaving, setOfflineSaving] = useState(false);

  const [viewResultsModal, setViewResultsModal] = useState(null);
  const [examResultsList, setExamResultsList] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  // Form states
  const [newExam, setNewExam] = useState({
    group_id: '',
    title: '',
    exam_type: 'ONLINE',
    exam_date: new Date().toISOString().split('T')[0],
    duration_minutes: 30,
    max_score: 100,
    pass_score: 70,
    selected_question_ids: []
  });

  const [wordFile, setWordFile] = useState(null);
  const [wordCourseId, setWordCourseId] = useState('');
  const [rawTextImport, setRawTextImport] = useState('');
  const [rawTextCourseId, setRawTextCourseId] = useState('');
  const [importingLoading, setImportingLoading] = useState(false);

  const [newQuestion, setNewQuestion] = useState({
    course_id: '',
    text: '',
    optA: '',
    optB: '',
    optC: '',
    optD: '',
    correct: 'A'
  });

  const [newCert, setNewCert] = useState({ name: '' });

  // Telegram Haptics helper
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

  const triggerNotification = (msg, type = 'info') => {
    setNotificationToast(msg);
    triggerHaptic(type === 'error' ? 'error' : 'success');
    setTimeout(() => setNotificationToast(''), 4500);
  };

  // Screen Resize Listener
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Telegram Mini App Initialization & BackButton Handler
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        if (window.Telegram.WebApp.setHeaderColor) {
          window.Telegram.WebApp.setHeaderColor('#ffffff');
        }
        if (window.Telegram.WebApp.setBackgroundColor) {
          window.Telegram.WebApp.setBackgroundColor('#ffffff');
        }
      } catch (e) {
        console.warn("Telegram WebApp init:", e);
      }
    }
    fetchTeacherData();
  }, []);

  // Telegram BackButton support for Sub-views & Modals
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.BackButton) return;

    if (selectedGroup || addExamModal || questionsBankModal || offlineResultModal || viewResultsModal || certModal || teacherMarkModalLesson || showAddHomeworkModal || activeHwSubmissionsModal) {
      tg.BackButton.show();
      const onBackClick = () => {
        triggerHaptic('light');
        if (teacherMarkModalLesson) { setTeacherMarkModalLesson(null); return; }
        if (activeHwSubmissionsModal) { setActiveHwSubmissionsModal(null); return; }
        if (showAddHomeworkModal) { setShowAddHomeworkModal(false); return; }
        if (certModal) { setCertModal(false); return; }
        if (viewResultsModal) { setViewResultsModal(null); return; }
        if (offlineResultModal) { setOfflineResultModal(null); return; }
        if (questionsBankModal) { setQuestionsBankModal(false); return; }
        if (addExamModal) { setAddExamModal(false); return; }
        if (selectedGroup) { setSelectedGroup(null); return; }
      };
      tg.BackButton.onClick(onBackClick);
      return () => {
        tg.BackButton.offClick(onBackClick);
        tg.BackButton.hide();
      };
    } else {
      tg.BackButton.hide();
    }
  }, [
    selectedGroup, addExamModal, questionsBankModal, offlineResultModal, viewResultsModal,
    certModal, teacherMarkModalLesson, showAddHomeworkModal, activeHwSubmissionsModal
  ]);

  const fetchTeacherData = async () => {
    setLoading(true);
    try {
      const [groupsData, coursesData, roomsData, examsData, questionsData] = await Promise.all([
        groupsAPI.getGroups().catch(() => []),
        coursesAPI.getCourses().catch(() => []),
        coursesAPI.getRooms().catch(() => []),
        analyticsAPI.getExams().catch(() => []),
        analyticsAPI.getQuestions().catch(() => [])
      ]);

      if (Array.isArray(groupsData)) {
        const enriched = await Promise.all(
          groupsData.map(async (g) => {
            try {
              const students = await groupsAPI.getGroupStudents(g.id);
              const course = Array.isArray(coursesData) ? coursesData.find(c => c.id === g.course_id) : null;
              const room = Array.isArray(roomsData) ? roomsData.find(r => r.id === g.room_id) : null;
              return {
                ...g,
                courseName: course?.title || 'Fan',
                coursePrice: course?.price_monthly || 500000,
                roomName: room?.name || `${g.room_id}-xona`,
                studentsList: Array.isArray(students) ? students : []
              };
            } catch (e) {
              return {
                ...g,
                courseName: 'Fan',
                coursePrice: 500000,
                roomName: `${g.room_id}-xona`,
                studentsList: []
              };
            }
          })
        );
        setMyGroups(enriched);
      }

      if (Array.isArray(coursesData)) setCourses(coursesData);
      if (Array.isArray(roomsData)) setRooms(roomsData);
      if (Array.isArray(examsData)) setExams(examsData);
      if (Array.isArray(questionsData)) setQuestions(questionsData);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    triggerHaptic('medium');
    localStorage.clear();
    window.location.href = '/login';
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setAvatar(e.target.result);
      reader.readAsDataURL(file);
      triggerNotification("Rasm muvaffaqiyatli yuklandi!");
    }
  };

  // Open Attendance for a group (navigates directly into group attendance subtab)
  const handleOpenAttendance = async (group) => {
    triggerHaptic('light');
    setSelectedGroup(group);
    setActiveTab('groups');
    setGroupSubTab('attendance');
    loadGroupSubTabData(group, 'attendance');
  };

  const handleMarkAttendance = (studentId, status) => {
    triggerHaptic('light');
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    if (!attendanceModal) return;
    try {
      const lesson = await attendanceAPI.createLesson({
        group_id: attendanceModal.id,
        lesson_date: lessonDate,
        topic: lessonTopic || `Dars ${lessonDate}`
      });

      const attendances = attendanceStudents.map(s => ({
        student_id: s.id,
        status: attendanceRecords[s.id] || 'PRESENT',
        note: attendanceNotes[s.id] || null
      }));

      await attendanceAPI.markAttendance({
        lesson_id: lesson.id,
        attendances: attendances
      });

      setAttendanceModal(null);
      triggerNotification(`${attendances.length} ta o'quvchining davomati saqlandi va Telegram orqali xabar yuborildi!`);
    } catch (e) {
      const detail = e.response?.data?.detail || "Davomatni saqlashda xatolik yuz berdi";
      triggerNotification(detail, 'error');
    }
  };

  // Open Group Payments (navigates directly into group billing subtab)
  const handleOpenPayments = async (group, month = null) => {
    triggerHaptic('light');
    const targetMonth = month || paymentMonth || new Date().toISOString().slice(0, 7);
    if (month) setPaymentMonth(targetMonth);
    setSelectedGroup(group);
    setActiveTab('groups');
    setGroupSubTab('billing');
    loadGroupSubTabData(group, 'billing');
  };

  // ----------------------------------------------------
  // GROUP SUB-TABS & WORKFLOW HANDLERS
  // ----------------------------------------------------

  const handleSelectGroup = (group) => {
    triggerHaptic('medium');
    setSelectedGroup(group);
    setGroupSubTab('details');
    loadGroupSubTabData(group, 'details');
  };

  const loadGroupSubTabData = async (group, tab) => {
    if (!group) return;
    if (tab === 'matrix') {
      setGroupJournalLoading(true);
      try {
        const data = await attendanceAPI.getGroupJournal(group.id);
        setGroupJournalData(data);
      } catch (e) {
        console.error(e);
      }
      setGroupJournalLoading(false);
    } else if (tab === 'attendance') {
      setAttendanceLoading(true);
      setLessonTopic('');
      setLessonDate(new Date().toISOString().split('T')[0]);
      try {
        const students = await groupsAPI.getGroupStudents(group.id);
        const studentList = Array.isArray(students) ? students : [];
        setAttendanceStudents(studentList);
        const initialRecords = {};
        studentList.forEach(s => { initialRecords[s.id] = 'PRESENT'; });
        setAttendanceRecords(initialRecords);
        setAttendanceNotes({});
      } catch (e) {
        setAttendanceStudents([]);
      }
      setAttendanceLoading(false);
    } else if (tab === 'homeworks') {
      setHomeworksLoading(true);
      try {
        const hws = await homeworkAPI.getGroupHomeworks(group.id);
        setGroupHomeworks(Array.isArray(hws) ? hws : []);
      } catch (e) {
        setGroupHomeworks([]);
      }
      setHomeworksLoading(false);
    } else if (tab === 'billing') {
      const targetMonth = paymentMonth || new Date().toISOString().slice(0, 7);
      setPaymentLoading(true);
      try {
        const billingData = await financeAPI.getGroupStudentsBilling(group.id, targetMonth);
        setPaymentStudents(Array.isArray(billingData) ? billingData : []);
      } catch (e) {
        setPaymentStudents([]);
      }
      setPaymentLoading(false);
    }
  };

  // Matrix handlers
  const handleOpenTeacherMarkModal = (lesson) => {
    triggerHaptic('light');
    setTeacherMarkModalLesson(lesson);
    const statusMap = {};
    const noteMap = {};
    if (groupJournalData?.students) {
      groupJournalData.students.forEach(s => {
        const existing = groupJournalData.matrix?.[String(s.id)]?.[String(lesson.id)];
        statusMap[s.id] = existing?.status || 'PRESENT';
        noteMap[s.id] = existing?.note || '';
      });
    }
    setTeacherMarkStatusMap(statusMap);
    setTeacherMarkNoteMap(noteMap);
  };

  const handleTeacherSaveMarkAttendance = async (e) => {
    if (e) e.preventDefault();
    if (!teacherMarkModalLesson || !selectedGroup) return;
    setTeacherMarkSaving(true);
    try {
      const attendances = (groupJournalData?.students || []).map(s => ({
        student_id: s.id,
        status: teacherMarkStatusMap[s.id] || 'PRESENT',
        note: teacherMarkNoteMap[s.id] || null
      }));

      await attendanceAPI.markAttendance({
        lesson_id: teacherMarkModalLesson.id,
        attendances: attendances
      });

      triggerNotification(`${teacherMarkModalLesson.lesson_date} sanasi bo'yicha davomat saqlandi!`);
      setTeacherMarkModalLesson(null);
      const refreshed = await attendanceAPI.getGroupJournal(selectedGroup.id);
      setGroupJournalData(refreshed);
    } catch (err) {
      const detail = err.response?.data?.detail || "Davomatni saqlashda xatolik";
      triggerNotification(detail, 'error');
    }
    setTeacherMarkSaving(false);
  };

  // Homework creation handler
  const handleCreateHomework = async (e) => {
    e.preventDefault();
    if (!selectedGroup || !newHwTitle.trim()) {
      triggerNotification("Iltimos, vazifa nomini kiriting!", 'error');
      return;
    }
    setNewHwSaving(true);
    try {
      const formData = new FormData();
      formData.append('group_id', selectedGroup.id);
      formData.append('title', newHwTitle.trim());
      formData.append('description', newHwDesc || '');
      formData.append('max_coins', newHwMaxCoins);
      if (newHwFile) {
        formData.append('file', newHwFile);
      }

      await homeworkAPI.createHomework(formData);
      triggerNotification("Yangi uy vazifasi muvaffaqiyatli berildi!");
      setShowAddHomeworkModal(false);
      setNewHwTitle('');
      setNewHwDesc('');
      setNewHwMaxCoins(10);
      setNewHwFile(null);
      const hws = await homeworkAPI.getGroupHomeworks(selectedGroup.id);
      setGroupHomeworks(Array.isArray(hws) ? hws : []);
    } catch (err) {
      const detail = err.response?.data?.detail || "Vazifa yaratishda xatolik yuz berdi";
      triggerNotification(detail, 'error');
    }
    setNewHwSaving(false);
  };

  // View homework submissions
  const handleOpenHwSubmissions = async (hw) => {
    triggerHaptic('light');
    setActiveHwSubmissionsModal(hw);
    setHwSubmissionsLoading(true);
    try {
      const subs = await homeworkAPI.getHomeworkSubmissions(hw.id);
      setHwSubmissions(Array.isArray(subs) ? subs : []);
    } catch (e) {
      setHwSubmissions([]);
    }
    setHwSubmissionsLoading(false);
  };

  // Grade submission
  const handleGradeSubmission = async (subId) => {
    setGradeSaving(true);
    try {
      await homeworkAPI.gradeHomework({
        submission_id: subId,
        grade: parseInt(gradeScore) || 100,
        coins_awarded: parseInt(gradeCoins) || 10,
        feedback: gradeFeedback
      });
      triggerNotification("Vazifa muvaffaqiyatli baholandi va coinlar berildi!");
      setGradingSubId(null);
      if (activeHwSubmissionsModal) {
        const subs = await homeworkAPI.getHomeworkSubmissions(activeHwSubmissionsModal.id);
        setHwSubmissions(Array.isArray(subs) ? subs : []);
      }
    } catch (err) {
      const detail = err.response?.data?.detail || "Baholashda xatolik yuz berdi";
      triggerNotification(detail, 'error');
    }
    setGradeSaving(false);
  };

  // ----------------------------------------------------
  // EXAMS & TEST BANK HANDLERS
  // ----------------------------------------------------

  const handleAddExam = async (e) => {
    e.preventDefault();
    if (!newExam.group_id) {
      triggerNotification("Iltimos, guruhni tanlang!", 'error');
      return;
    }

    try {
      let questionsJson = null;
      if (newExam.exam_type === 'ONLINE') {
        const selectedObjs = questions.filter(q => newExam.selected_question_ids.includes(q.id));
        if (selectedObjs.length === 0) {
          triggerNotification("Onlayn imtihon uchun kamida 1 ta test savolini tanlang!", 'error');
          return;
        }
        questionsJson = JSON.stringify(selectedObjs.map(q => ({
          question_text: q.question_text,
          options: q.options,
          correct_answer: q.correct_answer
        })));
      }

      const payload = {
        group_id: parseInt(newExam.group_id),
        title: newExam.title,
        exam_type: newExam.exam_type,
        max_score: parseFloat(newExam.max_score),
        pass_score: parseFloat(newExam.pass_score),
        duration_minutes: parseInt(newExam.duration_minutes),
        questions_data: questionsJson,
        exam_date: newExam.exam_date
      };

      const res = await analyticsAPI.createExam(payload);
      if (res && res.id) {
        setExams(prev => [res, ...prev]);
        triggerNotification(`"${newExam.title}" (${newExam.exam_type}) imtihoni muvaffaqiyatli saqlandi!`);
      }
      setAddExamModal(false);
      setNewExam({
        group_id: myGroups[0]?.id || '',
        title: '',
        exam_type: 'ONLINE',
        exam_date: new Date().toISOString().split('T')[0],
        duration_minutes: 30,
        max_score: 100,
        pass_score: 70,
        selected_question_ids: []
      });
    } catch (err) {
      const detail = err.response?.data?.detail || "Imtihon yaratishda xatolik yuz berdi";
      triggerNotification(detail, 'error');
    }
  };

  const handleStartExam = async (exam) => {
    triggerHaptic('medium');
    try {
      const res = await analyticsAPI.startExam(exam.id);
      setExams(prev => prev.map(e => e.id === exam.id ? { ...e, status: 'ACTIVE', started_at: res.started_at } : e));
      triggerNotification(`"${exam.title}" imtihoni boshlandi! Taymer ishga tushdi.`);
    } catch (err) {
      triggerNotification("Imtihonni boshlashda xatolik yuz berdi", 'error');
    }
  };

  const handleFinishExam = async (exam) => {
    triggerHaptic('medium');
    try {
      await analyticsAPI.finishExam(exam.id);
      setExams(prev => prev.map(e => e.id === exam.id ? { ...e, status: 'COMPLETED' } : e));
      triggerNotification(`"${exam.title}" imtihoni yakunlandi! Natijalarni ko'rishingiz mumkin.`);
    } catch (err) {
      triggerNotification("Imtihonni yakunlashda xatolik yuz berdi", 'error');
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm("Haqiqatdan ham ushbu imtihonni o'chirmoqchimisiz?")) return;
    triggerHaptic('warning');
    try {
      await analyticsAPI.deleteExam(examId);
      setExams(prev => prev.filter(e => e.id !== examId));
      triggerNotification("Imtihon o'chirildi");
    } catch (err) {
      triggerNotification("O'chirishda xatolik yuz berdi", 'error');
    }
  };

  const handleOpenOfflineResults = async (exam) => {
    triggerHaptic('light');
    setOfflineResultModal(exam);
    setOfflineScores({});
    setOfflineFeedbacks({});
    try {
      const [students, existingResults] = await Promise.all([
        groupsAPI.getGroupStudents(exam.group_id).catch(() => []),
        analyticsAPI.getExamResults(exam.id).catch(() => [])
      ]);
      const sList = Array.isArray(students) ? students : [];
      setOfflineStudents(sList);

      const initialScores = {};
      const initialFeedbacks = {};
      if (Array.isArray(existingResults)) {
        existingResults.forEach(r => {
          initialScores[r.student_id] = r.score;
          if (r.feedback) initialFeedbacks[r.student_id] = r.feedback;
        });
      }
      setOfflineScores(initialScores);
      setOfflineFeedbacks(initialFeedbacks);
    } catch (e) {
      setOfflineStudents([]);
    }
  };

  const handleSaveOfflineResults = async () => {
    if (!offlineResultModal) return;
    setOfflineSaving(true);
    try {
      const resultsPayload = offlineStudents.map(s => ({
        student_id: s.id,
        score: parseFloat(offlineScores[s.id] || 0),
        feedback: offlineFeedbacks[s.id] || (parseFloat(offlineScores[s.id] || 0) >= offlineResultModal.pass_score ? "Imtihondan muvaffaqiyatli o'tdi" : "Qoniqarsiz")
      }));

      const res = await analyticsAPI.recordExamResults({
        exam_id: offlineResultModal.id,
        results: resultsPayload
      });

      triggerNotification(`${res.results_count} ta o'quvchi natijasi saqlandi! (${res.certificates_awarded} ta o'quvchiga sertifikat berildi)`);
      setOfflineResultModal(null);
      const updatedExams = await analyticsAPI.getExams().catch(() => []);
      if (Array.isArray(updatedExams)) setExams(updatedExams);
    } catch (err) {
      const detail = err.response?.data?.detail || "Natijalarni saqlashda xatolik yuz berdi";
      triggerNotification(detail, 'error');
    }
    setOfflineSaving(false);
  };

  const handleOpenViewResults = async (exam) => {
    triggerHaptic('light');
    setViewResultsModal(exam);
    setResultsLoading(true);
    try {
      const results = await analyticsAPI.getExamResults(exam.id);
      setExamResultsList(Array.isArray(results) ? results : []);
    } catch (e) {
      setExamResultsList([]);
    }
    setResultsLoading(false);
  };

  const handleImportWord = async (e) => {
    e.preventDefault();
    if (!wordFile) {
      triggerNotification("Iltimos, Word (.docx) faylni tanlang!", 'error');
      return;
    }
    setImportingLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', wordFile);
      if (wordCourseId) formData.append('course_id', wordCourseId);

      const res = await analyticsAPI.importQuestionsWord(formData);
      triggerNotification(`${res.count} ta savol muvaffaqiyatli yuklandi va bankka qo'shildi!`);
      const qList = await analyticsAPI.getQuestions();
      setQuestions(qList);
      setWordFile(null);
      setQBankTab('list');
    } catch (err) {
      const detail = err.response?.data?.detail || "Faylni yuklashda xatolik yuz berdi";
      triggerNotification(detail, 'error');
    }
    setImportingLoading(false);
  };

  const handleImportText = async (e) => {
    e.preventDefault();
    if (!rawTextImport.trim()) {
      triggerNotification("Iltimos, matnni kiriting!", 'error');
      return;
    }
    setImportingLoading(true);
    try {
      const res = await analyticsAPI.importQuestionsText(rawTextImport, rawTextCourseId ? parseInt(rawTextCourseId) : null);
      triggerNotification(`${res.count} ta test savoli muvaffaqiyatli saqlandi!`);
      const qList = await analyticsAPI.getQuestions();
      setQuestions(qList);
      setRawTextImport('');
      setQBankTab('list');
    } catch (err) {
      const detail = err.response?.data?.detail || "Matndan yuklashda xatolik yuz berdi";
      triggerNotification(detail, 'error');
    }
    setImportingLoading(false);
  };

  const handleAddQuestionManual = async (e) => {
    e.preventDefault();
    const opts = [newQuestion.optA, newQuestion.optB, newQuestion.optC, newQuestion.optD].filter(Boolean);
    if (opts.length < 2) {
      triggerNotification("Kamida 2 ta variant kiriting!", 'error');
      return;
    }
    const correctMap = { 'A': newQuestion.optA, 'B': newQuestion.optB, 'C': newQuestion.optC, 'D': newQuestion.optD };
    const correctAns = correctMap[newQuestion.correct] || opts[0];

    try {
      const res = await analyticsAPI.createQuestion({
        course_id: newQuestion.course_id ? parseInt(newQuestion.course_id) : null,
        question_text: newQuestion.text,
        correct_answer: correctAns,
        options: opts
      });
      setQuestions(prev => [res, ...prev]);
      triggerNotification("Savol muvaffaqiyatli qo'shildi!");
      setNewQuestion({ course_id: '', text: '', optA: '', optB: '', optC: '', optD: '', correct: 'A' });
      setQBankTab('list');
    } catch (err) {
      triggerNotification("Savol qo'shishda xatolik yuz berdi", 'error');
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm("Savolni o'chirishni tasdiqlaysizmi?")) return;
    try {
      await analyticsAPI.deleteQuestion(qId);
      setQuestions(prev => prev.filter(q => q.id !== qId));
      triggerNotification("Savol o'chirildi");
    } catch (err) {
      triggerNotification("O'chirishda xatolik", 'error');
    }
  };

  const handleAddCert = (e) => {
    e.preventDefault();
    setCertificates([...certificates, { id: Date.now(), name: newCert.name, file: 'uploaded_cert.pdf' }]);
    setCertModal(false);
    triggerNotification("Sertifikat qo'shildi!");
    setNewCert({ name: '' });
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Asosiy', icon: 'dashboard', fullLabel: 'Dashboard' },
    { id: 'groups', label: 'Guruhlar', icon: 'groups', fullLabel: 'Guruhlarim', badge: myGroups.length > 0 ? myGroups.length : null },
    { id: 'exams', label: 'Imtihonlar', icon: 'quiz', fullLabel: 'Imtihonlar & Testlar', badge: exams.filter(e => e.status === 'ACTIVE').length > 0 ? exams.filter(e => e.status === 'ACTIVE').length : null },
    { id: 'profile', label: 'Profil', icon: 'person', fullLabel: 'Mening Profilim' },
  ];

  const totalStudentsTaught = myGroups.reduce((acc, g) => acc + (g.studentsList?.length || 0), 0);

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      color: '#0f172a',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflowX: 'hidden'
    }}>

      {/* ========================================================================= */}
      {/* 1. DESKTOP / TABLET SIDEBAR (Hidden on Mobile)                            */}
      {/* ========================================================================= */}
      {!isMobile && (
        <aside style={{
          width: (isTablet || sidebarCollapsed) ? '80px' : '260px',
          minWidth: (isTablet || sidebarCollapsed) ? '80px' : '260px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #bfdbfe',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 0.25s ease',
          zIndex: 30,
          height: '100vh',
          position: 'sticky',
          top: 0
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', overflowY: 'auto' }}>
            <div 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                padding: '20px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderBottom: '1px solid #eff6ff',
                cursor: 'pointer',
                backgroundColor: '#f8fafc'
              }}
              title="Sidebar holatini o'zgartirish"
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                {avatar ? (
                   <img src={avatar} alt="Logo" style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '50%', background: '#ffffff', padding: '2px', border: '2px solid #2563eb' }} />
                ) : (
                   <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '18px' }}>
                     {teacherName.charAt(0)}
                   </div>
                )}
              </div>
              {!sidebarCollapsed && !isTablet && (
                <div style={{ overflow: 'hidden' }}>
                  <h1 style={{ fontSize: '17px', fontWeight: '900', color: '#0f172a', margin: 0, whiteSpace: 'nowrap' }}>Ta'lim Plus</h1>
                  <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: '800' }}>Teacher Panel</span>
                </div>
              )}
            </div>

            <nav style={{ padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {navigationItems.map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      triggerHaptic('light');
                      setActiveTab(item.id);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: (sidebarCollapsed || isTablet) ? 'center' : 'flex-start',
                      padding: '12px 14px',
                      borderRadius: '14px',
                      fontSize: '14px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: isActive ? '#2563eb' : 'transparent',
                      color: isActive ? '#ffffff' : '#475569',
                      gap: '12px',
                      transition: 'all 0.15s ease',
                      position: 'relative'
                    }}
                    title={(sidebarCollapsed || isTablet) ? item.fullLabel : undefined}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '22px', color: isActive ? '#ffffff' : '#2563eb' }}>
                      {item.icon}
                    </span>
                    {!sidebarCollapsed && !isTablet && (
                      <span style={{ flex: 1, textAlign: 'left' }}>{item.fullLabel}</span>
                    )}
                    {item.badge && (!sidebarCollapsed && !isTablet) && (
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '900',
                        backgroundColor: isActive ? '#ffffff' : '#2563eb',
                        color: isActive ? '#2563eb' : '#ffffff',
                        padding: '2px 7px',
                        borderRadius: '50px'
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div style={{ padding: '14px', borderTop: '1px solid #eff6ff' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: '800',
                fontSize: '13px'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
              {!sidebarCollapsed && !isTablet && 'Chiqish'}
            </button>
          </div>
        </aside>
      )}

      {/* ========================================================================= */}
      {/* 2. MAIN VIEW AREA (Adaptive for Mobile, Tablet & Desktop)                 */}
      {/* ========================================================================= */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        width: '100%',
        position: 'relative'
      }}>

        {/* STICKY TOP APP HEADER */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #bfdbfe',
          padding: isMobile ? '10px 14px' : '14px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          {isMobile ? (
            /* Mobile compact header */
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div 
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveTab('profile');
                  }}
                  style={{ position: 'relative', cursor: 'pointer' }}
                >
                  {avatar ? (
                    <img src={avatar} alt="Avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2563eb' }} />
                  ) : (
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '15px' }}>
                      {teacherName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h2 style={{ fontSize: '15px', fontWeight: '900', margin: 0, color: '#0f172a', lineHeight: '1.2' }}>
                      {navigationItems.find(i => i.id === activeTab)?.fullLabel || 'Teacher'}
                    </h2>
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>
                    {teacherName.split(' ')[0]} ({teacherId})
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 8px', borderRadius: '50px' }}>
                  {new Date().toLocaleDateString('uz-UZ')}
                </span>
                <button 
                  onClick={handleLogout}
                  title="Chiqish"
                  style={{ background: '#fee2e2', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', cursor: 'pointer' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>logout</span>
                </button>
              </div>
            </div>
          ) : (
            /* Desktop / Tablet header */
            <>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0, color: '#0f172a' }}>
                  {navigationItems.find(i => i.id === activeTab)?.fullLabel}
                </h2>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                  Ustoz: {teacherName} ({teacherId})
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '6px 12px', borderRadius: '50px' }}>
                  {new Date().toLocaleDateString('uz-UZ')}
                </span>
              </div>
            </>
          )}
        </header>

        {/* NOTIFICATION TOAST */}
        {notificationToast && (
          <div style={{
            margin: isMobile ? '10px 12px 0' : '14px 28px 0',
            padding: '12px 16px',
            backgroundColor: '#eff6ff',
            border: '1.5px solid #2563eb',
            borderRadius: '16px',
            color: '#1d4ed8',
            fontSize: isMobile ? '12px' : '13px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 14px rgba(37,99,235,0.12)',
            zIndex: 35
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>info</span>
              <span>{notificationToast}</span>
            </div>
            <button onClick={() => setNotificationToast('')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', display: 'flex' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
          </div>
        )}

        {/* MAIN BODY CONTENT (With extra bottom padding on mobile for Bottom Nav) */}
        <div style={{
          padding: isMobile ? '14px 12px 90px 12px' : '24px 28px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '16px' : '24px'
        }}>

          {/* ========================================================================= */}
          {/* TAB 1: DASHBOARD                                                          */}
          {/* ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
              {/* KPI STAT TILES */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: isMobile ? '10px' : '16px'
              }}>
                <KpiCard title="O'quvchilarim" value={`${totalStudentsTaught} ta`} icon="school" isMobile={isMobile} />
                <KpiCard title="Guruhlarim" value={`${myGroups.length} ta`} icon="groups" isMobile={isMobile} />
                <KpiCard title="Savollar Banki" value={`${questions.length} ta`} icon="menu_book" isMobile={isMobile} />
                <KpiCard title="Imtihonlar" value={`${exams.length} ta`} icon="quiz" isMobile={isMobile} />
              </div>

              {/* 2-COLUMN OR STACKED DASHBOARD SECTIONS */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: (isMobile || isTablet) ? '1fr' : '1fr 1fr',
                gap: isMobile ? '14px' : '20px'
              }}>
                {/* UPCOMING LESSONS & GROUPS */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #bfdbfe',
                  borderRadius: isMobile ? '18px' : '22px',
                  padding: isMobile ? '16px' : '20px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h3 style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '900', margin: 0, color: '#0f172a' }}>
                      Dars Jadvali & Guruhlar
                    </h3>
                    <button 
                      onClick={() => {
                        triggerHaptic('light');
                        setActiveTab('groups');
                      }}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Barchasi →
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {myGroups.map(g => (
                      <div 
                        key={g.id}
                        style={{
                          padding: isMobile ? '12px' : '14px',
                          border: '1px solid #bfdbfe',
                          borderRadius: '14px',
                          backgroundColor: '#f8fafc',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: '800', color: '#1d4ed8', fontSize: isMobile ? '14px' : '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {g.name}
                          </p>
                          <p style={{ margin: '3px 0 0', fontSize: isMobile ? '11px' : '12px', color: '#475569', lineHeight: '1.3' }}>
                            {g.roomName} • {g.start_time}-{g.end_time} ({g.days_of_week})
                          </p>
                        </div>
                        <button 
                          onClick={() => handleOpenAttendance(g)}
                          style={{
                            padding: isMobile ? '8px 10px' : '8px 14px',
                            borderRadius: '10px',
                            backgroundColor: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            fontWeight: '800',
                            fontSize: '11px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>checklist</span>
                          Davomat
                        </button>
                      </div>
                    ))}
                    {myGroups.length === 0 && (
                      <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '16px' }}>Hozircha guruhlar biriktirilmagan</p>
                    )}
                  </div>
                </div>

                {/* UPCOMING EXAMS */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #bfdbfe',
                  borderRadius: isMobile ? '18px' : '22px',
                  padding: isMobile ? '16px' : '20px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h3 style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '900', margin: 0, color: '#0f172a' }}>
                      Imtihonlar
                    </h3>
                    <button 
                      onClick={() => {
                        triggerHaptic('light');
                        setNewExam({...newExam, group_id: myGroups[0]?.id || ''});
                        setAddExamModal(true);
                      }}
                      style={{ padding: '5px 10px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontWeight: '800', cursor: 'pointer', fontSize: '11px' }}
                    >
                      + Qo'shish
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {exams.map(e => (
                      <div 
                        key={e.id}
                        style={{
                          padding: isMobile ? '12px' : '14px',
                          border: '1px solid #bfdbfe',
                          borderRadius: '14px',
                          backgroundColor: '#f8fafc',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '6px', backgroundColor: e.exam_type === 'ONLINE' ? '#eff6ff' : '#f5f3ff', color: e.exam_type === 'ONLINE' ? '#1d4ed8' : '#7c3aed' }}>
                              {e.exam_type === 'ONLINE' ? 'Online' : 'Offline'}
                            </span>
                            <p style={{ margin: 0, fontWeight: '800', color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{e.title}</p>
                          </div>
                          <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#475569' }}>
                            {e.exam_date} • Max: {e.max_score} | O'tish: {e.pass_score || 70}+
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            triggerHaptic('light');
                            setActiveTab('exams');
                          }}
                          style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontSize: '11px', fontWeight: '800', cursor: 'pointer', flexShrink: 0 }}
                        >
                          Boshqaruv
                        </button>
                      </div>
                    ))}
                    {exams.length === 0 && (
                      <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '16px' }}>Hozircha imtihonlar rejalashtirilmagan</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: GROUPS (GURUHLARIM & DETAILED GROUP MANAGEMENT)                    */}
          {/* ========================================================================= */}
          {activeTab === 'groups' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '14px' : '20px' }}>
              
              {/* VIEW A: LIST OF GROUPS (When no specific group selected) */}
              {!selectedGroup && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '14px' : '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Guruhlarim</h3>
                      <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>
                        Guruhni tanlab davomat, vazifalar va to'lovlarni boshqaring
                      </p>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '800', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 12px', borderRadius: '50px' }}>
                      Jami: {myGroups.length} ta guruh
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: isMobile ? '12px' : '16px'
                  }}>
                    {myGroups.map(g => (
                      <div 
                        key={g.id} 
                        onClick={() => handleSelectGroup(g)}
                        style={{ 
                          backgroundColor: '#ffffff', 
                          border: '1.5px solid #bfdbfe', 
                          borderRadius: isMobile ? '18px' : '22px', 
                          padding: isMobile ? '16px' : '20px', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'space-between',
                          gap: '12px', 
                          boxShadow: '0 4px 14px rgba(37,99,235,0.05)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '11px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                            {g.courseName}
                          </span>
                          <span style={{ fontSize: '10px', backgroundColor: g.is_active ? '#dcfce7' : '#fee2e2', color: g.is_active ? '#166534' : '#991b1b', fontWeight: '800', padding: '2px 8px', borderRadius: '50px' }}>
                            {g.is_active ? 'Faol' : 'Nofaol'}
                          </span>
                        </div>

                        <div>
                          <h4 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                            {g.name}
                          </h4>
                          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                            {g.studentsList?.length || 0} ta o'quvchi • {g.start_time}-{g.end_time} ({g.days_of_week})
                          </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #eff6ff', paddingTop: '10px', marginTop: '2px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '800', color: '#2563eb' }}>
                            Guruh menyusi
                          </span>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563eb' }}>arrow_forward</span>
                        </div>
                      </div>
                    ))}

                    {myGroups.length === 0 && (
                      <div style={{ gridColumn: '1 / -1', padding: '36px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '20px', border: '1px dashed #bfdbfe' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#94a3b8', marginBottom: '8px' }}>groups</span>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '800' }}>Hozircha biriktirilgan guruhlar yo'q</h4>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Administrator sizga guruh biriktirgandan so'ng bu yerda paydo bo'ladi.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* VIEW B: INSIDE GROUP (With Responsive Top Header & Horizontal Sub-menu) */}
              {selectedGroup && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '16px' }}>
                  
                  {/* GROUP TOP HEADER */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                    backgroundColor: '#f8fafc',
                    padding: isMobile ? '12px 14px' : '16px 20px',
                    borderRadius: isMobile ? '16px' : '20px',
                    border: '1.5px solid #bfdbfe'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                      <button 
                        onClick={() => {
                          triggerHaptic('light');
                          setSelectedGroup(null);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: isMobile ? '8px 10px' : '8px 14px',
                          borderRadius: '10px',
                          border: '1px solid #bfdbfe',
                          backgroundColor: '#ffffff',
                          color: '#0f172a',
                          fontWeight: '800',
                          fontSize: '12px',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563eb' }}>arrow_back</span>
                        Ortga
                      </button>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '10px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>
                            {selectedGroup.courseName}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>
                            {selectedGroup.roomName} • {selectedGroup.start_time}-{selectedGroup.end_time}
                          </span>
                        </div>
                        <h3 style={{ margin: '2px 0 0', fontSize: isMobile ? '17px' : '20px', fontWeight: '900', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {selectedGroup.name}
                        </h3>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '50px' }}>
                        {selectedGroup.studentsList?.length || 0} ta o'quvchi
                      </span>
                    </div>
                  </div>

                  {/* HORIZONTAL SUB-NAVIGATION PILLS */}
                  <div 
                    className="hide-scrollbar"
                    style={{
                      display: 'flex',
                      gap: '8px',
                      overflowX: 'auto',
                      paddingBottom: '4px',
                      WebkitOverflowScrolling: 'touch',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {[
                      { id: 'details', label: 'Batafsil', icon: 'info' },
                      { id: 'attendance', label: 'Davomat', icon: 'checklist' },
                      { id: 'matrix', label: 'Statistika', icon: 'calendar_month' },
                      { id: 'homeworks', label: 'Vazifalar', icon: 'menu_book' },
                      { id: 'billing', label: "To'lovlar", icon: 'payments' },
                    ].map(tab => {
                      const isActive = groupSubTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            triggerHaptic('light');
                            setGroupSubTab(tab.id);
                            loadGroupSubTabData(selectedGroup, tab.id);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: isMobile ? '9px 14px' : '10px 18px',
                            borderRadius: '12px',
                            border: isActive ? 'none' : '1px solid #bfdbfe',
                            backgroundColor: isActive ? '#2563eb' : '#ffffff',
                            color: isActive ? '#ffffff' : '#475569',
                            fontWeight: '800',
                            fontSize: isMobile ? '12px' : '13px',
                            cursor: 'pointer',
                            flexShrink: 0,
                            boxShadow: isActive ? '0 4px 12px rgba(37,99,235,0.2)' : 'none'
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: isActive ? '#ffffff' : '#2563eb' }}>{tab.icon}</span>
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* ---------------------------------------------------- */}
                  {/* SUBTAB 1: BATAFSIL                                   */}
                  {/* ---------------------------------------------------- */}
                  {groupSubTab === 'details' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '14px' : '18px' }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                        gap: isMobile ? '8px' : '12px'
                      }}>
                        <div style={{ backgroundColor: '#f8fafc', padding: isMobile ? '12px' : '14px', borderRadius: '14px', border: '1px solid #bfdbfe' }}>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Dars Kunlari</span>
                          <p style={{ margin: '2px 0 0', fontWeight: '900', fontSize: isMobile ? '13px' : '14px', color: '#0f172a' }}>{selectedGroup.days_of_week}</p>
                        </div>
                        <div style={{ backgroundColor: '#f8fafc', padding: isMobile ? '12px' : '14px', borderRadius: '14px', border: '1px solid #bfdbfe' }}>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Dars Vaqti</span>
                          <p style={{ margin: '2px 0 0', fontWeight: '900', fontSize: isMobile ? '13px' : '14px', color: '#0f172a' }}>{selectedGroup.start_time} - {selectedGroup.end_time}</p>
                        </div>
                        <div style={{ backgroundColor: '#f8fafc', padding: isMobile ? '12px' : '14px', borderRadius: '14px', border: '1px solid #bfdbfe' }}>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Dars Xonasi</span>
                          <p style={{ margin: '2px 0 0', fontWeight: '900', fontSize: isMobile ? '13px' : '14px', color: '#0f172a' }}>{selectedGroup.roomName}</p>
                        </div>
                        <div style={{ backgroundColor: '#f8fafc', padding: isMobile ? '12px' : '14px', borderRadius: '14px', border: '1px solid #bfdbfe' }}>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Oylik Kurs Narxi</span>
                          <p style={{ margin: '2px 0 0', fontWeight: '900', fontSize: isMobile ? '13px' : '14px', color: '#2563eb' }}>{selectedGroup.coursePrice?.toLocaleString()} UZS</p>
                        </div>
                      </div>

                      {/* STUDENTS LIST CARD / TABLE */}
                      <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: isMobile ? '16px' : '20px', overflow: 'hidden' }}>
                        <div style={{ padding: '12px 16px', backgroundColor: '#eff6ff', borderBottom: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ margin: 0, fontSize: isMobile ? '13px' : '15px', fontWeight: '900', color: '#1e3a8a' }}>
                            Guruh O'quvchilari ({selectedGroup.studentsList?.length || 0} ta)
                          </h4>
                        </div>

                        {/* Responsive Mobile View: Cards */}
                        {isMobile ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px' }}>
                            {(selectedGroup.studentsList || []).map((s, idx) => (
                              <div key={s.id} style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #eff6ff', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '13px' }}>
                                    {idx + 1}. {s.full_name}
                                  </div>
                                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb' }}>ID: {s.login_id}</span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  {s.phone && <div>Tel: {s.phone}</div>}
                                  {s.parent_phone && <div>Ota-ona: {s.parent_phone}</div>}
                                </div>
                              </div>
                            ))}
                            {(selectedGroup.studentsList || []).length === 0 && (
                              <p style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', padding: '20px' }}>O'quvchilar mavjud emas</p>
                            )}
                          </div>
                        ) : (
                          /* Desktop / Tablet View: Table */
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                              <thead>
                                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #bfdbfe', color: '#475569', fontWeight: '800' }}>
                                  <th style={{ padding: '10px 14px' }}>#</th>
                                  <th style={{ padding: '10px 14px' }}>ID</th>
                                  <th style={{ padding: '10px 14px' }}>F.I.Sh</th>
                                  <th style={{ padding: '10px 14px' }}>Telefon</th>
                                  <th style={{ padding: '10px 14px' }}>Ota-ona Tel</th>
                                  <th style={{ padding: '10px 14px' }}>Telegram</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(selectedGroup.studentsList || []).map((s, idx) => (
                                  <tr key={s.id} style={{ borderBottom: '1px solid #eff6ff' }}>
                                    <td style={{ padding: '10px 14px', color: '#64748b' }}>{idx + 1}</td>
                                    <td style={{ padding: '10px 14px', fontWeight: '800', color: '#2563eb' }}>{s.login_id}</td>
                                    <td style={{ padding: '10px 14px', fontWeight: '700', color: '#0f172a' }}>{s.full_name}</td>
                                    <td style={{ padding: '10px 14px' }}>{s.phone || "—"}</td>
                                    <td style={{ padding: '10px 14px', color: '#64748b' }}>
                                      {s.parent_phone || "Mavjud emas"}
                                    </td>
                                    <td style={{ padding: '10px 14px' }}>
                                      {s.telegram_chat_id ? (
                                        <span style={{ fontSize: '11px', backgroundColor: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '6px', fontWeight: '800' }}>Ulangan</span>
                                      ) : (
                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Ulanmagan</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                                {(selectedGroup.studentsList || []).length === 0 && (
                                  <tr>
                                    <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                                      Ushbu guruhda o'quvchilar mavjud emas.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ---------------------------------------------------- */}
                  {/* SUBTAB 2: DAVOMAT (ATTENDANCE TAKING)                */}
                  {/* ---------------------------------------------------- */}
                  {groupSubTab === 'attendance' && (
                    <div style={{
                      backgroundColor: '#ffffff',
                      border: '1.5px solid #bfdbfe',
                      borderRadius: isMobile ? '18px' : '22px',
                      padding: isMobile ? '14px' : '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: isMobile ? '12px' : '16px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: isMobile ? '15px' : '17px', fontWeight: '900', color: '#0f172a' }}>Dars Davomati</h4>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>O'quvchilar holatini belgilang va saqlang</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            triggerHaptic('light');
                            const allPresent = {};
                            attendanceStudents.forEach(s => { allPresent[s.id] = 'PRESENT'; });
                            setAttendanceRecords(allPresent);
                          }}
                          style={{ padding: '6px 12px', borderRadius: '10px', border: '1px solid #86efac', backgroundColor: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                        >
                          Hammasini "Keldi"
                        </button>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '1fr 1.5fr',
                        gap: '10px',
                        backgroundColor: '#f8fafc',
                        padding: '12px',
                        borderRadius: '14px',
                        border: '1px solid #eff6ff'
                      }}>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '800', color: '#374151', marginBottom: '4px', display: 'block' }}>Dars Sanasi</label>
                          <input 
                            type="date" 
                            value={lessonDate} 
                            onChange={e => setLessonDate(e.target.value)} 
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', fontWeight: '700', fontSize: '13px' }} 
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '800', color: '#374151', marginBottom: '4px', display: 'block' }}>Dars Mavzusi</label>
                          <input 
                            type="text" 
                            placeholder="Masalan: Unit 5 - Vocabulary..." 
                            value={lessonTopic} 
                            onChange={e => setLessonTopic(e.target.value)} 
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', fontSize: '13px' }} 
                          />
                        </div>
                      </div>

                      {attendanceLoading ? (
                        <div style={{ padding: '30px', textAlign: 'center', color: '#2563eb', fontWeight: '800', fontSize: '13px' }}>O'quvchilar yuklanmoqda...</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {attendanceStudents.map((s, idx) => {
                            const status = attendanceRecords[s.id] || 'PRESENT';
                            return (
                              <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: isMobile ? '10px 12px' : '12px 16px', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc', borderRadius: '14px', border: '1px solid #eff6ff' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                  <div>
                                    <span style={{ fontWeight: '800', color: '#0f172a', fontSize: isMobile ? '13px' : '14px' }}>{s.full_name}</span>
                                    <span style={{ marginLeft: '6px', fontSize: '11px', color: '#2563eb', fontWeight: '700' }}>ID: {s.login_id}</span>
                                    {s.telegram_chat_id && (
                                      <span style={{ marginLeft: '6px', fontSize: '10px', backgroundColor: '#e0f2fe', color: '#0284c7', padding: '1px 5px', borderRadius: '4px', fontWeight: '800' }}>TG</span>
                                    )}
                                  </div>
                                  
                                  {/* 4 TOUCH BUTTONS */}
                                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(4, auto)', gap: '4px', width: isMobile ? '100%' : 'auto' }}>
                                    <button 
                                      type="button"
                                      onClick={() => handleMarkAttendance(s.id, 'PRESENT')} 
                                      style={{ padding: '6px 8px', borderRadius: '8px', border: status === 'PRESENT' ? '1.5px solid #16a34a' : '1px solid #e2e8f0', backgroundColor: status === 'PRESENT' ? '#dcfce7' : '#ffffff', color: status === 'PRESENT' ? '#166534' : '#64748b', fontWeight: '800', cursor: 'pointer', fontSize: isMobile ? '11px' : '12px', textAlign: 'center' }}
                                    >
                                      Keldi
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => handleMarkAttendance(s.id, 'LATE')} 
                                      style={{ padding: '6px 8px', borderRadius: '8px', border: status === 'LATE' ? '1.5px solid #d97706' : '1px solid #e2e8f0', backgroundColor: status === 'LATE' ? '#fef3c7' : '#ffffff', color: status === 'LATE' ? '#b45309' : '#64748b', fontWeight: '800', cursor: 'pointer', fontSize: isMobile ? '11px' : '12px', textAlign: 'center' }}
                                    >
                                      Kechikdi
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => handleMarkAttendance(s.id, 'ABSENT')} 
                                      style={{ padding: '6px 8px', borderRadius: '8px', border: status === 'ABSENT' ? '1.5px solid #dc2626' : '1px solid #e2e8f0', backgroundColor: status === 'ABSENT' ? '#fee2e2' : '#ffffff', color: status === 'ABSENT' ? '#991b1b' : '#64748b', fontWeight: '800', cursor: 'pointer', fontSize: isMobile ? '11px' : '12px', textAlign: 'center' }}
                                    >
                                      Kelmadi
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => handleMarkAttendance(s.id, 'EXCUSED')} 
                                      style={{ padding: '6px 8px', borderRadius: '8px', border: status === 'EXCUSED' ? '1.5px solid #2563eb' : '1px solid #e2e8f0', backgroundColor: status === 'EXCUSED' ? '#eff6ff' : '#ffffff', color: status === 'EXCUSED' ? '#1d4ed8' : '#64748b', fontWeight: '800', cursor: 'pointer', fontSize: isMobile ? '11px' : '12px', textAlign: 'center' }}
                                    >
                                      Sababli
                                    </button>
                                  </div>
                                </div>

                                <input 
                                  type="text" 
                                  placeholder="Izoh (masalan: 10 daqiqa kechikdi)..." 
                                  value={attendanceNotes[s.id] || ''} 
                                  onChange={e => setAttendanceNotes({...attendanceNotes, [s.id]: e.target.value})} 
                                  style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '11px', backgroundColor: '#ffffff' }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #eff6ff', paddingTop: '12px' }}>
                        <button 
                          type="button" 
                          onClick={async () => {
                            if (!selectedGroup) return;
                            triggerHaptic('medium');
                            try {
                              const lesson = await attendanceAPI.createLesson({
                                group_id: selectedGroup.id,
                                lesson_date: lessonDate,
                                topic: lessonTopic || `Dars ${lessonDate}`
                              });
                              const attendances = attendanceStudents.map(s => ({
                                student_id: s.id,
                                status: attendanceRecords[s.id] || 'PRESENT',
                                note: attendanceNotes[s.id] || null
                              }));
                              await attendanceAPI.markAttendance({
                                lesson_id: lesson.id,
                                attendances: attendances
                              });
                              triggerNotification(`${attendances.length} ta o'quvchining davomati saqlandi va Telegram orqali xabar yuborildi!`);
                              loadGroupSubTabData(selectedGroup, 'matrix');
                            } catch (err) {
                              const detail = err.response?.data?.detail || "Davomatni saqlashda xatolik";
                              triggerNotification(detail, 'error');
                            }
                          }}
                          disabled={attendanceStudents.length === 0}
                          style={{
                            width: isMobile ? '100%' : 'auto',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: attendanceStudents.length === 0 ? '#94a3b8' : '#2563eb',
                            color: '#ffffff',
                            fontWeight: '900',
                            fontSize: isMobile ? '13px' : '14px',
                            cursor: attendanceStudents.length === 0 ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 14px rgba(37,99,235,0.2)'
                          }}
                        >
                          Davomatni Saqlash & Xabar Yuborish
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ---------------------------------------------------- */}
                  {/* SUBTAB 3: DAVOMAT STATISTIKASI (ELECTRONIC JOURNAL)  */}
                  {/* ---------------------------------------------------- */}
                  {groupSubTab === 'matrix' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: isMobile ? '15px' : '17px', fontWeight: '900', color: '#0f172a' }}>Elektron Jurnal</h4>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>Barcha dars sanalari bo'yicha to'liq davomat matritsasi</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            loadGroupSubTabData(selectedGroup, 'matrix');
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '10px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', fontSize: '11px', cursor: 'pointer' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>refresh</span>
                          Yangilash
                        </button>
                      </div>

                      {/* LEGEND */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '12px', border: '1px solid #eff6ff', fontSize: '11px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '800', color: '#475569' }}>Belgilar:</span>
                        <span style={{ color: '#166534', fontWeight: '700' }}>Keldi</span>
                        <span style={{ color: '#991b1b', fontWeight: '700' }}>Kelmadi</span>
                        <span style={{ color: '#b45309', fontWeight: '700' }}>Kechikdi</span>
                        <span style={{ color: '#1d4ed8', fontWeight: '700' }}>Sababli</span>
                      </div>

                      {groupJournalLoading ? (
                        <div style={{ padding: '30px', textAlign: 'center', color: '#2563eb', fontWeight: '800', fontSize: '13px' }}>Jurnal yuklanmoqda...</div>
                      ) : !groupJournalData || (groupJournalData.students?.length === 0) ? (
                        <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px dashed #bfdbfe' }}>
                          <p style={{ color: '#64748b', fontWeight: '700', margin: 0, fontSize: '13px' }}>Guruhda biriktirilgan o'quvchilar yo'q.</p>
                        </div>
                      ) : (
                        <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #bfdbfe', borderRadius: isMobile ? '16px' : '20px', overflowX: 'auto', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '12px', minWidth: isMobile ? '480px' : 'auto' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#eff6ff', borderBottom: '1.5px solid #bfdbfe', color: '#1e3a8a', fontWeight: '900' }}>
                                <th style={{ padding: '10px 12px', textAlign: 'left', position: 'sticky', left: 0, backgroundColor: '#eff6ff', zIndex: 10, minWidth: '150px', borderRight: '1px solid #bfdbfe' }}>
                                  F.I.Sh
                                </th>
                                {(groupJournalData.lessons || []).map((lesson) => (
                                  <th key={lesson.id} style={{ padding: '8px 10px', minWidth: '70px', borderRight: '1px solid #bfdbfe' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '900', color: '#1e3a8a' }}>
                                      {lesson.lesson_date?.split('-')?.slice(1)?.join('/') || lesson.lesson_date}
                                    </div>
                                    <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', marginTop: '3px' }}>
                                      <button 
                                        onClick={() => handleOpenTeacherMarkModal(lesson)}
                                        style={{ padding: '2px 5px', borderRadius: '4px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', color: '#2563eb', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        title="Tahrirlash"
                                      >
                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                                      </button>
                                      <button 
                                        onClick={async () => {
                                          if (!window.confirm(`${lesson.lesson_date} darsini o'chirishni tasdiqlaysizmi?`)) return;
                                          try {
                                            await attendanceAPI.deleteLesson(lesson.id);
                                            triggerNotification("Dars o'chirildi");
                                            const journal = await attendanceAPI.getGroupJournal(selectedGroup.id);
                                            setGroupJournalData(journal);
                                          } catch (err) {
                                            triggerNotification("O'chirishda xatolik", 'error');
                                          }
                                        }}
                                        style={{ padding: '2px 5px', borderRadius: '4px', border: '1px solid #fee2e2', backgroundColor: '#ffffff', color: '#dc2626', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        title="O'chirish"
                                      >
                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                                      </button>
                                    </div>
                                  </th>
                                ))}
                                {(!groupJournalData.lessons || groupJournalData.lessons.length === 0) && (
                                  <th style={{ padding: '12px', color: '#64748b', fontWeight: 'normal' }}>
                                    Dars sanalari mavjud emas
                                  </th>
                                )}
                                <th style={{ padding: '10px 12px', minWidth: '70px', backgroundColor: '#eff6ff', borderLeft: '1px solid #bfdbfe', position: 'sticky', right: 0, zIndex: 10 }}>
                                  %
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {groupJournalData.students.map((student, idx) => {
                                const totalLessons = groupJournalData.lessons?.length || 0;
                                let attendedCount = 0;
                                
                                return (
                                  <tr key={student.id} style={{ borderBottom: '1px solid #eff6ff', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                    <td style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '800', color: '#0f172a', position: 'sticky', left: 0, backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc', zIndex: 5, borderRight: '1px solid #eff6ff', whiteSpace: 'nowrap' }}>
                                      <div>{student.full_name}</div>
                                    </td>

                                    {(groupJournalData.lessons || []).map((lesson) => {
                                      const record = groupJournalData.matrix?.[String(student.id)]?.[String(lesson.id)];
                                      const status = record?.status;
                                      if (status === 'PRESENT' || status === 'LATE') attendedCount++;

                                      return (
                                        <td key={lesson.id} style={{ padding: '6px', borderRight: '1px solid #eff6ff' }}>
                                          {status === 'PRESENT' && <span style={{ color: '#166534', fontWeight: '900' }}>K</span>}
                                          {status === 'ABSENT' && <span style={{ color: '#dc2626', fontWeight: '900' }}>Q</span>}
                                          {status === 'LATE' && <span style={{ color: '#d97706', fontWeight: '900' }}>Kch</span>}
                                          {status === 'EXCUSED' && <span style={{ color: '#2563eb', fontWeight: '900' }}>S</span>}
                                          {!status && <span style={{ color: '#cbd5e1' }}>—</span>}
                                        </td>
                                      );
                                    })}

                                    {(!groupJournalData.lessons || groupJournalData.lessons.length === 0) && (
                                      <td style={{ padding: '10px', color: '#94a3b8' }}>—</td>
                                    )}

                                    <td style={{ padding: '10px 12px', fontWeight: '900', color: totalLessons > 0 ? (attendedCount / totalLessons >= 0.8 ? '#166534' : '#dc2626') : '#64748b', position: 'sticky', right: 0, backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc', zIndex: 5, borderLeft: '1px solid #eff6ff' }}>
                                      {totalLessons > 0 ? `${Math.round((attendedCount / totalLessons) * 100)}%` : '0%'}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ---------------------------------------------------- */}
                  {/* SUBTAB 4: VAZIFALAR (HOMEWORKS)                      */}
                  {/* ---------------------------------------------------- */}
                  {groupSubTab === 'homeworks' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: isMobile ? '15px' : '17px', fontWeight: '900', color: '#0f172a' }}>Uy Vazifalari</h4>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>Vazifa berish va topshirilgan ishlarni baholash</p>
                        </div>
                        <button 
                          onClick={() => {
                            triggerHaptic('light');
                            setShowAddHomeworkModal(true);
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                          + Yangi Vazifa
                        </button>
                      </div>

                      {homeworksLoading ? (
                        <div style={{ padding: '30px', textAlign: 'center', color: '#2563eb', fontWeight: '800', fontSize: '13px' }}>Vazifalar yuklanmoqda...</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {groupHomeworks.map(hw => (
                            <div key={hw.id} style={{ backgroundColor: '#ffffff', border: '1.5px solid #bfdbfe', borderRadius: isMobile ? '16px' : '18px', padding: isMobile ? '14px' : '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                              <div style={{ flex: 1, minWidth: isMobile ? '100%' : '200px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                  <span style={{ fontSize: '10px', backgroundColor: '#fef3c7', color: '#b45309', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>
                                    Max: {hw.max_coins} coin
                                  </span>
                                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                                    {hw.created_at?.split('T')[0]}
                                  </span>
                                </div>
                                <h4 style={{ margin: 0, fontSize: isMobile ? '14px' : '15px', fontWeight: '900', color: '#0f172a' }}>{hw.title}</h4>
                                {hw.description && (
                                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#475569' }}>{hw.description}</p>
                                )}
                              </div>

                              <div style={{ width: isMobile ? '100%' : 'auto' }}>
                                <button 
                                  onClick={() => handleOpenHwSubmissions(hw)}
                                  style={{ width: isMobile ? '100%' : 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>task</span>
                                  Ishlarni ko'rish
                                </button>
                              </div>
                            </div>
                          ))}
                          {groupHomeworks.length === 0 && (
                            <div style={{ padding: '28px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px dashed #bfdbfe' }}>
                              <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Hozircha vazifalar berilmagan.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ---------------------------------------------------- */}
                  {/* SUBTAB 5: TO'LOVLAR (BILLING & PAYMENTS)              */}
                  {/* ---------------------------------------------------- */}
                  {groupSubTab === 'billing' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: isMobile ? '15px' : '17px', fontWeight: '900', color: '#0f172a' }}>O'quvchilar To'lov Holati</h4>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>Oylik to'lov va qarzdorlik holati</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input 
                            type="month" 
                            value={paymentMonth} 
                            onChange={e => {
                              setPaymentMonth(e.target.value);
                              loadGroupSubTabData(selectedGroup, 'billing');
                            }}
                            style={{ padding: '6px 10px', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '12px', fontWeight: '800', backgroundColor: '#f8fafc', color: '#1e3a8a' }} 
                          />
                        </div>
                      </div>

                      {/* SUMMARY TILES */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700' }}>Jami</div>
                          <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a' }}>{paymentStudents.length} ta</div>
                        </div>
                        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: '#166534', fontWeight: '700' }}>To'lagan</div>
                          <div style={{ fontSize: '14px', fontWeight: '900', color: '#15803d' }}>{paymentStudents.filter(s => s.is_paid).length} ta</div>
                        </div>
                        <div style={{ backgroundColor: '#fefce8', border: '1px solid #fde047', borderRadius: '12px', padding: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: '#854d0e', fontWeight: '700' }}>Qisman</div>
                          <div style={{ fontSize: '14px', fontWeight: '900', color: '#a16207' }}>{paymentStudents.filter(s => s.is_partial).length} ta</div>
                        </div>
                        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: '#991b1b', fontWeight: '700' }}>Qarzdor</div>
                          <div style={{ fontSize: '14px', fontWeight: '900', color: '#dc2626' }}>{paymentStudents.filter(s => !s.is_paid && !s.is_partial).length} ta</div>
                        </div>
                      </div>

                      {paymentLoading ? (
                        <div style={{ padding: '30px', textAlign: 'center', color: '#2563eb', fontWeight: '800', fontSize: '13px' }}>To'lovlar yuklanmoqda...</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {paymentStudents.map(s => {
                            const isPaid = s.is_paid;
                            const isPartial = s.is_partial;
                            return (
                              <div key={s.student_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '12px' : '14px 16px', backgroundColor: isPaid ? '#ffffff' : isPartial ? '#fffdf5' : '#fff8f8', borderRadius: '14px', border: `1.5px solid ${isPaid ? '#bfdbfe' : isPartial ? '#fde047' : '#fecaca'}`, gap: '8px', flexWrap: 'wrap' }}>
                                <div>
                                  <p style={{ margin: 0, fontWeight: '800', color: '#0f172a', fontSize: '13px' }}>
                                    {s.full_name} <span style={{ color: '#2563eb', fontSize: '11px' }}>(ID: {s.login_id})</span>
                                  </p>
                                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>
                                    Tel: {s.phone || 'yo\'q'}
                                  </p>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                  <span style={{ 
                                    fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '6px',
                                    backgroundColor: isPaid ? '#dcfce7' : isPartial ? '#fef3c7' : '#fee2e2',
                                    color: isPaid ? '#166534' : isPartial ? '#b45309' : '#991b1b',
                                    display: 'inline-block', marginBottom: '2px'
                                  }}>
                                    {isPaid ? "To'langan" : isPartial ? "Qisman" : "To'lanmagan"}
                                  </span>
                                  
                                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '900', color: isPaid ? '#166534' : isPartial ? '#b45309' : '#dc2626' }}>
                                    {s.amount_paid?.toLocaleString()} / {s.expected_fee?.toLocaleString()} UZS
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          {paymentStudents.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', padding: '20px' }}>Ushbu guruhda o'quvchilar yo'q.</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: EXAMS & TEST BANK                                                  */}
          {/* ========================================================================= */}
          {activeTab === 'exams' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '14px' : '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Imtihonlar & Testlar</h3>
                  <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: isMobile ? '12px' : '13px' }}>Online va Offline testlar, savollar banki</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
                  <button 
                    onClick={() => {
                      triggerHaptic('light');
                      setNewExam({...newExam, group_id: myGroups[0]?.id || ''});
                      setAddExamModal(true);
                    }}
                    style={{ flex: isMobile ? 1 : 'none', padding: '10px 14px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span> Imtihon Qo'shish
                  </button>
                  <button 
                    onClick={() => {
                      triggerHaptic('light');
                      setQuestionsBankModal(true);
                    }}
                    style={{ flex: isMobile ? 1 : 'none', padding: '10px 14px', borderRadius: '10px', border: '1px solid #2563eb', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>menu_book</span> Savollar ({questions.length})
                  </button>
                </div>
              </div>

              {/* ACTIVE EXAMS BANNER */}
              {exams.some(e => e.status === 'ACTIVE') && (
                <div style={{ padding: '12px 16px', backgroundColor: '#eff6ff', border: '2px solid #2563eb', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#2563eb' }}>hourglass_empty</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: '#1e3a8a' }}>Faol Imtihon Davom Etmoqda!</h4>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#3b82f6', fontWeight: '700' }}>O'quvchilar test topshirmoqda</p>
                  </div>
                </div>
              )}

              {/* EXAMS LIST (Responsive Cards on Mobile / Table on Desktop) */}
              {isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {exams.map(e => {
                    const isOnline = e.exam_type === 'ONLINE';
                    const isScheduled = e.status === 'SCHEDULED';
                    const isActive = e.status === 'ACTIVE';

                    return (
                      <div key={e.id} style={{ backgroundColor: '#ffffff', border: '1.5px solid #bfdbfe', borderRadius: '16px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '6px', backgroundColor: isOnline ? '#eff6ff' : '#f5f3ff', color: isOnline ? '#1d4ed8' : '#7c3aed' }}>
                            {isOnline ? 'Online' : 'Offline'}
                          </span>
                          <span style={{
                            fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '50px',
                            backgroundColor: isScheduled ? '#fef3c7' : isActive ? '#dbeafe' : '#dcfce7',
                            color: isScheduled ? '#b45309' : isActive ? '#1d4ed8' : '#166534'
                          }}>
                            {isScheduled ? 'Kutilmoqda' : isActive ? 'Davom etmoqda' : 'Yakunlangan'}
                          </span>
                        </div>

                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: '#0f172a' }}>{e.title}</h4>
                        <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div>{e.group_name || `Guruh #${e.group_id}`} • {e.exam_date}</div>
                          <div>Max: {e.max_score} ball | O'tish: {e.pass_score || 70}+ ball</div>
                        </div>

                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                          {isScheduled && (
                            <button 
                              onClick={() => handleStartExam(e)}
                              style={{ flex: 1, padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: '800', fontSize: '11px', cursor: 'pointer' }}
                            >
                              Boshlash
                            </button>
                          )}
                          {isActive && (
                            <button 
                              onClick={() => handleFinishExam(e)}
                              style={{ flex: 1, padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', color: '#fff', fontWeight: '800', fontSize: '11px', cursor: 'pointer' }}
                            >
                              Yakunlash
                            </button>
                          )}
                          {!isOnline && (
                            <button 
                              onClick={() => handleOpenOfflineResults(e)}
                              style={{ flex: 1, padding: '6px', borderRadius: '8px', border: '1px solid #7c3aed', backgroundColor: '#f5f3ff', color: '#7c3aed', fontWeight: '800', fontSize: '11px', cursor: 'pointer' }}
                            >
                              Natija kiritish
                            </button>
                          )}
                          <button 
                            onClick={() => handleOpenViewResults(e)}
                            style={{ flex: 1, padding: '6px', borderRadius: '8px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', fontSize: '11px', cursor: 'pointer' }}
                          >
                            Natijalar
                          </button>
                          <button 
                            onClick={() => handleDeleteExam(e.id)}
                            style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: '800', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {exams.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', padding: '24px' }}>Hozircha imtihonlar yaratilmagan.</p>
                  )}
                </div>
              ) : (
                /* Desktop Table */
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '20px', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #bfdbfe', color: '#1d4ed8', fontWeight: '800' }}>
                        <th style={{ padding: '12px 16px' }}>Imtihon Nomi</th>
                        <th style={{ padding: '12px 16px' }}>Turi</th>
                        <th style={{ padding: '12px 16px' }}>Guruh</th>
                        <th style={{ padding: '12px 16px' }}>Sana & Vaqt</th>
                        <th style={{ padding: '12px 16px' }}>Max / Sertifikat</th>
                        <th style={{ padding: '12px 16px' }}>Holati</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>Amallar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exams.map(e => {
                        const isOnline = e.exam_type === 'ONLINE';
                        const isScheduled = e.status === 'SCHEDULED';
                        const isActive = e.status === 'ACTIVE';

                        return (
                          <tr key={e.id} style={{ borderBottom: '1px solid #eff6ff' }}>
                            <td style={{ padding: '12px 16px', fontWeight: '800', color: '#0f172a' }}>{e.title}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', backgroundColor: isOnline ? '#eff6ff' : '#f5f3ff', color: isOnline ? '#1d4ed8' : '#7c3aed' }}>
                                {isOnline ? 'Online' : 'Offline'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', color: '#2563eb', fontWeight: '700' }}>{e.group_name || `Guruh #${e.group_id}`}</td>
                            <td style={{ padding: '12px 16px', color: '#475569' }}>
                              <div>{e.exam_date}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{e.duration_minutes || 30} daqiqa</div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div>Max: <strong>{e.max_score}</strong></div>
                              <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700' }}>O'tish: {e.pass_score || 70}+ ball</div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{
                                fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '50px',
                                backgroundColor: isScheduled ? '#fef3c7' : isActive ? '#dbeafe' : '#dcfce7',
                                color: isScheduled ? '#b45309' : isActive ? '#1d4ed8' : '#166534'
                              }}>
                                {isScheduled ? 'Kutilmoqda' : isActive ? 'Davom etmoqda' : 'Yakunlangan'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                {isScheduled && (
                                  <button onClick={() => handleStartExam(e)} style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: '800', fontSize: '11px', cursor: 'pointer' }}>
                                    Boshlash
                                  </button>
                                )}
                                {isActive && (
                                  <button onClick={() => handleFinishExam(e)} style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', backgroundColor: '#dc2626', color: '#fff', fontWeight: '800', fontSize: '11px', cursor: 'pointer' }}>
                                    Yakunlash
                                  </button>
                                )}
                                {!isOnline && (
                                  <button onClick={() => handleOpenOfflineResults(e)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #7c3aed', backgroundColor: '#f5f3ff', color: '#7c3aed', fontWeight: '800', fontSize: '11px', cursor: 'pointer' }}>
                                    Natija
                                  </button>
                                )}
                                <button onClick={() => handleOpenViewResults(e)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', fontSize: '11px', cursor: 'pointer' }}>
                                  Jadval
                                </button>
                                <button onClick={() => handleDeleteExam(e.id)} style={{ padding: '4px 6px', borderRadius: '6px', border: 'none', backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: '800', fontSize: '11px', cursor: 'pointer' }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {exams.length === 0 && (
                        <tr>
                          <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                            Hozircha imtihonlar yaratilmagan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: PROFILE                                                            */}
          {/* ========================================================================= */}
          {activeTab === 'profile' && (
            <div style={{
              display: 'flex',
              flexDirection: (isMobile || isTablet) ? 'column' : 'row',
              gap: isMobile ? '14px' : '24px',
              alignItems: 'flex-start'
            }}>
              {/* PROFILE DETAILS */}
              <div style={{
                flex: 1,
                width: '100%',
                backgroundColor: '#ffffff',
                border: '1.5px solid #bfdbfe',
                borderRadius: isMobile ? '18px' : '22px',
                padding: isMobile ? '16px' : '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <h3 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '900', margin: 0 }}>Shaxsiy Ma'lumotlar</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ position: 'relative' }}>
                    {avatar ? (
                      <img src={avatar} alt="Profile" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #2563eb' }} />
                    ) : (
                      <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#eff6ff', border: '2px dashed #2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '30px', color: '#2563eb' }}>add_a_photo</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: isMobile ? '17px' : '20px', fontWeight: '900', color: '#0f172a' }}>{teacherName}</h4>
                    <p style={{ margin: '2px 0 0', color: '#2563eb', fontSize: '13px', fontWeight: '700' }}>ID: {teacherId} • Ustoz</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>To'liq Ism</label>
                    <input value={teacherName} onChange={e => setTeacherName(e.target.value)} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', fontSize: '13px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Telefon</label>
                    <input value={teacherPhone} onChange={e => setTeacherPhone(e.target.value)} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', fontSize: '13px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Mutaxassislik</label>
                    <input value={teacherSpec} onChange={e => setTeacherSpec(e.target.value)} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', fontSize: '13px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Tajriba</label>
                    <input value={teacherExp} onChange={e => setTeacherExp(e.target.value)} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', fontSize: '13px' }} />
                  </div>
                </div>

                <button 
                  onClick={() => triggerNotification("Profil saqlandi!")} 
                  style={{ padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '800', cursor: 'pointer', fontSize: '13px', marginTop: '4px' }}
                >
                  Saqlash
                </button>
              </div>

              {/* CERTIFICATES */}
              <div style={{
                flex: 1,
                width: '100%',
                backgroundColor: '#ffffff',
                border: '1.5px solid #bfdbfe',
                borderRadius: isMobile ? '18px' : '22px',
                padding: isMobile ? '16px' : '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '900', margin: 0 }}>Sertifikatlar</h3>
                  <button onClick={() => setCertModal(true)} style={{ padding: '6px 12px', borderRadius: '10px', border: '1px solid #2563eb', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', fontSize: '11px', cursor: 'pointer' }}>
                    + Qo'shish
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {certificates.map(c => (
                    <div key={c.id} style={{ padding: '12px', border: '1px solid #bfdbfe', borderRadius: '12px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '26px', color: '#2563eb' }}>workspace_premium</span>
                      <div>
                        <p style={{ margin: 0, fontWeight: '800', color: '#0f172a', fontSize: '13px' }}>{c.name}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#2563eb' }}>{c.file}</p>
                      </div>
                    </div>
                  ))}
                  {certificates.length === 0 && <p style={{ color: '#64748b', fontSize: '12px', textAlign: 'center', padding: '16px' }}>Sertifikatlar mavjud emas</p>}
                </div>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* ========================================================================= */}
      {/* 3. MOBILE FIXED BOTTOM NAVIGATION BAR (Telegram Mini App Style)           */}
      {/* ========================================================================= */}
      {isMobile && (
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid #bfdbfe',
          padding: '8px 6px',
          paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 80,
          userSelect: 'none',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.06)'
        }}>
          {navigationItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab(item.id);
                  if (item.id === 'groups') {
                    // keep current view or reset
                  }
                }}
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
                  color: isActive ? '#2563eb' : '#64748b',
                  position: 'relative'
                }}
              >
                {item.badge && (
                  <span style={{
                    position: 'absolute',
                    top: '0px',
                    right: 'calc(50% - 16px)',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    fontSize: '9px',
                    fontWeight: '900',
                    minWidth: '14px',
                    height: '14px',
                    borderRadius: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px'
                  }}>
                    {item.badge}
                  </span>
                )}
                <span className="material-symbols-outlined" style={{ fontSize: '22px', fontWeight: isActive ? '900' : 'normal' }}>
                  {item.icon}
                </span>
                <span style={{ fontSize: '10px', fontWeight: isActive ? '900' : '700' }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}

      {/* ========================================================================= */}
      {/* 4. RESPONSIVE MODALS                                                      */}
      {/* ========================================================================= */}

      {/* 1. Add Exam Modal */}
      {addExamModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: '14px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: isMobile ? '18px 14px' : '28px 32px', borderRadius: isMobile ? '20px' : '24px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eff6ff', paddingBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>Imtihon Yaratish</span>
                <h3 style={{ margin: '4px 0 0', fontSize: isMobile ? '17px' : '19px', fontWeight: '900', color: '#0f172a' }}>Yangi Imtihon Qo'shish</h3>
              </div>
              <button onClick={() => setAddExamModal(false)} style={{ background: '#f8fafc', border: '1px solid #bfdbfe', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>

            <form onSubmit={handleAddExam} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#374151', display: 'block', marginBottom: '4px' }}>Imtihon Turi:</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setNewExam({...newExam, exam_type: 'ONLINE'})}
                    style={{
                      padding: '10px', borderRadius: '10px', border: newExam.exam_type === 'ONLINE' ? '2px solid #2563eb' : '1px solid #bfdbfe',
                      backgroundColor: newExam.exam_type === 'ONLINE' ? '#eff6ff' : '#ffffff',
                      color: newExam.exam_type === 'ONLINE' ? '#1d4ed8' : '#475569',
                      fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                    }}
                  >
                    Online (Test)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewExam({...newExam, exam_type: 'OFFLINE'})}
                    style={{
                      padding: '10px', borderRadius: '10px', border: newExam.exam_type === 'OFFLINE' ? '2px solid #7c3aed' : '1px solid #bfdbfe',
                      backgroundColor: newExam.exam_type === 'OFFLINE' ? '#f5f3ff' : '#ffffff',
                      color: newExam.exam_type === 'OFFLINE' ? '#7c3aed' : '#475569',
                      fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                    }}
                  >
                    Offline (Yozma)
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Guruh</label>
                  <select required value={newExam.group_id} onChange={e => setNewExam({...newExam, group_id: e.target.value})} style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', fontWeight: '700', fontSize: '13px' }}>
                    <option value="">Guruhni tanlang...</option>
                    {myGroups.map(g => <option key={g.id} value={g.id}>{g.name} ({g.courseName})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Sana</label>
                  <input required type="date" value={newExam.exam_date} onChange={e => setNewExam({...newExam, exam_date: e.target.value})} style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '13px' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Imtihon nomi</label>
                <input required type="text" placeholder="Masalan: 1-Oraliq Nazorat Testi" value={newExam.title} onChange={e => setNewExam({...newExam, title: e.target.value})} style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '13px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '700', color: '#374151', marginBottom: '2px', display: 'block' }}>Vaqt (daq)</label>
                  <input required type="number" min="5" max="180" value={newExam.duration_minutes} onChange={e => setNewExam({...newExam, duration_minutes: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '700', color: '#374151', marginBottom: '2px', display: 'block' }}>Max ball</label>
                  <input required type="number" min="1" value={newExam.max_score} onChange={e => setNewExam({...newExam, max_score: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '700', color: '#16a34a', marginBottom: '2px', display: 'block' }}>O'tish bali</label>
                  <input required type="number" min="1" value={newExam.pass_score} onChange={e => setNewExam({...newExam, pass_score: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #86efac', backgroundColor: '#f0fdf4', fontSize: '12px' }} />
                </div>
              </div>

              {/* If Online Exam: Select Questions */}
              {newExam.exam_type === 'ONLINE' && (
                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>
                      Savollarni tanlang ({newExam.selected_question_ids.length} ta)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (newExam.selected_question_ids.length === questions.length) {
                          setNewExam({...newExam, selected_question_ids: []});
                        } else {
                          setNewExam({...newExam, selected_question_ids: questions.map(q => q.id)});
                        }
                      }}
                      style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '10px', fontWeight: '800', cursor: 'pointer' }}
                    >
                      {newExam.selected_question_ids.length === questions.length ? 'Bekor qilish' : 'Hammasi'}
                    </button>
                  </div>

                  <div style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {questions.map((q, idx) => {
                      const isSelected = newExam.selected_question_ids.includes(q.id);
                      return (
                        <label key={q.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '6px 10px', backgroundColor: isSelected ? '#eff6ff' : '#ffffff', border: `1px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`, borderRadius: '8px', cursor: 'pointer', fontSize: '11px' }}>
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewExam({...newExam, selected_question_ids: [...newExam.selected_question_ids, q.id]});
                              } else {
                                setNewExam({...newExam, selected_question_ids: newExam.selected_question_ids.filter(id => id !== q.id)});
                              }
                            }}
                          />
                          <div>
                            <span style={{ fontWeight: '800', color: '#0f172a' }}>{idx + 1}. {q.question_text}</span>
                            <span style={{ display: 'block', color: '#16a34a', fontSize: '10px' }}>{q.correct_answer}</span>
                          </div>
                        </label>
                      );
                    })}
                    {questions.length === 0 && (
                      <p style={{ textAlign: 'center', color: '#64748b', fontSize: '11px', padding: '10px 0' }}>
                        Savollar banki bo'sh. Avval savollar yuklang!
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button type="button" onClick={() => setAddExamModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}>
                  Bekor qilish
                </button>
                <button type="submit" style={{ flex: 1.5, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '900', fontSize: '12px', cursor: 'pointer' }}>
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Questions Bank Modal */}
      {questionsBankModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: '14px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: isMobile ? '18px 14px' : '28px 32px', borderRadius: isMobile ? '20px' : '24px', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #eff6ff', paddingBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>Savollar Banki</span>
                <h3 style={{ margin: '4px 0 0', fontSize: isMobile ? '17px' : '19px', fontWeight: '900', color: '#0f172a' }}>Test Savollari Importi</h3>
              </div>
              <button onClick={() => setQuestionsBankModal(false)} style={{ background: '#f8fafc', border: '1px solid #bfdbfe', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>

            {/* TABS */}
            <div className="hide-scrollbar" style={{ display: 'flex', gap: '6px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '14px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
              <button onClick={() => setQBankTab('word')} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: qBankTab === 'word' ? '#2563eb' : '#f1f5f9', color: qBankTab === 'word' ? '#ffffff' : '#475569', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}>
                Word (.docx)
              </button>
              <button onClick={() => setQBankTab('text')} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: qBankTab === 'text' ? '#2563eb' : '#f1f5f9', color: qBankTab === 'text' ? '#ffffff' : '#475569', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}>
                Matndan Import
              </button>
              <button onClick={() => setQBankTab('manual')} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: qBankTab === 'manual' ? '#2563eb' : '#f1f5f9', color: qBankTab === 'manual' ? '#ffffff' : '#475569', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}>
                Qo'lda Qo'shish
              </button>
              <button onClick={() => setQBankTab('list')} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: qBankTab === 'list' ? '#2563eb' : '#f1f5f9', color: qBankTab === 'list' ? '#ffffff' : '#475569', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}>
                Ro'yxat ({questions.length})
              </button>
            </div>

            {/* TAB 1: WORD */}
            {qBankTab === 'word' && (
              <form onSubmit={handleImportWord} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ border: '2px dashed #2563eb', borderRadius: '14px', padding: isMobile ? '20px' : '30px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#2563eb', marginBottom: '8px' }}>upload_file</span>
                  <p style={{ margin: '0 0 4px', fontWeight: '800', fontSize: '13px' }}>Word (.docx) faylini tanlang</p>
                  <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#64748b' }}>Format: ? Savol, + To'g'ri, - Noto'g'ri</p>
                  <input type="file" accept=".docx" onChange={e => setWordFile(e.target.files[0])} required style={{ fontSize: '12px' }} />
                </div>
                <button type="submit" disabled={importingLoading} style={{ padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '900', cursor: 'pointer', fontSize: '13px' }}>
                  {importingLoading ? 'Yuklanmoqda...' : 'Word fayldan yuklash'}
                </button>
              </form>
            )}

            {/* TAB 2: TEXT */}
            {qBankTab === 'text' && (
              <form onSubmit={handleImportText} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <textarea 
                  required 
                  placeholder="? 1-savol matni...&#10;+ To'g'ri javob&#10;- Noto'g'ri javob&#10;&#10;? 2-savol..." 
                  value={rawTextImport} 
                  onChange={e => setRawTextImport(e.target.value)} 
                  style={{ width: '100%', height: '140px', padding: '10px', borderRadius: '10px', border: '1px solid #bfdbfe', fontFamily: 'monospace', fontSize: '12px', backgroundColor: '#f8fafc' }} 
                />
                <button type="submit" disabled={importingLoading} style={{ padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '900', cursor: 'pointer', fontSize: '13px' }}>
                  {importingLoading ? 'Yuklanmoqda...' : 'Matndan saqlash'}
                </button>
              </form>
            )}

            {/* TAB 3: MANUAL */}
            {qBankTab === 'manual' && (
              <form onSubmit={handleAddQuestionManual} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <textarea required placeholder="Savol matnini yozing..." value={newQuestion.text} onChange={e => setNewQuestion({...newQuestion, text: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', height: '50px', resize: 'none', fontSize: '12px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input required type="text" placeholder="A) varianti" value={newQuestion.optA} onChange={e => setNewQuestion({...newQuestion, optA: e.target.value})} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '12px' }} />
                  <input required type="text" placeholder="B) varianti" value={newQuestion.optB} onChange={e => setNewQuestion({...newQuestion, optB: e.target.value})} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '12px' }} />
                  <input required type="text" placeholder="C) varianti" value={newQuestion.optC} onChange={e => setNewQuestion({...newQuestion, optC: e.target.value})} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '12px' }} />
                  <input required type="text" placeholder="D) varianti" value={newQuestion.optD} onChange={e => setNewQuestion({...newQuestion, optD: e.target.value})} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '12px' }} />
                </div>
                <select value={newQuestion.correct} onChange={e => setNewQuestion({...newQuestion, correct: e.target.value})} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #86efac', backgroundColor: '#f0fdf4', fontWeight: '800', fontSize: '12px' }}>
                  <option value="A">A varianti to'g'ri</option>
                  <option value="B">B varianti to'g'ri</option>
                  <option value="C">C varianti to'g'ri</option>
                  <option value="D">D varianti to'g'ri</option>
                </select>
                <button type="submit" style={{ padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '900', cursor: 'pointer', fontSize: '12px' }}>
                  Savolni Saqlash
                </button>
              </form>
            )}

            {/* TAB 4: LIST */}
            {qBankTab === 'list' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
                {questions.map((q, idx) => (
                  <div key={q.id} style={{ padding: '10px', backgroundColor: '#f8fafc', border: '1px solid #bfdbfe', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: '0 0 4px', fontWeight: '800', color: '#0f172a', fontSize: '12px' }}>{idx + 1}. {q.question_text}</p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', fontSize: '11px', color: '#475569' }}>
                        {(Array.isArray(q.options) ? q.options : []).map((opt, oIdx) => (
                          <span key={oIdx} style={{ color: opt === q.correct_answer ? '#16a34a' : '#475569', fontWeight: opt === q.correct_answer ? '900' : 'normal', backgroundColor: opt === q.correct_answer ? '#dcfce7' : '#ffffff', padding: '1px 6px', borderRadius: '4px' }}>
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => handleDeleteQuestion(q.id)} style={{ background: '#fee2e2', border: 'none', color: '#dc2626', padding: '4px 6px', borderRadius: '6px', cursor: 'pointer', marginLeft: '6px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Offline Exam Results Entry Modal */}
      {offlineResultModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: '14px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: isMobile ? '18px 14px' : '28px 32px', borderRadius: isMobile ? '20px' : '24px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #eff6ff', paddingBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', backgroundColor: '#f5f3ff', color: '#7c3aed', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>Offline Natijalar</span>
                <h3 style={{ margin: '4px 0 0', fontSize: isMobile ? '16px' : '18px', fontWeight: '900', color: '#0f172a' }}>{offlineResultModal.title}</h3>
              </div>
              <button onClick={() => setOfflineResultModal(null)} style={{ background: '#f8fafc', border: '1px solid #bfdbfe', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {offlineStudents.map(s => {
                const scoreVal = offlineScores[s.id] !== undefined ? offlineScores[s.id] : '';
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #bfdbfe', gap: '10px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: '800', color: '#0f172a', fontSize: '13px' }}>{s.full_name}</p>
                      <span style={{ fontSize: '11px', color: '#2563eb' }}>ID: {s.login_id}</span>
                    </div>
                    <input 
                      type="number"
                      min="0"
                      max={offlineResultModal.max_score}
                      placeholder="0"
                      value={scoreVal}
                      onChange={e => setOfflineScores({...offlineScores, [s.id]: e.target.value})}
                      style={{ width: '70px', padding: '6px 8px', borderRadius: '8px', border: '1px solid #bfdbfe', fontWeight: '900', fontSize: '14px', textAlign: 'center' }}
                    />
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button type="button" onClick={() => setOfflineResultModal(null)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}>
                Bekor qilish
              </button>
              <button type="button" onClick={handleSaveOfflineResults} disabled={offlineSaving} style={{ flex: 1.5, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '900', fontSize: '12px', cursor: 'pointer' }}>
                {offlineSaving ? 'Saqlanmoqda...' : 'Natijalarni Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Detailed Results View Modal */}
      {viewResultsModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: '14px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: isMobile ? '18px 14px' : '28px 32px', borderRadius: isMobile ? '20px' : '24px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #eff6ff', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: isMobile ? '16px' : '18px', fontWeight: '900', color: '#0f172a' }}>{viewResultsModal.title} — Natijalar</h3>
              </div>
              <button onClick={() => setViewResultsModal(null)} style={{ background: '#f8fafc', border: '1px solid #bfdbfe', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>

            {resultsLoading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#2563eb', fontWeight: '800', fontSize: '13px' }}>Yuklanmoqda...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {examResultsList.map(r => (
                  <div key={r.id} style={{ padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #eff6ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: '800', color: '#0f172a', fontSize: '13px' }}>{r.student_name}</p>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{r.percentage}% • {r.is_passed ? "O'tdi" : "O'tmadi"}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '14px', fontWeight: '900', color: '#2563eb' }}>{r.score} ball</span>
                      {r.certificate_code && <div style={{ fontSize: '10px', color: '#15803d', fontWeight: '800' }}>Sertifikat: {r.certificate_code}</div>}
                    </div>
                  </div>
                ))}
                {examResultsList.length === 0 && <p style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', padding: '16px' }}>Natijalar yo'q</p>}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button onClick={() => setViewResultsModal(null)} style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}>
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Add Homework Modal */}
      {showAddHomeworkModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: '14px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: isMobile ? '18px 14px' : '28px', borderRadius: isMobile ? '20px' : '24px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: isMobile ? '16px' : '18px', fontWeight: '900', color: '#0f172a' }}>+ Yangi Vazifa Berish</h3>
              <button onClick={() => setShowAddHomeworkModal(false)} style={{ background: '#f8fafc', border: '1px solid #bfdbfe', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>

            <form onSubmit={handleCreateHomework} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#374151', marginBottom: '4px', display: 'block' }}>Vazifa Nomi *</label>
                <input type="text" required placeholder="Masalan: Unit 5 - Exercises" value={newHwTitle} onChange={e => setNewHwTitle(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#374151', marginBottom: '4px', display: 'block' }}>Tavsif</label>
                <textarea placeholder="Ko'rsatmalar..." value={newHwDesc} onChange={e => setNewHwDesc(e.target.value)} style={{ width: '100%', height: '60px', padding: '10px', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '12px', resize: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#374151', marginBottom: '2px', display: 'block' }}>Mukofot Coin</label>
                  <input type="number" min="1" max="100" value={newHwMaxCoins} onChange={e => setNewHwMaxCoins(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#374151', marginBottom: '2px', display: 'block' }}>Fayl (ixtiyoriy)</label>
                  <input type="file" onChange={e => setNewHwFile(e.target.files[0])} style={{ width: '100%', fontSize: '11px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button type="button" onClick={() => setShowAddHomeworkModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}>
                  Bekor qilish
                </button>
                <button type="submit" disabled={newHwSaving} style={{ flex: 1.5, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '900', fontSize: '12px', cursor: 'pointer' }}>
                  {newHwSaving ? 'Yuborilmoqda...' : 'Yuborish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. View Homework Submissions & Grade Modal */}
      {activeHwSubmissionsModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: '14px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: isMobile ? '18px 14px' : '28px', borderRadius: isMobile ? '20px' : '24px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #eff6ff', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: isMobile ? '16px' : '18px', fontWeight: '900', color: '#0f172a' }}>{activeHwSubmissionsModal.title}</h3>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Topshirilgan ishlar</span>
              </div>
              <button onClick={() => { setActiveHwSubmissionsModal(null); setGradingSubId(null); }} style={{ background: '#f8fafc', border: '1px solid #bfdbfe', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>

            {hwSubmissionsLoading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#2563eb', fontWeight: '800', fontSize: '13px' }}>Yuklanmoqda...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {hwSubmissions.map(sub => {
                  const isGraded = sub.status === 'GRADED';
                  const isGradingThis = gradingSubId === sub.id;

                  return (
                    <div key={sub.id} style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '14px', border: `1.5px solid ${isGraded ? '#86efac' : '#bfdbfe'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: '800', color: '#0f172a', fontSize: '13px' }}>{sub.student_name}</p>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>ID: {sub.student_login_id}</span>
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '6px', backgroundColor: isGraded ? '#dcfce7' : '#fef3c7', color: isGraded ? '#166534' : '#b45309' }}>
                          {isGraded ? `Baholangan (${sub.grade} ball / +${sub.coins_awarded} coin)` : 'Kutilmoqda'}
                        </span>
                      </div>

                      {sub.text_submission && (
                        <div style={{ marginTop: '6px', padding: '8px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                          {sub.text_submission}
                        </div>
                      )}

                      {!isGradingThis ? (
                        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => {
                              setGradingSubId(sub.id);
                              setGradeScore(sub.grade || 100);
                              setGradeCoins(sub.coins_awarded || activeHwSubmissionsModal.max_coins || 10);
                              setGradeFeedback(sub.feedback || "A'lo darajada!");
                            }}
                            style={{ padding: '5px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '800', fontSize: '11px', cursor: 'pointer' }}
                          >
                            {isGraded ? 'Qayta baholash' : 'Baholash & Coin'}
                          </button>
                        </div>
                      ) : (
                        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1.5px solid #2563eb', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div>
                              <label style={{ fontSize: '10px', fontWeight: '800', color: '#475569', display: 'block' }}>Ball (0-100):</label>
                              <input type="number" min="0" max="100" value={gradeScore} onChange={e => setGradeScore(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #bfdbfe', fontSize: '12px' }} />
                            </div>
                            <div>
                              <label style={{ fontSize: '10px', fontWeight: '800', color: '#475569', display: 'block' }}>Coin:</label>
                              <input type="number" min="0" max={activeHwSubmissionsModal.max_coins} value={gradeCoins} onChange={e => setGradeCoins(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #bfdbfe', fontSize: '12px' }} />
                            </div>
                          </div>
                          <div>
                            <input type="text" placeholder="Fikr / Izoh..." value={gradeFeedback} onChange={e => setGradeFeedback(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #bfdbfe', fontSize: '11px' }} />
                          </div>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setGradingSubId(null)} style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>
                              Bekor
                            </button>
                            <button onClick={() => handleGradeSubmission(sub.id)} disabled={gradeSaving} style={{ padding: '5px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#16a34a', color: '#ffffff', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }}>
                              {gradeSaving ? 'Saqlanmoqda...' : 'Saqlash'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {hwSubmissions.length === 0 && <p style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', padding: '16px' }}>Hozircha topshirilgan ishlar yo'q</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Teacher Mark / Edit Attendance Modal */}
      {teacherMarkModalLesson && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: '14px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: isMobile ? '18px 14px' : '28px', borderRadius: isMobile ? '20px' : '24px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #eff6ff', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: isMobile ? '16px' : '18px', fontWeight: '900', color: '#0f172a' }}>{teacherMarkModalLesson.lesson_date} — Davomatni tahrirlash</h3>
              </div>
              <button onClick={() => setTeacherMarkModalLesson(null)} style={{ background: '#f8fafc', border: '1px solid #bfdbfe', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>

            <form onSubmit={handleTeacherSaveMarkAttendance} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(groupJournalData?.students || []).map(s => {
                  const status = teacherMarkStatusMap[s.id] || 'PRESENT';
                  return (
                    <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #eff6ff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '13px' }}>{s.full_name}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button type="button" onClick={() => setTeacherMarkStatusMap({...teacherMarkStatusMap, [s.id]: 'PRESENT'})} style={{ padding: '4px 8px', borderRadius: '6px', border: status === 'PRESENT' ? '1.5px solid #16a34a' : '1px solid #e2e8f0', backgroundColor: status === 'PRESENT' ? '#dcfce7' : '#fff', color: status === 'PRESENT' ? '#166534' : '#64748b', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>Keldi</button>
                          <button type="button" onClick={() => setTeacherMarkStatusMap({...teacherMarkStatusMap, [s.id]: 'LATE'})} style={{ padding: '4px 8px', borderRadius: '6px', border: status === 'LATE' ? '1.5px solid #d97706' : '1px solid #e2e8f0', backgroundColor: status === 'LATE' ? '#fef3c7' : '#fff', color: status === 'LATE' ? '#b45309' : '#64748b', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>Kechikdi</button>
                          <button type="button" onClick={() => setTeacherMarkStatusMap({...teacherMarkStatusMap, [s.id]: 'ABSENT'})} style={{ padding: '4px 8px', borderRadius: '6px', border: status === 'ABSENT' ? '1.5px solid #dc2626' : '1px solid #e2e8f0', backgroundColor: status === 'ABSENT' ? '#fee2e2' : '#fff', color: status === 'ABSENT' ? '#991b1b' : '#64748b', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>Kelmadi</button>
                          <button type="button" onClick={() => setTeacherMarkStatusMap({...teacherMarkStatusMap, [s.id]: 'EXCUSED'})} style={{ padding: '4px 8px', borderRadius: '6px', border: status === 'EXCUSED' ? '1.5px solid #2563eb' : '1px solid #e2e8f0', backgroundColor: status === 'EXCUSED' ? '#eff6ff' : '#fff', color: status === 'EXCUSED' ? '#1d4ed8' : '#64748b', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>Sababli</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setTeacherMarkModalLesson(null)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}>
                  Bekor
                </button>
                <button type="submit" disabled={teacherMarkSaving} style={{ flex: 1.5, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '900', fontSize: '12px', cursor: 'pointer' }}>
                  {teacherMarkSaving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Add Cert Modal */}
      {certModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '20px', width: '100%', maxWidth: '380px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '17px', fontWeight: '900' }}>Sertifikat Qo'shish</h3>
            <form onSubmit={handleAddCert} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input required type="text" placeholder="Sertifikat nomi (IELTS 8.0)" value={newCert.name} onChange={e => setNewCert({...newCert, name: e.target.value})} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '13px' }} />
              <input required type="file" accept=".pdf,image/*" style={{ fontSize: '12px' }} />
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button type="button" onClick={() => setCertModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}>Bekor</button>
                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}>Qo'shish</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function KpiCard({ title, value, icon, isMobile }) {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1.5px solid #bfdbfe',
      borderRadius: isMobile ? '16px' : '20px',
      padding: isMobile ? '12px 14px' : '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '8px' : '12px',
      boxShadow: '0 2px 8px rgba(37,99,235,0.03)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: isMobile ? '11px' : '13px', color: '#64748b', fontWeight: '800' }}>{title}</span>
        <div style={{ padding: isMobile ? '6px' : '8px', backgroundColor: '#eff6ff', borderRadius: '10px', display: 'flex' }}>
          <span className="material-symbols-outlined" style={{ fontSize: isMobile ? '18px' : '20px', color: '#2563eb' }}>{icon}</span>
        </div>
      </div>
      <div>
        <p style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '900', color: '#0f172a', margin: 0 }}>{value}</p>
      </div>
    </div>
  );
}
