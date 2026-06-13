const oracledb = require('oracledb');
const jwt = require('jsonwebtoken');
const oracle = require('../utils/oracleHelper');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  const plsql = `
  DECLARE
    p_role VARCHAR2(50);
    p_refid VARCHAR2(100);
  BEGIN
    AuthenticateUser(:p_email, :p_password, p_role, p_refid);
    :out_role := p_role;
    :out_refid := p_refid;
  END;
  `;

  const binds = {
    p_email: email,
    p_password: password,
    out_role: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
    out_refid: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
  };

  try {
    const result = await oracle.execute(plsql, binds, { autoCommit: false });
    const role = result.outBinds.out_role;
    const referenceID = result.outBinds.out_refid;
    const token = jwt.sign({ role, referenceID }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
    return res.json({ token, role, referenceID });
  } catch (err) {
    if (err && err.errorNum === 20001) {
      return res.status(400).json({ message: err.message });
    }
    console.error('Login error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
