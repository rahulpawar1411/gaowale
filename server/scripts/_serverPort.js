const { env } = require('../config/env');

function getServerPort() {
  return Number(env.PORT);
}

module.exports = { getServerPort };

