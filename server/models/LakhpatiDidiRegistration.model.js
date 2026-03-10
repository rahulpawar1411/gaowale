const { pool } = require('../config/database');
const { renumberTable } = require('../utils/renumberTable');
const bcrypt = require('bcrypt');

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
  const fullName = [data.first_name, data.middle_name, data.last_name].filter(Boolean).join(' ').trim();
  const name = fullName || (data.name || '').trim() || 'N/A';
  const contact = data.mobile_number || data.contact || null;

  let password_hash = null;
  if (data.password && String(data.password).trim()) {
    password_hash = await bcrypt.hash(String(data.password).trim(), 10);
  }

  const [result] = await pool.execute(
    `INSERT INTO lakhpati_didi_registrations (
      name, contact,
      state_id, state_division_id, region_id, zone_id, vidhan_sabha_id, taluka_id, circle_id, gram_panchayat_id, village_id,
      business_category_id, business_type_id, product_id, unit_id,
      first_name, middle_name, last_name, date_of_birth, blood_group, caste, education, occupation, business,
      mobile_number, phone_number, whatsapp_number, pan_card, aadhar_card, pincode, photo_path, password_hash,
      nominee_name, nominee_relation, nominee_dob, nominee_phone, nominee_address
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      contact,
      data.state_id || null,
      data.state_division_id || null,
      data.region_id || null,
      data.zone_id || null,
      data.vidhan_sabha_id || null,
      data.taluka_id || null,
      data.circle_id || null,
      data.gram_panchayat_id || null,
      data.village_id || null,
      data.business_category_id || null,
      data.business_type_id || null,
      data.product_id || null,
      data.unit_id || null,
      data.first_name || null,
      data.middle_name || null,
      data.last_name || null,
      data.date_of_birth || null,
      data.blood_group || null,
      data.caste || null,
      data.education || null,
      data.occupation || null,
      data.business || null,
      data.mobile_number || null,
      data.phone_number || null,
      data.whatsapp_number || null,
      data.pan_card || null,
      data.aadhar_card || null,
      data.pincode || null,
      data.photo_path || null,
      password_hash,
      (data.nominee_name || '').trim() || null,
      data.nominee_relation || null,
      data.nominee_dob || null,
      data.nominee_phone || null,
      data.nominee_address || null,
    ]
  );
  return findById(result.insertId);
}

// Note: update() currently only updates the main registration row (list view).
// If you later add an edit form for Lakhpati Didi, we can extend this to
// update locations/users/nominees as well.
async function update(id, data) {
  const name = (data.name || '').trim() || null;
  const contact = data.contact || null;
  const state_id = data.state_id || null;
  const zone_id = data.zone_id || null;
  const vidhan_sabha_id = data.vidhan_sabha_id || null;
  const village_id = data.village_id || null;

  await pool.execute(
    `UPDATE lakhpati_didi_registrations
     SET name = ?, contact = ?, state_id = ?, zone_id = ?, vidhan_sabha_id = ?, village_id = ?
     WHERE id = ?`,
    [name, contact, state_id, zone_id, vidhan_sabha_id, village_id, id]
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
