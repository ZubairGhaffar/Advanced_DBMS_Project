import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">HiSUP</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {user?.role === 'Student' && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/student/dashboard">Dashboard</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/student/register">Register</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/student/pay-fee">Fees</Link></li>
              </>
            )}
            {user?.role === 'Faculty' && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/faculty/attendance">Attendance</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/faculty/grade-entry">Grades</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/faculty/workload">Workload</Link></li>
              </>
            )}
          </ul>
          <div className="d-flex">
            {user ? (
              <button className="btn btn-outline-secondary" onClick={logout}>Logout</button>
            ) : (
              <Link className="btn btn-primary" to="/login">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
