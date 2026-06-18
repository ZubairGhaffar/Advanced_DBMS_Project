import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import NavBar from './components/NavBar';

// Lazy load pages
const StudentDashboard = React.lazy(() => import('./pages/Student/Dashboard'));
const StudentCourses = React.lazy(() => import('./pages/Student/EnrolledCourses'));
const CourseRegistration = React.lazy(() => import('./pages/Student/CourseRegistration'));
const PayFee = React.lazy(() => import('./pages/Student/PayFee'));
const StudentLibrary = React.lazy(() => import('./pages/Student/Library'));
const StudentResults = React.lazy(() => import('./pages/Student/Results'));

const FacultyAttendance = React.lazy(() => import('./pages/Faculty/Attendance'));
const GradeEntry = React.lazy(() => import('./pages/Faculty/GradeEntry'));
const FacultyWorkload = React.lazy(() => import('./pages/Faculty/Workload'));

const FinanceDashboard = React.lazy(() => import('./pages/Finance/Dashboard'));

const AdminDashboard = React.lazy(() => import('./pages/Admin/Dashboard'));
const AdminStudents = React.lazy(() => import('./pages/Admin/StudentManagement'));
const AdminFaculty = React.lazy(() => import('./pages/Admin/FacultyManagement'));
const AdminCourses = React.lazy(() => import('./pages/Admin/CourseManagement'));
const AdminHostel = React.lazy(() => import('./pages/Admin/Hostel'));
const LibraryManagement = React.lazy(() => import('./pages/Admin/LibraryManagement'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <React.Suspense fallback={<div className="p-4 text-center text-secondary notranslate" translate="no">Loading page contents...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Student Routes */}
            <Route path="/student/dashboard" element={<ProtectedRoute roles={["Student"]}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/courses" element={<ProtectedRoute roles={["Student"]}><StudentCourses /></ProtectedRoute>} />
            <Route path="/student/register" element={<ProtectedRoute roles={["Student"]}><CourseRegistration /></ProtectedRoute>} />
            <Route path="/student/pay-fee" element={<ProtectedRoute roles={["Student"]}><PayFee /></ProtectedRoute>} />
            <Route path="/student/library" element={<ProtectedRoute roles={["Student"]}><StudentLibrary /></ProtectedRoute>} />
            <Route path="/student/results" element={<ProtectedRoute roles={["Student"]}><StudentResults /></ProtectedRoute>} />

            {/* Faculty Routes */}
            <Route path="/faculty/attendance" element={<ProtectedRoute roles={["Faculty"]}><FacultyAttendance /></ProtectedRoute>} />
            <Route path="/faculty/grade-entry" element={<ProtectedRoute roles={["Faculty"]}><GradeEntry /></ProtectedRoute>} />
            <Route path="/faculty/workload" element={<ProtectedRoute roles={["Faculty"]}><FacultyWorkload /></ProtectedRoute>} />

            {/* Finance Routes */}
            <Route path="/finance/dashboard" element={<ProtectedRoute roles={["Finance"]}><FinanceDashboard /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute roles={["Admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute roles={["Admin"]}><AdminStudents /></ProtectedRoute>} />
            <Route path="/admin/faculty" element={<ProtectedRoute roles={["Admin"]}><AdminFaculty /></ProtectedRoute>} />
            <Route path="/admin/courses" element={<ProtectedRoute roles={["Admin"]}><AdminCourses /></ProtectedRoute>} />
            <Route path="/admin/hostel" element={<ProtectedRoute roles={["Admin"]}><AdminHostel /></ProtectedRoute>} />
            <Route path="/admin/library" element={<ProtectedRoute roles={["Admin"]}><LibraryManagement /></ProtectedRoute>} />

            {/* Root Welcome page */}
            <Route path="/" element={
              <div className="container mt-5 py-5 text-center">
                <div className="glass-card p-5 col-md-8 mx-auto">
                  <h1 className="fw-bold mb-3" style={{ background: 'linear-gradient(135deg, #00a8cc, #8c52ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    HiSUP Management System
                  </h1>
                  <p className="text-secondary mb-5 fs-5">A high-performance student database information system powered by Oracle PL/SQL and React.</p>
                  <div>
                    <Link className="btn btn-glass py-2 px-4" to="/login">Access Portal Dashboard</Link>
                  </div>
                </div>
              </div>
            } />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
