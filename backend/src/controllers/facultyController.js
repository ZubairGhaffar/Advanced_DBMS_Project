const oracledb = require('oracledb');
const oracle = require('../utils/oracleHelper');

exports.markAttendance = async (req, res) => {
  const { sectionID, attendances } = req.body; // attendances: [{studentID, present}, ...]
  if (!sectionID || !Array.isArray(attendances)) return res.status(400).json({ message: 'Missing fields' });

  const jsonPayload = JSON.stringify(attendances);
  const plsql = `BEGIN MarkAttendance(:p_sectionID, :p_json); END;`;
  const binds = { p_sectionID: sectionID, p_json: jsonPayload };

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
