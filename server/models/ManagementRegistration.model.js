const { pool } = require('../config/database');
const { renumberTable } = require('../utils/renumberTable');

const dbName = process.env.DB_NAME || 'gao0.2';

const ALL_COLUMNS = [
  'name', 'contact', 'email', 'country_id', 'country_division_id', 'state_id', 'region_id',
  'incharge_user_id', 'business_position_id', 'incharge_address', 'incharge_aadhaar', 'officer_department_position_id',
  'target_to_fill_farm', 'target_completed_so_far', 'existing_terms_according_to_target',
  'state_division_id', 'zone_id', 'vidhan_sabha_id', 'taluka_id', 'block_id', 'circle_id', 'gram_panchayat_id', 'village_id',
  'business_category_id', 'business_sub_category_id', 'product_id', 'business_type_id',
  'first_name', 'middle_name', 'last_name', 'date_of_birth', 'blood_group', 'caste', 'education', 'occupation', 'business',
  'mobile_number', 'phone_number', 'whatsapp_number', 'pan_card', 'aadhar_card', 'pincode', 'photo_path', 'voter_id_path', 'password_hash',
  'nominee_name', 'nominee_relation', 'nominee_dob', 'nominee_phone', 'nominee_address',
  'management_net_worth', 'baseline_family_net_worth', 'passport_path', 'birth_certificate_path', 'bank_book_path', 'income_certificate_path',
];

const SELECT_BASE = `SELECT * FROM management_registrations`;

async function findAll() {
  try {
    const [rows] = await pool.execute(
      `SELECT mr.*,
        s.name as state_name,
        r.name as region_name,
        z.name as zone_name,
        vs.name as vidhan_sabha_name,
        t.name as taluka_name,
        b.name as block_name,
        gp.name as gram_panchayat_name,
        v.name as village_name,
        bc.name as business_category_name,
        bsc.name as business_sub_category_name,
        p.name as product_name,
        bt.name as business_type_name,
        d.name as business_position_name
       FROM management_registrations mr
       LEFT JOIN states s ON mr.state_id = s.id
       LEFT JOIN regions r ON mr.region_id = r.id
       LEFT JOIN zones z ON mr.zone_id = z.id
       LEFT JOIN vidhan_sabhas vs ON mr.vidhan_sabha_id = vs.id
       LEFT JOIN talukas t ON mr.taluka_id = t.id
       LEFT JOIN blocks b ON mr.block_id = b.id
       LEFT JOIN gram_panchayats gp ON mr.gram_panchayat_id = gp.id
       LEFT JOIN villages v ON mr.village_id = v.id
       LEFT JOIN business_categories bc ON mr.business_category_id = bc.id
       LEFT JOIN business_sub_categories bsc ON mr.business_sub_category_id = bsc.id
       LEFT JOIN products p ON mr.product_id = p.id
       LEFT JOIN business_types bt ON mr.business_type_id = bt.id
       LEFT JOIN designations d ON mr.business_position_id = d.id
       ORDER BY mr.id DESC`
    );
    return rows;
  } catch (err) {
    if (err.code === 'ER_BAD_FIELD_ERROR' || err.errno === 1054) {
      const [rows] = await pool.execute(`${SELECT_BASE} ORDER BY id DESC`);
      return rows;
    }
    throw err;
  }
}

async function findById(id) {
  try {
    const [rows] = await pool.execute(
      `SELECT mr.*,
        s.name as state_name,
        r.name as region_name,
        z.name as zone_name,
        vs.name as vidhan_sabha_name,
        t.name as taluka_name,
        b.name as block_name,
        gp.name as gram_panchayat_name,
        v.name as village_name,
        bc.name as business_category_name,
        bsc.name as business_sub_category_name,
        p.name as product_name,
        bt.name as business_type_name,
        d.name as business_position_name
       FROM management_registrations mr
       LEFT JOIN states s ON mr.state_id = s.id
       LEFT JOIN regions r ON mr.region_id = r.id
       LEFT JOIN zones z ON mr.zone_id = z.id
       LEFT JOIN vidhan_sabhas vs ON mr.vidhan_sabha_id = vs.id
       LEFT JOIN talukas t ON mr.taluka_id = t.id
       LEFT JOIN blocks b ON mr.block_id = b.id
       LEFT JOIN gram_panchayats gp ON mr.gram_panchayat_id = gp.id
       LEFT JOIN villages v ON mr.village_id = v.id
       LEFT JOIN business_categories bc ON mr.business_category_id = bc.id
       LEFT JOIN business_sub_categories bsc ON mr.business_sub_category_id = bsc.id
       LEFT JOIN products p ON mr.product_id = p.id
       LEFT JOIN business_types bt ON mr.business_type_id = bt.id
       LEFT JOIN designations d ON mr.business_position_id = d.id
       WHERE mr.id = ?`,
      [id]
    );
    return rows[0] || null;
  } catch (err) {
    if (err.code === 'ER_BAD_FIELD_ERROR' || err.errno === 1054) {
      const [rows] = await pool.execute(`${SELECT_BASE} WHERE id = ?`, [id]);
      return rows[0] || null;
    }
    throw err;
  }
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
