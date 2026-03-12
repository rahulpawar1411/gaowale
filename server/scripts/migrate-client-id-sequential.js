/**
 * One-time migration: set client_id to sequential 1, 2, 3, 4, 5... for all master tables.
 * Run once after switching to custom client id. DB table id is not changed (incorrupt).
 *
 * Run from project root: node server/scripts/migrate-client-id-sequential.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

const dbName = process.env.DB_NAME || 'gao0.2';

const MASTER_TABLES = [
  'continents', 'countries', 'country_divisions', 'states', 'state_divisions', 'state_sub_divisions',
  'regions', 'zones', 'vidhan_sabhas', 'talukas', 'circles', 'gram_panchayats', 'villages',
  'products', 'business_types', 'units', 'types_of_units', 'business_categories', 'business_sub_categories',
];

async function renumberClientIds(conn, tableName) {
  const [rows] = await conn.execute(`SELECT id FROM \`${tableName}\` ORDER BY id`);
  if (rows.length === 0) return;
  await conn.execute(`UPDATE \`${tableName}\` SET client_id = CONCAT('_', id) WHERE 1=1`);
  for (let i = 0; i < rows.length; i++) {
    await conn.execute(`UPDATE \`${tableName}\` SET client_id = ? WHERE id = ?`, [String(i + 1), rows[i].id]);
  }
}

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: dbName,
  });
  try {
    console.log('Connected to', dbName);
    for (const t of MASTER_TABLES) {
      console.log('Renumbering client_id for', t, '...');
      await renumberClientIds(conn, t);
    }
    console.log('Done. client_id is now 1, 2, 3, 4, 5... for all master tables.');
  } finally {
    await conn.end();
  }
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
