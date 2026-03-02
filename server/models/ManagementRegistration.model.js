const { pool } = require('../config/database');
const { renumberTable } = require('../utils/renumberTable');

const dbName = process.env.DB_NAME || 'gao0.2';

async function findAll() {
  const [rows] = await pool.execute(
    `SELECT mr.*, s.name as state_name, r.name as region_name
     FROM management_registrations mr
     LEFT JOIN states s ON mr.state_id = s.id
     LEFT JOIN regions r ON mr.region_id = r.id
     ORDER BY mr.id DESC`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT mr.*, s.name as state_name, r.name as region_name
     FROM management_registrations mr
     LEFT JOIN states s ON mr.state_id = s.id
     LEFT JOIN regions r ON mr.region_id = r.id
     WHERE mr.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function create(data) {
  const { name, contact, email, state_id, region_id } = data;
  const [result] = await pool.execute(
    `INSERT INTO management_registrations (name, contact, email, state_id, region_id)
     VALUES (?, ?, ?, ?, ?)`,
    [name || null, contact || null, email || null, state_id || null, region_id || null]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const { name, contact, email, state_id, region_id } = data;
  await pool.execute(
    `UPDATE management_registrations
     SET name = ?, contact = ?, email = ?, state_id = ?, region_id = ?
     WHERE id = ?`,
    [name || null, contact || null, email || null, state_id || null, region_id || null, id]
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM management_registrations WHERE id = ?', [id]);
  if (result.affectedRows === 0) return false;
  await renumberTable(pool, dbName, 'management_registrations');
  return true;
}

module.exports = { findAll, findById, create, update, remove };
