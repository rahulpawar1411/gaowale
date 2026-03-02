/**
 * Renumber table IDs to 1, 2, 3, ... after delete.
 * Updates foreign keys in tables that reference this table.
 * Does not throw; logs errors so delete still succeeds.
 */
async function renumberTable(pool, databaseName, tableName) {
  try {
    const db = databaseName || process.env.DB_NAME || 'gao0.2';

    const [rows] = await pool.execute(`SELECT * FROM \`${tableName}\` ORDER BY id`);
    if (rows.length === 0) {
      await pool.execute(`ALTER TABLE \`${tableName}\` AUTO_INCREMENT = 1`);
      return;
    }

    const oldIds = rows.map((r) => r.id);
    const mapping = {};
    oldIds.forEach((oldId, i) => {
      mapping[oldId] = i + 1;
    });
    const needsRenumber = oldIds.some((id, i) => id !== i + 1);
    if (!needsRenumber) {
      const nextId = rows.length + 1;
      await pool.execute(`ALTER TABLE \`${tableName}\` AUTO_INCREMENT = ${nextId}`);
      return;
    }

    const [refs] = await pool.execute(
      `SELECT TABLE_NAME AS tbl, COLUMN_NAME AS col
       FROM information_schema.KEY_COLUMN_USAGE
       WHERE REFERENCED_TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME = ?
         AND REFERENCED_COLUMN_NAME = 'id'`,
      [db, tableName]
    );

    await pool.execute('SET FOREIGN_KEY_CHECKS = 0');

    try {
      for (const { tbl, col } of refs) {
        for (const [oldId, newId] of Object.entries(mapping)) {
          if (oldId === String(newId)) continue;
          await pool.execute(
            `UPDATE \`${tbl}\` SET \`${col}\` = ? WHERE \`${col}\` = ?`,
            [newId, oldId]
          );
        }
      }

      await pool.execute(`UPDATE \`${tableName}\` SET id = -id`);
      for (const [oldId, newId] of Object.entries(mapping)) {
        await pool.execute(
          `UPDATE \`${tableName}\` SET id = ? WHERE id = ?`,
          [newId, -Number(oldId)]
        );
      }

      const nextId = rows.length + 1;
      await pool.execute(`ALTER TABLE \`${tableName}\` AUTO_INCREMENT = ${nextId}`);
    } finally {
      await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
    }
  } catch (err) {
    console.error('renumberTable error:', tableName, err.message);
  }
}

module.exports = { renumberTable };
