const oracledb = require('oracledb');

let pool;

async function initPool() {
  if (pool) return pool;
  pool = await oracledb.createPool({
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECTION_STRING,
    poolMin: 0,
    poolMax: 10,
    poolIncrement: 1
  });
  return pool;
}

async function getConnection() {
  if (!pool) await initPool();
  return await pool.getConnection();
}

module.exports = { initPool, getConnection };
