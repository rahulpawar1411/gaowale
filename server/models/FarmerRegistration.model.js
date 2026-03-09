const { pool } = require('../config/database');
const { renumberTable } = require('../utils/renumberTable');

const dbName = process.env.DB_NAME || 'gao0.2';

const SELECT_JOINS = `
  SELECT fr.*,
    s.name as state_name,
    sd.name as state_division_name,
    ssd.name as state_sub_division_name,
    r.name as region_name,
    z.name as zone_name,
    t.name as taluka_name,
    v.name as village_name,
    b.name as block_name,
    c.name as circle_name,
    gp.name as gram_panchayat_name,
    bc.name as business_category_name,
    bsc.name as business_sub_category_name,
    bt.name as business_type_name,
    p.name as product_name
  FROM farmer_registrations fr
  LEFT JOIN states s ON fr.state_id = s.id
  LEFT JOIN state_divisions sd ON fr.state_division_id = sd.id
  LEFT JOIN state_sub_divisions ssd ON fr.state_sub_division_id = ssd.id
  LEFT JOIN regions r ON fr.region_id = r.id
  LEFT JOIN zones z ON fr.zone_id = z.id
  LEFT JOIN talukas t ON fr.taluka_id = t.id
  LEFT JOIN villages v ON fr.village_id = v.id
  LEFT JOIN blocks b ON fr.block_id = b.id
  LEFT JOIN circles c ON fr.circle_id = c.id
  LEFT JOIN gram_panchayats gp ON fr.gram_panchayat_id = gp.id
  LEFT JOIN business_categories bc ON fr.business_category_id = bc.id
  LEFT JOIN business_sub_categories bsc ON fr.business_sub_category_id = bsc.id
  LEFT JOIN business_types bt ON fr.business_type_id = bt.id
  LEFT JOIN products p ON fr.product_id = p.id
`;

async function findAll() {
  const [rows] = await pool.execute(
    `${SELECT_JOINS} ORDER BY fr.id DESC`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `${SELECT_JOINS} WHERE fr.id = ?`,
    [id]
  );
  return rows[0] || null;
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

async function create(data) {
  const name =
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

  const [result] = await pool.execute(
    `INSERT INTO farmer_registrations (
      name, contact,
      state_id, state_division_id, state_sub_division_id, region_id, zone_id,
      taluka_id, village_id, block_id, circle_id, gram_panchayat_id,
      business_category_id, business_sub_category_id, business_type_id, product_id,
      first_name, father_name, last_name, date_of_birth, blood_group, caste,
      photo_path, education, ration_card_path, address, mobile_number, whatsapp_number,
      pan_card_path, bank_account_number, aadhar_card_path, registration_type, farm_area,
      email, bank_name, pincode, password_hash,
      family_member_name, family_relation, family_dob, family_phone, family_aadhar_path,
      transactions_below_15_lakh, e_bank_account, additional_production
    ) VALUES (
      ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?
    )`,
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
      toStr(data.caste),
      toStr(data.photo_path),
      toStr(data.education),
      toStr(data.ration_card_path),
      toStr(data.address),
      toStr(data.mobile_number),
      toStr(data.whatsapp_number),
      toStr(data.pan_card_path),
      toStr(data.bank_account_number),
      toStr(data.aadhar_card_path),
      toStr(data.registration_type),
      toStr(data.farm_area),
      toStr(data.email),
      toStr(data.bank_name),
      toStr(data.pincode),
      toStr(data.password) || toStr(data.password_hash),
      toStr(data.family_member_name),
      toStr(data.family_relation),
      toStr(data.family_dob) || null,
      toStr(data.family_phone),
      toStr(data.family_aadhar_path),
      toStr(data.transactions_below_15_lakh),
      toStr(data.e_bank_account),
      toStr(data.additional_production),
    ]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const name =
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

  await pool.execute(
    `UPDATE farmer_registrations SET
      name = ?, contact = ?,
      state_id = ?, state_division_id = ?, state_sub_division_id = ?, region_id = ?, zone_id = ?,
      taluka_id = ?, village_id = ?, block_id = ?, circle_id = ?, gram_panchayat_id = ?,
      business_category_id = ?, business_sub_category_id = ?, business_type_id = ?, product_id = ?,
      first_name = ?, father_name = ?, last_name = ?, date_of_birth = ?, blood_group = ?, caste = ?,
      photo_path = ?, education = ?, ration_card_path = ?, address = ?, mobile_number = ?, whatsapp_number = ?,
      pan_card_path = ?, bank_account_number = ?, aadhar_card_path = ?, registration_type = ?, farm_area = ?,
      email = ?, bank_name = ?, pincode = ?,
      password_hash = COALESCE(?, password_hash),
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
      toStr(data.caste),
      toStr(data.photo_path),
      toStr(data.education),
      toStr(data.ration_card_path),
      toStr(data.address),
      toStr(data.mobile_number),
      toStr(data.whatsapp_number),
      toStr(data.pan_card_path),
      toStr(data.bank_account_number),
      toStr(data.aadhar_card_path),
      toStr(data.registration_type),
      toStr(data.farm_area),
      toStr(data.email),
      toStr(data.bank_name),
      toStr(data.pincode),
      toStr(data.password) || toStr(data.password_hash),
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
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM farmer_registrations WHERE id = ?', [id]);
  if (result.affectedRows === 0) return false;
  await renumberTable(pool, dbName, 'farmer_registrations');
  return true;
}

module.exports = { findAll, findById, create, update, remove };
