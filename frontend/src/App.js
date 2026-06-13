import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

// Placeholder pages (will implement student components next)
const StudentDashboard = React.lazy(() => import('./pages/Student/Dashboard'));
const CourseRegistration = React.lazy(() => import('./pages/Student/CourseRegistration'));
const FacultyAttendance = React.lazy(() => import('./pages/Faculty/Attendance'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <React.Suspense fallback={<div className="p-3">Loading...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/student/dashboard" element={<ProtectedRoute roles={["Student"]}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/register" element={<ProtectedRoute roles={["Student"]}><CourseRegistration /></ProtectedRoute>} />

            <Route path="/faculty/attendance" element={<ProtectedRoute roles={["Faculty"]}><FacultyAttendance /></ProtectedRoute>} />

            <Route path="/" element={<div className="container mt-5"><h3>Welcome to HiSUP</h3></div>} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
