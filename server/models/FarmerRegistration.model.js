const { pool } = require('../config/database');
const { renumberTable } = require('../utils/renumberTable');

const dbName = process.env.DB_NAME || 'gao0.2';

async function findAll() {
  const [rows] = await pool.execute(
    `SELECT fr.*, v.name as village_name, t.name as taluka_name, s.name as state_name
     FROM farmer_registrations fr
     LEFT JOIN villages v ON fr.village_id = v.id
     LEFT JOIN talukas t ON fr.taluka_id = t.id
     LEFT JOIN states s ON fr.state_id = s.id
     ORDER BY fr.id DESC`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT fr.*, v.name as village_name, t.name as taluka_name, s.name as state_name
     FROM farmer_registrations fr
     LEFT JOIN villages v ON fr.village_id = v.id
     LEFT JOIN talukas t ON fr.taluka_id = t.id
     LEFT JOIN states s ON fr.state_id = s.id
     WHERE fr.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function create(data) {
  const { name, contact, village_id, taluka_id, state_id } = data;
  const [result] = await pool.execute(
    `INSERT INTO farmer_registrations (name, contact, village_id, taluka_id, state_id)
     VALUES (?, ?, ?, ?, ?)`,
    [name || null, contact || null, village_id || null, taluka_id || null, state_id || null]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const { name, contact, village_id, taluka_id, state_id } = data;
  await pool.execute(
    `UPDATE farmer_registrations
     SET name = ?, contact = ?, village_id = ?, taluka_id = ?, state_id = ?
     WHERE id = ?`,
    [name || null, contact || null, village_id || null, taluka_id || null, state_id || null, id]
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM farmer_registrations WHERE id = ?', [id]);
  if (result.affectedRows === 0) return false;
  await renumberTable(pool, dbName, 'farmer_registrations');
  return true;
}

module.exports = { findAll, findById, create, update, remove };
