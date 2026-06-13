SET DEFINE OFF;

CREATE OR REPLACE VIEW vw_StudentDashboard AS
SELECT s.student_id,
       s.first_name || ' ' || s.last_name AS student_name,
       fn_CalculateCGPA(s.student_id) AS cgpa,
       fn_GetAttendancePercentage(s.student_id) AS attendance_percent,
       fn_GetOutstandingFee(s.student_id) AS outstanding_fees
  FROM students s;
/

CREATE OR REPLACE VIEW vw_FacultyCourseLoad AS
SELECT sec.section_id,
       c.course_code,
       c.course_title,
       sec.semester,
       sec.year,
       sec.capacity,
       sec.available_seats,
       f.faculty_id,
       f.first_name || ' ' || f.last_name AS faculty_name
  FROM sections sec
  JOIN courses c ON sec.course_id = c.course_id
  JOIN faculty f ON sec.faculty_id = f.faculty_id;
/

CREATE OR REPLACE VIEW vw_DepartmentEnrollmentSummary AS
SELECT d.dept_id,
       d.dept_name,
       COUNT(e.enrollment_id) AS enrollments,
       COUNT(DISTINCT s.student_id) AS students
  FROM enrollments e
  JOIN sections sec ON e.section_id = sec.section_id
  JOIN courses c ON sec.course_id = c.course_id
  JOIN departments d ON c.department_id = d.dept_id
  JOIN students s ON e.student_id = s.student_id
 GROUP BY d.dept_id, d.dept_name;
/

CREATE OR REPLACE VIEW vw_FeeDefaulters AS
SELECT s.student_id,
       s.first_name || ' ' || s.last_name AS student_name,
       fn_GetOutstandingFee(s.student_id) AS outstanding_fees
  FROM students s
 WHERE fn_GetOutstandingFee(s.student_id) > 0;
/

CREATE OR REPLACE VIEW vw_AttendanceShortfall AS
SELECT s.student_id,
       s.first_name || ' ' || s.last_name AS student_name,
       fn_GetAttendancePercentage(s.student_id) AS attendance_percent
  FROM students s
 WHERE fn_GetAttendancePercentage(s.student_id) < 75;
/

CREATE OR REPLACE VIEW vw_LibraryOverdue AS
SELECT li.issue_id,
       s.student_id,
       s.first_name || ' ' || s.last_name AS student_name,
       i.title,
       li.due_date,
       li.return_date,
       CASE WHEN li.return_date IS NULL AND li.due_date < SYSDATE THEN 'Overdue' ELSE 'Current' END AS status
  FROM library_issues li
  JOIN library_items i ON li.item_id = i.item_id
  JOIN students s ON li.student_id = s.student_id;
/

CREATE OR REPLACE VIEW vw_ExamTimetable AS
SELECT es.schedule_id,
       c.course_code,
       c.course_title,
       sec.section_id,
       es.exam_date,
       es.exam_type,
       es.exam_room
  FROM exam_schedule es
  JOIN courses c ON es.course_id = c.course_id
  JOIN sections sec ON es.section_id = sec.section_id;
/

CREATE OR REPLACE VIEW vw_ResultCard AS
SELECT s.student_id,
       s.first_name || ' ' || s.last_name AS student_name,
       c.course_code,
       c.course_title,
       g.grade_value,
       g.letter_grade,
       g.grade_points,
       sec.semester,
       sec.year
  FROM grades g
  JOIN enrollments e ON g.enrollment_id = e.enrollment_id
  JOIN students s ON e.student_id = s.student_id
  JOIN sections sec ON e.section_id = sec.section_id
  JOIN courses c ON sec.course_id = c.course_id;
/

CREATE OR REPLACE VIEW vw_SemesterAttendanceMatrix AS
SELECT *
  FROM (
    SELECT s.student_id,
           sec.semester,
           fn_GetAttendancePercentage(s.student_id) attendance_percent
      FROM students s
      JOIN enrollments e ON s.student_id = e.student_id
      JOIN sections sec ON e.section_id = sec.section_id
  )
  PIVOT (
    MAX(attendance_percent) FOR semester IN ('Spring' AS spring, 'Fall' AS fall, 'Summer' AS summer)
  );
/

CREATE INDEX idx_enroll_student ON enrollments(student_id);
CREATE INDEX idx_enroll_course ON enrollments(section_id);
CREATE INDEX idx_fee_payment_date ON fee_payments(payment_date);
CREATE INDEX idx_library_return_date ON library_issues(return_date);
CREATE INDEX idx_attendance_student_date ON attendance_records(enrollment_id, attendance_date);
CREATE INDEX idx_library_overdue ON library_issues(item_id) WHERE return_date IS NULL;
CREATE INDEX idx_enrollment_cover ON enrollments(student_id, section_id, status);

BEGIN
  EXECUTE IMMEDIATE 'CREATE INDEX idx_library_text ON library_items(title, author) INDEXTYPE IS CTXSYS.CONTEXT';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -955 THEN
      RAISE;
    END IF;
END;
/

CREATE SEQUENCE attendance_records_seq START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE grades_seq START WITH 1 INCREMENT BY 1 NOCACHE;
