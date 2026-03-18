const { spawn } = require('child_process');
const path = require('path');
const { getServerPort } = require('./_serverPort');
const { getListeningPidOnPort, killPid } = require('./_winPortPid');

const port = getServerPort();

if (process.platform !== 'win32') {
  // eslint-disable-next-line no-console
  console.log('❌ This ON/OFF helper is currently implemented for Windows only.');
  process.exit(1);
}

const existingPid = getListeningPidOnPort(port);
if (existingPid) {
  // eslint-disable-next-line no-console
  console.log(`✅ SERVER already ON (port ${port}, pid ${existingPid})`);
  process.exit(0);
}

// Start server in a separate Node process (detached) so terminal returns.
const serverEntry = path.join(__dirname, '..', 'server.js');
const child = spawn(process.execPath, [serverEntry], {
  cwd: path.join(__dirname, '..'),
  detached: true,
  stdio: 'ignore',
});
child.unref();

// DB init/migrations can take time; poll for port listening.
const startedAt = Date.now();
const timeoutMs = 25000;
const intervalMs = 750;

function poll() {
  const pid = getListeningPidOnPort(port);
  if (pid) {
    // eslint-disable-next-line no-console
    console.log(`✅ SERVER started (port ${port}, pid ${pid})`);
    process.exit(0);
  }
  if (Date.now() - startedAt > timeoutMs) {
    // If it failed to bind, try to clean up by killing the spawned process
    try {
      killPid(child.pid);
    } catch {
      // ignore
    }
    // eslint-disable-next-line no-console
    console.log(`❌ SERVER failed to start on port ${port}. Check server logs or run: npm start`);
    process.exit(1);
  }
  setTimeout(poll, intervalMs);
}

setTimeout(poll, intervalMs);

