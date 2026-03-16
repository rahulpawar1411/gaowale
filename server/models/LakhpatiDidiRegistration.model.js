const { pool } = require('../config/database');
const { renumberTable } = require('../utils/renumberTable');
const bcrypt = require('bcrypt');

const dbName = process.env.DB_NAME || 'gao0.2';

async function findAll() {
  const [rows] = await pool.execute(
    `SELECT ld.*,
      c.name as country_name,
      cd.name as country_division_name,
      s.name as state_name,
      sc.name as state_circle_name,
      sd.name as state_division_name,
      r.name as region_name,
      z.name as zone_name,
      vs.name as vidhan_sabha_name,
      t.name as taluka_name,
      cir.name as circle_name,
      gp.name as gram_panchayat_name,
      v.name as village_name,
      d.name as business_position_name,
      bc.name as business_category_name,
      bt.name as business_type_name,
      p.name as product_name,
      u.name as unit_name
     FROM lakhpati_didi_registrations ld
     LEFT JOIN designations d ON ld.business_position_id = d.id
     LEFT JOIN countries c ON ld.country_id = c.id
     LEFT JOIN country_divisions cd ON ld.country_division_id = cd.id
     LEFT JOIN states s ON ld.state_id = s.id
     LEFT JOIN state_circles sc ON ld.state_circle_id = sc.id
     LEFT JOIN state_divisions sd ON ld.state_division_id = sd.id
     LEFT JOIN regions r ON ld.region_id = r.id
     LEFT JOIN zones z ON ld.zone_id = z.id
     LEFT JOIN vidhan_sabhas vs ON ld.vidhan_sabha_id = vs.id
     LEFT JOIN talukas t ON ld.taluka_id = t.id
     LEFT JOIN circles cir ON ld.circle_id = cir.id
     LEFT JOIN gram_panchayats gp ON ld.gram_panchayat_id = gp.id
     LEFT JOIN villages v ON ld.village_id = v.id
     LEFT JOIN business_categories bc ON ld.business_category_id = bc.id
     LEFT JOIN business_types bt ON ld.business_type_id = bt.id
     LEFT JOIN products p ON ld.product_id = p.id
     LEFT JOIN units u ON ld.unit_id = u.id
     ORDER BY ld.id DESC`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT ld.*,
      c.name as country_name,
      cd.name as country_division_name,
      s.name as state_name,
      sc.name as state_circle_name,
      sd.name as state_division_name,
      r.name as region_name,
      z.name as zone_name,
      vs.name as vidhan_sabha_name,
      t.name as taluka_name,
      cir.name as circle_name,
      gp.name as gram_panchayat_name,
      v.name as village_name,
      d.name as business_position_name,
      bc.name as business_category_name,
      bt.name as business_type_name,
      p.name as product_name,
      u.name as unit_name
     FROM lakhpati_didi_registrations ld
     LEFT JOIN designations d ON ld.business_position_id = d.id
     LEFT JOIN countries c ON ld.country_id = c.id
     LEFT JOIN country_divisions cd ON ld.country_division_id = cd.id
     LEFT JOIN states s ON ld.state_id = s.id
     LEFT JOIN state_circles sc ON ld.state_circle_id = sc.id
     LEFT JOIN state_divisions sd ON ld.state_division_id = sd.id
     LEFT JOIN regions r ON ld.region_id = r.id
     LEFT JOIN zones z ON ld.zone_id = z.id
     LEFT JOIN vidhan_sabhas vs ON ld.vidhan_sabha_id = vs.id
     LEFT JOIN talukas t ON ld.taluka_id = t.id
     LEFT JOIN circles cir ON ld.circle_id = cir.id
     LEFT JOIN gram_panchayats gp ON ld.gram_panchayat_id = gp.id
     LEFT JOIN villages v ON ld.village_id = v.id
     LEFT JOIN business_categories bc ON ld.business_category_id = bc.id
     LEFT JOIN business_types bt ON ld.business_type_id = bt.id
     LEFT JOIN products p ON ld.product_id = p.id
     LEFT JOIN units u ON ld.unit_id = u.id
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
      country_id, country_division_id, state_id, state_circle_id, state_division_id, state_sub_division_id, region_id, zone_id, vidhan_sabha_id, taluka_id, block_id, circle_id, gram_panchayat_id, village_id,
      business_position_id, business_category_id, business_type_id, product_id, unit_id,
      first_name, middle_name, last_name, date_of_birth, blood_group, caste, education, occupation, business,
      mobile_number, phone_number, whatsapp_number, pan_card, aadhar_card, pincode, photo_path, password_hash,
      nominee_name, nominee_relation, nominee_dob, nominee_phone, nominee_address
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      contact,
      data.country_id || null,
      data.country_division_id || null,
      data.state_id || null,
      data.state_circle_id || null,
      data.state_division_id || null,
      data.state_sub_division_id || null,
      data.region_id || null,
      data.zone_id || null,
      data.vidhan_sabha_id || null,
      data.taluka_id || null,
      data.block_id || null,
      data.circle_id || null,
      data.gram_panchayat_id || null,
      data.village_id || null,
      data.business_position_id || null,
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

async function update(id, data) {
  const name = (data.name || '').trim() || null;
  const contact = data.contact || null;
  const state_id = data.state_id || null;
  const zone_id = data.zone_id || null;
  const vidhan_sabha_id = data.vidhan_sabha_id || null;
  const village_id = data.village_id || null;

  let password_hash = undefined;
  if (data.password && String(data.password).trim()) {
    // For now, store the raw value into password_hash (same pattern as other models).
    password_hash = String(data.password).trim();
  }

  const params = [name, contact, state_id, zone_id, vidhan_sabha_id, village_id];
  const setPasswordSql = password_hash !== undefined ? ', password_hash = ?' : '';
  if (password_hash !== undefined) {
    params.push(password_hash);
  }
  params.push(id);

  await pool.execute(
    `UPDATE lakhpati_didi_registrations
     SET name = ?, contact = ?, state_id = ?, zone_id = ?, vidhan_sabha_id = ?, village_id = ?${setPasswordSql}
     WHERE id = ?`,
    params
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
