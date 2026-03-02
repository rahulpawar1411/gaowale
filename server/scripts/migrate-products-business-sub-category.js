/**
 * One-time migration: add business_sub_category_id column and FK to products table
 * if missing. Safe to run multiple times.
 *
 * Run from project root: node server/scripts/migrate-products-business-sub-category.js
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

    const [cols] = await conn.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'business_sub_category_id'`,
      [dbName]
    );

    if (cols.length === 0) {
      console.log('Adding column products.business_sub_category_id...');
      await conn.query(`ALTER TABLE products ADD COLUMN business_sub_category_id INT NULL`);
      console.log('Column added.');
    } else {
      console.log('Column products.business_sub_category_id already exists.');
    }

    const [fks] = await conn.query(
      `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND CONSTRAINT_NAME = 'fk_products_business_sub_category'`,
      [dbName]
    );

    if (fks.length === 0) {
      console.log('Adding foreign key fk_products_business_sub_category...');
      await conn.query(
        `ALTER TABLE products ADD CONSTRAINT fk_products_business_sub_category FOREIGN KEY (business_sub_category_id) REFERENCES business_sub_categories(id) ON DELETE SET NULL`
      );
      console.log('Foreign key added.');
    } else {
      console.log('Foreign key fk_products_business_sub_category already exists.');
    }

    console.log('Migration done.');
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

run();
