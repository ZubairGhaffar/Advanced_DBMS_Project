const oracledb = require('oracledb');
const oracle = require('../utils/oracleHelper');

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
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    try { await conn.close(); } catch (closeErr) { console.error('Connection close failed', closeErr); }
  }
};
