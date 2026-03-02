/**
 * Migration: remove old business_type_id foreign key and column from products table.
 * Products now use only business_sub_category_id (Business Sub Category - name).
 * Safe to run multiple times.
 *
 * Run from project root: node server/scripts/remove-products-business-type-id.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

const dbName = process.env.DB_NAME || 'gao0.2';

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

    const [fks] = await conn.query(
      `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND CONSTRAINT_NAME = 'fk_products_business_type'`,
      [dbName]
    );

    if (fks.length > 0) {
      console.log('Dropping foreign key fk_products_business_type...');
      await conn.query(`ALTER TABLE products DROP FOREIGN KEY fk_products_business_type`);
      console.log('Foreign key dropped.');
    } else {
      console.log('Foreign key fk_products_business_type does not exist.');
    }

    const [cols] = await conn.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'business_type_id'`,
      [dbName]
    );

    if (cols.length > 0) {
      console.log('Dropping column products.business_type_id...');
      await conn.query(`ALTER TABLE products DROP COLUMN business_type_id`);
      console.log('Column dropped.');
    } else {
      console.log('Column products.business_type_id does not exist.');
    }

    console.log('Migration done. Products now use only Business Sub Category.');
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

run();
