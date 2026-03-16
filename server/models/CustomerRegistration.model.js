const { pool } = require('../config/database');
const { renumberTable } = require('../utils/renumberTable');
const bcrypt = require('bcrypt');

const dbName = process.env.DB_NAME || 'gao0.2';

const SELECT_JOINS = `
  cr.*,
  c.name as country_name,
  cd.name as country_division_name,
  s.name as state_name,
  sc.name as state_circle_name,
  sd.name as state_division_name,
  ssd.name as state_sub_division_name,
  r.name as region_name,
  z.name as zone_name,
  vs.name as vidhan_sabha_name,
  t.name as taluka_name,
  b.name as block_name,
  cir.name as circle_name,
  gp.name as gram_panchayat_name,
  v.name as village_name,
  d.name as business_position_name,
  bc.name as business_category_name,
  bsc.name as business_sub_category_name,
  bt.name as business_type_name,
  p.name as product_name,
  u.name as unit_name
`;
const FROM_JOINS = `
  customer_registrations cr
  LEFT JOIN countries c ON cr.country_id = c.id
  LEFT JOIN country_divisions cd ON cr.country_division_id = cd.id
  LEFT JOIN states s ON cr.state_id = s.id
  LEFT JOIN state_circles sc ON cr.state_circle_id = sc.id
  LEFT JOIN state_divisions sd ON cr.state_division_id = sd.id
  LEFT JOIN state_sub_divisions ssd ON cr.state_sub_division_id = ssd.id
  LEFT JOIN regions r ON cr.region_id = r.id
  LEFT JOIN zones z ON cr.zone_id = z.id
  LEFT JOIN vidhan_sabhas vs ON cr.vidhan_sabha_id = vs.id
  LEFT JOIN talukas t ON cr.taluka_id = t.id
  LEFT JOIN blocks b ON cr.block_id = b.id
  LEFT JOIN circles cir ON cr.circle_id = cir.id
  LEFT JOIN gram_panchayats gp ON cr.gram_panchayat_id = gp.id
  LEFT JOIN villages v ON cr.village_id = v.id
  LEFT JOIN designations d ON cr.business_position_id = d.id
  LEFT JOIN business_categories bc ON cr.business_category_id = bc.id
  LEFT JOIN business_sub_categories bsc ON cr.business_sub_category_id = bsc.id
  LEFT JOIN business_types bt ON cr.business_type_id = bt.id
  LEFT JOIN products p ON cr.product_id = p.id
  LEFT JOIN units u ON cr.unit_id = u.id
`;

async function findAll() {
  const [rows] = await pool.execute(
    `SELECT ${SELECT_JOINS}
     FROM ${FROM_JOINS}
     ORDER BY cr.id DESC`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT ${SELECT_JOINS}
     FROM ${FROM_JOINS}
     WHERE cr.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function create(data) {
  const fullName = [data.first_name, data.middle_name, data.last_name].filter(Boolean).join(' ').trim();
  const name = fullName || (data.name || '').trim() || 'N/A';
  const contact = data.mobile_number || data.whatsapp_number || data.contact || null;

  let password_hash = null;
  if (data.password && String(data.password).trim()) {
    password_hash = await bcrypt.hash(String(data.password).trim(), 10);
  }

  const [result] = await pool.execute(
    `INSERT INTO customer_registrations (
      name, contact, email,
      country_id, country_division_id, state_id, state_circle_id, state_division_id, state_sub_division_id, region_id, zone_id, vidhan_sabha_id, taluka_id, block_id, circle_id, gram_panchayat_id, village_id,
      business_position_id, business_category_id, business_sub_category_id, product_id, business_type_id, unit_id,
      first_name, middle_name, last_name, date_of_birth, blood_group, caste, education, occupation, business,
      mobile_number, phone_number, whatsapp_number, pan_card, aadhar_card, pincode, photo_path, password_hash,
      nominee_name, nominee_relation, nominee_dob, nominee_phone, nominee_address
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      contact,
      data.email || null,
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
      data.business_sub_category_id || null,
      data.product_id || null,
      data.business_type_id || null,
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
  const fullName = [data.first_name, data.middle_name, data.last_name].filter(Boolean).join(' ').trim();
  const name = fullName || (data.name || '').trim() || null;
  const contact = data.mobile_number || data.whatsapp_number || data.contact || null;

  let password_hash = undefined;
  if (data.password && String(data.password).trim()) {
    password_hash = await bcrypt.hash(String(data.password).trim(), 10);
  }

  const updates = [
    name,
    contact,
    data.email ?? null,
    data.country_id ?? null,
    data.country_division_id ?? null,
    data.state_id ?? null,
    data.state_circle_id ?? null,
    data.state_division_id ?? null,
    data.state_sub_division_id ?? null,
    data.region_id ?? null,
    data.zone_id ?? null,
    data.vidhan_sabha_id ?? null,
    data.taluka_id ?? null,
    data.block_id ?? null,
    data.circle_id ?? null,
    data.gram_panchayat_id ?? null,
    data.village_id ?? null,
    data.business_position_id ?? null,
    data.business_category_id ?? null,
    data.business_sub_category_id ?? null,
    data.product_id ?? null,
    data.business_type_id ?? null,
    data.unit_id ?? null,
    data.first_name ?? null,
    data.middle_name ?? null,
    data.last_name ?? null,
    data.date_of_birth ?? null,
    data.blood_group ?? null,
    data.caste ?? null,
    data.education ?? null,
    data.occupation ?? null,
    data.business ?? null,
    data.mobile_number ?? null,
    data.phone_number ?? null,
    data.whatsapp_number ?? null,
    data.pan_card ?? null,
    data.aadhar_card ?? null,
    data.pincode ?? null,
    data.photo_path ?? null,
    (data.nominee_name || '').trim() || null,
    data.nominee_relation ?? null,
    data.nominee_dob ?? null,
    data.nominee_phone ?? null,
    data.nominee_address ?? null,
    id,
  ];

  const setPassword = password_hash !== undefined ? ', password_hash = ?' : '';
  if (password_hash !== undefined) {
    updates.splice(39, 0, password_hash); // after photo_path, before nominee_name
  }

  await pool.execute(
    `UPDATE customer_registrations SET
      name = ?, contact = ?, email = ?,
      country_id = ?, country_division_id = ?, state_id = ?, state_circle_id = ?, state_division_id = ?, state_sub_division_id = ?, region_id = ?, zone_id = ?,
      vidhan_sabha_id = ?, taluka_id = ?, block_id = ?, circle_id = ?, gram_panchayat_id = ?, village_id = ?,
      business_position_id = ?, business_category_id = ?, business_sub_category_id = ?, product_id = ?, business_type_id = ?, unit_id = ?,
      first_name = ?, middle_name = ?, last_name = ?, date_of_birth = ?, blood_group = ?, caste = ?, education = ?, occupation = ?, business = ?,
      mobile_number = ?, phone_number = ?, whatsapp_number = ?, pan_card = ?, aadhar_card = ?, pincode = ?, photo_path = ?${setPassword},
      nominee_name = ?, nominee_relation = ?, nominee_dob = ?, nominee_phone = ?, nominee_address = ?
     WHERE id = ?`,
    updates
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
