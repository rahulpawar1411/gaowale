const { pool } = require('../config/database');

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await pool.execute(query);
};

const findAll = async () => {
  const [rows] = await pool.execute('SELECT * FROM items ORDER BY created_at DESC');
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM items WHERE id = ?', [id]);
  return rows[0] || null;
};

const create = async (data) => {
  const { name, description } = data;
  const [result] = await pool.execute(
    'INSERT INTO items (name, description) VALUES (?, ?)',
    [name, description || '']
  );
  return { id: result.insertId, name, description: description || '' };
};

const update = async (id, data) => {
  const { name, description } = data;
  await pool.execute(
    'UPDATE items SET name = ?, description = ? WHERE id = ?',
    [name, description ?? '', id]
  );
  return findById(id);
};

const remove = async (id) => {
  const [result] = await pool.execute('DELETE FROM items WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

module.exports = {
  createTable,
  findAll,
  findById,
  create,
  update,
  remove,
};
