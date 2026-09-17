import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Request Interceptor: JWT Token qo'shish
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 xatoda avtomatik logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Token muddati tugagan — avtomatik logout
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_name');
      localStorage.removeItem('login_id');
      // Login sahifasiga yo'naltirish
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// 1. Auth Service
export const authAPI = {
  login: async (loginId, password) => {
    const res = await api.post('/auth/login', { login_id: String(loginId), password });
    return res.data;
  },
  telegramLogin: async (telegramId) => {
    const res = await api.post('/auth/telegram-login', { telegram_id: String(telegramId) });
    return res.data;
  },
  me: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  changePassword: async (oldPassword, newPassword) => {
    const res = await api.post('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return res.data;
  },
  linkTelegram: async (loginId, chatId) => {
    const res = await api.post('/auth/link-telegram', {
      login_id: String(loginId),
      chat_id: String(chatId),
    });
    return res.data;
  },
};

// 2. Users Service
export const usersAPI = {
  getUsers: async (role = null) => {
    const params = role ? { role } : {};
    const res = await api.get('/users/', { params });
    return res.data;
  },
  getUser: async (userId) => {
    const res = await api.get(`/users/${userId}`);
    return res.data;
  },
  createUser: async (userData) => {
    // userData: { full_name, phone, role, login_id?, telegram_chat_id? }
    const res = await api.post('/users/', userData);
    return res.data;
  },
  updateUser: async (userId, userData) => {
    const res = await api.put(`/users/${userId}`, userData);
    return res.data;
  },
  deleteUser: async (userId, permanent = false) => {
    const res = await api.delete(`/users/${userId}`, { params: { permanent } });
    return res.data;
  },
};

// 3. Courses & Rooms Service
export const coursesAPI = {
  getCourses: async () => {
    const res = await api.get('/courses/');
    return res.data;
  },
  createCourse: async (courseData) => {
    // { title, description?, price_monthly, duration_months }
    const res = await api.post('/courses/', courseData);
    return res.data;
  },
  updateCourse: async (courseId, courseData) => {
    const res = await api.put(`/courses/${courseId}`, courseData);
    return res.data;
  },
  deleteCourse: async (courseId) => {
    const res = await api.delete(`/courses/${courseId}`);
    return res.data;
  },
  getRooms: async () => {
    const res = await api.get('/courses/rooms');
    return res.data;
  },
  createRoom: async (roomData) => {
    // { name, capacity, description? }
    const res = await api.post('/courses/rooms', roomData);
    return res.data;
  },
};

// 4. Groups Service
export const groupsAPI = {
  getGroups: async () => {
    const res = await api.get('/groups/');
    return res.data;
  },
  getGroupDetail: async (groupId) => {
    const res = await api.get(`/groups/${groupId}`);
    return res.data;
  },
  createGroup: async (groupData) => {
    // { name, course_id, teacher_id, room_id, days_of_week, start_time, end_time }
    const res = await api.post('/groups/', groupData);
    return res.data;
  },
  updateGroup: async (groupId, groupData) => {
    const res = await api.put(`/groups/${groupId}`, groupData);
    return res.data;
  },
  deleteGroup: async (groupId) => {
    const res = await api.delete(`/groups/${groupId}`);
    return res.data;
  },
  addStudentToGroup: async (groupId, studentId, tariffData = {}) => {
    const res = await api.post(`/groups/${groupId}/students/${studentId}`, tariffData);
    return res.data;
  },
  updateStudentTariff: async (groupId, studentId, tariffData) => {
    const res = await api.put(`/groups/${groupId}/students/${studentId}/tariff`, tariffData);
    return res.data;
  },
  getGroupStudents: async (groupId) => {
    const res = await api.get(`/groups/${groupId}/students`);
    return res.data;
  },
  removeStudentFromGroup: async (groupId, studentId) => {
    const res = await api.delete(`/groups/${groupId}/students/${studentId}`);
    return res.data;
  },
};

// 5. Attendance Service
export const attendanceAPI = {
  createLesson: async (lessonData) => {
    // { group_id, lesson_date, topic?, room_id? }
    const res = await api.post('/attendance/lessons', lessonData);
    return res.data;
  },
  getLessons: async (groupId = null) => {
    const params = groupId ? { group_id: groupId } : {};
    const res = await api.get('/attendance/lessons', { params });
    return res.data;
  },
  markAttendance: async (attendanceBulkData) => {
    // { lesson_id, attendances: [{ student_id, status: 'PRESENT'|'LATE'|'ABSENT'|'EXCUSED', note? }] }
    const res = await api.post('/attendance/mark', attendanceBulkData);
    return res.data;
  },
  getStudentAttendance: async (studentId) => {
    const res = await api.get(`/attendance/student/${studentId}`);
    return res.data;
  },
  getStudentAttendanceDetailed: async (studentId) => {
    const res = await api.get(`/attendance/student/${studentId}/detailed`);
    return res.data;
  },
  getAllAttendances: async () => {
    const res = await api.get('/attendance/all');
    return res.data;
  },
  getGroupsSummary: async () => {
    const res = await api.get('/attendance/groups-summary');
    return res.data;
  },
  getGroupJournal: async (groupId) => {
    const res = await api.get(`/attendance/group/${groupId}/journal`);
    return res.data;
  },
  deleteLesson: async (lessonId) => {
    const res = await api.delete(`/attendance/lessons/${lessonId}`);
    return res.data;
  },
};

// 6. Homework Service
export const homeworkAPI = {
  createHomework: async (formData) => {
    // Multipart Form: group_id, title, description, max_coins, file
    const res = await api.post('/homework/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  getGroupHomeworks: async (groupId) => {
    const res = await api.get(`/homework/group/${groupId}`);
    return res.data;
  },
  getAssignedHomeworks: async () => {
    const res = await api.get('/homework/student/assigned');
    return res.data;
  },
  submitHomework: async (formData) => {
    // Multipart Form: homework_id, text_submission, file
    const res = await api.post('/homework/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  getHomeworkSubmissions: async (homeworkId) => {
    const res = await api.get(`/homework/${homeworkId}/submissions`);
    return res.data;
  },
  getMySubmissions: async () => {
    const res = await api.get('/homework/student/my');
    return res.data;
  },
  gradeHomework: async (gradeData) => {
    // { submission_id, grade, coins_awarded, feedback? }
    const res = await api.post('/homework/grade', gradeData);
    return res.data;
  },
};

// 7. Finance Service
export const financeAPI = {
  recordPayment: async (paymentData) => {
    // { student_id, amount, payment_method: 'CASH'|'CARD'|'CLICK'|'PAYME', month_for, discount_amount?, note? }
    const res = await api.post('/finance/payments', paymentData);
    return res.data;
  },
  updatePayment: async (paymentId, paymentData) => {
    // { amount?, payment_method?, month_for?, discount_amount?, note? }
    const res = await api.put(`/finance/payments/${paymentId}`, paymentData);
    return res.data;
  },
  deletePayment: async (paymentId) => {
    const res = await api.delete(`/finance/payments/${paymentId}`);
    return res.data;
  },
  getPayments: async () => {
    const res = await api.get('/finance/payments');
    return res.data;
  },
  recordExpense: async (expenseData) => {
    // { title, amount, category, date, description? }
    const res = await api.post('/finance/expenses', expenseData);
    return res.data;
  },
  getExpenses: async () => {
    const res = await api.get('/finance/expenses');
    return res.data;
  },
  calculatePayroll: async (reqData) => {
    // { teacher_id, month_for, percentage_rate }
    const res = await api.post('/finance/payroll/calculate', reqData);
    return res.data;
  },
  paySalary: async (payData) => {
    // { payroll_id, amount, note? }
    const res = await api.post('/finance/payroll/pay', payData);
    return res.data;
  },
  getPayrolls: async () => {
    const res = await api.get('/finance/payroll');
    return res.data;
  },
  generateBilling: async (monthFor, dueDate = null) => {
    const res = await api.post('/finance/billing/generate', { month_for: monthFor, due_date: dueDate });
    return res.data;
  },
  getDebtors: async () => {
    const res = await api.get('/finance/debtors');
    return res.data;
  },
  getDashboardStats: async () => {
    const res = await api.get('/finance/dashboard-stats');
    return res.data;
  },
  getStudentPayments: async (studentId) => {
    const res = await api.get(`/finance/student/${studentId}/payments`);
    return res.data;
  },
  getStudentBillingInfo: async (studentId, monthFor = null) => {
    const params = monthFor ? { month_for: monthFor } : {};
    const res = await api.get(`/finance/student/${studentId}/billing-info`, { params });
    return res.data;
  },
  getGroupStudentsBilling: async (groupId, monthFor = null) => {
    const params = monthFor ? { month_for: monthFor } : {};
    const res = await api.get(`/finance/group/${groupId}/students-billing`, { params });
    return res.data;
  },
  calculateProration: async (params) => {
    const res = await api.post('/finance/calculate-proration', null, { params });
    return res.data;
  },
  autoRunMonthlyBilling: async (monthFor = null) => {
    const params = monthFor ? { month_for: monthFor } : {};
    const res = await api.post('/finance/billing/auto-run', null, { params });
    return res.data;
  },
};

// 8. CRM Service
export const crmAPI = {
  createLead: async (leadData) => {
    // { full_name, phone, course_id?, notes?, telegram_user_id? }
    const res = await api.post('/crm/leads', leadData);
    return res.data;
  },
  getLeads: async (status = null) => {
    const params = status ? { status } : {};
    const res = await api.get('/crm/leads', { params });
    return res.data;
  },
  updateLeadStatus: async (leadId, status, notes = null) => {
    // Backend endpoint: /crm/leads/{lead_id}/status with payload { status, notes }
    const res = await api.put(`/crm/leads/${leadId}/status`, { status, notes });
    return res.data;
  },
  deleteLead: async (leadId) => {
    const res = await api.delete(`/crm/leads/${leadId}`);
    return res.data;
  },
};

// 9. Gamification Service
export const gamificationAPI = {
  createItem: async (itemData) => {
    // { title, description?, coin_price, stock_quantity }
    const res = await api.post('/gamification/items', itemData);
    return res.data;
  },
  getItems: async () => {
    const res = await api.get('/gamification/items');
    return res.data;
  },
  redeemReward: async (rewardItemId) => {
    const res = await api.post('/gamification/redeem', { reward_item_id: rewardItemId });
    return res.data;
  },
  getRedemptions: async () => {
    const res = await api.get('/gamification/redemptions');
    return res.data;
  },
  updateRedemptionStatus: async (redemptionId, status) => {
    // status: 'APPROVED' | 'DELIVERED' | 'REJECTED'
    const res = await api.put(`/gamification/redemptions/${redemptionId}/status`, { status });
    return res.data;
  },
  getStudentTransactions: async () => {
    const res = await api.get('/gamification/student/transactions');
    return res.data;
  },
};

// 10. Analytics & Leaderboard Service (Exams, Questions Bank & Results)
export const analyticsAPI = {
  createExam: async (examData) => {
    // { group_id, title, exam_type, max_score, pass_score, duration_minutes, questions_data, exam_date }
    const res = await api.post('/analytics/exams', examData);
    return res.data;
  },
  getExams: async () => {
    const res = await api.get('/analytics/exams');
    return res.data;
  },
  getGroupExams: async (groupId) => {
    const res = await api.get(`/analytics/exams/group/${groupId}`);
    return res.data;
  },
  getMyExams: async () => {
    const res = await api.get('/analytics/exams/student/my');
    return res.data;
  },
  startExam: async (examId) => {
    const res = await api.post(`/analytics/exams/${examId}/start`);
    return res.data;
  },
  finishExam: async (examId) => {
    const res = await api.post(`/analytics/exams/${examId}/finish`);
    return res.data;
  },
  deleteExam: async (examId) => {
    const res = await api.delete(`/analytics/exams/${examId}`);
    return res.data;
  },
  submitOnlineExam: async (examId, answers) => {
    // { answers: { "0": "Selected option", ... } }
    const res = await api.post(`/analytics/exams/${examId}/submit`, { answers });
    return res.data;
  },
  recordExamResults: async (resultsData) => {
    // { exam_id, results: [{ student_id, score, feedback }] }
    const res = await api.post('/analytics/exams/results', resultsData);
    return res.data;
  },
  getExamResults: async (examId) => {
    const res = await api.get(`/analytics/exams/${examId}/results`);
    return res.data;
  },
  getLeaderboard: async (limit = 10) => {
    const res = await api.get('/analytics/leaderboard', { params: { limit } });
    return res.data;
  },
  getStudentAnalytics: async (studentId) => {
    const res = await api.get(`/analytics/student/${studentId}`);
    return res.data;
  },

  // Questions Bank
  getQuestions: async (courseId = null) => {
    const params = courseId ? { course_id: courseId } : {};
    const res = await api.get('/analytics/questions', { params });
    return res.data;
  },
  createQuestion: async (qData) => {
    // { course_id?, question_text, correct_answer, options }
    const res = await api.post('/analytics/questions', qData);
    return res.data;
  },
  deleteQuestion: async (questionId) => {
    const res = await api.delete(`/analytics/questions/${questionId}`);
    return res.data;
  },
  importQuestionsWord: async (formData) => {
    // FormData: file (UploadFile), course_id?
    const res = await api.post('/analytics/questions/import-word', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  importQuestionsText: async (rawText, courseId = null) => {
    const res = await api.post('/analytics/questions/import-text', { raw_text: rawText, course_id: courseId });
    return res.data;
  },
};

// 11. Certificates Service
export const certificatesAPI = {
  getCertificates: async () => {
    const res = await api.get('/certificates/');
    return res.data;
  },
  getMyCertificates: async () => {
    const res = await api.get('/certificates/my');
    return res.data;
  },
  getStudentCertificates: async (studentId) => {
    const res = await api.get(`/certificates/student/${studentId}`);
    return res.data;
  },
  verifyCertificate: async (certificateCode) => {
    const res = await api.get(`/certificates/verify/${certificateCode}`);
    return res.data;
  },
  createCertificate: async (certData) => {
    // { certificate_code, student_id, course_id, qr_hash, issue_date? }
    const res = await api.post('/certificates/', certData);
    return res.data;
  },
};

// 12. Reports Service
export const reportsAPI = {
  getSummary: async (params) => {
    const res = await api.get('/reports/summary', { params });
    return res.data;
  },
  downloadExcel: async (params) => {
    const res = await api.get('/reports/export/excel', {
      params,
      responseType: 'blob',
      timeout: 60000
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hisobot_${params.period_type || 'monthly'}_${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
  downloadPdf: async (params) => {
    const res = await api.get('/reports/export/pdf', {
      params,
      responseType: 'blob',
      timeout: 60000
    });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hisobot_${params.period_type || 'monthly'}_${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
  downloadDocx: async (params) => {
    const res = await api.get('/reports/export/docx', {
      params,
      responseType: 'blob',
      timeout: 60000
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hisobot_${params.period_type || 'monthly'}_${Date.now()}.docx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

export default api;


