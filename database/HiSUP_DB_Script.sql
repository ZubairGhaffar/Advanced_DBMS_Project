-- HiSUP_DB_Script.sql
-- Oracle 12c+ schema for HITEC Smart University Portal (HiSUP)
SET DEFINE OFF;

-- ===============================================
-- 0. Drop All Existing Objects (Clean State Setup)
-- ===============================================
BEGIN EXECUTE IMMEDIATE 'DROP TABLE audit_log CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE results CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE exam_schedule CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE hostel_allotments CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE hostels CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE library_issues CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE library_items CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE fee_payments CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE fee_structures CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE attendance_records CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE grades CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE enrollments CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE sections CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE courses CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE staff CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE faculty CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE students CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE user_accounts CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE programs CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE departments CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

BEGIN EXECUTE IMMEDIATE 'DROP VIEW vw_StudentDashboard'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP VIEW vw_AvailableCourses'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP VIEW vw_FacultySections'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP VIEW vw_SectionStudents'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP VIEW vw_FacultyWorkload'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP VIEW vw_FacultyCourseLoad'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP VIEW vw_DepartmentEnrollmentSummary'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP VIEW vw_FeeDefaulters'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP VIEW vw_AttendanceShortfall'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP VIEW vw_LibraryOverdue'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP VIEW vw_ExamTimetable'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP VIEW vw_ResultCard'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP VIEW vw_SemesterAttendanceMatrix'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE attendance_records_seq'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE grades_seq'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

BEGIN EXECUTE IMMEDIATE 'DROP FUNCTION fn_encrypt_value'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP FUNCTION fn_decrypt_value'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP FUNCTION fn_GetLetterGrade'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP FUNCTION fn_CalculateGradePoints'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP FUNCTION fn_GetOutstandingFee'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP FUNCTION fn_GetAttendancePercentage'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP FUNCTION fn_IsLibraryItemAvailable'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP FUNCTION fn_CalculateCGPA'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

BEGIN EXECUTE IMMEDIATE 'DROP PROCEDURE RegisterStudent'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP PROCEDURE EnrollInCourse'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP PROCEDURE ProcessFeePayment'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP PROCEDURE AuthenticateUser'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP PROCEDURE GenerateTranscriptPDF'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP PROCEDURE CalculateSemesterGPA'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP PROCEDURE MarkAttendance'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP PROCEDURE AllocateHostelRoom'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP PROCEDURE IssueLibraryBook'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP PROCEDURE ReturnLibraryBook'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP PROCEDURE AddExamResult'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP PROCEDURE GetStudentReport'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP PROCEDURE GetFacultyWorkload'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP PROCEDURE GetDepartmentEnrollment'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP PROCEDURE GenerateFeeSlip'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP PROCEDURE SearchCourses'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

BEGIN EXECUTE IMMEDIATE 'DROP ROLE db_student'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP ROLE db_faculty'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP ROLE db_admin'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP ROLE db_finance'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
COMMIT;

