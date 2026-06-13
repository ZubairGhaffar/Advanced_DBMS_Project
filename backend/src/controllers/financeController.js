const oracledb = require('oracledb');
const oracle = require('../utils/oracleHelper');

exports.getFeeSlip = async (req, res) => {
  const studentID = req.query.studentID;
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
    return res.json(rows);
  } catch (err) {
    console.error('Fee slip error', err);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    try { await conn.close(); } catch (closeErr) { console.error('Connection close failed', closeErr); }
  }
};

exports.getDefaulters = async (req, res) => {
  try {
    const result = await oracle.execute('SELECT * FROM vw_FeeDefaulters', {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.json(result.rows);
  } catch (err) {
    console.error('Fee defaulters error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.searchCourses = async (req, res) => {
  const departmentID = req.query.departmentID ? Number(req.query.departmentID) : null;
  const keyword = req.query.keyword || null;
  const conn = await oracle.getConnection();
  try {
    const result = await conn.execute(
      `BEGIN SearchCourses(:p_department_id, :p_keyword, :p_cursor); END;`,
      {
        p_department_id: departmentID,
        p_keyword: keyword,
        p_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const rows = await result.outBinds.p_cursor.getRows(1000);
    await result.outBinds.p_cursor.close();
    return res.json(rows);
  } catch (err) {
    console.error('Search courses error', err);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    try { await conn.close(); } catch (closeErr) { console.error('Connection close failed', closeErr); }
  }
};
