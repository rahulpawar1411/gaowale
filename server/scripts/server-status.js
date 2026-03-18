const { getServerPort } = require('./_serverPort');
const { getListeningPidOnPort } = require('./_winPortPid');

const port = getServerPort();
const pid = getListeningPidOnPort(port);

if (pid) {
  // eslint-disable-next-line no-console
  console.log(`✅ SERVER is ON  (port ${port}, pid ${pid})`);
  process.exit(0);
}

// eslint-disable-next-line no-console
console.log(`⛔ SERVER is OFF (port ${port})`);
process.exit(1);

