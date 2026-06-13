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

  const conn = await oracle.getConnection();
  try {
    await conn.execute('BEGIN NULL; END;');
    const plsql = `BEGIN ProcessFeePayment(:p_studentID, :p_amount, :p_method, :p_reference, :out_receipt); END;`;
    const binds = {
      p_studentID: studentID,
      p_amount: amount,
      p_method: method,
      p_reference: reference || null,
      out_receipt: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 }
    };
    const result = await conn.execute(plsql, binds);
    await conn.commit();
    return res.json({ receipt: result.outBinds.out_receipt });
  } catch (err) {
    try { await conn.rollback(); } catch (rollbackErr) { console.error('Rollback failed', rollbackErr); }
    if (err && err.errorNum === 20001) return res.status(400).json({ message: err.message });
    console.error('Payment error', err);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    try { await conn.close(); } catch (closeErr) { console.error('Connection close failed', closeErr); }
  }
};

exports.availableCourses = async (req, res) => {
  const studentID = req.user && req.user.referenceID ? req.user.referenceID : req.query.studentID;
  if (!studentID) return res.status(400).json({ message: 'studentID required' });

  const sql = `SELECT * FROM vw_AvailableCourses WHERE student_id = :id`;
  try {
    const result = await oracle.execute(sql, { id: studentID }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.json(result.rows);
  } catch (err) {
    console.error('Available courses error', err);
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

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

exports.downloadTranscript = async (req, res) => {
  const studentID = req.user && req.user.referenceID ? req.user.referenceID : req.query.studentID;
  if (!studentID) return res.status(400).json({ message: 'studentID required' });

  const conn = await oracle.getConnection();
  try {
    const plsql = `DECLARE
      p_blob BLOB;
    BEGIN
      GenerateTranscriptPDF(:p_studentID, p_blob);
      :out_blob := p_blob;
    END;`;

    const binds = {
      p_studentID: studentID,
      out_blob: { dir: oracledb.BIND_OUT, type: oracledb.BLOB }
    };

    const result = await conn.execute(plsql, binds, { autoCommit: false });
    const outBlob = result.outBinds.out_blob;
    if (!outBlob) return res.status(404).json({ message: 'Transcript not available' });

    let pdfBuffer;
    if (Buffer.isBuffer(outBlob)) {
      pdfBuffer = outBlob;
    } else {
      pdfBuffer = await streamToBuffer(outBlob);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="transcript.pdf"');
    return res.send(pdfBuffer);
  } catch (err) {
    console.error('Transcript error', err);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    try { await conn.close(); } catch (closeErr) { console.error('Connection close failed', closeErr); }
  }
};
