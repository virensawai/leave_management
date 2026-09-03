import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Common & Layout
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ApplyLeave from './pages/student/ApplyLeave';
import MyLeaves from './pages/student/MyLeaves';
import LeaveDetail from './pages/student/LeaveDetail';
import Profile from './pages/student/Profile';

// HOD Pages
import HodDashboard from './pages/hod/HodDashboard';
import HodLeaveList from './pages/hod/HodLeaveList';
import HodLeaveDetail from './pages/hod/HodLeaveDetail';
import HodStudentList from './pages/hod/HodStudentList';

function RootRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return user.role === 'hod' ? (
    <Navigate to="/hod/dashboard" replace />
  ) : (
    <Navigate to="/student/dashboard" replace />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student Protected Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="apply-leave" element={<ApplyLeave />} />
            <Route path="my-leaves" element={<MyLeaves />} />
            <Route path="leaves/:id" element={<LeaveDetail />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* HOD Protected Routes */}
          <Route
            path="/hod"
            element={
              <ProtectedRoute allowedRoles={['hod']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/hod/dashboard" replace />} />
            <Route path="dashboard" element={<HodDashboard />} />
            <Route path="leaves" element={<HodLeaveList />} />
            <Route path="leaves/:id" element={<HodLeaveDetail />} />
            <Route path="students" element={<HodStudentList />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
