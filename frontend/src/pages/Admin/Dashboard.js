import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const AdminDashboard = () => {
  const [deptEnroll, setDeptEnroll] = useState([]);
  const [attendanceShortfall, setAttendanceShortfall] = useState([]);
  const [examTimetable, setExamTimetable] = useState([]);
  const [libraryOverdue, setLibraryOverdue] = useState([]);

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
      }
    };
    loadData();
  }, []);

  return (
    <div className="container mt-4">
      <h3>Admin Dashboard</h3>
      <div className="row gy-4">
        <div className="col-md-6">
          <div className="card p-3">
            <h5>Department Enrollment</h5>
            <table className="table table-sm table-striped">
              <thead><tr><th>Department</th><th>Enrollments</th><th>Students</th></tr></thead>
              <tbody>
                {deptEnroll.map(row => (
                  <tr key={row.DEPT_ID}>
                    <td>{row.DEPT_NAME}</td>
                    <td>{row.ENROLLMENTS}</td>
                    <td>{row.STUDENTS}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-3">
            <h5>Attendance Shortfall</h5>
            <table className="table table-sm table-striped">
              <thead><tr><th>Student</th><th>Percentage</th></tr></thead>
              <tbody>
                {attendanceShortfall.map(row => (
                  <tr key={row.STUDENT_ID}>
                    <td>{row.STUDENT_NAME}</td>
                    <td>{row.ATTENDANCE_PERCENT}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-3">
            <h5>Library Overdue</h5>
            <table className="table table-sm table-striped">
              <thead><tr><th>Issue ID</th><th>Student</th><th>Title</th><th>Due Date</th><th>Status</th></tr></thead>
              <tbody>
                {libraryOverdue.map(row => (
                  <tr key={row.ISSUE_ID}>
                    <td>{row.ISSUE_ID}</td>
                    <td>{row.STUDENT_NAME}</td>
                    <td>{row.TITLE}</td>
                    <td>{row.DUE_DATE ? new Date(row.DUE_DATE).toLocaleDateString() : ''}</td>
                    <td>{row.STATUS}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-12">
          <div className="card p-3">
            <h5>Exam Timetable</h5>
            <table className="table table-sm table-striped">
              <thead><tr><th>Course</th><th>Section</th><th>Date</th><th>Type</th><th>Room</th></tr></thead>
              <tbody>
                {examTimetable.map(row => (
                  <tr key={row.SCHEDULE_ID}>
                    <td>{row.COURSE_CODE} - {row.COURSE_TITLE}</td>
                    <td>{row.SECTION_ID}</td>
                    <td>{row.EXAM_DATE ? new Date(row.EXAM_DATE).toLocaleDateString() : ''}</td>
                    <td>{row.EXAM_TYPE}</td>
                    <td>{row.EXAM_ROOM}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
