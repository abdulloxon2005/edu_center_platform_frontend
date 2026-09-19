import { Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load: sahifalar faqat kerak bo'lganda yuklanadi
const Login = lazy(() => import('./components/Login'));
const Banner = lazy(() => import('./components/Banner'));
const Courses = lazy(() => import('./components/Courses'));
const AboutUs = lazy(() => import('./components/AboutUs'));
const WhyUs = lazy(() => import('./components/WhyUs'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const TeacherDashboard = lazy(() => import('./components/TeacherDashboard'));
const TelegramBotSimulator = lazy(() => import('./components/TelegramBotSimulator'));
const StudentApp = lazy(() => import('./components/StudentApp'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const TermsAndConditions = lazy(() => import('./components/TermsAndConditions'));

function LoadingFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '10px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#4361ee' }}>hourglass_empty</span>
        </div>
        <p style={{ color: '#6b7280' }}>Yuklanmoqda...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isDashboardRoute = ['/admin', '/dashboard', '/teacher', '/bot', '/student'].includes(location.pathname);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {!isDashboardRoute && <Navbar />}
      
      <div style={{ paddingTop: isDashboardRoute ? '0' : '90px', flex: '1' }}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                <>
                  <div style={{ textAlign: 'center', marginTop: '30px', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '42px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>
                      O'z kelajagingizni <span className="gradient-text">Ta'lim Plus</span>
                      <br />
                      <span className="gradient-text">Education center</span> bilan quring!
                    </h1>
                  </div>
                  <Banner />
                  <Courses />
                  <AboutUs />
                  <WhyUs />
                </>
              } />
              
              <Route path="/fanlar" element={<Courses />} />
              <Route path="/kurslar" element={<Courses />} />
              <Route path="/natijalar" element={<AboutUs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/shartlar" element={<TermsAndConditions />} />

              {/* Protected Administrator Dashboard */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRole="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/dashboard" element={
                <ProtectedRoute allowedRole="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              {/* Protected Teacher Web Panel */}
              <Route path="/teacher" element={
                <ProtectedRoute allowedRole="TEACHER">
                  <TeacherDashboard />
                </ProtectedRoute>
              } />

              {/* Protected Student Mobile Application */}
              <Route path="/student" element={
                <ProtectedRoute allowedRole="STUDENT">
                  <StudentApp />
                </ProtectedRoute>
              } />

              {/* Live Telegram Bot Simulator */}
              <Route path="/bot" element={<TelegramBotSimulator />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>

      {!isDashboardRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return <AppContent />;
}