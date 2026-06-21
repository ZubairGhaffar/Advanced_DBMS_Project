const oracledb = require('oracledb');
const oracle = require('../utils/oracleHelper');

exports.register = async (req, res) => {
  const { firstName, lastName, email, cnic, programID } = req.body;
  if (!firstName || !lastName || !email || !cnic || !programID) return res.status(400).json({ message: 'Missing fields' });

  const plsql = `
  DECLARE
    p_studentid NUMBER;
  BEGIN
    RegisterStudent(:p_firstName, :p_lastName, :p_email, :p_cnic, :p_programID, :out_studentid);
  END;
  `;

  const binds = {
    p_firstName: firstName,
    p_lastName: lastName,
    p_email: email,
    p_cnic: cnic,
    p_programID: programID,
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
  const studentID = req.user && req.user.referenceID ? req.user.referenceID : req.body.studentID;
  const { sectionID } = req.body;
  if (!studentID || !sectionID) return res.status(400).json({ message: 'Missing studentID or sectionID' });

  const plsql = `BEGIN EnrollInCourse(:p_studentID, :p_sectionID); END;`;
  const binds = { p_studentID: Number(studentID), p_sectionID: sectionID };

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
  const studentID = req.user && req.user.referenceID ? req.user.referenceID : req.body.studentID;
  const { amount, method, reference, bankAccount } = req.body;
  if (!studentID || !amount || !method) return res.status(400).json({ message: 'Missing payment fields' });

  const conn = await oracle.getConnection();
  try {
    await conn.execute('BEGIN NULL; END;');
    const plsql = `BEGIN ProcessFeePayment(:p_studentID, :p_amount, :p_method, :p_reference, :p_bankAccount, :out_receipt); END;`;
    const binds = {
      p_studentID: studentID,
      p_amount: amount,
      p_method: method,
      p_reference: reference || null,
      p_bankAccount: bankAccount || null,
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
  const studentID = req.user && req.user.referenceID;
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
  const studentID = req.user && req.user.referenceID;
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

exports.getFeeSlip = async (req, res) => {
  const studentID = req.user && req.user.referenceID;
  if (!studentID) return res.status(400).json({ message: 'studentID required' });

  const conn = await oracle.getConnection();
  try {
    const result = await conn.execute(
      `BEGIN GenerateFeeSlip(:p_studentID, :p_cursor); END;`,
      {
        p_studentID: Number(studentID),
        p_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const rows = await result.outBinds.p_cursor.getRows(1000);
    await result.outBinds.p_cursor.close();
    return res.json(oracle.processRows(rows));
  } catch (err) {
    console.error('Fee slip error', err);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    try { await conn.close(); } catch (closeErr) { console.error('Connection close failed', closeErr); }
  }
};

exports.getLibraryOverdue = async (req, res) => {
  const studentID = req.user && req.user.referenceID;
  if (!studentID) return res.status(400).json({ message: 'studentID required' });

  try {
    const result = await oracle.execute(
      'SELECT * FROM vw_LibraryOverdue WHERE student_id = :id',
      { id: Number(studentID) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('Library overdue error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getResultCard = async (req, res) => {
  const studentID = req.user && req.user.referenceID;
  if (!studentID) return res.status(400).json({ message: 'studentID required' });

  try {
    // Check for outstanding fees
    const checkFeeRes = await oracle.execute(
      'SELECT fn_GetOutstandingFee(:id) AS outstanding FROM dual',
      { id: Number(studentID) }
    );
    const outstanding = Number(checkFeeRes.rows[0].OUTSTANDING || checkFeeRes.rows[0].outstanding || 0);
    if (outstanding > 0) {
      return res.status(403).json({ message: 'Withheld: Please pay your outstanding fees (PKR ' + outstanding.toLocaleString() + ') to view your result card.' });
    }

    const result = await oracle.execute('SELECT * FROM vw_ResultCard WHERE student_id = :id', { id: Number(studentID) }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.json(result.rows);
  } catch (err) {
    console.error('Result card error', err);
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
  const studentID = req.user && req.user.referenceID;
  if (!studentID) return res.status(400).json({ message: 'studentID required' });

  try {
    // Check for outstanding fees
    const checkFeeRes = await oracle.execute(
      'SELECT fn_GetOutstandingFee(:id) AS outstanding FROM dual',
      { id: Number(studentID) }
    );
    const outstanding = Number(checkFeeRes.rows[0].OUTSTANDING || checkFeeRes.rows[0].outstanding || 0);
    if (outstanding > 0) {
      return res.status(403).json({ message: 'Withheld: Please pay your outstanding fees (PKR ' + outstanding.toLocaleString() + ') to download your transcript.' });
    }
  } catch (err) {
    console.error('Transcript fee check error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }

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

exports.getEnrolledCourses = async (req, res) => {
  const studentID = req.user && req.user.referenceID;
  if (!studentID) return res.status(400).json({ message: 'studentID required' });

  const sql = `
    SELECT e.enrollment_id,
           c.course_code,
           c.course_title,
           c.credit_hours,
           sec.section_id,
           sec.semester,
           sec.year,
           sec.room,
           sec.schedule,
           f.first_name || ' ' || f.last_name AS instructor_name,
           f.email AS instructor_email,
           d.dept_name AS instructor_dept
      FROM enrollments e
      JOIN sections sec ON e.section_id = sec.section_id
      JOIN courses c ON sec.course_id = c.course_id
      JOIN faculty f ON sec.faculty_id = f.faculty_id
      JOIN departments d ON f.department_id = d.dept_id
     WHERE e.student_id = :id
  `;
  try {
    const result = await oracle.execute(sql, { id: Number(studentID) }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    
    // Calculate attendance percentage per enrollment
    const enrolled = [];
    for (const row of result.rows) {
      const attSql = `
        SELECT 
          NVL(SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END), 0) AS present,
          COUNT(*) AS total
        FROM attendance_records
        WHERE enrollment_id = :enrollment_id
      `;
      const attRes = await oracle.execute(attSql, { enrollment_id: row.ENROLLMENT_ID }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
      const present = attRes.rows[0].PRESENT || 0;
      const total = attRes.rows[0].TOTAL || 0;
      const pct = total > 0 ? Number(((present / total) * 100).toFixed(2)) : 100.0;
      
      enrolled.push({
        ...row,
        present_classes: present,
        total_classes: total,
        attendance_percent: pct
      });
    }
    
    return res.json(enrolled);
  } catch (err) {
    console.error('getEnrolledCourses error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getDetailedAttendance = async (req, res) => {
  const studentID = req.user && req.user.referenceID;
  if (!studentID) return res.status(400).json({ message: 'studentID required' });

  const sql = `
    SELECT ar.attendance_id, ar.lecture_number, ar.attendance_date, ar.status, c.course_code, c.course_title
      FROM attendance_records ar
      JOIN enrollments e ON ar.enrollment_id = e.enrollment_id
      JOIN sections sec ON e.section_id = sec.section_id
      JOIN courses c ON sec.course_id = c.course_id
     WHERE e.student_id = :id
     ORDER BY ar.attendance_date DESC
  `;
  try {
    const result = await oracle.execute(sql, { id: Number(studentID) }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.json(result.rows);
  } catch (err) {
    console.error('getDetailedAttendance error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getLibraryBooks = async (req, res) => {
  try {
    const sql = `SELECT item_id, title, author, isbn, item_type, total_copies, available_copies, publisher, publish_year, pages FROM library_items ORDER BY title`;
    const result = await oracle.execute(sql, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.json(result.rows);
  } catch (err) {
    console.error('student getLibraryBooks error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getMyLibraryIssues = async (req, res) => {
  const studentID = req.user && req.user.referenceID;
  if (!studentID) return res.status(400).json({ message: 'studentID required' });

  try {
    const sql = `
      SELECT li.issue_id, li.item_id, b.title, b.author, li.issue_date, li.due_date, li.return_date, li.fine_amount, li.status
      FROM library_issues li
      JOIN library_items b ON li.item_id = b.item_id
      WHERE li.student_id = :id
      ORDER BY li.issue_date DESC
    `;
    const result = await oracle.execute(sql, { id: Number(studentID) }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.json(result.rows);
  } catch (err) {
    console.error('getMyLibraryIssues error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
