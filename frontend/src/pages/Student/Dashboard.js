import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import { AuthContext } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/student/dashboard');
        setData(res.data.data[0] || res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const downloadTranscript = async () => {
    try {
      const res = await api.get('/student/transcript', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transcript_${user?.referenceID || 'student'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Unable to download transcript at this moment.');
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mt-5 text-center">
        <div className="glass-card p-5">
          <h3>No Dashboard Data Available</h3>
          <p className="text-secondary">Make sure you are registered and active.</p>
        </div>
      </div>
    );
  }

  // Radial calculation (GPA max: 4.0, radius: 45, circumference: 2 * PI * r = 282.7)
  const gpaVal = Number(data.GPA || data.gpa || 0);
  const gpaCircumference = 282.7;
  const gpaStrokeOffset = gpaCircumference - (Math.min(gpaVal, 4.0) / 4.0) * gpaCircumference;

  // Attendance radial calculation (max: 100)
  const attVal = Number(data.ATTENDANCE_PERCENT || data.attendance_percent || 0);
  const attCircumference = 282.7;
  const attStrokeOffset = attCircumference - (Math.min(attVal, 100) / 100) * attCircumference;

  const outstandingFees = Number(data.OUTSTANDING_FEES || data.outstanding_fees || 0);

  return (
    <div className="container mt-4 pb-5">
      <div className="glass-card mb-4 p-4 text-start">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h1 className="fw-bold m-0" style={{ background: 'linear-gradient(135deg, #00a8cc, #8c52ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Welcome back, {data.STUDENT_NAME || data.student_name || 'Student'}!
            </h1>
            <p className="text-secondary m-0 mt-1">Student ID: {data.STUDENT_ID || data.student_id} | Academic status is active.</p>
          </div>
          <button className="btn btn-glass" onClick={downloadTranscript}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-earmark-pdf-fill me-2" viewBox="0 0 16 16">
              <path d="M5.523 12.424c.14-.082.293-.162.459-.238a7.878 7.878 0 0 1-.45.606c-.28.337-.498.516-.635.508-.077-.014-.202-.097-.2-.325.007-.22.114-.427.226-.606a5.176 5.176 0 0 1 .599-.606Z"/>
              <path d="M8 0a1 1 0 0 1 1 1v12h1v-2h1.5a1.5 1.5 0 0 0 0-3H10V7h2V5H9V1H8v13.5a.5.5 0 0 1-1 0V1H1V0h7Z"/>
            </svg>
            Download Transcript
          </button>
        </div>
      </div>

      <div className="row gy-4">
        {/* GPA Circular Chart Card */}
        <div className="col-md-4">
          <div className="glass-card text-center d-flex flex-column align-items-center justify-content-center">
            <h5 className="text-secondary fw-medium mb-4">Cumulative GPA</h5>
            <div className="radial-progress-container">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                <circle 
                  cx="60" 
                  cy="60" 
                  r="45" 
                  fill="none" 
                  stroke="url(#gpaGradient)" 
                  strokeWidth="10" 
                  strokeDasharray={gpaCircumference} 
                  strokeDashoffset={gpaStrokeOffset} 
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
                <defs>
                  <linearGradient id="gpaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00a8cc" />
                    <stop offset="100%" stopColor="#8c52ff" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="radial-progress-value">{gpaVal.toFixed(2)}</div>
            </div>
            <div className="mt-4 text-secondary small">Excellent Standing (out of 4.0)</div>
          </div>
        </div>

        {/* Attendance Circular Chart Card */}
        <div className="col-md-4">
          <div className="glass-card text-center d-flex flex-column align-items-center justify-content-center">
            <h5 className="text-secondary fw-medium mb-4">Overall Attendance</h5>
            <div className="radial-progress-container">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                <circle 
                  cx="60" 
                  cy="60" 
                  r="45" 
                  fill="none" 
                  stroke={attVal >= 75 ? 'url(#attGradientSuccess)' : 'url(#attGradientWarning)'} 
                  strokeWidth="10" 
                  strokeDasharray={attCircumference} 
                  strokeDashoffset={attStrokeOffset} 
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
                <defs>
                  <linearGradient id="attGradientSuccess" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00e676" />
                    <stop offset="100%" stopColor="#00b0ff" />
                  </linearGradient>
                  <linearGradient id="attGradientWarning" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffab00" />
                    <stop offset="100%" stopColor="#ff3d00" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="radial-progress-value">{attVal.toFixed(1)}%</div>
            </div>
            <div className="mt-4">
              {attVal >= 75 ? (
                <span className="badge-glass badge-glass-success">Satisfactory</span>
              ) : (
                <span className="badge-glass badge-glass-danger">Shortfall alert</span>
              )}
            </div>
          </div>
        </div>

        {/* Outstanding Fees Card */}
        <div className="col-md-4">
          <div className="glass-card d-flex flex-column justify-content-between">
            <div className="text-start">
              <h5 className="text-secondary fw-medium mb-3">Finance & Fees</h5>
              <div className="display-5 fw-bold text-white mb-2">
                PKR {outstandingFees.toLocaleString()}
              </div>
              <p className="text-secondary small">Pending fee amount due for current term.</p>
            </div>
            
            <div className="mt-4">
              <div className="progress mb-3" style={{ height: '6px', background: 'rgba(255,255,255,0.05)' }}>
                <div 
                  className={`progress-bar ${outstandingFees === 0 ? 'bg-success' : 'bg-warning'}`} 
                  role="progressbar" 
                  style={{ width: outstandingFees === 0 ? '100%' : '50%' }}
                />
              </div>
              
              <div className="d-flex justify-content-between align-items-center">
                <span className="small text-secondary">
                  {outstandingFees === 0 ? 'All cleared!' : 'Partial payments done'}
                </span>
                <span className={`badge-glass ${outstandingFees === 0 ? 'badge-glass-success' : 'badge-glass-warning'}`}>
                  {outstandingFees === 0 ? 'Paid' : 'Unpaid Balance'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="row mt-4 gy-4">
        <div className="col-12">
          <div className="glass-card p-4">
            <h5 className="fw-semibold mb-4">Quick Academic Actions</h5>
            <div className="row text-center gy-3">
              <div className="col-6 col-md-3">
                <Link to="/student/courses" className="text-decoration-none d-block p-3 rounded glass-card-nested border border-white-5 hover-glow-btn">
                  <div className="h3 text-info">📚</div>
                  <div className="text-white small fw-medium mt-2">Class Attendance</div>
                </Link>
              </div>
              <div className="col-6 col-md-3">
                <Link to="/student/register" className="text-decoration-none d-block p-3 rounded glass-card-nested border border-white-5 hover-glow-btn">
                  <div className="h3 text-primary">📝</div>
                  <div className="text-white small fw-medium mt-2">Course Enrollment</div>
                </Link>
              </div>
              <div className="col-6 col-md-3">
                <Link to="/student/pay-fee" className="text-decoration-none d-block p-3 rounded glass-card-nested border border-white-5 hover-glow-btn">
                  <div className="h3 text-success">💳</div>
                  <div className="text-white small fw-medium mt-2">Pay Tuition Fee</div>
                </Link>
              </div>
              <div className="col-6 col-md-3">
                <Link to="/student/library" className="text-decoration-none d-block p-3 rounded glass-card-nested border border-white-5 hover-glow-btn">
                  <div className="h3 text-warning">📖</div>
                  <div className="text-white small fw-medium mt-2">Library Books</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
