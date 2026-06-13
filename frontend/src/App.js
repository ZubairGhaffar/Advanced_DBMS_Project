import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import NavBar from './components/NavBar';

const StudentDashboard = React.lazy(() => import('./pages/Student/Dashboard'));
const CourseRegistration = React.lazy(() => import('./pages/Student/CourseRegistration'));
const PayFee = React.lazy(() => import('./pages/Student/PayFee'));
const StudentLibrary = React.lazy(() => import('./pages/Student/Library'));
const StudentResults = React.lazy(() => import('./pages/Student/Results'));
const FacultyAttendance = React.lazy(() => import('./pages/Faculty/Attendance'));
const GradeEntry = React.lazy(() => import('./pages/Faculty/GradeEntry'));
const FacultyWorkload = React.lazy(() => import('./pages/Faculty/Workload'));
const FinanceDashboard = React.lazy(() => import('./pages/Finance/Dashboard'));
const AdminDashboard = React.lazy(() => import('./pages/Admin/Dashboard'));
const AdminHostel = React.lazy(() => import('./pages/Admin/Hostel'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <React.Suspense fallback={<div className="p-3">Loading...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/student/dashboard" element={<ProtectedRoute roles={["Student"]}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/register" element={<ProtectedRoute roles={["Student"]}><CourseRegistration /></ProtectedRoute>} />
            <Route path="/student/pay-fee" element={<ProtectedRoute roles={["Student"]}><PayFee /></ProtectedRoute>} />
            <Route path="/student/library" element={<ProtectedRoute roles={["Student"]}><StudentLibrary /></ProtectedRoute>} />
            <Route path="/student/results" element={<ProtectedRoute roles={["Student"]}><StudentResults /></ProtectedRoute>} />

            <Route path="/faculty/attendance" element={<ProtectedRoute roles={["Faculty"]}><FacultyAttendance /></ProtectedRoute>} />
            <Route path="/faculty/grade-entry" element={<ProtectedRoute roles={["Faculty"]}><GradeEntry /></ProtectedRoute>} />
            <Route path="/faculty/workload" element={<ProtectedRoute roles={["Faculty"]}><FacultyWorkload /></ProtectedRoute>} />
            <Route path="/finance/dashboard" element={<ProtectedRoute roles={["Finance"]}><FinanceDashboard /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute roles={["Admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/hostel" element={<ProtectedRoute roles={["Admin"]}><AdminHostel /></ProtectedRoute>} />

            <Route path="/" element={<div className="container mt-5"><h3>Welcome to HiSUP</h3></div>} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
