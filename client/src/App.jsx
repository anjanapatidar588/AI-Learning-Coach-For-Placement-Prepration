import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import BackendStatus from './components/common/BackendStatus';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Modules
import Login from './modules/auth/Login';
import Register from './modules/auth/Register';

// Student Modules
import StudentDashboard from './modules/student/Dashboard';
import AICoach from './modules/student/AICoach';
import DSAModule from './modules/student/DSAModule';
import AptitudeModule from './modules/student/AptitudeModule';
import CSCoreModule from './modules/student/CSCoreModule';
import PracticeZone from './modules/student/PracticeZone';
import MockInterview from './modules/student/MockInterview';
import CompanyPrep from './modules/student/CompanyPrep';
import ResumeAnalyzer from './modules/student/ResumeAnalyzer';
import MyProgress from './modules/student/MyProgress';
import WeakAreas from './modules/student/WeakAreas';
import Achievements from './modules/student/Achievements';
import ProfileSettings from './modules/student/ProfileSettings';

// Admin Modules
import AdminDashboard from './modules/admin/AdminDashboard';
import StudentManagement from './modules/admin/StudentManagement';
import QuestionManagement from './modules/admin/QuestionManagement';
import DSATopicMgmt from './modules/admin/DSATopicMgmt';
import AptitudeTopicMgmt from './modules/admin/AptitudeTopicMgmt';
import CSCoreContentMgmt from './modules/admin/CSCoreContentMgmt';
import CompanyManagement from './modules/admin/CompanyManagement';
import ResourceManagement from './modules/admin/ResourceManagement';
import AIConfiguration from './modules/admin/AIConfiguration';
import PlatformAnalytics from './modules/admin/PlatformAnalytics';

// Protected Route Guard Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Student Portal Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="ai-coach" element={<AICoach />} />
        <Route path="dsa" element={<DSAModule />} />
        <Route path="aptitude" element={<AptitudeModule />} />
        <Route path="cs-core" element={<CSCoreModule />} />
        <Route path="practice" element={<PracticeZone />} />
        <Route path="mock-interview" element={<MockInterview />} />
        <Route path="company-prep" element={<CompanyPrep />} />
        <Route path="resume-analyzer" element={<ResumeAnalyzer />} />
        <Route path="progress" element={<MyProgress />} />
        <Route path="weak-areas" element={<WeakAreas />} />
        <Route path="achievements" element={<Achievements />} />
        <Route path="profile" element={<ProfileSettings />} />
      </Route>

      {/* Protected Admin Control Panel Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<StudentManagement />} />
        <Route path="questions" element={<QuestionManagement />} />
        <Route path="dsa-topics" element={<DSATopicMgmt />} />
        <Route path="aptitude-topics" element={<AptitudeTopicMgmt />} />
        <Route path="cs-core-content" element={<CSCoreContentMgmt />} />
        <Route path="companies" element={<CompanyManagement />} />
        <Route path="resources" element={<ResourceManagement />} />
        <Route path="ai-config" element={<AIConfiguration />} />
        <Route path="analytics" element={<PlatformAnalytics />} />
      </Route>

      {/* Default Catch-all redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
          <BackendStatus />
          <div className="flex-1">
            <AppRoutes />
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
