/**
 * Migration: add client_id (serial client id) to all master tables and backfill.
 * Use client_id in the app instead of DB id. Safe to run multiple times.
 *
 * Run from project root: node server/scripts/add-client-id-master-tables.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

const dbName = process.env.DB_NAME || 'gao0.2';

const MASTER_TABLES = [
  'continents', 'countries', 'country_divisions', 'states', 'state_divisions', 'state_sub_divisions',
  'regions', 'zones', 'vidhan_sabhas', 'talukas', 'circles', 'gram_panchayats', 'villages',
  'products', 'business_types', 'units', 'unit_types', 'business_categories', 'business_sub_categories',
];

async function run() {
  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: dbName,
  };

  let conn;
  try {
    conn = await mysql.createConnection(connectionConfig);
    console.log('Connected to database:', dbName);

    for (const table of MASTER_TABLES) {
      const [cols] = await conn.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = 'client_id'`,
        [dbName, table]
      );
      if (cols.length === 0) {
        console.log('Adding client_id to', table, '...');
        await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN client_id VARCHAR(36) UNIQUE NULL`);
        console.log('Added.');
      }
      const [rows] = await conn.query(`SELECT id FROM \`${table}\` WHERE client_id IS NULL`);
      if (rows.length > 0) {
        console.log('Backfilling client_id for', rows.length, 'rows in', table, '...');
        await conn.query(`UPDATE \`${table}\` SET client_id = LOWER(UUID()) WHERE client_id IS NULL`);
        console.log('Backfilled.');
      }
    }

    console.log('Migration done. Use client_id (serial client id) in the app instead of DB id.');
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

run();
