const oracledb = require('oracledb');
const oracle = require('../utils/oracleHelper');

// Existing functions
exports.getDepartmentEnrollment = async (req, res) => {
  const departmentID = req.query.departmentID ? Number(req.query.departmentID) : null;
  try {
    const result = departmentID
      ? await oracle.execute('SELECT * FROM vw_DepartmentEnrollmentSummary WHERE dept_id = :id', { id: departmentID }, { outFormat: oracledb.OUT_FORMAT_OBJECT })
      : await oracle.execute('SELECT * FROM vw_DepartmentEnrollmentSummary', {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.json(result.rows);
  } catch (err) {
    console.error('Department enrollment error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAttendanceShortfall = async (req, res) => {
  try {
    const result = await oracle.execute('SELECT * FROM vw_AttendanceShortfall', {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.json(result.rows);
  } catch (err) {
    console.error('Attendance shortfall error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getLibraryOverdue = async (req, res) => {
  try {
    const result = await oracle.execute('SELECT * FROM vw_LibraryOverdue', {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.json(result.rows);
  } catch (err) {
    console.error('Library overdue error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getExamTimetable = async (req, res) => {
  try {
    const result = await oracle.execute('SELECT * FROM vw_ExamTimetable', {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.json(result.rows);
  } catch (err) {
    console.error('Exam timetable error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getResultCard = async (req, res) => {
  const studentID = req.query.studentID ? Number(req.query.studentID) : null;
  if (!studentID) return res.status(400).json({ message: 'studentID required' });

  try {
    const result = await oracle.execute('SELECT * FROM vw_ResultCard WHERE student_id = :id', { id: studentID }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.json(result.rows);
  } catch (err) {
    console.error('Result card error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.allocateHostel = async (req, res) => {
  const { studentID, hostelID, roomNumber } = req.body;
  if (!studentID || !hostelID || !roomNumber) return res.status(400).json({ message: 'studentID, hostelID and roomNumber are required' });

  const conn = await oracle.getConnection();
  try {
    const result = await conn.execute(
      `BEGIN AllocateHostelRoom(:p_studentID, :p_hostelID, :p_roomNumber, :p_out_allotment_id); END;`,
      {
        p_studentID: Number(studentID),
        p_hostelID: Number(hostelID),
        p_roomNumber: roomNumber,
        p_out_allotment_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    return res.json({ allotmentID: result.outBinds.p_out_allotment_id });
  } catch (err) {
    console.error('Allocate hostel error', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  } finally {
    try { await conn.close(); } catch (closeErr) { console.error('Connection close failed', closeErr); }
  }
};

// --- NEW CRUD ENDPOINTS FOR STUDENT MANAGEMENT SYSTEM ---

// Departments & Programs
exports.getDepartments = async (req, res) => {
  try {
    const result = await oracle.execute('SELECT dept_id, dept_name, dept_code FROM departments ORDER BY dept_name', {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.json(result.rows);
  } catch (err) {
    console.error('getDepartments error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getPrograms = async (req, res) => {
  try {
    const result = await oracle.execute('SELECT program_id, program_name, department_id, duration_semesters FROM programs ORDER BY program_name', {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.json(result.rows);
  } catch (err) {
    console.error('getPrograms error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Students Management
exports.getStudents = async (req, res) => {
  try {
    const query = `
      SELECT s.student_id, s.user_id, s.first_name, s.last_name, s.email, s.cnic_raw AS cnic, 
             s.program_id, p.program_name, s.admission_date, s.status
      FROM students s
      LEFT JOIN programs p ON s.program_id = p.program_id
      ORDER BY s.student_id DESC
    `;
    const result = await oracle.execute(query, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.json(result.rows);
  } catch (err) {
    console.error('getStudents error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getStudentDetails = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: 'Student ID required' });

  try {
    // 1. Get basic info
    const infoSql = `
      SELECT s.student_id, s.first_name, s.last_name, s.email, s.cnic_raw AS cnic, 
             s.program_id, p.program_name, s.admission_date, s.status,
             fn_CalculateCGPA(s.student_id) AS cgpa,
             fn_GetAttendancePercentage(s.student_id) AS attendance_percent,
             fn_GetOutstandingFee(s.student_id) AS outstanding_fees
      FROM students s
      LEFT JOIN programs p ON s.program_id = p.program_id
      WHERE s.student_id = :id
    `;
    const infoRes = await oracle.execute(infoSql, { id: Number(id) }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    if (!infoRes.rows.length) return res.status(404).json({ message: 'Student not found' });

    // 2. Get enrollments and grades
    const enrollSql = `
      SELECT e.enrollment_id, e.section_id, c.course_code, c.course_title, 
             sec.semester, sec.year, g.grade_value, g.letter_grade, g.grade_points
      FROM enrollments e
      JOIN sections sec ON e.section_id = sec.section_id
      JOIN courses c ON sec.course_id = c.course_id
      LEFT JOIN grades g ON e.enrollment_id = g.enrollment_id
      WHERE e.student_id = :id
    `;
    const enrollRes = await oracle.execute(enrollSql, { id: Number(id) }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    // 3. Get fee payments
    const paymentsSql = `
      SELECT payment_id, amount, payment_method, payment_date, reference, status
      FROM fee_payments
      WHERE student_id = :id
      ORDER BY payment_date DESC
    `;
    const paymentsRes = await oracle.execute(paymentsSql, { id: Number(id) }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    // 4. Get library issues
    const librarySql = `
      SELECT li.issue_id, li.item_id, i.title, i.author, li.issue_date, li.due_date, li.return_date, li.fine_amount, li.status
      FROM library_issues li
      JOIN library_items i ON li.item_id = i.item_id
      WHERE li.student_id = :id
      ORDER BY li.issue_date DESC
    `;
    const libraryRes = await oracle.execute(librarySql, { id: Number(id) }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    // 5. Get hostel allotment
    const hostelSql = `
      SELECT ha.allotment_id, ha.hostel_id, h.hostel_name, ha.room_number, ha.start_date, ha.end_date, ha.status
      FROM hostel_allotments ha
      JOIN hostels h ON ha.hostel_id = h.hostel_id
      WHERE ha.student_id = :id AND ha.status = 'Allocated'
    `;
    const hostelRes = await oracle.execute(hostelSql, { id: Number(id) }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    return res.json({
      student: infoRes.rows[0],
      enrollments: enrollRes.rows,
      payments: paymentsRes.rows,
      library: libraryRes.rows,
      hostel: hostelRes.rows[0] || null
    });
  } catch (err) {
    console.error('getStudentDetails error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createStudent = async (req, res) => {
  const { firstName, lastName, email, cnic, programID, status, password } = req.body;
  if (!firstName || !lastName || !email || !programID || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const plsql = `
    DECLARE
      v_user_id NUMBER;
      v_student_id NUMBER;
    BEGIN
      INSERT INTO user_accounts (email, plain_password, role, reference_id)
      VALUES (:email, :password, 'Student', NULL)
      RETURNING user_id INTO v_user_id;

      INSERT INTO students (user_id, first_name, last_name, email, cnic_raw, cnic_encrypted, program_id, status)
      VALUES (v_user_id, :firstName, :lastName, :email, :cnic, fn_encrypt_value(:cnic), :programID, :status)
      RETURNING student_id INTO v_student_id;

      UPDATE user_accounts SET reference_id = v_student_id WHERE user_id = v_user_id;
      
      :out_student_id := v_student_id;
    END;
  `;

  const binds = {
    email,
    password,
    firstName,
    lastName,
    cnic: cnic || null,
    programID: Number(programID),
    status: status || 'Active',
    out_student_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
  };

  try {
    const result = await oracle.execute(plsql, binds, { autoCommit: true });
    return res.json({ message: 'Student created successfully', studentID: result.outBinds.out_student_id });
  } catch (err) {
    console.error('createStudent error', err);
    if (err && (err.errorNum === 1 || err.message.includes('unique constraint') || err.message.includes('ORA-00001'))) {
      return res.status(400).json({ message: 'Email or User account already exists' });
    }
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

exports.updateStudent = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, cnic, programID, status } = req.body;
  if (!id || !firstName || !lastName || !email || !programID) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const conn = await oracle.getConnection();
  try {
    // 1. Update students details
    const studentSql = `
      UPDATE students 
      SET first_name = :firstName, last_name = :lastName, email = :email, 
          cnic_raw = :cnic, cnic_encrypted = fn_encrypt_value(:cnic), 
          program_id = :programID, status = :status
      WHERE student_id = :student_id
    `;
    await conn.execute(studentSql, {
      firstName,
      lastName,
      email,
      cnic: cnic || null,
      programID: Number(programID),
      status: status || 'Active',
      student_id: Number(id)
    });

    // 2. Sync email in user_accounts
    const userSql = `
      UPDATE user_accounts
      SET email = :email
      WHERE role = 'Student' AND reference_id = :student_id
    `;
    await conn.execute(userSql, { email, student_id: Number(id) });

    await conn.commit();
    return res.json({ message: 'Student updated successfully' });
  } catch (err) {
    await conn.rollback();
    console.error('updateStudent error', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  } finally {
    try { await conn.close(); } catch (e) {}
  }
};

exports.deleteStudent = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: 'Student ID required' });

  try {
    // Delete from user_accounts - cascades to students table
    const sql = `DELETE FROM user_accounts WHERE role = 'Student' AND reference_id = :id`;
    await oracle.execute(sql, { id: Number(id) }, { autoCommit: true });
    return res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error('deleteStudent error', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

// Faculty Management
exports.getFaculties = async (req, res) => {
  try {
    const query = `
      SELECT f.faculty_id, f.user_id, f.first_name, f.last_name, f.email, 
             f.department_id, d.dept_name, f.bank_account_raw AS bank_account, 
             f.hire_date, f.status
      FROM faculty f
      LEFT JOIN departments d ON f.department_id = d.dept_id
      ORDER BY f.faculty_id DESC
    `;
    const result = await oracle.execute(query, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.json(result.rows);
  } catch (err) {
    console.error('getFaculties error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getFacultyDetails = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: 'Faculty ID required' });

  try {
    // 1. Get info
    const infoSql = `
      SELECT f.faculty_id, f.first_name, f.last_name, f.email, 
             f.department_id, d.dept_name, f.bank_account_raw AS bank_account, 
             f.hire_date, f.status
      FROM faculty f
      LEFT JOIN departments d ON f.department_id = d.dept_id
      WHERE f.faculty_id = :id
    `;
    const infoRes = await oracle.execute(infoSql, { id: Number(id) }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    if (!infoRes.rows.length) return res.status(404).json({ message: 'Faculty not found' });

    // 2. Sections taught
    const sectionsSql = `
      SELECT sec.section_id, c.course_code, c.course_title, sec.semester, sec.year, sec.capacity, sec.available_seats,
             (SELECT COUNT(*) FROM enrollments e WHERE e.section_id = sec.section_id) AS enrolled_students
      FROM sections sec
      JOIN courses c ON sec.course_id = c.course_id
      WHERE sec.faculty_id = :id
      ORDER BY sec.year DESC, sec.semester DESC
    `;
    const sectionsRes = await oracle.execute(sectionsSql, { id: Number(id) }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    return res.json({
      faculty: infoRes.rows[0],
      sections: sectionsRes.rows
    });
  } catch (err) {
    console.error('getFacultyDetails error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createFaculty = async (req, res) => {
  const { firstName, lastName, email, departmentID, bankAccount, status, password } = req.body;
  if (!firstName || !lastName || !email || !departmentID || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const plsql = `
    DECLARE
      v_user_id NUMBER;
      v_faculty_id NUMBER;
    BEGIN
      INSERT INTO user_accounts (email, plain_password, role, reference_id)
      VALUES (:email, :password, 'Faculty', NULL)
      RETURNING user_id INTO v_user_id;

      INSERT INTO faculty (user_id, first_name, last_name, email, department_id, bank_account_raw, bank_account_encrypted, status)
      VALUES (v_user_id, :firstName, :lastName, :email, :departmentID, :bankAccount, fn_encrypt_value(:bankAccount), :status)
      RETURNING faculty_id INTO v_faculty_id;

      UPDATE user_accounts SET reference_id = v_faculty_id WHERE user_id = v_user_id;
      
      :out_faculty_id := v_faculty_id;
    END;
  `;

  const binds = {
    email,
    password,
    firstName,
    lastName,
    departmentID: Number(departmentID),
    bankAccount: bankAccount || null,
    status: status || 'Active',
    out_faculty_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
  };

  try {
    const result = await oracle.execute(plsql, binds, { autoCommit: true });
    return res.json({ message: 'Faculty created successfully', facultyID: result.outBinds.out_faculty_id });
  } catch (err) {
    console.error('createFaculty error', err);
    if (err && (err.errorNum === 1 || err.message.includes('unique constraint') || err.message.includes('ORA-00001'))) {
      return res.status(400).json({ message: 'Email or User account already exists' });
    }
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

exports.updateFaculty = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, departmentID, bankAccount, status } = req.body;
  if (!id || !firstName || !lastName || !email || !departmentID) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const conn = await oracle.getConnection();
  try {
    const facultySql = `
      UPDATE faculty 
      SET first_name = :firstName, last_name = :lastName, email = :email, 
          department_id = :departmentID, bank_account_raw = :bankAccount, 
          bank_account_encrypted = fn_encrypt_value(:bankAccount), status = :status
      WHERE faculty_id = :faculty_id
    `;
    await conn.execute(facultySql, {
      firstName,
      lastName,
      email,
      departmentID: Number(departmentID),
      bankAccount: bankAccount || null,
      status: status || 'Active',
      faculty_id: Number(id)
    });

    const userSql = `
      UPDATE user_accounts
      SET email = :email
      WHERE role = 'Faculty' AND reference_id = :faculty_id
    `;
    await conn.execute(userSql, { email, faculty_id: Number(id) });

    await conn.commit();
    return res.json({ message: 'Faculty updated successfully' });
  } catch (err) {
    await conn.rollback();
    console.error('updateFaculty error', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  } finally {
    try { await conn.close(); } catch (e) {}
  }
};

exports.deleteFaculty = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: 'Faculty ID required' });

  try {
    const sql = `DELETE FROM user_accounts WHERE role = 'Faculty' AND reference_id = :id`;
    await oracle.execute(sql, { id: Number(id) }, { autoCommit: true });
    return res.json({ message: 'Faculty deleted successfully' });
  } catch (err) {
    console.error('deleteFaculty error', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

// Course Management
exports.getCourses = async (req, res) => {
  try {
    const sql = `
      SELECT c.course_id, c.course_code, c.course_title, c.credit_hours, c.department_id, d.dept_name, c.description
      FROM courses c
      JOIN departments d ON c.department_id = d.dept_id
      ORDER BY c.course_code
    `;
    const result = await oracle.execute(sql, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.json(result.rows);
  } catch (err) {
    console.error('getCourses error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createCourse = async (req, res) => {
  const { courseCode, courseTitle, creditHours, departmentID, description } = req.body;
  if (!courseCode || !courseTitle || !creditHours || !departmentID) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const sql = `
      INSERT INTO courses (course_code, course_title, credit_hours, department_id, description)
      VALUES (:courseCode, :courseTitle, :creditHours, :departmentID, :description)
    `;
    await oracle.execute(sql, {
      courseCode,
      courseTitle,
      creditHours: Number(creditHours),
      departmentID: Number(departmentID),
      description: description || null
    }, { autoCommit: true });
    return res.json({ message: 'Course created successfully' });
  } catch (err) {
    console.error('createCourse error', err);
    if (err && (err.errorNum === 1 || err.message.includes('unique constraint') || err.message.includes('ORA-00001'))) {
      return res.status(400).json({ message: 'Course code already exists' });
    }
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

exports.updateCourse = async (req, res) => {
  const { id } = req.params;
  const { courseCode, courseTitle, creditHours, departmentID, description } = req.body;
  if (!id || !courseCode || !courseTitle || !creditHours || !departmentID) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const sql = `
      UPDATE courses
      SET course_code = :courseCode, course_title = :courseTitle, 
          credit_hours = :creditHours, department_id = :departmentID, description = :description
      WHERE course_id = :id
    `;
    await oracle.execute(sql, {
      courseCode,
      courseTitle,
      creditHours: Number(creditHours),
      departmentID: Number(departmentID),
      description: description || null,
      id: Number(id)
    }, { autoCommit: true });
    return res.json({ message: 'Course updated successfully' });
  } catch (err) {
    console.error('updateCourse error', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

exports.deleteCourse = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: 'Course ID required' });

  try {
    const sql = `DELETE FROM courses WHERE course_id = :id`;
    await oracle.execute(sql, { id: Number(id) }, { autoCommit: true });
    return res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('deleteCourse error', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

// Section Management
exports.getSections = async (req, res) => {
  try {
    const sql = `
      SELECT sec.section_id, sec.course_id, c.course_code, c.course_title, 
             sec.faculty_id, f.first_name || ' ' || f.last_name AS faculty_name,
             sec.semester, sec.year, sec.capacity, sec.available_seats, sec.schedule, sec.room
      FROM sections sec
      JOIN courses c ON sec.course_id = c.course_id
      JOIN faculty f ON sec.faculty_id = f.faculty_id
      ORDER BY sec.year DESC, sec.semester DESC, c.course_code
    `;
    const result = await oracle.execute(sql, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.json(result.rows);
  } catch (err) {
    console.error('getSections error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createSection = async (req, res) => {
  const { courseID, facultyID, semester, year, capacity, schedule, room } = req.body;
  if (!courseID || !facultyID || !semester || !year || !capacity) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const sql = `
      INSERT INTO sections (course_id, faculty_id, semester, year, capacity, available_seats, schedule, room)
      VALUES (:courseID, :facultyID, :semester, :year, :capacity, :capacity, :schedule, :room)
    `;
    await oracle.execute(sql, {
      courseID: Number(courseID),
      facultyID: Number(facultyID),
      semester,
      year: Number(year),
      capacity: Number(capacity),
      schedule: schedule || null,
      room: room || null
    }, { autoCommit: true });
    return res.json({ message: 'Section created successfully' });
  } catch (err) {
    console.error('createSection error', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

exports.updateSection = async (req, res) => {
  const { id } = req.params;
  const { courseID, facultyID, semester, year, capacity, availableSeats, schedule, room } = req.body;
  if (!id || !courseID || !facultyID || !semester || !year || !capacity || availableSeats === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const sql = `
      UPDATE sections
      SET course_id = :courseID, faculty_id = :facultyID, semester = :semester, 
          year = :year, capacity = :capacity, available_seats = :availableSeats, 
          schedule = :schedule, room = :room
      WHERE section_id = :id
    `;
    await oracle.execute(sql, {
      courseID: Number(courseID),
      facultyID: Number(facultyID),
      semester,
      year: Number(year),
      capacity: Number(capacity),
      availableSeats: Number(availableSeats),
      schedule: schedule || null,
      room: room || null,
      id: Number(id)
    }, { autoCommit: true });
    return res.json({ message: 'Section updated successfully' });
  } catch (err) {
    console.error('updateSection error', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

exports.deleteSection = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: 'Section ID required' });

  try {
    const sql = `DELETE FROM sections WHERE section_id = :id`;
    await oracle.execute(sql, { id: Number(id) }, { autoCommit: true });
    return res.json({ message: 'Section deleted successfully' });
  } catch (err) {
    console.error('deleteSection error', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

// Enrollment Management
exports.getEnrollments = async (req, res) => {
  try {
    const sql = `
      SELECT e.enrollment_id, e.student_id, s.first_name || ' ' || s.last_name AS student_name, 
             e.section_id, c.course_code, c.course_title, sec.semester, sec.year, e.enroll_date, e.status
      FROM enrollments e
      JOIN students s ON e.student_id = s.student_id
      JOIN sections sec ON e.section_id = sec.section_id
      JOIN courses c ON sec.course_id = c.course_id
      ORDER BY e.enrollment_id DESC
    `;
    const result = await oracle.execute(sql, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.json(result.rows);
  } catch (err) {
    console.error('getEnrollments error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.enrollStudent = async (req, res) => {
  const { studentID, sectionID } = req.body;
  if (!studentID || !sectionID) return res.status(400).json({ message: 'studentID and sectionID required' });

  const plsql = `BEGIN EnrollInCourse(:p_studentID, :p_sectionID); END;`;
  const binds = { p_studentID: Number(studentID), p_sectionID: Number(sectionID) };

  try {
    await oracle.execute(plsql, binds, { autoCommit: true });
    return res.json({ message: 'Student enrolled successfully' });
  } catch (err) {
    console.error('enrollStudent error', err);
    if (err && err.errorNum === 20003) return res.status(400).json({ message: 'No seats available in this section.' });
    if (err && err.errorNum === 20004) return res.status(400).json({ message: 'Student is already enrolled in this section.' });
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

exports.dropEnrollment = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: 'Enrollment ID required' });

  const conn = await oracle.getConnection();
  try {
    // 1. Get the section ID
    const getSec = await conn.execute(
      'SELECT section_id FROM enrollments WHERE enrollment_id = :id',
      { id: Number(id) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (!getSec.rows.length) return res.status(404).json({ message: 'Enrollment not found' });
    const sectionId = getSec.rows[0].SECTION_ID;

    // 2. Increment seats in section
    await conn.execute(
      'UPDATE sections SET available_seats = LEAST(capacity, available_seats + 1) WHERE section_id = :sectionId',
      { sectionId }
    );

    // 3. Delete enrollment (cascades grades and attendance automatically due to DB constraints)
    await conn.execute(
      'DELETE FROM enrollments WHERE enrollment_id = :id',
      { id: Number(id) }
    );

    await conn.commit();
    return res.json({ message: 'Enrollment dropped successfully' });
  } catch (err) {
    await conn.rollback();
    console.error('dropEnrollment error', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  } finally {
    try { await conn.close(); } catch (e) {}
  }
};

// --- CRUD ENDPOINTS FOR DEPARTMENTS ---
exports.createDepartment = async (req, res) => {
  const { name, code } = req.body;
  if (!name || !code) return res.status(400).json({ message: 'Department name and code are required' });
  try {
    const sql = `INSERT INTO departments (dept_name, dept_code) VALUES (:name, :code)`;
    await oracle.execute(sql, { name, code }, { autoCommit: true });
    return res.json({ message: 'Department created successfully' });
  } catch (err) {
    console.error('createDepartment error', err);
    if (err.message && err.message.includes('unique constraint')) {
      return res.status(400).json({ message: 'Department name or code already exists' });
    }
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

exports.updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { name, code } = req.body;
  if (!id || !name || !code) return res.status(400).json({ message: 'Missing fields' });
  try {
    const sql = `UPDATE departments SET dept_name = :name, dept_code = :code WHERE dept_id = :id`;
    await oracle.execute(sql, { name, code, id: Number(id) }, { autoCommit: true });
    return res.json({ message: 'Department updated successfully' });
  } catch (err) {
    console.error('updateDepartment error', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

exports.deleteDepartment = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: 'Department ID required' });
  try {
    const sql = `DELETE FROM departments WHERE dept_id = :id`;
    await oracle.execute(sql, { id: Number(id) }, { autoCommit: true });
    return res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    console.error('deleteDepartment error', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

// --- CRUD ENDPOINTS FOR PROGRAMS ---
exports.createProgram = async (req, res) => {
  const { name, departmentID, durationSemesters } = req.body;
  if (!name || !departmentID) return res.status(400).json({ message: 'Program name and department are required' });
  try {
    const sql = `INSERT INTO programs (program_name, department_id, duration_semesters) VALUES (:name, :deptId, :duration)`;
    await oracle.execute(sql, {
      name,
      deptId: Number(departmentID),
      duration: durationSemesters ? Number(durationSemesters) : 8
    }, { autoCommit: true });
    return res.json({ message: 'Program created successfully' });
  } catch (err) {
    console.error('createProgram error', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

exports.updateProgram = async (req, res) => {
  const { id } = req.params;
  const { name, departmentID, durationSemesters } = req.body;
  if (!id || !name || !departmentID) return res.status(400).json({ message: 'Missing fields' });
  try {
    const sql = `UPDATE programs SET program_name = :name, department_id = :deptId, duration_semesters = :duration WHERE program_id = :id`;
    await oracle.execute(sql, {
      name,
      deptId: Number(departmentID),
      duration: Number(durationSemesters),
      id: Number(id)
    }, { autoCommit: true });
    return res.json({ message: 'Program updated successfully' });
  } catch (err) {
    console.error('updateProgram error', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

exports.deleteProgram = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: 'Program ID required' });
  try {
    const sql = `DELETE FROM programs WHERE program_id = :id`;
    await oracle.execute(sql, { id: Number(id) }, { autoCommit: true });
    return res.json({ message: 'Program deleted successfully' });
  } catch (err) {
    console.error('deleteProgram error', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

// --- CRUD ENDPOINTS FOR LIBRARY ITEMS (BOOKS) ---
exports.getLibraryBooks = async (req, res) => {
  try {
    const sql = `SELECT item_id, title, author, isbn, item_type, total_copies, available_copies, publisher, publish_year, pages FROM library_items ORDER BY title`;
    const result = await oracle.execute(sql, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.json(result.rows);
  } catch (err) {
    console.error('getLibraryBooks error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createLibraryBook = async (req, res) => {
  const { title, author, isbn, itemType, totalCopies, publisher, publishYear, pages } = req.body;
  if (!title || !author || !itemType || totalCopies === undefined) {
    return res.status(400).json({ message: 'Title, Author, Item Type and Total Copies are required' });
  }
  try {
    const sql = `
      INSERT INTO library_items (title, author, isbn, item_type, total_copies, available_copies, publisher, publish_year, pages)
      VALUES (:title, :author, :isbn, :itemType, :totalCopies, :totalCopies, :publisher, :publishYear, :pages)
    `;
    await oracle.execute(sql, {
      title,
      author,
      isbn: isbn || null,
      itemType,
      totalCopies: Number(totalCopies),
      publisher: publisher || null,
      publishYear: publishYear ? Number(publishYear) : null,
      pages: pages ? Number(pages) : null
    }, { autoCommit: true });
    return res.json({ message: 'Library book created successfully' });
  } catch (err) {
    console.error('createLibraryBook error', err);
    if (err.message && err.message.includes('unique constraint')) {
      return res.status(400).json({ message: 'ISBN already exists' });
    }
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

exports.updateLibraryBook = async (req, res) => {
  const { id } = req.params;
  const { title, author, isbn, itemType, totalCopies, availableCopies, publisher, publishYear, pages } = req.body;
  if (!id || !title || !author || !itemType || totalCopies === undefined || availableCopies === undefined) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  try {
    const sql = `
      UPDATE library_items 
      SET title = :title, author = :author, isbn = :isbn, item_type = :itemType, 
          total_copies = :totalCopies, available_copies = :availableCopies, 
          publisher = :publisher, publish_year = :publishYear, pages = :pages
      WHERE item_id = :id
    `;
    await oracle.execute(sql, {
      title,
      author,
      isbn: isbn || null,
      itemType,
      totalCopies: Number(totalCopies),
      availableCopies: Number(availableCopies),
      publisher: publisher || null,
      publishYear: publishYear ? Number(publishYear) : null,
      pages: pages ? Number(pages) : null,
      id: Number(id)
    }, { autoCommit: true });
    return res.json({ message: 'Library book updated successfully' });
  } catch (err) {
    console.error('updateLibraryBook error', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

exports.deleteLibraryBook = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: 'Library item ID required' });
  try {
    const sql = `DELETE FROM library_items WHERE item_id = :id`;
    await oracle.execute(sql, { id: Number(id) }, { autoCommit: true });
    return res.json({ message: 'Library book deleted successfully' });
  } catch (err) {
    console.error('deleteLibraryBook error', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

// --- CRUD ENDPOINTS FOR LIBRARY CIRCULATION (ISSUES) ---
exports.getLibraryIssues = async (req, res) => {
  try {
    const sql = `
      SELECT li.issue_id, li.item_id, b.title, b.author,
             li.student_id, s.first_name || ' ' || s.last_name AS student_name,
             li.issue_date, li.due_date, li.return_date, li.fine_amount, li.status
      FROM library_issues li
      JOIN library_items b ON li.item_id = b.item_id
      JOIN students s ON li.student_id = s.student_id
      ORDER BY li.issue_id DESC
    `;
    const result = await oracle.execute(sql, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.json(result.rows);
  } catch (err) {
    console.error('getLibraryIssues error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.issueBook = async (req, res) => {
  const { itemID, studentID, dueDate } = req.body;
  if (!itemID || !studentID || !dueDate) {
    return res.status(400).json({ message: 'Book, Student, and Due Date are required' });
  }

  const conn = await oracle.getConnection();
  try {
    const result = await conn.execute(
      `DECLARE
         p_out_id NUMBER;
       BEGIN
         IssueLibraryBook(:p_item_id, :p_student_id, TO_DATE(:p_due_date, 'YYYY-MM-DD'), p_out_id);
         :out_id := p_out_id;
       END;`,
      {
        p_item_id: Number(itemID),
        p_student_id: Number(studentID),
        p_due_date: dueDate,
        out_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );
    return res.json({ message: 'Book issued successfully', issueID: result.outBinds.out_id });
  } catch (err) {
    console.error('issueBook error', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  } finally {
    try { await conn.close(); } catch (e) {}
  }
};

exports.returnBook = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: 'Issue ID required' });

  const conn = await oracle.getConnection();
  try {
    const result = await conn.execute(
      `DECLARE
         p_out_fine NUMBER;
       BEGIN
         ReturnLibraryBook(:p_issue_id, p_out_fine);
         :out_fine := p_out_fine;
       END;`,
      {
        p_issue_id: Number(id),
        out_fine: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );
    return res.json({ message: 'Book returned successfully', fineAmount: result.outBinds.out_fine });
  } catch (err) {
    console.error('returnBook error', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  } finally {
    try { await conn.close(); } catch (e) {}
  }
};

// --- CRUD ENDPOINTS FOR HOSTELS & ALLOTMENTS ---
exports.getHostels = async (req, res) => {
  try {
    const sql = `SELECT hostel_id, hostel_name, total_rooms, available_rooms FROM hostels ORDER BY hostel_name`;
    const result = await oracle.execute(sql, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.json(result.rows);
  } catch (err) {
    console.error('getHostels error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createHostel = async (req, res) => {
  const { hostelName, totalRooms } = req.body;
  if (!hostelName || !totalRooms) return res.status(400).json({ message: 'Hostel name and rooms capacity are required' });
  try {
    const sql = `INSERT INTO hostels (hostel_name, total_rooms, available_rooms) VALUES (:name, :total, :total)`;
    await oracle.execute(sql, { name: hostelName, total: Number(totalRooms) }, { autoCommit: true });
    return res.json({ message: 'Hostel created successfully' });
  } catch (err) {
    console.error('createHostel error', err);
    if (err.message && err.message.includes('unique constraint')) {
      return res.status(400).json({ message: 'Hostel name already exists' });
    }
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

exports.getHostelAllotments = async (req, res) => {
  try {
    const sql = `
      SELECT ha.allotment_id, ha.student_id, s.first_name || ' ' || s.last_name AS student_name,
             ha.hostel_id, h.hostel_name, ha.room_number, ha.start_date, ha.end_date, ha.status
      FROM hostel_allotments ha
      JOIN hostels h ON ha.hostel_id = h.hostel_id
      JOIN students s ON ha.student_id = s.student_id
      ORDER BY ha.allotment_id DESC
    `;
    const result = await oracle.execute(sql, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.json(result.rows);
  } catch (err) {
    console.error('getHostelAllotments error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.approveEnrollment = async (req, res) => {
  const { enrollmentID } = req.body;
  if (!enrollmentID) return res.status(400).json({ message: 'enrollmentID required' });

  const conn = await oracle.getConnection();
  try {
    // 1. Fetch section details and current enrollment info
    const enrollInfoRes = await conn.execute(
      `SELECT e.section_id, e.student_id, e.status, s.available_seats, c.credit_hours, s.semester, s.year
       FROM enrollments e
       JOIN sections s ON e.section_id = s.section_id
       JOIN courses c ON s.course_id = c.course_id
       WHERE e.enrollment_id = :enrollmentID`,
      { enrollmentID: Number(enrollmentID) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!enrollInfoRes.rows.length) {
      return res.status(404).json({ message: 'Enrollment request not found' });
    }

    const { SECTION_ID, STUDENT_ID, STATUS, AVAILABLE_SEATS, CREDIT_HOURS, SEMESTER, YEAR } = enrollInfoRes.rows[0];

    if (STATUS === 'Enrolled') {
      return res.status(400).json({ message: 'Enrollment is already approved and active.' });
    }

    if (Number(AVAILABLE_SEATS || 0) <= 0) {
      return res.status(400).json({ message: 'No seats available in this section.' });
    }

    // Double check the 18 credit limit
    const newCourseCredits = Number(CREDIT_HOURS || 0);
    const creditsRes = await conn.execute(
      `SELECT NVL(SUM(c.credit_hours), 0) AS current_credits
       FROM enrollments e
       JOIN sections s ON e.section_id = s.section_id
       JOIN courses c ON s.course_id = c.course_id
       WHERE e.student_id = :studentID
         AND s.semester = :semester
         AND s.year = :year
         AND e.status = 'Enrolled'`,
      { studentID: Number(STUDENT_ID), semester: SEMESTER, year: Number(YEAR) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const activeCredits = Number(creditsRes.rows[0].CURRENT_CREDITS || creditsRes.rows[0].current_credits || 0);
    if (activeCredits + newCourseCredits > 18) {
      return res.status(400).json({
        message: `Approval failed: Student already has ${activeCredits} CH enrolled, and this course has ${newCourseCredits} CH (Max limit: 18 CH).`
      });
    }

    // 2. Decrement available seats in the section
    await conn.execute(
      `UPDATE sections SET available_seats = available_seats - 1 WHERE section_id = :sectionID`,
      { sectionID: Number(SECTION_ID) }
    );

    // 3. Update status of the enrollment to 'Enrolled'
    await conn.execute(
      `UPDATE enrollments SET status = 'Enrolled' WHERE enrollment_id = :enrollmentID`,
      { enrollmentID: Number(enrollmentID) }
    );

    await conn.commit();
    return res.json({ message: 'Enrollment request approved successfully.' });
  } catch (err) {
    try { await conn.rollback(); } catch (e) {}
    console.error('approveEnrollment error', err);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    try { await conn.close(); } catch (e) {}
  }
};

