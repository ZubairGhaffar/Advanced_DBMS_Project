SET DEFINE OFF;

CREATE ROLE db_student;
CREATE ROLE db_faculty;
CREATE ROLE db_admin;
CREATE ROLE db_finance;

GRANT CONNECT TO db_student, db_faculty, db_admin, db_finance;
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
GRANT SELECT ON vw_FacultyCourseLoad TO db_faculty, db_admin;
GRANT SELECT ON vw_DepartmentEnrollmentSummary TO db_admin;
GRANT SELECT ON vw_FeeDefaulters TO db_finance, db_admin;
GRANT SELECT ON vw_AttendanceShortfall TO db_admin;
GRANT SELECT ON vw_LibraryOverdue TO db_admin;
GRANT SELECT ON vw_ExamTimetable TO db_admin;
GRANT SELECT ON vw_ResultCard TO db_student, db_admin;

GRANT SELECT, INSERT, UPDATE, DELETE ON audit_log TO db_admin, db_finance;

COMMIT;

INSERT INTO departments(dept_name, dept_code) VALUES ('Computer Science', 'CS');
INSERT INTO departments(dept_name, dept_code) VALUES ('Business Administration', 'BA');
INSERT INTO programs(program_name, department_id, duration_semesters) VALUES ('BS Computer Science', 1, 8);
INSERT INTO programs(program_name, department_id, duration_semesters) VALUES ('BBA', 2, 8);

INSERT INTO user_accounts(email, password_hash, role, reference_id) VALUES ('student1@hitec.edu.pk', 'hashedpass1', 'Student', 1);
INSERT INTO user_accounts(email, password_hash, role, reference_id) VALUES ('faculty1@hitec.edu.pk', 'hashedpass2', 'Faculty', 1);
INSERT INTO user_accounts(email, password_hash, role, reference_id) VALUES ('finance@hitec.edu.pk', 'hashedpass3', 'Finance', 1);
INSERT INTO user_accounts(email, password_hash, role, reference_id) VALUES ('admin@hitec.edu.pk', 'hashedpass4', 'Admin', 1);

INSERT INTO students(user_id, first_name, last_name, email, cnic_raw, cnic_encrypted, program_id) VALUES (1, 'Ali', 'Khan', 'student1@hitec.edu.pk', '12345-1234567-1', fn_encrypt_value('12345-1234567-1'), 1);
INSERT INTO faculty(user_id, first_name, last_name, email, department_id, bank_account_raw, bank_account_encrypted) VALUES (2, 'Dr. Sara', 'Ahmed', 'faculty1@hitec.edu.pk', 1, 'Bank123', fn_encrypt_value('Bank123'));
INSERT INTO fee_structures(program_id, amount, semester, due_date) VALUES (1, 150000, 'Fall', ADD_MONTHS(SYSDATE, 1));
INSERT INTO courses(course_code, course_title, credit_hours, department_id) VALUES ('CS101', 'Introduction to Computer Science', 3, 1);
INSERT INTO sections(course_id, faculty_id, semester, year, capacity, available_seats, schedule, room) VALUES (1, 1, 'Fall', 2025, 30, 30, 'Mon-Wed 10:00-11:30', 'R101');

COMMIT;
