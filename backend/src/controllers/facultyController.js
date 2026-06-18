const oracledb = require('oracledb');
const oracle = require('../utils/oracleHelper');

exports.markAttendance = async (req, res) => {
  const { sectionID, lectureNumber, attendances } = req.body; // attendances: [{studentID, present}, ...]
  if (!sectionID || !lectureNumber || !Array.isArray(attendances)) return res.status(400).json({ message: 'Missing fields' });

  const jsonPayload = JSON.stringify(attendances);
  const plsql = `BEGIN MarkAttendance(:p_sectionID, :p_lectureNumber, :p_json); END;`;
  const binds = { p_sectionID: Number(sectionID), p_lectureNumber: Number(lectureNumber), p_json: jsonPayload };

  try {
    await oracle.execute(plsql, binds, { autoCommit: true });
    return res.json({ message: 'Attendance marked' });
  } catch (err) {
    if (err && err.errorNum === 20001) return res.status(400).json({ message: err.message });
    console.error('Mark attendance error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.submitGrades = async (req, res) => {
  const { sectionID, grades } = req.body; // grades: [{studentID, grade}, ...]
  if (!sectionID || !Array.isArray(grades)) return res.status(400).json({ message: 'Missing fields' });

  const jsonPayload = JSON.stringify(grades);
  const plsql = `BEGIN AddExamResult(:p_sectionID, :p_json); END;`;
  const binds = { p_sectionID: sectionID, p_json: jsonPayload };

  try {
    await oracle.execute(plsql, binds, { autoCommit: true });
    return res.json({ message: 'Grades submitted' });
  } catch (err) {
    if (err && err.errorNum === 20001) return res.status(400).json({ message: err.message });
    console.error('Submit grades error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getSections = async (req, res) => {
  const facultyID = req.user && req.user.referenceID ? req.user.referenceID : req.query.facultyID;
  if (!facultyID) return res.status(400).json({ message: 'facultyID required' });

  const sql = `SELECT * FROM vw_FacultySections WHERE faculty_id = :id`;
  try {
    const result = await oracle.execute(sql, { id: facultyID }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.json(result.rows);
  } catch (err) {
    console.error('Faculty sections error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getWorkload = async (req, res) => {
  const facultyID = req.user && req.user.referenceID ? req.user.referenceID : req.query.facultyID;
  if (!facultyID) return res.status(400).json({ message: 'facultyID required' });

  const sql = `SELECT * FROM vw_FacultyWorkload WHERE faculty_id = :id`;
  try {
    const result = await oracle.execute(sql, { id: facultyID }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.json(result.rows);
  } catch (err) {
    console.error('Faculty workload error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getSectionStudents = async (req, res) => {
  const { sectionID, lectureNumber } = req.query;
  if (!sectionID) return res.status(400).json({ message: 'sectionID required' });

  let sql;
  let binds;
  if (lectureNumber) {
    sql = `
      SELECT e.enrollment_id, e.section_id, s.student_id, 
             s.first_name || ' ' || s.last_name AS student_name,
             ar.status AS attendance_status
        FROM enrollments e
        JOIN students s ON e.student_id = s.student_id
        LEFT JOIN attendance_records ar ON e.enrollment_id = ar.enrollment_id AND ar.lecture_number = :lectureNumber
       WHERE e.section_id = :sectionID
    `;
    binds = { sectionID: Number(sectionID), lectureNumber: Number(lectureNumber) };
  } else {
    sql = `SELECT * FROM vw_SectionStudents WHERE section_id = :sectionID`;
    binds = { sectionID: Number(sectionID) };
  }

  try {
    const result = await oracle.execute(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.json(result.rows);
  } catch (err) {
    console.error('Section students error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
