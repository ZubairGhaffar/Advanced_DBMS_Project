const db = require('../config/db');

async function execute(sql, binds = {}, options = {}) {
  const conn = await db.getConnection();
  try {
    const result = await conn.execute(sql, binds, options);
    return result;
  } finally {
    try { await conn.close(); } catch (e) { }
  }
}

async function getConnection() {
  return db.getConnection();
}

module.exports = { execute, getConnection };
