import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Student Pages
import StudentDashboard from '../pages/student/Dashboard';
import MyAICoach from '../pages/student/MyAICoach';
import DSAModule from '../pages/student/DSAModule';
import AptitudeModule from '../pages/student/AptitudeModule';
import CSCoreModule from '../pages/student/CSCoreModule';
import PracticeZone from '../pages/student/PracticeZone';
import MockInterview from '../pages/student/MockInterview';
import CompanyPrep from '../pages/student/CompanyPrep';
import ResumeAnalyzer from '../pages/student/ResumeAnalyzer';
import MyProgress from '../pages/student/MyProgress';
import WeakAreas from '../pages/student/WeakAreas';
import Achievements from '../pages/student/Achievements';
import ProfileSettings from '../pages/student/ProfileSettings';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import StudentManagement from '../pages/admin/StudentManagement';
import QuestionManagement from '../pages/admin/QuestionManagement';
import DSATopicManagement from '../pages/admin/DSATopicManagement';
import AptitudeTopicManagement from '../pages/admin/AptitudeTopicManagement';
import CSCoreManagement from '../pages/admin/CSCoreManagement';
import CompanyManagement from '../pages/admin/CompanyManagement';
import ResourceManagement from '../pages/admin/ResourceManagement';
import AIConfiguration from '../pages/admin/AIConfiguration';
import PlatformAnalytics from '../pages/admin/PlatformAnalytics';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Default Route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Student Routes */}
      <Route path="/dashboard" element={<StudentDashboard />} />
      <Route path="/ai-coach" element={<MyAICoach />} />
      <Route path="/dsa" element={<DSAModule />} />
      <Route path="/aptitude" element={<AptitudeModule />} />
      <Route path="/cs-core" element={<CSCoreModule />} />
      <Route path="/practice" element={<PracticeZone />} />
      <Route path="/mock-interview" element={<MockInterview />} />
      <Route path="/company-prep" element={<CompanyPrep />} />
      <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
      <Route path="/my-progress" element={<MyProgress />} />
      <Route path="/weak-areas" element={<WeakAreas />} />
      <Route path="/achievements" element={<Achievements />} />
      <Route path="/settings" element={<ProfileSettings />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/students" element={<StudentManagement />} />
      <Route path="/admin/questions" element={<QuestionManagement />} />
      <Route path="/admin/dsa-topics" element={<DSATopicManagement />} />
      <Route path="/admin/aptitude-topics" element={<AptitudeTopicManagement />} />
      <Route path="/admin/cs-core-content" element={<CSCoreManagement />} />
      <Route path="/admin/companies" element={<CompanyManagement />} />
      <Route path="/admin/resources" element={<ResourceManagement />} />
      <Route path="/admin/ai-config" element={<AIConfiguration />} />
      <Route path="/admin/analytics" element={<PlatformAnalytics />} />

      {/* Fallback Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
