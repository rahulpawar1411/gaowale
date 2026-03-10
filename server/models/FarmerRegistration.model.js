const { pool } = require('../config/database');
const { renumberTable } = require('../utils/renumberTable');

const dbName = process.env.DB_NAME || 'gao0.2';

// Simple select that works even when table has only basic columns (no JOINs on optional columns)
const SELECT_BASE = `SELECT * FROM farmer_registrations`;

async function findAll() {
  try {
    const [rows] = await pool.execute(
      `SELECT fr.*,
        s.name as state_name,
        v.name as village_name,
        t.name as taluka_name
       FROM farmer_registrations fr
       LEFT JOIN states s ON fr.state_id = s.id
       LEFT JOIN villages v ON fr.village_id = v.id
       LEFT JOIN talukas t ON fr.taluka_id = t.id
       ORDER BY fr.id DESC`
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
      `SELECT fr.*,
        s.name as state_name,
        v.name as village_name,
        t.name as taluka_name
       FROM farmer_registrations fr
       LEFT JOIN states s ON fr.state_id = s.id
       LEFT JOIN villages v ON fr.village_id = v.id
       LEFT JOIN talukas t ON fr.taluka_id = t.id
       WHERE fr.id = ?`,
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

function toNum(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isNaN(n) || n === 0 ? null : n;
}

function toStr(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

function val(v) {
  return v === undefined ? null : v;
}

async function create(data) {
  const name =
    [data.first_name, data.middle_name, data.last_name].filter(Boolean).join(' ').trim() ||
    [data.first_name, data.last_name].filter(Boolean).join(' ').trim() ||
    data.name ||
    null;
  const contact = data.mobile_number || data.whatsapp_number || data.contact || null;

  const [
    state_id,
    state_division_id,
    state_sub_division_id,
    region_id,
    zone_id,
    taluka_id,
    village_id,
    block_id,
    circle_id,
    gram_panchayat_id,
    business_category_id,
    business_sub_category_id,
    business_type_id,
    product_id,
  ] = [
    'state_id',
    'state_division_id',
    'state_sub_division_id',
    'region_id',
    'zone_id',
    'taluka_id',
    'village_id',
    'block_id',
    'circle_id',
    'gram_panchayat_id',
    'business_category_id',
    'business_sub_category_id',
    'business_type_id',
    'product_id',
  ].map((k) => toNum(data[k]));

  const fullValues = [
    name,
    contact,
    state_id,
    state_division_id,
    state_sub_division_id,
    region_id,
    zone_id,
    taluka_id,
    village_id,
    block_id,
    circle_id,
    gram_panchayat_id,
    business_category_id,
    business_sub_category_id,
    business_type_id,
    product_id,
    val(toStr(data.first_name)),
    val(toStr(data.father_name)),
    val(toStr(data.last_name)),
    val(toStr(data.date_of_birth)) || null,
    val(toStr(data.blood_group)),
    val(toStr(data.gender)),
    val(toStr(data.caste)),
    val(toStr(data.photo_path)),
    val(toStr(data.education)),
    val(toStr(data.ration_card_path)),
    val(toStr(data.election_card_path)),
    val(toStr(data.address)),
    val(toStr(data.mobile_number)),
    val(toStr(data.whatsapp_number)),
    val(toStr(data.pan_card_path)),
    val(toStr(data.bank_account_number)),
    val(toStr(data.aadhar_card_path)),
    val(toStr(data.registration_date)) || null,
    val(toStr(data.registration_type)),
    val(toStr(data.farm_area)),
    val(toStr(data.email)),
    val(toStr(data.bank_name)),
    val(toStr(data.ifsc_code)),
    val(toStr(data.pincode)),
    val(toStr(data.password) || toStr(data.password_hash)),
    val(toStr(data.ward)),
    val(toStr(data.police_station)),
    val(toStr(data.middle_name)),
    val(toStr(data.family_member_name)),
    val(toStr(data.family_relation)),
    val(toStr(data.family_dob)) || null,
    val(toStr(data.family_phone)),
    val(toStr(data.family_aadhar_path)),
    val(toStr(data.transactions_below_15_lakh)),
    val(toStr(data.e_bank_account)),
    val(toStr(data.additional_production)),
  ];

  try {
    const [result] = await pool.execute(
      `INSERT INTO farmer_registrations (
        name, contact,
        state_id, state_division_id, state_sub_division_id, region_id, zone_id,
        taluka_id, village_id, block_id, circle_id, gram_panchayat_id,
        business_category_id, business_sub_category_id, business_type_id, product_id,
        first_name, father_name, last_name, date_of_birth, blood_group, gender, caste,
        photo_path, education, ration_card_path, election_card_path, address, mobile_number, whatsapp_number,
        pan_card_path, bank_account_number, aadhar_card_path, registration_date, registration_type, farm_area,
        email, bank_name, ifsc_code, pincode, password_hash, ward, police_station, middle_name,
        family_member_name, family_relation, family_dob, family_phone, family_aadhar_path,
        transactions_below_15_lakh, e_bank_account, additional_production
      ) VALUES (
        ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?
      )`,
      fullValues
    );
    return findById(result.insertId);
  } catch (err) {
    if (err.code === 'ER_BAD_FIELD_ERROR' || err.errno === 1054) {
      const [result] = await pool.execute(
        `INSERT INTO farmer_registrations (name, contact, state_id, village_id, taluka_id)
         VALUES (?, ?, ?, ?, ?)`,
        [name, contact, state_id, village_id, taluka_id]
      );
      return findById(result.insertId);
    }
    throw err;
  }
}

async function update(id, data) {
  const name =
    [data.first_name, data.middle_name, data.last_name].filter(Boolean).join(' ').trim() ||
    [data.first_name, data.last_name].filter(Boolean).join(' ').trim() ||
    data.name ||
    null;
  const contact = data.mobile_number || data.whatsapp_number || data.contact || null;

  const [
    state_id,
    state_division_id,
    state_sub_division_id,
    region_id,
    zone_id,
    taluka_id,
    village_id,
    block_id,
    circle_id,
    gram_panchayat_id,
    business_category_id,
    business_sub_category_id,
    business_type_id,
    product_id,
  ] = [
    'state_id',
    'state_division_id',
    'state_sub_division_id',
    'region_id',
    'zone_id',
    'taluka_id',
    'village_id',
    'block_id',
    'circle_id',
    'gram_panchayat_id',
    'business_category_id',
    'business_sub_category_id',
    'business_type_id',
    'product_id',
  ].map((k) => toNum(data[k]));

  try {
    await pool.execute(
      `UPDATE farmer_registrations SET
        name = ?, contact = ?,
        state_id = ?, state_division_id = ?, state_sub_division_id = ?, region_id = ?, zone_id = ?,
        taluka_id = ?, village_id = ?, block_id = ?, circle_id = ?, gram_panchayat_id = ?,
        business_category_id = ?, business_sub_category_id = ?, business_type_id = ?, product_id = ?,
        first_name = ?, father_name = ?, last_name = ?, date_of_birth = ?, blood_group = ?, gender = ?, caste = ?,
        photo_path = ?, education = ?, ration_card_path = ?, election_card_path = ?, address = ?, mobile_number = ?, whatsapp_number = ?,
        pan_card_path = ?, bank_account_number = ?, aadhar_card_path = ?, registration_date = ?, registration_type = ?, farm_area = ?,
        email = ?, bank_name = ?, ifsc_code = ?, pincode = ?,
        password_hash = COALESCE(?, password_hash),
        ward = ?, police_station = ?, middle_name = ?,
        family_member_name = ?, family_relation = ?, family_dob = ?, family_phone = ?, family_aadhar_path = ?,
        transactions_below_15_lakh = ?, e_bank_account = ?, additional_production = ?
      WHERE id = ?`,
      [
        name,
        contact,
        state_id,
        state_division_id,
        state_sub_division_id,
        region_id,
        zone_id,
        taluka_id,
        village_id,
        block_id,
        circle_id,
        gram_panchayat_id,
        business_category_id,
        business_sub_category_id,
        business_type_id,
        product_id,
        toStr(data.first_name),
        toStr(data.father_name),
        toStr(data.last_name),
        toStr(data.date_of_birth) || null,
        toStr(data.blood_group),
        toStr(data.gender),
        toStr(data.caste),
        toStr(data.photo_path),
        toStr(data.education),
        toStr(data.ration_card_path),
        toStr(data.election_card_path),
        toStr(data.address),
        toStr(data.mobile_number),
        toStr(data.whatsapp_number),
        toStr(data.pan_card_path),
        toStr(data.bank_account_number),
        toStr(data.aadhar_card_path),
        toStr(data.registration_date) || null,
        toStr(data.registration_type),
        toStr(data.farm_area),
        toStr(data.email),
        toStr(data.bank_name),
        toStr(data.ifsc_code),
        toStr(data.pincode),
        toStr(data.password) || toStr(data.password_hash),
        toStr(data.ward),
        toStr(data.police_station),
        toStr(data.middle_name),
        toStr(data.family_member_name),
        toStr(data.family_relation),
        toStr(data.family_dob) || null,
        toStr(data.family_phone),
        toStr(data.family_aadhar_path),
        toStr(data.transactions_below_15_lakh),
        toStr(data.e_bank_account),
        toStr(data.additional_production),
        id,
      ]
    );
  } catch (err) {
    if (err.code === 'ER_BAD_FIELD_ERROR' || err.errno === 1054) {
      await pool.execute(
        `UPDATE farmer_registrations SET name = ?, contact = ?, state_id = ?, village_id = ?, taluka_id = ? WHERE id = ?`,
        [name, contact, state_id, village_id, taluka_id, id]
      );
    } else {
      throw err;
    }
  }
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM farmer_registrations WHERE id = ?', [id]);
  if (result.affectedRows === 0) return false;
  await renumberTable(pool, dbName, 'farmer_registrations');
  return true;
}

async function removeAll() {
  const [result] = await pool.execute('DELETE FROM farmer_registrations');
  return result.affectedRows;
}

module.exports = { findAll, findById, create, update, remove, removeAll };
