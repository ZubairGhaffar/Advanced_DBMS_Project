const oracledb = require('oracledb');
const oracle = require('../utils/oracleHelper');

exports.register = async (req, res) => {
  const { firstName, lastName, email, deptID } = req.body;
  if (!firstName || !lastName || !email || !deptID) return res.status(400).json({ message: 'Missing fields' });

  const plsql = `
  DECLARE
    p_studentid NUMBER;
  BEGIN
    RegisterStudent(:p_firstName, :p_lastName, :p_email, :p_deptID, :out_studentid);
  END;
  `;

  const binds = {
    p_firstName: firstName,
    p_lastName: lastName,
    p_email: email,
    p_deptID: deptID,
    out_studentid: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
  };

  try {
    const result = await oracle.execute(plsql, binds, { autoCommit: true });
    return res.json({ studentID: result.outBinds.out_studentid });
  } catch (err) {
    if (err && err.errorNum === 20001) return res.status(400).json({ message: err.message });
    console.error('Register error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.enroll = async (req, res) => {
  const { studentID, sectionID } = req.body;
  if (!studentID || !sectionID) return res.status(400).json({ message: 'Missing studentID or sectionID' });

  const plsql = `BEGIN EnrollInCourse(:p_studentID, :p_sectionID); END;`;
  const binds = { p_studentID: studentID, p_sectionID: sectionID };

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await oracle.execute(plsql, binds, { autoCommit: true });
      return res.json({ message: 'Enrolled successfully' });
    } catch (err) {
      const isDeadlock = (err && (err.errorNum === 60 || (err.message && err.message.includes('ORA-00060'))));
      if (isDeadlock && attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 200 * attempt));
        continue;
      }
      if (err && err.errorNum === 20001) return res.status(400).json({ message: err.message });
      console.error('Enroll error', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
};

exports.payFee = async (req, res) => {
  const { studentID, amount, method, reference } = req.body;
  if (!studentID || !amount || !method) return res.status(400).json({ message: 'Missing payment fields' });

  const plsql = `BEGIN ProcessFeePayment(:p_studentID, :p_amount, :p_method, :p_reference, :out_receipt); END;`;
  const binds = {
    p_studentID: studentID,
    p_amount: amount,
    p_method: method,
    p_reference: reference || null,
    out_receipt: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 }
  };

  try {
    const result = await oracle.execute(plsql, binds, { autoCommit: true });
    return res.json({ receipt: result.outBinds.out_receipt });
  } catch (err) {
    if (err && err.errorNum === 20001) return res.status(400).json({ message: err.message });
    console.error('Payment error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.dashboard = async (req, res) => {
  const studentID = req.user && req.user.referenceID ? req.user.referenceID : req.query.studentID;
  if (!studentID) return res.status(400).json({ message: 'studentID required' });

  const sql = `SELECT * FROM vw_StudentDashboard WHERE student_id = :id`;
  try {
    const result = await oracle.execute(sql, { id: studentID }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.json({ data: result.rows });
  } catch (err) {
    console.error('Dashboard error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
