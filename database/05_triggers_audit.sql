SET DEFINE OFF;

CREATE OR REPLACE TRIGGER trg_AfterEnrollment
AFTER INSERT ON enrollments
FOR EACH ROW
BEGIN
  UPDATE sections SET available_seats = available_seats - 1 WHERE section_id = :NEW.section_id;
END;
/

CREATE OR REPLACE TRIGGER trg_PreventDuplicateEnrollment
BEFORE INSERT ON enrollments
FOR EACH ROW
DECLARE
  l_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO l_count FROM enrollments WHERE student_id = :NEW.student_id AND section_id = :NEW.section_id;
  IF l_count > 0 THEN
    RAISE_APPLICATION_ERROR(-20004, 'Duplicate enrollment is not allowed.');
  END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_AfterGradeInsert
AFTER INSERT OR UPDATE ON grades
FOR EACH ROW
DECLARE
  l_student_id NUMBER;
  l_cgpa NUMBER;
BEGIN
  SELECT e.student_id INTO l_student_id FROM enrollments e WHERE e.enrollment_id = :NEW.enrollment_id;
  l_cgpa := fn_CalculateCGPA(l_student_id);
  UPDATE results r SET r.cgpa = l_cgpa WHERE r.student_id = l_student_id;
END;
/

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
