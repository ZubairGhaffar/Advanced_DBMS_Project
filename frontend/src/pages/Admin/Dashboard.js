import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const AdminDashboard = () => {
  const [deptEnroll, setDeptEnroll] = useState([]);
  const [attendanceShortfall, setAttendanceShortfall] = useState([]);
  const [examTimetable, setExamTimetable] = useState([]);
  const [libraryOverdue, setLibraryOverdue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resDept, resAttend, resExam, resLibrary] = await Promise.all([
          api.get('/admin/department-enrollment'),
          api.get('/admin/attendance-shortfall'),
          api.get('/admin/exam-timetable'),
          api.get('/admin/library-overdue')
        ]);
        setDeptEnroll(resDept.data || []);
        setAttendanceShortfall(resAttend.data || []);
        setExamTimetable(resExam.data || []);
        setLibraryOverdue(resLibrary.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const totalEnrollments = deptEnroll.reduce((acc, c) => acc + Number(c.ENROLLMENTS || c.enrollments || 0), 0);
  const totalUniqueStudents = deptEnroll.reduce((acc, c) => acc + Number(c.STUDENTS || c.students || 0), 0);
  const shortfallCount = attendanceShortfall.length;
  const libraryIssuesCount = libraryOverdue.length;

  return (
    <div className="container mt-4 pb-5 text-start">
      <div className="mb-4">
        <h3 className="fw-bold text-white">Administrator Command Center</h3>
        <p className="text-secondary">Track university-wide registrations, attendance warnings, exam timetables, and library status.</p>
      </div>

      {/* KPI Stats Widgets */}
      <div className="row gy-4 mb-4">
        <div className="col-md-3">
          <div className="glass-card p-3">
            <span className="text-secondary small fw-medium">Total Enrollments</span>
            <div className="d-flex align-items-center justify-content-between mt-2">
              <h3 className="fw-bold text-white mb-0">{totalEnrollments}</h3>
              <span className="fs-3">📝</span>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card p-3">
            <span className="text-secondary small fw-medium">Unique Students</span>
            <div className="d-flex align-items-center justify-content-between mt-2">
              <h3 className="fw-bold text-white mb-0">{totalUniqueStudents}</h3>
              <span className="fs-3">👨‍🎓</span>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card p-3">
            <span className="text-secondary small fw-medium">Attendance Shortfalls</span>
            <div className="d-flex align-items-center justify-content-between mt-2">
              <h3 className="fw-bold text-danger mb-0">{shortfallCount}</h3>
              <span className="fs-3">⚠️</span>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card p-3">
            <span className="text-secondary small fw-medium">Library Overdues</span>
            <div className="d-flex align-items-center justify-content-between mt-2">
              <h3 className="fw-bold text-warning mb-0">{libraryIssuesCount}</h3>
              <span className="fs-3">📚</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row gy-4">
        {/* Department Enrollment SVG Bar Chart */}
        <div className="col-lg-6">
          <div className="glass-card p-4">
            <h5 className="fw-semibold text-white mb-4">Enrollments by Department</h5>
            <div className="d-flex flex-column gap-4">
              {deptEnroll.length === 0 ? (
                <p className="text-secondary text-center small py-5 mb-0">No department registration data found.</p>
              ) : (
                deptEnroll.map(row => {
                  const enrollCount = Number(row.ENROLLMENTS || 0);
                  const name = row.DEPT_NAME || 'Department';
                  const percentage = totalEnrollments > 0 ? (enrollCount / totalEnrollments) * 100 : 0;
                  
                  return (
                    <div key={row.DEPT_ID}>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="text-light small fw-semibold">{name}</span>
                        <span className="text-info small fw-bold">{enrollCount} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="progress" style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px' }}>
                        <div 
                          className="progress-bar"
                          role="progressbar"
                          style={{ 
                            width: `${percentage}%`,
                            background: 'linear-gradient(135deg, #00a8cc 0%, #8c52ff 100%)',
                            boxShadow: '0 0 10px rgba(0, 168, 204, 0.4)',
                            transition: 'width 1s ease'
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Attendance Shortfalls List */}
        <div className="col-lg-6">
          <div className="glass-card p-4">
            <h5 className="fw-semibold text-white mb-4">Attendance Warnings (Below 75%)</h5>
            <div className="table-responsive" style={{ maxHeight: '290px' }}>
              {attendanceShortfall.length === 0 ? (
                <p className="text-secondary text-center small py-5 mb-0">No students are short of attendance.</p>
              ) : (
                <table className="table-glass">
                  <thead>
                    <tr>
                      <th className="text-start">Student Name</th>
                      <th>Student ID</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceShortfall.map((row, idx) => (
                      <tr key={row.STUDENT_ID || idx}>
                        <td className="text-start fw-semibold text-white">{row.STUDENT_NAME || row.student_name}</td>
                        <td><code className="text-secondary">{row.STUDENT_ID || row.student_id}</code></td>
                        <td>
                          <span className="badge-glass badge-glass-danger">
                            {Number(row.ATTENDANCE_PERCENT || row.attendance_percent || 0).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Library Overdues List */}
        <div className="col-lg-6">
          <div className="glass-card p-4">
            <h5 className="fw-semibold text-white mb-4">Library Delays & Return Warnings</h5>
            <div className="table-responsive" style={{ maxHeight: '290px' }}>
              {libraryOverdue.length === 0 ? (
                <p className="text-secondary text-center small py-5 mb-0">No library books are currently overdue.</p>
              ) : (
                <table className="table-glass">
                  <thead>
                    <tr>
                      <th className="text-start">Borrower</th>
                      <th>Book Title</th>
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {libraryOverdue.map((row, idx) => (
                      <tr key={row.ISSUE_ID || idx}>
                        <td className="text-start">
                          <div className="fw-semibold text-white">{row.STUDENT_NAME || row.student_name}</div>
                          <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>ID: {row.STUDENT_ID}</div>
                        </td>
                        <td className="small text-light">{row.TITLE}</td>
                        <td className="small text-secondary">
                          {row.DUE_DATE ? new Date(row.DUE_DATE).toLocaleDateString() : ''}
                        </td>
                        <td>
                          <span className={`badge-glass ${row.STATUS === 'Overdue' ? 'badge-glass-danger' : 'badge-glass-warning'}`}>
                            {row.STATUS}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Exam Timetable */}
        <div className="col-lg-6">
          <div className="glass-card p-4">
            <h5 className="fw-semibold text-white mb-4">Exam Schedules Overview</h5>
            <div className="table-responsive" style={{ maxHeight: '290px' }}>
              {examTimetable.length === 0 ? (
                <p className="text-secondary text-center small py-5 mb-0">No exams scheduled for the current cycle.</p>
              ) : (
                <table className="table-glass">
                  <thead>
                    <tr>
                      <th className="text-start">Course</th>
                      <th>Section</th>
                      <th>Date</th>
                      <th>Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examTimetable.map((row, idx) => (
                      <tr key={row.SCHEDULE_ID || idx}>
                        <td className="text-start">
                          <div className="fw-semibold text-white">{row.COURSE_CODE}</div>
                          <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>{row.COURSE_TITLE}</div>
                        </td>
                        <td><code className="text-info">{row.SECTION_ID}</code></td>
                        <td className="small text-light">
                          {row.EXAM_DATE ? new Date(row.EXAM_DATE).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                        </td>
                        <td>
                          <span className="badge-glass badge-glass-info">{row.EXAM_ROOM || 'Main Hall'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
