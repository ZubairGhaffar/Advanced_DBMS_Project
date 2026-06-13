SET DEFINE OFF;

CREATE OR REPLACE FUNCTION fn_encrypt_value(p_plain VARCHAR2) RETURN RAW IS
  l_key RAW(32) := UTL_RAW.CAST_TO_RAW('HisupSecretPassphrase2025');
BEGIN
  IF p_plain IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN DBMS_CRYPTO.ENCRYPT(UTL_I18N.STRING_TO_RAW(p_plain, 'AL32UTF8'),
           DBMS_CRYPTO.DES_CBC_PKCS5,
           l_key,
           UTL_RAW.CAST_TO_RAW('InitVect'));
END;
/

CREATE OR REPLACE FUNCTION fn_decrypt_value(p_encrypted RAW) RETURN VARCHAR2 IS
  l_key RAW(32) := UTL_RAW.CAST_TO_RAW('HisupSecretPassphrase2025');
BEGIN
  IF p_encrypted IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN UTL_I18N.RAW_TO_CHAR(DBMS_CRYPTO.DECRYPT(p_encrypted,
           DBMS_CRYPTO.DES_CBC_PKCS5,
           l_key,
           UTL_RAW.CAST_TO_RAW('InitVect')),'AL32UTF8');
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
   WHERE fp.student_id = p_student_id;

  RETURN GREATEST(l_total_due - l_total_paid, 0);
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
  l_total_points NUMBER;
  l_count NUMBER;
BEGIN
  SELECT NVL(SUM(g.grade_points),0), COUNT(*)
    INTO l_total_points, l_count
    FROM grades g
    JOIN enrollments e ON g.enrollment_id = e.enrollment_id
   WHERE e.student_id = p_student_id;
  IF l_count = 0 THEN
    RETURN 0;
  END IF;
  RETURN ROUND(l_total_points / l_count, 2);
END;
/
