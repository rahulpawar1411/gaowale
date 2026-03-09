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
  const first_name = data.first_name || null;
  const last_name = data.last_name || null;
  const name =
    (first_name && last_name && `${first_name} ${last_name}`) ||
    first_name ||
    last_name ||
    data.name ||
    null;
  const whatsapp_number = data.whatsapp_number || data.contact || null;
  const contact = whatsapp_number;
  const email = data.email || null;
  const state_id = data.state_id || null;
  const village_id = data.village_id || null;
  const password_hash = data.password || data.password_hash || null;

  const [result] = await pool.execute(
    `INSERT INTO customer_registrations
     (name, contact, email, state_id, village_id, first_name, last_name, whatsapp_number, password_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      contact,
      email,
      state_id,
      village_id,
      first_name,
      last_name,
      whatsapp_number,
      password_hash,
    ]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const first_name = data.first_name || null;
  const last_name = data.last_name || null;
  const name =
    (first_name && last_name && `${first_name} ${last_name}`) ||
    first_name ||
    last_name ||
    data.name ||
    null;
  const whatsapp_number = data.whatsapp_number || data.contact || null;
  const contact = whatsapp_number;
  const email = data.email || null;
  const state_id = data.state_id || null;
  const village_id = data.village_id || null;
  const password_hash = data.password || data.password_hash || null;

  await pool.execute(
    `UPDATE customer_registrations
     SET name = ?, contact = ?, email = ?, state_id = ?, village_id = ?,
         first_name = ?, last_name = ?, whatsapp_number = ?, password_hash = ?
     WHERE id = ?`,
    [
      name,
      contact,
      email,
      state_id,
      village_id,
      first_name,
      last_name,
      whatsapp_number,
      password_hash,
      id,
    ]
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
