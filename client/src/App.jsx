import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import PathPilotLanding from './pages/PathPilotLanding';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';

// Student Modules (Authentic Backend Data-driven)
import StudentDashboard from './modules/student/Dashboard';
import StudentOnboarding from './modules/student/StudentOnboarding';
import StudentRoadmap from './modules/student/StudentRoadmap';
import StudentLearningExperience from './modules/student/StudentLearningExperience';
import DSAModule from './modules/student/DSAModule';
import AptitudeModule from './modules/student/AptitudeModule';
import CSCoreModule from './modules/student/CSCoreModule';
import PracticeZone from './modules/student/PracticeZone';
import MistakeJournal from './modules/student/MistakeJournal';
import RevisionCenter from './modules/student/RevisionCenter';
import MyProgress from './modules/student/MyProgress';
import WeakAreas from './modules/student/WeakAreas';
import Achievements from './modules/student/Achievements';
import BaselineAssessment from './modules/student/BaselineAssessment';
import StudentAssessmentPortal from './modules/student/StudentAssessmentPortal';
import AssessmentReady from './modules/student/AssessmentReady';
import StudentAssessmentTake from './modules/student/StudentAssessmentTake';
import AICoach from './modules/student/AICoach';
import MockInterview from './modules/student/MockInterview';
import CompanyPrep from './modules/student/CompanyPrep';
import ResumeAnalyzer from './modules/student/ResumeAnalyzer';
import ProfileSettings from './modules/student/ProfileSettings';

// Admin Modules (Authentic Backend Data-driven)
import AdminDashboard from './modules/admin/AdminDashboard';
import StudentManagement from './modules/admin/StudentManagement';
import QuestionManagement from './modules/admin/QuestionManagement';
import TopicManagement from './modules/admin/TopicManagement';
import AdminAssessmentManagement from './modules/admin/AdminAssessmentManagement';
import CSCoreContentMgmt from './modules/admin/CSCoreContentMgmt';
import CompanyManagement from './modules/admin/CompanyManagement';
import ResourceManagement from './modules/admin/ResourceManagement';
import AIConfiguration from './modules/admin/AIConfiguration';
import PlatformAnalytics from './modules/admin/PlatformAnalytics';

import { useAuth } from './context/AuthContext';
import { getStudentInitialRoute } from './utils/studentRouting';

function StudentIndexRedirect() {
  const { profile } = useAuth();
  return <Navigate to={getStudentInitialRoute(profile)} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* 1. Public Routes */}
      <Route path="/" element={<PathPilotLanding />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* 2. Authenticated Student Isolated Space */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentIndexRedirect />} />
        <Route path="onboarding" element={<StudentOnboarding />} />
        <Route path="assessment-ready" element={<AssessmentReady />} />
        <Route path="assessment-ready/:assessmentId" element={<AssessmentReady />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="roadmap" element={<StudentRoadmap />} />
        <Route path="learn/:topicId" element={<StudentLearningExperience />} />
        <Route path="dsa" element={<DSAModule />} />
        <Route path="aptitude" element={<AptitudeModule />} />
        <Route path="cs-core" element={<CSCoreModule />} />
        <Route path="practice" element={<PracticeZone />} />
        <Route path="mistakes" element={<MistakeJournal />} />
        <Route path="revision" element={<RevisionCenter />} />
        <Route path="progress" element={<MyProgress />} />
        <Route path="weak-areas" element={<WeakAreas />} />
        <Route path="achievements" element={<Achievements />} />
        {/* Assessment System Routes */}
        <Route path="assessment" element={<StudentAssessmentPortal />} />
        <Route path="assessments" element={<StudentAssessmentPortal />} />
        <Route path="assessment/ready" element={<AssessmentReady />} />
        <Route path="assessment/ready/:assessmentId" element={<AssessmentReady />} />
        <Route path="assessment/:assessmentId" element={<AssessmentReady />} />
        <Route path="assessments/take/:assessmentId" element={<StudentAssessmentTake />} />
        <Route path="baseline-assessment" element={<BaselineAssessment />} />
        <Route path="assessment/baseline" element={<BaselineAssessment />} />
        <Route path="ai-coach" element={<AICoach />} />
        <Route path="mock-interview" element={<MockInterview />} />
        <Route path="company-prep" element={<CompanyPrep />} />
        <Route path="resume-analyzer" element={<ResumeAnalyzer />} />
        <Route path="profile" element={<ProfileSettings />} />
      </Route>

      {/* 3. Authenticated Admin Isolated Space */}
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
        <Route path="topics" element={<TopicManagement />} />
        <Route path="assessments" element={<AdminAssessmentManagement />} />
        <Route path="dsa-topics" element={<TopicManagement />} />
        <Route path="aptitude-topics" element={<TopicManagement />} />
        <Route path="cs-core-content" element={<CSCoreContentMgmt />} />
        <Route path="companies" element={<CompanyManagement />} />
        <Route path="resources" element={<ResourceManagement />} />
        <Route path="ai-config" element={<AIConfiguration />} />
        <Route path="analytics" element={<PlatformAnalytics />} />
      </Route>

      {/* 4. Legacy Aliases & Redirects */}
      <Route path="/dashboard" element={<StudentIndexRedirect />} />
      <Route path="/roadmap" element={<Navigate to="/student/roadmap" replace />} />
      <Route path="/assessment" element={<Navigate to="/student/assessment" replace />} />
      <Route path="/assessments" element={<Navigate to="/student/assessment" replace />} />
      <Route path="/practice" element={<Navigate to="/student/practice" replace />} />
      <Route path="/revision" element={<Navigate to="/student/revision" replace />} />
      <Route path="/progress" element={<Navigate to="/student/progress" replace />} />
      <Route path="/profile" element={<Navigate to="/student/profile" replace />} />

      {/* 5. Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col pathpilot-bg text-slate-100">
          <div className="flex-1">
            <AppRoutes />
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
