const { pool } = require('../config/database');
const { renumberTable } = require('../utils/renumberTable');

const dbName = process.env.DB_NAME || 'gao0.2';

/** Re-number client_id to 1, 2, 3, 4, 5... (ordered by id). DB table id is left unchanged (incorrupt). */
async function renumberClientIds(tableName) {
  if (!ALLOWED_TABLES.includes(tableName)) return;
  try {
    const [rows] = await pool.execute(`SELECT id FROM \`${tableName}\` ORDER BY id`);
    if (rows.length === 0) return;
    await pool.execute(`UPDATE \`${tableName}\` SET client_id = CONCAT('_', id) WHERE 1=1`);
    for (let i = 0; i < rows.length; i++) {
      await pool.execute(`UPDATE \`${tableName}\` SET client_id = ? WHERE id = ?`, [String(i + 1), rows[i].id]);
    }
  } catch (err) {
    console.error('renumberClientIds error:', tableName, err.message);
  }
}

const ALLOWED_TABLES = [
  'continents',
  'countries',
  'country_divisions',
  'states',
  'state_divisions',
  'state_sub_divisions',
  'regions',
  'zones',
  'vidhan_sabhas',
  'talukas',
  'circles',
  'panchayat_samitis',
  'villages',
  'products',
  'business_types',
  'units',
  'unit_types',
  'business_categories',
  'business_sub_categories',
  'designations',
  'position_allotments',
];

// Columns allowed for create/update per table (excludes id, created_at). client_id = serial client id (not DB id).
const TABLE_COLUMNS = {
  continents: ['client_id', 'name'],
  countries: ['client_id', 'name', 'code', 'continent_id'],
  country_divisions: ['client_id', 'country_id', 'name', 'code'],
  states: ['client_id', 'country_id', 'country_division_id', 'name', 'code'],
  state_divisions: ['client_id', 'state_id', 'name', 'code'],
  state_sub_divisions: ['client_id', 'state_division_id', 'name', 'code'],
  regions: ['client_id', 'state_id', 'state_sub_division_id', 'name', 'code'],
  zones: ['client_id', 'region_id', 'state_id', 'name', 'code'],
  vidhan_sabhas: ['client_id', 'state_id', 'zone_id', 'name', 'code'],
  talukas: ['client_id', 'state_id', 'vidhan_sabha_id', 'name', 'code'],
  circles: ['client_id', 'taluka_id', 'state_id', 'name', 'code'],
  panchayat_samitis: ['client_id', 'circle_id', 'taluka_id', 'name', 'code'],
  villages: ['client_id', 'panchayat_samiti_id', 'taluka_id', 'name', 'code'],
  products: ['client_id', 'name', 'code', 'business_sub_category_id'],
  business_types: ['client_id', 'name', 'code', 'product_id'],
  units: ['client_id', 'name', 'symbol', 'village_id', 'unit_type_id', 'status'],
  unit_types: ['client_id', 'unit_id', 'name', 'code', 'type_category'],
  business_categories: ['client_id', 'name', 'code', 'vidhan_sabha_id'],
  business_sub_categories: ['client_id', 'business_category_id', 'name', 'code'],
  designations: ['client_id', 'name', 'code', 'parent_id'],
  position_allotments: ['client_id', 'name', 'code', 'designation_id'],
};

function isAllowed(table) {
  return ALLOWED_TABLES.includes(table);
}

function getAllowedColumns(tableName) {
  return TABLE_COLUMNS[tableName] || null;
}

async function findAll(tableName) {
  if (!isAllowed(tableName)) return null;
  if (tableName === 'state_sub_divisions') {
    const [rows] = await pool.execute(
      `SELECT ss.id, ss.client_id, ss.state_division_id, ss.name, ss.code, ss.created_at, sd.state_id
       FROM state_sub_divisions ss
       LEFT JOIN state_divisions sd ON ss.state_division_id = sd.id
       ORDER BY ss.id`
    );
    return rows;
  }
  const [rows] = await pool.execute(`SELECT * FROM \`${tableName}\` ORDER BY id`);
  return rows;
}

async function findById(tableName, idOrClientId) {
  if (!isAllowed(tableName)) return null;
  // Resolve only by client_id (1, 2, 3...) — do not use internal DB id in API
  const [rows] = await pool.execute(
    `SELECT * FROM \`${tableName}\` WHERE client_id = ?`,
    [String(idOrClientId).trim()]
  );
  return rows[0] || null;
}

/** Resolve id or client_id to internal row (for update/delete). */
async function resolveId(tableName, idOrClientId) {
  const row = await findById(tableName, idOrClientId);
  return row ? row.id : null;
}

async function create(tableName, data) {
  if (!isAllowed(tableName)) return null;
  const cols = getAllowedColumns(tableName);
  if (!cols || !cols.length) return null;
  const filtered = {};
  cols.forEach((c) => {
    if (c === 'client_id') return; // server assigns 1,2,3... after insert
    if (data[c] !== undefined) {
      let v = data[c];
      if (v === '') v = null;
      if (v != null && c !== 'client_id' && c.endsWith('_id') && typeof v !== 'number') {
        const n = Number(v);
        v = Number.isNaN(n) ? null : n;
      }
      filtered[c] = v;
    }
  });
  const keys = Object.keys(filtered);
  if (!keys.length) return null;
  const placeholders = keys.map(() => '?').join(', ');
  const sql = `INSERT INTO \`${tableName}\` (${keys.join(', ')}) VALUES (${placeholders})`;
  const [result] = await pool.execute(sql, keys.map((k) => filtered[k]));
  await renumberClientIds(tableName);
  const [rows] = await pool.execute(`SELECT * FROM \`${tableName}\` WHERE id = ?`, [result.insertId]);
  return rows[0] || null;
}

async function update(tableName, idOrClientId, data) {
  if (!isAllowed(tableName)) return null;
  const id = await resolveId(tableName, idOrClientId);
  if (id == null) return null;
  return updateById(tableName, id, data);
}

async function updateById(tableName, id, data) {
  if (!isAllowed(tableName)) return null;
  const cols = getAllowedColumns(tableName);
  if (!cols || !cols.length) return null;
  const filtered = {};
  cols.forEach((c) => {
    if (data[c] !== undefined) {
      let v = data[c];
      if (v === '') v = null;
      if (v != null && c !== 'client_id' && c.endsWith('_id') && typeof v !== 'number') {
        const n = Number(v);
        v = Number.isNaN(n) ? null : n;
      }
      filtered[c] = v;
    }
  });
  delete filtered.client_id;
  const keys = Object.keys(filtered);
  if (!keys.length) return findById(tableName, id);
  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const sql = `UPDATE \`${tableName}\` SET ${setClause} WHERE id = ?`;
  await pool.execute(sql, [...keys.map((k) => filtered[k]), id]);
  await renumberClientIds(tableName);
  const [rows] = await pool.execute(`SELECT * FROM \`${tableName}\` WHERE id = ?`, [id]);
  return rows[0] || null;
}

async function remove(tableName, idOrClientId) {
  if (!isAllowed(tableName)) return false;
  const id = await resolveId(tableName, idOrClientId);
  if (id == null) return false;
  const [result] = await pool.execute(`DELETE FROM \`${tableName}\` WHERE id = ?`, [id]);
  if (result.affectedRows === 0) return false;
  try {
    await renumberClientIds(tableName);
  } catch (err) {
    console.error('Renumber client_id after delete failed:', tableName, err.message);
  }
  return true;
}

module.exports = {
  ALLOWED_TABLES,
  isAllowed,
  getAllowedColumns,
  findAll,
  findById,
  create,
  update,
  remove,
};
