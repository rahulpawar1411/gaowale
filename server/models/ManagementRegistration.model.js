const { pool } = require('../config/database');
const { renumberTable } = require('../utils/renumberTable');

const dbName = process.env.DB_NAME || 'gao0.2';

const ALL_COLUMNS = [
  'name', 'contact', 'email', 'state_id', 'region_id',
  'incharge_user_id', 'business_position_id', 'incharge_address', 'incharge_aadhaar', 'officer_department_position_id',
  'target_to_fill_farm', 'target_completed_so_far', 'existing_terms_according_to_target',
  'state_division_id', 'zone_id', 'vidhan_sabha_id', 'taluka_id', 'circle_id', 'gram_panchayat_id', 'village_id',
  'business_category_id', 'business_sub_category_id', 'product_id', 'unit_type_id',
  'first_name', 'middle_name', 'last_name', 'date_of_birth', 'blood_group', 'caste', 'education', 'occupation', 'business',
  'mobile_number', 'phone_number', 'whatsapp_number', 'pan_card', 'aadhar_card', 'pincode', 'photo_path', 'voter_id_path', 'password_hash',
  'nominee_name', 'nominee_relation', 'nominee_dob', 'nominee_phone', 'nominee_address',
  'management_net_work', 'total_work_baseline_family', 'passport_path', 'birth_certificate_path', 'bank_book_path', 'income_certificate_path',
];

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

function pick(data) {
  const out = {};
  for (const key of ALL_COLUMNS) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const v = data[key];
      out[key] = v === '' ? null : v;
    }
  }
  return out;
}

async function create(data) {
  const row = pick(data);
  const keys = Object.keys(row);
  if (keys.length === 0) {
    const [result] = await pool.execute(
      `INSERT INTO management_registrations (name) VALUES (?)`,
      ['']
    );
    return findById(result.insertId);
  }
  const cols = keys.join(', ');
  const placeholders = keys.map(() => '?').join(', ');
  const values = keys.map((k) => row[k]);
  const [result] = await pool.execute(
    `INSERT INTO management_registrations (${cols}) VALUES (${placeholders})`,
    values
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const row = pick(data);
  const keys = Object.keys(row);
  if (keys.length === 0) return findById(id);
  const setClause = keys.map((k) => `\`${k}\` = ?`).join(', ');
  const values = [...keys.map((k) => row[k]), id];
  await pool.execute(
    `UPDATE management_registrations SET ${setClause} WHERE id = ?`,
    values
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
