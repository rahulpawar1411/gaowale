const { pool } = require('../config/database');
const { renumberTable } = require('../utils/renumberTable');

const dbName = process.env.DB_NAME || 'gao0.2';

async function findAll() {
  const [rows] = await pool.execute(
    `SELECT ld.*, s.name as state_name, z.name as zone_name, vs.name as vidhan_sabha_name, v.name as village_name
     FROM lakhpati_didi_registrations ld
     LEFT JOIN states s ON ld.state_id = s.id
     LEFT JOIN zones z ON ld.zone_id = z.id
     LEFT JOIN vidhan_sabhas vs ON ld.vidhan_sabha_id = vs.id
     LEFT JOIN villages v ON ld.village_id = v.id
     ORDER BY ld.id DESC`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT ld.*, s.name as state_name, z.name as zone_name, vs.name as vidhan_sabha_name, v.name as village_name
     FROM lakhpati_didi_registrations ld
     LEFT JOIN states s ON ld.state_id = s.id
     LEFT JOIN zones z ON ld.zone_id = z.id
     LEFT JOIN vidhan_sabhas vs ON ld.vidhan_sabha_id = vs.id
     LEFT JOIN villages v ON ld.village_id = v.id
     WHERE ld.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function create(data) {
  const { name, contact, state_id, zone_id, vidhan_sabha_id, village_id } = data;
  const [result] = await pool.execute(
    `INSERT INTO lakhpati_didi_registrations (name, contact, state_id, zone_id, vidhan_sabha_id, village_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name || null, contact || null, state_id || null, zone_id || null, vidhan_sabha_id || null, village_id || null]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const { name, contact, state_id, zone_id, vidhan_sabha_id, village_id } = data;
  await pool.execute(
    `UPDATE lakhpati_didi_registrations
     SET name = ?, contact = ?, state_id = ?, zone_id = ?, vidhan_sabha_id = ?, village_id = ?
     WHERE id = ?`,
    [name || null, contact || null, state_id || null, zone_id || null, vidhan_sabha_id || null, village_id || null, id]
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM lakhpati_didi_registrations WHERE id = ?', [id]);
  if (result.affectedRows === 0) return false;
  await renumberTable(pool, dbName, 'lakhpati_didi_registrations');
  return true;
}

module.exports = { findAll, findById, create, update, remove };
