import React, { useState, useEffect } from 'react';
import { usersAPI, groupsAPI, attendanceAPI, financeAPI, analyticsAPI, coursesAPI, certificatesAPI, homeworkAPI } from '../api';

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notificationToast, setNotificationToast] = useState('');

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
  const [activeHwSubmissionsModal, setActiveHwSubmissionsModal] = useState(null); // homework object
  const [hwSubmissions, setHwSubmissions] = useState([]);
  const [hwSubmissionsLoading, setHwSubmissionsLoading] = useState(false);
  const [gradingSubId, setGradingSubId] = useState(null);
  const [gradeScore, setGradeScore] = useState(100);
  const [gradeCoins, setGradeCoins] = useState(10);
  const [gradeFeedback, setGradeFeedback] = useState("A'lo darajada bajarilgan!");
  const [gradeSaving, setGradeSaving] = useState(false);

  // Legacy/Modal states for Attendance and Payments
  const [selectedGroupDetail, setSelectedGroupDetail] = useState(null);
  const [attendanceModal, setAttendanceModal] = useState(null);
  const [attendanceStudents, setAttendanceStudents] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [lessonDate, setLessonDate] = useState(new Date().toISOString().split('T')[0]);
  const [lessonTopic, setLessonTopic] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [attendanceNotes, setAttendanceNotes] = useState({});

  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentStudents, setPaymentStudents] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMonth, setPaymentMonth] = useState(new Date().toISOString().slice(0, 7));

  // Exam & Test Management Modals
  const [certModal, setCertModal] = useState(false);
  const [addExamModal, setAddExamModal] = useState(false);
  const [questionsBankModal, setQuestionsBankModal] = useState(false);
  const [qBankTab, setQBankTab] = useState('word'); // 'word', 'text', 'manual', 'list'
  const [offlineResultModal, setOfflineResultModal] = useState(null); // exam object for offline grading
  const [offlineStudents, setOfflineStudents] = useState([]);
  const [offlineScores, setOfflineScores] = useState({}); // { student_id: score }
  const [offlineFeedbacks, setOfflineFeedbacks] = useState({}); // { student_id: feedback }
  const [offlineSaving, setOfflineSaving] = useState(false);

  const [viewResultsModal, setViewResultsModal] = useState(null); // exam object for viewing results
  const [examResultsList, setExamResultsList] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  // Form states
  const [newExam, setNewExam] = useState({
    group_id: '',
    title: '',
    exam_type: 'ONLINE', // 'ONLINE' or 'OFFLINE'
    exam_date: new Date().toISOString().split('T')[0],
    duration_minutes: 30,
    max_score: 100,
    pass_score: 70, // Minimal score for certificate
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

  const triggerNotification = (msg) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(''), 4500);
  };

  useEffect(() => {
    fetchTeacherData();
  }, []);

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

  // Open Attendance Modal for a group
  const handleOpenAttendance = async (group) => {
    setAttendanceModal(group);
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
  };

  const handleMarkAttendance = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    if (!attendanceModal) return;
    try {
      // Create lesson
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
      triggerNotification(`✅ ${attendances.length} ta o'quvchining davomati saqlandi va ota-onalarga Telegram orqali xabarnoma yuborildi!`);
    } catch (e) {
      const detail = e.response?.data?.detail || "Davomatni saqlashda xatolik yuz berdi";
      triggerNotification(`❌ ${detail}`);
    }
  };

  // Open Group Payments Modal
  const handleOpenPayments = async (group, month = null) => {
    const targetMonth = month || paymentMonth || new Date().toISOString().slice(0, 7);
    setPaymentModal(group);
    setPaymentMonth(targetMonth);
    setPaymentLoading(true);
    try {
      const billingData = await financeAPI.getGroupStudentsBilling(group.id, targetMonth);
      setPaymentStudents(Array.isArray(billingData) ? billingData : []);
    } catch (e) {
      console.error(e);
      try {
        const students = await groupsAPI.getGroupStudents(group.id);
        setPaymentStudents(
          (students || []).map(s => ({
            student_id: s.id,
            full_name: s.full_name,
            login_id: s.login_id,
            phone: s.phone,
            parent_phone: s.parent_phone,
            month_for: targetMonth,
            expected_fee: group.coursePrice || 500000,
            amount_paid: 0,
            remaining_due: group.coursePrice || 500000,
            is_paid: false,
            is_partial: false,
            total_debt: group.coursePrice || 500000,
            total_credit: 0,
            status: 'UNPAID'
          }))
        );
      } catch (err2) {
        setPaymentStudents([]);
      }
    }
    setPaymentLoading(false);
  };

  // Open Group Details Modal ("Batafsil")
  const handleOpenGroupDetail = async (group) => {
    try {
      const detail = await groupsAPI.getGroupDetail(group.id);
      setSelectedGroupDetail(detail || group);
    } catch (e) {
      setSelectedGroupDetail(group);
    }
  };

  // ----------------------------------------------------
  // GROUP SUB-TABS & WORKFLOW HANDLERS
  // ----------------------------------------------------

  const handleSelectGroup = (group) => {
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

      triggerNotification(`✅ ${teacherMarkModalLesson.lesson_date} sanasi bo'yicha davomat saqlandi!`);
      setTeacherMarkModalLesson(null);
      const refreshed = await attendanceAPI.getGroupJournal(selectedGroup.id);
      setGroupJournalData(refreshed);
    } catch (err) {
      const detail = err.response?.data?.detail || "Davomatni saqlashda xatolik";
      triggerNotification(`❌ ${detail}`);
    }
    setTeacherMarkSaving(false);
  };

  // Homework creation handler
  const handleCreateHomework = async (e) => {
    e.preventDefault();
    if (!selectedGroup || !newHwTitle.trim()) {
      triggerNotification("Iltimos, vazifa nomini kiriting!");
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
      triggerNotification("✅ Yangi uy vazifasi muvaffaqiyatli berildi!");
      setShowAddHomeworkModal(false);
      setNewHwTitle('');
      setNewHwDesc('');
      setNewHwMaxCoins(10);
      setNewHwFile(null);
      const hws = await homeworkAPI.getGroupHomeworks(selectedGroup.id);
      setGroupHomeworks(Array.isArray(hws) ? hws : []);
    } catch (err) {
      const detail = err.response?.data?.detail || "Vazifa yaratishda xatolik yuz berdi";
      triggerNotification(`❌ ${detail}`);
    }
    setNewHwSaving(false);
  };

  // View homework submissions
  const handleOpenHwSubmissions = async (hw) => {
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
      triggerNotification("✅ Vazifa muvaffaqiyatli baholandi va coinlar berildi!");
      setGradingSubId(null);
      if (activeHwSubmissionsModal) {
        const subs = await homeworkAPI.getHomeworkSubmissions(activeHwSubmissionsModal.id);
        setHwSubmissions(Array.isArray(subs) ? subs : []);
      }
    } catch (err) {
      const detail = err.response?.data?.detail || "Baholashda xatolik yuz berdi";
      triggerNotification(`❌ ${detail}`);
    }
    setGradeSaving(false);
  };

  // ----------------------------------------------------
  // EXAMS & TEST BANK HANDLERS
  // ----------------------------------------------------

  const handleAddExam = async (e) => {
    e.preventDefault();
    if (!newExam.group_id) {
      triggerNotification("Iltimos, guruhni tanlang!");
      return;
    }

    try {
      let questionsJson = null;
      if (newExam.exam_type === 'ONLINE') {
        const selectedObjs = questions.filter(q => newExam.selected_question_ids.includes(q.id));
        if (selectedObjs.length === 0) {
          triggerNotification("Onlayn imtihon uchun kamida 1 ta test savolini tanlang!");
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
        triggerNotification(`"${newExam.title}" (${newExam.exam_type}) imtihoni muvaffaqiyatli saqlandi! 🎯`);
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
      triggerNotification(`❌ ${detail}`);
    }
  };

  const handleStartExam = async (exam) => {
    try {
      const res = await analyticsAPI.startExam(exam.id);
      setExams(prev => prev.map(e => e.id === exam.id ? { ...e, status: 'ACTIVE', started_at: res.started_at } : e));
      triggerNotification(`🚀 "${exam.title}" imtihoni boshlandi! Taymer ishga tushdi.`);
    } catch (err) {
      triggerNotification("Imtihonni boshlashda xatolik yuz berdi");
    }
  };

  const handleFinishExam = async (exam) => {
    try {
      const res = await analyticsAPI.finishExam(exam.id);
      setExams(prev => prev.map(e => e.id === exam.id ? { ...e, status: 'COMPLETED' } : e));
      triggerNotification(`⏹️ "${exam.title}" imtihoni yakunlandi! Natijalarni ko'rishingiz mumkin.`);
    } catch (err) {
      triggerNotification("Imtihonni yakunlashda xatolik yuz berdi");
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm("Haqiqatdan ham ushbu imtihonni o'chirmoqchimisiz?")) return;
    try {
      await analyticsAPI.deleteExam(examId);
      setExams(prev => prev.filter(e => e.id !== examId));
      triggerNotification("Imtihon o'chirildi");
    } catch (err) {
      triggerNotification("O'chirishda xatolik yuz berdi");
    }
  };

  // Open Offline Result Entry Modal
  const handleOpenOfflineResults = async (exam) => {
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

  // Save Offline Results
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

      triggerNotification(`✅ ${res.results_count} ta o'quvchi natijasi saqlandi! (${res.certificates_awarded} ta o'quvchiga sertifikat berildi 🎓)`);
      setOfflineResultModal(null);
      const updatedExams = await analyticsAPI.getExams().catch(() => []);
      if (Array.isArray(updatedExams)) setExams(updatedExams);
    } catch (err) {
      const detail = err.response?.data?.detail || "Natijalarni saqlashda xatolik yuz berdi";
      triggerNotification(`❌ ${detail}`);
    }
    setOfflineSaving(false);
  };

  // View Detailed Exam Results
  const handleOpenViewResults = async (exam) => {
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

  // Questions Bank: Word File Import
  const handleImportWord = async (e) => {
    e.preventDefault();
    if (!wordFile) {
      triggerNotification("Iltimos, Word (.docx) faylni tanlang!");
      return;
    }
    setImportingLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', wordFile);
      if (wordCourseId) formData.append('course_id', wordCourseId);

      const res = await analyticsAPI.importQuestionsWord(formData);
      triggerNotification(`✅ ${res.count} ta savol muvaffaqiyatli yuklandi va bankka qo'shildi!`);
      const qList = await analyticsAPI.getQuestions();
      setQuestions(qList);
      setWordFile(null);
      setQBankTab('list');
    } catch (err) {
      const detail = err.response?.data?.detail || "Faylni yuklashda xatolik yuz berdi";
      triggerNotification(`❌ ${detail}`);
    }
    setImportingLoading(false);
  };

  // Questions Bank: Raw Text Import
  const handleImportText = async (e) => {
    e.preventDefault();
    if (!rawTextImport.trim()) {
      triggerNotification("Iltimos, matnni kiriting!");
      return;
    }
    setImportingLoading(true);
    try {
      const res = await analyticsAPI.importQuestionsText(rawTextImport, rawTextCourseId ? parseInt(rawTextCourseId) : null);
      triggerNotification(`✅ ${res.count} ta test savoli muvaffaqiyatli saqlandi!`);
      const qList = await analyticsAPI.getQuestions();
      setQuestions(qList);
      setRawTextImport('');
      setQBankTab('list');
    } catch (err) {
      const detail = err.response?.data?.detail || "Matndan yuklashda xatolik yuz berdi";
      triggerNotification(`❌ ${detail}`);
    }
    setImportingLoading(false);
  };

  // Questions Bank: Manual Add
  const handleAddQuestionManual = async (e) => {
    e.preventDefault();
    const opts = [newQuestion.optA, newQuestion.optB, newQuestion.optC, newQuestion.optD].filter(Boolean);
    if (opts.length < 2) {
      triggerNotification("Kamida 2 ta variant kiriting!");
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
      triggerNotification("Savol qo'shishda xatolik yuz berdi");
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm("Savolni o'chirishni tasdiqlaysizmi?")) return;
    try {
      await analyticsAPI.deleteQuestion(qId);
      setQuestions(prev => prev.filter(q => q.id !== qId));
      triggerNotification("Savol o'chirildi");
    } catch (err) {
      triggerNotification("O'chirishda xatolik");
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
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'groups', label: 'Guruhlarim', icon: 'groups' },
    { id: 'exams', label: 'Imtihonlar & Testlar', icon: 'quiz' },
    { id: 'profile', label: 'Profile', icon: 'person' },
  ];

  const totalStudentsTaught = myGroups.reduce((acc, g) => acc + (g.studentsList?.length || 0), 0);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff', color: '#0f172a', fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
      
      {/* SIDEBAR */}
      <aside style={{
        width: sidebarCollapsed ? '90px' : '280px',
        minWidth: sidebarCollapsed ? '90px' : '280px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #bfdbfe',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.3s ease',
        zIndex: 30,
        height: '100vh'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', overflowY: 'auto' }}>
          <div 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ padding: '24px 18px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid #eff6ff', cursor: 'pointer', backgroundColor: '#f8fafc' }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              {avatar ? (
                 <img src={avatar} alt="Logo" style={{ width: '46px', height: '46px', objectFit: 'cover', borderRadius: '50%', background: '#ffffff', padding: '2px', border: '2px solid #2563eb' }} />
              ) : (
                 <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '20px' }}>
                   {teacherName.charAt(0)}
                 </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Ta'lim Plus</h1>
                <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: '800' }}>Teacher Panel 👨‍🏫</span>
              </div>
            )}
          </div>

          <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navigationItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    padding: '14px',
                    borderRadius: '16px',
                    fontSize: '14px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: isActive ? '#2563eb' : 'transparent',
                    color: isActive ? '#ffffff' : '#475569',
                    gap: '12px',
                    transition: 'all 0.2s ease'
                  }}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '24px', color: isActive ? '#ffffff' : '#2563eb' }}>
                    {item.icon}
                  </span>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid #eff6ff' }}>
          <button onClick={handleLogout} style={{ width: '100%', padding: '12px', borderRadius: '16px', border: 'none', backgroundColor: '#fee2e2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
            {!sidebarCollapsed && 'Chiqish'}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto', backgroundColor: '#ffffff' }}>
        
        {/* HEADER */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #bfdbfe', padding: '16px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0, color: '#0f172a' }}>
              {navigationItems.find(i => i.id === activeTab)?.label}
            </h2>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Ustoz: {teacherName} ({teacherId})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '6px 14px', borderRadius: '50px' }}>
              📅 {new Date().toLocaleDateString('uz-UZ')}
            </span>
          </div>
        </header>

        {/* NOTIFICATION TOAST */}
        {notificationToast && (
          <div style={{ margin: '16px 32px 0', padding: '16px 20px', backgroundColor: '#eff6ff', border: '1px solid #2563eb', borderRadius: '16px', color: '#1d4ed8', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(37,99,235,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-symbols-outlined">info</span>
              <span>{notificationToast}</span>
            </div>
            <button onClick={() => setNotificationToast('')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', display: 'flex' }}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        <div style={{ padding: '32px', flex: 1 }}>
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <KpiCard title="O'quvchilarim soni" value={`${totalStudentsTaught} ta`} icon="school" />
                <KpiCard title="Faol Guruhlarim" value={`${myGroups.length} ta`} icon="groups" />
                <KpiCard title="Savollar Banki" value={`${questions.length} ta`} icon="menu_book" />
                <KpiCard title="O'tkazilgan Imtihonlar" value={`${exams.length} ta`} icon="quiz" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Upcoming Lessons / Groups */}
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', margin: 0, color: '#0f172a' }}>Dars Jadvali & Guruhlarim</h3>
                    <button onClick={() => setActiveTab('groups')} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>Barchasi →</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {myGroups.map(g => (
                      <div key={g.id} style={{ padding: '16px', border: '1px solid #bfdbfe', borderRadius: '16px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: '800', color: '#1d4ed8', fontSize: '15px' }}>{g.name}</p>
                          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#475569' }}>
                            📍 {g.roomName} • 🕒 {g.start_time} - {g.end_time} ({g.days_of_week})
                          </p>
                        </div>
                        <button 
                          onClick={() => handleOpenAttendance(g)}
                          style={{ padding: '8px 14px', borderRadius: '10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>checklist</span> Davomat
                        </button>
                      </div>
                    ))}
                    {myGroups.length === 0 && (
                      <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '20px' }}>Hozircha biriktirilgan guruhlar mavjud emas</p>
                    )}
                  </div>
                </div>

                {/* Upcoming Exams */}
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', margin: 0, color: '#0f172a' }}>Imtihonlar</h3>
                    <button onClick={() => { setNewExam({...newExam, group_id: myGroups[0]?.id || ''}); setAddExamModal(true); }} style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}>
                      + Qo'shish
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {exams.map(e => (
                      <div key={e.id} style={{ padding: '16px', border: '1px solid #bfdbfe', borderRadius: '16px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px', backgroundColor: e.exam_type === 'ONLINE' ? '#eff6ff' : '#f5f3ff', color: e.exam_type === 'ONLINE' ? '#1d4ed8' : '#7c3aed' }}>
                              {e.exam_type === 'ONLINE' ? '🌐 Online' : '📝 Offline'}
                            </span>
                            <p style={{ margin: 0, fontWeight: '800', color: '#0f172a' }}>{e.title}</p>
                          </div>
                          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#475569' }}>📅 {e.exam_date} • 🎯 Max: {e.max_score} | Sertifikat: {e.pass_score || 70}+</p>
                        </div>
                        <button 
                          onClick={() => setActiveTab('exams')}
                          style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                        >
                          Boshqaruv
                        </button>
                      </div>
                    ))}
                    {exams.length === 0 && (
                      <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '20px' }}>Hozircha imtihonlar rejalashtirilmagan</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GROUPS */}
          {activeTab === 'groups' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* VIEW A: LIST OF GROUPS (ONLY GROUP NAMES & CLEAN CARDS) */}
              {!selectedGroup && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Guruhlarim</h3>
                      <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>O'zingizga biriktirilgan guruhlar. Guruh ustiga bosib batafsil menyuga kiring</p>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '800', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '6px 14px', borderRadius: '50px' }}>
                      Jami: {myGroups.length} ta guruh
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    {myGroups.map(g => (
                      <div 
                        key={g.id} 
                        onClick={() => handleSelectGroup(g)}
                        style={{ 
                          backgroundColor: '#ffffff', 
                          border: '2px solid #bfdbfe', 
                          borderRadius: '24px', 
                          padding: '24px', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'space-between',
                          gap: '16px', 
                          boxShadow: '0 4px 16px rgba(37,99,235,0.06)',
                          cursor: 'pointer',
                          transition: 'all 0.25s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(37,99,235,0.15)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#bfdbfe'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.06)'; }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '11px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', padding: '4px 10px', borderRadius: '6px' }}>
                            {g.courseName}
                          </span>
                          <span style={{ fontSize: '11px', backgroundColor: g.is_active ? '#dcfce7' : '#fee2e2', color: g.is_active ? '#166534' : '#991b1b', fontWeight: '800', padding: '3px 8px', borderRadius: '50px' }}>
                            {g.is_active ? 'Faol' : 'Nofaol'}
                          </span>
                        </div>

                        <div>
                          <h4 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
                            {g.name}
                          </h4>
                          <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
                            👥 {g.studentsList?.length || 0} ta o'quvchi • 🕒 {g.start_time} - {g.end_time}
                          </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #eff6ff', paddingTop: '14px', marginTop: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '800', color: '#2563eb' }}>
                            Guruhni ochish
                          </span>
                          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#2563eb' }}>arrow_forward</span>
                        </div>
                      </div>
                    ))}
                    {myGroups.length === 0 && (
                      <div style={{ gridColumn: '1 / -1', padding: '48px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '24px', border: '1px dashed #bfdbfe' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#94a3b8', marginBottom: '12px' }}>groups</span>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800' }}>Hozircha biriktirilgan guruhlar yo'q</h4>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Administrator sizga guruh biriktirgandan so'ng bu yerda paydo bo'ladi.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* VIEW B: INSIDE GROUP WITH HORIZONTAL SUB-MENU */}
              {selectedGroup && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* GROUP TOP HEADER */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', backgroundColor: '#f8fafc', padding: '18px 24px', borderRadius: '20px', border: '1.5px solid #bfdbfe' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <button 
                        onClick={() => setSelectedGroup(null)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', color: '#0f172a', fontWeight: '800', fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563eb' }}>arrow_back</span>
                        Ortga
                      </button>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', padding: '2px 8px', borderRadius: '6px' }}>
                            {selectedGroup.courseName}
                          </span>
                          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>
                            📍 {selectedGroup.roomName} • 🕒 {selectedGroup.start_time} - {selectedGroup.end_time} ({selectedGroup.days_of_week})
                          </span>
                        </div>
                        <h3 style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>
                          {selectedGroup.name}
                        </h3>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', backgroundColor: '#dcfce7', color: '#166534', padding: '6px 14px', borderRadius: '50px' }}>
                        👥 {selectedGroup.studentsList?.length || 0} ta o'quvchi
                      </span>
                    </div>
                  </div>

                  {/* HORIZONTAL SUB-NAVIGATION MENU */}
                  <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #eff6ff', paddingBottom: '12px', overflowX: 'auto' }}>
                    {[
                      { id: 'details', label: 'Batafsil', icon: 'info' },
                      { id: 'attendance', label: 'Davomat', icon: 'checklist' },
                      { id: 'matrix', label: 'Davomat statistikasi', icon: 'calendar_month' },
                      { id: 'homeworks', label: 'Vazifalar', icon: 'menu_book' },
                      { id: 'billing', label: "To'lovlar", icon: 'payments' },
                    ].map(tab => {
                      const isActive = groupSubTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setGroupSubTab(tab.id);
                            loadGroupSubTabData(selectedGroup, tab.id);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 20px',
                            borderRadius: '14px',
                            border: isActive ? 'none' : '1px solid #e2e8f0',
                            backgroundColor: isActive ? '#2563eb' : '#ffffff',
                            color: isActive ? '#ffffff' : '#475569',
                            fontWeight: '800',
                            fontSize: '13px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s ease',
                            boxShadow: isActive ? '0 4px 14px rgba(37,99,235,0.25)' : '0 2px 4px rgba(0,0,0,0.02)'
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: isActive ? '#ffffff' : '#2563eb' }}>{tab.icon}</span>
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* SUBTAB 1: BATAFSIL */}
                  {groupSubTab === 'details' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
                          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Dars Kunlari</span>
                          <p style={{ margin: '4px 0 0', fontWeight: '900', fontSize: '15px', color: '#0f172a' }}>{selectedGroup.days_of_week}</p>
                        </div>
                        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
                          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Dars Vaqti</span>
                          <p style={{ margin: '4px 0 0', fontWeight: '900', fontSize: '15px', color: '#0f172a' }}>{selectedGroup.start_time} - {selectedGroup.end_time}</p>
                        </div>
                        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
                          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Dars Xonasi</span>
                          <p style={{ margin: '4px 0 0', fontWeight: '900', fontSize: '15px', color: '#0f172a' }}>{selectedGroup.roomName}</p>
                        </div>
                        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
                          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Oylik Kurs Narxi</span>
                          <p style={{ margin: '4px 0 0', fontWeight: '900', fontSize: '15px', color: '#2563eb' }}>{selectedGroup.coursePrice?.toLocaleString()} UZS</p>
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '20px', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', backgroundColor: '#eff6ff', borderBottom: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#1e3a8a' }}>
                            Guruh O'quvchilari Ro'yxati ({selectedGroup.studentsList?.length || 0} ta)
                          </h4>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #bfdbfe', color: '#475569', fontWeight: '800' }}>
                              <th style={{ padding: '12px 16px' }}>#</th>
                              <th style={{ padding: '12px 16px' }}>ID</th>
                              <th style={{ padding: '12px 16px' }}>F.I.Sh</th>
                              <th style={{ padding: '12px 16px' }}>Telefon</th>
                              <th style={{ padding: '12px 16px' }}>Ota-ona Tel</th>
                              <th style={{ padding: '12px 16px' }}>Telegram</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(selectedGroup.studentsList || []).map((s, idx) => (
                              <tr key={s.id} style={{ borderBottom: '1px solid #eff6ff' }}>
                                <td style={{ padding: '12px 16px', color: '#64748b' }}>{idx + 1}</td>
                                <td style={{ padding: '12px 16px', fontWeight: '800', color: '#2563eb' }}>{s.login_id}</td>
                                <td style={{ padding: '12px 16px', fontWeight: '700', color: '#0f172a' }}>{s.full_name}</td>
                                <td style={{ padding: '12px 16px' }}>{s.phone}</td>
                                <td style={{ padding: '12px 16px', color: '#64748b' }}>{s.parent_phone || "Mavjud emas"}</td>
                                <td style={{ padding: '12px 16px' }}>
                                  {s.telegram_chat_id ? (
                                    <span style={{ fontSize: '11px', backgroundColor: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '6px', fontWeight: '800' }}>Ulangan 📲</span>
                                  ) : (
                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Ulanmagan</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                            {(selectedGroup.studentsList || []).length === 0 && (
                              <tr>
                                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                                  Ushbu guruhda o'quvchilar mavjud emas.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 2: DAVOMAT */}
                  {groupSubTab === 'attendance' && (
                    <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #bfdbfe', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>Bugungi Dars Davomati</h4>
                          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>O'quvchilar holatini belgilang va saqlang. Ota-onalar Telegram bot orqali xabar oladi.</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            const allPresent = {};
                            attendanceStudents.forEach(s => { allPresent[s.id] = 'PRESENT'; });
                            setAttendanceRecords(allPresent);
                          }}
                          style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #86efac', backgroundColor: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                        >
                          ✅ Barchasini "Keldi" qilish
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #eff6ff' }}>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '800', color: '#374151', marginBottom: '4px', display: 'block' }}>Dars Sanasi</label>
                          <input 
                            type="date" 
                            value={lessonDate} 
                            onChange={e => setLessonDate(e.target.value)} 
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', fontWeight: '700' }} 
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '800', color: '#374151', marginBottom: '4px', display: 'block' }}>Dars Mavzusi</label>
                          <input 
                            type="text" 
                            placeholder="Masalan: Unit 5 - Reading & Vocabulary" 
                            value={lessonTopic} 
                            onChange={e => setLessonTopic(e.target.value)} 
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff' }} 
                          />
                        </div>
                      </div>

                      {attendanceLoading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#2563eb', fontWeight: '800' }}>O'quvchilar yuklanmoqda...</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {attendanceStudents.map((s, idx) => {
                            const status = attendanceRecords[s.id] || 'PRESENT';
                            return (
                              <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px 18px', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc', borderRadius: '16px', border: '1px solid #eff6ff' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                  <div>
                                    <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>{s.full_name}</span>
                                    <span style={{ marginLeft: '8px', fontSize: '12px', color: '#2563eb', fontWeight: '700' }}>ID: {s.login_id}</span>
                                    {s.telegram_chat_id && (
                                      <span style={{ marginLeft: '8px', fontSize: '11px', backgroundColor: '#e0f2fe', color: '#0284c7', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>Telegram ulangan 📲</span>
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button 
                                      type="button"
                                      onClick={() => handleMarkAttendance(s.id, 'PRESENT')} 
                                      style={{ padding: '6px 12px', borderRadius: '8px', border: status === 'PRESENT' ? '1.5px solid #16a34a' : '1px solid #e2e8f0', backgroundColor: status === 'PRESENT' ? '#dcfce7' : '#ffffff', color: status === 'PRESENT' ? '#166534' : '#64748b', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}
                                    >
                                      ✅ Keldi
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => handleMarkAttendance(s.id, 'LATE')} 
                                      style={{ padding: '6px 12px', borderRadius: '8px', border: status === 'LATE' ? '1.5px solid #d97706' : '1px solid #e2e8f0', backgroundColor: status === 'LATE' ? '#fef3c7' : '#ffffff', color: status === 'LATE' ? '#b45309' : '#64748b', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}
                                    >
                                      🕒 Kechikdi
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => handleMarkAttendance(s.id, 'ABSENT')} 
                                      style={{ padding: '6px 12px', borderRadius: '8px', border: status === 'ABSENT' ? '1.5px solid #dc2626' : '1px solid #e2e8f0', backgroundColor: status === 'ABSENT' ? '#fee2e2' : '#ffffff', color: status === 'ABSENT' ? '#991b1b' : '#64748b', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}
                                    >
                                      ❌ Kelmadi
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => handleMarkAttendance(s.id, 'EXCUSED')} 
                                      style={{ padding: '6px 12px', borderRadius: '8px', border: status === 'EXCUSED' ? '1.5px solid #2563eb' : '1px solid #e2e8f0', backgroundColor: status === 'EXCUSED' ? '#eff6ff' : '#ffffff', color: status === 'EXCUSED' ? '#1d4ed8' : '#64748b', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}
                                    >
                                      📋 Sababli
                                    </button>
                                  </div>
                                </div>
                                <input 
                                  type="text" 
                                  placeholder="Izoh (masalan: 10 daqiqa kechikdi)..." 
                                  value={attendanceNotes[s.id] || ''} 
                                  onChange={e => setAttendanceNotes({...attendanceNotes, [s.id]: e.target.value})} 
                                  style={{ padding: '6px 12px', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '12px', backgroundColor: '#ffffff' }}
                                />
                              </div>
                            );
                          })}
                          {attendanceStudents.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>Ushbu guruhda o'quvchilar yo'q.</p>
                          )}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #eff6ff', paddingTop: '16px' }}>
                        <button 
                          type="button" 
                          onClick={async () => {
                            if (!selectedGroup) return;
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
                              triggerNotification(`✅ ${attendances.length} ta o'quvchining davomati saqlandi va Telegram orqali xabar yuborildi!`);
                              loadGroupSubTabData(selectedGroup, 'matrix');
                            } catch (err) {
                              const detail = err.response?.data?.detail || "Davomatni saqlashda xatolik";
                              triggerNotification(`❌ ${detail}`);
                            }
                          }}
                          disabled={attendanceStudents.length === 0}
                          style={{ padding: '12px 28px', borderRadius: '14px', border: 'none', backgroundColor: attendanceStudents.length === 0 ? '#94a3b8' : '#2563eb', color: '#ffffff', fontWeight: '900', fontSize: '14px', cursor: attendanceStudents.length === 0 ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.2)' }}
                        >
                          💾 Davomatni Saqlash & Telegram xabar yuborish
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 3: DAVOMAT STATISTIKASI (ELECTRONIC JOURNAL MATRIX TABLE) */}
                  {groupSubTab === 'matrix' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>Elektron Davomat Jurnali</h4>
                          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Barcha dars sanalari bo'yicha to'liq davomat matritsasi (Darslar «Davomat» bo'limida yo'qlama qilinganda avtomatik qo'shiladi)</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button 
                            type="button"
                            onClick={() => loadGroupSubTabData(selectedGroup, 'matrix')}
                            title="Jurnalni yangilash"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
                            Yangilash
                          </button>
                        </div>
                      </div>

                      {/* LEGEND BAR */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#f8fafc', padding: '10px 16px', borderRadius: '14px', border: '1px solid #eff6ff', fontSize: '12px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '800', color: '#475569' }}>Belgilar:</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#166534', fontWeight: '700' }}>
                          <span style={{ backgroundColor: '#dcfce7', padding: '2px 6px', borderRadius: '6px' }}>✅ ✓</span> Keldi
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#991b1b', fontWeight: '700' }}>
                          <span style={{ backgroundColor: '#fee2e2', padding: '2px 6px', borderRadius: '6px' }}>❌ ✕</span> Kelmadi
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#b45309', fontWeight: '700' }}>
                          <span style={{ backgroundColor: '#fef3c7', padding: '2px 6px', borderRadius: '6px' }}>🕒</span> Kechikdi
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1d4ed8', fontWeight: '700' }}>
                          <span style={{ backgroundColor: '#eff6ff', padding: '2px 6px', borderRadius: '6px' }}>📋</span> Sababli
                        </span>
                        <span style={{ color: '#94a3b8' }}>— Belgilanmagan</span>
                      </div>

                      {groupJournalLoading ? (
                        <div style={{ padding: '50px', textAlign: 'center', color: '#2563eb', fontWeight: '800' }}>Jurnal yuklanmoqda...</div>
                      ) : !groupJournalData || (groupJournalData.students?.length === 0) ? (
                        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '20px', border: '1px dashed #bfdbfe' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#94a3b8' }}>group_off</span>
                          <p style={{ color: '#64748b', fontWeight: '700', margin: '8px 0 0' }}>Guruhda biriktirilgan o'quvchilar yo'q.</p>
                        </div>
                      ) : (
                        <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #bfdbfe', borderRadius: '20px', overflowX: 'auto', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#eff6ff', borderBottom: '2px solid #bfdbfe', color: '#1e3a8a', fontWeight: '900' }}>
                                <th style={{ padding: '14px 16px', textAlign: 'left', position: 'sticky', left: 0, backgroundColor: '#eff6ff', zIndex: 10, minWidth: '220px', borderRight: '1px solid #bfdbfe' }}>
                                  O'quvchi F.I.Sh
                                </th>
                                {(groupJournalData.lessons || []).map((lesson) => (
                                  <th key={lesson.id} style={{ padding: '10px 14px', minWidth: '85px', borderRight: '1px solid #bfdbfe' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '900', color: '#1e3a8a' }}>
                                      {lesson.lesson_date?.split('-')?.slice(1)?.join('/') || lesson.lesson_date}
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '4px' }}>
                                      <button 
                                        onClick={() => handleOpenTeacherMarkModal(lesson)}
                                        style={{ padding: '2px 6px', borderRadius: '6px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', color: '#2563eb', fontSize: '10px', fontWeight: '800', cursor: 'pointer' }}
                                        title="Davomatni tahrirlash"
                                      >
                                        ✏️ Tahrir
                                      </button>
                                      <button 
                                        onClick={async () => {
                                          if (!window.confirm(`${lesson.lesson_date} sanasidagi darsni va uning davomatini o'chirishni tasdiqlaysizmi?`)) return;
                                          try {
                                            await attendanceAPI.deleteLesson(lesson.id);
                                            triggerNotification("Dars sanasi muvaffaqiyatli o'chirildi ✅");
                                            const journal = await attendanceAPI.getGroupJournal(selectedGroup.id);
                                            setGroupJournalData(journal);
                                          } catch (err) {
                                            triggerNotification("O'chirishda xatolik yuz berdi");
                                          }
                                        }}
                                        style={{ padding: '2px 6px', borderRadius: '6px', border: '1px solid #fee2e2', backgroundColor: '#ffffff', color: '#dc2626', fontSize: '10px', fontWeight: '800', cursor: 'pointer' }}
                                        title="Dars sanasini o'chirish"
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  </th>
                                ))}
                                {(!groupJournalData.lessons || groupJournalData.lessons.length === 0) && (
                                  <th style={{ padding: '14px 20px', color: '#64748b', fontWeight: 'normal' }}>
                                    Hozircha dars sanalari mavjud emas
                                  </th>
                                )}
                                <th style={{ padding: '14px 16px', minWidth: '95px', backgroundColor: '#eff6ff', borderLeft: '1px solid #bfdbfe', position: 'sticky', right: 0, zIndex: 10 }}>
                                  Davomat %
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {groupJournalData.students.map((student, idx) => {
                                const totalLessons = groupJournalData.lessons?.length || 0;
                                let attendedCount = 0;
                                
                                return (
                                  <tr key={student.id} style={{ borderBottom: '1px solid #eff6ff', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                    <td style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '800', color: '#0f172a', position: 'sticky', left: 0, backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc', zIndex: 5, borderRight: '1px solid #eff6ff' }}>
                                      <div>{student.full_name}</div>
                                      <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: '600' }}>ID: {student.login_id}</div>
                                    </td>

                                    {(groupJournalData.lessons || []).map((lesson) => {
                                      const record = groupJournalData.matrix?.[String(student.id)]?.[String(lesson.id)];
                                      const status = record?.status;
                                      if (status === 'PRESENT' || status === 'LATE') attendedCount++;

                                      return (
                                        <td key={lesson.id} style={{ padding: '10px 8px', borderRight: '1px solid #eff6ff' }}>
                                          {status === 'PRESENT' && (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#dcfce7', color: '#166534', fontWeight: '900', fontSize: '14px' }} title="Keldi">
                                              ✓
                                            </span>
                                          )}
                                          {status === 'ABSENT' && (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: '900', fontSize: '13px' }} title="Kelmadi">
                                              ✕
                                            </span>
                                          )}
                                          {status === 'LATE' && (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#b45309', fontWeight: '900', fontSize: '13px' }} title="Kechikdi">
                                              🕒
                                            </span>
                                          )}
                                          {status === 'EXCUSED' && (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '900', fontSize: '13px' }} title="Sababli">
                                              📋
                                            </span>
                                          )}
                                          {!status && (
                                            <span style={{ color: '#cbd5e1', fontSize: '16px' }}>—</span>
                                          )}
                                        </td>
                                      );
                                    })}

                                    {(!groupJournalData.lessons || groupJournalData.lessons.length === 0) && (
                                      <td style={{ padding: '12px 16px', color: '#94a3b8' }}>—</td>
                                    )}

                                    {/* PERCENTAGE */}
                                    <td style={{ padding: '12px 16px', fontWeight: '900', color: totalLessons > 0 ? (attendedCount / totalLessons >= 0.8 ? '#166534' : '#dc2626') : '#64748b', position: 'sticky', right: 0, backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc', zIndex: 5, borderLeft: '1px solid #eff6ff' }}>
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

                  {/* SUBTAB 4: VAZIFALAR (HOMEWORKS) */}
                  {groupSubTab === 'homeworks' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>Uy Vazifalari & Topshiriqlar</h4>
                          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>O'quvchilarga vazifa berish, topshirilgan ishlarni tekshirish va coin taqdim etish</p>
                        </div>
                        <button 
                          onClick={() => setShowAddHomeworkModal(true)}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '900', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                          + Yangi Vazifa Berish
                        </button>
                      </div>

                      {homeworksLoading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#2563eb', fontWeight: '800' }}>Vazifalar yuklanmoqda...</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          {groupHomeworks.map(hw => (
                            <div key={hw.id} style={{ backgroundColor: '#ffffff', border: '1.5px solid #bfdbfe', borderRadius: '20px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                              <div style={{ flex: 1, minWidth: '240px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                  <span style={{ fontSize: '11px', backgroundColor: '#fef3c7', color: '#b45309', fontWeight: '800', padding: '2px 8px', borderRadius: '6px' }}>
                                    🪙 Max: {hw.max_coins} coin
                                  </span>
                                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                                    📅 {hw.created_at?.split('T')[0]}
                                  </span>
                                </div>
                                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>{hw.title}</h4>
                                {hw.description && (
                                  <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#475569' }}>{hw.description}</p>
                                )}
                                {hw.pdf_file_url && (
                                  <a href={`http://127.0.0.1:8000${hw.pdf_file_url}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '12px', color: '#2563eb', fontWeight: '800', textDecoration: 'none' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>attachment</span> Biriktirilgan faylni yuklab olish
                                  </a>
                                )}
                              </div>

                              <div>
                                <button 
                                  onClick={() => handleOpenHwSubmissions(hw)}
                                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>task</span>
                                  Topshirilgan ishlarni ko'rish
                                </button>
                              </div>
                            </div>
                          ))}
                          {groupHomeworks.length === 0 && (
                            <div style={{ padding: '36px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '20px', border: '1px dashed #bfdbfe' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#94a3b8' }}>assignment</span>
                              <h4 style={{ margin: '8px 0 4px', fontSize: '16px', fontWeight: '800' }}>Hozircha vazifalar berilmagan</h4>
                              <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Yuqoridagi "+ Yangi Vazifa Berish" tugmasi orqali o'quvchilarga vazifa yuborishingiz mumkin.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUBTAB 5: TO'LOVLAR (BILLING & DEBT) */}
                  {groupSubTab === 'billing' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>O'quvchilar To'lov va Qarzdorlik Holati</h4>
                          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Oylik kurs to'lovlari, to'langan va qarzdor o'quvchilar hisoboti</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>Tanlangan Oy:</label>
                          <input 
                            type="month" 
                            value={paymentMonth} 
                            onChange={e => {
                              setPaymentMonth(e.target.value);
                              loadGroupSubTabData(selectedGroup, 'billing');
                            }}
                            style={{ padding: '8px 12px', borderRadius: '12px', border: '1px solid #bfdbfe', fontSize: '13px', fontWeight: '800', backgroundColor: '#f8fafc', color: '#1e3a8a' }} 
                          />
                        </div>
                      </div>

                      {/* SUMMARY STATS BAR */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Jami O'quvchilar</div>
                          <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>{paymentStudents.length} ta</div>
                        </div>
                        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ fontSize: '11px', color: '#166534', fontWeight: '700' }}>To'laganlar</div>
                          <div style={{ fontSize: '18px', fontWeight: '900', color: '#15803d' }}>{paymentStudents.filter(s => s.is_paid).length} ta</div>
                        </div>
                        <div style={{ backgroundColor: '#fefce8', border: '1px solid #fde047', borderRadius: '16px', padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ fontSize: '11px', color: '#854d0e', fontWeight: '700' }}>Qisman to'lagan</div>
                          <div style={{ fontSize: '18px', fontWeight: '900', color: '#a16207' }}>{paymentStudents.filter(s => s.is_partial).length} ta</div>
                        </div>
                        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: '700' }}>Qarzdorlar</div>
                          <div style={{ fontSize: '18px', fontWeight: '900', color: '#dc2626' }}>{paymentStudents.filter(s => !s.is_paid && !s.is_partial).length} ta</div>
                        </div>
                      </div>

                      {paymentLoading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#2563eb', fontWeight: '800' }}>To'lov ma'lumotlari yuklanmoqda...</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {paymentStudents.map(s => {
                            const isPaid = s.is_paid;
                            const isPartial = s.is_partial;
                            return (
                              <div key={s.student_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', backgroundColor: isPaid ? '#ffffff' : isPartial ? '#fffdf5' : '#fff8f8', borderRadius: '16px', border: `1.5px solid ${isPaid ? '#bfdbfe' : isPartial ? '#fde047' : '#fecaca'}`, gap: '12px', flexWrap: 'wrap' }}>
                                <div style={{ minWidth: '180px' }}>
                                  <p style={{ margin: 0, fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>
                                    {s.full_name} <span style={{ color: '#2563eb', fontSize: '12px' }}>(ID: {s.login_id})</span>
                                  </p>
                                  <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                                    📞 {s.phone} {s.parent_phone ? `• Ota-ona: ${s.parent_phone}` : ''}
                                  </p>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                  <span style={{ 
                                    fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '8px',
                                    backgroundColor: isPaid ? '#dcfce7' : isPartial ? '#fef3c7' : '#fee2e2',
                                    color: isPaid ? '#166534' : isPartial ? '#b45309' : '#991b1b',
                                    display: 'inline-block', marginBottom: '4px'
                                  }}>
                                    {isPaid ? "To'langan ✅" : isPartial ? "Qisman to'langan ⚠️" : "To'lanmagan ❌"}
                                  </span>
                                  
                                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: isPaid ? '#166534' : isPartial ? '#b45309' : '#dc2626' }}>
                                    {s.amount_paid?.toLocaleString()} / {s.expected_fee?.toLocaleString()} UZS
                                  </p>

                                  {!isPaid && s.remaining_due > 0 && (
                                    <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: '800', marginTop: '2px' }}>
                                      Shu oy qarzi: {s.remaining_due?.toLocaleString()} UZS
                                    </div>
                                  )}
                                  {s.total_debt > s.remaining_due && (
                                    <div style={{ fontSize: '10px', color: '#991b1b', fontWeight: '700' }}>
                                      Jami barcha oylik qarzi: {s.total_debt?.toLocaleString()} UZS
                                    </div>
                                  )}
                                  {s.total_credit > 0 && (
                                    <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '800', marginTop: '2px' }}>
                                      Deposit: +{s.total_credit?.toLocaleString()} UZS
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          {paymentStudents.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>Ushbu guruhda o'quvchilar yo'q.</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* TAB 3: EXAMS & TEST BANK */}
          {activeTab === 'exams' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Imtihonlar & Testlar Boshqaruvi</h3>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>Online & Offline imtihonlar o'tkazish, Word/matndan test yuklash, taymer va sertifikat berish</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button onClick={() => { setNewExam({...newExam, group_id: myGroups[0]?.id || ''}); setAddExamModal(true); }} style={{ padding: '12px 20px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}>
                    <span className="material-symbols-outlined">add</span> Imtihon Qo'shish
                  </button>
                  <button onClick={() => setQuestionsBankModal(true)} style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid #2563eb', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined">menu_book</span> Savollar Banki & Import ({questions.length})
                  </button>
                </div>
              </div>

              {/* ACTIVE EXAMS BANNER (IF ANY) */}
              {exams.some(e => e.status === 'ACTIVE') && (
                <div style={{ padding: '20px 24px', backgroundColor: '#eff6ff', border: '2px solid #2563eb', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 24px rgba(37,99,235,0.12)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                      ⏳
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: '#1e3a8a' }}>
                        Faol Imtihon Davom Etmoqda! ({exams.filter(e => e.status === 'ACTIVE').length} ta)
                      </h4>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#3b82f6', fontWeight: '700' }}>
                        O'quvchilar hozir onlayn test topshirmoqda. Vaqt tugagach yoki siz yakunlagach natijalar hisoblanadi.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* EXAMS TABLE */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #bfdbfe', color: '#1d4ed8', fontWeight: '800' }}>
                      <th style={{ padding: '16px 20px' }}>Imtihon Nomi</th>
                      <th style={{ padding: '16px 20px' }}>Turi</th>
                      <th style={{ padding: '16px 20px' }}>Guruh</th>
                      <th style={{ padding: '16px 20px' }}>Sana & Vaqt</th>
                      <th style={{ padding: '16px 20px' }}>Ball & Sertifikat</th>
                      <th style={{ padding: '16px 20px' }}>Holati</th>
                      <th style={{ padding: '16px 20px', textAlign: 'center' }}>Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map(e => {
                      const isOnline = e.exam_type === 'ONLINE';
                      const isScheduled = e.status === 'SCHEDULED';
                      const isActive = e.status === 'ACTIVE';
                      const isCompleted = e.status === 'COMPLETED';

                      return (
                        <tr key={e.id} style={{ borderBottom: '1px solid #eff6ff' }}>
                          <td style={{ padding: '16px 20px', fontWeight: '800', color: '#0f172a' }}>
                            {e.title}
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{ 
                              fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '6px',
                              backgroundColor: isOnline ? '#eff6ff' : '#f5f3ff',
                              color: isOnline ? '#1d4ed8' : '#7c3aed',
                              border: `1px solid ${isOnline ? '#bfdbfe' : '#ddd6fe'}`
                            }}>
                              {isOnline ? '🌐 Online' : '📝 Offline'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px', color: '#2563eb', fontWeight: '700' }}>
                            {e.group_name || `Guruh #${e.group_id}`}
                          </td>
                          <td style={{ padding: '16px 20px', color: '#475569' }}>
                            <div>📅 {e.exam_date}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>⏱️ {e.duration_minutes || 30} daqiqa</div>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <div>Max: <strong style={{ color: '#0f172a' }}>{e.max_score}</strong> ball</div>
                            <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700' }}>🎓 Sertifikat: {e.pass_score || 70}+ ball</div>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{
                              fontSize: '12px', fontWeight: '800', padding: '4px 10px', borderRadius: '50px',
                              backgroundColor: isScheduled ? '#fef3c7' : isActive ? '#dbeafe' : '#dcfce7',
                              color: isScheduled ? '#b45309' : isActive ? '#1d4ed8' : '#166534'
                            }}>
                              {isScheduled ? '⏳ Kutilmoqda' : isActive ? '⚡️ Davom etmoqda' : '✅ Yakunlangan'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                              {/* Start Exam button */}
                              {isScheduled && (
                                <button 
                                  onClick={() => handleStartExam(e)}
                                  style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  title="Imtihonni boshlash"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>play_arrow</span> Boshlash
                                </button>
                              )}

                              {/* Finish Exam button */}
                              {isActive && (
                                <button 
                                  onClick={() => handleFinishExam(e)}
                                  style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', color: '#ffffff', fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  title="Imtihonni yakunlash"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>stop</span> Yakunlash
                                </button>
                              )}

                              {/* Offline Score Entry */}
                              {!isOnline && (
                                <button 
                                  onClick={() => handleOpenOfflineResults(e)}
                                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #7c3aed', backgroundColor: '#f5f3ff', color: '#7c3aed', fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  title="Natijalarni kiritish"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit_note</span> Natija kiritish
                                </button>
                              )}

                              {/* View Results */}
                              <button 
                                onClick={() => handleOpenViewResults(e)}
                                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                title="Natijalar jadvali"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>bar_chart</span> Natijalar
                              </button>

                              <button 
                                onClick={() => handleDeleteExam(e.id)}
                                style={{ padding: '6px 8px', borderRadius: '8px', border: 'none', backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
                                title="O'chirish"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {exams.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                          Hozircha imtihonlar yaratilmagan. Yuqoridagi "+ Imtihon Qo'shish" tugmasini bosing.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 4: PROFILE */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>Shaxsiy Ma'lumotlar</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ position: 'relative' }}>
                    {avatar ? (
                      <img src={avatar} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #2563eb' }} />
                    ) : (
                      <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#eff6ff', border: '3px dashed #2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#2563eb' }}>add_a_photo</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>{teacherName}</h4>
                    <p style={{ margin: '4px 0 0', color: '#2563eb', fontSize: '14px', fontWeight: '700' }}>ID: {teacherId} • O'qituvchi</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>To'liq Ism</label>
                    <input value={teacherName} onChange={e => setTeacherName(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>Telefon</label>
                    <input value={teacherPhone} onChange={e => setTeacherPhone(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>Mutaxassislik</label>
                    <input value={teacherSpec} onChange={e => setTeacherSpec(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>Tajriba</label>
                    <input value={teacherExp} onChange={e => setTeacherExp(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc' }} />
                  </div>
                </div>
                <button onClick={() => triggerNotification("Profil muvaffaqiyatli saqlandi!")} style={{ padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '800', cursor: 'pointer', marginTop: '16px' }}>Saqlash</button>
              </div>

              <div style={{ flex: 1, backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>Sertifikatlar</h3>
                  <button onClick={() => setCertModal(true)} style={{ padding: '8px 16px', borderRadius: '12px', border: '1px solid #2563eb', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span> Qo'shish
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {certificates.map(c => (
                    <div key={c.id} style={{ padding: '16px', border: '1px solid #bfdbfe', borderRadius: '16px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#2563eb' }}>workspace_premium</span>
                      <div>
                        <p style={{ margin: 0, fontWeight: '800', color: '#0f172a' }}>{c.name}</p>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#2563eb' }}>{c.file}</p>
                      </div>
                    </div>
                  ))}
                  {certificates.length === 0 && <p style={{ color: '#64748b', fontSize: '14px' }}>Sertifikatlar yo'q</p>}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* 1. Group Details Modal ("Batafsil") */}
      {selectedGroupDetail && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '700px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eff6ff', paddingBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', padding: '4px 10px', borderRadius: '6px' }}>
                  {selectedGroupDetail.course?.title || selectedGroupDetail.courseName || 'Kurs'}
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
              <div><strong>Dars kunlari:</strong> {selectedGroupDetail.days_of_week}</div>
              <div><strong>Dars vaqti:</strong> {selectedGroupDetail.start_time} - {selectedGroupDetail.end_time}</div>
              <div><strong>Xona:</strong> {selectedGroupDetail.room?.name || selectedGroupDetail.roomName || 'Xona'}</div>
              <div><strong>O'qituvchi:</strong> {selectedGroupDetail.teacher?.full_name || teacherName}</div>
            </div>

            <h4 style={{ fontSize: '16px', fontWeight: '900', margin: '0 0 12px 0', color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Biriktirilgan O'quvchilar ({selectedGroupDetail.students?.length || selectedGroupDetail.studentsList?.length || 0} ta)</span>
            </h4>

            <div style={{ border: '1px solid #bfdbfe', borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead style={{ backgroundColor: '#eff6ff' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>ID</th>
                    <th style={{ padding: '12px 16px' }}>Ism Familiya</th>
                    <th style={{ padding: '12px 16px' }}>Telefon</th>
                    <th style={{ padding: '12px 16px' }}>Ota-ona Tel</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedGroupDetail.students || selectedGroupDetail.studentsList || []).map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #eff6ff' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '800', color: '#2563eb' }}>{s.login_id}</td>
                      <td style={{ padding: '12px 16px', fontWeight: '700' }}>{s.full_name}</td>
                      <td style={{ padding: '12px 16px' }}>{s.phone}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{s.parent_phone || "Mavjud emas"}</td>
                    </tr>
                  ))}
                  {(selectedGroupDetail.students || selectedGroupDetail.studentsList || []).length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
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

      {/* 2. Attendance Taking Modal */}
      {attendanceModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '650px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eff6ff', paddingBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', padding: '4px 10px', borderRadius: '6px' }}>
                  Davomat & Telegram Xabarnoma
                </span>
                <h3 style={{ margin: '8px 0 0', fontSize: '20px', fontWeight: '900' }}>
                  {attendanceModal.name} — Yo'qlama qilish
                </h3>
              </div>
              <button onClick={() => setAttendanceModal(null)} style={{ background: '#f8fafc', border: '1px solid #bfdbfe', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Dars Sanasi</label>
                <input 
                  type="date" 
                  value={lessonDate} 
                  onChange={e => setLessonDate(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', fontWeight: '700' }} 
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Dars Mavzusi (Topic)</label>
                <input 
                  type="text" 
                  placeholder="Masalan: Unit 5 - Reading & Grammar" 
                  value={lessonTopic} 
                  onChange={e => setLessonTopic(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #bfdbfe' }} 
                />
              </div>
            </div>

            <h4 style={{ fontSize: '15px', fontWeight: '900', margin: '0 0 12px 0', color: '#0f172a' }}>
              O'quvchilar ro'yxati ({attendanceStudents.length} ta)
            </h4>

            {attendanceLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#2563eb', fontWeight: '800' }}>Yuklanmoqda...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {attendanceStudents.map(s => {
                  const status = attendanceRecords[s.id] || 'PRESENT';
                  return (
                    <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontWeight: '800', color: '#0f172a' }}>{s.full_name}</span>
                          <span style={{ marginLeft: '8px', fontSize: '12px', color: '#2563eb', fontWeight: '700' }}>ID: {s.login_id}</span>
                          {s.telegram_chat_id && (
                            <span style={{ marginLeft: '8px', fontSize: '11px', backgroundColor: '#e0f2fe', color: '#0284c7', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>Telegram ulangan 📲</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            type="button"
                            onClick={() => handleMarkAttendance(s.id, 'PRESENT')} 
                            style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: status === 'PRESENT' ? '#16a34a' : '#e2e8f0', color: status === 'PRESENT' ? '#ffffff' : '#475569', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}
                          >
                            Keldi ✅
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleMarkAttendance(s.id, 'LATE')} 
                            style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: status === 'LATE' ? '#eab308' : '#e2e8f0', color: status === 'LATE' ? '#ffffff' : '#475569', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}
                          >
                            Kechikdi ⚠️
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleMarkAttendance(s.id, 'ABSENT')} 
                            style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: status === 'ABSENT' ? '#dc2626' : '#e2e8f0', color: status === 'ABSENT' ? '#ffffff' : '#475569', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}
                          >
                            Kelmadi ❌
                          </button>
                        </div>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Izoh (masalan: 15 daqiqa kechikdi)..." 
                        value={attendanceNotes[s.id] || ''} 
                        onChange={e => setAttendanceNotes({...attendanceNotes, [s.id]: e.target.value})} 
                        style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '12px', backgroundColor: '#ffffff' }}
                      />
                    </div>
                  );
                })}
                {attendanceStudents.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>Ushbu guruhda o'quvchilar yo'q. Avval admin panelda o'quvchi biriktiring.</p>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="button" onClick={() => setAttendanceModal(null)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', fontWeight: '800', cursor: 'pointer' }}>
                Bekor qilish
              </button>
              <button 
                type="button" 
                onClick={handleSaveAttendance} 
                disabled={attendanceStudents.length === 0}
                style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: attendanceStudents.length === 0 ? '#94a3b8' : '#2563eb', color: '#ffffff', fontWeight: '900', cursor: attendanceStudents.length === 0 ? 'not-allowed' : 'pointer' }}
              >
                💾 Saqlash & Telegram xabar yuborish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Group Payments Modal */}
      {paymentModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '720px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eff6ff', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '12px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', padding: '4px 10px', borderRadius: '6px' }}>
                  Moliyaviy Nazorat & Qarzdorlik
                </span>
                <h3 style={{ margin: '6px 0 0', fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>
                  {paymentModal.name} — O'quvchilar To'lov Holati
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>Oy:</label>
                  <input 
                    type="month" 
                    value={paymentMonth} 
                    onChange={e => handleOpenPayments(paymentModal, e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '12px', fontWeight: '800', backgroundColor: '#f8fafc', color: '#1e3a8a' }} 
                  />
                </div>
                <button onClick={() => setPaymentModal(null)} style={{ background: '#f8fafc', border: '1px solid #bfdbfe', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* SUMMARY STATS BAR */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Jami O'quvchilar</div>
                <div style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>{paymentStudents.length} ta</div>
              </div>
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#166534', fontWeight: '700' }}>To'laganlar</div>
                <div style={{ fontSize: '16px', fontWeight: '900', color: '#15803d' }}>{paymentStudents.filter(s => s.is_paid).length} ta</div>
              </div>
              <div style={{ backgroundColor: '#fefce8', border: '1px solid #fde047', borderRadius: '14px', padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#854d0e', fontWeight: '700' }}>Qisman to'lagan</div>
                <div style={{ fontSize: '16px', fontWeight: '900', color: '#a16207' }}>{paymentStudents.filter(s => s.is_partial).length} ta</div>
              </div>
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '14px', padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: '700' }}>Qarzdorlar</div>
                <div style={{ fontSize: '16px', fontWeight: '900', color: '#dc2626' }}>{paymentStudents.filter(s => !s.is_paid && !s.is_partial).length} ta</div>
              </div>
            </div>

            {paymentLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#2563eb', fontWeight: '800' }}>To'lov ma'lumotlari yuklanmoqda...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {paymentStudents.map(s => {
                  const isPaid = s.is_paid;
                  const isPartial = s.is_partial;
                  return (
                    <div key={s.student_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', backgroundColor: isPaid ? '#ffffff' : isPartial ? '#fffdf5' : '#fff8f8', borderRadius: '16px', border: `1px solid ${isPaid ? '#bfdbfe' : isPartial ? '#fde047' : '#fecaca'}`, gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ minWidth: '180px' }}>
                        <p style={{ margin: 0, fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>
                          {s.full_name} <span style={{ color: '#2563eb', fontSize: '12px' }}>(ID: {s.login_id})</span>
                        </p>
                        <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                          📞 {s.phone} {s.parent_phone ? `• Ota-ona: ${s.parent_phone}` : ''}
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ 
                          fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '8px',
                          backgroundColor: isPaid ? '#dcfce7' : isPartial ? '#fef3c7' : '#fee2e2',
                          color: isPaid ? '#166534' : isPartial ? '#b45309' : '#991b1b',
                          display: 'inline-block', marginBottom: '4px'
                        }}>
                          {isPaid ? "To'langan ✅" : isPartial ? "Qisman to'langan ⚠️" : "To'lanmagan ❌"}
                        </span>
                        
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: isPaid ? '#166534' : isPartial ? '#b45309' : '#dc2626' }}>
                          {s.amount_paid?.toLocaleString()} / {s.expected_fee?.toLocaleString()} UZS
                        </p>

                        {/* Extra breakdown */}
                        {!isPaid && s.remaining_due > 0 && (
                          <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: '800', marginTop: '2px' }}>
                            Shu oy qarzi: {s.remaining_due?.toLocaleString()} UZS
                          </div>
                        )}
                        {s.total_debt > s.remaining_due && (
                          <div style={{ fontSize: '10px', color: '#991b1b', fontWeight: '700' }}>
                            Jami barcha oylik qarzi: {s.total_debt?.toLocaleString()} UZS
                          </div>
                        )}
                        {s.total_credit > 0 && (
                          <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '800', marginTop: '2px' }}>
                            Deposit: +{s.total_credit?.toLocaleString()} UZS
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {paymentStudents.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>Ushbu guruhda o'quvchilar yo'q.</p>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button onClick={() => setPaymentModal(null)} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '800', cursor: 'pointer' }}>
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Add Exam Modal (Online / Offline) */}
      {addExamModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '650px', maxWidth: '92%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eff6ff', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', padding: '4px 10px', borderRadius: '6px' }}>Imtihon Yaratish</span>
                <h3 style={{ margin: '6px 0 0', fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>Yangi Imtihon Qo'shish</h3>
              </div>
              <button onClick={() => setAddExamModal(false)} style={{ background: '#f8fafc', border: '1px solid #bfdbfe', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddExam} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Type selector toggle */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: '800', color: '#374151', display: 'block', marginBottom: '6px' }}>Imtihon Turi:</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setNewExam({...newExam, exam_type: 'ONLINE'})}
                    style={{
                      padding: '12px', borderRadius: '12px', border: newExam.exam_type === 'ONLINE' ? '2px solid #2563eb' : '1px solid #bfdbfe',
                      backgroundColor: newExam.exam_type === 'ONLINE' ? '#eff6ff' : '#ffffff',
                      color: newExam.exam_type === 'ONLINE' ? '#1d4ed8' : '#475569',
                      fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    <span className="material-symbols-outlined">devices</span> 🌐 Online Imtihon (Test)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewExam({...newExam, exam_type: 'OFFLINE'})}
                    style={{
                      padding: '12px', borderRadius: '12px', border: newExam.exam_type === 'OFFLINE' ? '2px solid #7c3aed' : '1px solid #bfdbfe',
                      backgroundColor: newExam.exam_type === 'OFFLINE' ? '#f5f3ff' : '#ffffff',
                      color: newExam.exam_type === 'OFFLINE' ? '#7c3aed' : '#475569',
                      fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    <span className="material-symbols-outlined">edit_square</span> 📝 Offline Imtihon (Yozma/Og'zaki)
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Guruhni tanlang</label>
                  <select required value={newExam.group_id} onChange={e => setNewExam({...newExam, group_id: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', fontWeight: '700' }}>
                    <option value="">Guruhni tanlang...</option>
                    {myGroups.map(g => <option key={g.id} value={g.id}>{g.name} ({g.courseName})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>O'tkazilish sanasi</label>
                  <input required type="date" value={newExam.exam_date} onChange={e => setNewExam({...newExam, exam_date: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #bfdbfe' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Imtihon nomi</label>
                <input required type="text" placeholder="Masalan: 1-Oraliq Nazorat Testi" value={newExam.title} onChange={e => setNewExam({...newExam, title: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #bfdbfe' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Vaqt (daqiqa)</label>
                  <input required type="number" min="5" max="180" value={newExam.duration_minutes} onChange={e => setNewExam({...newExam, duration_minutes: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #bfdbfe' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Maksimal ball</label>
                  <input required type="number" min="1" value={newExam.max_score} onChange={e => setNewExam({...newExam, max_score: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #bfdbfe' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#16a34a', marginBottom: '4px', display: 'block' }}>🎓 Sertifikat bali</label>
                  <input required type="number" min="1" value={newExam.pass_score} onChange={e => setNewExam({...newExam, pass_score: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #86efac', backgroundColor: '#f0fdf4' }} />
                </div>
              </div>

              {/* If Online Exam: Select Questions from Questions Bank */}
              {newExam.exam_type === 'ONLINE' && (
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: '#0f172a' }}>
                        Savollar Bankidan Testlarni Tanlang ({newExam.selected_question_ids.length} ta tanlandi)
                      </h4>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Jami bankda {questions.length} ta savol mavjud</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (newExam.selected_question_ids.length === questions.length) {
                          setNewExam({...newExam, selected_question_ids: []});
                        } else {
                          setNewExam({...newExam, selected_question_ids: questions.map(q => q.id)});
                        }
                      }}
                      style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                    >
                      {newExam.selected_question_ids.length === questions.length ? 'Barchasini bekor qilish' : 'Hammasini tanlash'}
                    </button>
                  </div>

                  <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {questions.map((q, idx) => {
                      const isSelected = newExam.selected_question_ids.includes(q.id);
                      return (
                        <label key={q.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 12px', backgroundColor: isSelected ? '#eff6ff' : '#ffffff', border: `1px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`, borderRadius: '10px', cursor: 'pointer', fontSize: '12px' }}>
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
                            style={{ marginTop: '2px' }}
                          />
                          <div>
                            <span style={{ fontWeight: '800', color: '#0f172a' }}>{idx + 1}. {q.question_text}</span>
                            <span style={{ display: 'block', color: '#16a34a', fontSize: '11px', marginTop: '2px' }}>✓ To'g'ri: {q.correct_answer}</span>
                          </div>
                        </label>
                      );
                    })}
                    {questions.length === 0 && (
                      <p style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', padding: '16px 0' }}>
                        Savollar banki bo'sh. Avval "Savollar Banki" orqali Word fayl yoki matndan savol yuklang!
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setAddExamModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', fontWeight: '800', cursor: 'pointer' }}>
                  Bekor qilish
                </button>
                <button type="submit" style={{ flex: 1.5, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '900', cursor: 'pointer' }}>
                  💾 Imtihonni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Questions Bank & Import Modal with Format Template */}
      {questionsBankModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '750px', maxWidth: '92%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eff6ff', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', padding: '4px 10px', borderRadius: '6px' }}>Savollar Banki</span>
                <h3 style={{ margin: '6px 0 0', fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>Test Savollarini Yuklash va Boshqarish</h3>
              </div>
              <button onClick={() => setQuestionsBankModal(false)} style={{ background: '#f8fafc', border: '1px solid #bfdbfe', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* TAB SELECTOR */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '20px' }}>
              <button 
                onClick={() => setQBankTab('word')}
                style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', backgroundColor: qBankTab === 'word' ? '#2563eb' : '#f1f5f9', color: qBankTab === 'word' ? '#ffffff' : '#475569', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>description</span> Word (.docx) Yuklash
              </button>
              <button 
                onClick={() => setQBankTab('text')}
                style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', backgroundColor: qBankTab === 'text' ? '#2563eb' : '#f1f5f9', color: qBankTab === 'text' ? '#ffffff' : '#475569', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>content_paste</span> Matndan Import
              </button>
              <button 
                onClick={() => setQBankTab('manual')}
                style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', backgroundColor: qBankTab === 'manual' ? '#2563eb' : '#f1f5f9', color: qBankTab === 'manual' ? '#ffffff' : '#475569', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit_note</span> Qo'lda Qo'shish
              </button>
              <button 
                onClick={() => setQBankTab('list')}
                style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', backgroundColor: qBankTab === 'list' ? '#2563eb' : '#f1f5f9', color: qBankTab === 'list' ? '#ffffff' : '#475569', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>list_alt</span> Bank Ro'yxati ({questions.length})
              </button>
            </div>

            {/* FORMAT SAMPLE CARD (SHOWN IN WORD & TEXT TABS) */}
            {(qBankTab === 'word' || qBankTab === 'text') && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#16a34a' }}>tips_and_updates</span>
                  <strong style={{ color: '#166534', fontSize: '14px' }}>Savol formati namunasi:</strong>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '12px', backgroundColor: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #bbf7d0', color: '#1e293b', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
{`? O'zbekiston Respublikasi poytaxti qaysi shahar?
+ Toshkent
- Samarqand
- Buxoro
- Farg'ona

? 12 * 8 nechiga teng?
- 86
+ 96
- 106
- 98`}
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#15803d', fontWeight: '700' }}>
                  Izoh: <strong>?</strong> = Savol matni • <strong>+</strong> = To'g'ri javob • <strong>-</strong> = Noto'g'ri javoblar
                </p>
              </div>
            )}

            {/* TAB 1: WORD IMPORT */}
            {qBankTab === 'word' && (
              <form onSubmit={handleImportWord} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Biriktiriladigan Kurs (ixtiyoriy)</label>
                  <select value={wordCourseId} onChange={e => setWordCourseId(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc' }}>
                    <option value="">Barcha kurslar uchun umumiy</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>

                <div style={{ border: '2px dashed #2563eb', borderRadius: '16px', padding: '36px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#2563eb', marginBottom: '12px' }}>upload_file</span>
                  <p style={{ margin: '0 0 6px', fontWeight: '800', color: '#0f172a' }}>Word (.docx) faylini tanlang</p>
                  <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#64748b' }}>Fayl ichidagi savollar (?, +, -) formatiga mos bo'lishi kerak</p>
                  <input type="file" accept=".docx" onChange={e => setWordFile(e.target.files[0])} required style={{ fontSize: '13px' }} />
                </div>

                <button type="submit" disabled={importingLoading} style={{ padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {importingLoading ? 'Yuklanmoqda va tahlil qilinmoqda...' : '📥 Word fayldan savollarni yuklash va saqlash'}
                </button>
              </form>
            )}

            {/* TAB 2: TEXT IMPORT */}
            {qBankTab === 'text' && (
              <form onSubmit={handleImportText} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Biriktiriladigan Kurs (ixtiyoriy)</label>
                  <select value={rawTextCourseId} onChange={e => setRawTextCourseId(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc' }}>
                    <option value="">Barcha kurslar uchun umumiy</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Savollar matnini kiriting yoki nusxalab qo'ying (Paste)</label>
                  <textarea 
                    required 
                    placeholder="? 1-savol matni...&#10;+ To'g'ri javob&#10;- Noto'g'ri javob 1&#10;- Noto'g'ri javob 2&#10;&#10;? 2-savol matni..." 
                    value={rawTextImport} 
                    onChange={e => setRawTextImport(e.target.value)} 
                    style={{ width: '100%', height: '180px', padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', fontFamily: 'monospace', fontSize: '13px', backgroundColor: '#f8fafc' }} 
                  />
                </div>

                <button type="submit" disabled={importingLoading} style={{ padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {importingLoading ? 'Tahlil qilinmoqda...' : '📥 Matndan savollarni saqlash'}
                </button>
              </form>
            )}

            {/* TAB 3: MANUAL ADD */}
            {qBankTab === 'manual' && (
              <form onSubmit={handleAddQuestionManual} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Kurs</label>
                  <select value={newQuestion.course_id} onChange={e => setNewQuestion({...newQuestion, course_id: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc' }}>
                    <option value="">Umumiy</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', display: 'block' }}>Savol matni</label>
                  <textarea required placeholder="Savol matnini yozing..." value={newQuestion.text} onChange={e => setNewQuestion({...newQuestion, text: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', height: '60px', resize: 'none' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input required type="text" placeholder="A) varianti" value={newQuestion.optA} onChange={e => setNewQuestion({...newQuestion, optA: e.target.value})} style={{ padding: '10px 12px', borderRadius: '12px', border: '1px solid #bfdbfe' }} />
                  <input required type="text" placeholder="B) varianti" value={newQuestion.optB} onChange={e => setNewQuestion({...newQuestion, optB: e.target.value})} style={{ padding: '10px 12px', borderRadius: '12px', border: '1px solid #bfdbfe' }} />
                  <input required type="text" placeholder="C) varianti" value={newQuestion.optC} onChange={e => setNewQuestion({...newQuestion, optC: e.target.value})} style={{ padding: '10px 12px', borderRadius: '12px', border: '1px solid #bfdbfe' }} />
                  <input required type="text" placeholder="D) varianti" value={newQuestion.optD} onChange={e => setNewQuestion({...newQuestion, optD: e.target.value})} style={{ padding: '10px 12px', borderRadius: '12px', border: '1px solid #bfdbfe' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#16a34a', marginBottom: '4px', display: 'block' }}>To'g'ri javob varianti:</label>
                  <select value={newQuestion.correct} onChange={e => setNewQuestion({...newQuestion, correct: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #86efac', backgroundColor: '#f0fdf4', fontWeight: '800' }}>
                    <option value="A">A varianti to'g'ri</option>
                    <option value="B">B varianti to'g'ri</option>
                    <option value="C">C varianti to'g'ri</option>
                    <option value="D">D varianti to'g'ri</option>
                  </select>
                </div>

                <button type="submit" style={{ padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '900', cursor: 'pointer', marginTop: '8px' }}>
                  💾 Savolni Saqlash
                </button>
              </form>
            )}

            {/* TAB 4: QUESTIONS LIST */}
            {qBankTab === 'list' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
                {questions.map((q, idx) => (
                  <div key={q.id} style={{ padding: '14px', backgroundColor: '#f8fafc', border: '1px solid #bfdbfe', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 6px', fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>{idx + 1}. {q.question_text}</p>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px', color: '#475569' }}>
                        {(Array.isArray(q.options) ? q.options : []).map((opt, oIdx) => {
                          const isCorrect = opt === q.correct_answer;
                          return (
                            <span key={oIdx} style={{ color: isCorrect ? '#16a34a' : '#475569', fontWeight: isCorrect ? '900' : 'normal', backgroundColor: isCorrect ? '#dcfce7' : '#ffffff', padding: '2px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                              {isCorrect ? '✓ ' : ''}{opt}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteQuestion(q.id)}
                      style={{ background: '#fee2e2', border: 'none', color: '#dc2626', padding: '6px', borderRadius: '8px', cursor: 'pointer', marginLeft: '8px' }}
                      title="O'chirish"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                    </button>
                  </div>
                ))}
                {questions.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#64748b', padding: '32px' }}>Savollar banki bo'sh.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Offline Exam Results Entry Modal */}
      {offlineResultModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '700px', maxWidth: '92%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eff6ff', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', backgroundColor: '#f5f3ff', color: '#7c3aed', fontWeight: '800', padding: '4px 10px', borderRadius: '6px' }}>Offline Imtihon Natijalari</span>
                <h3 style={{ margin: '6px 0 0', fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>{offlineResultModal.title} — Ballarni Kiritish</h3>
              </div>
              <button onClick={() => setOfflineResultModal(null)} style={{ background: '#f8fafc', border: '1px solid #bfdbfe', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ backgroundColor: '#eff6ff', padding: '12px 16px', borderRadius: '14px', marginBottom: '20px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🎯 Max ball: <strong>{offlineResultModal.max_score}</strong></span>
              <span>🎓 Sertifikat o'tish bali: <strong style={{ color: '#16a34a' }}>{offlineResultModal.pass_score}</strong>+ ball</span>
              <span>👥 O'quvchilar: <strong>{offlineStudents.length} ta</strong></span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {offlineStudents.map(s => {
                const scoreVal = offlineScores[s.id] !== undefined ? offlineScores[s.id] : '';
                const isPassed = parseFloat(scoreVal) >= offlineResultModal.pass_score;

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
                          max={offlineResultModal.max_score}
                          placeholder="0"
                          value={scoreVal}
                          onChange={e => setOfflineScores({...offlineScores, [s.id]: e.target.value})}
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
              {offlineStudents.length === 0 && (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>Guruhda o'quvchilar mavjud emas.</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="button" onClick={() => setOfflineResultModal(null)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', fontWeight: '800', cursor: 'pointer' }}>
                Bekor qilish
              </button>
              <button 
                type="button" 
                onClick={handleSaveOfflineResults}
                disabled={offlineSaving || offlineStudents.length === 0}
                style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '900', cursor: offlineSaving ? 'not-allowed' : 'pointer' }}
              >
                {offlineSaving ? 'Saqlanmoqda...' : '💾 Natijalarni Saqlash & Sertifikatlarni Berish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Detailed Results View Modal */}
      {viewResultsModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '750px', maxWidth: '92%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eff6ff', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', padding: '4px 10px', borderRadius: '6px' }}>Imtihon Natijalari</span>
                <h3 style={{ margin: '6px 0 0', fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>{viewResultsModal.title} — Natijalar Jadvali</h3>
              </div>
              <button onClick={() => setViewResultsModal(null)} style={{ background: '#f8fafc', border: '1px solid #bfdbfe', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '14px 18px', borderRadius: '16px', marginBottom: '20px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', border: '1px solid #e2e8f0' }}>
              <span>Max ball: <strong>{viewResultsModal.max_score}</strong></span>
              <span>Sertifikat o'tish bali: <strong style={{ color: '#16a34a' }}>{viewResultsModal.pass_score}</strong></span>
              <span>Topshirganlar: <strong>{examResultsList.length} ta</strong></span>
            </div>

            {resultsLoading ? (
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
                    {examResultsList.map(r => (
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
                    {examResultsList.length === 0 && (
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
              <button onClick={() => setViewResultsModal(null)} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '800', cursor: 'pointer' }}>
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Add Cert Modal */}
      {certModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '400px', maxWidth: '90%' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: '900' }}>Sertifikat Qo'shish</h3>
            <form onSubmit={handleAddCert} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input required type="text" placeholder="Sertifikat nomi (masalan: IELTS 8.0)" value={newCert.name} onChange={e => setNewCert({...newCert, name: e.target.value})} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc' }} />
              <input required type="file" accept=".pdf,image/*" style={{ padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc' }} />
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setCertModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', fontWeight: '800', cursor: 'pointer' }}>Bekor qilish</button>
                <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '800', cursor: 'pointer' }}>Qo'shish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. Teacher Mark / Edit Attendance Modal */}
      {teacherMarkModalLesson && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '700px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eff6ff', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', padding: '4px 10px', borderRadius: '6px' }}>
                  Davomatni Belgilash
                </span>
                <h3 style={{ margin: '6px 0 0', fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>
                  {teacherMarkModalLesson.lesson_date} — {teacherMarkModalLesson.topic || 'Dars mashg\'uloti'}
                </h3>
              </div>
              <button onClick={() => setTeacherMarkModalLesson(null)} style={{ background: '#f8fafc', border: '1px solid #bfdbfe', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleTeacherSaveMarkAttendance} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(groupJournalData?.students || []).map((s, idx) => {
                  const status = teacherMarkStatusMap[s.id] || 'PRESENT';
                  return (
                    <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 16px', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc', borderRadius: '14px', border: '1px solid #eff6ff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>{s.full_name}</span>
                          <span style={{ marginLeft: '8px', fontSize: '12px', color: '#2563eb', fontWeight: '700' }}>ID: {s.login_id}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            type="button" 
                            onClick={() => setTeacherMarkStatusMap({...teacherMarkStatusMap, [s.id]: 'PRESENT'})} 
                            style={{ padding: '6px 10px', borderRadius: '8px', border: status === 'PRESENT' ? '1.5px solid #16a34a' : '1px solid #e2e8f0', backgroundColor: status === 'PRESENT' ? '#dcfce7' : '#ffffff', color: status === 'PRESENT' ? '#166534' : '#64748b', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}
                          >
                            ✅ Keldi
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setTeacherMarkStatusMap({...teacherMarkStatusMap, [s.id]: 'LATE'})} 
                            style={{ padding: '6px 10px', borderRadius: '8px', border: status === 'LATE' ? '1.5px solid #d97706' : '1px solid #e2e8f0', backgroundColor: status === 'LATE' ? '#fef3c7' : '#ffffff', color: status === 'LATE' ? '#b45309' : '#64748b', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}
                          >
                            🕒 Kechikdi
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setTeacherMarkStatusMap({...teacherMarkStatusMap, [s.id]: 'ABSENT'})} 
                            style={{ padding: '6px 10px', borderRadius: '8px', border: status === 'ABSENT' ? '1.5px solid #dc2626' : '1px solid #e2e8f0', backgroundColor: status === 'ABSENT' ? '#fee2e2' : '#ffffff', color: status === 'ABSENT' ? '#991b1b' : '#64748b', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}
                          >
                            ❌ Kelmadi
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setTeacherMarkStatusMap({...teacherMarkStatusMap, [s.id]: 'EXCUSED'})} 
                            style={{ padding: '6px 10px', borderRadius: '8px', border: status === 'EXCUSED' ? '1.5px solid #2563eb' : '1px solid #e2e8f0', backgroundColor: status === 'EXCUSED' ? '#eff6ff' : '#ffffff', color: status === 'EXCUSED' ? '#1d4ed8' : '#64748b', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}
                          >
                            📋 Sababli
                          </button>
                        </div>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Izoh..." 
                        value={teacherMarkNoteMap[s.id] || ''} 
                        onChange={e => setTeacherMarkNoteMap({...teacherMarkNoteMap, [s.id]: e.target.value})} 
                        style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '12px', backgroundColor: '#ffffff' }}
                      />
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setTeacherMarkModalLesson(null)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', fontWeight: '800', cursor: 'pointer' }}>
                  Bekor qilish
                </button>
                <button type="submit" disabled={teacherMarkSaving} style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '900', cursor: 'pointer' }}>
                  {teacherMarkSaving ? 'Saqlanmoqda...' : '💾 Davomatni Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 11. Add Homework Modal */}
      {showAddHomeworkModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '540px', maxWidth: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>+ Yangi Vazifa Berish</h3>
              <button onClick={() => setShowAddHomeworkModal(false)} style={{ background: '#f8fafc', border: '1px solid #bfdbfe', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateHomework} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#374151', marginBottom: '4px', display: 'block' }}>Vazifa Nomi / Mavzusi *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Masalan: Unit 5 - Exercises 1 to 5" 
                  value={newHwTitle} 
                  onChange={e => setNewHwTitle(e.target.value)} 
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', fontWeight: '700' }} 
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#374151', marginBottom: '4px', display: 'block' }}>Batafsil Tavsif / Ko'rsatmalar</label>
                <textarea 
                  placeholder="Vazifa bo'yicha ko'rsatmalar..." 
                  value={newHwDesc} 
                  onChange={e => setNewHwDesc(e.target.value)} 
                  style={{ width: '100%', height: '80px', padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', resize: 'none' }} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: '#374151', marginBottom: '4px', display: 'block' }}>Mukofot Coin</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="100" 
                    value={newHwMaxCoins} 
                    onChange={e => setNewHwMaxCoins(e.target.value)} 
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', fontWeight: '800', color: '#b45309' }} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: '#374151', marginBottom: '4px', display: 'block' }}>Fayl biriktirish (PDF / Word)</label>
                  <input 
                    type="file" 
                    accept=".pdf,.docx,.doc,.png,.jpg,.jpeg" 
                    onChange={e => setNewHwFile(e.target.files[0])} 
                    style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', fontSize: '12px' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddHomeworkModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', fontWeight: '800', cursor: 'pointer' }}>
                  Bekor qilish
                </button>
                <button type="submit" disabled={newHwSaving} style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '900', cursor: 'pointer' }}>
                  {newHwSaving ? 'Yuborilmoqda...' : '🚀 Vazifani Berish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 12. View Submissions & Grade Modal */}
      {activeHwSubmissionsModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '750px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eff6ff', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', backgroundColor: '#fef3c7', color: '#b45309', fontWeight: '800', padding: '4px 10px', borderRadius: '6px' }}>
                  🪙 Max Coin: {activeHwSubmissionsModal.max_coins}
                </span>
                <h3 style={{ margin: '6px 0 0', fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>
                  {activeHwSubmissionsModal.title} — Topshirilgan Vazifalar
                </h3>
              </div>
              <button onClick={() => { setActiveHwSubmissionsModal(null); setGradingSubId(null); }} style={{ background: '#f8fafc', border: '1px solid #bfdbfe', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {hwSubmissionsLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#2563eb', fontWeight: '800' }}>Topshiriqlar yuklanmoqda...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {hwSubmissions.map(sub => {
                  const isGraded = sub.status === 'GRADED';
                  const isGradingThis = gradingSubId === sub.id;

                  return (
                    <div key={sub.id} style={{ padding: '16px 20px', backgroundColor: '#f8fafc', borderRadius: '18px', border: `1.5px solid ${isGraded ? '#86efac' : '#bfdbfe'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: '800', color: '#0f172a', fontSize: '15px' }}>
                            {sub.student_name || "O'quvchi"} <span style={{ color: '#2563eb', fontSize: '12px' }}>({sub.student_login_id})</span>
                          </p>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Topshirilgan vaqt: {sub.submitted_at?.split('T')?.[0]} {sub.submitted_at?.split('T')?.[1]?.slice(0, 5)}</span>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', backgroundColor: isGraded ? '#dcfce7' : '#fef3c7', color: isGraded ? '#166534' : '#b45309' }}>
                          {isGraded ? `Baholangan (${sub.grade} ball / +${sub.coins_awarded} coin)` : 'Baholanmagan ⏳'}
                        </span>
                      </div>

                      {sub.text_submission && (
                        <div style={{ marginTop: '10px', padding: '10px 14px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#334155' }}>
                          {sub.text_submission}
                        </div>
                      )}

                      {sub.file_url && (
                        <div style={{ marginTop: '8px' }}>
                          <a href={`http://127.0.0.1:8000${sub.file_url}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#2563eb', fontWeight: '800', textDecoration: 'none' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span> Biriktirilgan faylni ko'rish / yuklab olish
                          </a>
                        </div>
                      )}

                      {/* GRADING FORM */}
                      {!isGradingThis ? (
                        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => {
                              setGradingSubId(sub.id);
                              setGradeScore(sub.grade || 100);
                              setGradeCoins(sub.coins_awarded || activeHwSubmissionsModal.max_coins || 10);
                              setGradeFeedback(sub.feedback || "A'lo darajada bajarilgan!");
                            }}
                            style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
                          >
                            {isGraded ? 'Qayta baholash ✏️' : 'Baholash & Coin berish 🎯'}
                          </button>
                        </div>
                      ) : (
                        <div style={{ marginTop: '14px', padding: '14px', backgroundColor: '#ffffff', borderRadius: '14px', border: '1.5px solid #2563eb', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '2px' }}>Ball (0-100):</label>
                              <input 
                                type="number" 
                                min="0" 
                                max="100" 
                                value={gradeScore} 
                                onChange={e => setGradeScore(e.target.value)} 
                                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #bfdbfe', fontWeight: '800' }} 
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '2px' }}>Beriladigan Coin:</label>
                              <input 
                                type="number" 
                                min="0" 
                                max={activeHwSubmissionsModal.max_coins} 
                                value={gradeCoins} 
                                onChange={e => setGradeCoins(e.target.value)} 
                                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #bfdbfe', fontWeight: '800', color: '#b45309' }} 
                              />
                            </div>
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '2px' }}>O'qituvchi fikri / Izoh:</label>
                            <input 
                              type="text" 
                              value={gradeFeedback} 
                              onChange={e => setGradeFeedback(e.target.value)} 
                              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '12px' }} 
                            />
                          </div>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button onClick={() => setGradingSubId(null)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #bfdbfe', backgroundColor: '#f8fafc', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}>
                              Bekor qilish
                            </button>
                            <button onClick={() => handleGradeSubmission(sub.id)} disabled={gradeSaving} style={{ padding: '6px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#16a34a', color: '#ffffff', fontWeight: '900', fontSize: '12px', cursor: 'pointer' }}>
                              {gradeSaving ? 'Saqlanmoqda...' : '💾 Saqlash & Coin berish'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {hwSubmissions.length === 0 && (
                  <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px dashed #bfdbfe' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#94a3b8' }}>hourglass_empty</span>
                    <h4 style={{ margin: '8px 0 4px', fontSize: '15px', fontWeight: '800' }}>Hozircha o'quvchilar tomonidan vazifalar topshirilmagan</h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>O'quvchilar o'zlarining shaxsiy panelidan vazifani yuklasa, shu yerda paydo bo'ladi.</p>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => { setActiveHwSubmissionsModal(null); setGradingSubId(null); }} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '800', cursor: 'pointer' }}>
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function KpiCard({ title, value, icon }) {
  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 12px rgba(37,99,235,0.03)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '800' }}>{title}</span>
        <div style={{ padding: '12px', backgroundColor: '#eff6ff', borderRadius: '16px', display: 'flex' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#2563eb' }}>{icon}</span>
        </div>
      </div>
      <div>
        <p style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: 0 }}>{value}</p>
      </div>
    </div>
  );
}
