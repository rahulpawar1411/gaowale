const { getServerPort } = require('./_serverPort');
const { getListeningPidOnPort, killPid } = require('./_winPortPid');

const port = getServerPort();
const pid = getListeningPidOnPort(port);

if (!pid) {
  // eslint-disable-next-line no-console
  console.log(`⛔ SERVER already OFF (port ${port})`);
  process.exit(0);
}

const ok = killPid(pid);
if (ok) {
  // eslint-disable-next-line no-console
  console.log(`🛑 SERVER stopped (port ${port}, pid ${pid})`);
  process.exit(0);
}

// eslint-disable-next-line no-console
console.log(`❌ Failed to stop server (port ${port}, pid ${pid}). Try running terminal as Administrator.`);
process.exit(1);

