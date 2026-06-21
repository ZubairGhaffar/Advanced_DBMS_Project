import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const EnrolledCourses = () => {
  const [courses, setCourses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resCourses, resAttendance] = await Promise.all([
          api.get('/student/enrolled-courses'),
          api.get('/student/detailed-attendance')
        ]);
        setCourses(resCourses.data || []);
        setAttendance(resAttendance.data || []);
        if (resCourses.data && resCourses.data.length > 0) {
          setSelectedCourse(resCourses.data[0]);
        }
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
          <span className="visually-hidden">Loading courses...</span>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="container mt-5">
        <div className="glass-card text-center p-5">
          <h3>No Enrolled Courses Found</h3>
          <p className="text-secondary">You haven't enrolled in any courses for the current semester yet.</p>
          <a href="/student/register" className="btn btn-glass mt-3">Register Courses Now</a>
        </div>
      </div>
    );
  }

  // Filter attendance logs for the selected course
  const courseLogs = selectedCourse 
    ? attendance.filter(log => log.COURSE_CODE === selectedCourse.COURSE_CODE || log.course_code === selectedCourse.COURSE_CODE)
    : [];

  return (
    <div className="container mt-4 pb-5">
      <div className="mb-4">
        <h3 className="fw-bold text-white">My Courses & Attendance (Current Semester)</h3>
        <p className="text-secondary">View your active semester enrollments, contact instructors, and track daily attendance status.</p>
      </div>

      <div className="row gy-4">
        {/* Left Side: Course list cards */}
        <div className="col-lg-7">
          <div className="d-flex flex-column gap-3">
            {courses.map(course => {
              const code = course.COURSE_CODE || course.course_code;
              const title = course.COURSE_TITLE || course.course_title;
              const isSelected = selectedCourse && selectedCourse.SECTION_ID === course.SECTION_ID;
              const attPercent = Number(course.attendance_percent || 0);

              return (
                <div 
                  key={course.SECTION_ID}
                  onClick={() => setSelectedCourse(course)}
                  className={`glass-card p-3 text-start style-cursor-pointer border-1 ${isSelected ? 'border-primary shadow-glow' : 'border-white-5'}`}
                  style={{ cursor: 'pointer', transform: isSelected ? 'scale(1.02)' : 'scale(1)' }}
                >
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div>
                      <span className="badge-glass badge-glass-info mb-2">{code}</span>
                      <h5 className="fw-semibold text-white mb-1">{title}</h5>
                      <p className="text-secondary small mb-0">Instructor: <strong className="text-light">{course.INSTRUCTOR_NAME || course.instructor_name}</strong></p>
                    </div>

                    <div className="text-end">
                      <div className="small text-secondary mb-1">Attendance</div>
                      <div className={`h4 fw-bold mb-0 ${attPercent >= 75 ? 'text-success' : 'text-danger'}`}>
                        {attPercent.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="progress" style={{ height: '5px', background: 'rgba(255,255,255,0.05)' }}>
                      <div 
                        className={`progress-bar ${attPercent >= 75 ? 'bg-success' : 'bg-danger'}`} 
                        role="progressbar" 
                        style={{ width: `${attPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top border-white-5 text-secondary small">
                    <span>Schedule: <strong>{course.SCHEDULE || course.schedule}</strong></span>
                    <span>Room: <strong>{course.ROOM || course.room || 'TBD'}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Course Syllabus, Instructor info & Detailed Attendance Logs */}
        <div className="col-lg-5">
          {selectedCourse && (
            <div className="d-flex flex-column gap-4">
              {/* Instructor Contact Details */}
              <div className="glass-card">
                <h5 className="fw-semibold text-white mb-4 border-bottom border-white-5 pb-2">Instructor Information</h5>
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div 
                    className="d-flex align-items-center justify-content-center text-white fw-bold rounded-circle"
                    style={{ 
                      width: '56px', 
                      height: '56px', 
                      background: 'linear-gradient(135deg, #00a8cc, #8c52ff)',
                      fontSize: '1.25rem'
                    }}
                  >
                    {(selectedCourse.INSTRUCTOR_NAME || selectedCourse.instructor_name || 'I').split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <h5 className="fw-semibold text-white mb-1">{selectedCourse.INSTRUCTOR_NAME || selectedCourse.instructor_name}</h5>
                    <p className="text-secondary small mb-0">{selectedCourse.INSTRUCTOR_DEPT || selectedCourse.instructor_dept || 'Department of CS'}</p>
                  </div>
                </div>

                <div className="stat-item">
                  <span className="text-secondary small">Email Address</span>
                  <a href={`mailto:${selectedCourse.INSTRUCTOR_EMAIL || selectedCourse.instructor_email}`} className="text-info text-decoration-none small">
                    {selectedCourse.INSTRUCTOR_EMAIL || selectedCourse.instructor_email}
                  </a>
                </div>
                <div className="stat-item">
                  <span className="text-secondary small">Term</span>
                  <span className="text-white small">{selectedCourse.SEMESTER || selectedCourse.semester} {selectedCourse.YEAR || selectedCourse.year}</span>
                </div>
                <div className="stat-item">
                  <span className="text-secondary small">Credit Hours</span>
                  <span className="text-white small">{selectedCourse.CREDIT_HOURS || selectedCourse.credit_hours} CH</span>
                </div>
              </div>

              {/* Attendance Timeline logs */}
              <div className="glass-card">
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-white-5 pb-2">
                  <h5 className="fw-semibold text-white mb-0">Detailed Attendance History</h5>
                  <span className="badge bg-secondary text-white small">{courseLogs.length} total classes</span>
                </div>

                {courseLogs.length === 0 ? (
                  <div className="text-center py-4 text-secondary small">
                    No attendance records listed for this course yet.
                  </div>
                ) : (
                  <div className="overflow-auto" style={{ maxHeight: '280px' }}>
                    <div className="d-flex flex-column gap-3 pe-2">
                      {courseLogs.map((log, index) => {
                        const dateStr = log.ATTENDANCE_DATE || log.attendance_date;
                        const status = log.STATUS || log.status;
                        const isPresent = status === 'Present';
                        const isLate = status === 'Late';

                        return (
                          <div key={log.ATTENDANCE_ID || index} className="d-flex justify-content-between align-items-center p-2 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <div className="d-flex align-items-center gap-2">
                              <span className={`small rounded-circle d-inline-block`} style={{ width: '8px', height: '8px', background: isPresent ? '#00e676' : isLate ? '#ffeb3b' : '#ff3d00' }}></span>
                              <span className="text-light small">Lec {log.LECTURE_NUMBER || log.lecture_number || 'N/A'}: {new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <span className={`badge-glass ${isPresent ? 'badge-glass-success' : isLate ? 'badge-glass-warning' : 'badge-glass-danger'}`}>
                              {status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrolledCourses;
