SET DEFINE OFF;

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
  p_out_receipt OUT VARCHAR2
) AS
  l_outstanding NUMBER;
BEGIN
  IF p_student_id IS NULL OR p_amount IS NULL OR p_method IS NULL THEN
    RAISE_APPLICATION_ERROR(-20001, 'Student ID, amount and payment method are required.');
  END IF;

  l_outstanding := fn_GetOutstandingFee(p_student_id);
  IF p_amount <= 0 THEN
    RAISE_APPLICATION_ERROR(-20006, 'Payment amount must be positive.');
  END IF;

  INSERT INTO fee_payments (student_id, amount, payment_method, reference, bank_account_raw, bank_account_encrypted)
  VALUES (p_student_id, p_amount, p_method, p_reference, p_bank_account, fn_encrypt_value(p_bank_account));

  p_out_receipt := 'RCPT-' || TO_CHAR(SYSDATE,'YYYYMMDDHH24MISS') || '-' || TO_CHAR(p_student_id);
  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE_APPLICATION_ERROR(-20010, 'Fee payment failed: ' || SQLERRM);
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
  p_json IN CLOB
) AS
BEGIN
  IF p_section_id IS NULL OR p_json IS NULL THEN
    RAISE_APPLICATION_ERROR(-20001, 'Section ID and attendance payload are required.');
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
  ON (ar.enrollment_id = src.enrollment_id AND TRUNC(ar.attendance_date)=TRUNC(SYSDATE))
  WHEN MATCHED THEN UPDATE SET ar.status = CASE WHEN src.present = 'true' THEN 'Present' ELSE 'Absent' END
  WHEN NOT MATCHED THEN INSERT (attendance_id, enrollment_id, attendance_date, status)
    VALUES (attendance_records_seq.NEXTVAL, src.enrollment_id, SYSDATE, CASE WHEN src.present = 'true' THEN 'Present' ELSE 'Absent' END);

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
           fn_GetOutstandingFee(p_student_id) AS outstanding_balance
      FROM fee_structures fs
      JOIN students s ON s.program_id = fs.program_id
      LEFT JOIN fee_payments fp ON fp.student_id = s.student_id
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
  OPEN p_cursor FOR l_sql USING p_department_id, '%' || p_keyword || '%';
END;
/
