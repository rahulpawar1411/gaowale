const { pool } = require('../config/database');
const { renumberTable } = require('../utils/renumberTable');

const dbName = process.env.DB_NAME || 'gao0.2';

async function findAll() {
  const [rows] = await pool.execute(
    `SELECT cr.*, s.name as state_name, v.name as village_name
     FROM customer_registrations cr
     LEFT JOIN states s ON cr.state_id = s.id
     LEFT JOIN villages v ON cr.village_id = v.id
     ORDER BY cr.id DESC`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT cr.*, s.name as state_name, v.name as village_name
     FROM customer_registrations cr
     LEFT JOIN states s ON cr.state_id = s.id
     LEFT JOIN villages v ON cr.village_id = v.id
     WHERE cr.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function create(data) {
  const { name, contact, email, state_id, village_id } = data;
  const [result] = await pool.execute(
    `INSERT INTO customer_registrations (name, contact, email, state_id, village_id)
     VALUES (?, ?, ?, ?, ?)`,
    [name || null, contact || null, email || null, state_id || null, village_id || null]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const { name, contact, email, state_id, village_id } = data;
  await pool.execute(
    `UPDATE customer_registrations
     SET name = ?, contact = ?, email = ?, state_id = ?, village_id = ?
     WHERE id = ?`,
    [name || null, contact || null, email || null, state_id || null, village_id || null, id]
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM customer_registrations WHERE id = ?', [id]);
  if (result.affectedRows === 0) return false;
  await renumberTable(pool, dbName, 'customer_registrations');
  return true;
}

module.exports = { findAll, findById, create, update, remove };