-- ***********************************************
-- 1. Tables and Types
-- ***********************************************
CREATE TABLE departments (
  dept_id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
  dept_name VARCHAR2(100) NOT NULL UNIQUE,
  dept_code VARCHAR2(20) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE TABLE programs (
  program_id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
  program_name VARCHAR2(150) NOT NULL,
  department_id NUMBER NOT NULL,
  duration_semesters NUMBER DEFAULT 8 NOT NULL,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT fk_program_dept FOREIGN KEY (department_id) REFERENCES departments(dept_id) ON DELETE CASCADE
);

CREATE TABLE user_accounts (
  user_id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
  email VARCHAR2(255) NOT NULL UNIQUE,
  password_hash VARCHAR2(4000),
  plain_password VARCHAR2(100),
  role VARCHAR2(20) NOT NULL CHECK (role IN ('Admin','Student','Faculty','Finance')),
  reference_id NUMBER,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE TABLE students (
  student_id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
  user_id NUMBER NOT NULL UNIQUE,
  first_name VARCHAR2(100) NOT NULL,
  last_name VARCHAR2(100) NOT NULL,
  email VARCHAR2(255) NOT NULL UNIQUE,
  cnic_raw VARCHAR2(25),
  cnic_encrypted RAW(2000),
  program_id NUMBER NOT NULL,
  admission_date DATE DEFAULT SYSDATE NOT NULL,
  status VARCHAR2(20) DEFAULT 'Active' NOT NULL,
  CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES user_accounts(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_student_program FOREIGN KEY (program_id) REFERENCES programs(program_id) ON DELETE SET NULL
);

CREATE TABLE faculty (
  faculty_id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
  user_id NUMBER NOT NULL UNIQUE,
  first_name VARCHAR2(100) NOT NULL,
  last_name VARCHAR2(100) NOT NULL,
  email VARCHAR2(255) NOT NULL UNIQUE,
  department_id NUMBER NOT NULL,
  bank_account_raw VARCHAR2(100),
  bank_account_encrypted RAW(2000),
  hire_date DATE DEFAULT SYSDATE NOT NULL,
  status VARCHAR2(20) DEFAULT 'Active' NOT NULL,
  CONSTRAINT fk_faculty_user FOREIGN KEY (user_id) REFERENCES user_accounts(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_faculty_dept FOREIGN KEY (department_id) REFERENCES departments(dept_id) ON DELETE SET NULL
);

CREATE TABLE staff (
  staff_id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
  user_id NUMBER UNIQUE,
  full_name VARCHAR2(200) NOT NULL,
  department_id NUMBER NOT NULL,
  role VARCHAR2(100) NOT NULL,
  hire_date DATE DEFAULT SYSDATE NOT NULL,
  CONSTRAINT fk_staff_user FOREIGN KEY (user_id) REFERENCES user_accounts(user_id) ON DELETE SET NULL,
  CONSTRAINT fk_staff_dept FOREIGN KEY (department_id) REFERENCES departments(dept_id) ON DELETE SET NULL
);

CREATE TABLE courses (
  course_id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
  course_code VARCHAR2(20) NOT NULL UNIQUE,
  course_title VARCHAR2(200) NOT NULL,
  credit_hours NUMBER NOT NULL CHECK (credit_hours BETWEEN 1 AND 5),
  department_id NUMBER NOT NULL,
  prerequisite_course_id NUMBER,
  description VARCHAR2(2000),
  CONSTRAINT fk_course_dept FOREIGN KEY (department_id) REFERENCES departments(dept_id) ON DELETE SET NULL,
  CONSTRAINT fk_course_prereq FOREIGN KEY (prerequisite_course_id) REFERENCES courses(course_id) ON DELETE SET NULL
);

CREATE TABLE sections (
  section_id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
  course_id NUMBER NOT NULL,
  faculty_id NUMBER NOT NULL,
  semester VARCHAR2(20) NOT NULL,
  year NUMBER NOT NULL,
  capacity NUMBER NOT NULL CHECK (capacity > 0),
  available_seats NUMBER NOT NULL,
  schedule VARCHAR2(200),
  room VARCHAR2(100),
  CONSTRAINT fk_section_course FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
  CONSTRAINT fk_section_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE SET NULL,
  CONSTRAINT chk_available_seats CHECK (available_seats >= 0)
);

CREATE TABLE enrollments (
  enrollment_id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
  student_id NUMBER NOT NULL,
  section_id NUMBER NOT NULL,
  enroll_date DATE DEFAULT SYSDATE NOT NULL,
  status VARCHAR2(20) DEFAULT 'Enrolled' NOT NULL,
  CONSTRAINT fk_enroll_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  CONSTRAINT fk_enroll_section FOREIGN KEY (section_id) REFERENCES sections(section_id) ON DELETE CASCADE,
  CONSTRAINT uq_enrollment_student_section UNIQUE (student_id, section_id)
);

CREATE TABLE grades (
  grade_id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
  enrollment_id NUMBER NOT NULL UNIQUE,
  grade_value VARCHAR2(2) NOT NULL,
  grade_points NUMBER NOT NULL,
  letter_grade VARCHAR2(2) NOT NULL,
  graded_on DATE DEFAULT SYSDATE NOT NULL,
  CONSTRAINT fk_grade_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(enrollment_id) ON DELETE CASCADE
);

CREATE TABLE attendance_records (
  attendance_id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
  enrollment_id NUMBER NOT NULL,
  lecture_number NUMBER NOT NULL CHECK (lecture_number BETWEEN 1 AND 16),
  attendance_date DATE DEFAULT SYSDATE NOT NULL,
  status VARCHAR2(20) DEFAULT 'Present' NOT NULL CHECK (status IN ('Present','Absent','Late')),
  CONSTRAINT fk_attendance_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(enrollment_id) ON DELETE CASCADE,
  CONSTRAINT uq_attendance_enroll_lecture UNIQUE (enrollment_id, lecture_number)
);

CREATE TABLE fee_structures (
  fee_id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
  program_id NUMBER NOT NULL,
  amount NUMBER NOT NULL CHECK (amount >= 0),
  semester VARCHAR2(20) NOT NULL,
  due_date DATE NOT NULL,
  CONSTRAINT fk_fee_program FOREIGN KEY (program_id) REFERENCES programs(program_id) ON DELETE CASCADE
);

CREATE TABLE fee_payments (
  payment_id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
  student_id NUMBER NOT NULL,
  amount NUMBER NOT NULL CHECK (amount >= 0),
  payment_method VARCHAR2(50) NOT NULL,
  payment_date DATE DEFAULT SYSDATE NOT NULL,
  reference VARCHAR2(200),
  bank_account_raw VARCHAR2(100),
  bank_account_encrypted RAW(2000),
  semester VARCHAR2(20) DEFAULT 'Fall' NOT NULL,
  status VARCHAR2(20) DEFAULT 'Pending' NOT NULL,
  CONSTRAINT fk_payment_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

CREATE TABLE library_items (
  item_id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
  title VARCHAR2(300) NOT NULL,
  author VARCHAR2(200) NOT NULL,
  isbn VARCHAR2(30) UNIQUE,
  item_type VARCHAR2(50) NOT NULL,
  total_copies NUMBER NOT NULL CHECK (total_copies >= 0),
  available_copies NUMBER NOT NULL CHECK (available_copies >= 0),
  publisher VARCHAR2(200),
  publish_year NUMBER,
  pages NUMBER,
  CONSTRAINT chk_copies CHECK (available_copies <= total_copies)
);

CREATE TABLE library_issues (
  issue_id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
  item_id NUMBER NOT NULL,
  student_id NUMBER NOT NULL,
  issue_date DATE DEFAULT SYSDATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE,
  fine_amount NUMBER DEFAULT 0 NOT NULL,
  status VARCHAR2(20) DEFAULT 'Issued' NOT NULL,
  CONSTRAINT fk_issue_item FOREIGN KEY (item_id) REFERENCES library_items(item_id) ON DELETE CASCADE,
  CONSTRAINT fk_issue_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

CREATE TABLE hostels (
  hostel_id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
  hostel_name VARCHAR2(150) NOT NULL UNIQUE,
  total_rooms NUMBER NOT NULL CHECK (total_rooms >= 0),
  available_rooms NUMBER NOT NULL CHECK (available_rooms >= 0)
);

CREATE TABLE hostel_allotments (
  allotment_id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
  student_id NUMBER NOT NULL,
  hostel_id NUMBER NOT NULL,
  room_number VARCHAR2(50) NOT NULL,
  start_date DATE DEFAULT SYSDATE NOT NULL,
  end_date DATE,
  status VARCHAR2(20) DEFAULT 'Allocated' NOT NULL,
  CONSTRAINT fk_allot_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  CONSTRAINT fk_allot_hostel FOREIGN KEY (hostel_id) REFERENCES hostels(hostel_id) ON DELETE CASCADE
);

CREATE TABLE exam_schedule (
  schedule_id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
  course_id NUMBER NOT NULL,
  section_id NUMBER NOT NULL,
  exam_date DATE NOT NULL,
  exam_type VARCHAR2(50) NOT NULL,
  exam_room VARCHAR2(100),
  CONSTRAINT fk_exam_course FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
  CONSTRAINT fk_exam_section FOREIGN KEY (section_id) REFERENCES sections(section_id) ON DELETE CASCADE
);

CREATE TABLE results (
  result_id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
  student_id NUMBER NOT NULL,
  course_id NUMBER NOT NULL,
  semester VARCHAR2(20) NOT NULL,
  year NUMBER NOT NULL,
  gpa NUMBER(5,2),
  cgpa NUMBER(5,2),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT fk_result_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  CONSTRAINT fk_result_course FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

CREATE TABLE audit_log (
  audit_id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
  table_name VARCHAR2(100) NOT NULL,
  operation VARCHAR2(20) NOT NULL,
  record_id VARCHAR2(100),
  old_values CLOB,
  new_values CLOB,
  changed_by VARCHAR2(200),
  changed_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

-- ***********************************************
-- 2. Helper Functions for Encryption and Grades
-- ***********************************************
CREATE OR REPLACE FUNCTION fn_encrypt_value(p_plain VARCHAR2) RETURN RAW IS
  l_raw RAW(32767);
BEGIN
  IF p_plain IS NULL THEN
    RETURN NULL;
  END IF;
  l_raw := UTL_I18N.STRING_TO_RAW(p_plain, 'AL32UTF8');
  RETURN UTL_ENCODE.BASE64_ENCODE(l_raw);
END;
/

CREATE OR REPLACE FUNCTION fn_decrypt_value(p_encrypted RAW) RETURN VARCHAR2 IS
  l_raw RAW(32767);
BEGIN
  IF p_encrypted IS NULL THEN
    RETURN NULL;
  END IF;
  l_raw := UTL_ENCODE.BASE64_DECODE(p_encrypted);
  RETURN UTL_I18N.RAW_TO_CHAR(l_raw,'AL32UTF8');
END;
/

CREATE OR REPLACE FUNCTION fn_GetLetterGrade(p_grade_value VARCHAR2) RETURN VARCHAR2 IS
  l_numeric NUMBER;
BEGIN
  l_numeric := TO_NUMBER(p_grade_value);
  IF l_numeric >= 90 THEN RETURN 'A+';
  ELSIF l_numeric >= 85 THEN RETURN 'A';
  ELSIF l_numeric >= 80 THEN RETURN 'A-';
  ELSIF l_numeric >= 75 THEN RETURN 'B+';
  ELSIF l_numeric >= 70 THEN RETURN 'B';
  ELSIF l_numeric >= 65 THEN RETURN 'B-';
  ELSIF l_numeric >= 60 THEN RETURN 'C+';
  ELSIF l_numeric >= 55 THEN RETURN 'C';
  ELSE RETURN 'F';
  END IF;
END;
/

CREATE OR REPLACE FUNCTION fn_CalculateGradePoints(p_grade_value VARCHAR2) RETURN NUMBER IS
  l_numeric NUMBER;
BEGIN
  l_numeric := TO_NUMBER(p_grade_value);
  IF l_numeric >= 90 THEN RETURN 4.0;
  ELSIF l_numeric >= 85 THEN RETURN 4.0;
  ELSIF l_numeric >= 80 THEN RETURN 3.7;
  ELSIF l_numeric >= 75 THEN RETURN 3.3;
  ELSIF l_numeric >= 70 THEN RETURN 3.0;
  ELSIF l_numeric >= 65 THEN RETURN 2.7;
  ELSIF l_numeric >= 60 THEN RETURN 2.3;
  ELSIF l_numeric >= 55 THEN RETURN 2.0;
  ELSE RETURN 0;
  END IF;
END;
/

CREATE OR REPLACE FUNCTION fn_GetOutstandingFee(p_student_id NUMBER) RETURN NUMBER IS
  l_total_due NUMBER;
  l_total_paid NUMBER;
BEGIN
  SELECT NVL(SUM(fs.amount),0)
    INTO l_total_due
    FROM fee_structures fs
    JOIN students s ON s.program_id = fs.program_id
   WHERE s.student_id = p_student_id;

  SELECT NVL(SUM(fp.amount),0)
    INTO l_total_paid
    FROM fee_payments fp
   WHERE fp.student_id = p_student_id
     AND fp.status IN ('Approved', 'Completed');

  RETURN GREATEST(l_total_due - l_total_paid, 0);
END;
/

CREATE OR REPLACE FUNCTION fn_GetSemesterOutstanding(p_student_id NUMBER, p_semester VARCHAR2) RETURN NUMBER IS
  l_due NUMBER;
  l_paid NUMBER;
BEGIN
  SELECT NVL(SUM(fs.amount),0)
    INTO l_due
    FROM fee_structures fs
    JOIN students s ON s.program_id = fs.program_id
   WHERE s.student_id = p_student_id
     AND fs.semester = p_semester;

  SELECT NVL(SUM(fp.amount),0)
    INTO l_paid
    FROM fee_payments fp
   WHERE fp.student_id = p_student_id
     AND fp.semester = p_semester
     AND fp.status IN ('Approved', 'Completed');

  RETURN GREATEST(l_due - l_paid, 0);
END;
/

CREATE OR REPLACE FUNCTION fn_GetAttendancePercentage(p_student_id NUMBER) RETURN NUMBER IS
  l_present NUMBER;
  l_total NUMBER;
BEGIN
  SELECT NVL(SUM(CASE WHEN ar.status = 'Present' THEN 1 ELSE 0 END),0), COUNT(*)
    INTO l_present, l_total
    FROM attendance_records ar
    JOIN enrollments e ON ar.enrollment_id = e.enrollment_id
   WHERE e.student_id = p_student_id;
  IF l_total = 0 THEN
    RETURN 0;
  END IF;
  RETURN ROUND((l_present / l_total) * 100, 2);
END;
/

CREATE OR REPLACE FUNCTION fn_IsLibraryItemAvailable(p_item_id NUMBER) RETURN VARCHAR2 IS
  l_available NUMBER;
BEGIN
  SELECT available_copies INTO l_available FROM library_items WHERE item_id = p_item_id;
  IF l_available > 0 THEN RETURN 'YES'; ELSE RETURN 'NO'; END IF;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN 'NO';
END;
/

CREATE OR REPLACE FUNCTION fn_CalculateCGPA(p_student_id NUMBER) RETURN NUMBER IS
  l_total_grade_credits NUMBER;
  l_total_credits NUMBER;
BEGIN
  SELECT NVL(SUM(g.grade_points * c.credit_hours), 0), NVL(SUM(c.credit_hours), 0)
    INTO l_total_grade_credits, l_total_credits
    FROM grades g
    JOIN enrollments e ON g.enrollment_id = e.enrollment_id
    JOIN sections sec ON e.section_id = sec.section_id
    JOIN courses c ON sec.course_id = c.course_id
   WHERE e.student_id = p_student_id;
  IF l_total_credits = 0 THEN
    RETURN 0;
  END IF;
  RETURN ROUND(l_total_grade_credits / l_total_credits, 2);
END;
/

-- ***********************************************
-- 6. Sequences for manual inserts used by MERGE and triggers (Created here so Stored Procedures can compile)
-- ***********************************************
CREATE SEQUENCE attendance_records_seq START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE grades_seq START WITH 1 INCREMENT BY 1 NOCACHE;

-- ***********************************************
-- 3. Stored Procedures
-- ***********************************************
CREATE OR REPLACE PROCEDURE RegisterStudent(
  p_first_name IN VARCHAR2,
  p_last_name IN VARCHAR2,
  p_email IN VARCHAR2,
  p_cnic IN VARCHAR2,
  p_program_id IN NUMBER,
  p_out_student_id OUT NUMBER
) AS
BEGIN
  IF p_first_name IS NULL OR p_last_name IS NULL OR p_email IS NULL OR p_program_id IS NULL THEN
    RAISE_APPLICATION_ERROR(-20001, 'First name, last name, email, and program are required.');
  END IF;

  INSERT INTO user_accounts(email, password_hash, role, reference_id)
  VALUES (p_email, 'PLACEHOLDER_HASH', 'Student', NULL)
  RETURNING user_id INTO p_out_student_id;

  INSERT INTO students(user_id, first_name, last_name, email, cnic_raw, cnic_encrypted, program_id)
  VALUES (p_out_student_id, p_first_name, p_last_name, p_email, p_cnic, fn_encrypt_value(p_cnic), p_program_id)
  RETURNING student_id INTO p_out_student_id;

  -- Ensure fee structure of 150000 exists for the program
  MERGE INTO fee_structures fs
  USING (SELECT p_program_id AS program_id, 'Fall' AS semester FROM dual) src
  ON (fs.program_id = src.program_id AND fs.semester = src.semester)
  WHEN MATCHED THEN
    UPDATE SET fs.amount = 150000
  WHEN NOT MATCHED THEN
    INSERT (program_id, amount, semester, due_date)
    VALUES (src.program_id, 150000, src.semester, ADD_MONTHS(SYSDATE, 1));
EXCEPTION
  WHEN DUP_VAL_ON_INDEX THEN
    RAISE_APPLICATION_ERROR(-20002, 'A student or email already exists.');
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE;
END;
/

CREATE OR REPLACE PROCEDURE EnrollInCourse(
  p_student_id IN NUMBER,
  p_section_id IN NUMBER
) AS
  l_available NUMBER;
  l_enrollments NUMBER;
BEGIN
  IF p_student_id IS NULL OR p_section_id IS NULL THEN
    RAISE_APPLICATION_ERROR(-20001, 'Student ID and section ID are required.');
  END IF;

  SELECT available_seats INTO l_available FROM sections WHERE section_id = p_section_id FOR UPDATE;
  IF l_available <= 0 THEN
    RAISE_APPLICATION_ERROR(-20003, 'No seats available in this section.');
  END IF;

  SELECT COUNT(*) INTO l_enrollments FROM enrollments WHERE student_id = p_student_id AND section_id = p_section_id;
  IF l_enrollments > 0 THEN
    RAISE_APPLICATION_ERROR(-20004, 'Student already enrolled in this section.');
  END IF;

  INSERT INTO enrollments (student_id, section_id) VALUES (p_student_id, p_section_id);
  UPDATE sections SET available_seats = available_seats - 1 WHERE section_id = p_section_id;

  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    IF SQLCODE = -20003 OR SQLCODE = -20004 THEN
      RAISE;
    ELSE
      RAISE_APPLICATION_ERROR(-20005, 'Enrollment failed: ' || SQLERRM);
    END IF;
END;
/

CREATE OR REPLACE PROCEDURE ProcessFeePayment(
  p_student_id IN NUMBER,
  p_amount IN NUMBER,
  p_method IN VARCHAR2,
  p_reference IN VARCHAR2,
  p_bank_account IN VARCHAR2,
  p_semester IN VARCHAR2,
  p_out_receipt OUT VARCHAR2
) AS
  l_outstanding NUMBER;
BEGIN
  IF p_student_id IS NULL OR p_amount IS NULL OR p_method IS NULL OR p_semester IS NULL THEN
    RAISE_APPLICATION_ERROR(-20001, 'Student ID, amount, payment method and semester are required.');
  END IF;

  l_outstanding := fn_GetOutstandingFee(p_student_id);
  IF p_amount <= 0 THEN
    RAISE_APPLICATION_ERROR(-20006, 'Payment amount must be positive.');
  END IF;

  INSERT INTO fee_payments (student_id, amount, payment_method, reference, bank_account_raw, bank_account_encrypted, semester)
  VALUES (p_student_id, p_amount, p_method, p_reference, p_bank_account, fn_encrypt_value(p_bank_account), p_semester);

  p_out_receipt := 'RCPT-' || TO_CHAR(SYSDATE,'YYYYMMDDHH24MISS') || '-' || TO_CHAR(p_student_id);
  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE_APPLICATION_ERROR(-20010, 'Fee payment failed: ' || SQLERRM);
END;
/

CREATE OR REPLACE PROCEDURE AuthenticateUser(
  p_email IN VARCHAR2,
  p_password IN VARCHAR2,
  p_role OUT VARCHAR2,
  p_refid OUT VARCHAR2
) AS
BEGIN
  SELECT role, reference_id
    INTO p_role, p_refid
    FROM user_accounts
   WHERE LOWER(TRIM(email)) = LOWER(TRIM(p_email))
     AND (
       NVL(TRIM(plain_password),'') = TRIM(p_password)
       OR NVL(TRIM(password_hash),'') = TRIM(p_password)
     );
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RAISE_APPLICATION_ERROR(-20001, 'Invalid email or password');
END;
/

CREATE OR REPLACE PROCEDURE GenerateTranscriptPDF(
  p_student_id IN NUMBER,
  p_out_pdf OUT BLOB
) AS
  l_report VARCHAR2(32767);
  l_blob BLOB;
  l_dest_offset INTEGER := 1;
  l_src_offset INTEGER := 1;
BEGIN
  IF p_student_id IS NULL THEN
    RAISE_APPLICATION_ERROR(-20001, 'Student ID required.');
  END IF;

  SELECT 'Transcript for Student ' || s.first_name || ' ' || s.last_name || CHR(10) ||
         'CGPA: ' || fn_CalculateCGPA(p_student_id) || CHR(10) ||
         'Outstanding Fees: ' || fn_GetOutstandingFee(p_student_id)
    INTO l_report
    FROM students s
   WHERE s.student_id = p_student_id;

  DBMS_LOB.CREATETEMPORARY(l_blob, TRUE);
  DBMS_LOB.WRITE(l_blob, LENGTH(l_report), 1, UTL_I18N.STRING_TO_RAW(l_report, 'AL32UTF8'));
  p_out_pdf := l_blob;
END;
/

CREATE OR REPLACE PROCEDURE CalculateSemesterGPA(
  p_student_id IN NUMBER,
  p_semester IN VARCHAR2,
  p_out_gpa OUT NUMBER
) AS
BEGIN
  SELECT ROUND(NVL(SUM(g.grade_points)/NULLIF(COUNT(*),0),0),2)
    INTO p_out_gpa
    FROM grades g
    JOIN enrollments e ON g.enrollment_id = e.enrollment_id
    JOIN sections s ON e.section_id = s.section_id
   WHERE e.student_id = p_student_id AND s.semester = p_semester;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    p_out_gpa := 0;
END;
/

CREATE OR REPLACE PROCEDURE MarkAttendance(
  p_section_id IN NUMBER,
  p_lecture_number IN NUMBER,
  p_json IN CLOB
) AS
BEGIN
  IF p_section_id IS NULL OR p_lecture_number IS NULL OR p_json IS NULL THEN
    RAISE_APPLICATION_ERROR(-20001, 'Section ID, lecture number, and attendance payload are required.');
  END IF;

  MERGE INTO attendance_records ar
  USING (
    SELECT e.enrollment_id, jt.student_id, jt.present
      FROM enrollments e
      JOIN JSON_TABLE(p_json, '$[*]' COLUMNS (
        student_id NUMBER PATH '$.studentID',
        present VARCHAR2(5) PATH '$.present'
      )) jt ON e.student_id = jt.student_id
     WHERE e.section_id = p_section_id
  ) src
  ON (ar.enrollment_id = src.enrollment_id AND ar.lecture_number = p_lecture_number)
  WHEN MATCHED THEN UPDATE SET ar.status = CASE WHEN src.present = 'true' THEN 'Present' ELSE 'Absent' END, ar.attendance_date = SYSDATE
  WHEN NOT MATCHED THEN INSERT (attendance_id, enrollment_id, lecture_number, attendance_date, status)
    VALUES (attendance_records_seq.NEXTVAL, src.enrollment_id, p_lecture_number, SYSDATE, CASE WHEN src.present = 'true' THEN 'Present' ELSE 'Absent' END);

  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE_APPLICATION_ERROR(-20020, 'MarkAttendance failed: ' || SQLERRM);
END;
/

CREATE OR REPLACE PROCEDURE AllocateHostelRoom(
  p_student_id IN NUMBER,
  p_hostel_id IN NUMBER,
  p_room_number IN VARCHAR2,
  p_out_allotment_id OUT NUMBER
) AS
  l_available NUMBER;
BEGIN
  IF p_student_id IS NULL OR p_hostel_id IS NULL OR p_room_number IS NULL THEN
    RAISE_APPLICATION_ERROR(-20001, 'Student, hostel and room are required.');
  END IF;
  SELECT available_rooms INTO l_available FROM hostels WHERE hostel_id = p_hostel_id FOR UPDATE;
  IF l_available <= 0 THEN
    RAISE_APPLICATION_ERROR(-20030, 'No rooms available in the selected hostel.');
  END IF;

  INSERT INTO hostel_allotments(student_id, hostel_id, room_number)
  VALUES (p_student_id, p_hostel_id, p_room_number)
  RETURNING allotment_id INTO p_out_allotment_id;

  UPDATE hostels SET available_rooms = available_rooms - 1 WHERE hostel_id = p_hostel_id;
  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE_APPLICATION_ERROR(-20031, 'Hostel allocation failed: ' || SQLERRM);
END;
/

CREATE OR REPLACE PROCEDURE IssueLibraryBook(
  p_item_id IN NUMBER,
  p_student_id IN NUMBER,
  p_due_date IN DATE,
  p_out_issue_id OUT NUMBER
) AS
  l_available NUMBER;
BEGIN
  IF p_item_id IS NULL OR p_student_id IS NULL OR p_due_date IS NULL THEN
    RAISE_APPLICATION_ERROR(-20001, 'Item, student and due date are required.');
  END IF;

  SELECT available_copies INTO l_available FROM library_items WHERE item_id = p_item_id FOR UPDATE;
  IF l_available <= 0 THEN
    RAISE_APPLICATION_ERROR(-20040, 'No copies available.');
  END IF;

  INSERT INTO library_issues(item_id, student_id, due_date)
  VALUES (p_item_id, p_student_id, p_due_date)
  RETURNING issue_id INTO p_out_issue_id;

  UPDATE library_items SET available_copies = available_copies - 1 WHERE item_id = p_item_id;
  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE_APPLICATION_ERROR(-20041, 'IssueLibraryBook failed: ' || SQLERRM);
END;
/

CREATE OR REPLACE PROCEDURE ReturnLibraryBook(
  p_issue_id IN NUMBER,
  p_out_fine OUT NUMBER
) AS
  l_item_id NUMBER;
  l_due_date DATE;
  l_fine NUMBER := 0;
BEGIN
  IF p_issue_id IS NULL THEN
    RAISE_APPLICATION_ERROR(-20001, 'Issue ID is required.');
  END IF;

  SELECT item_id, due_date INTO l_item_id, l_due_date FROM library_issues WHERE issue_id = p_issue_id FOR UPDATE;
  l_fine := GREATEST(0, TRUNC(SYSDATE - l_due_date)) * 20;

  UPDATE library_issues SET return_date = SYSDATE, fine_amount = l_fine, status = 'Returned' WHERE issue_id = p_issue_id;
  UPDATE library_items SET available_copies = available_copies + 1 WHERE item_id = l_item_id;

  p_out_fine := l_fine;
  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE_APPLICATION_ERROR(-20042, 'ReturnLibraryBook failed: ' || SQLERRM);
END;
/

CREATE OR REPLACE PROCEDURE AddExamResult(
  p_section_id IN NUMBER,
  p_json IN CLOB
) AS
BEGIN
  MERGE INTO grades g
  USING (
    SELECT jt.enrollment_id, jt.grade_value, jt.grade_points, jt.letter_grade
      FROM JSON_TABLE(p_json, '$[*]' COLUMNS (
        enrollment_id NUMBER PATH '$.enrollmentID',
        grade_value VARCHAR2(10) PATH '$.grade',
        grade_points NUMBER PATH '$.points',
        letter_grade VARCHAR2(5) PATH '$.letterGrade'
      )) jt
  ) src
  ON (g.enrollment_id = src.enrollment_id)
  WHEN MATCHED THEN
    UPDATE SET g.grade_value = src.grade_value,
               g.grade_points = src.grade_points,
               g.letter_grade = src.letter_grade,
               g.graded_on = SYSDATE
  WHEN NOT MATCHED THEN
    INSERT (grade_id, enrollment_id, grade_value, grade_points, letter_grade)
    VALUES (grades_seq.NEXTVAL, src.enrollment_id, src.grade_value, src.grade_points, src.letter_grade);

  DELETE FROM grades g
   WHERE g.enrollment_id IN (
     SELECT e.enrollment_id FROM enrollments e WHERE e.section_id = p_section_id
   )
     AND g.enrollment_id NOT IN (
       SELECT enrollment_id FROM JSON_TABLE(p_json, '$[*]' COLUMNS (enrollment_id NUMBER PATH '$.enrollmentID'))
     );

  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE_APPLICATION_ERROR(-20050, 'AddExamResult failed: ' || SQLERRM);
END;
/

CREATE OR REPLACE PROCEDURE GetStudentReport(
  p_student_id IN NUMBER,
  p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
  OPEN p_cursor FOR
    SELECT s.student_id,
           s.first_name || ' ' || s.last_name AS student_name,
           c.course_code,
           c.course_title,
           g.grade_value,
           g.letter_grade,
           g.grade_points
      FROM grades g
      JOIN enrollments e ON g.enrollment_id = e.enrollment_id
      JOIN sections sec ON e.section_id = sec.section_id
      JOIN courses c ON sec.course_id = c.course_id
      JOIN students s ON e.student_id = s.student_id
     WHERE s.student_id = p_student_id;
END;
/

CREATE OR REPLACE PROCEDURE GetFacultyWorkload(
  p_faculty_id IN NUMBER,
  p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
  OPEN p_cursor FOR
    SELECT sec.section_id,
           c.course_code,
           c.course_title,
           sec.semester,
           sec.year,
           sec.capacity,
           sec.available_seats,
           COUNT(e.enrollment_id) AS enrolled_students,
           RANK() OVER (ORDER BY COUNT(e.enrollment_id) DESC) AS workload_rank
      FROM sections sec
      JOIN courses c ON sec.course_id = c.course_id
      LEFT JOIN enrollments e ON sec.section_id = e.section_id
     WHERE sec.faculty_id = p_faculty_id
     GROUP BY sec.section_id, c.course_code, c.course_title, sec.semester, sec.year, sec.capacity, sec.available_seats;
END;
/

CREATE OR REPLACE PROCEDURE GetDepartmentEnrollment(
  p_department_id IN NUMBER,
  p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
  OPEN p_cursor FOR
    SELECT d.dept_name,
           COUNT(e.enrollment_id) AS total_enrollments,
           COUNT(DISTINCT s.student_id) AS unique_students
      FROM enrollments e
      JOIN sections sec ON e.section_id = sec.section_id
      JOIN courses c ON sec.course_id = c.course_id
      JOIN departments d ON c.department_id = d.dept_id
      JOIN students s ON e.student_id = s.student_id
     WHERE d.dept_id = p_department_id
     GROUP BY d.dept_name;
END;
/

CREATE OR REPLACE PROCEDURE GenerateFeeSlip(
  p_student_id IN NUMBER,
  p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
  OPEN p_cursor FOR
    SELECT fs.semester,
           fs.amount,
           fp.payment_date,
           fp.amount AS paid_amount,
           fn_GetSemesterOutstanding(p_student_id, fs.semester) AS outstanding_balance,
           fp.status AS payment_status
      FROM fee_structures fs
      JOIN students s ON s.program_id = fs.program_id
      LEFT JOIN fee_payments fp ON fp.student_id = s.student_id AND fp.semester = fs.semester
     WHERE s.student_id = p_student_id;
END;
/

CREATE OR REPLACE PROCEDURE SearchCourses(
  p_department_id IN NUMBER,
  p_keyword IN VARCHAR2,
  p_cursor OUT SYS_REFCURSOR
) AS
  l_sql VARCHAR2(4000);
BEGIN
  l_sql := 'SELECT course_id, course_code, course_title, credit_hours FROM courses WHERE 1=1';
  IF p_department_id IS NOT NULL THEN
    l_sql := l_sql || ' AND department_id = :dept';
  END IF;
  IF p_keyword IS NOT NULL THEN
    l_sql := l_sql || ' AND (LOWER(course_title) LIKE LOWER(:keyword) OR LOWER(course_code) LIKE LOWER(:keyword))';
  END IF;

  IF p_department_id IS NOT NULL AND p_keyword IS NOT NULL THEN
    OPEN p_cursor FOR l_sql USING p_department_id, '%' || p_keyword || '%', '%' || p_keyword || '%';
  ELSIF p_department_id IS NOT NULL THEN
    OPEN p_cursor FOR l_sql USING p_department_id;
  ELSIF p_keyword IS NOT NULL THEN
    OPEN p_cursor FOR l_sql USING '%' || p_keyword || '%', '%' || p_keyword || '%';
  ELSE
    OPEN p_cursor FOR l_sql;
  END IF;
END;
/

-- ***********************************************
-- 4. Views
-- ***********************************************
CREATE OR REPLACE VIEW vw_StudentDashboard AS
SELECT s.student_id,
       s.first_name || ' ' || s.last_name AS student_name,
       fn_CalculateCGPA(s.student_id) AS cgpa,
       fn_GetAttendancePercentage(s.student_id) AS attendance_percent,
       fn_GetOutstandingFee(s.student_id) AS outstanding_fees
  FROM students s;
/

CREATE OR REPLACE VIEW vw_AvailableCourses AS
SELECT st.student_id,
       sec.section_id,
       c.course_code,
       c.course_title,
       sec.semester || ' ' || sec.year AS term,
       sec.available_seats,
       f.first_name || ' ' || f.last_name AS faculty_name,
       c.course_code || ' - ' || c.course_title || ' (' || sec.semester || ' ' || sec.year || ')' AS section_name
  FROM sections sec
  JOIN courses c ON sec.course_id = c.course_id
  JOIN faculty f ON sec.faculty_id = f.faculty_id
  JOIN students st ON 1=1
 WHERE NOT EXISTS (
   SELECT 1 FROM enrollments e WHERE e.student_id = st.student_id AND e.section_id = sec.section_id
 );
/

CREATE OR REPLACE VIEW vw_FacultySections AS
SELECT sec.section_id,
       sec.faculty_id,
       f.first_name || ' ' || f.last_name AS faculty_name,
       c.course_code,
       c.course_title,
       sec.semester,
       sec.year,
       sec.capacity,
       sec.available_seats,
       c.course_code || ' - ' || c.course_title || ' (' || sec.semester || ' ' || sec.year || ')' AS section_name
  FROM sections sec
  JOIN courses c ON sec.course_id = c.course_id
  JOIN faculty f ON sec.faculty_id = f.faculty_id;
/

CREATE OR REPLACE VIEW vw_SectionStudents AS
SELECT e.enrollment_id,
       e.section_id,
       s.student_id,
       s.first_name || ' ' || s.last_name AS student_name
  FROM enrollments e
  JOIN students s ON e.student_id = s.student_id;
/

CREATE OR REPLACE VIEW vw_FacultyWorkload AS
SELECT sec.faculty_id,
       sec.section_id,
       c.course_code,
       c.course_title,
       c.course_code || ' - ' || c.course_title AS course_name,
       sec.semester || ' ' || sec.year AS term,
       sec.capacity,
       sec.available_seats,
       COUNT(e.enrollment_id) AS enrolled_students,
       RANK() OVER (PARTITION BY sec.faculty_id ORDER BY COUNT(e.enrollment_id) DESC) AS workload_rank
  FROM sections sec
  JOIN courses c ON sec.course_id = c.course_id
  LEFT JOIN enrollments e ON sec.section_id = e.section_id
 GROUP BY sec.faculty_id, sec.section_id, c.course_code, c.course_title, sec.semester, sec.year, sec.capacity, sec.available_seats;
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
 WHERE fn_GetAttendancePercentage(s.student_id) < 75
   AND EXISTS (
     SELECT 1 
       FROM enrollments e 
      WHERE e.student_id = s.student_id 
        AND e.status = 'Enrolled'
   );
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
       c.credit_hours,
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

-- ***********************************************
-- 5. Indexes
-- ***********************************************
CREATE INDEX idx_enroll_student ON enrollments(student_id);
CREATE INDEX idx_enroll_course ON enrollments(section_id);
CREATE INDEX idx_fee_payment_date ON fee_payments(payment_date);
CREATE INDEX idx_library_return_date ON library_issues(return_date);
CREATE INDEX idx_attendance_student_date ON attendance_records(enrollment_id, attendance_date);
CREATE INDEX idx_enrollment_cover ON enrollments(student_id, section_id, status);

-- Create virtual column for library full text and oracle text index on it
BEGIN
  BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE library_items ADD (library_text VARCHAR2(1000) GENERATED ALWAYS AS (title || '' '' || author) VIRTUAL)';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLCODE NOT IN (-01430, -00955) THEN
        RAISE;
      END IF;
  END;
  BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX idx_library_text ON library_items(library_text) INDEXTYPE IS CTXSYS.CONTEXT';
  EXCEPTION
    WHEN OTHERS THEN
      NULL; -- Ignore index creation failures (e.g. virtual columns, missing CTXSYS)
  END;
END;
/

-- Sequences moved before Stored Procedures to allow compilation

-- ***********************************************
-- 7. Triggers and Audit
-- ***********************************************
-- Triggers trg_AfterEnrollment, trg_PreventDuplicateEnrollment, and trg_AfterGradeInsert are omitted because logic is handled in stored procedures and constraints.
CREATE OR REPLACE TRIGGER trg_AfterFeePayment
AFTER INSERT ON fee_payments
FOR EACH ROW
BEGIN
  INSERT INTO audit_log(table_name, operation, record_id, old_values, new_values, changed_by)
  VALUES ('FEE_PAYMENTS', 'INSERT', :NEW.payment_id, NULL, 'amount=' || :NEW.amount || ', method=' || :NEW.payment_method, SYS_CONTEXT('USERENV','SESSION_USER'));
END;
/
CREATE OR REPLACE TRIGGER trg_AuditStudentChanges
AFTER INSERT OR UPDATE OR DELETE ON students
FOR EACH ROW
DECLARE
  v_op VARCHAR2(10);
BEGIN
  IF INSERTING THEN
    v_op := 'INSERT';
  ELSIF UPDATING THEN
    v_op := 'UPDATE';
  ELSE
    v_op := 'DELETE';
  END IF;
  INSERT INTO audit_log(table_name, operation, record_id, old_values, new_values, changed_by)
  VALUES (
    'STUDENTS',
    v_op,
    NVL(TO_CHAR(:OLD.student_id), TO_CHAR(:NEW.student_id)),
    CASE WHEN :OLD.student_id IS NOT NULL THEN 'name=' || :OLD.first_name || ' ' || :OLD.last_name ELSE NULL END,
    CASE WHEN :NEW.student_id IS NOT NULL THEN 'name=' || :NEW.first_name || ' ' || :NEW.last_name ELSE NULL END,
    SYS_CONTEXT('USERENV','SESSION_USER')
  );
END;
/
CREATE OR REPLACE TRIGGER trg_AuditGradeChanges
AFTER INSERT OR UPDATE OR DELETE ON grades
FOR EACH ROW
DECLARE
  v_op VARCHAR2(10);
BEGIN
  IF INSERTING THEN
    v_op := 'INSERT';
  ELSIF UPDATING THEN
    v_op := 'UPDATE';
  ELSE
    v_op := 'DELETE';
  END IF;
  INSERT INTO audit_log(table_name, operation, record_id, old_values, new_values, changed_by)
  VALUES (
    'GRADES',
    v_op,
    NVL(TO_CHAR(:OLD.grade_id), TO_CHAR(:NEW.grade_id)),
    CASE WHEN :OLD.grade_id IS NOT NULL THEN 'grade=' || :OLD.grade_value ELSE NULL END,
    CASE WHEN :NEW.grade_id IS NOT NULL THEN 'grade=' || :NEW.grade_value ELSE NULL END,
    SYS_CONTEXT('USERENV','SESSION_USER')
  );
END;
/
CREATE OR REPLACE TRIGGER trg_AuditFeePaymentChanges
AFTER INSERT OR UPDATE OR DELETE ON fee_payments
FOR EACH ROW
DECLARE
  v_op VARCHAR2(10);
BEGIN
  IF INSERTING THEN
    v_op := 'INSERT';
  ELSIF UPDATING THEN
    v_op := 'UPDATE';
  ELSE
    v_op := 'DELETE';
  END IF;
  INSERT INTO audit_log(table_name, operation, record_id, old_values, new_values, changed_by)
  VALUES (
    'FEE_PAYMENTS',
    v_op,
    NVL(TO_CHAR(:OLD.payment_id), TO_CHAR(:NEW.payment_id)),
    CASE WHEN :OLD.payment_id IS NOT NULL THEN 'amount=' || :OLD.amount ELSE NULL END,
    CASE WHEN :NEW.payment_id IS NOT NULL THEN 'amount=' || :NEW.amount ELSE NULL END,
    SYS_CONTEXT('USERENV','SESSION_USER')
  );
END;
/
CREATE OR REPLACE TRIGGER trg_AfterLibraryReturn
AFTER UPDATE OF return_date ON library_issues
FOR EACH ROW
WHEN (NEW.return_date IS NOT NULL)
BEGIN
  UPDATE library_items SET available_copies = available_copies + 1 WHERE item_id = :NEW.item_id;
END;
/
-- ***********************************************
-- 8. Row-Level Security Policies (Oracle VPD)
-- ***********************************************
CREATE OR REPLACE FUNCTION fn_rls_policy(p_schema VARCHAR2, p_object VARCHAR2) RETURN VARCHAR2 IS
  l_identifier VARCHAR2(200) := SYS_CONTEXT('USERENV','CLIENT_IDENTIFIER');
  l_role VARCHAR2(50);
  l_refid VARCHAR2(100);
BEGIN
  IF l_identifier IS NULL THEN
    RETURN '1 = 0';
  END IF;
  l_role := SUBSTR(l_identifier, 1, INSTR(l_identifier, ':') - 1);
  l_refid := SUBSTR(l_identifier, INSTR(l_identifier, ':') + 1);

  IF p_object = 'ENROLLMENTS' THEN
    IF l_role = 'Student' THEN
      RETURN 'student_id = ' || l_refid;
    ELSIF l_role = 'Admin' OR l_role = 'Finance' OR l_role = 'Faculty' THEN
      RETURN '1=1';
    ELSE
      RETURN '1 = 0';
    END IF;
  ELSIF p_object = 'FEE_PAYMENTS' THEN
    IF l_role = 'Student' THEN
      RETURN 'student_id = ' || l_refid;
    ELSIF l_role = 'Admin' OR l_role = 'Finance' THEN
      RETURN '1=1';
    ELSE
      RETURN '1 = 0';
    END IF;
  ELSIF p_object = 'GRADES' THEN
    IF l_role = 'Student' THEN
      RETURN 'enrollment_id IN (SELECT enrollment_id FROM enrollments WHERE student_id = ' || l_refid || ')';
    ELSIF l_role = 'Admin' OR l_role = 'Finance' OR l_role = 'Faculty' THEN
      RETURN '1=1';
    ELSE
      RETURN '1 = 0';
    END IF;
  ELSIF p_object = 'SECTIONS' THEN
    IF l_role = 'Faculty' THEN
      RETURN 'faculty_id = ' || l_refid;
    ELSIF l_role = 'Admin' OR l_role = 'Student' OR l_role = 'Finance' THEN
      RETURN '1=1';
    ELSE
      RETURN '1 = 0';
    END IF;
  ELSE
    RETURN '1=1';
  END IF;
END;
/

BEGIN
  DBMS_RLS.ADD_POLICY(
    object_schema => USER,
    object_name => 'ENROLLMENTS',
    policy_name => 'POL_ENROLLMENTS_VPD',
    function_schema => USER,
    policy_function => 'fn_rls_policy',
    statement_types => 'SELECT'
  );
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -24010 THEN
      RAISE;
    END IF;
END;
/
BEGIN
  DBMS_RLS.ADD_POLICY(
    object_schema => USER,
    object_name => 'GRADES',
    policy_name => 'POL_GRADES_VPD',
    function_schema => USER,
    policy_function => 'fn_rls_policy',
    statement_types => 'SELECT'
  );
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -24010 THEN
      RAISE;
    END IF;
END;
/
BEGIN
  DBMS_RLS.ADD_POLICY(
    object_schema => USER,
    object_name => 'FEE_PAYMENTS',
    policy_name => 'POL_FEES_VPD',
    function_schema => USER,
    policy_function => 'fn_rls_policy',
    statement_types => 'SELECT'
  );
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -24010 THEN
      RAISE;
    END IF;
END;
/
BEGIN
  DBMS_RLS.ADD_POLICY(
    object_schema => USER,
    object_name => 'SECTIONS',
    policy_name => 'POL_SECTIONS_VPD',
    function_schema => USER,
    policy_function => 'fn_rls_policy',
    statement_types => 'SELECT'
  );
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -24010 THEN
      RAISE;
    END IF;
END;
/
-- ***********************************************
-- 9. Roles and Grants
-- ***********************************************
CREATE ROLE db_student;
CREATE ROLE db_faculty;
CREATE ROLE db_admin;
CREATE ROLE db_finance;

GRANT CONNECT TO db_student, db_faculty, db_admin, db_finance;
GRANT EXECUTE ON AuthenticateUser TO db_student, db_faculty, db_admin, db_finance;
GRANT EXECUTE ON RegisterStudent TO db_student, db_admin;
GRANT EXECUTE ON EnrollInCourse TO db_student, db_admin;
GRANT EXECUTE ON ProcessFeePayment TO db_student, db_finance, db_admin;
GRANT EXECUTE ON GenerateTranscriptPDF TO db_student, db_admin;
GRANT EXECUTE ON CalculateSemesterGPA TO db_faculty, db_admin;
GRANT EXECUTE ON MarkAttendance TO db_faculty, db_admin;
GRANT EXECUTE ON AllocateHostelRoom TO db_admin;
GRANT EXECUTE ON IssueLibraryBook TO db_student, db_admin;
GRANT EXECUTE ON ReturnLibraryBook TO db_student, db_admin;
GRANT EXECUTE ON AddExamResult TO db_faculty, db_admin;
GRANT EXECUTE ON GetStudentReport TO db_student, db_admin;
GRANT EXECUTE ON GetFacultyWorkload TO db_faculty, db_admin;
GRANT EXECUTE ON GetDepartmentEnrollment TO db_admin;
GRANT EXECUTE ON GenerateFeeSlip TO db_student, db_finance, db_admin;
GRANT EXECUTE ON SearchCourses TO db_student, db_faculty, db_admin, db_finance;

GRANT SELECT ON vw_StudentDashboard TO db_student, db_admin;
GRANT SELECT ON vw_AvailableCourses TO db_student, db_admin;
GRANT SELECT ON vw_FacultySections TO db_faculty, db_admin;
GRANT SELECT ON vw_SectionStudents TO db_faculty, db_admin;
GRANT SELECT ON vw_FacultyWorkload TO db_faculty, db_admin;
GRANT SELECT ON vw_FacultyCourseLoad TO db_faculty, db_admin;
GRANT SELECT ON vw_DepartmentEnrollmentSummary TO db_admin;
GRANT SELECT ON vw_FeeDefaulters TO db_finance, db_admin;
GRANT SELECT ON vw_AttendanceShortfall TO db_admin;
GRANT SELECT ON vw_LibraryOverdue TO db_student, db_admin;
GRANT SELECT ON vw_ExamTimetable TO db_admin;
GRANT SELECT ON vw_ResultCard TO db_student, db_admin;

GRANT SELECT, INSERT, UPDATE, DELETE ON audit_log TO db_admin, db_finance;

COMMIT;

-- ***********************************************
-- 10. Seed Data
-- ***********************************************
INSERT INTO departments(dept_name, dept_code) VALUES ('Computer Science', 'CS');
INSERT INTO departments(dept_name, dept_code) VALUES ('Business Administration', 'BA');
INSERT INTO programs(program_name, department_id, duration_semesters) VALUES ('BS Computer Science', 1, 8);
INSERT INTO programs(program_name, department_id, duration_semesters) VALUES ('BBA', 2, 8);

INSERT INTO user_accounts(email, plain_password, password_hash, role, reference_id) VALUES ('student1@hitec.edu.pk', 'password', 'hashedpass1', 'Student', 1);
INSERT INTO user_accounts(email, plain_password, password_hash, role, reference_id) VALUES ('faculty1@hitec.edu.pk', 'password', 'hashedpass2', 'Faculty', 1);
INSERT INTO user_accounts(email, plain_password, password_hash, role, reference_id) VALUES ('finance@hitec.edu.pk', 'password', 'hashedpass3', 'Finance', 1);
INSERT INTO user_accounts(email, plain_password, password_hash, role, reference_id) VALUES ('admin@hitec.edu.pk', 'password', 'hashedpass4', 'Admin', 1);

INSERT INTO students(user_id, first_name, last_name, email, cnic_raw, cnic_encrypted, program_id) VALUES (1, 'Ali', 'Khan', 'student1@hitec.edu.pk', '12345-1234567-1', fn_encrypt_value('12345-1234567-1'), 1);
INSERT INTO faculty(user_id, first_name, last_name, email, department_id, bank_account_raw, bank_account_encrypted) VALUES (2, 'Dr. Sara', 'Ahmed', 'faculty1@hitec.edu.pk', 1, 'Bank123', fn_encrypt_value('Bank123'));
INSERT INTO fee_structures(program_id, amount, semester, due_date) VALUES (1, 150000, 'Fall', ADD_MONTHS(SYSDATE, 1));
INSERT INTO courses(course_code, course_title, credit_hours, department_id) VALUES ('CS101', 'Introduction to Computer Science', 3, 1);
INSERT INTO sections(course_id, faculty_id, semester, year, capacity, available_seats, schedule, room) VALUES (1, 1, 'Fall', 2025, 30, 30, 'Mon-Wed 10:00-11:30', 'R101');

-- Seed Hostels (from 07_extra_seed.sql)
INSERT INTO hostels (hostel_name, total_rooms, available_rooms) VALUES ('Jinnah Hall', 100, 100);
INSERT INTO hostels (hostel_name, total_rooms, available_rooms) VALUES ('Iqbal Hall', 80, 80);
INSERT INTO hostels (hostel_name, total_rooms, available_rooms) VALUES ('Fatima Hall', 120, 120);

-- Seed Library Books (from 07_extra_seed.sql and 06_security_and_seed.sql)
INSERT INTO library_items (title, author, isbn, item_type, total_copies, available_copies, publisher, publish_year, pages)
VALUES ('Modern Operating Systems', 'Andrew S. Tanenbaum', '9780133591620', 'Book', 10, 10, 'Pearson', 2014, 1136);
INSERT INTO library_items (title, author, isbn, item_type, total_copies, available_copies, publisher, publish_year, pages)
VALUES ('Database System Concepts', 'Abraham Silberschatz', '9780073523323', 'Book', 8, 8, 'McGraw-Hill', 2010, 1376);
INSERT INTO library_items (title, author, isbn, item_type, total_copies, available_copies, publisher, publish_year, pages)
VALUES ('Computer Networking', 'James Kurose', '9780133594140', 'Book', 6, 6, 'Pearson', 2016, 864);
INSERT INTO library_items(title, author, isbn, item_type, total_copies, available_copies, publisher, publish_year, pages)
VALUES ('Clean Code','Robert C. Martin','9780132350884','Book',5,4,'Prentice Hall',2008,464);
INSERT INTO library_items(title, author, isbn, item_type, total_copies, available_copies, publisher, publish_year, pages)
VALUES ('Design Patterns','Erich Gamma','9780201633610','Book',3,3,'Addison-Wesley',1994,395);
INSERT INTO library_items(title, author, isbn, item_type, total_copies, available_copies, publisher, publish_year, pages)
VALUES ('Introduction to Algorithms','Cormen','9780262033848','Book',4,4,'MIT Press',2009,1312);

-- Seed courses CS102..CS110 (from 06_security_and_seed.sql)
INSERT INTO courses(course_code, course_title, credit_hours, department_id) VALUES ('CS102','Data Structures',3,1);
INSERT INTO courses(course_code, course_title, credit_hours, department_id) VALUES ('CS103','Algorithms',3,1);
INSERT INTO courses(course_code, course_title, credit_hours, department_id) VALUES ('CS104','Databases',3,1);
INSERT INTO courses(course_code, course_title, credit_hours, department_id) VALUES ('CS105','Operating Systems',3,1);
INSERT INTO courses(course_code, course_title, credit_hours, department_id) VALUES ('CS106','Computer Networks',3,1);
INSERT INTO courses(course_code, course_title, credit_hours, department_id) VALUES ('CS107','Software Engineering',3,1);
INSERT INTO courses(course_code, course_title, credit_hours, department_id) VALUES ('CS108','Web Development',3,1);
INSERT INTO courses(course_code, course_title, credit_hours, department_id) VALUES ('CS109','Machine Learning',3,1);
INSERT INTO courses(course_code, course_title, credit_hours, department_id) VALUES ('CS110','Security',3,1);

-- Create sections taught by faculty1 (from 06_security_and_seed.sql)
INSERT INTO sections(course_id, faculty_id, semester, year, capacity, available_seats, schedule, room)
VALUES ((SELECT course_id FROM courses WHERE course_code='CS102'), 1, 'Fall', 2025, 40, 40, 'Mon-Wed 09:00-10:30','R102');
INSERT INTO sections(course_id, faculty_id, semester, year, capacity, available_seats, schedule, room)
VALUES ((SELECT course_id FROM courses WHERE course_code='CS103'), 1, 'Fall', 2025, 40, 40, 'Tue-Thu 09:00-10:30','R103');
INSERT INTO sections(course_id, faculty_id, semester, year, capacity, available_seats, schedule, room)
VALUES ((SELECT course_id FROM courses WHERE course_code='CS104'), 1, 'Fall', 2025, 40, 40, 'Mon-Wed 11:00-12:30','R104');
INSERT INTO sections(course_id, faculty_id, semester, year, capacity, available_seats, schedule, room)
VALUES ((SELECT course_id FROM courses WHERE course_code='CS105'), 1, 'Fall', 2025, 40, 40, 'Tue-Thu 11:00-12:30','R105');
INSERT INTO sections(course_id, faculty_id, semester, year, capacity, available_seats, schedule, room)
VALUES ((SELECT course_id FROM courses WHERE course_code='CS106'), 1, 'Fall', 2025, 40, 40, 'Fri 10:00-13:00','R106');
INSERT INTO sections(course_id, faculty_id, semester, year, capacity, available_seats, schedule, room)
VALUES ((SELECT course_id FROM courses WHERE course_code='CS107'), 1, 'Fall', 2025, 40, 40, 'Mon 14:00-17:00','R107');
INSERT INTO sections(course_id, faculty_id, semester, year, capacity, available_seats, schedule, room)
VALUES ((SELECT course_id FROM courses WHERE course_code='CS108'), 1, 'Fall', 2025, 40, 40, 'Tue 14:00-17:00','R108');
INSERT INTO sections(course_id, faculty_id, semester, year, capacity, available_seats, schedule, room)
VALUES ((SELECT course_id FROM courses WHERE course_code='CS109'), 1, 'Fall', 2025, 40, 40, 'Wed 14:00-17:00','R109');
INSERT INTO sections(course_id, faculty_id, semester, year, capacity, available_seats, schedule, room)
VALUES ((SELECT course_id FROM courses WHERE course_code='CS110'), 1, 'Fall', 2025, 40, 40, 'Thu 14:00-17:00','R110');

-- Enroll student1 into CS101..CS110 sections (from 06_security_and_seed.sql)
INSERT INTO enrollments(student_id, section_id)
SELECT 1, s.section_id
FROM sections s
JOIN courses c ON s.course_id = c.course_id
WHERE c.course_code LIKE 'CS10%';

-- Create multiple attendance records for student1 (lectures 1, 2, and 3) (from 06_security_and_seed.sql)
INSERT INTO attendance_records(enrollment_id, lecture_number, attendance_date, status)
SELECT e.enrollment_id, d.lec_num, d.att_date, CASE WHEN MOD(ROWNUM,5)=0 THEN 'Absent' ELSE 'Present' END
FROM enrollments e
JOIN (
	SELECT 1 AS lec_num, TO_DATE('2025-09-01','YYYY-MM-DD') AS att_date FROM dual UNION ALL
	SELECT 2 AS lec_num, TO_DATE('2025-09-03','YYYY-MM-DD') FROM dual UNION ALL
	SELECT 3 AS lec_num, TO_DATE('2025-09-05','YYYY-MM-DD') FROM dual
) d ON 1=1
WHERE e.student_id = 1;

-- Insert grades for enrollments (from 06_security_and_seed.sql)
INSERT INTO grades(enrollment_id, grade_value, grade_points, letter_grade)
SELECT e.enrollment_id,
			 CASE WHEN ROWNUM=1 THEN '95' WHEN ROWNUM=2 THEN '88' WHEN ROWNUM=3 THEN '76' WHEN ROWNUM=4 THEN '82' WHEN ROWNUM=5 THEN '69' WHEN ROWNUM=6 THEN '91' WHEN ROWNUM=7 THEN '85' WHEN ROWNUM=8 THEN '78' WHEN ROWNUM=9 THEN '92' ELSE '80' END,
			 CASE WHEN ROWNUM IN (1,6,9) THEN 4.0 WHEN ROWNUM IN (2,7) THEN 3.7 WHEN ROWNUM IN (3,8) THEN 3.3 WHEN ROWNUM=4 THEN 3.0 WHEN ROWNUM=5 THEN 2.7 ELSE 3.0 END,
			 CASE WHEN ROWNUM IN (1,6,9) THEN 'A+' WHEN ROWNUM IN (2,7) THEN 'A' WHEN ROWNUM IN (3,8) THEN 'B+' WHEN ROWNUM=4 THEN 'B' WHEN ROWNUM=5 THEN 'B-' ELSE 'B' END
FROM enrollments e
WHERE e.student_id = 1;

-- Multiple fee payments for student1 (from 06_security_and_seed.sql)
INSERT INTO fee_payments(student_id, amount, payment_method, payment_date, reference, status)
VALUES (1, 50000, 'Card', TO_DATE('2025-08-15','YYYY-MM-DD'), 'FP001', 'Completed');
INSERT INTO fee_payments(student_id, amount, payment_method, payment_date, reference, status)
VALUES (1, 50000, 'Bank Transfer', TO_DATE('2025-09-10','YYYY-MM-DD'), 'FP002', 'Completed');
INSERT INTO fee_payments(student_id, amount, payment_method, payment_date, reference, status)
VALUES (1, 50000, 'Cash', SYSDATE, 'FP003', 'Completed');

-- Add library issues for student1 (from 06_security_and_seed.sql)
INSERT INTO library_issues(item_id, student_id, issue_date, due_date, status)
VALUES ((SELECT item_id FROM library_items WHERE isbn='9780132350884'), 1, SYSDATE-10, SYSDATE+4, 'Issued');
INSERT INTO library_issues(item_id, student_id, issue_date, due_date, status)
VALUES ((SELECT item_id FROM library_items WHERE isbn='9780201633610'), 1, SYSDATE-30, SYSDATE-16, 'Returned');

-- Schedule exams (from 06_security_and_seed.sql)
INSERT INTO exam_schedule(course_id, section_id, exam_date, exam_type, exam_room)
SELECT c.course_id, s.section_id, TO_DATE('2025-12-10','YYYY-MM-DD') + ROWNUM, 'Final', 'Main Hall'
FROM courses c JOIN sections s ON c.course_id = s.course_id
WHERE c.course_code LIKE 'CS10%';

COMMIT;

-- ***********************************************
-- End of script
-- ***********************************************
