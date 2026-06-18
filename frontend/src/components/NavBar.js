import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/">HiSUP</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {user?.role === 'Student' && (
              <>
                <li className="nav-item"><Link className={`nav-link ${isActive('/student/dashboard')}`} to="/student/dashboard">Dashboard</Link></li>
                <li className="nav-item"><Link className={`nav-link ${isActive('/student/courses')}`} to="/student/courses">Courses & Attendance</Link></li>
                <li className="nav-item"><Link className={`nav-link ${isActive('/student/register')}`} to="/student/register">Enroll Courses</Link></li>
                <li className="nav-item"><Link className={`nav-link ${isActive('/student/pay-fee')}`} to="/student/pay-fee">Fees Slip & Pay</Link></li>
                <li className="nav-item"><Link className={`nav-link ${isActive('/student/library')}`} to="/student/library">Library</Link></li>
                <li className="nav-item"><Link className={`nav-link ${isActive('/student/results')}`} to="/student/results">Academic Results</Link></li>
              </>
            )}
            {user?.role === 'Faculty' && (
              <>
                <li className="nav-item"><Link className={`nav-link ${isActive('/faculty/attendance')}`} to="/faculty/attendance">Mark Attendance</Link></li>
                <li className="nav-item"><Link className={`nav-link ${isActive('/faculty/grade-entry')}`} to="/faculty/grade-entry">Submit Grades</Link></li>
                <li className="nav-item"><Link className={`nav-link ${isActive('/faculty/workload')}`} to="/faculty/workload">Workload Info</Link></li>
              </>
            )}
            {user?.role === 'Finance' && (
              <>
                <li className="nav-item"><Link className={`nav-link ${isActive('/finance/dashboard')}`} to="/finance/dashboard">Finance Panel</Link></li>
              </>
            )}
            {user?.role === 'Admin' && (
              <>
                <li className="nav-item"><Link className={`nav-link ${isActive('/admin/dashboard')}`} to="/admin/dashboard">Admin Dashboard</Link></li>
                <li className="nav-item"><Link className={`nav-link ${isActive('/admin/students')}`} to="/admin/students">Manage Students</Link></li>
                <li className="nav-item"><Link className={`nav-link ${isActive('/admin/faculty')}`} to="/admin/faculty">Manage Faculty</Link></li>
                <li className="nav-item"><Link className={`nav-link ${isActive('/admin/courses')}`} to="/admin/courses">Courses & Sections</Link></li>
                <li className="nav-item"><Link className={`nav-link ${isActive('/admin/hostel')}`} to="/admin/hostel">Allocate Hostel</Link></li>
                <li className="nav-item"><Link className={`nav-link ${isActive('/admin/library')}`} to="/admin/library">Manage Library</Link></li>
              </>
            )}
          </ul>
          <div className="d-flex align-items-center">
            {user ? (
              <div className="d-flex align-items-center gap-3">
                <span className="text-secondary small">Role: <strong className="text-info">{user.role}</strong></span>
                <button className="btn btn-glass-secondary py-1 px-3" onClick={logout}>Logout</button>
              </div>
            ) : (
              <Link className="btn btn-glass py-1 px-3" to="/login">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
