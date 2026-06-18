const db = require('../config/db');
const als = require('./als');

function processRow(row) {
  if (typeof row !== 'object' || row === null) return row;
  const newRow = {};
  for (const key of Object.keys(row)) {
    newRow[key] = row[key];
    newRow[key.toLowerCase()] = row[key];
  }
  return newRow;
}

function processRows(rows) {
  if (!rows) return rows;
  if (Array.isArray(rows)) {
    return rows.map(processRow);
  }
  return processRow(rows);
}

async function execute(sql, binds = {}, options = {}) {
  const conn = await db.getConnection();
  try {
    const user = als.getStore();
    if (user && user.role && user.referenceID) {
      conn.clientId = `${user.role}:${user.referenceID}`;
    }
    const result = await conn.execute(sql, binds, options);
    if (result.rows) {
      result.rows = processRows(result.rows);
    }
    return result;
  } finally {
    try { await conn.close(); } catch (e) { }
  }
}

async function getConnection() {
  const conn = await db.getConnection();
  const user = als.getStore();
  if (user && user.role && user.referenceID) {
    conn.clientId = `${user.role}:${user.referenceID}`;
  }
  return conn;
}

module.exports = { execute, getConnection, processRows };
