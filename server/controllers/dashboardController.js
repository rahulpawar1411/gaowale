const { pool } = require('../config/database');

async function getStats(req, res, next) {
  try {
    const [
      [managementRows],
      [farmerRows],
      [customerRows],
      [lakhpatiRows],
    ] = await Promise.all([
      pool.execute('SELECT COUNT(*) as count FROM management_registrations'),
      pool.execute('SELECT COUNT(*) as count FROM farmer_registrations'),
      pool.execute('SELECT COUNT(*) as count FROM customer_registrations'),
      pool.execute('SELECT COUNT(*) as count FROM lakhpati_didi_registrations'),
    ]);

    const members = Number(managementRows?.[0]?.count ?? 0);
    const farmers = Number(farmerRows?.[0]?.count ?? 0);
    const customers = Number(customerRows?.[0]?.count ?? 0);
    const lakhpatiDidi = Number(lakhpatiRows?.[0]?.count ?? 0);
    const totalUsers = members + farmers + customers + lakhpatiDidi;

    res.json({
      success: true,
      data: {
        totalUsers,
        members,
        farmers,
        customers,
        lakhpatiDidi,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats };
